const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the root directory (parent of this file)
app.use(express.static(path.join(__dirname, '..')));

const COMMENTS_FILE = path.join(__dirname, 'comments.json');

function readComments() {
    if (!fs.existsSync(COMMENTS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf8'));
    } catch { return []; }
}

function writeComments(comments) {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

app.get('/api/comments', (req, res) => {
    res.json(readComments());
});

app.post('/api/comments', (req, res) => {
    const { name, text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Message is required' });
    }
    const comments = readComments();
    const newComment = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
        name: name.trim() || 'Anonymous',
        text: text.trim(),
        timestamp: new Date().toISOString()
    };
    comments.push(newComment);
    writeComments(comments);
    res.status(201).json(newComment);
});

app.delete('/api/comments/:id', (req, res) => {
    const id = req.params.id;
    let comments = readComments();
    comments = comments.filter(c => c.id !== id);
    writeComments(comments);
    res.json({ success: true });
});

app.delete('/api/comments', (req, res) => {
    writeComments([]);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});