import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const indexPath = path.join(projectRoot, 'index.html');
const contentDirectory = path.join(projectRoot, 'pages', 'content');
const source = fs.readFileSync(indexPath, 'utf8');
const canonicalHome = 'https://soheil-aghayani.github.io/Solid-Waste-Laboratory/index.html';

const pageDefinitions = {
  home: {
    filename: 'index.html',
    title: 'آزمایشگاه پسماند | خانه',
    description: 'صفحهٔ اصلی آزمایشگاه پسماند؛ دسترسی سریع به ایمنی، تجهیزات، عناصر و گالری آزمایشگاه.',
    canonical: '',
    assets: [],
  },
  rules: {
    filename: 'rules.html',
    title: 'قوانین عمومی و ایمنی | آزمایشگاه پسماند',
    description: 'قوانین عمومی، پوشش حفاظتی، کار با مواد و مدیریت پسماند در آزمایشگاه پسماند.',
    canonical: 'rules.html',
    assets: [],
  },
  quiz: {
    filename: 'quiz.html',
    title: 'آزمون و تعهدنامه ورود | آزمایشگاه پسماند',
    description: 'تعهدنامه و آزمون سنجش ایمنی ورود به آزمایشگاه پسماند.',
    canonical: 'quiz.html',
    assets: [],
  },
  equipment: {
    filename: 'equipment.html',
    title: 'راهنمای کاربری تجهیزات | آزمایشگاه پسماند',
    description: 'راهنمای عملیاتی، نگهداری و خطاهای رایج تجهیزات آزمایشگاه پسماند.',
    canonical: 'equipment.html',
    assets: [],
  },
  gallery: {
    filename: 'gallery.html',
    title: 'گالری آزمایشگاه و کاتالوگ تجهیزات | آزمایشگاه پسماند',
    description: 'معرفی خانواده‌های تجهیزات و ظروف آزمایشگاهی با گزینه‌ها و مشخصات قابل بررسی.',
    canonical: 'gallery.html',
    assets: ['equipment-data.min.js', 'gallery.min.js'],
  },
  elements: {
    filename: 'elements.html',
    title: 'عناصر و مواد | آزمایشگاه پسماند',
    description: 'جدول تناوبی رنگ‌بندی‌شده، شناخت عناصر، ملاحظات ایمنی و جستجوی مواد آزمایشگاهی.',
    canonical: 'elements.html',
    assets: [],
  },
};

const getBetween = (text, startMarker, endMarker) => {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`Unable to extract between ${startMarker} and ${endMarker}`);
  return text.slice(start, end);
};

const stripTabWrapper = markup => {
  const wrapperStart = markup.indexOf('<div class="tab-content');
  const contentStart = markup.indexOf('>', wrapperStart) + 1;
  const contentEnd = markup.lastIndexOf('</div>');
  if (wrapperStart < 0 || contentStart <= 0 || contentEnd <= contentStart) {
    throw new Error('Unable to strip tab wrapper');
  }
  return markup.slice(contentStart, contentEnd).trim();
};

const writeIfMissing = (filename, content) => {
  const target = path.join(contentDirectory, filename);
  if (!fs.existsSync(target)) fs.writeFileSync(target, `${content.trim()}\n`, 'utf8');
  return fs.readFileSync(target, 'utf8').trim();
};

fs.mkdirSync(contentDirectory, { recursive: true });

const readOrExtract = (filename, extractor) => {
  const target = path.join(contentDirectory, filename);
  if (fs.existsSync(target)) return fs.readFileSync(target, 'utf8').trim();
  const content = extractor();
  fs.writeFileSync(target, `${content.trim()}\n`, 'utf8');
  return content.trim();
};

