import React, { useEffect, useRef } from 'react';

export default function SptProgram({ user, targetView }) {
  const iframeRef = useRef(null);
  const portalUrl = '/spt-portal/index.html?embedded=1';

  // Sync user & target view with the brmpSPT application
  const syncWithIframe = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      const iframeWin = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      if (!iframeDoc || !iframeWin.App) return;

      // Force embedded mode to hide internal duplicate sidebar
      if (iframeDoc.body) {
        iframeDoc.body.classList.add('embedded-mode');
      }

      // Determine matching role for demo login if needed
      const role = user?.role || (
        user?.nip === '198101312009121004' ? 'kobag_tu' :
        user?.nip === '198604092011012024' || user?.nip === '197106141992032001' ? 'ketimker' :
        user?.nip === '199111042023212041' ? 'admin_sekretariat' :
        user?.nip === '197402062000032001' ? 'kopoks' : 'user'
      );

      // If user in iframe doesn't match or is on login page, log them in
      const currentIframeUser = iframeWin.App.currentUser;
      if (!currentIframeUser || currentIframeUser.nip !== user?.nip) {
        if (typeof iframeWin.App.loginAsDemo === 'function') {
          iframeWin.App.loginAsDemo(role);
        }
      }

      // Navigate to target view if specified
      if (targetView && typeof iframeWin.App.navigateTo === 'function') {
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
        const viewToNav = viewMap[targetView] || targetView;
        iframeWin.App.navigateTo(viewToNav);
      }
    } catch (err) {
      // Cross-origin fallback (in case proxy isn't used)
      console.debug('Direct iframe sync note:', err.message);
    }
  };

  useEffect(() => {
    syncWithIframe();
  }, [user, targetView]);

  return (
    <div 
      style={{ 
        width: '100%', 
        height: 'calc(100vh - 64px)', 
        margin: 0, 
        padding: 0, 
        overflow: 'hidden',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
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
