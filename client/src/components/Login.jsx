import React, { useState } from 'react';
import { apiService } from '../services/api';
import { 
  ShieldCheck, 
  LogIn, 
  AlertCircle, 
  KeyRound, 
  User, 
  CheckCircle2, 
  UserCheck, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 6 Demo Accounts for testing each specific official role
  const demoAccounts = [
    {
      roleTag: "SUPER ADMIN",
      title: "Administrator Kepegawaian",
      desc: "Superadmin sistem, pantau cuti, ADMS & supervisi semua modul",
      nip: "admin",
      pass: "admin",
      badgeColor: "#dc2626",
      badgeBg: "#fee2e2",
      borderColor: "#fca5a5"
    },
    {
      roleTag: "ADMIN SEKRETARIAT",
      title: "Novita Widiyanti, A.Md",
      desc: "Tata persuratan, penomoran resmi SPT, konsiderans menimbang & dasar",
      nip: "199111042023212041",
      pass: "1991",
      badgeColor: "#0284c7",
      badgeBg: "#e0f2fe",
      borderColor: "#7dd3fc"
    },
    {
      roleTag: "KOBAG TU",
      title: "Agung Ariyanto, M.Ec., Dev.",
      desc: "Approval Utama SPT (Tahap 2) & Verifikator 2 Cuti",
      nip: "198101312009121004",
      pass: "1981",
      badgeColor: "#7c3aed",
      badgeBg: "#f3e8ff",
      borderColor: "#d8b4fe"
    },
    {
      roleTag: "KETIMKER",
      title: "Dwi Dinia Rahayu, M.T.I",
      desc: "Approval Unit Kerja SPT (Tahap 1) & Verifikator 1 Cuti",
      nip: "198604092011012024",
      pass: "1986",
      badgeColor: "#2563eb",
      badgeBg: "#dbeafe",
      borderColor: "#93c5fd"
    },
    {
      roleTag: "KOPOKS",
      title: "Dr. Fibrianty, SP, M.Si",
      desc: "Monitoring penugasan & rekapitulasi balai",
      nip: "197402062000032001",
      pass: "1974",
      badgeColor: "#d97706",
      badgeBg: "#fef3c7",
      borderColor: "#fde68a"
    },
    {
      roleTag: "PEMOHON / PEGAWAI",
      title: "Devi Eka Nuvitasari, S.H.",
      desc: "Pengajuan mandiri SPT, tracking & pengajuan cuti",
      nip: "198906012015032004",
      pass: "1989",
      badgeColor: "#16a34a",
      badgeBg: "#dcfce7",
      borderColor: "#86efac"
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doLogin(username, password);
  };

  const doLogin = async (usr, pwd) => {
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

  // Quick 1-click test login
  const handleQuickLogin = (acc) => {
    setUsername(acc.nip);
    setPassword(acc.pass);
    doLogin(acc.nip, acc.pass);
  };

  return (
    <div className="login-screen">
      <div className="login-card-container">
        
        {/* Left Side: Login Form */}
        <div className="login-form-pane">
          {/* Logo BRMP DIY */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                BRMP <span style={{ color: '#2563eb' }}>DIY</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Sistem Kepegawaian Internal
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>
            Login Pegawai
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Masuk dengan NIP/Username untuk mengakses modul cuti
          </p>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Username / NIP</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="admin atau NIP Pegawai"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ paddingLeft: '38px', height: '42px' }}
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="admin atau tahun lahir"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '38px', height: '42px' }}
                />
                <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                height: '44px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>

          <p style={{
            marginTop: '1.25rem',
            fontSize: '0.75rem',
            color: '#64748b',
            textAlign: 'center'
          }}>
            Badan Riset dan Standardisasi Pertanian DIY
          </p>
        </div>

        {/* Right Side: 4 Akun untuk Masing-Masing Role (1-Click Test) */}
        <div className="login-demo-pane">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <Sparkles size={18} className="text-amber-500" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Pilih Akun untuk Pengujian Role
            </h3>
          </div>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#64748b' }}>
            Klik salah satu akun di bawah ini untuk <strong>langsung masuk (1-Click Login)</strong> dan menguji wewenang masing-masing role:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {demoAccounts.map((acc, index) => (
              <div
                key={index}
                onClick={() => handleQuickLogin(acc)}
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${acc.borderColor}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{
                      background: acc.badgeBg,
                      color: acc.badgeColor,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.3px'
                    }}>
                      {acc.roleTag}
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{acc.title}</strong>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {acc.desc}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>
                    User: <code>{acc.nip}</code> | Pass: <code>{acc.pass}</code>
                  </div>
                </div>

                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  flexShrink: 0
                }}>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.25rem', fontSize: '0.75rem', color: '#64748b' }}>
            💡 <em>Di dalam aplikasi nanti, Anda juga bisa mengganti peran kapan saja melalui tombol <strong>"Ganti Peran"</strong> di pojok kanan atas.</em>
          </div>
        </div>

      </div>
    </div>
  );
}
