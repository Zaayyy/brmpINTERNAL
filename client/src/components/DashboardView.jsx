import React, { useState } from 'react';
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
  Info
} from 'lucide-react';

export default function DashboardView({ user, onNavigate }) {
  const [currentMonth, setCurrentMonth] = useState('Juni 2025');
  const [calendarViewMode, setCalendarViewMode] = useState('bulan'); // 'bulan', 'minggu', 'agenda'

  // Calendar days generation for Juni 2025 (matching screenshots in PDF)
  // June 2025 starts on Sunday (1) and has 30 days.
  // In the PDF screenshot, the columns are Sen, Sel, Rab, Kam, Jum, Sab, Min
  const daysHeader = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // June 2025 calendar days matching Monday-start:
  // May 26..31 are previous month, June 1 is Sunday.
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
    { day: 5, isCurrentMonth: true, events: [{ title: 'Rakor Teknis Balai', color: '#2563eb' }] },
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
            <span>Dashboard</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span style={{ color: '#2563eb', fontWeight: 600 }}>Home</span>
          </div>
        </div>
      </div>

      {/* Welcome Hero Banner */}
      <div className="welcome-hero" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9, marginBottom: '4px' }}>
            Selamat Datang
          </div>
          <h2 className="welcome-title">{user?.nama || 'AGNITA VERDIANI PUTRI, A.Md.'}</h2>
          <div className="welcome-sub">
            <Clock size={16} />
            <span>Kamis, 12 Juni 2025</span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span>Jam Kerja : 07:30:00 - 16:00:00</span>
          </div>
        </div>

        {user?.fotoProfil && (
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={user.fotoProfil} 
              alt={user?.nama} 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.45)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
            />
          </div>
        )}
      </div>

      {/* Stats Row (Jam Absen Masuk, Jam Absen Pulang, Sisa Cuti) */}
      <div className="stats-grid">
        {/* Absen Masuk */}
        <div className="stat-box">
          <div className="stat-info">
            <span className="stat-label">Absen Masuk</span>
            <span className="stat-value" style={{ color: '#16a34a' }}>07:23:54</span>
            <span className="stat-badge green">Tepat Waktu</span>
          </div>
          <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '12px', color: '#15803d' }}>
            <Clock size={28} />
          </div>
        </div>

        {/* Absen Pulang */}
        <div className="stat-box">
          <div className="stat-info">
            <span className="stat-label">Absen Pulang</span>
            <span className="stat-value" style={{ color: '#2563eb' }}>16:08:55</span>
            <span className="stat-badge blue">Selesai Kerja</span>
          </div>
          <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '12px', color: '#1e40af' }}>
            <Clock size={28} />
          </div>
        </div>

        {/* Sisa Cuti */}
        <div className="stat-box">
          <div className="stat-info">
            <span className="stat-label">Sisa Cuti Pegawai</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="stat-value" style={{ color: '#ea580c' }}>{user?.sisaCuti ?? 12}</span>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Hari Tersedia</span>
            </div>
            <span className="stat-badge amber">100% Saldo Aktif</span>
          </div>
          <div style={{ background: '#ffedd5', padding: '12px', borderRadius: '12px', color: '#c2410c' }}>
            <Palmtree size={28} />
          </div>
        </div>
      </div>

      {/* Quick Action Circles (Bagian B - Point 3 & 4) */}
      <div className="quick-actions-bar">
        {/* 1. Cuti */}
        <button 
          className="action-circle-btn"
          onClick={() => onNavigate('pengajuan-cuti')}
          title="Klik untuk Pengajuan Cuti (Point 7 & 8)"
        >
          <div className="circle-icon-wrap cuti">
            <Palmtree size={24} />
          </div>
          <span className="action-label">Cuti</span>
        </button>

        {/* 2. SPT (Surat Perintah Tugas - Poin 9) */}
        <button 
          className="action-circle-btn"
          onClick={() => onNavigate('pengajuan-spt')}
          title="Klik untuk Pengajuan SPT (Surat Perintah Tugas)"
        >
          <div className="circle-icon-wrap spt">
            <FileText size={24} />
          </div>
          <span className="action-label">SPT</span>
        </button>

        {/* 3. Histori */}
        <button 
          className="action-circle-btn"
          onClick={() => onNavigate('pengajuan-cuti')}
          title="Klik untuk melihat Tabel Histori Cuti"
        >
          <div className="circle-icon-wrap histori">
            <History size={24} />
          </div>
          <span className="action-label">Histori</span>
        </button>

        {/* 4. Profile */}
        <button 
          className="action-circle-btn"
          onClick={() => alert(`Profil Pegawai:\nNama: ${user?.nama}\nNIP: ${user?.nip}\nJabatan: ${user?.jabatan || 'Pengelola Teknis'}\nDivisi: ${user?.divisi || 'BRMP DIY'}`)}
          title="Profil Pegawai"
        >
          <div className="circle-icon-wrap profile">
            <User size={24} />
          </div>
          <span className="action-label">Profile</span>
        </button>
      </div>

      {/* Agenda Section (Point 3 - no. 4) */}
      <div className="agenda-section">
        <div className="agenda-header">
          <div className="agenda-title">
            <Calendar size={22} className="text-blue-600" />
            <span>AGENDA</span>
          </div>

          <div className="calendar-actions-wrapper">
            <div className="calendar-controls">
              <button 
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
                onClick={() => {}}
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
                onClick={() => {}}
                aria-label="Bulan berikutnya"
              >
                <ChevronRight size={16} />
              </button>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, marginLeft: '4px', color: '#1e293b' }}>
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
                        <span className="agenda-item-time">08:00 - 15:30 WIB • Kantor Balai</span>
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
