const express = require('express');
const { getHome, createCode, getCode, updateCode } = require('../controllers/codeController');

const router = express.Router();

// Define routes
router.get('/', getHome)
router.post('/create', createCode);
router.get('/:id', getCode);
router.put('/:id', updateCode);

module.exports = router; // Export the router