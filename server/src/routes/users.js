import { Router } from 'express';
import { users, updateUserRole } from '../data/store.js';

const router = Router();

// GET /api/users - Ambil semua user/pegawai
router.get('/', (req, res) => {
  res.json({
    success: true,
    total: users.length,
    data: users.map(u => ({
      id: u.id,
      nip: u.nip,
      nama: u.nama,
      jabatan: u.jabatan,
      golongan: u.golongan || '',
      divisi: u.divisi,
      systemRole: u.systemRole,
      approvalRole: u.approvalRole,
      roleLabel: u.roleLabel,
      pinMesin: u.pinMesin || '',
      sisaCuti: u.sisaCuti,
      cutiTerpakai: u.cutiTerpakai || 0,
      expiredCuti: u.expiredCuti
    }))
  });
});

// PUT /api/users/:id/role - Admin mengganti role & PIN mesin pegawai
router.put('/:id/role', (req, res) => {
  const { id } = req.params;
  const { systemRole, approvalRole, pinMesin } = req.body;

  if (!approvalRole && !systemRole && pinMesin === undefined) {
    return res.status(400).json({
      success: false,
      message: 'systemRole, approvalRole, atau pinMesin wajib dikirim'
    });
  }

  const updatedUser = updateUserRole(id, { systemRole, approvalRole, pinMesin });

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: `User dengan ID/NIP ${id} tidak ditemukan`
    });
  }

  res.json({
    success: true,
    message: `Data pegawai ${updatedUser.nama} berhasil diperbarui (Role: ${updatedUser.roleLabel}, PIN Mesin: ${updatedUser.pinMesin})`,
    data: updatedUser
  });
});

// PUT /api/users/profile - Pegawai update profil/password/foto
router.put('/profile', (req, res) => {
  const { nip, userId, noHp, email, alamat, oldPassword, newPassword, fotoProfil } = req.body;
  const targetId = nip || userId;
  const user = users.find(u => u.nip === targetId || u.id === targetId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan' });
  }
  if (noHp !== undefined) user.noHp = noHp;
  if (email !== undefined) user.email = email;
  if (alamat !== undefined) user.alamat = alamat;
  if (fotoProfil !== undefined) user.fotoProfil = fotoProfil;
  if (newPassword) user.passwordDefaultYear = newPassword;

  res.json({
    success: true,
    message: 'Profil berhasil diperbarui!',
    data: user
  });
});

export default router;

