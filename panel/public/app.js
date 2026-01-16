let systems = [];
let config = {};
let filteredSystems = [];

// Charger les systèmes et la configuration
async function loadData() {
    try {
        const [systemsRes, configRes] = await Promise.all([
            fetch('/api/systems'),
            fetch('/api/config')
        ]);

        systems = await systemsRes.json();
        config = await configRes.json();

        renderSystems();
        updateStats();
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showToast('Erreur lors du chargement des données', 'error');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Rendre les systèmes
function renderSystems() {
    const grid = document.getElementById('systemsGrid');
    grid.innerHTML = '';

    filteredSystems = systems.filter(system => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        const matchesSearch = system.name.toLowerCase().includes(searchTerm) ||
                             system.description.toLowerCase().includes(searchTerm) ||
                             system.features.some(f => f.toLowerCase().includes(searchTerm));
        
        const matchesFilter = activeFilter === 'all' || system.category === activeFilter;
        
        return matchesSearch && matchesFilter;
    });

    filteredSystems.forEach(system => {
        const card = createSystemCard(system);
        grid.appendChild(card);
    });

    if (filteredSystems.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-secondary);">Aucun système trouvé</div>';
    }
}

// Créer une carte système
function createSystemCard(system) {
    const card = document.createElement('div');
    card.className = 'system-card';
    
    const systemPath = getSystemPath(system.id);
    const isEnabled = getSystemEnabled(systemPath);
    
    if (isEnabled) {
        card.classList.add('active');
    } else {
        card.classList.add('inactive');
    }

    card.innerHTML = `
        <div class="system-header">
            <div class="system-title">
                <span class="system-icon">${system.icon}</span>
                <div>
                    <div class="system-name">${system.name}</div>
                    <span class="system-category">${system.category}</span>
                </div>
            </div>
        </div>
        <div class="system-description">${system.description}</div>
        <div class="system-features">
            <div class="features-title">Fonctionnalités :</div>
            <ul class="features-list">
                ${system.features.map(feature => `<li class="feature-item">${feature}</li>`).join('')}
            </ul>
        </div>
        <div class="system-toggle">
            <span class="toggle-label">${isEnabled ? 'Activé' : 'Désactivé'}</span>
            <div class="toggle-switch ${isEnabled ? 'active' : ''}" data-system="${system.id}"></div>
        </div>
    `;

    // Ajouter l'événement de toggle
    const toggle = card.querySelector('.toggle-switch');
    toggle.addEventListener('click', () => toggleSystem(system.id, toggle));

    return card;
}

// Obtenir le chemin du système dans la config
function getSystemPath(systemId) {
    const pathMap = {
        'antiRaid': 'security.antiRaid',
        'antiSpam': 'security.antiSpam',
        'antiPhishing': 'security.antiPhishing',
        'antiNuke': 'security.antiNuke',
        'behaviorAnalysis': 'security.behaviorAnalysis',
        'rateLimiting': 'security.rateLimiting',
        'autoModeration': 'security.autoModeration',
        'whitelistBlacklist': 'security.whitelistBlacklist',
        'antiWebhook': 'security.antiWebhook',
        'antiEmoji': 'security.antiEmoji',
        'antiSelfbot': 'security.antiSelfbot',
        'antiIntegration': 'security.antiIntegration',
        'antiFile': 'security.antiFile',
        'antiThread': 'security.antiThread',
        'antiReactionSpam': 'security.antiReactionSpam',
        'antiEmbedAbuse': 'security.antiEmbedAbuse',
        'antiTokenGrabber': 'security.antiTokenGrabber'
    };
    return pathMap[systemId] || `security.${systemId}`;
}

// Obtenir l'état activé/désactivé
function getSystemEnabled(path) {
    const parts = path.split('.');
    let current = config;
    
    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return false;
        }
    }
    
    return current?.enabled || false;
}

// Toggle un système
async function toggleSystem(systemId, toggleElement) {
    const systemPath = getSystemPath(systemId);
    const systemName = systemPath.split('.').pop();
    
    try {
        const response = await fetch(`/api/system/${systemPath}/toggle`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            // Mettre à jour l'état local
            const parts = systemPath.split('.');
            let current = config;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            if (!current[parts[parts.length - 1]]) {
                current[parts[parts.length - 1]] = {};
            }
            current[parts[parts.length - 1]].enabled = data.enabled;

            // Mettre à jour l'UI
            const card = toggleElement.closest('.system-card');
            if (data.enabled) {
                toggleElement.classList.add('active');
                card.classList.add('active');
                card.classList.remove('inactive');
                card.querySelector('.toggle-label').textContent = 'Activé';
            } else {
                toggleElement.classList.remove('active');
                card.classList.remove('active');
                card.classList.add('inactive');
                card.querySelector('.toggle-label').textContent = 'Désactivé';
            }

            updateStats();
            showToast(data.message, 'success');
        } else {
            showToast('Erreur lors de la modification', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la modification', 'error');
    }
}

// Mettre à jour les statistiques
function updateStats() {
    const total = systems.length;
    let active = 0;

    systems.forEach(system => {
        const systemPath = getSystemPath(system.id);
        if (getSystemEnabled(systemPath)) {
            active++;
        }
    });

    document.getElementById('totalSystems').textContent = total;
    document.getElementById('activeSystems').textContent = active;
    document.getElementById('inactiveSystems').textContent = total - active;
}

// Afficher un toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Événements
document.getElementById('searchInput').addEventListener('input', renderSystems);

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSystems();
    });
});

// Charger les données au démarrage
loadData();
