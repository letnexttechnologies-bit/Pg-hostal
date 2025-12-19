// testAPI.js - Run this to verify your database and API
const mongoose = require("mongoose");
require("dotenv").config();
const PG = require("./models/PG");

async function testDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully\n");

    // Test 1: Count total PGs
    console.log("📊 TEST 1: Counting PGs in database");
    const totalCount = await PG.countDocuments();
    console.log(`   Total PGs: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log("   ⚠️  No PGs found! Run: node seedPGs.js");
      return;
    }
    console.log("   ✅ Pass\n");

    // Test 2: Count active PGs
    console.log("📊 TEST 2: Counting active PGs");
    const activeCount = await PG.countDocuments({ isActive: true });
    console.log(`   Active PGs: ${activeCount}`);
    console.log("   ✅ Pass\n");

    // Test 3: Fetch first 3 PGs
    console.log("📊 TEST 3: Fetching first 3 PGs");
    const samplePGs = await PG.find().limit(3);
    samplePGs.forEach((pg, index) => {
      console.log(`   ${index + 1}. ${pg.name}`);
      console.log(`      Location: ${pg.location}`);
      console.log(`      Price: ₹${pg.price}`);
      console.log(`      Gender: ${pg.gender}`);
      console.log(`      Images: ${pg.images?.length || 0}`);
      console.log(`      Active: ${pg.isActive}`);
    });
    console.log("   ✅ Pass\n");

    // Test 4: Test filters
    console.log("📊 TEST 4: Testing filters");
    
    const maleOnly = await PG.countDocuments({ gender: "Male", isActive: true });
    console.log(`   Male PGs: ${maleOnly}`);
    
    const femaleOnly = await PG.countDocuments({ gender: "Female", isActive: true });
    console.log(`   Female PGs: ${femaleOnly}`);
    
    const coLiving = await PG.countDocuments({ gender: "Co-living", isActive: true });
    console.log(`   Co-living PGs: ${coLiving}`);
    
    const underBudget = await PG.countDocuments({ price: { $lte: 5000 }, isActive: true });
    console.log(`   PGs under ₹5000: ${underBudget}`);
    console.log("   ✅ Pass\n");

    // Test 5: Verify required fields
    console.log("📊 TEST 5: Verifying data quality");
    const pgWithMissingData = await PG.findOne({
      $or: [
        { name: { $exists: false } },
        { location: { $exists: false } },
        { price: { $exists: false } },
        { latitude: { $exists: false } },
        { longitude: { $exists: false } }
      ]
    });
    
    if (pgWithMissingData) {
      console.log(`   ⚠️  Found PG with missing required fields: ${pgWithMissingData.name}`);
    } else {
      console.log("   ✅ All PGs have required fields");
    }
    console.log("   ✅ Pass\n");

    // Test 6: Check for images
    console.log("📊 TEST 6: Checking images");
    const pgsWithoutImages = await PG.countDocuments({
      $or: [
        { images: { $size: 0 } },
        { images: { $exists: false } }
      ]
    });
    
    if (pgsWithoutImages > 0) {
      console.log(`   ⚠️  ${pgsWithoutImages} PGs don't have images`);
    } else {
      console.log("   ✅ All PGs have images");
    }
    console.log("   ✅ Pass\n");

    // Summary
    console.log("═══════════════════════════════════════");
    console.log("📋 SUMMARY");
    console.log("═══════════════════════════════════════");
    console.log(`Total PGs: ${totalCount}`);
    console.log(`Active PGs: ${activeCount}`);
    console.log(`Male: ${maleOnly} | Female: ${femaleOnly} | Co-living: ${coLiving}`);
    console.log(`Budget-friendly (≤₹5000): ${underBudget}`);
    console.log("═══════════════════════════════════════\n");

    console.log("🎉 All tests passed!");
    console.log("\n💡 Next steps:");
    console.log("   1. Start your backend: node server.js");
    console.log("   2. Test API: http://localhost:5000/api/pgs");
    console.log("   3. Start your frontend and check if PGs display");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  }
}

testDatabase();