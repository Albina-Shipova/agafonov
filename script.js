document.body.classList.add('loading');
const preloader=document.querySelector('.preloader');
let loadingFinished=false;
const finishLoading=()=>{if(loadingFinished)return;loadingFinished=true;startHeroSlider();preloader.classList.add('hide');document.body.classList.remove('loading');setTimeout(startCounters,450);setTimeout(()=>preloader.remove(),800)};
window.addEventListener('load',()=>setTimeout(finishLoading,1850),{once:true});
setTimeout(finishLoading,5000);

const header=document.querySelector('.header');
const progressLine=document.querySelector('.scroll-progress i');
const spyLinks=[...document.querySelectorAll('.nav a[href^="#"],.mobile-menu a[href^="#"]')];
const spyTargets=[...new Set(spyLinks.map(link=>link.getAttribute('href').slice(1)))].map(id=>document.getElementById(id)).filter(Boolean).sort((a,b)=>a.offsetTop-b.offsetTop);
const updateHeader=()=>{header.classList.toggle('scrolled',window.scrollY>36);const available=document.documentElement.scrollHeight-innerHeight;progressLine.style.transform=`scaleX(${available>0?Math.min(window.scrollY/available,1):0})`;const probe=window.scrollY+Math.min(innerHeight*.3,220);let activeId='';for(const section of spyTargets){if(section.offsetTop<=probe)activeId=section.id}spyLinks.forEach(link=>{const active=link.getAttribute('href')===`#${activeId}`;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current')})};
window.addEventListener('scroll',updateHeader,{passive:true});
updateHeader();

const heroSlides=[...document.querySelectorAll('.hero__slide')];
let heroIndex=0;let heroTimer;
function startHeroSlider(){if(heroTimer||!heroSlides.length)return;heroSlides[0].classList.add('active');heroTimer=setInterval(()=>{heroSlides[heroIndex].classList.remove('active');heroIndex=(heroIndex+1)%heroSlides.length;heroSlides[heroIndex].classList.add('active')},7200)}

const menuButton=document.querySelector('.menu-button');
const menu=document.querySelector('.mobile-menu');
const closeMenu=()=>{menu.classList.remove('open');menu.setAttribute('aria-hidden','true');menuButton.setAttribute('aria-expanded','false');document.body.style.overflow=''};
menuButton.addEventListener('click',()=>{menu.classList.add('open');menu.setAttribute('aria-hidden','false');menuButton.setAttribute('aria-expanded','true');document.body.style.overflow='hidden'});
menu.querySelector('button').addEventListener('click',closeMenu);
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));

const galleries={
  kitchen:['kitchen-12766-01.jpg','kitchen-12766-02.jpg','kitchen-12766-03.jpg','kitchen-12766-04.jpg','kitchen-12766-05.jpg'],
  bath:['vk-bathroom-clean.png','denis-01.jpg','denis-02.jpg'],
  flat:['denis-13.jpg','denis-14.jpg','denis-15.jpg'],
  finish:['denis-27.jpg','denis-28.jpg','denis-29.jpg']
};
const lightbox=document.querySelector('.lightbox');
const lightboxImage=lightbox.querySelector('img');
const caption=lightbox.querySelector('figcaption');
let currentGallery=[];let currentIndex=0;
function renderLightbox(){lightboxImage.src=`assets/${currentGallery[currentIndex]}`;caption.textContent=`${String(currentIndex+1).padStart(2,'0')} / ${String(currentGallery.length).padStart(2,'0')}`}
function openLightbox(name){currentGallery=galleries[name];currentIndex=0;renderLightbox();lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>openLightbox(button.dataset.gallery)));
lightbox.querySelector('.lightbox__close').addEventListener('click',closeLightbox);
lightbox.querySelector('.lightbox__prev').addEventListener('click',()=>{currentIndex=(currentIndex-1+currentGallery.length)%currentGallery.length;renderLightbox()});
lightbox.querySelector('.lightbox__next').addEventListener('click',()=>{currentIndex=(currentIndex+1)%currentGallery.length;renderLightbox()});
lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();closeLightbox()}if(lightbox.classList.contains('open')&&event.key==='ArrowRight')lightbox.querySelector('.lightbox__next').click();if(lightbox.classList.contains('open')&&event.key==='ArrowLeft')lightbox.querySelector('.lightbox__prev').click()});

const revealTargets=document.querySelectorAll('.section-mark,.section h2,.section .subtitle,.about__copy,.features article,.service-card,.service-cta,.projects__head p,.project,.all-projects,.process__head p,.steps article,.company__portrait,.company__copy,.contact>div');
revealTargets.forEach(element=>element.classList.add('reveal-item'));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');revealObserver.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -40px'});
revealTargets.forEach(element=>revealObserver.observe(element));

let countersStarted=false;
function startCounters(){if(countersStarted)return;countersStarted=true;document.querySelectorAll('[data-count]').forEach(counter=>{const target=Number(counter.dataset.count);const duration=target>100?1500:1100;const start=performance.now();const tick=now=>{const progress=Math.min((now-start)/duration,1);const eased=1-Math.pow(1-progress,3);counter.textContent=String(Math.round(target*eased));if(progress<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)})}
