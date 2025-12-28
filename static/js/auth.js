/**
 * Authentication JavaScript
 * Handles login and signup functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = {
        mobile: document.getElementById('mobile').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('લોગિન સફળ!', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showNotification(data.message || 'લોગિન નિષ્ફળ', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('કોઈ ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.', 'error');
    }
}

/**
 * Handle signup form submission
 */
async function handleSignup(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value || '',
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/api/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('રજિસ્ટ્રેશન સફળ!', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showNotification(data.message || 'રજિસ્ટ્રેશન નિષ્ફળ', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('કોઈ ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.', 'error');
    }
}

