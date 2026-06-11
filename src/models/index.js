import Student from './Student.js';
import Mark from './Mark.js';

// Associations
Student.hasMany(Mark, {
  foreignKey: 'student_id',
  as: 'marks',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Mark.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student',
});

export { Student, Mark };
