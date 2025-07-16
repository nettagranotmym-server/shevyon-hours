const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const FILE_PATH = './reports.csv';

app.post('/report', (req, res) => {
  const { lecturer, date, course, notes } = req.body;
  const row = `"${lecturer}","${date}","${course}","${notes || ''}"\n`;

  const fileExists = fs.existsSync(FILE_PATH);
  if (!fileExists) {
    // מוסיפים BOM כדי שאקסל יבין שזה UTF-8
    const header = '\uFEFFשם המרצה,תאריך,שם הקורס,הערות\n';
    fs.writeFileSync(FILE_PATH, header, 'utf8');
  }

  fs.appendFileSync(FILE_PATH, row, 'utf8');
  res.status(200).send('Saved');
});

app.get('/reports', (req, res) => {
  if (!fs.existsSync(FILE_PATH)) return res.send('No reports yet');
  res.sendFile(path.resolve(FILE_PATH));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
