import React, { useState, useRef, useEffect } from 'react';
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
  Camera,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { apiService, getStoredAvatar, setStoredAvatar } from '../services/api';

export default function Navbar({ user, onLogout, onSwitchUser, onNavigate, isMobileMenuOpen, onToggleMobileMenu }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const navbarPhotoInputRef = useRef(null);

  // Dynamic system notifications matching government workflow
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'spt',
      title: 'Penerbitan Surat Tugas (SPT)',
      message: 'SPT No. 042/BRMP-DIY/TU/2026 ke Sleman telah terbit & disahkan Kepala Balai.',
      time: '12 menit lalu',
      read: false,
      targetView: 'spt-tracking'
    },
    {
      id: 'notif-2',
      type: 'cuti',
      title: 'Verifikasi Pengajuan Cuti',
      message: 'Pengajuan cuti tahunan staf SDM telah disetujui Verifikator 1 (Ketimker).',
      time: '45 menit lalu',
      read: false,
      targetView: 'pengajuan-cuti'
    },
    {
      id: 'notif-3',
      type: 'presensi',
      title: 'Presensi Masuk Berhasil',
      message: 'Presensi harian tercatat pukul 07:28 WIB (Radius Kotagede 38m - Valid Hadir).',
      time: 'Hari ini, 07:28 WIB',
      read: true,
      targetView: 'absensi-bulanan'
    },
    {
      id: 'notif-4',
      type: 'agenda',
      title: 'Agenda Rapat Koordinasi',
      message: 'Rapat Evaluasi Triwulan Modernisasi Pertanian pukul 13:30 WIB di Ruang Rapat Balai.',
      time: 'Kemarin',
      read: true,
      targetView: 'dashboard'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    setShowNotifications(prev => !prev);
    setShowRoleMenu(false);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? ({ ...n, read: true }) : n));
    setShowNotifications(false);
    if (notif.targetView && onNavigate) {
      onNavigate(notif.targetView);
    }
  };

  const handleDeleteNotif = (e, notifId) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  const demoAccounts = [
    {
      id: "PEG-ADM",
      nip: "198001012005011001",
      nama: "ADMINISTRATOR KEPEGAWAIAN",
      role: "admin",
      sptRole: "admin_sekretariat",
      systemRole: "admin",
      approvalRole: "admin",
      roleLabel: "Administrator (Akses Penuh Semua Modul)",
      jabatan: "Pranata Komputer Ahli Muda / Admin Kepegawaian",
      divisi: "Sub Bagian Tata Usaha & Kepegawaian",
      sisaCuti: 12
    },
    {
      id: "PEG-017_adm",
      nip: "199111042023212041",
      nama: "Novita Widiyanti, A.Md",
      role: "admin_sekretariat",
      sptRole: "admin_sekretariat",
      systemRole: "pegawai",
      approvalRole: "admin",
      roleLabel: "Admin Sekretariat (Penomoran & Persuratan SPT)",
      jabatan: "Pengadministrasi Perkantoran",
      divisi: "Bagian Tata Usaha / Sekretariat",
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
      id: "PEG-017",
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
      id: "PEG-034",
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
      id: "PEG-013",
      nip: "198808062014032001",
      nama: "Agnita Verdiani Putri, A.Md",
      role: "user",
      sptRole: "user",
      systemRole: "pegawai",
      approvalRole: "pemohon",
      roleLabel: "Pegawai / Pemohon (Agnita)",
      jabatan: "Pengolah Data Dan Informasi",
      divisi: "Tim Kerja Keuangan dan Barang Milik Negara",
      sisaCuti: 12
    }
  ];

  const handleSelectAccount = (acc) => {
    const cachedPhoto = getStoredAvatar(acc.nip);
    const updatedAcc = {
      ...acc,
      fotoProfil: acc.fotoProfil || cachedPhoto || null
    };
    if (onSwitchUser) {
      onSwitchUser(updatedAcc);
    }
    setShowRoleMenu(false);
  };

  const handleNavbarPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File yang dipilih harus berupa gambar (JPG, PNG, atau WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10 MB');
      return;
    }

    setUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          // Simpan ke cache avatar per NIP
          setStoredAvatar(user?.nip, compressedDataUrl);

          // Update user state di App
          const updatedUser = {
            ...user,
            fotoProfil: compressedDataUrl
          };
          if (onSwitchUser) {
            onSwitchUser(updatedUser);
          }

          // Simpan ke backend
          await apiService.updateProfile({
            nip: user?.nip,
            userId: user?.id,
            fotoProfil: compressedDataUrl
          });

          alert('Foto profil berhasil diperbarui & disimpan permanen!');
        } catch (err) {
          console.error('Gagal memproses foto:', err);
          alert('Gagal mengunggah foto: ' + (err.message || ''));
        } finally {
          setUploadingPhoto(false);
          if (navbarPhotoInputRef.current) navbarPhotoInputRef.current.value = '';
        }
      };
      img.onerror = () => {
        alert('Gagal memuat file gambar');
        setUploadingPhoto(false);
        if (navbarPhotoInputRef.current) navbarPhotoInputRef.current.value = '';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const isAdmin = user?.systemRole === 'admin' || user?.role === 'admin' || user?.nip === '198001012005011001';

  return (
    <header className="top-navbar no-print" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)', boxShadow: '0 2px 10px rgba(6, 78, 59, 0.3)' }}>
      <div className="brand-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mobile Hamburger Menu Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          title={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo Lambang Lingkaran Kementan / BRMP DIY seperti di Halaman Login */}
        <div 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#fef08a',
            border: '2px solid #eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            flexShrink: 0
          }}
          title="Kementerian Pertanian - BRMP DIY"
        >
          <img 
            src="/logo-kementan.png" 
            alt="Logo BRMP" 
            style={{ width: '84%', height: '84%', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.02em', color: '#ffffff', display: 'flex', alignItems: 'center' }}>
          KITA BRMP DIY
        </span>

        <span style={{ 
          background: '#10b981', 
          color: '#ffffff', 
          fontSize: '0.68rem', 
          fontWeight: 800, 
          padding: '2.5px 8px', 
          borderRadius: '9999px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
        }}>
          RESMI
        </span>
      </div>

      <div className="navbar-search" style={{ width: '380px', background: 'rgba(0, 0, 0, 0.25)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
        <Search size={16} style={{ color: '#a7f3d0' }} />
        <input 
          type="text" 
          placeholder="Cari fitur, SPT, cuti, atau disposisi..." 
          aria-label="Cari"
          style={{ color: '#ffffff' }}
        />
      </div>

      <div className="navbar-right">
        {/* Switch Role Quick Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '9999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
            title="Ganti peran kedinasan (Multi-Role)"
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
            <span>Role: {isAdmin ? 'ADMIN' : (user?.roleLabel?.split(' ')[0] || 'PEGAWAI').toUpperCase()}</span>
            <ChevronDown size={14} />
          </button>

          {showRoleMenu && (
            <div
              className="navbar-role-dropdown"
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                width: 'min(330px, calc(100vw - 24px))',
                background: '#ffffff',
                color: '#1e293b',
                borderRadius: '12px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
                border: '1px solid #cbd5e1',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                PILIH PERAN KEDINASAN (MULTI-ROLE)
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {demoAccounts.map((acc, idx) => {
                  const isActive = user?.nip === acc.nip;
                  const accPhoto = getStoredAvatar(acc.nip);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAccount(acc)}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isActive ? '#ecfdf5' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.15s'
                      }}
                    >
                      {/* Avatar preview in dropdown */}
                      {accPhoto ? (
                        <img 
                          src={accPhoto} 
                          alt={acc.nama} 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981', flexShrink: 0 }} 
                        />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>
                          {acc.nama.charAt(0)}
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: isActive ? '#047857' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {acc.nama}
                          </span>
                          {isActive && <span style={{ fontSize: '10px', color: '#047857', fontWeight: 800, background: '#dcfce7', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>Aktif</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {acc.roleLabel}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px' }}>
                          NIP: {acc.nip}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bell notification with dynamic badge & interactive dropdown */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button 
            onClick={handleToggleNotifications}
            title={unreadCount > 0 ? `${unreadCount} notifikasi baru` : "Notifikasi kedinasan"}
            aria-label="Notifikasi"
            style={{ 
              background: showNotifications ? 'rgba(255, 255, 255, 0.2)' : 'transparent', 
              border: 'none', 
              color: '#ffffff', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '6px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
          >
            <Bell size={20} />
          </button>
          
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #064e3b',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              pointerEvents: 'none'
            }}>
              {unreadCount}
            </span>
          )}

          {/* Interactive Notification Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: '-40px',
                top: '44px',
                width: 'min(380px, calc(100vw - 24px))',
                background: '#ffffff',
                color: '#1e293b',
                borderRadius: '14px',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 1px 1px rgba(0,0,0,0.08)',
                border: '1px solid #cbd5e1',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{ 
                padding: '12px 16px', 
                background: '#f8fafc', 
                borderBottom: '1px solid #e2e8f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="#047857" />
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                    NOTIFIKASI KEDINASAN
                  </span>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 800, background: '#fee2e2', color: '#dc2626', padding: '1.5px 6px', borderRadius: '10px' }}>
                      {unreadCount} Baru
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#059669',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 4px'
                    }}
                    title="Tandai semua notifikasi telah dibaca"
                  >
                    <CheckCheck size={14} />
                    <span>Tandai dibaca</span>
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Belum ada notifikasi</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>Semua pengajuan dan aktivitas kedinasan terpantau lancar.</div>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const iconConfig = {
                      spt: { bg: '#ffedd5', color: '#ea580c', icon: <FileText size={16} /> },
                      cuti: { bg: '#dcfce7', color: '#166534', icon: <Calendar size={16} /> },
                      presensi: { bg: '#f3e8ff', color: '#7c3aed', icon: <CheckCircle2 size={16} /> },
                      agenda: { bg: '#e0f2fe', color: '#0284c7', icon: <Clock size={16} /> }
                    }[n.type] || { bg: '#f1f5f9', color: '#475569', icon: <Bell size={16} /> };

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          background: !n.read ? '#f0fdf4' : '#ffffff',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = !n.read ? '#f0fdf4' : '#ffffff'; }}
                      >
                        {/* Icon Circle */}
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          background: iconConfig.bg,
                          color: iconConfig.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {iconConfig.icon}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: !n.read ? 800 : 700, color: !n.read ? '#065f46' : '#0f172a' }}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                            )}
                          </div>
                          <p style={{ fontSize: '11.5px', color: '#475569', margin: '3px 0 4px', lineHeight: 1.4 }}>
                            {n.message}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                              {n.time}
                            </span>
                            <button
                              onClick={(e) => handleDeleteNotif(e, n.id)}
                              title="Hapus notifikasi"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '8px 14px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#64748b'
              }}>
                <span>KITA BRMP DIY Real-time Alerts</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>Aktif • Terhubung</span>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input for Navbar Photo Upload */}
        <input 
          type="file" 
          ref={navbarPhotoInputRef} 
          style={{ display: 'none' }} 
          accept="image/jpeg,image/png,image/webp" 
          onChange={handleNavbarPhotoChange} 
        />

        {/* User Info & Profile Link with Quick Photo Upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
          <div 
            className="navbar-user-info" 
            style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 4px', borderRadius: '8px' }}
          >
            {/* Clickable Profile Avatar with Camera Icon for Instant Upload */}
            <div 
              style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                navbarPhotoInputRef.current?.click();
              }}
              title="Klik di sini untuk langsung mengganti foto profil"
            >
              {user?.fotoProfil ? (
                <img 
                  src={user.fotoProfil} 
                  alt="Avatar" 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #34d399', display: 'block' }}
                />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#047857', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, border: '2px solid #34d399' }}>
                  {(user?.nama || 'A').charAt(0)}
                </div>
              )}
              {/* Camera icon badge */}
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #064e3b',
                boxShadow: '0 1px 3px rgba(0,0,0,0.35)'
              }}>
                <Camera size={10} />
              </div>
            </div>

            <div 
              style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              onClick={() => onNavigate && onNavigate('pengaturan-akun')}
              title="Buka Pengaturan Akun"
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.nama || 'Agnita V. Putri'}
              </span>
              <span className="navbar-user-nip" style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>
                {isAdmin ? 'ADMINISTRATOR' : `NIP: ${user?.nip || ''}`}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('pengaturan-akun')}
            title="Pengaturan Akun & Profil Lengkap"
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
              background: 'rgba(239, 68, 68, 0.25)',
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
              transition: 'all 0.2s',
              marginLeft: '4px'
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

