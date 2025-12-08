const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { mdToPdf } = require('md-to-pdf');

const app = express();
const PORT = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

if (!fs.existsSync('output')) {
  fs.mkdirSync('output');
}

app.post('/convert', upload.single('mdfile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const mdPath = req.file.path;
    const outputFileName = `${Date.now()}.pdf`;
    const outputPath = path.join('output', outputFileName);

    await mdToPdf({ path: mdPath }, {
      dest: outputPath,
      launch_options: { args: ['--no-sandbox'] }
    });

    fs.unlinkSync(mdPath);

    res.download(outputPath, 'converted.pdf', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }, 5000);
    });
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`MD to PDF Converter running at http://localhost:${PORT}`);
});
