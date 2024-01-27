import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const BASE_URL = 'https://pixabay.com/api/';

const API_KEY = '41936299-e1d4d29e6aed15564c1848147';

const refs = {
  form: document.querySelector('.form'),
  input: document.querySelector('.search-input'),
  button: document.querySelector('.search-btn'),
  loader: document.querySelector('.loader'),
  gallery: document.querySelector('.gallery'),
};
let simpleGallery;

refs.form.addEventListener(`submit`, e => {
  e.preventDefault();
  const query = refs.input.value.trim();
  if (!query) {
    createMessage('Please, enter search term!');
    return;
  }
  showLoader(true);
  refs.form.reset();

  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true`;

  fetchApiPhotos(url)
    .then(data => {
      if (data.hits.length === 0) {
        createMessage(
          `Sorry, there are no images matching your search query. Please, try again!`
        );
        return;
      }
      simpleGallery = new SimpleLightbox('.gallery-item a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
      simpleGallery.refresh();
      refs.gallery.innerHTML = createMarkup(data.hits);
    })
    .catch(error => console.error(error))
    .finally(() => showLoader(false));
});

function fetchApiPhotos(url) {
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
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

function showLoader(state = true) {
  refs.loader.style.display = !state ? 'none' : 'inline-block';
  refs.button.disabled = state;
}
