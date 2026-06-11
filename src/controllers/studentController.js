import { Op } from 'sequelize';
import { Student, Mark } from '../models/index.js';

//  Helpers
const paginate = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 10));
  return { limit: l, offset: (p - 1) * l, page: p };
};

// GET /students 
export const getAllStudents = async (req, res, next) => {
  try {
    const { page, limit, search, gender, is_active } = req.query;
    const { limit: lim, offset, page: pg } = paginate(page, limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name:  { [Op.iLike]: `%${search}%` } },
        { email:      { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (gender) where.gender = gender;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { count, rows } = await Student.findAndCountAll({
      where,
      limit: lim,
      offset,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / lim);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total_records: count,
        total_pages:   totalPages,
        current_page:  pg,
        per_page:      lim,
        has_next_page: pg < totalPages,
        has_prev_page: pg > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

//  GET /students/:id 
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: Mark,
          as: 'marks',
          order: [['exam_date', 'DESC']],
        },
      ],
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const marks = student.marks || [];
    const stats =
      marks.length > 0
        ? {
            total_subjects: marks.length,
            average_score:  parseFloat(
              (marks.reduce((s, m) => s + parseFloat(m.score), 0) / marks.length).toFixed(2)
            ),
            highest_score:  Math.max(...marks.map((m) => parseFloat(m.score))),
            lowest_score:   Math.min(...marks.map((m) => parseFloat(m.score))),
          }
        : { total_subjects: 0, average_score: null, highest_score: null, lowest_score: null };

    res.status(200).json({ success: true, data: { ...student.toJSON(), stats } });
  } catch (err) {
    next(err);
  }
};

// POST /students 
export const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, message: 'Student created successfully', data: student });
  } catch (err) {
    next(err);
  }
};

// PUT /students/:id
export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const allowedFields = ['first_name', 'last_name', 'email', 'date_of_birth',
      'gender', 'phone', 'address', 'enrollment_date', 'is_active'];

    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    await student.update(updates);
    res.status(200).json({ success: true, message: 'Student updated successfully', data: student });
  } catch (err) {
    next(err);
  }
};

// DELETE /students/:id 
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await student.destroy();
    res.status(200).json({ success: true, message: 'Student and associated marks deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /students/:id/marks 
export const getStudentMarks = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, { attributes: ['id', 'first_name', 'last_name',"address"] });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const marks = await Mark.findAll({
      where: { student_id: req.params.id },
      order: [['exam_date', 'DESC']],
    });

    res.status(200).json({ success: true, data: marks, student });
  } catch (err) {
    next(err);
  }
};
