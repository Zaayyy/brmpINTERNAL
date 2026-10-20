import { Router } from 'express';
import { users, updateUserRole, addUser, updateUser, deleteUser } from '../data/store.js';

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
      expiredCuti: u.expiredCuti,
      fotoProfil: u.fotoProfil || '',
      noHp: u.noHp || '',
      email: u.email || '',
      alamat: u.alamat || ''
    }))
  });
});

// POST /api/users - Tambah pegawai baru
router.post('/', (req, res) => {
  const { nip, nama, jabatan, golongan, divisi, systemRole, approvalRole, pinMesin, sisaCuti } = req.body;

  if (!nip || !nama) {
    return res.status(400).json({
      success: false,
      message: 'NIP dan Nama Pegawai wajib diisi'
    });
  }

  // Check if NIP already exists
  const existing = users.find(u => u.nip === String(nip).trim());
  if (existing) {
    return res.status(400).json({
      success: false,
      message: `Pegawai dengan NIP ${nip} sudah terdaftar (${existing.nama})`
    });
  }

  const newUser = addUser({
    nip,
    nama,
    jabatan,
    golongan,
    divisi,
    systemRole,
    approvalRole,
    pinMesin,
    sisaCuti
  });

  res.status(201).json({
    success: true,
    message: `Pegawai baru ${newUser.nama} berhasil ditambahkan`,
    data: newUser
  });
});

// PUT /api/users/profile - Pegawai update profil/password/foto
router.put('/profile', (req, res) => {
  const { nip, userId, noHp, email, alamat, oldPassword, newPassword, fotoProfil } = req.body;
  const targetId = nip || userId;
  
  const updateData = {};
  if (noHp !== undefined) updateData.noHp = noHp;
  if (email !== undefined) updateData.email = email;
  if (alamat !== undefined) updateData.alamat = alamat;
  if (fotoProfil !== undefined) updateData.fotoProfil = fotoProfil;
  if (newPassword) updateData.passwordDefaultYear = newPassword;

  const updatedUser = updateUser(targetId, updateData);
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan' });
  }

  res.json({
    success: true,
    message: 'Profil berhasil diperbarui & disimpan di sistem!',
    data: updatedUser
  });
});

// PUT /api/users/:id - Update data pegawai
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = updateUser(id, req.body);

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: `Pegawai dengan ID/NIP ${id} tidak ditemukan`
    });
  }

  res.json({
    success: true,
    message: `Data pegawai ${updatedUser.nama} berhasil diperbarui`,
    data: updatedUser
  });
});

// DELETE /api/users/:id - Hapus data pegawai
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteUser(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: `Pegawai dengan ID/NIP ${id} tidak ditemukan`
    });
  }

  res.json({
    success: true,
    message: `Pegawai ${deleted.nama} berhasil dihapus dari sistem`,
    data: deleted
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

  // Proteksi: Akun Administrator Kepegawaian tidak boleh diturunkan rolenya
  if ((id === 'PEG-ADM' || id === '198001012005011001') && (systemRole === 'pegawai' || (approvalRole && approvalRole !== 'admin'))) {
    return res.status(400).json({
      success: false,
      message: 'Role Administrator Kepegawaian (PEG-ADM) dilindungi dan tidak dapat diubah menjadi pegawai biasa.'
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

export default router;

