import React from 'react';
import { ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';

export default function SptStandaloneEmbed() {
  const portalUrl = 'http://localhost:5000/spt-portal';

  const handleOpenExternal = () => {
    window.open(portalUrl, '_blank');
  };

  const handleRefresh = () => {
    const iframe = document.getElementById('brmpSptIframe');
    if (iframe) {
      iframe.src = portalUrl;
    }
  };

  return (
    <div className="spt-module-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Top Banner Toolbar */}
      <div className="breadcrumb-banner no-print" style={{ marginBottom: '12px' }}>
        <div>
          <h1 className="breadcrumb-title">
            <ShieldCheck size={24} className="text-blue-600" />
            <span>Aplikasi E-SPT Mandiri (brmpSPT Original Web App)</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">Standalone Portal brmpSPT</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary"
            onClick={handleRefresh}
            title="Muat ulang aplikasi"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} />
            <span>Reload</span>
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleOpenExternal}
            title="Buka aplikasi brmpSPT di tab peramban baru"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ExternalLink size={15} />
            <span>Buka di Tab Baru</span>
          </button>
        </div>
      </div>

      {/* Embedded Iframe Container */}
      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <iframe
          id="brmpSptIframe"
          src={portalUrl}
          title="Sistem E-SPT Mandiri Kementan BRMP DIY"
          style={{ width: '100%', height: '100%', minHeight: '650px', border: 'none' }}
        />
      </div>
    </div>
  );
}
