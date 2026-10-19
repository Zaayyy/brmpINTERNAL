/**
 * Modul Penyimpanan Data & State Manager (LocalStorage)
 * Menangani persistensi data SPT, konfigurasi Menimbang & Dasar, Database Pegawai, dan Akun Pengguna
 */

const STORAGE_KEYS = {
  SPTS: "brmp_spt_list",
  MENIMBANG: "brmp_spt_menimbang",
  DASAR: "brmp_spt_dasar",
  PEGAWAI: "brmp_spt_pegawai",
  KLASIFIKASI: "brmp_spt_klasifikasi",
  USERS: "brmp_spt_users",
  CURRENT_USER: "brmp_spt_current_user",
  APP_CONFIG: "brmp_spt_config"
};

// Template Konsiderans Menimbang Resmi Standar Kementan BRMP DIY
const DEFAULT_MENIMBANG = [
  "bahwa dalam rangka optimalisasi pelaksanaan tugas dan fungsi penerapan standar instrumen pertanian pada Balai Penerapan Standar Instrumen Pertanian (BRMP) Daerah Istimewa Yogyakarta;",
  "bahwa untuk kelancaran pelaksanaan koordinasi, pendampingan, pengujian, serta diseminasi standar instrumen pertanian di wilayah kerja, dipandang perlu menugaskan personil yang berkompeten;",
  "bahwa pegawai yang namanya tercantum dalam Surat Perintah Tugas ini dinilai mampu dan memenuhi syarat untuk melaksanakan tugas kedinasan dimaksud."
];

// Template Konsiderans Dasar Hukum Resmi Standar Kementan BRMP DIY
const DEFAULT_DASAR = [
  "Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara;",
  "Peraturan Presiden Republik Indonesia Nomor 117 Tahun 2022 tentang Kementerian Pertanian;",
  "Peraturan Menteri Pertanian Republik Indonesia Nomor 13 Tahun 2023 tentang Organisasi dan Tata Kerja Kementerian Pertanian;",
  "Peraturan Menteri Pertanian tentang Tata Naskah Dinas di Lingkungan Kementerian Pertanian;",
  "Peraturan Menteri Keuangan Nomor 49/PMK.02/2023 tentang Standar Biaya Masukan Tahun Anggaran Berjalan;",
  "Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Penerapan Standar Instrumen Pertanian D.I. Yogyakarta Tahun Anggaran Berjalan."
];

// Helper untuk membuat avatar inisial nama
function generateAvatar(nama) {
  if (!nama) return "US";
  const clean = nama.replace(/^(Dr\.|Drs\.|Dra\.|Ir\.|Prof\.|H\.|Hj\.)\s+/i, "");
  const parts = clean.trim().split(/\s+/).filter(p => !p.includes(".") && !p.includes(","));
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].substring(0, 2).toUpperCase();
  return clean.substring(0, 2).toUpperCase();
}

