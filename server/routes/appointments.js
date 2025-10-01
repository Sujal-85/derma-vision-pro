import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Create a new appointment
router.post('/', async (req, res) => {
  try {
    const {
      doctorId,
      doctorName,
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      appointmentTime,
      notes
    } = req.body || {};

    if (!doctorId || !doctorName || !patientName || !patientEmail || !patientPhone || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const appt = await Appointment.create({
      doctorId,
      doctorName,
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      appointmentTime,
      notes: notes || '',
    });

    res.status(201).json({ success: true, appointment: appt });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get appointments (optionally filtered)
router.get('/', async (req, res) => {
  try {
    const { patientEmail, doctorId } = req.query;

    const filter = {};
    if (patientEmail) filter.patientEmail = patientEmail.toString();
    if (doctorId) filter.doctorId = doctorId.toString();

    const appts = await Appointment.find(filter).sort({ appointmentDate: 1, createdAt: -1 });
    res.json({ success: true, count: appts.length, appointments: appts });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
