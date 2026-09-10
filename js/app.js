// 默认图片（一张线稿风格插画）
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

// 状态
const state = {
    rows: 7,
    cols: 8,
    lineColor: '#E85D04',
    lineOpacity: 0.7,
    lineWidth: 2,
    showLabels: true,
    paperWidth: 180,
    paperHeight: 125,
    grayscale: false,
    image: null,
    imageUrl: DEFAULT_IMAGE_URL
};

// DOM 元素
const els = {
    rowsInput: document.getElementById('rowsInput'),
    rowsValue: document.getElementById('rowsValue'),
    colsInput: document.getElementById('colsInput'),
    colsValue: document.getElementById('colsValue'),
    lineColorInput: document.getElementById('lineColorInput'),
    colorValue: document.getElementById('colorValue'),
    opacityInput: document.getElementById('opacityInput'),
    opacityValue: document.getElementById('opacityValue'),
    widthInput: document.getElementById('widthInput'),
    widthValue: document.getElementById('widthValue'),
    showLabelsInput: document.getElementById('showLabelsInput'),
    paperFormatSelect: document.getElementById('paperFormatSelect'),
    widthMmInput: document.getElementById('widthMmInput'),
    heightMmInput: document.getElementById('heightMmInput'),
    changeImageBtn: document.getElementById('changeImageBtn'),
    uploadArea: document.getElementById('uploadArea'),
    imageUpload: document.getElementById('imageUpload'),
    toggleGrayscaleBtn: document.getElementById('toggleGrayscaleBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    canvasWrapper: document.getElementById('canvasWrapper'),
    gridCanvas: document.getElementById('gridCanvas'),
    guideWidth: document.getElementById('guideWidth'),
    guideHeight: document.getElementById('guideHeight'),
    guideList: document.getElementById('guideList')
};

const ctx = els.gridCanvas.getContext('2d');
const MM_TO_PX = 3.7795275591; // 1mm ≈ 3.78px at 96 DPI

// 初始化
function init() {
    bindEvents();
    loadImage(state.imageUrl);
}

// 绑定事件
function bindEvents() {
    els.rowsInput.addEventListener('input', (e) => {
        state.rows = parseInt(e.target.value, 10);
        els.rowsValue.textContent = state.rows;
        render();
    });

    els.colsInput.addEventListener('input', (e) => {
        state.cols = parseInt(e.target.value, 10);
        els.colsValue.textContent = state.cols;
        render();
    });

    els.lineColorInput.addEventListener('input', (e) => {
        state.lineColor = e.target.value;
        els.colorValue.textContent = state.lineColor.toUpperCase();
        render();
    });

    els.opacityInput.addEventListener('input', (e) => {
        state.lineOpacity = parseFloat(e.target.value);
        els.opacityValue.textContent = state.lineOpacity;
        render();
    });

    els.widthInput.addEventListener('input', (e) => {
        state.lineWidth = parseInt(e.target.value, 10);
        els.widthValue.textContent = state.lineWidth;
        render();
    });

    els.showLabelsInput.addEventListener('change', (e) => {
        state.showLabels = e.target.checked;
        render();
    });

    els.paperFormatSelect.addEventListener('change', (e) => {
        updatePaperDimensions(e.target.value);
    });

    els.widthMmInput.addEventListener('input', (e) => {
        state.paperWidth = parseFloat(e.target.value) || 1;
        els.paperFormatSelect.value = 'custom';
        render();
    });

    els.heightMmInput.addEventListener('input', (e) => {
        state.paperHeight = parseFloat(e.target.value) || 1;
        els.paperFormatSelect.value = 'custom';
        render();
    });

    els.changeImageBtn.addEventListener('click', loadRandomImage);

    els.uploadArea.addEventListener('click', () => els.imageUpload.click());
    els.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        els.uploadArea.classList.add('dragover');
    });
    els.uploadArea.addEventListener('dragleave', () => els.uploadArea.classList.remove('dragover'));
    els.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        els.uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImageFromFile(file);
        }
    });

    els.imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) loadImageFromFile(file);
    });

    els.toggleGrayscaleBtn.addEventListener('click', () => {
        state.grayscale = !state.grayscale;
        els.toggleGrayscaleBtn.classList.toggle('active', state.grayscale);
        render();
    });

    els.downloadBtn.addEventListener('click', downloadImage);

    window.addEventListener('resize', render);
}

// 纸张格式预设
const paperFormats = {
    a4: { width: 210, height: 297 },
    a5: { width: 148, height: 210 },
    letter: { width: 216, height: 279 }
};

function updatePaperDimensions(format) {
    if (format === 'custom') return;
    const dim = paperFormats[format];
    if (dim) {
        state.paperWidth = dim.width;
        state.paperHeight = dim.height;
        els.widthMmInput.value = dim.width;
        els.heightMmInput.value = dim.height;
        render();
    }
}

