import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { KEMENTAN_LOGO_BASE64 } from '../data/logoData';
import { ConflictChecker } from '../utils/conflictChecker';
import { 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  X, 
  Calendar, 
  MapPin, 
  User, 
  ShieldCheck, 
  Check, 
  FileCheck
} from 'lucide-react';

export default function ReportSpt({ user, onNavigateToPengajuan }) {
  const [sptList, setSptList] = useState([]);
  const [menimbangList, setMenimbangList] = useState([]);
  const [dasarList, setDasarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [printSpt, setPrintSpt] = useState(null);
  const [detailSpt, setDetailSpt] = useState(null);
  const [laporanModalSpt, setLaporanModalSpt] = useState(null);
  const [isiLaporanText, setIsiLaporanText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [laporanFileName, setLaporanFileName] = useState('');
  const [savingLaporan, setSavingLaporan] = useState(false);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getSpt();
      if (res && res.sptList) {
        setSptList(res.sptList);
      }
      if (res && res.menimbang) {
        setMenimbangList(res.menimbang);
      }
      if (res && res.dasar) {
        setDasarList(res.dasar);
      }
    } catch (err) {
      console.error('Error loading SPT list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered SPT
  const filteredSptList = sptList.filter(spt => {
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'terbit' && (spt.status === 'terbit' || spt.isApproved)) ||
      (filterStatus === 'approved_kobag_tu' && spt.status === 'approved_kobag_tu') ||
      (filterStatus === 'approved_ketimker' && spt.status === 'approved_ketimker') ||
      (filterStatus === 'diajukan' && spt.status === 'diajukan') ||
      (filterStatus === 'selesai' && spt.status === 'selesai');

    const searchMatch = !searchQuery || 
      (spt.nomorSpt && spt.nomorSpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.id && spt.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.tujuanDaerah && spt.tujuanDaerah.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.kotaTujuan && spt.kotaTujuan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.tempatTujuan && spt.tempatTujuan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.uraian && spt.uraian.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.anggota && spt.anggota.some(a => a.nama.toLowerCase().includes(searchQuery.toLowerCase())));

    return statusMatch && searchMatch;
  });

  // Open Laporan Modal
  const openLaporanModal = (spt) => {
    setLaporanModalSpt(spt);
    setIsiLaporanText(spt.laporan?.isiLaporan || '');
    setLaporanFileName(spt.laporan?.fileLaporanName || '');
    setPhotoUrl('');
  };

  // Submit Laporan
  const handleSaveLaporan = async (e) => {
    e.preventDefault();
    if (!laporanModalSpt) return;
    setSavingLaporan(true);

    try {
      const payload = {
        isiLaporan: isiLaporanText,
        fotoUrl: photoUrl || null,
        fileLaporanName: laporanFileName || 'Laporan_Kegiatan_Dinas_BRMP.pdf'
      };

      const res = await apiService.submitLaporanSpt(laporanModalSpt.id, payload);
      if (res.success) {
        alert('Laporan hasil tugas dinas berhasil disimpan!');
        setLaporanModalSpt(null);
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menyimpan laporan.');
    } finally {
      setSavingLaporan(false);
    }
  };

  // Get Status Badge
  const getStatusBadge = (spt) => {
    if (spt.status === 'terbit' || spt.isApproved) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
          <CheckCircle2 size={13} />
          <span>SPT Terbit / Sah</span>
        </span>
      );
    }
    if (spt.status === 'approved_kobag_tu') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
          <Clock size={13} />
          <span>Approved Kobag TU</span>
        </span>
      );
    }
    if (spt.status === 'approved_ketimker') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
          <Clock size={13} />
          <span>Approved Ketimker</span>
        </span>
      );
    }
    if (spt.status === 'selesai') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
          <FileCheck size={13} />
          <span>Laporan Selesai</span>
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
        <Clock size={13} />
        <span>Menunggu Persetujuan</span>
      </span>
    );
  };

  return (
    <div className="spt-module-container">
      {/* Breadcrumb banner */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <Printer size={24} className="text-blue-600" />
            <span>Tracking & Cetak Naskah Dinas Resmi SPT</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">Monitoring & Tata Naskah Dinas RI</span>
          </div>
        </div>
        <button 
          className="btn btn-primary"
          onClick={onNavigateToPengajuan}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>+ Ajukan SPT Baru</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card mb-4 no-print">
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input 
                type="text" 
                className="form-control"
                placeholder="🔍 Cari nomor SPT, lokasi, personil pelaksana, atau maksud tugas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} className="text-gray-500" />
            <select 
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '210px', fontSize: '12.5px' }}
            >
              <option value="all">Semua Status Persetujuan</option>
              <option value="terbit">SPT Terbit & Sah</option>
              <option value="approved_kobag_tu">Approved Kobag TU</option>
              <option value="approved_ketimker">Approved Ketimker</option>
              <option value="diajukan">Menunggu Persetujuan</option>
              <option value="selesai">Laporan Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card no-print">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: '170px' }}>Nomor SPT / ID</th>
                  <th>Klasifikasi & Lokasi</th>
                  <th>Personil Pelaksana</th>
                  <th style={{ width: '140px' }}>Jadwal Penugasan</th>
                  <th style={{ width: '160px' }}>Status</th>
                  <th style={{ width: '190px', textAlign: 'center' }}>Aksi & Dokumen</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      Memuat daftar SPT digital...
                    </td>
                  </tr>
                ) : filteredSptList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      Tidak ada data Surat Perintah Tugas yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredSptList.map((spt) => {
                    const members = spt.anggota || spt.pegawaiBertugas || [];
                    const isApproved = spt.status === 'terbit' || spt.isApproved;

                    return (
                      <tr key={spt.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                            {spt.nomorSpt || `(Draft #${spt.id})`}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Diajukan: {spt.tglPengajuan || spt.tanggalEntri || '-'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '12.5px' }}>
                            {spt.klasifikasiNama || 'Perjalanan Dinas'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <MapPin size={13} className="text-red-500" />
                            <span>{spt.tempatTujuan || spt.tujuanDaerah || spt.kotaTujuan}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {members.slice(0, 2).map((m, idx) => (
                              <div key={idx} style={{ fontSize: '12px' }}>
                                <strong>{m.nama}</strong>
                                <span style={{ fontSize: '10.5px', color: '#64748b', marginLeft: '4px' }}>
                                  ({m.peranDalamTugas || 'Pelaksana'})
                                </span>
                              </div>
                            ))}
                            {members.length > 2 && (
                              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                                +{members.length - 2} personil lainnya
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px', fontWeight: 600 }}>
                            {spt.tanggalSpt || `${spt.tglMulai || spt.dariTanggal} s/d ${spt.tglSelesai || spt.sampaiTanggal}`}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Durasi: {spt.lamaHari || `${spt.durasiHari || 1} hari`}
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(spt)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {/* Tombol Detail Timeline */}
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Lihat Histori Tracking Timeline"
                              onClick={() => setDetailSpt(spt)}
                              style={{ padding: '5px 8px' }}
                            >
                              <Eye size={14} />
                            </button>

                            {/* Tombol Cetak Naskah Dinas Resmi */}
                            <button
                              className={`btn btn-sm ${isApproved ? 'btn-primary' : 'btn-secondary'}`}
                              title={isApproved ? "Cetak Naskah Dinas Resmi Standar Kementerian Pertanian" : "Pratinjau Draf Naskah Dinas Resmi"}
                              onClick={() => setPrintSpt(spt)}
                              style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Printer size={14} />
                              <span style={{ fontSize: '11.5px' }}>{isApproved ? 'Cetak' : 'Draf'}</span>
                            </button>

                            {/* Tombol Laporan Penugasan */}
                            <button
                              className={`btn btn-sm ${spt.laporan ? 'btn-success' : 'btn-secondary'}`}
                              title="Unggah / Lihat Laporan Hasil Penugasan Dinas"
                              onClick={() => openLaporanModal(spt)}
                              style={{ padding: '5px 8px' }}
                            >
                              <Upload size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: PREVIEW & CETAK FORMAT RESMI NASKAH DINAS STANDAR KEMENTAN RI
          ========================================================================= */}
      {printSpt && (
        <div className="modal-overlay" id="previewModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-dialog modal-xl" style={{ maxWidth: '900px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header no-print" style={{ padding: '14px 20px', background: '#1e293b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={20} className="text-emerald-400" />
                <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 600 }}>
                  Format Resmi Naskah Dinas SPT Standar Kementerian Pertanian RI
                </h3>
              </div>
              <button 
                onClick={() => setPrintSpt(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', padding: '24px', background: '#f8fafc' }}>
              {/* Official A4 Document Container */}
              <div 
                className="spt-official-document" 
                style={{ 
                  background: '#ffffff', 
                  padding: '30px 40px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)', 
                  borderRadius: '4px',
                  fontFamily: '"Bookman Old Style", "Times New Roman", Georgia, serif',
                  color: '#000000',
                  lineHeight: 1.35,
                  fontSize: '11pt'
                }}
              >
                {/* KOP SURAT RESMI */}
                <header className="spt-kop" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <div className="kop-logo" style={{ flexShrink: 0 }}>
                    <img 
                      src={KEMENTAN_LOGO_BASE64 || '/logo-kementan.png'} 
                      alt="Logo Kementerian Pertanian" 
                      style={{ width: '82px', height: '82px', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="kop-text" style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '14pt', fontWeight: 'bold', letterSpacing: '0.5px' }}>KEMENTERIAN PERTANIAN</div>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>BADAN STANDARDISASI INSTRUMEN PERTANIAN</div>
                    <div style={{ fontSize: '13pt', fontWeight: 'bold' }}>BALAI PENERAPAN STANDAR INSTRUMEN PERTANIAN</div>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold', letterSpacing: '0.5px' }}>DAERAH ISTIMEWA YOGYAKARTA (BRMP DIY)</div>
                    <div style={{ fontSize: '8.5pt', marginTop: '4px', lineHeight: 1.25 }}>
                      Jl. Stadion Maguwoharjo No. 22, Karangsari, Wedomartani, Ngemplak, Sleman, D.I. Yogyakarta 55584<br />
                      Telepon (0274) 884662 | Faksimili (0274) 884663 | Surel: brmp-diy@pertanian.go.id | Laman: brmpdiy.pertanian.go.id
                    </div>
                  </div>
                </header>

                {/* GARIS KOP SURAT TEBAL & TIPIS */}
                <div style={{ borderBottom: '3px solid #000', marginBottom: '1.5px' }}></div>
                <div style={{ borderBottom: '1px solid #000', marginBottom: '20px' }}></div>

                {/* JUDUL SURAT */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '13.5pt', fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 4px 0' }}>
                    SURAT PERINTAH TUGAS
                  </h2>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>
                    Nomor: {printSpt.nomorSpt || 'B-......../KP.320/H.14.7/10/2026 (DRAF USULAN)'}
                  </div>
                </div>

                {/* KONSIDERANS MENIMBANG */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '14px', fontSize: '10.5pt' }}>
                  <div style={{ fontWeight: 'bold' }}>Menimbang :</div>
                  <div>
                    {menimbangList.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '4px', textAlign: 'justify' }}>
                        <span style={{ fontWeight: 'bold' }}>{String.fromCharCode(97 + idx)}.</span>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KONSIDERANS DASAR */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '18px', fontSize: '10.5pt' }}>
                  <div style={{ fontWeight: 'bold' }}>Dasar :</div>
                  <div>
                    {dasarList.map((d, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '4px', textAlign: 'justify' }}>
                        <span style={{ fontWeight: 'bold' }}>{idx + 1}.</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MEMERINTAHKAN */}
                <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '14px 0 10px 0', letterSpacing: '1px' }}>
                  MEMERINTAHKAN:
                </div>

                {/* KEPADA */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '14px', fontSize: '10.5pt' }}>
                  <div style={{ fontWeight: 'bold' }}>Kepada :</div>
                  <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10pt' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #000' }}>
                          <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '32px' }}>No.</th>
                          <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left' }}>Nama / NIP</th>
                          <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '60px' }}>Gol.</th>
                          <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left' }}>Jabatan Kedinasan</th>
                          <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '130px' }}>Peran Penugasan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(printSpt.anggota || printSpt.pegawaiBertugas || []).map((ang, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{idx + 1}.</td>
                            <td style={{ border: '1px solid #000', padding: '5px' }}>
                              <div style={{ fontWeight: 'bold' }}>{ang.nama}</div>
                              <div style={{ fontSize: '9pt', color: '#333' }}>NIP. {ang.nip || '-'}</div>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{ang.golongan || '-'}</td>
                            <td style={{ border: '1px solid #000', padding: '5px' }}>{ang.jabatan || '-'}</td>
                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                              {ang.peranDalamTugas || (idx === 0 ? 'Penanggung Jawab (PJ)' : 'Anggota Pelaksana')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* UNTUK */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '24px', fontSize: '10.5pt' }}>
                  <div style={{ fontWeight: 'bold' }}>Untuk :</div>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 'bold' }}>1.</span>
                      <span>Melaksanakan tugas dinas: <strong>{printSpt.uraian || printSpt.untukMelaksanakan}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold' }}>2.</span>
                      <span>Tempat / Lokasi Penugasan: <strong>{printSpt.tempatTujuan || printSpt.tujuanDaerah || printSpt.kotaTujuan}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold' }}>3.</span>
                      <span>
                        Waktu Pelaksanaan: Selama <strong>{printSpt.lamaHari || `${printSpt.durasiHari || 1} hari`}</strong> pada tanggal <strong>{printSpt.tanggalSpt || `${printSpt.tglMulai || printSpt.dariTanggal} s/d ${printSpt.tglSelesai || printSpt.sampaiTanggal}`}</strong>
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 'bold' }}>4.</span>
                      <span>
                        Biaya yang timbul akibat pelaksanaan Surat Perintah Tugas ini dibebankan pada DIPA Balai Penerapan Standar Instrumen Pertanian D.I. Yogyakarta Tahun Anggaran Berjalan.
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', textAlign: 'justify' }}>
                      <span style={{ fontWeight: 'bold' }}>5.</span>
                      <span>
                        Setelah selesai melaksanakan tugas, pelaksana wajib menyampaikan laporan tertulis hasil pelaksanaan kegiatan kepada Kepala Balai.
                      </span>
                    </div>
                  </div>
                </div>

                {/* TANDA TANGAN & PENGESAHAN KEPALA BALAI */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', marginTop: '20px', fontSize: '10.5pt' }}>
                  <div></div>
                  <div style={{ textAlign: 'left' }}>
                    <div>Ditetapkan di: Yogyakarta</div>
                    <div>Pada tanggal: {ConflictChecker.formatDateIndo(printSpt.tglPengajuan || printSpt.dariTanggal)}</div>
                    <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                      Kepala Balai Penerapan Standar<br />
                      Instrumen Pertanian D.I. Yogyakarta,
                    </div>

                    {/* Stempel & Barcode Signature simulation */}
                    <div style={{ margin: '14px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ border: '1px solid #16a34a', padding: '6px 10px', borderRadius: '4px', fontSize: '8.5pt', color: '#16a34a', textAlign: 'center', lineHeight: 1.2 }}>
                        <div style={{ fontWeight: 'bold' }}>BSRE KEMENTAN</div>
                        <div>Tersertifikasi Elektronik</div>
                        <div style={{ fontSize: '7.5pt', opacity: 0.8 }}>ID: {printSpt.id}</div>
                      </div>
                      <div style={{ width: '48px', height: '48px', border: '1px dashed #64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8pt', color: '#64748b' }}>
                        QR Code
                      </div>
                    </div>

                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                      Dr. Soeharsono, S.Pt, M.Si
                    </div>
                    <div>NIP. 197109271998031002</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer no-print" style={{ padding: '14px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setPrintSpt(null)}
              >
                Tutup
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} />
                <span>🖨️ Cetak ke Kertas A4 / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DETAIL SPT & TIMELINE TRACKING ALUR
          ========================================================================= */}
      {detailSpt && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-dialog" style={{ maxWidth: '640px', width: '90%', background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} className="text-blue-600" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
                  Detail & Histori Tracking Alur SPT
                </h3>
              </div>
              <button onClick={() => setDetailSpt(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>

            <div className="modal-body" style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {detailSpt.nomorSpt || `Draft #${detailSpt.id}`}
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
                  {detailSpt.uraian || detailSpt.untukMelaksanakan}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  Tujuan: {detailSpt.tempatTujuan || detailSpt.tujuanDaerah} • Waktu: {detailSpt.tanggalSpt || detailSpt.dariTanggal}
                </div>
              </div>

              {/* Status Note Catatan */}
              {detailSpt.catatanKetimker && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '10px', fontSize: '12px', marginBottom: '10px' }}>
                  <strong>Catatan Ketimker:</strong> {detailSpt.catatanKetimker}
                </div>
              )}
              {detailSpt.catatanKobagTu && (
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '6px', padding: '10px', fontSize: '12px', marginBottom: '16px' }}>
                  <strong>Catatan Kobag TU:</strong> {detailSpt.catatanKobagTu}
                </div>
              )}

              {/* Timeline Stepper */}
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                Jejak Alur Persetujuan & Penerbitan:
              </h4>

              <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '12px', paddingLeft: '16px' }}>
                {(detailSpt.timeline || []).map((tl, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: '16px' }}>
                    <div style={{ position: 'absolute', left: '-23px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb', border: '2px solid #fff' }}></div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{tl.aksi}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Oleh: {tl.aktor} • {tl.waktu}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDetailSpt(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: UPLOAD LAPORAN HASIL PENUGASAN DINAS (MAKS 2MB)
          ========================================================================= */}
      {laporanModalSpt && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-dialog" style={{ maxWidth: '580px', width: '90%', background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} className="text-emerald-600" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
                  Upload Laporan Hasil Penugasan Kedinasan
                </h3>
              </div>
              <button onClick={() => setLaporanModalSpt(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveLaporan}>
              <div className="modal-body" style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', marginBottom: '16px' }}>
                  <strong>SPT:</strong> {laporanModalSpt.nomorSpt || laporanModalSpt.id} — {laporanModalSpt.tujuanDaerah}
                </div>

                <div className="form-group mb-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                    Ringkasan Hasil Pelaksanaan Tugas <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={isiLaporanText}
                    onChange={(e) => setIsiLaporanText(e.target.value)}
                    placeholder="Uraikan hasil pertemuan, temuan lapangan, tindak lanjut, dan capaian target penugasan..."
                    required
                  />
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                    Sesuai SOP BRMP DIY, laporan tertulis wajib disampaikan paling lambat 5 hari setelah penugasan.
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                    File Dokumen Laporan (PDF / DOC maks 2MB)
                  </label>
                  <input 
                    type="file" 
                    className="form-control"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setLaporanFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  {laporanFileName && (
                    <div style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '4px' }}>
                      ✓ Terpilih: {laporanFileName}
                    </div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                    Tautan Foto Dokumentasi Lapangan (Opsional)
                  </label>
                  <input 
                    type="url" 
                    className="form-control"
                    placeholder="https://images.unsplash.com/... atau URL foto kegiatan"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                </div>

                {/* Foto Dokumentasi yang sudah ada */}
                {laporanModalSpt.laporan?.fotoDokumentasi && laporanModalSpt.laporan.fotoDokumentasi.length > 0 && (
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Galeri Foto Dokumentasi:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {laporanModalSpt.laporan.fotoDokumentasi.map((foto, idx) => (
                        <img 
                          key={idx}
                          src={foto.url} 
                          alt="Dokumentasi" 
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setLaporanModalSpt(null)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={savingLaporan}>
                  {savingLaporan ? 'Menyimpan...' : 'Simpan Laporan Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
