import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { getDoctors, bookAppointment } from '@/lib/api';
import { Loader2, Search, Phone, Mail, MapPin, Stethoscope, Calendar, Clock } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  location: string;
  phone: string;
  email: string;
  languages: string[];
  isAvailable: boolean;
  imageUrl: string;
  feeINR: number;
  nextAvailable?: string[];
}

const Appointments = () => {
  const [q, setQ] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Booking dialog state
  const [open, setOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getDoctors({ q, available: availableOnly });
      setDoctors(res.doctors || []);
    } catch (e: any) {
      toast({ title: 'Failed to load doctors', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const startBooking = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setOpen(true);
  };

  const resetForm = () => {
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setDate('');
    setTime('');
    setNotes('');
  };

  const submitBooking = async () => {
    if (!selectedDoctor) return;
    if (!patientName || !patientEmail || !patientPhone || !date || !time) {
      toast({ title: 'Missing details', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await bookAppointment({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        patientName,
        patientEmail,
        patientPhone,
        appointmentDate: date,
        appointmentTime: time,
        notes,
      });
      toast({ title: 'Appointment booked', description: `Your appointment with ${selectedDoctor.name} is requested.` });
      setOpen(false);
      resetForm();
    } catch (e: any) {
      toast({ title: 'Booking failed', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const countAvailable = useMemo(() => doctors.filter(d => d.isAvailable).length, [doctors]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Doctor Appointments</h1>
        <p className="text-muted-foreground">Find a relevant doctor and book an appointment</p>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by doctor, specialty, or location"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="availableOnly" checked={availableOnly} onCheckedChange={(v) => setAvailableOnly(!!v)} />
          <Label htmlFor="availableOnly">Available only ({countAvailable})</Label>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Searching...</>) : 'Search'}
        </Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin"/> Loading doctors...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                <img src={doc.imageUrl} alt={doc.name} className="w-20 h-20 rounded-md object-cover"/>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{doc.name}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded ${doc.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{doc.isAvailable ? 'Available' : 'Offline'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Stethoscope className="w-4 h-4"/> {doc.specialty} • {doc.experienceYears} yrs exp
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4"/> {doc.location}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4"/> {doc.phone}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4"/> {doc.email}
                  </div>
                  {doc.nextAvailable && doc.nextAvailable.length > 0 && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4"/> Next: {doc.nextAvailable.slice(0,3).join(', ')}
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">Fee: ₹{doc.feeINR}</div>
                    <Button size="sm" disabled={!doc.isAvailable} onClick={() => startBooking(doc)}>
                      <Calendar className="w-4 h-4 mr-2"/> Book
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment {selectedDoctor ? `with ${selectedDoctor.name}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Your full name"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientEmail">Email</Label>
              <Input id="patientEmail" type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="you@example.com"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientPhone">Phone</Label>
              <Input id="patientPhone" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="+91-XXXXXXXXXX"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional details" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitBooking} disabled={submitting}>
              {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Booking...</>) : 'Book Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
