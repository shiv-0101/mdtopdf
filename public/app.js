const fileInput = document.getElementById('file-input');
const mdText = document.getElementById('md-text');
const previewBtn = document.getElementById('preview-btn');
const downloadBtn = document.getElementById('download-btn');
const statusDiv = document.getElementById('status');
const closeBtn = document.getElementById('close-btn');
const modeFile = document.getElementById('mode-file');
const modeText = document.getElementById('mode-text');
const fileSection = document.getElementById('file-section');
const textSection = document.getElementById('text-section');

let selectedFile = null;
let pdfBlob = null;
let currentMode = 'file';

modeFile.addEventListener('change', () => {
  if (modeFile.checked) {
    currentMode = 'file';
    fileSection.style.display = 'block';
    textSection.style.display = 'none';
    pdfBlob = null;
    previewBtn.disabled = !selectedFile;
    downloadBtn.disabled = !selectedFile;
    statusDiv.textContent = 'Ready';
  }
});

modeText.addEventListener('change', () => {
  if (modeText.checked) {
    currentMode = 'text';
    fileSection.style.display = 'none';
    textSection.style.display = 'block';
    pdfBlob = null;
    previewBtn.disabled = !mdText.value.trim();
    downloadBtn.disabled = !mdText.value.trim();
    statusDiv.textContent = 'Ready';
  }
});

mdText.addEventListener('input', () => {
  if (currentMode === 'text') {
    pdfBlob = null;
    const hasText = mdText.value.trim().length > 0;
    previewBtn.disabled = !hasText;
    downloadBtn.disabled = !hasText;
    statusDiv.textContent = hasText ? 'Text ready. Click to convert.' : 'Ready';
  }
});

closeBtn.addEventListener('click', () => {
  if (confirm('Close this window?')) {
    window.location.href = 'about:blank';
    window.close();
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && currentMode === 'file') {
    selectedFile = file;
    pdfBlob = null;
    previewBtn.disabled = false;
    downloadBtn.disabled = false;
    statusDiv.textContent = `File selected: ${file.name}`;
  } else {
    selectedFile = null;
    pdfBlob = null;
    previewBtn.disabled = true;
    downloadBtn.disabled = true;
    statusDiv.textContent = 'Ready';
  }
});

async function convertPDF() {
  const formData = new FormData();
  
  if (currentMode === 'file') {
    if (!selectedFile) return null;
    formData.append('mdfile', selectedFile);
  } else {
    const text = mdText.value.trim();
    if (!text) return null;
    const blob = new Blob([text], { type: 'text/markdown' });
    formData.append('mdfile', blob, 'input.md');
  }

  const response = await fetch('/convert', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    return await response.blob();
  } else {
    const error = await response.json();
    throw new Error(error.error);
  }
}

previewBtn.addEventListener('click', async () => {
  if (currentMode === 'file' && !selectedFile) return;
  if (currentMode === 'text' && !mdText.value.trim()) return;

  previewBtn.disabled = true;
  downloadBtn.disabled = true;
  statusDiv.textContent = 'Converting... Please wait.';

  try {
    if (!pdfBlob) {
      pdfBlob = await convertPDF();
    }
    
    const url = window.URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    statusDiv.textContent = 'PDF preview opened in new tab.';
  } catch (error) {
    statusDiv.textContent = `Error: ${error.message}`;
  }

  previewBtn.disabled = false;
  downloadBtn.disabled = false;
});

downloadBtn.addEventListener('click', async () => {
  if (currentMode === 'file' && !selectedFile) return;
  if (currentMode === 'text' && !mdText.value.trim()) return;

  previewBtn.disabled = true;
  downloadBtn.disabled = true;
  statusDiv.textContent = 'Converting... Please wait.';

  try {
    if (!pdfBlob) {
      pdfBlob = await convertPDF();
    }
    
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    const filename = currentMode === 'file' 
      ? selectedFile.name.replace(/\.(md|markdown)$/i, '.pdf')
      : 'converted.pdf';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    statusDiv.textContent = 'Success! PDF downloaded.';
  } catch (error) {
    statusDiv.textContent = `Error: ${error.message}`;
  }

  previewBtn.disabled = false;
  downloadBtn.disabled = false;
});
