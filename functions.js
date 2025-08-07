// Global variables
let currentPdf = null;
let isResizing = false;

// Page navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page, .main-page');
    const container = document.querySelector('.container');
    
    pages.forEach(page => page.classList.remove('active'));
    
    if (pageId === 'mainPage') {
        document.getElementById('mainPage').style.display = 'block';
        container.classList.remove('full-width');
    } else {
        document.getElementById('mainPage').style.display = 'none';
        document.getElementById(pageId).classList.add('active');
        
        // Make container full width for reading page
        if (pageId === 'readingPage' || pageId === 'listeningPage') {
            container.classList.add('full-width');
            
            // Với Listening, reset giao diện nếu cần
            if (pageId === 'listeningPage') {
                // chưa cần reset nhiều, chỉ cần cho phép full-width
            }

            if (pageId === 'readingPage') {
                const newFileBtn = document.getElementById('newFileBtn');
                const uploadSection = document.getElementById('uploadSection');
                const pdfContainer = document.getElementById('pdfContainer');
                
                if (currentPdf) {
                    newFileBtn.classList.add('show');
                    uploadSection.style.display = 'none';
                    pdfContainer.style.display = 'flex';
                } else {
                    newFileBtn.classList.remove('show');
                    uploadSection.style.display = 'block';
                    pdfContainer.style.display = 'none';
                }
            }

        } else {
            container.classList.remove('full-width');
        }
    }
}

// PDF handling
const pdfInput = document.getElementById('pdfInput');
const uploadSection = document.getElementById('uploadSection');
const pdfContainer = document.getElementById('pdfContainer');
const leftViewer = document.getElementById('leftViewer');
const rightViewer = document.getElementById('rightViewer');

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// File input change handler
pdfInput.addEventListener('change', handleFileSelect);

// Drag and drop handlers
uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.classList.add('dragover');
});

uploadSection.addEventListener('dragleave', () => {
    uploadSection.classList.remove('dragover');
});

uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        handleFile(files[0]);
    }
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        handleFile(file);
    }
}

async function handleFile(file) {
    try {
        uploadSection.style.display = 'none';
        pdfContainer.style.display = 'flex';
        
        // Show the "Load new file" button
        const newFileBtn = document.getElementById('newFileBtn');
        newFileBtn.classList.add('show');
        
        leftViewer.innerHTML = '<div class="loading">Đang tải PDF...</div>';
        rightViewer.innerHTML = '<div class="loading">Đang tải PDF...</div>';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        currentPdf = pdf;

        await renderPdfPages(pdf, leftViewer);
        await renderPdfPages(pdf, rightViewer);

    } catch (error) {
        console.error('Error loading PDF:', error);
        leftViewer.innerHTML = '<div class="error">Lỗi khi tải PDF. Vui lòng thử lại.</div>';
        rightViewer.innerHTML = '<div class="error">Lỗi khi tải PDF. Vui lòng thử lại.</div>';
    }
}

// Function to load new file
function loadNewFile() {
    // Reset the file input
    pdfInput.value = '';
    
    // Hide PDF container and show upload section
    pdfContainer.style.display = 'none';
    uploadSection.style.display = 'block';
    
    // Hide the "Load new file" button
    const newFileBtn = document.getElementById('newFileBtn');
    newFileBtn.classList.remove('show');
    
    // Clear current PDF
    currentPdf = null;
    leftViewer.innerHTML = '';
    rightViewer.innerHTML = '';
}

async function renderPdfPages(pdf, container) {
    container.innerHTML = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
            const page = await pdf.getPage(pageNum);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page';
            pageDiv.appendChild(canvas);
            container.appendChild(pageDiv);

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

        } catch (error) {
            console.error(`Error rendering page ${pageNum}:`, error);
        }
    }
}

// Resizer functionality
const resizer = document.getElementById('resizer');
const leftPanel = document.getElementById('leftPanel');
const rightPanel = document.getElementById('rightPanel');

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    e.preventDefault();
});

