// --- BẮT ĐẦU FILE functions.js (PHIÊN BẢN HOÀN TOÀN MỚI) ---

// Global variables
let currentPdf = null;
let isResizing = false;

let timerInterval = null;
let timeLeftInSeconds = 3600; // 60 phút
let isTimerRunning = false;

// --- Thêm các hàm mới cho đồng hồ ---

function startTimer() {
    if (isTimerRunning) return;

    // *** NEW: Lấy thời gian từ ô input ***
    const timeSetter = document.getElementById('timeSetter');
    const minutes = parseInt(timeSetter.value, 10);

    if (isNaN(minutes) || minutes <= 0) {
        alert("Vui lòng nhập một số phút hợp lệ.");
        return;
    }
    
    // Vô hiệu hóa ô cài đặt khi đồng hồ chạy
    timeSetter.disabled = true; 

    // Chỉ cập nhật timeLeftInSeconds nếu đồng hồ chưa chạy lần nào (tức là khi bắt đầu mới)
    if (timeLeftInSeconds === (parseInt(timeSetter.value, 10) * 60) || timeLeftInSeconds === 3600) {
         timeLeftInSeconds = minutes * 60;
    }

    isTimerRunning = true;
    
    const toggleBtn = document.getElementById('timerToggleBtn');
    toggleBtn.textContent = 'Tạm dừng';
    toggleBtn.className = 'timer-toggle-btn pause';

    updateTimerDisplay(); // Cập nhật hiển thị ngay lập tức

    timerInterval = setInterval(() => {
        timeLeftInSeconds--;
        updateTimerDisplay();

        if (timeLeftInSeconds <= 0) {
            timesUp();
        }
    }, 1000);
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    const toggleBtn = document.getElementById('timerToggleBtn');
    toggleBtn.textContent = 'Tiếp tục';
    toggleBtn.className = 'timer-toggle-btn start';
}

function toggleTimer() {
    if (isTimerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeftInSeconds / 60);
    const seconds = timeLeftInSeconds % 60;
    const displayString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = displayString;
}

