/**
 * TEST SCRIPT: Tarpitting Verification
 * This script bombards a local API endpoint to demonstrate the exponential delay.
 */
async function testTarpit() {
  const url = 'http://localhost:3000/api/courses'; // Any valid endpoint
  console.log('--- Starting Tarpit Test (Active Defense) ---');
  
  for (let i = 1; i <= 10; i++) {
    const start = Date.now();
    try {
      const res = await fetch(url);
      const end = Date.now();
      console.log(`Request #${i}: Status ${res.status}, Time: ${end - start}ms`);
    } catch (e) {
      console.log(`Request #${i}: Failed (likely timeout/delay effect)`);
    }
    // Small pause to let the middleware detect "rapidity" but still be sequential
    await new Promise(r => setTimeout(r, 50)); 
  }
  
  console.log('--- Test Complete ---');
}

testTarpit();
