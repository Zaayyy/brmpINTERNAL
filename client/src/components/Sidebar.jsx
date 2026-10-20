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
  X,
  Users,
  Zap,
  Calendar,
  Palmtree,
  Files,
  Fingerprint,
  CalendarHeart,
  ScrollText,
  FileStack,
  CalendarDays,
  Sliders,
  Gauge
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, user, isOpen, onClose }) {
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

  const isAdmin = user?.systemRole === 'admin' || user?.role === 'admin' || user?.nip === '198001012005011001' || currentView.startsWith('admin');

  // If Admin mode, render the exact Administrator Sidebar from user's screenshot
  if (isAdmin) {
    return (
      <aside className="app-sidebar no-print" style={{ width: '260px' }}>
        {/* Profile Card Admin (Matching User Screenshot with Dynamic Date & Photo Support) */}
        <div 
          className="sidebar-profile" 
          onClick={() => navigateTo('pengaturan-akun')}
          title="Klik untuk membuka Pengaturan Akun & Profil Administrator"
          style={{ padding: '1.25rem 1rem', textAlign: 'center', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
        >
          {user?.fotoProfil ? (
            <img 
              src={user.fotoProfil} 
              alt="Avatar Administrator" 
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                objectFit: 'cover',
                margin: '0 auto 8px',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)',
                border: '2px solid #34d399',
                display: 'block'
              }}
            />
          ) : (
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              margin: '0 auto 8px',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)',
              border: '2px solid #a7f3d0'
            }}>
              A
            </div>
          )}
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '6px', letterSpacing: '-0.01em' }}>
            ADMINISTRATOR<br />KEPEGAWAIAN
          </h3>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.72rem', 
              color: '#065f46', 
              background: '#dcfce7', 
              padding: '4px 12px', 
              borderRadius: '9999px', 
              fontWeight: 700, 
              border: '1px solid #bbf7d0',
              boxShadow: '0 1px 3px rgba(4, 120, 87, 0.08)' 
            }}
            title="Tanggal otomatis real-time sinkron dengan pergantian hari kalender"
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b981',
              display: 'inline-block'
            }} />
            <span>{currentDateString}</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav" style={{ padding: '0.75rem 0' }}>
          {/* Section 1: ADMINISTRATOR */}
          <div style={{ padding: '6px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ADMINISTRATOR
          </div>

          <button 
            className="nav-item-btn"
            onClick={() => setCurrentView('admin-dashboard')}
            style={
              (currentView === 'dashboard' || currentView === 'admin-dashboard') ? {
                background: '#ecfdf5',
                color: '#065f46',
                borderLeft: '4px solid #059669',
                borderRadius: '0 8px 8px 0',
                fontWeight: 800
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
                boxShadow: '0 3px 8px rgba(4, 120, 87, 0.35)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '42%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
                <Gauge size={16} strokeWidth={2.4} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
              </div>
              <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Dashboard Admin</span>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#dcfce7', color: '#047857', padding: '1px 6px', borderRadius: '6px', marginLeft: 'auto' }}>
                Pusat
              </span>
            </div>
          </button>

          {/* Section 2: MASTER DATA */}
          <div style={{ padding: '14px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            MASTER DATA
          </div>

          <button 
            className="nav-item-btn"
            onClick={() => setCurrentView('admin-pegawai')}
            style={
              currentView === 'admin-pegawai' ? {
                background: '#ecfdf5',
                color: '#065f46',
                borderLeft: '4px solid #059669',
                borderRadius: '0 8px 8px 0',
                fontWeight: 800
              } : { borderRadius: '0 8px 8px 0', margin: '2px 0' }
            }
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
                boxShadow: '0 3px 8px rgba(37, 99, 235, 0.35)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '42%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
                <Users size={16} strokeWidth={2.4} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
              </div>
              <span style={{ fontSize: '0.86rem' }}>Data Pegawai (CRUD)</span>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '6px', marginLeft: 'auto' }}>
                ASN
              </span>
            </div>
          </button>

          <button 
            className="nav-item-btn"
            onClick={() => setCurrentView('admin-presensi')}
            style={
              currentView === 'admin-presensi' ? {
                background: '#ecfdf5',
                color: '#065f46',
                borderLeft: '4px solid #059669',
                borderRadius: '0 8px 8px 0',
                fontWeight: 800
              } : { borderRadius: '0 8px 8px 0', margin: '2px 0' }
            }
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
                boxShadow: '0 3px 8px rgba(139, 92, 246, 0.35)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '42%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
                <Fingerprint size={17} strokeWidth={2.4} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
              </div>
              <span style={{ fontSize: '0.86rem' }}>Data Presensi All</span>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: '6px', marginLeft: 'auto' }}>
                Biometrik
              </span>
            </div>
          </button>

          <button 
            className="nav-item-btn"
            onClick={() => setCurrentView('admin-cuti')}
            style={
              currentView === 'admin-cuti' ? {
                background: '#ecfdf5',
                color: '#065f46',
                borderLeft: '4px solid #059669',
                borderRadius: '0 8px 8px 0',
                fontWeight: 800
              } : { borderRadius: '0 8px 8px 0', margin: '2px 0' }
            }
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
                boxShadow: '0 3px 8px rgba(20, 184, 166, 0.35)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '42%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
                <CalendarHeart size={16} strokeWidth={2.4} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
              </div>
              <span style={{ fontSize: '0.86rem' }}>Data Cuti Pegawai</span>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#ccfbf1', color: '#0f766e', padding: '1px 6px', borderRadius: '6px', marginLeft: 'auto' }}>
                Izin/Cuti
              </span>
            </div>
          </button>

          <button 
            className="nav-item-btn"
            onClick={() => setCurrentView('admin-spt')}
            style={
              currentView === 'admin-spt' ? {
                background: '#ecfdf5',
                color: '#065f46',
                borderLeft: '4px solid #059669',
                borderRadius: '0 8px 8px 0',
                fontWeight: 800
              } : { borderRadius: '0 8px 8px 0', margin: '2px 0' }
            }
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
                boxShadow: '0 3px 8px rgba(249, 115, 22, 0.35)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '42%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
                <ScrollText size={16} strokeWidth={2.4} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
              </div>
              <span style={{ fontSize: '0.86rem' }}>Data SPT & Penugasan</span>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#ffedd5', color: '#ea580c', padding: '1px 6px', borderRadius: '6px', marginLeft: 'auto' }}>
                Dinas
              </span>
            </div>
          </button>

          <button 
            className="nav-item-btn"
            onClick={() => setCurrentView('admin-disposisi')}
            style={
              currentView === 'admin-disposisi' ? {
                background: '#ecfdf5',
                color: '#065f46',
                borderLeft: '4px solid #059669',
                borderRadius: '0 8px 8px 0',
                fontWeight: 800
              } : { borderRadius: '0 8px 8px 0', margin: '2px 0' }
            }
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
                boxShadow: '0 3px 8px rgba(6, 182, 212, 0.35)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '42%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
                <FileStack size={16} strokeWidth={2.4} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
              </div>
              <span style={{ fontSize: '0.86rem' }}>Manajemen Disposisi</span>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#e0f2fe', color: '#0284c7', padding: '1px 6px', borderRadius: '6px', marginLeft: 'auto' }}>
                Surat
              </span>
            </div>
          </button>

          <button 
            className="nav-item-btn"
            onClick={() => setCurrentView('admin-agenda')}
            style={
              currentView === 'admin-agenda' ? {
                background: '#ecfdf5',
                color: '#065f46',
                borderLeft: '4px solid #059669',
                borderRadius: '0 8px 8px 0',
                fontWeight: 800
              } : { borderRadius: '0 8px 8px 0', margin: '2px 0' }
            }
          >
            <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(239, 68, 68, 0.35)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '42%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
                <CalendarDays size={16} strokeWidth={2.4} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
              </div>
              <span style={{ fontSize: '0.86rem' }}>Agenda & Libur Kantor</span>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '6px', marginLeft: 'auto' }}>
                Agenda
              </span>
            </div>
          </button>

          {/* Section 3: SISTEM */}
          <div style={{ padding: '14px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            SISTEM
          </div>

          <button 
            className="nav-item-btn"
            onClick={() => setCurrentView('admin-pengaturan')}
            style={
              currentView === 'admin-pengaturan' ? {
                background: '#ecfdf5',
                color: '#065f46',
                borderLeft: '4px solid #059669',
                borderRadius: '0 8px 8px 0',
                fontWeight: 800
              } : { borderRadius: '0 8px 8px 0', margin: '2px 0' }
            }
          >
            <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(100, 116, 139, 0.35)',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '42%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }} />
                <Sliders size={16} strokeWidth={2.4} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
              </div>
              <span style={{ fontSize: '0.86rem' }}>Pengaturan Instansi</span>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '6px', marginLeft: 'auto' }}>
                Sistem
              </span>
            </div>
          </button>

          {/* Quick Switch to Employee View */}
          <div style={{ marginTop: 'auto', padding: '1rem 0.75rem 0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => setCurrentView('absensi-bulanan')}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              👤 Beralih ke Portal Staf Pegawai
            </button>
          </div>
        </nav>
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
        {/* Shortcut to Admin Panel */}
        <button 
          className="nav-item-btn"
          onClick={() => setCurrentView('admin-dashboard')}
          style={{
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
            fontWeight: 700
          }}
        >
          <div className="nav-item-left">
            <Zap size={16} color="#059669" />
            <span>⚡ Masuk Panel Admin</span>
          </div>
        </button>

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
                  <span>Dashboard SPT</span>
                </div>
              </button>

              {/* 2. LAYANAN PENGAJUAN & TRACKING */}
              <div className="submenu-category">Layanan SPT</div>
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
              </button>

              {/* 3. VERIFIKASI & APPROVAL (APPROVAL SPT) */}
              <div className="submenu-category">Approval SPT</div>
              <button 
                className={`submenu-spt-btn ${currentView === 'spt-approval-ketimker' ? 'active' : ''}`}
                onClick={() => navigateTo('spt-approval-ketimker')}
              >
                <div className="submenu-spt-left">
                  <CheckCircle2 size={15} />
                  <span>Approval Unit Kerja (Ketimker)</span>
                </div>
                <span className="submenu-badge" style={{ background: role === 'ketimker' ? '#16a34a' : '#2563eb' }}>
                  {role === 'ketimker' ? 'Unit Anda' : 'Tahap 1'}
                </span>
              </button>
              <button 
                className={`submenu-spt-btn ${currentView === 'spt-approval-kobag' ? 'active' : ''}`}
                onClick={() => navigateTo('spt-approval-kobag')}
              >
                <div className="submenu-spt-left">
                  <ShieldCheck size={15} />
                  <span>Approval Utama (Kobag TU)</span>
                </div>
                <span className="submenu-badge" style={{ background: role === 'kobag_tu' ? '#16a34a' : '#7c3aed' }}>
                  {role === 'kobag_tu' ? 'Unit Anda' : 'Tahap 2'}
                </span>
              </button>

              {/* 4. PENGAWASAN & MONITORING */}
              <div className="submenu-category">Monitoring & Evaluasi</div>
              <button 
                className={`submenu-spt-btn ${currentView === 'spt-monitoring-kopoks' ? 'active' : ''}`}
                onClick={() => navigateTo('spt-monitoring-kopoks')}
              >
                <div className="submenu-spt-left">
                  <BookOpen size={15} />
                  <span>Monitoring Penugasan (Kopoks)</span>
                </div>
              </button>

              {/* 5. ADMINISTRASI TATA PERSURATAN */}
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

              {/* 6. REGULASI & PEDOMAN */}
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
