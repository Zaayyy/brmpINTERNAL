import React, { useState, useEffect } from 'react';
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
  Settings2,
  X,
  Users,
  UserCheck,
  Zap,
  Calendar,
  Palmtree,
  Files,
  Fingerprint,
  CalendarHeart,
  ScrollText,
  FileStack,
  FileBadge2,
  FolderKanban,
  CalendarDays,
  Sliders,
  Gauge,
  LogOut,
  Bell,
  ArrowUpRight
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, user, isOpen, onClose, onLogout }) {
  // Dynamic live Indonesian formatted date that updates automatically with day changes
  const [currentDateString, setCurrentDateString] = useState(() => {
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  });

  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      setCurrentDateString(`${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`);
    };

    // Check & update automatically every minute
    const timer = setInterval(updateDate, 60000);
    return () => clearInterval(timer);
  }, []);

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

  const isAdmin = true; // Admin Web Portal selalu menggunakan Sidebar Administrator

  // If Admin mode, render the clean & streamlined 4-category Administrator Sidebar
  if (isAdmin) {
    return (
      <aside 
        className={`app-sidebar admin-sidebar-green no-print ${isOpen ? 'sidebar-open' : ''}`}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Mobile Close Button Header */}
        <div className="sidebar-mobile-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', background: 'rgba(0, 0, 0, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>BRMP DIY ADMIN</span>
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Tutup navigasi"
            title="Tutup navigasi"
            style={{ color: '#ffffff' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Clean Institutional Branding Header */}
        <div style={{
          padding: '1.25rem 1.15rem 0.95rem',
          background: 'rgba(0, 0, 0, 0.16)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          textAlign: 'center'
        }}>
          <div style={{ 
            marginBottom: '10px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.18rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: '0.01em',
              textAlign: 'center'
            }}>
              BRMP DIY
            </h2>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#a7f3d0',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textAlign: 'center',
              marginTop: '4px'
            }}>
              ADMINISTRATOR
            </span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '7px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#d1fae5',
            textAlign: 'center'
          }}>
            {currentDateString}
          </div>
        </div>

        {/* 4 Professional Categories Navigation */}
        <nav className="sidebar-nav" style={{ padding: '0.75rem 0' }}>
          
          {/* ========================================================
              KATEGORI 1: DASHBOARD
             ======================================================== */}
          <div style={{ padding: '8px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            DASHBOARD
          </div>

          <button 
            className={`nav-item-btn ${(currentView === 'dashboard' || currentView === 'admin-dashboard') ? 'active-green' : ''}`}
            onClick={() => navigateTo('admin-dashboard')}
            style={
              (currentView === 'dashboard' || currentView === 'admin-dashboard') ? {
                borderRadius: '0 8px 8px 0',
                margin: '2px 0'
              } : { borderRadius: '0 8px 8px 0', margin: '2px 0' }
            }
          >
            <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
                flexShrink: 0
              }}>
                <LayoutDashboard size={16} strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: (currentView === 'dashboard' || currentView === 'admin-dashboard') ? 800 : 600 }}>Dashboard Utama</span>
            </div>
          </button>

          {/* ========================================================
              KATEGORI 2: MASTER DATA
             ======================================================== */}
          <div style={{ padding: '14px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            MASTER DATA
          </div>

          <button 
            className={`nav-item-btn ${currentView === 'admin-pegawai' ? 'active-green' : ''}`}
            onClick={() => navigateTo('admin-pegawai')}
            style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
          >
            <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
                flexShrink: 0
              }}>
                <UserCheck size={16} strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: currentView === 'admin-pegawai' ? 800 : 600 }}>Data Kepegawaian</span>
            </div>
          </button>

          <button 
            className={`nav-item-btn ${currentView === 'admin-presensi' ? 'active-green' : ''}`}
            onClick={() => navigateTo('admin-presensi')}
            style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
          >
            <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
                flexShrink: 0
              }}>
                <Fingerprint size={16} strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: currentView === 'admin-presensi' ? 800 : 600 }}>Presensi & Biometrik</span>
            </div>
          </button>

          {/* ========================================================
              KATEGORI 3: LAYANAN & VERIFIKASI
             ======================================================== */}
          <div style={{ padding: '14px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            LAYANAN & VERIFIKASI
          </div>

          <button 
            className={`nav-item-btn ${currentView === 'admin-cuti' ? 'active-green' : ''}`}
            onClick={() => navigateTo('admin-cuti')}
            style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
          >
            <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
                flexShrink: 0
              }}>
                <CalendarCheck2 size={16} strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: currentView === 'admin-cuti' ? 800 : 600 }}>Verifikasi Cuti Pegawai</span>
            </div>
          </button>

          <button 
            className={`nav-item-btn ${currentView === 'admin-spt' ? 'active-green' : ''}`}
            onClick={() => navigateTo('admin-spt')}
            style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
          >
            <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
                flexShrink: 0
              }}>
                <FileBadge2 size={16} strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: currentView === 'admin-spt' ? 800 : 600 }}>Administrasi SPT</span>
            </div>
          </button>

          <button 
            className={`nav-item-btn ${(currentView === 'admin-disposisi' || currentView === 'admin-agenda') ? 'active-green' : ''}`}
            onClick={() => navigateTo('admin-disposisi')}
            style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
          >
            <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
                flexShrink: 0
              }}>
                <FolderKanban size={16} strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: (currentView === 'admin-disposisi' || currentView === 'admin-agenda') ? 800 : 600 }}>Disposisi & Agenda Dinas</span>
            </div>
          </button>

          {/* ========================================================
              KATEGORI 4: PENGATURAN
             ======================================================== */}
          <div style={{ padding: '14px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            PENGATURAN
          </div>

          <button 
            className={`nav-item-btn ${(currentView === 'admin-pengaturan' || currentView === 'pengaturan-akun') ? 'active-green' : ''}`}
            onClick={() => navigateTo('admin-pengaturan')}
            style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
          >
            <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
                flexShrink: 0
              }}>
                <Settings2 size={16} strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: (currentView === 'admin-pengaturan' || currentView === 'pengaturan-akun') ? 800 : 600 }}>Pengaturan Sistem</span>
            </div>
          </button>
        </nav>

        {/* Container Bawah: Modern Translucent Floating Hub (Versi Terbaru Glassmorphism) */}
        <div style={{
          marginTop: 'auto',
          padding: '12px 14px 16px',
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Card 1: PRIORITAS LAYANAN (Translucent Sunset Amber Glass) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.94) 0%, rgba(254, 215, 170, 0.85) 100%)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1.5px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '14px',
            padding: '12px 14px',
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b45309',
                  position: 'relative'
                }}>
                  <Bell size={13} strokeWidth={2.6} />
                  <span style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '-1px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#ef4444'
                  }} />
                </div>
                <span style={{
                  color: '#92400e',
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  PRIORITAS LAYANAN
                </span>
              </div>

              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.7)',
                color: '#b45309',
                padding: '2px 7px',
                borderRadius: '9999px',
                border: '1px solid rgba(245, 158, 11, 0.25)'
              }}>
                Hari Ini
              </span>
            </div>

            <p style={{
              color: '#78350f',
              fontSize: '0.78rem',
              lineHeight: 1.45,
              margin: '0 0 10px 0',
              fontWeight: 600
            }}>
              Periksa permohonan yang menunggu tanggapan sebelum jam 23.59.
            </p>

            <button
              type="button"
              onClick={() => navigateTo('admin-cuti')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                color: '#92400e',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.12)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(245, 158, 11, 0.25)';
                e.currentTarget.style.background = '#fffbeb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.12)';
                e.currentTarget.style.background = '#ffffff';
              }}
              title="Buka daftar permohonan yang menunggu verifikasi"
            >
              <span>Buka daftar</span>
              <ArrowUpRight size={14} strokeWidth={2.6} />
            </button>
          </div>

          {/* Tombol Keluar dari Sistem (Merah Tegas & Modern) */}
          <button
            type="button"
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #ef4444',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.35)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            title="Keluar dari Sistem Administrator"
          >
            <LogOut size={16} />
            <span>Keluar dari Sistem</span>
          </button>
        </div>
      </aside>
    );
  }

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
        <span className="profile-date" style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
          {user?.jabatan || 'Pegawai BRMP DIY'}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, border: '1px solid #bbf7d0', display: 'inline-block' }}>
          {currentDateString}
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

                {/* 3. LAYANAN PENGAJUAN SPT (Semua Orang Bisa Mengajukan KECUALI Super Admin) */}
                {!isSuperAdmin && (
                  <>
                    <div className="submenu-category">
                      {isAdminSekretariat ? 'Layanan SPT & Persuratan' : role === 'user' ? 'Layanan SPT Saya' : 'Layanan Pengajuan'}
                    </div>
                    <button 
                      className={`submenu-spt-btn ${currentView === 'spt-pengajuan' ? 'active' : ''}`}
                      onClick={() => navigateTo('spt-pengajuan')}
                    >
                      <div className="submenu-spt-left">
                        <PenSquare size={15} />
                        <span>
                          {role === 'ketimker' ? 'Buat SPT Tim' : 'Ajukan SPT Baru'}
                        </span>
                      </div>
                    </button>
                  </>
                )}

                {/* 4. TRACKING, DAFTAR & ARSIP SPT (Semua Role Memiliki Akses Tracking/Arsip) */}
                <div className="submenu-category">
                  {role === 'kobag_tu' || role === 'kopoks' ? 'Daftar & Arsip SPT' : 'Daftar & Tracking'}
                </div>
                <button 
                  className={`submenu-spt-btn ${currentView === 'spt-tracking' ? 'active' : ''}`}
                  onClick={() => navigateTo('spt-tracking')}
                >
                  <div className="submenu-spt-left">
                    <Clock size={15} />
                    <span>
                      {role === 'user' ? 'Tracking & Unduh SPT' : isAdminSekretariat ? 'Daftar & Penomoran SPT' : role === 'kobag_tu' ? 'Arsip Seluruh SPT' : role === 'kopoks' ? 'Rekapitulasi Penugasan SPT' : 'Daftar Seluruh SPT'}
                    </span>
                  </div>
                </button>

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
