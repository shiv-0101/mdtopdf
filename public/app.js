const fileInput = document.getElementById('file-input');
const previewBtn = document.getElementById('preview-btn');
const downloadBtn = document.getElementById('download-btn');
const statusDiv = document.getElementById('status');
const closeBtn = document.getElementById('close-btn');

let selectedFile = null;
let pdfBlob = null;

closeBtn.addEventListener('click', () => {
  if (confirm('Close this window?')) {
    window.location.href = 'about:blank';
    window.close();
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
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
  if (!selectedFile) return null;

  const formData = new FormData();
  formData.append('mdfile', selectedFile);

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
  if (!selectedFile) return;

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
  if (!selectedFile) return;

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
    a.download = selectedFile.name.replace(/\.(md|markdown)$/i, '.pdf');
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
