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
import PengajuanSpt from './components/PengajuanSpt';
import ReportSpt from './components/ReportSpt';
import SptAdmin from './components/SptAdmin';
import SptApproval from './components/SptApproval';
import SptSop from './components/SptSop';
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  }, [currentView]);

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
        <main className="main-content">
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

          {/* Modul SPT Digital (Native React Components - Tanpa Iframe) */}
          {(currentView === 'spt-tracking' || currentView === 'report-spt' || currentView === 'spt-dashboard' || currentView === 'spt') && (
            <ReportSpt 
              user={user} 
              onNavigateToPengajuan={() => setCurrentView('spt-pengajuan')} 
            />
          )}

          {(currentView === 'spt-pengajuan' || currentView === 'pengajuan-spt') && (
            <PengajuanSpt 
              user={user} 
              onNavigateToReport={() => setCurrentView('spt-tracking')} 
            />
          )}

          {(currentView === 'spt-admin-sekretariat' || currentView === 'spt-admin') && (
            <SptAdmin user={user} />
          )}

          {currentView === 'spt-approval-ketimker' && (
            <SptApproval 
              user={user} 
              onNavigateToReport={() => setCurrentView('spt-tracking')} 
              initialTab="ketimker"
            />
          )}

          {currentView === 'spt-approval-kobag' && (
            <SptApproval 
              user={user} 
              onNavigateToReport={() => setCurrentView('spt-tracking')} 
              initialTab="kobag"
            />
          )}

          {(currentView === 'spt-approval' || currentView === 'approval-spt' || currentView === 'spt-monitoring-kopoks') && (
            <SptApproval 
              user={user} 
              onNavigateToReport={() => setCurrentView('spt-tracking')} 
            />
          )}

          {(currentView === 'spt-sop' || currentView === 'sop-spt') && (
            <SptSop />
          )}
        </main>
      </div>
    </div>
  );
}