const elementsTab = readOrExtract('elements.html', () => stripTabWrapper(getBetween(source, '<!-- TAB 0: Elements and materials -->', '<!-- TAB 1: General Rules -->')));
const equipmentTab = readOrExtract('equipment.html', () => stripTabWrapper(getBetween(source, '<!-- TAB 2: Equipment Guides -->', '<!-- TAB 3: Laboratory Gallery -->')));
const galleryTab = readOrExtract('gallery.html', () => stripTabWrapper(getBetween(source, '<!-- TAB 3: Laboratory Gallery -->', '<!-- TAB 4: Safety Checklist & Quiz -->')));
const quizTab = readOrExtract('quiz.html', () => stripTabWrapper(getBetween(source, '<!-- TAB 4: Safety Checklist & Quiz -->', '<!-- Page Footer -->')));
const rulesContent = readOrExtract('rules.html', () => {
  const rulesTab = stripTabWrapper(getBetween(source, '<!-- TAB 1: General Rules -->', '<!-- TAB 2: Equipment Guides -->'));
  const rulesStart = rulesTab.indexOf('<div class="rules-carousel"');
  const msdsStart = rulesTab.indexOf('<div id="msds-widget-card"');
  if (rulesStart < 0 || msdsStart < 0) throw new Error('Unable to split rules content');
  return rulesTab.slice(rulesStart, msdsStart).trim();
});
const safetyWidgets = readOrExtract('safety-widgets.html', () => {
  const rulesTab = stripTabWrapper(getBetween(source, '<!-- TAB 1: General Rules -->', '<!-- TAB 2: Equipment Guides -->'));
  const msdsStart = rulesTab.indexOf('<div id="msds-widget-card"');
  const widgetsEnd = rulesTab.lastIndexOf('</div>');
  if (msdsStart < 0 || widgetsEnd < 0) throw new Error('Unable to split safety widgets');
  return rulesTab.slice(msdsStart, widgetsEnd).trim();
});

const headerTopStart = source.indexOf('<div class="header-top">');
const welcomeStart = source.indexOf('<section class="welcome-panel"', headerTopStart);
const headerEndBeforeWelcome = source.indexOf('    </header>', headerTopStart);
const welcomeEnd = source.indexOf('</section>', welcomeStart) + '</section>'.length;
const headerContainsWelcome = headerEndBeforeWelcome < 0 || headerEndBeforeWelcome > welcomeStart;
const headerEnd = headerContainsWelcome ? source.indexOf('    </header>', welcomeStart) : headerEndBeforeWelcome;
if (headerTopStart < 0 || welcomeStart < 0 || headerEnd < 0 || welcomeEnd <= welcomeStart) throw new Error('Unable to extract shared header');
const headerTop = source.slice(headerTopStart, headerContainsWelcome ? welcomeStart : headerEnd)
  .replace(/\s*<nav class="site-primary-nav"[\s\S]*?<\/nav>/g, '')
  .trim();
const galleryHeaderTop = headerTop.replace(/\s*<!-- Live Search Bar -->[\s\S]*?(?=<div id="offline-status")/, `
      <div class="search-container">
        <label for="gallery-equipment-search" class="sr-only">جستجو در کاتالوگ تجهیزات</label>
        <input type="text" id="gallery-equipment-search" class="search-input" autocomplete="off" enterkeyhint="search" placeholder="مثلاً بشر، فالکون، بوته یا شیشه‌آلات">
        <button id="search-voice-btn" class="search-voice-btn" title="جستجوی صوتی" aria-label="جستجوی صوتی">
          <span class="material-symbols-outlined">mic</span>
        </button>
        <span class="material-symbols-outlined search-icon">search</span>
      </div>
      <div id="search-status-banner" class="search-status-banner" role="status" aria-live="polite" style="display: none;"></div>
      `);
const welcomePanel = source.slice(welcomeStart, welcomeEnd).trim();

