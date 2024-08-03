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

document.addEventListener('DOMContentLoaded', async () => {
  const token = getCookie('token');
  
  if (token) {
      if (isTokenExpired(token)) {
          alert('Session has expired. Please log in again.');
          window.location.href = 'login.html';
      } else {
          console.log('Session is still valid.');
          document.getElementById("login-link").style.visibility = "hidden";
          await populateCountryFilter();
          getPlaces();
      }
  } else {
      alert('No token found. Please log in.');
      window.location.href = 'login.html';
  }
});

async function populateCountryFilter() {
  try {
      const response = await fetch('https://zcck56hn-5000.inc1.devtunnels.ms/places');
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
      const response = await fetch('https://zcck56hn-5000.inc1.devtunnels.ms/places');
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

// when filter is changed
document.getElementById('country-filter').addEventListener('change', getPlaces);
