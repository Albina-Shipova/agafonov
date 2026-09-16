// Local screenshot: no map library or external tile requests.
(() => {
 const points = [
  {
    "area": "Эгершельд",
    "lat": 43.1005,
    "lng": 131.8638,
    "photo": "kitchen-12766-01.jpg",
    "title": "Кухня · рабочая зона",
    "post": "12766",
    "x": 19.1,
    "y": 82.45454545454545
  },
  {
    "area": "Центр",
    "lat": 43.116,
    "lng": 131.887,
    "photo": "denis-27.jpg",
    "title": "Чистовая отделка",
    "post": "13139",
    "x": 25.9,
    "y": 76.81818181818181
  },
  {
    "area": "Орлиное гнездо",
    "lat": 43.124,
    "lng": 131.904,
    "photo": "kitchen-12766-03.jpg",
    "title": "Угловая кухня",
    "post": "12766",
    "x": 30.8,
    "y": 73.9090909090909
  },
  {
    "area": "Чуркин",
    "lat": 43.0897,
    "lng": 131.9176,
    "photo": "denis-01.jpg",
    "title": "Отделка ванной",
    "post": "13153",
    "x": 34.8,
    "y": 86.36363636363636
  },
  {
    "area": "Тихая",
    "lat": 43.104,
    "lng": 131.9634,
    "photo": "denis-03.jpg",
    "title": "Ремонт ванной",
    "post": "13153",
    "x": 48.1,
    "y": 81.18181818181819
  },
  {
    "area": "Луговая",
    "lat": 43.117,
    "lng": 131.94,
    "photo": "denis-13.jpg",
    "title": "Предчистовая отделка",
    "post": "13172",
    "x": 41.3,
    "y": 76.45454545454545
  },
  {
    "area": "Первая Речка",
    "lat": 43.144,
    "lng": 131.908,
    "photo": "denis-14.jpg",
    "title": "Подготовка стен",
    "post": "13172",
    "x": 32,
    "y": 66.63636363636364
  },
  {
    "area": "Вторая Речка",
    "lat": 43.179,
    "lng": 131.918,
    "photo": "denis-15.jpg",
    "title": "Работы в квартире",
    "post": "13172",
    "x": 34.9,
    "y": 54
  },
  {
    "area": "Снеговая Падь",
    "lat": 43.17755,
    "lng": 131.9394,
    "photo": "denis-18.jpg",
    "title": "Комплексный ремонт",
    "post": "13130",
    "x": 41.1,
    "y": 54.45454545454545
  },
  {
    "area": "Седанка",
    "lat": 43.213,
    "lng": 131.953,
    "photo": "denis-20.jpg",
    "title": "Детали ремонта",
    "post": "13130",
    "x": 45.1,
    "y": 41.63636363636363
  },
  {
    "area": "Весенняя",
    "lat": 43.276,
    "lng": 132.055,
    "photo": "denis-29.jpg",
    "title": "Готовая комната",
    "post": "13139",
    "x": 74.8,
    "y": 18.727272727272727
  },
  {
    "area": "Трудовое",
    "lat": 43.303,
    "lng": 132.083,
    "photo": "vk-kitchen-01.jpg",
    "title": "Кухня с мебелью и техникой",
    "source": "https://vk.ru/albums-176133912",
    "x": 83,
    "y": 8.909090909090908
  }
];
 const host = document.querySelector('#service-map');
 const stage = document.createElement('div');
 stage.className = 'static-map-stage';
 const picture = document.createElement('img');
 picture.src = 'assets/vladivostok-map.png';
 picture.alt = 'Карта Владивостока: городские кварталы и северный пригород';
 picture.width = 1000; picture.height = 1100;
 stage.append(picture); host.append(stage);
 const list = document.querySelector('.map-districts');
 const panel = document.querySelector('.static-map-details');
 let selectedButton;
 const close = () => { panel.hidden = true; selectedButton?.focus({preventScroll:true}); };
 const open = (point, index, trigger) => {
  selectedButton = trigger;
  panel.replaceChildren();
  const closeButton = document.createElement('button');
  closeButton.type = 'button'; closeButton.className = 'map-mobile-details__close';
  closeButton.textContent = '×'; closeButton.setAttribute('aria-label','Закрыть фотографию');
  closeButton.addEventListener('click',close);
  const card = document.createElement('article'); card.className = 'map-project-card';
  const img = document.createElement('img'); img.src = 'assets/' + point.photo; img.alt = point.title;
  const label = document.createElement('small'); label.textContent = String(index+1).padStart(2,'0') + ' / ' + point.area;
  const title = document.createElement('h3'); title.textContent = point.title;
  const note = document.createElement('p'); note.className='map-project-card__note';
  note.textContent='Пример из портфолио. Привязка к району условная; адрес работы не подтверждён.';
  const source=document.createElement('a'); source.href=point.source || 'https://t.me/Denis_Agafonovv/' + point.post;
  source.target='_blank'; source.rel='noopener'; source.textContent='Смотреть публикацию ↗';
  card.append(img,label,title,note,source); panel.append(closeButton,card);panel.hidden=false;closeButton.focus({preventScroll:true});
  document.querySelectorAll('.static-map-flag,.map-districts button').forEach(el=>el.classList.toggle('is-selected',Number(el.dataset.index)===index));
 };
 points.forEach((point,index)=>{
  const button=document.createElement('button'); button.className='static-map-flag';button.type='button';
  button.style.left=point.x+'%';button.style.top=point.y+'%';button.dataset.index=index;
  button.title=point.area;button.setAttribute('aria-label','Показать фото: '+point.area);
  button.innerHTML='<span>'+String(index+1).padStart(2,'0')+'</span>';
  button.addEventListener('click',()=>open(point,index,button));stage.append(button);
  const item=document.createElement('button');item.type='button';item.dataset.index=index;
  const num=document.createElement('b');num.textContent=String(index+1).padStart(2,'0');
  item.append(num,document.createTextNode(point.area));item.addEventListener('click',()=>open(point,index,item));list.append(item);
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close();});
})();
