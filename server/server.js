require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { Parser } = require('json2csv');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ חיבור למסד הנתונים MongoDB
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'shevyonDB'
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));


// ✅ סכימה ו־מודל
const reportSchema = new mongoose.Schema({
  lecturer: String,
  date: String,
  course: String,
  notes: String
});
const Report = mongoose.model('Report', reportSchema);

// ✅ שמירת דיווח חדש
app.post('/report', async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(200).send('Saved to MongoDB');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to save');
  }
});

// ✅ שליפת כל הדיווחים (JSON)
app.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(500).send('Error fetching reports');
  }
});

// ✅ יצירת והורדת קובץ CSV
app.get('/download-csv', async (req, res) => {
  try {
    const reports = await Report.find().lean();
    if (reports.length === 0) return res.status(404).send('אין נתונים');

    const fields = ['lecturer', 'date', 'course', 'notes'];
    const opts = { fields, withBOM: true };
    const parser = new Parser(opts);
    const csv = parser.parse(reports);

    const filePath = path.join(__dirname, 'reports.csv');
    fs.writeFileSync(filePath, csv, 'utf8');

    res.download(filePath, 'reports.csv', (err) => {
      if (err) console.error('שגיאה בשליחה:', err);
      fs.unlinkSync(filePath); // מוחק את הקובץ לאחר השליחה
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('שגיאה ביצירת הקובץ');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
