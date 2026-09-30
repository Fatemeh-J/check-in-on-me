// Minimal test for data layer - run with: node test.js

// Mock localStorage
global.localStorage = (() => {
  let store = {};
  return {
    getItem: k => store[k] ?? null,
    setItem: (k, v) => store[k] = v,
    clear: () => store = {}
  };
})();

// Extract data layer functions (copy from index.html)
const STORAGE_KEY = 'checkins';
const LOOPS_KEY = 'loops';

function getCheckIns() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveCheckIn(data) {
  const checkins = getCheckIns();
  data.timestamp = new Date().toISOString();
  checkins.push(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkins));
  return data;
}

function getLoops() {
  return JSON.parse(localStorage.getItem(LOOPS_KEY) || '[]');
}

function saveLoops(loops) {
  localStorage.setItem(LOOPS_KEY, JSON.stringify(loops));
}

function addLoop(name) {
  const loops = getLoops();
  loops.push({ name, active: true, createdAt: new Date().toISOString() });
  saveLoops(loops);
}

function archiveLoop(name) {
  const loops = getLoops();
  const loop = loops.find(l => l.name === name);
  if (loop) loop.active = false;
  saveLoops(loops);
}

function getActiveLoops() {
  return getLoops().filter(l => l.active);
}

function exportCSV() {
  const checkins = getCheckIns();
  if (checkins.length === 0) return null;

  const headers = [
    'timestamp', 'mood', 'energy', 'food', 'sleepHours', 'sleepQuality',
    'activeMinutes', 'activityType', 'socialized', 'workSocialized',
    'workUseful', 'workLocation', 'workPace', 'extraWork', 'extraWorkMinutes',
    'stressSource', 'note', 'periodPhase', 'openLoops'
  ];

  const escape = v => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const rows = checkins.map(c => {
    const toStr = v => Array.isArray(v) ? v.join(';') : (v || '');
    const loopsStr = (c.openLoops || []).map(l => l.name + ':' + l.weight).join(';');
    return headers.map(h => {
      if (h === 'openLoops') return escape(loopsStr);
      if (['mood','food','sleepQuality','activityType','socialized','workSocialized','workUseful','workLocation','workPace'].includes(h)) return escape(toStr(c[h]));
      return escape(c[h]);
    }).join(',');
  });

  return headers.join(',') + '\n' + rows.join('\n');
}

// Tests
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

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
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
  saveCheckIn({ mood: ['happy', 'grateful'], note: 'test, with "comma"', openLoops: [{ name: 'X', weight: 'heavy' }] });
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
