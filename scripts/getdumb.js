import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://gqpuencmgbfsywvmaxib.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mxz8p0Q3Hf28IKA9_S6TLQ_tNgpINWI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SESSION_STORAGE_KEY = 'meu_app_session_token';

export async function obterSessaoAtual() {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;
    return data.session;
}

export async function encerrarSessao(mensagem = '') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    await supabase.auth.signOut({ scope: 'local' });

    if (mensagem) alert(mensagem);
    window.location.replace('login.html');
}

async function protegerPagina() {
    const paginaAtual = window.location.pathname.toLowerCase();

    // Não executar a proteção em páginas públicas.
    if (paginaAtual.endsWith('/login.html') || paginaAtual.endsWith('login.html')) return;

    let session;

    try {
        session = await obterSessaoAtual();
    } catch (error) {
        console.error('Não foi possível recuperar a sessão:', error);
        await encerrarSessao();
        return false;
    }

    if (!session) {
        await encerrarSessao();
        return false;
    }

    const sessionIdLocal = localStorage.getItem(SESSION_STORAGE_KEY);

    // O UUID é criado no banco no momento do login.
    if (!sessionIdLocal) {
        await encerrarSessao('Sua sessão não foi encontrada. Entre novamente.');
        return false;
    }

    const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select('status_assinatura, expires_at, current_session_id')
        .eq('id', session.user.id)
        .maybeSingle();

    if (perfilError || !perfil) {
        console.error('Erro ao carregar perfil:', perfilError);
        await encerrarSessao('Não foi possível validar seu perfil. Entre novamente.');
        return false;
    }

    const expiracao = perfil.expires_at ? new Date(perfil.expires_at) : null;

    if (
        perfil.status_assinatura !== 'ativo' ||
        !expiracao ||
        Number.isNaN(expiracao.getTime()) ||
        expiracao <= new Date()
    ) {
        await encerrarSessao('Sua assinatura está inativa ou expirada.');
        return false;
    }

    if (
        !perfil.current_session_id ||
        perfil.current_session_id !== sessionIdLocal
    ) {
        await encerrarSessao('Sua conta foi acessada em outro dispositivo ou navegador.');
        return false;
    }

    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    return true;
}

// Logout global para compatibilidade com o botão atual do dashboard.
window.fazerLogout = async function () {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    await supabase.auth.signOut({ scope: 'local' });
    window.location.replace('login.html');
};

// As páginas protegidas aguardam esta validação antes de consultar dados.
export const paginaProtegida = protegerPagina();

