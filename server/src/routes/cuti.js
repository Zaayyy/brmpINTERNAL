import { Router } from 'express';
import { users, cutiHistory, addCuti, verifyCuti } from '../data/store.js';

const router = Router();

// GET /api/cuti - Ambil riwayat cuti & daftar antrean verifikasi
router.get('/', (req, res) => {
  const { nip, role } = req.query;

  let user = users[1]; // Default Agnita
  if (nip) {
    const found = users.find(u => u.nip === nip || String(u.id) === String(nip));
    if (found) user = found;
  }

  // Filter list depending on user request
  // Pemohon sees their own submissions; Admin & Verifikator see all or relevant
  let myHistory = cutiHistory;
  if (user && user.approvalRole === 'pemohon' && !role?.includes('admin')) {
    myHistory = cutiHistory.filter(c => c.nip === user.nip || String(c.pegawaiId) === String(user.id));
  }

  // Antrean untuk Verifikator 1 (Atasan Langsung)
  const pendingVerif1 = cutiHistory.filter(c => c.status === 'menunggu_verif_1');

  // Antrean untuk Verifikator 2 (Kepala TU / Balai)
  const pendingVerif2 = cutiHistory.filter(c => c.status === 'menunggu_verif_2');

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        nip: user.nip,
        nama: user.nama,
        jabatan: user.jabatan,
        divisi: user.divisi,
        systemRole: user.systemRole,
        approvalRole: user.approvalRole,
        roleLabel: user.roleLabel,
        sisaCuti: user.sisaCuti,
        cutiTerpakai: user.cutiTerpakai || 0,
        expiredCuti: user.expiredCuti,
        sisaCutiText: `2025 - Sisa ${user.sisaCuti} Hari - Expired ${user.expiredCuti}`
      },
      jenisCutiOptions: [
        "Tahunan",
        "Sakit",
        "Alasan Penting",
        "Melahirkan",
        "Karena Istri Melahirkan",
        "Cuti Besar",
        "Cuti di Luar Tanggungan Negara"
      ],
      history: cutiHistory, // Semua history untuk verifikator & admin
      myHistory: myHistory, // History khusus pegawai yang sedang login
      pendingVerif1,
      pendingVerif2,
      summary: {
        totalPengajuan: cutiHistory.length,
        menungguVerif1: pendingVerif1.length,
        menungguVerif2: pendingVerif2.length,
        disetujui: cutiHistory.filter(c => c.status === 'disetujui').length,
        ditolak: cutiHistory.filter(c => c.status.startsWith('ditolak')).length
      }
    }
  });
});

// POST /api/cuti - Pegawai mengajukan cuti baru
router.post('/', (req, res) => {
  const { 
    pegawaiId,
    nip, 
    nama, 
    jabatan, 
    divisi, 
    jenisCuti, 
    tanggalMulai, 
    tanggalAkhir, 
    alasan 
  } = req.body;

  if (!jenisCuti || !tanggalMulai || !tanggalAkhir || !alasan) {
    return res.status(400).json({
      success: false,
      message: 'Jenis cuti, tanggal mulai, tanggal akhir, dan alasan cuti wajib diisi'
    });
  }

  // Calculate day difference
  const start = new Date(tanggalMulai);
  const end = new Date(tanggalAkhir);

  if (end < start) {
    return res.status(400).json({
      success: false,
      message: 'Tanggal akhir cuti tidak boleh lebih awal dari tanggal mulai cuti'
    });
  }

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Format date helper: YYYY-MM-DD -> DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  // Find user data
  const user = users.find(u => u.nip === nip || String(u.id) === String(pegawaiId)) || users[1];

  // Check sisa cuti if Tahunan
  if (jenisCuti === 'Tahunan' && user.sisaCuti < diffDays) {
    return res.status(400).json({
      success: false,
      message: `Sisa kuota cuti tahunan tidak mencukupi (Tersisa: ${user.sisaCuti} hari, Pengajuan: ${diffDays} hari)`
    });
  }

  const newCuti = addCuti({
    pegawaiId: user.id,
    nip: user.nip,
    nama: user.nama,
    jabatan: user.jabatan,
    divisi: user.divisi,
    tanggalPengajuan: todayStr,
    tanggalMulai: formatDate(tanggalMulai),
    tanggalAkhir: formatDate(tanggalAkhir),
    jumlahHari: diffDays,
    jatahTahun: "2025",
    jenisCuti,
    alasan
  });

  res.status(201).json({
    success: true,
    message: 'Pengajuan cuti berhasil diajukan! Menunggu Verifikasi Tahap 1 dari Atasan Langsung.',
    data: newCuti
  });
});

// POST /api/cuti/:id/verify - Verifikasi 2 tahap oleh Verifikator 1 atau Verifikator 2
router.post('/:id/verify', (req, res) => {
  const { id } = req.params;
  const { tahap, action, verifikatorUser, catatan } = req.body;

  if (!tahap || !action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Parameter tahap (1 atau 2) dan action (approve atau reject) wajib diisi'
    });
  }

  const result = verifyCuti(id, parseInt(tahap, 10), {
    action,
    verifikatorUser,
    catatan
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  const actionText = action === 'approve' 
    ? (tahap === 2 ? 'disetujui secara FINAL' : 'disetujui dan diteruskan ke Verifikasi Tahap 2') 
    : 'ditolak';

  res.json({
    success: true,
    message: `Pengajuan cuti berhasil ${actionText}`,
    data: result.data
  });
});

// DELETE /api/cuti/:id - Pembatalan cuti oleh pemohon jika belum diverifikasi
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = cutiHistory.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Data cuti tidak ditemukan' });
  }

  if (cutiHistory[index].status !== 'menunggu_verif_1') {
    return res.status(400).json({ 
      success: false, 
      message: 'Hanya pengajuan cuti berstatus "Menunggu Verifikasi 1" yang dapat dibatalkan' 
    });
  }

  cutiHistory.splice(index, 1);
  res.json({
    success: true,
    message: 'Pengajuan cuti berhasil dibatalkan'
  });
});

export default router;

