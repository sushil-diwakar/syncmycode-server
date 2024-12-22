const mongoose = require('mongoose');

const CodeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    content: { type: String, default: '' },
    language: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Code', CodeSchema);