// Configura aquí el endpoint de login de tu backend
const API_URL = 'http://127.0.0.1:3000/accounts/login/'; // Cambia si tu endpoint es otro


const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const success = document.getElementById('success');
const userContainer = document.getElementById('userContainer');
const userInfo = document.getElementById('userInfo');

function showError(text) {
	msg.textContent = text;
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
	userContainer.style.display = 'none';

	const identificador = document.getElementById('identificador').value.trim();
	const password = document.getElementById('password').value;

	try {
		const resp = await fetch(API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ identificador, password })
		});

		const data = await resp.json();

		if (!resp.ok) {
			// Mostrar mensaje de error del backend si existe
			const err = data?.error || data?.detail || JSON.stringify(data);
			showError(err);
			return;
		}

		// Esperamos: { refresh_token, access_token, user: { id, nombre_usuario, email, telefono_celular } }
		if (data.access_token && data.refresh_token) {
			// Guardar tokens (puedes ajustar almacenamiento según tu seguridad)
			localStorage.setItem('access_token', data.access_token);
			localStorage.setItem('refresh_token', data.refresh_token);

			showSuccess('Autenticado correctamente');
			window.location.href = 'home.html';

			// Mostrar info del usuario
			const u = data.user || {};
			userInfo.innerHTML = `
						<strong>${u.nombre_usuario || u.email || 'Usuario'}</strong><br/>
						Correo: ${u.email || '-'}<br/>
						Teléfono: ${u.telefono_celular || '-'}<br/>
						ID: ${u.id || '-'}
			`;
            userContainer.style.display = 'block'; // Show user info
		} else {
            showError('Respuesta inesperada del servidor.');
        }
	} catch (error) {
        console.error('Error en el login:', error);
        showError('No se pudo conectar al servidor. Intenta de nuevo.');
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});