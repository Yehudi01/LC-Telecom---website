/* =====================================================================
   LC TELECOM — main.js (JS puro, sem dependências)
   Índice: CONFIG · utilitários · WhatsApp · preloader · header/menu · reveal
           · contadores · abas de planos · cobertura · inicialização
   ===================================================================== */
(() => {
  'use strict';

  /* ===================================================================
     CONFIG — edite aqui os dados que mudam com frequência
     =================================================================== */
  const CONFIG = {
    // Números no formato internacional, só dígitos (55 + DDD + número)
    phones: {
      main: '5561996955196',        // (61) 9 9695-5196  → CTA principal
      alt:  '5561999099256',        // (61) 9 9909-9256  → alternativo
    },
    defaultMessage: 'Olá, gostaria de informações sobre os planos da LC Telecom',

    /* PLACEHOLDER — COBERTURA ----------------------------------------
       Liste aqui os bairros/regiões/RAs realmente atendidos no DF.
       Eles viram "chips" na seção Cobertura e alimentam o verificador.
       Exemplo:  coverage: ['Taguatinga', 'Ceilândia', 'Samambaia', 'Águas Claras'],
       Enquanto estiver vazio, a página mostra "Lista em atualização"
       e o verificador encaminha a consulta para o WhatsApp.            */
    coverage: [],

    /* PLACEHOLDER — CEPs atendidos (opcional) -------------------------
       Prefixos de CEP (5 primeiros dígitos) cobertos. Ex.: ['73150', '72000']
       Se preenchido, o verificador confirma disponibilidade por CEP.   */
    cepPrefixes: [],
  };

  /* ===================================================================
     Utilitários
     =================================================================== */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const waUrl = (msg, number = CONFIG.phones.main) =>
    `https://wa.me/${number}?text=${encodeURIComponent(msg || CONFIG.defaultMessage)}`;
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ===================================================================
     WhatsApp — monta todos os links a partir de CONFIG (fonte única)
     - [data-wa]            → número principal (ou data-number) + mensagem padrão (ou data-msg)
     - [data-plan-link]     → mensagem com o nome do plano do card pai (data-plan)
     =================================================================== */
  function initWhatsApp() {
    $$('[data-wa]').forEach((a) => {
      a.href = waUrl(a.dataset.msg, a.dataset.number || CONFIG.phones.main);
    });
    $$('[data-plan-link]').forEach((a) => {
      const plan = a.closest('[data-plan]');
      const name = plan ? plan.dataset.plan : '';
      a.href = waUrl(`Olá! Tenho interesse no plano: ${name}. Pode verificar a disponibilidade no meu endereço?`);
    });
  }

  /* ===================================================================
     Preloader — some no load da janela, mas NUNCA depois de ~2s
     (internet lenta não deve prender o visitante na tela de carregamento)
     =================================================================== */
  function initPreloader() {
    const pre = $('#preloader');
    const body = document.body;
    const start = performance.now();
    const MIN = reduceMotion ? 0 : 1100;   // tempo mínimo para a animação "respirar"
    const MAX = 2200;                       // teto de segurança
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      pre.classList.add('is-done');
      body.classList.remove('is-loading');
      document.documentElement.classList.add('is-ready');
      setTimeout(() => pre.remove(), 900);
      // libera as animações de entrada da página
      requestAnimationFrame(startPage);
    };
    const tryFinish = () => setTimeout(finish, Math.max(0, MIN - (performance.now() - start)));

    if (document.readyState === 'complete') tryFinish();
    else window.addEventListener('load', tryFinish, { once: true });
    setTimeout(finish, MAX);
  }

  /* Chamado quando o preloader sai: dispara reveals e o botão flutuante */
  function startPage() {
    initReveal();
    initCounters();
    setTimeout(() => $('.wa-float')?.classList.add('is-ready'), 500);
  }

  /* ===================================================================
     Header: estado "rolado", menu mobile e link ativo
     =================================================================== */
  function initHeader() {
    const header = $('#header');
    const burger = $('#burger');
    const nav = $('#nav');

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.classList.toggle('nav-open', open);
    };
    burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

    // Link ativo conforme a seção visível
    const links = $$('.nav__link');
    const map = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
    // observa TODAS as seções com id: fora das seções do menu, nenhum link fica marcado
    const sections = $$('main section[id]');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            links.forEach((l) => l.classList.remove('is-active'));
            map.get(en.target.id)?.classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach((s) => io.observe(s));
    }
  }

  /* ===================================================================
     Reveal — animações de entrada ao rolar (IntersectionObserver)
     =================================================================== */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach((el) => el.classList.add('is-in'));
      $$('.years').forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
    $$('.years').forEach((el) => io.observe(el));
  }

  /* ===================================================================
     Contadores animados: <span data-count="10">10</span>
     (o HTML já traz o valor final, então sem JS nada quebra)
     =================================================================== */
  function initCounters() {
    const els = $$('[data-count]');
    if (!('IntersectionObserver' in window) || reduceMotion) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        const el = en.target;
        const end = parseInt(el.dataset.count, 10);
        const dur = 1400;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        el.textContent = '0';
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ===================================================================
     Abas de planos (acessíveis: setas, Home/End) + "tabs ink" deslizante
     =================================================================== */
  function initTabs() {
    const wrap = $('.tabs');
    if (!wrap) return;
    const btns = $$('.tabs__btn', wrap);
    const ink = $('.tabs__ink', wrap);

    const moveInk = (btn) => {
      ink.style.width = `${btn.offsetWidth}px`;
      ink.style.transform = `translateX(${btn.offsetLeft}px)`;
    };

    const select = (btn, focus = false) => {
      btns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(b.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !on; panel.classList.toggle('is-active', on); }
      });
      moveInk(btn);
      if (focus) btn.focus();
      // mantém a aba selecionada visível no scroll horizontal (mobile)
      btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    btns.forEach((b, i) => {
      b.addEventListener('click', () => select(b));
      b.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight') n = btns[(i + 1) % btns.length];
        if (e.key === 'ArrowLeft')  n = btns[(i - 1 + btns.length) % btns.length];
        if (e.key === 'Home') n = btns[0];
        if (e.key === 'End')  n = btns[btns.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });

    // Cards de tecnologia (acima das abas) selecionam a aba correspondente
    $$('[data-tab-target]').forEach((card) => {
      card.addEventListener('click', () => {
        const target = $(`.tabs__btn[data-tab="${card.dataset.tabTarget}"]`);
        if (!target) return;
        select(target);
        wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });

    const active = $('.tabs__btn.is-active', wrap) || btns[0];
    requestAnimationFrame(() => moveInk(active));
    window.addEventListener('resize', () => moveInk($('.tabs__btn.is-active', wrap)), { passive: true });
    // As fontes carregam depois: recalcula a posição da tinta quando prontas
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveInk($('.tabs__btn.is-active', wrap)));
  }

  /* ===================================================================
     Cobertura: chips de bairros + verificador de CEP/bairro
     =================================================================== */
  function initCoverage() {
    const list = $('#coverage-list');
    const form = $('#checker');
    const input = $('#checker-input');
    const out = $('#checker-result');
    if (!list || !form) return;

    // Chips (só substitui o placeholder se houver bairros em CONFIG.coverage)
    if (CONFIG.coverage.length) {
      list.innerHTML = CONFIG.coverage.map((b) => `<li>${escapeHtml(b)}</li>`).join('');
    }

    // Máscara de CEP enquanto digita (só quando o texto é numérico)
    input.addEventListener('input', () => {
      const v = input.value;
      if (/^[\d-]+$/.test(v)) {
        const d = v.replace(/\D/g, '').slice(0, 8);
        input.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
      }
    });

    const render = (kind, html) => {
      const icon = kind === 'ok' ? '#i-check' : '#i-signal';
      out.innerHTML = `<div class="result ${kind === 'ok' ? 'result--ok' : ''}"><svg class="i"><use href="${icon}"/></svg><div>${html}</div></div>`;
    };
    const talk = (txt) => `<a href="${waUrl(`Olá! Quero verificar a disponibilidade de internet no endereço: ${txt}`)}" target="_blank" rel="noopener">Confirmar pelo WhatsApp</a>`;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = input.value.trim();
      if (!raw) { render('info', 'Digite seu <strong>CEP</strong> ou <strong>bairro</strong> para consultar.'); input.focus(); return; }

      const safe = escapeHtml(raw);
      const digits = raw.replace(/\D/g, '');
      const isCep = digits.length === 8 && /^[\d-]+$/.test(raw);

      // 1) CEP com prefixos configurados
      if (isCep && CONFIG.cepPrefixes.length) {
        const hit = CONFIG.cepPrefixes.some((p) => digits.startsWith(p));
        return hit
          ? render('ok', `Boa notícia! Parece que atendemos o CEP <strong>${safe}</strong>. ${talk(raw)} e finalize sua assinatura.`)
          : render('info', `Ainda não encontramos o CEP <strong>${safe}</strong> na nossa lista, mas podemos expandir. ${talk(raw)} e consulte a viabilidade.`);
      }
      // 2) Bairro/região na lista configurada
      if (!isCep && CONFIG.coverage.length) {
        const q = norm(raw);
        const hit = CONFIG.coverage.find((b) => norm(b).includes(q) || q.includes(norm(b)));
        return hit
          ? render('ok', `Atendemos <strong>${escapeHtml(hit)}</strong>! ${talk(raw)} e escolha seu plano.`)
          : render('info', `Não encontramos <strong>${safe}</strong> na nossa lista, mas nossa rede cresce todo mês. ${talk(raw)} para checar o seu endereço.`);
      }
      // 3) Lista ainda não preenchida (placeholder): encaminha para o WhatsApp
      render('info', `Vamos conferir a disponibilidade para <strong>${safe}</strong> com nossa equipe. ${talk(raw)}.`);
    });
  }

  /* ===================================================================
     Modo de revisão de placeholders: acrescente ?placeholders à URL
     para destacar em amarelo tudo que ainda precisa ser preenchido.
     =================================================================== */
  function initPlaceholderMode() {
    if (new URLSearchParams(location.search).has('placeholders')) {
      document.documentElement.classList.add('show-placeholders');
    }
  }

  /* ===================================================================
     Inicialização
     =================================================================== */
  initPlaceholderMode();
  initWhatsApp();
  initHeader();
  initTabs();
  initCoverage();
  initPreloader();
})();
