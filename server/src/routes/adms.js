import { Router } from 'express';
import { users } from '../data/store.js';

const router = Router();

// Store connected machines and real-time logs
export let admsMachines = [
  {
    sn: "BNDK19280012",
    namaMesin: "Mesin Absensi Lobi Utama BRMP DIY",
    ip: "192.168.1.200",
    lastSync: new Date().toISOString(),
    status: "Online",
    totalLogs: 24
  }
];

export let admsLogs = [
  {
    id: 1,
    sn: "BNDK19280012",
    pin: "199808062014032001",
    nama: "AGNITA VERDIANI PUTRI, A.Md.",
    jabatan: "Pengelola Standardisasi Teknis",
    datetime: "2026-10-19 07:23:54",
    tanggal: "2026-10-19",
    jam: "07:23:54",
    statusAbsen: "Masuk", // Masuk | Pulang
    keterangan: "Tepat Waktu (07:23:54)"
  },
  {
    id: 2,
    sn: "BNDK19280012",
    pin: "198604092011012024",
    nama: "Dwi Dinia Rahayu, S.Kom, M.T.I",
    jabatan: "Ketua Tim Kerja SDM",
    datetime: "2026-10-19 07:20:12",
    tanggal: "2026-10-19",
    jam: "07:20:12",
    statusAbsen: "Masuk",
    keterangan: "Tepat Waktu (07:20:12)"
  }
];

// Helper to record an attendance tap from ADMS machine
export const processAttendanceRecord = (pin, datetimeStr, statusRaw, sn = 'UNKNOWN') => {
  const cleanPin = String(pin || '').trim();
  const cleanDate = String(datetimeStr || '').trim();
  
  // Parse date and time
  const parts = cleanDate.split(' ');
  const date = parts[0] || new Date().toISOString().split('T')[0];
  const time = parts[1] || '08:00:00';

  // Determine status (0 = Check-In / Masuk, 1 = Check-Out / Pulang)
  const isCheckIn = String(statusRaw).trim() === '0' || String(statusRaw).trim() === '4';
  const statusAbsen = isCheckIn ? 'Masuk' : 'Pulang';

  // Match employee by NIP, pinMesin, or ID
  const matchedUser = users.find(u => 
    String(u.nip).trim() === cleanPin || 
    String(u.pinMesin || '').trim() === cleanPin ||
    String(u.id).trim() === cleanPin ||
    String(u.id).replace('PEG-', '').trim() === cleanPin.padStart(3, '0') ||
    (cleanPin.length >= 4 && String(u.nip).endsWith(cleanPin))
  ) || {
    nama: `Pegawai (ID: ${cleanPin})`,
    jabatan: "Staf Pegawai",
    divisi: "BRMP DIY"
  };

  // Determine timeliness (standard: 07:30:00)
  let keterangan = 'Tepat Waktu';
  if (isCheckIn) {
    if (time > '07:30:00') {
      keterangan = `Terlambat (${time})`;
    } else {
      keterangan = `Tepat Waktu (${time})`;
    }
    // Update live user attendance state
    if (matchedUser.jamMasuk) {
      matchedUser.jamMasuk = time;
    }
  } else {
    keterangan = `Pulang (${time})`;
    if (matchedUser.jamPulang) {
      matchedUser.jamPulang = time;
    }
  }

  const newLog = {
    id: admsLogs.length + 1,
    sn,
    pin: cleanPin,
    nama: matchedUser.nama,
    jabatan: matchedUser.jabatan,
    datetime: cleanDate,
    tanggal: date,
    jam: time,
    statusAbsen,
    keterangan
  };

  admsLogs.unshift(newLog);
  console.log(`[ADMS] Log Recorded: ${matchedUser.nama} (${cleanPin}) - ${statusAbsen} jam ${time} [SN: ${sn}]`);
  return newLog;
};

// Update machine status
export const touchMachine = (sn, ip) => {
  let machine = admsMachines.find(m => m.sn === sn);
  const now = new Date().toLocaleString('id-ID');
  if (!machine) {
    machine = {
      sn,
      namaMesin: `Mesin ADMS (${sn})`,
      ip: ip || '127.0.0.1',
      lastSync: now,
      status: 'Online',
      totalLogs: 1
    };
    admsMachines.push(machine);
  } else {
    machine.lastSync = now;
    machine.ip = ip || machine.ip;
    machine.status = 'Online';
    machine.totalLogs += 1;
  }
};

// ==========================================
// ADMS PROTOCOL HANDSHAKE & CDATA ENDPOINTS
// ==========================================

