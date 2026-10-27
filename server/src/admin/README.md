# Modul Backend Administrator (Pusat Komando SI-AP BRMP DIY)

Modul ini bertanggung jawab atas seluruh logika bisnis, state data, dan routing API untuk **Panel Administrator Kepegawaian & Tata Usaha** BRMP DIY.

---

## 📁 Struktur Berkas

| Berkas | Deskripsi |
|---|---|
| `index.js` | Entry point modul backend Admin |
| `routes.js` | Endpoint REST API `/api/admin` (summary, presensi-all, disposisi, settings) |
| `adminStore.js` | In-memory data store pengaturan instansi balai, riwayat disposisi surat, dan agenda dinas |

---

## 📡 Daftar Endpoint API

- `GET /api/admin/summary` — Statistik kartu metrik eksekutif, status node online, jam server, dan rekap
- `GET /api/admin/presensi-all` — Rekap seluruh log kehadiran pegawai lengkap dengan jarak geofence & metode
- `GET /api/admin/disposisi` — Daftar seluruh surat masuk dan disposisi pimpinan
- `POST /api/admin/disposisi` — Tambah lembar disposisi baru
- `GET /api/admin/settings` — Ambil konfigurasi balai (radius GPS, nama balai, jam masuk/pulang, koordinat)
- `PUT /api/admin/settings` — Perbarui konfigurasi balai
