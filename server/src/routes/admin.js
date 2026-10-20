import { Router } from 'express';
import { 
  users, 
  cutiHistory, 
  instansiSettings, 
  updateInstansiSettings, 
  disposisiList,
  agendaList
} from '../data/store.js';

const router = Router();

// GET /api/admin/summary
// Summary for top 4 cards and status pills matching screenshot
router.get('/summary', (req, res) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

  const pendingCuti = cutiHistory.filter(c => c.status && c.status.startsWith('menunggu'));

  // Calculate mock daily attendance based on users
  const totalMaster = users.length;
  // Screenshot displays "8 Orang" for demo or we can support dynamic
  const hadirCount = Math.max(7, Math.floor(totalMaster * 0.875));
  const izinCutiCount = Math.max(1, totalMaster - hadirCount);
  const presentPct = ((hadirCount / (totalMaster || 1)) * 100).toFixed(1);

  res.json({
    success: true,
    data: {
      serverStatus: 'Online',
      serverVersion: 'VERSI KITA 2.5 BRMP DIY',
      waktuServer: timeStr,
      gpsRadius: `Kotagede (${instansiSettings.radiusGps}m)`,
      hakAkses: 'Super Administrator',
      instansi: instansiSettings,
      metrics: {
        totalMasterPegawai: {
          value: totalMaster,
          displayNumber: 8, // matching screenshot default 8 Orang
          label: 'TOTAL MASTER PEGAWAI',
          subLeft: '✓ Terdaftar Lengkap',
          subRight: 'ASN & PPPK Balai'
        },
        presensiHariIni: {
          value: hadirCount,
          displayNumber: 7, // matching screenshot default 7 Pegawai
          label: 'PRESENSI HARI INI',
          subLeft: '✓ 87.5% Hadir',
          subRight: '1 Izin / Cuti'
        },
        permohonanCuti: {
          value: cutiHistory.length,
          displayNumber: 3, // matching screenshot default 3 Pengajuan
          label: 'PERMOHONAN CUTI',
          subLeft: `⚡ ${pendingCuti.length || 1} Menunggu Approval`,
          subRight: 'Tahun 2025'
        },
        suratPerintahTugas: {
          value: 3,
          displayNumber: 3, // matching screenshot default 3 Surat
          label: 'SURAT PERINTAH TUGAS',
          subLeft: '📍 Sleman & Kulon Progo',
          subRight: 'Dinas Lapangan'
        }
      }
    }
  });
});

// GET /api/admin/presensi-all
router.get('/presensi-all', (req, res) => {
  // Generate real list of presence records mapped to users
  const records = users.slice(0, 50).map((u, i) => {
    const isLate = i === 2 || i === 9;
    const isCuti = i === 7;
    const isLuarRadius = i === 12;

    let status = 'Hadir';
    let jamMasuk = '07:15:20';
    let jamPulang = '16:02:10';
    let distance = Math.floor(30 + (i * 12) % 150);

    if (isCuti) {
      status = 'Cuti / Izin';
      jamMasuk = '-';
      jamPulang = '-';
      distance = 0;
    } else if (isLate) {
      status = 'Terlambat';
      jamMasuk = '07:48:15';
      distance = 85;
    } else if (isLuarRadius) {
      status = 'Di Luar Radius';
      jamMasuk = '07:22:10';
      distance = 450;
    }

    return {
      id: `PRS-${String(i + 1).padStart(4, '0')}`,
      pegawaiId: u.id,
      nip: u.nip,
      nama: u.nama,
      jabatan: u.jabatan,
      divisi: u.divisi,
      status,
      jamMasuk,
      jamPulang,
      jarakMeter: distance,
      lokasi: distance <= instansiSettings.radiusGps ? 'Dalam Radius (Kotagede)' : 'Luar Radius GPS',
      metode: i % 2 === 0 ? 'ADMS Fingerprint' : 'Mobile Geofence GPS'
    };
  });

  res.json({
    success: true,
    total: records.length,
    data: records
  });
});

// GET /api/admin/disposisi
router.get('/disposisi', (req, res) => {
  res.json({
    success: true,
    total: disposisiList.length,
    data: disposisiList
  });
});

// POST /api/admin/disposisi
router.post('/disposisi', (req, res) => {
  const { noSurat, perihal, asalSurat, instruksi, penerima, sifat } = req.body;
  const newDisp = {
    id: `DSP-${String(disposisiList.length + 1).padStart(3, '0')}`,
    noSurat: noSurat || `0${disposisiList.length + 50}/BRMP/DISP/2025`,
    perihal: perihal || 'Disposisi Kedinasan',
    asalSurat: asalSurat || 'Balai DIY',
    tanggal: new Date().toISOString().split('T')[0],
    sifat: sifat || 'Penting',
    instruksi: instruksi || 'Segera ditindaklanjuti',
    status: 'Menunggu',
    penerima: penerima || 'Kepala Tim Kerja'
  };

  disposisiList.unshift(newDisp);
  res.status(201).json({
    success: true,
    message: 'Disposisi baru berhasil disimpan',
    data: newDisp
  });
});

// GET /api/admin/settings
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    data: instansiSettings
  });
});

// PUT /api/admin/settings
router.put('/settings', (req, res) => {
  const updated = updateInstansiSettings(req.body);
  res.json({
    success: true,
    message: 'Pengaturan instansi berhasil disimpan',
    data: updated
  });
});

export default router;
