// Configura aquí el endpoint de login de tu backend
const API_URL = ''; // Cambia si tu endpoint es otro http://127.0.0.1:3000/accounts/login/  !!!!! https://coffeu-16727117187.europe-west1.run.app/accounts/login/

// --- MINI LIBRERÍA DE USUARIOS PARA SIMULACIÓN ---
// Esta base de datos local se usa cuando no hay API_URL o se abre como archivo local.
const localUserDB = {
    users: [
        { identificador: 'sjcristian666@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario de Prueba', email: 'sjcristian666@gmail.com', id: 1 } },
        { identificador: 'mina8avc@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 2 } },
		{ identificador: 'gmaciasochoa00@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 3 } },
		{ identificador: 'steram8a@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 4 } },
		{ identificador: 'l21420223@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 5 } },
		{ identificador: 'elhijodelbishocr7@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 6 } },
		{ identificador: 'novoanegociosoficial@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 7 } },
		{ identificador: 'ropperarceo@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 8 } },
		{ identificador: 'saulnovoavaldominos@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 9 } },
		{ identificador: 'sancorjesus25@gmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 10 } },
		{ identificador: 'novasa06@hotmail.com', password: '12345', user: { nombre_usuario: 'Usuario', telefono_celular: '', id: 11 } }
    ],
    findUser: function(identificador, password) {
        return this.users.find(u => u.identificador === identificador && u.password === password);
    }
};

document.addEventListener('DOMContentLoaded', () => {
	// Referencias a elementos del DOM (defensivo por si faltan)
	const form = document.getElementById('loginForm');
	const msg = document.getElementById('msg');
	const success = document.getElementById('success');
	const userContainer = document.getElementById('userContainer');
	const userInfo = document.getElementById('userInfo');
	const identificadorErrorEl = document.getElementById('identificadorError');
	const passwordErrorEl = document.getElementById('passwordError');

	function safeSetDisplay(el, display) { if (el) el.style.display = display; }
	function safeSetText(el, text) { if (el) el.textContent = text; }

	function showError(text) {
		safeSetText(msg, text);
		safeSetDisplay(msg, 'block');
		safeSetDisplay(success, 'none');
	}
	function showSuccess(text) {
		safeSetText(success, text);
		safeSetDisplay(success, 'block');
		safeSetDisplay(msg, 'none');
	}
	function showStoredUser() {
		if (!userContainer || !userInfo) return;
		const stored = localStorage.getItem('user');
		if (!stored) return;
		try {
			const u = JSON.parse(stored);
			userInfo.innerHTML = `<strong>${u.identificador || u.nombre_usuario || u.email || 'Usuario'}</strong>`;
			userContainer.style.display = 'block';
		} catch (e) { /* ignore parse errors */ }
	}

	// No mostrar usuario en la página de login (evitar que aparezca en el HTML)
	// Si se necesita mostrar en otras páginas, llamar manualmente a showStoredUser() allí.

	if (!form) return; // nada más que hacer si no hay formulario

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		// limpiar mensajes
		safeSetDisplay(msg, 'none');
		safeSetDisplay(success, 'none');
		if (userContainer) userContainer.style.display = 'none';
		if (identificadorErrorEl) { identificadorErrorEl.style.display = 'none'; identificadorErrorEl.textContent = ''; }
		if (passwordErrorEl) { passwordErrorEl.style.display = 'none'; passwordErrorEl.textContent = ''; }

		const identificador = (document.getElementById('identificador')?.value || '').trim();
		const password = (document.getElementById('password')?.value || '');

		// validación cliente
		let hasError = false;
		if (!identificador) {
			if (identificadorErrorEl) { identificadorErrorEl.textContent = 'Por favor ingresa usuario o correo.'; identificadorErrorEl.style.display = 'block'; }
			hasError = true;
		}
		if (!password) {
			if (passwordErrorEl) { passwordErrorEl.textContent = 'Por favor ingresa la contraseña.'; passwordErrorEl.style.display = 'block'; }
			hasError = true;
		}
		if (hasError) return;

		// Si la página se abrió con file:// usar simulación local para que funcione sin servidor
		const isFileProtocol = location.protocol === 'file:';
		if (isFileProtocol || !API_URL) {
			// Simulación de login local usando la mini-librería
			const foundUser = localUserDB.findUser(identificador, password);
			if (foundUser) {
				localStorage.setItem('user', JSON.stringify(foundUser.user));
				showSuccess('Ingreso simulado exitoso. Redirigiendo...');
				// Redirigir a index.html en la raíz del proyecto
				setTimeout(() => { window.location.href = '../index.html'; }, 700);
			} else {
				showError('Credenciales Inválidas.');
			}
			return; // Detener ejecución para no llamar a la API real
		}

		// Si no estamos en file://, intentar login real contra API
		try {
			const resp = await fetch(API_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ identificador, password })
			});

			const data = await resp.json();

			if (!resp.ok) {
				const err = data?.error || data?.detail || JSON.stringify(data);
				const lower = String(err).toLowerCase();
				if (resp.status === 404
					|| lower.includes('no existe')
					|| lower.includes('no encontrado')
					|| lower.includes('not found')
					|| (lower.includes('correo') && lower.includes('no'))) {
					if (identificadorErrorEl) { identificadorErrorEl.textContent = 'El Correo no Existe'; identificadorErrorEl.style.display = 'block'; }
				} else {
					showError(err);
				}
				return;
			}

			if (data.access_token && data.refresh_token) {
				localStorage.setItem('access_token', data.access_token);
				localStorage.setItem('refresh_token', data.refresh_token);

				// almacenar info mínima de usuario también
				if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

				showSuccess('Autenticado correctamente');
				// actualizar UI con info recibida
				if (userInfo) {
					const u = data.user || {};
					userInfo.innerHTML = `
						<strong>${u.nombre_usuario || u.email || 'Usuario'}</strong><br/>
						Correo: ${u.email || '-'}<br/>
						Teléfono: ${u.telefono_celular || '-'}<br/>
						ID: ${u.id || '-'}
					`;
					if (userContainer) userContainer.style.display = 'block';
				}
				// redirigir tras autenticación correcta
				// Corregido: Redirigir a ../index.html ya que login.html está en la carpeta /view
				// y el home principal es index.html en la raíz.
				window.location.href = '../index.html';
			} else {
				showError('Respuesta inesperada del servidor.');
			}
		} catch (error) {
			console.error('Error en el login:', error);
			showError('No se pudo conectar al servidor. Intenta de nuevo.');
		}
	});
});