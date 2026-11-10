(() => {
const C = window.SITE_CONFIG, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (t, a = {}, ...k) => { const e = document.createElement(t); for (const [n, v] of Object.entries(a)) { if (n === 'text') e.textContent = v; else if (n === 'class') e.className = v; else if (n.startsWith('on')) e.addEventListener(n.slice(2), v); else e.setAttribute(n, v); } e.append(...k.flat()); return e; };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
const fmt = n => Math.round(n).toLocaleString('pt-BR');
const onView = (node, fn) => { if (!node) return; if (!('IntersectionObserver' in window)) return fn(); const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: .3 }); io.observe(node); };
const tween = (from, to, ms, cb) => { if (reduce) return cb(to); const t0 = performance.now(); const f = t => { const p = Math.min((t - t0) / ms, 1), e = 1 - Math.pow(1 - p, 3); cb(from + (to - from) * e); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove('show'), 3200); };

const withQ = C.subjects.filter(s => s.q), totalQ = withQ.reduce((a, s) => a + s.q, 0);

/* marca, links, CTA */
$('#brand').textContent = C.brand; $('#fBrand').textContent = C.brand;
$('#loginLink').href = C.links.login; $('#navLogin').href = C.links.login; $('#supportLink').href = C.links.support;
$$('[data-cta]').forEach(a => {
  const pending = !C.links.checkout || C.links.checkout.includes('SEU_LINK');
  a.href = pending ? '#oferta' : C.links.checkout;
  a.addEventListener('click', e => { if (a.closest('#oferta') && pending) { e.preventDefault(); toast('Checkout da Hotmart ainda não configurado.'); } });
});
$$('#nav a').forEach(a => { const h = a.getAttribute('href'); if (h.startsWith('#') && !$(h)) a.remove(); });

/* imagens com fallback */
$$('img[data-fallback]').forEach(img => { const bad = () => img.parentElement.classList.add('img-failed'); img.addEventListener('error', bad); if (img.complete && !img.naturalWidth) bad(); });
$$('img[data-bg]').forEach(i => { const off = () => i.hidden = true; i.addEventListener('error', off); if (i.complete && !i.naturalWidth) off(); });

