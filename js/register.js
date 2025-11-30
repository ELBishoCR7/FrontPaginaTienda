const API_URL = 'http://127.0.0.1:3000/accounts/registro/';

const form = document.getElementById('registerForm');
const msg = document.getElementById('msg');
const success = document.getElementById('success');

function showError(text) {
    msg.innerHTML = text; // Use innerHTML to allow for lists
    msg.style.display = 'block';
    success.style.display = 'none';
}

function showSuccess(text) {
    success.textContent = text;
    success.style.display = 'block';
    msg.style.display = 'none';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.style.display = 'none';
    success.style.display = 'none';

    const nombre_usuario = document.getElementById('nombre_usuario').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono_celular = document.getElementById('telefono_celular').value.trim();
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    if (password !== password2) {
        showError('Las contraseñas no coinciden.');
        return;
    }

    const payload = {
        nombre_usuario,
        email,
        telefono_celular,
        password,
        password2
    };

    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await resp.json();

        if (!resp.ok) {
            let errorText = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
            if (data) {
                const errors = Object.entries(data).map(([key, value]) => {
                    return `<li>${key}: ${Array.isArray(value) ? value.join(', ') : value}</li>`;
                }).join('');
                errorText = `<ul>${errors}</ul>`;
            }
            showError(errorText);
            return;
        }

        showSuccess('¡Registro exitoso! Revisa tu correo para activar tu cuenta. Serás redirigido al login en 5 segundos.');
        form.reset();
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 5000);


    } catch (error) {
        console.error('Error en el registro:', error);
        showError('No se pudo conectar al servidor. Intenta de nuevo.');
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await fetch('/api/registro/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registro exitoso. Por favor revisa tu email para activar tu cuenta.');
            window.location.href = '/login.html';
        } else {
            alert(data.message || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});