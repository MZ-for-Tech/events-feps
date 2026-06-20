fetch('http://localhost:3000/ar/events/cmqkxy6zg0003o0ksq16dqjj3', { cache: 'no-store' })
  .then(r => r.text())
  .then(t => {
    const match = t.match(/<div id="debug-dump"[^>]*>(.*?)<\/div>/);
    console.log('DEBUG:', match ? match[1] : 'Not found');
  })
