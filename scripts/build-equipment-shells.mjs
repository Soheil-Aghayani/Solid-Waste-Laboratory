import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const equipmentDirectory = path.join(projectRoot, 'Equipment');
const canonicalHome = 'https://soheil-aghayani.github.io/Solid-Waste-Laboratory/index.html';
const portalSource = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const catalogContext = { window: {} };
vm.createContext(catalogContext);
vm.runInContext(fs.readFileSync(path.join(projectRoot, 'equipment-data.js'), 'utf8'), catalogContext);
const equipmentCatalog = Array.isArray(catalogContext.window.LAB_EQUIPMENT_CATALOG)
  ? catalogContext.window.LAB_EQUIPMENT_CATALOG
  : [];

const footerStart = portalSource.indexOf('  <footer class="site-footer"');
const footerEnd = portalSource.indexOf('  </footer>', footerStart) + '  </footer>'.length;
if (footerStart < 0 || footerEnd <= footerStart) throw new Error('Unable to extract shared footer from index.html');

const sharedFooter = portalSource
  .slice(footerStart, footerEnd)
  .replace(/  <footer class="site-footer"[^>]*>/, '  <footer class="site-footer catalog-detail-site-footer" role="contentinfo">')
  .replaceAll('href="./', 'href="../');

const readMeta = (source, name) => source.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i'))?.[1] || '';
const readTitle = source => source.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || 'تجهیزات آزمایشگاه | آزمایشگاه پسماند';
const readCanonical = source => source.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] || '';
const readSlug = source => source.match(/data-equipment-slug="([^"]+)"/i)?.[1] || '';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[character]));

const renderDetailPrimaryNav = () => {
  const items = [
    [canonicalHome, 'خانه', 'home'],
    ['../rules.html', 'قوانین و ایمنی', 'health_and_safety'],
    ['../quiz.html', 'آزمون ورود', 'clipboard-check'],
    ['../gallery.html', 'کاتالوگ تجهیزات', 'inventory_2', true],
    ['../equipment.html', 'راهنمای تجهیزات', 'test-tube'],
    ['../elements.html', 'عناصر و مواد', 'science'],
  ];
  const links = items.map(([href, label, icon, current]) => `<a class="site-nav-link site-primary-nav-link${current ? ' is-active' : ''}" href="${href}"${current ? ' aria-current="page"' : ''}><span class="material-symbols-outlined" aria-hidden="true">${icon}</span><span>${label}</span></a>`).join('');
  const mobileLinks = links.replaceAll('site-primary-nav-link', 'site-primary-nav-mobile-link');
  return `<nav class="site-primary-nav" aria-label="منوی اصلی سایت"><div class="site-primary-nav-links">${links}</div><details class="site-primary-nav-mobile"><summary><span class="material-symbols-outlined" aria-hidden="true">menu</span><span>باز کردن منوی سایت</span><span class="material-symbols-outlined" aria-hidden="true">expand_more</span></summary><div class="site-primary-nav-mobile-links">${mobileLinks}</div></details></nav>`;
};

