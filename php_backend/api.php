<?php
// =======================================================
// BRMP DIY - Unified REST API (PHP Implementation)
// =======================================================

require_once __DIR__ . '/config.php';

// Parse path info or query route
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedPath = parse_url($requestUri, PHP_URL_PATH);
$route = $_GET['route'] ?? str_replace('/api/', '', $parsedPath);
$route = trim($route, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Helper to find employee by NIP/ID/PIN
function findPegawai($identifier, $pdo, $useMysql) {
    $clean = trim((string)$identifier);
    if (empty($clean)) return null;

    if ($useMysql && $pdo) {
        $stmt = $pdo->prepare("SELECT * FROM tb_pegawai WHERE nip = ? OR pegawai_id = ? OR pin_mesin = ? OR nip LIKE ? LIMIT 1");
        $stmt->execute([$clean, $clean, $clean, "%$clean"]);
        $row = $stmt->fetch();
        if ($row) {
            return [
                'id' => $row['pegawai_id'],
                'nip' => $row['nip'],
                'nama' => $row['nama'],
                'passwordDefaultYear' => $row['password_year'],
                'jabatan' => $row['jabatan'],
                'golongan' => $row['golongan'],
                'divisi' => $row['divisi'],
                'systemRole' => $row['system_role'],
                'approvalRole' => $row['approval_role'],
                'roleLabel' => $row['role_label'],
                'pinMesin' => $row['pin_mesin'],
                'sisaCuti' => (int)$row['sisa_cuti'],
                'cutiTerpakai' => (int)$row['cuti_terpakai'],
                'expiredCuti' => $row['expired_cuti'],
                'jamMasuk' => $row['jam_masuk'] ?? '07:15:00',
                'jamPulang' => $row['jam_pulang'] ?? '16:00:00',
                'jamKerja' => $row['jam_kerja'] ?? '07:30:00 - 16:00:00'
            ];
        }
    }

    // Fallback JSON
    $list = getFallbackPegawai();
    foreach ($list as $u) {
        if ($u['nip'] === $clean || $u['id'] === $clean || ($u['pinMesin'] ?? '') === $clean || str_ends_with($u['nip'], $clean)) {
            return $u;
        }
    }
    return null;
}

// -------------------------------------------------------
// 1. AUTH: POST /api/auth/login
// -------------------------------------------------------
if ($route === 'auth/login' || $route === 'login') {
    if ($method !== 'POST') jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    $body = getJsonBody();
    $username = trim($body['username'] ?? '');
    $password = trim($body['password'] ?? '');

    if (empty($username) || empty($password)) {
        jsonResponse(['success' => false, 'message' => 'Username (NIP) dan Password wajib diisi'], 400);
    }

    $pegawai = null;
    if (strtolower($username) === 'admin') {
        $pegawai = findPegawai('198001012005011001', $pdo, $useMysql);
    } else {
        $pegawai = findPegawai($username, $pdo, $useMysql);
    }

    if ($pegawai) {
        $validPass = [$pegawai['passwordDefaultYear'], 'admin', '123456', '1980', '1986', '1981', '1989', '1971', '1988'];
        if (in_array($password, $validPass) || $password === $pegawai['passwordDefaultYear']) {
            jsonResponse([
                'success' => true,
                'message' => 'Login berhasil sebagai ' . $pegawai['roleLabel'],
                'data' => [
                    'id' => $pegawai['id'],
                    'nip' => $pegawai['nip'],
                    'nama' => $pegawai['nama'],
                    'jabatan' => $pegawai['jabatan'],
                    'divisi' => $pegawai['divisi'],
                    'systemRole' => $pegawai['systemRole'],
                    'approvalRole' => $pegawai['approvalRole'],
                    'roleLabel' => $pegawai['roleLabel'],
                    'sisaCuti' => $pegawai['sisaCuti'],
                    'cutiTerpakai' => $pegawai['cutiTerpakai'],
                    'expiredCuti' => $pegawai['expiredCuti'],
                    'token' => 'token-brmp-' . $pegawai['id'] . '-' . time()
                ]
            ]);
        } else {
            jsonResponse(['success' => false, 'message' => 'Password salah. Gunakan tahun lahir (misal: 1980, 1986, 1981) atau "admin"'], 401);
        }
    }

    // Flexible fallback
    if (strlen($username) >= 4) {
        jsonResponse([
            'success' => true,
            'message' => 'Login berhasil (Akun Pegawai)',
            'data' => [
                'id' => 'PEG-DEMO',
                'nip' => $username,
                'nama' => 'PEGAWAI BRMP DIY',
                'jabatan' => 'Staf Teknis',
                'divisi' => 'Balai Penerapan Standar Instrumen Pertanian DIY',
                'systemRole' => 'pegawai',
                'approvalRole' => 'pemohon',
                'roleLabel' => 'Pegawai (Pemohon Cuti)',
                'sisaCuti' => 12,
                'cutiTerpakai' => 0,
                'expiredCuti' => '31-12-2026',
                'token' => 'token-demo-' . time()
            ]
        ]);
    }

    jsonResponse(['success' => false, 'message' => 'Pengguna tidak ditemukan'], 404);
}

// -------------------------------------------------------
// 2. USERS: GET /api/users & PUT /api/users/:id/role
// -------------------------------------------------------
if ($route === 'users' || str_starts_with($route, 'users/')) {
    if ($method === 'GET') {
        $data = [];
        if ($useMysql && $pdo) {
            $stmt = $pdo->query("SELECT * FROM tb_pegawai ORDER BY id ASC");
            $rows = $stmt->fetchAll();
            foreach ($rows as $r) {
                $data[] = [
                    'id' => $r['pegawai_id'],
                    'nip' => $r['nip'],
                    'nama' => $r['nama'],
                    'jabatan' => $r['jabatan'],
                    'golongan' => $r['golongan'] ?? '',
                    'divisi' => $r['divisi'],
                    'systemRole' => $r['system_role'],
                    'approvalRole' => $r['approval_role'],
                    'roleLabel' => $r['role_label'],
                    'pinMesin' => $r['pin_mesin'] ?? '',
                    'sisaCuti' => (int)$r['sisa_cuti'],
                    'cutiTerpakai' => (int)$r['cuti_terpakai'],
                    'expiredCuti' => $r['expired_cuti']
                ];
            }
        } else {
            $data = getFallbackPegawai();
        }
        jsonResponse(['success' => true, 'total' => count($data), 'data' => $data]);
    }

    // PUT /api/users/:id/role
    if ($method === 'PUT' || $method === 'POST') {
        $parts = explode('/', $route);
        $targetId = $parts[1] ?? '';
        $body = getJsonBody();
        $systemRole = $body['systemRole'] ?? null;
        $approvalRole = $body['approvalRole'] ?? null;
        $pinMesin = isset($body['pinMesin']) ? trim((string)$body['pinMesin']) : null;

        $roleLabel = null;
        if ($approvalRole === 'admin') $roleLabel = 'Administrator Kepegawaian';
        elseif ($approvalRole === 'verifikator_1') $roleLabel = 'Verifikator 1 (Ketua Tim Kerja)';
        elseif ($approvalRole === 'verifikator_2') $roleLabel = 'Verifikator 2 (Kepala Bagian TU)';
        elseif ($approvalRole === 'pemohon') $roleLabel = 'Pegawai (Pemohon Cuti)';

        if ($useMysql && $pdo) {
            $fields = [];
            $params = [];
            if ($systemRole) { $fields[] = "system_role = ?"; $params[] = $systemRole; }
            if ($approvalRole) { $fields[] = "approval_role = ?"; $params[] = $approvalRole; }
            if ($roleLabel) { $fields[] = "role_label = ?"; $params[] = $roleLabel; }
            if ($pinMesin !== null) { $fields[] = "pin_mesin = ?"; $params[] = $pinMesin; }

            if (!empty($fields)) {
                $params[] = $targetId;
                $params[] = $targetId;
                $sql = "UPDATE tb_pegawai SET " . implode(", ", $fields) . " WHERE pegawai_id = ? OR nip = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            }
        }

        // Also update fallback JSON
        $list = getFallbackPegawai();
        $updatedUser = null;
        foreach ($list as &$u) {
            if ($u['id'] === $targetId || $u['nip'] === $targetId) {
                if ($systemRole) $u['systemRole'] = $systemRole;
                if ($approvalRole) $u['approvalRole'] = $approvalRole;
                if ($roleLabel) $u['roleLabel'] = $roleLabel;
                if ($pinMesin !== null) $u['pinMesin'] = $pinMesin;
                $updatedUser = $u;
                break;
            }
        }
        saveFallbackPegawai($list);

        jsonResponse([
            'success' => true,
            'message' => 'Role & data pegawai berhasil diperbarui',
            'data' => $updatedUser ?? findPegawai($targetId, $pdo, $useMysql)
        ]);
    }
}

// -------------------------------------------------------
// 3. CUTI: GET, POST, VERIFY, CANCEL
// -------------------------------------------------------
if ($route === 'cuti' || str_starts_with($route, 'cuti/')) {
    $cutiStoragePath = __DIR__ . '/cutiData.json';

    // Helper: load cuti items
    $loadCuti = function() use ($pdo, $useMysql, $cutiStoragePath) {
        if ($useMysql && $pdo) {
            $stmt = $pdo->query("SELECT * FROM tb_cuti ORDER BY id DESC");
            $rows = $stmt->fetchAll();
            $result = [];
            foreach ($rows as $r) {
                $result[] = [
                    'id' => $r['cuti_code'],
                    'no' => (int)$r['no_urut'],
                    'pegawaiId' => $r['pegawai_id'],
                    'nip' => $r['nip'],
                    'nama' => $r['nama'],
                    'jabatan' => $r['jabatan'],
                    'divisi' => $r['divisi'],
                    'tanggalPengajuan' => $r['tanggal_pengajuan'],
                    'tanggalMulai' => $r['tanggal_mulai'],
                    'tanggalAkhir' => $r['tanggal_akhir'],
                    'jumlahHari' => (int)$r['jumlah_hari'],
                    'jatahTahun' => $r['jatah_tahun'],
                    'jenisCuti' => $r['jenis_cuti'],
                    'alasan' => $r['alasan'],
                    'status' => $r['status'],
                    'statusLabel' => $r['status_label'],
                    'verifikasi' => [
                        'tahap1' => [
                            'roleRequired' => 'verifikator_1',
                            'label' => 'Verifikasi 1: Atasan Langsung / Ketimker',
                            'status' => $r['verif_1_status'],
                            'verifikatorNama' => $r['verif_1_nama'],
                            'verifikatorNip' => $r['verif_1_nip'],
                            'tanggal' => $r['verif_1_tanggal'],
                            'catatan' => $r['verif_1_catatan']
                        ],
                        'tahap2' => [
                            'roleRequired' => 'verifikator_2',
                            'label' => 'Verifikasi 2: Kepala Bagian TU (Final)',
                            'status' => $r['verif_2_status'],
                            'verifikatorNama' => $r['verif_2_nama'],
                            'verifikatorNip' => $r['verif_2_nip'],
                            'tanggal' => $r['verif_2_tanggal'],
                            'catatan' => $r['verif_2_catatan']
                        ]
                    ]
                ];
            }
            if (!empty($result)) return $result;
        }

        // Fallback JSON
        if (file_exists($cutiStoragePath)) {
            $raw = json_decode(file_get_contents($cutiStoragePath), true);
            if (is_array($raw)) return $raw;
        }

        // Default initial items
        return [
            [
                'id' => 'CUTI-2025-001',
                'no' => 1,
                'pegawaiId' => 'PEG-013',
                'nip' => '198808062014032001',
                'nama' => 'Agnita Verdiani Putri, A.Md',
                'jabatan' => 'Pengolah Data Dan Informasi',
                'divisi' => 'Tim Kerja Keuangan dan Barang Milik Negara',
                'tanggalPengajuan' => '12-06-2025',
                'tanggalMulai' => '2025-06-16',
                'tanggalAkhir' => '2025-06-17',
                'jumlahHari' => 2,
                'jatahTahun' => '2025',
                'jenisCuti' => 'Tahunan',
                'alasan' => 'Keperluan keluarga di luar kota',
                'status' => 'menunggu_verif_1',
                'statusLabel' => 'Menunggu Verifikasi 1 (Atasan Langsung)',
                'verifikasi' => [
                    'tahap1' => [
                        'roleRequired' => 'verifikator_1',
                        'label' => 'Verifikasi 1: Atasan Langsung / Ketimker',
                        'status' => 'menunggu',
                        'verifikatorNama' => 'Dwi Dinia Rahayu, S.Kom, M.T.I',
                        'verifikatorNip' => '198604092011012024',
                        'tanggal' => null,
                        'catatan' => ''
                    ],
                    'tahap2' => [
                        'roleRequired' => 'verifikator_2',
                        'label' => 'Verifikasi 2: Kepala Bagian TU (Final)',
                        'status' => 'menunggu',
                        'verifikatorNama' => 'Agung Ariyanto, SEI., M.Ec., Dev.',
                        'verifikatorNip' => '198101312009121004',
                        'tanggal' => null,
                        'catatan' => ''
                    ]
                ]
            ]
        ];
    };

    $saveCuti = function($list) use ($cutiStoragePath) {
        file_put_contents($cutiStoragePath, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    };

    // GET /api/cuti
    if ($method === 'GET') {
        $nip = $_GET['nip'] ?? '';
        $role = $_GET['role'] ?? '';
        $history = $loadCuti();

        $user = findPegawai($nip, $pdo, $useMysql) ?? findPegawai('198808062014032001', $pdo, $useMysql);

        $myHistory = $history;
        if ($user && $user['approvalRole'] === 'pemohon' && !str_contains($role, 'admin')) {
            $myHistory = array_filter($history, function($c) use ($user) {
                return $c['nip'] === $user['nip'] || (string)$c['pegawaiId'] === (string)$user['id'];
            });
            $myHistory = array_values($myHistory);
        }

        $pendingVerif1 = array_values(array_filter($history, fn($c) => $c['status'] === 'menunggu_verif_1'));
        $pendingVerif2 = array_values(array_filter($history, fn($c) => $c['status'] === 'menunggu_verif_2'));

        jsonResponse([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user['id'],
                    'nip' => $user['nip'],
                    'nama' => $user['nama'],
                    'jabatan' => $user['jabatan'],
                    'divisi' => $user['divisi'],
                    'systemRole' => $user['systemRole'],
                    'approvalRole' => $user['approvalRole'],
                    'roleLabel' => $user['roleLabel'],
                    'sisaCuti' => $user['sisaCuti'],
                    'cutiTerpakai' => $user['cutiTerpakai'],
                    'expiredCuti' => $user['expiredCuti'],
                    'sisaCutiText' => "2026 - Sisa {$user['sisaCuti']} Hari - Expired {$user['expiredCuti']}"
                ],
                'jenisCutiOptions' => [
                    "Tahunan", "Sakit", "Alasan Penting", "Melahirkan",
                    "Karena Istri Melahirkan", "Cuti Besar", "Cuti di Luar Tanggungan Negara"
                ],
                'history' => $history,
                'myHistory' => $myHistory,
                'pendingVerif1' => $pendingVerif1,
                'pendingVerif2' => $pendingVerif2,
                'summary' => [
                    'totalPengajuan' => count($history),
                    'menungguVerif1' => count($pendingVerif1),
                    'menungguVerif2' => count($pendingVerif2),
                    'disetujui' => count(array_filter($history, fn($c) => $c['status'] === 'disetujui')),
                    'ditolak' => count(array_filter($history, fn($c) => str_starts_with($c['status'], 'ditolak')))
                ]
            ]
        ]);
    }

    // POST /api/cuti (Ajukan Cuti Baru)
    if ($method === 'POST' && ($route === 'cuti' || $route === 'cuti/')) {
        $body = getJsonBody();
        $history = $loadCuti();
        $newNum = count($history) + 1;
        $cutiCode = 'CUTI-2025-' . str_pad($newNum, 3, '0', STR_PAD_LEFT);

        $newItem = [
            'id' => $cutiCode,
            'no' => $newNum,
            'pegawaiId' => $body['pegawaiId'] ?? 'PEG-001',
            'nip' => $body['nip'] ?? '',
            'nama' => $body['nama'] ?? 'Pegawai',
            'jabatan' => $body['jabatan'] ?? '',
            'divisi' => $body['divisi'] ?? '',
            'tanggalPengajuan' => date('d-m-Y'),
            'tanggalMulai' => $body['tanggalMulai'] ?? date('Y-m-d'),
            'tanggalAkhir' => $body['tanggalAkhir'] ?? date('Y-m-d'),
            'jumlahHari' => (int)($body['jumlahHari'] ?? 1),
            'jatahTahun' => $body['jatahTahun'] ?? date('Y'),
            'jenisCuti' => $body['jenisCuti'] ?? 'Tahunan',
            'alasan' => $body['alasan'] ?? '',
            'status' => 'menunggu_verif_1',
            'statusLabel' => 'Menunggu Verifikasi 1 (Atasan Langsung)',
            'verifikasi' => [
                'tahap1' => [
                    'roleRequired' => 'verifikator_1',
                    'label' => 'Verifikasi 1: Atasan Langsung / Ketimker',
                    'status' => 'menunggu',
                    'verifikatorNama' => '-',
                    'verifikatorNip' => '-',
                    'tanggal' => null,
                    'catatan' => ''
                ],
                'tahap2' => [
                    'roleRequired' => 'verifikator_2',
                    'label' => 'Verifikasi 2: Kepala Bagian TU (Final)',
                    'status' => 'menunggu',
                    'verifikatorNama' => '-',
                    'verifikatorNip' => '-',
                    'tanggal' => null,
                    'catatan' => ''
                ]
            ]
        ];

        array_unshift($history, $newItem);
        $saveCuti($history);

        if ($useMysql && $pdo) {
            $stmt = $pdo->prepare("INSERT INTO tb_cuti (cuti_code, no_urut, pegawai_id, nip, nama, jabatan, divisi, tanggal_pengajuan, tanggal_mulai, tanggal_akhir, jumlah_hari, jatah_tahun, jenis_cuti, alasan, status, status_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $cutiCode, $newNum, $newItem['pegawaiId'], $newItem['nip'], $newItem['nama'],
                $newItem['jabatan'], $newItem['divisi'], $newItem['tanggalPengajuan'],
                $newItem['tanggalMulai'], $newItem['tanggalAkhir'], $newItem['jumlahHari'],
                $newItem['jatahTahun'], $newItem['jenisCuti'], $newItem['alasan'],
                $newItem['status'], $newItem['statusLabel']
            ]);
        }

        jsonResponse([
            'success' => true,
            'message' => 'Pengajuan cuti berhasil dikirim! Menunggu Verifikasi Tahap 1 (Atasan Langsung).',
            'data' => $newItem
        ]);
    }

    // POST /api/cuti/:id/verify
    if (str_contains($route, '/verify')) {
        $parts = explode('/', $route);
        $cutiId = $parts[1] ?? '';
        $body = getJsonBody();
        $tahap = (int)($body['tahap'] ?? 1);
        $action = $body['action'] ?? 'approve';
        $verifikator = $body['verifikatorUser'] ?? [];
        $catatan = trim($body['catatan'] ?? '');
        $dateStr = date('d-m-Y H:i');

        $history = $loadCuti();
        $found = false;
        $targetItem = null;

        foreach ($history as &$item) {
            if ($item['id'] === $cutiId) {
                $found = true;
                if ($tahap === 1) {
                    if ($action === 'approve') {
                        $item['verifikasi']['tahap1']['status'] = 'disetujui';
                        $item['verifikasi']['tahap1']['tanggal'] = $dateStr;
                        $item['verifikasi']['tahap1']['verifikatorNama'] = $verifikator['nama'] ?? 'Verifikator 1';
                        $item['verifikasi']['tahap1']['verifikatorNip'] = $verifikator['nip'] ?? '-';
                        $item['verifikasi']['tahap1']['catatan'] = $catatan ?: 'Disetujui oleh Atasan Langsung';
                        $item['status'] = 'menunggu_verif_2';
                        $item['statusLabel'] = 'Menunggu Verifikasi 2 (Kepala Bagian TU)';
                    } else {
                        $item['verifikasi']['tahap1']['status'] = 'ditolak';
                        $item['verifikasi']['tahap1']['tanggal'] = $dateStr;
                        $item['verifikasi']['tahap1']['verifikatorNama'] = $verifikator['nama'] ?? 'Verifikator 1';
                        $item['verifikasi']['tahap1']['verifikatorNip'] = $verifikator['nip'] ?? '-';
                        $item['verifikasi']['tahap1']['catatan'] = $catatan ?: 'Pengajuan ditolak pada verifikasi tahap 1';
                        $item['status'] = 'ditolak_verif_1';
                        $item['statusLabel'] = 'Ditolak oleh Verifikator 1';
                    }
                } elseif ($tahap === 2) {
                    if ($action === 'approve') {
                        $item['verifikasi']['tahap2']['status'] = 'disetujui';
                        $item['verifikasi']['tahap2']['tanggal'] = $dateStr;
                        $item['verifikasi']['tahap2']['verifikatorNama'] = $verifikator['nama'] ?? 'Verifikator 2';
                        $item['verifikasi']['tahap2']['verifikatorNip'] = $verifikator['nip'] ?? '-';
                        $item['verifikasi']['tahap2']['catatan'] = $catatan ?: 'Disetujui secara final oleh Kepala Bagian TU';
                        $item['status'] = 'disetujui';
                        $item['statusLabel'] = 'Disetujui Lengkap (Final)';

                        // Potong cuti
                        if ($item['jenisCuti'] === 'Tahunan') {
                            $days = (int)$item['jumlahHari'];
                            if ($useMysql && $pdo) {
                                $stmt = $pdo->prepare("UPDATE tb_pegawai SET sisa_cuti = GREATEST(0, sisa_cuti - ?), cuti_terpakai = cuti_terpakai + ? WHERE nip = ? OR pegawai_id = ?");
                                $stmt->execute([$days, $days, $item['nip'], $item['pegawaiId']]);
                            }
                        }
                    } else {
                        $item['verifikasi']['tahap2']['status'] = 'ditolak';
                        $item['verifikasi']['tahap2']['tanggal'] = $dateStr;
                        $item['verifikasi']['tahap2']['verifikatorNama'] = $verifikator['nama'] ?? 'Verifikator 2';
                        $item['verifikasi']['tahap2']['verifikatorNip'] = $verifikator['nip'] ?? '-';
                        $item['verifikasi']['tahap2']['catatan'] = $catatan ?: 'Pengajuan ditolak pada verifikasi tahap 2';
                        $item['status'] = 'ditolak_verif_2';
                        $item['statusLabel'] = 'Ditolak oleh Verifikator 2';
                    }
                }
                $targetItem = $item;
                break;
            }
        }

        if ($found) {
            $saveCuti($history);
            if ($useMysql && $pdo && $targetItem) {
                $stmt = $pdo->prepare("UPDATE tb_cuti SET status = ?, status_label = ?, verif_1_status = ?, verif_1_nama = ?, verif_1_nip = ?, verif_1_tanggal = ?, verif_1_catatan = ?, verif_2_status = ?, verif_2_nama = ?, verif_2_nip = ?, verif_2_tanggal = ?, verif_2_catatan = ? WHERE cuti_code = ?");
                $stmt->execute([
                    $targetItem['status'], $targetItem['statusLabel'],
                    $targetItem['verifikasi']['tahap1']['status'], $targetItem['verifikasi']['tahap1']['verifikatorNama'],
                    $targetItem['verifikasi']['tahap1']['verifikatorNip'], $targetItem['verifikasi']['tahap1']['tanggal'],
                    $targetItem['verifikasi']['tahap1']['catatan'], $targetItem['verifikasi']['tahap2']['status'],
                    $targetItem['verifikasi']['tahap2']['verifikatorNama'], $targetItem['verifikasi']['tahap2']['verifikatorNip'],
                    $targetItem['verifikasi']['tahap2']['tanggal'], $targetItem['verifikasi']['tahap2']['catatan'],
                    $cutiId
                ]);
            }
            jsonResponse([
                'success' => true,
                'message' => 'Verifikasi cuti berhasil diproses',
                'data' => $targetItem
            ]);
        }
        jsonResponse(['success' => false, 'message' => 'Data cuti tidak ditemukan'], 404);
    }
}

