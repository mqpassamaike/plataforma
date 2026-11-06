
import { supabase, paginaProtegida } from './getdumb.js';

const QUANTIDADE_QUESTOES_LOTE = 2;

const nomesMaterias = {
    portugues: 'Língua Portuguesa e Interpretação de Texto',
    matematica: 'Matemática',
    gerais: 'Conhecimentos Gerais',
    informatica: 'Noções Básicas de Informática',
    administracao: 'Noções de Administração Pública'
};

const teoriasTemas = {
    Crase: 'A crase é a fusão da preposição "a" com o artigo definido feminino "a"...',
    Porcentagem: 'A porcentagem representa uma razão com base 100...',
    Geografia: 'Estudo do espaço geográfico e organização territorial...',
    História: 'Estudo dos fatos e processos históricos que moldaram a sociedade...',
    Atalhos: 'Combinações de teclas para otimizar operações no sistema...',
    Hardware: 'Componentes físicos e arquitetura de computadores...',
    Internet: 'Protocolos, redes de computadores e segurança da informação...',
    'Direito Constitucional': 'Estudo das normas fundamentais e princípios da organização do Estado...',
    Ética: 'Padrões de conduta e moralidade aplicados à administração pública...',
    'Organização Administrativa': 'Estrutura, poderes e divisão funcional da administração.'
};

let loteAtual = null;
let questoesAtuais = [];
let enviandoRespostas = false;

const containerTemas = document.getElementById('themeListContainer');
const containerQuestoes = document.getElementById('questionContainer');
const tituloMateria = document.getElementById('materiaTitulo');

function criarElemento(tag, texto = null, classe = '') {
    const elemento = document.createElement(tag);

    if (texto !== null) {
        elemento.textContent = texto;
    }

    if (classe) {
        elemento.className = classe;
    }

    return elemento;
}

function mostrarMensagemQuestao(mensagem) {
    if (!containerQuestoes) return;

    containerQuestoes.replaceChildren(
        criarElemento('p', mensagem)
    );
}

function atualizarTeoria(tema) {
    const theoryContainer = document.getElementById('theoryContainer');

    if (!theoryContainer) return;

    theoryContainer.replaceChildren();

    const titulo = criarElemento('h3', `Teoria Resumida: ${tema}`);

    const texto = criarElemento(
        'p',
        teoriasTemas[tema] || 'Teoria em breve para este tópico.'
    );

    theoryContainer.append(titulo, texto);
}

async function carregarTemas(materia) {
    const { data, error } = await supabase.rpc('listar_temas_por_materia', {
        p_materia: materia
    });

    if (error) {
        console.error('Erro ao carregar temas:', error);

        mostrarMensagemQuestao(
            'Não foi possível carregar os temas. Atualize a página ou entre novamente.'
        );

        return;
    }

    const temas = Array.isArray(data) ? data : [];

    containerTemas.replaceChildren();

    if (temas.length === 0) {
        containerTemas.appendChild(
            criarElemento('li', 'Nenhum tema encontrado.', 'theme-item')
        );

        return;
    }

    temas.forEach((tema, index) => {
        const li = criarElemento('li', null, 'theme-item');

        const botaoTema = criarElemento('button', tema);

        botaoTema.type = 'button';
        botaoTema.dataset.tema = tema;

        if (index === 0) {
            botaoTema.classList.add('active');
        }

        const difficultyBox = criarElemento('div', null, 'difficulty-box');

        difficultyBox.style.display = index === 0 ? 'block' : 'none';
        difficultyBox.style.paddingLeft = '15px';
        difficultyBox.style.marginTop = '8px';

        const difficultyRow = criarElemento('div');

        difficultyRow.style.display = 'flex';
        difficultyRow.style.gap = '5px';

        for (const [valor, rotulo] of [
            ['facil', 'Fácil'],
            ['medio', 'Médio'],
            ['dificil', 'Difícil']
        ]) {
            const botao = criarElemento('button', rotulo, 'btn-diff');

            botao.type = 'button';
            botao.dataset.materia = materia;
            botao.dataset.tema = tema;
            botao.dataset.diff = valor;

            botao.style.fontSize = '0.75rem';
            botao.style.padding = '4px 8px';

            botao.addEventListener('click', () => {
                iniciarLote(materia, tema, valor);
            });

            difficultyRow.appendChild(botao);
        }

        difficultyBox.appendChild(difficultyRow);

        li.append(botaoTema, difficultyBox);
        containerTemas.appendChild(li);

        botaoTema.addEventListener('click', () => {
            containerTemas.querySelectorAll('.theme-item > button')
                .forEach(button => button.classList.remove('active'));

            containerTemas.querySelectorAll('.difficulty-box')
                .forEach(box => box.style.display = 'none');

            botaoTema.classList.add('active');

            difficultyBox.style.display = 'block';

            atualizarTeoria(tema);
        });

        if (index === 0) {
            atualizarTeoria(tema);
        }
    });
}

