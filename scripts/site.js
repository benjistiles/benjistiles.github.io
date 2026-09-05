const nav = document.querySelector('.site-nav');
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = document.querySelector('[data-nav-links]');

if (nav && navToggle && navLinks) {
    const navLabel = navToggle.querySelector('[data-nav-label]');

    const closeNav = () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        if (navLabel) navLabel.textContent = 'Open navigation';
    };

    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        if (navLabel) navLabel.textContent = isOpen ? 'Close navigation' : 'Open navigation';
    });

    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeNav();
    });

    document.addEventListener('pointerdown', (event) => {
        if (!nav.contains(event.target)) closeNav();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 820) closeNav();
    });

    const updateNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
}

const slideshow = document.querySelector('[data-hero-slideshow]');

if (slideshow) {
    const slides = [...slideshow.querySelectorAll('[data-hero-slide]')];
    const status = slideshow.querySelector('[data-slide-status]');
    const previous = slideshow.querySelector('[data-slide-previous]');
    const next = slideshow.querySelector('[data-slide-next]');
    const pause = slideshow.querySelector('[data-slide-pause]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;
    let timer;
    let isPaused = reducedMotion;

    const renderSlide = () => {
        slides.forEach((slide, index) => {
            const isActive = index === activeIndex;
            slide.classList.toggle('is-active', isActive);
            slide.setAttribute('aria-hidden', String(!isActive));
        });
        if (status) status.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };

    const stopTimer = () => window.clearInterval(timer);
    const startTimer = () => {
        stopTimer();
        if (!isPaused && slides.length > 1) {
            timer = window.setInterval(() => {
                activeIndex = (activeIndex + 1) % slides.length;
                renderSlide();
            }, 7000);
        }
    };

    const move = (direction) => {
        activeIndex = (activeIndex + direction + slides.length) % slides.length;
        renderSlide();
        startTimer();
    };

    previous?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
    pause?.addEventListener('click', () => {
        isPaused = !isPaused;
        pause.textContent = isPaused ? 'Play' : 'Pause';
        pause.setAttribute('aria-label', isPaused ? 'Play photograph rotation' : 'Pause photograph rotation');
        startTimer();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopTimer();
        else startTimer();
    });

    renderSlide();
    if (pause && reducedMotion) pause.textContent = 'Play';
    startTimer();
}

document.querySelectorAll('audio').forEach((audio) => {
    audio.addEventListener('play', () => {
        document.querySelectorAll('audio').forEach((otherAudio) => {
            if (otherAudio !== audio) otherAudio.pause();
        });
    });
});

const lightbox = document.querySelector('[data-lightbox-dialog]');

if (lightbox) {
    const lightboxImage = lightbox.querySelector('[data-lightbox-image]');
    const lightboxCaption = lightbox.querySelector('[data-lightbox-caption]');

    document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const image = trigger.querySelector('img');
            if (!image || !lightboxImage) return;
            lightboxImage.src = trigger.dataset.full || image.src;
            lightboxImage.alt = image.alt;
            if (lightboxCaption) lightboxCaption.textContent = trigger.dataset.caption || image.alt;
            lightbox.showModal();
        });
    });

    lightbox.querySelector('[data-lightbox-close]')?.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) lightbox.close();
    });
}

const contactForm = document.querySelector('[data-contact-form]');

if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(contactForm);
        const subject = encodeURIComponent(`Website inquiry: ${data.get('inquiry') || 'General'}`);
        const body = encodeURIComponent([
            `Name: ${data.get('name') || ''}`,
            `Email: ${data.get('email') || ''}`,
            `Inquiry: ${data.get('inquiry') || ''}`,
            '',
            String(data.get('message') || '')
        ].join('\n'));
        window.location.href = `mailto:benjistilesmusic@gmail.com?subject=${subject}&body=${body}`;
    });
}
