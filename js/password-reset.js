document.addEventListener('DOMContentLoaded', () => {
    let resetEmail = null;

    document.getElementById('forgotForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;

        try {
            const response = await fetch('http://127.0.0.1:3000/accounts/forgot/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                resetEmail = email;
                document.getElementById('forgotForm').style.display = 'none';
                document.getElementById('resetForm').style.display = 'block';
            } else {
                alert(data.message || data.detail || 'Error al enviar el código');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    });

    document.getElementById('resetForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('code').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            const payload = {
                otp: code,
                new_password: newPassword,
                new_password2: confirmNewPassword
            };
            // Incluir email si lo tenemos
            if (resetEmail) payload.email = resetEmail;

            const response = await fetch('http://127.0.0.1:3000/accounts/reset/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok) {
                alert('Contraseña actualizada exitosamente');
                window.location.href = 'http://localhost:8000/view/login.html';
            } else {
                alert(data.message || data.detail || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    });
});
