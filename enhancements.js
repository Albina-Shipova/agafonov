(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slides = [...document.querySelectorAll('.hero__slide')];
  let slideIndex = 0;
  let slideTimer;
  let ready = false;
  const advance = () => {
    const previous = slides[slideIndex];
    previous.classList.remove('is-active');
    previous.classList.add('is-leaving');
    slideIndex = (slideIndex + 1) % slides.length;
    const next = slides[slideIndex];
    next.classList.remove('is-leaving');
    next.classList.add('is-active');
  };
  window.addEventListener('site:ready', () => {
    ready = true;
    slides[0]?.classList.add('is-active');
    if (!reduced) slideTimer = setInterval(advance, 11000);
  }, {once:true});
  document.addEventListener('visibilitychange', () => {
    clearInterval(slideTimer);
    if (!document.hidden && ready && !reduced) slideTimer = setInterval(advance, 11000);
  });
  const serviceObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
  }, {threshold:.15});
  document.querySelectorAll('.service--image').forEach(el => serviceObserver.observe(el));

  const track = document.querySelector('.principles');
  const cards = [...track.children];
  const previous = document.querySelector('.advantages-prev');
  const next = document.querySelector('.advantages-next');
  const counter = document.querySelector('.advantages-counter');
  const index = () => Math.round(track.scrollLeft / (cards[0].getBoundingClientRect().width + 16));
  const update = () => {
    const active = Math.max(0, Math.min(cards.length - 1, index()));
    counter.textContent = `${String(active + 1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    previous.disabled = active === 0;
    next.disabled = active === cards.length - 1;
  };
  const step = direction => track.scrollTo({left:Math.max(0, Math.min(cards.length-1,index()+direction)) * (cards[0].getBoundingClientRect().width+16),behavior:reduced?'instant':'smooth'});
  previous.addEventListener('click',()=>step(-1));
  next.addEventListener('click',()=>step(1));
  track.addEventListener('scroll',update,{passive:true});
  track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();step(event.key==='ArrowRight'?1:-1);}});
  window.addEventListener('resize',update);
  update();
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      document.querySelector('.nav').classList.remove('open');
      document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');
    }
    const dialog=document.querySelector('.lightbox.open');
    if(event.key==='Tab'&&dialog){
      const buttons=[...dialog.querySelectorAll('button')];
      if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons.at(-1).focus();}
      else if(!event.shiftKey&&document.activeElement===buttons.at(-1)){event.preventDefault();buttons[0].focus();}
    }
  });
})();
