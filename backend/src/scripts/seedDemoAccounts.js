const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');

require('dotenv').config();

const demoAccounts = {
  patient: {
    email: 'demo.patient@healthcare-ai.demo',
    password: 'Demo123456',
    firstName: 'Demo',
    lastName: 'Patient',
    role: 'patient',
    phone: '+1234567890',
    dateOfBirth: new Date('1990-01-01'),
    bloodGroup: 'O+',
  },

  doctor: {
    email: 'demo.doctor@healthcare-ai.demo',
    password: 'Demo123456',
    firstName: 'Demo',
    lastName: 'Doctor',
    role: 'doctor',
    phone: '+1234567891',
    specialization: 'General Physician',
    licenseNumber: 'DEMO-2024-001',
    experience: 10,
    hospital: 'Demo Healthcare Center',
    city: 'New York',
    consultationFee: 50,
    availability: 'available',
    isVerified: true,
    latitude: 40.7128,
    longitude: -74.0060,
    bio: 'Experienced general physician with expertise in primary care and preventive medicine.',
  },

  admin: {
    email: 'demo.admin@healthcare-ai.demo',
    password: 'Demo123456',
    firstName: 'Demo',
    lastName: 'Admin',
    role: 'admin',
    phone: '+1234567892',
  },
};

const seedDemoAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // =========================
    // Demo Patient
    // =========================
    let demoPatient = await User.findOne({
      email: demoAccounts.patient.email,
    });

    if (!demoPatient) {
      demoPatient = await User.create({
        email: demoAccounts.patient.email,
        password: demoAccounts.patient.password,
        firstName: demoAccounts.patient.firstName,
        lastName: demoAccounts.patient.lastName,
        role: demoAccounts.patient.role,
        phone: demoAccounts.patient.phone,
      });

      await Patient.create({
        user: demoPatient._id,
        dateOfBirth: demoAccounts.patient.dateOfBirth,
        bloodGroup: demoAccounts.patient.bloodGroup,
      });

      console.log('✅ Demo Patient account created');
    } else {
      // User model pre-save middleware will hash this password once
      demoPatient.password = demoAccounts.patient.password;
      await demoPatient.save();

      console.log('✅ Demo Patient password reset');
    }

    // =========================
    // Demo Doctor
    // =========================
    let demoDoctor = await User.findOne({
      email: demoAccounts.doctor.email,
    });

    if (!demoDoctor) {
      demoDoctor = await User.create({
        email: demoAccounts.doctor.email,
        password: demoAccounts.doctor.password,
        firstName: demoAccounts.doctor.firstName,
        lastName: demoAccounts.doctor.lastName,
        role: demoAccounts.doctor.role,
        phone: demoAccounts.doctor.phone,
      });

      await Doctor.create({
        user: demoDoctor._id,
        specialization: demoAccounts.doctor.specialization,
        licenseNumber: demoAccounts.doctor.licenseNumber,
        experience: demoAccounts.doctor.experience,
        hospital: demoAccounts.doctor.hospital,
        city: demoAccounts.doctor.city,
        consultationFee: demoAccounts.doctor.consultationFee,
        availability: demoAccounts.doctor.availability,
        isVerified: demoAccounts.doctor.isVerified,
        latitude: demoAccounts.doctor.latitude,
        longitude: demoAccounts.doctor.longitude,
        bio: demoAccounts.doctor.bio,
      });

      console.log('✅ Demo Doctor account created');
    } else {
      // User model pre-save middleware will hash this password once
      demoDoctor.password = demoAccounts.doctor.password;
      await demoDoctor.save();

      console.log('✅ Demo Doctor password reset');
    }

    // =========================
    // Demo Admin
    // =========================
    let demoAdmin = await User.findOne({
      email: demoAccounts.admin.email,
    });

    if (!demoAdmin) {
      demoAdmin = await User.create({
        email: demoAccounts.admin.email,
        password: demoAccounts.admin.password,
        firstName: demoAccounts.admin.firstName,
        lastName: demoAccounts.admin.lastName,
        role: demoAccounts.admin.role,
        phone: demoAccounts.admin.phone,
      });

      await Admin.create({
        user: demoAdmin._id,
      });

      console.log('✅ Demo Admin account created');
    } else {
      // User model pre-save middleware will hash this password once
      demoAdmin.password = demoAccounts.admin.password;
      await demoAdmin.save();

      console.log('✅ Demo Admin password reset');
    }

    console.log('\n🎉 Demo accounts seeded successfully!');

    console.log('\nDemo Patient Credentials:');
    console.log(`Email: ${demoAccounts.patient.email}`);
    console.log(`Password: ${demoAccounts.patient.password}`);

    console.log('\nDemo Doctor Credentials:');
    console.log(`Email: ${demoAccounts.doctor.email}`);
    console.log(`Password: ${demoAccounts.doctor.password}`);

    console.log('\nDemo Admin Credentials:');
    console.log(`Email: ${demoAccounts.admin.email}`);
    console.log(`Password: ${demoAccounts.admin.password}`);

    console.log('\n⚠️ Please change these passwords in production!');
  } catch (error) {
    console.error('❌ Error seeding demo accounts:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

seedDemoAccounts();