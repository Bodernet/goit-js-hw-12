import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api';
const API_KEY = '41936299-e1d4d29e6aed15564c1848147';
const hidden = 'is-hidden';
const simpleGallery = new SimpleLightbox('.gallery-item a', {
  captionsData: 'alt',
  captionDelay: 250,
});
const refs = {
  form: document.querySelector('.form'),
  input: document.querySelector('.search-input'),
  button: document.querySelector('.search-btn'),
  loader: document.querySelector('.loader'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more-btn'),
};

let query = '';
let page = 1;
let maxPage = 0;

refs.form.addEventListener(`submit`, onSearch);

async function onSearch(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  page = 1;
  refs.loadMoreBtn.classList.add(hidden);
  query = refs.input.value.trim();

  if (!query) {
    createMessage('Please, enter search term!');
    return;
  }

  try {
    const { hits, totalHits } = await getImages(query);
    maxPage = Math.ceil(totalHits / 40);
    createMarkup(hits);
    simpleGallery.refresh();
    refs.form.reset();
    if (hits.length > 0) {
      refs.loadMoreBtn.classList.remove(hidden);
      refs.loadMoreBtn.addEventListener('click', onLoadMoreBtn);
    } else {
      refs.loadMoreBtn.classList.add(hidden);
      createMessage(
        `Sorry, there are no images matching your search query. Please, try again!`
      );
    }
    showLoader(false);
  } catch (error) {
    console.log(error);
  } finally {
    refs.form.reset();
    if (page === maxPage) {
      refs.loadMoreBtn.classList.add(hiddenClass);
      createMessage(
        "We're sorry, but you've reached the end of search results!"
      );
    }
  }
}

async function onLoadMoreBtn() {
  page += 1;
  try {
    showLoader(true);
    refs.loadMoreBtn.classList.add(hidden);
    const { hits } = await getImages(query, page);
    createMarkup(hits);
    simpleGallery.refresh();
    showLoader(false);
    scrollDown();
    refs.loadMoreBtn.classList.remove(hidden);
  } catch (error) {
    console.log(error);
  } finally {
    if (page === maxPage) {
      refs.loadMoreBtn.classList.add(hidden);
      createMessage(
        "We're sorry, but you've reached the end of search results!"
      );
    }
  }
}

async function getImages(query, page = 1) {
  showLoader(true);
  const data = await axios.get('/', {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page,
    },
  });
  return data.data;
}

function createMarkup(hits) {
  return hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `
          <li class="gallery-item">
    <a class="gallery-link" href="${largeImageURL}">
      <img
        class="gallery-img"
        src="${webformatURL}"
        alt="${tags}"
      />
      <p class="gallery-inf">
      Likes: <span class="img-stat">${likes}</span> 
      Views: <span class="img-stat">${views}</span> 
      Comments: <span class="img-stat">${comments}</span> 
      Downloads: <span class="img-stat">${downloads}</span></p>
    </a>
  </li>`
    )
    .join('');
}

function createMessage(message) {
  iziToast.show({
    class: 'error-circul',
    position: 'topRight',
    icon: 'error-circul',
    message: message,
    maxWidth: '432',
    messageColor: '#fff',
    messageSize: '16px',
    backgroundColor: '#EF4040',
    close: false,
    closeOnClick: true,
  });
}
function scrollDown() {
  const galleryLink = document.querySelector('.gallery-link');
  if (galleryLink) {
    const rect = galleryLink.getBoundingClientRect();
    window.scrollBy({ top: rect.height * 2, left: 0, behavior: 'smooth' });
  }
}

function showLoader(state = true) {
  refs.loader.style.display = !state ? 'none' : 'inline-block';
  refs.button.disabled = state;
}
