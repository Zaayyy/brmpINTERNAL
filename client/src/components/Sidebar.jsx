import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  CalendarOff, 
  FileText,
  ChevronDown, 
  ChevronRight,
  LayoutGrid,
  CheckCircle2,
  PenSquare,
  Clock,
  ShieldCheck,
  BookOpen,
  Settings,
  X
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, user, isOpen, onClose }) {
  // Accordion state for submenus
  const [openAbsensi, setOpenAbsensi] = useState(
    currentView === 'absensi-bulanan' || currentView === 'absensi-chart'
  );
  const [openCuti, setOpenCuti] = useState(
    currentView === 'pengajuan-cuti'
  );
  const [openSpt, setOpenSpt] = useState(true);

  // Helper to change view and close mobile drawer
  const navigateTo = (view) => {
    setCurrentView(view);
    if (onClose) onClose();
  };

  // Determine user role in brmpSPT
  const role = user?.role || (
    user?.nip === '198101312009121004' ? 'kobag_tu' :
    user?.nip === '198604092011012024' || user?.nip === '197106141992032001' ? 'ketimker' :
    user?.nip === '199111042023212041' ? 'admin_sekretariat' :
    user?.nip === '197402062000032001' ? 'kopoks' : 'user'
  );

  const handleToggleSpt = () => {
    const nextState = !openSpt;
    setOpenSpt(nextState);
    if (nextState && !currentView.startsWith('spt')) {
      navigateTo('spt-dashboard');
    }
  };

  return (
    <aside className={`app-sidebar no-print ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Close Button Header */}
      <div className="sidebar-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} className="text-blue-600" />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e3a8a' }}>KITA BRMP DIY</span>
        </div>
        <button 
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Tutup navigasi"
          title="Tutup navigasi"
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile Section */}
      <div 
        className="sidebar-profile" 
        onClick={() => navigateTo('pengaturan-akun')}
        title="Klik untuk membuka Pengaturan Akun & Profil"
        style={{ cursor: 'pointer' }}
      >
        <div className="profile-avatar-wrap">
          {user?.fotoProfil ? (
            <img 
              src={user.fotoProfil} 
              alt={user?.nama || "Foto Profil"} 
              className="profile-avatar"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div 
              className="profile-avatar"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.5px'
              }}
            >
              {(() => {
                const parts = (user?.nama || 'Pegawai').trim().split(' ').filter(p => !p.includes('.') && p.length > 1);
                if (parts.length >= 2) {
                  return (parts[0][0] + parts[1][0]).toUpperCase();
                }
                return (user?.nama || 'P').charAt(0).toUpperCase();
              })()}
            </div>
          )}
        </div>
        <h3 className="profile-name">{user?.nama || 'Agnita Verdiani Putri'}</h3>
        <span className="profile-date" style={{ fontSize: '0.72rem', color: '#64748b' }}>
          {user?.jabatan || 'Pegawai BRMP DIY'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Dashboard */}
        <button 
          className={`nav-item-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigateTo('dashboard')}
        >
          <div className="nav-item-left">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>
        </button>

        {/* Info Absensi */}
        <div>
          <button 
            className={`nav-item-btn ${currentView.includes('absensi') ? 'active' : ''}`}
            onClick={() => setOpenAbsensi(!openAbsensi)}
          >
            <div className="nav-item-left">
              <CalendarCheck2 size={18} />
              <span>Info Absensi</span>
            </div>
            {openAbsensi ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openAbsensi && (
            <div className="submenu-list">
              <button 
                className={`submenu-btn ${currentView === 'absensi-bulanan' ? 'active' : ''}`}
                onClick={() => navigateTo('absensi-bulanan')}
              >
                <span>• Bulanan</span>
              </button>
              <button 
                className={`submenu-btn ${currentView === 'absensi-chart' ? 'active' : ''}`}
                onClick={() => navigateTo('absensi-chart')}
              >
                <span>• Chart</span>
              </button>
              <button 
                className={`submenu-btn ${currentView === 'adms-monitor' ? 'active' : ''}`}
                onClick={() => navigateTo('adms-monitor')}
              >
                <span>• Mesin Absensi (ADMS)</span>
              </button>
            </div>
          )}
        </div>

        {/* Cuti Pegawai */}
        <div>
          <button 
            className={`nav-item-btn ${currentView === 'pengajuan-cuti' ? 'active' : ''}`}
            onClick={() => {
              setOpenCuti(!openCuti);
              navigateTo('pengajuan-cuti');
            }}
          >
            <div className="nav-item-left">
              <CalendarOff size={18} />
              <span>Cuti Pegawai</span>
            </div>
            {openCuti ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openCuti && (
            <div className="submenu-list">
              <button 
                className={`submenu-btn ${currentView === 'pengajuan-cuti' ? 'active' : ''}`}
                onClick={() => navigateTo('pengajuan-cuti')}
              >
                <span>• Pengajuan & Verifikasi (2 Tahap)</span>
              </button>
            </div>
          )}
        </div>

        {/* SPT Digital (Program Resmi brmpSPT - Sesuai Hak Akses & Desain brmpSPT) */}
        <div>
          <button 
            className={`nav-item-btn ${currentView.includes('spt') ? 'active' : ''}`}
            onClick={handleToggleSpt}
          >
            <div className="nav-item-left">
              <FileText size={18} />
              <span>SPT Digital</span>
            </div>
            {openSpt ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openSpt && (
            <div className="submenu-spt-list">
              {/* 1. SEKSI UTAMA */}
              <div className="submenu-category">Utama</div>
              <button 
                className={`submenu-spt-btn ${currentView === 'spt-dashboard' || currentView === 'spt' ? 'active' : ''}`}
                onClick={() => navigateTo('spt-dashboard')}
              >
                <div className="submenu-spt-left">
                  <LayoutGrid size={15} />
                  <span>
                    {role === 'ketimker' ? 'Dashboard Ketimker' :
                     role === 'kobag_tu' ? 'Dashboard Kobag TU' :
                     role === 'kopoks' ? 'Dashboard Kopoks' :
                     role === 'admin_sekretariat' ? 'Dashboard Admin' : 'Dashboard Pemohon'}
                  </span>
                </div>
              </button>

              {/* 2. SEKSI ROLE SPESIFIK */}
              {role === 'ketimker' && (
                <>
                  <div className="submenu-category">Verifikasi Tim Kerja</div>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-approval-ketimker' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-approval-ketimker')}
                  >
                    <div className="submenu-spt-left">
                      <CheckCircle2 size={15} />
                      <span>Approval Unit Kerja</span>
                    </div>
                    <span className="submenu-badge">1</span>
                  </button>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-pengajuan' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-pengajuan')}
                  >
                    <div className="submenu-spt-left">
                      <PenSquare size={15} />
                      <span>Buat SPT Tim</span>
                    </div>
                  </button>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-tracking' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-tracking')}
                  >
                    <div className="submenu-spt-left">
                      <Clock size={15} />
                      <span>Daftar Seluruh SPT</span>
                    </div>
                  </button>
                </>
              )}

              {role === 'user' && (
                <>
                  <div className="submenu-category">Layanan SPT Saya</div>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-pengajuan' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-pengajuan')}
                  >
                    <div className="submenu-spt-left">
                      <PenSquare size={15} />
                      <span>Ajukan SPT Baru</span>
                    </div>
                  </button>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-tracking' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-tracking')}
                  >
                    <div className="submenu-spt-left">
                      <Clock size={15} />
                      <span>Tracking & Unduh SPT</span>
                    </div>
                    <span className="submenu-badge">1</span>
                  </button>
                </>
              )}

              {role === 'kobag_tu' && (
                <>
                  <div className="submenu-category">Persetujuan Eksekutif</div>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-approval-kobag' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-approval-kobag')}
                  >
                    <div className="submenu-spt-left">
                      <ShieldCheck size={15} />
                      <span>Approval Utama Kobag</span>
                    </div>
                    <span className="submenu-badge">1</span>
                  </button>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-monitoring-kopoks' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-monitoring-kopoks')}
                  >
                    <div className="submenu-spt-left">
                      <BookOpen size={15} />
                      <span>Pantau Penugasan Balai</span>
                    </div>
                  </button>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-tracking' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-tracking')}
                  >
                    <div className="submenu-spt-left">
                      <Clock size={15} />
                      <span>Arsip Seluruh SPT</span>
                    </div>
                  </button>
                </>
              )}

              {role === 'kopoks' && (
                <>
                  <div className="submenu-category">Pemantauan Substansi</div>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-monitoring-kopoks' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-monitoring-kopoks')}
                  >
                    <div className="submenu-spt-left">
                      <BookOpen size={15} />
                      <span>Monitoring Penugasan</span>
                    </div>
                  </button>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-tracking' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-tracking')}
                  >
                    <div className="submenu-spt-left">
                      <Clock size={15} />
                      <span>Rekapitulasi SPT</span>
                    </div>
                  </button>
                </>
              )}

              {role === 'admin_sekretariat' && (
                <>
                  <div className="submenu-category">Administrasi Tata Persuratan</div>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-admin-sekretariat' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-admin-sekretariat')}
                  >
                    <div className="submenu-spt-left">
                      <Settings size={15} />
                      <span>Admin Sekretariat</span>
                    </div>
                    <span className="submenu-badge">1</span>
                  </button>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-pengajuan' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-pengajuan')}
                  >
                    <div className="submenu-spt-left">
                      <PenSquare size={15} />
                      <span>Input Pengajuan SPT</span>
                    </div>
                  </button>
                  <button 
                    className={`submenu-spt-btn ${currentView === 'spt-tracking' ? 'active' : ''}`}
                    onClick={() => navigateTo('spt-tracking')}
                  >
                    <div className="submenu-spt-left">
                      <Clock size={15} />
                      <span>Daftar Seluruh SPT</span>
                    </div>
                  </button>
                </>
              )}

              {/* 3. SEKSI REGULASI & PEDOMAN */}
              <div className="submenu-category">Regulasi & Pedoman</div>
              <button 
                className={`submenu-spt-btn ${currentView === 'spt-sop' ? 'active' : ''}`}
                onClick={() => navigateTo('spt-sop')}
              >
                <div className="submenu-spt-left">
                  <FileText size={15} />
                  <span>SOP & Tata Naskah Dinas</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Pengaturan Akun & Profil */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button 
            className={`nav-item-btn ${currentView === 'pengaturan-akun' ? 'active' : ''}`}
            onClick={() => navigateTo('pengaturan-akun')}
          >
            <div className="nav-item-left">
              <Settings size={18} />
              <span>Pengaturan Akun</span>
            </div>
          </button>
        </div>

        {/* Information badge */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
          <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ fontWeight: 700, color: '#15803d', display: 'block', marginBottom: '2px' }}>Modul E-SPT Digital</span>
            <span>Standar Pertanian RI</span>
          </div>
        </div>
      </nav>
    </aside>
  );
}
