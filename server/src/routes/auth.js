import { Router } from 'express';
import { users } from '../data/store.js';

const router = Router();

// POST /api/auth/login
// Support login with NIP and password (default: birth year)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username (NIP) dan Password wajib diisi'
    });
  }

  const cleanUsername = String(username).trim();

  // Find user or allow demo login matching NIP or username
  const user = users.find(u => 
    u.nip === cleanUsername || 
    (cleanUsername === '199808062014032001' && u.nip === '198808062014032001') ||
    (cleanUsername === '198808062014032001' && u.nip === '199808062014032001') ||
    (cleanUsername.toLowerCase() === 'admin' && u.systemRole === 'admin')
  );

  if (user) {
    const validPasswords = [user.passwordDefaultYear, 'admin', '123456', '1998', '1980', '1986', '1981', '1989', '1971'];
    if (validPasswords.includes(password) || password === user.passwordDefaultYear) {
      return res.json({
        success: true,
        message: `Login berhasil sebagai ${user.roleLabel}`,
        data: {
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
          fotoProfil: user.fotoProfil || null,
          noHp: user.noHp || '',
          email: user.email || '',
          alamat: user.alamat || '',
          token: `token-brmp-${user.id}-${Date.now()}`
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Password salah. Gunakan tahun lahir (misal: 1980, 1998, 1986, 1981) atau "admin".'
      });
    }
  }

  // Allow flexible demo login for testing with any NIP
  if (cleanUsername.length >= 4) {
    return res.json({
      success: true,
      message: 'Login berhasil (Akun Pegawai)',
      data: {
        id: "PEG-DEMO",
        nip: cleanUsername,
        nama: "PEGAWAI BRMP DIY",
        jabatan: "Staf Teknis",
        divisi: "Balai Penerapan Standar Instrumen Pertanian",
        systemRole: "pegawai",
        approvalRole: "pemohon",
        roleLabel: "Pegawai (Pemohon Cuti)",
        sisaCuti: 12,
        cutiTerpakai: 0,
        expiredCuti: "31-12-2026",
        token: `token-brmp-demo-${Date.now()}`
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'NIP tidak ditemukan. Contoh: 199808062014032001 atau username admin'
  });
});

export default router;
