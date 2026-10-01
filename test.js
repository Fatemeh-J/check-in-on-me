// Minimal data-layer tests — run with: node test.js

global.localStorage = (() => {
  let store = {};
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; },
    clear: () => { store = {}; }
  };
})();

const {
  getCheckIns, saveCheckIn,
  getLoops, addLoop, archiveLoop, getActiveLoops,
  exportCSV
} = require('./app.js');

function test(name, fn) {
  localStorage.clear();
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
    process.exitCode = 1;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

test('saveCheckIn adds timestamp and persists', () => {
  const result = saveCheckIn({ mood: ['happy', 'grateful'] });
  assert(result.timestamp, 'should have timestamp');
  assert(getCheckIns().length === 1, 'should persist');
  assert(getCheckIns()[0].mood.includes('happy'), 'should store mood array');
});

test('multiple check-ins accumulate', () => {
  saveCheckIn({ mood: ['happy'] });
  saveCheckIn({ mood: ['sad'] });
  assert(getCheckIns().length === 2, 'should have 2 check-ins');
});

test('addLoop and archiveLoop', () => {
  addLoop('Work project');
  assert(getActiveLoops().length === 1, 'should have 1 active loop');
  archiveLoop('Work project');
  assert(getActiveLoops().length === 0, 'should have 0 active loops');
  assert(getLoops().length === 1, 'archived loop still in storage');
});

test('exportCSV produces valid CSV', () => {
  saveCheckIn({
    mood: ['happy', 'grateful'],
    note: 'test, with "comma"',
    openLoops: [{ name: 'X', weight: 'heavy' }]
  });
  const csv = exportCSV();
  assert(csv.startsWith('timestamp,mood,'), 'should have headers');
  assert(csv.includes('happy;grateful'), 'should include mood array');
  assert(csv.includes('"test, with ""comma"""'), 'should escape properly');
  assert(csv.includes('X:heavy'), 'should serialize loops');
});

test('exportCSV returns null when empty', () => {
  assert(exportCSV() === null, 'should return null');
});

console.log('\nAll tests passed');
