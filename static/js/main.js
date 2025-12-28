/**
 * Paaksathi AI - Main JavaScript File
 * Handles frontend functionality
 */

// Track page visit
document.addEventListener('DOMContentLoaded', function() {
    // Track visit
    fetch('/api/track-visit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Load statistics
    loadStats();

    // Mobile menu toggle
    setupMobileMenu();
});

/**
 * Load website statistics
 */
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.total_visits !== undefined) {
            const visitsElement = document.getElementById('totalVisits');
            if (visitsElement) {
                animateValue(visitsElement, 0, data.total_visits, 1000);
            }
        }
        
        if (data.total_scans !== undefined) {
            const scansElement = document.getElementById('totalScans');
            if (scansElement) {
                animateValue(scansElement, 0, data.total_scans, 1000);
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Animate number counter
 */
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Setup mobile menu toggle
 */
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('gu-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Profile dropdown toggle and actions
function setupProfileToggle() {
    const profileToggle = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (profileToggle && profileDropdown) {
        profileToggle.addEventListener('click', (e) => {
            const isHidden = profileDropdown.getAttribute('aria-hidden') === 'true' || !profileDropdown.getAttribute('aria-hidden');
            profileDropdown.setAttribute('aria-hidden', String(!isHidden));
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileToggle.contains(e.target) && profileDropdown.getAttribute('aria-hidden') === 'false') {
                profileDropdown.setAttribute('aria-hidden', 'true');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const res = await fetch('/api/user/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();
                if (data.success) {
                    showNotification(data.message || 'Logged out', 'success');
                    setTimeout(() => window.location.reload(), 500);
                } else {
                    showNotification(data.message || 'Logout failed', 'error');
                }
            } catch (err) {
                console.error('Logout error:', err);
                showNotification('Logout failed', 'error');
            }
        });
    }
}

// Initialize profile toggle after DOM ready (handles pages where it may or may not exist)
document.addEventListener('DOMContentLoaded', function() {
    setupProfileToggle();

    // Disease detail modal handlers
    const diseaseData = {
        'cotton-leaf-curl': {
            title: 'કપાસમાં પાંદડાનો કર્લ રોગ',
            subtitle: 'Cotton Leaf Curl Disease',
            symptoms: [
                'પાંદડા વળી જાય છે અને નાના રહે છે',
                'નસો જાડી થઈ જાય છે',
                'છોડની વૃદ્ધિ ધીમી પડી જાય છે',
                'ફૂલ અને કપાસ ઓછાં આવે છે'
            ],
            treatment: [
                'દવા: ઇમિડાક્લોપ્રિડ 17.8% SL',
                'માત્રા: 1 મિલી દવા પ્રતિ લિટર પાણીમાં'
            ],
            prevention: [
                'રોગ પ્રતિકારક વિવિધતા વાવો',
                'સફેદ માખી નિયંત્રણ કરો',
                'ખેતરમાં સાફસફાઈ રાખો',
                'પાછલા પાકના અવશેષો નષ્ટ કરો'
            ]
        },
        'groundnut-tikka': {
            title: 'મગફળીમાં ટિક્કા રોગ',
            subtitle: 'Groundnut Tikka Disease (Early Leaf Spot)',
            symptoms: [
                'પાંદડાઓ પર નાનાં ભૂખા-ભૂખા બિંદુઓ',
                'પાછળથી પાંદડા પીળા પડી થાય છે',
                'ઉત્પાદન ઓછું થાય છે'
            ],
            treatment: [
                'ફફૂંદનાશક દવા એપ્લાય કરો (માંગે પ્રમાણ અનુસાર)',
                'સારી ખેતી પદ્ધતિઓ અપનાવો'
            ],
            prevention: [
                'પાક ફેલાવવાની શક્યતા ઘટાડો',
                'સરસ વાવણી અંતરનો ઉપયોગ કરો']
        },
        'wheat-rust': {
            title: 'ઘઉંમાં કાટરોગ',
            subtitle: 'Wheat Rust (Yellow/Brown Rust)',
            symptoms: [
                'પાંદડાઓ પર મૂઠા જેવી ભૂમિ સંવેદન',
                'ગાંઠસરસ પુખ્ત પદાર્થ બનાવે છે',
                'ફસલનો ઉપજ કમી આવે છે'
            ],
            treatment: [
                'ફફૂંદનાશક દવા (ટ્રાયફ્લોક્સિસ્ટ્રોબિન વગેરે) વાપરો',
                'સીઘ્ર રીતે દાવા અમલમાં લાવો'
            ],
            prevention: [
                'પ્રતિકારક જાતો વાવો',
                'સંવેદનશીલ પાકનો થોડીવાર અંતર રાખો'
            ]
        },
        'rice-blast': {
            title: 'ચોખામાં બ્લાસ્ટ રોગ',
            subtitle: 'Rice Blast Disease',
            symptoms: [
                'છાલ અને પાંદડાઓ પર પિચકારી જેવા લક્ષણો',
                'પાકનો નુકસાન ઝડપથી થાય છે'
            ],
            treatment: [
                'સુચિત ફફૂંદનાશકોનો ઉપયોગ',
                'યથાસ્થિતિમાં ખેતરનું નિરીક્ષણ'
            ],
            prevention: [
                'પાણીનું યોગ્ય સંચાલન',
                'પ્રતિકારક સુકાન પસંદ કરો'
            ]
        },
        'tomato-early-blight': {
            title: 'ટમેટામાં અર્લી બ્લાઈટ રોગ',
            subtitle: 'Tomato Early Blight',
            symptoms: [
                'પાંદડાઓ પર ગોળાકાર કોળા',
                'છોટા છોટા દાગ',
                'પાક ગળવા લાગે છે'
            ],
            treatment: [
                'ફફૂંદનાશક દવા મૂકવો',
                'સ્વચ્છતાનો ખાસ ધ્યાન રાખો'
            ],
            prevention: [
                'મટિયાળ જમીનમાં યોગ્ય આવરણ રાખો',
                'પાક વેરીયન્ટ્સનું આરોગ્ય સુધારો'
            ]
        },
        'onion-purple-blotch': {
            title: 'ડુંગળીમાં જાંબુડા ડાઘાનો રોગ',
            subtitle: 'Onion Purple Blotch',
            symptoms: [
                'પાંદડાઓ પર ગાઢ ભાતીય પુતળા દાગ',
                'પાંદડા કામગીરી ઘટે છે'
            ],
            treatment: [
                'ફફૂંદનાશક દવામાં સૂચિત નેમ મુજબ ઉપયોગ',
                'જમીન અને જમીન સંભાળવો'
            ],
            prevention: [
                'સસલ છોડો છો તો યોગ્ય અંતર રાખો',
                'પાકની કામગીરી પર નજર રાખો'
            ]
        }
    };

    const modal = document.getElementById('diseaseModal');
    const modalTitle = document.getElementById('diseaseModalTitle');
    const modalSubtitle = document.getElementById('diseaseModalSubtitle');
    const modalSymptoms = document.getElementById('modalSymptoms');
    const modalTreatment = document.getElementById('modalTreatment');
    const modalPrevention = document.getElementById('modalPrevention');
    const modalClose = modal && modal.querySelector('.modal-close');
    let lastActiveElement = null;

    function populateList(container, items) {
        container.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            container.appendChild(li);
        });
    }

    function openModal(slug) {
        const data = (typeof diseaseMap !== 'undefined' && diseaseMap[slug]) ? diseaseMap[slug] : (typeof diseaseData !== 'undefined' ? diseaseData[slug] : null);
        if (!data) return;
        modalTitle.textContent = data.title;
        modalSubtitle.textContent = data.subtitle || '';
        populateList(modalSymptoms, data.symptoms || []);
        populateList(modalTreatment, data.treatment || []);
        populateList(modalPrevention, data.prevention || []);
        modal.setAttribute('aria-hidden', 'false');
        lastActiveElement = document.activeElement;
        modalClose && modalClose.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastActiveElement) lastActiveElement.focus();
    }

    // Load diseases from backend and render
    const diseaseMap = {};
    function slugify(text) {
        return text.toString().toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9\-\u0A80-\u0AFF]/g,'').replace(/\-+/g,'-');
    }
    async function loadDiseases() {
        const container = document.getElementById('diseaseGrid');
        if (!container) return;
        container.innerHTML = '<div class="loading">લોડ થઈ રહ્યું છે...</div>';
        try {
            const res = await fetch('/api/diseases');
            const data = await res.json();
            if (!data.success) throw new Error('Failed');
            container.innerHTML = '';
            data.diseases.forEach(d=>{
                let symptoms = [], treatment = [], prevention = [];
                try { symptoms = JSON.parse(d.symptoms || '[]'); } catch(e){}
                try { treatment = JSON.parse(d.treatment || '[]'); } catch(e){}
                try { prevention = JSON.parse(d.prevention || '[]'); } catch(e){}
                const slug = slugify(d.name_en || d.name_gu || ('disease-'+d.id));
                diseaseMap[slug] = { title: d.name_gu, subtitle: d.name_en || '', symptoms, treatment, prevention };
                const card = document.createElement('div');
                card.className = 'disease-card';
                card.innerHTML = `
                    <div class="card-body">
                        <h3 class="disease-title">${d.name_gu}</h3>
                        <p class="disease-subtitle">${d.name_en || ''}</p>
                        <p class="crop"><span class="crop-emoji">🌱</span> પાક: ${d.crop || '-'}</p>
                    </div>
                    <div class="card-footer">
                        <a href="#" class="btn btn-primary btn-view" data-disease="${slug}">વધુ જુઓ</a>
                    </div>
                `;
                container.appendChild(card);
            });

            document.querySelectorAll('.btn-view').forEach(btn=>{
                btn.addEventListener('click', e=>{
                    e.preventDefault();
                    openModal(btn.getAttribute('data-disease'));
                });
            });
        } catch (err) {
            console.error(err);
            container.innerHTML = '<p>ડીઝીઝ લોડ કરવામાં ભૂલ થઈ</p>';
        }
    }
    loadDiseases();

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const slug = btn.getAttribute('data-disease');
            openModal(slug);
        });
    });

    modal && modal.addEventListener('click', (e) => {
        if (e.target && e.target.matches('[data-dismiss="modal"]')) {
            closeModal();
        }
    });

    modalClose && modalClose.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });
});

