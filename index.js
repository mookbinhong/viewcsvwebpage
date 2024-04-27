const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('csvFile'), (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    const filePath = req.file.path;
    const data = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', () => {
            fs.unlinkSync(filePath);
            res.json({ message: 'File uploaded successfully', data });

        })
        .on('error', (err) => {
            res.status(500).json({ error: err.message });
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(cors());