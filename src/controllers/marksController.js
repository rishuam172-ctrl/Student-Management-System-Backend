
import { Student, Mark } from '../models/index.js';



// POST /students/:id/marks 
export const addMark = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const mark = await Mark.create({ ...req.body, student_id: req.params.id });
    res.status(201).json({ success: true, message: 'Mark added successfully', data: mark });
  } catch (err) {
    next(err);
  }
};

// DELETE /students/:id/marks/:markId 
export const deleteMark = async (req, res, next) => {
  try {
    const mark = await Mark.findOne({
      where: { id: req.params.markId, student_id: req.params.id },
    });
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Mark not found' });
    }

    await mark.destroy();
    res.status(200).json({ success: true, message: 'Mark deleted successfully' });
  } catch (err) {
    next(err);
  }
};


