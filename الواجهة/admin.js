(() => {
  const $ = id => document.getElementById(id);
  const titles = {
    overview: 'نظرة عامة',
    orders: 'الطلبات',
    products: 'الباقات',
    options: 'خيارات المصمم المصوّرة',
    content: 'محتوى الموقع',
    prices: 'الأسعار'
  };
  let settings = null;
  let orders = [];
  let editingProductId = null;
  let editingOption = null;
  let currentView = 'overview';
  const optionImageDefaults = {
    colors: [
      'https://images.pexels.com/photos/8879818/pexels-photo-8879818.jpeg?auto=compress&cs=tinysrgb&w=500',
      'https://images.pexels.com/photos/34730769/pexels-photo-34730769.jpeg?auto=compress&cs=tinysrgb&w=500',
      'https://images.pexels.com/photos/36230878/pexels-photo-36230878.jpeg?auto=compress&cs=tinysrgb&w=500',
      'https://images.pexels.com/photos/32223896/pexels-photo-32223896.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    papers: Array.from({ length: 19 }, (_, index) =>
      `assets/options/papers/paper-${String(index + 1).padStart(2, '0')}.avif`),
    ribbons: Array.from({ length: 9 }, (_, index) =>
      `assets/options/ribbons/ribbon-${String(index + 1).padStart(2, '0')}.jpeg`)
  };
  const defaultAddonImages = {
    card: 'https://images.pexels.com/photos/1666065/pexels-photo-1666065.jpeg?auto=compress&cs=tinysrgb&w=500',
    box: 'https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=500',
    led: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=500'
  };

  function toast(message) {
    const element = $('toast');
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { element.hidden = true; }, 3500);
  }

  function setLoginError(message) {
    $('login-error').textContent = message;
    $('login-error').hidden = !message;
  }

  function showGlobalError(message) {
    $('global-error').textContent = message;
    $('global-error').hidden = !message;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function money(value) {
    return `${Number(value || 0).toLocaleString('fr-MA')} DH`;
  }

  function setView(name) {
    currentView = name;
    Object.keys(titles).forEach(view => {
      $(`view-${view}`).hidden = view !== name;
      document.querySelector(`[data-view="${view}"]`).classList.toggle('is-active', view === name);
    });
    $('view-title').textContent = titles[name];
    if (name === 'orders') renderOrders();
    if (name === 'products') renderProducts();
    if (name === 'options') renderOptions();
  }

  async function verifyAdmin() {
    const { data: userResult, error: userError } = await window.krhSupabase.auth.getUser();
    if (userError) throw userError;
    if (!userResult.user) return null;
    const { data, error } = await window.krhSupabase
      .from('store_admins')
      .select('user_id')
      .eq('user_id', userResult.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const { error: signOutError } = await window.krhSupabase.auth.signOut();
      if (signOutError) console.error('Could not sign out unauthorized user:', signOutError);
      return null;
    }
    return userResult.user;
  }

  async function loadSettings() {
    const { data, error } = await window.krhSupabase
      .from('store_settings')
      .select('settings')
      .eq('id', 1)
      .single();
    if (error) throw error;
    settings = data.settings;
    if (!settings || !Array.isArray(settings.products) ||
        !Array.isArray(settings.colors) || !Array.isArray(settings.papers) ||
        !Array.isArray(settings.ribbons) || !settings.prices) {
      throw new Error('Store settings are missing fields. Run the current Supabase schema setup.');
    }
    for (const key of ['colors', 'papers', 'ribbons']) {
      settings[key] = settings[key].map((option, index) => ({
        ...option,
        image: option.image || optionImageDefaults[key][index] || ''
      }));
    }
    settings.addonImages = { ...defaultAddonImages, ...(settings.addonImages || {}) };
  }

  async function loadOrders() {
    const { data, error } = await window.krhSupabase
      .from('orders')
      .select('id, created_at, customer, details, total, status, whatsapp_sent')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    orders = data || [];
    renderOverview();
    if (currentView === 'orders') renderOrders();
  }

  async function saveSettings() {
    const { data, error } = await window.krhSupabase
      .from('store_settings')
      .update({ settings, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Store settings row is missing.');
    toast('تحفظات التغييرات وتحدّث الموقع.');
  }

  async function runAdmin(user) {
    $('login-view').hidden = true;
    $('dashboard-view').hidden = false;
    $('admin-email').textContent = user.email || '';
    $('connection-status').classList.remove('is-error');
    $('connection-status').textContent = 'متصل';
    try {
      await Promise.all([loadSettings(), loadOrders()]);
      populateForms();
      renderProducts();
      renderOptions();
      setView('overview');
      showGlobalError('');
    } catch (error) {
      console.error('Could not load admin data:', error);
      showGlobalError('تعذر تحميل بيانات لوحة الإدارة. تأكدي من إعداد قاعدة البيانات والاتصال.');
      $('connection-status').classList.add('is-error');
      $('connection-status').textContent = 'تعذر الاتصال';
    }
  }

  function renderOverview() {
    const newOrders = orders.filter(order => order.status === 'new');
    const sales = orders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const counts = {};
    orders.forEach(order => {
      (order.details?.items || []).forEach(item => {
        const product = settings?.products?.find(entry => entry.id === item.productId);
        const color = item.custom?.color || product?.color;
        if (color) counts[color] = (counts[color] || 0) + Number(item.qty || 1);
      });
    });
    const topColor = Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] || '—';
    $('metric-orders').textContent = String(orders.length);
    $('metric-sales').textContent = money(sales);
    $('metric-new').textContent = String(newOrders.length);
    $('metric-color').textContent = topColor;
    $('new-order-count').textContent = String(newOrders.length);
    $('recent-orders').replaceChildren();
    if (!orders.length) {
      $('recent-orders').append(emptyState('ما كايناش طلبات مسجلة بعد.'));
      return;
    }
    orders.slice(0, 5).forEach(order => $('recent-orders').append(createOrderCard(order, false)));
  }

  function emptyState(message) {
    const element = document.createElement('p');
    element.className = 'empty-state';
    element.textContent = message;
    return element;
  }

  function orderLabel(status) {
    return status === 'sent' ? 'تم التواصل' : status === 'cancelled' ? 'ملغى' : 'جديد';
  }

  function createOrderCard(order, withControls) {
    const card = document.createElement('article');
    card.className = 'order-card';
    const customer = document.createElement('div');
    customer.className = 'order-customer';
    const name = document.createElement('strong');
    name.textContent = order.customer?.name || 'زبون';
    const info = document.createElement('span');
    info.textContent = `${order.customer?.phone || ''} · ${order.customer?.city || ''} · ${order.id}`;
    const date = document.createElement('span');
    date.className = 'order-date';
    date.textContent = new Date(order.created_at).toLocaleString('ar-MA');
    customer.append(name, info, date);

    const side = document.createElement('div');
    side.className = 'order-side';
    const total = document.createElement('strong');
    total.textContent = money(order.total);
    const actions = document.createElement('div');
    actions.className = 'order-actions';
    const status = document.createElement('select');
    status.className = `field status-select status-${order.status}`;
    status.setAttribute('aria-label', `حالة الطلب ${order.id}`);
    [['new', 'جديد'], ['sent', 'تم التواصل'], ['cancelled', 'ملغى']].forEach(([value, label]) => {
      status.add(new Option(label, value));
    });
    status.value = order.status;
    status.addEventListener('change', () => updateOrderStatus(order.id, status.value));
    const whatsapp = document.createElement('button');
    whatsapp.type = 'button';
    whatsapp.className = 'button button-outline';
    whatsapp.textContent = 'فتح WhatsApp';
    whatsapp.addEventListener('click', () => openOrderWhatsApp(order));
    actions.append(status, whatsapp);
    if (!withControls) {
      status.hidden = true;
      whatsapp.hidden = true;
    }
    side.append(total, actions);
    card.append(customer, side);
    return card;
  }

  function renderOrders() {
    const list = $('orders-list');
    list.replaceChildren();
    const filter = $('order-filter').value;
    const query = $('order-search').value.trim().toLocaleLowerCase();
    const visible = orders.filter(order =>
      (filter === 'all' || order.status === filter) &&
      (!query || [order.customer?.name, order.customer?.phone, order.id]
        .some(value => String(value || '').toLocaleLowerCase().includes(query)))
    );
    if (!visible.length) {
      list.append(emptyState(filter === 'all' ? 'ما كايناش طلبات مسجلة بعد.' : 'ما كايناش طلبات بهاد الحالة.'));
      return;
    }
    visible.forEach(order => list.append(createOrderCard(order, true)));
  }

  async function updateOrderStatus(id, status) {
    const { error } = await window.krhSupabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      console.error('Could not update order status:', error);
      showGlobalError('ما قدرناش نحدّثو حالة الطلب.');
      await loadOrders();
      return;
    }
    const order = orders.find(item => item.id === id);
    if (order) order.status = status;
    renderOverview();
    renderOrders();
    toast('تحدّثات حالة الطلب.');
  }

  function openOrderWhatsApp(order) {
    const items = (order.details?.items || []).map((item, index) => {
      const description = item.details ||
        (item.custom ? `${item.custom.count} وردة · ${item.custom.color} · تغليف ${item.custom.paper}` : '');
      return `${index + 1}. ${item.name} × ${item.qty}\n${description}`;
    });
    const message = [
      `🌹 طلب ${order.id} من Khadija Rose House`,
      `الاسم: ${order.customer?.name || ''}`,
      `الهاتف: ${order.customer?.phone || ''}`,
      `المدينة: ${order.customer?.city || ''}`,
      `العنوان: ${order.customer?.address || ''}`,
      order.customer?.note ? `ملاحظة: ${order.customer.note}` : '',
      '',
      ...items,
      '',
      `المجموع: ${money(order.total)}`
    ].filter(Boolean).join('\n');
    const phone = String(settings?.whatsappPhone || '').replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function populateForms() {
    const content = $('content-form');
    for (const key of ['brandName', 'heroTitle', 'heroDescription', 'heroImage', 'story', 'location', 'instagram', 'whatsappPhone']) {
      content.elements[key].value = settings[key] || '';
    }
    content.elements.storeOpen.checked = settings.storeOpen !== false;
    for (const key of ['basePrice', 'extraPrice', 'card', 'box', 'led']) {
      $('prices-form').elements[key].value = settings.prices[key] ?? 0;
    }
    renderProductColorSelect();
  }

  function renderProductColorSelect() {
    const select = $('product-color');
    const previous = select.value;
    select.replaceChildren();
    settings.colors.forEach(color => select.add(new Option(color.name, color.name)));
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
  }

  function renderProducts() {
    const list = $('product-list');
    list.replaceChildren();
    if (!settings.products.length) {
      list.append(emptyState('مازال ما تزادت حتى باقة.'));
      return;
    }
    settings.products.forEach(product => {
      const row = document.createElement('article');
      row.className = 'product-admin-card';
      const info = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = product.name;
      const summary = document.createElement('span');
      summary.textContent = `${money(product.price)} · ${product.color} · ${product.size} · ${product.visible === false ? 'مخفية' : 'ظاهرة'}`;
      info.append(title, document.createElement('br'), summary);
      const actions = document.createElement('div');
      actions.className = 'order-actions';
      actions.append(
        actionButton('تعديل', () => editProduct(product.id)),
        actionButton(product.visible === false ? 'إظهار' : 'إخفاء', () => toggleProduct(product.id)),
        actionButton('حذف', () => deleteProduct(product.id), true)
      );
      row.append(info, actions);
      list.append(row);
    });
  }

  function actionButton(label, handler, danger = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `button ${danger ? 'button-danger' : 'button-outline'}`;
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
  }

  function clearProductForm() {
    editingProductId = null;
    $('product-form').reset();
    $('product-form-heading').textContent = 'إضافة باقة';
    $('cancel-product-edit').hidden = true;
  }

  function editProduct(id) {
    const product = settings.products.find(item => item.id === id);
    if (!product) return;
    editingProductId = id;
    const form = $('product-form');
    for (const key of ['name', 'price', 'color', 'size', 'description', 'image']) {
      form.elements[key].value = product[key] ?? '';
    }
    $('product-form-heading').textContent = `تعديل: ${product.name}`;
    $('cancel-product-edit').hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.elements.name.focus();
  }

  async function persistAndRefresh(callback, rollback = () => {}) {
    try {
      await saveSettings();
      callback();
      showGlobalError('');
      return true;
    } catch (error) {
      rollback();
      callback();
      console.error('Could not save store settings:', error);
      showGlobalError('تعذر حفظ التغييرات. حاولي مرة أخرى بعد التحقق من الاتصال.');
      return false;
    }
  }

  function toggleProduct(id) {
    const product = settings.products.find(item => item.id === id);
    if (!product) return;
    const previous = product.visible;
    product.visible = product.visible === false;
    persistAndRefresh(renderProducts, () => { product.visible = previous; });
  }

  function deleteProduct(id) {
    if (!window.confirm('واش متأكدة بغيتي تحذفي هاد الباقة؟')) return;
    const previous = settings.products;
    settings.products = previous.filter(product => product.id !== id);
    persistAndRefresh(renderProducts, () => { settings.products = previous; });
  }

  function renderOptions() {
    renderOptionList('color-list', settings.colors, 'colors', color => color.hex);
    renderOptionList('paper-list', settings.papers, 'papers');
    renderOptionList('ribbon-list', settings.ribbons, 'ribbons');
    renderProductColorSelect();
    const addonForm = $('addon-images-form');
    for (const key of Object.keys(defaultAddonImages)) {
      addonForm.elements[key].value = settings.addonImages[key] || '';
      updateAddonPreview(key, addonForm.elements[key].value);
    }
  }

  function updateAddonPreview(key, source) {
    const preview = document.querySelector(`[data-addon-preview="${key}"]`);
    if (!preview) return;
    preview.hidden = !validImageReference(source);
    if (preview.hidden) return;
    preview.src = source;
    preview.onerror = () => { preview.hidden = true; };
  }

  function renderOptionList(elementId, list, key, colorValue = () => '') {
    const container = $(elementId);
    container.replaceChildren();
    if (!list.length) {
      container.append(emptyState('لا توجد خيارات مضافة.'));
      return;
    }
    list.forEach((option, index) => {
      const row = document.createElement('div');
      row.className = 'option-row';
      if (option.image) {
        const image = document.createElement('img');
        image.className = 'option-thumbnail';
        image.src = option.image;
        image.alt = `صورة ${option.name}`;
        image.loading = 'lazy';
        image.addEventListener('error', () => image.hidden = true, { once: true });
        row.append(image);
      }
      const label = document.createElement('span');
      label.className = 'option-name';
      if (key === 'colors') {
        const swatch = document.createElement('i');
        swatch.className = 'color-swatch';
        swatch.style.background = /^#[0-9a-f]{6}$/i.test(colorValue(option)) ? colorValue(option) : '#e87a90';
        label.append(swatch);
      }
      label.append(document.createTextNode(`${option.name}${option.active === false ? ' · غير متاح' : ''}`));
      const actions = document.createElement('div');
      actions.className = 'option-actions';
      actions.append(
        actionButton('تعديل', () => editOption(key, index)),
        actionButton(option.active === false ? 'تفعيل' : 'تعطيل', () => toggleOption(key, index)),
        actionButton('حذف', () => deleteOption(key, index), true)
      );
      row.append(label, actions);
      container.append(row);
    });
  }

  function editOption(key, index) {
    const option = settings[key][index];
    if (!option) return;
    editingOption = { key, index };
    const form = $('option-edit-form');
    form.elements.name.value = option.name;
    form.elements.image.value = option.image || '';
    form.elements.hex.value = /^#[0-9a-f]{6}$/i.test(option.hex || '') ? option.hex : '#e87a90';
    $('option-color-field').hidden = key !== 'colors';
    $('option-edit-heading').textContent = `تعديل: ${option.name}`;
    $('option-edit-error').hidden = true;
    $('option-dialog').showModal();
  }

  function validImageReference(value) {
    if (/^https:\/\//i.test(value)) {
      try {
        return new URL(value).protocol === 'https:';
      } catch {
        return false;
      }
    }
    return /^assets\/[a-z0-9/_-]+\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(value);
  }

  async function toggleOption(key, index) {
    const list = settings[key];
    if (list[index].active !== false && list.filter(item => item.active !== false).length === 1) {
      toast('خلي على الأقل اختيار واحد متاح.');
      return;
    }
    const previous = list[index].active;
    list[index].active = list[index].active === false;
    try {
      await saveSettings();
      renderOptions();
      toast('تحدّث المخزون.');
    } catch (error) {
      list[index].active = previous;
      console.error('Could not update option availability:', error);
      showGlobalError('تعذر تحديث المخزون.');
    }
  }

  async function deleteOption(key, index) {
    const previous = settings[key];
    if (previous.length <= 1) {
      toast('خاص يبقى اختيار واحد على الأقل.');
      return;
    }
    if (!window.confirm('واش متأكدة بغيتي تحذفي هاد الخيار؟')) return;
    settings[key] = previous.filter((_, itemIndex) => itemIndex !== index);
    try {
      await saveSettings();
      renderOptions();
      toast('تحذف الخيار.');
    } catch (error) {
      settings[key] = previous;
      console.error('Could not delete store option:', error);
      showGlobalError('تعذر حذف الخيار.');
    }
  }

  $('login-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!window.krhSupabase) {
      setLoginError('ربط Supabase ناقص. كملي إعداد URL وanon key فـ supabase-config.js.');
      return;
    }
    const button = $('login-submit');
    button.disabled = true;
    setLoginError('');
    try {
      const { error } = await window.krhSupabase.auth.signInWithPassword({
        email: $('login-email').value.trim(),
        password: $('login-password').value
      });
      if (error) throw error;
      const user = await verifyAdmin();
      if (!user) {
        setLoginError('هاد الحساب ما عندوش صلاحية إدارة المتجر.');
        return;
      }
      $('login-password').value = '';
      await runAdmin(user);
    } catch (error) {
      console.error('Admin login failed:', error);
      setLoginError('تعذر تسجيل الدخول. تحققي من البريد وكلمة المرور وإعداد Supabase.');
    } finally {
      button.disabled = false;
    }
  });

  $('sign-out').addEventListener('click', async () => {
    const { error } = await window.krhSupabase.auth.signOut();
    if (error) {
      console.error('Admin sign-out failed:', error);
      showGlobalError('تعذر تسجيل الخروج.');
      return;
    }
    $('dashboard-view').hidden = true;
    $('login-view').hidden = false;
    $('login-password').value = '';
  });

  $('admin-nav').addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (button) setView(button.dataset.view);
  });
  document.querySelectorAll('[data-open-view]').forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.openView));
  });
  $('order-filter').addEventListener('change', renderOrders);
  $('order-search').addEventListener('input', renderOrders);

  $('product-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(['name', 'price', 'color', 'size', 'description', 'image'].map(key => [
      key, key === 'price' ? Number(form.elements[key].value) : form.elements[key].value.trim()
    ]));
    if (!values.name || !values.description || !Number.isFinite(values.price) || values.price < 1 ||
        !/^https:\/\//i.test(values.image) || !settings.colors.some(color => color.name === values.color)) {
      showGlobalError('تحققي من البيانات، ورابط الصورة خاصو يبدأ بـ HTTPS.');
      return;
    }
    const previousProducts = settings.products.map(product => ({ ...product }));
    if (editingProductId) {
      const product = settings.products.find(item => item.id === editingProductId);
      if (product) Object.assign(product, values);
    } else {
      settings.products.unshift({ id: crypto.randomUUID(), ...values, visible: true });
    }
    try {
      await saveSettings();
      clearProductForm();
      renderProducts();
      showGlobalError('');
    } catch (error) {
      settings.products = previousProducts;
      console.error('Could not save product:', error);
      showGlobalError('تعذر حفظ الباقة.');
    }
  });
  $('cancel-product-edit').addEventListener('click', clearProductForm);

  $('color-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.name.value.trim();
    const hex = form.elements.hex.value;
    const image = form.elements.image.value.trim();
    if (!name || settings.colors.some(option => option.name === name) ||
        !validImageReference(image)) {
      showGlobalError('اسم اللون خاصو يكون جديداً، والصورة تكون برابط HTTPS أو مساراً داخل assets.');
      return;
    }
    const previous = settings.colors;
    settings.colors = [...previous, { name, hex, image, active: true }];
    try {
      await saveSettings();
      form.reset();
      renderOptions();
      showGlobalError('');
    } catch (error) {
      settings.colors = previous;
      console.error('Could not add rose color:', error);
      showGlobalError('تعذر إضافة اللون.');
    }
  });

  document.querySelectorAll('.option-form').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const key = form.dataset.optionKind;
      const name = form.elements.name.value.trim();
      const image = form.elements.image.value.trim();
      if (!name || settings[key].some(option => option.name === name) || !validImageReference(image)) {
        showGlobalError('أدخلي اسماً جديداً وصورة برابط HTTPS أو مساراً داخل assets.');
        return;
      }
      const previous = settings[key];
      settings[key] = [...previous, { name, image, active: true }];
      try {
        await saveSettings();
        form.reset();
        renderOptions();
        showGlobalError('');
      } catch (error) {
        settings[key] = previous;
        console.error('Could not add catalog option:', error);
        showGlobalError('تعذر إضافة الخيار.');
      }
    });
  });

  $('option-edit-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!editingOption) return;
    const form = event.currentTarget;
    const { key, index } = editingOption;
    const option = settings[key][index];
    const name = form.elements.name.value.trim();
    const image = form.elements.image.value.trim();
    const hex = form.elements.hex.value;
    if (!name || settings[key].some((entry, itemIndex) => itemIndex !== index && entry.name === name) ||
        !validImageReference(image) || (key === 'colors' && !/^#[0-9a-f]{6}$/i.test(hex))) {
      $('option-edit-error').textContent = 'تحققي من الاسم والصورة، وتجنبي تكرار اسم خيار من نفس الفئة.';
      $('option-edit-error').hidden = false;
      return;
    }
    const previous = { ...option };
    Object.assign(option, { name, image });
    if (key === 'colors') option.hex = hex;
    try {
      await saveSettings();
      $('option-dialog').close();
      editingOption = null;
      renderOptions();
      showGlobalError('');
    } catch (error) {
      Object.assign(option, previous);
      console.error('Could not update designer option:', error);
      $('option-edit-error').textContent = 'تعذر حفظ التعديل. تحققي من الاتصال وحاولي مرة أخرى.';
      $('option-edit-error').hidden = false;
    }
  });
  $('option-edit-cancel').addEventListener('click', () => {
    $('option-dialog').close();
    editingOption = null;
  });

  $('addon-images-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const nextImages = Object.fromEntries(Object.keys(defaultAddonImages).map(key => [
      key, form.elements[key].value.trim()
    ]));
    if (Object.values(nextImages).some(image => !validImageReference(image))) {
      showGlobalError('كل الصور خاصها تكون بروابط HTTPS أو بمسارات داخل assets.');
      return;
    }
    const previous = settings.addonImages;
    settings.addonImages = nextImages;
    await persistAndRefresh(renderOptions, () => { settings.addonImages = previous; });
  });
  $('addon-images-form').addEventListener('input', event => {
    const input = event.target;
    if (Object.hasOwn(defaultAddonImages, input.name)) updateAddonPreview(input.name, input.value.trim());
  });

  $('content-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const phone = form.elements.whatsappPhone.value.replace(/\D/g, '');
    const instagram = form.elements.instagram.value.trim();
    const heroImage = form.elements.heroImage.value.trim();
    if (!/^\d{8,15}$/.test(phone) || !/^https:\/\//i.test(heroImage) ||
        (instagram && !/^https:\/\//i.test(instagram))) {
      showGlobalError('تحققي من رقم WhatsApp الدولي وروابط الصور والحسابات (HTTPS).');
      return;
    }
    const previous = { ...settings };
    for (const key of ['brandName', 'heroTitle', 'heroDescription', 'heroImage', 'story', 'location']) {
      settings[key] = form.elements[key].value.trim();
    }
    settings.instagram = instagram;
    settings.whatsappPhone = phone;
    settings.storeOpen = form.elements.storeOpen.checked;
    await persistAndRefresh(() => {}, () => { settings = previous; });
  });

  $('prices-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const prices = Object.fromEntries(['basePrice', 'extraPrice', 'card', 'box', 'led'].map(key => [
      key, Number(form.elements[key].value)
    ]));
    if (Object.values(prices).some(value => !Number.isFinite(value) || value < 0)) {
      showGlobalError('أدخلي أرقام أسعار صحيحة.');
      return;
    }
    const previous = settings.prices;
    settings.prices = prices;
    await persistAndRefresh(() => {}, () => { settings.prices = previous; });
  });

  async function initialize() {
    if (!window.krhSupabase) {
      $('setup-note').hidden = false;
      $('login-error').textContent = 'إعداد Supabase غير مكتمل. دخلة الإدارة غير متاحة حتى يكتمل الربط.';
      $('login-error').hidden = false;
      return;
    }
    try {
      const user = await verifyAdmin();
      if (user) await runAdmin(user);
    } catch (error) {
      console.error('Could not restore admin session:', error);
      setLoginError('تعذر التحقق من جلسة الإدارة.');
    }
  }

  initialize();
})();