async function iniciarLote(materia, tema, dificuldade) {
    if (enviandoRespostas) return;

    mostrarMensagemQuestao('Carregando questões...');

    const { data, error } = await supabase.rpc('obter_ou_criar_lote_diario', {
        p_materia: materia,
        p_tema: tema,
        p_dificuldade: dificuldade
    });

    if (error) {
        console.error('Erro ao obter lote:', error);

        mostrarMensagemQuestao(
            error.message || 'Não foi possível carregar o lote.'
        );

        return;
    }

    loteAtual = data?.lote_id ?? null;

    questoesAtuais = Array.isArray(data?.questoes)
        ? data.questoes
        : [];

    if (!loteAtual || questoesAtuais.length === 0) {
        mostrarMensagemQuestao(
            'Não existem questões disponíveis para essa seleção.'
        );

        return;
    }

    if (data.status !== 'em_andamento') {
        mostrarMensagemQuestao(
            'Este lote já foi concluído. Escolha outro tema ou dificuldade.'
        );

        return;
    }

    renderizarQuestoes(questoesAtuais);
}

function renderizarQuestoes(questoes) {
    containerQuestoes.replaceChildren();

    questoes.forEach((questao, index) => {
        const bloco = criarElemento('div', null, 'bloco-questao');

        bloco.style.marginBottom = '30px';
        bloco.style.paddingBottom = '20px';
        bloco.style.borderBottom = '1px solid var(--border-color)';

        const header = criarElemento(
            'div',
            `Questão ${index + 1} • Dificuldade: ${questao.dificuldade || 'Não informada'}`,
            'question-header'
        );

        header.style.fontWeight = 'bold';
        header.style.marginBottom = '10px';

        const enunciado = criarElemento(
            'div',
            questao.enunciado || '',
            'question-statement'
        );

        enunciado.style.marginBottom = '15px';

        const opcoes = criarElemento('div', null, 'options-list');

        opcoes.style.marginBottom = '15px';

        const alternativas = questao.alternativas || {};

        for (const [letra, texto] of Object.entries(alternativas)) {
            const label = criarElemento('label', null, 'option-item');

            label.style.display = 'block';
            label.style.marginBottom = '6px';
            label.style.cursor = 'pointer';

            const input = document.createElement('input');

            input.type = 'radio';
            input.name = `qst_${questao.id}`;
            input.value = letra.toUpperCase();

            const span = criarElemento(
                'span',
                `${letra.toUpperCase()}) ${texto}`,
                'option-text'
            );

            label.append(input, span);

            opcoes.appendChild(label);
        }

        // A aparência da explicação agora é controlada pelo CSS dos temas.
        const explicacao = criarElemento(
            'div',
            null,
            'explanation-box'
        );

        explicacao.id = `explanationBox_${questao.id}`;

        explicacao.style.display = 'none';

        bloco.append(header, enunciado, opcoes, explicacao);

        containerQuestoes.appendChild(bloco);
    });

    const areaBotao = criarElemento('div');

    areaBotao.style.margin = '20px auto';

    const botaoEnviar = criarElemento(
        'button',
        'Corrigir e enviar respostas',
        'btn-action'
    );

    botaoEnviar.type = 'button';
    botaoEnviar.id = 'btnResponderLote';

    botaoEnviar.addEventListener('click', enviarRespostas);

    areaBotao.appendChild(botaoEnviar);

    const placar = criarElemento('div');

    placar.id = 'placarLoteContainer';

    containerQuestoes.append(areaBotao, placar);
}

