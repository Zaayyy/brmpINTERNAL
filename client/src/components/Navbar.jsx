import React, { useState } from 'react';
import { Search, Bell, LogOut, ShieldCheck, UserCheck, ChevronDown, Menu, X, Settings } from 'lucide-react';

export default function Navbar({ user, onLogout, onSwitchUser, onNavigate, isMobileMenuOpen, onToggleMobileMenu }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const demoAccounts = [
    {
      id: "PEG-ADM",
      nip: "198001012005011001",
      nama: "ADMINISTRATOR KEPEGAWAIAN",
      role: "admin",
      sptRole: "admin",
      systemRole: "admin",
      approvalRole: "admin",
      roleLabel: "Administrator Sistem (Superadmin)",
      jabatan: "Pranata Komputer Ahli Muda / Admin Kepegawaian",
      divisi: "Sub Bagian Tata Usaha & Kepegawaian",
      sisaCuti: 12
    },
    {
      id: "PEG-017",
      nip: "199111042023212041",
      nama: "Novita Widiyanti, A.Md",
      role: "admin_sekretariat",
      sptRole: "admin_sekretariat",
      systemRole: "pegawai",
      approvalRole: "pemohon",
      roleLabel: "Admin Sekretariat (Tata Persuratan & Penomoran)",
      jabatan: "Arsiparis Terampil / Sekretariat Balai",
      divisi: "Tim Kerja Tata Usaha dan Rumah Tangga",
      sisaCuti: 12
    },
    {
      id: "PEG-002",
      nip: "198101312009121004",
      nama: "Agung Ariyanto, SEI., M.Ec., Dev.",
      role: "kobag_tu",
      sptRole: "kobag_tu",
      systemRole: "pegawai",
      approvalRole: "verifikator_2",
      roleLabel: "Kobag TU (Approval Utama & Verifikator 2)",
      jabatan: "Ketua Bagian Tata Usaha",
      divisi: "Bagian Tata Usaha",
      sisaCuti: 14
    },
    {
      id: "PEG-003",
      nip: "198604092011012024",
      nama: "Dwi Dinia Rahayu, S.Kom, M.T.I",
      role: "ketimker",
      sptRole: "ketimker",
      systemRole: "pegawai",
      approvalRole: "verifikator_1",
      roleLabel: "Ketimker SDM (Approval Unit 1)",
      jabatan: "Analis SDM Aparatur Ahli Pertama",
      divisi: "Tim Kerja Pengelolaan Sumber Daya Manusia",
      sisaCuti: 12
    },
    {
      id: "PEG-015",
      nip: "197106141992032001",
      nama: "Yuni Pratiwi, S.ST., Ars",
      role: "ketimker",
      sptRole: "ketimker",
      systemRole: "pegawai",
      approvalRole: "verifikator_1",
      roleLabel: "Ketimker TU & Rumah Tangga (Approval Unit)",
      jabatan: "Arsiparis Penyelia",
      divisi: "Tim Kerja Tata Usaha dan Rumah Tangga",
      sisaCuti: 11
    },
    {
      id: "PEG-053",
      nip: "197402062000032001",
      nama: "Dr. Fibrianty, M.Si",
      role: "kopoks",
      sptRole: "kopoks",
      systemRole: "pegawai",
      approvalRole: "verifikator_1",
      roleLabel: "Kopoks (Koordinator Poksi & Monitoring Penugasan)",
      jabatan: "Peneliti Ahli Madya / Kopoks Modernisasi",
      divisi: "Kelompok Jabatan Fungsional",
      sisaCuti: 12
    },
    {
      id: "PEG-004",
      nip: "198906012015032004",
      nama: "Devi Eka Nuvitasari, S.H.",
      role: "user",
      sptRole: "user",
      systemRole: "pegawai",
      approvalRole: "pemohon",
      roleLabel: "Pegawai / Pemohon (Devi Eka)",
      jabatan: "Penelaah Teknis Kebijakan",
      divisi: "Tim Kerja Pengelolaan Sumber Daya Manusia",
      sisaCuti: 10
    },
    {
      id: "PEG-001",
      nip: "199808062014032001",
      nama: "AGNITA VERDIANI PUTRI, A.Md.",
      role: "user",
      sptRole: "user",
      systemRole: "pegawai",
      approvalRole: "pemohon",
      roleLabel: "Pegawai / Pemohon (Agnita)",
      jabatan: "Pengelola Standardisasi Teknis",
      divisi: "Balai Penerapan Standar Instrumen Pertanian DIY",
      sisaCuti: 12
    }
  ];

  const handleSelectAccount = (acc) => {
    if (onSwitchUser) {
      onSwitchUser(acc);
    }
    setShowRoleMenu(false);
  };

  return (
    <header className="top-navbar no-print">
      <div className="brand-wrapper">
        {/* Mobile Hamburger Menu Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          title={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="brand-logo-badge">
          <ShieldCheck size={20} className="text-blue-600" />
          <span>BRMP <span className="brand-tag">DIY</span></span>
        </div>
        <span className="brand-title-text">
          KITA BRMP DIY
        </span>
      </div>

      <div className="navbar-search">
        <Search size={16} />
        <input 
          type="text" 
          placeholder="Cari fitur, agenda, dokumen SPT..." 
          aria-label="Cari"
        />
      </div>

      <div className="navbar-right">
        {/* Switch Role Quick Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="navbar-role-btn"
            title="Ganti peran kedinasan (Multi-Role)"
          >
            <UserCheck size={14} />
            <span className="role-btn-text">Ganti Peran</span>
            <ChevronDown size={13} />
          </button>

          {showRoleMenu && (
            <div
              className="navbar-role-dropdown"
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: 'min(320px, calc(100vw - 24px))',
                background: '#ffffff',
                color: '#1e293b',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                border: '1px solid #cbd5e1',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '10px 14px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                PILIH PERAN KEDINASAN (MULTI-ROLE)
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {demoAccounts.map((acc, idx) => {
                  const isActive = user?.nip === acc.nip;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAccount(acc)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isActive ? '#f0fdf4' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: isActive ? '#15803d' : '#0f172a' }}>
                          {acc.nama}
                        </span>
                        {isActive && <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 700 }}>Aktif</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                        {acc.roleLabel}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        NIP: {acc.nip}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button 
          title="Notifikasi" 
          className="navbar-bell-btn"
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}
        >
          <Bell size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            className="navbar-user-info" 
            onClick={() => onNavigate && onNavigate('pengaturan-akun')}
            title="Klik untuk membuka Pengaturan Akun & Profil"
            style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '2px 6px', borderRadius: '6px' }}
          >
            {user?.fotoProfil ? (
              <img 
                src={user.fotoProfil} 
                alt="Avatar" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)' }}
              />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.4)' }}>
                {(user?.nama || 'P').charAt(0)}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.nama || 'Agnita V. Putri'}
              </span>
              <span className="navbar-user-nip" style={{ fontSize: '0.68rem', opacity: 0.85 }}>
                NIP: {user?.nip || '199808062014032001'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('pengaturan-akun')}
            title="Pengaturan Akun & Profil"
            className="navbar-settings-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <Settings size={15} />
          </button>

          <button
            onClick={onLogout}
            title="Keluar"
            className="navbar-logout-btn"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fee2e2',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={14} />
            <span className="logout-btn-text">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
