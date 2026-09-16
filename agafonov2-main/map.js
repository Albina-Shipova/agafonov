(() => {
  const element = document.getElementById('service-map');
  const status = document.querySelector('.map-status');
  const reset = document.querySelector('.map-reset');
  const showError = () => {
    status.hidden = false;
    status.querySelector('span').textContent = 'Не удалось загрузить карту. Попробуйте вернуться к городу или откройте её отдельно.';
  };
  if (!window.L) { reset.disabled = true; showError(); return; }
  const points = window.portfolioMapPoints || [];
  const center = [43.19, 131.96];
  const map = L.map(element, {
    center, zoom:11, minZoom:10, maxZoom:16, zoomControl:false,
    scrollWheelZoom:false, maxBounds:[[42.90,131.60],[43.50,132.25]],
    maxBoundsViscosity:1
  });
  L.control.zoom({position:'topright', zoomInTitle:'Увеличить карту', zoomOutTitle:'Уменьшить карту'}).addTo(map);
  const bounds = L.latLngBounds(points.map(point => [point.lat,point.lng]));
  const mobileDetails = document.createElement('div');
  mobileDetails.className = 'map-mobile-details';
  mobileDetails.hidden = true;
  mobileDetails.setAttribute('role','region');
  mobileDetails.setAttribute('aria-label','Фотография выбранной работы');
  element.parentElement.append(mobileDetails);
  let selectedFlag;
  const closeDetails = () => { mobileDetails.hidden = true; selectedFlag?.getElement()?.focus(); };
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileDetails.hidden) closeDetails(); });
  const overview = () => {
    map.closePopup();
    mobileDetails.hidden = true;
    if (points.length) map.fitBounds(bounds, {paddingTopLeft:[35,110],paddingBottomRight:[35,110],maxZoom:12});
    else map.setView(center,11);
  };
  const popupFor = (point, index) => {
    const card = document.createElement('article');
    card.className = 'map-project-card';
    const picture = document.createElement('img');
    picture.src = 'assets/' + point.photo;
    picture.alt = point.title;
    picture.width = 260;
    picture.height = 165;
    picture.addEventListener('error', () => {
      picture.hidden = true;
      const warning = document.createElement('p');
      warning.textContent = 'Фото недоступно. Откройте исходную публикацию.';
      card.prepend(warning);
    }, {once:true});
    const eyebrow = document.createElement('small');
    eyebrow.textContent = String(index+1).padStart(2,'0') + ' / ' + point.area;
    const title = document.createElement('h3');
    title.textContent = point.title;
    const note = document.createElement('p');
    note.className = 'map-project-card__note';
    note.textContent = 'Фото из портфолио. Место выбрано условно, адрес этой работы не подтверждён.';
    const source = document.createElement('a');
    source.href = point.source || 'https://t.me/Denis_Agafonovv/' + point.post;
    source.target = '_blank';
    source.rel = 'noopener';
    source.textContent = 'Смотреть публикацию ↗';
    card.append(picture,eyebrow,title,note,source);
    return card;
  };
  points.forEach((point,index) => {
    const number = String(index+1).padStart(2,'0');
    const marker = L.marker([point.lat,point.lng], {title:point.area+' — условная точка '+number,
      alt:'Открыть фото: '+point.area, riseOnHover:true,
      icon:L.divIcon({className:'portfolio-flag',html:'<span>'+number+'</span>',iconSize:[35,40],iconAnchor:[3,39],popupAnchor:[14,-35]})
    }).addTo(map);
    marker.on('click', () => {
      marker.unbindPopup();
      if (window.innerWidth <= 700) {
        map.closePopup();
        selectedFlag = marker;
        const close = document.createElement('button');
        close.className = 'map-mobile-details__close';
        close.type = 'button';
        close.textContent = '×';
        close.setAttribute('aria-label','Закрыть фотографию');
        close.addEventListener('click', closeDetails);
        mobileDetails.replaceChildren(close,popupFor(point,index));
        mobileDetails.hidden = false;
        close.focus({preventScroll:true});
      } else {
        marker.bindPopup(popupFor(point,index), {maxWidth:260,minWidth:210,autoPanPaddingTopLeft:[18,110],autoPanPaddingBottomRight:[18,105],className:'portfolio-popup'}).openPopup();
      }
    });
  });
  overview();
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom:10,maxZoom:16, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  let timeout;
  let failed = false;
  let loaded = false;
  tiles.on('loading', () => {
    failed = false;
    clearTimeout(timeout);
    timeout = setTimeout(showError, 12000);
  });
  tiles.on('tileload', () => { loaded = true; });
  tiles.on('tileerror', () => { failed = true; showError(); });
  tiles.on('load', () => {
    clearTimeout(timeout);
    if (failed || !loaded) showError();
    else status.hidden = true;
  });
  tiles.addTo(map);
  reset.addEventListener('click', () => { overview(); tiles.redraw(); });
  let popupOpen = false;
  map.on('popupopen', () => { popupOpen = true; });
  map.on('popupclose', () => { popupOpen = false; });
  let frame;
  new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      map.invalidateSize({pan:false});
      if (!popupOpen) overview();
    });
  }).observe(element);
})();
