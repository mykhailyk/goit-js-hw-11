import './sass/main.scss';
import scroll from './js/scroll';
import topArrow from './js/lift-up';

import fetchPixabay from './js/fetch-pixabay';
import cardTemplate from './template-card.hbs';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

//діставання елементів//
const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  goTopBtn: document.querySelector('.lift_up'),
  endcollectionText: document.querySelector('.end-collection-quote'),
};

//топ ап//
topArrow();

//функція приховування кнопки при вводі пустого рядку//
refs.searchForm.addEventListener('submit', e => {
  refs.gallery.innerHTML = '';
  onFormSubmit(e);
  refs.loadMoreBtn.classList.add('is-hidden');
});
//оголошуємо глобальні змінні//
let searchingData = '';
let page = 1;
let perPage = 0;

//фінкція, яка буде відпрацьовувати сабміти форми//
async function onFormSubmit(e) {
  e.preventDefault();
  //отримую значення на 41, кожного разу при пошуку видаю 42//
  searchingData.trim() = e.currentTarget.searchQuery.value;
  page = 1;
  //прибираю зайві пробіли і пустий рядок//
  if (searchingData === '') {
    Notify.failure('Будь ласка, введіть що саме шукати');
    return;
  }
  //апі
  ///searchingData - умови пошуку, + page це номер сторінки, яка відразу виводиться на екран (по замовчуванню перша)//
  try {
    const response = await fetchPixabay(searchingData, page);
  perPage = response.hits.length;

  //якщо к-ть картинок на апі менше чи рівно к-ті картинок на 52 рядку, то видаляти кнопку load mo і виводити фінальний вираз//
  if (response.totalHits <= perPage) {
    addISHidden();
  } else {
    removeIsHidden();
  }

  if (response.totalHits === 0) {
    clearGalleryHTML();
    refs.endcollectionText.classList.add('is-hidden');
    Notify.failure('Ні, такого я не знайду');
  }
  
    if (response.totalHits > 0) {
      Notify.info(`Окай! Завантажую ще ${response.totalHits} одиниць контенту`);
      clearGalleryHTML();
      renderCard(response.hits);
    }
  } catch (error) {
    Notify.info(`Вибачте, спробуйте пізніше.`);
    console.log(error);
  }
}

//кнопка вантажити контент далі//
refs.loadMoreBtn.addEventListener('click', loadMore);

async function loadMore() {
  try {
    //функція при кліку вимикається кнопка і додається ще одна сторінка//
    refs.loadMoreBtn.disabled = true;
    pageIncrement();
    const response = await fetchPixabay(searchingData, page);

    renderCard(response.hits);
    //додаємо нові картинки//
    perPage += response.hits.length;
    scroll();
    //загальна кількість фото,я кщо більше чи рівно на кількості на беку//
    if (perPage >= response.totalHits) {
      Notify.failure('Нажаль це все.');
      //ховаємо кнопку на load more//
      addISHidden();
    }
    refs.loadMoreBtn.disabled = false;
  } catch (error) {
    console.log(error);
    Notify.info(`Вибачте, спробуйте пізніше.`);
  }
}
//API//
function addISHidden() {
  refs.loadMoreBtn.classList.add('is-hidden');
  refs.endcollectionText.classList.remove('is-hidden');
}
function removeIsHidden() {
  refs.loadMoreBtn.classList.remove('is-hidden');
  refs.endcollectionText.classList.add('is-hidden');
}
//використано вище, функція по збільшенню кількості сторінок//
function pageIncrement() {
  page += 1;
}
function clearGalleryHTML() {
  refs.gallery.innerHTML = '';
}

  let lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
  });

function lightbox() {
  lightbox.refresh();
}
function renderCard(array) {
  const cardMarkup = array.map(item => cardTemplate(item)).join('');
  refs.gallery.insertAdjacentHTML('beforeend', cardMarkup);
  lightbox();
}
