import { body, param, query, validationResult } from 'express-validator';

// ------------- Reusable helper -----------------------
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Request validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ------------- Student validators ----------------
const studentCreateRules = [
  body('first_name').trim().notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 100 }).withMessage('First name must be 2-100 characters'),
  body('last_name').trim().notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be 2-100 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('date_of_birth').optional({ nullable: true })
    .isDate().withMessage('Must be a valid date (YYYY-MM-DD)')
    .custom((v) => new Date(v) < new Date()).withMessage('Date of birth must be in the past'),
  body('gender').optional({ nullable: true })
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('phone').optional({ nullable: true })
    .matches(/^[+\d\s\-()]{7,20}$/).withMessage('Must be a valid phone number'),
  body('enrollment_date').optional()
    .isDate().withMessage('Must be a valid enrollment date'),
];

const studentUpdateRules = [
  body('first_name').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('First name must be 2-100 characters'),
  body('last_name').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be 2-100 characters'),
  body('email').optional().trim()
    .isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('date_of_birth').optional({ nullable: true })
    .isDate().withMessage('Must be a valid date (YYYY-MM-DD)')
    .custom((v) => new Date(v) < new Date()).withMessage('Date of birth must be in the past'),
  body('gender').optional({ nullable: true })
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('phone').optional({ nullable: true })
    .matches(/^[+\d\s\-()]{7,20}$/).withMessage('Must be a valid phone number'),
  body('is_active').optional()
    .isBoolean().withMessage('is_active must be a boolean'),
];

// ------------- Mark validators ----------------
const markCreateRules = [
  body('subject').trim().notEmpty().withMessage('Subject is required')
    .isLength({ min: 2, max: 150 }).withMessage('Subject must be 2-150 characters'),
  body('score').notEmpty().withMessage('Score is required')
    .isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('max_score').optional()
    .isFloat({ min: 1 }).withMessage('Max score must be at least 1'),
  body('exam_date').notEmpty().withMessage('Exam date is required')
    .isDate().withMessage('Must be a valid date (YYYY-MM-DD)')
    .custom((v) => new Date(v) <= new Date()).withMessage('Exam date cannot be in the future'),
  body('remarks').optional({ nullable: true }).isString(),
];

// ------------- Pagination validator ----------------
const paginationRules = [
  query('page').optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('gender').optional()
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender filter'),
  query('is_active').optional()
    .isIn(['true', 'false']).withMessage('is_active must be true or false'),
];

// ------------- ID param validator ----------------
const idParamRule = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
];

export {
  validate,
  studentCreateRules,
  studentUpdateRules,
  markCreateRules,
  paginationRules,
  idParamRule,
};
