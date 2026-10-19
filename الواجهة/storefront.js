(() => {
  const defaults = {
    brandName: 'Khadija Rose House',
    heroTitle: 'الورد الذي لا يذبل',
    heroDescription: 'بوكيهات ساتان مصنوعة يدوياً لتبقى ذكرى جميلة في كل مناسبة.',
    heroImage: 'https://images.pexels.com/photos/9430356/pexels-photo-9430356.jpeg?auto=compress&cs=tinysrgb&w=1200',
    story: 'نصمم كل باقة يدوياً بحب، ونختار ألوانها وتفاصيلها لتناسب أجمل لحظاتك.',
    location: 'صنع بحب في تارودانت',
    instagram: '',
    whatsappPhone: '',
    storeOpen: true,
    prices: { basePrice: 150, extraPrice: 12, card: 15, box: 25, led: 20 },
    products: [
      { id: 'p1', name: 'همسة ورد', color: 'وردي', size: 'صغير', price: 120, description: 'لمسة وردية ناعمة للمناسبات الصغيرة.', image: 'https://images.pexels.com/photos/8879818/pexels-photo-8879818.jpeg?auto=compress&cs=tinysrgb&w=800', visible: true },
      { id: 'p2', name: 'شغف أحمر', color: 'أحمر', size: 'متوسط', price: 190, description: 'باقة دافئة تعبّر عن مشاعر كبيرة.', image: 'https://images.pexels.com/photos/34730769/pexels-photo-34730769.jpeg?auto=compress&cs=tinysrgb&w=800', visible: true },
      { id: 'p3', name: 'نقاء', color: 'أبيض', size: 'متوسط', price: 175, description: 'ورود بيضاء بتفاصيل هادئة وأنيقة.', image: 'https://images.pexels.com/photos/36230878/pexels-photo-36230878.jpeg?auto=compress&cs=tinysrgb&w=800', visible: true },
      { id: 'p4', name: 'حديقة الأحلام', color: 'متعدد', size: 'كبير', price: 290, description: 'تناغم ألوان يصنع لحظة لا تُنسى.', image: 'https://images.pexels.com/photos/32223896/pexels-photo-32223896.jpeg?auto=compress&cs=tinysrgb&w=800', visible: true },
      { id: 'p5', name: 'علبة المحبة', color: 'أحمر', size: 'كبير', price: 320, description: 'ترتيب فاخر مستوحى من هدايا القلب.', image: 'https://images.pexels.com/photos/28973772/pexels-photo-28973772.jpeg?auto=compress&cs=tinysrgb&w=800', visible: true },
      { id: 'p6', name: 'صباح وردي', color: 'وردي', size: 'متوسط', price: 165, description: 'بهجة رقيقة لبداية يوم مختلف.', image: 'https://images.pexels.com/photos/36117537/pexels-photo-36117537.jpeg?auto=compress&cs=tinysrgb&w=800', visible: true }
    ],
    colors: [
    { name: 'وردي', hex: '#e87a90', image: 'https://images.pexels.com/photos/8879818/pexels-photo-8879818.jpeg?auto=compress&cs=tinysrgb&w=500', active: true },
    { name: 'أحمر', hex: '#b83b54', image: 'https://images.pexels.com/photos/34730769/pexels-photo-34730769.jpeg?auto=compress&cs=tinysrgb&w=500', active: true },
    { name: 'أبيض', hex: '#f2e8df', image: 'https://images.pexels.com/photos/36230878/pexels-photo-36230878.jpeg?auto=compress&cs=tinysrgb&w=500', active: true },
    { name: 'متعدد', hex: '#c278a2', image: 'https://images.pexels.com/photos/32223896/pexels-photo-32223896.jpeg?auto=compress&cs=tinysrgb&w=500', active: true }
    ],
    papers: Array.from({ length: 19 }, (_, index) => ({
    name: `ورق تغليف ${index + 1}`,
    image: `assets/options/papers/paper-${String(index + 1).padStart(2, '0')}.avif`,
    active: true
    })),
    ribbons: Array.from({ length: 9 }, (_, index) => ({
    name: `شريط ستان ${index + 1}`,
    image: `assets/options/ribbons/ribbon-${String(index + 1).padStart(2, '0')}.jpeg`,
    active: true
    })),
    addonImages: {
    card: 'https://images.pexels.com/photos/1666065/pexels-photo-1666065.jpeg?auto=compress&cs=tinysrgb&w=500',
    box: 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=500',
    led: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=500'
    }
  };
  const cartKey = 'krh-shopping-cart-v2';
  const $ = id => document.getElementById(id);
  const money = amount => `${Number(amount || 0).toLocaleString('fr-MA')} DH`;
  const clone = value => JSON.parse(JSON.stringify(value));
  let store = clone(defaults);
  let cart = [];
  let builderStep = 1;
  let selectedColor = '';
  let selectedPaper = '';
  let selectedRibbon = '';
  let whatsappWindow = null;
  let connected = false;

  function toast(message) {
    const element = $('toast');
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { element.hidden = true; }, 3600);
  }

  function imageUrl(value, fallback = '') {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    try {
      const parsed = new URL(value, window.location.href);
      return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : fallback;
    } catch {
      return fallback;
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch (error) {
      console.error('Could not persist shopping cart:', error);
      toast('تعذر حفظ السلة على هذا الجهاز.');
    }
  }

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(cartKey) || '[]');
      cart = Array.isArray(saved) ? saved.filter(item =>
        item && typeof item.id === 'string' && Number.isInteger(item.qty) && item.qty > 0 &&
        Number.isFinite(item.price) && typeof item.name === 'string'
      ) : [];
    } catch (error) {
      console.error('Could not read saved shopping cart:', error);
      cart = [];
    }
  }

  async function loadStore() {
    if (!window.krhSupabase) {
      renderStore();
      return;
    }
    const { data, error } = await window.krhSupabase
      .from('store_settings')
      .select('settings')
      .eq('id', 1)
      .single();
    if (error) {
      console.error('Could not load storefront settings:', error);
      renderStore();
      return;
    }

    const saved = data.settings || {};
    store = {
      ...clone(defaults),
      ...saved,
      prices: { ...defaults.prices, ...(saved.prices || {}) },
      products: Array.isArray(saved.products) ? saved.products : clone(defaults.products),
      colors: Array.isArray(saved.colors) ? saved.colors : clone(defaults.colors),
      papers: Array.isArray(saved.papers) ? saved.papers : clone(defaults.papers),
      ribbons: Array.isArray(saved.ribbons) ? saved.ribbons : clone(defaults.ribbons),
      addonImages: { ...defaults.addonImages, ...(saved.addonImages || {}) }
    };
    for (const key of ['colors', 'papers', 'ribbons']) {
      store[key] = store[key].map((option, index) => ({
        ...option,
        image: option.image || defaults[key][index]?.image || ''
      }));
    }
    connected = true;
    renderStore();
  }

  function renderStore() {
    document.title = `${store.brandName} | ${store.heroTitle}`;
    document.querySelectorAll('.brand').forEach(element => {
      element.textContent = store.brandName;
    });
    $('hero-title').textContent = store.heroTitle;
    $('hero-description').textContent = store.heroDescription;
    $('hero-image').src = imageUrl(store.heroImage, defaults.heroImage);
    $('hero-image').alt = `باقة من ${store.brandName}`;
    $('story-copy').textContent = store.story;
    $('footer-location').textContent = store.location;
    $('store-status').textContent = !connected
      ? 'المتجر غير متصل حالياً'
      : store.storeOpen ? `${store.brandName} · تارودانت` : 'المتجر مغلق مؤقتاً';
    $('store-dot').classList.toggle('is-offline', !connected);
    $('store-dot').classList.toggle('is-closed', connected && !store.storeOpen);
    const instagram = $('instagram-link');
    const safeInstagram = imageUrl(store.instagram);
    instagram.hidden = !safeInstagram;
    if (safeInstagram) {
      instagram.href = safeInstagram;
      instagram.target = '_blank';
      instagram.rel = 'noopener noreferrer';
    }
    renderColorFilter();
    renderProducts();
    renderBuilderOptions();
    renderCart();
    updateDesign();
  }

  function renderColorFilter() {
    const filter = $('color-filter');
    const current = filter.value;
    filter.replaceChildren(new Option('جميع الألوان', 'all'));
    store.colors.filter(color => color.active).forEach(color => {
      filter.add(new Option(color.name, color.name));
    });
    filter.value = [...filter.options].some(option => option.value === current) ? current : 'all';
  }

  function renderProducts() {
    const color = $('color-filter').value;
    const size = $('size-filter').value;
    const shown = store.products.filter(product =>
      product.visible !== false &&
      (color === 'all' || product.color === color) &&
      (size === 'all' || product.size === size)
    );
    const grid = $('product-grid');
    grid.replaceChildren();
    shown.forEach(product => {
      const card = document.createElement('article');
      card.className = 'product-card';
      const image = document.createElement('img');
      image.className = 'product-image';
      image.loading = 'lazy';
      image.src = imageUrl(product.image, defaults.products[0].image);
      image.alt = `باقة ${product.name}`;
      const content = document.createElement('div');
      content.className = 'product-content';
      const meta = document.createElement('div');
      meta.className = 'product-meta';
      meta.innerHTML = `<span>${escapeHtml(product.color)} · ${escapeHtml(product.size)}</span><span>صنع يدوي</span>`;
      const title = document.createElement('h3');
      title.textContent = product.name;
      const description = document.createElement('p');
      description.textContent = product.description;
      const bottom = document.createElement('div');
      bottom.className = 'product-bottom';
      const price = document.createElement('strong');
      price.className = 'product-price';
      price.textContent = money(product.price);
      const add = document.createElement('button');
      add.className = 'button button-gold';
      add.type = 'button';
      add.textContent = 'أضيفي للسلة';
      add.disabled = !connected || !store.storeOpen;
      add.addEventListener('click', () => addProduct(product));
      bottom.append(price, add);
      content.append(meta, title, description, bottom);
      card.append(image, content);
      grid.append(card);
    });
    $('product-empty').hidden = shown.length > 0;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function renderBuilderOptions() {
    const colorGrid = $('rose-options');
    colorGrid.replaceChildren();
    const colors = store.colors.filter(option => option.active);
    if (!colors.some(option => option.name === selectedColor)) selectedColor = colors[0]?.name || '';
    colors.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = `option-card${selectedColor === option.name ? ' is-selected' : ''}`;
      button.type = 'button';
      button.setAttribute('aria-pressed', String(selectedColor === option.name));
      appendOptionImage(button, option.image || defaults.colors[index]?.image, option.name, option.hex);
      appendOptionName(button, option.name);
      button.addEventListener('click', () => {
        selectedColor = option.name;
        renderBuilderOptions();
        updateDesign();
      });
      colorGrid.append(button);
    });

    renderImageOptionGroup('paper-options', store.papers, selectedPaper, value => {
      selectedPaper = value;
      renderBuilderOptions();
      updateDesign();
    });
    renderImageOptionGroup('ribbon-options', store.ribbons, selectedRibbon, value => {
      selectedRibbon = value;
      renderBuilderOptions();
      updateDesign();
    });

    const addons = $('addon-options');
    const selectedAddons = new Set(
      [...addons.querySelectorAll('[data-addon]:checked')].map(input => input.dataset.addon)
    );
    addons.replaceChildren();
    [
      ['card', 'بطاقة إهداء', store.prices.card],
      ['box', 'علبة هدية', store.prices.box],
      ['led', 'إضاءة LED', store.prices.led]
    ].forEach(([key, label, price]) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'addon-option';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.addon = key;
      input.checked = selectedAddons.has(key);
      input.addEventListener('change', updateDesign);
      appendOptionImage(wrapper, store.addonImages[key] || defaults.addonImages[key], label);
      const text = document.createElement('span');
      text.textContent = `${label} (+${money(price)})`;
      wrapper.append(input, text);
      addons.append(wrapper);
    });
  }

  function appendOptionImage(container, source, alt, color = '') {
    const photoUrl = imageUrl(source);
    if (photoUrl) {
      const image = document.createElement('img');
      image.className = 'option-photo';
      image.src = photoUrl;
      image.alt = `${alt} - صورة توضيحية`;
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        const fallback = createOptionFallback(color);
        image.replaceWith(fallback);
      }, { once: true });
      container.append(image);
      return;
    }
    container.append(createOptionFallback(color));
  }

  function createOptionFallback(color) {
    const swatch = document.createElement('span');
    swatch.className = 'option-photo-fallback';
    swatch.style.background = /^#[0-9a-f]{6}$/i.test(color) ? color : '#392631';
    swatch.setAttribute('aria-hidden', 'true');
    return swatch;
  }

  function appendOptionName(container, value) {
    const name = document.createElement('span');
    name.className = 'option-card-name';
    name.textContent = value;
    container.append(name);
  }

  function renderImageOptionGroup(elementId, options, selected, onSelect) {
    const grid = $(elementId);
    grid.replaceChildren();
    const activeOptions = options.filter(option => option.active);
    if (!activeOptions.some(option => option.name === selected)) {
      selected = activeOptions[0]?.name || '';
      if (elementId === 'paper-options') selectedPaper = selected;
      else selectedRibbon = selected;
    }
    activeOptions.forEach(option => {
      const button = document.createElement('button');
      button.className = `option-card${selected === option.name ? ' is-selected' : ''}`;
      button.type = 'button';
      button.setAttribute('aria-pressed', String(selected === option.name));
      appendOptionImage(button, option.image, option.name);
      appendOptionName(button, option.name);
      button.addEventListener('click', () => onSelect(option.name));
      grid.append(button);
    });
  }

  function currentDesign() {
    const count = Number($('rose-count').value);
    const addons = [...document.querySelectorAll('[data-addon]:checked')].map(input => input.dataset.addon);
    const price = Math.max(0, Number(store.prices.basePrice) + (count - 10) * Number(store.prices.extraPrice)) +
      addons.reduce((sum, key) => sum + Number(store.prices[key] || 0), 0);
    return {
      count,
      color: selectedColor,
      paper: selectedPaper,
      ribbon: selectedRibbon,
      addons,
      price
    };
  }

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function optionTone(name, kind) {
    const value = String(name || '');
    if (/وردي|زهري|pink/i.test(value)) return kind === 'paper' ? '#8f5366' : '#e87a90';
    if (/أحمر|احمر|red/i.test(value)) return kind === 'paper' ? '#713641' : '#b83b54';
    if (/أبيض|ابيض|كريمي|عاجي|white|cream/i.test(value)) return kind === 'paper' ? '#cdbcae' : '#f2e8df';
    if (/أسود|اسود|black/i.test(value)) return kind === 'paper' ? '#302a34' : '#e0a96d';
    if (/ذهبي|gold/i.test(value)) return '#e0a96d';
    if (/بنفسجي|موف|purple/i.test(value)) return kind === 'paper' ? '#65516e' : '#a880ba';
    return kind === 'paper' ? '#a88b82' : '#e0a96d';
  }

  function renderBouquet(design, color) {
    const svg = $('bouquet-art');
    const roseColor = /^#[0-9a-f]{6}$/i.test(color?.hex || '') ? color.hex : '#e87a90';
    const paperColor = optionTone(design.paper, 'paper');
    const ribbonColor = optionTone(design.ribbon, 'ribbon');
    svg.replaceChildren();
    const defs = svgElement('defs');
    const glow = svgElement('filter', { id: 'light-glow', x: '-100%', y: '-100%', width: '300%', height: '300%' });
    glow.append(
      svgElement('feGaussianBlur', { stdDeviation: 3, result: 'blur' }),
      svgElement('feMerge')
    );
    const merge = glow.lastElementChild;
    merge.append(svgElement('feMergeNode', { in: 'blur' }), svgElement('feMergeNode', { in: 'SourceGraphic' }));
    defs.append(glow);
    svg.append(defs);

    svg.append(
      svgElement('ellipse', { cx: 160, cy: 237, rx: 105, ry: 12, fill: '#000', opacity: '.22' }),
      svgElement('path', { d: 'M153 190 Q147 155 112 108 M160 190 Q160 142 160 83 M167 190 Q174 146 207 103', fill: 'none', stroke: '#496850', 'stroke-width': 5, 'stroke-linecap': 'round' }),
      svgElement('path', { d: 'M122 132 Q97 111 92 137 Q107 150 122 132 M195 132 Q220 111 225 137 Q210 150 195 132', fill: '#66856a', stroke: '#809a7b', 'stroke-width': 2 }),
      svgElement('path', { d: 'M89 136 L129 142 L153 245 L142 251 Z', fill: paperColor, stroke: '#fff8f4', 'stroke-opacity': '.45', 'stroke-width': 2 }),
      svgElement('path', { d: 'M231 136 L191 142 L167 245 L178 251 Z', fill: paperColor, stroke: '#fff8f4', 'stroke-opacity': '.45', 'stroke-width': 2 }),
      svgElement('path', { d: 'M112 147 Q160 163 208 147 L177 247 Q160 256 143 247 Z', fill: paperColor, stroke: '#fff8f4', 'stroke-opacity': '.32', 'stroke-width': 2 }),
      svgElement('path', { d: 'M142 198 Q160 207 178 198 L172 218 Q160 226 148 218 Z', fill: ribbonColor, stroke: '#fff8f4', 'stroke-opacity': '.6', 'stroke-width': 1.5 }),
      svgElement('path', { d: 'M151 207 Q132 194 133 211 Q143 221 158 212 M169 207 Q188 194 187 211 Q177 221 162 212', fill: ribbonColor, stroke: '#fff8f4', 'stroke-opacity': '.55', 'stroke-width': 2 })
    );

    const count = Number.isInteger(design.count) ? Math.max(5, Math.min(50, design.count)) : 10;
    const radius = Math.max(5, 15 - Math.sqrt(count) * 1.25);
    for (let index = 0; index < count; index += 1) {
      const distance = Math.sqrt((index + 0.5) / count);
      const angle = index * 2.399963 + Math.PI / 2;
      const x = 160 + Math.cos(angle) * 88 * distance;
      const y = 104 + Math.sin(angle) * 54 * distance;
      const flower = svgElement('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
      for (let petal = 0; petal < 6; petal += 1) {
        flower.append(svgElement('ellipse', {
          cx: 0, cy: -radius * 0.42, rx: radius * 0.38, ry: radius * 0.59,
          transform: `rotate(${petal * 60})`, fill: roseColor, stroke: '#fff8f4',
          'stroke-opacity': '.34', 'stroke-width': Math.max(0.5, radius * 0.07)
        }));
      }
      flower.append(svgElement('circle', {
        r: radius * 0.22, fill: '#e9b86f', stroke: '#fff8f4', 'stroke-opacity': '.7',
        'stroke-width': Math.max(0.5, radius * 0.06)
      }));
      svg.append(flower);
    }

    if (design.addons.includes('led')) {
      svg.append(svgElement('path', {
        d: 'M104 112 Q120 70 154 98 T215 111', fill: 'none', stroke: '#ffe6a3',
        'stroke-width': 2, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round'
      }));
      [[110, 105], [154, 91], [210, 110]].forEach(([cx, cy]) => {
        svg.append(svgElement('circle', { cx, cy, r: 4, fill: '#fff1b5', filter: 'url(#light-glow)' }));
      });
    }
    if (design.addons.includes('card')) {
      svg.append(svgElement('path', { d: 'M209 165 L239 145 L253 166 L222 184 Z', fill: '#f1e4cf', stroke: '#e0a96d', 'stroke-width': 2 }));
      const cardText = svgElement('text', { x: 229, y: 166, fill: '#8d5260', 'font-size': 10, 'text-anchor': 'middle' });
      cardText.textContent = '♥';
      svg.append(cardText);
    }
    if (design.addons.includes('box')) {
      svg.append(svgElement('path', { d: 'M68 189 L91 185 L98 202 L75 207 Z', fill: '#cbb49b', stroke: '#e0a96d', 'stroke-width': 2 }));
    }
    $('preview-count').textContent = `${count} وردة`;
    $('preview-color').textContent = design.color || 'اختاري اللون';
  }

  function updateDesign() {
    const design = currentDesign();
    const color = store.colors.find(option => option.name === design.color);
    renderBouquet(design, color);
    $('design-price').textContent = Number.isFinite(design.price) ? money(design.price) : '— DH';
    $('design-summary').textContent = design.color
      ? `${design.count} وردة من اختيارك، مرتبة يدوياً حسب ذوقك.`
      : 'اختاري اللون والتغليف لمعاينة تصميمك.';
    const addonLabels = { card: 'بطاقة إهداء', box: 'علبة هدية', led: 'إضاءة LED' };
    const specs = [
      ['لون الورد', design.color || 'لم يُحدد بعد'],
      ['التغليف', design.paper || 'لم يُحدد بعد'],
      ['الشريط', design.ribbon || 'لم يُحدد بعد'],
      ['الإضافات', design.addons.length ? design.addons.map(key => addonLabels[key] || key).join('، ') : 'بدون إضافات']
    ];
    const list = $('design-specs');
    list.replaceChildren();
    specs.forEach(([label, value]) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = label;
      const detail = document.createElement('strong');
      detail.textContent = value;
      item.append(name, detail);
      list.append(item);
    });
    $('add-custom').disabled = !connected || !store.storeOpen;
    $('add-custom').title = !connected ? 'المتجر غير متصل حالياً' : !store.storeOpen ? 'المتجر مغلق مؤقتاً' : '';
    $('designer-error').hidden = true;
  }

  function showStep() {
    const stepNames = ['عدد الوردات', 'لون الورد', 'التغليف والشريط', 'الإضافات'];
    document.querySelectorAll('.builder-step').forEach(element => {
      element.hidden = Number(element.dataset.step) !== builderStep;
    });
    $('step-label').textContent = `الخطوة ${builderStep} من 4 · ${stepNames[builderStep - 1]}`;
    $('step-progress').style.width = `${builderStep * 25}%`;
    $('step-progress').parentElement.setAttribute('aria-valuenow', String(builderStep));
    $('step-back').hidden = builderStep === 1;
    $('step-next').hidden = builderStep === 4;
  }

  function stepIsReady() {
    const design = currentDesign();
    if (builderStep === 1) return Number.isInteger(design.count) && design.count >= 5 && design.count <= 50;
    if (builderStep === 2) return Boolean(design.color);
    if (builderStep === 3) return Boolean(design.paper && design.ribbon);
    return true;
  }

  function persistCart() {
    saveCart();
    renderCart();
  }

  function addProduct(product) {
    if (!store.storeOpen) return toast('المتجر مغلق مؤقتاً.');
    const line = cart.find(item => item.kind === 'product' && item.id === product.id);
    if (line) line.qty = Math.min(99, line.qty + 1);
    else cart.push({
      id: product.id,
      kind: 'product',
      name: product.name,
      price: Number(product.price),
      details: `${product.color} · ${product.size}`,
      qty: 1
    });
    persistCart();
    toast('تزاد المنتج للسلة.');
  }

  function renderCart() {
    $('cart-count').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    $('cart-total').textContent = money(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
    $('cart-empty').hidden = cart.length > 0;
    const hasWhatsapp = /^\d{8,15}$/.test(String(store.whatsappPhone || '').replace(/\D/g, ''));
    $('checkout').disabled = !cart.length || !connected || !store.storeOpen || !hasWhatsapp;
    $('cart-items').replaceChildren();
    cart.forEach(item => {
      const row = document.createElement('article');
      row.className = 'cart-row';
      const top = document.createElement('div');
      top.className = 'cart-row-top';
      const text = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = item.name;
      const details = document.createElement('p');
      details.textContent = item.details || '';
      text.append(name, details);
      const amount = document.createElement('strong');
      amount.className = 'product-price';
      amount.textContent = money(item.price * item.qty);
      top.append(text, amount);
      const controls = document.createElement('div');
      controls.className = 'cart-row-controls';
      const decrement = quantityButton('−', `تقليل كمية ${item.name}`, () => changeQuantity(item.id, -1));
      const quantity = document.createElement('span');
      quantity.textContent = String(item.qty);
      const increment = quantityButton('+', `زيادة كمية ${item.name}`, () => changeQuantity(item.id, 1));
      const remove = document.createElement('button');
      remove.className = 'remove-button';
      remove.type = 'button';
      remove.textContent = 'حذف';
      remove.addEventListener('click', () => {
        cart = cart.filter(line => line.id !== item.id);
        persistCart();
      });
      controls.append(decrement, quantity, increment, remove);
      row.append(top, controls);
      $('cart-items').append(row);
    });
  }

  function quantityButton(text, label, callback) {
    const button = document.createElement('button');
    button.className = 'quantity-button';
    button.type = 'button';
    button.textContent = text;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', callback);
    return button;
  }

  function changeQuantity(id, delta) {
    const item = cart.find(line => line.id === id);
    if (!item) return;
    item.qty = Math.max(1, Math.min(99, item.qty + delta));
    persistCart();
  }

  function openCart() {
    $('cart-scrim').hidden = false;
    $('cart-drawer').hidden = false;
    document.body.classList.add('drawer-open');
    $('cart-close').focus();
  }

  function closeCart() {
    $('cart-scrim').hidden = true;
    $('cart-drawer').hidden = true;
    document.body.classList.remove('drawer-open');
    $('cart-open').focus();
  }

  function orderDetails() {
    return {
      items: cart.map(item => item.kind === 'custom'
        ? { kind: 'custom', qty: item.qty, custom: item.custom, name: item.name }
        : { kind: 'product', productId: item.id, qty: item.qty, name: item.name, details: item.details })
    };
  }

  async function submitOrder(event) {
    event.preventDefault();
    const errorElement = $('order-error');
    const submit = $('order-submit');
    if (!connected || !window.krhSupabase) {
      errorElement.textContent = 'قاعدة البيانات غير متاحة حالياً. تواصلي معنا مباشرة.';
      errorElement.hidden = false;
      return;
    }
    const formData = new FormData($('order-form'));
    const customer = Object.fromEntries(['name', 'phone', 'city', 'address', 'note'].map(key => [
      key, String(formData.get(key) || '').trim()
    ]));
    if (!customer.name || !customer.phone || !customer.city || !customer.address) {
      errorElement.textContent = 'عمّري المعلومات المطلوبة قبل تأكيد الطلب.';
      errorElement.hidden = false;
      return;
    }

    whatsappWindow = window.open('about:blank', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    submit.disabled = true;
    errorElement.hidden = true;
    try {
      const { data, error } = await window.krhSupabase.rpc('place_store_order', {
        p_id: `KR-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
        p_customer: customer,
        p_details: orderDetails()
      });
      if (error) throw error;
      const order = data?.[0];
      if (!order) throw new Error('The order insert returned no order.');
      const lines = order.details.items.map((item, index) =>
        `${index + 1}. ${item.name} × ${item.qty}\n   ${item.details || `${item.custom.roseCount} وردة · ${item.custom.color} · ${item.custom.paper}`}`
      );
      const message = [
        `🌹 طلب جديد من ${store.brandName}`,
        `رقم الطلب: ${order.id}`,
        `الاسم: ${customer.name}`,
        `الهاتف: ${customer.phone}`,
        `المدينة: ${customer.city}`,
        `العنوان: ${customer.address}`,
        customer.note ? `ملاحظة: ${customer.note}` : '',
        '',
        ...lines,
        '',
        `المجموع التقديري: ${money(order.total)}`,
        'يرجى تأكيد التوفر وموعد التوصيل.'
      ].filter(Boolean).join('\n');
      const phone = String(store.whatsappPhone || '').replace(/\D/g, '');
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      if (whatsappWindow) whatsappWindow.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
      cart = [];
      persistCart();
      $('order-dialog').close();
      $('order-form').reset();
      closeCart();
      toast('تسجل طلبك. كملي إرسال الرسالة عبر واتساب.');
    } catch (error) {
      if (whatsappWindow) whatsappWindow.close();
      console.error('Could not place order:', error);
      errorElement.textContent = 'ما قدرناش نسجلو الطلب. راجعي الاتصال وحاولي مرة أخرى.';
      errorElement.hidden = false;
    } finally {
      submit.disabled = false;
      whatsappWindow = null;
    }
  }

  $('menu-toggle').addEventListener('click', () => {
    const open = $('menu-toggle').getAttribute('aria-expanded') !== 'true';
    $('menu-toggle').setAttribute('aria-expanded', String(open));
    $('menu-toggle').setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    $('main-nav').classList.toggle('is-open', open);
  });
  $('main-nav').addEventListener('click', event => {
    if (event.target.closest('a')) {
      $('main-nav').classList.remove('is-open');
      $('menu-toggle').setAttribute('aria-expanded', 'false');
    }
  });
  $('color-filter').addEventListener('change', renderProducts);
  $('size-filter').addEventListener('change', renderProducts);
  $('designer-form').addEventListener('submit', event => event.preventDefault());
  $('rose-count').addEventListener('input', updateDesign);
  $('rose-count').addEventListener('change', updateDesign);
  $('step-next').addEventListener('click', () => {
    if (!stepIsReady()) {
      $('designer-error').textContent = builderStep === 1 ? 'اختاري عدداً بين 5 و50 وردة.' : 'اختاري الخيارات المطلوبة قبل المتابعة.';
      $('designer-error').hidden = false;
      return;
    }
    $('designer-error').hidden = true;
    builderStep = Math.min(4, builderStep + 1);
    showStep();
  });
  $('step-back').addEventListener('click', () => {
    builderStep = Math.max(1, builderStep - 1);
    showStep();
  });
  $('add-custom').addEventListener('click', () => {
    const design = currentDesign();
    if (!store.storeOpen) return toast('المتجر مغلق مؤقتاً.');
    if (!connected) return toast('المتجر غير متصل حالياً.');
    if (!Number.isInteger(design.count) || design.count < 5 || design.count > 50 || !design.color || !design.paper || !design.ribbon) {
      $('designer-error').textContent = 'اختاري عدد الوردات واللون والتغليف والشريط.';
      $('designer-error').hidden = false;
      return;
    }
    const descriptions = [
      `${design.count} وردة`,
      design.color,
      `تغليف ${design.paper}`,
      `شريط ${design.ribbon}`,
      ...design.addons.map(key => ({ card: 'بطاقة إهداء', box: 'علبة هدية', led: 'إضاءة LED' }[key] || key))
    ];
    cart.push({
      id: `custom-${crypto.randomUUID()}`,
      kind: 'custom',
      name: 'بوكيه بتصميمك',
      price: design.price,
      details: descriptions.join(' · '),
      qty: 1,
      custom: design
    });
    persistCart();
    toast('تزاد تصميمك للسلة.');
  });
  $('cart-open').addEventListener('click', openCart);
  $('cart-close').addEventListener('click', closeCart);
  $('cart-scrim').addEventListener('click', closeCart);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('cart-drawer').hidden) closeCart();
  });
  $('checkout').addEventListener('click', () => {
    if (!cart.length || !connected || !store.storeOpen) return;
    if (!/^\d{8,15}$/.test(String(store.whatsappPhone || '').replace(/\D/g, ''))) {
      $('checkout-error').textContent = 'خاص الإدارة تضيف رقم WhatsApp ديال المتجر قبل استقبال الطلبات.';
      $('checkout-error').hidden = false;
      return;
    }
    $('checkout-error').hidden = true;
    $('order-dialog').showModal();
  });
  $('order-close').addEventListener('click', () => $('order-dialog').close());
  $('order-form').addEventListener('submit', submitOrder);
  $('current-year').textContent = String(new Date().getFullYear());
  loadCart();
  renderCart();
  showStep();
  loadStore();
})();
