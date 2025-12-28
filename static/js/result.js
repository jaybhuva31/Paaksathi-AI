/**
 * Result Page JavaScript
 * Displays disease detection results
 */

document.addEventListener('DOMContentLoaded', function() {
    loadResult();
});

/**
 * Load and display result
 */
function loadResult() {
    const resultContainer = document.getElementById('resultContainer');
    const resultData = sessionStorage.getItem('scanResult');
    const imagePath = sessionStorage.getItem('scanImage');

    if (!resultData) {
        resultContainer.innerHTML = `
            <div class="result-card">
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--warning-color); margin-bottom: 1rem;"></i>
                    <h2>કોઈ પરિણામ મળ્યું નથી</h2>
                    <p>કૃપા કરીને પાકની છબી અપલોડ કરો</p>
                    <a href="/upload" class="btn btn-primary" style="margin-top: 1rem;">ફરીથી સ્કેન કરો</a>
                </div>
            </div>
        `;
        return;
    }

    const result = JSON.parse(resultData);
    
    resultContainer.innerHTML = `
        <div class="result-card">
            <div class="result-header">
                <h2><i class="fas fa-search"></i> રોગ ડિટેક્શન પરિણામ</h2>
            </div>
            
            ${imagePath ? `
                <div class="result-image">
                    <img src="/${imagePath}" alt="Scanned Image" onerror="this.onerror=null; this.src='/${imagePath}'">
                </div>
            ` : ''}
            
            <div class="result-details">
                <div class="detail-section">
                    <h3><i class="fas fa-bug"></i> રોગનું નામ</h3>
                    <p class="disease-name">${result.disease_name}</p>
                    <p class="disease-name-guj">${result.disease_name_guj || ''}</p>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-exclamation-circle"></i> લક્ષણો</h3>
                    <p>${result.symptoms}</p>
                    ${result.symptoms_guj ? `<p style="margin-top: 0.5rem; color: var(--text-light);">${result.symptoms_guj}</p>` : ''}
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-pills"></i> ઉપચાર</h3>
                    <p>${result.treatment}</p>
                    ${result.treatment_guj ? `<p style="margin-top: 0.5rem; color: var(--text-light);">${result.treatment_guj}</p>` : ''}
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-seedling"></i> ખાતર / દવા</h3>
                    <p>${result.fertilizer || 'ખાતરની માહિતી ઉપલબ્ધ નથી'}</p>
                </div>
            </div>
            
            <div class="action-buttons">
                <a href="/upload" class="btn btn-primary">
                    <i class="fas fa-redo"></i> ફરીથી સ્કેન કરો
                </a>
                <a href="/dashboard" class="btn btn-secondary">
                    <i class="fas fa-tachometer-alt"></i> ડેશબોર્ડ
                </a>
            </div>
        </div>
    `;

    // Clear session storage
    sessionStorage.removeItem('scanResult');
    sessionStorage.removeItem('scanImage');
}

