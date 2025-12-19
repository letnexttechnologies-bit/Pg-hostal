// seedPGs.js - Run this once to populate your database with PG data
const mongoose = require("mongoose");
require("dotenv").config();

// ✅ Import the existing PG model
const PG = require("./models/PG");

// Your PG Data
const pgData = [
  {
    name: "Sri Lakshmi PG",
    location: "Near Bus Stand, Gobichettipalayam",
    address: "Near Bus Stand, Gobichettipalayam",
    price: 5000,
    gender: "Male",
    latitude: 11.4544,
    longitude: 77.4381,
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["WiFi", "Food", "Parking"],
    description: "Comfortable PG near bus stand with good connectivity. Perfect for working professionals and students.",
    phone: "+91 9876543210",
    email: "srilakshmi@pgmail.com",
    ownerName: "Lakshmi",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
    ]
  },
  {
    name: "Green Valley Hostel",
    location: "Sathy Road, Gobichettipalayam",
    address: "Sathy Road, Gobichettipalayam",
    price: 6000,
    gender: "Female",
    latitude: 11.4612,
    longitude: 77.4298,
    stayType: "Student Living",
    sharingType: "3 Sharing",
    amenities: ["Food", "Power Backup", "Fridge"],
    description: "Secure ladies hostel with 24/7 security. Near colleges and market area.",
    phone: "+91 9876543211",
    email: "greenvalley@pgmail.com",
    ownerName: "Green Valley",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
    ]
  },
  {
    name: "Comfort Stay",
    location: "Perundurai Road, Gobichettipalayam",
    address: "Perundurai Road, Gobichettipalayam",
    price: 7000,
    gender: "Co-living",
    latitude: 11.4489,
    longitude: 77.4456,
    stayType: "Co-living",
    sharingType: "Private",
    amenities: ["AC", "WiFi", "Food", "Parking", "Power Backup"],
    description: "Premium private rooms with AC. Ideal for professionals working in nearby industries.",
    phone: "+91 9876543212",
    email: "comfort@pgmail.com",
    ownerName: "Comfort",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
    ]
  },
  {
    name: "Royal Residency",
    location: "Anthiyur Road, Gobichettipalayam",
    address: "Anthiyur Road, Gobichettipalayam",
    price: 8000,
    gender: "Female",
    latitude: 11.4523,
    longitude: 77.4289,
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["AC", "WiFi", "Food", "Parking", "Power Backup", "Fridge"],
    description: "Luxurious ladies PG with premium amenities and excellent safety measures.",
    phone: "+91 9876543214",
    email: "royal@pgmail.com",
    ownerName: "Royal",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
    ]
  },
  {
    name: "Town Center PG",
    location: "Main Bazaar, Gobichettipalayam",
    address: "Main Bazaar, Gobichettipalayam",
    price: 5500,
    gender: "Male",
    latitude: 11.4556,
    longitude: 77.4367,
    stayType: "Co-living",
    sharingType: "3 Sharing",
    amenities: ["WiFi", "Food", "Parking"],
    description: "Right in the heart of town. Easy access to shops, banks, and transport.",
    phone: "+91 9876543215",
    email: "towncenter@pgmail.com",
    ownerName: "Town Center",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
    ]
  },
  {
    name: "Peacock Residency",
    location: "Bhavanisagar Road, Gobichettipalayam",
    address: "Bhavanisagar Road, Gobichettipalayam",
    price: 6500,
    gender: "Co-living",
    latitude: 11.4478,
    longitude: 77.4501,
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["WiFi", "Food", "Fridge", "Power Backup"],
    description: "Modern co-living space with peaceful surroundings. Good for IT and textile professionals.",
    phone: "+91 9876543216",
    email: "peacock@pgmail.com",
    ownerName: "Peacock",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
    ]
  },
  {
    name: "Student Hub",
    location: "Near Government Arts College, Gobichettipalayam",
    address: "Near Government Arts College, Gobichettipalayam",
    price: 4500,
    gender: "Male",
    latitude: 11.4598,
    longitude: 77.4445,
    stayType: "Student Living",
    sharingType: "3 Sharing",
    amenities: ["WiFi", "Food", "Power Backup"],
    description: "Budget-friendly PG near colleges with study facilities and library.",
    phone: "+91 9876543217",
    email: "studenthub@pgmail.com",
    ownerName: "Student Hub",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
    ]
  },
  {
    name: "Kaveri Ladies Hostel",
    location: "Kodiveri Dam Road, Gobichettipalayam",
    address: "Kodiveri Dam Road, Gobichettipalayam",
    price: 5800,
    gender: "Female",
    latitude: 11.4534,
    longitude: 77.4423,
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["WiFi", "Food", "Parking", "Fridge", "Power Backup"],
    description: "Safe and secure ladies hostel with home-like environment. Near scenic locations.",
    phone: "+91 9876543218",
    email: "kaveri@pgmail.com",
    ownerName: "Kaveri",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
    ]
  },
  {
    name: "Textile Park Residency",
    location: "Near Textile Mills, Gobichettipalayam",
    address: "Near Textile Mills, Gobichettipalayam",
    price: 6200,
    gender: "Male",
    latitude: 11.4512,
    longitude: 77.4334,
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["WiFi", "Food", "Parking", "Power Backup"],
    description: "Perfect for textile industry professionals. Close to major mills and factories.",
    phone: "+91 9876543219",
    email: "textilepark@pgmail.com",
    ownerName: "Textile Park",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
    ]
  },
  {
    name: "Hillview Stay",
    location: "Velliangiri Hills View, Gobichettipalayam",
    address: "Velliangiri Hills View, Gobichettipalayam",
    price: 7500,
    gender: "Co-living",
    latitude: 11.4467,
    longitude: 77.4256,
    stayType: "Co-living",
    sharingType: "Private",
    amenities: ["AC", "WiFi", "Food", "Parking", "Fridge"],
    description: "Peaceful location with hill views. Private rooms with modern amenities.",
    phone: "+91 9876543220",
    email: "hillview@pgmail.com",
    ownerName: "Hillview",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
    ]
  },
  {
    name: "Economy Stay",
    location: "Hospital Road, Gobichettipalayam",
    address: "Hospital Road, Gobichettipalayam",
    price: 3800,
    gender: "Male",
    latitude: 11.4589,
    longitude: 77.4389,
    stayType: "Student Living",
    sharingType: "4 Sharing",
    amenities: ["Food", "Power Backup"],
    description: "Most economical option near hospital and medical facilities.",
    phone: "+91 9876543221",
    email: "economy@pgmail.com",
    ownerName: "Economy",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800"
    ]
  },
  {
    name: "Executive Rooms",
    location: "Erode Road, Gobichettipalayam",
    address: "Erode Road, Gobichettipalayam",
    price: 8500,
    gender: "Female",
    latitude: 11.4501,
    longitude: 77.4478,
    stayType: "Co-living",
    sharingType: "Private",
    amenities: ["AC", "WiFi", "Food", "Parking", "Power Backup", "Fridge"],
    description: "Premium accommodation for working women with housekeeping services.",
    phone: "+91 9876543222",
    email: "executive@pgmail.com",
    ownerName: "Executive",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
    ]
  },
  {
    name: "City Center PG",
    location: "Old Bus Stand Area, Gobichettipalayam",
    address: "Old Bus Stand Area, Gobichettipalayam",
    price: 5200,
    gender: "Co-living",
    latitude: 11.4567,
    longitude: 77.4401,
    stayType: "Co-living",
    sharingType: "3 Sharing",
    amenities: ["WiFi", "Food", "Power Backup"],
    description: "Central location with easy access to all parts of the town.",
    phone: "+91 9876543223",
    email: "citycenter@pgmail.com",
    ownerName: "City Center",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ]
  },
  {
    name: "Smart Living",
    location: "Opposite Government Hospital, Gobichettipalayam",
    address: "Opposite Government Hospital, Gobichettipalayam",
    price: 5600,
    gender: "Male",
    latitude: 11.4578,
    longitude: 77.4356,
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["WiFi", "Food", "Parking"],
    description: "Modern PG with WiFi and good food. Near medical facilities.",
    phone: "+91 9876543224",
    email: "smartliving@pgmail.com",
    ownerName: "Smart Living",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
    ]
  },
  {
    name: "Temple View Hostel",
    location: "Near Pariyur Temple, Gobichettipalayam",
    address: "Near Pariyur Temple, Gobichettipalayam",
    price: 4800,
    gender: "Female",
    latitude: 11.4623,
    longitude: 77.4312,
    stayType: "Co-living",
    sharingType: "3 Sharing",
    amenities: ["Food", "Fridge", "Power Backup"],
    description: "Peaceful location near temple. Vegetarian food and spiritual environment.",
    phone: "+91 9876543225",
    email: "templeview@pgmail.com",
    ownerName: "Temple View",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
    ]
  },
  {
    name: "Industrial Area PG",
    location: "SIDCO Industrial Estate, Gobichettipalayam",
    address: "SIDCO Industrial Estate, Gobichettipalayam",
    price: 6800,
    gender: "Male",
    latitude: 11.4489,
    longitude: 77.4523,
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["AC", "WiFi", "Food", "Parking"],
    description: "Ideal for factory and industrial workers. Near SIDCO estate.",
    phone: "+91 9876543226",
    email: "industrial@pgmail.com",
    ownerName: "Industrial",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ]
  },
  {
    name: "College Road Hostel",
    location: "College Road, Gobichettipalayam",
    address: "College Road, Gobichettipalayam",
    price: 4200,
    gender: "Co-living",
    latitude: 11.4612,
    longitude: 77.4434,
    stayType: "Student Living",
    sharingType: "4 Sharing",
    amenities: ["WiFi", "Food"],
    description: "Student-friendly accommodation near multiple colleges.",
    phone: "+91 9876543227",
    email: "collegeroad@pgmail.com",
    ownerName: "College Road",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
    ]
  },
  {
    name: "Premium Stay",
    location: "New Bus Stand, Gobichettipalayam",
    address: "New Bus Stand, Gobichettipalayam",
    price: 9000,
    gender: "Female",
    latitude: 11.4545,
    longitude: 77.4367,
    stayType: "Co-living",
    sharingType: "Private",
    amenities: ["AC", "WiFi", "Food", "Parking", "Power Backup", "Fridge"],
    description: "Premium private rooms with all modern amenities and security.",
    phone: "+91 9876543228",
    email: "premium@pgmail.com",
    ownerName: "Premium",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
    ]
  },
  {
    name: "Green Park Residency",
    location: "Gandhi Nagar, Gobichettipalayam",
    address: "Gandhi Nagar, Gobichettipalayam",
    price: 5900,
    gender: "Male",
    latitude: 11.4534,
    longitude: 77.4289,
    stayType: "Co-living",
    sharingType: "3 Sharing",
    amenities: ["WiFi", "Food", "Parking", "Power Backup"],
    description: "Well-maintained PG in residential area with good security.",
    phone: "+91 9876543229",
    email: "greenpark@pgmail.com",
    ownerName: "Green Park",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ]
  },
  {
    name: "Star Accommodation",
    location: "Market Area, Gobichettipalayam",
    address: "Market Area, Gobichettipalayam",
    price: 5300,
    gender: "Co-living",
    latitude: 11.4556,
    longitude: 77.4378,
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["WiFi", "Food", "Fridge"],
    description: "Central market location with shopping and banking facilities nearby.",
    phone: "+91 9876543230",
    email: "star@pgmail.com",
    ownerName: "Star",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
    ]
  },
  {
    name: "Lakshmi Vilas",
    location: "Anna Nagar, Gobichettipalayam",
    address: "Anna Nagar, Gobichettipalayam",
    price: 6300,
    gender: "Female",
    latitude: 11.4498,
    longitude: 77.4412,
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["WiFi", "Food", "Fridge", "Power Backup"],
    description: "Homely environment for working women with quality food.",
    phone: "+91 9876543231",
    email: "lakshmivilas@pgmail.com",
    ownerName: "Lakshmi Vilas",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
    ]
  },
  {
    name: "Comfort Zone",
    location: "Modakkurichi Road, Gobichettipalayam",
    address: "Modakkurichi Road, Gobichettipalayam",
    price: 5700,
    gender: "Male",
    latitude: 11.4512,
    longitude: 77.4501,
    stayType: "Co-living",
    sharingType: "3 Sharing",
    amenities: ["WiFi", "Food", "Parking"],
    description: "Comfortable stay with spacious rooms and good ventilation.",
    phone: "+91 9876543232",
    email: "comfortzone@pgmail.com",
    ownerName: "Comfort Zone",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ]
  },
  {
    name: "Youth Hostel",
    location: "Near Polytechnic College, Gobichettipalayam",
    address: "Near Polytechnic College, Gobichettipalayam",
    price: 4600,
    gender: "Co-living",
    latitude: 11.4601,
    longitude: 77.4423,
    stayType: "Student Living",
    sharingType: "4 Sharing",
    amenities: ["WiFi", "Food", "Power Backup"],
    description: "Budget-friendly hostel for engineering and polytechnic students.",
    phone: "+91 9876543233",
    email: "youth@pgmail.com",
    ownerName: "Youth",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800"
    ]
  },
  {
    name: "Elite Homes",
    location: "Arachalur Road, Gobichettipalayam",
    address: "Arachalur Road, Gobichettipalayam",
    price: 7800,
    gender: "Female",
    latitude: 11.4478,
    longitude: 77.4345,
    stayType: "Co-living",
    sharingType: "Private",
    amenities: ["AC", "WiFi", "Food", "Parking", "Power Backup", "Fridge"],
    description: "Elite accommodation with premium facilities and dedicated housekeeping.",
    phone: "+91 9876543234",
    email: "elite@pgmail.com",
    ownerName: "Elite",
    isActive: true,
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
    ]
  }
];

async function seedPGs() {
  try {
    // ✅ MongoDB connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // ✅ Clear existing PGs
    const deleteResult = await PG.deleteMany({});
    console.log(`🗑️  Removed ${deleteResult.deletedCount} existing PGs`);

    // ✅ Insert new data
    const insertResult = await PG.insertMany(pgData);
    console.log(`🎉 Successfully seeded ${insertResult.length} PGs`);

    // ✅ Verify data
    const count = await PG.countDocuments();
    console.log(`📊 Total PGs in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

seedPGs();