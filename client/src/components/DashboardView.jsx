import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Palmtree, 
  FileText, 
  History, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  CalendarDays,
  Award
} from 'lucide-react';

export default function DashboardView({ user, onNavigate }) {
  const [currentMonth, setCurrentMonth] = useState('Juni 2025');
  const [calendarViewMode, setCalendarViewMode] = useState('bulan'); // 'bulan', 'minggu', 'agenda'
  const [liveTime, setLiveTime] = useState('');
  const [liveDate, setLiveDate] = useState('');

  // Live real-time clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
      setLiveDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const daysHeader = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const calendarCells = [
    { day: 26, isCurrentMonth: false, events: [] },
    { day: 27, isCurrentMonth: false, events: [] },
    { day: 28, isCurrentMonth: false, events: [] },
    { day: 29, isCurrentMonth: false, events: [] },
    { day: 30, isCurrentMonth: false, events: [] },
    { day: 31, isCurrentMonth: false, events: [] },
    { day: 1, isCurrentMonth: true, events: [{ title: 'Hari Lahir Pancasila', color: '#ef4444' }] },
    { day: 2, isCurrentMonth: true, events: [] },
    { day: 3, isCurrentMonth: true, events: [] },
    { day: 4, isCurrentMonth: true, events: [] },
    { day: 5, isCurrentMonth: true, events: [{ title: 'Rakor Teknis Balai', color: '#16a34a' }] },
    { day: 6, isCurrentMonth: true, events: [] },
    { day: 7, isCurrentMonth: true, events: [] },
    { day: 8, isCurrentMonth: true, events: [] },
    { day: 9, isCurrentMonth: true, events: [] },
    { day: 10, isCurrentMonth: true, events: [] },
    { day: 11, isCurrentMonth: true, events: [] },
    { day: 12, isCurrentMonth: true, events: [{ title: 'Evaluasi Kinerja Triwulan II', color: '#10b981' }] },
    { day: 13, isCurrentMonth: true, events: [] },
    { day: 14, isCurrentMonth: true, events: [] },
    { day: 15, isCurrentMonth: true, events: [] },
    { day: 16, isCurrentMonth: true, events: [{ title: 'Kunjungan Lapangan', color: '#8b5cf6' }] },
    { day: 17, isCurrentMonth: true, events: [] },
    { day: 18, isCurrentMonth: true, events: [] },
    { day: 19, isCurrentMonth: true, events: [{ title: 'Bimtek Standardisasi', color: '#0284c7' }] },
    { day: 20, isCurrentMonth: true, events: [] },
    { day: 21, isCurrentMonth: true, events: [] },
    { day: 22, isCurrentMonth: true, events: [] },
    { day: 23, isCurrentMonth: true, events: [] },
    { day: 24, isCurrentMonth: true, events: [] },
    { day: 25, isCurrentMonth: true, events: [] },
    { day: 26, isCurrentMonth: true, events: [] },
    { day: 27, isCurrentMonth: true, events: [{ title: 'Penutupan Triwulan', color: '#f59e0b' }] },
    { day: 28, isCurrentMonth: true, events: [] },
    { day: 29, isCurrentMonth: true, events: [] }
  ];

  return (
    <div>
      {/* Breadcrumb banner */}
      <div className="breadcrumb-banner">
        <div>
          <h1 className="breadcrumb-title">
            <Activity size={24} style={{ color: '#16a34a' }} />
            <span>Dashboard Pegawai</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>Beranda Utama</span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(22, 163, 74, 0.1)',
          border: '1px solid rgba(22, 163, 74, 0.3)',
          padding: '6px 14px',
          borderRadius: '9999px',
          color: '#14532d',
          fontSize: '0.8rem',
          fontWeight: 700
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px rgba(22, 163, 74, 0.6)', display: 'inline-block' }}></span>
          <span>Sistem Presensi & E-SPT Aktif</span>
        </div>
      </div>

      {/* Welcome Hero Banner */}
      <div className="welcome-hero" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: '9999px', marginBottom: '8px', fontWeight: 800 }}>
            <Sparkles size={13} />
            <span>Selamat Datang di Portal Internal BRMP DIY</span>
          </div>
          <h2 className="welcome-title">{user?.nama || 'AGNITA VERDIANI PUTRI, A.Md.'}</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
            <div className="welcome-sub">
              <Clock size={15} />
              <span>{liveDate || 'Kamis, 12 Juni 2025'}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span style={{ fontWeight: 800, color: '#fef08a' }}>{liveTime || '07:30:00 WIB'}</span>
            </div>

            <div className="welcome-sub" style={{ background: 'rgba(255, 255, 255, 0.12)' }}>
              <Award size={15} />
              <span>Jam Kerja: 07:30 - 16:00 WIB</span>
            </div>
          </div>
        </div>

        {user?.fotoProfil ? (
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={user.fotoProfil} 
              alt={user?.nama} 
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
              }}
            />
          </div>
        ) : (
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '1.6rem',
            fontWeight: 800
          }}>
            {(user?.nama || 'A').charAt(0)}
          </div>
        )}
      </div>

      {/* Stats Row (Jam Absen Masuk, Jam Absen Pulang, Sisa Cuti) */}
      <div className="stats-grid">
        {/* Absen Masuk */}
        <div className="stat-box">
          <div className="stat-info">
            <span className="stat-label">Absen Masuk Hari Ini</span>
            <span className="stat-value" style={{ color: '#16a34a' }}>07:23:54</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="stat-badge green">
                <CheckCircle2 size={13} />
                <span>Tepat Waktu</span>
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>(-6 Menit)</span>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', padding: '14px', borderRadius: '16px', color: '#15803d', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)' }}>
            <Clock size={28} />
          </div>
        </div>

        {/* Absen Pulang */}
        <div className="stat-box">
          <div className="stat-info">
            <span className="stat-label">Absen Pulang</span>
            <span className="stat-value" style={{ color: 'var(--primary-700)' }}>16:08:55</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="stat-badge green">
                <CheckCircle2 size={13} />
                <span>Selesai Kerja</span>
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>(8 Jam 45 Menit)</span>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%)', padding: '14px', borderRadius: '16px', color: 'var(--primary-800)', boxShadow: '0 4px 12px rgba(22, 101, 52, 0.15)' }}>
            <TrendingUp size={28} />
          </div>
        </div>

        {/* Sisa Cuti */}
        <div className="stat-box">
          <div className="stat-info">
            <span className="stat-label">Sisa Kuota Cuti</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="stat-value" style={{ color: '#ea580c' }}>{user?.sisaCuti ?? 12}</span>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>Hari Tersedia</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span className="stat-badge amber">
                <Sparkles size={13} />
                <span>100% Saldo Aktif</span>
              </span>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', padding: '14px', borderRadius: '16px', color: '#c2410c', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)' }}>
            <Palmtree size={28} />
          </div>
        </div>
      </div>

      {/* Quick Action Circles */}
      <div className="quick-actions-bar">
        {/* 1. Cuti */}
        <button 
          className="action-circle-btn"
          onClick={() => onNavigate('pengajuan-cuti')}
          title="Klik untuk Form Pengajuan Cuti"
        >
          <div className="circle-icon-wrap cuti">
            <Palmtree size={26} />
          </div>
          <span className="action-label">Cuti</span>
        </button>

        {/* 2. SPT (Surat Perintah Tugas) */}
        <button 
          className="action-circle-btn"
          onClick={() => onNavigate('spt-pengajuan')}
          title="Klik untuk Form Pengajuan SPT Digital"
        >
          <div className="circle-icon-wrap spt">
            <FileText size={26} />
          </div>
          <span className="action-label">SPT</span>
        </button>

        {/* 3. Histori */}
        <button 
          className="action-circle-btn"
          onClick={() => onNavigate('absensi-bulanan')}
          title="Klik untuk Rekap Presensi & Histori"
        >
          <div className="circle-icon-wrap histori">
            <History size={26} />
          </div>
          <span className="action-label">Histori</span>
        </button>

        {/* 4. Profile / Pengaturan Akun */}
        <button 
          className="action-circle-btn"
          onClick={() => onNavigate('pengaturan-akun')}
          title="Klik untuk Pengaturan Akun & Profil Pegawai"
        >
          <div className="circle-icon-wrap profile">
            <User size={26} />
          </div>
          <span className="action-label">Profil</span>
        </button>
      </div>

      {/* Agenda & Kalender Kegiatan Section */}
      <div className="agenda-section">
        <div className="agenda-header">
          <div className="agenda-title">
            <CalendarDays size={24} style={{ color: 'var(--primary-600)' }} />
            <span>Agenda & Kalender Kedinasan</span>
          </div>

          <div className="calendar-actions-wrapper">
            <div className="calendar-controls">
              <button 
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onClick={() => {}}
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onClick={() => {}}
                aria-label="Bulan berikutnya"
              >
                <ChevronRight size={16} />
              </button>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, marginLeft: '6px', color: '#0f172a' }}>
                {currentMonth}
              </span>
            </div>

            {/* View Switcher: Bulan, Minggu, Agenda */}
            <div className="calendar-view-switcher">
              {['Bulan', 'Minggu', 'Agenda'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCalendarViewMode(mode.toLowerCase())}
                  className={`calendar-mode-btn ${calendarViewMode === mode.toLowerCase() ? 'active' : ''}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {calendarViewMode === 'agenda' ? (
          <div className="agenda-list-view">
            {calendarCells
              .filter(cell => cell.events.length > 0)
              .map((cell, idx) => (
                <div key={idx} className="agenda-list-item">
                  <div className="agenda-date-badge">
                    <span className="agenda-date-num">{cell.day}</span>
                    <span className="agenda-date-month">Jun</span>
                  </div>
                  <div className="agenda-events-col">
                    {cell.events.map((ev, eIdx) => (
                      <div key={eIdx} className="agenda-item-card" style={{ borderLeftColor: ev.color }}>
                        <span className="agenda-item-title">{ev.title}</span>
                        <span className="agenda-item-time">08:00 - 15:30 WIB • Balai Penerapan Standar Instrumen Pertanian DIY</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="calendar-grid">
            {daysHeader.map((d) => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}

            {calendarCells.map((cell, idx) => (
              <div 
                key={idx} 
                className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''}`}
              >
                <span className="calendar-cell-date">{cell.day}</span>
                {cell.events.map((ev, eIdx) => (
                  <div 
                    key={eIdx} 
                    className="calendar-event-pill"
                    style={{ backgroundColor: ev.color }}
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
