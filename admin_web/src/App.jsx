import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import PengaturanAkun from './components/PengaturanAkun';
import AbsensiBulanan from './components/AbsensiBulanan';
import AbsensiChart from './components/AbsensiChart';
import AdmsMonitor from './components/AdmsMonitor';
import PengajuanCuti from './components/PengajuanCuti';
import SptProgram from './components/SptProgram';
import { getStoredAvatar } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('brmp_admin_user') || localStorage.getItem('brmp_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.nip === '198001012005011001' || parsed?.id === 'PEG-ADM' || parsed?.systemRole === 'admin') {
        parsed.systemRole = 'admin';
        parsed.approvalRole = 'admin';
        parsed.role = 'admin';
        parsed.roleLabel = 'Administrator (Akses Penuh Semua Modul)';
      }
      if (parsed?.nip && !parsed.fotoProfil) {
        const cached = getStoredAvatar(parsed.nip);
        if (cached) parsed.fotoProfil = cached;
      }
      return (parsed?.systemRole === 'admin' || parsed?.role === 'admin' || parsed?.nip === '198001012005011001') ? parsed : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('admin-dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLoginSuccess = (adminUser) => {
    const targetNip = adminUser?.nip;
    const cachedPhoto = getStoredAvatar(targetNip);
    const merged = {
      ...adminUser,
      systemRole: 'admin',
      role: 'admin',
      approvalRole: 'admin',
      roleLabel: 'Administrator Sistem Kepegawaian',
      fotoProfil: adminUser.fotoProfil || cachedPhoto || null
    };
    setUser(merged);
    localStorage.setItem('brmp_admin_user', JSON.stringify(merged));
    localStorage.setItem('brmp_user', JSON.stringify(merged));
    setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('brmp_admin_user');
    localStorage.removeItem('brmp_user');
  };

  const handleUpdateUser = (updated) => {
    if (!updated) return;
    const targetNip = updated?.nip;
    const cachedPhoto = getStoredAvatar(targetNip);
    const merged = {
      ...updated,
      fotoProfil: updated.fotoProfil || cachedPhoto || null
    };
    setUser(merged);
    localStorage.setItem('brmp_admin_user', JSON.stringify(merged));
    localStorage.setItem('brmp_user', JSON.stringify(merged));
  };

  if (!user) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Map SPT views for operational sub-navigation
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

  const isSptView = currentView.includes('spt') && currentView !== 'admin-spt';

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Header Navbar */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onSwitchUser={handleUpdateUser} 
        onNavigate={setCurrentView}
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

        {/* Main View */}
        <main className={`main-content ${isSptView ? 'flush-view' : ''}`}>
          {(currentView === 'dashboard' || currentView.startsWith('admin')) && (
            <AdminDashboard 
              user={user} 
              onNavigate={setCurrentView} 
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              initialTab={
                currentView === 'admin-pegawai' ? 'pegawai' :
                currentView === 'admin-presensi' ? 'presensi' :
                currentView === 'admin-cuti' ? 'cuti' :
                currentView === 'admin-spt' ? 'spt' :
                currentView === 'admin-disposisi' ? 'disposisi' :
                currentView === 'admin-agenda' ? 'agenda' :
                currentView === 'admin-pengaturan' ? 'pengaturan' : 'dashboard'
              } 
            />
          )}

          {currentView === 'pengaturan-akun' && (
            <PengaturanAkun user={user} onUpdateUser={handleUpdateUser} />
          )}

          {currentView === 'absensi-bulanan' && (
            <AbsensiBulanan user={user} />
          )}

          {currentView === 'absensi-chart' && (
            <AbsensiChart />
          )}

          {currentView === 'adms-monitor' && (
            <AdmsMonitor user={user} />
          )}

          {currentView === 'pengajuan-cuti' && (
            <PengajuanCuti user={user} onSwitchUser={handleUpdateUser} />
          )}

          {isSptView && (
            <SptProgram 
              user={user} 
              targetView={getSptTargetView()} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
