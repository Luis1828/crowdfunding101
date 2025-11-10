function initHomePage(){
  loadCategories();
  loadFeaturedProjects();
  loadFAQ();
  initFAQ();
}
function loadCategories(){
  const grid = document.getElementById('categoriesGrid');
  if(!grid) return;
  grid.innerHTML = '';
  SAMPLE_DATA.categories.forEach(c=>{
    const d = document.createElement('a');
    d.href = `explorar.html?categoria=${encodeURIComponent(c.name)}`;
    d.className = 'category-card';
    d.innerHTML = `<i class="${c.icon} category-icon" aria-hidden="true"></i><h3>${c.name}</h3><p>${c.description}</p>`;
    grid.appendChild(d);
  });
}
function loadFeaturedProjects(){
  const grid = document.getElementById('featuredProjectsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  const publishedProjects = SAMPLE_DATA.featuredProjects.filter(p => {
    ensureProjectStatuses();
    return p.status === PROJECT_STATUS.PUBLICADO;
  });
  
  publishedProjects.forEach(p=>{
    ensureProjectStatuses();
    const progress = calculateProgress(p.raised,p.goal);
    const daysText = p.daysLeft>0 ? `${p.daysLeft} días restantes` : 'Financiado';
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `<div class="project-image" style="background-image:url('${p.image}')" role="img" aria-label="${p.title}"></div>
      <div class="project-content">
        <h3 class="project-title">${p.title}</h3>
        <div class="project-meta"><span>Por: ${p.creator}</span><span>${p.category}</span></div>
        <div class="progress-bar"><div class="progress" style="width:${progress}%;"></div></div>
        <div class="project-stats"><div class="project-goal">${formatCurrency(p.raised)} / ${formatCurrency(p.goal)}</div><div class="project-days">${daysText}</div></div>
        <a href="detalle-proyecto.html?id=${p.id}" class="btn btn-primary btn-block">Ver Proyecto</a>
      </div>`;
    grid.appendChild(card);
  });
}
function loadFAQ(){
  const container = document.getElementById('faqContainer');
  if(!container) return;
  container.innerHTML = '';
  SAMPLE_DATA.faqs.forEach(f=>{
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.innerHTML = `<div class="faq-question"><span>${f.question}</span><span>+</span></div><div class="faq-answer"><p>${f.answer}</p></div>`;
    container.appendChild(item);
  });
}
