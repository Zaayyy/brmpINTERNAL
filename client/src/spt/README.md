# Modul SPT (Surat Perintah Tugas) - BRMP DIY

Folder ini khusus mewadahi seluruh antarmuka, logika alur kerja, dan komponen fitur **SPT (Surat Perintah Tugas)** Standar Kementerian Pertanian RI untuk Balai Penerapan Standar Instrumen Pertanian (BRMP) DIY.

---

## 📁 Struktur Berkas

| Berkas | Deskripsi |
|---|---|
| `index.js` | Entry point & re-export seluruh komponen modul SPT |
| `SptProgram.jsx` | Wrapper utama penghubung session user BRMP dengan portal E-SPT resmi |
| `PengajuanSpt.jsx` | Formulir pengajuan usulan penugasan dinas baru (multi-step, pilih anggota & tujuan) |
| `ReportSpt.jsx` | Halaman tracking status SPT, pratinjau naskah dinas, dan pelaporan hasil tugas |
| `SptApproval.jsx` | Halaman persetujuan bertingkat (Ketimker & Kobag TU) |
| `SptAdmin.jsx` | Pengelolaan SPT tingkat Tata Usaha / Admin Sekretariat (penomoran resmi dinas) |
| `SptSop.jsx` | Halaman pedoman Standar Operasional Prosedur (SOP) & matriks wewenang RACI |
| `SptStandaloneEmbed.jsx` | Komponen embed portal mandiri brmpSPT |

---

## 👥 Role Pegawai di SPT
Role pengguna disinkronkan secara otomatis melalui fungsi `resolveSptRole(user)` di `SptProgram.jsx`:
- **`user`** (Pegawai Pemohon SPT)
- **`ketimker`** (Ketua Tim Kerja - approval tahap 1)
- **`kobag_tu`** (Kepala Bagian Tata Usaha - approval tahap 2)
- **`admin_sekretariat`** (Tata Persuratan - penerbitan nomor surat resmi & arsip)
- **`admin`** (Superadmin Sistem Kepegawaian)

---

## 🔗 Endpoint Backend Terkait
Seluruh API backend untuk SPT dilayani melalui endpoint `/api/spt` di `server/src/routes/spt.js`:
- `GET /api/spt` — Mengambil daftar SPT dan klasifikasi tugas
- `GET /api/spt/pegawai` — Mengambil daftar 115 pegawai BRMP DIY
- `POST /api/spt` — Mengajukan usulan SPT baru
- `POST /api/spt/:id/approve` — Persetujuan SPT oleh Ketimker / Kobag TU
- `POST /api/spt/:id/reject` — Penolakan atau permintaan revisi SPT
- `POST /api/spt/:id/terbitkan` — Penerbitan nomor surat resmi & unggah tanda tangan basah/elektronik
- `POST /api/spt/:id/laporan` — Submit laporan perjalanan dinas & foto dokumentasi
