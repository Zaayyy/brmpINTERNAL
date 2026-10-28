# Modul Backend SPT (Surat Perintah Tugas)

Modul ini bertanggung jawab atas seluruh logika bisnis, state data, dan routing API untuk **E-SPT (Surat Perintah Tugas)** BRMP DIY.

---

## 📁 Struktur Berkas

| Berkas | Deskripsi |
|---|---|
| `index.js` | Entry point modul backend SPT |
| `routes.js` | Endpoint REST API `/api/spt` |
| `sptStore.js` | In-memory data store SPT, riwayat status, klasifikasi, klausul menimbang & dasar hukum |

---

## 📡 Daftar Endpoint API

- `GET /api/spt` — Ambil daftar SPT dan data konfigurasi dasar/menimbang
- `GET /api/spt/pegawai` — Ambil daftar 115 pegawai BRMP DIY untuk personil tugas
- `POST /api/spt` — Buat pengajuan usulan SPT baru
- `POST /api/spt/:id/approve` — Persetujuan SPT (role: `ketimker`, `kobag_tu`, `all`)
- `POST /api/spt/:id/reject` — Tolak / minta revisi SPT dengan alasan
- `POST /api/spt/:id/terbitkan` — Penerbitan nomor surat resmi & berkas tanda tangan
- `POST /api/spt/:id/laporan` — Submit laporan perjalanan dinas & foto dokumentasi
- `PUT /api/spt/menimbang` — Perbarui daftar klausul konsiderans menimbang
- `PUT /api/spt/dasar` — Perbarui daftar dasar hukum
