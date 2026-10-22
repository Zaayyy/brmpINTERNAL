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
  ArrowRight,
  Send,
  Sparkles,
  Check,
  X,
  FileCheck2,
  Briefcase
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

  // Step 3: Anggota (Database 117 Pegawai BRMP DIY)
  const [pegawaiList, setPegawaiList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState([]);
  const [searchPegawai, setSearchPegawai] = useState('');
  const [filterTimKerja, setFilterTimKerja] = useState('all');

  // Step 4: Lokasi / Tujuan
  const [tujuanDaerah, setTujuanDaerah] = useState('Kabupaten Sleman');
  const [tempatTujuan, setTempatTujuan] = useState('BPP Seyegan & Gapoktan Makmur Lestari');

  // Step 5: Uraian Tugas
  const [uraianTugas, setUraianTugas] = useState('Koordinasi pelaksanaan bimbingan teknis penerapan standar instrumen pertanian dan validasi benih varietas unggul.');

  // Data & State
  const [sptList, setSptList] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Quick suggestions for Tempat Tujuan
  const TEMPAT_SUGGESTIONS = [
    'BPP Seyegan & Gapoktan Makmur (Sleman)',
    'BPP Sentolo & KT Sido Dadi (Kulon Progo)',
    'BPP Imogiri & Gapoktan Tani Mulya (Bantul)',
    'BPP Wonosari & Kelompok Tani Mandiri (Gunungkidul)',
    'Dinas Pertanian & Ketahanan Pangan DIY',
    'KP Banyakan & Laboratorium Pengujian Benih'
  ];

  // Quick suggestions for Uraian Tugas
  const URAIAN_TEMPLATES = [
    'Koordinasi pelaksanaan bimbingan teknis penerapan standar instrumen pertanian dan validasi benih varietas unggul.',
    'Monitoring dan evaluasi pemanfaatan bantuan pompa air serta traktor roda empat dalam mendukung swasembada pangan.',
    'Pengawalan teknis dan pendampingan sertifikasi standar instrumen pertanian di kelompok tani binaan.',
    'Pengambilan sampel tanah dan pengujian mutu pupuk organik berbasis laboratorium spesifik lokasi.'
  ];

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

        // Find current logged in user or default
        const currentUserPeg = pegRes.find(p => p.nip === user?.nip || p.nama === user?.nama) || pegRes[0];
        const secondPeg = pegRes.find(p => p.nip !== currentUserPeg?.nip) || pegRes[1];

        setSelectedPegawai([
          { ...currentUserPeg, peranDalamTugas: 'Penanggung Jawab (PJ)' },
          ...(secondPeg ? [{ ...secondPeg, peranDalamTugas: 'Anggota Pelaksana' }] : [])
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
    const s = searchPegawai.toLowerCase();
    const matchSearch = (p.nama && p.nama.toLowerCase().includes(s)) ||
                        (p.nip && p.nip.includes(s)) ||
                        (p.unitKerja && p.unitKerja.toLowerCase().includes(s)) ||
                        (p.jabatan && p.jabatan.toLowerCase().includes(s));
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

    if (!tempatTujuan.trim()) {
      setErrorMsg('Tempat atau instansi tujuan tugas wajib diisi.');
      return;
    }

    if (!uraianTugas.trim()) {
      setErrorMsg('Uraian tugas kedinasan wajib diisi.');
      return;
    }

    // Warning if conflict exists
    if (conflicts.length > 0) {
      const confirmSubmit = window.confirm(
        `PERINGATAN RESMI:\nTerdeteksi ${conflicts.length} bentrok jadwal penugasan dengan SPT lain yang sedang berjalan!\n\nApakah Anda tetap ingin mengirimkan pengajuan ini untuk ditelaah dan diverifikasi oleh Ketimker?`
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
        durasi: calculateDuration(),
        tujuanDaerah,
        kotaTujuan: tujuanDaerah,
        tempatTujuan,
        uraian: uraianTugas,
        untukMelaksanakan: uraianTugas,
        pemohon: {
          id: user?.id || 'usr-active',
          nama: user?.nama || selectedPegawai[0]?.nama || 'Pegawai BRMP DIY',
          nip: user?.nip || selectedPegawai[0]?.nip || '-',
          unitKerja: user?.divisi || selectedPegawai[0]?.unitKerja || 'Balai Besar Penerapan Modernisasi Pertanian DIY'
        },
        anggota: selectedPegawai,
        pegawaiBertugas: selectedPegawai
      };

      const res = await apiService.submitSpt(payload);

      if (res && res.success) {
        setSuccessMsg('Surat Perintah Tugas (SPT) berhasil diajukan! Notifikasi kedinasan otomatis terkirim ke pimpinan dan antrean persetujuan.');
        setTimeout(() => {
          if (onNavigateToReport) {
            onNavigateToReport();
          }
        }, 1300);
      } else {
        throw new Error(res?.message || 'Gagal menyimpan pengajuan SPT');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirim pengajuan SPT.');
    } finally {
      setLoading(false);
    }
  };

  const durasi = calculateDuration();

  return (
    <div className="spt-module-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header Banner */}
      <div className="breadcrumb-banner no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#047857', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
            <ShieldCheck size={14} />
            <span>STANDAR TATA NASKAH DINAS KEMENTAN RI</span>
          </div>
          <h1 className="breadcrumb-title" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <FileText size={26} color="#059669" />
            <span>Formulir Pengajuan Surat Perintah Tugas (SPT) Digital</span>
          </h1>
          <div className="breadcrumb-path" style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>Modul E-SPT</span>
            <span>/</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>Pengajuan Tugas Baru (Multi-Personil)</span>
          </div>
        </div>

        <button 
          type="button"
          className="btn btn-secondary"
          onClick={onNavigateToReport}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#334155', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <span>Daftar & Tracking SPT</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0', padding: '14px 20px', gap: '12px' }}>
          {[
            { num: 1, label: 'Klasifikasi Tugas', desc: 'DIPA & Bidang' },
            { num: 2, label: 'Waktu & Durasi', desc: 'Rentang Tanggal' },
            { num: 3, label: 'Personil Tim', desc: `${selectedPegawai.length} Pegawai` },
            { num: 4, label: 'Lokasi Tujuan', desc: tujuanDaerah.replace('Kabupaten ', '') },
            { num: 5, label: 'Uraian Tugas', desc: 'Naskah Dinas' }
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: '0 2px 6px rgba(4,120,87,0.3)',
                flexShrink: 0
              }}>
                {s.num}
              </div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Real-Time Conflict Alert Box */}
        {conflicts.length > 0 && (
          <div style={{ margin: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontWeight: 800, fontSize: '13.5px', marginBottom: '8px' }}>
              <AlertTriangle size={22} color="#dc2626" />
              <span>PERINGATAN: TERDETEKSI BENTROK JADWAL PENUGASAN DINAS (DOUBLE BOOKING)!</span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
              Sesuai ketentuan SOP Balai, anggota tidak diperkenankan memiliki lebih dari 1 Surat Tugas pada rentang waktu yang beririsan ({tglMulai} s.d {tglSelesai}):
            </p>
            <ul style={{ marginTop: '8px', marginBottom: '4px', paddingLeft: '20px', fontSize: '12px', color: '#991b1b' }}>
              {conflicts.map((c, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  <strong>{c.memberNama}</strong> (NIP: {c.memberNip}) telah ditugaskan pada <strong>{c.nomorSpt}</strong> ke {c.tujuan} ({c.rentangIndo}).
                </li>
              ))}
            </ul>
            <div style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '6px', fontWeight: 600 }}>
              💡 Rekomendasi: Ganti personil yang bertabrakan dengan anggota tim lain atau sesuaikan tanggal pelaksanaan.
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '14px 18px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
              <CheckCircle2 size={20} color="#16a34a" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LANGKAH 1: KLASIFIKASI */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Langkah 1: Klasifikasi Kegiatan Penugasan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                value={klasifikasiId}
                onChange={(e) => setKlasifikasiId(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#f8fafc', fontWeight: 600, color: '#0f172a' }}
              >
                {KLASIFIKASI_SPT_DEFAULT.map(k => (
                  <option key={k.id} value={k.id}>
                    [{k.kode}] {k.nama} — ({k.kategori})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '5px' }}>
              Klasifikasi ini menentukan kode surat dinas resmi serta penyesuaian mata anggaran DIPA instansi.
            </div>
          </div>

          {/* LANGKAH 2: TANGGAL & DURASI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Langkah 2a: Tanggal Mulai Penugasan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="date" 
                value={tglMulai}
                onChange={(e) => setTglMulai(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Langkah 2b: Tanggal Selesai Penugasan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="date" 
                value={tglSelesai}
                onChange={(e) => setTglSelesai(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Durasi Pelaksanaan
              </label>
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '13px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#059669" />
                <span>{durasi} Hari Kalender</span>
              </div>
            </div>
          </div>

          {/* LANGKAH 3: MEMILIH ANGGOTA / PERSONIL (117 PEGAWAI) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                Langkah 3: Personil Tim Pelaksana ({selectedPegawai.length} Pegawai Dipilih) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '11px', color: '#059669', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                Database Resmi 117 Pegawai Balai
              </span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              {/* Chips Pegawai Terpilih */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                {selectedPegawai.map((peg, idx) => (
                  <div 
                    key={peg.nip || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: idx === 0 ? '#ecfdf5' : '#ffffff',
                      border: idx === 0 ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === 0 ? '#059669' : '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>
                      {peg.nama ? peg.nama.charAt(0) : 'P'}
                    </div>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>{peg.nama}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>NIP: {peg.nip || '-'} • Gol: {peg.golongan || '-'}</div>
                    </div>
                    <select
                      value={peg.peranDalamTugas || (idx === 0 ? 'Penanggung Jawab (PJ)' : 'Anggota Pelaksana')}
                      onChange={(e) => updateMemberRole(peg.nip, e.target.value)}
                      style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 600, color: '#0f172a' }}
                    >
                      <option value="Penanggung Jawab (PJ)">Penanggung Jawab (PJ)</option>
                      <option value="Anggota Pelaksana">Anggota Pelaksana</option>
                      <option value="Narasumber Teknis">Narasumber Teknis</option>
                      <option value="Petugas Lapangan">Petugas Lapangan</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleMember(peg)}
                      title="Keluarkan personil dari penugasan ini"
                      style={{ border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Toolbar Pencarian & Filter Tim */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '10px', marginBottom: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="🔍 Cari nama, NIP, atau jabatan personil..."
                    value={searchPegawai}
                    onChange={(e) => setSearchPegawai(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#ffffff' }}
                  />
                </div>
                <select 
                  value={filterTimKerja}
                  onChange={(e) => setFilterTimKerja(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#ffffff', fontWeight: 600 }}
                >
                  <option value="all">-- Seluruh Tim Kerja Balai --</option>
                  {uniqueTimKerja.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Daftar Scroll Pegawai */}
              <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#ffffff' }}>
                {filteredPegawai.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                    Tidak ada pegawai yang cocok dengan filter pencarian.
                  </div>
                ) : (
                  filteredPegawai.map((peg) => {
                    const isSelected = selectedPegawai.some(p => p.nip === peg.nip);
                    return (
                      <div 
                        key={peg.id || peg.nip}
                        onClick={() => toggleMember(peg)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 14px',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          background: isSelected ? '#f0fdf4' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                            {peg.nama}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            NIP: {peg.nip || '-'} • Gol: {peg.golongan || '-'} • {peg.unitKerja}
                          </div>
                        </div>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                          background: isSelected ? '#059669' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 800
                        }}>
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* LANGKAH 4: LOKASI & TUJUAN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Langkah 4a: Wilayah Daerah Kedinasan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select 
                value={tujuanDaerah}
                onChange={(e) => setTujuanDaerah(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#f8fafc', fontWeight: 600, color: '#0f172a' }}
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Langkah 4b: Tempat / Instansi Tujuan Spesifik <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                value={tempatTujuan}
                onChange={(e) => setTempatTujuan(e.target.value)}
                placeholder="Contoh: BPP Seyegan, Gapoktan Makmur Lestari, Dinas Pertanian DIY"
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
              />

              {/* Quick suggestion chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Saran Cepat:</span>
                {TEMPAT_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTempatTujuan(sug)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LANGKAH 5: URAIAN TUGAS */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                Langkah 5: Maksud & Uraian Tugas Kedinasan (Untuk Melaksanakan) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Format Resmi Standar Kementerian Pertanian RI</span>
            </div>

            <textarea 
              rows={3}
              value={uraianTugas}
              onChange={(e) => setUraianTugas(e.target.value)}
              placeholder="Uraikan secara jelas maksud pelaksanaan tugas, aktivitas lapangan, serta hasil yang diharapkan..."
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: 1.5, background: '#ffffff', color: '#0f172a' }}
            />

            {/* Template suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '11.5px', color: '#047857', fontWeight: 700 }}>
                💡 Template Standar Naskah Dinas:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {URAIAN_TEMPLATES.map((tmpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setUraianTugas(tmpl)}
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      color: '#166534',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    📝 {tmpl.slice(0, 48)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onNavigateToReport}
              style={{
                padding: '10px 20px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Batal / Kembali
            </button>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 800,
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.35)',
                transition: 'transform 0.1s ease'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Menerbitkan Pengajuan...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Kirim Pengajuan SPT Resmi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
