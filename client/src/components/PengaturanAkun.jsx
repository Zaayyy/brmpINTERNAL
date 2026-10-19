import React, { useState, useRef } from 'react';
import { apiService } from '../services/api';
import { 
  User, 
  KeyRound, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Award, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Eye, 
  EyeOff, 
  Calendar,
  Lock,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

export default function PengaturanAkun({ user, onUpdateUser }) {
  const [activeSubTab, setActiveSubTab] = useState('profil'); // 'profil' | 'keamanan'

  // Photo States
  const [fotoProfil, setFotoProfil] = useState(user?.fotoProfil || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Form States
  const [noHp, setNoHp] = useState(user?.noHp || '0812-3456-7890');
  const [email, setEmail] = useState(user?.email || `${(user?.nama || 'pegawai').toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}@pertanian.go.id`);
  const [alamat, setAlamat] = useState(user?.alamat || 'D.I. Yogyakarta');

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Photo File Upload & Compression
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File yang dipilih harus berupa gambar (JPG, PNG, atau WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 10 MB');
      return;
    }

    setUploadingPhoto(true);
    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = async () => {
        try {
          // Kompresi lewat Canvas ke resolusi optimal 280x280
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

          // Format JPEG berkualitas tinggi dan sangat ringan (< 30KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          // Simpan ke backend
          const res = await apiService.updateProfile({
            nip: user?.nip,
            userId: user?.id,
            fotoProfil: compressedDataUrl
          });

          if (res.success) {
            setFotoProfil(compressedDataUrl);
            const updated = { ...user, fotoProfil: compressedDataUrl };
            if (onUpdateUser) onUpdateUser(updated);
            localStorage.setItem('brmp_user', JSON.stringify(updated));
            setSuccessMsg('Foto profil berhasil diunggah & diperbarui di sistem!');
          } else {
            setErrorMsg(res.message || 'Gagal menyimpan foto profil');
          }
        } catch (err) {
          setErrorMsg('Gagal memproses gambar: ' + (err.message || ''));
        } finally {
          setUploadingPhoto(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.onerror = () => {
        setErrorMsg('Gagal memuat file gambar');
        setUploadingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Profile Photo
  const handleRemovePhoto = async () => {
    if (!window.confirm('Hapus foto profil dan gunakan inisial nama bawaan?')) return;

    setUploadingPhoto(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await apiService.updateProfile({
        nip: user?.nip,
        userId: user?.id,
        fotoProfil: ''
      });

      if (res.success) {
        setFotoProfil('');
        const updated = { ...user, fotoProfil: '' };
        if (onUpdateUser) onUpdateUser(updated);
        localStorage.setItem('brmp_user', JSON.stringify(updated));
        setSuccessMsg('Foto profil berhasil dihapus, menggunakan inisial nama');
      } else {
        setErrorMsg(res.message || 'Gagal menghapus foto profil');
      }
    } catch (err) {
      setErrorMsg('Gagal menghapus foto: ' + (err.message || ''));
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await apiService.updateProfile({
        nip: user?.nip,
        userId: user?.id,
        noHp: noHp.trim(),
        email: email.trim(),
        alamat: alamat.trim()
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Profil berhasil diperbarui!');
        const updated = {
          ...user,
          noHp: noHp.trim(),
          email: email.trim(),
          alamat: alamat.trim()
        };
        if (onUpdateUser) onUpdateUser(updated);
        localStorage.setItem('brmp_user', JSON.stringify(updated));
      } else {
        setErrorMsg(res.message || 'Gagal menyimpan profil');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!newPassword) {
      setErrorMsg('Kata sandi baru tidak boleh kosong');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('Kata sandi baru minimal 4 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi baru');
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.updateProfile({
        nip: user?.nip,
        userId: user?.id,
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim()
      });

      if (res.success) {
        setSuccessMsg('Kata sandi berhasil diperbarui! Silakan gunakan kata sandi baru saat login berikutnya.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.message || 'Gagal mengganti kata sandi');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengganti kata sandi. Pastikan kata sandi lama benar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#2563eb', padding: '6px', borderRadius: '10px', color: '#ffffff', display: 'inline-flex' }}>
            <KeyRound size={22} />
          </div>
          <span>Pengaturan Akun & Profil Pegawai</span>
        </h2>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Kelola informasi kontak pribadi, pantau identitas kepegawaian resmi, dan perbarui kata sandi akun internal Anda.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => { setActiveSubTab('profil'); setSuccessMsg(''); setErrorMsg(''); }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeSubTab === 'profil' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeSubTab === 'profil' ? '#2563eb' : '#64748b',
            fontWeight: activeSubTab === 'profil' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <User size={18} />
          <span>Data Profil & Kontak</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('keamanan'); setSuccessMsg(''); setErrorMsg(''); }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeSubTab === 'keamanan' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeSubTab === 'keamanan' ? '#2563eb' : '#64748b',
            fontWeight: activeSubTab === 'keamanan' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Lock size={18} />
          <span>Keamanan & Ubah Password</span>
        </button>
      </div>

      {/* TAB 1: DATA PROFIL & KONTAK */}
      {activeSubTab === 'profil' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Card Foto Profil Pegawai */}
          <div className="brmp-card" style={{ gridColumn: '1 / -1', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', background: 'linear-gradient(to right, #ffffff, #f8fafc)', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.22)',
                  border: '3px solid #ffffff',
                  outline: '2.5px solid #3b82f6',
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '2rem',
                  fontWeight: 800
                }}>
                  {fotoProfil ? (
                    <img 
                      src={fotoProfil} 
                      alt={user?.nama || "Foto Profil"} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span>
                      {(() => {
                        const parts = (user?.nama || 'Pegawai').trim().split(' ').filter(p => !p.includes('.') && p.length > 1);
                        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
                        return (user?.nama || 'P').charAt(0).toUpperCase();
                      })()}
                    </span>
                  )}
                </div>

                {/* Floating Camera Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Ganti Foto Profil"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                    transition: 'transform 0.15s, background 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Camera size={16} />
                </button>
              </div>

              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Foto Profil Pegawai
                </h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#64748b' }}>
                  {user?.nama || 'Pegawai BRMP'} &bull; NIP: <strong>{user?.nip}</strong>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
                    }}
                  >
                    <Upload size={15} />
                    <span>{uploadingPhoto ? 'Mengunggah & Mengompresi...' : 'Unggah Foto Baru'}</span>
                  </button>

                  {fotoProfil && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={15} />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '340px', background: '#eff6ff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #dbeafe' }}>
              <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} className="text-amber-500" />
                <span>Optimasi Otomatis:</span>
              </div>
              Foto akan otomatis dikompresi agar ringan diakses di HP maupun Laptop, serta langsung sinkron ke Sidebar Navigasi, Navbar, dan Riwayat Presensi.
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
          </div>

          {/* Card Data Kepegawaian Resmi (Read-Only) */}
          <div className="brmp-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 800,
                boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
                flexShrink: 0
              }}>
                {fotoProfil ? (
                  <img src={fotoProfil} alt={user?.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{(user?.nama || 'P').charAt(0)}</span>
                )}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  {user?.nama || 'Pegawai BRMP'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                    PNS / Pegawai Aktif
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {user?.id}
                  </span>
                </div>
              </div>
            </div>


            <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
              Identitas Kepegawaian Resmi
            </h5>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Nomor Induk Pegawai (NIP):</span>
                <strong style={{ color: '#0f172a' }}>{user?.nip}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Pangkat / Golongan:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{user?.golongan || 'III/b'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Jabatan Kedinasan:</span>
                <span style={{ fontWeight: 600, color: '#1e293b', textAlign: 'right', maxWidth: '60%' }}>
                  {user?.jabatan}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Tim Kerja / Unit:</span>
                <span style={{ fontWeight: 600, color: '#1e293b', textAlign: 'right', maxWidth: '60%' }}>
                  {user?.divisi}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Hak Akses Cuti:</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: user?.approvalRole === 'admin' ? '#fee2e2' : user?.approvalRole === 'verifikator_2' ? '#fef3c7' : user?.approvalRole === 'verifikator_1' ? '#e0e7ff' : '#f1f5f9',
                  color: user?.approvalRole === 'admin' ? '#dc2626' : user?.approvalRole === 'verifikator_2' ? '#d97706' : user?.approvalRole === 'verifikator_1' ? '#4338ca' : '#475569'
                }}>
                  {user?.roleLabel || user?.approvalRole}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} className="text-blue-600" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>PIN Mesin Fingerprint:</span>
                </div>
                <strong style={{ fontSize: '0.9rem', color: '#2563eb', background: '#eff6ff', padding: '2px 10px', borderRadius: '6px' }}>
                  {user?.pinMesin || '-'}
                </strong>
              </div>
            </div>
          </div>

          {/* Card Form Kontak & Alamat */}
          <div className="brmp-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} className="text-blue-600" />
              <span>Informasi Kontak & Domisili</span>
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#64748b' }}>
              Data ini digunakan untuk koordinasi kedinasan dan notifikasi surat tugas/cuti.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nomor Telepon / WhatsApp Aktif
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Alamat Email (Kedinasan / Pribadi)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@pertanian.go.id"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Alamat Tempat Tinggal / Domisili
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <textarea
                    rows={3}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Alamat domisili saat ini di D.I. Yogyakarta..."
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                  transition: 'background 0.2s'
                }}
              >
                <Save size={16} />
                <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: KEAMANAN & GANTI KATA SANDI */}
      {activeSubTab === 'keamanan' && (
        <div className="brmp-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              <KeyRound size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Perbarui Kata Sandi Akun
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              Pastikan kata sandi baru Anda aman dan mudah diingat.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#475569' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} className="text-amber-500" />
              <span>Informasi Password Bawaan:</span>
            </div>
            <span>Secara bawaan sistem, kata sandi awal akun Anda adalah <strong>4 digit tahun lahir</strong> (misal: <code>1986</code>, <code>1991</code>, <code>1999</code>) atau <code>admin</code>.</span>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Kata Sandi Saat Ini */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Kata Sandi Lama / Bawaan
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOldPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama atau tahun lahir"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Kata Sandi Baru */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Kata Sandi Baru (Minimal 4 Karakter)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi Baru */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Konfirmasi Kata Sandi Baru
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.75rem',
                padding: '11px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#15803d',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(21,128,61,0.25)',
                transition: 'background 0.2s'
              }}
            >
              <Lock size={16} />
              <span>{loading ? 'Memproses...' : 'Simpan Kata Sandi Baru'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
