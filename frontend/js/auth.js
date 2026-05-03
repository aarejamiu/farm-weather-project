const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let username = form.username.value;
    let email = form.email.value;
    let password = form.password.value;
    let confirmPassword = form.confirmPassword.value;

    if (password === confirmPassword){
        message.textContent = "Logging in ...";
    }else {
        message.textContent = "Password does not match.";
    }
})
try{
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (res.ok) {
        message.textContent = " Registration successful!";
        window.location.href = 'login.html';
        form.reset();
    } else {
        message.textContent = data.message || 'Registration failed.';
    }
} catch (error) {
    console.error('Error:', error);
    message.textContent = 'An error occurred during registration.';
}