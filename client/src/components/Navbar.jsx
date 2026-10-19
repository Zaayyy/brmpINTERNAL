import React, { useState } from 'react';
import { Search, Bell, LogOut, ShieldCheck, UserCheck, ChevronDown } from 'lucide-react';

export default function Navbar({ user, onLogout, onSwitchUser }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const demoAccounts = [
    {
      id: "PEG-ADM",
      nip: "198001012005011001",
      nama: "ADMINISTRATOR KEPEGAWAIAN",
      role: "admin",
      systemRole: "admin",
      approvalRole: "admin",
      roleLabel: "Administrator (Kelola Role & Semua Data)",
      jabatan: "Pranata Komputer Ahli Muda / Admin Kepegawaian",
      divisi: "Sub Bagian Tata Usaha & Kepegawaian",
      sisaCuti: 12
    },
    {
      id: "PEG-001",
      nip: "199808062014032001",
      nama: "AGNITA VERDIANI PUTRI, A.Md.",
      role: "user",
      systemRole: "pegawai",
      approvalRole: "pemohon",
      roleLabel: "Pegawai (Pemohon Cuti)",
      jabatan: "Pengelola Standardisasi Teknis",
      divisi: "Balai Penerapan Standar Instrumen Pertanian DIY",
      sisaCuti: 12
    },
    {
      id: "PEG-004",
      nip: "198906012015032004",
      nama: "Devi Eka Nuvitasari, S.H.",
      role: "user",
      systemRole: "pegawai",
      approvalRole: "pemohon",
      roleLabel: "Pegawai (Pemohon Cuti)",
      jabatan: "Penelaah Teknis Kebijakan",
      divisi: "Tim Kerja Pengelolaan Sumber Daya Manusia",
      sisaCuti: 10
    },
    {
      id: "PEG-003",
      nip: "198604092011012024",
      nama: "Dwi Dinia Rahayu, S.Kom, M.T.I",
      role: "ketimker",
      systemRole: "pegawai",
      approvalRole: "verifikator_1",
      roleLabel: "Verifikator 1 (Ketua Tim Kerja SDM)",
      jabatan: "Analis SDM Aparatur Ahli Pertama",
      divisi: "Tim Kerja Pengelolaan Sumber Daya Manusia",
      sisaCuti: 12
    },
    {
      id: "PEG-017",
      nip: "197106141992032001",
      nama: "Yuni Pratiwi, S.ST., Ars",
      role: "ketimker",
      systemRole: "pegawai",
      approvalRole: "verifikator_1",
      roleLabel: "Verifikator 1 (Ketua Tim Kerja TU)",
      jabatan: "Arsiparis Penyelia",
      divisi: "Tim Kerja Tata Usaha dan Rumah Tangga",
      sisaCuti: 11
    },
    {
      id: "PEG-002",
      nip: "198101312009121004",
      nama: "Agung Ariyanto, SEI., M.Ec., Dev.",
      role: "kobag_tu",
      systemRole: "pegawai",
      approvalRole: "verifikator_2",
      roleLabel: "Verifikator 2 (Kepala Bagian TU / Approval Final)",
      jabatan: "Ketua Bagian Tata Usaha",
      divisi: "Bagian Tata Usaha",
      sisaCuti: 14
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
        <div className="brand-logo-badge">
          <ShieldCheck size={22} className="text-blue-600" />
          <span>BRMP <span className="brand-tag">DIY</span></span>
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>
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
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: '5px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title="Ganti peran kedinasan (Multi-Role)"
          >
            <UserCheck size={14} />
            <span>Ganti Peran</span>
            <ChevronDown size={13} />
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: '320px',
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
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Bell size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.nama || 'Agnita V. Putri'}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>NIP: {user?.nip || '199808062014032001'}</span>
          </div>
          <button
            onClick={onLogout}
            title="Keluar"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fee2e2',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
