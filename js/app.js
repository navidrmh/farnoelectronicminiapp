// ===================== Telegram WebApp =====================
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // اعمال تم تلگرام اگر موجود باشد
  if (tg.colorScheme === 'dark') {
    document.documentElement.style.setProperty('--bg', '#0B1220');
  }
}

// ===================== State =====================
let cart = JSON.parse(localStorage.getItem('farno_cart') || '[]');
let currentCategory = null;

// ===================== Init =====================
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderTools();
  renderCircuits();
  updateCartBadge();
  showPage('home');
});

// ===================== Navigation =====================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  // Bottom nav
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === pageId);
  });

  if (pageId === 'cart') renderCart();
  if (pageId === 'shop') switchShopTab('parts');

  window.scrollTo(0, 0);
}

// ===================== Shop =====================
function switchShopTab(tab) {
  document.querySelectorAll('.shop-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.shop-content').forEach(c => c.classList.remove('active'));
  const el = document.getElementById('shop-' + tab);
  if (el) el.classList.add('active');
}

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(cat => `
    <div class="category-card" onclick="openCategory('${cat.id}')">
      <div class="cat-icon">${cat.icon}</div>
      <div class="cat-name">${cat.name}</div>
    </div>
  `).join('');
}

function openCategory(catId) {
  currentCategory = CATEGORIES.find(c => c.id === catId);
  if (!currentCategory) return;

  document.getElementById('productsTitle').textContent = currentCategory.name;
  const list = document.getElementById('productsList');
  list.innerHTML = currentCategory.items.map(item => `
    <div class="product-card">
      <div class="product-info">
        <h4>${item}</h4>
        <div class="price placeholder">قیمت به‌زودی</div>
      </div>
      <button class="add-btn" onclick="promptAddToCart('${item.replace(/'/g, "\\'")}')">+</button>
    </div>
  `).join('');

  showPage('products');
}

function filterParts() {
  const q = (document.getElementById('partSearch')?.value || '').trim();
  const grid = document.getElementById('categoriesGrid');
  if (!q) {
    renderCategories();
    return;
  }
  // جستجو در دسته‌ها و آیتم‌ها
  const matched = CATEGORIES.filter(cat =>
    cat.name.includes(q) || cat.items.some(i => i.includes(q))
  );
  grid.innerHTML = matched.map(cat => `
    <div class="category-card" onclick="openCategory('${cat.id}')">
      <div class="cat-icon">${cat.icon}</div>
      <div class="cat-name">${cat.name}</div>
    </div>
  `).join('') || '<p style="color:var(--muted);text-align:center;grid-column:1/-1">موردی پیدا نشد</p>';
}

function promptAddToCart(productName) {
  const value = prompt(`مقدار / مشخصات «${productName}» را وارد کنید:\n\nمثال: ۲۲۰ اهم  یا  ۴۷ میکروفاراد ۲۵ ولت`);
  if (value === null) return;
  const count = prompt('تعداد را وارد کنید:\n\nمثال: ۱۰۰ عدد');
  if (count === null || !count.trim()) return;

  addToCart({
    type: 'part',
    product: productName,
    value: value.trim() || '—',
    count: count.trim()
  });
}

function addCustomToCart() {
  const desc = document.getElementById('customDesc')?.value?.trim();
  const count = document.getElementById('customCount')?.value?.trim();
  if (!desc) return showToast('توضیحات را وارد کنید');
  if (!count) return showToast('تعداد را وارد کنید');

  addToCart({
    type: 'custom',
    product: 'سفارش خاص',
    value: desc,
    count
  });

  document.getElementById('customDesc').value = '';
  document.getElementById('customCount').value = '';
  showToast('به سبد اضافه شد ✅');
}

