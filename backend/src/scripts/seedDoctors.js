require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { mongoUri } = require('../config/env');

const DOCTORS_DATA = [
  {
    firstName: 'Sarah', lastName: 'Mitchell', email: 'dr.sarah.mitchell@healthcare.ai',
    specialization: 'Cardiologist', experience: 15, rating: 4.9, hospital: 'Apollo Heart Institute',
    consultationFee: 1500, city: 'Mumbai', latitude: 19.076, longitude: 72.8777, availability: 'available',
    diseasesTreated: ['hypertension', 'chest pain', 'heart disease'],
  },
  {
    firstName: 'James', lastName: 'Chen', email: 'dr.james.chen@healthcare.ai',
    specialization: 'Neurologist', experience: 12, rating: 4.8, hospital: 'City Neuro Center',
    consultationFee: 1800, city: 'Mumbai', latitude: 19.0896, longitude: 72.8656, availability: 'available',
    diseasesTreated: ['headache', 'migraine', 'stroke', 'epilepsy'],
  },
  {
    firstName: 'Emily', lastName: 'Rodriguez', email: 'dr.emily.rodriguez@healthcare.ai',
    specialization: 'Pediatrician', experience: 10, rating: 4.9, hospital: 'Rainbow Children Hospital',
    consultationFee: 1200, city: 'Mumbai', latitude: 19.0544, longitude: 72.8329, availability: 'busy',
    diseasesTreated: ['pediatric fever', 'common cold', 'flu'],
  },
  {
    firstName: 'Michael', lastName: 'Park', email: 'dr.michael.park@healthcare.ai',
    specialization: 'Orthopedic Surgeon', experience: 18, rating: 4.7, hospital: 'Bone & Joint Clinic',
    consultationFee: 2000, city: 'Mumbai', latitude: 19.1136, longitude: 72.8697, availability: 'available',
    diseasesTreated: ['arthritis', 'joint pain', 'back pain'],
  },
  {
    firstName: 'Priya', lastName: 'Sharma', email: 'dr.priya.sharma@healthcare.ai',
    specialization: 'Dermatologist', experience: 8, rating: 4.6, hospital: 'Skin Care Clinic',
    consultationFee: 1000, city: 'Mumbai', latitude: 19.033, longitude: 72.857, availability: 'available',
    diseasesTreated: ['skin rash', 'eczema', 'acne'],
  },
  {
    firstName: 'Rajesh', lastName: 'Kumar', email: 'dr.rajesh.kumar@healthcare.ai',
    specialization: 'General Physician', experience: 20, rating: 4.5, hospital: 'HealthFirst Clinic',
    consultationFee: 800, city: 'Mumbai', latitude: 19.017, longitude: 72.8478, availability: 'available',
    diseasesTreated: ['fever', 'common cold', 'flu', 'headache'],
  },
  {
    firstName: 'Anita', lastName: 'Desai', email: 'dr.anita.desai@healthcare.ai',
    specialization: 'Gynecologist', experience: 14, rating: 4.8, hospital: 'Women Wellness Center',
    consultationFee: 1400, city: 'Mumbai', latitude: 19.099, longitude: 72.826, availability: 'available',
    diseasesTreated: ['pregnancy', 'menstrual disorder'],
  },
  {
    firstName: 'Vikram', lastName: 'Singh', email: 'dr.vikram.singh@healthcare.ai',
    specialization: 'Pulmonologist', experience: 11, rating: 4.7, hospital: 'Lung Care Hospital',
    consultationFee: 1300, city: 'Mumbai', latitude: 19.062, longitude: 72.889, availability: 'available',
    diseasesTreated: ['asthma', 'pneumonia', 'bronchitis', 'flu'],
  },
  {
    firstName: 'Lisa', lastName: 'Thompson', email: 'dr.lisa.thompson@healthcare.ai',
    specialization: 'Endocrinologist', experience: 9, rating: 4.6, hospital: 'Diabetes Care Center',
    consultationFee: 1500, city: 'Mumbai', latitude: 19.045, longitude: 72.812, availability: 'busy',
    diseasesTreated: ['diabetes', 'thyroid', 'obesity'],
  },
  {
    firstName: 'Arjun', lastName: 'Mehta', email: 'dr.arjun.mehta@healthcare.ai',
    specialization: 'Gastroenterologist', experience: 13, rating: 4.8, hospital: 'Digestive Health Clinic',
    consultationFee: 1600, city: 'Mumbai', latitude: 19.082, longitude: 72.841, availability: 'available',
    diseasesTreated: ['gastritis', 'stomach pain'],
  },
  {
    firstName: 'Neha', lastName: 'Gupta', email: 'dr.neha.gupta@healthcare.ai',
    specialization: 'Psychiatrist', experience: 7, rating: 4.5, hospital: 'Mind Wellness Center',
    consultationFee: 1700, city: 'Mumbai', latitude: 19.028, longitude: 72.871, availability: 'available',
    diseasesTreated: ['depression', 'anxiety'],
  },
  {
    firstName: 'David', lastName: 'Wilson', email: 'dr.david.wilson@healthcare.ai',
    specialization: 'Ophthalmologist', experience: 16, rating: 4.9, hospital: 'Vision Eye Hospital',
    consultationFee: 1100, city: 'Mumbai', latitude: 19.105, longitude: 72.854, availability: 'available',
    diseasesTreated: ['eye infection', 'cataract'],
  },
  {
    firstName: 'Sunita', lastName: 'Reddy', email: 'dr.sunita.reddy@healthcare.ai',
    specialization: 'ENT Specialist', experience: 12, rating: 4.6, hospital: 'Ear Nose Throat Clinic',
    consultationFee: 1000, city: 'Mumbai', latitude: 19.071, longitude: 72.818, availability: 'offline',
    diseasesTreated: ['ear infection', 'sinusitis'],
  },
  {
    firstName: 'Robert', lastName: 'Brown', email: 'dr.robert.brown@healthcare.ai',
    specialization: 'Urologist', experience: 15, rating: 4.7, hospital: 'Urology Center',
    consultationFee: 1400, city: 'Mumbai', latitude: 19.038, longitude: 72.895, availability: 'available',
    diseasesTreated: ['kidney stones', 'urinary tract infection'],
  },
  {
    firstName: 'Kavita', lastName: 'Joshi', email: 'dr.kavita.joshi@healthcare.ai',
    specialization: 'Allergist', experience: 6, rating: 4.4, hospital: 'Allergy & Immunology Clinic',
    consultationFee: 900, city: 'Mumbai', latitude: 19.096, longitude: 72.882, availability: 'available',
    diseasesTreated: ['allergy', 'asthma'],
  },
  {
    firstName: 'Thomas', lastName: 'Anderson', email: 'dr.thomas.anderson@healthcare.ai',
    specialization: 'Oncologist', experience: 19, rating: 4.9, hospital: 'Cancer Care Institute',
    consultationFee: 2500, city: 'Mumbai', latitude: 19.052, longitude: 72.835, availability: 'available',
    diseasesTreated: ['cancer'],
  },
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('Doctor@123', 12);
    let created = 0;
    let skipped = 0;

    for (const doc of DOCTORS_DATA) {
      const existingUser = await User.findOne({ email: doc.email });
      if (existingUser) {
        skipped++;
        continue;
      }

      const user = await User.create({
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        password: hashedPassword,
        role: 'doctor',
        phone: `+91${Math.floor(9000000000 + Math.random() * 999999999)}`,
        isActive: true,
      });

      await Doctor.create({
        user: user._id,
        specialization: doc.specialization,
        licenseNumber: `MH-${Math.floor(10000 + Math.random() * 90000)}`,
        experience: doc.experience,
        rating: doc.rating,
        hospital: doc.hospital,
        consultationFee: doc.consultationFee,
        city: doc.city,
        latitude: doc.latitude,
        longitude: doc.longitude,
        availability: doc.availability,
        diseasesTreated: doc.diseasesTreated,
        isVerified: true,
        bio: `Experienced ${doc.specialization} with ${doc.experience} years of practice at ${doc.hospital}.`,
      });

      created++;
    }

    console.log(`Seed complete: ${created} doctors created, ${skipped} skipped (already exist)`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDoctors();