const penaltyStart = source.indexOf('    <!-- Penalty warning -->');
const navigationStart = penaltyStart >= 0 ? source.indexOf('    <!-- Navigation Tabs -->', penaltyStart) : -1;
const penaltyBanner = penaltyStart >= 0 && navigationStart >= 0
  ? source.slice(penaltyStart, navigationStart).trim()
  : '<div class="penalty-banner"><span class="material-symbols-outlined penalty-icon">gpp_maybe</span><div class="penalty-text">مهم: در صورتی که دانشجویی از قوانین و موارد زیر تخطی کند، به‌مدت ۱۰ روز اجازه فعالیت در آزمایشگاه را نخواهد داشت.</div></div>';

const footerStart = source.indexOf('  <footer class="site-footer"');
const footerEnd = source.indexOf('  </footer>', footerStart) + '  </footer>'.length;
const footer = source.slice(footerStart, footerEnd)
  .replaceAll('href="index.html#tab-general" data-tab-link="tab-general"', 'href="./rules.html"')
  .replaceAll('href="index.html#tab-elements" data-tab-link="tab-elements"', 'href="./elements.html"')
  .replaceAll('href="index.html#tab-equipment" data-tab-link="tab-equipment"', 'href="./equipment.html"')
  .replaceAll('href="index.html#tab-gallery" data-tab-link="tab-gallery"', 'href="./gallery.html"')
  .replaceAll('href="index.html#msds-widget-card" data-tab-link="tab-general"', 'href="./elements.html#msds-widget-card"')
  .replaceAll('href="index.html#compatibility-widget-card" data-tab-link="tab-equipment"', 'href="./elements.html#compatibility-widget-card"')
  .replaceAll('href="index.html#tab-quiz" data-tab-link="tab-quiz"', 'href="./quiz.html"');

const sharedStart = source.indexOf('  <!-- Chemical Suggestion Modal -->');
const runtimeStart = source.indexOf('  <script>', sharedStart);
const bodyEnd = source.lastIndexOf('</body>');
const existingDesktopDockStart = source.indexOf('  <nav class="desktop-bottom-dock"', sharedStart);
const existingDockStart = source.indexOf('  <nav class="mobile-bottom-dock"', sharedStart);
const existingNavigationDockStart = existingDesktopDockStart >= 0 ? existingDesktopDockStart : existingDockStart;
const sharedEnd = runtimeStart >= 0 ? runtimeStart : existingNavigationDockStart >= 0 ? existingNavigationDockStart : bodyEnd;
const sharedMarkup = source.slice(sharedStart, sharedEnd).trim();
const runtimeMatch = runtimeStart >= 0
  ? source.slice(runtimeStart, bodyEnd).match(/<script>\r?\n([\s\S]*?)\r?\n  <\/script>/)
  : null;
const runtimePath = path.join(projectRoot, 'site-runtime.js');
if (!fs.existsSync(runtimePath) && runtimeMatch) fs.writeFileSync(runtimePath, `${runtimeMatch[1].trim()}\n`, 'utf8');

const fragments = {
  elements: elementsTab,
  rules: rulesContent,
  safetyWidgets,
  equipment: equipmentTab,
  gallery: galleryTab,
  quiz: quizTab,
};

const pageGroup = page => {
  if (page === 'rules' || page === 'quiz') return 'safety';
  if (page === 'equipment' || page === 'elements' || page === 'gallery') return 'catalog';
  return page;
};

const pageLink = (href, label, iconName, current, extraClass = '') => {
  const currentAttr = current ? ' aria-current="page"' : '';
  const isIconOnly = extraClass.split(/\s+/).includes('site-nav-home');
  const accessibleLabel = isIconOnly ? ` aria-label="${label}" title="${label}"` : '';
  const labelClass = isIconOnly ? ' class="site-nav-label"' : '';
  const targetHref = href === 'index.html' ? canonicalHome : `./${href}`;
  return `<a class="site-nav-link${current ? ' is-active' : ''}${extraClass ? ` ${extraClass}` : ''}" href="${targetHref}"${currentAttr}${accessibleLabel}><span class="material-symbols-outlined" aria-hidden="true">${iconName}</span><span${labelClass}>${label}</span></a>`;
};

