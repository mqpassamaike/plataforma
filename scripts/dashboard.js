import { supabase, encerrarSessao, paginaProtegida } from './getdumb.js';

const materias = {
    portugues: { feitas: 'qFeitasPor', percentual: 'porcPor' },
    matematica: { feitas: 'qFeitasMat', percentual: 'porcMat' },
    gerais: { feitas: 'qFeitasGer', percentual: 'porcGer' },
    informatica: { feitas: 'qFeitasInf', percentual: 'porcInf' },
    administracao: { feitas: 'qFeitasAdm', percentual: 'porcAdm' }
};

function definirTexto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
}

function definirValorStat(id, valor, cor = null) {
    const elemento = document.getElementById(id);
    const strong = elemento?.querySelector('strong');

    if (!strong) return;

    strong.textContent = valor;

    if (cor) strong.style.color = cor;
}

async function carregarDadosDashboard() {
    if (!(await paginaProtegida)) return;

    try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
            await encerrarSessao();
            return;
        }

        const { data: perfil, error: perfilError } = await supabase.rpc('obter_meu_perfil');

        if (perfilError || !perfil) {
            console.error('Erro ao obter perfil:', perfilError);
            throw perfilError || new Error('Perfil não encontrado.');
        }

        definirTexto('userName', perfil.nome || 'Aluno');
        definirTexto('userEmail', perfil.email || sessionData.session.user.email || '');
        definirTexto(
            'subscriptionStatus',
            perfil.assinatura_ativa ? 'Assinatura Ativa' : 'Assinatura Inativa'
        );

        if (perfil.expires_at) {
            const data = new Date(perfil.expires_at);
            definirTexto(
                'subscriptionExpireDate',
                data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
            );
        } else {
            definirTexto('subscriptionExpireDate', 'Não disponível');
        }

        if (!perfil.assinatura_ativa) {
            await encerrarSessao('Sua assinatura está inativa ou expirada.');
            return;
        }

        await Promise.all([
            carregarEstatisticas(),
            carregarLotesDashboard()
        ]);

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        alert('Não foi possível carregar os dados da plataforma. Tente entrar novamente.');
    }
}

async function carregarEstatisticas() {
    const { data, error } = await supabase.rpc('obter_estatisticas_dashboard');

    if (error) {
        console.error('Erro ao carregar estatísticas:', error);
        return;
    }

    // Inicializa os cards para evitar valores antigos na tela.
    for (const config of Object.values(materias)) {
        definirValorStat(config.feitas, '0');
        definirValorStat(config.percentual, '-');
    }

    for (const item of (Array.isArray(data) ? data : [])) {
        const config = materias[String(item.materia).toLowerCase()];
        if (!config) continue;

        definirValorStat(config.feitas, String(item.total_respondidas ?? 0));

        const percentual = Number(item.percentual_ultimas_20 ?? 0);
        let cor = 'var(--text-main, #333)';

        if (percentual >= 70) cor = 'var(--success-color, #16a34a)';
        else if (percentual < 50 && Number(item.total_respondidas) > 0) {
            cor = 'var(--error-color, #dc2626)';
        }

        const texto = Number(item.total_respondidas) > 0
            ? `${percentual.toLocaleString('pt-BR')}%`
            : '-';

        definirValorStat(config.percentual, texto, cor);
    }
}

document.getElementById('btnLogout')?.addEventListener('click', async () => {
    await encerrarSessao();
});


const nomesMateriasLotes = {
    portugues: 'Português',
    matematica: 'Matemática',
    gerais: 'Conhecimentos Gerais',
    informatica: 'Informática',
    administracao: 'Administração Pública'
};

function formatarDificuldade(dificuldade) {
    const valor = String(dificuldade || '').toLowerCase();

    if (valor === 'facil' || valor === 'fácil') return 'Fácil';
    if (valor === 'medio' || valor === 'médio') return 'Médio';
    if (valor === 'dificil' || valor === 'difícil') return 'Difícil';

    return dificuldade || '';
}

function criarElemento(tag, classe, texto = '') {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    elemento.textContent = texto;

    return elemento;
}

function renderizarLotesDashboard(dados) {
    const lista = document.getElementById('dailyBatchesList');

    if (!lista) return;

    lista.replaceChildren();

    const lotes = Array.isArray(dados.lotes)
        ? dados.lotes.slice(0, 6)
        : [];

    const utilizados = Number(dados.total_utilizados) || 0;
    const restantes = Number(dados.total_restantes) || 0;

    definirTexto('dailyBatchesCount', `${utilizados}/6 utilizados`);
    definirTexto('dailyBatchesUsed', `${utilizados}/6`);
    definirTexto('dailyBatchesRemaining', restantes);

    for (let i = 0; i < 6; i++) {
        const lote = lotes[i];

        let estado = 'available';

        if (lote?.status === 'concluido') {
            estado = 'completed';
        } else if (lote) {
            estado = 'in-progress';
        }

        const item = criarElemento(
            'div',
            `daily-batch-item ${estado}`
        );

        const barra = criarElemento('div', 'daily-batch-bar');
        const preenchimento = criarElemento(
            'div',
            'daily-batch-bar-fill'
        );

        barra.appendChild(preenchimento);

        const informacoes = criarElemento(
            'div',
            'daily-batch-info'
        );

        if (lote) {
            const materia = nomesMateriasLotes[
                String(lote.materia).toLowerCase()
            ] || lote.materia;

            informacoes.appendChild(
                criarElemento('span', 'daily-batch-subject', materia)
            );

            informacoes.appendChild(
                criarElemento('span', 'daily-batch-topic', lote.tema)
            );

            informacoes.appendChild(
                criarElemento(
                    'span',
                    'daily-batch-difficulty',
                    formatarDificuldade(lote.dificuldade)
                )
            );
        } else {
            informacoes.appendChild(
                criarElemento('span', 'daily-batch-subject', 'Disponível')
            );

            informacoes.appendChild(
                criarElemento('span', 'daily-batch-topic', '')
            );

            informacoes.appendChild(
                criarElemento('span', 'daily-batch-difficulty', '')
            );
        }

        item.appendChild(barra);
        item.appendChild(informacoes);

        lista.appendChild(item);
    }
}

async function carregarLotesDashboard() {
    const { data, error } = await supabase.rpc('obter_lotes_dashboard');

    if (error) {
        console.error('Erro ao carregar lotes do dashboard:', error);
        definirTexto('dailyBatchesCount', 'Não foi possível carregar');
        return;
    }

    if (!data) {
        console.error('A RPC não retornou dados dos lotes.');
        return;
    }

    renderizarLotesDashboard(data);
}

function configurarAcordeaoLotes() {
    const botao = document.getElementById('dailyBatchesToggle');
    const detalhes = document.getElementById('dailyBatchesDetails');

    if (!botao || !detalhes) return;

    botao.addEventListener('click', () => {
        const aberto = botao.getAttribute('aria-expanded') === 'true';

        botao.setAttribute('aria-expanded', String(!aberto));
        detalhes.hidden = aberto;
    });
}


configurarAcordeaoLotes();
carregarDadosDashboard();
