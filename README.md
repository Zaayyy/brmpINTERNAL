# KITA BRMP DIY - Internal Portal (React + Express)

Aplikasi Portal Internal BRMP DIY berbasis **React (Vite)** di sisi frontend dan **Express.js** di sisi backend, mencakup modul presensi/absensi, pengajuan cuti, serta terintegrasi penuh dengan seluruh fitur, database, validasi, dan tata naskah dinas resmi dari folder `brmpSPT` (Sistem Informasi Surat Perintah Tugas Digital Standar Kementerian Pertanian RI).

---

## 🚀 Fitur yang Tersedia

### 1. Modul Absensi & Cuti
- **Halaman Login Internal:** Autentikasi NIP pegawai dan kata sandi tahun lahir (demo default: `199808062014032001` / `1998`).
- **Dashboard Pegawai:** Info profil (**AGNITA VERDIANI PUTRI, A.Md.**), status absen masuk/pulang, sisa cuti, aksi cepat (Cuti, SPT, Histori, Profile), serta kalender agenda dinas interaktif.
- **Info Absensi Bulanan & Chart:** Filter bulan/tahun, rekapitulasi kehadiran (Masuk, Terlambat, Sakit, Izin, Alpha), kartu status harian, serta visualisasi Donut Chart dan Bar Chart.
- **Pengajuan & History Cuti:** Form pengajuan cuti pegawai dengan validasi sisa cuti dan riwayat status cuti.

### 2. Modul Surat Perintah Tugas (SPT) Digital (Terintegrasi Penuh dari `brmpSPT`)

#### A. Formulir Pengajuan SPT (5-Step Wizard & Anti-Bentrok Jadwal)
- **5 Langkah Pengajuan Sesuai SOP:**
  1. **Klasifikasi Penugasan:** Memilih dari 8 klasifikasi standar (01/PD-LOKAL, 02/PD-LUAR, 03/PENDAMPINGAN, 04/UJI-TEK, 05/PENGAMBILAN-SAMPEL, 06/DISEMINASI, 07/UPBS-KP, 08/RAPAT-KEMEN).
  2. **Waktu Penugasan:** Tanggal Mulai dan Tanggal Selesai dengan kalkulator durasi hari otomatis.
  3. **Pemilihan Personil (Database 115 Pegawai BRMP DIY):** Pencarian instan berdasarkan nama/NIP/jabatan, filter tim kerja, pemilih peran penugasan (Penanggung Jawab vs Anggota Pelaksana).
  4. **Tujuan Daerah & Tempat Spesifik:** Pilihan kabupaten/kota (Sleman, Bantul, Kulon Progo, Gunungkidul, Yogyakarta, atau Luar DIY) serta instansi target.
  5. **Uraian Tugas Kedinasan (Untuk Melaksanakan Apa):** Teks uraian substantif yang otomatis tercetak pada naskah dinas.
- **Deteksi Bentrok Jadwal Real-Time (ConflictChecker):**
  - Mencegah *double booking* personil pada tanggal beririsan sesuai SOP.
  - Menampilkan banner peringatan bentrok jadwal lengkap dengan nama personil, nomor SPT yang bertabrakan, lokasi, dan tanggal penugasan sebelumnya.

#### B. Tracking & Cetak Format Naskah Dinas Resmi Standar Kementerian Pertanian
- **Tabel Monitoring SPT:** Filter status (*Semua, Terbit/Sah, Approved Kobag TU, Approved Ketimker, Menunggu Persetujuan, Selesai*), pencarian cepat, dan badge status visual.
- **Detail Histori Alur (Timeline Stepper):** Melacak riwayat tahapan berkas dari inisiasi pemohon, telaah Ketimker, approval Kobag TU, hingga penerbitan nomor dinas.
- **Pratinjau & Cetak Resmi Siap Kertas A4 / PDF (`window.print()`):**
  - Kop Surat resmi Kementerian Pertanian / Badan Standardisasi Instrumen Pertanian / Balai Penerapan Standar Instrumen Pertanian D.I. Yogyakarta (dilengkapi Logo Kementan Base64).
  - Garis ganda pembatas kop surat (tebal & tipis).
  - Judul naskah dinas dan nomor surat dinas resmi.
  - Konsiderans **Menimbang** (butir a, b, c...).
  - Konsiderans **Dasar Hukum** (butir 1, 2, 3...).
  - Diktum **MEMERINTAHKAN: Kepada** (Tabel personil lengkap No, Nama & NIP, Golongan, Jabatan, Peran Dalam Tugas).
  - Diktum **Untuk** (Maksud tugas, lokasi, durasi kalender, pembebanan anggaran DIPA, kewajiban pelaporan).
  - Tanda Tangan & Pengesahan Kepala Balai (**Dr. Soeharsono, S.Pt, M.Si** - NIP. 197109271998031002) dilengkapi stempel dinas dan barcode sertifikasi elektronik BSRE Kementan.