// GET /iclock/cdata or /cdata - Handshake & Machine Ping
const handleCdataGet = (req, res) => {
  const sn = req.query.SN || req.query.sn || 'SN_UNKNOWN';
  const options = req.query.options || '';
  const clientIp = req.ip || req.connection.remoteAddress;

  touchMachine(sn, clientIp);
  console.log(`[ADMS] Ping/Handshake from machine SN: ${sn} (options: ${options})`);

  // Set standard ADMS headers
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-store');

  if (options === 'all') {
    // Standard ZKTeco configuration response
    const configResponse = [
      `GET OPTION FROM: ${sn}`,
      `Stamp=9999`,
      `OpStamp=None`,
      `ErrorDelay=30`,
      `Delay=10`,
      `TransTimes=00:00;14:05`,
      `TransInterval=1`,
      `TransFlag=1111111111`,
      `Realtime=1`,
      `TimeZone=7`,
      `Encrypt=0`
    ].join('\r\n');

    return res.send(configResponse);
  }

  // Default response
  return res.send('OK');
};

// POST /iclock/cdata or /cdata - Machine Pushing Attendance Logs (ATTLOG)
const handleCdataPost = (req, res) => {
  const sn = req.query.SN || req.query.sn || 'SN_UNKNOWN';
  const table = req.query.table || '';
  const clientIp = req.ip || req.connection.remoteAddress;

  touchMachine(sn, clientIp);

  // Body can be text/plain string with tabs or raw
  let rawBody = typeof req.body === 'string' ? req.body : (req.body ? req.body.toString() : '');
  
  console.log(`[ADMS] Incoming Data Push from SN: ${sn} (table: ${table})`);
  console.log(`[ADMS] Raw Payload:\n${rawBody.substring(0, 300)}...`);

  // Parse lines
  const lines = rawBody.split(/\r?\n/).filter(l => l.trim().length > 0);
  let processedCount = 0;

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const pin = parts[0];
      const datetime = parts[1];
      const statusRaw = parts[2] || '0'; // 0=In, 1=Out
      processAttendanceRecord(pin, datetime, statusRaw, sn);
      processedCount++;
    }
  }

  // Response required by ADMS: "OK" or "OK: {count}"
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-store');
  return res.send(processedCount > 0 ? `OK: ${processedCount}` : 'OK');
};

// Machine polling for command queue
const handleGetRequest = (req, res) => {
  const sn = req.query.SN || req.query.sn || 'SN_UNKNOWN';
  touchMachine(sn, req.ip);
  res.setHeader('Content-Type', 'text/plain');
  return res.send('OK');
};

// Machine reporting command result
const handleDeviceCmd = (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  return res.send('OK');
};

// Register ADMS standard endpoints
router.get('/cdata', handleCdataGet);
router.post('/cdata', handleCdataPost);
router.get('/getrequest', handleGetRequest);
router.post('/devicecmd', handleDeviceCmd);

// ==========================================
// REST API ENDPOINTS FOR BRMP FRONTEND UI
// ==========================================

// GET /api/adms/logs - Get live attendance logs from machines
router.get('/api/logs', (req, res) => {
  const { nip, role } = req.query;
  let result = admsLogs;

  if (role !== 'admin' && nip) {
    const user = users.find(u => u.nip === nip || u.id === nip);
    const userNip = user?.nip || nip;
    const userPin = String(user?.pinMesin || '');
    const userNama = (user?.nama || '').toLowerCase().trim();

    result = admsLogs.filter(l => {
      const pin = String(l.pin || '').trim();
      const nama = String(l.nama || '').toLowerCase().trim();
      if (pin === userNip) return true;
      if (userPin && pin === userPin) return true;
      if (userNama && (nama === userNama || nama.includes(userNama))) return true;
      return false;
    });
  }

  res.json({
    success: true,
    total: result.length,
    role: role || 'pegawai',
    data: result
  });
});

// GET /api/adms/machines - Get connected machine list
router.get('/api/machines', (req, res) => {
  res.json({
    success: true,
    data: admsMachines
  });
});

// POST /api/adms/simulate - Allow admin to simulate an ADMS scan for testing
router.post('/api/simulate', (req, res) => {
  const { pin, statusAbsen, datetime } = req.body;
  
  if (!pin) {
    return res.status(400).json({ success: false, message: 'NIP / PIN wajib diisi' });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const fullDatetime = datetime || `${dateStr} ${timeStr}`;

  const statusRaw = statusAbsen === 'Pulang' ? '1' : '0';
  const recorded = processAttendanceRecord(pin, fullDatetime, statusRaw, 'SIMULATOR-01');

  res.json({
    success: true,
    message: `Berhasil mencatat absensi mesin untuk ${recorded.nama} (${recorded.statusAbsen} jam ${recorded.jam})`,
    data: recorded
  });
});

export default router;
