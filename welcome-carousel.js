(() => {
  function initWelcomeCarousel() {
    const root = document.querySelector('[data-welcome-carousel]');
    if (!root) return;

    const slides = Array.from(root.querySelectorAll('[data-welcome-slide]'));
    const dotsRoot = root.querySelector('[data-welcome-dots]');
    const actionButtons = root.querySelectorAll('[data-welcome-action]');
    if (!slides.length || !dotsRoot) return;

    let activeIndex = Math.max(0, slides.findIndex(slide => !slide.hidden));
    let pointerStartX = null;

    const normaliseIndex = index => (index + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      if (!slide.id) slide.id = `welcome-slide-${index + 1}`;
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'اسلاید');
      slide.setAttribute('aria-label', `${index + 1} از ${slides.length}`);
    });

    dotsRoot.innerHTML = slides.map((slide, index) => `
      <button type="button" class="welcome-carousel-dot" data-welcome-dot="${index}" aria-controls="${slide.id}" aria-label="نمایش تصویر ${index + 1}" aria-current="${index === activeIndex ? 'true' : 'false'}"></button>
    `).join('');

    const update = (index, focusDot = false) => {
      activeIndex = normaliseIndex(index);
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.hidden = !isActive;
        slide.setAttribute('aria-hidden', String(!isActive));
        const image = slide.querySelector('img');
        if (image && !isActive) image.loading = 'lazy';
      });

      dotsRoot.querySelectorAll('[data-welcome-dot]').forEach((dot, dotIndex) => {
        dot.setAttribute('aria-current', String(dotIndex === activeIndex));
      });

      if (focusDot) dotsRoot.querySelector(`[data-welcome-dot="${activeIndex}"]`)?.focus();
    };

    dotsRoot.addEventListener('click', event => {
      const dot = event.target.closest('[data-welcome-dot]');
      if (dot) update(Number(dot.dataset.welcomeDot), true);
    });

    actionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const direction = button.dataset.welcomeAction === 'next' ? 1 : -1;
        update(activeIndex + direction);
      });
    });

    root.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        update(activeIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        update(activeIndex + 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        update(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        update(slides.length - 1);
      }
    });

    root.addEventListener('pointerdown', event => {
      pointerStartX = event.clientX;
    });

    root.addEventListener('pointerup', event => {
      if (pointerStartX === null) return;
      const distance = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(distance) < 42) return;
      update(activeIndex + (distance < 0 ? 1 : -1));
    });

    update(activeIndex);
  }

  document.addEventListener('DOMContentLoaded', initWelcomeCarousel);
})();
