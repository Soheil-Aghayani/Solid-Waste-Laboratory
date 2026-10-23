// The one list of portal pages for navigation. Both page generators (build-pages.mjs, build-equipment-shells.mjs)
// read it, so a new page is added here once. `page` is the key used in build-pages.mjs; `href` is relative to the site root.

export const PRIMARY_NAV = [
  { page: 'home', href: 'index.html', label: 'خانه', icon: 'home' },
  { page: 'rules', href: 'rules.html', label: 'قوانین و ایمنی', icon: 'health_and_safety' },
  { page: 'quiz', href: 'quiz.html', label: 'آزمون ورود', icon: 'clipboard-check' },
  { page: 'gallery', href: 'gallery.html', label: 'کاتالوگ تجهیزات', icon: 'inventory_2' },
  { page: 'equipment', href: 'equipment.html', label: 'راهنمای تجهیزات', icon: 'test-tube' },
  { page: 'elements', href: 'elements.html', label: 'عناصر و مواد', icon: 'science' },
];

const GROUPS = {
  safety: ['rules', 'quiz'],
  catalog: ['equipment', 'elements', 'gallery'],
};

/** The group a page belongs to; ungrouped pages are their own group. */
export const pageGroup = page => Object.keys(GROUPS).find(group => GROUPS[group].includes(page)) ?? page;

const byPage = Object.fromEntries(PRIMARY_NAV.map(item => [item.page, item]));
const section = (label, icon, pages, labels = {}, icons = {}) => ({
  label,
  icon,
  links: pages.map(page => ({ ...byPage[page], label: labels[page] ?? byPage[page].label, icon: icons[page] ?? byPage[page].icon })),
});

/** The section navigation shown on mobile for pages that belong to a group. */
export const SECTION_NAV = {
  safety: section('ایمنی', 'health_and_safety', ['rules', 'quiz'],
    { rules: 'قوانین عمومی و ایمنی', quiz: 'آزمون و تعهدنامه ورود' }, { rules: 'book-bookmark' }),
  catalog: section('کاتالوگ آزمایشگاه', 'inventory_2', ['gallery', 'equipment', 'elements'],
    { gallery: 'گالری تجهیزات' }, { gallery: 'gallery' }),
};

/** The mobile bottom dock. `isCurrent(page)` decides which item is highlighted for a page. */
export const DOCK_NAV = [
  { href: 'index.html', label: 'خانه', icon: 'home', isCurrent: page => pageGroup(page) === 'home' },
  { href: 'rules.html', label: 'ایمنی', icon: 'health_and_safety', isCurrent: page => pageGroup(page) === 'safety' },
  { href: 'equipment.html', label: 'کاتالوگ', icon: 'inventory_2', isCurrent: page => page === 'equipment' || page === 'elements' },
  { href: 'gallery.html', label: 'گالری', icon: 'gallery', isCurrent: page => page === 'gallery' },
];