function handleResize(e) {
    if (!isResizing) return;

    const container = document.querySelector('.pdf-panels');
    const containerRect = container.getBoundingClientRect();
    const percentage = (e.clientX - containerRect.left) / containerRect.width;
    
    if (percentage > 0.1 && percentage < 0.9) {
        leftPanel.style.flex = percentage;
        rightPanel.style.flex = 1 - percentage;
    }
}

function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
}

// -------------------- LISTENING PAGE --------------------

// Audio upload handling
const audioInput = document.getElementById('audioInput');
const audioUploadSection = document.getElementById('audioUploadSection');
const audioList = document.getElementById('audioList');

audioInput.addEventListener('change', handleAudioFiles);

audioUploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    audioUploadSection.classList.add('dragover');
});

audioUploadSection.addEventListener('dragleave', () => {
    audioUploadSection.classList.remove('dragover');
});

audioUploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    audioUploadSection.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleAudioFiles({ target: { files } });
    }
});

function handleAudioFiles(e) {
    const files = e.target.files;
    for (let file of files) {
        if (file.type.startsWith('audio/')) {
            const listItem = document.createElement('li');

            const title = document.createElement('span');
            title.textContent = file.name;

            // Tạo nút xóa
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.style.border = 'none';
            deleteBtn.style.background = 'transparent';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.fontSize = '1.2rem';
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.title = 'Xoá file';

            deleteBtn.addEventListener('click', () => {
                audioList.removeChild(listItem);
            });

            // Tạo player
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src = URL.createObjectURL(file);
            audioElement.style.marginTop = '5px';

            listItem.appendChild(title);
            listItem.appendChild(deleteBtn);
            listItem.appendChild(audioElement);
            audioList.appendChild(listItem);
        }
    }
}

// Listening PDF handling
const listeningPdfInput = document.getElementById('listeningPdfInput');
const listeningPdfUploadSection = document.getElementById('listeningPdfUploadSection');
const listeningPdfViewer = document.getElementById('listeningPdfViewer');

listeningPdfInput.addEventListener('change', handleListeningPdf);

listeningPdfUploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    listeningPdfUploadSection.classList.add('dragover');
});

listeningPdfUploadSection.addEventListener('dragleave', () => {
    listeningPdfUploadSection.classList.remove('dragover');
});

listeningPdfUploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    listeningPdfUploadSection.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        handleListeningPdf({ target: { files } });
    }
});

async function handleListeningPdf(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        try {
            listeningPdfUploadSection.style.display = 'none';
            listeningPdfViewer.innerHTML = '<div class="loading">Đang tải PDF...</div>';

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            listeningPdfViewer.innerHTML = '';
            await renderPdfPages(pdf, listeningPdfViewer);

        } catch (error) {
            console.error('Error loading Listening PDF:', error);
            listeningPdfViewer.innerHTML = '<div class="error">Lỗi khi tải PDF. Vui lòng thử lại.</div>';
        }
    }
}

// Resizer functionality for Listening
const listeningResizer = document.getElementById('listeningResizer');
const audioPanel = document.getElementById('audioPanel');
const listeningPdfPanel = document.getElementById('listeningPdfPanel');
let isListeningResizing = false;

listeningResizer.addEventListener('mousedown', (e) => {
    isListeningResizing = true;
    document.addEventListener('mousemove', handleListeningResize);
    document.addEventListener('mouseup', stopListeningResize);
    e.preventDefault();
});

function handleListeningResize(e) {
    if (!isListeningResizing) return;

    const container = document.querySelector('.listening-panels');
    const containerRect = container.getBoundingClientRect();
    const percentage = (e.clientX - containerRect.left) / containerRect.width;

    if (percentage > 0.1 && percentage < 0.9) {
        audioPanel.style.flex = percentage;
        listeningPdfPanel.style.flex = 1 - percentage;
    }
}

function stopListeningResize() {
    isListeningResizing = false;
    document.removeEventListener('mousemove', handleListeningResize);
    document.removeEventListener('mouseup', stopListeningResize);
}

// Initialize app
showPage('mainPage');