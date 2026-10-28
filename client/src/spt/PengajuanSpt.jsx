import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { KLASIFIKASI_SPT_DEFAULT } from '../data/klasifikasiData';
import { ConflictChecker } from '../utils/conflictChecker';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  Trash2,
  Clock,
  ShieldCheck,
  Building,
  ArrowRight
} from 'lucide-react';

export default function PengajuanSpt({ user, onNavigateToReport }) {
  // Step 1: Klasifikasi
  const [klasifikasiId, setKlasifikasiId] = useState('KLAS-01');
  
  // Step 2: Tanggal
  const [tglMulai, setTglMulai] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [tglSelesai, setTglSelesai] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });

  // Step 3: Anggota (115 Pegawai BRMP DIY)
  const [pegawaiList, setPegawaiList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState([]);
  const [searchPegawai, setSearchPegawai] = useState('');
  const [filterTimKerja, setFilterTimKerja] = useState('all');

  // Step 4: Lokasi / Tujuan
  const [tujuanDaerah, setTujuanDaerah] = useState('Kabupaten Sleman');
  const [tempatTujuan, setTempatTujuan] = useState('BPP Seyegan & Gapoktan Makmur Lestari');

  // Step 5: Uraian Tugas
  const [uraianTugas, setUraianTugas] = useState('Koordinasi pelaksanaan bimbingan teknis penerapan standar instrumen pertanian dan pemantauan alsintan di kelompok tani binaan.');

  // Data & State
  const [sptList, setSptList] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load Initial Data
  const loadInitialData = async () => {
    try {
      const [sptRes, pegRes] = await Promise.all([
        apiService.getSpt(),
        apiService.getPegawai()
      ]);

      if (sptRes && sptRes.sptList) {
        setSptList(sptRes.sptList);
      }

      if (pegRes && pegRes.length > 0) {
        setPegawaiList(pegRes);

        // Find current logged in user or default to Agnita / Devi Eka
        const currentUserPeg = pegRes.find(p => p.nip === user?.nip || p.nama.toLowerCase().includes('agnita')) || pegRes[0];
        const secondPeg = pegRes.find(p => p.nip === '198906012015032004') || pegRes[1]; // Devi Eka

        setSelectedPegawai([
          { ...currentUserPeg, peranDalamTugas: 'Penanggung Jawab (PJ)' },
          { ...secondPeg, peranDalamTugas: 'Anggota Pelaksana' }
        ]);
      }
    } catch (err) {
      console.error('Error loading initial SPT data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Real-Time Conflict Detection
  useEffect(() => {
    if (selectedPegawai.length > 0 && tglMulai && tglSelesai && sptList.length > 0) {
      const memberIds = selectedPegawai.map(p => p.nip || p.id || p.nama);
      const res = ConflictChecker.checkConflicts(memberIds, tglMulai, tglSelesai, null, sptList);
      setConflicts(res.conflicts || []);
    } else {
      setConflicts([]);
    }
  }, [selectedPegawai, tglMulai, tglSelesai, sptList]);

  // Calculate Duration
  const calculateDuration = () => {
    if (!tglMulai || !tglSelesai) return 1;
    const start = new Date(tglMulai);
    const end = new Date(tglSelesai);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  // Toggle Member selection
  const toggleMember = (peg) => {
    const exists = selectedPegawai.find(p => p.nip === peg.nip);
    if (exists) {
      if (selectedPegawai.length === 1) {
        alert('Minimal harus ada 1 personil pelaksana dalam penugasan SPT.');
        return;
      }
      setSelectedPegawai(selectedPegawai.filter(p => p.nip !== peg.nip));
    } else {
      setSelectedPegawai([
        ...selectedPegawai,
        { ...peg, peranDalamTugas: 'Anggota Pelaksana' }
      ]);
    }
  };

  // Change Member Role in task
  const updateMemberRole = (nip, role) => {
    setSelectedPegawai(selectedPegawai.map(p => 
      p.nip === nip ? { ...p, peranDalamTugas: role } : p
    ));
  };

  // Filtered pegawai list
  const filteredPegawai = pegawaiList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchPegawai.toLowerCase()) ||
                        (p.nip && p.nip.includes(searchPegawai)) ||
                        (p.unitKerja && p.unitKerja.toLowerCase().includes(searchPegawai.toLowerCase())) ||
                        (p.jabatan && p.jabatan.toLowerCase().includes(searchPegawai.toLowerCase()));
    const matchTim = filterTimKerja === 'all' || p.unitKerja === filterTimKerja;
    return matchSearch && matchTim;
  });

  // Unique Tim Kerja list for filter dropdown
  const uniqueTimKerja = Array.from(new Set(pegawaiList.map(p => p.unitKerja).filter(Boolean)));

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (new Date(tglMulai) > new Date(tglSelesai)) {
      setErrorMsg('Tanggal mulai tidak boleh lebih lambat daripada tanggal selesai.');
      return;
    }

    if (selectedPegawai.length === 0) {
      setErrorMsg('Pilih minimal 1 orang personil pelaksana tugas.');
      return;
    }

    if (!uraianTugas.trim()) {
      setErrorMsg('Uraian tugas kedinasan wajib diisi.');
      return;
    }

    // Warning if conflict exists
    if (conflicts.length > 0) {
      const confirmSubmit = window.confirm(
        `PERINGATAN: Terdeteksi ${conflicts.length} bentrok jadwal anggota dengan SPT yang sedang aktif!\n\nApakah Anda tetap ingin mengirimkan pengajuan ini untuk ditelaah Ketimker?`
      );
      if (!confirmSubmit) return;
    }

    setLoading(true);

    try {
      const selectedKlas = KLASIFIKASI_SPT_DEFAULT.find(k => k.id === klasifikasiId) || KLASIFIKASI_SPT_DEFAULT[0];

      const payload = {
        klasifikasiId: selectedKlas.id,
        klasifikasiNama: selectedKlas.nama,
        tglMulai,
        tglSelesai,
        dariTanggal: tglMulai,
        sampaiTanggal: tglSelesai,
        tujuanDaerah,
        kotaTujuan: tujuanDaerah,
        tempatTujuan,
        uraian: uraianTugas,
        untukMelaksanakan: uraianTugas,
        pemohon: {
          id: user?.id || 'usr-active',
          nama: user?.nama || selectedPegawai[0]?.nama || 'Pegawai BRMP DIY',
          nip: user?.nip || selectedPegawai[0]?.nip || '-',
          unitKerja: user?.divisi || selectedPegawai[0]?.unitKerja || 'Balai Penerapan Standar Instrumen Pertanian DIY'
        },
        anggota: selectedPegawai,
        pegawaiBertugas: selectedPegawai
      };

      const res = await apiService.submitSpt(payload);

      if (res.success) {
        setSuccessMsg('Pengajuan Surat Perintah Tugas (SPT) berhasil dibuat dan masuk ke antrean verifikasi!');
        setTimeout(() => {
          if (onNavigateToReport) {
            onNavigateToReport();
          }
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirim pengajuan SPT.');
    } finally {
      setLoading(false);
    }
  };

  const durasi = calculateDuration();

  return (
    <div className="spt-module-container">
      {/* Header Banner */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <FileText size={24} style={{ color: 'var(--primary-600)' }} />
            <span>Formulir Pengajuan Surat Perintah Tugas (SPT) Digital</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">Pengajuan Baru (SOP No. 04/2026)</span>
          </div>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={onNavigateToReport}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Tracking & Cetak SPT</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="card mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', background: 'var(--primary-50)', borderBottom: '1px solid var(--primary-100)', borderRadius: '12px 12px 0 0', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)' }}>1</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-950)' }}>1. Klasifikasi Tugas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)' }}>2</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-950)' }}>2. Waktu & Durasi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)' }}>3</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-950)' }}>3. Personil Pelaksana</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)' }}>4</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-950)' }}>4. Lokasi & Tujuan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)' }}>5</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-950)' }}>5. Uraian Tugas</span>
          </div>
        </div>

        {/* Real-Time Conflict Alert Box */}
        {conflicts.length > 0 && (
          <div style={{ margin: '16px 24px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
              <AlertTriangle size={20} />
              <span>PERINGATAN: TERDETEKSI BENTROK JADWAL PENUGASAN DINAS (DOUBLE BOOKING)!</span>
            </div>
            <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
              Sesuai ketentuan SOP BRMP DIY, personil <strong>tidak dapat memiliki 2 SPT pada rentang tanggal bersamaan</strong>.
              Berikut personil yang jadwalnya beririsan pada rentang ({tglMulai} s.d {tglSelesai}):
            </p>
            <ul style={{ marginTop: '8px', marginBottom: '4px', paddingLeft: '20px', fontSize: '13px', color: '#991b1b' }}>
              {conflicts.map((c, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  <strong>{c.memberNama}</strong> (NIP: {c.memberNip}) bertabrakan dengan <strong>{c.nomorSpt}</strong> ({c.tujuan}) pada <em>{c.rentangIndo}</em>.
                </li>
              ))}
            </ul>
            <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '6px' }}>
              💡 <em>Saran: Ganti anggota yang bentrok dengan personil lain atau sesuaikan rentang tanggal tugas dinas.</em>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LANGKAH 1: KLASIFIKASI */}
          <div className="form-group mb-4">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Langkah 1: Klasifikasi Penugasan Kedinasan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              className="form-control"
              value={klasifikasiId}
              onChange={(e) => setKlasifikasiId(e.target.value)}
              required
            >
              {KLASIFIKASI_SPT_DEFAULT.map(k => (
                <option key={k.id} value={k.id}>
                  [{k.kode}] {k.nama} ({k.kategori})
                </option>
              ))}
            </select>
            <div className="form-help" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Pilih klasifikasi tugas sesuai mata kegiatan DIPA Balai Penerapan Standar Instrumen Pertanian DIY.
            </div>
          </div>

          {/* LANGKAH 2: TANGGAL & DURASI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Langkah 2a: Tanggal Mulai Penugasan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="date" 
                className="form-control"
                value={tglMulai}
                onChange={(e) => setTglMulai(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Langkah 2b: Tanggal Selesai Penugasan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="date" 
                className="form-control"
                value={tglSelesai}
                onChange={(e) => setTglSelesai(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Durasi Waktu Kalender
              </label>
              <div style={{ padding: '10px 14px', background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--primary-600)' }} />
                <span>{durasi} Hari Kalender</span>
              </div>
            </div>
          </div>

          {/* LANGKAH 3: MEMILIH ANGGOTA / PERSONIL (115 PEGAWAI) */}
          <div className="form-group mb-4">
            <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Langkah 3: Memilih Personil Pelaksana BRMP DIY ({selectedPegawai.length} Orang Terpilih) <span style={{ color: '#ef4444' }}>*</span></span>
              <span style={{ fontSize: '12px', color: 'var(--primary-700)', fontWeight: 600 }}>Database 115 Pegawai BRMP DIY</span>
            </label>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              {/* Selected Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {selectedPegawai.map((peg, idx) => (
                  <div 
                    key={peg.nip || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: idx === 0 ? 'var(--primary-50)' : '#f1f5f9',
                      border: idx === 0 ? '1px solid var(--primary-300)' : '1px solid #cbd5e1',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{peg.nama}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>NIP: {peg.nip || '-'} • Gol: {peg.golongan || '-'}</div>
                    </div>
                    <select
                      value={peg.peranDalamTugas || (idx === 0 ? 'Penanggung Jawab (PJ)' : 'Anggota Pelaksana')}
                      onChange={(e) => updateMemberRole(peg.nip, e.target.value)}
                      style={{ fontSize: '11px', padding: '2px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }}
                    >
                      <option value="Penanggung Jawab (PJ)">PJ</option>
                      <option value="Anggota Pelaksana">Anggota</option>
                      <option value="Narasumber Teknis">Narasumber</option>
                      <option value="Petugas Lapangan">Petugas</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleMember(peg)}
                      title="Hapus personil"
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {/* Search & Filter Toolbar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '10px', marginBottom: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="🔍 Cari nama, NIP, atau jabatan pegawai..."
                    value={searchPegawai}
                    onChange={(e) => setSearchPegawai(e.target.value)}
                    style={{ paddingLeft: '36px', fontSize: '13px' }}
                  />
                </div>
                <select 
                  className="form-control"
                  value={filterTimKerja}
                  onChange={(e) => setFilterTimKerja(e.target.value)}
                  style={{ fontSize: '12.5px' }}
                >
                  <option value="all">-- Semua Tim Kerja --</option>
                  {uniqueTimKerja.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Scrollable list of 115 pegawai */}
              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                {filteredPegawai.slice(0, 40).map((peg) => {
                  const isSelected = selectedPegawai.some(p => p.nip === peg.nip);
                  return (
                    <div 
                      key={peg.id || peg.nip}
                      onClick={() => toggleMember(peg)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isSelected ? '#f0fdf4' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                          {peg.nama}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          NIP: {peg.nip || '-'} • Gol: {peg.golongan || '-'} • {peg.unitKerja}
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by div click
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                Menampilkan hasil pencarian dari 115 pegawai resmi Balai Penerapan Standar Instrumen Pertanian D.I. Yogyakarta.
              </div>
            </div>
          </div>

          {/* LANGKAH 4: LOKASI & TUJUAN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Langkah 4a: Tujuan Daerah (Kabupaten / Kota) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select 
                className="form-control"
                value={tujuanDaerah}
                onChange={(e) => setTujuanDaerah(e.target.value)}
                required
              >
                <option value="Kabupaten Sleman">Kabupaten Sleman</option>
                <option value="Kabupaten Bantul">Kabupaten Bantul</option>
                <option value="Kabupaten Kulon Progo">Kabupaten Kulon Progo</option>
                <option value="Kabupaten Gunungkidul">Kabupaten Gunungkidul</option>
                <option value="Kota Yogyakarta">Kota Yogyakarta</option>
                <option value="Daerah Istimewa Yogyakarta (Lintas Kabupaten)">Daerah Istimewa Yogyakarta (Lintas Kabupaten)</option>
                <option value="Luar Daerah DIY / Kementerian Pusat">Luar Daerah DIY / Kementerian Pusat</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Langkah 4b: Tempat / Instansi Tujuan Spesifik <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                className="form-control"
                value={tempatTujuan}
                onChange={(e) => setTempatTujuan(e.target.value)}
                placeholder="Contoh: BPP Sentolo, Gapoktan Makmur Lestari, Dinas Pertanian DIY"
                required
              />
            </div>
          </div>

          {/* LANGKAH 5: URAIAN TUGAS */}
          <div className="form-group mb-4">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Langkah 5: Mengisi Uraian Tugas Kedinasan (Untuk Melaksanakan Apa) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea 
              className="form-control"
              rows={3}
              value={uraianTugas}
              onChange={(e) => setUraianTugas(e.target.value)}
              placeholder="Uraikan secara jelas maksud kedinasan, kegiatan yang dilaksanakan, serta output yang diharapkan..."
              required
            />
            <div className="form-help" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Uraian ini akan tercetak secara resmi pada format tata naskah dinas Surat Perintah Tugas Kementerian Pertanian RI.
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onNavigateToReport}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading ? 'Menyimpan...' : 'Kirim Pengajuan SPT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