function timesUp() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    document.getElementById('timerDisplay').classList.add('times-up');
    document.getElementById('timerToggleBtn').style.display = 'none'; // Ẩn nút khi hết giờ
    
    // Tự động kiểm tra đáp án
    checkAllAnswers();

    // Vô hiệu hóa tất cả các input
    const inputs = rightViewer.querySelectorAll('input');
    inputs.forEach(input => input.disabled = true);
    
    alert('Đã hết giờ làm bài! Đáp án của bạn đã được chấm.');
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false;
    
    const timeSetter = document.getElementById('timeSetter');
    timeSetter.disabled = false; // Cho phép cài đặt lại
    const minutes = parseInt(timeSetter.value, 10) || 60;
    timeLeftInSeconds = minutes * 60;

    const timerDisplay = document.getElementById('timerDisplay');
    const toggleBtn = document.getElementById('timerToggleBtn');
    
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:00`;
    timerDisplay.classList.remove('times-up');
    
    toggleBtn.textContent = 'Bắt đầu';
    toggleBtn.className = 'timer-toggle-btn start';
    toggleBtn.style.display = 'inline-block';
}

const GEMINI_API_KEY = "AIzaSyA_ZEA2s_ZyEwbBDm3773Qv2GT193y6RMc"; // API Key của bạn

// ... (Hàm showPage giữ nguyên) ...
function showPage(pageId) {
    const pages = document.querySelectorAll('.page, .main-page');
    const container = document.querySelector('.container');
    const timerContainer = document.getElementById('timerContainer');

    // Logic ẩn/hiện đồng hồ
    if (pageId === 'readingPage' && currentPdf) {
        timerContainer.style.display = 'flex';
    } else {
        timerContainer.style.display = 'none';
    }

    // Logic chuyển trang
    pages.forEach(page => page.classList.remove('active'));

    if (pageId === 'mainPage') {
        document.getElementById('mainPage').style.display = 'block';
        container.classList.remove('full-width');
    } else {
        document.getElementById('mainPage').style.display = 'none';
        document.getElementById(pageId).classList.add('active');

        // Logic full-width và hiển thị upload/pdf
        if (pageId === 'readingPage' || pageId === 'listeningPage') {
            container.classList.add('full-width');

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
            // (Phần cho listeningPage giữ nguyên)
            
        } else {
            container.classList.remove('full-width');
        }
    }
}

// ... (Phần PDF handling cơ bản giữ nguyên) ...
const pdfInput = document.getElementById('pdfInput');
const uploadSection = document.getElementById('uploadSection');
const pdfContainer = document.getElementById('pdfContainer');
const leftViewer = document.getElementById('leftViewer');
const rightViewer = document.getElementById('rightViewer');
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
pdfInput.addEventListener('change', handleFileSelect);
uploadSection.addEventListener('dragover', (e) => { e.preventDefault(); uploadSection.classList.add('dragover'); });
uploadSection.addEventListener('dragleave', () => { uploadSection.classList.remove('dragover'); });
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
async function extractTextFromPdf(pdf) {
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
    }
    return fullText;
}

// ----------------------------------------------------
// PHẦN LOGIC MỚI ĐỂ TẠO CÂU HỎI TỪ JSON
// ----------------------------------------------------

async function handleFile(file) {
    if (GEMINI_API_KEY === "YOUR_API_KEY_HERE" || !GEMINI_API_KEY) {
        alert('Lỗi: API Key chưa được cấu hình trong file functions.js.');
        return;
    }
    try {
        // Tạm thời ẩn khu vực upload và hiện khu vực làm bài với thông báo loading
        uploadSection.style.display = 'none';
        pdfContainer.style.display = 'flex';
        document.getElementById('newFileBtn').classList.add('show');
        
        leftViewer.innerHTML = '<div class="loading">Đang tải PDF...</div>';
        rightViewer.innerHTML = '<div class="loading">AI đang phân tích cấu trúc đề thi...</div>';

        // Đọc và phân tích file PDF
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        currentPdf = pdf; // QUAN TRỌNG: Gán currentPdf để các hàm khác biết trạng thái

        // GỌI LẠI showPage ĐỂ CẬP NHẬT GIAO DIỆN SAU KHI currentPdf ĐÃ CÓ GIÁ TRỊ
        // Việc này sẽ đảm bảo đồng hồ được hiển thị đúng lúc.
        showPage('readingPage'); 
        
        // Render PDF và tạo câu hỏi
        await renderPdfPages(pdf, leftViewer);
        const pdfText = await extractTextFromPdf(pdf);
        await generateQuestionsWithAI(pdfText);
        
        // Reset đồng hồ về trạng thái ban đầu, sẵn sàng cho người dùng bấm "Bắt đầu"
        resetTimer();

    } catch (error) {
        console.error('Lỗi xử lý file:', error);
        currentPdf = null; // Reset lại nếu có lỗi
        showPage('readingPage'); // Cập nhật lại giao diện để hiển thị khu vực upload
        leftViewer.innerHTML = '<div class="error">Lỗi khi tải PDF.</div>';
        rightViewer.innerHTML = `<div class="error">Đã xảy ra lỗi khi tạo câu hỏi.<br><small>${error.message}</small></div>`;
    }
}

async function generateQuestionsWithAI(text) {
    const model = 'gemini-1.5-flash-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    // *** PROMPT MỚI YÊU CẦU TRẢ VỀ JSON ***
    const prompt = `
        You are an expert IELTS test processor. Your task is to analyze the provided text of an IELTS Reading test and convert it into a structured JSON format.

        The JSON object must have a single root key: "readingTest".
        The "readingTest" value is an array of "passages".
        Each "passage" object has:
        - "passageTitle": a string (e.g., "Reading Passage 1").
        - "questionGroups": an array of question group objects.

        Each "questionGroup" object has:
        - "instruction": a string containing the instructions for that group.
        - "type": a string representing the question type. Valid types are: "MULTIPLE_CHOICE", "TRUE_FALSE_NOT_GIVEN", "MATCHING_HEADINGS", "GAP_FILLING", "SHORT_ANSWER", "MATCHING_SENTENCE_ENDINGS". // <-- THÊM VÀO ĐÂY
        - "questions": an array of question objects.

        Each "question" object has:
        - "number": a string (e.g., "1", "14-18").
        - "text": a string (the question text itself, or the statement for T/F/NG).
        - "options": an array of strings (for MULTIPLE_CHOICE or MATCHING_HEADINGS). For other types, this can be an empty array.
        - "answer": a string. Infer the correct answer from an answer key if present in the text. If not, set it to "NULL". For GAP_FILLING, the answer is the word(s) to be filled in.
        - "options": an array of strings. For MULTIPLE_CHOICE, MATCHING_HEADINGS, and MATCHING_SENTENCE_ENDINGS, this array (in the first question of the group) should contain the list of available options (A, B, C...). For other types, this can be an empty array.

        Your response MUST be ONLY a valid JSON object. Do not include any text, explanation, or markdown like \`\`\`json.

        Here is the full document text to process:
        ---
        ${text.substring(0, 40000)}
        ---
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json", // Yêu cầu trả về dạng JSON
                    temperature: 0.1,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message}`);
        }

        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        const quizData = JSON.parse(jsonText);

        renderQuizFromJSON(quizData);

    } catch (error) {
        console.error('Error calling Gemini API or parsing JSON:', error);
        rightViewer.innerHTML = `<div class="error">Không thể tạo câu hỏi. Lỗi: ${error.message}. Có thể cấu trúc đề thi phức tạp, vui lòng thử lại.</div>`;
        document.getElementById('quizActions').innerHTML = '';
    }
}

