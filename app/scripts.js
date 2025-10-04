const API_URL = 'https://jpon-beats.onrender.com/api';
let token = null;


// Mostrar formulario de login o registro
document.getElementById('login-btn').addEventListener('click', () => showAuthForm('login'));
document.getElementById('register-btn').addEventListener('click', () => showAuthForm('register'));
document.getElementById('logout-btn').addEventListener('click', logout);

document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const action = document.getElementById('auth-title').textContent.toLowerCase();

  try {
    const response = await fetch(`${API_URL}/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    if (response.ok) {
      if (action === 'login') {
        token = data.token;
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('auth-form').style.display = 'none';
        document.getElementById('upload-section').style.display = 'block';
        fetchBeats();
      } else {
        alert('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
      }
    } else {
      alert(data.error || 'Error en la autenticación');
    }
  } catch (err) {
    console.error(err);
    alert('Error al conectar con el servidor');
  }
});

document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('beat-title').value;
  const filePath = document.getElementById('beat-file').value;

  try {
    const response = await fetch(`${API_URL}/beats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ title, filePath })
    });

    if (response.ok) {
      alert('Beat subido exitosamente');
      fetchBeats();
    } else {
      const data = await response.json();
      alert(data.error || 'Error al subir el beat');
    }
  } catch (err) {
    console.error(err);
    alert('Error al conectar con el servidor');
  }
});

async function fetchBeats() {
  try {
    const response = await fetch(`${API_URL}/beats`);
    const beats = await response.json();

    const beatsList = document.getElementById('beats-list');
    beatsList.innerHTML = '';
    beats.forEach(beat => {
      const li = document.createElement('li');
      li.textContent = `${beat.title} - Subido por Usuario ${beat.author_id}`;
      beatsList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    alert('Error al obtener los beats');
  }
}

function showAuthForm(action) {
  document.getElementById('auth-title').textContent = action.charAt(0).toUpperCase() + action.slice(1);
  document.getElementById('auth-form').style.display = 'block';
}

function logout() {
  token = null;
  document.getElementById('logout-btn').style.display = 'none';
  document.getElementById('upload-section').style.display = 'none';
  alert('Sesión cerrada');
}
