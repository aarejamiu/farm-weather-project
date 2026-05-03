const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let username = form.username.value;
    let email = form.email.value;
    let password = form.password.value;
    let confirmPassword = form.confirmPassword.value;

    if (password === confirmPassword){
        message.textContent = "Registering ...";
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
                message.textContent = "Registration successful!";
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
                form.reset();
            } else {
                message.textContent = data.message || 'Registration failed.';
            }
        } catch (error) {
            console.error('Error:', error);
            message.textContent = 'An error occurred during registration.';
        }
    }else {
        message.textContent = "Password does not match.";
    }
})

// Login form handling
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('message');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let email = loginForm.email.value;
        let password = loginForm.password.value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                loginMessage.textContent = "Login successful!";

                localStorage.setItem('token', data.token);
                
                window.location.href = 'dashboard.html';
            }else{
                loginMessage.textContent = data.message || 'Incorrect email or password.';
            }
        }catch (error) {console.error('Error:', error);
            loginMessage.textContent = 'Server error.';
        }
    });

}