async function enviarRespostas() {
    if (enviandoRespostas || !loteAtual) return;

    const respostas = {};

    for (const questao of questoesAtuais) {
        const selecionada = document.querySelector(
            `input[name="qst_${questao.id}"]:checked`
        );

        if (selecionada) {
            respostas[String(questao.id)] = selecionada.value;
        }
    }

    const totalRespondidas = Object.keys(respostas).length;
    const totalQuestoes = questoesAtuais.length;

    if (totalRespondidas !== totalQuestoes) {
        const faltantes = totalQuestoes - totalRespondidas;

        alert(
            `Responda todas as questões antes de enviar! Faltam ${faltantes}.`
        );

        return;
    }

    enviandoRespostas = true;

    const botao = document.getElementById('btnResponderLote');

    if (botao) {
        botao.disabled = true;
        botao.textContent = 'Corrigindo respostas...';
    }

    const { data, error } = await supabase.rpc('corrigir_e_enviar_lote', {
        p_lote_id: loteAtual,
        p_respostas: respostas
    });

    if (error) {
        console.error('Erro ao corrigir lote:', error);

        alert(
            error.message || 'Não foi possível corrigir as respostas.'
        );

        enviandoRespostas = false;

        if (botao) {
            botao.disabled = false;
            botao.textContent = 'Corrigir e enviar respostas';
        }

        return;
    }

    // O gabarito e os comentários só chegam ao navegador depois da correção no servidor.
    const resultados = Array.isArray(data?.resultados)
        ? data.resultados
        : [];

    for (const resultado of resultados) {
        const caixa = document.getElementById(
            `explanationBox_${resultado.questao_id}`
        );

        if (!caixa) continue;

        caixa.replaceChildren();

        const titulo = criarElemento(
            'h4',
            resultado.acertou
                ? `Correto! Resposta: ${resultado.resposta_correta}`
                : `Incorreto. A resposta correta era: ${resultado.resposta_correta}`
        );

        const comentario = criarElemento(
            'p',
            resultado.comentario || 'Sem comentários.'
        );

        comentario.style.margin = '0';

        // Classes CSS adaptam as cores conforme o tema selecionado.
        caixa.classList.toggle('correct', resultado.acertou);
        caixa.classList.toggle('incorrect', !resultado.acertou);

        caixa.append(titulo, comentario);

        caixa.style.display = 'block';
    }

    document.querySelectorAll('#questionContainer input[type="radio"]')
        .forEach(input => {
            input.disabled = true;
        });

    if (botao) {
        botao.textContent = 'Respostas enviadas';

        // A aparência do botão desabilitado fica sob controle do CSS.
        botao.disabled = true;
    }

    const placar = document.getElementById('placarLoteContainer');

    if (placar) {
        const total = Number(data?.total_respondidas || 0);
        const acertos = Number(data?.acertos || 0);

        const percentual = total > 0
            ? Math.round((acertos / total) * 100)
            : 0;

        // Card de resultado com classes temáticas.
        const card = criarElemento(
            'div',
            null,
            'result-card'
        );

        const titulo = criarElemento(
            'h3',
            'Resultado do Lote',
            'result-title'
        );

        const resultado = criarElemento(
            'p',
            `Você acertou ${acertos} de ${total} questões (${percentual}%)!`,
            'result-text'
        );

        const observacao = criarElemento(
            'p',
            'Seu histórico foi atualizado na dashboard.',
            'result-muted'
        );

        const link = criarElemento(
            'a',
            'Voltar ao Dashboard',
            'back-link'
        );

        link.href = 'dashboard.html';

        card.append(titulo, resultado, observacao, link);

        placar.replaceChildren(card);
    }

    enviandoRespostas = false;
}

async function inicializarPaginaQuestoes() {
    if (!(await paginaProtegida)) return;

    const materia = decodeURIComponent(
        window.location.search.substring(1).trim().toLowerCase()
    );

    const materiaAtual = materia || 'portugues';

    tituloMateria.textContent =
        nomesMaterias[materiaAtual] || 'Questões de Concurso';

    if (!nomesMaterias[materiaAtual]) {
        mostrarMensagemQuestao(
            'Matéria inválida. Volte ao dashboard e selecione uma matéria.'
        );

        return;
    }

    await carregarTemas(materiaAtual);
}

inicializarPaginaQuestoes();