function renderQuizFromJSON(quizData) {
    if (!quizData || !quizData.readingTest) {
        rightViewer.innerHTML = '<div class="error">AI đã trả về cấu trúc dữ liệu không hợp lệ.</div>';
        return;
    }

    let html = '';
    quizData.readingTest.forEach(passage => {
        html += `<div class="passage-container">`;
        html += `<h2>${passage.passageTitle}</h2>`;

        passage.questionGroups.forEach(group => {
            html += `<div class="question-group" data-type="${group.type}">`;
            html += `<p class="instruction">${group.instruction}</p>`;
            
            const matchingOptions = (group.type === 'MATCHING_HEADINGS' || group.type === 'MATCHING_SENTENCE_ENDINGS') && group.questions[0]?.options;
            if (matchingOptions) {
                 const title = group.type === 'MATCHING_HEADINGS' ? 'List of Headings' : 'List of Endings';
                 html += `<div class="matching-options-box"><h4>${title}</h4><ul>`;

                 // *** SỬA Ở ĐÂY: Tự tạo và thêm ký tự A, B, C... ***
                 matchingOptions.forEach((opt, index) => {
                     const prefix = String.fromCharCode(65 + index); // 65 là mã ASCII cho 'A'. index 0 -> 'A', 1 -> 'B', ...
                     // Xóa ký tự A, B, C.. cũ nếu có để tránh trùng lặp
                     const cleanOpt = opt.replace(/^[A-Z]\.\s*/, '');
                     html += `<li><b>${prefix}.</b> ${cleanOpt}</li>`;
                 });
                 
                 html += `</ul></div>`;
            }

            if (group.type === 'GAP_FILLING') {
                html += renderGapFillingGroup(group);
            } else {
                group.questions.forEach(q => {
                    html += `<div class="question" data-answer="${q.answer || 'NULL'}" data-number="${q.number}">`;
                    
                    switch (group.type) {
                        case 'MULTIPLE_CHOICE':
                            html += renderMultipleChoice(q);
                            break;
                        case 'TRUE_FALSE_NOT_GIVEN':
                            html += renderTrueFalse(q);
                            break;
                        case 'MATCHING_HEADINGS':
                             html += renderMatching(q);
                             break;
                        case 'MATCHING_SENTENCE_ENDINGS':
                             html += renderMatchingSentenceEnding(q, group);
                             break;
                        case 'SHORT_ANSWER':
                             html += renderShortAnswer(q);
                             break;
                        default:
                            html += `<p>${q.number}. ${q.text}</p>`;
                    }
                    html += `</div>`;
                });
            }
            html += `</div>`;
        });
        html += `</div>`;
    });

    rightViewer.innerHTML = html;
    document.getElementById('quizActions').innerHTML = `<button class="check-answers-btn" onclick="checkAllAnswers()">Kiểm tra đáp án</button>`;
}

