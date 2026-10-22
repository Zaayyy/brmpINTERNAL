import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  Menu, 
  X, 
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
import { apiService, getStoredAvatar, setStoredAvatar, getStoredNotifications, saveStoredNotifications } from '../services/api';

export default function Navbar({ user, onLogout, onSwitchUser, onNavigate, isMobileMenuOpen, onToggleMobileMenu }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const notificationRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const navbarPhotoInputRef = useRef(null);

  // Dynamic system notifications connected to storage & live events
  const [notifications, setNotifications] = useState(getStoredNotifications);

  // Sync notifications when custom event or storage changes
  useEffect(() => {
    const handleSync = () => {
      setNotifications(getStoredNotifications());
    };
    handleSync();
    window.addEventListener('brmp_notifications_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('brmp_notifications_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Resolve user identity & role for notifications
  const userNip = user?.nip || '';
  const isAdmin = user?.systemRole === 'admin' || user?.role === 'admin' || userNip === '198001012005011001' || user?.id === 'PEG-ADM';
  const isKobag = user?.sptRole === 'kobag_tu' || user?.role === 'kobag_tu' || user?.approvalRole === 'verifikator_2' || userNip === '198101312009121004';
  const isKetimker = user?.sptRole === 'ketimker' || user?.role === 'ketimker' || user?.approvalRole === 'verifikator_1' || userNip === '198604092011012024' || userNip === '197106141992032001';
  const isSekretariat = user?.sptRole === 'admin_sekretariat' || user?.role === 'admin_sekretariat' || userNip === '199111042023212041';
  const isKopoks = user?.sptRole === 'kopoks' || user?.role === 'kopoks' || userNip === '197402062000032001';
  const isRegularUser = !isAdmin && !isKobag && !isKetimker && !isSekretariat;

  // Filter notifications specifically for the active user & role
  const userFilteredNotifications = notifications.filter(n => {
    // 1. Superadmin sees all notifications
    if (isAdmin) return true;

    // 2. Direct recipient match by NIP (personal confirmation/status)
    if (userNip && (n.recipientNip === userNip || (Array.isArray(n.recipientNips) && n.recipientNips.includes(userNip)))) {
      return true;
    }

    // 3. Broadcast to all users (agenda / general)
    if (n.targetRoles?.includes('all')) {
      return true;
    }

    // 4. Role-specific matches
    if (isKobag && n.targetRoles?.includes('kobag_tu')) return true;
    if (isKetimker && n.targetRoles?.includes('ketimker')) return true;
    if (isSekretariat && n.targetRoles?.includes('admin_sekretariat')) return true;
    if (isKopoks && (n.targetRoles?.includes('kopoks') || n.targetRoles?.includes('ketimker'))) return true;

    // 5. Regular employee (pemohon) sees personal or applicant notifications
    if (isRegularUser && (n.targetRoles?.includes('pemohon') || n.targetRoles?.includes('pegawai') || n.targetRoles?.includes('user'))) {
      if (n.recipientNip) {
        return n.recipientNip === userNip;
      }
      return true;
    }

    // 6. Fallback for legacy notification without targetRoles/recipientNip
    if (!n.targetRoles && !n.recipientNip && !n.recipientNips) {
      return true;
    }

    return false;
  });

  const unreadCount = userFilteredNotifications.filter(n => !n.read).length;

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
    const visibleIds = new Set(userFilteredNotifications.map(n => n.id));
    const updated = notifications.map(n => visibleIds.has(n.id) ? ({ ...n, read: true }) : n);
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleNotificationClick = (notif) => {
    const updated = notifications.map(n => n.id === notif.id ? ({ ...n, read: true }) : n);
    setNotifications(updated);
    saveStoredNotifications(updated);
    setShowNotifications(false);
    if (notif.targetView && onNavigate) {
      onNavigate(notif.targetView);
    }
  };

  const handleDeleteNotif = (e, notifId) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

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
          BRMP DIY
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

      <div className="navbar-right">
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
                width: 'min(410px, calc(100vw - 20px))',
                background: '#ffffff',
                color: '#1e293b',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 1px 1px rgba(0,0,0,0.08)',
                border: '1px solid #cbd5e1',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{ 
                padding: '14px 16px 10px', 
                background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', 
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#dcfce7', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bell size={16} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.01em' }}>
                          PUSAT NOTIFIKASI
                        </span>
                        <span style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          background: isAdmin ? '#ecfdf5' : isKobag ? '#f3e8ff' : isKetimker ? '#fef3c7' : isSekretariat ? '#e0f2fe' : '#f1f5f9',
                          color: isAdmin ? '#047857' : isKobag ? '#7c3aed' : isKetimker ? '#b45309' : isSekretariat ? '#0284c7' : '#475569',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                          {isAdmin ? 'Superadmin' : isKobag ? 'Kobag TU' : isKetimker ? 'Ketimker' : isSekretariat ? 'Sekretariat' : 'Pegawai'}
                        </span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        {isAdmin 
                          ? 'Mode Pantau Administrator (Seluruh Instansi)' 
                          : isKobag 
                          ? 'Persetujuan Eksekutif & Disposisi Kobag TU' 
                          : isKetimker 
                          ? 'Telaah & Verifikasi Tim Kerja' 
                          : isSekretariat 
                          ? 'Penomoran Naskah Dinas & Tata Persuratan' 
                          : `Status Penugasan & Notifikasi ${user?.nama?.split(' ')[0] || 'Pegawai'}`}
                      </div>
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#059669',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      title="Tandai semua notifikasi telah dibaca"
                    >
                      <CheckCheck size={13} />
                      <span>Baca Semua</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs by Category */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {[
                    { id: 'all', label: 'Semua', count: userFilteredNotifications.length },
                    { id: 'spt', label: 'SPT & Tugas', count: userFilteredNotifications.filter(n => n.type === 'spt').length },
                    { id: 'cuti', label: 'Cuti', count: userFilteredNotifications.filter(n => n.type === 'cuti').length },
                    { id: 'presensi', label: 'Presensi', count: userFilteredNotifications.filter(n => n.type === 'presensi').length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id)}
                      style={{
                        background: activeCategory === tab.id ? '#059669' : '#ffffff',
                        color: activeCategory === tab.id ? '#ffffff' : '#475569',
                        border: activeCategory === tab.id ? '1px solid #059669' : '1px solid #cbd5e1',
                        borderRadius: '9999px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span style={{
                        fontSize: '9.5px',
                        background: activeCategory === tab.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        color: activeCategory === tab.id ? '#ffffff' : '#475569',
                        padding: '0.5px 5px',
                        borderRadius: '10px'
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Items List */}
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {(() => {
                  const items = userFilteredNotifications.filter(n => activeCategory === 'all' || n.type === activeCategory);
                  if (items.length === 0) {
                    return (
                      <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                        <Bell size={36} style={{ margin: '0 auto 10px', opacity: 0.35, color: '#047857' }} />
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569' }}>Tidak ada notifikasi {activeCategory !== 'all' ? activeCategory.toUpperCase() : ''}</div>
                        <div style={{ fontSize: '11.5px', marginTop: '3px', color: '#94a3b8' }}>
                          Seluruh permohonan dan surat penugasan telah diproses dengan tertib.
                        </div>
                      </div>
                    );
                  }

                  return items.map((n) => {
                    const iconConfig = {
                      spt: { bg: '#ffedd5', color: '#ea580c', icon: <FileText size={17} />, tag: 'SURAT TUGAS' },
                      cuti: { bg: '#dcfce7', color: '#166534', icon: <Calendar size={17} />, tag: 'CUTI PEGAWAI' },
                      presensi: { bg: '#f3e8ff', color: '#7c3aed', icon: <CheckCircle2 size={17} />, tag: 'PRESENSI' },
                      agenda: { bg: '#e0f2fe', color: '#0284c7', icon: <Clock size={17} />, tag: 'AGENDA' }
                    }[n.type] || { bg: '#f1f5f9', color: '#475569', icon: <Bell size={17} />, tag: 'INFO' };

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
                          transition: 'background 0.15s',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = !n.read ? '#f0fdf4' : '#ffffff'; }}
                      >
                        {/* Unread Left Border Accent */}
                        {!n.read && (
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            background: '#10b981'
                          }} />
                        )}

                        {/* Icon Circle */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: iconConfig.bg,
                          color: iconConfig.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                        }}>
                          {iconConfig.icon}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '9.5px', fontWeight: 800, color: iconConfig.color, background: iconConfig.bg, padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.02em' }}>
                                {iconConfig.tag}
                              </span>
                              {!n.read && (
                                <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: '4px' }}>
                                  BARU
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                              {n.time}
                            </span>
                          </div>

                          <div style={{ fontSize: '12.5px', fontWeight: !n.read ? 800 : 700, color: !n.read ? '#065f46' : '#0f172a', lineHeight: 1.35, marginTop: '2px' }}>
                            {n.title}
                          </div>

                          <p style={{ fontSize: '11.5px', color: '#475569', margin: '4px 0 6px', lineHeight: 1.45 }}>
                            {n.message}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span>Buka Surat / Verifikasi</span>
                              <span>→</span>
                            </span>

                            <button
                              onClick={(e) => handleDeleteNotif(e, n.id)}
                              title="Hapus notifikasi"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '3px 5px',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '4px'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 16px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#64748b'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  <span>Sinkronisasi Realtime Balai</span>
                </span>
                <span style={{ color: '#059669', fontWeight: 700 }}>Online • Terhubung</span>
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

