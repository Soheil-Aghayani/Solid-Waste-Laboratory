import fs from 'node:fs';
import path from 'node:path';
import { PRIMARY_NAV, SECTION_NAV, DOCK_NAV, pageGroup } from './site-nav.mjs';
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
  // Analysis tools: markup in pages/content/<key>.html, code in tools/<key>/ (ES modules, scoped stylesheet).
  ftir: {
    filename: 'ftir.html',
    title: 'طیف‌سنجی فروسرخ (FT-IR) | آزمایشگاه پسماند',
    description: 'انتساب‌های احتمالی باندهای فروسرخ را بررسی کنید و شواهد پشت هر انتساب را ببینید. داده‌های شما فقط در مرورگر پردازش می‌شود.',
    canonical: 'ftir.html',
    assets: [],
    tool: true,
    styles: ['tools/ftir/tool.css?v=1'],
    modules: ['tools/ftir/app.js?v=1'],
  },
  xrd: {
    filename: 'xrd.html',
    title: 'پراش پرتو ایکس (XRD) | آزمایشگاه پسماند',
    description: 'موقعیت پیک‌های پراش پرتو ایکس را با مرجع‌های بلوری گزیدهٔ COD مقایسه کنید و شواهد پشت هر فاز کاندید را ببینید. پویش‌ها فقط در مرورگر پردازش می‌شوند.',
    canonical: 'xrd.html',
    assets: [],
    tool: true,
    styles: ['tools/xrd/tool.css?v=1'],
    modules: ['tools/xrd/app.js?v=1'],
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

const readFragment = filename => fs.readFileSync(path.join(contentDirectory, filename), 'utf8').trim();

const fragments = {
  elements: elementsTab,
  rules: rulesContent,
  safetyWidgets,
  equipment: equipmentTab,
  gallery: galleryTab,
  quiz: quizTab,
  ftir: readFragment('ftir.html'),
  xrd: readFragment('xrd.html'),
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
  const items = PRIMARY_NAV.map(({ page, href, label, icon }) => [href, label, icon, currentPage === page]);
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
  const source = SECTION_NAV[group];
  const sections = source ? { ...source, links: source.links.map(({ page, href, label, icon }) => [href, label, icon, currentPage === page]) } : null;
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
  return `
    <nav class="mobile-bottom-dock" aria-label="دسترسی سریع موبایل">
      ${DOCK_NAV.map(({ href, label, icon, isCurrent }) => pageLink(href, label, icon, isCurrent(currentPage), 'mobile-dock-item')).join('\n      ')}
    </nav>`;
};

const renderDesktopDock = () => '';

// Home tiles: the Clay image already carries the mint backdrop, so a tile is the image plus a label.
// `href` makes a link; `open` clicks an existing floating control (see welcome-carousel.js).
const HOME_TILES = [
  { href: 'rules.html', tile: 'rules', title: 'قوانین و ایمنی', hint: 'ضوابط کار، پوشش و دفع پسماند' },
  { href: 'quiz.html', tile: 'quiz', title: 'آزمون ورود', hint: 'آزمون و تعهدنامه ورود به آزمایشگاه' },
  { href: 'gallery.html', tile: 'catalog', title: 'کاتالوگ تجهیزات', hint: 'تجهیزات بر اساس تصویر و کاربرد' },
  { href: 'equipment.html', tile: 'guides', title: 'راهنمای تجهیزات', hint: 'روش کار و نکات ایمنی هر وسیله' },
  { href: 'elements.html', tile: 'elements', title: 'عناصر و مواد', hint: 'عنصر، خواص پایه و اطلاعات ایمنی' },
  { href: 'elements.html#msds-details-card', tile: 'msds', title: 'برگهٔ ایمنی مواد', hint: 'خطرات و مواد ناسازگار یک ماده' },
  { href: 'elements.html#compatibility-widget-card', tile: 'compat', title: 'سازگاری مواد', hint: 'بررسی سازگاری پیش از مخلوط کردن' },
  { href: 'ftir.html', tile: 'ftir', title: 'طیف‌سنجی FT-IR', hint: 'انتساب باندهای طیف فروسرخ' },
  { href: 'xrd.html', tile: 'xrd', title: 'پراش پرتو ایکس', hint: 'مقایسهٔ پیک‌ها با مرجع‌های بلوری' },
  { open: 'emergency-fab', tile: 'emergency', title: 'شماره‌های اضطراری', hint: 'شماره‌ها و اقدام‌های فوری' },
  { open: 'chatbot-loader-fab', tile: 'assistant', title: 'دستیار هوشمند', hint: 'پرسش دربارهٔ تجهیزات، مواد و ایمنی' },
];

const renderHomeTile = ({ href, open, tile, title, hint }) => `
        <${open ? `button type="button" data-open="${open}"` : `a href="./${href}"`} class="tile" title="${hint}">
          <img src="./asset/tiles/tile-${tile}-256.webp" srcset="./asset/tiles/tile-${tile}-256.webp 1x, ./asset/tiles/tile-${tile}-512.webp 2x" width="128" height="128" alt="" loading="lazy" decoding="async">
          <span>${title}</span>
        </${open ? 'button' : 'a'}>`;

const renderHomeShortcuts = () => `
    <section class="home-tiles" aria-labelledby="home-tiles-title">
      <h2 id="home-tiles-title">یک کار را انتخاب کنید</h2>
      <div class="tile-grid">${HOME_TILES.map(renderHomeTile).join('')}
      </div>
    </section>`;

const renderHead = page => {
  const canonical = `https://soheil-aghayani.github.io/Solid-Waste-Laboratory/${page.canonical}`;
  const pageStyles = page.filename === 'gallery.html'
    ? '<link rel="stylesheet" href="./catalog-redesign.min.css?v=2.2">'
    : '';
  const elementStyles = page.filename === 'elements.html'
    ? '<link rel="stylesheet" href="./elements.min.css?v=2.0">'
    : '';
  const assetVersion = asset => asset === 'gallery.min.js' ? '3.5' : '2.2';
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
  <meta property="og:image" content="https://soheil-aghayani.github.io/Solid-Waste-Laboratory/Waste%20Lab.webp">
  <meta property="og:image:alt" content="آزمایشگاه پسماند">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.description}">
  <link rel="icon" type="image/webp" href="Waste%20Lab.webp">
  <link rel="preload" href="./asset/estedad-arabic-wght.woff2" as="font" type="font/woff2" crossorigin fetchpriority="high">
  <link rel="stylesheet" href="./styles.min.css?v=6.9">
  ${elementStyles ? `${elementStyles}\n  ` : ''}<link rel="stylesheet" href="./site-pages.min.css?v=3.4">${pageStyles ? `\n  ${pageStyles}` : ''}${(page.styles ?? []).map(href => `\n  <link rel="stylesheet" href="./${href}">`).join('')}
  <script>
    try {
      const savedTheme = localStorage.getItem('theme');
      const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', preferredTheme);
    } catch (error) {}
  </script>
  <script defer src="./asset/icon-system.min.js?v=1.0"></script>
  <script defer src="./site-navigation.min.js?v=1.1"></script>
  ${page.filename === 'gallery.html' || page.tool ? '' : '<script async fetchpriority="low" src="./script.min.js?v=7.4"></script>'}
  <script defer src="./site-runtime.min.js?v=1.9"></script>${page.filename === 'index.html' ? '\n  <script defer src="./welcome-carousel.min.js?v=2.3"></script>' : ''}
  ${page.assets.map(asset => `<script defer src="./${asset}?v=${assetVersion(asset)}"></script>`).join('\n  ')}${(page.modules ?? []).map(src => `\n  <script type="module" src="./${src}"></script>`).join('')}
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
  } else if (page.tool) {
    pageContent = `<section class="standalone-page tool-page ${pageKey}-page" aria-labelledby="${pageKey}-page-title">${fragments[pageKey]}</section>`;
  }

  return `
<body data-page="${pageKey}">
  <a class="skip-link" href="#main-content">پرش به محتوای اصلی</a>
  <main class="container site-container" id="main-content">
    <header class="site-header">
      ${pageKey === 'gallery' || page.tool ? galleryHeaderTop : headerTop}
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
