import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { CalendarCheck2, Filter, Search, CheckCircle2, Clock, AlertTriangle, XCircle, HeartPulse, UserCheck, ShieldCheck } from 'lucide-react';

export default function AbsensiBulanan({ user }) {
  const [selectedBulan, setSelectedBulan] = useState(6); // Juni
  const [selectedTahun, setSelectedTahun] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [absensiData, setAbsensiData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedNip, setSelectedNip] = useState(user?.nip || '199808062014032001');

  const isAdmin = 
    user?.systemRole === 'admin' || 
    user?.role === 'admin' || 
    user?.approvalRole === 'admin' || 
    user?.nip === '198001012005011001';

  useEffect(() => {
    if (isAdmin) {
      apiService.getUsers().then(res => {
        if (res && res.length > 0) setAllUsers(res);
      }).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin && user?.nip) {
      setSelectedNip(user.nip);
    }
  }, [user?.nip, isAdmin]);

  const monthOptions = [
    { val: 1, name: 'Januari' },
    { val: 2, name: 'Februari' },
    { val: 3, name: 'Maret' },
    { val: 4, name: 'April' },
    { val: 5, name: 'Mei' },
    { val: 6, name: 'Juni' },
    { val: 7, name: 'Juli' },
    { val: 8, name: 'Agustus' },
    { val: 9, name: 'September' },
    { val: 10, name: 'Oktober' },
    { val: 11, name: 'November' },
    { val: 12, name: 'Desember' }
  ];

  const fetchAbsensi = async (bulan, tahun) => {
    setLoading(true);
    try {
      const res = await apiService.getAbsensiBulanan(bulan, tahun);
      if (res) {
        setAbsensiData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensi(selectedBulan, selectedTahun);
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAbsensi(selectedBulan, selectedTahun);
  };

  const getMonthName = (val) => {
    const found = monthOptions.find(m => m.val === parseInt(val));
    return found ? found.name : 'Juni';
  };

  return (
    <div>
      {/* Breadcrumb banner */}
      <div className="breadcrumb-banner">
        <div>
          <h1 className="breadcrumb-title">
            <CalendarCheck2 size={24} className="text-blue-600" />
            <span>Info Absensi Pegawai</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>Info Absensi</span>
            <span>/</span>
            <span style={{ color: '#2563eb', fontWeight: 600 }}>Bulanan</span>
          </div>
        </div>
      </div>

      {/* Filter Card (Point 5: pilih bulan -> tahun -> lihat data) */}
      <div className="brmp-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
          <Filter size={18} className="text-blue-600" />
          <span>Filter Rekapitulasi Absensi</span>
        </div>

        <form onSubmit={handleFilterSubmit} className="absensi-filter-form">
          {isAdmin && (
            <div className="form-group absensi-filter-field" style={{ minWidth: '220px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} className="text-blue-600" />
                <span>Pilih Pegawai (Admin)</span>
              </label>
              <select
                className="form-input"
                value={selectedNip}
                onChange={(e) => setSelectedNip(e.target.value)}
              >
                {allUsers.map((p) => (
                  <option key={p.nip} value={p.nip}>
                    {p.nama} ({p.nip})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group absensi-filter-field">
            <label className="form-label">Pilih Bulan</label>
            <select
              className="form-input"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(parseInt(e.target.value))}
            >
              {monthOptions.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group absensi-filter-field">
            <label className="form-label">Tahun</label>
            <select
              className="form-input"
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(parseInt(e.target.value))}
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn-primary absensi-filter-submit" 
            disabled={loading}
          >
            <Search size={16} />
            <span>{loading ? 'Memuat...' : 'Lihat Data'}</span>
          </button>
        </form>
      </div>

      {/* Rekapitulasi Summary (Point 5) */}
      <div className="brmp-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Rekap Absensi Bulan {getMonthName(selectedBulan)} Tahun {selectedTahun}
          </h3>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <UserCheck size={14} />
            <span>
              {isAdmin 
                ? (allUsers.find(p => p.nip === selectedNip)?.nama || user?.nama || 'Pegawai')
                : (user?.nama || 'Pegawai BRMP')
              }
            </span>
          </span>
        </div>

        <div className="rekap-card-grid">
          {/* Masuk */}
          <div className="rekap-stat-card" style={{ '--border-color': '#2563eb' }}>
            <div style={{ color: '#2563eb', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle2 size={24} />
            </div>
            <div className="rekap-stat-val" style={{ color: '#2563eb' }}>
              {absensiData?.rekap?.totalMasuk ?? 20}
            </div>
            <span className="rekap-stat-label">Masuk</span>
          </div>

          {/* Terlambat */}
          <div className="rekap-stat-card" style={{ '--border-color': '#f59e0b' }}>
            <div style={{ color: '#f59e0b', display: 'flex', justifyContent: 'center' }}>
              <Clock size={24} />
            </div>
            <div className="rekap-stat-val" style={{ color: '#f59e0b' }}>
              {absensiData?.rekap?.terlambat ?? 1}
            </div>
            <span className="rekap-stat-label">Terlambat</span>
          </div>

          {/* Sakit */}
          <div className="rekap-stat-card" style={{ '--border-color': '#8b5cf6' }}>
            <div style={{ color: '#8b5cf6', display: 'flex', justifyContent: 'center' }}>
              <HeartPulse size={24} />
            </div>
            <div className="rekap-stat-val" style={{ color: '#8b5cf6' }}>
              {absensiData?.rekap?.sakit ?? 0}
            </div>
            <span className="rekap-stat-label">Sakit</span>
          </div>

          {/* Izin */}
          <div className="rekap-stat-card" style={{ '--border-color': '#06b6d4' }}>
            <div style={{ color: '#06b6d4', display: 'flex', justifyContent: 'center' }}>
              <AlertTriangle size={24} />
            </div>
            <div className="rekap-stat-val" style={{ color: '#06b6d4' }}>
              {absensiData?.rekap?.izin ?? 0}
            </div>
            <span className="rekap-stat-label">Izin</span>
          </div>

          {/* Alpha */}
          <div className="rekap-stat-card" style={{ '--border-color': '#ef4444' }}>
            <div style={{ color: '#ef4444', display: 'flex', justifyContent: 'center' }}>
              <XCircle size={24} />
            </div>
            <div className="rekap-stat-val" style={{ color: '#ef4444' }}>
              {absensiData?.rekap?.alpha ?? 1}
            </div>
            <span className="rekap-stat-label">Alpha</span>
          </div>
        </div>
      </div>

      {/* Grid Kartu Absensi Harian (Point 5 screenshot) */}
      <div className="brmp-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>
          Tabel Data Absensi Bulan {getMonthName(selectedBulan)} {selectedTahun}
        </h3>

        <div className="attendance-cards-grid">
          {absensiData?.harian?.map((item) => {
            let cardClass = 'masuk';
            if (item.status === 'Libur') cardClass = 'libur';
            else if (item.status === 'Terlambat') cardClass = 'terlambat';
            else if (item.status === 'Alpha') cardClass = 'alpha';

            return (
              <div key={item.tanggal} className={`attend-card ${cardClass}`}>
                <div className="attend-card-header">
                  {item.hari}, tgl {item.tglNo}
                </div>
                <div className="attend-card-status">
                  {item.status}
                </div>
                <div className="attend-card-time">
                  {item.status === 'Libur' ? (
                    <span>Hari Libur</span>
                  ) : item.status === 'Alpha' ? (
                    <span>Tanpa Keterangan</span>
                  ) : (
                    <>
                      <div>M: {item.jamMasuk}</div>
                      <div>P: {item.jamPulang}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
