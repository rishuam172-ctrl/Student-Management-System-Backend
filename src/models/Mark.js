import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Mark = sequelize.define(
  'Mark',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id',
      },
    },
    subject: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Subject cannot be empty' },
        len: { args: [2, 150], msg: 'Subject must be between 2 and 150 characters' },
      },
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Score cannot be negative' },
        max: { args: [100], msg: 'Score cannot exceed 100' },
        isDecimal: { msg: 'Score must be a number' },
      },
    },
    max_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100,
      validate: {
        min: { args: [1], msg: 'Max score must be at least 1' },
      },
    },
    exam_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Must be a valid date' },
      },
    },
    grade: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'marks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeSave: (mark) => {
        const pct = (parseFloat(mark.score) / parseFloat(mark.max_score)) * 100;
        if (pct >= 90) mark.grade = 'A+';
        else if (pct >= 80) mark.grade = 'A';
        else if (pct >= 70) mark.grade = 'B';
        else if (pct >= 60) mark.grade = 'C';
        else if (pct >= 50) mark.grade = 'D';
        else mark.grade = 'F';
      },
    },
  }
);

export default Mark;
