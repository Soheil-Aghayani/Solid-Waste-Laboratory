(() => {
      const assetVersion = '5.8';
      const assetCdnBase = '.';
      let msdsDbPromise = null;
      let chatbotPromise = null;
      let elementCatalogPromise = null;

      function loadScript(src) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      function loadStyle(href) {
        const existing = document.querySelector(`link[data-lazy-style="${href}"]`);
        if (existing) return Promise.resolve();

        return new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.dataset.lazyStyle = href;
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        });
      }

      function loadMsdsDatabase() {
        if (window.chemicalMsdsDb) return Promise.resolve(window.chemicalMsdsDb);
        if (msdsDbPromise) return msdsDbPromise;

        msdsDbPromise = loadScript(`${assetCdnBase}/chatbot/msds/msds-db.min.js?v=${assetVersion}`)
          .then(() => {
            window.dispatchEvent(new Event('msdsdb:ready'));
            return window.chemicalMsdsDb;
          })
          .catch((error) => {
            msdsDbPromise = null;
            throw error;
          });

        return msdsDbPromise;
      }

      function loadChatbot() {
        if (chatbotPromise) return chatbotPromise;

        chatbotPromise = Promise.all([
          loadStyle(`${assetCdnBase}/chatbot/chatbot.min.css?v=${assetVersion}`),
          loadMsdsDatabase()
        ])
          .then(() => loadScript(`${assetCdnBase}/chatbot/chatbot.min.js?v=${assetVersion}`))
          .catch((error) => {
            chatbotPromise = null;
            throw error;
          });

        return chatbotPromise;
      }

      function loadElementCatalog() {
        if (window.elementCatalogReady) return Promise.resolve();
        if (elementCatalogPromise) return elementCatalogPromise;

        elementCatalogPromise = loadScript(`${assetCdnBase}/elements-data.min.js?v=2.2`)
          .then(() => loadScript(`${assetCdnBase}/elements.min.js?v=2.6`))
          .then(() => {
            window.elementCatalogReady = true;
          })
          .catch((error) => {
            elementCatalogPromise = null;
            throw error;
          });

        return elementCatalogPromise;
      }

      window.loadMsdsDatabase = loadMsdsDatabase;
      window.loadChatbot = loadChatbot;
      window.loadElementCatalog = loadElementCatalog;

      const hydrateMsds = () => loadMsdsDatabase().catch((error) => console.error('MSDS database failed to load:', error));

      const msdsSelect = document.getElementById('msds-chemical-select');
      if (msdsSelect) msdsSelect.addEventListener('focus', hydrateMsds, { once: true });

      const compatContainer = document.getElementById('compat-chemicals-container');
      const compatAddButton = document.getElementById('add-compat-chemical-btn');
      if (compatContainer) compatContainer.addEventListener('focusin', hydrateMsds, { once: true });
      if (compatAddButton) compatAddButton.addEventListener('click', hydrateMsds, { once: true });

      const elementAccordion = document.querySelector('.elements-accordion-primary');
      const elementHashPattern = /^#element-\d+$/i;
      const hydrateElements = () => {
        if (!elementAccordion || (!elementAccordion.open && !elementHashPattern.test(window.location.hash))) return;
        loadElementCatalog().catch((error) => console.error('Element catalog failed to load:', error));
      };
      if (elementAccordion) {
        elementAccordion.addEventListener('toggle', hydrateElements);
        document.getElementById('element-search')?.addEventListener('focus', hydrateElements, { once: true });
        if (elementHashPattern.test(window.location.hash)) {
          elementAccordion.open = true;
          hydrateElements();
        }
        window.addEventListener('hashchange', () => {
          if (elementHashPattern.test(window.location.hash)) {
            elementAccordion.open = true;
            hydrateElements();
          }
        });
      }

      const chatbotLoader = document.getElementById('chatbot-loader-fab');
      if (chatbotLoader) {
        chatbotLoader.addEventListener('click', async () => {
          if (chatbotLoader.disabled) return;
          chatbotLoader.disabled = true;
          chatbotLoader.setAttribute('aria-busy', 'true');

          try {
            await loadChatbot();
            chatbotLoader.remove();
            const chatbotFab = document.getElementById('chatbot-fab');
            if (chatbotFab) chatbotFab.click();
          } catch (error) {
            chatbotLoader.disabled = false;
            chatbotLoader.removeAttribute('aria-busy');
            console.error('Assistant failed to load:', error);
          }
        });
      }

      const offlineStatus = document.getElementById('offline-status');
      const updateOfflineStatus = () => {
        if (offlineStatus) offlineStatus.hidden = navigator.onLine;
      };

      updateOfflineStatus();
      window.addEventListener('online', updateOfflineStatus);
      window.addEventListener('offline', updateOfflineStatus);

      // Lightweight shared chrome for catalog pages. The full portal bundle
      // remains available to pages that need its broader interactions, while
      // catalog and detail pages keep the first render small.
      const hasGlobalPortalScript = Boolean(document.querySelector('script[src*="script.min.js"]'));
      if (!hasGlobalPortalScript) {
        const themeButton = document.getElementById('theme-btn');
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        const applyThemeIcon = theme => {
          if (!themeButton) return;
          themeButton.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>`;
          themeButton.setAttribute('aria-label', theme === 'dark' ? 'فعال‌کردن پوستهٔ روشن' : 'فعال‌کردن پوستهٔ تیره');
          if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
        };
        if (themeButton && !themeButton.dataset.bound) {
          themeButton.dataset.bound = 'true';
          let theme = document.documentElement.getAttribute('data-theme') || 'dark';
          applyThemeIcon(theme);
          themeButton.addEventListener('click', () => {
            theme = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            try { localStorage.setItem('theme', theme); } catch (error) {}
            applyThemeIcon(theme);
          });
        }

        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const statusHours = document.getElementById('status-hours');
        const updateCompactStatus = () => {
          if (!statusDot || !statusText) return;
          const now = new Date();
          let hour = now.getHours();
          let day = now.getDay();
          let dayName = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(now);
          try {
            const parts = new Intl.DateTimeFormat('en-US', {
              timeZone: 'Asia/Tehran', weekday: 'short', hour: 'numeric', hourCycle: 'h23'
            }).formatToParts(now);
            const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
            hour = Number(parts.find(part => part.type === 'hour').value);
            day = days[parts.find(part => part.type === 'weekday').value];
            dayName = new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', weekday: 'long' }).format(now);
          } catch (error) {}
          const isOpen = [0, 1, 2, 3, 6].includes(day) && hour >= 8 && hour < 16;
          const stateText = isOpen ? 'آزمایشگاه باز است' : 'آزمایشگاه بسته است';
          const scheduleText = `${dayName}، ساعت ۸ تا ۱۶`;
          statusDot.classList.toggle('active', isOpen);
          statusText.textContent = stateText;
          if (statusHours) statusHours.textContent = scheduleText;
          statusText.title = `${stateText} (${scheduleText})`;
        };
        updateCompactStatus();
        window.setInterval(updateCompactStatus, 60000);
      }

      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js', { scope: './' })
            .catch((error) => console.warn('Offline support failed to initialize:', error));
        }, { once: true });
      }
    })();
