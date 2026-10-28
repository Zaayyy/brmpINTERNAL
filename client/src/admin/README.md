# Modul Portal Admin - BRMP DIY

Folder ini khusus mewadahi seluruh antarmuka, logika manajemen data, dan komponen fitur **Administrator Sistem Kepegawaian & Tata Usaha** Balai Penerapan Standar Instrumen Pertanian (BRMP) DIY.

---

## 📁 Struktur Berkas

| Berkas | Deskripsi |
|---|---|
| `index.js` | Entry point & re-export seluruh komponen modul Admin |
| `AdminDashboard.jsx` | Dasbor utama administrator (mewadahi seluruh tab manajemen kepegawaian & operasional) |
| `AdminDashboard.css` | Styling tema resmi hijau Kementan RI khusus tampilan portal admin |
| `AdminLogin.jsx` | Gerbang login autentikasi khusus Administrator (`/admin` atau `#/admin`) |

---

## 🗂️ Tab & Fitur di `AdminDashboard.jsx`

Modul ini memiliki 8 tab utama yang dapat diakses secara langsung:
1. **`dashboard`** (Ringkasan Eksekutif):
   - Metrik total pegawai aktif, statistik presensi hari ini (tepat waktu, terlambat, alfa), ringkasan permohonan cuti, SPT, disposisi, dan agenda dinas.
2. **`pegawai`** (Master Data Kepegawaian):
   - Tambah data pegawai baru, edit profil/NIP/jabatan/golongan/divisi, ganti foto profil, kelola role sistem, dan hapus pegawai.
3. **`presensi`** (Monitoring Presensi ADMS Realtime):
   - Rekap log scan mesin fingerprint/face recognition seluruh pegawai dengan status jam masuk/pulang.
4. **`cuti`** (Rekap & Approval Cuti):
   - Monitoring seluruh permohonan cuti tahunan, sakit, melahirkan, dll.
5. **`spt`** (Rekap Surat Perintah Tugas):
   - Monitoring alur disposisi penugasan dinas luar dan status penerbitan SPT resmi.
6. **`disposisi`** (Tata Persuratan & Disposisi):
   - Manajemen surat masuk dan alur tindak lanjut disposisi pimpinan.
7. **`agenda`** (Agenda Kantor & Rapat):
   - Jadwal kegiatan dinas, rapat koordinasi, dan agenda balai.
8. **`pengaturan`** (Pengaturan Instansi):
   - Nama instansi, alamat balai, NIP Kepala Balai/Kobag TU, dan jam operasional kerja.

---

## 🔗 Endpoint Backend Terkait

| Endpoint | Method | Deskripsi |
|---|---|---|
| `/api/admin/summary` | GET | Data statistik & rekapitulasi dasbor |
| `/api/admin/presensi-all` | GET | Seluruh log presensi pegawai |
| `/api/admin/disposisi` | GET / POST | Daftar & pengajuan disposisi surat |
| `/api/admin/settings` | GET / POST | Pengaturan profil instansi & pimpinan |
| `/api/users` | GET / POST | Mengambil & menambah data pegawai |
| `/api/users/:id` | PUT / DELETE | Memperbarui atau menghapus pegawai |
| `/api/users/:id/role` | PUT | Mengubah role pegawai (admin, user, dll.) |