const renderPrimaryNav = currentPage => {
  const items = [
    ['index.html', 'خانه', 'home', currentPage === 'home'],
    ['rules.html', 'قوانین و ایمنی', 'health_and_safety', currentPage === 'rules'],
    ['quiz.html', 'آزمون ورود', 'clipboard-check', currentPage === 'quiz'],
    ['gallery.html', 'کاتالوگ تجهیزات', 'inventory_2', currentPage === 'gallery'],
    ['equipment.html', 'راهنمای تجهیزات', 'test-tube', currentPage === 'equipment'],
    ['elements.html', 'عناصر و مواد', 'science', currentPage === 'elements'],
  ];
  const links = items.map(([href, label, iconName, current]) => pageLink(href, label, iconName, current, 'site-primary-nav-link')).join('');
  return `
      <nav class="site-primary-nav" aria-label="منوی اصلی سایت">
        <div class="site-primary-nav-links">${links}</div>
        <details class="site-primary-nav-mobile">
          <summary><span class="material-symbols-outlined" aria-hidden="true">menu</span><span>باز کردن منوی سایت</span><span class="material-symbols-outlined" aria-hidden="true">expand_more</span></summary>
          <div class="site-primary-nav-mobile-links">${items.map(([href, label, iconName, current]) => pageLink(href, label, iconName, current, 'site-primary-nav-mobile-link')).join('')}</div>
        </details>
      </nav>`;
};

const renderMobileSectionNav = currentPage => {
  if (currentPage === 'gallery') return '';
  const group = pageGroup(currentPage);
  const sections = group === 'safety'
    ? {
      label: 'ایمنی',
      icon: 'health_and_safety',
      links: [
        ['rules.html', 'قوانین عمومی و ایمنی', 'book-bookmark', currentPage === 'rules'],
        ['quiz.html', 'آزمون و تعهدنامه ورود', 'clipboard-check', currentPage === 'quiz'],
      ],
    }
    : group === 'catalog'
      ? {
        label: 'کاتالوگ آزمایشگاه',
        icon: 'inventory_2',
        links: [
          ['gallery.html', 'گالری تجهیزات', 'gallery', currentPage === 'gallery'],
          ['equipment.html', 'راهنمای تجهیزات', 'test-tube', currentPage === 'equipment'],
          ['elements.html', 'عناصر و مواد', 'science', currentPage === 'elements'],
        ],
      }
      : null;
  if (!sections) return '';
  return `
      <nav class="mobile-section-nav" aria-label="صفحه‌های ${sections.label}">
        <div class="mobile-section-nav-heading"><span class="material-symbols-outlined" aria-hidden="true">${sections.icon}</span><span>${sections.label}</span></div>
        <div class="mobile-section-nav-links">
          ${sections.links.map(([href, label, iconName, current]) => pageLink(href, label, iconName, current, 'mobile-section-nav-link')).join('')}
        </div>
      </nav>`;
};

const renderMobileDock = currentPage => {
  const currentGroup = pageGroup(currentPage);
  return `
    <nav class="mobile-bottom-dock" aria-label="دسترسی سریع موبایل">
      ${pageLink('index.html', 'خانه', 'home', currentGroup === 'home', 'mobile-dock-item')}
      ${pageLink('rules.html', 'ایمنی', 'health_and_safety', currentGroup === 'safety', 'mobile-dock-item')}
      ${pageLink('equipment.html', 'کاتالوگ', 'inventory_2', currentPage === 'equipment' || currentPage === 'elements', 'mobile-dock-item')}
      ${pageLink('gallery.html', 'گالری', 'gallery', currentPage === 'gallery', 'mobile-dock-item')}
    </nav>`;
};

const renderDesktopDock = () => '';

