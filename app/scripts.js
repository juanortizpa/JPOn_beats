const API_URL = 'https://xyetgykagqvezuhconys.supabase.co';
let token = null;
let currentUser = null; // Almacenar información del usuario actual

// Manejar navegación entre módulos
document.querySelectorAll('.nav-btn').forEach(button => {
  button.addEventListener('click', () => {
    const module = button.dataset.module;
    document.querySelectorAll('.module').forEach(section => {
      section.style.display = section.id === `${module}-module` ? 'block' : 'none';
    });

    if (module === 'auth' && token) {
      button.textContent = 'Mi Cuenta';
      document.getElementById('auth-module').style.display = 'none';
      alert(`Bienvenido, ${currentUser.username}`);
    }
  });
});

// Alternar entre login y registro
document.getElementById('switch-to-register').addEventListener('click', () => {
  document.getElementById('auth-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
});

document.getElementById('switch-to-login').addEventListener('click', () => {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('auth-form').style.display = 'block';
});

// Manejar formulario de login
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (response.ok) {
      token = data.session.access_token;
      currentUser = data.user; // Almacenar información del usuario
      document.getElementById('auth-btn').textContent = 'Mi Cuenta';
      document.getElementById('auth-module').style.display = 'none';
      alert(`Inicio de sesión exitoso. Bienvenido, ${currentUser.username}`);
    } else {
      alert(data.error || 'Error en el inicio de sesión');
    }
  } catch (err) {
    console.error(err);
    alert('Error al conectar con el servidor');
  }
});

// Manejar formulario de registro
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      document.getElementById('register-form').style.display = 'none';
      document.getElementById('auth-form').style.display = 'block';
    } else {
      const data = await response.json();
      alert(data.error || 'Error en el registro');
    }
  } catch (err) {
    console.error(err);
    alert('Error al conectar con el servidor');
  }
});

// Manejar formulario de subida de beats
document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!token) {
    alert('Debes iniciar sesión para subir beats.');
    return;
  }

  const title = document.getElementById('beat-title').value;
  const file = document.getElementById('beat-file').files[0];

  if (!file) {
    alert('Por favor selecciona un archivo para subir.');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/beats`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }, // Agregar prefijo "Bearer"
      body: formData
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

// Función para obtener beats
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

// Manejar cierre de sesión
document.getElementById('auth-btn').addEventListener('click', () => {
  if (token) {
    token = null;
    currentUser = null;
    document.getElementById('auth-btn').textContent = 'Login';
    alert('Sesión cerrada');
  } else {
    document.getElementById('auth-module').style.display = 'block';
  }
});