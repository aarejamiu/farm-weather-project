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