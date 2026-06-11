import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "First name cannot be empty" },
        len: {
          args: [2, 100],
          msg: "First name must be between 2 and 100 characters",
        },
      },
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Last name cannot be empty" },
        len: {
          args: [2, 100],
          msg: "Last name must be between 2 and 100 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: "Email address already in use" },
      validate: {
        isEmail: { msg: "Must be a valid email address" },
        notEmpty: { msg: "Email cannot be empty" },
      },
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: { msg: "Must be a valid date" },
        isBefore: {
          args: new Date().toISOString().split("T")[0],
          msg: "Date of birth must be in the past",
        },
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["Male", "Female", "Other"]],
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[+\d\s\-()]{7,20}$/,
          msg: "Must be a valid phone number",
        },
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    enrollment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "students",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Student;
