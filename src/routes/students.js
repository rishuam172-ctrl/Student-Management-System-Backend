import express from "express";
import * as studentController from "../controllers/studentController.js";
import * as marksController from "../controllers/marksController.js";
import {
  validate,
  studentCreateRules,
  studentUpdateRules,
  markCreateRules,
  paginationRules,
  idParamRule,
} from "../middleware/validators.js";

const router = express.Router();

// Student
// GET  /students?page=1&limit=10&search=&gender=&is_active=
router.get("/", paginationRules, validate, studentController.getAllStudents);
router.get("/:id", idParamRule, validate, studentController.getStudentById);
router.post("/", studentCreateRules, validate, studentController.createStudent);
router.put(
  "/:id",
  [...idParamRule, ...studentUpdateRules],
  validate,
  studentController.updateStudent,
);
router.delete("/:id", idParamRule, validate, studentController.deleteStudent);

// Marks sub-resource

router.get(
  "/:id/marks",
  idParamRule,
  validate,
  studentController.getStudentMarks,
);
router.post(
  "/:id/marks",
  [...idParamRule, ...markCreateRules],
  validate,
  marksController.addMark,
);
router.delete(
  "/:id/marks/:markId",
  idParamRule,
  validate,
  marksController.deleteMark,
);

export default router;
