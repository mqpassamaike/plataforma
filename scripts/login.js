import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://gqpuencmgbfsywvmaxib.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mxz8p0Q3Hf28IKA9_S6TLQ_tNgpINWI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SESSION_STORAGE_KEY = 'meu_app_session_token';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const feedback = document.getElementById('feedback-message');
const resetButton = document.getElementById('btn-reset-password');
const helpButton = document.getElementById('btn-help');

function mostrarFeedback(tipo, mensagem) {
    feedback.className = `message-box ${tipo}`;
    feedback.textContent = mensagem;
}

loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        mostrarFeedback('error', 'Informe seu e-mail e sua senha.');
        return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    mostrarFeedback('success', 'Validando credenciais...');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data.session) {
            throw error || new Error('Não foi possível iniciar a sessão.');
        }

        const claims = JSON.parse(
            atob(data.session.access_token.split('.')[1])
        );

        localStorage.setItem(
            'teste_session_id',
            JSON.stringify({
                possuiSessionId: !!claims.session_id,
                sessionId: claims.session_id,
                role: claims.role
            })
        );

        // O identificador estável é gerado no PostgreSQL, não é o access_token.
        const { data: sessionId, error: sessionError } = await supabase.rpc(
            'gerar_e_atualizar_sessao'
        );

        const { data: validacao, error: validacaoError } =
            await supabase.rpc('validar_sessao_atual');

        localStorage.setItem(
            'resultado_teste_sessao',
            JSON.stringify({
                validacao,
                erro: validacaoError?.message ?? null
            })
        );


        if (sessionError || !sessionId) {
            console.error('Erro ao gerar sessão única:', sessionError);
            await supabase.auth.signOut();
            throw sessionError || new Error('Não foi possível registrar sua sessão.');
        }

        localStorage.setItem(SESSION_STORAGE_KEY, sessionId);

        mostrarFeedback('success', 'Login bem-sucedido! Redirecionando...');

        window.setTimeout(() => {
            window.location.replace('dashboard.html');
        }, 500);

    } catch (error) {
        console.error('Erro no login:', error);
        mostrarFeedback('error', error?.message || 'Não foi possível entrar.');
        if (submitButton) submitButton.disabled = false;
    }
});

resetButton?.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        mostrarFeedback('error', 'Digite seu e-mail acima para redefinir sua senha.');
        emailInput.focus();
        return;
    }

    mostrarFeedback('success', 'Enviando link de redefinição...');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Manter este endereço enquanto estiver testando localmente.
        // Antes da publicação, substituir pelo domínio real e autorizá-lo no Supabase.
        redirectTo: 'https://mqpassamaike.github.io/plataforma/recovery.html'
    });

    if (error) {
        console.error('Erro ao enviar recuperação:', error);
        mostrarFeedback('error', `Erro ao enviar e-mail: ${error.message}`);
        return;
    }

    mostrarFeedback('success', 'Link enviado. Verifique sua caixa de entrada.');
});

helpButton?.addEventListener('click', (event) => {
    event.preventDefault();
    mostrarFeedback('success', 'Entre em contato com o suporte da plataforma.');
});
