/**
 * Admin Panel JavaScript
 * Handles admin login and dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    checkAdminSession();
    
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const exportUsersBtn = document.getElementById('exportUsersBtn');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', handleAdminLogout);
    }

    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', handleExportUsers);
    }

    // Add handlers for admin forms (delegated to avoid missing elements)
    document.addEventListener('submit', async function(e) {
        if (e.target && e.target.id === 'addCropForm') {
            e.preventDefault();
            const name_gu = document.getElementById('cropNameGu').value.trim();
            const name_en = document.getElementById('cropNameEn').value.trim();
            if (!name_gu) return showNotification('Gujarati name required', 'error');
            const res = await fetch('/api/crops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name_gu, name_en })
            });
            const data = await res.json();
            if (data.success) {
                showNotification('Crop added', 'success');
                document.getElementById('addCropForm').reset();
                loadAdminData();
            } else {
                showNotification(data.message || 'Add failed', 'error');
            }
        }

        if (e.target && e.target.id === 'addDiseaseForm') {
            e.preventDefault();
            const name_gu = document.getElementById('diseaseNameGu').value.trim();
            const name_en = document.getElementById('diseaseNameEn').value.trim();
            const crop = document.getElementById('diseaseCrop').value.trim();
            const symptoms = document.getElementById('diseaseSymptoms').value.split('\n').map(s=>s.trim()).filter(Boolean);
            const treatment = document.getElementById('diseaseTreatment').value.split('\n').map(s=>s.trim()).filter(Boolean);
            const prevention = document.getElementById('diseasePrevention').value.split('\n').map(s=>s.trim()).filter(Boolean);
            if (!name_gu) return showNotification('Gujarati name required', 'error');
            const res = await fetch('/api/diseases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name_gu, name_en, crop, symptoms, treatment, prevention })
            });
            const data = await res.json();
            if (data.success) {
                showNotification('Disease added', 'success');
                document.getElementById('addDiseaseForm').reset();
                loadAdminData();
            } else {
                showNotification(data.message || 'Add failed', 'error');
            }
        }

        if (e.target && e.target.id === 'addSchemeForm') {
            e.preventDefault();
            const title = document.getElementById('schemeTitle').value.trim();
            const description = document.getElementById('schemeDescription').value.trim();
            if (!title) return showNotification('Title required', 'error');
            const res = await fetch('/api/schemes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });
            const data = await res.json();
            if (data.success) {
                showNotification('Scheme added', 'success');
                document.getElementById('addSchemeForm').reset();
                loadAdminData();
            } else {
                showNotification(data.message || 'Add failed', 'error');
            }
        }
    });
});

/**
 * Check admin session
 */
async function checkAdminSession() {
    try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Admin is logged in
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                loadAdminData();
            } else {
                // Admin is not logged in
                document.getElementById('adminLogin').style.display = 'flex';
                document.getElementById('adminDashboard').style.display = 'none';
            }
        } else {
            // Not logged in
            document.getElementById('adminLogin').style.display = 'flex';
            document.getElementById('adminDashboard').style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking admin session:', error);
    }
}

/**
 * Handle admin login
 */
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('adminUsername').value,
        password: document.getElementById('adminPassword').value
    };

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('એડમિન લોગિન સફળ!', 'success');
            setTimeout(() => {
                checkAdminSession();
            }, 500);
        } else {
            showNotification(data.message || 'લોગિન નિષ્ફળ', 'error');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showNotification('કોઈ ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.', 'error');
    }
}

/**
 * Handle admin logout
 */
async function handleAdminLogout(e) {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/admin/logout', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('adminLogin').style.display = 'flex';
            document.getElementById('adminDashboard').style.display = 'none';
            showNotification('લોગઆઉટ સફળ!', 'success');
        }
    } catch (error) {
        console.error('Admin logout error:', error);
        // Still clear the UI even if API call fails
        document.getElementById('adminLogin').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }
}

/**
 * Handle export users to Excel
 */
