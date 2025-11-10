let currentProjects = [];
let currentFilter = 'all';
let visibleProjects = 6;

function initExplorePage(){
  ensureProjectStatuses();
  if(AuthSystem.isAdmin()){
    currentProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
  } else {
    currentProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects].filter(p => p.status === PROJECT_STATUS.PUBLICADO);
  }
  setupFilters();
  
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get('categoria');
  if(categoria){
    setActiveFilter(categoria);
  } else {
    setActiveFilter('all');
  }
  
  setupSearch();
  setupLoadMore();
}

function setupFilters(){
  const filterOptions = document.getElementById('filterOptions');
  if(!filterOptions) return;
  filterOptions.innerHTML = '';
  const allFilter = document.createElement('button');
  allFilter.className = 'filter-btn';
  allFilter.textContent = 'Todos';
  allFilter.dataset.filter = 'all';
  allFilter.addEventListener('click', ()=> setActiveFilter('all'));
  filterOptions.appendChild(allFilter);
  SAMPLE_DATA.categories.forEach(cat=>{
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat.name;
    btn.dataset.filter = cat.name;
    btn.addEventListener('click', ()=> setActiveFilter(cat.name));
    filterOptions.appendChild(btn);
  });
}

function setActiveFilter(filter){
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  const el = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
  if(el) el.classList.add('active');
  let filtered = currentProjects;
  if(!AuthSystem.isAdmin()){
    filtered = filtered.filter(p => p.status === PROJECT_STATUS.PUBLICADO);
  }
  if(filter !== 'all') filtered = filtered.filter(p=>p.category === filter);
  visibleProjects = 6;
  displayProjects(filtered.slice(0,visibleProjects));
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if(loadMoreBtn) loadMoreBtn.style.display = filtered.length > visibleProjects ? 'block' : 'none';
}

function displayProjects(projects){
  const grid = document.getElementById('projectsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  if(projects.length === 0){
    grid.innerHTML = '<div class="no-projects-message"><p>No se encontraron proyectos con los criterios seleccionados.</p></div>';
    return;
  }
  projects.forEach(p=>{
    ensureProjectStatuses();
    const progress = calculateProgress(p.raised,p.goal);
    const daysText = p.daysLeft>0 ? `${p.daysLeft} días restantes` : 'Financiado';
    const card = document.createElement('div');
    card.className = 'project-card';
    const statusBadge = p.status && AuthSystem.isAdmin() ? `<span class="badge ${getStatusBadgeClass(p.status)} project-status-badge">${p.status}</span>` : '';
    card.innerHTML = `<div class="project-image" style="background-image:url('${p.image}')" role="img" aria-label="${p.title}">${statusBadge}</div>
      <div class="project-content"><h3 class="project-title">${p.title}</h3><div class="project-meta"><span>Por: ${p.creator}</span><span>${p.category}</span></div>
      <div class="progress-bar"><div class="progress" style="width:${progress}%;"></div></div>
      <div class="project-stats"><div class="project-goal">${formatCurrency(p.raised)} / ${formatCurrency(p.goal)}</div><div class="project-days">${daysText}</div></div>
      <a href="detalle-proyecto.html?id=${p.id}" class="btn btn-primary btn-block">Ver Proyecto</a></div>`;
    grid.appendChild(card);
  });
}

function setupSearch(){
  const form = document.getElementById('searchForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const q = this.querySelector('.search-input').value.toLowerCase().trim();
    if(q === ''){ setActiveFilter(currentFilter); return; }
    let filtered = currentProjects.filter(p=>p.title.toLowerCase().includes(q) || p.creator.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    if(!AuthSystem.isAdmin()){
      filtered = filtered.filter(p => p.status === PROJECT_STATUS.PUBLICADO);
    }
    visibleProjects = 6;
    displayProjects(filtered.slice(0,visibleProjects));
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if(loadMoreBtn){ loadMoreBtn.style.display = filtered.length > visibleProjects ? 'block' : 'none'; loadMoreBtn.onclick = ()=> loadMoreProjects(filtered); }
  });
}

function setupLoadMore(){
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if(!loadMoreBtn) return;
  loadMoreBtn.addEventListener('click', ()=> {
    let projectsToShow = currentProjects;
    if(currentFilter !== 'all') projectsToShow = currentProjects.filter(p=>p.category === currentFilter);
    loadMoreProjects(projectsToShow);
  });
}

function loadMoreProjects(projects){
  visibleProjects += 6;
  displayProjects(projects.slice(0,visibleProjects));
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if(loadMoreBtn) loadMoreBtn.style.display = projects.length > visibleProjects ? 'block' : 'none';
}