// Generator Akun Pengguna untuk Seluruh Pegawai BRMP DIY
function generateUsersFromPegawai(pegawaiList) {
  const roleLabelMap = {
    admin_sekretariat: "Admin Sekretariat",
    kobag_tu: "Kobag TU (Approval Utama)",
    ketimker: "Ketimker (Ketua Tim Kerja)",
    kopoks: "Kopoks (Koordinator Poksi)",
    user: "User (Pemohon/Pegawai)"
  };

  if (!pegawaiList || !Array.isArray(pegawaiList)) return [];

  // 10 Pegawai Resmi Ketua Tim Kerja BRMP DIY
  const KETIMKER_NIPS = [
    "198108262011012006", // Diah Sulistyorini, SP, MP
    "198012072006042001", // Charisnalia Listyowati, SP., M.Sc
    "196807121999031001", // Widada, A.Md
    "197606072009011006", // Utomo Bimo Bekti, SP
    "197206181999032001", // Kurnianita Triwidiastuti, S.PI, MA
    "198003272009101001", // Agung Iswadi, S.Si , M.Sc
    "198302162011011008", // Eko Sutardi, SE
    "197106141992032001", // Yuni Pratiwi, S.ST., Ars
    "198106212006042002", // Asri Wijayanti, SE
    "198604092011012024"  // Dwi Dinia Rahayu, S.Kom, M.T.I
  ];

  return pegawaiList.map(p => {
    let emailPrefix = p.email ? p.email.split("@")[0].toLowerCase() : p.id.toLowerCase();
    let username = emailPrefix;
    let aliases = [];
    let role = p.roleDefault || "user";
    let password = "123456";

    // 10 Akun Ketua Tim Kerja Resmi
    if (KETIMKER_NIPS.includes(p.nip)) {
      role = "ketimker";
      password = "ketimker123";
      aliases.push("ketimker");
      if (p.nip === "198604092011012024") {
        username = "ketimker.sdm";
        aliases.push("dwi.dinia");
      } else if (p.nip === "197106141992032001") {
        aliases.push("yuni.pratiwi", "ketimker.tu");
      }
    } else if (p.nip === "199111042023212041" || p.id === "PEG-017") {
      // Novita Widiyanti (Admin Sekretariat)
      aliases.push("novita.widiyanti", "admin");
      username = "admin.sekretariat";
      role = "admin_sekretariat";
      password = "admin123";
    } else if (p.nip === "198906012015032004" || p.id === "PEG-004") {
      // Devi Eka Nuvitasari (User Pemohon)
      aliases.push("devi.eka", "user");
      username = "user.devi";
      role = "user";
      password = "user123";
    } else if (p.nip === "197402062000032001" || p.id === "PEG-034") {
      // Dr. Fibrianty (Kopoks)
      aliases.push("fibrianty", "kopoks");
      username = "kopoks.modernisasi";
      role = "kopoks";
      password = "kopoks123";
    } else if (p.nip === "198101312009121004" || p.id === "PEG-002") {
      // Agung Ariyanto (Kobag TU)
      aliases.push("agung.ariyanto", "kobag");
      username = "kobag.tu";
      role = "kobag_tu";
      password = "kobag123";
    }

    return {
      id: `usr-${p.id.toLowerCase()}`,
      pegawaiId: p.id,
      username: username,
      aliases: aliases,
      password: password,
      nama: p.nama,
      nip: p.nip,
      role: role,
      roleLabel: roleLabelMap[role] || "User (Pemohon/Pegawai)",
      jabatan: p.jabatan,
      golongan: p.golongan,
      unitKerja: p.unitKerja,
      email: p.email,
      avatar: generateAvatar(p.nama)
    };
  });
}

// Akun Pengguna Default untuk Seluruh Pegawai BRMP DIY (Semua pegawai memiliki akun user)
const DEFAULT_USERS = (typeof DATA_PEGAWAI_BRMP !== "undefined")
  ? generateUsersFromPegawai(DATA_PEGAWAI_BRMP)
  : [];

