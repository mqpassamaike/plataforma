
(() => {
    const STORAGE_KEY = 'preferencia_tema_plataforma';

    const TEMAS = ['light', 'dark', 'special'];

    const NOMES_TEMAS = {
        light: 'claro',
        dark: 'escuro',
        special: 'especial'
    };

    const ICONES_TEMAS = {
        light: '☀',
        dark: '☾',
        special: '✦'
    };

    const preferenciaSistema = window.matchMedia(
        '(prefers-color-scheme: dark)'
    );

    function obterPreferenciaSalva() {
        try {
            const tema = localStorage.getItem(STORAGE_KEY);

            return TEMAS.includes(tema) ? tema : null;
        } catch {
            return null;
        }
    }

    function aplicarTema(tema) {
        if (!TEMAS.includes(tema)) return;

        document.documentElement.dataset.theme = tema;

        document.documentElement.style.colorScheme =
            tema === 'light' ? 'light' : 'dark';

        document.querySelectorAll('[data-theme-toggle]').forEach(botao => {
            const icone = botao.querySelector('.theme-toggle-icon');

            if (icone) {
                icone.textContent = ICONES_TEMAS[tema];
            }

            botao.title = `Tema atual: ${NOMES_TEMAS[tema]}. Clique para alterar.`;

            botao.setAttribute(
                'aria-label',
                `Tema atual: ${NOMES_TEMAS[tema]}. Alterar tema.`
            );
        });
    }

    function obterTemaInicial() {
        const salvo = obterPreferenciaSalva();

        if (salvo) return salvo;

        return preferenciaSistema.matches ? 'dark' : 'light';
    }

    function alternarTema() {
        const temaAtual = document.documentElement.dataset.theme || 'light';

        const indiceAtual = TEMAS.indexOf(temaAtual);
        const proximoIndice = (indiceAtual + 1) % TEMAS.length;

        const proximoTema = TEMAS[proximoIndice];

        try {
            localStorage.setItem(STORAGE_KEY, proximoTema);
        } catch (error) {
            console.warn('Não foi possível salvar a preferência de tema.', error);
        }

        aplicarTema(proximoTema);
    }

    // Aplica o tema imediatamente, antes da renderização visual.
    aplicarTema(obterTemaInicial());

    // Os botões são encontrados quando o HTML estiver carregado.
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-theme-toggle]').forEach(botao => {
            botao.addEventListener('click', alternarTema);
        });

        aplicarTema(document.documentElement.dataset.theme);
    });

    // Se o usuário nunca escolheu manualmente, acompanha o sistema.
    preferenciaSistema.addEventListener('change', evento => {
        if (obterPreferenciaSalva()) return;

        aplicarTema(evento.matches ? 'dark' : 'light');
    });
})();
