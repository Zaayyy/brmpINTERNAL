import { DATA_PEGAWAI_BRMP } from './pegawai.js';

export const KLASIFIKASI_SPT_DEFAULT = [
  { id: "KLAS-01", kode: "01/PD-LOKAL", nama: "Perjalanan Dinas Dalam Daerah DIY", kategori: "Operasional Rutin" },
  { id: "KLAS-02", kode: "02/PD-LUAR", nama: "Perjalanan Dinas Luar Daerah / Nasional", kategori: "Koordinasi / Diklat" },
  { id: "KLAS-03", kode: "03/PENDAMPINGAN", nama: "Pendampingan Lapangan & Modernisasi Pertanian", kategori: "Teknis Substantif" },
  { id: "KLAS-04", kode: "04/UJI-TEK", nama: "Pengujian Teknologi Spesifik Lokasi", kategori: "Teknis Substantif" },
  { id: "KLAS-05", kode: "05/PENGAMBILAN-SAMPEL", nama: "Pengambilan Sampel Uji Laboratorium", kategori: "Laboratorium" },
  { id: "KLAS-06", kode: "06/DISEMINASI", nama: "Diseminasi & Penerapan Standar Instrumen Pertanian", kategori: "Diseminasi" },
  { id: "KLAS-07", kode: "07/UPBS-KP", nama: "Pengawasan Benih Sumber & Operasional KP Banyakan", kategori: "Operasional Lapangan" },
  { id: "KLAS-08", kode: "08/RAPAT-KEMEN", nama: "Rapat Kerja / Koordinasi Kementerian Pertanian", kategori: "Pimpinan / Manajerial" }
];

export let DEFAULT_MENIMBANG = [
  "bahwa dalam rangka optimalisasi pelaksanaan tugas dan fungsi penerapan standar instrumen pertanian pada Balai Penerapan Standar Instrumen Pertanian (BRMP) Daerah Istimewa Yogyakarta;",
  "bahwa untuk kelancaran pelaksanaan koordinasi, pendampingan, pengujian, serta diseminasi standar instrumen pertanian di wilayah kerja, dipandang perlu menugaskan personil yang berkompeten;",
  "bahwa pegawai yang namanya tercantum dalam Surat Perintah Tugas ini dinilai mampu dan memenuhi syarat untuk melaksanakan tugas kedinasan dimaksud."
];

export let DEFAULT_DASAR = [
  "Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara;",
  "Peraturan Presiden Republik Indonesia Nomor 117 Tahun 2022 tentang Kementerian Pertanian;",
  "Peraturan Menteri Pertanian Republik Indonesia Nomor 13 Tahun 2023 tentang Organisasi dan Tata Kerja Kementerian Pertanian;",
  "Peraturan Menteri Pertanian tentang Tata Naskah Dinas di Lingkungan Kementerian Pertanian;",
  "Peraturan Menteri Keuangan Nomor 49/PMK.02/2023 tentang Standar Biaya Masukan Tahun Anggaran Berjalan;",
  "Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Penerapan Standar Instrumen Pertanian D.I. Yogyakarta Tahun Anggaran Berjalan."
];

