const header = document.querySelector('.header');
document.querySelector('.hero')?.classList.add('hero--motion-ready');
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.menu-toggle');
const progress = document.querySelector('.scroll-progress span');
const sections = [...document.querySelectorAll('main section[id], #advantages')];
const navLinks = [...document.querySelectorAll('.nav a')];
const hero = document.querySelector('.hero');
const finalHeroTitleLine = document.querySelector('.hero__title > span:last-child');
finalHeroTitleLine?.addEventListener('animationend', event => {
  if (event.animationName === 'hero-line-arrive') hero?.classList.add('hero--title-settled');
});
const announceSiteReady = () => {
  hero?.classList.add('hero--entered');
  document.documentElement.classList.add('site-ready');
  requestAnimationFrame(() => window.dispatchEvent(new Event('site:ready')));
};

window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  if (!loader) {
    announceSiteReady();
    return;
  }
  window.setTimeout(() => {
    loader.classList.add('is-done');
    window.setTimeout(announceSiteReady, 750);
  }, 1650);
});

const onScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 45);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0}%`;
  let current = '';
  sections.forEach(section => { if (section.getBoundingClientRect().top <= 160) current = section.id; });
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
};
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// These sections provide their own contact actions; keep them unobstructed.
const dock = document.querySelector('.contact-dock');
const contactSections = new Set();
const dockObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting ? contactSections.add(entry.target) : contactSections.delete(entry.target));
  dock.classList.toggle('is-context-hidden', contactSections.size > 0);
}, {threshold:0.15});
document.querySelectorAll('#team, #contact, .footer').forEach(section => dockObserver.observe(section));

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
navLinks.forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const decimal = el.dataset.decimal;
    const start = performance.now();
    const duration = 1400;
    const tick = now => {
      const ratio = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      el.textContent = decimal ? (target * eased).toFixed(1).replace('.', ',') : Math.round(target * eased);
      if (ratio < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: .5 });
window.addEventListener('site:ready', () => { document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el)); });

const reviewViewport = document.querySelector('.reviews__viewport');
const reviewTrack = document.querySelector('.reviews__track');
const reviewCards = [...document.querySelectorAll('.reviews__track blockquote')];
let reviewIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
const reviewPrev = document.querySelector('.review-prev');
const reviewNext = document.querySelector('.review-next');
const reviewProgress = document.querySelector('.reviews__progress i');
const reviewCount = document.querySelector('.reviews__count');
const reviewsVisible = () => window.innerWidth <= 700 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
const pad2 = n => String(n).padStart(2, '0');
const updateReviews = () => {
  const cardWidth = reviewCards[0]?.getBoundingClientRect().width || 0;
  const maxIndex = Math.max(0, reviewCards.length - reviewsVisible());
  reviewIndex = Math.max(0, Math.min(reviewIndex, maxIndex));
  const maxOffset = Math.max(0, reviewTrack.scrollWidth - reviewViewport.clientWidth);
  const offset = reviewIndex === maxIndex ? maxOffset : Math.min(reviewIndex * (cardWidth + 22), maxOffset);
  reviewTrack.style.transform = `translateX(${-offset}px)`;
  reviewPrev.disabled = reviewIndex === 0;
  reviewNext.disabled = reviewIndex === maxIndex;
  if (reviewProgress) reviewProgress.style.width = `${maxIndex === 0 ? 100 : (reviewIndex / maxIndex) * 100}%`;
  if (reviewCount) reviewCount.textContent = `${pad2(reviewIndex + 1)} / ${pad2(reviewCards.length)}`;
};
document.querySelector('.review-prev').addEventListener('click', () => { reviewIndex -= 1; updateReviews(); });
document.querySelector('.review-next').addEventListener('click', () => { reviewIndex += 1; updateReviews(); });
reviewViewport.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); reviewIndex -= 1; updateReviews(); }
  if (event.key === 'ArrowRight') { event.preventDefault(); reviewIndex += 1; updateReviews(); }
});
reviewViewport.addEventListener('touchstart', event => { touchStartX = event.touches[0].clientX; touchStartY = event.touches[0].clientY; }, { passive: true });
reviewViewport.addEventListener('touchend', event => {
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 45 || Math.abs(delta) < Math.abs(event.changedTouches[0].clientY - touchStartY)) return;
  reviewIndex += delta < 0 ? 1 : -1;
  updateReviews();
}, { passive: true });
window.addEventListener('resize', updateReviews);
updateReviews();

const galleryImages = [
  { src: 'assets/denis-01.jpg', alt: 'Отделка ванной комнаты — проект Дениса Агафонова' },
  { src: 'assets/denis-02.jpg', alt: 'Деталь отделки ванной комнаты' },
  { src: 'assets/denis-03.jpg', alt: 'Фрагмент ремонта ванной комнаты' },
  { src: 'assets/denis-13.jpg', alt: 'Предчистовая отделка квартиры площадью 64,8 квадратного метра' },
  { src: 'assets/denis-14.jpg', alt: 'Подготовленные стены квартиры' },
  { src: 'assets/denis-15.jpg', alt: 'Инженерные работы в квартире' },
  { src: 'assets/denis-18.jpg', alt: 'Процесс комплексного ремонта квартиры' },
  { src: 'assets/denis-19.jpg', alt: 'Чистовая отделка квартиры' },
  { src: 'assets/denis-20.jpg', alt: 'Деталь завершённого ремонта' },
  { src: 'assets/denis-27.jpg', alt: 'Чистовая отделка комнаты с напольным покрытием' },
  { src: 'assets/denis-28.jpg', alt: 'Укладка напольного покрытия' },
  { src: 'assets/denis-29.jpg', alt: 'Готовая светлая комната после отделки' },
  { src: 'assets/vk-kitchen-01.jpg', alt: 'Готовая кухня с корпусной мебелью и встроенной техникой' },
  { src: 'assets/vk-bathroom-clean.png', alt: 'Светлая ванная комната с мраморной плиткой и деревянными рейками' },
  { src: 'assets/kitchen-12766-01.jpg', alt: 'Установленная кухня — рабочая зона с мойкой и варочной панелью' },
  { src: 'assets/kitchen-12766-02.jpg', alt: 'Пеналы кухни со встроенной техникой' },
  { src: 'assets/kitchen-12766-03.jpg', alt: 'Общий вид установленной угловой кухни' },
  { src: 'assets/kitchen-12766-04.jpg', alt: 'Угловая кухня с серыми и белыми фасадами' },
  { src: 'assets/kitchen-12766-05.jpg', alt: 'Фурнитура и выдвижные системы готовой кухни' }
];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCounter = lightbox.querySelector('.lightbox__counter');
let galleryIndex = 0;
let galleryGroup = galleryImages.map((_, index) => index);
let galleryTrigger = null;
const renderLightbox = () => {
  const item = galleryImages[galleryIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCounter.textContent = `${String(galleryGroup.indexOf(galleryIndex) + 1).padStart(2, '0')} / ${String(galleryGroup.length).padStart(2, '0')}`;
};
const openLightbox = (index, card) => {
  galleryGroup = card ? JSON.parse(card.dataset.galleryGroup) : galleryImages.map((_, i) => i);
  galleryTrigger = document.activeElement;
  galleryIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox__close').focus();
};
const closeLightbox = () => {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  galleryTrigger?.focus();
};
const stepLightbox = direction => {
  galleryIndex = galleryGroup[(galleryGroup.indexOf(galleryIndex) + direction + galleryGroup.length) % galleryGroup.length];
  renderLightbox();
};
document.querySelectorAll('.project-card').forEach(card => {
  card.dataset.galleryGroup = JSON.stringify([...card.querySelectorAll('[data-gallery]')].map(button => Number(button.dataset.gallery)));
});
document.querySelectorAll('.project-card__main[data-gallery]').forEach(button => button.addEventListener('click', () => openLightbox(Number(button.dataset.gallery), button.closest('.project-card'))));
lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox__prev').addEventListener('click', () => stepLightbox(-1));
lightbox.querySelector('.lightbox__next').addEventListener('click', () => stepLightbox(1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', event => {
  if (!lightbox.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') stepLightbox(-1);
  if (event.key === 'ArrowRight') stepLightbox(1);
});

const projectTrack = document.querySelector('.project-track');
const projectCards = [...document.querySelectorAll('.project-card')];
const projectCurrent = document.querySelector('.project-current');
const projectPrev = document.querySelector('.project-prev');
const projectNext = document.querySelector('.project-next');
let projectIndex = 0;
let projectTouchX = 0;
let projectTouchY = 0;
const projectsVisible = () => window.innerWidth <= 700 ? 1 : window.innerWidth <= 1050 ? 2 : 3;
const updateProjects = () => {
  const visible = projectsVisible();
  const maxIndex = Math.max(0, projectCards.length - visible);
  projectIndex = Math.max(0, Math.min(projectIndex, maxIndex));
  const gap = window.innerWidth <= 700 ? 14 : 22;
  const width = projectCards[0]?.getBoundingClientRect().width || 0;
  const maxScroll = Math.max(0, projectTrack.scrollWidth - projectTrack.parentElement.clientWidth);
  const offset = Math.min(projectIndex * (width + gap), maxScroll);
  projectTrack.style.transform = `translateX(${-offset}px)`;
  const first = projectIndex + 1;
  const last = Math.min(projectCards.length, projectIndex + visible);
  projectCurrent.textContent = visible === 1 ? String(first).padStart(2, '0') : `${String(first).padStart(2, '0')}–${String(last).padStart(2, '0')}`;
  projectPrev.disabled = projectIndex === 0;
  projectNext.disabled = projectIndex === maxIndex;
};
projectPrev.addEventListener('click', () => { projectIndex -= projectsVisible(); updateProjects(); });
projectNext.addEventListener('click', () => { projectIndex += projectsVisible(); updateProjects(); });
projectTrack.addEventListener('touchstart', event => { projectTouchX = event.touches[0].clientX; projectTouchY = event.touches[0].clientY; }, { passive: true });
projectTrack.addEventListener('touchend', event => {
  const delta = event.changedTouches[0].clientX - projectTouchX;
  if (Math.abs(delta) < 45 || Math.abs(delta) < Math.abs(event.changedTouches[0].clientY - projectTouchY)) return;
  projectIndex += delta < 0 ? projectsVisible() : -projectsVisible();
  updateProjects();
}, { passive: true });
window.addEventListener('resize', updateProjects);
updateProjects();

document.querySelectorAll('.project-card').forEach(card => {
  const mainButton = card.querySelector('.project-card__main');
  const mainImage = mainButton?.querySelector('img');
  const thumbButtons = [...card.querySelectorAll('.project-card__thumbs button')];
  if (!mainButton || !mainImage || !thumbButtons.length) return;

  const slides = [mainButton, ...thumbButtons].map(button => ({
    src: button.querySelector('img').getAttribute('src'),
    alt: button.querySelector('img').getAttribute('alt'),
    gallery: button.dataset.gallery
  }));
  let slideIndex = 0;
  const media = document.createElement('div');
  media.className = 'project-card__media';
  mainButton.before(media);
  media.append(mainButton);

  const controls = document.createElement('div');
  controls.className = 'project-card__slider';
  controls.innerHTML = '<button type="button" aria-label="Предыдущее фото">←</button><button type="button" aria-label="Следующее фото">→</button>';
  const counter = document.createElement('span');
  counter.className = 'project-card__slider-count';
  media.append(controls, counter);

  const renderProjectSlide = () => {
    const slide = slides[slideIndex];
    mainImage.src = slide.src;
    mainImage.alt = slide.alt;
    mainButton.dataset.gallery = slide.gallery;
    counter.textContent = `${slideIndex + 1} / ${slides.length}`;
    thumbButtons.forEach((button, index) => button.classList.toggle('is-active', index + 1 === slideIndex));
  };
  const stepProjectSlide = direction => {
    slideIndex = (slideIndex + direction + slides.length) % slides.length;
    renderProjectSlide();
  };
  controls.children[0].addEventListener('click', event => { event.stopPropagation(); stepProjectSlide(-1); });
  controls.children[1].addEventListener('click', event => { event.stopPropagation(); stepProjectSlide(1); });
  thumbButtons.forEach((button, index) => button.addEventListener('click', () => { slideIndex = index + 1; renderProjectSlide(); }));
  renderProjectSlide();
});
