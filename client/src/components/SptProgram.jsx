import React, { useEffect, useRef } from 'react';

export function resolveSptRole(user) {
  if (!user) return 'user';
  
  const r = String(user.sptRole || user.roleDefault || user.role || '').toLowerCase();
  if (['admin', 'admin_sekretariat', 'kobag_tu', 'ketimker', 'kopoks', 'user'].includes(r)) {
    return r;
  }

  const nip = String(user.nip || '').trim();
  const id = String(user.id || '').toUpperCase();

  // 1. Administrator Sistem (Superadmin Kepegawaian)
  if (id === 'PEG-ADM' || user.systemRole === 'admin' || user.username === 'admin') {
    return 'admin';
  }

  // 2. Admin Sekretariat (Tata Persuratan & Penomoran Resmi)
  if (
    nip === '199111042023212041' || 
    nip === '199103102025211055' || 
    id === 'PEG-017' || 
    id === 'PEG-021' ||
    user.username === 'admin.sekretariat' ||
    user.username === 'novita.widiyanti'
  ) {
    return 'admin_sekretariat';
  }

  // 3. Kobag TU
  if (nip === '198101312009121004' || id === 'PEG-002') {
    return 'kobag_tu';
  }

  // 3. Ketua Tim Kerja (12 Tim Kerja Resmi BRMP DIY)
  const KETIMKER_NIPS = [
    "198604092011012024", // Dwi Dinia Rahayu (SDM)
    "198106212006042002", // Asri Wijayanti (Keuangan & BMN)
    "197106141992032001", // Yuni Pratiwi (TU & RT)
    "198302162011011008", // Eko Sutardi (Program, Evaluasi, Pendampingan)
    "198003272009101001", // Agung Iswadi (Pengujian Tek Spesifik Lokasi)
    "197206181999032001", // Kurnianita Triwidiastuti (Pendampingan Wilayah I)
    "197606072009011006", // Utomo Bimo Bekti (Pendampingan Wilayah II)
    "198108262011012006", // Diah Sulistyorini (Diseminasi)
    "198012072006042001", // Charisnalia Listyowati (Kerjasama, Layanan)
    "196807121999031001", // Widada (Lab Pupuk Tanah Air)
    "197512062009012001", // Purwaningsih (UPBS)
    "197407262008011010"  // Prabowo Lestari (KP Banyakan)
  ];
  const KETIMKER_IDS = ['PEG-003', 'PEG-006', 'PEG-015', 'PEG-046', 'PEG-049', 'PEG-054', 'PEG-059', 'PEG-065', 'PEG-071', 'PEG-074', 'PEG-087', 'PEG-092'];
  if (KETIMKER_NIPS.includes(nip) || KETIMKER_IDS.includes(id)) {
    return 'ketimker';
  }

  // 4. Koordinator Poksi / Substansi
  const KOPOKS_NIPS = [
    "197402062000032001", // Dr. Fibrianty (Modernisasi Pertanian)
    "197804242008011009", // Dr. Ahmad Yunan Arifin (Program & Pengujian)
    "198207052006042002"  // Dr. Christina Astri Wirasti (Penerapan & Kesesuaian)
  ];
  const KOPOKS_IDS = ['PEG-045', 'PEG-053', 'PEG-064', 'PEG-034'];
  if (KOPOKS_NIPS.includes(nip) || KOPOKS_IDS.includes(id)) {
    return 'kopoks';
  }

  return 'user';
}

export default function SptProgram({ user, targetView }) {
  const iframeRef = useRef(null);

  // Determine user role in brmpSPT
  const role = resolveSptRole(user);

  const roleLabelMap = {
    admin: "Administrator Sistem",
    admin_sekretariat: "Admin Sekretariat (Tata Persuratan)",
    kobag_tu: "Kobag TU (Approval Utama)",
    ketimker: "Ketimker (Ketua Tim Kerja)",
    kopoks: "Kopoks (Koordinator Poksi)",
    user: "User (Pemohon/Pegawai)"
  };

  const sptUser = {
    id: `usr-${(user?.id || 'peg').toLowerCase()}`,
    pegawaiId: user?.id || 'PEG-001',
    username: (user?.nama || 'pegawai').toLowerCase().replace(/[^a-z]/g, '').slice(0, 10),
    nama: user?.nama || 'Pegawai BRMP',
    nip: user?.nip || '',
    role: role,
    roleLabel: roleLabelMap[role] || user?.roleLabel || 'Pegawai',
    jabatan: user?.jabatan || 'Staf',
    golongan: user?.golongan || '',
    unitKerja: user?.divisi || 'Balai Penerapan Standar Instrumen Pertanian DIY',
    avatar: user?.nama ? user.nama.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : 'US'
  };

  // Pre-seed localStorage so brmpSPT doesn't show the login screen
  try {
    localStorage.setItem('brmp_spt_current_user', JSON.stringify(sptUser));
  } catch (e) {}

  const viewMap = {
    'dashboard': 'dashboard',
    'pengajuan': 'pengajuan',
    'tracking': 'tracking',
    'approval': role === 'kobag_tu' ? 'approval-kobag' : 'approval-ketimker',
    'approval-ketimker': 'approval-ketimker',
    'approval-kobag': 'approval-kobag',
    'admin-sekretariat': 'admin-sekretariat',
    'monitoring-kopoks': 'monitoring-kopoks',
    'admin': 'admin-sekretariat',
    'sop': 'sop'
  };

  const resolvedView = viewMap[targetView] || targetView || 'dashboard';
  const portalUrl = `/spt-portal/index.html?embedded=1&view=${encodeURIComponent(resolvedView)}`;

  // Sync user & target view with the brmpSPT application
  const syncWithIframe = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      // Post message to iframe
      iframe.contentWindow.postMessage({
        type: 'SYNC_SPT_USER',
        user: sptUser,
        targetView: resolvedView
      }, '*');

      // Direct method call if same-origin is available
      if (iframe.contentWindow.App && typeof iframe.contentWindow.App.syncPortalUser === 'function') {
        iframe.contentWindow.App.syncPortalUser(sptUser, resolvedView);
      }
    } catch (err) {
      console.debug('Direct iframe sync note:', err.message);
    }
  };

  useEffect(() => {
    syncWithIframe();
  }, [user?.nip, resolvedView]);

  return (
    <div className="spt-program-container" style={{ width: '100%', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <iframe
        ref={iframeRef}
        id="brmpSptAppIframe"
        src={portalUrl}
        onLoad={syncWithIframe}
        title="Sistem E-SPT Digital Standar Kementerian Pertanian RI - BRMP DIY"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          flex: 1
        }}
      />
    </div>
  );
}

