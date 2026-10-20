import React, { useState } from 'react';
import { apiService } from '../services/api';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  LogIn, 
  CheckCircle2 
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await executeLogin(username, password);
  };

  const executeLogin = async (usr, pwd) => {
    setError('');
    setLoading(true);

    try {
      const res = await apiService.login(usr, pwd);
      if (res.success) {
        onLoginSuccess(res.data);
      } else {
        setError(res.message || 'Login gagal, periksa NIP dan password.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menghubungi server.');
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 40%, #10b981 0%, #059669 45%, #047857 85%, #064e3b 100%)',
        padding: '1.5rem',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* Centered Floating White Login Card */}
      <div 
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem 2.25rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Header Logo (Emblem Kementan + BRMP DIY) */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px', 
            marginBottom: '0.75rem' 
          }}
        >
          {/* Circular Gold/Green Kementan Emblem */}
          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#fef08a',
              border: '2.5px solid #eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(234, 179, 8, 0.3)',
              overflow: 'hidden'
            }}
          >
            <img 
              src="/logo-kementan.png" 
              alt="Logo BRMP" 
              style={{ width: '82%', height: '82%', objectFit: 'contain' }}
              onError={(e) => {
                // Fallback SVG icon if png is missing
                e.target.style.display = 'none';
              }} 
            />
          </div>

          {/* Typography BRMP DIY */}
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span 
              style={{ 
                fontSize: '1.75rem', 
                fontWeight: 900, 
                color: '#064e3b', 
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-sans)'
              }}
            >
              BRMP
            </span>
            <span 
              style={{ 
                fontSize: '0.82rem', 
                fontWeight: 800, 
                color: '#2563eb', 
                letterSpacing: '0.12em',
                marginTop: '1px'
              }}
            >
              DIY
            </span>
          </div>
        </div>

        {/* Subtitle "Internal Login" */}
        <h2 
          style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            color: '#475569',
            textAlign: 'center',
            marginBottom: '2rem',
            letterSpacing: '0.01em'
          }}
        >
          Internal Login
        </h2>

        {/* Error Alert Box */}
        {error && (
          <div 
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form with Underline Inputs matching image */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* NIP Field */}
          <div>
            <label 
              style={{
                display: 'block',
                fontSize: '0.78rem',
                color: '#64748b',
                fontWeight: 600,
                marginBottom: '4px'
              }}
            >
              Nomor Induk Pegawai (NIP)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan 18 Digit NIP"
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1.5px solid #cbd5e1',
                borderRadius: '0',
                padding: '8px 2px',
                fontSize: '0.95rem',
                color: '#1e293b',
                fontWeight: 500,
                outline: 'none',
                background: 'transparent',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderBottomColor = '#059669';
                e.target.style.boxShadow = '0 1px 0 0 #059669';
              }}
              onBlur={(e) => {
                e.target.style.borderBottomColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ position: 'relative' }}>
            <label 
              style={{
                display: 'block',
                fontSize: '0.78rem',
                color: '#64748b',
                fontWeight: 600,
                marginBottom: '4px'
              }}
            >
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1.5px solid #cbd5e1',
                  borderRadius: '0',
                  padding: '8px 30px 8px 2px',
                  fontSize: '0.95rem',
                  color: '#1e293b',
                  fontWeight: 500,
                  outline: 'none',
                  background: 'transparent',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderBottomColor = '#059669';
                  e.target.style.boxShadow = '0 1px 0 0 #059669';
                }}
                onBlur={(e) => {
                  e.target.style.borderBottomColor = '#cbd5e1';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '2px',
                  bottom: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Signin Button (Enhanced Edges, Crisp Border & High Contrast Elevation) */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '12px 20px',
              background: 'linear-gradient(180deg, #059669 0%, #047857 50%, #064e3b 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              borderRadius: '10px',
              border: '2px solid #064e3b', // Sisi button diperjelas dan tegas
              outline: '1px solid rgba(255, 255, 255, 0.2)', // Double stroke highlight
              boxShadow: '0 4px 12px rgba(6, 78, 59, 0.35), 0 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(180deg, #047857 0%, #064e3b 100%)';
                e.currentTarget.style.borderColor = '#022c22';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(6, 78, 59, 0.45), 0 4px 6px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(180deg, #059669 0%, #047857 50%, #064e3b 100%)';
                e.currentTarget.style.borderColor = '#064e3b';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 78, 59, 0.35), 0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(1px)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(6, 78, 59, 0.3)';
              }
            }}
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <span>Signin</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer Branding Text */}
      <div 
        style={{
          marginTop: '1.5rem',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.85)',
          textAlign: 'center',
          letterSpacing: '0.02em',
          fontWeight: 600
        }}
      >
        Balai Besar Modernisasi Pertanian Daerah Istimewa Yogyakarta
      </div>
    </div>
  );
}
