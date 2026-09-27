(() => {
  const catalog = Array.isArray(window.LAB_EQUIPMENT_CATALOG) ? window.LAB_EQUIPMENT_CATALOG : [];
  const categoryLabels = {
    all: 'همهٔ تجهیزات',
    glassware: 'شیشه‌آلات',
    plasticware: 'پلاستیک‌آلات',
    porcelain: 'چینی و سرامیک',
    crucibles: 'بوته‌ها',
    metal: 'ظروف فلزی',
    solutions: 'محلول و خشک‌کننده',
    accessories: 'لوازم جانبی'
  };
  const sortLabels = {
    recommended: 'پیشنهادی',
    alpha: 'الفبایی',
    variants: 'تعداد گزینه‌ها'
  };

  const toPersianDigits = value => String(value).replace(/[0-9]/g, digit => '۰۱۲۳۴۵۶۷۸۹'[digit]);
  const normalise = value => String(value || '').toLocaleLowerCase('fa-IR').replace(/[\u200c\s]+/g, ' ').trim();
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));

  function getSearchText(family) {
    return normalise([
      family.titleFa,
      family.titleEn,
      family.category,
      family.categoryLabel,
      ...(family.aliases || []),
      family.summary,
      family.introduction,
      family.primaryUse,
      ...(family.sources || []).flatMap(source => [source.label, source.url]),
      ...(family.variants || []).flatMap(variant => [variant.titleFa, variant.titleEn, variant.label, variant.detail])
    ].join(' '));
  }

  function variantLabel(family) {
    const count = Array.isArray(family.variants) ? family.variants.length : 0;
    return count > 1 ? `${toPersianDigits(count)} گزینه` : 'یک گزینه';
  }

  function renderEquipmentCard(family, index) {
    const firstVariant = family.variants?.[0];
    if (!firstVariant) return '';

    const image = family.cardImage || firstVariant.image;
    // Only the first result is part of the initial viewport. Keeping the rest
    // lazy prevents the mobile catalog from downloading the whole shelf before
    // the reader has interacted with it.
    const loading = index === 0 ? 'eager' : 'lazy';
    const fetchPriority = index === 0 ? ' fetchpriority="high"' : '';
    const categoryLabel = family.categoryLabel || categoryLabels[family.category] || 'تجهیزات آزمایشگاه';
    const title = escapeHtml(family.titleFa);
    const titleEn = escapeHtml(family.titleEn);
    const encodedImage = encodeURIComponent(image);
    const compactImage = `./asset/equipment/catalog-240/${encodedImage}`;
    const thumbnailImage = `./asset/equipment/catalog-480/${encodedImage}`;

    return `
      <article class="equipment-catalog-card" data-equipment-category="${escapeHtml(family.category)}" data-equipment-search="${escapeHtml(getSearchText(family))}">
        <a class="equipment-card-link" href="./Equipment/${encodeURIComponent(family.slug)}.html" aria-label="مشاهدهٔ صفحهٔ معرفی ${title}">
          <div class="equipment-card-image-wrap">
            <img class="equipment-card-image" src="${compactImage}" srcset="${compactImage} 240w, ${thumbnailImage} 480w" sizes="(max-width: 680px) 112px, 208px" alt="${title}" loading="${loading}" decoding="async" draggable="false" width="480" height="480"${fetchPriority}>
          </div>
          <div class="equipment-card-body">
            <div class="equipment-card-meta">
              <span class="equipment-card-category-line">${escapeHtml(categoryLabel)}</span>
              <span class="equipment-card-variant-count">${variantLabel(family)}</span>
            </div>
            <h3 class="equipment-card-title">${title}</h3>
            <p class="equipment-card-en" dir="ltr">${titleEn}</p>
            <p class="equipment-card-summary">${escapeHtml(family.summary || family.introduction || 'معرفی کاربرد و نکات انتخاب در صفحهٔ خانواده.')}</p>
            <div class="equipment-card-footer">
              <span class="equipment-card-footer-note">${family.variants.length > 1 ? 'مقایسهٔ گزینه‌ها' : 'معرفی و کاربرد'}</span>
              <span class="equipment-card-cta"><span>مشاهدهٔ معرفی</span><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></span>
            </div>
          </div>
        </a>
      </article>
    `;
  }

  function readUrlState() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const sort = params.get('sort');
    return {
      query: params.get('q') || '',
      category: category && Object.prototype.hasOwnProperty.call(categoryLabels, category) ? category : 'all',
      sort: sort && Object.prototype.hasOwnProperty.call(sortLabels, sort) ? sort : 'recommended'
    };
  }

  function writeUrlState(query, category, sort, replace = true) {
    try {
      const url = new URL(window.location.href);
      const cleanQuery = query.trim();
      if (cleanQuery) url.searchParams.set('q', cleanQuery);
      else url.searchParams.delete('q');
      if (category !== 'all') url.searchParams.set('category', category);
      else url.searchParams.delete('category');
      if (sort !== 'recommended') url.searchParams.set('sort', sort);
      else url.searchParams.delete('sort');
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      if (replace) window.history.replaceState({ q: cleanQuery, category, sort }, '', nextUrl);
      else window.history.pushState({ q: cleanQuery, category, sort }, '', nextUrl);
    } catch (error) {
      // URL state is an enhancement for local/offline copies of the catalogue.
    }
  }

  function initGallery() {
    const grid = document.getElementById('gallery-equipment-grid');
    const search = document.getElementById('gallery-equipment-search');
    const searchVoiceBtn = document.getElementById('search-voice-btn');
    const sortSelect = document.getElementById('gallery-equipment-sort');
    const count = document.getElementById('gallery-equipment-count');
    const empty = document.getElementById('gallery-equipment-empty');
    const reset = document.getElementById('gallery-equipment-reset');
    const dialog = document.getElementById('catalog-category-dialog');
    const mobileFilterButton = document.getElementById('catalog-mobile-filter');
    const mobileFilterState = document.getElementById('catalog-mobile-filter-state');
    const closeDialogButtons = Array.from(document.querySelectorAll('[data-catalog-dialog-close]'));
    const filterButtons = Array.from(document.querySelectorAll('[data-equipment-filter]'));
    const categoryCounts = Array.from(document.querySelectorAll('[data-category-count], [data-dialog-category-count]'));
    if (!grid || !search || !count || !empty) return;

    let state = readUrlState();
    const defaultSearchPlaceholder = search.getAttribute('placeholder') || '';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (searchVoiceBtn) {
      if (!SpeechRecognition) {
        searchVoiceBtn.style.display = 'none';
      } else {
        const recognition = new SpeechRecognition();
        let isListening = false;
        recognition.lang = 'fa-IR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const stopListening = () => {
          isListening = false;
          searchVoiceBtn.classList.remove('recording');
          search.placeholder = defaultSearchPlaceholder;
          try {
            recognition.stop();
          } catch (error) {
            // already stopped
          }
        };

        recognition.onstart = () => {
          isListening = true;
          searchVoiceBtn.classList.add('recording');
          search.placeholder = 'در حال شنیدن... صحبت کنید...';
        };
        recognition.onresult = event => {
          search.value = event.results[0][0].transcript;
          search.dispatchEvent(new Event('input'));
        };
        recognition.onerror = () => stopListening();
        recognition.onend = () => stopListening();

        searchVoiceBtn.addEventListener('click', () => {
          if (isListening) stopListening();
          else {
            try {
              recognition.start();
            } catch (error) {
              stopListening();
            }
          }
        });
      }
    }

    const openDialog = () => {
      if (!dialog) return;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      mobileFilterButton?.setAttribute('aria-expanded', 'true');
      dialog.querySelector('[data-equipment-filter].is-active')?.focus();
    };
    const closeDialog = (restoreFocus = true) => {
      if (!dialog) return;
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      mobileFilterButton?.setAttribute('aria-expanded', 'false');
      if (restoreFocus) mobileFilterButton?.focus({ preventScroll: true });
    };

    function updateCategoryCounts() {
      const counts = { all: catalog.length };
      catalog.forEach(family => {
        counts[family.category] = (counts[family.category] || 0) + 1;
      });
      categoryCounts.forEach(element => {
        const key = element.dataset.categoryCount || element.dataset.dialogCategoryCount;
        element.textContent = counts[key] ? toPersianDigits(counts[key]) : '۰';
      });
    }

    function updateFilterState() {
      filterButtons.forEach(button => {
        const selected = button.dataset.equipmentFilter === state.category;
        button.classList.toggle('active', selected);
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      const selectedLabel = categoryLabels[state.category] || categoryLabels.all;
      if (mobileFilterState) mobileFilterState.textContent = selectedLabel;
      mobileFilterButton?.setAttribute('aria-label', `فیلتر دسته‌بندی؛ انتخاب فعلی: ${selectedLabel}`);
    }

    function render() {
      const query = normalise(state.query);
      const filtered = catalog.filter(family => {
        const matchesCategory = state.category === 'all' || family.category === state.category;
        return matchesCategory && (!query || getSearchText(family).includes(query));
      });

      if (state.sort === 'alpha') {
        filtered.sort((left, right) => normalise(left.titleFa).localeCompare(normalise(right.titleFa), 'fa'));
      } else if (state.sort === 'variants') {
        filtered.sort((left, right) => (right.variants?.length || 0) - (left.variants?.length || 0));
      }

      grid.innerHTML = filtered.map(renderEquipmentCard).join('');
      empty.hidden = filtered.length !== 0;
      if (sortSelect) sortSelect.value = state.sort;
      updateFilterState();
      if (!state.query && state.category === 'all') {
        count.textContent = `${toPersianDigits(filtered.length)} خانوادهٔ تجهیز برای آشنایی`;
      } else {
        const categoryText = state.category === 'all' ? '' : ` در «${categoryLabels[state.category]}»`;
        const queryText = state.query ? ` برای «${state.query}»` : '';
        count.textContent = `${toPersianDigits(filtered.length)} نتیجه${categoryText}${queryText}`;
      }
    }

    function selectCategory(category, usePushState = true) {
      if (!Object.prototype.hasOwnProperty.call(categoryLabels, category)) return;
      state.category = category;
      writeUrlState(state.query, state.category, state.sort, !usePushState);
      render();
      if (dialog?.open) closeDialog();
    }

    search.value = state.query;
    search.addEventListener('input', () => {
      state.query = search.value;
      writeUrlState(state.query, state.category, state.sort, true);
      render();
    });
    reset?.addEventListener('click', () => {
      state = { query: '', category: 'all', sort: 'recommended' };
      search.value = '';
      writeUrlState('', 'all', 'recommended', true);
      render();
      search.focus();
    });
    sortSelect?.addEventListener('change', () => {
      state.sort = Object.prototype.hasOwnProperty.call(sortLabels, sortSelect.value) ? sortSelect.value : 'recommended';
      writeUrlState(state.query, state.category, state.sort, false);
      render();
    });
    filterButtons.forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.equipmentFilter || 'all')));
    mobileFilterButton?.addEventListener('click', openDialog);
    closeDialogButtons.forEach(button => button.addEventListener('click', closeDialog));
    dialog?.addEventListener('click', event => {
      if (event.target === dialog) closeDialog();
    });
    dialog?.addEventListener('close', () => {
      mobileFilterButton?.setAttribute('aria-expanded', 'false');
      if (dialog.contains(document.activeElement) || document.activeElement === document.body) {
        mobileFilterButton?.focus({ preventScroll: true });
      }
    });
    window.addEventListener('popstate', () => {
      state = readUrlState();
      search.value = state.query;
      if (sortSelect) sortSelect.value = state.sort;
      render();
    });

    updateCategoryCounts();
    render();

    const suggestionLink = document.querySelector('.catalog-suggestion-link');
    if (suggestionLink) {
      const suggestionUrl = new URL(suggestionLink.href, window.location.href);
      suggestionUrl.searchParams.set('title', 'پیشنهاد افزودن به کاتالوگ');
      suggestionUrl.searchParams.set('body', [
        '## پیشنهاد افزودن به کاتالوگ',
        '',
        '- نوع پیشنهاد: ماده یا تجهیز',
        '- نام فارسی:',
        '- نام انگلیسی یا مدل:',
        '- منبع یا لینک پیشنهادی:',
        '',
        '### توضیحات تکمیلی',
        '',
        'لطفاً اطلاعات منبع‌دار، کاربرد و نکات ایمنی موردنظر را بنویسید. پس از بررسی منبع معتبر دربارهٔ افزودن مورد به کاتالوگ تصمیم‌گیری می‌شود.'
      ].join('\n'));
      suggestionLink.href = suggestionUrl.toString();
    }
  }

  document.addEventListener('DOMContentLoaded', initGallery);
})();
