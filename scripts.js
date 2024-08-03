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

document.addEventListener('DOMContentLoaded', () => {
  const token = getCookie('token');
  
  if (token) {
      if (isTokenExpired(token)) {
          alert('Session has expired. Please log in again.');
          // Optionally, redirect to the login page
          window.location.href = 'login.html';
      } else {
          console.log('Session is still valid.');
          document.getElementById("login-link").style.visibility = "hidden";
      }
  } else {
      alert('No token found. Please log in.');
      window.location.href = 'login.html';
  }
});