const renderInitialDetail = family => {
  if (!family?.variants?.length) return '';
  const variant = family.variants[0];
  const image = `../asset/equipment/detail-360/${encodeURIComponent(variant.image)}`;
  const imageSrcset = `${image} 360w, ../asset/equipment/detail-600/${encodeURIComponent(variant.image)} 600w`;
  const imageMobileSrcset = `${image} 360w, ../asset/equipment/detail-480/${encodeURIComponent(variant.image)} 480w`;
  const titleFa = escapeHtml(family.titleFa);
  const titleEn = escapeHtml(family.titleEn);
  const category = escapeHtml(family.categoryLabel);
  const variantTitle = escapeHtml(variant.titleFa);
  const variantDetail = escapeHtml(variant.detail);
  const introduction = escapeHtml(family.introduction);
  const primaryUse = escapeHtml(family.primaryUse);
  const count = family.variantSummary || `${family.variants.length} گزینه در این خانواده`;
  const mediaImage = family.comparison
    ? `<picture><source media="(max-width: 700px)" srcset="${imageMobileSrcset}" sizes="(max-width: 700px) calc(100vw - 80px), 560px"><img class="equipment-detail-image" data-detail-image src="${image}" srcset="${imageSrcset}" sizes="(max-width: 700px) calc(100vw - 80px), 560px" alt="${variantTitle}" loading="eager" fetchpriority="high" decoding="async" width="720" height="540"></picture>`
    : `<img class="equipment-detail-image" data-detail-image src="${image}" srcset="${imageSrcset}" sizes="(max-width: 700px) calc(100vw - 80px), 560px" alt="${variantTitle}" loading="eager" fetchpriority="high" decoding="async" width="720" height="540">`;

  if (family.presentation === 'crucible-guide') {
    return `
      <header class="equipment-detail-header crucible-guide-header">
        <div><span class="equipment-detail-kicker">راهنمای آشنایی با تجهیزات حرارتی</span><h1 class="equipment-detail-title">${titleFa}</h1><p class="equipment-detail-title-en" dir="ltr">${titleEn}</p></div>
        <span class="equipment-detail-category">${category}</span>
      </header>
      <section class="crucible-guide-hero" aria-labelledby="crucible-guide-hero-title">
        <div class="crucible-guide-hero-copy"><span class="crucible-guide-kicker">قبل از ظرفیت، جنس را بشناس</span><h2 id="crucible-guide-hero-title">جنس بدنه، انتخاب بوته را مشخص می‌کند</h2><p>بوته‌ها ظاهر مشابهی دارند، اما برای دما و مواد یکسان ساخته نشده‌اند. این راهنما تفاوت جنس‌ها و انتخاب مناسب برای کاربرد آزمایشگاهی را توضیح می‌دهد.</p></div>
        <div class="crucible-guide-visual"><div class="crucible-guide-image-frame"><img class="crucible-guide-image" data-detail-image src="${image}" srcset="${imageSrcset}" sizes="(max-width: 700px) calc(100vw - 80px), 560px" alt="${variantTitle}" loading="eager" fetchpriority="high" decoding="async" width="720" height="540"></div><div class="crucible-guide-image-caption"><span>جنس انتخاب‌شده</span><strong>${escapeHtml(variant.metadata?.material || 'بوته')}</strong><p data-detail-caption>${escapeHtml(variant.imageCaption || variant.titleFa)}</p></div></div>
      </section>`;
  }

  return `
      <header class="equipment-detail-header">
        <div><span class="equipment-detail-kicker">کاتالوگ تجهیزات آزمایشگاه</span><h1 class="equipment-detail-title">${titleFa}</h1><p class="equipment-detail-title-en" dir="ltr">${titleEn}</p></div>
        <span class="equipment-detail-category">${category}</span>
      </header>
      <section class="equipment-detail-hero" aria-labelledby="equipment-detail-intro-title">
        <div class="equipment-detail-media"><div class="equipment-detail-image-frame">${mediaImage}</div><p class="equipment-detail-image-caption" data-detail-caption>${variantTitle}</p></div>
        <div class="equipment-detail-intro"><p class="equipment-detail-summary" id="equipment-detail-intro-title">${introduction}</p><div class="equipment-detail-meta" aria-label="خلاصهٔ اطلاعات"><div class="equipment-detail-meta-item"><span>کاربرد اصلی</span><strong>${primaryUse}</strong></div><div class="equipment-detail-meta-item"><span>تعداد گزینه‌ها</span><strong>${escapeHtml(count)}</strong></div></div><div class="equipment-detail-selected" aria-live="polite"><h2>گزینهٔ انتخاب‌شده</h2><strong class="equipment-detail-selected-title" data-detail-title>${variantTitle}</strong><p class="equipment-detail-selected-copy" data-detail-copy>${variantDetail}</p></div></div>
      </section>`;
};

const files = fs.readdirSync(equipmentDirectory)
  .filter(file => file.endsWith('.html'))
  .sort((left, right) => left.localeCompare(right));

