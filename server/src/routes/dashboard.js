import { Router } from 'express';
import { users, agendaList } from '../data/store.js';

const router = Router();

// GET /api/dashboard
router.get('/', (req, res) => {
  const user = users[0];

  res.json({
    success: true,
    data: {
      user: {
        nama: user.nama,
        nip: user.nip,
        jabatan: user.jabatan,
        divisi: user.divisi
      },
      hariTanggal: "Kamis, 12 Juni 2025",
      jamKerja: user.jamKerja,
      jamMasuk: user.jamMasuk,
      jamPulang: user.jamPulang,
      sisaCuti: user.sisaCuti,
      persentaseCuti: "100%",
      agenda: agendaList
    }
  });
});

export default router;
