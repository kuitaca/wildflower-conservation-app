// Conservation-focused plant selector JavaScript
let allPlants = [];

document.addEventListener('DOMContentLoaded', function() {
    loadPlants();
    setupFilters();
});

async function loadPlants() {
    try {
        const response = await fetch('/api/plants');
        const data = await response.json();
        // Fix: Go API returns array directly, not {plants: [...]}
        allPlants = Array.isArray(data) ? data : (data.plants || []);
        displayPlants(allPlants);
    } catch (error) {
        console.error('Error loading plants:', error);
        document.getElementById('plantsContainer').innerHTML = 
            '<div class="alert alert-danger">Failed to load plant data. Please try again.</div>';
    }
}

function displayPlants(plants) {
    const container = document.getElementById('plantsContainer');
    
    if (plants.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">No plants match your criteria.</div>';
        return;
    }
    
    const plantsHtml = plants.map(plant => `
        <div class="card plant-card">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="card-title">
                            ${plant.commonName}
                            ${plant.endangeredSpeciesConnections && plant.endangeredSpeciesConnections.length > 0 ? 
                                '<span class="endangered-badge ms-2">🚨 ENDANGERED SPECIES HOST</span>' : ''}
                        </h5>
                        <p class="card-text">
                            <strong>Scientific name:</strong> <em>${plant.scientificName}</em><br>
                            <strong>Type:</strong> ${plant.plantType}<br>
                            <strong>Height:</strong> ${plant.matureHeight}<br>
                            <strong>Bloom:</strong> ${plant.bloomColors.join(', ')} flowers in ${plant.bloomPeriod.join(', ')}
                        </p>
                        
                        ${plant.endangeredSpeciesConnections && plant.endangeredSpeciesConnections.length > 0 ? `
                        <div class="alert alert-danger p-2 mb-2">
                            <strong>🦋 Critical Conservation Connection:</strong><br>
                            ${plant.endangeredSpeciesConnections.map(conn => `
                                <strong>${conn.species}</strong> (${conn.status})<br>
                                <small>${conn.significance}</small>
                            `).join('<br>')}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="col-md-4">
                        <div class="wildlife-support">
                            <h6>🐛 Wildlife Support</h6>
                            <div class="wildlife-metric">🦋 ${plant.wildlifeSupport.butterfliesMoths} Butterflies/Moths</div>
                            <div class="wildlife-metric">🐝 ${plant.wildlifeSupport.nativeBees} Native Bees</div>
                            <div class="wildlife-metric">🐦 ${plant.wildlifeSupport.birds} Birds</div>
                            <div class="wildlife-metric">🐞 ${plant.wildlifeSupport.totalInsects} Total Insects</div>
                            
                            <div class="conservation-stars mt-2">
                                ${getConservationStars(plant)}
                            </div>
                        </div>
                        
                        <button class="btn btn-success btn-sm w-100 mt-2" onclick="addToGarden('${plant.id}')">
                            Add to Garden Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = plantsHtml;
}

function getConservationStars(plant) {
    const endangeredConnection = plant.endangeredSpeciesConnections && plant.endangeredSpeciesConnections.length > 0;
    const totalWildlife = plant.wildlifeSupport.totalInsects;
    
    if (endangeredConnection) return '⭐⭐⭐⭐⭐ CRITICAL';
    if (totalWildlife > 40) return '⭐⭐⭐⭐ Excellent';
    if (totalWildlife > 25) return '⭐⭐⭐ Good';
    if (totalWildlife > 15) return '⭐⭐ Fair';
    return '⭐ Basic';
}

function setupFilters() {
    document.getElementById('bloomTime').addEventListener('change', filterPlants);
    document.getElementById('height').addEventListener('change', filterPlants);
    document.getElementById('endangeredOnly').addEventListener('change', filterPlants);
}

function filterPlants() {
    const bloomTime = document.getElementById('bloomTime').value;
    const height = document.getElementById('height').value;
    const endangeredOnly = document.getElementById('endangeredOnly').checked;
    
    let filtered = allPlants.filter(plant => {
        if (bloomTime && !plant.bloomPeriod.some(period => 
            period.toLowerCase().includes(bloomTime.toLowerCase()))) {
            return false;
        }
        
        if (height) {
            const plantHeight = plant.matureHeight.toLowerCase();
            if (height === 'short' && !plantHeight.includes('1') && !plantHeight.includes('2')) return false;
            if (height === 'medium' && !plantHeight.includes('2') && !plantHeight.includes('3') && !plantHeight.includes('4')) return false;
            if (height === 'tall' && !plantHeight.includes('4') && !plantHeight.includes('5') && !plantHeight.includes('6')) return false;
        }
        
        if (endangeredOnly && (!plant.endangeredSpeciesConnections || plant.endangeredSpeciesConnections.length === 0)) {
            return false;
        }
        
        return true;
    });
    
    displayPlants(filtered);
}

function addToGarden(plantId) {
    // Store in localStorage for garden planner
    let gardenPlants = JSON.parse(localStorage.getItem('gardenPlants') || '[]');
    if (!gardenPlants.includes(plantId)) {
        gardenPlants.push(plantId);
        localStorage.setItem('gardenPlants', JSON.stringify(gardenPlants));
        alert('Plant added to your garden plan!');
    } else {
        alert('Plant is already in your garden plan.');
    }
}
