import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  Cpu, 
  Activity, 
  Wifi, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Terminal,
  Play,
  ArrowRight,
  ShieldCheck,
  Server,
  Search,
  Filter,
  Users
} from 'lucide-react';

export default function AdmsMonitor({ user }) {
  const [machines, setMachines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Check if current logged-in user is an Administrator
  const isAdmin = 
    user?.systemRole === 'admin' || 
    user?.role === 'admin' || 
    user?.approvalRole === 'admin' || 
    user?.nip === '198001012005011001';

  // Filters (for Admin mode)
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulator states (for Pegawai: locked to user.nip; for Admin: selectable)
  const [simPin, setSimPin] = useState(user?.nip || '199808062014032001');
  const [simStatus, setSimStatus] = useState('Masuk');

  const defaultEmployees = [
    { nip: "199808062014032001", nama: "AGNITA VERDIANI PUTRI, A.Md." },
    { nip: "198906012015032004", nama: "Devi Eka Nuvitasari, S.H." },
    { nip: "198604092011012024", nama: "Dwi Dinia Rahayu, S.Kom, M.T.I" },
    { nip: "198101312009121004", nama: "Agung Ariyanto, SEI., M.Ec., Dev." }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, lRes] = await Promise.all([
        apiService.getAdmsMachines(),
        apiService.getAdmsLogs(user?.nip || '', isAdmin ? 'admin' : 'pegawai')
      ]);
      setMachines(mRes || []);
      setLogs(lRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll every 8 seconds for new logs from machine
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [user?.nip, isAdmin]);

  // Load employee list for Admin dropdown
  useEffect(() => {
    if (isAdmin) {
      apiService.getUsers().then(res => {
        if (res && res.length > 0) setAllUsers(res);
      }).catch(() => {});
    }
  }, [isAdmin]);

  // Keep simulator PIN synced when user changes
  useEffect(() => {
    if (!isAdmin && user?.nip) {
      setSimPin(user.nip);
    }
  }, [user?.nip, isAdmin]);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSimLoading(true);

    try {
      const res = await apiService.simulateAdmsScan({
        pin: simPin,
        statusAbsen: simStatus
      });

      if (res.success) {
        setSuccessMsg(res.message);
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirim simulasi tap mesin.');
    } finally {
      setSimLoading(false);
    }
  };

  // Filter logs strictly: Regular employees only see their own logs; Admin can see all with filters
  const displayedLogs = (logs || []).filter(item => {
    if (!isAdmin) {
      const uNip = String(user?.nip || '').trim();
      const uPin = String(user?.pinMesin || '').trim();
      const uNama = String(user?.nama || '').toLowerCase().trim();
      const lPin = String(item.pin || '').trim();
      const lNama = String(item.nama || '').toLowerCase().trim();

      const matchNip = uNip && (lPin === uNip || (lPin.length >= 10 && lPin.includes(uNip)));
      const matchPin = uPin && (lPin === uPin);
      const matchNama = uNama && (lNama === uNama || lNama.includes(uNama));

      return matchNip || matchPin || matchNama;
    }

    // Admin filters
    if (filterEmployee !== 'all') {
      const lPin = String(item.pin || '').trim();
      if (lPin !== filterEmployee && !lPin.includes(filterEmployee)) return false;
    }

    if (filterStatus !== 'all') {
      if (item.statusAbsen !== filterStatus) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchN = String(item.nama || '').toLowerCase().includes(q);
      const matchP = String(item.pin || '').toLowerCase().includes(q);
      const matchS = String(item.sn || '').toLowerCase().includes(q);
      if (!matchN && !matchP && !matchS) return false;
    }

    return true;
  });


  return (
    <div>
      {/* Breadcrumb banner */}
      <div className="breadcrumb-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="breadcrumb-title">
              <Cpu size={24} className="text-blue-600" />
              <span>Monitoring Integrasi Mesin Absensi (ADMS)</span>
            </h1>
            <div className="breadcrumb-path">
              <span>KITA BRMP DIY</span>
              <span>/</span>
              <span>Info Absensi</span>
              <span>/</span>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>Protokol ADMS Cloud</span>
            </div>
          </div>

          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8rem',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan Log</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #86efac',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Status Mesin & Simulator */}
      <div className="adms-grid">
        
        {/* Left: Info Konfigurasi Mesin di Kantor */}
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <Server size={20} className="text-blue-600" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
              Pengaturan di Mesin Absensi
            </h3>
          </div>

          <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
            Masukkan parameter ini ke menu <strong>Cloud Server Setting / ADMS</strong> pada mesin ZKTeco / Solution kantor Anda:
          </p>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Cloud Server:</span>
              <strong style={{ color: '#15803d' }}>ENABLE / AKTIF</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Server IP / Host:</span>
              <code style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>IP Komputer Ini / Domain</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Server Port:</span>
              <code style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>5000</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Target URL Jalur:</span>
              <strong style={{ color: '#2563eb' }}>/iclock/cdata</strong>
            </div>
          </div>

          {/* Connected Machines List */}
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            Mesin yang Terdeteksi:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {machines.map((m, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{m.namaMesin}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>SN: {m.sn} | IP: {m.ip}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Sync Terakhir: {m.lastSync}</div>
                </div>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 800 }}>
                  ● {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Simulator Tap Absensi Mesin */}
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <Activity size={20} className="text-emerald-600" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
              Simulator Scan Mesin (Uji Coba Langsung)
            </h3>
          </div>

          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#64748b' }}>
            Anda dapat mensimulasikan tap sidik jari pegawai seolah-olah mesin fisik sedang mengirim data log absensi ke server:
          </p>

          <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Pegawai yang Scan</label>
              {!isAdmin ? (
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{user?.nama || 'Pegawai BRMP'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NIP: {user?.nip} &bull; PIN Mesin: {user?.pinMesin || '-'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} />
                    <span>Simulasi terkunci khusus untuk akun Anda sendiri</span>
                  </div>
                </div>
              ) : (
                <select
                  className="form-input"
                  value={simPin}
                  onChange={(e) => setSimPin(e.target.value)}
                  style={{ height: '42px' }}
                >
                  {(allUsers.length > 0 ? allUsers : defaultEmployees).map(p => (
                    <option key={p.nip || p.id} value={p.nip}>{p.nama} ({p.nip})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Status Scan</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="simStatus"
                    value="Masuk"
                    checked={simStatus === 'Masuk'}
                    onChange={() => setSimStatus('Masuk')}
                  />
                  <span>Absen Masuk (Check-In)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="simStatus"
                    value="Pulang"
                    checked={simStatus === 'Pulang'}
                    onChange={() => setSimStatus('Pulang')}
                  />
                  <span>Absen Pulang (Check-Out)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={simLoading}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '0.5rem',
                boxShadow: '0 4px 10px rgba(16,185,129,0.25)'
              }}
            >
              <Play size={16} />
              <span>{simLoading ? 'Mengirim Data...' : 'Kirim Simulasi Tap Mesin ADMS'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Tabel Log Absensi Real-time dari Mesin */}
      <div className="brmp-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} className="text-blue-600" />
              <span>
                {isAdmin ? 'Log Riwayat Scan Mesin ADMS (Seluruh Pegawai)' : 'Log Riwayat Presensi Pribadi Anda'}
              </span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
              {isAdmin 
                ? 'Mode Administrator: Memantau dan mengaudit seluruh catatan kehadiran pegawai dari mesin fingerprint kantor'
                : `Hanya menampilkan catatan scan absensi untuk akun Anda: ${user?.nama || 'Pegawai'} (NIP: ${user?.nip})`
              }
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAdmin ? (
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={14} />
                <span>Mode Admin ({displayedLogs.length} Data)</span>
              </span>
            ) : (
              <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <UserCheck size={14} />
                <span>{displayedLogs.length} Riwayat Scan Anda</span>
              </span>
            )}
          </div>
        </div>

        {/* Admin Filter Controls Toolbar */}
        {isAdmin && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              <Filter size={15} className="text-blue-600" />
              <span>Filter Data:</span>
            </div>

            {/* Filter by Pegawai */}
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff',
                minWidth: '200px'
              }}
            >
              <option value="all">Semua Pegawai ({logs.length} Log)</option>
              {(allUsers.length > 0 ? allUsers : defaultEmployees).map(p => (
                <option key={p.nip || p.id} value={p.nip}>{p.nama} ({p.nip})</option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff'
              }}
            >
              <option value="all">Semua Status (Masuk & Pulang)</option>
              <option value="Masuk">Masuk Saja</option>
              <option value="Pulang">Pulang Saja</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Cari nama pegawai, NIP, atau SN mesin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  background: '#ffffff'
                }}
              />
            </div>

            {(filterEmployee !== 'all' || filterStatus !== 'all' || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => { setFilterEmployee('all'); setFilterStatus('all'); setSearchQuery(''); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '0.78rem',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {/* Regular Pegawai Banner */}
        {!isAdmin && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <UserCheck size={16} />
            <span>
              Privasi aktif: Hanya Anda (<strong>{user?.nama}</strong>) dan Administrator Kepegawaian yang memiliki izin melihat riwayat kehadiran ini.
            </span>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="brmp-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>NO</th>
                <th>PEGAWAI</th>
                <th>TANGGAL & JAM SCAN</th>
                <th>STATUS ABSEN</th>
                <th>KETERANGAN KEDINASAN</th>
                <th>SERIAL NUMBER MESIN</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                    <Clock size={36} style={{ margin: '0 auto 10px auto', color: '#94a3b8', display: 'block' }} />
                    <strong style={{ fontSize: '0.95rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                      {isAdmin 
                        ? 'Tidak ada data log yang cocok dengan filter pencarian.' 
                        : 'Belum Ada Catatan Log Scan untuk Akun Anda'
                      }
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {isAdmin 
                        ? 'Silakan coba ubah pilihan filter pegawai, status, atau kata kunci pencarian.'
                        : `Catatan scan kehadiran Anda (NIP: ${user?.nip}) akan otomatis terekam setelah Anda tap sidik jari / scan wajah di mesin kantor, atau Anda dapat menggunakan simulator di atas untuk uji coba.`
                      }
                    </span>
                  </td>
                </tr>
              ) : (
                displayedLogs.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{item.nama}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NIP: {item.pin}</div>
                      <div style={{ fontSize: '0.7rem', color: '#2563eb' }}>{item.jabatan}</div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{item.jam}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.tanggal}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: item.statusAbsen === 'Masuk' ? '#dcfce7' : '#e0e7ff',
                        color: item.statusAbsen === 'Masuk' ? '#15803d' : '#4338ca'
                      }}>
                        {item.statusAbsen === 'Masuk' ? '✓ Masuk' : '→ Pulang'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.keterangan?.includes('Terlambat') ? '#b91c1c' : '#15803d' }}>
                        {item.keterangan}
                      </span>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#475569' }}>
                        {item.sn}
                      </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

