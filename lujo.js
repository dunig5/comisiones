/* Tienda de lujo · gomitas artesanales. Configura TIENDA en cada página. */
// Todas las compras se hacen por mensaje directo (DM) de TikTok.
const TIKTOK = 'https://www.tiktok.com/@delossantospro';

const $ = s => document.querySelector(s);
const money = n => '$' + Number(n).toFixed(2).replace('.', ',').replace(',00', '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY = 'lujo_cart_' + TIENDA.id;
let cart = JSON.parse(sessionStorage.getItem(KEY) || '{}');
const QS = new URLSearchParams(location.search);
const refQ = QS.get('ref');
if (refQ) localStorage.setItem('lujo_ref', refQ.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
const REF = localStorage.getItem('lujo_ref') || '';
const save = () => sessionStorage.setItem(KEY, JSON.stringify(cart));

function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2600); }

function pintar() {
  $('#prods').innerHTML = TIENDA.productos.map(p => `<div class="pc reveal">
    ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}
    <div class="ph"><img src="${p.img}" alt="${esc(p.n)}" loading="lazy"></div>
    <div class="bd"><h3>${esc(p.n)}</h3><small>${esc(p.d)}</small>
    <div class="pr gtxt">${money(p.p)}</div>${p.extra ? `<small class="gana">${esc(p.extra)}</small>` : ''}
    ${cart[p.id] ? `<div class="qty"><button onclick="q('${p.id}',-1)">−</button><b>${cart[p.id]}</b><button onclick="q('${p.id}',1)">+</button></div>`
      : `<button class="btn sm full" onclick="q('${p.id}',1)">Agregar</button>`}</div></div>`).join('');
  const c = Object.values(cart).reduce((a, b) => a + b, 0);
  $('#cCart').textContent = c || '';
  observar();
}
function q(id, d) {
  cart[id] = Math.max(0, Math.min(99, (cart[id] || 0) + d)); if (!cart[id]) delete cart[id];
  save(); pintar();
  if (d > 0) { const f = $('#fCart'); f.classList.remove('ring'); void f.offsetWidth; f.classList.add('ring'); }
  if ($('#dCart').classList.contains('open')) abrirCarrito();
}
const items = () => Object.entries(cart).map(([id, n]) => { const p = TIENDA.productos.find(x => x.id === id); return p ? { ...p, q: n } : null; }).filter(Boolean);
function abrirCarrito() {
  const it = items(), tot = it.reduce((s, i) => s + i.p * i.q, 0);
  $('#cartBody').innerHTML = it.length ? it.map(i => `<div class="li"><img src="${i.img}" alt=""><div><b>${esc(i.n)}</b><br><span class="mut">${i.q} × ${money(i.p)}</span></div>
    <div class="qty" style="flex:0 0 auto;gap:6px"><button onclick="q('${i.id}',-1)">−</button><b>${i.q}</b><button onclick="q('${i.id}',1)">+</button></div></div>`).join('') +
    `<div class="tot"><span>Total</span><span class="gtxt">${money(tot)}</span></div>
    <label>Nombre</label><input id="cN" maxlength="60" placeholder="Tu nombre" value="${esc(localStorage.getItem('lujo_nom') || '')}">
    <label>Sector o dirección</label><input id="cD" maxlength="160" placeholder="Sector, calle, referencia" value="${esc(localStorage.getItem('lujo_dir') || '')}">
    <label>Código del vendedor (opcional)</label><input id="cR" maxlength="12" placeholder="Ej. ANA01" value="${esc(REF)}" style="text-transform:uppercase">
    <button class="btn full" onclick="pedir()">Pedir por DM de TikTok · ${money(tot)}</button>
    <p class="mut" style="margin-top:10px;text-align:center">Copiamos tu pedido y abrimos mi TikTok: toca Mensaje y pégalo en el DM.</p>`
    : '<p class="mut" style="text-align:center;padding:40px 0">Tu carrito está vacío 🍬</p>';
  $('#dCart').classList.add('open');
}
function cerrar() { document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open')); }
async function pedir() {
  const nom = $('#cN').value.trim(), dir = $('#cD').value.trim(), ref = $('#cR').value.trim().toUpperCase();
  if (!nom || !dir) return toast('Escribe tu nombre y sector');
  localStorage.setItem('lujo_nom', nom); localStorage.setItem('lujo_dir', dir);
  const it = items(), tot = it.reduce((s, i) => s + i.p * i.q, 0);
  const txt = `Hola David, quiero hacer un pedido (${TIENDA.tipo}):\n` + it.map(i => `• ${i.q} × ${i.n} (${money(i.p)})`).join('\n') +
    `\nTotal: ${money(tot)}\nNombre: ${nom}\nSector: ${dir}` + (ref ? `\nVendedor: ${ref}` : '');
  try { await navigator.clipboard.writeText(txt); toast('¡Pedido copiado! Pégalo en mi DM de TikTok 🎉'); } catch (e) { prompt('Copia tu pedido:', txt); }
  setTimeout(() => window.open(TIKTOK, '_blank'), 900);
}

/* efectos */
function observar() {
  const io = window._io || (window._io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .12 }));
  document.querySelectorAll('.reveal:not(.on)').forEach(el => io.observe(el));
}
function marquee() {
  const ims = TIENDA.productos.map(p => `<img src="${p.img}" alt="" loading="lazy">`).join('');
  $('#mq').innerHTML = ims + ims + ims + ims;
}
function chispas() {
  const c = $('#sparks'); if (!c) return; const x = c.getContext('2d'); let W, H, ps = [];
  const rs = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; }; rs(); addEventListener('resize', rs);
  for (let i = 0; i < 60; i++) ps.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + .5, v: Math.random() * .0015 + .0005, a: Math.random() * 6 });
  (function f() { x.clearRect(0, 0, W, H); ps.forEach(p => { p.y -= p.v; p.a += .03; if (p.y < 0) { p.y = 1; p.x = Math.random(); }
    x.globalAlpha = .4 + Math.sin(p.a) * .4; x.fillStyle = '#ffd23f'; x.shadowColor = '#ffd23f'; x.shadowBlur = 8;
    x.beginPath(); x.arc(p.x * W, p.y * H, p.r, 0, 7); x.fill(); }); requestAnimationFrame(f); })();
}
addEventListener('scroll', () => $('#nav').classList.toggle('solid', scrollY > 40));
document.addEventListener('DOMContentLoaded', () => {
  if (REF && $('#refTxt')) $('#refTxt').textContent = 'Te atiende el vendedor ' + REF + ' · toca “Agregar”';
  marquee(); pintar(); chispas(); observar();
});
