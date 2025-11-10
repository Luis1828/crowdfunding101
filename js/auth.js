function initAuthPages(){
  const register = document.getElementById('registerForm');
  if(register){
    const nameInput = register.querySelector('#name');
    const emailInput = register.querySelector('#email');
    const passwordInput = register.querySelector('#password');

    if(nameInput) {
      nameInput.addEventListener('blur', () => validateField('name', nameInput.value.trim() !== '', 'Nombre requerido'));
      nameInput.addEventListener('input', () => hideError('name'));
    }

    if(emailInput) {
      emailInput.addEventListener('blur', () => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        validateField('email', isValid, 'Correo electrónico inválido');
      });
      emailInput.addEventListener('input', () => hideError('email'));
    }

    if(passwordInput) {
      passwordInput.addEventListener('blur', () => {
        const isValid = passwordInput.value.length >= 6;
        validateField('password', isValid, 'La contraseña debe tener al menos 6 caracteres');
      });
      passwordInput.addEventListener('input', () => hideError('password'));
    }

    register.addEventListener('submit', function(e){
      e.preventDefault();
      let isValid = true;

      if(!nameInput.value.trim()){
        validateField('name', false, 'Nombre requerido');
        isValid = false;
      }

      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)){
        validateField('email', false, 'Correo electrónico inválido');
        isValid = false;
      }

      if(passwordInput.value.length < 6){
        validateField('password', false, 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
      }

      if(isValid){
        const result = AuthSystem.register(nameInput.value.trim(), emailInput.value, passwordInput.value);
        if(result.success){
          showSuccess('Registro exitoso. Redirigiendo...');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          validateField('email', false, result.error || 'Error en el registro');
        }
      }
    });
  }

  const login = document.getElementById('loginForm');
  if(login){
    const emailInput = login.querySelector('#emailLogin');
    const passwordInput = login.querySelector('#passwordLogin');

    if(emailInput) {
      emailInput.addEventListener('blur', () => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        validateField('emailLogin', isValid, 'Correo electrónico inválido');
      });
      emailInput.addEventListener('input', () => hideError('emailLogin'));
    }

    if(passwordInput) {
      passwordInput.addEventListener('blur', () => {
        validateField('passwordLogin', passwordInput.value.length > 0, 'Contraseña requerida');
      });
      passwordInput.addEventListener('input', () => hideError('passwordLogin'));
    }

    login.addEventListener('submit', function(e){
      e.preventDefault();
      let isValid = true;

      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)){
        validateField('emailLogin', false, 'Correo electrónico inválido');
        isValid = false;
      }

      if(passwordInput.value.length === 0){
        validateField('passwordLogin', false, 'Contraseña requerida');
        isValid = false;
      }

      if(isValid){
        const result = AuthSystem.login(emailInput.value, passwordInput.value);
        if(result.success){
          showSuccess('Inicio de sesión exitoso. Redirigiendo...');
          setTimeout(() => {
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
            window.location.href = redirectUrl;
          }, 1500);
        } else {
          showError('emailLogin', result.error || 'Credenciales inválidas');
          showError('passwordLogin', '');
        }
      }
    });
  }
}

function validateField(fieldId, isValid, errorMessage){
  const field = document.getElementById(fieldId);
  const errorEl = document.querySelector(`.error-message[data-for="${fieldId}"]`);
  
  if(field){
    if(isValid){
      field.classList.remove('error');
      field.classList.add('success');
    } else {
      field.classList.remove('success');
      field.classList.add('error');
    }
  }

  if(errorEl){
    if(isValid){
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    } else {
      errorEl.style.display = 'block';
      errorEl.textContent = errorMessage;
    }
  }
}

function showError(fieldId, message){
  const errorEl = document.querySelector(`.error-message[data-for="${fieldId}"]`);
  const field = document.getElementById(fieldId);
  if(errorEl){
    errorEl.style.display = 'block';
    errorEl.textContent = message;
  }
  if(field){
    field.classList.add('error');
    field.classList.remove('success');
  }
}

function hideError(fieldId){
  const errorEl = document.querySelector(`.error-message[data-for="${fieldId}"]`);
  const field = document.getElementById(fieldId);
  if(errorEl) errorEl.style.display = 'none';
  if(field){
    field.classList.remove('error');
    field.classList.remove('success');
  }
}

function showSuccess(message){
  let successEl = document.querySelector('.success-message');
  if(!successEl){
    successEl = document.createElement('div');
    successEl.className = 'success-message';
    document.querySelector('main .container, main .form-container').prepend(successEl);
  }
  successEl.textContent = message;
  successEl.style.display = 'block';
  setTimeout(() => {
    successEl.style.display = 'none';
  }, 3000);
}