function addPcbToCart() {
  const title = document.getElementById('pcbTitle')?.value?.trim();
  const size = document.getElementById('pcbSize')?.value?.trim();
  const layers = document.getElementById('pcbLayers')?.value;
  const qty = document.getElementById('pcbQty')?.value?.trim();
  const notes = document.getElementById('pcbNotes')?.value?.trim() || '—';

  if (!title || !size || !layers || !qty) {
    return showToast('لطفاً فیلدهای ضروری را پر کنید');
  }

  addToCart({
    type: 'pcb',
    product: 'طراحی/ساخت PCB',
    value: `${title} | ${size} | ${layers} | ${notes}`,
    count: qty
  });

  ['pcbTitle','pcbSize','pcbLayers','pcbQty','pcbNotes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  showToast('PCB به سبد اضافه شد ✅');
}

// ===================== Cart =====================
function addToCart(item) {
  item.id = Date.now() + Math.random();
  cart.push(item);
  saveCart();
  updateCartBadge();
  showToast('به سبد اضافه شد ✅');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
}

function saveCart() {
  localStorage.setItem('farno_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = cart.length;
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');

  if (!cart.length) {
    container.innerHTML = '';
    empty.style.display = 'block';
    footer.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  footer.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${item.product}</h4>
        <p>${item.value}</p>
        <p>تعداد: ${item.count}</p>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join('');
}

// ===================== Checkout & Submit =====================
function submitOrder() {
  const name = document.getElementById('orderName')?.value?.trim();
  const phone = document.getElementById('orderPhone')?.value?.trim();
  const note = document.getElementById('orderNote')?.value?.trim() || '';

  if (!name) return showToast('نام را وارد کنید');
  if (!phone) return showToast('شماره تماس را وارد کنید');
  if (!cart.length) return showToast('سبد خرید خالی است');

  // ساخت متن سفارش
  let text = `📦 سفارش جدید از مینی‌اپ\n\n`;
  text += `👤 نام: ${name}\n`;
  text += `📱 شماره: ${phone}\n`;
  if (note) text += `📝 توضیحات: ${note}\n`;
  text += `\n━━━━━━━━━━━━\n`;

  cart.forEach((item, i) => {
    text += `\n${i + 1}. ${item.product}\n`;
    text += `   مقدار: ${item.value}\n`;
    text += `   تعداد: ${item.count}\n`;
  });

  // روش ۱: ارسال با sendData (اگر ربات هندلر web_app_data داشته باشد)
  if (tg && tg.sendData) {
    try {
      tg.sendData(JSON.stringify({
        type: 'order',
        name,
        phone,
        note,
        items: cart
      }));
      showToast('سفارش ارسال شد ✅');
      cart = [];
      saveCart();
      updateCartBadge();
      setTimeout(() => {
        if (tg.close) tg.close();
      }, 1200);
      return;
    } catch (e) {
      console.log('sendData failed', e);
    }
  }

  // روش ۲: باز کردن چت پشتیبانی با متن آماده
  const encoded = encodeURIComponent(text);
  const supportUrl = `https://t.me/nvdrl?text=${encoded}`;

  if (tg && tg.openTelegramLink) {
    tg.openTelegramLink(supportUrl);
  } else {
    window.open(supportUrl, '_blank');
  }

  showToast('در حال انتقال به پشتیبانی...');
  cart = [];
  saveCart();
  updateCartBadge();
}

// ===================== Tools =====================
function renderTools() {
  const grid = document.getElementById('toolsGrid');
  if (!grid) return;

  let html = '';
  TOOL_CATEGORIES.forEach(cat => {
    cat.tools.forEach(tool => {
      html += `
        <div class="tool-card" onclick="openTool('${tool.id}', '${tool.name}')">
          <div class="tool-icon">${tool.icon}</div>
          <div class="tool-name">${tool.name}</div>
        </div>
      `;
    });
  });
  grid.innerHTML = html;
}

function openTool(toolId, title) {
  document.getElementById('toolTitle').textContent = title;
  const content = document.getElementById('toolContent');

  const tools = {
    'ohm': renderOhmTool,
    'led-resistor': renderLedResistorTool,
    'voltage-divider': renderVoltageDividerTool,
    'series-parallel-r': renderSeriesParallelR,
    'lc': renderLCTool,
    'reactance-c': renderReactanceC,
    'reactance-l': renderReactanceL,
    'zener': renderZenerTool,
    'buck-boost': renderBuckBoost,
    'timer555': renderTimer555,
    'opamp': renderOpamp,
  };

  if (tools[toolId]) {
    tools[toolId](content);
  } else {
    content.innerHTML = '<p style="color:var(--muted)">این ابزار به زودی اضافه می‌شود.</p>';
  }

  showPage('tool');
}

// ---- Tool Renderers ----
function renderOhmTool(el) {
  el.innerHTML = `
    <label>ولتاژ (V)</label>
    <input type="number" id="ohm-v" placeholder="مثال: ۱۲" step="any" />
    <label>جریان (A)</label>
    <input type="number" id="ohm-i" placeholder="مثال: ۰.۵" step="any" />
    <label>مقاومت (Ω) — اگر خالی باشد محاسبه می‌شود</label>
    <input type="number" id="ohm-r" placeholder="اختیاری" step="any" />
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcOhm()">محاسبه</button>
    <div class="tool-result" id="ohm-result" style="display:none"></div>
  `;
}

function calcOhm() {
  const v = parseFloat(document.getElementById('ohm-v').value);
  const i = parseFloat(document.getElementById('ohm-i').value);
  const r = parseFloat(document.getElementById('ohm-r').value);
  const res = document.getElementById('ohm-result');

  let html = '';
  if (!isNaN(v) && !isNaN(i)) {
    html += `<div class="result-label">مقاومت</div><div class="result-value">${formatR(v / i)}</div>`;
    html += `<div class="result-label" style="margin-top:12px">توان</div><div class="result-value">${(v * i).toFixed(3)} W</div>`;
  } else if (!isNaN(v) && !isNaN(r)) {
    html += `<div class="result-label">جریان</div><div class="result-value">${(v / r).toFixed(4)} A</div>`;
  } else if (!isNaN(i) && !isNaN(r)) {
    html += `<div class="result-label">ولتاژ</div><div class="result-value">${(i * r).toFixed(3)} V</div>`;
  } else {
    return showToast('حداقل دو مقدار وارد کنید');
  }
  res.innerHTML = html;
  res.style.display = 'block';
}

function renderLedResistorTool(el) {
  el.innerHTML = `
    <label>ولتاژ منبع (V)</label>
    <input type="number" id="led-vs" placeholder="مثال: ۵" step="any" />
    <label>ولتاژ افت LED (V)</label>
    <input type="number" id="led-vf" placeholder="مثال: ۲" step="any" />
    <label>جریان مطلوب (mA)</label>
    <input type="number" id="led-ma" placeholder="مثال: ۲۰" step="any" />
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcLedR()">محاسبه</button>
    <div class="tool-result" id="led-result" style="display:none"></div>
  `;
}

function calcLedR() {
  const vs = parseFloat(document.getElementById('led-vs').value);
  const vf = parseFloat(document.getElementById('led-vf').value);
  const ma = parseFloat(document.getElementById('led-ma').value);
  if ([vs, vf, ma].some(isNaN) || vf >= vs) return showToast('مقادیر نامعتبر');

  const r = (vs - vf) / (ma / 1000);
  const p = (vs - vf) * (ma / 1000);
  const res = document.getElementById('led-result');
  res.innerHTML = `
    <div class="result-label">مقاومت لازم</div>
    <div class="result-value">${formatR(r)}</div>
    <div class="result-label" style="margin-top:12px">توان تقریبی</div>
    <div class="result-value">${p.toFixed(3)} W</div>
  `;
  res.style.display = 'block';
}

function renderVoltageDividerTool(el) {
  el.innerHTML = `
    <label>ولتاژ ورودی Vin (V)</label>
    <input type="number" id="vd-vin" placeholder="مثال: ۱۲" step="any" />
    <label>مقاومت R1 (Ω)</label>
    <input type="number" id="vd-r1" placeholder="مثال: ۱۰۰۰۰" step="any" />
    <label>مقاومت R2 (Ω)</label>
    <input type="number" id="vd-r2" placeholder="مثال: ۱۰۰۰۰" step="any" />
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcVD()">محاسبه</button>
    <div class="tool-result" id="vd-result" style="display:none"></div>
  `;
}

function calcVD() {
  const vin = parseFloat(document.getElementById('vd-vin').value);
  const r1 = parseFloat(document.getElementById('vd-r1').value);
  const r2 = parseFloat(document.getElementById('vd-r2').value);
  if ([vin, r1, r2].some(isNaN)) return showToast('مقادیر را وارد کنید');
  const vout = vin * r2 / (r1 + r2);
  const res = document.getElementById('vd-result');
  res.innerHTML = `
    <div class="result-label">ولتاژ خروجی</div>
    <div class="result-value">${vout.toFixed(3)} V</div>
  `;
  res.style.display = 'block';
}

function renderSeriesParallelR(el) {
  el.innerHTML = `
    <label>مقاومت‌ها را با کاما جدا کنید (Ω)</label>
    <input type="text" id="sp-values" placeholder="مثال: 1000, 2200, 4700" />
    <label>حالت</label>
    <select id="sp-mode">
      <option value="series">سری</option>
      <option value="parallel">موازی</option>
    </select>
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcSP()">محاسبه</button>
    <div class="tool-result" id="sp-result" style="display:none"></div>
  `;
}

function calcSP() {
  const raw = document.getElementById('sp-values').value;
  const mode = document.getElementById('sp-mode').value;
  const values = raw.split(/[,،\s]+/).map(Number).filter(n => !isNaN(n) && n > 0);
  if (values.length < 2) return showToast('حداقل دو مقدار وارد کنید');

  let total;
  if (mode === 'series') {
    total = values.reduce((a, b) => a + b, 0);
  } else {
    total = 1 / values.reduce((a, b) => a + 1 / b, 0);
  }
  const res = document.getElementById('sp-result');
  res.innerHTML = `
    <div class="result-label">مقاومت معادل</div>
    <div class="result-value">${formatR(total)}</div>
  `;
  res.style.display = 'block';
}

function renderLCTool(el) {
  el.innerHTML = `
    <label>سلف (µH)</label>
    <input type="number" id="lc-l" placeholder="مثال: ۲۲۰" step="any" />
    <label>خازن (pF)</label>
    <input type="number" id="lc-c" placeholder="مثال: ۱۰۰" step="any" />
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcLC()">محاسبه</button>
    <div class="tool-result" id="lc-result" style="display:none"></div>
  `;
}

function calcLC() {
  const L = parseFloat(document.getElementById('lc-l').value) * 1e-6;
  const C = parseFloat(document.getElementById('lc-c').value) * 1e-12;
  if (isNaN(L) || isNaN(C) || L <= 0 || C <= 0) return showToast('مقادیر نامعتبر');
  const f = 1 / (2 * Math.PI * Math.sqrt(L * C));
  let text;
  if (f >= 1e6) text = (f / 1e6).toFixed(3) + ' MHz';
  else if (f >= 1e3) text = (f / 1e3).toFixed(3) + ' kHz';
  else text = f.toFixed(2) + ' Hz';

  const res = document.getElementById('lc-result');
  res.innerHTML = `<div class="result-label">فرکانس تشدید</div><div class="result-value">${text}</div>`;
  res.style.display = 'block';
}

function renderReactanceC(el) {
  el.innerHTML = `
    <label>فرکانس (Hz)</label>
    <input type="number" id="xc-f" placeholder="مثال: ۱۰۰۰" step="any" />
    <label>خازن (µF)</label>
    <input type="number" id="xc-c" placeholder="مثال: ۱۰" step="any" />
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcXc()">محاسبه</button>
    <div class="tool-result" id="xc-result" style="display:none"></div>
  `;
}

function calcXc() {
  const f = parseFloat(document.getElementById('xc-f').value);
  const C = parseFloat(document.getElementById('xc-c').value) * 1e-6;
  if (isNaN(f) || isNaN(C) || f <= 0 || C <= 0) return showToast('مقادیر نامعتبر');
  const xc = 1 / (2 * Math.PI * f * C);
  document.getElementById('xc-result').innerHTML = `
    <div class="result-label">راکتانس خازنی (Xc)</div>
    <div class="result-value">${formatR(xc)}</div>
  `;
  document.getElementById('xc-result').style.display = 'block';
}

function renderReactanceL(el) {
  el.innerHTML = `
    <label>فرکانس (Hz)</label>
    <input type="number" id="xl-f" placeholder="مثال: ۱۰۰۰" step="any" />
    <label>سلف (mH)</label>
    <input type="number" id="xl-l" placeholder="مثال: ۱۰" step="any" />
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcXl()">محاسبه</button>
    <div class="tool-result" id="xl-result" style="display:none"></div>
  `;
}

function calcXl() {
  const f = parseFloat(document.getElementById('xl-f').value);
  const L = parseFloat(document.getElementById('xl-l').value) * 1e-3;
  if (isNaN(f) || isNaN(L) || f <= 0 || L <= 0) return showToast('مقادیر نامعتبر');
  const xl = 2 * Math.PI * f * L;
  document.getElementById('xl-result').innerHTML = `
    <div class="result-label">راکتانس سلفی (XL)</div>
    <div class="result-value">${formatR(xl)}</div>
  `;
  document.getElementById('xl-result').style.display = 'block';
}

function renderZenerTool(el) {
  el.innerHTML = `
    <label>ولتاژ ورودی Vin (V)</label>
    <input type="number" id="zn-vin" placeholder="مثال: ۱۲" step="any" />
    <label>ولتاژ زنر Vz (V)</label>
    <input type="number" id="zn-vz" placeholder="مثال: ۵.۱" step="any" />
    <label>جریان (mA)</label>
    <input type="number" id="zn-iz" placeholder="مثال: ۲۰" step="any" />
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcZener()">محاسبه</button>
    <div class="tool-result" id="zn-result" style="display:none"></div>
  `;
}

function calcZener() {
  const vin = parseFloat(document.getElementById('zn-vin').value);
  const vz = parseFloat(document.getElementById('zn-vz').value);
  const iz = parseFloat(document.getElementById('zn-iz').value) / 1000;
  if ([vin, vz, iz].some(isNaN) || vz >= vin) return showToast('مقادیر نامعتبر');
  const rs = (vin - vz) / iz;
  document.getElementById('zn-result').innerHTML = `
    <div class="result-label">مقاومت سری (Rs)</div>
    <div class="result-value">${formatR(rs)}</div>
  `;
  document.getElementById('zn-result').style.display = 'block';
}

function renderBuckBoost(el) {
  el.innerHTML = `
    <label>نوع</label>
    <select id="bb-mode">
      <option value="buck">Buck (کاهنده)</option>
      <option value="boost">Boost (افزاینده)</option>
    </select>
    <label>Vin (V)</label>
    <input type="number" id="bb-vin" placeholder="مثال: ۱۲" step="any" />
    <label>Vout (V)</label>
    <input type="number" id="bb-vout" placeholder="مثال: ۵" step="any" />
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcBB()">محاسبه</button>
    <div class="tool-result" id="bb-result" style="display:none"></div>
  `;
}

function calcBB() {
  const mode = document.getElementById('bb-mode').value;
  const vin = parseFloat(document.getElementById('bb-vin').value);
  const vout = parseFloat(document.getElementById('bb-vout').value);
  if (isNaN(vin) || isNaN(vout) || vin <= 0 || vout <= 0) return showToast('مقادیر نامعتبر');

  let duty;
  if (mode === 'buck') {
    if (vout >= vin) return showToast('در Buck باید Vout < Vin باشد');
    duty = (vout / vin) * 100;
  } else {
    if (vout <= vin) return showToast('در Boost باید Vout > Vin باشد');
    duty = (1 - vin / vout) * 100;
  }
  document.getElementById('bb-result').innerHTML = `
    <div class="result-label">Duty Cycle</div>
    <div class="result-value">${duty.toFixed(1)} %</div>
  `;
  document.getElementById('bb-result').style.display = 'block';
}

function renderTimer555(el) {
  el.innerHTML = `
    <label>حالت</label>
    <select id="t555-mode" onchange="toggle555Fields()">
      <option value="astable">Astable</option>
      <option value="mono">Monostable</option>
    </select>
    <div id="t555-fields"></div>
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calc555()">محاسبه</button>
    <div class="tool-result" id="t555-result" style="display:none"></div>
  `;
  toggle555Fields();
}

function toggle555Fields() {
  const mode = document.getElementById('t555-mode').value;
  const box = document.getElementById('t555-fields');
  if (mode === 'astable') {
    box.innerHTML = `
      <label>R1 (Ω)</label><input type="number" id="t555-r1" placeholder="10000" step="any" />
      <label>R2 (Ω)</label><input type="number" id="t555-r2" placeholder="100000" step="any" />
      <label>C (µF)</label><input type="number" id="t555-c" placeholder="0.1" step="any" />
    `;
  } else {
    box.innerHTML = `
      <label>R (Ω)</label><input type="number" id="t555-r" placeholder="10000" step="any" />
      <label>C (µF)</label><input type="number" id="t555-c" placeholder="0.1" step="any" />
    `;
  }
}

function calc555() {
  const mode = document.getElementById('t555-mode').value;
  const res = document.getElementById('t555-result');

  if (mode === 'astable') {
    const r1 = parseFloat(document.getElementById('t555-r1').value);
    const r2 = parseFloat(document.getElementById('t555-r2').value);
    const c = parseFloat(document.getElementById('t555-c').value) * 1e-6;
    if ([r1, r2, c].some(isNaN)) return showToast('مقادیر را وارد کنید');
    const freq = 1.44 / ((r1 + 2 * r2) * c);
    const duty = ((r1 + r2) / (r1 + 2 * r2)) * 100;
    res.innerHTML = `
      <div class="result-label">فرکانس</div>
      <div class="result-value">${freq >= 1000 ? (freq/1000).toFixed(2) + ' kHz' : freq.toFixed(2) + ' Hz'}</div>
      <div class="result-label" style="margin-top:12px">Duty Cycle</div>
      <div class="result-value">${duty.toFixed(1)} %</div>
    `;
  } else {
    const r = parseFloat(document.getElementById('t555-r').value);
    const c = parseFloat(document.getElementById('t555-c').value) * 1e-6;
    if ([r, c].some(isNaN)) return showToast('مقادیر را وارد کنید');
    const pulse = 1.1 * r * c;
    res.innerHTML = `
      <div class="result-label">عرض پالس</div>
      <div class="result-value">${pulse >= 1 ? pulse.toFixed(3) + ' s' : (pulse * 1000).toFixed(2) + ' ms'}</div>
    `;
  }
  res.style.display = 'block';
}

function renderOpamp(el) {
  el.innerHTML = `
    <label>حالت</label>
    <select id="op-mode">
      <option value="inv">اینورتینگ</option>
      <option value="noninv">نان‌اینورتینگ</option>
    </select>
    <label>R1 / Rin (Ω)</label>
    <input type="number" id="op-r1" placeholder="1000" step="any" />
    <label>Rf (Ω)</label>
    <input type="number" id="op-rf" placeholder="10000" step="any" />
    <button class="btn-primary btn-block" style="margin-top:16px" onclick="calcOpamp()">محاسبه</button>
    <div class="tool-result" id="op-result" style="display:none"></div>
  `;
}

function calcOpamp() {
  const mode = document.getElementById('op-mode').value;
  const r1 = parseFloat(document.getElementById('op-r1').value);
  const rf = parseFloat(document.getElementById('op-rf').value);
  if ([r1, rf].some(isNaN) || r1 <= 0) return showToast('مقادیر نامعتبر');
  const gain = mode === 'inv' ? -rf / r1 : 1 + rf / r1;
  document.getElementById('op-result').innerHTML = `
    <div class="result-label">گین ولتاژ (Av)</div>
    <div class="result-value">${gain.toFixed(3)}</div>
  `;
  document.getElementById('op-result').style.display = 'block';
}

// ===================== Circuits =====================
function renderCircuits() {
  const list = document.getElementById('circuitsList');
  if (!list) return;
  list.innerHTML = CIRCUITS.map(c => `
    <div class="circuit-card" onclick="openCircuit('${c.id}')">
      <img src="${c.image}" alt="${c.title}" onerror="this.style.display='none'" />
      <div class="circuit-info">
        <h4>${c.title}</h4>
        <p>${c.short}</p>
      </div>
    </div>
  `).join('');
}

function openCircuit(id) {
  const c = CIRCUITS.find(x => x.id === id);
  if (!c) return;
  document.getElementById('circuitTitle').textContent = c.title;
  document.getElementById('circuitContent').innerHTML = `
    <img src="${c.image}" alt="${c.title}" onerror="this.src=''; this.style.background='var(--card2)'; this.style.height='180px';" />
    <div class="circuit-desc">${c.description}</div>
  `;
  showPage('circuit');
}

// ===================== Helpers =====================
function formatR(ohm) {
  if (ohm >= 1e6) return (ohm / 1e6).toFixed(2) + ' MΩ';
  if (ohm >= 1e3) return (ohm / 1e3).toFixed(2) + ' kΩ';
  if (ohm >= 1) return ohm.toFixed(1) + ' Ω';
  return (ohm * 1000).toFixed(1) + ' mΩ';
}

function openChannel() {
  const url = 'https://t.me/FarnoElectronic';
  if (tg && tg.openTelegramLink) tg.openTelegramLink(url);
  else window.open(url, '_blank');
}

function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