const renderHomeShortcuts = () => `
    <section class="home-shortcuts" aria-labelledby="home-shortcuts-title">
      <div class="section-heading-row">
        <div><span class="page-kicker">شروع سریع</span><h2 id="home-shortcuts-title">یک کار را انتخاب کنید</h2><p>برای رفتن به بخش درست، یکی از مسیرهای زیر را انتخاب کنید.</p></div>
      </div>
      <div class="home-shortcut-grid">
        <a class="home-shortcut home-route" href="./rules.html">
          <span class="home-shortcut-heading"><span class="material-symbols-outlined" aria-hidden="true">health_and_safety</span><strong>قوانین و ایمنی</strong></span>
          <span class="home-route-copy">پیش از ورود، ضوابط کار، پوشش و دفع پسماند را مرور کنید.</span><span class="home-route-action">مشاهدهٔ قوانین <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></span>
        </a>
        <a class="home-shortcut home-route" href="./quiz.html">
          <span class="home-shortcut-heading"><span class="material-symbols-outlined" aria-hidden="true">clipboard-check</span><strong>آزمون و تعهدنامه ورود</strong></span>
          <span class="home-route-copy">آمادگی خود را بسنجید و ورود مسئولانه را ثبت کنید.</span><span class="home-route-action">شروع آزمون <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></span>
        </a>
        <a class="home-shortcut home-route" href="./gallery.html">
          <span class="home-shortcut-heading"><span class="material-symbols-outlined" aria-hidden="true">inventory_2</span><strong>کاتالوگ تجهیزات</strong></span>
          <span class="home-route-copy">تجهیزات را بر اساس تصویر، کاربرد و خانواده پیدا کنید.</span><span class="home-route-action">ورود به کاتالوگ <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></span>
        </a>
        <a class="home-shortcut home-route" href="./elements.html">
          <span class="home-shortcut-heading"><span class="material-symbols-outlined" aria-hidden="true">science</span><strong>عناصر و مواد</strong></span>
          <span class="home-route-copy">عنصر، خواص پایه و اطلاعات ایمنی ماده را بررسی کنید.</span><span class="home-route-action">مشاهدهٔ عناصر <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></span>
        </a>
      </div>
    </section>`;

const renderHead = page => {
  const canonical = `https://soheil-aghyani.github.io/Solid-Waste-Laboratory/${page.canonical}`;
  const pageStyles = page.filename === 'gallery.html'
    ? '<link rel="stylesheet" href="./catalog-redesign.min.css?v=2.2">'
    : '';
  const elementStyles = page.filename === 'elements.html'
    ? '<link rel="stylesheet" href="./elements.min.css?v=2.0">'
    : '';
  const assetVersion = asset => asset === 'gallery.min.js' ? '3.4' : '2.2';
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f172a">
  <link rel="manifest" href="./manifest.webmanifest">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="author" content="سهیل آقایانی">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fa_IR">
  <meta property="og:site_name" content="آزمایشگاه پسماند">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://soheil-aghyani.github.io/Solid-Waste-Laboratory/Waste%20Lab.webp">
  <meta property="og:image:alt" content="آزمایشگاه پسماند">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.description}">
  <link rel="icon" type="image/webp" href="Waste%20Lab.webp">
  <link rel="preload" href="./asset/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossorigin fetchpriority="high">
  <link rel="stylesheet" href="./styles.min.css?v=6.5">
  ${elementStyles ? `${elementStyles}\n  ` : ''}<link rel="stylesheet" href="./site-pages.min.css?v=2.8">${pageStyles ? `\n  ${pageStyles}` : ''}
  <script>
    try {
      const savedTheme = localStorage.getItem('theme');
      const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', preferredTheme);
    } catch (error) {}
  </script>
  <script defer src="./asset/icon-system.min.js?v=1.0"></script>
  <script defer src="./site-navigation.min.js?v=1.1"></script>
  ${page.filename === 'gallery.html' ? '' : '<script async fetchpriority="low" src="./script.min.js?v=7.4"></script>'}
  <script defer src="./site-runtime.min.js?v=1.7"></script>${page.filename === 'index.html' ? '\n  <script defer src="./welcome-carousel.min.js?v=2.2"></script>' : ''}
  ${page.assets.map(asset => `<script defer src="./${asset}?v=${assetVersion(asset)}"></script>`).join('\n  ')}
