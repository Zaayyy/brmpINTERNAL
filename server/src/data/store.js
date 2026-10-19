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

