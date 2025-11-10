function initAdminPage(){
  if(!AuthSystem.isAdmin()){
    window.location.href = 'index.html';
    return;
  }

  ensureProjectStatuses();
  setupTabs();
  loadAdminProjects();
  loadAdminUsers();
  setupReviewModal();
  setupSearch();
}

function setupSearch(){
  const searchInput = document.getElementById('searchProjects');
  if(searchInput){
    searchInput.addEventListener('input', () => {
      loadAdminProjects();
    });
  }
}

function setupTabs(){
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${targetTab}Tab`).classList.add('active');
    });
  });
}

function loadAdminProjects(){
  const grid = document.getElementById('adminProjectsGrid');
  if(!grid) return;

  const statusFilter = document.getElementById('statusFilter');
  const searchInput = document.getElementById('searchProjects');

  const filterProjects = () => {
    let projects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
    
    const status = statusFilter.value;
    if(status !== 'all'){
      projects = projects.filter(p => p.status === status);
    }

    const search = searchInput.value.toLowerCase();
    if(search){
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.creator.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    displayAdminProjects(projects);
  };

  statusFilter.addEventListener('change', filterProjects);
  searchInput.addEventListener('input', filterProjects);

  filterProjects();
}

function displayAdminProjects(projects){
  const grid = document.getElementById('adminProjectsGrid');
  if(!grid) return;

  grid.innerHTML = '';

  if(projects.length === 0){
    grid.innerHTML = '<p>No se encontraron proyectos.</p>';
    return;
  }

  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card admin-project-card';
    card.innerHTML = `
      <div class="project-image" style="background-image:url('${project.image}')"></div>
      <div class="project-content">
        <div class="status-display">
          <span class="status-label">Estado:</span>
          <span class="badge ${getStatusBadgeClass(project.status)}">${project.status}</span>
          <span class="badge ${getCampaignBadgeClass(project.campaignStatus)} campaign-status-badge">${project.campaignStatus}</span>
        </div>
        <h3 class="project-title">${project.title}</h3>
        <div class="project-meta">
          <span>Por: ${project.creator}</span>
          <span>${project.category}</span>
        </div>
        <p>${project.description.substring(0, 100)}...</p>
        ${project.observations ? `<div class="observations"><strong>Observaciones:</strong> ${project.observations}</div>` : ''}
        <div class="admin-actions">
          <button class="btn btn-primary btn-sm" onclick="openReviewModal(${project.id})">Cambiar Estado</button>
          <a href="detalle-proyecto.html?id=${project.id}" class="btn btn-outline btn-sm">Ver Detalles</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function loadAdminUsers(){
  const tbody = document.getElementById('usersTableBody');
  if(!tbody) return;

  const currentUser = AuthSystem.getCurrentUser();
  const isSuperAdmin = currentUser && currentUser.email === 'admin@crowdfunding101.com';

  tbody.innerHTML = '';

  SAMPLE_DATA.users.forEach(user => {
    const row = document.createElement('tr');
    const isAdmin = user.role === USER_ROLES.ADMINISTRADOR;
    const canChangeRole = !isAdmin || (isAdmin && isSuperAdmin && user.email !== 'admin@crowdfunding101.com');
    
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="badge ${isAdmin ? 'badge-blue' : 'badge-gray'}">${user.role}</span></td>
      <td>
        ${canChangeRole ? 
          `<button class="btn btn-outline btn-sm" onclick="toggleUserRole(${user.id})">${isAdmin ? 'Quitar Admin' : 'Hacer Admin'}</button>` : 
          '<span class="text-muted">Admin Superior</span>'}
      </td>
    `;
    tbody.appendChild(row);
  });
}

function setupReviewModal(){
  const modal = document.getElementById('reviewModal');
  const closeBtn = document.querySelector('.modal-close');
  const cancelBtn = document.getElementById('cancelReview');
  const form = document.getElementById('reviewForm');

  if(closeBtn){
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if(cancelBtn){
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const projectId = parseInt(document.getElementById('reviewProjectId').value);
      const action = document.getElementById('reviewAction').value;
      const observations = document.getElementById('reviewObservations').value;

      const allProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
      const project = allProjects.find(p => p.id === projectId);

      if(project){
        if(action === 'approve'){
          project.status = PROJECT_STATUS.PUBLICADO;
          project.campaignStatus = CAMPAIGN_STATUS.EN_PROGRESO;
          project.observations = observations || '';
        } else if(action === 'reject'){
          project.status = PROJECT_STATUS.RECHAZADO;
          project.campaignStatus = CAMPAIGN_STATUS.NO_INICIADA;
          project.observations = observations;
        } else if(action === 'observe'){
          project.status = PROJECT_STATUS.OBSERVADO;
          project.campaignStatus = CAMPAIGN_STATUS.NO_INICIADA;
          project.observations = observations;
        } else if(action === 'pause'){
          if(project.status === PROJECT_STATUS.PUBLICADO){
            project.campaignStatus = CAMPAIGN_STATUS.EN_PAUSA;
            project.observations = observations || '';
          }
        } else if(action === 'resume'){
          if(project.status === PROJECT_STATUS.PUBLICADO && project.campaignStatus === CAMPAIGN_STATUS.EN_PAUSA){
            project.campaignStatus = CAMPAIGN_STATUS.EN_PROGRESO;
            project.observations = observations || '';
          }
        } else if(action === 'draft'){
          project.status = PROJECT_STATUS.BORRADOR;
          project.campaignStatus = CAMPAIGN_STATUS.NO_INICIADA;
          project.observations = observations || '';
        }

        loadAdminProjects();
        modal.style.display = 'none';
        form.reset();
      }
    });
  }
}

function openReviewModal(projectId){
  const modal = document.getElementById('reviewModal');
  const projectIdInput = document.getElementById('reviewProjectId');
  const actionSelect = document.getElementById('reviewAction');
  const allProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
  const project = allProjects.find(p => p.id === projectId);

  if(project && modal){
    projectIdInput.value = projectId;
    
    if(project.observations){
      document.getElementById('reviewObservations').value = project.observations;
    } else {
      document.getElementById('reviewObservations').value = '';
    }
    
    actionSelect.innerHTML = '<option value="">Seleccionar acción</option>';
    
    actionSelect.innerHTML += '<option value="approve">Aprobar/Publicar</option>';
    actionSelect.innerHTML += '<option value="reject">Rechazar</option>';
    actionSelect.innerHTML += '<option value="observe">Observar</option>';
    actionSelect.innerHTML += '<option value="draft">Marcar como Borrador</option>';
    
    if(project.status === PROJECT_STATUS.PUBLICADO){
      if(project.campaignStatus === CAMPAIGN_STATUS.EN_PROGRESO){
        actionSelect.innerHTML += '<option value="pause">Pausar Campaña</option>';
      } else if(project.campaignStatus === CAMPAIGN_STATUS.EN_PAUSA){
        actionSelect.innerHTML += '<option value="resume">Reanudar Campaña</option>';
      }
    }
    
    modal.style.display = 'block';
  }
}

function toggleUserRole(userId){
  const currentUser = AuthSystem.getCurrentUser();
  const isSuperAdmin = currentUser && currentUser.email === 'admin@crowdfunding101.com';
  
  const user = SAMPLE_DATA.users.find(u => u.id === userId);
  if(!user) return;

  if(user.role === USER_ROLES.ADMINISTRADOR){
    if(!isSuperAdmin){
      alert('Solo el administrador superior puede cambiar roles de otros administradores.');
      return;
    }
    if(user.email === 'admin@crowdfunding101.com'){
      alert('No se puede cambiar el rol del administrador superior.');
      return;
    }
  }

  user.role = user.role === USER_ROLES.USUARIO ? USER_ROLES.ADMINISTRADOR : USER_ROLES.USUARIO;
  
  if(user.role === USER_ROLES.USUARIO && currentUser && currentUser.email === user.email){
    alert('Tu rol de administrador ha sido revocado. Serás redirigido.');
    AuthSystem.logout();
    return;
  }
  
  loadAdminUsers();
}

if(typeof initAdminPage === 'function'){
  document.addEventListener('DOMContentLoaded', initAdminPage);
}