// 加载图片
function loadImage(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        state.image = img;
        state.imageUrl = url;
        render();
    };
    img.onerror = () => {
        console.warn('默认图片加载失败，使用占位图');
        createPlaceholderImage();
    };
    img.src = url;
}

function loadImageFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => loadImage(e.target.result);
    reader.readAsDataURL(file);
}

function loadRandomImage() {
    const keywords = ['flower', 'animal', 'landscape', 'architecture', 'sketch'];
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    const url = `https://source.unsplash.com/random/1200x900?${keyword}&sig=${Date.now()}`;
    loadImage(url);
}

function createPlaceholderImage() {
    const w = 1200;
    const h = 900;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d');
    cx.fillStyle = '#f5f5f5';
    cx.fillRect(0, 0, w, h);
    cx.strokeStyle = '#999';
    cx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
        cx.beginPath();
        cx.moveTo(Math.random() * w, Math.random() * h);
        cx.bezierCurveTo(
            Math.random() * w, Math.random() * h,
            Math.random() * w, Math.random() * h,
            Math.random() * w, Math.random() * h
        );
        cx.stroke();
    }
    const img = new Image();
    img.onload = () => {
        state.image = img;
        render();
    };
    img.src = c.toDataURL();
}

// 渲染主函数
function render() {
    if (!state.image) return;

    const canvasWidth = Math.round(state.paperWidth * MM_TO_PX);
    const canvasHeight = Math.round(state.paperHeight * MM_TO_PX);

    els.gridCanvas.width = canvasWidth;
    els.gridCanvas.height = canvasHeight;

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 绘制图片（等比例填充并居中裁剪）
    drawImageCover(ctx, state.image, 0, 0, canvasWidth, canvasHeight);

    // 黑白效果
    if (state.grayscale) {
        applyGrayscale(ctx, canvasWidth, canvasHeight);
    }

    // 绘制网格
    drawGrid(ctx, canvasWidth, canvasHeight);

    // 更新打印指南
    updateGuide();
}

function drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let drawW, drawH, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        drawH = h;
        drawW = h * imgRatio;
        offsetX = (w - drawW) / 2;
        offsetY = 0;
    } else {
        drawW = w;
        drawH = w / imgRatio;
        offsetX = 0;
        offsetY = (h - drawH) / 2;
    }

    ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH);
}

function applyGrayscale(ctx, w, h) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);
}

function drawGrid(ctx, w, h) {
    const rows = state.rows;
    const cols = state.cols;
    const cellW = w / cols;
    const cellH = h / rows;

    ctx.save();
    ctx.strokeStyle = state.lineColor;
    ctx.globalAlpha = state.lineOpacity;
    ctx.lineWidth = state.lineWidth;

    // 竖线
    for (let i = 1; i < cols; i++) {
        const x = i * cellW;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    // 横线
    for (let i = 1; i < rows; i++) {
        const y = i * cellH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // 标签
    if (state.showLabels) {
        drawLabels(ctx, w, h, cellW, cellH);
    }

    ctx.restore();
}

function drawLabels(ctx, w, h, cellW, cellH) {
    ctx.globalAlpha = state.lineOpacity;
    ctx.fillStyle = state.lineColor;
    ctx.font = `bold ${Math.min(cellW, cellH) * 0.18}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const padding = Math.min(cellW, cellH) * 0.08;

    for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
            const label = `${String.fromCharCode(65 + r)}${c + 1}`;
            const x = c * cellW + padding;
            const y = r * cellH + padding;
            ctx.fillText(label, x, y);
        }
    }
}

function updateGuide() {
    els.guideWidth.textContent = state.paperWidth;
    els.guideHeight.textContent = state.paperHeight;

    const vLines = state.cols - 1;
    const hLines = state.rows - 1;
    const vGap = state.cols > 1 ? (state.paperWidth / state.cols).toFixed(1) : state.paperWidth;
    const hGap = state.rows > 1 ? (state.paperHeight / state.rows).toFixed(1) : state.paperHeight;

    els.guideList.innerHTML = '';

    const items = [
        `画 ${vLines} 条竖线，间隔 ${vGap} mm`,
        `画 ${hLines} 条横线，间隔 ${hGap} mm`,
        `给每个格子标注，从 A1 到 ${String.fromCharCode(65 + state.rows - 1)}${state.cols}`
    ];

    items.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        els.guideList.appendChild(li);
    });
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = `grid-${state.cols}x${state.rows}-${state.paperWidth}x${state.paperHeight}mm.png`;
    link.href = els.gridCanvas.toDataURL('image/png');
    link.click();
}

// 启动
init();
