# Standalone Admin Portal - SI-AP BRMP DIY
Pusat Komando & Administrasi Kepegawaian Balai Penerapan Standar Instrumen Pertanian (BRMP) Daerah Istimewa Yogyakarta.

Folder ini merupakan **Project Web Mandiri (Standalone React + Vite)** khusus untuk Admin Kepegawaian, terpisah dari portal publik pegawai. Folder ini dapat dipindahkan, di-hosting di subdomain terpisah (misalnya `siap.brmpdiy.my.id` atau `admin.brmpdiy.my.id`), atau dipindahkan ke repositori terpisah tanpa ketergantungan pada portal publik.

---

## 📁 Struktur Direktori
```
admin_web/
├── package.json               # Dependensi & script Vite
├── vite.config.js             # Konfigurasi dev server & build
├── index.html                 # Entry point HTML Admin
├── .env.example               # Contoh konfigurasi API backend
├── deploy_admin_ftp.ps1       # Script upload FTP ke cPanel
├── dist/                      # Hasil build produksi siap upload
└── src/
    ├── main.jsx               # Entrypoint React
    ├── App.jsx                # Root aplikasi Admin (Login -> Dashboard)
    ├── index.css              # Global styling & design system
    ├── print.css              # Styling cetak naskah kedinasan
    ├── admin/
    │   ├── AdminDashboard.jsx # Panel lengkap master data, presensi, cuti, dll.
    │   ├── AdminDashboard.css # Styling komponen dashboard admin
    │   └── AdminLogin.jsx     # Halaman login administrator
    ├── components/
    │   ├── Navbar.jsx         # Header navigasi admin
    │   ├── Sidebar.jsx        # Menu sidebar navigasi admin
    │   ├── PengaturanAkun.jsx # Profil & ubah password admin
    │   ├── SptProgram.jsx     # Modul penomoran & manajemen SPT
    │   ├── PengajuanCuti.jsx  # Modul verifikasi & approval cuti
    │   ├── AbsensiBulanan.jsx # Rekap presensi bulanan
    │   ├── AbsensiChart.jsx   # Grafik kehadiran
    │   └── AdmsMonitor.jsx    # Monitoring mesin absensi ADMS
    └── services/
        └── api.js             # Client REST API (otomatis mendeteksi API live/lokal)
```

---

## 🚀 Cara Menjalankan Secara Lokal (Development)

1. Buka terminal di folder ini:
   ```powershell
   cd d:\project\AdminWeb\internalBRMP\admin_web
   ```

2. Jalankan development server:
   ```powershell
   npm run dev
   ```

3. Buka browser di:
   `http://localhost:5174`

---

## 📦 Cara Membangun Bundle Produksi (Build)

Jalankan perintah berikut:
```powershell
npm run build
```
File hasil kompilasi akan tersimpan di dalam folder `dist/` dan siap diunggah ke hosting mana pun (cPanel, Nginx, Apache, Vercel, Netlify, dll.).

---

## 🌐 Koneksi Backend API

Secara default, aplikasi langsung terhubung ke backend API produksi:
`https://kita.brmpdiy.my.id/api`

Jika Anda ingin mengarahkan API ke server lain, cukup buat file `.env` di folder `admin_web`:
```env
VITE_API_BASE_URL=https://alamat-api-anda.com/api
```

---

## 🚚 Cara Memindahkan Folder Ini
Karena project ini sudah memiliki `package.json`, `index.html`, dan dependensi sendiri:
1. Anda dapat menyalin seluruh folder `admin_web` ke mana pun yang Anda inginkan.
2. Jika memindahkan tanpa `node_modules`, cukup jalankan `npm install` di lokasi baru.
