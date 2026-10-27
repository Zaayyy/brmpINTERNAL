import React, { useState } from 'react';
import { apiService } from '../services/api';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  LogIn, 
  CheckCircle2, 
  Cpu, 
  Users, 
  FileCheck2,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Username / NIP dan Password Administrator wajib diisi.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiService.login(username.trim(), password);
      if (res && res.success && res.data) {
        const userData = res.data;
        // Strictly verify that this user has Administrator privilege
        const isAdmin = 
          userData.systemRole === 'admin' || 
          userData.role === 'admin' || 
          userData.nip === '198001012005011001' || 
          userData.id === 'PEG-ADM' ||
          username.trim().toLowerCase() === 'admin';

        if (!isAdmin) {
          setError('Akses Ditolak: Akun Anda (' + (userData.nama || username) + ') bukan Administrator SI-AP. Portal ini khusus untuk Administrator Kepegawaian.');
          setLoading(false);
          return;
        }

        // Merge role properties ensuring full admin rights
        const adminUser = {
          ...userData,
          systemRole: 'admin',
          approvalRole: 'admin',
          role: 'admin',
          roleLabel: 'Administrator Sistem SI-AP (Superadmin)'
        };

        if (rememberMe) {
          localStorage.setItem('brmp_admin_remember', 'true');
        }

        onLoginSuccess(adminUser);
      } else {
        setError(res?.message || 'Login admin gagal. Periksa username dan password.');
      }
    } catch (err) {
      setError(err.message || 'Gagal menghubungi server autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top left, #064e3b 0%, #043d2e 45%, #022c22 85%, #011f18 100%)',
        padding: '1.5rem',
        boxSizing: 'border-box',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Modern Split-Card Container (Matching BRMP DIY Official Reference) */}
      <div 
        style={{
          width: '100%',
          maxWidth: '920px',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          minHeight: '560px'
        }}
        className="admin-split-card"
      >
        {/* LEFT PANEL: Deep Emerald Green Branding & Showcase */}
        <div 
          style={{
            flex: '1 1 48%',
            background: 'linear-gradient(155deg, #064e3b 0%, #065f46 50%, #047857 100%)',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle decorative circles in background */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-40px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0) 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top Organization Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: '#d1fae5',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
              BRMP DIY • AGRO MODERN
            </span>
          </div>

          {/* Center Brand Identity with Ministry Gold Emblem */}
          <div style={{ margin: '2rem 0', textAlign: 'center', zIndex: 2 }}>
            <div 
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fef08a 0%, #fde047 60%, #eab308 100%)',
                border: '4px solid #fef9c3',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35), 0 0 20px rgba(234, 179, 8, 0.4)',
                overflow: 'hidden'
              }}
            >
              <img 
                src="/logo-kementan.png" 
                alt="Logo BRMP DIY" 
                style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <h1 style={{ 
              fontSize: '1.9rem', 
              fontWeight: 900, 
              color: '#ffffff', 
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}>
              Portal Administrator
            </h1>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#a7f3d0',
              marginBottom: '12px',
              letterSpacing: '0.02em'
            }}>
              SI-AP BRMP DIY
            </div>

            <p style={{ 
              fontSize: '0.85rem', 
              color: '#d1fae5', 
              margin: '0 auto', 
              maxWidth: '320px',
              lineHeight: 1.6,
              opacity: 0.95
            }}>
              Sistem tata kelola master data 115 pegawai, integrasi mesin fingerprint ADMS, dan operasional administrasi terpadu.
            </p>
          </div>

          {/* Bottom Feature Badges (Matching Screenshot 1) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            zIndex: 2
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '10px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Cpu size={12} /> Aktif
              </div>
              <div style={{ fontSize: '0.68rem', color: '#e2e8f0', marginTop: '2px', fontWeight: 600 }}>
                Mesin ADMS
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '10px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Users size={12} /> Real-Time
              </div>
              <div style={{ fontSize: '0.68rem', color: '#e2e8f0', marginTop: '2px', fontWeight: 600 }}>
                115 Pegawai
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '10px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <FileCheck2 size={12} /> Terpadu
              </div>
              <div style={{ fontSize: '0.68rem', color: '#e2e8f0', marginTop: '2px', fontWeight: 600 }}>
                Cuti & SPT
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Dedicated White Clean Admin Form */}
        <div 
          style={{
            flex: '1 1 52%',
            padding: '3.5rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#ffffff'
          }}
        >
          {/* Badge Access Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
              AKSES KHUSUS PETUGAS & ADMIN
            </span>

            <h2 style={{
              fontSize: '1.85rem',
              fontWeight: 900,
              color: '#0f172a',
              margin: '12px 0 6px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              Selamat datang kembali
            </h2>
            <p style={{
              fontSize: '0.85rem',
              color: '#64748b',
              margin: 0,
              lineHeight: 1.5
            }}>
              Masuk untuk mengelola data pegawai, persetujuan cuti, mesin absensi, dan pengaturan sistem SI-AP.
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div 
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: 1.4
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.15rem' }}>
              <label 
                htmlFor="admin-username"
                style={{ 
                  display: 'block', 
                  fontSize: '0.82rem', 
                  fontWeight: 700, 
                  color: '#334155', 
                  marginBottom: '6px' 
                }}
              >
                Username / NIP Administrator
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-username"
                  type="text"
                  placeholder="admin atau 198001012005011001"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'all 0.2s',
                    background: '#f8fafc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#059669';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.background = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label 
                htmlFor="admin-password"
                style={{ 
                  display: 'block', 
                  fontSize: '0.82rem', 
                  fontWeight: 700, 
                  color: '#334155', 
                  marginBottom: '6px' 
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'all 0.2s',
                    background: '#f8fafc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#059669';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.background = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              fontSize: '0.82rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#059669', width: '15px', height: '15px' }} 
                />
                Ingat saya
              </label>

              <button
                type="button"
                onClick={() => alert('Untuk reset akun administrator SI-AP, silakan hubungi tim IT/Kepegawaian Balai.')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Lupa password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                background: loading 
                  ? '#94a3b8' 
                  : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <span>Memverifikasi Administrator...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard Admin</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Notice */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '0.74rem',
            color: '#94a3b8',
            lineHeight: 1.5
          }}>
            Portal Rahasia Administrator SI-AP BRMP DIY.<br />
            Hak akses dibatasi ketat berdasarkan wewenang kepegawaian.
            <div style={{ marginTop: '10px' }}>
              <a 
                href="/" 
                onClick={(e) => {
                  e.preventDefault();
                  if (window.history.pushState) {
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new Event('popstate'));
                  } else {
                    window.location.href = '/';
                  }
                }}
                style={{
                  color: '#059669',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#ecfdf5',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#d1fae5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ecfdf5'}
              >
                ← Kembali ke Portal Presensi Pegawai
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
