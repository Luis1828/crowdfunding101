let currentProject = null;

function initProjectDetail(){
  ensureProjectStatuses();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const all = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
  currentProject = all.find(p=>String(p.id) === String(id)) || all[0];
  
  const user = AuthSystem.getCurrentUser();
  if(!user || (!AuthSystem.isAdmin() && currentProject.creatorId !== user.userId)){
    if(currentProject.status !== PROJECT_STATUS.PUBLICADO){
      window.location.href = 'explorar.html';
      return;
    }
  }
  
  if(!currentProject.donations) currentProject.donations = [];
  renderProjectDetail(currentProject);
  setupDonationForm();
}

function renderProjectDetail(p){
  const container = document.getElementById('projectDetail');
  if(!container) return;
  
  if(p.donations && p.donations.length > 0){
    const donationsTotal = p.donations.reduce((sum, d) => sum + d.amount, 0);
    p.raised = donationsTotal;
  }
  
  const progress = calculateProgress(p.raised,p.goal);
  const donationsTotal = p.donations && p.donations.length > 0 
    ? p.donations.reduce((sum, d) => sum + d.amount, 0) 
    : 0;
  
  const sortedDonations = p.donations && p.donations.length > 0
    ? [...p.donations].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
  
  const donationsHTML = sortedDonations.length > 0 ? `
    <div class="donations-section">
      <h3>Donaciones Recientes</h3>
      <div class="donations-list">
        ${sortedDonations.map(d => `
          <div class="donation-item">
            <div class="donation-info">
              <span class="donation-name">${d.name}</span>
              <span class="donation-date">${formatDate(d.date)}</span>
            </div>
            <div class="donation-amount">${formatCurrency(d.amount)}</div>
          </div>
        `).join('')}
      </div>
      <div class="donations-total">
        <strong>Total: ${formatCurrency(donationsTotal)}</strong>
        <span class="donations-count">(${sortedDonations.length} ${sortedDonations.length === 1 ? 'donación' : 'donaciones'})</span>
      </div>
    </div>
  ` : '<p class="no-donations">Aún no hay donaciones para este proyecto.</p>';
  
  container.innerHTML = `<div class="project-detail">
    <div class="project-image" style="background-image:url('${p.image}')" role="img" aria-label="${p.title}"></div>
    <h2 style="margin-top:14px">${p.title}</h2>
    <div class="project-meta"><span>Por: ${p.creator}</span><span>${p.category}</span></div>
    <p style="margin-top:10px">${p.description}</p>
    <div class="progress-bar" style="margin-top:12px"><div class="progress" style="width:${progress}%;"></div></div>
    <div class="project-stats" style="display:flex;justify-content:space-between;margin-top:8px">
      <div><strong>${formatCurrency(p.raised)}</strong> recaudado</div>
      <div><strong>${formatCurrency(p.goal)}</strong> meta</div>
    </div>
    <div class="project-actions">
      ${p.status === PROJECT_STATUS.PUBLICADO && p.campaignStatus === CAMPAIGN_STATUS.EN_PROGRESO ? `<button class="btn btn-primary" id="donateBtn">Aportar</button>` : ''}
      ${AuthSystem.isLoggedIn() ? `<button class="btn btn-outline" id="favoriteBtn">${isFavorite(p.id) ? '★ Quitar de Favoritos' : '☆ Agregar a Favoritos'}</button>` : ''}
      <a class="btn btn-outline" href="explorar.html">Volver a explorar</a>
      ${AuthSystem.isLoggedIn() && p.creatorId === (AuthSystem.getCurrentUser()?.userId) && (p.status === PROJECT_STATUS.BORRADOR || p.status === PROJECT_STATUS.OBSERVADO) ? `<a href="editar-proyecto.html?id=${p.id}" class="btn btn-secondary">Editar Proyecto</a>` : ''}
    </div>
    <div class="status-display" style="margin-top:16px;">
      <span class="status-label">Estado del Proyecto:</span>
      <span class="badge ${getStatusBadgeClass(p.status)}">${p.status}</span>
      <span class="status-label" style="margin-left:16px;">Estado de la Campaña:</span>
      <span class="badge ${getCampaignBadgeClass(p.campaignStatus)}">${p.campaignStatus}</span>
    </div>
    ${donationsHTML}
    <div class="donation-form-container" id="donationFormContainer" style="display:none;">
      <h3>Realizar una Donación</h3>
      <form id="donationForm">
        <div class="form-group">
          <label class="form-label" for="donorName">Tu Nombre</label>
          <input type="text" id="donorName" class="form-control" required placeholder="Ingresa tu nombre">
        </div>
        <div class="form-group">
          <label class="form-label" for="donationAmount">Monto a Donar</label>
          <input type="number" id="donationAmount" class="form-control" required min="1" placeholder="Ingresa el monto">
        </div>
        <div class="form-group">
          <label class="form-label" for="donorEmail">Correo Electrónico (opcional)</label>
          <input type="email" id="donorEmail" class="form-control" placeholder="tu@email.com">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Confirmar Donación</button>
          <button type="button" class="btn btn-outline" id="cancelDonationBtn">Cancelar</button>
        </div>
      </form>
    </div>
  </div>`;
}

