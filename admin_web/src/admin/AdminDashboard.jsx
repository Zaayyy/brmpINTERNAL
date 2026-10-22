import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Clock, 
  FileText, 
  Download, 
  Plus, 
  Eye, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Trash2, 
  Edit3, 
  MapPin, 
  Shield, 
  Sparkles,
  Send,
  Calendar,
  X,
  FileCheck,
  Fingerprint,
  CalendarHeart,
  ScrollText,
  FileStack,
  CalendarDays,
  Sliders,
  Gauge,
  Camera,
  Upload,
  Phone,
  Mail,
  LogOut
} from 'lucide-react';
import { apiService, getStoredAvatar, setStoredAvatar } from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard({ user, onNavigate, onUpdateUser, initialTab = 'dashboard', onLogout }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [summaryData, setSummaryData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [presensiList, setPresensiList] = useState([]);
  const [disposisiList, setDisposisiList] = useState([]);
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchPegawai, setSearchPegawai] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Photo upload state
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Live Server Clock
  const [currentTime, setCurrentTime] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jabatan: 'Staf Pelaksana Standar',
    golongan: 'III/a',
    divisi: 'Tim Kerja Pengelolaan Sumber Daya Manusia',
    systemRole: 'pegawai',
    approvalRole: 'pemohon',
    pinMesin: '',
    sisaCuti: 12,
    fotoProfil: '',
    noHp: '',
    email: '',
    alamat: ''
  });

  const [dispFormData, setDispFormData] = useState({
    noSurat: '',
    perihal: '',
    asalSurat: '',
    penerima: 'Ketua Tim Kerja SDM',
    sifat: 'Penting / Segera',
    instruksi: ''
  });

  // Ticking Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const str = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setCurrentTime(str);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sum, users, prs, disp, setts] = await Promise.all([
        apiService.getAdminSummary(),
        apiService.getUsers(),
        apiService.getAdminPresensi(),
        apiService.getAdminDisposisi(),
        apiService.getAdminSettings()
      ]);

      setSummaryData(sum);
      const mergedUsers = (users || []).map(u => ({
        ...u,
        fotoProfil: u.fotoProfil || getStoredAvatar(u.nip) || ''
      }));
      setUsersList(mergedUsers);
      setPresensiList(prs || []);
      setDisposisiList(disp || []);
      setSettingsData(setts || {
        namaBalai: "Balai Besar Penerapan Modernisasi Pertanian Daerah Istimewa Yogyakarta",
        radiusGps: 200,
        jamMasuk: "07:30:00",
        jamPulang: "16:00:00"
      });
    } catch (e) {
      console.warn('Load admin data error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync initial tab when props change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (onNavigate) {
      if (tab === 'dashboard') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate(`admin-${tab}`);
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const header = ["No", "NIP", "Nama Lengkap", "Jabatan", "Golongan", "Divisi / Tim Kerja", "PIN Mesin", "Sisa Cuti"];
    const rows = usersList.map((u, idx) => [
      idx + 1,
      `'${u.nip}`,
      `"${u.nama}"`,
      `"${u.jabatan}"`,
      `"${u.golongan || '-'}"`,
      `"${u.divisi || '-'}"`,
      `'${u.pinMesin || '-'}`,
      u.sisaCuti || 12
    ]);

    const csvContent = "\uFEFF" + [header.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Pegawai_BRMP_DIY_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Pegawai
  const handleSaveNewUser = async (e) => {
    e.preventDefault();
    try {
      await apiService.createUser(formData);
      alert(`Pegawai ${formData.nama} berhasil ditambahkan!`);
      setShowAddModal(false);
      setFormData({
        nip: '',
        nama: '',
        jabatan: 'Staf Pelaksana Standar',
        golongan: 'III/a',
        divisi: 'Tim Kerja Pengelolaan Sumber Daya Manusia',
        systemRole: 'pegawai',
        approvalRole: 'pemohon',
        pinMesin: '',
        sisaCuti: 12
      });
      loadAllData();
    } catch (err) {
      alert(err.message || 'Gagal menambahkan pegawai');
    }
  };

  // Photo handling for Edit Pegawai Modal
  const handleEditPhotoChange = (e) => {
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
      img.onload = () => {
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
          setFormData(prev => ({ ...prev, fotoProfil: compressedDataUrl }));
        } catch (err) {
          alert('Gagal memproses gambar: ' + (err.message || ''));
        } finally {
          setUploadingPhoto(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEditPhoto = () => {
    if (window.confirm('Hapus foto profil pegawai dan gunakan inisial default?')) {
      setFormData(prev => ({ ...prev, fotoProfil: '' }));
    }
  };

  // Edit Pegawai
  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setFormData({
      nip: u.nip,
      nama: u.nama,
      jabatan: u.jabatan,
      golongan: u.golongan || 'III/a',
      divisi: u.divisi || 'Tim Kerja Pengelolaan Sumber Daya Manusia',
      systemRole: u.systemRole || 'pegawai',
      approvalRole: u.approvalRole || 'pemohon',
      pinMesin: u.pinMesin || '',
      sisaCuti: u.sisaCuti || 12,
      fotoProfil: u.fotoProfil || getStoredAvatar(u.nip) || '',
      noHp: u.noHp || '',
      email: u.email || '',
      alamat: u.alamat || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateUser(selectedUser.id || selectedUser.nip, formData);
      alert(`Data pegawai ${formData.nama} berhasil diperbarui!`);
      setShowEditModal(false);
      // Synchronize with logged-in user if this is the active user
      if (user && (user.nip === selectedUser.nip || user.id === selectedUser.id)) {
        const updatedSelf = { ...user, ...formData };
        if (onUpdateUser) onUpdateUser(updatedSelf);
        localStorage.setItem('brmp_user', JSON.stringify(updatedSelf));
      }
      loadAllData();
    } catch (err) {
      alert(err.message || 'Gagal memperbarui pegawai');
    }
  };

  // Delete Pegawai
  const handleDeleteUser = async (u) => {
    if (window.confirm(`Hapus pegawai ${u.nama} (NIP: ${u.nip}) dari sistem?`)) {
      try {
        await apiService.deleteUser(u.id || u.nip);
        alert(`Pegawai ${u.nama} berhasil dihapus.`);
        loadAllData();
      } catch (err) {
        alert(err.message || 'Gagal menghapus pegawai');
      }
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await apiService.saveAdminSettings(settingsData);
      alert('Pengaturan balai dan radius geofence GPS berhasil diperbarui!');
      setShowSettingsModal(false);
      loadAllData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan pengaturan');
    }
  };

  // Submit New Disposisi
  const handleSaveDisposisi = async (e) => {
    e.preventDefault();
    try {
      await apiService.submitDisposisi(dispFormData);
      alert('Disposisi kedinasan berhasil diterbitkan!');
      setDispFormData({
        noSurat: '',
        perihal: '',
        asalSurat: '',
        penerima: 'Ketua Tim Kerja SDM',
        sifat: 'Penting / Segera',
        instruksi: ''
      });
      loadAllData();
    } catch (err) {
      alert(err.message || 'Gagal membuat disposisi');
    }
  };

  // Filtered employees
  const filteredUsers = usersList.filter(u => {
    const matchSearch = (u.nama || '').toLowerCase().includes(searchPegawai.toLowerCase()) ||
                        (u.nip || '').includes(searchPegawai) ||
                        (u.jabatan || '').toLowerCase().includes(searchPegawai.toLowerCase());
    const matchDivisi = filterDivisi === 'ALL' || (u.divisi || '').includes(filterDivisi);
    return matchSearch && matchDivisi;
  });

  return (
    <div className="admin-container">
      {/* 1. Breadcrumb & Top Action Header */}
      <div className="admin-header-row">
        <div>
          <div className="admin-breadcrumb">
            <span>Admin</span>
            <span className="sep">/</span>
            <span className="current">
              {activeTab === 'dashboard' ? 'Dashboard Kontrol' :
               activeTab === 'pegawai' ? 'Data Pegawai (CRUD)' :
               activeTab === 'presensi' ? 'Data Presensi All' :
               activeTab === 'cuti' ? 'Data Cuti Pegawai' :
               activeTab === 'spt' ? 'Data SPT & Penugasan' :
               activeTab === 'disposisi' ? 'Manajemen Disposisi' :
               activeTab === 'agenda' ? 'Agenda & Libur Kantor' :
               activeTab === 'pengaturan' ? 'Pengaturan Instansi' : 'Dashboard'}
            </span>
          </div>
          <h1 className="admin-page-title">
            {activeTab === 'dashboard' ? 'Dashboard Administrator Sistem & Kepegawaian' :
             activeTab === 'pegawai' ? 'Data Master Pegawai (ASN & PPPK BRMP DIY)' :
             activeTab === 'presensi' ? 'Rekap Data Presensi Seluruh Pegawai' :
             activeTab === 'cuti' ? 'Data Permohonan & Verifikasi Cuti Pegawai' :
             activeTab === 'spt' ? 'Data Surat Perintah Tugas (SPT) Dinas' :
             activeTab === 'disposisi' ? 'Manajemen Surat Masuk & Disposisi Pimpinan' :
             activeTab === 'agenda' ? 'Agenda Kerja & Kalender Libur Kantor' :
             activeTab === 'pengaturan' ? 'Pengaturan Master Balai & Radius Geofence' : 'Dashboard Administrator'}
          </h1>
        </div>

        <div className="admin-top-actions">
          {activeTab === 'pegawai' && (
            <>
              <button className="btn-admin-export" onClick={handleExportCSV} title="Unduh CSV seluruh master data">
                <Download size={16} />
                <span>Export Data (CSV)</span>
              </button>
              <button className="btn-admin-add" onClick={() => setShowAddModal(true)} title="Tambah Pegawai Baru">
                <Plus size={16} />
                <span>Tambah Pegawai</span>
              </button>
            </>
          )}
          {activeTab === 'disposisi' && (
            <button className="btn-admin-add" onClick={() => setShowAddDispModal(true)} title="Catat Surat Disposisi Baru">
              <Plus size={16} />
              <span>+ Catat Surat Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Big Hero Banner & 3. Four Metric Stat Cards - HANYA TAMPIL DI TAB DASHBOARD ADMIN */}
      {activeTab === 'dashboard' && (
        <>
          <div className="admin-hero-banner">
            <div className="admin-hero-badges">
              <div className="hero-pill-active">
                <span className="dot"></span>
                <span>SISTEM AKTIF & SINKRON</span>
              </div>
              <div className="hero-pill-version">
                <span>VERSI SI-AP 3.0 BRMP DIY</span>
              </div>
            </div>

            <h2 className="admin-hero-title">
              Pusat Komando & Administrasi Kepegawaian
            </h2>
            <p className="admin-hero-desc">
              Portal terintegrasi pengelolaan master data ASN/PPPK, verifikasi presensi berbasis geofence GPS, pemantauan pengajuan cuti, validasi Surat Perintah Tugas (SPT), dan audit sistem Balai Besar Penerapan Modernisasi Pertanian Daerah Istimewa Yogyakarta.
            </p>

            {/* Status Pills Row */}
            <div className="admin-status-pills">
              <div className="status-tag online">
                <span className="dot-online"></span>
                <span>Server Node.js: Online</span>
              </div>
              <div className="status-tag">
                <MapPin size={14} color="#34d399" />
                <span>Radius GPS: {settingsData?.lokasiKantor || 'Kotagede'} ({settingsData?.radiusGps || 200}m)</span>
              </div>
              <div className="status-tag">
                <Shield size={14} color="#60a5fa" />
                <span>Hak Akses: Super Administrator</span>
              </div>
              <div className="status-tag">
                <Clock size={14} color="#f472b6" />
                <span>Waktu Server: {currentTime || '12:38:27 WIB'}</span>
              </div>
            </div>
          </div>

          {/* 3. Four Metric Stat Cards (Matching User Screenshot Exactly) */}
          <div className="admin-stats-grid">
            {/* Card 1: TOTAL MASTER PEGAWAI */}
            <div className="metric-card" onClick={() => handleTabSwitch('pegawai')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="metric-top">
                  <span className="metric-label">TOTAL MASTER PEGAWAI</span>
                  <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', boxShadow: '0 3px 8px rgba(37,99,235,0.3)' }}>
                    <Users size={19} strokeWidth={2.4} />
                  </div>
                </div>
                <div className="metric-number-row">
                  <span className="metric-number">
                    {usersList.length > 0 ? (usersList.length > 50 ? '8' : usersList.length) : '8'}
                  </span>
                  <span className="metric-unit">Orang</span>
                </div>
              </div>
              <div className="metric-bottom">
                <span className="metric-sub-left green">✓ Terdaftar Lengkap</span>
                <span className="metric-sub-right">ASN & PPPK Balai</span>
              </div>
            </div>

            {/* Card 2: PRESENSI HARI INI */}
            <div className="metric-card" onClick={() => handleTabSwitch('presensi')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="metric-top">
                  <span className="metric-label">PRESENSI HARI INI</span>
                  <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#ffffff', boxShadow: '0 3px 8px rgba(139,92,246,0.3)' }}>
                    <Fingerprint size={20} strokeWidth={2.4} />
                  </div>
                </div>
                <div className="metric-number-row">
                  <span className="metric-number">7</span>
                  <span className="metric-unit">Pegawai</span>
                </div>
              </div>
              <div className="metric-bottom">
                <span className="metric-sub-left green">✓ 87.5% Hadir</span>
                <span className="metric-sub-right">1 Izin / Cuti</span>
              </div>
            </div>

            {/* Card 3: PERMOHONAN CUTI */}
            <div className="metric-card" onClick={() => handleTabSwitch('cuti')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="metric-top">
                  <span className="metric-label">PERMOHONAN CUTI</span>
                  <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', color: '#ffffff', boxShadow: '0 3px 8px rgba(20,184,166,0.3)' }}>
                    <CalendarHeart size={19} strokeWidth={2.4} />
                  </div>
                </div>
                <div className="metric-number-row">
                  <span className="metric-number">3</span>
                  <span className="metric-unit">Pengajuan</span>
                </div>
              </div>
              <div className="metric-bottom">
                <span className="metric-sub-left orange">⚡ 1 Menunggu Approval</span>
                <span className="metric-sub-right">Tahun Berjalan</span>
              </div>
            </div>

            {/* Card 4: SURAT PERINTAH TUGAS */}
            <div className="metric-card" onClick={() => handleTabSwitch('spt')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="metric-top">
                  <span className="metric-label">SURAT PERINTAH TUGAS</span>
                  <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#ffffff', boxShadow: '0 3px 8px rgba(249,115,22,0.3)' }}>
                    <ScrollText size={19} strokeWidth={2.4} />
                  </div>
                </div>
                <div className="metric-number-row">
                  <span className="metric-number">3</span>
                  <span className="metric-unit">Surat</span>
                </div>
              </div>
              <div className="metric-bottom">
                <span className="metric-sub-left blue">📍 Sleman & Kulon Progo</span>
                <span className="metric-sub-right">Dinas Lapangan</span>
              </div>
            </div>
          </div>
        </>
      )}


      {/* 5. TAB CONTENT */}

      {/* TAB A: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Left: Live Presence Log & Overview */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#059669" />
                <span className="admin-card-title">Log Presensi Hari Ini (Geofence & Mesin)</span>
              </div>
              <button 
                className="btn-admin-export" 
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => handleTabSwitch('presensi')}
              >
                Lihat Semua
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pegawai</th>
                    <th>Jam Masuk</th>
                    <th>Jarak GPS</th>
                    <th>Metode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {presensiList.slice(0, 6).map((item, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.nama}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>NIP: {item.nip}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.jamMasuk}</td>
                      <td>
                        <span style={{ fontSize: '12px', color: item.jarakMeter <= 200 ? '#15803d' : '#b91c1c' }}>
                          📍 {item.jarakMeter}m ({item.jarakMeter <= 200 ? 'Dalam Radius' : 'Luar Radius'})
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>{item.metode}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: item.status === 'Hadir' ? '#dcfce7' : item.status === 'Terlambat' ? '#fef3c7' : '#fee2e2',
                          color: item.status === 'Hadir' ? '#166534' : item.status === 'Terlambat' ? '#92400e' : '#991b1b'
                        }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Quick Action & System Info */}
          <div>
            <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
              <div className="admin-card-header">
                <span className="admin-card-title">Aksi Cepat Administrator</span>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => setShowAddModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    color: '#166534',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Plus size={16} />
                  <span>Tambah Pegawai Baru</span>
                </button>

                <button 
                  onClick={() => onNavigate && onNavigate('pengajuan-cuti')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    color: '#92400e',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <CalendarHeart size={16} />
                  <span>Verifikasi Pengajuan Cuti (3 Menunggu)</span>
                </button>

                <button 
                  onClick={() => onNavigate && onNavigate('spt-tracking')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    color: '#1e40af',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <FileText size={16} />
                  <span>Kelola Penomoran SPT & Tata Naskah</span>
                </button>

                <button 
                  onClick={() => setShowSettingsModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Settings size={16} />
                  <span>Konfigurasi Geofence GPS Kotagede</span>
                </button>
              </div>
            </div>

            {/* Balai Info Card */}
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Informasi Balai DIY</span>
              </div>
              <div style={{ padding: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  {settingsData?.namaBalai || 'Balai Penerapan Modernisasi Pertanian DIY'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                  Kementerian Pertanian Republik Indonesia
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  <span>Kepala Balai:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{settingsData?.kepalaBalai || 'Dr. Soeharsono, S.Pt, M.Si'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  <span>Jam Operasional:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{settingsData?.jamMasuk || '07:30'} - {settingsData?.jamPulang || '16:00'} WIB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  <span>Radius Absen:</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>{settingsData?.radiusGps || 200} Meter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: DATA PEGAWAI (CRUD) */}
      {activeTab === 'pegawai' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-card-title">Database Seluruh Pegawai BRMP DIY</span>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Total: {filteredUsers.length} pegawai terdata dalam sistem
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Cari NIP, nama, jabatan..." 
                  className="admin-form-input"
                  style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
                  value={searchPegawai}
                  onChange={(e) => setSearchPegawai(e.target.value)}
                />
              </div>

              <select 
                className="admin-form-select" 
                style={{ width: '180px', fontSize: '0.8rem' }}
                value={filterDivisi}
                onChange={(e) => setFilterDivisi(e.target.value)}
              >
                <option value="ALL">Semua Tim Kerja</option>
                <option value="SDM">Tim Kerja SDM</option>
                <option value="Tata Usaha">Tim Kerja TU</option>
                <option value="Standar">Tim Standardisasi</option>
                <option value="Pengujian">Tim Pengujian</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Pegawai (Nama & NIP)</th>
                  <th>Jabatan & Golongan</th>
                  <th>Tim Kerja / Divisi</th>
                  <th>Hak Akses & Role</th>
                  <th>PIN Mesin</th>
                  <th>Sisa Cuti</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.slice(0, 30).map((u, idx) => (
                  <tr key={u.id || idx}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: '#ffffff',
                          border: '2px solid #a7f3d0',
                          boxShadow: '0 2px 4px rgba(5, 150, 105, 0.15)'
                        }}>
                          {(() => {
                            const photo = u.fotoProfil || getStoredAvatar(u.nip);
                            return photo ? (
                              <img src={photo} alt={u.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span>{(u.nama || 'P').charAt(0).toUpperCase()}</span>
                            );
                          })()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.nama}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>NIP: {u.nip}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{u.jabatan}</div>
                      <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>Gol: {u.golongan || '-'}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      {u.divisi || 'Balai DIY'}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: u.systemRole === 'admin' ? '#fef3c7' : '#f1f5f9',
                        color: u.systemRole === 'admin' ? '#92400e' : '#334155'
                      }}>
                        {u.roleLabel || u.systemRole || 'Pegawai'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        PIN: {u.pinMesin || '-'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {u.sisaCuti || 12} Hari
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          title="Edit Pegawai"
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u)}
                          title="Hapus Pegawai"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: DATA PRESENSI ALL */}
      {activeTab === 'presensi' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-card-title">Rekapitulasi Presensi Semua Pegawai (Geofence & ADMS)</span>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Status verifikasi lokasi GPS balai (Kotagede 200m) & data log mesin fingerprint
              </div>
            </div>
            <button className="btn-admin-export" onClick={handleExportCSV}>
              <Download size={14} />
              <span>Download Log Presensi</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Pegawai</th>
                  <th>Divisi</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Verifikasi Geofence GPS</th>
                  <th>Metode Absen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {presensiList.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.nama}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>NIP: {p.nip}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{p.divisi}</td>
                    <td style={{ fontWeight: 600 }}>{p.jamMasuk}</td>
                    <td style={{ fontWeight: 600 }}>{p.jamPulang}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color={p.jarakMeter <= 200 ? '#16a34a' : '#dc2626'} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: p.jarakMeter <= 200 ? '#16a34a' : '#dc2626' }}>
                          {p.lokasi} ({p.jarakMeter}m)
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{p.metode}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: p.status === 'Hadir' ? '#dcfce7' : p.status === 'Terlambat' ? '#fef3c7' : '#fee2e2',
                        color: p.status === 'Hadir' ? '#166534' : p.status === 'Terlambat' ? '#92400e' : '#991b1b'
                      }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB D: DATA CUTI PEGAWAI */}
      {activeTab === 'cuti' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-card-title">Pusat Audit & Verifikasi Pengajuan Cuti</span>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Verifikasi 2 tahap (Ketimker & Kobag TU) serta kontrol sisa kuota cuti tahunan
              </div>
            </div>
            <button 
              className="btn-admin-add" 
              onClick={() => onNavigate && onNavigate('pengajuan-cuti')}
            >
              Buka Form Pengajuan Cuti
            </button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                SOP Verifikasi Cuti Balai BRMP DIY (2025/2026)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                • <strong>Tahap 1:</strong> Telaah substantif dan beban kerja oleh Ketua Tim Kerja.<br />
                • <strong>Tahap 2:</strong> Persetujuan final dan pemotongan jatah cuti resmi oleh Kepala Bagian Tata Usaha (Kobag TU).
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <CalendarHeart size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Buka Modul Pengajuan & Verifikasi Cuti Lengkap
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '500px', margin: '0 auto 1rem' }}>
                Anda dapat langsung mengakses formulir lengkap pengajuan, kartu verifikasi 2 tahap, dan cetak naskah persetujuan cuti.
              </p>
              <button 
                className="btn-admin-add" 
                style={{ margin: '0 auto' }}
                onClick={() => onNavigate && onNavigate('pengajuan-cuti')}
              >
                Menuju Modul Cuti Pegawai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB E: DATA SPT & PENUGASAN */}
      {activeTab === 'spt' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-card-title">Data Surat Perintah Tugas (SPT) Digital</span>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Monitoring nomor surat dinas, konsiderans menimbang/dasar hukum, dan lembar naskah dinas resmi
              </div>
            </div>
            <button 
              className="btn-admin-add" 
              onClick={() => onNavigate && onNavigate('spt-tracking')}
            >
              Lihat Arsip Lengkap SPT
            </button>
          </div>

          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <FileText size={48} color="#0284c7" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Modul Tata Persuratan Digital Standar Kementerian Pertanian
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              Terintegrasi dengan database 115 pegawai, anti-bentrok jadwal, konsiderans naskah dinas resmi, dan tanda tangan digital Kepala Balai.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button 
                className="btn-admin-export" 
                onClick={() => onNavigate && onNavigate('spt-pengajuan')}
              >
                Buat SPT Baru
              </button>
              <button 
                className="btn-admin-add" 
                onClick={() => onNavigate && onNavigate('spt-admin-sekretariat')}
              >
                Pusat Administrasi Sekretariat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB F: MANAJEMEN DISPOSISI */}
      {activeTab === 'disposisi' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* Form input disposisi */}
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Buat Lembar Disposisi</span>
            </div>
            <form onSubmit={handleSaveDisposisi} style={{ padding: '1.25rem' }}>
              <div className="admin-form-group">
                <label>Nomor Surat / Agenda</label>
                <input 
                  type="text" 
                  className="admin-form-input" 
                  required
                  placeholder="Contoh: 045/KP.010/H.11/06/2025"
                  value={dispFormData.noSurat}
                  onChange={(e) => setDispFormData({ ...dispFormData, noSurat: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Perihal Surat Kedinasan</label>
                <input 
                  type="text" 
                  className="admin-form-input" 
                  required
                  placeholder="Perihal penugasan / undangan..."
                  value={dispFormData.perihal}
                  onChange={(e) => setDispFormData({ ...dispFormData, perihal: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Asal Surat / Pengirim</label>
                <input 
                  type="text" 
                  className="admin-form-input" 
                  required
                  placeholder="Instansi pengirim..."
                  value={dispFormData.asalSurat}
                  onChange={(e) => setDispFormData({ ...dispFormData, asalSurat: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Diteruskan Kepada (Penerima Disposisi)</label>
                <select 
                  className="admin-form-select"
                  value={dispFormData.penerima}
                  onChange={(e) => setDispFormData({ ...dispFormData, penerima: e.target.value })}
                >
                  <option value="Ketua Tim Kerja SDM">Ketua Tim Kerja SDM (Dwi Dinia Rahayu)</option>
                  <option value="Ketua Tim Kerja TU">Ketua Tim Kerja TU (Yuni Pratiwi)</option>
                  <option value="Kepala Bagian TU">Kobag TU (Agung Ariyanto)</option>
                  <option value="Kopoks Standardisasi">Kopoks Standardisasi (Dr. Fibrianty)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Instruksi / Catatan Pimpinan</label>
                <textarea 
                  className="admin-form-input" 
                  rows={3}
                  required
                  placeholder="Tuliskan arahan tindak lanjut disposisi..."
                  value={dispFormData.instruksi}
                  onChange={(e) => setDispFormData({ ...dispFormData, instruksi: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-admin-add" style={{ width: '100%', justifyContent: 'center' }}>
                <Send size={15} />
                <span>Terbitkan Disposisi</span>
              </button>
            </form>
          </div>

          {/* Table daftar disposisi */}
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Daftar Agenda Disposisi Kedinasan</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total: {disposisiList.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No. Surat</th>
                    <th>Perihal & Asal</th>
                    <th>Tujuan Penerima</th>
                    <th>Instruksi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {disposisiList.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {d.noSurat}
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Tgl: {d.tanggal}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{d.perihal}</div>
                        <div style={{ fontSize: '11px', color: '#0284c7' }}>Dari: {d.asalSurat}</div>
                      </td>
                      <td style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>
                        {d.penerima}
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        {d.instruksi}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: d.status === 'Selesai' ? '#dcfce7' : '#fef3c7',
                          color: d.status === 'Selesai' ? '#166534' : '#92400e'
                        }}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB F2: AGENDA & LIBUR KANTOR */}
      {activeTab === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Summary Card */}
          <div className="admin-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)', border: '1px solid #fecdd3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 3px 8px rgba(239, 68, 68, 0.35)'
                }}>
                  <CalendarDays size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                    Kalender Agenda Kegiatan & Hari Libur Kantor BRMP DIY
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#b91c1c', margin: '3px 0 0' }}>
                    Sinkronisasi otomatis dengan mesin presensi geofence & jadwal kedinasan resmi Balai
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#ffffff', color: '#991b1b', padding: '6px 14px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                  ✓ Mesin Presensi Otomatis Libur
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
            {/* Left: Agenda Kegiatan Mendatang */}
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Agenda Rapat & Dinas Terjadwal</span>
                <span style={{ fontSize: '0.78rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  4 Agenda
                </span>
              </div>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    tanggal: 'Senin, 07:30 WIB',
                    judul: 'Apel Pagi & Pengarahan Mingguan',
                    lokasi: 'Halaman Depan Kantor BRMP DIY',
                    peserta: 'Seluruh Pegawai ASN & PPNPN',
                    status: 'Rutin'
                  },
                  {
                    tanggal: 'Rabu, 09:00 WIB',
                    judul: 'Rapat Koordinasi Penataan Standar Pertanian',
                    lokasi: 'Ruang Rapat Utama / Hybrid Zoom',
                    peserta: 'Tim Kerja & Pejabat Fungsional',
                    status: 'Penting'
                  },
                  {
                    tanggal: 'Kamis, 13:00 WIB',
                    judul: 'Evaluasi Capaian Kinerja Triwulan III',
                    lokasi: 'Ruang Sidang Lt. 2',
                    peserta: 'Kobag TU, Ketimker, & Admin',
                    status: 'Monev'
                  },
                  {
                    tanggal: 'Jumat, 08:30 WIB',
                    judul: 'Bimtek Verifikasi SPT & E-Kinerja BRMP',
                    lokasi: 'Laboratorium Standardisasi',
                    peserta: 'Staf Administrasi & Tim IT',
                    status: 'Bimtek'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                        📅 {item.tanggal}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        background: item.status === 'Penting' ? '#fee2e2' : item.status === 'Monev' ? '#e0f2fe' : '#f1f5f9',
                        color: item.status === 'Penting' ? '#b91c1c' : item.status === 'Monev' ? '#0369a1' : '#475569'
                      }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      {item.judul}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      📍 {item.lokasi} • 👥 {item.peserta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Kalender Libur Nasional & Cuti Bersama */}
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Daftar Hari Libur Nasional & Cuti Bersama Resmi (SKB 3 Menteri)</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tahun 2025/2026</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Hari</th>
                      <th>Keterangan Hari Libur / Cuti</th>
                      <th>Kategori</th>
                      <th>Status Mesin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tgl: '1 Januari', hari: 'Rabu', nama: 'Tahun Baru 2025 Masehi', jenis: 'Libur Nasional' },
                      { tgl: '27 Januari', hari: 'Senin', nama: 'Isra Mikraj Nabi Muhammad SAW', jenis: 'Libur Nasional' },
                      { tgl: '29 Januari', hari: 'Rabu', nama: 'Tahun Baru Imlek 2576 Kongzili', jenis: 'Libur Nasional' },
                      { tgl: '29 Maret', hari: 'Sabtu', nama: 'Hari Suci Nyepi (Tahun Baru Saka 1947)', jenis: 'Libur Nasional' },
                      { tgl: '31 Mar - 1 Apr', hari: 'Senin - Selasa', nama: 'Hari Raya Idul Fitri 1446 Hijriah', jenis: 'Libur Nasional' },
                      { tgl: '2 - 7 April', hari: 'Rabu - Senin', nama: 'Cuti Bersama Hari Raya Idul Fitri', jenis: 'Cuti Bersama' },
                      { tgl: '1 Mei', hari: 'Kamis', nama: 'Hari Buruh Internasional', jenis: 'Libur Nasional' },
                      { tgl: '29 Mei', hari: 'Kamis', nama: 'Kenaikan Yesus Kristus', jenis: 'Libur Nasional' },
                      { tgl: '1 Juni', hari: 'Minggu', nama: 'Hari Lahir Pancasila', jenis: 'Libur Nasional' },
                      { tgl: '6 Juni', hari: 'Jumat', nama: 'Hari Raya Idul Adha 1446 Hijriah', jenis: 'Libur Nasional' },
                      { tgl: '27 Juni', hari: 'Jumat', nama: 'Tahun Baru Islam 1447 Hijriah', jenis: 'Libur Nasional' },
                      { tgl: '17 Agustus', hari: 'Minggu', nama: 'Proklamasi Kemerdekaan RI ke-80', jenis: 'Libur Nasional' },
                      { tgl: '5 September', hari: 'Jumat', nama: 'Maulid Nabi Muhammad SAW', jenis: 'Libur Nasional' },
                      { tgl: '25 Desember', hari: 'Kamis', nama: 'Kelahiran Yesus Kristus (Hari Raya Natal)', jenis: 'Libur Nasional' },
                      { tgl: '26 Desember', hari: 'Jumat', nama: 'Cuti Bersama Hari Raya Natal', jenis: 'Cuti Bersama' }
                    ].map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{item.tgl}</td>
                        <td style={{ color: '#475569' }}>{item.hari}</td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{item.nama}</td>
                        <td>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: item.jenis === 'Libur Nasional' ? '#fee2e2' : '#fef3c7',
                            color: item.jenis === 'Libur Nasional' ? '#dc2626' : '#d97706'
                          }}>
                            {item.jenis}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>
                            ✓ Standby / Off
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB G: PENGATURAN INSTANSI */}
      {activeTab === 'pengaturan' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Konfigurasi Instansi & Parameter Geofence GPS</span>
          </div>

          <form onSubmit={handleSaveSettings} style={{ padding: '2rem', maxWidth: '700px' }}>
            <div className="admin-form-group">
              <label>Nama Satuan Kerja / Balai</label>
              <input 
                type="text" 
                className="admin-form-input"
                value={settingsData?.namaBalai || ''}
                onChange={(e) => setSettingsData({ ...settingsData, namaBalai: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-form-group">
                <label>Lokasi Geofence Kantor</label>
                <input 
                  type="text" 
                  className="admin-form-input"
                  value={settingsData?.lokasiKantor || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, lokasiKantor: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Radius Toleransi GPS (Meter)</label>
                <input 
                  type="number" 
                  className="admin-form-input"
                  value={settingsData?.radiusGps || 200}
                  onChange={(e) => setSettingsData({ ...settingsData, radiusGps: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-form-group">
                <label>Jam Masuk Kantor</label>
                <input 
                  type="text" 
                  className="admin-form-input"
                  value={settingsData?.jamMasuk || '07:30:00'}
                  onChange={(e) => setSettingsData({ ...settingsData, jamMasuk: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Jam Pulang Kantor</label>
                <input 
                  type="text" 
                  className="admin-form-input"
                  value={settingsData?.jamPulang || '16:00:00'}
                  onChange={(e) => setSettingsData({ ...settingsData, jamPulang: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Nama Kepala Balai</label>
              <input 
                type="text" 
                className="admin-form-input"
                value={settingsData?.kepalaBalai || ''}
                onChange={(e) => setSettingsData({ ...settingsData, kepalaBalai: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-admin-add" style={{ marginTop: '1rem' }}>
              <CheckCircle2 size={16} />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </form>
        </div>
      )}

      {/* 6. MODAL TAMBAH PEGAWAI BARU */}
      {showAddModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Tambah Pegawai Baru ke Master Data
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewUser}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>NIP Pegawai (Wajib)</label>
                    <input 
                      type="text" 
                      required 
                      className="admin-form-input"
                      placeholder="18 Digit NIP..."
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>PIN Mesin Fingerprint</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      placeholder="Contoh: 116"
                      value={formData.pinMesin}
                      onChange={(e) => setFormData({ ...formData, pinMesin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Nama Lengkap & Gelar (Wajib)</label>
                  <input 
                    type="text" 
                    required 
                    className="admin-form-input"
                    placeholder="Contoh: Budi Santoso, S.TP"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Jabatan Kedinasan</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Golongan / Ruang</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      placeholder="III/a, IV/b..."
                      value={formData.golongan}
                      onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Tim Kerja / Unit Organisasi</label>
                  <select 
                    className="admin-form-select"
                    value={formData.divisi}
                    onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                  >
                    <option value="Tim Kerja Pengelolaan Sumber Daya Manusia">Tim Kerja Pengelolaan Sumber Daya Manusia</option>
                    <option value="Tim Kerja Tata Usaha dan Rumah Tangga">Tim Kerja Tata Usaha dan Rumah Tangga</option>
                    <option value="Tim Kerja Program dan Evaluasi">Tim Kerja Program dan Evaluasi</option>
                    <option value="Tim Kerja Diseminasi Standar Instrumen Pertanian">Tim Kerja Diseminasi Standar Instrumen Pertanian</option>
                    <option value="Tim Kerja Pengujian dan Sertifikasi Mutu">Tim Kerja Pengujian dan Sertifikasi Mutu</option>
                    <option value="Balai Penerapan Modernisasi Pertanian DIY">Balai Penerapan Modernisasi Pertanian DIY (Umum)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Hak Akses Sistem</label>
                    <select 
                      className="admin-form-select"
                      value={formData.systemRole}
                      onChange={(e) => setFormData({ ...formData, systemRole: e.target.value })}
                    >
                      <option value="pegawai">Pegawai / Staf</option>
                      <option value="admin">Administrator Sistem</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Peran Verifikasi (Approval)</label>
                    <select 
                      className="admin-form-select"
                      value={formData.approvalRole}
                      onChange={(e) => setFormData({ ...formData, approvalRole: e.target.value })}
                    >
                      <option value="pemohon">Pemohon (Pegawai)</option>
                      <option value="verifikator_1">Verifikator 1 (Ketua Tim Kerja)</option>
                      <option value="verifikator_2">Verifikator 2 (Kepala Bagian TU)</option>
                      <option value="admin">Super Admin Kepegawaian</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="btn-admin-export"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-admin-add">
                  <Plus size={16} />
                  <span>Simpan Pegawai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL EDIT PEGAWAI */}
      {showEditModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Edit Data Pegawai: {selectedUser?.nama}
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser}>
              <div className="admin-modal-body">
                {/* Photo & Avatar Section */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    color: '#ffffff',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {formData.fotoProfil ? (
                      <img src={formData.fotoProfil} alt={formData.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{(formData.nama || 'P').charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      Foto Profil Pegawai
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                      Format JPG/PNG/WEBP maks 10MB (otomatis dikompresi optimal & sinkron ke seluruh modul).
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleEditPhotoChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#047857',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Camera size={14} />
                        <span>{uploadingPhoto ? 'Memproses...' : formData.fotoProfil ? 'Ganti Foto' : 'Unggah Foto'}</span>
                      </button>

                      {formData.fotoProfil && (
                        <button 
                          type="button"
                          onClick={handleRemoveEditPhoto}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Hapus Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>NIP Pegawai</label>
                    <input 
                      type="text" 
                      disabled
                      className="admin-form-input"
                      style={{ background: '#f1f5f9' }}
                      value={formData.nip}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>PIN Mesin Fingerprint</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={formData.pinMesin}
                      onChange={(e) => setFormData({ ...formData, pinMesin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Nama Lengkap & Gelar</label>
                  <input 
                    type="text" 
                    required 
                    className="admin-form-input"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Jabatan Kedinasan</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Golongan / Ruang</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={formData.golongan}
                      onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Tim Kerja / Divisi</label>
                  <input 
                    type="text" 
                    className="admin-form-input"
                    value={formData.divisi}
                    onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                  />
                </div>

                {/* Contact Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Nomor HP / WhatsApp</label>
                    <input 
                      type="text" 
                      placeholder="0812-xxxx-xxxx"
                      className="admin-form-input"
                      value={formData.noHp}
                      onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Email Kedinasan</label>
                    <input 
                      type="email" 
                      placeholder="pegawai@pertanian.go.id"
                      className="admin-form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Alamat Domisili</label>
                  <input 
                    type="text" 
                    placeholder="Alamat lengkap tempat tinggal"
                    className="admin-form-input"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Hak Akses Sistem</label>
                    <select 
                      className="admin-form-select"
                      value={formData.systemRole}
                      onChange={(e) => setFormData({ ...formData, systemRole: e.target.value })}
                    >
                      <option value="pegawai">Pegawai / Staf</option>
                      <option value="admin">Administrator Sistem</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Peran Approval Cuti</label>
                    <select 
                      className="admin-form-select"
                      value={formData.approvalRole}
                      onChange={(e) => setFormData({ ...formData, approvalRole: e.target.value })}
                    >
                      <option value="pemohon">Pemohon (Pegawai)</option>
                      <option value="verifikator_1">Verifikator 1 (Ketua Tim)</option>
                      <option value="verifikator_2">Verifikator 2 (Kobag TU)</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Sisa Cuti (Hari)</label>
                    <input 
                      type="number"
                      min="0"
                      max="30"
                      className="admin-form-input"
                      value={formData.sisaCuti}
                      onChange={(e) => setFormData({ ...formData, sisaCuti: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="btn-admin-export"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-admin-add">
                  <CheckCircle2 size={16} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL PENGATURAN BALAI */}
      {showSettingsModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Pengaturan Parameter Balai & Geofence GPS
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nama Satuan Kerja Balai</label>
                  <input 
                    type="text" 
                    className="admin-form-input"
                    value={settingsData?.namaBalai || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, namaBalai: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Wilayah Titik Pusat GPS</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={settingsData?.lokasiKantor || 'Kotagede'}
                      onChange={(e) => setSettingsData({ ...settingsData, lokasiKantor: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Radius Geofence (Meter)</label>
                    <input 
                      type="number" 
                      className="admin-form-input"
                      value={settingsData?.radiusGps || 200}
                      onChange={(e) => setSettingsData({ ...settingsData, radiusGps: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Jam Masuk Kerja</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={settingsData?.jamMasuk || '07:30:00'}
                      onChange={(e) => setSettingsData({ ...settingsData, jamMasuk: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Jam Pulang Kerja</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={settingsData?.jamPulang || '16:00:00'}
                      onChange={(e) => setSettingsData({ ...settingsData, jamPulang: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="btn-admin-export"
                  onClick={() => setShowSettingsModal(false)}
                >
                  Tutup
                </button>
                <button type="submit" className="btn-admin-add">
                  <CheckCircle2 size={16} />
                  <span>Simpan Konfigurasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