files.forEach(file => {
  const target = path.join(equipmentDirectory, file);
  const source = fs.readFileSync(target, 'utf8');
  const slug = readSlug(source);
  if (!slug) throw new Error(`Missing equipment slug in ${file}`);

  const family = equipmentCatalog.find(item => item.slug === slug);
  const defaultImage = family?.variants?.[0]?.image;
  const defaultImageHref = defaultImage && !family?.comparison
    ? `../asset/equipment/detail-360/${encodeURIComponent(defaultImage)}`
    : '';
  const defaultImageSrcset = defaultImage
    ? `${defaultImageHref} 360w, ../asset/equipment/detail-600/${encodeURIComponent(defaultImage)} 600w`
    : '';

  const canonical = readCanonical(source) || `https://soheil-aghyani.github.io/Solid-Waste-Laboratory/Equipment/${file}`;
  const description = readMeta(source, 'description') || 'معرفی آموزشی تجهیزات، کاربرد، تفاوت گزینه‌ها و نکات ایمنی در آزمایشگاه پسماند.';
  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0f172a">
  <title>${readTitle(source)}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="سهیل آقایانی">
  <link rel="canonical" href="${canonical}">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="icon" type="image/webp" href="../Waste%20Lab.webp">
  <link rel="preload" href="../asset/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossorigin fetchpriority="high">
${defaultImageHref ? `  <link rel="preload" href="${defaultImageHref}" imagesrcset="${defaultImageSrcset}" imagesizes="(max-width: 700px) calc(100vw - 80px), 560px" as="image" fetchpriority="high">` : ''}
  <script>try{const t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
  <link rel="stylesheet" href="../styles.min.css?v=6.5">
  <link rel="stylesheet" href="../site-pages.min.css?v=2.8">
  <link rel="stylesheet" href="../equipment-detail.min.css?v=2.0">
  <link rel="stylesheet" href="../catalog-detail-chrome.min.css?v=1.6">
  <script defer src="../asset/icon-system.min.js?v=1.0"></script>
  <script defer src="../site-navigation.min.js?v=1.1"></script>
  <script defer src="../equipment-data.min.js?v=2.2"></script>
  <script defer src="../catalog-detail-runtime.min.js?v=1.2"></script>
  <script defer src="../equipment-detail.min.js?v=2.1"></script>
</head>
<body data-page="equipment-detail" class="equipment-detail-loading">
  <a class="skip-link" href="#equipment-detail-root">پرش به محتوای اصلی</a>
  <main class="container site-container equipment-detail-page" id="main-content" data-equipment-slug="${slug}">
    <header class="site-header catalog-detail-site-header">
      <div class="header-top">
        <a class="brand brand-link" href="${canonicalHome}" aria-label="بازگشت به صفحهٔ خانه" title="بازگشت به صفحهٔ خانه">
          <span class="material-symbols-outlined brand-icon">science</span>
          <div class="brand-text">
            <h1>آزمایشگاه پسماند</h1>
            <p>سامانه جامع مقررات، ایمنی و کاربری تجهیزات</p>
          </div>
        </a>
        <div class="controls">
          <div class="status-widget">
            <span class="status-dot" id="status-dot"></span>
            <span id="status-text" role="status" aria-live="polite">درحال بررسی وضعیت آزمایشگاه...</span>
          </div>
          <a class="catalog-detail-header-back equipment-detail-back" href="../gallery.html" aria-label="بازگشت به کاتالوگ تجهیزات">
            <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            <span>بازگشت به کاتالوگ</span>
          </a>
          <button class="theme-btn equipment-detail-theme" id="equipment-detail-theme" type="button" aria-label="تغییر پوسته"><span class="material-symbols-outlined" aria-hidden="true">dark_mode</span></button>
        </div>
      </div>
      ${renderDetailPrimaryNav()}
    </header>
  <div class="equipment-detail-shell">
      <div id="equipment-detail-root">${renderInitialDetail(family)}</div>
    </div>
    <div class="equipment-detail-return" role="navigation" aria-label="بازگشت به کاتالوگ">
      <a href="../gallery.html" aria-label="بازگشت به کاتالوگ تجهیزات">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        <span>بازگشت به کاتالوگ تجهیزات</span>
      </a>
    </div>
${sharedFooter}
  </main>
</body>
</html>
`;
  fs.writeFileSync(target, html, 'utf8');
});

console.log(`Built ${files.length} equipment detail shells.`);
