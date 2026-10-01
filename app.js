(function (root) {
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

  function isFirstCheckInToday() {
    const checkins = getCheckIns();
    if (checkins.length === 0) return true;
    const today = new Date().toDateString();
    return !checkins.some(c => new Date(c.timestamp).toDateString() === today);
  }

  function shouldShowWorkSection() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 0 || day === 6) return false;
    if (hour >= 17) return false;
    return true;
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
      const toStr = v => Array.isArray(v) ? v.join(';') : (v ?? '');
      const loopsStr = (c.openLoops || []).map(l => l.name + ':' + l.weight).join(';');
      return headers.map(h => {
        if (h === 'openLoops') return escape(loopsStr);
        if (['mood','food','sleepQuality','activityType','socialized','workSocialized','workUseful','workLocation','workPace'].includes(h)) return escape(toStr(c[h]));
        return escape(c[h]);
      }).join(',');
    });

    return headers.join(',') + '\n' + rows.join('\n');
  }

  const api = {
    STORAGE_KEY, LOOPS_KEY,
    getCheckIns, saveCheckIn,
    getLoops, saveLoops, addLoop, archiveLoop, getActiveLoops,
    isFirstCheckInToday, shouldShowWorkSection,
    exportCSV
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    Object.assign(root, api);
  }
})(typeof window !== 'undefined' ? window : globalThis);
