import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  Menu, 
  X, 
  Settings,
  CheckCircle2,
  Sparkles,
  Command
} from 'lucide-react';

export default function Navbar({ user, onLogout, onSwitchUser, onNavigate, isMobileMenuOpen, onToggleMobileMenu }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const dropdownRef = useRef(null);

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
      roleCategory: "Super Admin",
      categoryColor: "#ef4444",
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
      roleCategory: "Sekretariat",
      categoryColor: "#8b5cf6",
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
      roleCategory: "Approval Utama",
      categoryColor: "#166534",
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
      roleCategory: "Ketua Tim Kerja",
      categoryColor: "#15803d",
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
      roleCategory: "Ketua Tim Kerja",
      categoryColor: "#15803d",
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
      roleCategory: "Koordinator",
      categoryColor: "#0284c7",
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
      roleCategory: "Pegawai",
      categoryColor: "#f59e0b",
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
      roleCategory: "Pegawai",
      categoryColor: "#f59e0b",
      jabatan: "Pengelola Standardisasi Teknis",
      divisi: "Balai Penerapan Standar Instrumen Pertanian DIY",
      sisaCuti: 12
    }
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleMenu(false);
      }
    }
    if (showRoleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleMenu]);

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
          <ShieldCheck size={20} style={{ color: '#15803d' }} />
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
        <span style={{
          fontSize: '0.65rem',
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          Ctrl K
        </span>
      </div>

      <div className="navbar-right">
        {/* Switch Role Quick Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="navbar-role-btn"
            title="Ganti peran kedinasan (Multi-Role)"
          >
            <UserCheck size={14} />
            <span className="role-btn-text">Ganti Peran</span>
            <ChevronDown size={13} style={{ transform: showRoleMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {showRoleMenu && (
            <div
              className="navbar-role-dropdown"
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                width: 'min(360px, calc(100vw - 24px))',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderBottom: '1px solid #d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#0a1f0e' }}>
                  <Sparkles size={14} style={{ color: '#16a34a' }} />
                  <span>SIMULASI MULTI-ROLE KEDINASAN</span>
                </div>
                <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                  8 Akun
                </span>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {demoAccounts.map((acc, idx) => {
                  const isActive = user?.nip === acc.nip;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAccount(acc)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isActive ? '#f0fdf4' : '#ffffff',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isActive ? '#15803d' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        flexShrink: 0,
                        boxShadow: isActive ? '0 2px 6px rgba(21, 128, 61, 0.3)' : 'none'
                      }}>
                        {acc.nama.charAt(0)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isActive ? '#15803d' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {acc.nama}
                          </span>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: `${acc.categoryColor}18`,
                            color: acc.categoryColor,
                            flexShrink: 0
                          }}>
                            {acc.roleCategory}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 700, marginTop: '2px' }}>
                          {acc.roleLabel}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                          NIP: {acc.nip}
                        </div>
                      </div>

                      {isActive && (
                        <div style={{ color: '#15803d', flexShrink: 0, marginTop: '2px' }}>
                          <CheckCircle2 size={16} />
                        </div>
                      )}
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
        >
          <Bell size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            className="navbar-user-info" 
            onClick={() => onNavigate && onNavigate('pengaturan-akun')}
            title="Klik untuk membuka Pengaturan Akun & Profil"
            style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{ position: 'relative' }}>
              {user?.fotoProfil ? (
                <img 
                  src={user.fotoProfil} 
                  alt="Avatar" 
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.7)', display: 'block' }}
                />
              ) : (
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, border: '1.5px solid rgba(255,255,255,0.5)' }}>
                  {(user?.nama || 'P').charAt(0)}
                </div>
              )}
              {/* Online indicator ring */}
              <span style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid var(--primary-900)',
                boxShadow: '0 0 6px #10b981'
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, maxWidth: '145px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
                {user?.nama || 'Agnita V. Putri'}
              </span>
              <span className="navbar-user-nip" style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                NIP: {user?.nip || '199808062014032001'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('pengaturan-akun')}
            title="Pengaturan Akun & Profil"
            className="navbar-settings-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.16)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '7px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <Settings size={16} />
          </button>

          <button
            onClick={onLogout}
            title="Keluar"
            className="navbar-logout-btn"
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#fee2e2',
              padding: '7px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={15} />
            <span className="logout-btn-text">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