/* menu hambúrguer */
(() => {
  const b = $('#burger'), nav = $('#nav'), set = o => { nav.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); b.setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu'); };
  b.addEventListener('click', () => set(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  document.addEventListener('click', e => { if (!e.target.closest('.top')) set(false); });
  matchMedia('(min-width:981px)').addEventListener('change', () => set(false));
})();

/* seletor de tema */
(() => {
  const box = $('#themeBox'), cur = () => document.documentElement.dataset.theme;
  if (!C.themes.some(t => t.id === cur())) document.documentElement.dataset.theme = C.theme.default;
  const btn = el('button', { class: 'theme-toggle', type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-label': 'Trocar tema', text: '◐' });
  const menu = el('ul', { class: 'menu', role: 'menu', hidden: '' });
  const mark = () => $$('button', menu).forEach(b => b.setAttribute('aria-checked', b.dataset.id === cur()));
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  C.themes.forEach(t => menu.append(el('li', {}, el('button', { type: 'button', role: 'menuitemradio', 'data-id': t.id, onclick: () => {
    document.documentElement.dataset.theme = t.id; try { localStorage.setItem(C.theme.storageKey, t.id); } catch (e) {} mark(); close();
  } }, el('span', { class: 'dot', style: `background:linear-gradient(135deg,${t.c[0]} 50%,${t.c[1]} 50%)` }), t.name))));
  btn.addEventListener('click', () => { menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.addEventListener('click', e => { if (!box.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  box.append(btn, menu); mark();
})();

/* hero: números */
(() => {
  const items = [[totalQ, 'questões na prova'], [C.subjects.length, 'matérias, com redação'], [C.offer.guaranteeDays, 'dias de garantia']];
  const box = $('#stats');
  items.forEach(([n, l]) => { const s = el('strong', { text: '0' }); box.append(el('div', {}, s, el('span', { text: l }))); onView(box, () => tween(0, n, 1100, v => s.textContent = fmt(v))); });
})();

/* rosca interativa */
(() => {
  const R = 80, L = 2 * Math.PI * R, NS = 'http://www.w3.org/2000/svg';
  const box = $('#donut'), svg = document.createElementNS(NS, 'svg'); 
  svg.setAttribute('viewBox', '0 0 200 200'); 
  svg.setAttribute('role', 'img'); 
  svg.setAttribute('aria-label', 'Distribuição das questões por matéria');

  const center = el('div', { class: 'dcenter' }, el('strong', { text: String(totalQ) }), el('span', { text: 'questões na prova' }));
  const legend = $('#legend'), circles = [], btns = [];
  let off = 0;
  
  let selectedIndex = null; // Guarda o índice da matéria clicada (persistente)

  withQ.forEach((s, i) => {
    const len = s.q / totalQ * L, c = document.createElementNS(NS, 'circle');
    [['cx', 100], ['cy', 100], ['r', R], ['transform', 'rotate(-90 100 100)'], ['tabindex', 0], ['aria-label', `${s.name}: ${s.q} questões`]].forEach(([k, v]) => c.setAttribute(k, v));
    
    c.style.stroke = `var(--s${C.subjects.indexOf(s) + 1})`; 
    c.style.strokeDasharray = `${len - 2} ${L - len + 2}`; 
    c.style.strokeDashoffset = -off; 
    off += len;

    // HOVER: Só ativa visualmente se não houver clique fixo ativo
    c.addEventListener('mouseenter', () => {
      if (selectedIndex === null) highlight(i);
    });
    
    // SAIU DO HOVER: Restaura o estado (volta a focar no clicado ou limpa tudo)
    c.addEventListener('mouseleave', () => {
      if (selectedIndex === null) clearHighlight();
    });

    // CLIQUE: Define o estado fixo
    c.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita que o clique feche imediatamente pelo listener global
      selectItem(i);
    });

    circles.push(c); 
    svg.append(c);

    const b = el('button', { 
      type: 'button', 
      onclick: (e) => { 
        e.stopPropagation(); 
        selectItem(i); 
      },
      onmouseenter: () => { if (selectedIndex === null) highlight(i); },
      onmouseleave: () => { if (selectedIndex === null) clearHighlight(); }
    }, el('i', { style: `background:var(--s${C.subjects.indexOf(s) + 1})` }), s.name, el('b', { text: s.q + ' Questões' }));
    
    btns.push(b); 
    legend.append(el('li', {}, b));
  });

  // Função para aplicar visual temporário (Hover)
  function highlight(i) {
    circles.forEach((c, j) => c.classList.toggle('on', i === j)); 
    btns.forEach((b, j) => b.classList.toggle('on', i === j));
    box.classList.add('has-on'); 
    const s = withQ[i];
    center.innerHTML = ''; 
    center.append(el('strong', { text: Math.round(s.q / totalQ * 100) + '%' }), el('span', { text: `${s.name} · ${s.q} questões` }));
  }

  // Função para limpar o hover
  function clearHighlight() {
    if (selectedIndex !== null) return; // Se tiver algo clicado, não limpa
    circles.forEach(c => c.classList.remove('on')); 
    btns.forEach(b => b.classList.remove('on'));
    box.classList.remove('has-on'); 
    center.innerHTML = ''; 
    center.append(el('strong', { text: String(totalQ) }), el('span', { text: 'questões na prova' }));
  }

  // Função para fixar a seleção por Clique
  function selectItem(i) {
    selectedIndex = i;
    highlight(i);
  }

  // CLIQUE FORA: Se clicar em qualquer lugar da página fora da rosca/legenda, reseta
  document.addEventListener('click', (e) => {
    if (!box.contains(e.target) && !legend.contains(e.target)) {
      selectedIndex = null;
      clearHighlight();
    }
  });

  box.append(svg, center);
})();

/* matérias */
(() => {
  const list = $('#tablist'), panel = $('#subjectPanel'), tabs = [];
  const show = i => {
    const s = C.subjects[i]; tabs.forEach((t, j) => { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
    panel.innerHTML = ''; panel.append(el('h3', { text: s.name }), el('span', { class: 'qcount', text: s.q ? `${s.q} questões na prova` : 'Avaliada à parte' }), el('p', { text: s.desc, style: 'margin-top:12px' }), el('ul', { class: 'chips' }, s.topics.map(t => el('li', { text: t }))));
  };
  C.subjects.forEach((s, i) => { const t = el('button', { role: 'tab', type: 'button', text: s.name, onclick: () => show(i), onkeydown: e => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); const n = (i + d + tabs.length) % tabs.length; show(n); tabs[n].focus(); } } }); tabs.push(t); list.append(t); });
  show(0);
})();

/* questão de exemplo */
(() => {
  const box = $('#quiz'); let i = 0, score = 0;
  const render = () => {
    box.innerHTML = '';
    if (i >= C.quiz.length) {
      box.append(el('div', { class: 'result-card' }, el('h3', { class: 'result-title', text: `Você acertou ${score} de ${C.quiz.length}` }), el('p', { class: 'result-muted', text: 'No curso, seus acertos ficam registrados por matéria.' }), el('button', { class: 'btn', type: 'button', text: 'Tentar de novo', onclick: () => { i = 0; score = 0; render(); } }))); return;
    }
    const q = C.quiz[i], ex = el('div', { class: 'explanation-box', 'aria-live': 'polite' }), next = el('button', { class: 'btn', type: 'button', hidden: '', text: i + 1 === C.quiz.length ? 'Ver resultado' : 'Próxima questão', onclick: () => { i++; render(); } });
    const opts = q.opts.map((o, k) => el('button', { class: 'opt', type: 'button', onclick: () => {
      opts.forEach((b, j) => { b.disabled = true; if (j === q.ok) b.classList.add('right'); });
      const hit = k === q.ok; if (hit) score++; else opts[k].classList.add('wrong');
      ex.classList.add('is-open', hit ? 'correct' : 'incorrect'); ex.replaceChildren(el('p', {}, el('strong', { text: hit ? 'Correto. ' : 'Não foi dessa vez. ' }), q.why)); next.hidden = false;
    } }, el('b', { text: 'ABCDE'[k] }), o));
    box.append(el('div', { class: 'meta' }, el('span', { text: `Questão ${i + 1} de ${C.quiz.length}` }), el('span', { text: `Acertos: ${score}` })), el('p', { class: 'stem', text: q.stem }), ...opts, ex, next);
  };
  render();
})();

/* simulador de rotina */
(() => {
  const S = C.study, h = $('#hours'), d = $('#days'), blocks = $('#blocks');
  h.max = S.maxHours; h.value = S.defaultHours; d.max = S.maxDays; d.value = S.defaultDays;
  $('#simNote').textContent = `Estimativa com ${S.minutesPerQuestion} min por questão. A redação deve ser treinada à parte. Não é promessa de resultado.`;
  const calc = () => {
    const perDay = Math.floor(h.value * 60 / S.minutesPerQuestion), tot = perDay * d.value, exams = Math.floor(tot / totalQ);
    $('#hOut').textContent = String(h.value).replace('.', ',') + ' h'; $('#dOut').textContent = d.value + ' dias';
    $('#rDay').textContent = fmt(perDay); $('#rTot').textContent = fmt(tot); $('#rExam').textContent = fmt(exams);
    blocks.replaceChildren(...Array.from({ length: Math.min(exams, 48) }, () => el('i')), ...(exams > 48 ? [el('em', { text: `+${exams - 48}` })] : []));
  };
  h.addEventListener('input', calc); d.addEventListener('input', calc); calc();
})();

/* jornada D+1 a D+8 */
(() => {
  const box = $('#days8'), info = $('#dayInfo'), btns = [];
  const show = i => {
    btns.forEach((b, j) => b.setAttribute('aria-selected', i === j));
    const x = C.drip[i]; info.replaceChildren(el('h3', { text: `Dia ${i + 1}: ${x.t}` }), el('p', { text: x.d }));
  };
  C.drip.forEach((x, i) => { const b = el('button', { type: 'button', role: 'tab', class: i === C.drip.length - 1 ? 'final' : '', onclick: () => show(i) }, 'D+' + (i + 1), el('small', { text: i === C.drip.length - 1 ? 'tudo' : 'ebook' })); btns.push(b); box.append(b); });
  show(0);
})();

/* painel do aluno */
(() => {
  const box = $('#bars'); if (!box) return;
  const fills = withQ.map(s => {
    const f = el('div', { class: 'fill', style: `background:var(--s${C.subjects.indexOf(s) + 1})` }), v = el('span', { text: '0%' });
    box.append(el('div', { class: 'bar-row' }, el('div', {}, el('span', { text: s.name }), v), el('div', { class: 'track' }, f))); return { f, v };
  });
  const set = arr => fills.forEach((o, i) => { o.f.style.width = arr[i] + '%'; o.v.textContent = arr[i] + '%'; });
  onView(box, () => set(withQ.map((_, i) => C.dashboardSample[i] ?? 60)));
  $('#simBtn').addEventListener('click', () => set(withQ.map(() => 40 + Math.floor(Math.random() * 55))));
})();

/* oferta */
(() => {
  const O = C.offer, to = $('#pTo'), from = $('#pFrom');
  from.textContent = money(O.from); to.textContent = money(O.to);
  $('#pOff').textContent = Math.round((1 - O.to / O.from) * 100) + '% de desconto';
  $('#guar').textContent = `Garantia de ${O.guaranteeDays} dias pela Hotmart. Prazo de acesso: ${O.access}.`;
  O.features.forEach(f => $('#features').append(el('li', { text: f })));
  O.steps.forEach(s => $('#buySteps').append(el('li', { text: s })));
  onView($('.offer'), () => tween(O.from, O.to, 1300, v => to.textContent = money(v)));
  if (O.deadline) {
    const end = new Date(O.deadline).getTime(), t = $('#timer'), val = $('#timerVal'), p = n => String(n).padStart(2, '0');
    const tick = () => { const ms = end - Date.now(); if (ms <= 0) { t.hidden = true; clearInterval(id); return; } t.hidden = false;
      const s = Math.floor(ms / 1e3); val.textContent = `${Math.floor(s / 86400)}d ${p(Math.floor(s % 86400 / 3600))}h ${p(Math.floor(s % 3600 / 60))}m ${p(s % 60)}s`; };
    const id = setInterval(tick, 1000); tick();
  }
})();

/* FAQ */
C.faq.forEach(([q, a], i) => {
  const btn = el('button', { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'fa' + i, text: q }), body = el('div', { class: 'faq-a', id: 'fa' + i }, el('div', {}, el('p', { text: a })));
  btn.addEventListener('click', () => { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); body.classList.toggle('open', !open); });
  $('#faqList').append(el('div', { class: 'faq-item' }, btn, body));
});

/* menu: seção atual */
if ('IntersectionObserver' in window) {
  const links = $$('#nav a'), io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section').forEach(s => io.observe(s));
}

/* dicas de interação somem no primeiro uso */
$$('.hint').forEach(h => $$(h.dataset.for).forEach(n => ['pointerdown', 'keydown', 'input'].forEach(ev => n.addEventListener(ev, () => h.classList.add('done'), { once: true }))));

/* sombra do header e entrada suave dos blocos */
(() => {
  const top = $('.top'); addEventListener('scroll', () => top.classList.toggle('scrolled', scrollY > 8), { passive: true });
  if (!('IntersectionObserver' in window) || reduce) return;
  const sel = '.sec:not(#inicio) h2, .sec:not(#inicio) .card, .donutbox, .tabs, .days, .faq, .img-slot.tall';
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$(sel).filter(n => !n.parentElement.closest(sel)).forEach(n => { n.classList.add('rv'); io.observe(n); });
})();

/* vanilla-tilt no mockup do livro;*/
VanillaTilt.init(document.querySelectorAll(".js-tilt"), {
    max: 14,
    perspective: 1000,
    scale: 1.04,
    speed: 1000,
    glare: true,
    "max-glare": 0.25,
    startX: 10,
    startY: 3,
    "reset-to-start": true,
    transition: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
    gyroscope: true,
    // "full-page-listening": true,
});
})();
