function initFavoritesPage(){
  if(!AuthSystem.isUser() && !AuthSystem.isAdmin()){
    window.location.href = 'login.html?redirect=favoritos.html';
    return;
  }

  ensureProjectStatuses();
  loadFavorites();
}

function loadFavorites(){
  const user = AuthSystem.getCurrentUser();
  if(!user) return;

  const favorites = JSON.parse(localStorage.getItem(`favorites_${user.userId}`) || '[]');
  
  const grid = document.getElementById('favoritesGrid');
  const noFavorites = document.getElementById('noFavorites');

  if(favorites.length === 0){
    if(grid) grid.innerHTML = '';
    if(noFavorites) noFavorites.style.display = 'block';
    return;
  }

  if(noFavorites) noFavorites.style.display = 'none';

  const allProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
  const favoriteProjects = allProjects.filter(p => favorites.includes(p.id));

  displayFavorites(favoriteProjects);
}

function displayFavorites(projects){
  const grid = document.getElementById('favoritesGrid');
  if(!grid) return;

  grid.innerHTML = '';

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
        </div>
        <h3 class="project-title">${project.title}</h3>
        <div class="project-meta">
          <span>Por: ${project.creator}</span>
          <span>${project.category}</span>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width:${progress}%;"></div>
        </div>
        <div class="project-stats">
          <div class="project-goal">${formatCurrency(project.raised)} / ${formatCurrency(project.goal)}</div>
          <div class="project-days">${daysText}</div>
        </div>
        <div class="project-actions">
          <a href="detalle-proyecto.html?id=${project.id}" class="btn btn-primary btn-block">Ver Proyecto</a>
          <button class="btn btn-outline btn-block" onclick="removeFavorite(${project.id})">Quitar de Favoritos</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function removeFavorite(projectId){
  const user = AuthSystem.getCurrentUser();
  if(!user) return;

  const favorites = JSON.parse(localStorage.getItem(`favorites_${user.userId}`) || '[]');
  const updatedFavorites = favorites.filter(id => id !== projectId);
  localStorage.setItem(`favorites_${user.userId}`, JSON.stringify(updatedFavorites));
  
  loadFavorites();
}

if(typeof initFavoritesPage === 'function'){
  document.addEventListener('DOMContentLoaded', initFavoritesPage);
}