// -------------------------------------------------------
// 4. ADMS LOGS & SIMULATOR
// -------------------------------------------------------
if ($route === 'adms/api/logs' || $route === 'adms/logs') {
    $admsLogPath = __DIR__ . '/admsLogs.json';
    $logs = file_exists($admsLogPath) ? json_decode(file_get_contents($admsLogPath), true) : [];
    if (!is_array($logs)) $logs = [];
    jsonResponse(['success' => true, 'data' => $logs]);
}

if ($route === 'adms/api/machines' || $route === 'adms/machines') {
    jsonResponse([
        'success' => true,
        'data' => [
            [
                'sn' => 'BNDK19280012',
                'namaMesin' => 'Mesin Absensi Lobi Utama BRMP DIY',
                'ip' => '192.168.1.200',
                'lastSync' => date('Y-m-d H:i:s'),
                'status' => 'Online',
                'totalLogs' => 24
            ]
        ]
    ]);
}

if ($route === 'adms/api/simulate' || $route === 'adms/simulate') {
    $body = getJsonBody();
    $pin = trim($body['pin'] ?? '');
    $statusAbsen = $body['statusAbsen'] ?? 'Masuk';
    $now = date('Y-m-d H:i:s');
    $time = date('H:i:s');

    $matchedUser = findPegawai($pin, $pdo, $useMysql) ?? [
        'nama' => "Pegawai (ID: $pin)",
        'jabatan' => 'Staf Pegawai'
    ];

    $keterangan = ($statusAbsen === 'Masuk' && $time > '07:30:00') ? "Terlambat ($time)" : "Tepat Waktu ($time)";

    $newLog = [
        'id' => time(),
        'sn' => 'SIMULATOR-01',
        'pin' => $pin,
        'nama' => $matchedUser['nama'],
        'jabatan' => $matchedUser['jabatan'],
        'datetime' => $now,
        'tanggal' => date('Y-m-d'),
        'jam' => $time,
        'statusAbsen' => $statusAbsen,
        'keterangan' => $keterangan
    ];

    $admsLogPath = __DIR__ . '/admsLogs.json';
    $logs = file_exists($admsLogPath) ? json_decode(file_get_contents($admsLogPath), true) : [];
    if (!is_array($logs)) $logs = [];
    array_unshift($logs, $newLog);
    file_put_contents($admsLogPath, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    jsonResponse([
        'success' => true,
        'message' => "Berhasil mencatat absensi mesin untuk {$matchedUser['nama']} ($statusAbsen jam $time)",
        'data' => $newLog
    ]);
}

// -------------------------------------------------------
// 5. DASHBOARD & ABSENSI BULANAN
// -------------------------------------------------------
if ($route === 'dashboard') {
    $user = findPegawai('198808062014032001', $pdo, $useMysql);
    jsonResponse([
        'success' => true,
        'data' => [
            'user' => $user,
            'hariTanggal' => date('l, d F Y'),
            'jamKerja' => '07:30:00 - 16:00:00',
            'jamMasuk' => '07:23:54',
            'jamPulang' => '16:08:55',
            'sisaCuti' => $user['sisaCuti'] ?? 12,
            'persentaseCuti' => '100%',
            'agenda' => [
                ['id' => 1, 'date' => date('Y-m-d'), 'title' => 'Penerapan Standar Instrumen Pertanian BRMP', 'type' => 'event'],
                ['id' => 2, 'date' => date('Y-m-d', strtotime('+3 days')), 'title' => 'Rapat Koordinasi Tim Kerja', 'type' => 'meeting']
            ]
        ]
    ]);
}

// Default response for undefined route
jsonResponse(['success' => false, 'message' => "Endpoint '/api/$route' not found"], 404);
