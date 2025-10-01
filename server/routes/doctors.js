import express from 'express';

const router = express.Router();

function generateDoctors(count = 60) {
  const firstNames = [
    'Aarav', 'Vivaan', 'Sania', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Muhammad',
    'Ananya', 'Diya', 'Aadhya', 'Zara', 'Ira', 'Myra', 'Anika', 'Sara', 'Aarohi', 'Navya'
  ];
  const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Mehta', 'Kapoor', 'Singh', 'Chopra', 'Iyer', 'Reddy', 'Khan',
    'Das', 'Patel', 'Joshi', 'Bose', 'Nair', 'Rao', 'Menon', 'Desai', 'Malhotra', 'Sen'
  ];
  const specialties = [
    'Dermatology', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Gynecology', 'Ophthalmology',
    'Psychiatry', 'General Medicine', 'Dentistry', 'Urology', 'Gastroenterology', 'Endocrinology',
    'Pulmonology', 'Nephrology', 'Rheumatology', 'Radiology', 'Oncology', 'ENT', 'Anesthesiology'
  ];
  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat'];
  const languages = [['English', 'Hindi'], ['English', 'Marathi'], ['English', 'Kannada'], ['English', 'Telugu'], ['English', 'Tamil']];
  const maleFirstNames = [
    'Aarav', 'Vivaan', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Muhammad', 'Aditya'
  ];
  const femaleFirstNames = [
    'Sania', 'Ananya', 'Diya', 'Aadhya', 'Zara', 'Ira', 'Myra', 'Anika', 'Sara', 'Aarohi', 'Navya'
  ];
  const IMAGES = [
    // Male images
    { url: 'https://static.vecteezy.com/system/resources/thumbnails/026/375/249/small_2x/ai-generative-portrait-of-confident-male-doctor-in-white-coat-and-stethoscope-standing-with-arms-crossed-and-looking-at-camera-photo.jpg', gender: 'male' },
    { url: 'https://img.freepik.com/premium-photo/smiling-doctor-with-stethoscope-around-his-neck_182633-515.jpg', gender: 'male' },
    { url: 'https://tse2.mm.bing.net/th/id/OIP.mbfAHBLv2t2cpoYEtuojHgAAAA?pid=ImgDet&w=417&h=626&rs=1&o=7&rm=3', gender: 'male' },
    { url: 'https://static.vecteezy.com/system/resources/thumbnails/041/640/694/small_2x/ai-generated-happy-white-doctor-cut-out-smiling-doctor-man-with-stethoscope-on-transparent-background-png.png', gender: 'male' },
    { url: 'https://static.vecteezy.com/system/resources/thumbnails/046/680/110/small_2x/confident-male-medical-professional-on-isolated-transparent-background-png.png', gender: 'male' },
    { url: 'https://tse3.mm.bing.net/th/id/OIP.ed9BPk56R-ZuVSBARMMXoQHaLQ?rs=1&pid=ImgDetMain&o=7&rm=3', gender: 'male' },
    { url: 'https://img.freepik.com/premium-photo/young-indian-male-doctor_437792-301.jpg?w=2000', gender: 'male' },
    { url: 'https://tse1.mm.bing.net/th/id/OIP.A9gNLb13QgMucic_dUG4hwHaHa?w=626&h=626&rs=1&pid=ImgDetMain&o=7&rm=3', gender: 'male' },
    { url: 'https://tse2.mm.bing.net/th/id/OIP.Dzz8rC6BkTkldm28pMkNTAHaEl?rs=1&pid=ImgDetMain&o=7&rm=3', gender: 'male' },
    { url: 'https://tse4.mm.bing.net/th/id/OIP.lFfmyCy6G8HKVqIKHWwJVAHaE7?w=626&h=417&rs=1&pid=ImgDetMain&o=7&rm=3', gender: 'male' },
    { url: 'https://img.freepik.com/premium-photo/confident-male-medicine-doctor-embracing-innovation-hospital-setting_983420-284473.jpg', gender: 'male' },
    { url: 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0-LTAxL2hpcHBvdW5pY29ybl9hX3Bob3RvX29mX2FfbWlkZGxlX2FnZV9tYWxlX2luZGlhbl9kb2N0b3JfaXNvbGF0ZV84NTE5YzY5MC00ZDE2LTQ4MTUtYTQ5OC1kYjYzZjNhZDkxNzRfMS5qcGc.jpg', gender: 'male' },
    { url: 'https://static.vecteezy.com/system/resources/thumbnails/046/680/172/small_2x/an-pakistani-male-doctor-on-isolated-transparent-background-png.png', gender: 'male' },
    { url: 'https://tse4.mm.bing.net/th/id/OIP.am0rcfeae-7HCjcTMKq07AHaIZ?w=1080&h=1225&rs=1&pid=ImgDetMain&o=7&rm=3', gender: 'male' },
    { url: 'https://static.vecteezy.com/system/resources/previews/046/680/174/original/an-pakistani-male-doctor-on-isolated-transparent-background-png.png', gender: 'male' },
    { url: 'https://static.vecteezy.com/system/resources/previews/046/680/006/original/an-pakistani-male-doctor-on-isolated-transparent-background-png.png', gender: 'male' },
    // Female images
    { url: 'https://static.vecteezy.com/system/resources/previews/044/846/318/non_2x/woman-doctor-standing-and-holding-tablet-on-isolated-transparent-background-free-png.png', gender: 'female' },
    { url: 'https://tse2.mm.bing.net/th/id/OIP.2OslnQ6Ky22F-DzQbqYVKAAAAA?w=360&h=360&rs=1&pid=ImgDetMain&o=7&rm=3', gender: 'female' },
    { url: 'https://static.vecteezy.com/system/resources/thumbnails/052/484/747/small_2x/a-female-smiling-doctor-isolated-on-transparent-background-free-png.png', gender: 'female' },
    { url: 'https://img.freepik.com/premium-photo/indian-female-doctor-portrait-indian-female-doctor_890100-1237.jpg?w=2000', gender: 'female' },
    { url: 'https://img.freepik.com/premium-photo/indian-female-doctor_714173-1873.jpg', gender: 'female' },
    { url: 'https://img.freepik.com/premium-photo/indian-female-doctor_714173-1855.jpg', gender: 'female' },
    { url: 'https://img.freepik.com/premium-photo/indian-female-doctor_714173-1859.jpg', gender: 'female' },
    { url: 'https://i.pinimg.com/originals/7e/91/b7/7e91b721691322422919eec7dc039618.jpg', gender: 'female' },
    { url: 'https://media.istockphoto.com/id/1189191657/photo/indian-young-female-doctor-showing-thumbs-up.jpg?s=612x612&w=0&k=20&c=xdw2finHCAfLKyXMEhRQ-PuJUx2ORhiSymE4DRKpXj0=', gender: 'female' },
    { url: 'https://tse1.mm.bing.net/th/id/OIP.hPQoAxWFmfs_i3YxILJv8gAAAA?w=400&h=600&rs=1&pid=ImgDetMain&o=7&rm=3', gender: 'female' },
    { url: 'https://st2.depositphotos.com/4158817/7634/i/450/depositphotos_76341261-stock-photo-happy-indian-female-doctor.jpg', gender: 'female' },
    { url: 'https://st.depositphotos.com/2702761/3313/i/450/depositphotos_33138301-stock-photo-doctor-with-her-arms-crossed.jpg', gender: 'female' },
    { url: 'https://tse1.mm.bing.net/th/id/OIP.pJENgIL2eXlyObB6wLpvBQHaJw?rs=1&pid=ImgDetMain&o=7&rm=3', gender: 'female' }
  ];

  let maleIdx = 0;
  let femaleIdx = 0;

  const doctors = Array.from({ length: count }).map((_, i) => {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i * 3) % lastNames.length];
    const specialty = specialties[(i * 2) % specialties.length];
    const city = cities[(i * 5) % cities.length];
    const phone = `+91-9${(i % 9) + 1}${(100000000 + i).toString().slice(0, 8)}`; // dummy phone
    const isAvailable = i % 3 !== 0; // ~66% available
    const rating = 3.8 + ((i % 12) * 0.1); // 3.8 - 5.0
    const gender = femaleFirstNames.includes(first) ? 'female' : 'male';
    const imageIdx = gender === 'female' ? (femaleIdx++ % 13) + 16 : (maleIdx++ % 16); // 16 male images, 13 female images

    return {
      id: `DOC-${i + 1}`,
      name: `Dr. ${first} ${last}`,
      specialty,
      experienceYears: 5 + (i % 25),
      rating: Math.min(5, parseFloat(rating.toFixed(1))),
      location: city,
      phone,
      email: `dr.${first.toLowerCase()}.${last.toLowerCase()}@dermatech.example`,
      languages: languages[i % languages.length],
      isAvailable,
      gender,
      imageUrl: IMAGES[imageIdx].url,
      feeINR: 400 + (i % 7) * 100,
      nextAvailable: ['09:00', '10:30', '12:00', '15:00', '17:30'].slice(0, (i % 5) + 1)
    };
  });

  return doctors;
}

const DOCTORS = generateDoctors(60);

router.get('/', (req, res) => {
  try {
    const q = (req.query.q || '').toString().toLowerCase();
    const available = req.query.available?.toString() === 'true';

    let results = DOCTORS;

    if (q) {
      results = results.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    }

    if (available) {
      results = results.filter(d => d.isAvailable);
    }

    res.json({ success: true, count: results.length, doctors: results });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/:id', (req, res) => {
  const doc = DOCTORS.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, error: 'Doctor not found' });
  res.json({ success: true, doctor: doc });
});

export default router;