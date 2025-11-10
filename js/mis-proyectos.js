function initMyProjectsPage(){
  if(!AuthSystem.isUser() && !AuthSystem.isAdmin()){
    window.location.href = 'login.html?redirect=mis-proyectos.html';
    return;
  }

  ensureProjectStatuses();
  setupFilters();
  loadMyProjects();
}

function setupFilters(){
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadMyProjects(btn.dataset.filter);
    });
  });
}

function loadMyProjects(statusFilter = 'all'){
  const user = AuthSystem.getCurrentUser();
  if(!user) return;

  const grid = document.getElementById('myProjectsGrid');
  if(!grid) return;

  let projects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
  projects = projects.filter(p => p.creatorId === user.userId);

  if(statusFilter !== 'all'){
    projects = projects.filter(p => p.status === statusFilter);
  }

  displayMyProjects(projects);
}

function displayMyProjects(projects){
  const grid = document.getElementById('myProjectsGrid');
  if(!grid) return;

  grid.innerHTML = '';

  if(projects.length === 0){
    grid.innerHTML = '<div class="no-projects-message"><p>No tienes proyectos en este estado.</p><a href="crear-proyecto.html" class="btn btn-primary">Crear Proyecto</a></div>';
    return;
  }

  projects.forEach(project => {
    const progress = calculateProgress(project.raised, project.goal);
    const daysText = project.daysLeft > 0 ? `${project.daysLeft} días restantes` : 'Finalizado';
    
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-image" style="background-image:url('${project.image}')"></div>
      <div class="project-content">
        <div class="status-display">
          <span class="badge ${getStatusBadgeClass(project.status)}">${project.status}</span>
          <span class="badge ${getCampaignBadgeClass(project.campaignStatus)} campaign-status-badge">${project.campaignStatus}</span>
        </div>
        <h3 class="project-title">${project.title}</h3>
        <div class="project-meta">
          <span>${project.category}</span>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width:${progress}%;"></div>
        </div>
        <div class="project-stats">
          <div class="project-goal">${formatCurrency(project.raised)} / ${formatCurrency(project.goal)}</div>
          <div class="project-days">${daysText}</div>
        </div>
        ${project.observations ? `<div class="observations"><strong>Observaciones:</strong> ${project.observations}</div>` : ''}
        <div class="project-actions">
          <a href="detalle-proyecto.html?id=${project.id}" class="btn btn-primary btn-sm">Ver</a>
          ${project.status === PROJECT_STATUS.BORRADOR || project.status === PROJECT_STATUS.OBSERVADO ? 
            `<a href="editar-proyecto.html?id=${project.id}" class="btn btn-outline btn-sm">Editar</a>` : ''}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

if(typeof initMyProjectsPage === 'function'){
  document.addEventListener('DOMContentLoaded', initMyProjectsPage);
}

