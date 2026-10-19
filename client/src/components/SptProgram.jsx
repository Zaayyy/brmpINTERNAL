import React, { useEffect, useRef } from 'react';

export function resolveSptRole(user) {
  if (!user) return 'user';
  
  const KETIMKER_NIPS = [
    "198108262011012006", "198012072006042001", "196807121999031001", "197606072009011006",
    "197206181999032001", "198003272009101001", "198302162011011008", "197106141992032001",
    "198106212006042002", "198604092011012024"
  ];

  const nip = String(user.nip || '').trim();
  const r = String(user.sptRole || user.role || '').toLowerCase();

  if (nip === '198101312009121004' || r === 'kobag_tu' || user.id === 'PEG-002') {
    return 'kobag_tu';
  }
  if (KETIMKER_NIPS.includes(nip) || r === 'ketimker' || user.id === 'PEG-003' || user.id === 'PEG-017') {
    return 'ketimker';
  }
  if (nip === '197402062000032001' || r === 'kopoks' || user.id === 'PEG-034') {
    return 'kopoks';
  }
  if (nip === '199111042023212041' || r === 'admin_sekretariat' || r === 'admin' || user.username === 'admin') {
    return 'admin_sekretariat';
  }

  return 'user';
}

export default function SptProgram({ user, targetView }) {
  const iframeRef = useRef(null);

  // Determine user role in brmpSPT
  const role = resolveSptRole(user);

  const roleLabelMap = {
    admin_sekretariat: "Admin Sekretariat",
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

