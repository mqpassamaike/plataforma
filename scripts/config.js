/* =====================================================
   CONFIG
===================================================== */
window.SITE_CONFIG = {
  brand: 'Mais Que Papa Maike',                       // nome da marca
  theme: { default: 'special', storageKey: 'theme' }, // use a mesma chave do site do aluno
  themes: [                                  // c = [fundo, destaque] só para a bolinha do seletor
    { id: 'light',    name: 'Claro',    c: ['#f1f5f9', '#1e3a8a'] },
    { id: 'dark',     name: 'Escuro',   c: ['#0f172a', '#60a5fa'] },
    { id: 'special',  name: 'Azul e dourado', c: ['#080d1a', '#eab308'] },
    { id: 'farda',    name: 'Farda',    c: ['#ece8da', '#3f5a2a'] },
    { id: 'tatico',   name: 'Tático',   c: ['#16181b', '#f97316'] },
    { id: 'noturno',  name: 'Noturno',  c: ['#07182b', '#38bdf8'] },
    { id: 'bandeira', name: 'Bandeira', c: ['#f5f5f5', '#b91c1c'] }
  ],
  links: {
    checkout: 'https://pay.hotmart.com/SEU_LINK_AQUI', // (PLACEHOLDER) link da Hotmart
    login: 'login.html',                                    // login do aluno (mesmo domínio)
    support: 'mailto:contato@seudominio.com.br'         // (PLACEHOLDER)
  },
  offer: {
    from: 900, to: 99,
    deadline: '2026-12-31T23:59:00-03:00',   // ex.: '2026-12-31T23:59:00-03:00'. Com data, aparece o timer; null = sem timer
    guaranteeDays: 7,
    access: 'Acesso Imediato',  // prazo de acesso
    features: [
      'Banco de questões por matéria, com correção e explicação',
      'Ebooks de orientação liberados do dia 1 ao dia 7',
      'Material completo liberado no dia 8',
      'Painel com seus acertos por matéria',
      'Acesso pelo celular ou computador'
    ],
    steps: [
      'Compre pela Hotmart',
      'Receba por e-mail o link para criar sua senha',
      'Entre na plataforma e comece pelos ebooks',
      'No dia 8, o material completo é liberado'
    ]
  },
  study: { minutesPerQuestion: 3, maxHours: 4, maxDays: 90, defaultHours: 1.5, defaultDays: 45 },
  /* q = nº de questões na prova (null = sem contagem, ex.: redação). topics: (PLACEHOLDER) o último é sempre "E mais…" */
  subjects: [
    { name: 'Língua Portuguesa', q: 20, desc: 'Leitura, interpretação e uso da norma-padrão.',
      topics: ['Interpretação de texto', 'Ortografia e acentuação', 'Concordância', 'Regência e crase', 'Pontuação', 'E mais…'] },
    { name: 'Matemática', q: 15, desc: 'Raciocínio e resolução de problemas.',
      topics: ['Porcentagem', 'Regra de três', 'Razão e proporção', 'Equações', 'Geometria básica', 'E mais…'] },
    { name: 'Conhecimentos Gerais', q: 15, desc: 'História, geografia e atualidades.',
      topics: ['História Geral', 'História do Brasil', 'Geografia Geral', 'Geografia do Brasil', 'Atualidades', 'E mais…'] },
    { name: 'Informática', q: 5, desc: 'Noções básicas de informática.',
      topics: ['Sistemas operacionais', 'Editores de texto', 'Planilhas', 'Internet e e-mail', 'Segurança', 'E mais…'] },
    { name: 'Administração Pública', q: 5, desc: 'Direito Constitucional e Lei de Acesso à Informação.',
      topics: ['Direito Constitucional', 'Lei de Acesso à Informação', 'Princípios da administração', 'E mais…'] },
    { name: 'Redação', q: null, desc: 'Produção de texto, avaliada à parte das questões.',
      topics: ['Estrutura do texto', 'Argumentação', 'Coesão e coerência', 'Correção da norma-padrão', 'E mais…'] }
  ],
  quiz: [ // questões de exemplo elaboradas para a demonstração
    { stem: 'Assinale a alternativa em que a concordância verbal está de acordo com a norma-padrão.',
      opts: ['Fazem dois anos que ele ingressou na corporação.', 'Haviam muitos candidatos na fila.', 'Devem existir soluções para o problema.', 'Houveram vários erros na prova.', 'Existe muitos motivos para estudar.'],
      ok: 2, why: '“Existir” é verbo pessoal e concorda com “soluções”. Já “fazer” (tempo) e “haver” (existir) são impessoais: “Faz dois anos”, “Havia”, “Houve”.' },
    { stem: 'Um candidato resolveu 40 questões e acertou 75% delas. Quantas questões ele errou?',
      opts: ['5', '8', '10', '12', '15'], ok: 2, why: '75% de 40 = 30 acertos. Erros: 40 − 30 = 10.' },
    { stem: 'A Lei de Acesso à Informação, que regula o direito de receber informações dos órgãos públicos, é a Lei nº:',
      opts: ['8.112/1990', '12.527/2011', '9.784/1999', '8.429/1992', '14.133/2021'], ok: 1, why: 'A Lei nº 12.527/2011 regulamenta o acesso a informações previsto na Constituição.' }
  ],
  drip: [ // (PLACEHOLDER) títulos dos ebooks
    { t: 'Como funciona o curso', d: 'Ebook 1. Por onde começar e como usar a plataforma.' },
    { t: 'Como estudar para concurso', d: 'Ebook 2. Método e rotina de estudos.' },
    { t: 'O que ninguém conta sobre entrar na PM', d: 'Ebook 3. A realidade antes de entrar.' },
    { t: 'O processo seletivo, etapa por etapa', d: 'Ebook 4. O caminho até a convocação.' },
    { t: 'A vida na corporação: benefícios', d: 'Ebook 5. O que a carreira oferece.' },
    { t: 'A vida na corporação: ônus', d: 'Ebook 6. Os desafios da carreira.' },
    { t: 'Seu plano para estudar sozinho', d: 'Ebook 7. Como organizar o estudo após a liberação.' },
    { t: 'Material completo liberado', d: 'Passada a garantia de 7 dias, todo o material e o banco de questões ficam à sua disposição.' }
  ],
  dashboardSample: [78, 64, 70, 55, 60], // % de acerto de exemplo, na ordem das matérias com questões
  faq: [
    ['Como recebo o acesso?', 'A compra é feita pela Hotmart. Depois da confirmação, você recebe por e-mail o link para criar sua senha na plataforma.'],
    ['Quando o material completo é liberado?', 'Do dia 1 ao dia 7 você recebe ebooks de orientação. No dia 8, após o prazo de garantia, o material completo é liberado.'],
    ['Posso estudar pelo celular?', 'Sim. A plataforma funciona no celular e no computador.'],
    ['Por quanto tempo tenho acesso?', 'O prazo de acesso será informado na oferta antes da compra.'],
    ['Como funciona a garantia?', 'Você tem 7 dias para cancelar a compra pela Hotmart, conforme as condições da oferta.'],
    ['Tem vínculo com a Polícia Militar ou com a Vunesp?', 'Não. É um preparatório independente. A referência ao concurso indica apenas o objetivo dos estudos.'],
    ['Preciso de suporte, onde falo?', 'Pelo canal de suporte informado no rodapé desta página.']
  ]
};
