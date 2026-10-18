/* =====================================================================
   INTERAÇÕES – Churrascaria Obodão
   Índice: 0 Configuração · 1 WhatsApp · 2 Cabeçalho/parallax · 3 Menu celular
           4 Link ativo · 5 Abas · 6 Revelar ao rolar · 7 Lightbox
           8 Brasas (faíscas) · 9 Formulário de reserva · 10 Ano
   ===================================================================== */

/* ---------- 0. CONFIGURAÇÃO: troque o número aqui (55 + DDD + número) ---------- */
const WHATSAPP = "5581999999999";

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const reduzirMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. WHATSAPP: todo link com data-whats vira link do número acima ---------- */
$$("[data-whats]").forEach(a => {
  a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.whats)}`;
});

/* ---------- 2. CABEÇALHO ganha fundo ao rolar + PARALLAX da foto do hero ---------- */
const topo = $("#topo");
const heroFundo = $(".hero__fundo");
let ticking = false;
function aoRolar() {
  topo.classList.toggle("rolou", scrollY > 40);
  if (!reduzirMovimento && scrollY < innerHeight) {
    heroFundo.style.setProperty("--py", `${scrollY * 0.25}px`); // foto sobe mais devagar que a página
  }
  ticking = false;
}
addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(aoRolar); ticking = true; } // limita a 1x por quadro (leve)
}, { passive: true });
aoRolar();

/* ---------- 3. MENU DO CELULAR (hambúrguer) ---------- */
const burger = $("#burger"), menu = $("#menu");
function alternarMenu(abrir) {
  menu.classList.toggle("aberto", abrir);
  burger.setAttribute("aria-expanded", abrir);
  burger.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  document.body.style.overflow = abrir ? "hidden" : ""; // trava a rolagem com menu aberto
}
burger.addEventListener("click", () => alternarMenu(!menu.classList.contains("aberto")));
$$("a", menu).forEach(a => a.addEventListener("click", () => alternarMenu(false))); // fecha ao escolher
addEventListener("keydown", e => { if (e.key === "Escape") alternarMenu(false); });

/* ---------- 4. LINK ATIVO: destaca no menu a seção que está na tela ---------- */
const links = $$(".menu a[href^='#']:not(.botao)");
const secoes = links.map(l => $(l.getAttribute("href"))).filter(Boolean);
const obsSecao = new IntersectionObserver(entradas => {
  entradas.forEach(en => {
    if (en.isIntersecting) {
      links.forEach(l => l.classList.toggle("atual", l.getAttribute("href") === "#" + en.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" }); // considera a faixa do meio da tela
secoes.forEach(s => obsSecao.observe(s));

/* ---------- 5. ABAS DO CARDÁPIO ---------- */
const abas = $$(".aba"), paineis = $$(".painel");
function abrirAba(id) {
  abas.forEach(a => {
    const ativa = a.dataset.aba === id;
    a.classList.toggle("ativa", ativa);
    a.setAttribute("aria-selected", ativa);
  });
  paineis.forEach(p => {
    const ativo = p.id === id;
    p.hidden = !ativo;
    p.classList.toggle("ativo", ativo);
  });
}
abas.forEach(a => a.addEventListener("click", () => abrirAba(a.dataset.aba)));
// Os 3 cards de atalho abrem a aba certa antes de rolar até o cardápio
$$("[data-aba-link]").forEach(l => l.addEventListener("click", () => abrirAba(l.dataset.abaLink)));

/* ---------- 6. REVELAR AO ROLAR (só galeria e caixas, uma vez) ---------- */
const alvos = $$(".foto, .caixa, .precos-grandes div, .atalhos a");
alvos.forEach((el, i) => { el.classList.add("revelar"); el.style.setProperty("--i", i % 4); }); // atraso escalonado
const obsRevelar = new IntersectionObserver((entradas, obs) => {
  entradas.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visivel"); obs.unobserve(en.target); } });
}, { threshold: 0.15 });
alvos.forEach(el => obsRevelar.observe(el));

/* ---------- 7. LIGHTBOX da galeria (setas do teclado funcionam) ---------- */
const fotos = $$(".foto img");
const lb = $("#lightbox"), lbImg = $("#lightbox-img");
let atual = 0;
function mostrar(i) {
  atual = (i + fotos.length) % fotos.length; // dá a volta no fim da lista
  lbImg.src = fotos[atual].src;
  lbImg.alt = fotos[atual].alt;
}
$$(".foto").forEach((b, i) => b.addEventListener("click", () => { mostrar(i); lb.showModal(); }));
$(".lightbox__fechar").addEventListener("click", () => lb.close());
$(".lightbox__ant").addEventListener("click", () => mostrar(atual - 1));
$(".lightbox__prox").addEventListener("click", () => mostrar(atual + 1));
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); }); // clicar no fundo fecha
lb.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") mostrar(atual - 1);
  if (e.key === "ArrowRight") mostrar(atual + 1);
});

/* ---------- 8. BRASAS: faíscas subindo no hero (canvas) ---------- */
const cv = $("#brasas");
if (cv && !reduzirMovimento) {
  const ctx = cv.getContext("2d");
  let L, A, faiscas = [], rodando = true;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function medir() {
    L = cv.clientWidth; A = cv.clientHeight;
    cv.width = L * dpr; cv.height = A * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const nova = (inicio) => ({
    x: Math.random() * L,
    y: inicio ? Math.random() * A : A + 10,   // no começo espalha, depois nascem embaixo
    r: Math.random() * 2.2 + 0.6,             // tamanho
    v: Math.random() * 0.9 + 0.4,             // velocidade de subida
    o: Math.random() * Math.PI * 2,           // fase do balanço
    vida: Math.random() * 0.6 + 0.4
  });
  function iniciar() {
    medir();
    faiscas = Array.from({ length: innerWidth < 700 ? 25 : 60 }, () => nova(true));
  }
  function desenhar() {
    if (rodando) {
      ctx.clearRect(0, 0, L, A);
      faiscas.forEach((f, i) => {
        f.y -= f.v;
        f.o += 0.02;
        f.x += Math.sin(f.o) * 0.5;           // balança de lado
        const alt = f.y / A;                  // 1 embaixo, 0 em cima
        if (f.y < -10) faiscas[i] = nova(false);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${120 + alt * 80 | 0}, 30, ${alt * f.vida})`; // esfria e some subindo
        ctx.shadowColor = "#ff8a00"; ctx.shadowBlur = 8;
        ctx.fill();
      });
    }
    requestAnimationFrame(desenhar);
  }
  iniciar(); desenhar();
  addEventListener("resize", iniciar);
  // Pausa quando o hero sai da tela (economiza bateria)
  new IntersectionObserver(([en]) => { rodando = en.isIntersecting; }).observe(cv);
}

/* ---------- 9. FORMULÁRIO DE RESERVA: monta a mensagem e abre o WhatsApp ---------- */
const form = $("#form-reserva");
if (form) {
  // Impede escolher data no passado
  form.data.min = new Date().toISOString().split("T")[0];
  form.addEventListener("submit", e => {
    e.preventDefault();
    const [ano, mes, dia] = form.data.value.split("-");
    const msg = `Olá! Quero reservar uma mesa.\nNome: ${form.nome.value}\nData: ${dia}/${mes}/${ano}\nHorário: ${form.hora.value}\nPessoas: ${form.pessoas.value}`;
    open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });
}

/* ---------- 10. ANO AUTOMÁTICO NO RODAPÉ ---------- */
$("#ano").textContent = new Date().getFullYear();
