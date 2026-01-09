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
    body('fjalekalimi').isLength({ min: 6 }).withMessage('Fjalëkalimi duhet të ketë të paktën 6 karaktere'),
    body('adresa').notEmpty().withMessage('Adresa është e detyrueshme'),
    body('qyteti_id').notEmpty().isInt().withMessage('Qyteti është i detyrueshëm'),
    // Service validation - required if isProfessional is true
    body('service.titulli').if(body('isProfessional').equals(true)).notEmpty().withMessage('Titulli i shërbimit është i detyrueshëm'),
    body('service.cmimi').if(body('isProfessional').equals(true)).isFloat({ min: 0 }).withMessage('Çmimi duhet të jetë numër pozitiv'),
    body('service.kategoria_id').if(body('isProfessional').equals(true)).isInt().withMessage('Kategoria është e detyrueshme')
];

const loginValidation = [
    body('email').isEmail().withMessage('Email i pavlefshëm'),
    body('fjalekalimi').notEmpty().withMessage('Fjalëkalimi është i detyrueshëm')
];

// Routes
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user or professional
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emri, email, fjalekalimi, adresa, qyteti_id]
 *             properties:
 *               emri:
 *                 type: string
 *               email:
 *                 type: string
 *               fjalekalimi:
 *                 type: string
 *               adresa:
 *                 type: string
 *               qyteti_id:
 *                 type: integer
 *               isProfessional:
 *                 type: boolean
 *               bio:
 *                 type: string
 *               service:
 *                 type: object
 *                 properties:
 *                   titulli:
 *                     type: string
 *                   cmimi:
 *                     type: number
 *                   kategoria_id:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */
router.post('/register', registerValidation, validate, AuthController.register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, fjalekalimi]
 *             properties:
 *               email:
 *                 type: string
 *               fjalekalimi:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, validate, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

// Password Reset Routes
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code sent
 */
router.post('/forgot-password',
    [body('email').isEmail().withMessage('Email i pavlefshëm')],
    validate,
    AuthController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, fjalekalimi]
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               fjalekalimi:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password',
    [
        body('email').isEmail().withMessage('Email i pavlefshëm'),
        body('code').notEmpty().withMessage('Kodi mungon').isLength({ min: 6, max: 6 }).withMessage('Kodi duhet të jetë 6 shifror'),
        body('fjalekalimi').isLength({ min: 6 }).withMessage('Fjalëkalimi duhet të ketë të paktën 6 karaktere')
    ],
    validate,
    AuthController.resetPassword
);

module.exports = router;
