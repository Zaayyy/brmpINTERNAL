import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pegawaiJsonPath = path.join(__dirname, 'pegawaiData.json');

// In-memory data store for BRMP DIY loaded from official employee database
export let users = [];
try {
  if (fs.existsSync(pegawaiJsonPath)) {
    users = JSON.parse(fs.readFileSync(pegawaiJsonPath, 'utf8'));
  }
} catch (err) {
  console.error('[Store] Failed loading pegawaiData.json, using fallback:', err.message);
}

if (!users || users.length === 0) {
  users = [
    {
      id: "PEG-ADM",
      nip: "198001012005011001",
      passwordDefaultYear: "1980",
      nama: "ADMINISTRATOR KEPEGAWAIAN",
      jabatan: "Pranata Komputer Ahli Muda / Admin Kepegawaian",
      divisi: "Sub Bagian Tata Usaha & Kepegawaian",
      systemRole: "admin",
      approvalRole: "admin",
      roleLabel: "Administrator Kepegawaian",
      pinMesin: "999",
      sisaCuti: 12,
      cutiTerpakai: 0,
      expiredCuti: "31-12-2026",
      jamMasuk: "07:15:00",
      jamPulang: "16:00:00",
      jamKerja: "07:30:00 - 16:00:00"
    }
  ];
}

const adminIdx = users.findIndex(u => u.nip === "198001012005011001" || u.id === "PEG-ADM");
if (adminIdx === -1) {
  users.unshift({
    id: "PEG-ADM",
    nip: "198001012005011001",
    passwordDefaultYear: "1980",
    nama: "ADMINISTRATOR KEPEGAWAIAN",
    jabatan: "Pranata Komputer Ahli Muda / Admin Kepegawaian",
    divisi: "Sub Bagian Tata Usaha & Kepegawaian",
    systemRole: "admin",
    approvalRole: "admin",
    roleLabel: "Administrator Kepegawaian",
    pinMesin: "999",
    sisaCuti: 12,
    cutiTerpakai: 0,
    expiredCuti: "31-12-2026",
    jamMasuk: "07:15:00",
    jamPulang: "16:00:00",
    jamKerja: "07:30:00 - 16:00:00"
  });
} else {
  users[adminIdx].systemRole = "admin";
  users[adminIdx].approvalRole = "admin";
  users[adminIdx].roleLabel = "Administrator Kepegawaian";
}

export const updateUserRole = (userId, { systemRole, approvalRole, pinMesin }) => {
  const index = users.findIndex(u => String(u.id) === String(userId) || u.nip === String(userId));
  if (index !== -1) {
    if (systemRole) users[index].systemRole = systemRole;
    if (pinMesin !== undefined) users[index].pinMesin = String(pinMesin).trim();
    if (approvalRole) {
      users[index].approvalRole = approvalRole;
      if (approvalRole === 'admin') users[index].roleLabel = 'Administrator Kepegawaian';
      else if (approvalRole === 'verifikator_1') users[index].roleLabel = 'Verifikator 1 (Ketua Tim Kerja)';
      else if (approvalRole === 'verifikator_2') users[index].roleLabel = 'Verifikator 2 (Kepala Bagian TU)';
      else users[index].roleLabel = 'Pegawai (Pemohon Cuti)';
    }

    try {
      fs.writeFileSync(pegawaiJsonPath, JSON.stringify(users, null, 2), 'utf8');
    } catch (e) {
      console.error('[Store] Failed saving updated users:', e.message);
    }

    return users[index];
  }
  return null;
};

