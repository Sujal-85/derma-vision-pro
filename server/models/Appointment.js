import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;
