const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

require("dotenv").config();

const demoDoctors = [
  {
    email: "demo.doctor@healthcare-ai.demo",
    password: "Demo123456",
    firstName: "Demo",
    lastName: "Doctor",
    phone: "+1234567891",
    specialization: "General Practitioner / Primary Care Physician",
    licenseNumber: "DEMO-MEERUT-001",
    experience: 10,
    hospital: "Demo Healthcare Center",
    city: "Meerut",
    consultationFee: 500,
    availability: "available",
    latitude: 28.9845,
    longitude: 77.7064,
    bio: "Demo registered doctor for testing the healthcare platform.",
    diseasesTreated: [
      "Fever",
      "Cold",
      "Cough",
      "General Health",
      "Primary Care",
    ],
  },

  {
    email: "demo.doctor2@healthcare-ai.demo",
    password: "Demo123456",
    firstName: "Demo",
    lastName: "Doctor Two",
    phone: "+1234567892",
    specialization: "General Practitioner / Primary Care Physician",
    licenseNumber: "DEMO-MEERUT-002",
    experience: 7,
    hospital: "Smart Healthcare Center",
    city: "Meerut",
    consultationFee: 400,
    availability: "available",
    latitude: 28.9900,
    longitude: 77.7000,
    bio: "Demo primary care physician for application testing.",
    diseasesTreated: [
      "Fever",
      "Cough",
      "Flu",
      "General Health",
    ],
  },

  {
    email: "demo.doctor3@healthcare-ai.demo",
    password: "Demo123456",
    firstName: "Demo",
    lastName: "Doctor Three",
    phone: "+1234567893",
    specialization: "General Practitioner / Primary Care Physician",
    licenseNumber: "DEMO-MEERUT-003",
    experience: 5,
    hospital: "AI Smart Health Clinic",
    city: "Meerut",
    consultationFee: 350,
    availability: "available",
    latitude: 28.9750,
    longitude: 77.7100,
    bio: "Demo doctor profile for testing appointments and recommendations.",
    diseasesTreated: [
      "Fever",
      "Cold",
      "Headache",
      "Primary Care",
    ],
  },
];

const registerDemoDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    for (const doctorData of demoDoctors) {
      // =====================================================
      // FIND OR CREATE USER
      // =====================================================

      let user = await User.findOne({
        email: doctorData.email,
      }).select("+password");

      if (!user) {
        user = new User({
          email: doctorData.email,
          password: doctorData.password,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          role: "doctor",
          phone: doctorData.phone,
          isActive: true,
        });

        await user.save();

        console.log(
          `✅ Created user: ${doctorData.email}`
        );
      } else {
        // Make sure existing demo account is a doctor
        user.firstName = doctorData.firstName;
        user.lastName = doctorData.lastName;
        user.role = "doctor";
        user.phone = doctorData.phone;
        user.isActive = true;

        await user.save();

        console.log(
          `🔄 Updated user: ${doctorData.email}`
        );
      }

      // =====================================================
      // FIND OR CREATE DOCTOR PROFILE
      // =====================================================

      let doctor = await Doctor.findOne({
        user: user._id,
      });

      if (!doctor) {
        doctor = new Doctor({
          user: user._id,
        });
      }

      doctor.specialization =
        doctorData.specialization;

      doctor.licenseNumber =
        doctorData.licenseNumber;

      doctor.experience =
        doctorData.experience;

      doctor.hospital =
        doctorData.hospital;

      doctor.city =
        doctorData.city;

      doctor.consultationFee =
        doctorData.consultationFee;

      doctor.availability =
        doctorData.availability;

      doctor.isVerified = true;

      doctor.latitude =
        doctorData.latitude;

      doctor.longitude =
        doctorData.longitude;

      doctor.location = {
        type: "Point",
        coordinates: [
          doctorData.longitude,
          doctorData.latitude,
        ],
        address: doctorData.hospital,
        pincode: "250001",
      };

      doctor.bio =
        doctorData.bio;

      doctor.diseasesTreated =
        doctorData.diseasesTreated;

      doctor.openingHours = {
        monday: {
          open: "09:00",
          close: "17:00",
        },
        tuesday: {
          open: "09:00",
          close: "17:00",
        },
        wednesday: {
          open: "09:00",
          close: "17:00",
        },
        thursday: {
          open: "09:00",
          close: "17:00",
        },
        friday: {
          open: "09:00",
          close: "17:00",
        },
        saturday: {
          open: "10:00",
          close: "14:00",
        },
        sunday: {},
      };

      await doctor.save();

      console.log(
        `✅ Registered & verified: ${doctorData.firstName} ${doctorData.lastName}`
      );
    }

    console.log("\n======================================");
    console.log("🎉 DEMO DOCTORS REGISTERED SUCCESSFULLY");
    console.log("======================================");

    console.log("\nDoctor 1:");
    console.log("Email: demo.doctor@healthcare-ai.demo");
    console.log("Password: Demo123456");

    console.log("\nDoctor 2:");
    console.log("Email: demo.doctor2@healthcare-ai.demo");
    console.log("Password: Demo123456");

    console.log("\nDoctor 3:");
    console.log("Email: demo.doctor3@healthcare-ai.demo");
    console.log("Password: Demo123456");

    console.log("\nAll doctors:");
    console.log("City: Meerut");
    console.log(
      "Specialization: General Practitioner / Primary Care Physician"
    );
    console.log("Verified: true");
    console.log("Booking: Available");
  } catch (error) {
    console.error(
      "❌ Error registering demo doctors:",
      error
    );
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

registerDemoDoctors();