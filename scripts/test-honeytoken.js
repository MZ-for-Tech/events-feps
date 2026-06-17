/**
 * TEST SCRIPT: Honeytoken Trigger
 * This script attempts to access a honeytoken ID.
 */
async function testHoneytoken() {
  const honeytokenEmail = 'sarah.malik@feps.edu.eg';
  const url = `http://localhost:3000/api/users/${honeytokenEmail}`;
  
  console.log('--- Starting Honeytoken Trigger Test (Cyber Deception) ---');
  console.log(`Targeting: ${honeytokenEmail}`);
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Body:', data);
    
    if (res.status === 403) {
      console.log('SUCCESS: Trap triggered. Session should be invalidated.');
    }
  } catch (e) {
    console.error('Test Failed:', e);
  }
}

testHoneytoken();