export const addUser = (userData) => {
  const newId = `PEG-${String(users.length + 1).padStart(3, '0')}`;
  const newUser = {
    id: newId,
    nip: String(userData.nip || '').trim(),
    nama: String(userData.nama || '').trim(),
    jabatan: String(userData.jabatan || 'Staf Pelaksana').trim(),
    golongan: String(userData.golongan || 'III/a').trim(),
    divisi: String(userData.divisi || 'Balai Penerapan Modernisasi Pertanian DIY').trim(),
    systemRole: userData.systemRole || 'pegawai',
    approvalRole: userData.approvalRole || 'pemohon',
    roleLabel: userData.roleLabel || (userData.systemRole === 'admin' ? 'Administrator Kepegawaian' : 'Pegawai (Pemohon Cuti)'),
    pinMesin: String(userData.pinMesin || (users.length + 1)).trim(),
    sisaCuti: Number(userData.sisaCuti) || 12,
    cutiTerpakai: 0,
    expiredCuti: "31-12-2026",
    passwordDefaultYear: userData.passwordDefaultYear || "1990",
    jamKerja: "07:30:00 - 16:00:00"
  };

  users.unshift(newUser);

  try {
    fs.writeFileSync(pegawaiJsonPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('[Store] Failed saving new user:', e.message);
  }

  return newUser;
};

export const updateUser = (userId, updatedFields) => {
  const cleanId = String(userId || '').trim();
  let index = users.findIndex(u => String(u.id) === cleanId || u.nip === cleanId);

  // Fallback alias resolution for Agnita (1988 vs 1998, PEG-001 vs PEG-013) or name matching
  if (index === -1) {
    if (cleanId === '198808062014032001' || cleanId === '199808062014032001' || cleanId === 'PEG-001' || cleanId === 'PEG-013') {
      index = users.findIndex(u => u.nip === '198808062014032001' || u.nip === '199808062014032001' || u.nama?.toLowerCase().includes('agnita'));
    }
  }

  if (index !== -1) {
    users[index] = {
      ...users[index],
      ...updatedFields,
      id: users[index].id, // preserve id
    };

    try {
      fs.writeFileSync(pegawaiJsonPath, JSON.stringify(users, null, 2), 'utf8');
    } catch (e) {
      console.error('[Store] Failed saving updated user:', e.message);
    }
    return users[index];
  }
  return null;
};

export const deleteUser = (userId) => {
  const index = users.findIndex(u => String(u.id) === String(userId) || u.nip === String(userId));
  if (index !== -1) {
    const deleted = users.splice(index, 1)[0];
    try {
      fs.writeFileSync(pegawaiJsonPath, JSON.stringify(users, null, 2), 'utf8');
    } catch (e) {
      console.error('[Store] Failed saving after delete:', e.message);
    }
    return deleted;
  }
  return null;
};

export let instansiSettings = {
  namaBalai: "Balai Besar Penerapan Modernisasi Pertanian Daerah Istimewa Yogyakarta",
  kementerian: "Kementerian Pertanian Republik Indonesia",
  lokasiKantor: "Kotagede, Yogyakarta",
  radiusGps: 200,
  latitude: -7.8285,
  longitude: 110.3985,
  jamMasuk: "07:30:00",
  jamPulang: "16:00:00",
  toleransiTerlambatMenit: 15,
  kepalaBalai: "Dr. Soeharsono, S.Pt, M.Si",
  nipKepala: "197109271998031002"
};

export const updateInstansiSettings = (newSettings) => {
  instansiSettings = { ...instansiSettings, ...newSettings };
  return instansiSettings;
};

export let disposisiList = [
  { id: "DSP-001", noSurat: "042/KP.010/H.11/06/2025", perihal: "Penugasan Pendampingan Sertifikasi Benih Padi di Sleman", asalSurat: "Direktorat Perbenihan Kementan", tanggal: "2025-06-10", sifat: "Penting / Segera", instruksi: "Tindak lanjuti dengan pembuatan SPT 3 Personil teknis", status: "Diproses", penerima: "Ketua Tim Kerja SDM" },
  { id: "DSP-002", noSurat: "115/OT.050/H.11/06/2025", perihal: "Evaluasi Pelaksanaan Standar Laboratorium Uji Tanah", asalSurat: "BSIP Nasional", tanggal: "2025-06-11", sifat: "Biasa", instruksi: "Siapkan laporan audit internal dan sampel tanah", status: "Selesai", penerima: "Tim Kerja Pengujian" },
  { id: "DSP-003", noSurat: "089/HM.120/H.11/06/2025", perihal: "Undangan Rapat Koordinasi Modernisasi Alsintan DIY", asalSurat: "Dinas Pertanian dan Ketahanan Pangan DIY", tanggal: "2025-06-12", sifat: "Sangat Segera", instruksi: "Hadiri dan laporkan hasil rapat kepada Kepala Balai", status: "Menunggu", penerima: "Kobag TU" }
];

export const agendaList = [
  { id: 1, date: "2025-06-02", title: "Upacara Hari Lahir Pancasila", type: "event" },
  { id: 2, date: "2025-06-05", title: "Rapat Koordinasi Penerapan Standar", type: "meeting" },
  { id: 3, date: "2025-06-12", title: "Evaluasi Kinerja Triwulan II", type: "meeting" },
  { id: 4, date: "2025-06-19", title: "Bimbingan Teknis Standarisasi Benih", type: "training" },
  { id: 5, date: "2025-06-25", title: "Kunjungan Lapangan Pertanian Modern", type: "field" }
];

export const generateMonthlyAbsensi = (bulan = 6, tahun = 2025) => {
  const daysInMonth = new Date(tahun, bulan, 0).getDate();
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const list = [];
  let totalMasuk = 0;
  let terlambat = 0;
  let sakit = 0;
  let izin = 0;
  let alpha = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(tahun, bulan - 1, d);
    const dayOfWeek = curDate.getDay();
    const dateStr = `${tahun}-${String(bulan).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayName = dayNames[dayOfWeek];

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      list.push({
        tanggal: dateStr,
        hari: dayName,
        tglNo: d,
        status: "Libur",
        jamMasuk: "-",
        jamPulang: "-"
      });
    } else if (d === 10) {
      terlambat++;
      totalMasuk++;
      list.push({
        tanggal: dateStr,
        hari: dayName,
        tglNo: d,
        status: "Terlambat",
        jamMasuk: "07:48:12",
        jamPulang: "16:15:20"
      });
    } else if (d > 20 && bulan === 6 && d === 23) {
      alpha++;
      list.push({
        tanggal: dateStr,
        hari: dayName,
        tglNo: d,
        status: "Alpha",
        jamMasuk: "-",
        jamPulang: "-"
      });
    } else {
      totalMasuk++;
      const minute = String(10 + (d % 20)).padStart(2, '0');
      const second = String(15 + (d * 3 % 40)).padStart(2, '0');
      list.push({
        tanggal: dateStr,
        hari: dayName,
        tglNo: d,
        status: "Masuk",
        jamMasuk: `07:${minute}:${second}`,
        jamPulang: `16:${minute}:${second}`
      });
    }
  }

  return {
    rekap: {
      totalMasuk,
      terlambat,
      sakit,
      izin,
      alpha
    },
    harian: list
  };
};

export const yearlyChartData = {
  labels: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
  datasets: [
    {
      label: "Masuk",
      data: [21, 20, 22, 19, 21, 20, 22, 21, 20, 23, 21, 20],
      backgroundColor: "#2563eb"
    },
    {
      label: "Terlambat",
      data: [1, 2, 0, 1, 2, 1, 0, 1, 2, 0, 1, 0],
      backgroundColor: "#f59e0b"
    },
    {
      label: "Izin",
      data: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
      backgroundColor: "#06b6d4"
    },
    {
      label: "Sakit",
      data: [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      backgroundColor: "#8b5cf6"
    },
    {
      label: "Alpha",
      data: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      backgroundColor: "#ef4444"
    }
  ]
};

// Cuti History with 2-Stage Verification Workflow:
// Status: 'menunggu_verif_1' -> 'menunggu_verif_2' -> 'disetujui' (or 'ditolak_verif_1' / 'ditolak_verif_2')
export let cutiHistory = [
  {
    id: "CUTI-2025-001",
    no: 1,
    pegawaiId: "PEG-001",
    nip: "199808062014032001",
    nama: "AGNITA VERDIANI PUTRI, A.Md.",
    jabatan: "Pengelola Standardisasi Teknis",
    divisi: "Balai Penerapan Standar Instrumen Pertanian DIY",
    tanggalPengajuan: "12-06-2025",
    tanggalMulai: "16-06-2025",
    tanggalAkhir: "17-06-2025",
    jumlahHari: 2,
    jatahTahun: "2025",
    jenisCuti: "Tahunan",
    alasan: "Keperluan keluarga di luar kota",
    status: "menunggu_verif_1",
    statusLabel: "Menunggu Verifikasi 1 (Atasan Langsung)",
    verifikasi: {
      tahap1: {
        roleRequired: "verifikator_1",
        label: "Verifikasi 1: Atasan Langsung / Ketimker",
        status: "menunggu", // 'menunggu' | 'disetujui' | 'ditolak'
        verifikatorNama: "Dwi Dinia Rahayu, S.Kom, M.T.I",
        verifikatorNip: "198604092011012024",
        tanggal: null,
        catatan: ""
      },
      tahap2: {
        roleRequired: "verifikator_2",
        label: "Verifikasi 2: Kepala Bagian TU (Final)",
        status: "menunggu", // 'menunggu' | 'disetujui' | 'ditolak'
        verifikatorNama: "Agung Ariyanto, SEI., M.Ec., Dev.",
        verifikatorNip: "198101312009121004",
        tanggal: null,
        catatan: ""
      }
    }
  },
  {
    id: "CUTI-2025-002",
    no: 2,
    pegawaiId: "PEG-004",
    nip: "198906012015032004",
    nama: "Devi Eka Nuvitasari, S.H.",
    jabatan: "Penelaah Teknis Kebijakan",
    divisi: "Tim Kerja Pengelolaan Sumber Daya Manusia",
    tanggalPengajuan: "05-06-2025",
    tanggalMulai: "09-06-2025",
    tanggalAkhir: "10-06-2025",
    jumlahHari: 2,
    jatahTahun: "2025",
    jenisCuti: "Tahunan",
    alasan: "Menghadiri wisuda anggota keluarga",
    status: "menunggu_verif_2",
    statusLabel: "Menunggu Verifikasi 2 (Kepala TU / Balai)",
    verifikasi: {
      tahap1: {
        roleRequired: "verifikator_1",
        label: "Verifikasi 1: Atasan Langsung / Ketimker",
        status: "disetujui",
        verifikatorNama: "Dwi Dinia Rahayu, S.Kom, M.T.I",
        verifikatorNip: "198604092011012024",
        tanggal: "06-06-2025 09:30",
        catatan: "Disetujui. Koordinasi tugas pengganti sudah siap."
      },
      tahap2: {
        roleRequired: "verifikator_2",
        label: "Verifikasi 2: Kepala Bagian TU (Final)",
        status: "menunggu",
        verifikatorNama: "Agung Ariyanto, SEI., M.Ec., Dev.",
        verifikatorNip: "198101312009121004",
        tanggal: null,
        catatan: ""
      }
    }
  }
];

export const addCuti = (cutiItem) => {
  const newNum = cutiHistory.length + 1;
  const newId = `CUTI-2025-${String(newNum).padStart(3, '0')}`;

  const newItem = {
    id: newId,
    no: newNum,
    ...cutiItem,
    status: "menunggu_verif_1",
    statusLabel: "Menunggu Verifikasi 1 (Atasan Langsung)",
    verifikasi: {
      tahap1: {
        roleRequired: "verifikator_1",
        label: "Verifikasi 1: Atasan Langsung / Ketimker",
        status: "menunggu",
        verifikatorNama: "-",
        verifikatorNip: "-",
        tanggal: null,
        catatan: ""
      },
      tahap2: {
        roleRequired: "verifikator_2",
        label: "Verifikasi 2: Kepala Bagian TU (Final)",
        status: "menunggu",
        verifikatorNama: "-",
        verifikatorNip: "-",
        tanggal: null,
        catatan: ""
      }
    }
  };
  cutiHistory.unshift(newItem);
  return newItem;
};

export const verifyCuti = (id, tahap, { action, verifikatorUser, catatan = '' }) => {
  const item = cutiHistory.find(c => c.id === id);
  if (!item) return { success: false, message: 'Data cuti tidak ditemukan' };

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (tahap === 1) {
    if (action === 'approve') {
      item.verifikasi.tahap1.status = 'disetujui';
      item.verifikasi.tahap1.tanggal = dateStr;
      item.verifikasi.tahap1.verifikatorNama = verifikatorUser?.nama || 'Verifikator 1';
      item.verifikasi.tahap1.verifikatorNip = verifikatorUser?.nip || '-';
      item.verifikasi.tahap1.catatan = catatan || 'Disetujui oleh Atasan Langsung';

      // Maju ke tahap 2
      item.status = 'menunggu_verif_2';
      item.statusLabel = 'Menunggu Verifikasi 2 (Kepala TU / Balai)';
    } else {
      item.verifikasi.tahap1.status = 'ditolak';
      item.verifikasi.tahap1.tanggal = dateStr;
      item.verifikasi.tahap1.verifikatorNama = verifikatorUser?.nama || 'Verifikator 1';
      item.verifikasi.tahap1.verifikatorNip = verifikatorUser?.nip || '-';
      item.verifikasi.tahap1.catatan = catatan || 'Pengajuan ditolak pada verifikasi tahap 1';

      item.status = 'ditolak_verif_1';
      item.statusLabel = 'Ditolak oleh Verifikator 1';
    }
    return { success: true, data: item };
  }

  if (tahap === 2) {
    if (item.status !== 'menunggu_verif_2') {
      return { success: false, message: 'Pengajuan cuti ini belum disetujui pada Verifikasi Tahap 1' };
    }

    if (action === 'approve') {
      item.verifikasi.tahap2.status = 'disetujui';
      item.verifikasi.tahap2.tanggal = dateStr;
      item.verifikasi.tahap2.verifikatorNama = verifikatorUser?.nama || 'Verifikator 2';
      item.verifikasi.tahap2.verifikatorNip = verifikatorUser?.nip || '-';
      item.verifikasi.tahap2.catatan = catatan || 'Disetujui secara final oleh Kepala Bagian TU';

      // Selesai disetujui final
      item.status = 'disetujui';
      item.statusLabel = 'Disetujui Lengkap (Final)';

      // Potong sisa cuti pegawai jika cuti tahunan
      const peg = users.find(u => u.nip === item.nip || String(u.id) === String(item.pegawaiId));
      if (peg && item.jenisCuti === 'Tahunan') {
        const days = parseInt(item.jumlahHari, 10) || 1;
        peg.sisaCuti = Math.max(0, peg.sisaCuti - days);
        peg.cutiTerpakai = (peg.cutiTerpakai || 0) + days;
      }
    } else {
      item.verifikasi.tahap2.status = 'ditolak';
      item.verifikasi.tahap2.tanggal = dateStr;
      item.verifikasi.tahap2.verifikatorNama = verifikatorUser?.nama || 'Verifikator 2';
      item.verifikasi.tahap2.verifikatorNip = verifikatorUser?.nip || '-';
      item.verifikasi.tahap2.catatan = catatan || 'Pengajuan ditolak pada verifikasi tahap 2';

      item.status = 'ditolak_verif_2';
      item.statusLabel = 'Ditolak oleh Verifikator 2 (Kepala TU)';
    }
    return { success: true, data: item };
  }

  return { success: false, message: 'Tahap verifikasi tidak valid' };
};