function renderMatchingSentenceEnding(q, group) {
    const endings = group.questions[0]?.options || [];
    let optionsHtml = '<option value="">-- Chọn --</option>';
    
    // *** SỬA Ở ĐÂY: Tự tạo các option A, B, C... dựa trên số lượng endings ***
    optionsHtml += endings.map((_, index) => {
        const value = String.fromCharCode(65 + index); // A, B, C...
        return `<option value="${value}">${value}</option>`;
    }).join('');

    return `
        <div class="matching-sentence-question">
            <span class="question-text">${q.number}. ${q.text}</span>
            <select name="q_${q.number}" class="sentence-ending-select">
                ${optionsHtml}
            </select>
        </div>
    `;
}

// Các hàm render cho từng loại câu hỏi
function renderMultipleChoice(q) {
    let optionsHtml = q.options.map(opt => {
        const value = opt.match(/^[A-Z]/) ? opt.charAt(0) : '';
        return `<label><input type="radio" name="q_${q.number}" value="${value}"> ${opt}</label>`;
    }).join('');
    return `<p class="question-text">${q.number}. ${q.text}</p><div class="options">${optionsHtml}</div>`;
}

function renderTrueFalse(q) {
    const uniqueId = `q_${q.number.replace(/[^a-zA-Z0-9]/g, '')}`; // Tạo ID duy nhất cho input
    return `
        <div class="tf-question">
            <span class="question-text">${q.number}. ${q.text}</span>
            <div class="options tf-options">
                <input type="radio" name="${uniqueId}" id="${uniqueId}_T" value="TRUE">
                <label for="${uniqueId}_T">True</label>

                <input type="radio" name="${uniqueId}" id="${uniqueId}_F" value="FALSE">
                <label for="${uniqueId}_F">False</label>

                <input type="radio" name="${uniqueId}" id="${uniqueId}_NG" value="NOT GIVEN">
                <label for="${uniqueId}_NG">Not Given</label>
            </div>
        </div>
    `;
}

// Thay thế các hàm này trong functions.js

function renderGapFillingGroup(group) {
    let summaryHtml = '<div class="summary-block">'; // Một div cho cả đoạn tóm tắt
    
    group.questions.forEach(q => {
        // Nối phần văn bản của câu hỏi
        summaryHtml += `<span> ${q.text} </span>`;
        // Chèn ô input ngay sau đó, bọc trong một span.question để hàm check có thể tìm thấy
        summaryHtml += `
            <span class="question" data-answer="${q.answer || 'NULL'}" data-number="${q.number}">
                <input type="text" class="gap-input" name="q_${q.number}" placeholder="(${q.number})">
            </span>
        `;
    });
    
    summaryHtml += '</div>';
    return summaryHtml;
}

function renderShortAnswer(q) {
    return `
        <div class="gap-question">
            <label for="q_${q.number}" class="question-text">${q.number}. ${q.text}</label>
            <input type="text" id="q_${q.number}" class="short-answer-input" name="q_${q.number}" placeholder="Nhập câu trả lời">
        </div>
    `;
}

function renderMatching(q) {
    return `<p class="question-text">${q.number}. ${q.text} <input type="text" class="matching-input" name="q_${q.number}" placeholder="Nhập đáp án (i, ii, ...)" style="width: 120px;"></p>`;
}


