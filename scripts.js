document.addEventListener('DOMContentLoaded', async () => {
  const token = checkAuthentication();
  const placeId = getPlaceId();

  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
      reviewForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const reviewText = document.getElementById('review-text').value;
          console.log(reviewText);
          const rating = document.getElementById("rating").value;
          await submitReview(token, placeId, reviewText, Number(rating[0]));
      });
  }
});

function checkAuthentication() {
  const token = getCookie('token');
  if (!token) {
      window.location.href = 'index.html';
  }
  return token;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function decodeJWT(token) {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}

function isTokenExpired(token) {
  const decoded = decodeJWT(token);
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return decoded.exp < currentTime;
}

async function submitReview(token, placeId, reviewText, rating) {
  try {
      const response = await fetch(`https://ubiquitous-cod-977jwrpg7j5jfxxw7-5000.app.github.dev/places/${placeId}/reviews`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              place_id: placeId,
              review: reviewText,
              rating: rating
          })
      });

      handleReviewResponse(response);
  } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting your review. Please try again.');
  }
}

function handleReviewResponse(response) {
  if (response.ok) {
      alert('Review submitted successfully!');
      document.getElementById('review-form').reset(); // Clear the form
  } else {
      alert('Failed to submit review. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = getCookie('token');
  const placeId = getPlaceId();
  
  if (token) {
      if (isTokenExpired(token)) {
          alert('Session has expired. Please log in again.');
          window.location.href = 'login.html';
      } else {
          console.log('Session is still valid.');
          document.getElementById("login-link").style.visibility = "hidden";
          await fetchPlaceDetails(token, placeId);
          await populateCountryFilter();
          getPlaces();
          document.getElementById("places-header").style.visibility = "visible";
          document.getElementById("filter").style.visibility = "visible";
      }
  } else {
      alert('No token found. Please log in.');
      window.location.href = 'login.html';
      document.getElementById("add-review").style.visibility = "hidden";
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  // when filter is changed
  document.getElementById('country-filter').addEventListener('change', getPlaces);
 
  });

function calculateStars(reviews){
  if (!reviews[0]) return 0;

  let sumOfStars = 0;
  for (let review of reviews) {
    sumOfStars += review.rating;
  }
  return sumOfStars / reviews.length;
}

function displayReviews(review) {
  const reviewSection = document.getElementById("reviews");
  const reviewCard = document.createElement("div");
  reviewCard.className = "place-card-review";
  const firstDiv = document.createElement("div");
  firstDiv.className = "card-content-review";
  firstDiv.innerHTML = `<span>${review.user_name}:</span>`;
  const secDiv = document.createElement("div");
  secDiv.className = "card-content-review";
  secDiv.innerHTML = `${review.comment}`;
  const thirdDiv = document.createElement("div");
  thirdDiv.className = "card-content-review";
  thirdDiv.innerHTML = `Rating: ${review.rating}`;

  reviewSection.appendChild(reviewCard);
  reviewCard.appendChild(firstDiv);
  reviewCard.appendChild(secDiv);
  reviewCard.appendChild(thirdDiv);
}

function getPlaceId() {
  const params = new URLSearchParams(window.location.search);
  return localStorage.getItem("selectedPlaceId");
}

async function fetchPlaceDetails(token, placeId) {
  try {
      const response = await fetch(`https://ubiquitous-cod-977jwrpg7j5jfxxw7-5000.app.github.dev/places/${placeId}`, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (response.ok) {
          const place = await response.json();
          displayPlaceDetails(place);
          if (!place.reviews[0]){
            document.getElementById("reviews").innerHTML = '<center><p><i>No Reviews</i></p></center>';
          } 
          else {
            document.getElementById("reviews").innerHTML = '';
            place.reviews.forEach(displayReviews);
          }  
      } else {
          console.error('Failed to fetch place details');
      }
  } catch (error) {
      console.error('Error fetching place details:', error);
  }
}

function displayPlaceDetails(place) {
  const placeDetailsSection = document.getElementById('place-details');
  const heading = document.getElementById("heading");
  placeDetailsSection.innerHTML = '';

  const nameDiv = document.createElement('div');
  nameDiv.className = 'card-content-place';
  nameDiv.innerHTML = `<h1>${place.place_name}</h1>`;
  
  const hostDiv = document.createElement('div');
  hostDiv.className = 'card-content-place';
  hostDiv.innerHTML = `<span>Host:</span> ${place.host_name}`;
  
  const priceDiv = document.createElement('div');
  priceDiv.className = 'card-content-place';
  priceDiv.innerHTML = `<span>Price per night:</span> $${place.price_per_night}`;
  
  const locationDiv = document.createElement('div');
  locationDiv.className = 'card-content-place';
  locationDiv.innerHTML = `<span>Location:</span> ${place.city_name}, ${place.country_name}`;
  
  const descriptionDiv = document.createElement('div');
  descriptionDiv.className = 'card-content-place';
  descriptionDiv.innerHTML = `<span>Description:</span> ${place.description}`;
  
  const ratingDiv = document.createElement('div');
  ratingDiv.className = 'card-content-place';
  ratingDiv.innerHTML = `<span>Rating:</span> ${calculateStars(place.reviews)} stars`;

  heading.appendChild(nameDiv);
  placeDetailsSection.appendChild(hostDiv);
  placeDetailsSection.appendChild(priceDiv);
  placeDetailsSection.appendChild(locationDiv);
  placeDetailsSection.appendChild(descriptionDiv);
  placeDetailsSection.appendChild(ratingDiv);
}

async function populateCountryFilter() {
  try {
      const response = await fetch('https://ubiquitous-cod-977jwrpg7j5jfxxw7-5000.app.github.dev/places');
      if (response.ok) {
          const places = await response.json();
          const uniqueCountries = [...new Set(places.map(place => place.country_name))];
          const filterSelect = document.getElementById('country-filter');
          uniqueCountries.forEach(country => {
              const option = document.createElement('option');
              option.value = country;
              option.textContent = country;
              filterSelect.appendChild(option);
          });
      } else {
          console.error('Failed to retrieve countries');
      }
  } catch (error) {
      console.error('Error populating country filter:', error);
  }
}

async function getPlaces() {
  try {
      const response = await fetch('https://ubiquitous-cod-977jwrpg7j5jfxxw7-5000.app.github.dev/places');
      if (response.ok) {
          const data = await response.json();
          const selectedCountry = document.getElementById('country-filter').value;
          const filteredPlaces = selectedCountry === 'All' ? data : data.filter(place => place.country_name === selectedCountry);
          document.getElementById('places-list').innerHTML = ''; // Clear existing places
          filteredPlaces.forEach(displayPlaces);
      } else {
          console.error('Error retrieving data from API');
      }
  } catch (error) {
      console.error('Error retrieving data from API:', error);
  }
}

function displayPlaces(place) {
  const placeCard = document.createElement('div');
  placeCard.className = 'place-card';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'card-content';
  const title = document.createElement('h1');
  title.textContent = place.place_name;
  titleDiv.appendChild(title);

  const priceDiv = document.createElement('div');
  priceDiv.className = 'card-content';
  priceDiv.textContent = `Price per night: $${place.price_per_night}`;

  const locationDiv = document.createElement('div');
  locationDiv.className = 'card-content';
  locationDiv.textContent = `Location: ${place.city_name}, ${place.country_name}`;

  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'card-content';
  const button = document.createElement('button');
  button.className = 'view-button';
  button.textContent = 'View Details';
  button.onclick = function() {
      viewPlaceDetails(place.id);
  };
  buttonDiv.appendChild(button);

  placeCard.appendChild(titleDiv);
  placeCard.appendChild(priceDiv);
  placeCard.appendChild(locationDiv);
  placeCard.appendChild(buttonDiv);

  document.getElementById('places-list').appendChild(placeCard);
}

function viewPlaceDetails(placeId) {
  localStorage.setItem('selectedPlaceId', placeId);
  window.location.href = 'place.html';
}

// document.addEventListener('DOMContentLoaded', async () => {
//   document.getElementById("add-review").style.visibility = "visible";
//   });