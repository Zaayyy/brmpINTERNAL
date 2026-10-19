import React, { useState } from 'react';
import { resolveSptRole } from './SptProgram';
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
  const role = resolveSptRole(user);

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

          {openSpt && (() => {
            const isSuperAdmin = role === 'admin' || user?.systemRole === 'admin' || user?.username === 'admin';
            const isAdminSekretariat = role === 'admin_sekretariat';

            return (
              <div className="submenu-spt-list">
                {/* 1. SEKSI UTAMA (Semua Role) */}
                <div className="submenu-category">Utama</div>
                <button 
                  className={`submenu-spt-btn ${currentView === 'spt-dashboard' || currentView === 'spt' ? 'active' : ''}`}
                  onClick={() => navigateTo('spt-dashboard')}
                >
                  <div className="submenu-spt-left">
                    <LayoutGrid size={15} />
                    <span>Dashboard SPT</span>
                  </div>
                  <span className="submenu-badge" style={{ 
                    background: isSuperAdmin ? '#dc2626' : isAdminSekretariat ? '#0284c7' : role === 'kobag_tu' ? '#7c3aed' : role === 'ketimker' ? '#16a34a' : role === 'kopoks' ? '#d97706' : '#2563eb' 
                  }}>
                    {isSuperAdmin ? 'Super Admin' : isAdminSekretariat ? 'Sekretariat' : role === 'kobag_tu' ? 'Kobag TU' : role === 'ketimker' ? 'Ketimker' : role === 'kopoks' ? 'Kopoks' : 'Pegawai'}
                  </span>
                </button>

                {/* 2. TATA PERSURATAN (Wewenang Khusus Admin Sekretariat & Super Admin) */}
                {(isAdminSekretariat || isSuperAdmin) && (
                  <>
                    <div className="submenu-category">Tata Persuratan</div>
                    <button 
                      className={`submenu-spt-btn ${currentView === 'spt-admin-sekretariat' ? 'active' : ''}`}
                      onClick={() => navigateTo('spt-admin-sekretariat')}
                    >
                      <div className="submenu-spt-left">
                        <Settings size={15} />
                        <span>Admin Sekretariat (5 Subtab)</span>
                      </div>
                      <span className="submenu-badge" style={{ background: '#0284c7' }}>Pusat TU</span>
                    </button>
                  </>
                )}

                {/* 3. LAYANAN PERSURATAN & PENGAJUAN (Pemohon, Ketimker, Admin Sekretariat, Super Admin) */}
                {(role === 'user' || role === 'ketimker' || isAdminSekretariat || isSuperAdmin) && (
                  <>
                    <div className="submenu-category">{isAdminSekretariat ? 'Layanan Persuratan' : role === 'user' ? 'Layanan SPT Saya' : 'Layanan SPT'}</div>
                    <button 
                      className={`submenu-spt-btn ${currentView === 'spt-pengajuan' ? 'active' : ''}`}
                      onClick={() => navigateTo('spt-pengajuan')}
                    >
                      <div className="submenu-spt-left">
                        <PenSquare size={15} />
                        <span>{role === 'ketimker' ? 'Buat SPT Tim' : isAdminSekretariat || isSuperAdmin ? 'Input Pengajuan SPT' : 'Ajukan SPT Baru'}</span>
                      </div>
                    </button>
                    <button 
                      className={`submenu-spt-btn ${currentView === 'spt-tracking' ? 'active' : ''}`}
                      onClick={() => navigateTo('spt-tracking')}
                    >
                      <div className="submenu-spt-left">
                        <Clock size={15} />
                        <span>{isAdminSekretariat ? 'Daftar & Penomoran SPT' : role === 'user' ? 'Tracking & Unduh SPT' : 'Daftar Seluruh SPT'}</span>
                      </div>
                    </button>
                  </>
                )}

                {/* Khusus Kobag TU & Kopoks: Arsip / Rekapitulasi SPT */}
                {(role === 'kobag_tu' || role === 'kopoks') && (
                  <>
                    <div className="submenu-category">Daftar & Arsip SPT</div>
                    <button 
                      className={`submenu-spt-btn ${currentView === 'spt-tracking' ? 'active' : ''}`}
                      onClick={() => navigateTo('spt-tracking')}
                    >
                      <div className="submenu-spt-left">
                        <Clock size={15} />
                        <span>{role === 'kobag_tu' ? 'Arsip Seluruh SPT' : 'Rekapitulasi SPT'}</span>
                      </div>
                    </button>
                  </>
                )}

                {/* 4. VERIFIKASI & APPROVAL SPT (Hanya untuk Ketimker, Kobag TU, atau Super Admin — BUKAN Admin Sekretariat) */}
                {(role === 'ketimker' || role === 'kobag_tu' || isSuperAdmin) && (
                  <>
                    <div className="submenu-category">
                      {role === 'ketimker' ? 'Verifikasi Tim Kerja' : role === 'kobag_tu' ? 'Persetujuan Eksekutif' : 'Supervisi Approval'}
                    </div>
                    
                    {(role === 'ketimker' || isSuperAdmin) && (
                      <button 
                        className={`submenu-spt-btn ${currentView === 'spt-approval-ketimker' ? 'active' : ''}`}
                        onClick={() => navigateTo('spt-approval-ketimker')}
                      >
                        <div className="submenu-spt-left">
                          <CheckCircle2 size={15} />
                          <span>Approval Unit Kerja (Ketimker)</span>
                        </div>
                        <span className="submenu-badge" style={{ background: '#16a34a' }}>
                          Tahap 1
                        </span>
                      </button>
                    )}

                    {(role === 'kobag_tu' || isSuperAdmin) && (
                      <button 
                        className={`submenu-spt-btn ${currentView === 'spt-approval-kobag' ? 'active' : ''}`}
                        onClick={() => navigateTo('spt-approval-kobag')}
                      >
                        <div className="submenu-spt-left">
                          <ShieldCheck size={15} />
                          <span>Approval Utama (Kobag TU)</span>
                        </div>
                        <span className="submenu-badge" style={{ background: '#7c3aed' }}>
                          Tahap 2
                        </span>
                      </button>
                    )}
                  </>
                )}

                {/* 5. PENGAWASAN & MONITORING (Khusus Kopoks, Kobag TU, atau Super Admin — BUKAN Admin Sekretariat) */}
                {(role === 'kopoks' || role === 'kobag_tu' || isSuperAdmin) && (
                  <>
                    <div className="submenu-category">{role === 'kopoks' ? 'Pemantauan Substansi' : 'Monitoring & Evaluasi'}</div>
                    <button 
                      className={`submenu-spt-btn ${currentView === 'spt-monitoring-kopoks' ? 'active' : ''}`}
                      onClick={() => navigateTo('spt-monitoring-kopoks')}
                    >
                      <div className="submenu-spt-left">
                        <BookOpen size={15} />
                        <span>Monitoring Penugasan (Kopoks)</span>
                      </div>
                    </button>
                  </>
                )}

                {/* 6. REGULASI & PEDOMAN (Semua Role) */}
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
            );
          })()}
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
