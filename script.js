const root = document.documentElement;
const header = document.querySelector('.header');
const hero = document.querySelector('.hero');
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.menu-toggle');
const progress = document.querySelector('.scroll-progress span');
const sections = [...document.querySelectorAll('main section[id], #advantages')];
const navLinks = [...document.querySelectorAll('.nav a')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad2 = n => String(n).padStart(2, '0');

hero?.classList.add('hero--motion-ready');
document.querySelector('.hero__title > span:last-child')?.addEventListener('animationend', event => {
  if (event.animationName === 'hero-line-arrive') hero.classList.add('hero--title-settled');
});

/* Прелоадер */
let siteReady = false;
const announceSiteReady = () => {
  if (siteReady) return;
  siteReady = true;
  hero?.classList.add('hero--entered');
  root.classList.add('site-ready');
  requestAnimationFrame(() => window.dispatchEvent(new Event('site:ready')));
};
const hideLoader = () => {
  const loader = document.querySelector('.loader');
  if (!loader || loader.classList.contains('is-done')) return announceSiteReady();
  loader.classList.add('is-done');
  setTimeout(announceSiteReady, reducedMotion ? 0 : 420);
};
// Прелоадер не ждёт догрузки всех картинок.
window.addEventListener('load', () => setTimeout(hideLoader, Math.max(0, 1100 - performance.now())));
setTimeout(hideLoader, 3200);

/* Шапка, прогресс прокрутки, активный пункт меню */
let scrollQueued = false;
const onScroll = () => {
  scrollQueued = false;
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 45);
  const scrollable = root.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, y / scrollable) : 0})`;
  let current = '';
  sections.forEach(section => { if (section.getBoundingClientRect().top <= 160) current = section.id; });
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
};
const queueScroll = () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(onScroll);
};
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll);
onScroll();

/* Плавающие контакты: прячутся там, где у секции свои кнопки связи */
const dock = document.querySelector('.contact-dock');
const dockToggle = dock?.querySelector('.contact-dock__toggle');
const setDockOpen = open => {
  if (!dockToggle) return;
  dock.classList.toggle('is-open', open);
  dockToggle.setAttribute('aria-expanded', String(open));
  dockToggle.setAttribute('aria-label', open ? 'Закрыть способы связи' : 'Открыть способы связи');
};
if (dockToggle) {
  dockToggle.addEventListener('click', () => setDockOpen(!dock.classList.contains('is-open')));
  dock.querySelectorAll('.contact-dock__methods a').forEach(link => link.addEventListener('click', () => setDockOpen(false)));
  document.addEventListener('click', event => { if (!dock.contains(event.target)) setDockOpen(false); });
  const contactSections = new Set();
  const dockObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? contactSections.add(entry.target) : contactSections.delete(entry.target));
    dock.classList.toggle('is-context-hidden', contactSections.size > 0);
    if (contactSections.size > 0) setDockOpen(false);
  }, { threshold: .15 });
  document.querySelectorAll('#team, #contact, .footer').forEach(section => dockObserver.observe(section));
}

/* Меню */
const setMenuOpen = open => {
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  document.body.classList.toggle('menu-open', open);
};
toggle.addEventListener('click', () => setMenuOpen(!nav.classList.contains('open')));
navLinks.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
window.addEventListener('resize', () => {
  if (window.innerWidth > 1350 && nav.classList.contains('open')) setMenuOpen(false);
});

/* Фоновые картинки грузятся на подходе к экрану */
const loadBackground = element => {
  const source = element.dataset.bg;
  if (!source) return;
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => {
    element.style.backgroundImage = `url("${source}")`;
    element.classList.add('is-loaded');
    delete element.dataset.bg;
  };
  image.src = source;
};
const backgroundObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    loadBackground(entry.target);
    backgroundObserver.unobserve(entry.target);
  });
}, { rootMargin: '450px 0px' });
document.querySelectorAll('[data-bg]:not(.hero__slide)').forEach(element => backgroundObserver.observe(element));

/* Счётчики: 100+, 98%, 12 */
const countUp = el => {
  const match = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
  if (!match || Number(match[2]) > 999) return;
  const [, before, digits, after] = match;
  const target = Number(digits);
  el.style.minWidth = `${el.getBoundingClientRect().width}px`;
  const start = performance.now();
  const tick = now => {
    const ratio = Math.min((now - start) / 2200, 1);
    el.textContent = before + Math.round(target * (1 - Math.pow(1 - ratio, 4))) + after;
    if (ratio < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

/* Появление при прокрутке */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('visible');
    if (!reducedMotion) el.querySelectorAll('.hero__stats strong, .reviews__stats b').forEach(countUp);
    revealObserver.unobserve(el);
  });
}, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
const revealTargets = document.querySelectorAll('.reveal, .measure__timeline, .hero__stats, .reviews__track, .company__backdrop, .company__copy, .static-map-frame');
revealTargets.forEach(el => {
  if (el.classList.contains('reveal')) {
    const siblings = [...el.parentElement.children].filter(child => child.classList.contains('reveal'));
    el.style.setProperty('--reveal-order', Math.min(siblings.indexOf(el), 5));
  }
});
const startReveal = scope => revealTargets.forEach(el => {
  if (scope(el)) reducedMotion ? el.classList.add('visible') : revealObserver.observe(el);
});
// Первый экран — после прелоадера, остальное — при прокрутке.
startReveal(el => !hero?.contains(el));
window.addEventListener('site:ready', () => startReveal(el => hero?.contains(el)), { once: true });

/* Отзывы */
const reviewViewport = document.querySelector('.reviews__viewport');
const reviewTrack = document.querySelector('.reviews__track');
const reviewCards = [...reviewTrack.children];
const reviewPrev = document.querySelector('.review-prev');
const reviewNext = document.querySelector('.review-next');
const reviewProgress = document.querySelector('.reviews__progress i');
const reviewCount = document.querySelector('.reviews__count');
let reviewIndex = 0;
const reviewsVisible = () => window.innerWidth <= 700 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
const updateReviews = () => {
  const cardWidth = reviewCards[0]?.getBoundingClientRect().width || 0;
  const maxIndex = Math.max(0, reviewCards.length - reviewsVisible());
  reviewIndex = Math.max(0, Math.min(reviewIndex, maxIndex));
  const maxOffset = Math.max(0, reviewTrack.scrollWidth - reviewViewport.clientWidth);
  const offset = reviewIndex === maxIndex ? maxOffset : Math.min(reviewIndex * (cardWidth + 22), maxOffset);
  reviewTrack.style.transform = `translateX(${-offset}px)`;
  reviewPrev.disabled = reviewIndex === 0;
  reviewNext.disabled = reviewIndex === maxIndex;
  reviewProgress.style.width = `${maxIndex === 0 ? 100 : (reviewIndex / maxIndex) * 100}%`;
  reviewCount.textContent = `${pad2(reviewIndex + 1)} / ${pad2(reviewCards.length)}`;
};
const stepReviews = direction => { reviewIndex += direction; updateReviews(); };

/* Свайп и стрелки для каруселей */
const bindSwipe = (element, step) => {
  let startX = 0;
  let startY = 0;
  element.addEventListener('touchstart', event => { startX = event.touches[0].clientX; startY = event.touches[0].clientY; }, { passive: true });
  element.addEventListener('touchend', event => {
    const dx = event.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(event.changedTouches[0].clientY - startY)) return;
    step(dx < 0 ? 1 : -1);
  }, { passive: true });
  element.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
  });
};
reviewPrev.addEventListener('click', () => stepReviews(-1));
reviewNext.addEventListener('click', () => stepReviews(1));
bindSwipe(reviewViewport, stepReviews);
window.addEventListener('resize', updateReviews);
updateReviews();

/* Галерея */
const galleryImages = [
  { src: 'assets/denis-01.webp', alt: 'Отделка ванной комнаты — проект Дениса Агафонова' },
  { src: 'assets/denis-02.webp', alt: 'Деталь отделки ванной комнаты' },
  { src: 'assets/denis-03.webp', alt: 'Фрагмент ремонта ванной комнаты' },
  { src: 'assets/denis-13.webp', alt: 'Предчистовая отделка квартиры площадью 64,8 квадратного метра' },
  { src: 'assets/denis-14.webp', alt: 'Подготовленные стены квартиры' },
  { src: 'assets/denis-15.webp', alt: 'Инженерные работы в квартире' },
  { src: 'assets/denis-18.webp', alt: 'Процесс комплексного ремонта квартиры' },
  { src: 'assets/denis-19.webp', alt: 'Чистовая отделка квартиры' },
  { src: 'assets/denis-20.webp', alt: 'Деталь завершённого ремонта' },
  { src: 'assets/denis-27.webp', alt: 'Чистовая отделка комнаты с напольным покрытием' },
  { src: 'assets/denis-28.webp', alt: 'Укладка напольного покрытия' },
  { src: 'assets/denis-29.webp', alt: 'Готовая светлая комната после отделки' },
  { src: 'assets/vk-kitchen-01.webp', alt: 'Готовая кухня с корпусной мебелью и встроенной техникой' },
  { src: 'assets/vk-bathroom-clean.webp', alt: 'Светлая ванная комната с мраморной плиткой и деревянными рейками' },
  { src: 'assets/kitchen-12766-01.webp', alt: 'Установленная кухня — рабочая зона с мойкой и варочной панелью' },
  { src: 'assets/kitchen-12766-02.webp', alt: 'Пеналы кухни со встроенной техникой' },
  { src: 'assets/kitchen-12766-03.webp', alt: 'Общий вид установленной угловой кухни' },
  { src: 'assets/kitchen-12766-04.webp', alt: 'Угловая кухня с серыми и белыми фасадами' },
  { src: 'assets/kitchen-12766-05.webp', alt: 'Фурнитура и выдвижные системы готовой кухни' },
  { src: 'assets/vk-project-04-kitchen-render.webp', alt: 'Дизайн-проект кухни с обеденной зоной' },
  { src: 'assets/vk-project-01-loggia.webp', alt: 'Дизайн-проект лоджии с зоной отдыха' },
  { src: 'assets/vk-project-03-livingroom.webp', alt: 'Дизайн-проект гостиной с диваном и стеллажом' },
  { src: 'assets/vk-project-09-kitchen-beige.webp', alt: 'Готовая бежевая кухня со встроенной техникой' },
  { src: 'assets/vk-project-08-kitchen-grey.webp', alt: 'Готовая серая кухня со встроенной техникой' },
  { src: 'assets/vk-project-05-kitchen-wood.webp', alt: 'Готовая кухня в дереве и белом цвете' },
  { src: 'assets/vk-project-06-bathroom-tile.webp', alt: 'Готовая ванная комната с подсветкой и плиткой под дерево' },
  { src: 'assets/vk-project-07-bathroom-dark.webp', alt: 'Тёмная ванная комната с чёрной сантехникой' },
  { src: 'assets/vk-project-10-hallway.webp', alt: 'Готовая прихожая со шкафом-купе' }
];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCounter = lightbox.querySelector('.lightbox__counter');
const lightboxButtons = [...lightbox.querySelectorAll('button')];
const projectGallery = [...new Set(
  [...document.querySelectorAll('.project-card [data-gallery]')]
    .map(button => Number(button.dataset.gallery))
    .filter(index => galleryImages[index])
)];
let galleryIndex = 0;
let galleryTrigger = null;
const renderLightbox = () => {
  const item = galleryImages[galleryIndex];
  lightboxImage.classList.remove('is-shown');
  lightboxImage.onload = lightboxImage.onerror = () => lightboxImage.classList.add('is-shown');
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  if (lightboxImage.complete) lightboxImage.classList.add('is-shown');
  lightboxCounter.textContent = `${pad2(projectGallery.indexOf(galleryIndex) + 1)} / ${pad2(projectGallery.length)}`;
};
const openLightbox = index => {
  galleryTrigger = document.activeElement;
  galleryIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightboxButtons[0].focus();
};
const closeLightbox = () => {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  galleryTrigger?.focus();
};
const stepLightbox = direction => {
  const position = Math.max(0, projectGallery.indexOf(galleryIndex));
  galleryIndex = projectGallery[(position + direction + projectGallery.length) % projectGallery.length];
  renderLightbox();
};
document.querySelectorAll('.project-card [data-gallery]').forEach(button => button.addEventListener('click', () => openLightbox(Number(button.dataset.gallery))));
lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox__prev').addEventListener('click', () => stepLightbox(-1));
lightbox.querySelector('.lightbox__next').addEventListener('click', () => stepLightbox(1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

/* Проекты */
const projectTrack = document.querySelector('.project-track');
const projectPages = [...projectTrack.children];
const projectCards = projectTrack.querySelectorAll('.project-card');
const projectCurrent = document.querySelector('.project-current');
const projectPrev = document.querySelector('.project-prev');
const projectNext = document.querySelector('.project-next');
const PROJECT_PAGE_SIZE = 3;
let projectIndex = 0;
const updateProjects = () => {
  const maxIndex = projectPages.length - 1;
  projectIndex = Math.max(0, Math.min(projectIndex, maxIndex));
  projectTrack.style.transform = `translate3d(${-projectIndex * 100}%, 0, 0)`;
  projectPages.forEach((page, index) => page.classList.toggle('is-current', index === projectIndex));
  const first = projectIndex * PROJECT_PAGE_SIZE + 1;
  const last = Math.min(projectCards.length, first + PROJECT_PAGE_SIZE - 1);
  projectCurrent.textContent = `${pad2(first)}–${pad2(last)}`;
  projectPrev.disabled = projectIndex === 0;
  projectNext.disabled = projectIndex === maxIndex;
};
const stepProjects = direction => { projectIndex += direction; updateProjects(); };
projectPrev.addEventListener('click', () => stepProjects(-1));
projectNext.addEventListener('click', () => stepProjects(1));
bindSwipe(projectTrack, stepProjects);
updateProjects();

/* Слайд-шоу первого экрана */
(() => {
  const slides = [...document.querySelectorAll('.hero__slide')];
  let slideIndex = 0;
  let slideTimer;
  let started = false;
  const advance = () => {
    const previous = slides[slideIndex];
    previous.classList.remove('is-active');
    previous.classList.add('is-leaving');
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.remove('is-leaving');
    slides[slideIndex].classList.add('is-active');
  };
  const start = () => {
    if (started) return;
    started = true;
    slides[0]?.classList.add('is-active');
    slides.slice(1).forEach((slide, index) => setTimeout(() => loadBackground(slide), 700 + index * 350));
    if (!reducedMotion) slideTimer = setInterval(advance, 15000);
  };
  window.addEventListener('site:ready', start, { once: true });
  document.addEventListener('visibilitychange', () => {
    clearInterval(slideTimer);
    if (!document.hidden && started && !reducedMotion) slideTimer = setInterval(advance, 15000);
  });
})();

/* Преимущества: карусель на телефоне */
(() => {
  const track = document.querySelector('.principles');
  const cards = [...track.children];
  const previous = document.querySelector('.advantages-prev');
  const next = document.querySelector('.advantages-next');
  const counter = document.querySelector('.advantages-counter');
  const cardStep = () => cards[0].getBoundingClientRect().width + 16;
  const index = () => Math.round(track.scrollLeft / cardStep());
  const update = () => {
    const active = Math.max(0, Math.min(cards.length - 1, index()));
    counter.textContent = `${pad2(active + 1)} / ${pad2(cards.length)}`;
    previous.disabled = active === 0;
    next.disabled = active === cards.length - 1;
  };
  const step = direction => track.scrollTo({ left: Math.max(0, Math.min(cards.length - 1, index() + direction)) * cardStep(), behavior: reducedMotion ? 'auto' : 'smooth' });
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
  });
  window.addEventListener('resize', update);
  update();
})();

/* Клавиатура */
document.addEventListener('keydown', event => {
  if (lightbox.classList.contains('open')) {
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') stepLightbox(-1);
    if (event.key === 'ArrowRight') stepLightbox(1);
    if (event.key === 'Tab') {
      const first = lightboxButtons[0];
      const last = lightboxButtons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    return;
  }
  if (event.key !== 'Escape') return;
  if (nav.classList.contains('open')) { setMenuOpen(false); toggle.focus(); }
  if (dock?.classList.contains('is-open')) { setDockOpen(false); dockToggle.focus(); }
});
