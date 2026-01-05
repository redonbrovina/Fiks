const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const registerValidation = [
    body('emri').notEmpty().withMessage('Emri është i detyrueshëm'),
    body('email').isEmail().withMessage('Email i pavlefshëm'),
    body('fjalekalimi').isLength({ min: 6 }).withMessage('Fjalëkalimi duhet të ketë të paktën 6 karaktere')
];

const loginValidation = [
    body('email').isEmail().withMessage('Email i pavlefshëm'),
    body('fjalekalimi').notEmpty().withMessage('Fjalëkalimi është i detyrueshëm')
];

// Routes
router.post('/register', registerValidation, validate, AuthController.register);
router.post('/login', loginValidation, validate, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

module.exports = router;