// Hàm kiểm tra đáp án tổng hợp
function checkAllAnswers() {
    document.querySelectorAll('.question').forEach(qElement => {
        const number = qElement.dataset.number;
        const correctAnswer = qElement.dataset.answer;
        
        qElement.classList.remove('correct', 'incorrect', 'no-answer');
        
        if (correctAnswer === 'NULL' || !correctAnswer) {
            qElement.classList.add('no-answer');
            return;
        }

        let userAnswer = null;
        let isCorrect = false;
        
        const textInput = qElement.querySelector('input[type="text"]');
        const radioInput = qElement.querySelector('input[type="radio"]:checked');
        const selectInput = qElement.querySelector('select'); // *** TÌM THẺ SELECT ***

        if (textInput) {
            userAnswer = textInput.value.trim();
            const correctAnswers = correctAnswer.split('/').map(ans => ans.trim().toLowerCase());
            if (correctAnswers.includes(userAnswer.toLowerCase())) isCorrect = true;

        } else if (radioInput) {
            userAnswer = radioInput.value;
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) isCorrect = true;

        } else if (selectInput) { // *** XỬ LÝ CHO SELECT ***
            userAnswer = selectInput.value;
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) isCorrect = true;
        }

        // Áp dụng style và hiển thị đáp án đúng nếu sai
        if (isCorrect) {
            qElement.classList.add('correct');
        } else {
            qElement.classList.add('incorrect');
            const inputElement = textInput || selectInput;
            if (inputElement) {
                const oldAnswer = inputElement.nextElementSibling;
                if (oldAnswer && oldAnswer.classList.contains('correct-answer-text')) {
                    oldAnswer.remove();
                }
                inputElement.insertAdjacentHTML('afterend', `<span class="correct-answer-text"> -> ${correctAnswer}</span>`);
            } else {
                const correctLabel = qElement.querySelector(`input[value="${correctAnswer.toUpperCase()}"]`)?.nextElementSibling;
                if (correctLabel) correctLabel.classList.add('correct-answer');
            }
        }
    });

    const checkBtn = document.querySelector('.check-answers-btn');
    checkBtn.disabled = true;
    checkBtn.textContent = 'Đã kiểm tra';
}

function loadNewFile() {
    currentPdf = null;
    pdfInput.value = '';
    resetTimer(); // Gọi hàm reset đồng hồ
    document.getElementById('timerContainer').style.visibility = 'hidden'; // Ẩn đồng hồ đi
    document.getElementById('pdfContainer').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('newFileBtn').classList.remove('show');
    leftViewer.innerHTML = '';
    rightViewer.innerHTML = `<div class="initial-prompt"><h3>Chờ phân tích đề thi...</h3><p>Sau khi tải file PDF lên, câu hỏi sẽ được trích xuất ở đây.</p></div>`;
    document.getElementById('quizActions').innerHTML = '';
}

// HÀM ĐÃ SỬA LỖI
async function renderPdfPages(pdf, container) {
    container.innerHTML = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
            const page = await pdf.getPage(pageNum);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            // *** DÒNG BỊ THIẾU ĐÃ ĐƯỢC THÊM LẠI ***
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

// ... (Phần resizer và Listening page giữ nguyên) ...
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
const audioInput = document.getElementById('audioInput');
const audioUploadSection = document.getElementById('audioUploadSection');
const audioList = document.getElementById('audioList');
audioInput.addEventListener('change', handleAudioFiles);
audioUploadSection.addEventListener('dragover', (e) => { e.preventDefault(); audioUploadSection.classList.add('dragover'); });
audioUploadSection.addEventListener('dragleave', () => { audioUploadSection.classList.remove('dragover'); });
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
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.style.cssText = 'border: none; background: transparent; cursor: pointer; font-size: 1.2rem; margin-left: 10px;';
            deleteBtn.title = 'Xoá file';
            deleteBtn.addEventListener('click', () => { audioList.removeChild(listItem); });
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src = URL.createObjectURL(file);
            audioElement.style.marginTop = '5px';
            listItem.append(title, deleteBtn, audioElement);
            audioList.appendChild(listItem);
        }
    }
}
const listeningPdfInput = document.getElementById('listeningPdfInput');
const listeningPdfUploadSection = document.getElementById('listeningPdfUploadSection');
const listeningPdfViewer = document.getElementById('listeningPdfViewer');
listeningPdfInput.addEventListener('change', handleListeningPdf);
listeningPdfUploadSection.addEventListener('dragover', (e) => { e.preventDefault(); listeningPdfUploadSection.classList.add('dragover'); });
listeningPdfUploadSection.addEventListener('dragleave', () => { listeningPdfUploadSection.classList.remove('dragover'); });
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

const timerToggleBtn = document.getElementById('timerToggleBtn');
if (timerToggleBtn) {
    timerToggleBtn.addEventListener('click', toggleTimer);
}

// Initialize app
showPage('mainPage');

// --- KẾT THÚC FILE functions.js ---