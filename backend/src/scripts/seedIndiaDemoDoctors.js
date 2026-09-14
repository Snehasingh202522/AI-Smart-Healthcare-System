const mongoose = require("mongoose");
const User = require("../src/models/User");
const Doctor = require("../src/models/Doctor");

require("dotenv").config({
  path: require("path").join(__dirname, "../.env"),
});

const cities = [
  {
    city: "Delhi",
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    city: "Noida",
    latitude: 28.5355,
    longitude: 77.391,
  },
  {
    city: "Gurugram",
    latitude: 28.4595,
    longitude: 77.0266,
  },
  {
    city: "Ghaziabad",
    latitude: 28.6692,
    longitude: 77.4538,
  },
  {
    city: "Faridabad",
    latitude: 28.4089,
    longitude: 77.3178,
  },
  {
    city: "Meerut",
    latitude: 28.9845,
    longitude: 77.7064,
  },
  {
    city: "Agra",
    latitude: 27.1767,
    longitude: 78.0081,
  },
  {
    city: "Lucknow",
    latitude: 26.8467,
    longitude: 80.9462,
  },
  {
    city: "Kanpur",
    latitude: 26.4499,
    longitude: 80.3319,
  },
  {
    city: "Varanasi",
    latitude: 25.3176,
    longitude: 82.9739,
  },
  {
    city: "Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
  },
  {
    city: "Chandigarh",
    latitude: 30.7333,
    longitude: 76.7794,
  },
  {
    city: "Dehradun",
    latitude: 30.3165,
    longitude: 78.0322,
  },
  {
    city: "Ludhiana",
    latitude: 30.901,
    longitude: 75.8573,
  },
  {
    city: "Amritsar",
    latitude: 31.634,
    longitude: 74.8723,
  },
  {
    city: "Mumbai",
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    city: "Pune",
    latitude: 18.5204,
    longitude: 73.8567,
  },
  {
    city: "Nashik",
    latitude: 19.9975,
    longitude: 73.7898,
  },
  {
    city: "Nagpur",
    latitude: 21.1458,
    longitude: 79.0882,
  },
  {
    city: "Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714,
  },
  {
    city: "Surat",
    latitude: 21.1702,
    longitude: 72.8311,
  },
  {
    city: "Vadodara",
    latitude: 22.3072,
    longitude: 73.1812,
  },
  {
    city: "Rajkot",
    latitude: 22.3039,
    longitude: 70.8022,
  },
  {
    city: "Bhopal",
    latitude: 23.2599,
    longitude: 77.4126,
  },
  {
    city: "Indore",
    latitude: 22.7196,
    longitude: 75.8577,
  },
  {
    city: "Patna",
    latitude: 25.5941,
    longitude: 85.1376,
  },
  {
    city: "Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    city: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    city: "Hyderabad",
    latitude: 17.385,
    longitude: 78.4867,
  },
  {
    city: "Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    city: "Kochi",
    latitude: 9.9312,
    longitude: 76.2673,
  },
  {
    city: "Bhubaneswar",
    latitude: 20.2961,
    longitude: 85.8245,
  },
  {
    city: "Guwahati",
    latitude: 26.1445,
    longitude: 91.7362,
  },
  {
    city: "Ranchi",
    latitude: 23.3441,
    longitude: 85.3096,
  },
  {
    city: "Raipur",
    latitude: 21.2514,
    longitude: 81.6296,
  },
  {
    city: "Coimbatore",
    latitude: 11.0168,
    longitude: 76.9558,
  },
  {
    city: "Mysuru",
    latitude: 12.2958,
    longitude: 76.6394,
  },
  {
    city: "Visakhapatnam",
    latitude: 17.6868,
    longitude: 83.2185,
  },
  {
    city: "Thiruvananthapuram",
    latitude: 8.5241,
    longitude: 76.9366,
  },
  {
    city: "Goa",
    latitude: 15.4909,
    longitude: 73.8278,
  },
];

const specialties = [
  "General Practitioner",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Gynecologist",
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

const getOpeningHours = () => ({
  monday: {
    open: "00:00",
    close: "00:00",
  },
  tuesday: {
    open: "00:00",
    close: "00:00",
  },
  wednesday: {
    open: "00:00",
    close: "00:00",
  },
  thursday: {
    open: "00:00",
    close: "00:00",
  },
  friday: {
    open: "00:00",
    close: "00:00",
  },
  saturday: {
    open: "00:00",
    close: "00:00",
  },
  sunday: {
    open: "00:00",
    close: "00:00",
  },
});

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    let created = 0;
    let updated = 0;

    for (const cityData of cities) {
      for (let index = 0; index < specialties.length; index++) {
        const specialization = specialties[index];

        const email =
          `demo.${slugify(specialization)}.${slugify(
            cityData.city
          )}@healthcare-ai.demo`;

        const firstName = "Demo";
        const lastName = `${specialization.split(" ")[0]} ${
          cityData.city
        }`;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            firstName,
            lastName,
            email,
            password: "Demo123456",
            role: "doctor",
            phone: "9999999999",
            isActive: true,
          });

          created++;
        }

        const existingDoctor = await Doctor.findOne({
          user: user._id,
        });

        const doctorData = {
          user: user._id,

          specialization,

          licenseNumber: `DEMO-${cityData.city
            .replace(/\s/g, "")
            .toUpperCase()}-${index + 1}`,

          experience: 5 + index,

          rating: {
            average: 4.5,
            totalReviews: 100 + index * 25,
          },

          hospital: `Smart Healthcare Center - ${cityData.city}`,

          consultationFee: 500 + index * 100,

          city: cityData.city,

          location: {
            type: "Point",
            coordinates: [
              cityData.longitude,
              cityData.latitude,
            ],
            address: `${cityData.city}, India`,
            pincode: "",
          },

          latitude: cityData.latitude,

          longitude: cityData.longitude,

          availability: "available",

          bio: `Experienced ${specialization} available for online and in-person consultation.`,

          isVerified: true,

          diseasesTreated: [
            "Common Illnesses",
            "Preventive Care",
            "General Health Conditions",
          ],

          openingHours: getOpeningHours(),

          photo: "",
        };

        if (existingDoctor) {
          await Doctor.findByIdAndUpdate(
            existingDoctor._id,
            doctorData,
            {
              new: true,
              runValidators: true,
            }
          );

          updated++;
        } else {
          await Doctor.create(doctorData);
          created++;
        }
      }
    }

    console.log("----------------------------------");
    console.log("India demo doctors seeded successfully!");
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Cities: ${cities.length}`);
    console.log(
      `Specialties per city: ${specialties.length}`
    );
    console.log(
      `Total doctor profiles: ${
        cities.length * specialties.length
      }`
    );
    console.log("----------------------------------");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDoctors();