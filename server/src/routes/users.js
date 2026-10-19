import { Router } from 'express';
import { users, updateUserRole } from '../data/store.js';

const router = Router();

// GET /api/users - Ambil semua user/pegawai
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: users.map(u => ({
      id: u.id,
      nip: u.nip,
      nama: u.nama,
      jabatan: u.jabatan,
      divisi: u.divisi,
      systemRole: u.systemRole,
      approvalRole: u.approvalRole,
      roleLabel: u.roleLabel,
      sisaCuti: u.sisaCuti,
      cutiTerpakai: u.cutiTerpakai || 0,
      expiredCuti: u.expiredCuti
    }))
  });
});

// PUT /api/users/:id/role - Admin mengganti role pegawai
router.put('/:id/role', (req, res) => {
  const { id } = req.params;
  const { systemRole, approvalRole } = req.body;

  if (!approvalRole && !systemRole) {
    return res.status(400).json({
      success: false,
      message: 'systemRole atau approvalRole wajib dikirim'
    });
  }

  const updatedUser = updateUserRole(id, { systemRole, approvalRole });

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: `User dengan ID/NIP ${id} tidak ditemukan`
    });
  }

  res.json({
    success: true,
    message: `Role untuk pegawai ${updatedUser.nama} berhasil diperbarui menjadi ${updatedUser.roleLabel}`,
    data: updatedUser
  });
});

export default router;
