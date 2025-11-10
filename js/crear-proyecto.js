let editingProjectId = null;

function initCreateProjectPage(){
  if(!AuthSystem.isUser() && !AuthSystem.isAdmin()){
    window.location.href = 'login.html?redirect=crear-proyecto.html';
    return;
  }

  ensureProjectStatuses();
  loadCategories();
  setupForm();
  
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(id){
    editingProjectId = parseInt(id);
    loadProjectForEdit(editingProjectId);
  }
}

function loadCategories(){
  const select = document.getElementById('projectCategory');
  if(!select) return;

  SAMPLE_DATA.categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.name;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

function loadProjectForEdit(projectId){
  const allProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
  const project = allProjects.find(p => p.id === projectId);
  const user = AuthSystem.getCurrentUser();

  if(!project || project.creatorId !== user.userId){
    window.location.href = 'mis-proyectos.html';
    return;
  }

  if(project.status !== PROJECT_STATUS.BORRADOR && project.status !== PROJECT_STATUS.OBSERVADO){
    alert('Solo puedes editar proyectos en estado Borrador u Observado');
    window.location.href = 'mis-proyectos.html';
    return;
  }

  document.getElementById('projectTitleInput').value = project.title;
  document.getElementById('projectCategory').value = project.category;
  document.getElementById('projectDescription').value = project.description;
  document.getElementById('projectGoal').value = project.goal;
  document.getElementById('projectDays').value = project.daysLeft;
  document.getElementById('projectImage').value = project.image;
  document.getElementById('projectTitle').textContent = 'Editar Proyecto';
}

function setupForm(){
  const form = document.getElementById('projectForm');
  const submitForReviewBtn = document.getElementById('submitForReview');

  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProject(PROJECT_STATUS.BORRADOR);
    });
  }

  if(submitForReviewBtn){
    submitForReviewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if(validateForm()){
        saveProject(PROJECT_STATUS.EN_REVISION);
      }
    });
  }

  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input.id, input.value.trim() !== ''));
    input.addEventListener('input', () => hideError(input.id));
  });
}

function validateForm(){
  let isValid = true;
  const title = document.getElementById('projectTitleInput').value.trim();
  const category = document.getElementById('projectCategory').value;
  const description = document.getElementById('projectDescription').value.trim();
  const goal = document.getElementById('projectGoal').value;
  const days = document.getElementById('projectDays').value;
  const image = document.getElementById('projectImage').value.trim();

  if(!title){
    validateField('projectTitleInput', false, 'El título es requerido');
    isValid = false;
  }

  if(!category){
    validateField('projectCategory', false, 'La categoría es requerida');
    isValid = false;
  }

  if(!description){
    validateField('projectDescription', false, 'La descripción es requerida');
    isValid = false;
  }

  if(!goal || goal <= 0){
    validateField('projectGoal', false, 'La meta debe ser mayor a 0');
    isValid = false;
  }

  if(!days || days <= 0){
    validateField('projectDays', false, 'Los días deben ser mayor a 0');
    isValid = false;
  }

  if(!image){
    validateField('projectImage', false, 'La imagen es requerida');
    isValid = false;
  }

  return isValid;
}

function saveProject(status){
  if(!validateForm()) return;

  const user = AuthSystem.getCurrentUser();
  if(!user) return;

  const title = document.getElementById('projectTitleInput').value.trim();
  const category = document.getElementById('projectCategory').value;
  const description = document.getElementById('projectDescription').value.trim();
  const goal = parseInt(document.getElementById('projectGoal').value);
  const days = parseInt(document.getElementById('projectDays').value);
  const image = document.getElementById('projectImage').value.trim();

  if(editingProjectId){
    const allProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
    const project = allProjects.find(p => p.id === editingProjectId);
    if(project && project.creatorId === user.userId){
      project.title = title;
      project.category = category;
      project.description = description;
      project.goal = goal;
      project.daysLeft = days;
      project.image = image;
      project.status = status;
      if(status === PROJECT_STATUS.EN_REVISION){
        project.campaignStatus = CAMPAIGN_STATUS.NO_INICIADA;
        project.observations = '';
      }
    }
  } else {
    const allProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
    const maxId = allProjects.length > 0 ? Math.max(...allProjects.map(p => p.id)) : 0;
    const newProject = {
      id: maxId + 1,
      title: title,
      creator: user.name,
      category: category,
      image: image,
      goal: goal,
      raised: 0,
      backers: 0,
      daysLeft: days,
      description: description,
      status: status,
      campaignStatus: CAMPAIGN_STATUS.NO_INICIADA,
      creatorId: user.userId,
      observations: '',
      donations: []
    };
    SAMPLE_DATA.allProjects.push(newProject);
  }

  showSuccess('Proyecto guardado exitosamente. Redirigiendo...');
  setTimeout(() => {
    window.location.href = 'mis-proyectos.html';
  }, 1500);
}

function validateField(fieldId, isValid, errorMessage = ''){
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
      if(errorMessage) errorEl.textContent = errorMessage;
    }
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
    const container = document.querySelector('.form-container, .container');
    if(container) container.insertBefore(successEl, container.firstChild);
  }
  successEl.textContent = message;
  successEl.style.display = 'block';
  setTimeout(() => {
    successEl.style.display = 'none';
  }, 3000);
}

if(typeof initCreateProjectPage === 'function'){
  document.addEventListener('DOMContentLoaded', initCreateProjectPage);
}

