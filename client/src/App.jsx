import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import DashboardView from './components/DashboardView';
import AbsensiBulanan from './components/AbsensiBulanan';
import AbsensiChart from './components/AbsensiChart';
import AdmsMonitor from './components/AdmsMonitor';
import PengajuanCuti from './components/PengajuanCuti';
import SptProgram from './components/SptProgram';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  CalendarOff, 
  FileText, 
  Menu 
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('brmp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer whenever viewport resizes to desktop or view changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('brmp_user', JSON.stringify(userData));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('brmp_user');
  };

  const handleSwitchUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem('brmp_user', JSON.stringify(newUser));
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Map currentView to the SPT target view in the brmpSPT program
  const getSptTargetView = () => {
    if (currentView === 'spt-pengajuan' || currentView === 'pengajuan-spt') return 'pengajuan';
    if (currentView === 'spt-tracking' || currentView === 'report-spt') return 'tracking';
    if (currentView === 'spt-approval-ketimker') return 'approval-ketimker';
    if (currentView === 'spt-approval-kobag') return 'approval-kobag';
    if (currentView === 'spt-approval' || currentView === 'approval-spt') return 'approval';
    if (currentView === 'spt-admin-sekretariat' || currentView === 'spt-admin' || currentView === 'admin-spt') return 'admin-sekretariat';
    if (currentView === 'spt-monitoring-kopoks') return 'monitoring-kopoks';
    if (currentView === 'spt-sop' || currentView === 'sop-spt') return 'sop';
    return 'dashboard';
  };

  const isSptView = currentView.includes('spt');

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Header Navbar with Quick Role Switcher */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onSwitchUser={handleSwitchUser} 
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="sidebar-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Tutup Menu"
          />
        )}

        {/* Sidebar Nav */}
        <Sidebar 
          currentView={currentView} 
          setCurrentView={(v) => {
            setCurrentView(v);
            setIsMobileMenuOpen(false);
          }} 
          user={user} 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Main View */}
        <main className={`main-content ${isSptView ? 'flush-view' : ''}`}>
          {currentView === 'dashboard' && (
            <DashboardView user={user} onNavigate={setCurrentView} />
          )}

          {currentView === 'absensi-bulanan' && (
            <AbsensiBulanan />
          )}

          {currentView === 'absensi-chart' && (
            <AbsensiChart />
          )}

          {currentView === 'adms-monitor' && (
            <AdmsMonitor user={user} />
          )}

          {currentView === 'pengajuan-cuti' && (
            <PengajuanCuti user={user} onSwitchUser={handleSwitchUser} />
          )}

          {/* Program Asli SPT (brmpSPT Digital Standar Kementan RI) */}
          {isSptView && (
            <SptProgram 
              user={user} 
              targetView={getSptTargetView()} 
            />
          )}
        </main>
      </div>

      {/* Modern Mobile Bottom Navigation Bar (Very User Friendly on Mobile) */}
      <nav className="mobile-bottom-nav no-print">
        <button 
          className={`bottom-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }}
        >
          <LayoutDashboard size={20} />
          <span>Beranda</span>
        </button>

        <button 
          className={`bottom-nav-item ${currentView.includes('absensi') ? 'active' : ''}`}
          onClick={() => { setCurrentView('absensi-bulanan'); setIsMobileMenuOpen(false); }}
        >
          <CalendarCheck2 size={20} />
          <span>Absensi</span>
        </button>

        <button 
          className={`bottom-nav-item ${currentView === 'pengajuan-cuti' ? 'active' : ''}`}
          onClick={() => { setCurrentView('pengajuan-cuti'); setIsMobileMenuOpen(false); }}
        >
          <CalendarOff size={20} />
          <span>Cuti</span>
        </button>

        <button 
          className={`bottom-nav-item ${currentView.includes('spt') ? 'active' : ''}`}
          onClick={() => { setCurrentView('spt-dashboard'); setIsMobileMenuOpen(false); }}
        >
          <FileText size={20} />
          <span>SPT</span>
        </button>

        <button 
          className={`bottom-nav-item ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
