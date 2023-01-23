import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import { refs } from './refs';
import { getData } from './getData';
import { markupCard } from './markup';
import 'simplelightbox/dist/simple-lightbox.min.css';

let gallery = new SimpleLightbox('.gallery a');
let page = 1;
let value = '';
let totalPage = 0;
let totalImg = 0;
let searchedImg = 0;
const options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};
const observer = new IntersectionObserver(onInfinityLoad, options);

async function onSubmit(evt) {
  //handling the event of pressing the "search" button
  evt.preventDefault();
  value = evt.target.searchQuery.value.trim();
  page = 1;
  searchedImg = 0;
  if (!value) {
    //if the user has not entered anything
    Notiflix.Notify.failure('Please enter a keyword to search.');
    return;
  } else {
    refs.gallery.innerHTML = '';
  }

  const data = await getData(value, page);
  if (data.totalHits === 0) {
    //if nothing is found for the user-entered passphrase
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  evt.target.reset(); //restores default values
  //shows the image loaded from the server on the page
  refs.gallery.insertAdjacentHTML('beforeend', markupCard(data.hits));
  Notiflix.Notify.success(`Hooray! We found ${data.total} images..`);
  //Math.ceil - rounds the argument to the nearest higher integer
  totalPage = Math.ceil(data.total / data.hits.length);
  searchedImg = data.total;
  observer.observe(refs.guard);
  // const markup = createMarkup(data.hits);
  totalImg += data.hits.length;
  gallery.refresh(); //reinitializes the lightbox after manipulating the home
  if (totalImg >= data.totalHits) {
    observer.unobserve(refs.guard);
  }
}

async function loadMoreData(evt) {
  page += 1;
  const data = await getData(value, page);
  
  refs.gallery.insertAdjacentHTML('beforeend', markupCard(data.hits));
  gallery.refresh(); //reinitializes the lightbox after manipulating the home
  const { height: cardHeight } = document
    .querySelector('.gallery')
    //returns the size of the element and its position relative to the viewport
    .firstElementChild.getBoundingClientRect();

    if (totalPage < page) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    if (searchedImg > (totalPage - page) * 40 && (totalPage - page) > 0 ) {
      Notiflix.Notify.success(
        `Attention! Remaining ${(totalPage - page) * 40} images.`
      );
    }

  window.scrollBy({
    //scrolling the screen up one rows of images
    top: cardHeight * 1,
    behavior: 'smooth',
  });
}

refs.form.addEventListener('submit', onSubmit);

function onInfinityLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMoreData();
    }
  });
}
