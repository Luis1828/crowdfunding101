function initMyContributionsPage(){
  if(!AuthSystem.isUser() && !AuthSystem.isAdmin()){
    window.location.href = 'login.html?redirect=mis-aportes.html';
    return;
  }

  ensureProjectStatuses();
  loadMyContributions();
}

function loadMyContributions(){
  const user = AuthSystem.getCurrentUser();
  if(!user) return;

  const contributions = JSON.parse(localStorage.getItem(`contributions_${user.userId}`) || '[]');
  
  const allProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
  const contributionData = [];

  contributions.forEach(contrib => {
    const project = allProjects.find(p => p.id === contrib.projectId);
    if(project){
      contributionData.push({
        project: project,
        amount: contrib.amount,
        date: contrib.date
      });
    }
  });

  allProjects.forEach(project => {
    if(project.donations){
      project.donations.forEach(donation => {
        if(donation.name === user.name || donation.email === user.email){
          const exists = contributionData.find(c => c.project.id === project.id && c.date === donation.date);
          if(!exists){
            contributionData.push({
              project: project,
              amount: donation.amount,
              date: donation.date
            });
          }
        }
      });
    }
  });

  displayContributions(contributionData);
  updateSummary(contributionData);
}

function displayContributions(contributions){
  const list = document.getElementById('contributionsList');
  if(!list) return;

  list.innerHTML = '';

  if(contributions.length === 0){
    list.innerHTML = '<div class="no-projects-message"><p>No has realizado aportes aún.</p><a href="explorar.html" class="btn btn-primary">Explorar Proyectos</a></div>';
    return;
  }

  contributions.forEach(contrib => {
    const item = document.createElement('div');
    item.className = 'contribution-item';
    item.innerHTML = `
      <div class="contribution-project">
        <div class="contribution-image" style="background-image:url('${contrib.project.image}')"></div>
        <div class="contribution-info">
          <h3><a href="detalle-proyecto.html?id=${contrib.project.id}">${contrib.project.title}</a></h3>
          <p>Por: ${contrib.project.creator}</p>
          <span class="contribution-date">${formatDate(contrib.date)}</span>
        </div>
      </div>
      <div class="contribution-amount">
        <strong>${formatCurrency(contrib.amount)}</strong>
      </div>
    `;
    list.appendChild(item);
  });
}

function updateSummary(contributions){
  const total = contributions.reduce((sum, c) => sum + c.amount, 0);
  const uniqueProjects = new Set(contributions.map(c => c.project.id));

  const totalEl = document.getElementById('totalContributed');
  const countEl = document.getElementById('projectsSupported');

  if(totalEl) totalEl.textContent = formatCurrency(total);
  if(countEl) countEl.textContent = uniqueProjects.size;
}

function formatDate(dateString){
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

if(typeof initMyContributionsPage === 'function'){
  document.addEventListener('DOMContentLoaded', initMyContributionsPage);
}

