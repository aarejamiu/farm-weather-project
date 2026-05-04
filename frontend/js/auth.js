const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let username = form.username.value;
    let email = form.email.value;
    let password = form.password.value;
    let confirmPassword = form.confirmPassword.value;

    if (password === confirmPassword){
        message.textContent = "Registering...";
    }else {
        message.textContent = "Password does not match.";
    }
    try{
    const res = await fetch("http://localhost:5000/api/auth/register",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });

    // const data = await res.json();

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
})


// Login form handling
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('message');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        console.log('Login clicked');
        
        e.preventDefault();
        let email = loginForm.email.value;
        let password = loginForm.password.value;

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
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