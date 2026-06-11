import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';


const errorHandler = (err, req, res, next) => {
  // Sequelize validation error (model-level)
  if (err instanceof ValidationError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Unique constraint (e.g - duplicate email)
  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
    });
  }

  // FK constraint (e.g - marks for non-existent student)
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist',
    });
  }

  // Express-validator errors 
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Request validation failed',
      errors: err.errors,
    });
  }

  // Generic server error
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

export default errorHandler;
