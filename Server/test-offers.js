const fetch = require("node-fetch");

async function testOfferAPI() {
  try {
    console.log("🧪 Testing Offer API endpoints...\n");

    // Test modal offers endpoint
    console.log("1. Testing /api/offers/modal");
    const modalResponse = await fetch("http://localhost:5000/api/offers/modal");
    const modalOffers = await modalResponse.json();
    console.log(`   ✅ Status: ${modalResponse.status}`);
    console.log(`   📊 Modal offers found: ${modalOffers.length}`);

    if (modalOffers.length > 0) {
      console.log(`   🎯 First offer: "${modalOffers[0].title}"`);
    }

    // Test active offers endpoint
    console.log("\n2. Testing /api/offers/active");
    const activeResponse = await fetch(
      "http://localhost:5000/api/offers/active",
    );
    const activeOffers = await activeResponse.json();
    console.log(`   ✅ Status: ${activeResponse.status}`);
    console.log(`   📊 Active offers found: ${activeOffers.length}`);

    console.log("\n🎉 API tests completed successfully!");
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

testOfferAPI();
