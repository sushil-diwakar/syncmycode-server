const Code = require('../models/Code');
const { v4: uuidv4 } = require('uuid');

// Create Code
const createCode = async (req, res) => {
    const { id, content = '', language = 'javascript' } = req.body; // Default values

    try {
        const newCode = new Code({ id, content, language });
        await newCode.save();
        res.status(201).json({ message: 'Code entry created successfully' });
    } catch (error) {
        console.error('Error creating code:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get Code
const getCode = async (req, res) => {
    const { id } = req.params;

    try {
        const code = await Code.findOne({ id });
        if (!code) return res.status(404).json({ error: 'Code not found' });

        res.status(200).json({ content: code.content, language: code.language });
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving the code' });
    }
};

// Update Code
const updateCode = async (req, res) => {
    const { content, language } = req.body;

    try {
        const updatedCode = await Code.findOneAndUpdate(
            { id: req.params.id },
            { content, language },
            { new: true }
        );
        res.status(200).json(updatedCode);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCode, getCode, updateCode };