- **Pengisian Laporan & Dokumentasi Foto (Maks 2MB):**
  - Formulir pengisian uraian hasil kegiatan perjalanan dinas.
  - Unggah file laporan (PDF/DOC) dan tautan galeri foto kegiatan dinas.

#### C. Approval Berjenjang (Simulasi Multi-Level)
- **Tab 1: Verifikasi Unit Kerja (Ketimker):** Telaah usulan staf dari 10 Tim Kerja BRMP DIY disertai catatan telaah dan tombol Setujui / Minta Revisi.
- **Tab 2: Persetujuan Utama (Kobag TU - Agung Ariyanto, SEI., M.Ec., Dev.):** Persetujuan substantif definitif sebelum diterbitkan nomor dinas.

#### D. Pusat Administrasi Sekretariat
- **Penomoran SPT & Upload File Ter-TTD:** Input nomor surat dinas resmi sesuai buku agenda sekretariat BRMP DIY dan pengesahan status Terbit.
- **Pengaturan Konsiderans Menimbang:** Tambah, edit, dan simpan butir-butir pertimbangan resmi.
- **Pengaturan Dasar Hukum:** Tambah, edit, dan simpan regulasi perundang-undangan dan DIPA.
- **Database Master Pegawai:** Direktori 115 pegawai resmi BRMP DIY lengkap dengan NIP, Golongan, Jabatan, dan Tim Kerja.

#### E. SOP & Matriks RACI
- **Nomor SOP:** `SOP/BRMP-DIY/TU/04/2026`.
- **Prinsip Pokok:** Akuntabilitas, *Single Assignment Rule* (Larangan SPT Ganda), Pengawasan Berjenjang, Pelaporan Maksimal 5 Hari Kerja.
- **Bagan 6 Tahap Alur Standar Pelayanan.**
- **Matriks Wewenang & Tanggung Jawab RACI (User, Ketimker, Kobag TU, Kopoks, Admin Sekretariat).**

#### F. Portal E-SPT Mandiri Bawaan (`brmpSPT`)
- Aplikasi web standalone original dari folder `brmpSPT` disajikan secara statis oleh backend Express di:
  - `http://localhost:5000/spt-portal`
  - Terintegrasi langsung di dalam tab navigasi menu portal "Portal E-SPT Mandiri" (dengan fitur reload dan buka di tab baru).

#### G. Fitur Beralih Peran (Multi-Role Switcher)
- Tombol **Ganti Peran** di Navbar atas memudahkan pengujian instan antar akun:
  - **User (Pemohon):** Agnita Verdiani Putri / Devi Eka Nuvitasari
  - **Ketimker (Ketua Tim Kerja):** Dwi Dinia Rahayu / Yuni Pratiwi
  - **Kobag TU (Approval Utama):** Agung Ariyanto, SEI., M.Ec., Dev.
  - **Kopoks (Monitoring):** Dr. Fibrianty, M.Si
  - **Admin Sekretariat:** Novita Widiyanti, A.Md

---

## 💻 Cara Menjalankan Project

### Jalankan Backend & Frontend Sekaligus (Root Directory)
Dari folder root `d:\laragon\www\internalBRMP`:
```bash
npm run dev
```

- **Frontend (React Vite):** `http://localhost:5173`
- **Backend (Express API):** `http://localhost:5000/api`
- **Portal E-SPT Mandiri (brmpSPT):** `http://localhost:5000/spt-portal`
