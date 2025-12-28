/**
 * Dashboard JavaScript
 * Handles user dashboard functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        // Load user profile
        const profileResponse = await fetch('/api/user/profile');
        const profileData = await profileResponse.json();

        if (profileData.success) {
            document.getElementById('userName').textContent = profileData.user.name;
            document.getElementById('userMobile').textContent = profileData.user.mobile;
            document.getElementById('userEmail').textContent = profileData.user.email || '-';
            document.getElementById('userScans').textContent = profileData.user_scans;
            document.getElementById('welcomeMessage').textContent = `સ્વાગત છે, ${profileData.user.name}!`;
        } else {
            // Not logged in, redirect to login
            window.location.href = '/login';
            return;
        }

        // Load website stats
        const statsResponse = await fetch('/api/stats');
        const statsData = await statsResponse.json();

        if (statsData.total_visits !== undefined) {
            animateValue(document.getElementById('totalVisits'), 0, statsData.total_visits, 1000);
            document.getElementById('visitCount').textContent = statsData.total_visits;
        }

        if (statsData.total_scans !== undefined) {
            animateValue(document.getElementById('totalScans'), 0, statsData.total_scans, 1000);
            document.getElementById('scanCount').textContent = statsData.total_scans;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('ડેશબોર્ડ લોડ કરવામાં ભૂલ', 'error');
    }
}

/**
 * Handle logout
 */
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/user/logout', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('લોગઆઉટ સફળ!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('લોગઆઉટ નિષ્ફળ', 'error');
    }
}