// Seed Data SPT Awal untuk Mendemonstrasikan Alur, Monitoring, dan Kasus Bentrok Jadwal
const DEFAULT_SEED_SPTS = [
  {
    id: "SPT-2026-001",
    nomorSpt: "B-142/KP.320/H.14.7/10/2026",
    klasifikasiId: "KLAS-03",
    klasifikasiNama: "Pendampingan Lapangan & Modernisasi Pertanian",
    tglPengajuan: "2026-09-20",
    tglMulai: "2026-10-01",
    tglSelesai: "2026-10-05",
    tujuanDaerah: "Kabupaten Kulon Progo (Kapanewon Sentolo & Nanggulan)",
    tempatTujuan: "Balai Penyuluhan Pertanian (BPP) Sentolo, Gapoktan Mandiri",
    untukMelaksanakan: "Melaksanakan bimbingan teknis penerapan standar budidaya padi organik dan modernisasi alsintan pompa air irigasi perpompaan.",
    pemohon: {
      id: "usr-pegawai",
      nama: "Devi Eka Nuvitasari, S.H.",
      nip: "198906012015032004",
      unitKerja: "Tim Kerja Pengelolaan Sumber Daya Manusia"
    },
    anggota: [
      {
        id: "PEG-004",
        nama: "Devi Eka Nuvitasari, S.H.",
        nip: "198906012015032004",
        jabatan: "Penelaah Teknis Kebijakan",
        golongan: "III/b",
        peranDalamTugas: "Penanggung Jawab"
      },
      {
        id: "PEG-055",
        nama: "Priyanto, SST",
        nip: "198206152009101002",
        jabatan: "Penyuluh Pertanian Ahli Muda",
        golongan: "III/c",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    status: "terbit",
    statusLabel: "SPT Terbit / Siap Cetak",
    fileSptTtdUrl: null, // akan diisi mock data atau link preview
    fileSptTtdName: "SPT_Resmi_B-142_Kementan_BRMP_DIY_ttd.pdf",
    fileLaporanUrl: null,
    fileLaporanName: null,
    timeline: [
      { waktu: "2026-09-20 09:15", aktor: "Devi Eka Nuvitasari, S.H.", aksi: "Pengajuan usulan SPT dibuat", status: "diajukan" },
      { waktu: "2026-09-20 11:30", aktor: "Dwi Dinia Rahayu, S.Kom, M.T.I", aksi: "Disetujui Ketua Tim Kerja (Approval Unit)", status: "approved_ketimker" },
      { waktu: "2026-09-21 08:45", aktor: "Agung Ariyanto, SEI., M.Ec., Dev.", aksi: "Disetujui Kobag TU (Approval Utama)", status: "approved_kobag_tu" },
      { waktu: "2026-09-21 10:00", aktor: "Yuni Pratiwi, S.ST., Ars", aksi: "Nomor SPT resmi B-142 diterbitkan & berkas ter-ttd diunggah", status: "terbit" }
    ],
    catatanKetimker: "Disetujui untuk pendampingan alsintan di Kulon Progo. Mohon koordinasi dengan BPP setempat.",
    catatanKobagTu: "Sesuai dengan target kinerja triwulan IV BRMP DIY. Lanjutkan.",
    tandaTanganPejabat: {
      nama: "Dr. Soeharsono, S.Pt, M.Si",
      nip: "197109271998031002",
      jabatan: "Kepala Balai Penerapan Standar Instrumen Pertanian DIY"
    }
  },
  {
    id: "SPT-2026-002",
    nomorSpt: "B-148/KP.320/H.14.7/10/2026",
    klasifikasiId: "KLAS-05",
    klasifikasiNama: "Pengambilan Sampel Uji Laboratorium",
    tglPengajuan: "2026-09-22",
    tglMulai: "2026-10-03",
    tglSelesai: "2026-10-04",
    tujuanDaerah: "Kabupaten Gunungkidul (Kapanewon Semin dan Ponjong)",
    tempatTujuan: "Lahan Demplot Uji Tanah & Pupuk Organik Kelompok Tani Subur Makmur",
    untukMelaksanakan: "Pengambilan sampel tanah dan pupuk organik terfermentasi untuk uji mutu laboratorium kimia tanah dan evaluasi standar baku mutu.",
    pemohon: {
      id: "usr-admin",
      nama: "Widada, A.Md",
      nip: "196807121999031001",
      unitKerja: "Laboratorium Pupuk, Tanah, dan Air"
    },
    anggota: [
      {
        id: "PEG-074",
        nama: "Widada, A.Md",
        nip: "196807121999031001",
        jabatan: "Pengawas Mutu Pakan Penyelia / Kepala Laboratorium",
        golongan: "III/c",
        peranDalamTugas: "Ketua Tim Pelaksana"
      },
      {
        id: "PEG-079",
        nama: "Gunawan Ari Kuncoro, Amd",
        nip: "198609052014031005",
        jabatan: "Operator Laboratorium",
        golongan: "III/b",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    status: "approved_kobag_tu",
    statusLabel: "Menunggu Penomoran & Cetak Sekretariat",
    fileSptTtdUrl: null,
    fileSptTtdName: null,
    fileLaporanUrl: null,
    fileLaporanName: null,
    timeline: [
      { waktu: "2026-09-22 10:00", aktor: "Widada, A.Md", aksi: "Pengajuan usulan SPT dibuat", status: "diajukan" },
      { waktu: "2026-09-22 14:20", aktor: "Widada, A.Md (Ketimker Lab)", aksi: "Disetujui Ketua Tim Kerja", status: "approved_ketimker" },
      { waktu: "2026-09-23 09:10", aktor: "Agung Ariyanto, SEI., M.Ec., Dev.", aksi: "Disetujui Kobag TU (Approval Utama)", status: "approved_kobag_tu" }
    ],
    catatanKetimker: "Sampel sangat dibutuhkan untuk validasi data pengujian instrumen laboratorium.",
    catatanKobagTu: "Disetujui. Pastikan kelengkapan alat uji pengambilan sampel steril.",
    tandaTanganPejabat: {
      nama: "Dr. Soeharsono, S.Pt, M.Si",
      nip: "197109271998031002",
      jabatan: "Kepala Balai Penerapan Standar Instrumen Pertanian DIY"
    }
  },
  {
    id: "SPT-2026-003",
    nomorSpt: null,
    klasifikasiId: "KLAS-06",
    klasifikasiNama: "Diseminasi & Penerapan Standar Instrumen Pertanian",
    tglPengajuan: "2026-09-25",
    tglMulai: "2026-10-12",
    tglSelesai: "2026-10-14",
    tujuanDaerah: "Kabupaten Bantul (Kapanewon Imogiri & Dlingo)",
    tempatTujuan: "Aula BPP Imogiri & Kelompok Tani Hutan Rakyat",
    untukMelaksanakan: "Sosialisasi dan diseminasi standar instrumen pupuk hayati dan pestisida nabati ramah lingkungan bagi penyuluh dan kelompok tani binaan.",
    pemohon: {
      id: "usr-pegawai",
      nama: "Devi Eka Nuvitasari, S.H.",
      nip: "198906012015032004",
      unitKerja: "Tim Kerja Pengelolaan Sumber Daya Manusia"
    },
    anggota: [
      {
        id: "PEG-065",
        nama: "Diah Sulistyorini, SP, MP",
        nip: "198108262011012006",
        jabatan: "Penyuluh Pertanian Ahli Muda",
        golongan: "III/d",
        peranDalamTugas: "Narasumber Teknis"
      },
      {
        id: "PEG-066",
        nama: "Ir. Ari Widyastuti",
        nip: "196209171987032007",
        jabatan: "Penyuluh Pertanian Ahli Utama",
        golongan: "IV/e",
        peranDalamTugas: "Pendamping Ahli"
      }
    ],
    status: "diajukan",
    statusLabel: "Menunggu Approval Ketimker",
    fileSptTtdUrl: null,
    fileSptTtdName: null,
    fileLaporanUrl: null,
    fileLaporanName: null,
    timeline: [
      { waktu: "2026-09-25 08:30", aktor: "Diah Sulistyorini, SP, MP", aksi: "Pengajuan usulan SPT dibuat", status: "diajukan" }
    ],
    catatanKetimker: null,
    catatanKobagTu: null,
    tandaTanganPejabat: {
      nama: "Dr. Soeharsono, S.Pt, M.Si",
      nip: "197109271998031002",
      jabatan: "Kepala Balai Penerapan Standar Instrumen Pertanian DIY"
    }
  },
  {
    id: "SPT-2026-004",
    nomorSpt: null,
    klasifikasiId: "KLAS-01",
    klasifikasiNama: "Perjalanan Dinas Dalam Daerah DIY",
    tglPengajuan: "2026-09-26",
    tglMulai: "2026-10-15",
    tglSelesai: "2026-10-16",
    tujuanDaerah: "Kota Yogyakarta & Kabupaten Sleman",
    tempatTujuan: "Dinas Pertanian dan Ketahanan Pangan DIY & Arsip Daerah",
    untukMelaksanakan: "Koordinasi pengelolaan arsip dinas, tertib tata persuratan kedinasan, dan pengelolaan rumah tangga kantor BRMP DIY.",
    unitKerja: "Tim Kerja Tata Usaha dan Rumah Tangga",
    targetKetimkerNip: "197106141992032001",
    targetKetimkerNama: "Yuni Pratiwi, S.ST., Ars",
    pemohon: {
      id: "usr-peg-016",
      nama: "Sinung Rustijarno, S.PI, M.SI",
      nip: "197207091999031001",
      unitKerja: "Tim Kerja Tata Usaha dan Rumah Tangga"
    },
    anggota: [
      {
        id: "PEG-016",
        nama: "Sinung Rustijarno, S.PI, M.SI",
        nip: "197207091999031001",
        jabatan: "Penelaah Teknis Kebijakan",
        golongan: "IV/b",
        unitKerja: "Tim Kerja Tata Usaha dan Rumah Tangga",
        peranDalamTugas: "Penanggung Jawab"
      },
      {
        id: "PEG-018",
        nama: "Putranto Wachyu Hidayat, S.H.",
        nip: "199510052025211008",
        jabatan: "Pranata Hubungan Masyarakat Ahli Pertama",
        golongan: "IX",
        unitKerja: "Tim Kerja Tata Usaha dan Rumah Tangga",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    status: "diajukan",
    statusLabel: "Menunggu Approval Ketimker",
    fileSptTtdUrl: null,
    fileSptTtdName: null,
    fileLaporanUrl: null,
    fileLaporanName: null,
    timeline: [
      { waktu: "2026-09-26 10:00", aktor: "Sinung Rustijarno, S.PI, M.SI", aksi: "Pengajuan usulan SPT dibuat oleh Sinung Rustijarno (Menunggu persetujuan Ketimker TU)", status: "diajukan" }
    ],
    catatanKetimker: null,
    catatanKobagTu: null,
    tandaTanganPejabat: {
      nama: "Dr. Soeharsono, S.Pt, M.Si",
      nip: "197109271998031002",
      jabatan: "Kepala Balai Penerapan Standar Instrumen Pertanian DIY"
    }
  }
];

const AppStorage = {
  // Inisialisasi awal localStorage jika belum ada data
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SPTS)) {
      localStorage.setItem(STORAGE_KEYS.SPTS, JSON.stringify(DEFAULT_SEED_SPTS));
    } else {
      // Pastikan seed data SPT-2026-004 masuk jika belum ada
      try {
        const currentSpts = JSON.parse(localStorage.getItem(STORAGE_KEYS.SPTS));
        if (Array.isArray(currentSpts) && !currentSpts.some(s => s.id === "SPT-2026-004")) {
          currentSpts.unshift(DEFAULT_SEED_SPTS[3]); // Tambahkan SPT-2026-004
          localStorage.setItem(STORAGE_KEYS.SPTS, JSON.stringify(currentSpts));
        }
      } catch (e) {}
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENIMBANG)) {
      localStorage.setItem(STORAGE_KEYS.MENIMBANG, JSON.stringify(DEFAULT_MENIMBANG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DASAR)) {
      localStorage.setItem(STORAGE_KEYS.DASAR, JSON.stringify(DEFAULT_DASAR));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PEGAWAI)) {
      localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(DATA_PEGAWAI_BRMP));
    }
    if (!localStorage.getItem(STORAGE_KEYS.KLASIFIKASI)) {
      localStorage.setItem(STORAGE_KEYS.KLASIFIKASI, JSON.stringify(KLASIFIKASI_SPT_DEFAULT));
    }
    // Users Management: Pastikan semua pegawai memiliki akun & 10 Ketimker resmi sinkron
    const KETIMKER_NIPS = [
      "198108262011012006", // Diah Sulistyorini, SP, MP
      "198012072006042001", // Charisnalia Listyowati, SP., M.Sc
      "196807121999031001", // Widada, A.Md
      "197606072009011006", // Utomo Bimo Bekti, SP
      "197206181999032001", // Kurnianita Triwidiastuti, S.PI, MA
      "198003272009101001", // Agung Iswadi, S.Si , M.Sc
      "198302162011011008", // Eko Sutardi, SE
      "197106141992032001", // Yuni Pratiwi, S.ST., Ars
      "198106212006042002", // Asri Wijayanti, SE
      "198604092011012024"  // Dwi Dinia Rahayu, S.Kom, M.T.I
    ];

    let currentUsersInStorage = null;
    try {
      const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      currentUsersInStorage = rawUsers ? JSON.parse(rawUsers) : null;
    } catch (e) {}

    let usersToSave = DEFAULT_USERS;
    if (currentUsersInStorage && Array.isArray(currentUsersInStorage) && currentUsersInStorage.length >= 50) {
      usersToSave = currentUsersInStorage.map(u => {
        if (KETIMKER_NIPS.includes(u.nip)) {
          u.role = "ketimker";
          u.roleLabel = "Ketimker (Ketua Tim Kerja)";
          if (!u.password || u.password === "123456" || u.password === "admin123" || u.password === "user123") {
            u.password = "ketimker123";
          }
        } else if (u.nip === "199111042023212041") {
          u.role = "admin_sekretariat";
          u.roleLabel = "Admin Sekretariat";
        }
        return u;
      });
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersToSave));

    // Sinkronkan juga current user jika sedang login sebagai salah satu ketimker
    const currentActive = this.getCurrentUser();
    if (currentActive && KETIMKER_NIPS.includes(currentActive.nip)) {
      currentActive.role = "ketimker";
      currentActive.roleLabel = "Ketimker (Ketua Tim Kerja)";
      this.setCurrentUser(currentActive);
    } else if (!currentActive) {
      const defaultActive = usersToSave.find(u => u.role === "ketimker") || usersToSave[0];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultActive));
    }
  },

  // SPT CRUD
  getSpts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SPTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Gagal membaca SPT dari storage", e);
      return [];
    }
  },

  getSptById(id) {
    const list = this.getSpts();
    return list.find(s => s.id === id) || null;
  },

  saveSpt(sptData) {
    const list = this.getSpts();
    const existingIndex = list.findIndex(s => s.id === sptData.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...sptData };
    } else {
      list.unshift(sptData);
    }
    localStorage.setItem(STORAGE_KEYS.SPTS, JSON.stringify(list));
    return sptData;
  },

  deleteSpt(id) {
    let list = this.getSpts();
    list = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SPTS, JSON.stringify(list));
    return true;
  },

  // Menimbang CRUD
  getMenimbang() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MENIMBANG);
      return data ? JSON.parse(data) : DEFAULT_MENIMBANG;
    } catch (e) {
      return DEFAULT_MENIMBANG;
    }
  },

  saveMenimbang(items) {
    localStorage.setItem(STORAGE_KEYS.MENIMBANG, JSON.stringify(items));
  },

  // Dasar CRUD
  getDasar() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DASAR);
      return data ? JSON.parse(data) : DEFAULT_DASAR;
    } catch (e) {
      return DEFAULT_DASAR;
    }
  },

  saveDasar(items) {
    localStorage.setItem(STORAGE_KEYS.DASAR, JSON.stringify(items));
  },

  // Pegawai Database CRUD
  getPegawai() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PEGAWAI);
      return data ? JSON.parse(data) : DATA_PEGAWAI_BRMP;
    } catch (e) {
      return DATA_PEGAWAI_BRMP;
    }
  },

  savePegawai(pegawaiList) {
    localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(pegawaiList));
  },

  addPegawai(pegawaiObj) {
    const list = this.getPegawai();
    list.push(pegawaiObj);
    this.savePegawai(list);

    // Otomatis buatkan akun pengguna untuk pegawai baru
    const users = this.getUsers();
    const existing = users.find(u => u.nip === pegawaiObj.nip || u.pegawaiId === pegawaiObj.id);
    if (!existing) {
      const emailPrefix = pegawaiObj.email ? pegawaiObj.email.split("@")[0].toLowerCase() : pegawaiObj.id.toLowerCase();
      users.push({
        id: `usr-${pegawaiObj.id.toLowerCase()}`,
        pegawaiId: pegawaiObj.id,
        username: emailPrefix,
        aliases: [],
        password: "user123",
        nama: pegawaiObj.nama,
        nip: pegawaiObj.nip,
        role: pegawaiObj.roleDefault || "user",
        roleLabel: "User (Pemohon/Pegawai)",
        jabatan: pegawaiObj.jabatan,
        golongan: pegawaiObj.golongan,
        unitKerja: pegawaiObj.unitKerja,
        email: pegawaiObj.email,
        avatar: generateAvatar(pegawaiObj.nama)
      });
      this.saveUsers(users);
    }
    return pegawaiObj;
  },

  updatePegawai(id, updatedObj) {
    const list = this.getPegawai();
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updatedObj };
      this.savePegawai(list);

      // Update juga di akun pengguna
      const users = this.getUsers();
      const uIdx = users.findIndex(u => u.pegawaiId === id || u.id === `usr-${id.toLowerCase()}`);
      if (uIdx >= 0) {
        users[uIdx].nama = updatedObj.nama || users[uIdx].nama;
        users[uIdx].nip = updatedObj.nip || users[uIdx].nip;
        users[uIdx].jabatan = updatedObj.jabatan || users[uIdx].jabatan;
        users[uIdx].unitKerja = updatedObj.unitKerja || users[uIdx].unitKerja;
        users[uIdx].golongan = updatedObj.golongan || users[uIdx].golongan;
        this.saveUsers(users);
      }
      return list[idx];
    }
    return null;
  },

  deletePegawai(id) {
    let list = this.getPegawai();
    list = list.filter(p => p.id !== id);
    this.savePegawai(list);

    // Hapus juga akun user terkait
    let users = this.getUsers();
    users = users.filter(u => u.pegawaiId !== id && u.id !== `usr-${id.toLowerCase()}`);
    this.saveUsers(users);
    return true;
  },

  // Klasifikasi CRUD
  getKlasifikasi() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KLASIFIKASI);
      return data ? JSON.parse(data) : KLASIFIKASI_SPT_DEFAULT;
    } catch (e) {
      return KLASIFIKASI_SPT_DEFAULT;
    }
  },

  saveKlasifikasi(list) {
    localStorage.setItem(STORAGE_KEYS.KLASIFIKASI, JSON.stringify(list));
  },

  // Users Management
  getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Current Active User & Auth Session
  getAuthSession() {
    try {
      const data = sessionStorage.getItem("brmp_spt_auth_session") || localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  getCurrentUser() {
    return this.getAuthSession();
  },

  setCurrentUser(user) {
    if (user) {
      sessionStorage.setItem("brmp_spt_auth_session", JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      sessionStorage.removeItem("brmp_spt_auth_session");
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  login(usernameOrNip, password) {
    const users = this.getUsers();
    const cleanQuery = (usernameOrNip || "").trim().toLowerCase();
    const cleanNip = (usernameOrNip || "").replace(/\s+/g, "");
    
    const user = users.find(u => 
      (u.username && u.username.toLowerCase() === cleanQuery) || 
      (u.aliases && u.aliases.some(a => a.toLowerCase() === cleanQuery)) ||
      (u.email && u.email.toLowerCase().startsWith(cleanQuery)) ||
      (u.nip && u.nip.replace(/\s+/g, "") === cleanNip)
    );

    if (!user) {
      return { success: false, message: "Username atau NIP tidak terdaftar di sistem BRMP DIY!" };
    }

    // Password valid jika sesuai password akun, atau master default: "123456", "user123", "admin123", "brmp123", atau sama dengan NIP
    const isValidPassword = !user.password ||
      user.password === password ||
      password === "123456" ||
      password === "user123" ||
      password === "admin123" ||
      password === "brmp123" ||
      password === user.nip;

    if (!isValidPassword) {
      return { success: false, message: "Kata sandi yang Anda masukkan salah!" };
    }

    this.setCurrentUser(user);
    return { success: true, user: user };
  },

  logout() {
    sessionStorage.removeItem("brmp_spt_auth_session");
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return true;
  },

  // Reset Data ke Awal (Fitur berguna untuk demonstrasi)
  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.SPTS, JSON.stringify(DEFAULT_SEED_SPTS));
    localStorage.setItem(STORAGE_KEYS.MENIMBANG, JSON.stringify(DEFAULT_MENIMBANG));
    localStorage.setItem(STORAGE_KEYS.DASAR, JSON.stringify(DEFAULT_DASAR));
    localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(DATA_PEGAWAI_BRMP));
    localStorage.setItem(STORAGE_KEYS.KLASIFIKASI, JSON.stringify(KLASIFIKASI_SPT_DEFAULT));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    sessionStorage.removeItem("brmp_spt_auth_session");
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return true;
  }
};

// Jalankan inisialisasi saat file dimuat
AppStorage.init();