async function handleExportUsers(e) {
    e.preventDefault();
    
    try {
        const exportBtn = document.getElementById('exportUsersBtn');
        const originalText = exportBtn.innerHTML;
        
        // Disable button and show loading
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        
        // Fetch the Excel file
        const response = await fetch('/api/admin/export-users', {
            method: 'GET'
        });

        if (response.ok) {
            // Get the blob from response
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'users.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Excel file exported successfully!', 'success');
        } else {
            const data = await response.json();
            showNotification(data.message || 'Export failed', 'error');
        }
        
        // Re-enable button
        exportBtn.disabled = false;
        exportBtn.innerHTML = originalText;
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed. Please try again.', 'error');
        
        // Re-enable button
        const exportBtn = document.getElementById('exportUsersBtn');
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fas fa-file-excel"></i> Export Users to Excel';
        }
    }
}

/**
 * Load admin dashboard data
 */
async function loadAdminData() {
    try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (data.success) {
            // Update stats
            document.getElementById('adminTotalVisits').textContent = data.stats.total_visits;
            document.getElementById('adminTotalUsers').textContent = data.stats.total_users;
            document.getElementById('adminTotalScans').textContent = data.stats.total_scans;

            // Update visits table
            const visitsTableBody = document.getElementById('visitsTableBody');
            if (visitsTableBody && data.recent_visits) {
                visitsTableBody.innerHTML = data.recent_visits.map(visit => `
                    <tr>
                        <td>${visit.ip_address || '-'}</td>
                        <td>${formatDate(visit.date)}</td>
                        <td>${formatTime(visit.visit_time)}</td>
                    </tr>
                `).join('');
            }

        }

        // Load scan records and admin-managed lists
        try {
            // Scan records
            const scanRes = await fetch('/api/admin/scan-records');
            if (scanRes.ok) {
                const scanData = await scanRes.json();
                if (scanData.success) {
                    const tbody = document.getElementById('scanRecordsBody');
                    if (tbody) {
                        tbody.innerHTML = scanData.records.map(r => `
                            <tr>
                                <td>${r.crop || '-'}</td>
                                <td>${r.disease || '-'}</td>
                                <td>${r.count}</td>
                            </tr>
                        `).join('');
                    }
                }
            }

            // Crops
            const cropsRes = await fetch('/api/crops');
            if (cropsRes.ok) {
                const cropsData = await cropsRes.json();
                const cropsList = document.getElementById('cropsList');
                if (cropsList && cropsData.crops) {
                    cropsList.innerHTML = cropsData.crops.map(c => `
                        <div class="list-item" data-id="${c.id}">
                            <span>${c.name_gu} (${c.name_en || '-'})</span>
                            <button class="btn btn-danger btn-delete-crop" data-id="${c.id}">Delete</button>
                        </div>
                    `).join('');

                    // Attach delete handlers
                    document.querySelectorAll('.btn-delete-crop').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const id = btn.getAttribute('data-id');
                            if (!confirm('Are you sure you want to delete this crop?')) return;
                            const res = await fetch(`/api/crops/${id}`, { method: 'DELETE' });
                            const resp = await res.json();
                            if (resp.success) {
                                showNotification('Crop deleted', 'success');
                                loadAdminData();
                            } else {
                                showNotification(resp.message || 'Delete failed', 'error');
                            }
                        });
                    });
                }
            }

            // Diseases (with inline expandable details)
            const diseasesRes = await fetch('/api/diseases');
            if (diseasesRes.ok) {
                const diseasesData = await diseasesRes.json();
                const diseasesList = document.getElementById('diseasesList');
                if (diseasesList && diseasesData.diseases) {
                    const diseasesHtml = diseasesData.diseases.map(d => {
                        // Default parsing
                        let symptoms = parseListField(d.symptoms);
                        let treatment = parseListField(d.treatment);
                        let prevention = parseListField(d.prevention);

                        // Special-case: Cotton Leaf Curl Disease (use exact provided content)
                        const nameGu = String(d.name_gu || '').toLowerCase();
                        const nameEn = String(d.name_en || '').toLowerCase();
                        if (nameGu.includes('કપાસ') && (nameGu.includes('કાર્લ') || nameGu.includes('કર્લ') || nameEn.includes('leaf curl') || nameEn.includes('cotton'))) {
                            symptoms = [
                                'પાંદડા વળી જાય છે અને નાના રહે છે',
                                'નસો જાડી થઈ જાય છે',
                                'છોડની વૃદ્ધિ ધીમી પડી જાય છે',
                                'ફૂલ અને કપાસ ઓછાં આવે છે'
                            ];
                            treatment = [
                                'દવા: ઇમિડાક્લોપ્રિડ 17.8% SL',
                                'માત્રા: 1 મિલી દવા પ્રતિ લિટર પાણીમાં'
                            ];
                            prevention = [
                                'રોગ પ્રતિકારક વિવિધતા વાવો',
                                'સફેદ માખી નિયંત્રણ કરો',
                                'ખેતરમાં સાફસફાઈ રાખો',
                                'અગાઉના પાકના અવશેષો નષ્ટ કરો'
                            ];
                        }

                        return `
                        <div class="list-item" data-id="${d.id}">
                            <div class="list-main">
                                <div>
                                    <strong>${escapeHtml(d.name_gu)}</strong> <small>${escapeHtml(d.name_en || '')}</small>
                                    <div class="muted">Crop: ${escapeHtml(d.crop || '-')}</div>
                                </div>
                                <div class="list-actions">
                                    <button class="btn btn-secondary btn-view-disease" data-id="${d.id}" data-target="disease-details-${d.id}">જુઓ</button>
                                    <button class="btn btn-danger btn-delete-disease" data-id="${d.id}">Delete</button>
                                </div>
                            </div>

                            <div id="disease-details-${d.id}" class="expandable-details" data-id="${d.id}" aria-hidden="true">
                                <div class="details-inner">
                                    <h4 class="details-heading">લક્ષણો:</h4>
                                    <ul class="details-list">
                                        ${symptoms.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                                    </ul>

                                    <h4 class="details-heading">સારવાર:</h4>
                                    <ul class="details-list">
                                        ${treatment.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                                    </ul>

                                    <h4 class="details-heading">રોકથામ:</h4>
                                    <ul class="details-list">
                                        ${prevention.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>`;
                    }).join('');

                    diseasesList.innerHTML = diseasesHtml;

                    // Attach delete handlers
                    document.querySelectorAll('.btn-delete-disease').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const id = btn.getAttribute('data-id');
                            if (!confirm('Are you sure you want to delete this disease?')) return;
                            const res = await fetch(`/api/diseases/${id}`, { method: 'DELETE' });
                            const resp = await res.json();
                            if (resp.success) {
                                showNotification('Disease deleted', 'success');
                                loadAdminData();
                            } else {
                                showNotification(resp.message || 'Delete failed', 'error');
                            }
                        });
                    });

                    // Attach view (expand/collapse) handlers using event delegation for diseases
                    const diseasesListEl = document.getElementById('diseasesList');
                    if (diseasesListEl) {
                        // remove any previous delegated listener to avoid duplication
                        diseasesListEl.removeEventListener('click', diseasesListEl._delegatedClick);

                        const delegatedClick = function(e) {
                            const btn = e.target.closest('.btn-view-disease');
                            if (!btn) return;
                            const targetId = btn.getAttribute('data-target');
                            const detailsEl = document.getElementById(targetId);
                            if (!detailsEl) return;

                            // find parent list-item
                            const listItem = btn.closest('.list-item');
                            if (!listItem) return;

                            // collapse any other expanded item
                            const currentlyExpanded = document.querySelector('.list-item.expanded');
                            if (currentlyExpanded && currentlyExpanded !== listItem) {
                                currentlyExpanded.classList.remove('expanded');
                                const prevBtn = currentlyExpanded.querySelector('.btn-view-disease');
                                if (prevBtn) prevBtn.textContent = 'જુઓ';
                                const prevDetails = currentlyExpanded.querySelector('.expandable-details');
                                if (prevDetails) {
                                    prevDetails.setAttribute('aria-hidden','true');
                                    prevDetails.style.display = 'none';
                                }
                            }

                            const isExpanded = listItem.classList.toggle('expanded');
                            detailsEl.setAttribute('aria-hidden', (!isExpanded).toString());
                            detailsEl.style.display = isExpanded ? 'block' : 'none';
                            btn.textContent = isExpanded ? 'બંધ કરો' : 'જુઓ';
                        };

                        // store the handler ref so we can remove later if needed
                        diseasesListEl._delegatedClick = delegatedClick;
                        diseasesListEl.addEventListener('click', delegatedClick);
                    }

                    // Toggle visits collapsible (Recent Visits section)
                    const toggleVisitsBtn = document.getElementById('toggleVisitsBtn');
                    const visitsCollapsible = document.getElementById('visitsCollapsible');
                    if (toggleVisitsBtn && visitsCollapsible) {
                        // ensure it's closed by default
                        visitsCollapsible.classList.remove('open');
                        visitsCollapsible.setAttribute('aria-hidden','true');
                        toggleVisitsBtn.addEventListener('click', (e) => {
                            const willOpen = !visitsCollapsible.classList.toggle('open');
                            // Note: toggle returns true if class present AFTER toggle, so invert for willOpen
                            const isOpen = visitsCollapsible.classList.contains('open');
                            visitsCollapsible.setAttribute('aria-hidden', (!isOpen).toString());
                            toggleVisitsBtn.textContent = isOpen ? 'બંધ કરો' : 'જુઓ';
                        });
                    }
                }
            }

            // Schemes (with inline expandable details)
            const schemesRes = await fetch('/api/schemes');
            if (schemesRes.ok) {
                const schemesData = await schemesRes.json();
                const schemesList = document.getElementById('schemesList');
                if (schemesList && schemesData.schemes) {
                    const schemesHtml = schemesData.schemes.map(s => {
                        const desc = s.description || '';
                        // Special-case PM-KISAN exact content
                        let schemeDetails = renderSchemeDetails(desc);
                        const titleLower = String(s.title || '').toLowerCase();
                        if (titleLower.includes('pm-kisan') || titleLower.includes('pm kisan') || titleLower.includes('પીએમ કિસાન')) {
                            schemeDetails = `
                                <p>ભારત સરકારની યોજના જેમાં ખેડૂતોને વર્ષમાં ₹6000 આર્થિક સહાય મળે છે</p>
                                <h4 class="details-heading">ફાયદા:</h4>
                                <ul class="details-list">
                                    <li>વર્ષમાં ₹6000 (₹2000 ત્રણ હપ્તામાં)</li>
                                    <li>સીધા બેંક ખાતામાં રકમ</li>
                                    <li>કોઈ વ્યાજ નથી, પરત કરવાની જરૂર નથી</li>
                                    <li>ઓનલાઇન અરજી કરી શકાય</li>
                                </ul>
                                <h4 class="details-heading">પાત્રતા:</h4>
                                <ul class="details-list">
                                    <li>ખેદૂત પરિવાર જેની પાસે ખેતીલાયક જમીન છે</li>
                                    <li>2 હેક્ટરથી વધુ જમીન હોય તો પણ યોજના લાગુ</li>
                                    <li>આધાર કાર્ડ અને બેંક ખાતું જરૂરી</li>
                                </ul>
                                <h4 class="details-heading">અરજી કેવી રીતે કરવી:</h4>
                                <ul class="details-list">
                                    <li>નજીકના CSC કેન્દ્ર અથવા pmkisan.gov.in પર અરજી કરો</li>
                                </ul>
                            `;
                        }

                        return `
                        <div class="list-item" data-id="${s.id}">
                            <div class="list-main">
                                <div>
                                    <strong>${escapeHtml(s.title)}</strong>
                                    <div class="muted">${escapeHtml(desc.length > 120 ? desc.slice(0, 120) + '...' : desc)}</div>
                                </div>
                                <div class="list-actions">
                                    <button class="btn btn-secondary btn-view-scheme" data-id="${s.id}" data-target="scheme-details-${s.id}">જુઓ</button>
                                    <button class="btn btn-danger btn-delete-scheme" data-id="${s.id}">Delete</button>
                                </div>
                            </div>

                            <div id="scheme-details-${s.id}" class="expandable-details" data-id="${s.id}" aria-hidden="true">
                                <div class="details-inner">
                                    <h4 class="details-heading">${escapeHtml(s.title)}</h4>
                                    ${schemeDetails}
                                </div>
                            </div>
                        </div>`;
                    }).join('');

                    schemesList.innerHTML = schemesHtml;

                    // Attach delete handlers
                    document.querySelectorAll('.btn-delete-scheme').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const id = btn.getAttribute('data-id');
                            if (!confirm('Are you sure you want to delete this scheme?')) return;
                            const res = await fetch(`/api/schemes/${id}`, { method: 'DELETE' });
                            const resp = await res.json();
                            if (resp.success) {
                                showNotification('Scheme deleted', 'success');
                                loadAdminData();
                            } else {
                                showNotification(resp.message || 'Delete failed', 'error');
                            }
                        });
                    });

                    // Attach view (expand/collapse) handlers for schemes using event delegation
                    const schemesListEl = document.getElementById('schemesList');
                    if (schemesListEl) {
                        schemesListEl.removeEventListener('click', schemesListEl._delegatedClick);

                        const delegatedClickScheme = function(e) {
                            const btn = e.target.closest('.btn-view-scheme');
                            if (!btn) return;
                            const targetId = btn.getAttribute('data-target');
                            const detailsEl = document.getElementById(targetId);
                            if (!detailsEl) return;

                            const listItem = btn.closest('.list-item');
                            if (!listItem) return;

                            const currentlyExpanded = document.querySelector('.list-item.expanded');
                            if (currentlyExpanded && currentlyExpanded !== listItem) {
                                currentlyExpanded.classList.remove('expanded');
                                const prevBtn = currentlyExpanded.querySelector('.btn-view-scheme');
                                if (prevBtn) prevBtn.textContent = 'જુઓ';
                                const prevDetails = currentlyExpanded.querySelector('.expandable-details');
                                if (prevDetails) {
                                    prevDetails.setAttribute('aria-hidden','true');
                                    prevDetails.style.display = 'none';
                                }
                            }

                            const isExpanded = listItem.classList.toggle('expanded');
                            detailsEl.setAttribute('aria-hidden', (!isExpanded).toString());
                            detailsEl.style.display = isExpanded ? 'block' : 'none';
                            btn.textContent = isExpanded ? 'બંધ કરો' : 'જુઓ';
                        };

                        schemesListEl._delegatedClick = delegatedClickScheme;
                        schemesListEl.addEventListener('click', delegatedClickScheme);
                    }
                }
            }
        } catch (err) {
            console.error('Error loading additional admin lists:', err);
        }

    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('ડેટા લોડ કરવામાં ભૂલ', 'error');
    }
}

/**
 * Helper: parse a JSON list or newline-separated string into array
 */
function parseListField(field) {
    if (!field) return [];
    try {
        if (typeof field === 'string') {
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
        }
    } catch (e) {
        // not JSON, fall back to splitting lines
    }
    // Split by newline or semicolon or comma
    return String(field).split(/\r?\n|;|,/).map(s => s.trim()).filter(Boolean);
}

/**
 * Escape HTML to avoid injection in admin lists
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[&<>"]/g, function(m) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m];
    });
}

/**
 * Render scheme description preserving bullets or line breaks
 */
function renderSchemeDetails(desc) {
    if (!desc) return '<p class="muted">---</p>';
    const lines = String(desc).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const hasBullets = lines.some(l => l.startsWith('•') || l.startsWith('-'));
    if (hasBullets) {
        const items = lines.map(l => `<li>${escapeHtml(l.replace(/^[-•]\s*/,'').trim())}</li>`).join('');
        return `<h4 class="details-heading">વર્ણન:</h4><ul class="details-list">${items}</ul>`;
    }
    // Fallback: keep paragraphs
    return lines.map(l => `<p>${escapeHtml(l)}</p>`).join('');
}

/**
 * Format time
 */
function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('gu-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

