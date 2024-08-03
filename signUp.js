document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('hey')
            const email = document.getElementById('email').value;
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const password = document.getElementById('login__password').value;
            await loginUser(email, password, firstName, lastName);
        });
    }
});

async function loginUser(email, password, firstName, lastName) {
    try {
        const response = await fetch('https://potential-spoon-v66qw9xj6gx525jv-5000.app.github.dev/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "email": email, "password": password, "first_name": firstName, "last_name": lastName })
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
