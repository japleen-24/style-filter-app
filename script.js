const imageInput = document.getElementById('imageInput');
const uploadZone = document.getElementById('uploadZone');
const workspace = document.getElementById('workspace');
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const intensitySlider = document.getElementById('intensitySlider');
const intensityValue = document.getElementById('intensityValue');
const filterList = document.getElementById('filterList');
const downloadBtn = document.getElementById('downloadBtn');
const changePhotoBtn = document.getElementById('changePhotoBtn');
const canvasFrame = document.getElementById('canvasFrame');

let baseImage = null;
let activeFilter = 'normal';
let currentIntensity = 1.0;

// Upload Handler
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            baseImage = img;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            renderPipeline();
            uploadZone.style.display = 'none';
            workspace.style.display = 'flex';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Preset Button Click Handlers
filterList.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.getAttribute('data-filter');
    renderPipeline();
});

// Intensity Slider Change
intensitySlider.addEventListener('input', (e) => {
    currentIntensity = e.target.value / 100;
    intensityValue.textContent = `${e.target.value}%`;
    renderPipeline();
});

// Ultra-Authentic Image Processing Pipeline
function renderPipeline() {
    if (!baseImage) return;

    // Reset base canvas
    ctx.drawImage(baseImage, 0, 0);
    if (activeFilter === 'normal' && currentIntensity === 1.0) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Filter Profile Parameters
    let exp = 0, contrast = 0, warmth = 0, saturation = 1.0, grain = false;

    switch (activeFilter) {
        case 'glow90s':
            exp = 15; contrast = -24; warmth = 12; saturation = 0.92; grain = true;
            break;
        case 'digicam2010':
            exp = 10; contrast = -8; warmth = 16; saturation = 1.12; grain = true;
            break;
        case 'cherryVelvet':
            exp = 5; contrast = 8; warmth = 25; saturation = 1.15;
            break;
        case 'noirArchival':
            saturation = 0.0; contrast = 28; exp = -6; grain = true;
            break;
        case 'cinematicTeal':
            warmth = -14; contrast = 14; saturation = 1.08;
            break;
        case 'fadedEktar':
            exp = 6; contrast = -16; warmth = 6; saturation = 0.82; grain = true;
            break;
        case 'softMatte':
            exp = 12; contrast = -32; saturation = 0.85;
            break;
        case 'heavyAnalog':
            exp = 0; contrast = 6; saturation = 0.88; grain = true;
            break;
    }

    const factor = currentIntensity;

    // Process Pixels
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Exposure Adjustment
        if (exp !== 0) {
            r += exp * factor;
            g += exp * factor;
            b += exp * factor;
        }

        // Contrast Curve
        if (contrast !== 0) {
            let cFactor = (259 * (contrast * factor + 255)) / (255 * (259 - contrast * factor));
            r = cFactor * (r - 128) + 128;
            g = cFactor * (g - 128) + 128;
            b = cFactor * (b - 128) + 128;
        }

        // Warmth / Temperature
        if (warmth !== 0) {
            r += warmth * factor;
            b -= warmth * factor;
        }

        // Saturation
        if (saturation !== 1.0) {
            let lum = 0.299 * r + 0.587 * g + 0.114 * b;
            let sFactor = 1.0 + (saturation - 1.0) * factor;
            r = lum + sFactor * (r - lum);
            g = lum + sFactor * (g - lum);
            b = lum + sFactor * (b - lum);
        }

        // Analog Film Grain Simulation
        if (grain && Math.random() > 0.55) {
            let noise = (Math.random() - 0.5) * 32 * factor;
            r += noise;
            g += noise;
            b += noise;
        }

        // Clamp to 0-255 RGB spectrum
        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imgData, 0, 0);
}

// Tap & Hold to Compare Original
const showOriginal = () => { if (baseImage) ctx.drawImage(baseImage, 0, 0); };
canvasFrame.addEventListener('mousedown', showOriginal);
canvasFrame.addEventListener('touchstart', showOriginal);
canvasFrame.addEventListener('mouseup', renderPipeline);
canvasFrame.addEventListener('touchend', renderPipeline);

// Download HD Photo
downloadBtn.addEventListener('click', () => {
    if (!baseImage) return;
    const link = document.createElement('a');
    link.download = `style-filter-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Reset / Change Photo
changePhotoBtn.addEventListener('click', () => {
    baseImage = null;
    imageInput.value = '';
    workspace.style.display = 'none';
    uploadZone.style.display = 'block';
});
    
