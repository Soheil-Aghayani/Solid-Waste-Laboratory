(() => {
  const detailPage = document.querySelector('[data-equipment-slug]');
  if (!detailPage) return;

  const home = '../index.html';
  const rules = '../rules.html';
  const quiz = '../quiz.html';
  const gallery = '../gallery.html';
  const equipment = '../equipment.html';
  const elements = '../elements.html';

  const link = (href, label, icon, current = false) => `<a href="${href}"${current ? ' aria-current="page"' : ''}><span class="material-symbols-outlined" aria-hidden="true">${icon}</span><span>${label}</span></a>`;

  const desktopDock = document.createElement('nav');
  desktopDock.className = 'catalog-detail-dock catalog-detail-dock-desktop';
  desktopDock.setAttribute('aria-label', 'دسترسی سریع دسکتاپ');
  desktopDock.innerHTML = [
    link(home, 'خانه', 'home'),
    link(rules, 'قوانین و ایمنی', 'health_and_safety'),
    link(quiz, 'آزمون ورود', 'assignment'),
    link(gallery, 'گالری', 'gallery', true),
    link(equipment, 'تجهیزات', 'test-tube'),
    link(elements, 'عناصر و مواد', 'science')
  ].join('');
  document.body.appendChild(desktopDock);

  const mobileDock = document.createElement('nav');
  mobileDock.className = 'catalog-detail-dock catalog-detail-dock-mobile';
  mobileDock.setAttribute('aria-label', 'دسترسی سریع موبایل');
  mobileDock.innerHTML = [
    link(home, 'خانه', 'home'),
    link(rules, 'ایمنی', 'health_and_safety'),
    link(gallery, 'گالری', 'gallery', true),
    link(elements, 'عناصر', 'science')
  ].join('');
  document.body.appendChild(mobileDock);

  const emergencyButton = document.createElement('button');
  emergencyButton.className = 'catalog-detail-fab catalog-detail-emergency';
  emergencyButton.type = 'button';
  emergencyButton.setAttribute('aria-label', 'باز کردن شماره‌های اضطراری');
  emergencyButton.setAttribute('aria-controls', 'catalog-detail-emergency-dialog');
  emergencyButton.setAttribute('aria-expanded', 'false');
  emergencyButton.innerHTML = `
    <svg class="catalog-detail-fab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <title>فوریت‌های اضطراری</title>
      <path fill="currentColor" d="M10.25 19.25v-4.2l-3.65 2.1q-.625.35-1.325.175t-1.05-.825q-.35-.625-.175-1.325t.8-1.05L8.5 12L4.85 9.9q-.625-.35-.8-1.062T4.225 7.5t1.05-.8t1.325.175l3.65 2.1V4.75q0-.725.513-1.237T12 3t1.238.513t.512 1.237v4.225l3.65-2.1q.625-.35 1.325-.175t1.05.8t.163 1.338t-.813 1.062L15.5 12l3.65 2.125q.625.35.8 1.05t-.175 1.35q-.35.625-1.05.8T17.4 17.15l-3.65-2.1v4.2q0 .725-.513 1.238T12 21t-1.237-.513t-.513-1.237"/>
    </svg>`;
  document.body.appendChild(emergencyButton);

  const chatbotButton = document.createElement('button');
  chatbotButton.className = 'catalog-detail-fab catalog-detail-chat';
  chatbotButton.type = 'button';
  chatbotButton.id = 'catalog-detail-chat-loader';
  chatbotButton.setAttribute('aria-label', 'باز کردن دستیار هوشمند آزمایشگاه');
  chatbotButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">smart_toy</span>';
  document.body.appendChild(chatbotButton);

  const emergencyDialog = document.createElement('div');
  emergencyDialog.className = 'catalog-detail-emergency-dialog';
  emergencyDialog.id = 'catalog-detail-emergency-dialog';
  emergencyDialog.hidden = true;
  emergencyDialog.setAttribute('role', 'dialog');
  emergencyDialog.setAttribute('aria-modal', 'true');
  emergencyDialog.setAttribute('aria-labelledby', 'catalog-detail-emergency-title');
  emergencyDialog.innerHTML = `
    <div class="catalog-detail-emergency-panel">
      <div class="catalog-detail-emergency-heading"><div><span class="catalog-catalog-kicker">فوریت‌های آزمایشگاه</span><h2 id="catalog-detail-emergency-title">اگر حادثه‌ای رخ داد</h2></div><button type="button" class="catalog-detail-emergency-close" aria-label="بستن شماره‌های اضطراری"><span class="material-symbols-outlined" aria-hidden="true">close</span></button></div>
      <p>ابتدا کار را متوقف کنید، مسئول آزمایشگاه را خبر کنید و از دستورالعمل‌های ایمنی پیروی کنید.</p>
      <div class="catalog-detail-emergency-contacts">
        <a href="tel:115"><span>اورژانس پزشکی</span><strong>۱۱۵</strong></a>
        <a href="tel:125"><span>آتش‌نشانی</span><strong>۱۲۵</strong></a>
        <a href="${rules}"><span>قوانین و اقدامات ایمنی</span><strong><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></strong></a>
      </div>
    </div>
  `;
  document.body.appendChild(emergencyDialog);

  const emergencyClose = emergencyDialog.querySelector('.catalog-detail-emergency-close');
  let lastEmergencyFocus = null;
  const closeEmergency = () => {
    emergencyDialog.hidden = true;
    emergencyButton.setAttribute('aria-expanded', 'false');
    lastEmergencyFocus?.focus();
  };
  emergencyButton.addEventListener('click', () => {
    lastEmergencyFocus = document.activeElement;
    emergencyDialog.hidden = false;
    emergencyButton.setAttribute('aria-expanded', 'true');
    emergencyClose?.focus();
  });
  emergencyClose?.addEventListener('click', closeEmergency);
  emergencyDialog.addEventListener('click', event => {
    if (event.target === emergencyDialog) closeEmergency();
  });
  document.addEventListener('keydown', event => {
    if (emergencyDialog.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeEmergency();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = Array.from(emergencyDialog.querySelectorAll('button, a[href]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const loadStyle = href => new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve();
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = href;
    style.onload = resolve;
    style.onerror = reject;
    document.head.appendChild(style);
  });
  const loadScript = src => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  let chatbotLoading = null;
  chatbotButton.addEventListener('click', async () => {
    if (chatbotLoading) return;
    chatbotButton.disabled = true;
    chatbotButton.setAttribute('aria-busy', 'true');
    chatbotLoading = Promise.all([
      loadStyle('../chatbot/chatbot.min.css?v=5.9'),
      loadScript('../chatbot/msds/msds-db.min.js?v=5.9')
    ]).then(() => loadScript('../chatbot/chatbot.min.js?v=5.9'))
      .then(() => {
        const chatbotFab = document.getElementById('chatbot-fab');
        chatbotButton.remove();
        chatbotFab?.click();
      })
      .catch(error => {
        console.error('Assistant failed to load:', error);
        chatbotButton.disabled = false;
        chatbotButton.removeAttribute('aria-busy');
        chatbotLoading = null;
      });
    await chatbotLoading;
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('../sw.js', { scope: '../' })
        .catch(error => console.warn('Offline support failed to initialize:', error));
    }, { once: true });
  }
})();
