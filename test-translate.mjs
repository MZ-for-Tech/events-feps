import { translate } from 'google-translate-api-x';

const samples = [
  "Data Science in Public Policy Symposium",
  "Annual Conference on Economic Development in the Middle East",
  "Workshop: Advanced Quantitative Methods for Social Sciences",
  "The Role of Artificial Intelligence in Modern Governance and Administration",
  "A comprehensive seminar discussing the impacts of climate change on emerging economies."
];

async function runTests() {
  console.log('Testing Google Translate API (English -> French)\n');
  
  for (const text of samples) {
    try {
      const res = await translate(text, { to: 'fr' });
      console.log(`Original (EN): ${text}`);
      console.log(`Translate(FR): ${res.text}`);
      console.log('--------------------------------------------------');
    } catch (e) {
      console.error(`Error translating: ${text}`, e);
    }
  }
}

runTests();