</head>`;
};

const renderMain = (pageKey, page) => {
  let pageContent = '';
  if (pageKey === 'home') {
    pageContent = renderHomeShortcuts();
  } else if (pageKey === 'rules') {
    pageContent = `${penaltyBanner}<section class="standalone-page rules-page" aria-labelledby="rules-page-title"><div class="sr-only"><h1 id="rules-page-title">قوانین عمومی و ایمنی</h1></div>${fragments.rules}</section>`;
  } else if (pageKey === 'quiz') {
    pageContent = `<section class="standalone-page quiz-page" aria-labelledby="quiz-page-title"><div class="sr-only"><h1 id="quiz-page-title">آزمون و تعهدنامه ورود</h1></div>${fragments.quiz}</section>`;
  } else if (pageKey === 'equipment') {
    pageContent = `<section class="standalone-page equipment-page" aria-labelledby="equipment-page-title"><div class="sr-only"><h1 id="equipment-page-title">راهنمای کاربری تجهیزات</h1></div>${fragments.equipment}</section>`;
  } else if (pageKey === 'gallery') {
    pageContent = `<section class="standalone-page gallery-page" aria-labelledby="gallery-page-title"><div class="sr-only"><h1 id="gallery-page-title">گالری آزمایشگاه و کاتالوگ تجهیزات</h1></div>${fragments.gallery}</section>`;
  } else if (pageKey === 'elements') {
    pageContent = `<section class="standalone-page elements-page" aria-labelledby="elements-page-title"><div class="sr-only"><h1 id="elements-page-title">عناصر و مواد</h1></div><div class="elements-page-stack"><details class="elements-accordion elements-accordion-primary"><summary><span class="material-symbols-outlined" aria-hidden="true">science</span><span><strong>جدول تناوبی عناصر</strong><small>جستجو، فیلتر و معرفی عنصرها</small></span><span class="material-symbols-outlined elements-accordion-chevron" aria-hidden="true">expand_more</span></summary><div class="elements-accordion-body">${fragments.elements}</div></details><details class="elements-accordion elements-accordion-msds"><summary><span class="material-symbols-outlined" aria-hidden="true">health_and_safety</span><span><strong>برگهٔ اطلاعات ایمنی و دفع پسماند</strong><small>MSDS Quick Lookup و بررسی سازگاری مواد</small></span><span class="material-symbols-outlined elements-accordion-chevron" aria-hidden="true">expand_more</span></summary><div class="elements-accordion-body"><section class="elements-support-tools" aria-label="ابزارهای MSDS و سازگاری مواد">${fragments.safetyWidgets}</section></div></details></div></section>`;
  }

  return `
<body data-page="${pageKey}">
  <a class="skip-link" href="#main-content">پرش به محتوای اصلی</a>
  <main class="container site-container" id="main-content">
    <header class="site-header">
      ${pageKey === 'gallery' ? galleryHeaderTop : headerTop}
      ${renderPrimaryNav(pageKey)}
    </header>
    ${pageKey === 'home' ? `<div class="home-welcome-flow">${welcomePanel}</div>` : ''}
    ${pageContent}
    ${footer}
  </main>
  ${sharedMarkup}
  ${renderDesktopDock(pageKey)}
  ${renderMobileDock(pageKey)}
</body>
</html>`;
};

for (const [pageKey, page] of Object.entries(pageDefinitions)) {
  const html = `${renderHead(page)}${renderMain(pageKey, page)}`
    .split('\n')
    .map(line => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .trimEnd() + '\n';
  const normalizedHtml = html.replaceAll('href="./index.html"', `href="${canonicalHome}"`);
  fs.writeFileSync(path.join(projectRoot, page.filename), normalizedHtml, 'utf8');
}

console.log(`Built ${Object.keys(pageDefinitions).length} standalone pages and ${Object.keys(fragments).length} content fragments.`);