export let sptList = [
  {
    id: "SPT-2026-001",
    nomorSpt: "B-142/KP.320/H.14.7/10/2026",
    klasifikasiId: "KLAS-03",
    klasifikasiNama: "Pendampingan Lapangan & Modernisasi Pertanian",
    tglPengajuan: "2026-09-20",
    tglMulai: "2026-10-01",
    tglSelesai: "2026-10-05",
    dariTanggal: "2026-10-01",
    sampaiTanggal: "2026-10-05",
    tanggalSpt: "01-10-2026 s/d 05-10-2026",
    lamaHari: "5 hari",
    durasiHari: 5,
    tujuanDaerah: "Kabupaten Kulon Progo (Kapanewon Sentolo & Nanggulan)",
    kotaTujuan: "Kabupaten Kulon Progo",
    tempatTujuan: "Balai Penyuluhan Pertanian (BPP) Sentolo, Gapoktan Mandiri",
    untukMelaksanakan: "Melaksanakan bimbingan teknis penerapan standar budidaya padi organik dan modernisasi alsintan pompa air irigasi perpompaan.",
    uraian: "Melaksanakan bimbingan teknis penerapan standar budidaya padi organik dan modernisasi alsintan pompa air irigasi perpompaan.",
    pemohon: {
      id: "usr-peg-004",
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
        unitKerja: "Tim Kerja Pengelolaan Sumber Daya Manusia",
        peranDalamTugas: "Penanggung Jawab (PJ)"
      },
      {
        id: "PEG-055",
        nama: "Priyanto, SST",
        nip: "198206152009101002",
        jabatan: "Penyuluh Pertanian Ahli Muda",
        golongan: "III/c",
        unitKerja: "Tim Kerja Diseminasi Standar Instrumen Pertanian",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    pegawaiBertugas: [
      {
        nama: "Devi Eka Nuvitasari, S.H.",
        nip: "198906012015032004",
        jabatan: "Penelaah Teknis Kebijakan",
        golongan: "III/b",
        peranDalamTugas: "Penanggung Jawab (PJ)"
      },
      {
        nama: "Priyanto, SST",
        nip: "198206152009101002",
        jabatan: "Penyuluh Pertanian Ahli Muda",
        golongan: "III/c",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    status: "terbit",
    statusLabel: "SPT Terbit / Siap Cetak",
    isApproved: true,
    fileSptTtdName: "SPT_Resmi_B-142_Kementan_BRMP_DIY_ttd.pdf",
    fileSptTtdUrl: null,
    timeline: [
      { waktu: "2026-09-20 09:15", aktor: "Devi Eka Nuvitasari, S.H.", aksi: "Pengajuan usulan SPT dibuat", status: "diajukan" },
      { waktu: "2026-09-20 11:30", aktor: "Dwi Dinia Rahayu, S.Kom, M.T.I", aksi: "Disetujui Ketua Tim Kerja (Approval Unit)", status: "approved_ketimker" },
      { waktu: "2026-09-21 08:45", aktor: "Agung Ariyanto, SEI., M.Ec., Dev.", aksi: "Disetujui Kobag TU (Approval Utama)", status: "approved_kobag_tu" },
      { waktu: "2026-09-21 10:00", aktor: "Novita Widiyanti, A.Md (Sekretariat)", aksi: "Nomor SPT resmi B-142 diterbitkan & siap cetak naskah dinas resmi", status: "terbit" }
    ],
    catatanKetimker: "Disetujui untuk pendampingan alsintan di Kulon Progo. Mohon koordinasi dengan BPP setempat.",
    catatanKobagTu: "Sesuai dengan target kinerja triwulan IV BRMP DIY. Lanjutkan.",
    tandaTanganPejabat: {
      nama: "Dr. Soeharsono, S.Pt, M.Si",
      nip: "197109271998031002",
      jabatan: "Kepala Balai Penerapan Standar Instrumen Pertanian DIY"
    },
    laporan: {
      isiLaporan: "Telah selesai dilaksanakan pendampingan dan bimbingan teknis budidaya padi organik bersama kelompok tani. Pompa air alsintan telah diuji coba berjalan normal dengan kapasitas debit air optimal.",
      fotoDokumentasi: [
        {
          id: 1,
          nama: "Dokumentasi-BPP-Sentolo.jpg",
          url: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=400&auto=format&fit=crop&q=80"
        }
      ]
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
    dariTanggal: "2026-10-03",
    sampaiTanggal: "2026-10-04",
    tanggalSpt: "03-10-2026 s/d 04-10-2026",
    lamaHari: "2 hari",
    durasiHari: 2,
    tujuanDaerah: "Kabupaten Gunungkidul (Kapanewon Semin dan Ponjong)",
    kotaTujuan: "Kabupaten Gunungkidul",
    tempatTujuan: "Lahan Demplot Uji Tanah & Pupuk Organik Kelompok Tani Subur Makmur",
    untukMelaksanakan: "Pengambilan sampel tanah dan pupuk organik terfermentasi untuk uji mutu laboratorium kimia tanah dan evaluasi standar baku mutu.",
    uraian: "Pengambilan sampel tanah dan pupuk organik terfermentasi untuk uji mutu laboratorium kimia tanah dan evaluasi standar baku mutu.",
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
        unitKerja: "Laboratorium Pupuk, Tanah, dan Air",
        peranDalamTugas: "Penanggung Jawab (PJ)"
      },
      {
        id: "PEG-079",
        nama: "Gunawan Ari Kuncoro, Amd",
        nip: "198609052014031005",
        jabatan: "Operator Laboratorium",
        golongan: "III/b",
        unitKerja: "Laboratorium Pupuk, Tanah, dan Air",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    pegawaiBertugas: [
      {
        nama: "Widada, A.Md",
        nip: "196807121999031001",
        jabatan: "Pengawas Mutu Pakan Penyelia / Kepala Laboratorium",
        golongan: "III/c",
        peranDalamTugas: "Penanggung Jawab (PJ)"
      },
      {
        nama: "Gunawan Ari Kuncoro, Amd",
        nip: "198609052014031005",
        jabatan: "Operator Laboratorium",
        golongan: "III/b",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    status: "approved_kobag_tu",
    statusLabel: "Menunggu Penomoran & Cetak Sekretariat",
    isApproved: false,
    fileSptTtdName: null,
    fileSptTtdUrl: null,
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
    },
    laporan: null
  },
  {
    id: "SPT-2026-003",
    nomorSpt: null,
    klasifikasiId: "KLAS-06",
    klasifikasiNama: "Diseminasi & Penerapan Standar Instrumen Pertanian",
    tglPengajuan: "2026-09-25",
    tglMulai: "2026-10-12",
    tglSelesai: "2026-10-14",
    dariTanggal: "2026-10-12",
    sampaiTanggal: "2026-10-14",
    tanggalSpt: "12-10-2026 s/d 14-10-2026",
    lamaHari: "3 hari",
    durasiHari: 3,
    tujuanDaerah: "Kabupaten Bantul (Kapanewon Imogiri & Dlingo)",
    kotaTujuan: "Kabupaten Bantul",
    tempatTujuan: "Aula BPP Imogiri & Kelompok Tani Hutan Rakyat",
    untukMelaksanakan: "Sosialisasi dan diseminasi standar instrumen pupuk hayati dan pestisida nabati ramah lingkungan bagi penyuluh dan kelompok tani binaan.",
    uraian: "Sosialisasi dan diseminasi standar instrumen pupuk hayati dan pestisida nabati ramah lingkungan bagi penyuluh dan kelompok tani binaan.",
    pemohon: {
      id: "usr-peg-065",
      nama: "Diah Sulistyorini, SP, MP",
      nip: "198108262011012006",
      unitKerja: "Tim Kerja Pengujian Standar Instrumen Tanaman Pangan"
    },
    anggota: [
      {
        id: "PEG-065",
        nama: "Diah Sulistyorini, SP, MP",
        nip: "198108262011012006",
        jabatan: "Penyuluh Pertanian Ahli Muda",
        golongan: "III/d",
        unitKerja: "Tim Kerja Pengujian Standar Instrumen Tanaman Pangan",
        peranDalamTugas: "Penanggung Jawab (PJ)"
      },
      {
        id: "PEG-066",
        nama: "Ir. Ari Widyastuti",
        nip: "196209171987032007",
        jabatan: "Penyuluh Pertanian Ahli Utama",
        golongan: "IV/e",
        unitKerja: "Tim Kerja Pengujian Standar Instrumen Tanaman Pangan",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    pegawaiBertugas: [
      {
        nama: "Diah Sulistyorini, SP, MP",
        nip: "198108262011012006",
        jabatan: "Penyuluh Pertanian Ahli Muda",
        golongan: "III/d",
        peranDalamTugas: "Penanggung Jawab (PJ)"
      },
      {
        nama: "Ir. Ari Widyastuti",
        nip: "196209171987032007",
        jabatan: "Penyuluh Pertanian Ahli Utama",
        golongan: "IV/e",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    status: "diajukan",
    statusLabel: "Menunggu Approval Ketimker",
    isApproved: false,
    timeline: [
      { waktu: "2026-09-25 08:30", aktor: "Diah Sulistyorini, SP, MP", aksi: "Pengajuan usulan SPT dibuat", status: "diajukan" }
    ],
    catatanKetimker: null,
    catatanKobagTu: null,
    tandaTanganPejabat: {
      nama: "Dr. Soeharsono, S.Pt, M.Si",
      nip: "197109271998031002",
      jabatan: "Kepala Balai Penerapan Standar Instrumen Pertanian DIY"
    },
    laporan: null
  },
  {
    id: "SPT-2026-004",
    nomorSpt: null,
    klasifikasiId: "KLAS-01",
    klasifikasiNama: "Perjalanan Dinas Dalam Daerah DIY",
    tglPengajuan: "2026-09-26",
    tglMulai: "2026-10-15",
    tglSelesai: "2026-10-16",
    dariTanggal: "2026-10-15",
    sampaiTanggal: "2026-10-16",
    tanggalSpt: "15-10-2026 s/d 16-10-2026",
    lamaHari: "2 hari",
    durasiHari: 2,
    tujuanDaerah: "Kota Yogyakarta & Kabupaten Sleman",
    kotaTujuan: "Kota Yogyakarta & Sleman",
    tempatTujuan: "Dinas Pertanian dan Ketahanan Pangan DIY & Arsip Daerah",
    untukMelaksanakan: "Koordinasi pengelolaan arsip dinas, tertib tata persuratan kedinasan, dan pengelolaan rumah tangga kantor BRMP DIY.",
    uraian: "Koordinasi pengelolaan arsip dinas, tertib tata persuratan kedinasan, dan pengelolaan rumah tangga kantor BRMP DIY.",
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
        peranDalamTugas: "Penanggung Jawab (PJ)"
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
    pegawaiBertugas: [
      {
        nama: "Sinung Rustijarno, S.PI, M.SI",
        nip: "197207091999031001",
        jabatan: "Penelaah Teknis Kebijakan",
        golongan: "IV/b",
        peranDalamTugas: "Penanggung Jawab (PJ)"
      },
      {
        nama: "Putranto Wachyu Hidayat, S.H.",
        nip: "199510052025211008",
        jabatan: "Pranata Hubungan Masyarakat Ahli Pertama",
        golongan: "IX",
        peranDalamTugas: "Anggota Pelaksana"
      }
    ],
    status: "diajukan",
    statusLabel: "Menunggu Approval Ketimker",
    isApproved: false,
    timeline: [
      { waktu: "2026-09-26 10:00", aktor: "Sinung Rustijarno, S.PI, M.SI", aksi: "Pengajuan usulan SPT dibuat (Menunggu persetujuan Ketimker TU)", status: "diajukan" }
    ],
    catatanKetimker: null,
    catatanKobagTu: null,
    tandaTanganPejabat: {
      nama: "Dr. Soeharsono, S.Pt, M.Si",
      nip: "197109271998031002",
      jabatan: "Kepala Balai Penerapan Standar Instrumen Pertanian DIY"
    },
    laporan: null
  }
];

export const addSpt = (sptData) => {
  const newId = `SPT-${new Date().getFullYear()}-${String(sptList.length + 1).padStart(3, '0')}`;
  
  const start = new Date(sptData.dariTanggal || sptData.tglMulai);
  const end = new Date(sptData.sampaiTanggal || sptData.tglSelesai);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
  };

  const tglMulai = sptData.dariTanggal || sptData.tglMulai;
  const tglSelesai = sptData.sampaiTanggal || sptData.tglSelesai;
  const tanggalSptStr = `${formatDateIndo(tglMulai)} s/d ${formatDateIndo(tglSelesai)}`;

  const anggotaNormalized = (sptData.anggota || sptData.pegawaiBertugas || []).map((ang, i) => ({
    id: ang.id || `ANG-${i + 1}`,
    nama: ang.nama,
    nip: ang.nip || "-",
    golongan: ang.golongan || "-",
    jabatan: ang.jabatan || "-",
    unitKerja: ang.unitKerja || "-",
    peranDalamTugas: ang.peranDalamTugas || (i === 0 ? "Penanggung Jawab (PJ)" : "Anggota Pelaksana")
  }));

  const newItem = {
    id: newId,
    nomorSpt: null,
    klasifikasiId: sptData.klasifikasiId || "KLAS-01",
    klasifikasiNama: sptData.klasifikasiNama || "Perjalanan Dinas Dalam Daerah DIY",
    tglPengajuan: new Date().toISOString().split('T')[0],
    tglMulai,
    tglSelesai,
    dariTanggal: tglMulai,
    sampaiTanggal: tglSelesai,
    tanggalSpt: tanggalSptStr,
    lamaHari: `${diffDays} hari`,
    durasiHari: diffDays,
    tujuanDaerah: sptData.tujuanDaerah || sptData.kotaTujuan,
    kotaTujuan: sptData.kotaTujuan || sptData.tujuanDaerah,
    tempatTujuan: sptData.tempatTujuan || sptData.kotaTujuan,
    untukMelaksanakan: sptData.untukMelaksanakan || sptData.uraian,
    uraian: sptData.uraian || sptData.untukMelaksanakan,
    pemohon: sptData.pemohon || {
      nama: anggotaNormalized[0]?.nama || "Pegawai BRMP DIY",
      nip: anggotaNormalized[0]?.nip || "-"
    },
    anggota: anggotaNormalized,
    pegawaiBertugas: anggotaNormalized,
    status: "diajukan",
    statusLabel: "Menunggu Approval Ketimker",
    isApproved: false,
    fileSptTtdName: null,
    fileSptTtdUrl: null,
    timeline: [
      {
        waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
        aktor: sptData.pemohon?.nama || anggotaNormalized[0]?.nama || "Pemohon",
        aksi: "Pengajuan usulan SPT dibuat melalui sistem",
        status: "diajukan"
      }
    ],
    catatanKetimker: null,
    catatanKobagTu: null,
    tandaTanganPejabat: {
      nama: "Dr. Soeharsono, S.Pt, M.Si",
      nip: "197109271998031002",
      jabatan: "Kepala Balai Penerapan Standar Instrumen Pertanian DIY"
    },
    laporan: null
  };

  sptList.unshift(newItem);
  return newItem;
};

export const approveSpt = (sptId, role = 'all', note = '') => {
  const spt = sptList.find(s => String(s.id) === String(sptId));
  if (!spt) return null;

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  if (role === 'ketimker' || role === 'kepalaDivisi') {
    spt.status = "approved_ketimker";
    spt.statusLabel = "Menunggu Persetujuan Kobag TU";
    spt.catatanKetimker = note || "Usulan penugasan dinas disetujui tingkat unit kerja.";
    spt.timeline.push({
      waktu: nowStr,
      aktor: "Ketua Tim Kerja (Ketimker)",
      aksi: `Disetujui Unit Kerja: ${spt.catatanKetimker}`,
      status: "approved_ketimker"
    });
  } else if (role === 'kobag_tu' || role === 'kepalaTU') {
    spt.status = "approved_kobag_tu";
    spt.statusLabel = "Menunggu Penomoran & Cetak Sekretariat";
    spt.catatanKobagTu = note || "Disetujui Kepala Bagian Tata Usaha.";
    spt.timeline.push({
      waktu: nowStr,
      aktor: "Agung Ariyanto, SEI., M.Ec., Dev. (Kobag TU)",
      aksi: `Disetujui Kobag TU (Approval Utama): ${spt.catatanKobagTu}`,
      status: "approved_kobag_tu"
    });
  } else if (role === 'terbitkan' || role === 'sekretariat') {
    if (!spt.nomorSpt) {
      spt.nomorSpt = `B-${Math.floor(100 + Math.random() * 900)}/KP.320/H.14.7/10/2026`;
    }
    spt.status = "terbit";
    spt.statusLabel = "SPT Terbit / Siap Cetak";
    spt.isApproved = true;
    spt.timeline.push({
      waktu: nowStr,
      aktor: "Admin Sekretariat BRMP DIY",
      aksi: `Nomor surat dinas resmi ${spt.nomorSpt} diterbitkan dan naskah dinas siap cetak`,
      status: "terbit"
    });
  } else {
    // Approve all
    if (!spt.nomorSpt) {
      spt.nomorSpt = `B-${Math.floor(100 + Math.random() * 900)}/KP.320/H.14.7/10/2026`;
    }
    spt.status = "terbit";
    spt.statusLabel = "SPT Terbit / Siap Cetak";
    spt.isApproved = true;
    spt.timeline.push({
      waktu: nowStr,
      aktor: "Persetujuan Lengkap Sistem",
      aksi: "Seluruh tahapan persetujuan (Ketimker, Kobag TU, Sekretariat) disahkan",
      status: "terbit"
    });
  }

  return spt;
};

export const rejectSpt = (sptId, role, reason) => {
  const spt = sptList.find(s => String(s.id) === String(sptId));
  if (!spt) return null;

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  spt.status = "ditolak";
  spt.statusLabel = "Ditolak / Perlu Perbaikan";
  spt.isApproved = false;
  spt.catatanPenolakan = reason || "Perlu penyesuaian personil / jadwal tugas.";
  spt.timeline.push({
    waktu: nowStr,
    aktor: role === 'ketimker' ? "Ketimker" : "Kobag TU",
    aksi: `Usulan ditolak: ${spt.catatanPenolakan}`,
    status: "ditolak"
  });

  return spt;
};

export const terbitkanSpt = (sptId, nomorSpt, fileTtdName = null) => {
  const spt = sptList.find(s => String(s.id) === String(sptId));
  if (!spt) return null;

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  spt.nomorSpt = nomorSpt || `B-${Math.floor(100 + Math.random() * 900)}/KP.320/H.14.7/10/2026`;
  spt.status = "terbit";
  spt.statusLabel = "SPT Terbit / Siap Cetak";
  spt.isApproved = true;
  if (fileTtdName) {
    spt.fileSptTtdName = fileTtdName;
  }
  spt.timeline.push({
    waktu: nowStr,
    aktor: "Admin Sekretariat",
    aksi: `Nomor surat dinas resmi ${spt.nomorSpt} diterbitkan & berkas ter-ttd siap cetak`,
    status: "terbit"
  });

  return spt;
};

export const updateLaporan = (sptId, isiLaporan, fotoUrl = null, fileName = null) => {
  const spt = sptList.find(s => String(s.id) === String(sptId));
  if (!spt) return null;

  if (!spt.laporan) {
    spt.laporan = { isiLaporan: '', fotoDokumentasi: [] };
  }
  spt.laporan.isiLaporan = isiLaporan;
  spt.laporan.tglUpload = new Date().toISOString().replace('T', ' ').substring(0, 16);
  if (fileName) {
    spt.laporan.fileLaporanName = fileName;
  }

  if (fotoUrl) {
    spt.laporan.fotoDokumentasi.push({
      id: Date.now(),
      nama: `Foto-Dokumentasi-${Date.now()}.jpg`,
      url: fotoUrl
    });
  }

  spt.status = "selesai";
  spt.statusLabel = "Selesai (Laporan Tersimpan)";

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  spt.timeline.push({
    waktu: nowStr,
    aktor: spt.pemohon?.nama || "Pelaksana",
    aksi: "Laporan hasil penugasan dinas berhasil diunggah",
    status: "selesai"
  });

  return spt;
};

export const saveMenimbang = (newList) => {
  if (Array.isArray(newList)) {
    DEFAULT_MENIMBANG = newList;
  }
  return DEFAULT_MENIMBANG;
};

export const saveDasar = (newList) => {
  if (Array.isArray(newList)) {
    DEFAULT_DASAR = newList;
  }
  return DEFAULT_DASAR;
};
