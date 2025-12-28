/**
 * Upload Page JavaScript
 * Handles image upload and crop disease detection
 */

document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const removeImageBtn = document.getElementById('removeImage');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Handle file selection
    fileInput.addEventListener('change', handleFileSelect);

    // Handle drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());

    // Handle remove image
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', removeImage);
    }

    // Handle form submission
    uploadForm.addEventListener('submit', handleFormSubmit);
});

/**
 * Handle file selection
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        displayPreview(file);
    }
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = 'var(--primary-color)';
}

/**
 * Handle drop
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = 'var(--border-color)';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        document.getElementById('fileInput').files = e.dataTransfer.files;
        displayPreview(file);
    } else {
        showNotification('કૃપા કરીને માન્ય છબી ફાઇલ પસંદ કરો', 'error');
    }
}

/**
 * Display image preview
 */
function displayPreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewContainer = document.getElementById('previewContainer');
        const previewImage = document.getElementById('previewImage');
        const uploadContent = document.querySelector('.upload-content');
        
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
        if (uploadContent) {
            uploadContent.style.display = 'none';
        }
    };
    
    reader.readAsDataURL(file);
}

/**
 * Remove image preview
 */
function removeImage() {
    const previewContainer = document.getElementById('previewContainer');
    const uploadContent = document.querySelector('.upload-content');
    const fileInput = document.getElementById('fileInput');
    
    previewContainer.style.display = 'none';
    if (uploadContent) {
        uploadContent.style.display = 'block';
    }
    fileInput.value = '';
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const cropType = document.getElementById('cropType').value;
    
    if (!fileInput.files[0]) {
        showNotification('કૃપા કરીને છબી પસંદ કરો', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('crop_type', cropType);

    // Show loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    const submitBtn = document.getElementById('submitBtn');
    
    loadingOverlay.style.display = 'flex';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/scan/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Store result in sessionStorage and redirect
            sessionStorage.setItem('scanResult', JSON.stringify(data.result));
            sessionStorage.setItem('scanImage', data.image_path);
            window.location.href = '/result';
        } else {
            showNotification(data.message || 'સ્કેન નિષ્ફળ', 'error');
            loadingOverlay.style.display = 'none';
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('કોઈ ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.', 'error');
        loadingOverlay.style.display = 'none';
        submitBtn.disabled = false;
    }
}

