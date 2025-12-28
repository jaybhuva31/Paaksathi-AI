/**
 * Weather Page JavaScript
 * Handles weather data display
 */

document.addEventListener('DOMContentLoaded', function() {
    loadWeather();
});

/**
 * Load weather data
 */
async function loadWeather() {
    const weatherCard = document.getElementById('weatherCard');
    
    try {
        // Get user location (default to Ahmedabad)
        const lat = 23.0225;
        const lon = 72.5714;
        
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (data.success && data.data) {
            const weather = data.data;
            
            weatherCard.innerHTML = `
                <div class="weather-main">
                    <div class="weather-icon">
                        <i class="fas fa-cloud-sun"></i>
                    </div>
                    <div class="temperature">${weather.temperature}°C</div>
                    <div class="condition">${weather.condition}</div>
                    <div class="condition" style="font-size: 1.2rem; color: var(--text-light);">
                        ${weather.condition_guj || ''}
                    </div>
                </div>
                
                <div class="weather-details">
                    <div class="weather-detail-item">
                        <i class="fas fa-tint"></i>
                        <p>આર્દ્રતા</p>
                        <h3>${weather.humidity}%</h3>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-wind"></i>
                        <p>પવનની ઝડપ</p>
                        <h3>${weather.wind_speed} km/h</h3>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-cloud-rain"></i>
                        <p>વરસાદની સંભાવના</p>
                        <h3>${weather.rain_probability}%</h3>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-thermometer-half"></i>
                        <p>તાપમાન</p>
                        <h3>${weather.temperature}°C</h3>
                    </div>
                </div>
            `;
        } else {
            weatherCard.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--warning-color); margin-bottom: 1rem;"></i>
                    <p>હવામાન માહિતી લોડ કરી શકાઈ નથી</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Weather error:', error);
        weatherCard.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <p>હવામાન માહિતી લોડ કરવામાં ભૂલ</p>
            </div>
        `;
    }
}

