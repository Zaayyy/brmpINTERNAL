# 📋 PANDUAN LENGKAP INTEGRASI MESIN ABSENSI (ADMS) BRMP DIY

> Dokumen ini adalah panduan dan pengingat teknis arsitektur integrasi mesin absensi fisik (Solution / ZKTeco) dengan sistem internal BRMP DIY berbasis **PHP Murni (Native ADMS Push Protocol)**.

---

## 1. Identitas Mesin & Pegawai

### A. Data Mesin Absensi
* **Serial Number (SN)**: `UCR6235200084` *(Mesin Absensi Lobi Utama BRMP DIY)*
* **IP Address**: `192.168.2.73` *(Catatan: IP tidak perlu di-hardcode karena sistem menggunakan Push Protocol dari mesin ke server)*
* **Kapasitas Multi-Mesin**: Sistem mendukung hingga 3 mesin atau lebih di lokasi yang berbeda (Gedung Utama, Gedung Lab, Lapangan, dll.) karena pengenal unik utamanya adalah **Serial Number (SN)**.

### B. Pasangan NIP & Nomor Absensi
* Di mesin absensi dan database, **`nomor_absensi` SAMA PERSIS dengan `NIP`**.
* Contoh data riil:
  * NIP: `198808062014032001` $\rightarrow$ Nomor Absensi: `198808062014032001` (Agnita Verdiani Putri, A.Md.)
  * NIP: `198003272009101001` $\rightarrow$ Nomor Absensi: `198003272009101001` (Agung Iswadi, S.Si., M.Sc.)
* Pencocokan di database:
  ```sql
  SELECT id_ptk, nama_ptk, nip FROM t_ptk WHERE nomor_absensi = '$pin' OR nip = '$pin';
  ```

---

## 2. Arsitektur Komunikasi (PHP Murni)

> **PENTING**: Sistem ini **100% menggunakan PHP**, tidak menggunakan Node.js. Folder `server_kita` di cPanel adalah arsip percobaan sebelumnya dan dapat diabaikan.

```
[ Mesin Absen (Client) ]
   (SN: UCR6235200084)
            │
            │ HTTP Push (Port 80)
            ▼
[ Subdomain Receiver: adms.brmpdiy.my.id ]
            │
            ├── GET  /iclock/cdata?SN=... (Handshake / Ping)
            │    └── Respons: GET OPTION FROM: {SN} \r\n Stamp=9999 ...
            │
            └── POST /iclock/cdata?SN=... (Log Absensi ATTLOG)
                 ├── Baca php://input (Pemisah TAB: PIN, Datetime, Status)
                 ├── Simpan ke MySQL (brmy4429_absensi)
                 └── Respons: "OK"
            │
            ▼
[ Database MySQL: brmy4429_absensi ]
  ├── tweb_mesin / tb_adms_machines (Daftar & status online mesin)
  ├── t_ptk / tb_pegawai            (Master pegawai: NIP & nomor_absensi)
  └── tweb_pegawai_hadir / tb_adms_logs (Log jam masuk & pulang)
            ▲
            │ Query Data Rekap
[ Web Portal Internal BRMP ] (brmpdiy.my.id / api.php)
```

---

## 3. Alur Protokol ADMS di PHP

### A. Handshake / Heartbeat (`GET`)
Mesin mengirimkan request GET untuk memeriksa apakah server aktif:
```php
$sn = $_GET['SN'] ?? '';
$options = $_GET['options'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($options === 'all') {
        echo "GET OPTION FROM: $sn\r\n" .
             "Stamp=9999\r\n" .
             "OpStamp=None\r\n" .
             "ErrorDelay=30\r\n" .
             "Delay=10\r\n" .
             "TransTimes=00:00;14:05\r\n" .
             "TransInterval=1\r\n" .
             "TransFlag=1111111111\r\n" .
             "Realtime=1\r\n" .
             "TimeZone=7\r\n" .
             "Encrypt=0";
        exit;
    }
    echo "OK";
    exit;
}
```

### B. Menerima Log Presensi (`POST`)
Saat pegawai melakukan verifikasi sidik jari/wajah/kartu, mesin mengirim teks mentah via HTTP POST:
```php
$rawText = file_get_contents('php://input');
$lines = explode("\n", $rawText);

foreach ($lines as $line) {
    $parts = explode("\t", trim($line));
    if (count($parts) >= 2) {
        $pin = $parts[0];          // NIP Pegawai
        $datetime = $parts[1];     // YYYY-MM-DD HH:mm:ss
        $status = $parts[2] ?? 0;  // 0: Masuk, 1: Pulang
        
        // Simpan log ke database dan update status mesin
        ...
    }
}

// Respons wajib ke mesin:
echo "OK";
```

---

## 4. Pengaturan pada Fisik Mesin Absensi

Masuk ke menu pengaturan di layar mesin absensi:
1. Buka **Menu** $\rightarrow$ **Komunikasi (Comm.)** $\rightarrow$ **Cloud Server / ADMS / Web Server Setting**:
   - **Server Address / IP**: `adms.brmpdiy.my.id` *(atau IP server tujuan)*
   - **Server Port**: `80`
   - **Enable Cloud / ADMS**: `ON` (Aktif)
   - **Update Firmware / Push**: Aktifkan pengiriman berkala / real-time
2. Simpan dan periksa ikon status di pojok layar mesin:
   - Ikon bola dunia/awan berubah menjadi **tersambung / tidak disilang merah**.

---

## 5. File Referensi dalam Repositori

| File | Keterangan |
|------|------------|
| `php_backend/cdata.php` | Receiver ADMS modern berbasis PHP dengan auto-tracking mesin & logs ke MySQL |
| `php_backend/api.php` | API Portal internal untuk dashboard, monitoring mesin, dan cuti |
| `php_backend/config.php` | Konfigurasi koneksi MySQL ke `brmy4429_absensi` |
| `adms_legacy/adms.brmpdiy.my.id/index.php` | Script receiver legacy yang berjalan di subdomain `adms.brmpdiy.my.id` |
| `adms_legacy/adms.brmpdiy.my.id/func.php` | Fungsi pembantu: `cekstatusabsensi()` membaca tabel `t_ptk` |
| `database/brmp_database.sql` | Skema database & data awal mesin `UCR6235200084` |

---

## 6. Panduan Update ke Hosting (cPanel)

Jika melakukan update file PHP ke hosting cPanel:
1. **Subdomain ADMS**: Upload file [cdata.php](file:///d:/laragon/www/internalBRMP/php_backend/cdata.php) / [index.php](file:///d:/laragon/www/internalBRMP/adms_legacy/adms.brmpdiy.my.id/index.php) ke direktori root subdomain `adms.brmpdiy.my.id`.
2. **Portal Web**: Upload file [api.php](file:///d:/laragon/www/internalBRMP/php_backend/api.php) dan folder frontend ke direktori portal web (`public_html` atau subdomain portal).
3. **Database**: Pastikan tabel `tweb_mesin` atau `tb_adms_machines` memuat record:
   ```sql
   INSERT INTO tb_adms_machines (sn, nama_mesin, ip, last_sync, status, total_logs)
   VALUES ('UCR6235200084', 'Mesin Absensi Lobi Utama BRMP DIY', '192.168.2.73', NOW(), 'Online', 1)
   ON DUPLICATE KEY UPDATE ip = '192.168.2.73', status = 'Online';
   ```
