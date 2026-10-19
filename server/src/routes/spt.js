import { Router } from 'express';
import { 
  sptList, 
  addSpt, 
  approveSpt, 
  rejectSpt,
  terbitkanSpt,
  updateLaporan, 
  saveMenimbang,
  saveDasar,
  DEFAULT_MENIMBANG, 
  DEFAULT_DASAR,
  KLASIFIKASI_SPT_DEFAULT 
} from '../data/sptStore.js';
import { DATA_PEGAWAI_BRMP } from '../data/pegawai.js';

const router = Router();

// GET /api/spt - List all SPT & configurations
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      sptList,
      menimbang: DEFAULT_MENIMBANG,
      dasar: DEFAULT_DASAR,
      klasifikasi: KLASIFIKASI_SPT_DEFAULT
    }
  });
});

// GET /api/spt/pegawai - Get list of 115 pegawai BRMP DIY
router.get('/pegawai', (req, res) => {
  res.json({
    success: true,
    data: DATA_PEGAWAI_BRMP
  });
});

// POST /api/spt - Create new SPT
router.post('/', (req, res) => {
  const { 
    dariTanggal, 
    sampaiTanggal, 
    tglMulai,
    tglSelesai,
    uraian, 
    untukMelaksanakan,
    kotaTujuan, 
    tujuanDaerah,
    tempatTujuan, 
    pegawaiBertugas,
    anggota,
    klasifikasiId,
    klasifikasiNama,
    pemohon
  } = req.body;

  const start = dariTanggal || tglMulai;
  const end = sampaiTanggal || tglSelesai;
  const desc = uraian || untukMelaksanakan;
  const kota = kotaTujuan || tujuanDaerah;
  const personil = pegawaiBertugas || anggota;

  if (!start || !end || !desc || !kota || !personil || personil.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Semua kolom formulir SPT wajib diisi (Tanggal Mulai, Tanggal Selesai, Uraian Tugas, Tujuan Daerah, dan Anggota/Personil)'
    });
  }

  const newSpt = addSpt({
    dariTanggal: start,
    sampaiTanggal: end,
    tglMulai: start,
    tglSelesai: end,
    uraian: desc,
    untukMelaksanakan: desc,
    kotaTujuan: kota,
    tujuanDaerah: kota,
    tempatTujuan: tempatTujuan || kota,
    pegawaiBertugas: personil,
    anggota: personil,
    klasifikasiId: klasifikasiId || "KLAS-01",
    klasifikasiNama: klasifikasiNama || "Perjalanan Dinas Dalam Daerah DIY",
    pemohon
  });

  res.status(201).json({
    success: true,
    message: 'Pengajuan SPT berhasil disimpan dan masuk antrean persetujuan',
    data: newSpt
  });
});

// POST /api/spt/:id/approve - Approve SPT by role (ketimker, kobag_tu, all)
router.post('/:id/approve', (req, res) => {
  const { role, catatan } = req.body;
  const updated = approveSpt(req.params.id, role || 'all', catatan || '');

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'SPT tidak ditemukan'
    });
  }

  res.json({
    success: true,
    message: `Persetujuan berhasil diperbarui`,
    data: updated
  });
});

// POST /api/spt/:id/reject - Reject / Request revision
router.post('/:id/reject', (req, res) => {
  const { role, reason } = req.body;
  const updated = rejectSpt(req.params.id, role, reason);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'SPT tidak ditemukan'
    });
  }

  res.json({
    success: true,
    message: 'Status SPT berhasil diperbarui (Ditolak / Perlu Perbaikan)',
    data: updated
  });
});

// POST /api/spt/:id/terbitkan - Issue official SPT number & upload TTD
router.post('/:id/terbitkan', (req, res) => {
  const { nomorSpt, fileTtdName } = req.body;
  const updated = terbitkanSpt(req.params.id, nomorSpt, fileTtdName);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'SPT tidak ditemukan'
    });
  }

  res.json({
    success: true,
    message: 'Nomor dinas resmi berhasil diterbitkan',
    data: updated
  });
});

// POST /api/spt/:id/laporan - Submit report & photos
router.post('/:id/laporan', (req, res) => {
  const { isiLaporan, fotoUrl, fileLaporanName } = req.body;

  if (!isiLaporan) {
    return res.status(400).json({
      success: false,
      message: 'Uraian hasil pelaksanaan tugas dinas wajib diisi'
    });
  }

  const updated = updateLaporan(req.params.id, isiLaporan, fotoUrl, fileLaporanName);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'SPT tidak ditemukan'
    });
  }

  res.json({
    success: true,
    message: 'Laporan hasil tugas dinas berhasil disimpan',
    data: updated
  });
});

// PUT /api/spt/menimbang - Save updated Menimbang items
router.put('/menimbang', (req, res) => {
  const { menimbang } = req.body;
  const updated = saveMenimbang(menimbang);
  res.json({
    success: true,
    message: 'Konsiderans Menimbang berhasil diperbarui',
    data: updated
  });
});

// PUT /api/spt/dasar - Save updated Dasar Hukum items
router.put('/dasar', (req, res) => {
  const { dasar } = req.body;
  const updated = saveDasar(dasar);
  res.json({
    success: true,
    message: 'Konsiderans Dasar Hukum berhasil diperbarui',
    data: updated
  });
});

export default router;