function setupDonationForm(){
  const donateBtn = document.getElementById('donateBtn');
  const formContainer = document.getElementById('donationFormContainer');
  const donationForm = document.getElementById('donationForm');
  const cancelBtn = document.getElementById('cancelDonationBtn');
  const favoriteBtn = document.getElementById('favoriteBtn');
  
  if(donateBtn){
    donateBtn.addEventListener('click', () => {
      if(!AuthSystem.isLoggedIn()){
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
      }
      if(currentProject && currentProject.status !== PROJECT_STATUS.PUBLICADO){
        alert('Este proyecto no está disponible para donaciones.');
        return;
      }
      if(formContainer){
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        if(formContainer.style.display === 'block'){
          const user = AuthSystem.getCurrentUser();
          if(user){
            document.getElementById('donorName').value = user.name;
            document.getElementById('donorEmail').value = user.email;
          }
          document.getElementById('donationAmount')?.focus();
        }
      }
    });
  }

  if(favoriteBtn){
    favoriteBtn.addEventListener('click', () => {
      if(!AuthSystem.isLoggedIn()){
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
      }
      toggleFavorite(currentProject.id);
    });
  }
  
  if(cancelBtn){
    cancelBtn.addEventListener('click', () => {
      if(formContainer) formContainer.style.display = 'none';
      if(donationForm) donationForm.reset();
    });
  }
  
  if(donationForm){
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = AuthSystem.getCurrentUser();
      if(!user){
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
      }

      const name = document.getElementById('donorName').value || user.name;
      const amount = parseFloat(document.getElementById('donationAmount').value);
      const email = document.getElementById('donorEmail').value || user.email;
      
      if(!amount || amount <= 0){
        alert('Por favor ingrese un monto válido.');
        return;
      }
      
      if(currentProject){
        const newDonation = {
          name: name,
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          email: email || user.email
        };
        
        if(!currentProject.donations) currentProject.donations = [];
        currentProject.donations.push(newDonation);
        currentProject.raised += amount;
        currentProject.backers = (currentProject.backers || 0) + 1;
        
        const contributions = JSON.parse(localStorage.getItem(`contributions_${user.userId}`) || '[]');
        contributions.push({
          projectId: currentProject.id,
          amount: amount,
          date: newDonation.date
        });
        localStorage.setItem(`contributions_${user.userId}`, JSON.stringify(contributions));
        
        renderProjectDetail(currentProject);
        setupDonationForm();
        
        alert(`¡Gracias ${name}! Tu donación de ${formatCurrency(amount)} ha sido registrada.`);
        if(formContainer) formContainer.style.display = 'none';
        if(donationForm) donationForm.reset();
      }
    });
  }
}

function isFavorite(projectId){
  const user = AuthSystem.getCurrentUser();
  if(!user) return false;
  const favorites = JSON.parse(localStorage.getItem(`favorites_${user.userId}`) || '[]');
  return favorites.includes(projectId);
}

function toggleFavorite(projectId){
  const user = AuthSystem.getCurrentUser();
  if(!user) return;
  
  const favorites = JSON.parse(localStorage.getItem(`favorites_${user.userId}`) || '[]');
  const index = favorites.indexOf(projectId);
  
  if(index > -1){
    favorites.splice(index, 1);
  } else {
    favorites.push(projectId);
  }
  
  localStorage.setItem(`favorites_${user.userId}`, JSON.stringify(favorites));
  
  const favoriteBtn = document.getElementById('favoriteBtn');
  if(favoriteBtn){
    favoriteBtn.textContent = isFavorite(projectId) ? '★ Quitar de Favoritos' : '☆ Agregar a Favoritos';
  }
}

function formatDate(dateString){
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}
