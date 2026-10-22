/**
 * Data SOP Standar Operasional Prosedur Pengeluaran SPT
 * Kementerian Pertanian - BRMP DIY
 */

const DATA_SOP_SPT = {
  nomorSop: "SOP/BRMP-DIY/TU/04/2026",
  judul: "STANDAR OPERASIONAL PROSEDUR PENGELUARAN SURAT PERINTAH TUGAS (SPT)",
  instansi: "Balai Penerapan Standar Instrumen Pertanian Daerah Istimewa Yogyakarta (BRMP DIY)",
  kementerian: "Kementerian Pertanian Republik Indonesia",
  tanggalBerlaku: "02 Januari 2026",
  revisi: "03",

  dasarHukum: [
    "Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara.",
    "Peraturan Presiden Nomor 117 Tahun 2022 tentang Kementerian Pertanian.",
    "Peraturan Menteri Pertanian Nomor 13 Tahun 2023 tentang Organisasi dan Tata Kerja Kementerian Pertanian.",
    "Peraturan Menteri Pertanian tentang Tata Naskah Dinas di Lingkungan Kementerian Pertanian.",
    "Peraturan Menteri Keuangan Nomor 49/PMK.02/2023 tentang Standar Biaya Masukan.",
    "Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Penerapan Standar Instrumen Pertanian DIY Tahun Anggaran Berjalan."
  ],

  prinsipUtama: [
    {
      judul: "Akuntabilitas & Ketepatan Sasaran",
      deskripsi: "Setiap penugasan kedinasan harus memiliki dasar program/kegiatan yang jelas, terukur, dan didukung anggaran yang sah."
    },
    {
      judul: "Larangan Bentrok Jadwal (Single Assignment Rule)",
      deskripsi: "Pegawai dilarang keras memiliki lebih dari satu SPT pada rentang tanggal yang beririsan atau bersamaan. Sistem secara otomatis memblokir usulan dengan bentrok jadwal."
    },
    {
      judul: "Hierarki Pengawasan Berjenjang",
      deskripsi: "Pengajuan dari staf wajib memperoleh telaah dari Ketua Tim Kerja (Ketimker) dan persetujuan Kepala Bagian Tata Usaha (Kobag TU) sebelum diterbitkan nomor dinas oleh Sekretariat."
    },
    {
      judul: "Kewajiban Pelaporan Terstruktur",
      deskripsi: "Setiap pelaksana tugas wajib mengunggah laporan hasil pelaksanaan kegiatan (format PDF/DOC maks 2MB) paling lambat 5 (lima) hari kerja setelah tugas berakhir."
    }
  ],

  tahapanAlur: [
    {
      step: 1,
      tahap: "Inisiasi & Pengajuan Usulan",
      pelaksana: "User / Pemohon (Pegawai/Anggota Tim)",
      sla: "15 Menit",
      output: "Draft Usulan SPT (ID unik)",
      uraian: "User memilih klasifikasi tugas dinas, menentukan daftar personil pelaksana, menentukan rentang tanggal tugas (mulai s.d. selesai), mengisi tujuan daerah secara spesifik, dan merumuskan deskripsi tugas. Sistem memvalidasi ketersediaan jadwal personil secara real-time."
    },
    {
      step: 2,
      tahap: "Verifikasi Kelayakan Unit Kerja",
      pelaksana: "Ketimker (Ketua Tim Kerja)",
      sla: "60 Menit",
      output: "Rekomendasi / Approval Unit (Status: Approved Ketimker)",
      uraian: "Ketua Tim Kerja memeriksa relevansi personil yang ditugaskan dengan beban kerja tim, urgensi lokasi, serta kesesuaian target output kegiatan. Ketimker dapat memberikan catatan telaah perbaikan atau menyetujui langsung."
    },
    {
      step: 3,
      tahap: "Verifikasi Substantif & Kebijakan Tata Usaha",
      pelaksana: "Kobag TU (Ketua / Kepala Bagian TU)",
      sla: "60 Menit",
      output: "Approval Utama (Status: Approved Kobag TU)",
      uraian: "Kepala Bagian Tata Usaha meninjau aspek ketersediaan kuota dinas, kepatuhan regulasi, koordinasi antar tim kerja, dan kepatutan operasional balai secara keseluruhan sebelum pengesahan nomor registrasi."
    },
    {
      step: 4,
      tahap: "Registrasi Nomor & Penerbitan Naskah Resmi",
      pelaksana: "Admin Sekretariat",
      sla: "30 Menit",
      output: "Nomor SPT Resmi & Cetak Format Naskah Dinas Kementan",
      uraian: "Sekretariat menerbitkan nomor surat resmi sesuai buku agenda dinas, memverifikasi konsiderans Menimbang & Dasar, mencetak SPT fisik/preview tata naskah dinas A4, serta mengunggah pindaian SPT yang telah dibubuhi tanda tangan basah/elektronik dan stempel dinas."
    },
    {
      step: 5,
      tahap: "Pelaksanaan Tugas Kedinasan & Pengunduhan",
      pelaksana: "User / Tim Pelaksana",
      sla: "Sesuai durasi SPT",
      output: "Dokumen SPT Ter-TTD siap bawa",
      uraian: "Pegawai mengunduh berkas SPT resmi ber-barcode/ter-ttd dari aplikasi untuk dibawa sebagai dasar legalitas penugasan di instansi tujuan daerah."
    },
    {
      step: 6,
      tahap: "Pelaporan Hasil Tugas & Upload Berkas (Maks 2MB)",
      pelaksana: "User / Penanggung Jawab Tim",
      sla: "Maks 5 Hari Kerja paska penugasan",
      output: "Laporan Pelaksanaan Tugas Tersimpan (PDF/DOC)",
      uraian: "Setelah kembali dari penugasan, pegawai mengunggah ringkasan laporan hasil penugasan (maks 2MB) ke sistem sebagai syarat pemenuhan SPJ dan pemulihan status penugasan selesai."
    }
  ],

  matriksRaci: [
    { aktivitas: "1. Pengajuan Usulan SPT & Pemilihan Anggota", user: "R / A", ketimker: "C", kobagTu: "I", kopoks: "I", adminSekretariat: "I" },
    { aktivitas: "2. Verifikasi Jadwal & Validasi Konflik", user: "I", ketimker: "R", kobagTu: "I", kopoks: "I", adminSekretariat: "R" },
    { aktivitas: "3. Approval Unit Kerja", user: "I", ketimker: "A / R", kobagTu: "C", kopoks: "I", adminSekretariat: "I" },
    { aktivitas: "4. Approval Utama Tata Usaha", user: "I", ketimker: "I", kobagTu: "A / R", kopoks: "I", adminSekretariat: "C" },
    { aktivitas: "5. Pemantauan & Monitoring Penugasan Lintas Poksi", user: "I", ketimker: "I", kobagTu: "I", kopoks: "A / R", adminSekretariat: "I" },
    { aktivitas: "6. Registrasi Nomor Resmi & Upload SPT Ter-TTD", user: "I", ketimker: "I", kobagTu: "I", kopoks: "I", adminSekretariat: "A / R" },
    { aktivitas: "7. Cetak Format Resmi Naskah Dinas", user: "I", ketimker: "I", kobagTu: "I", kopoks: "I", adminSekretariat: "A / R" },
    { aktivitas: "8. Upload Laporan Kegiatan Akhir (Max 2MB)", user: "A / R", ketimker: "C", kobagTu: "I", kopoks: "I", adminSekretariat: "I" }
  ]
};
