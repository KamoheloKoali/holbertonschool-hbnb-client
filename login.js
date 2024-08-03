document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('login__password').value;
            await loginUser(email, password);
        });
    }
});

async function loginUser(email, password) {
    try {
        const response = await fetch('https://zcck56hn-5000.inc1.devtunnels.ms/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        handleLoginResponse(response);
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function handleLoginResponse(response) {
    if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = 'index.html'; // Redirect to main page after successful login
    } else {
        const errorMessage = await response.text();
        alert('Login failed: ' + errorMessage);
    }
}
