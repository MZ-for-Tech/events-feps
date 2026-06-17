/**
 * TEST SCRIPT: Active Deception Verification
 * This script attempts to access a honeytoken ID and verifies it gets FAKE data instead of a block.
 */
async function testDeception() {
  const honeytokenEmail = 'sarah.malik@feps.edu.eg';
  const url = `http://localhost:3000/api/users/${honeytokenEmail}`;
  
  console.log('--- Starting Cyber Deception Test (Incubator Grade) ---');
  console.log(`Targeting: ${honeytokenEmail}`);
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    console.log('Response Status:', res.status);
    console.log('Response Deception Header:', res.headers.get('X-Security-Deception'));
    
    if (res.status === 200 && res.headers.get('X-Security-Deception') === 'Active') {
      console.log('SUCCESS: Deception Active! Attacker received MOCK data.');
      console.log('Mock Data Received:', data);
    } else {
      console.log('Test Failed: Expected deception payload but got:', res.status);
    }
  } catch (e) {
    console.error('Test Failed:', e);
  }
}

testDeception();
