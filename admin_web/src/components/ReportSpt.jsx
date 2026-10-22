import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { KEMENTAN_LOGO_BASE64 } from '../data/logoData';
import { ConflictChecker } from '../utils/conflictChecker';
import './ReportSpt.css';
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
  FileCheck,
  Building2,
  Sparkles,
  ChevronRight,
  Copy,
  UploadCloud,
  Paperclip,
  Info
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
  const [copiedNum, setCopiedNum] = useState(false);

  const handleCopyNumber = (num) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 2000);
  };

  // Helper date formatter (ID)
  const formatDateId = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatRangeId = (startStr, endStr) => {
    if (!startStr && !endStr) return '-';
    if (startStr && !endStr) return formatDateId(startStr);
    if (!startStr && endStr) return formatDateId(endStr);
    if (startStr === endStr) return formatDateId(startStr);

    try {
      const d1 = new Date(startStr);
      const d2 = new Date(endStr);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return `${startStr} s/d ${endStr}`;
      }

      const m1 = d1.toLocaleDateString('id-ID', { month: 'short' });
      const m2 = d2.toLocaleDateString('id-ID', { month: 'short' });
      const y1 = d1.getFullYear();
      const y2 = d2.getFullYear();

      if (y1 === y2 && m1 === m2) {
        return `${d1.getDate()} - ${d2.getDate()} ${m1} ${y1}`;
      } else if (y1 === y2) {
        return `${d1.getDate()} ${m1} - ${d2.getDate()} ${m2} ${y1}`;
      } else {
        return `${d1.getDate()} ${m1} ${y1} - ${d2.getDate()} ${m2} ${y2}`;
      }
    } catch (e) {
      return `${startStr} s/d ${endStr}`;
    }
  };

  const getDurationText = (spt) => {
    if (spt.durasi) return `${spt.durasi} Hari Kerja`;
    if (spt.lamaHari) return spt.lamaHari;
    if (spt.durasiHari) return `${spt.durasiHari} Hari`;
    const start = spt.tglMulai || spt.dariTanggal;
    const end = spt.tglSelesai || spt.sampaiTanggal;
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0) return `${diff} Hari Kerja`;
    }
    return '1 Hari Kerja';
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    return name
      .replace(/^(Dr\.|Drs\.|Ir\.|H\.|Hj\.)\s+/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  };

  const getSptTimeline = (spt) => {
    if (!spt) return [];
    if (spt.timeline && spt.timeline.length > 0) return spt.timeline;

    const events = [];
    const pemohonNama = spt.pemohon?.nama || (spt.anggota && spt.anggota[0]?.nama) || 'Pegawai Pemohon BRMP DIY';
    const entryDate = formatDateId(spt.tglPengajuan || spt.createdAt || spt.tanggalEntri);

    // 1. Pengajuan Usulan
    events.push({
      step: 1,
      title: 'Pengajuan Surat Perintah Tugas',
      actor: pemohonNama,
      role: 'Pemohon / Penanggung Jawab',
      time: entryDate,
      status: 'completed',
      note: `Usulan kegiatan dinas ke ${spt.tempatTujuan || spt.tujuanDaerah || 'lokasi'} berhasil diajukan ke sistem e-SPT.`
    });

    // 2. Verifikasi Ketimker
    const isKetimkerApproved = spt.approvalKetimker?.approved || spt.status === 'approved_ketimker' || spt.status === 'approved_kobag_tu' || spt.status === 'terbit' || spt.isApproved;
    events.push({
      step: 2,
      title: 'Verifikasi Tingkat Unit Kerja',
      actor: 'Ketua Tim Kerja (Ketimker)',
      role: 'Verifikator Tahap I',
      time: spt.approvalKetimker?.tanggal ? formatDateId(spt.approvalKetimker.tanggal) : (isKetimkerApproved ? 'Telah Diverifikasi' : 'Menunggu Pemeriksaan'),
      status: isKetimkerApproved ? 'completed' : 'pending',
      note: spt.catatanKetimker || spt.approvalKetimker?.catatan || (isKetimkerApproved ? 'Usulan disetujui sesuai dengan RKAL Balai.' : 'Memeriksa kesesuaian personil, urgensi lapangan, dan alokasi anggaran.')
    });

    // 3. Approval Kobag TU
    const isKobagApproved = spt.approvalKobag?.approved || spt.status === 'approved_kobag_tu' || spt.status === 'terbit' || spt.isApproved;
    events.push({
      step: 3,
      title: 'Persetujuan Kepala Bagian Tata Usaha',
      actor: 'Kepala Bagian Tata Usaha (Kobag TU)',
      role: 'Verifikator Tahap II',
      time: spt.approvalKobag?.tanggal ? formatDateId(spt.approvalKobag.tanggal) : (isKobagApproved ? 'Telah Disetujui' : (isKetimkerApproved ? 'Sedang Diproses' : 'Antrian')),
      status: isKobagApproved ? 'completed' : (isKetimkerApproved ? 'pending' : 'waiting'),
      note: spt.catatanKobagTu || spt.approvalKobag?.catatan || (isKobagApproved ? 'Disetujui. Lanjutkan penerbitan nomor surat resmi.' : 'Menunggu persetujuan administratif dan legalitas tata naskah.')
    });

    // 4. Penerbitan Nomor Surat & Pengesahan Balai
    const isTerbit = spt.status === 'terbit' || spt.isApproved;
    events.push({
      step: 4,
      title: 'Penerbitan Nomor & Pengesahan SPT Resmi',
      actor: 'Kepala Balai / Subbag Tata Usaha',
      role: 'Otorisasi Dokumen',
      time: isTerbit ? (spt.approvalKobag?.tanggal ? formatDateId(spt.approvalKobag.tanggal) : 'Resmi Terbit') : 'Belum Terbit',
      status: isTerbit ? 'completed' : (isKobagApproved ? 'pending' : 'waiting'),
      note: isTerbit ? `Nomor SPT resmi: ${spt.nomorSpt} telah terbit & disahkan.` : 'Menunggu penomoran resmi dari agenda tata persuratan Balai.'
    });

    // 5. Laporan Hasil Penugasan Kedinasan
    const hasLaporan = !!spt.laporan;
    events.push({
      step: 5,
      title: 'Laporan Hasil Penugasan Lapangan',
      actor: pemohonNama,
      role: 'Pelaksana Tugas',
      time: hasLaporan ? formatDateId(spt.laporan.createdAt || new Date()) : (isTerbit ? 'Belum Diunggah' : 'Menunggu Pelaksanaan'),
      status: hasLaporan ? 'completed' : (isTerbit ? 'pending' : 'waiting'),
      note: hasLaporan ? 'Laporan pertanggungjawaban kegiatan kedinasan telah diarsipkan.' : 'Laporan tertulis wajib diunggah paling lambat 5 hari setelah tugas.'
    });

    return events;
  };

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
    window.addEventListener('brmp_spt_updated', loadData);
    return () => window.removeEventListener('brmp_spt_updated', loadData);
  }, []);

  // Compute KPI Stats
  const stats = {
    total: sptList.length,
    menunggu: sptList.filter(s => s.status === 'diajukan' || (!s.isApproved && s.status !== 'terbit' && s.status !== 'selesai')).length,
    terbit: sptList.filter(s => s.status === 'terbit' || s.isApproved).length,
    selesai: sptList.filter(s => s.status === 'selesai' || s.laporan).length,
  };

  // Filtered SPT
  const filteredSptList = sptList.filter(spt => {
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'terbit' && (spt.status === 'terbit' || spt.isApproved)) ||
      (filterStatus === 'approved_kobag_tu' && spt.status === 'approved_kobag_tu') ||
      (filterStatus === 'approved_ketimker' && spt.status === 'approved_ketimker') ||
      (filterStatus === 'diajukan' && (spt.status === 'diajukan' || (!spt.isApproved && spt.status !== 'terbit'))) ||
      (filterStatus === 'selesai' && (spt.status === 'selesai' || spt.laporan));

    const searchMatch = !searchQuery || 
      (spt.nomorSpt && spt.nomorSpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.id && spt.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.tujuanDaerah && spt.tujuanDaerah.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.kotaTujuan && spt.kotaTujuan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.tempatTujuan && spt.tempatTujuan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.uraian && spt.uraian.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spt.anggota && spt.anggota.some(a => a.nama.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (spt.pemohon && spt.pemohon.nama && spt.pemohon.nama.toLowerCase().includes(searchQuery.toLowerCase()));

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
        <span className="spt-status-pill terbit">
          <CheckCircle2 size={13} />
          <span>SPT Terbit / Sah</span>
        </span>
      );
    }
    if (spt.status === 'approved_kobag_tu') {
      return (
        <span className="spt-status-pill kobag">
          <Clock size={13} />
          <span>Approved Kobag TU</span>
        </span>
      );
    }
    if (spt.status === 'approved_ketimker') {
      return (
        <span className="spt-status-pill ketimker">
          <Clock size={13} />
          <span>Approved Ketimker</span>
        </span>
      );
    }
    if (spt.status === 'selesai' || spt.laporan) {
      return (
        <span className="spt-status-pill selesai">
          <FileCheck size={13} />
          <span>Laporan Selesai</span>
        </span>
      );
    }
    return (
      <span className="spt-status-pill diajukan">
        <Clock size={13} />
        <span>Menunggu Verifikasi</span>
      </span>
    );
  };

  return (
    <div className="spt-report-page">
      {/* 1. Header & Action Banner */}
      <div className="spt-header-card no-print">
        <div className="spt-header-info">
          <div className="spt-header-icon-wrap">
            <Printer size={26} />
          </div>
          <div>
            <h1 className="spt-header-title">Tracking & Cetak Naskah Dinas Resmi SPT</h1>
            <div className="spt-header-breadcrumb">
              <span>KITA BRMP DIY</span>
              <span className="sep">/</span>
              <span>SPT Digital</span>
              <span className="sep">/</span>
              <span className="active-tag">Monitoring & Tata Naskah Dinas RI</span>
            </div>
          </div>
        </div>
        <div className="spt-header-actions">
          <button 
            type="button"
            className="spt-btn-add"
            onClick={onNavigateToPengajuan}
          >
            <Plus size={18} />
            <span>Ajukan SPT Baru</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards Grid */}
      <div className="spt-stats-grid no-print">
        <div 
          className={`spt-stat-card ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
          title="Klik untuk menampilkan seluruh SPT"
        >
          <div className="spt-stat-icon-wrap blue">
            <FileText size={22} />
          </div>
          <div className="spt-stat-data">
            <span className="spt-stat-num">{stats.total}</span>
            <span className="spt-stat-label">Total Surat Tugas</span>
          </div>
        </div>

        <div 
          className={`spt-stat-card ${filterStatus === 'diajukan' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'diajukan' ? 'all' : 'diajukan')}
          title="Klik untuk memfilter SPT yang sedang menunggu verifikasi"
        >
          <div className="spt-stat-icon-wrap amber">
            <Clock size={22} />
          </div>
          <div className="spt-stat-data">
            <span className="spt-stat-num">{stats.menunggu}</span>
            <span className="spt-stat-label">Menunggu Verifikasi</span>
          </div>
        </div>

        <div 
          className={`spt-stat-card ${filterStatus === 'terbit' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'terbit' ? 'all' : 'terbit')}
          title="Klik untuk memfilter SPT yang telah terbit & disahkan"
        >
          <div className="spt-stat-icon-wrap emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="spt-stat-data">
            <span className="spt-stat-num">{stats.terbit}</span>
            <span className="spt-stat-label">SPT Terbit & Sah</span>
          </div>
        </div>

        <div 
          className={`spt-stat-card ${filterStatus === 'selesai' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'selesai' ? 'all' : 'selesai')}
          title="Klik untuk memfilter SPT dengan laporan penugasan selesai"
        >
          <div className="spt-stat-icon-wrap purple">
            <FileCheck size={22} />
          </div>
          <div className="spt-stat-data">
            <span className="spt-stat-num">{stats.selesai}</span>
            <span className="spt-stat-label">Laporan Selesai</span>
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Filter Toolbar */}
      <div className="spt-toolbar-card no-print">
        <div className="spt-search-group">
          <Search size={18} className="spt-search-icon" />
          <input 
            type="text" 
            className="spt-search-input"
            placeholder="Cari nomor SPT, tempat tujuan, personil pelaksana, atau maksud tugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="spt-search-clear"
              onClick={() => setSearchQuery('')}
              title="Hapus pencarian"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="spt-filter-group">
          <Filter size={16} style={{ color: '#64748b' }} />
          <select 
            className="spt-select-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status Persetujuan</option>
            <option value="terbit">SPT Terbit & Sah</option>
            <option value="approved_kobag_tu">Approved Kobag TU</option>
            <option value="approved_ketimker">Approved Ketimker</option>
            <option value="diajukan">Menunggu Verifikasi</option>
            <option value="selesai">Laporan Kegiatan Selesai</option>
          </select>
        </div>

        <div className="spt-results-counter">
          Menampilkan <strong>{filteredSptList.length}</strong> dari <strong>{sptList.length}</strong> berkas SPT
        </div>
      </div>

      {/* 4. Main Table */}
      <div className="spt-table-card no-print">
        <div className="spt-table-responsive">
          <table className="spt-main-table">
            <thead>
              <tr>
                <th style={{ width: '210px' }}>Nomor SPT / ID</th>
                <th>Klasifikasi & Lokasi Penugasan</th>
                <th>Personil Pelaksana</th>
                <th style={{ width: '180px' }}>Jadwal & Durasi</th>
                <th style={{ width: '165px' }}>Status Verifikasi</th>
                <th style={{ width: '220px', textAlign: 'center' }}>Aksi & Dokumen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div className="spt-empty-state">
                      <Clock size={36} className="text-blue-500 animate-spin" style={{ marginBottom: '10px' }} />
                      <div className="spt-empty-title">Memuat data naskah SPT digital...</div>
                      <div className="spt-empty-subtitle">Menghubungkan ke basis data tata naskah dinas resmi BRMP DIY.</div>
                    </div>
                  </td>
                </tr>
              ) : filteredSptList.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="spt-empty-state">
                      <div className="spt-empty-icon">
                        <FileText size={28} />
                      </div>
                      <div className="spt-empty-title">Tidak ada dokumen SPT yang cocok</div>
                      <div className="spt-empty-subtitle">
                        Tidak ditemukan surat perintah tugas dengan kata kunci atau filter status yang dipilih.
                      </div>
                      {(searchQuery || filterStatus !== 'all') && (
                        <button 
                          type="button" 
                          className="spt-reset-btn"
                          onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                        >
                          Reset Pencarian & Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSptList.map((spt) => {
                  const members = spt.anggota || spt.pegawaiBertugas || [];
                  const isApproved = spt.status === 'terbit' || spt.isApproved;
                  const pemohonNama = spt.pemohon?.nama ? spt.pemohon.nama.split(',')[0] : 'Pegawai Balai';
                  const entryDate = formatDateId(spt.tglPengajuan || spt.tanggalEntri || spt.createdAt);

                  return (
                    <tr key={spt.id}>
                      {/* 1. Nomor SPT */}
                      <td className="spt-doc-col">
                        {isApproved && spt.nomorSpt && spt.nomorSpt !== 'Belum Terbit (Menunggu Verifikasi)' ? (
                          <div className="spt-nomor-badge official" title="Nomor SPT Resmi Terbit">
                            <FileText size={13} />
                            <span>{spt.nomorSpt}</span>
                          </div>
                        ) : (
                          <div className="spt-nomor-badge draft" title="Draf Usulan SPT">
                            <Clock size={13} />
                            <span>{spt.nomorSpt || `Draf #${spt.id}`}</span>
                          </div>
                        )}
                        <div className="spt-meta-entry">
                          <User size={12} style={{ color: '#94a3b8' }} />
                          <span>Oleh: {pemohonNama}</span>
                        </div>
                        <div className="spt-meta-entry">
                          <Calendar size={12} style={{ color: '#94a3b8' }} />
                          <span>Diajukan: {entryDate}</span>
                        </div>
                      </td>

                      {/* 2. Klasifikasi & Lokasi */}
                      <td className="spt-task-col">
                        <span className="spt-cat-tag">
                          {spt.klasifikasiNama || 'Tugas Kedinasan BRMP'}
                        </span>
                        <div className="spt-loc-row">
                          <MapPin size={14} className="text-red-500" style={{ flexShrink: 0 }} />
                          <span>{spt.tempatTujuan || spt.tujuanDaerah || spt.kotaTujuan}</span>
                        </div>
                        {(spt.uraian || spt.untukMelaksanakan) && (
                          <div className="spt-desc-snippet" title={spt.uraian || spt.untukMelaksanakan}>
                            {spt.uraian || spt.untukMelaksanakan}
                          </div>
                        )}
                      </td>

                      {/* 3. Personil Pelaksana */}
                      <td className="spt-personnel-col">
                        <div className="spt-members-list">
                          {members.slice(0, 2).map((m, idx) => {
                            const isPj = m.peranDalamTugas && (m.peranDalamTugas.toLowerCase().includes('pj') || m.peranDalamTugas.toLowerCase().includes('penanggung'));
                            return (
                              <div key={idx} className="spt-member-item">
                                <div className={`spt-avatar-circle ${isPj ? 'main' : 'sub'}`}>
                                  {getInitials(m.nama)}
                                </div>
                                <div className="spt-member-info">
                                  <span className="spt-member-name">{m.nama}</span>
                                  <span className={`spt-role-tag ${isPj ? 'pj' : 'ang'}`}>
                                    {isPj ? '★ PJ Kegiatan' : '• Anggota Pelaksana'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {members.length > 2 && (
                            <div className="spt-extra-badge">
                              +{members.length - 2} personil lainnya
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. Jadwal Penugasan */}
                      <td className="spt-schedule-col">
                        <div className="spt-date-box">
                          <Calendar size={14} className="text-blue-600" />
                          <span>{formatRangeId(spt.tglMulai || spt.dariTanggal, spt.tglSelesai || spt.sampaiTanggal)}</span>
                        </div>
                        <div className="spt-duration-pill">
                          <Clock size={12} />
                          <span>{getDurationText(spt)}</span>
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td>
                        {getStatusBadge(spt)}
                      </td>

                      {/* 6. Aksi & Dokumen */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="spt-actions-group">
                          {/* Tombol Histori Tracking */}
                          <button
                            type="button"
                            className="spt-action-btn view"
                            title="Lihat Histori Tracking & Alur Persetujuan"
                            onClick={() => setDetailSpt(spt)}
                          >
                            <Eye size={14} />
                            <span>Detail</span>
                          </button>

                          {/* Tombol Cetak Naskah Dinas Resmi */}
                          <button
                            type="button"
                            className={`spt-action-btn ${isApproved ? 'print-official' : 'print-draft'}`}
                            title={isApproved ? "Cetak Naskah Dinas Resmi Standar Kementerian Pertanian" : "Pratinjau Draf Naskah Dinas"}
                            onClick={() => setPrintSpt(spt)}
                          >
                            <Printer size={14} />
                            <span>{isApproved ? 'Cetak' : 'Draf'}</span>
                          </button>

                          {/* Tombol Laporan Penugasan */}
                          <button
                            type="button"
                            className={`spt-action-btn ${spt.laporan ? 'report-done' : 'report-upload'}`}
                            title={spt.laporan ? "Lihat / Edit Laporan Hasil Penugasan Dinas" : "Unggah Laporan Hasil Penugasan Kedinasan"}
                            onClick={() => openLaporanModal(spt)}
                          >
                            <FileCheck size={14} />
                            <span>{spt.laporan ? 'Laporan' : 'Unggah'}</span>
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
        <div className="spt-modal-overlay" onClick={() => setDetailSpt(null)}>
          <div className="spt-modal-container max-lg" onClick={(e) => e.stopPropagation()}>
            <div className="spt-modal-header">
              <div className="spt-modal-title-wrap">
                <div className="spt-modal-icon-badge blue">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="spt-modal-heading">Detail & Histori Tracking Alur SPT</h3>
                  <div className="spt-modal-subheading">Informasi naskah dinas, personil pelaksana, dan jejak audit verifikasi resmi</div>
                </div>
              </div>
              <button 
                type="button" 
                className="spt-modal-close-btn"
                onClick={() => setDetailSpt(null)}
                title="Tutup Modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="spt-modal-body">
              {/* 1. Overview Card */}
              <div className="spt-detail-card">
                <div className="spt-detail-top-row">
                  <div className="spt-detail-num-wrap">
                    <span className="spt-detail-nomor">
                      {detailSpt.nomorSpt || `Draft #${detailSpt.id}`}
                    </span>
                    {detailSpt.nomorSpt && (
                      <button 
                        type="button"
                        className="spt-btn-copy"
                        onClick={() => handleCopyNumber(detailSpt.nomorSpt)}
                        title="Salin nomor SPT"
                      >
                        {copiedNum ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedNum ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(detailSpt)}
                  </div>
                </div>

                {/* Classification & Task Description */}
                <div className="spt-detail-maksud-box">
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {detailSpt.klasifikasiNama || 'Tugas Kedinasan BRMP DIY'}
                  </div>
                  <div>{detailSpt.uraian || detailSpt.untukMelaksanakan}</div>
                </div>

                {/* 2x2 Grid of specific metadata */}
                <div className="spt-detail-grid">
                  <div className="spt-detail-item">
                    <div className="spt-detail-item-icon">
                      <MapPin size={16} />
                    </div>
                    <div className="spt-detail-item-content">
                      <span className="spt-detail-item-label">Tempat & Wilayah</span>
                      <span className="spt-detail-item-val">{detailSpt.tempatTujuan || detailSpt.tujuanDaerah}</span>
                      {detailSpt.kotaTujuan && detailSpt.kotaTujuan !== detailSpt.tempatTujuan && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{detailSpt.kotaTujuan}</span>
                      )}
                    </div>
                  </div>

                  <div className="spt-detail-item">
                    <div className="spt-detail-item-icon">
                      <Calendar size={16} />
                    </div>
                    <div className="spt-detail-item-content">
                      <span className="spt-detail-item-label">Jadwal & Durasi</span>
                      <span className="spt-detail-item-val">{formatRangeId(detailSpt.tglMulai || detailSpt.dariTanggal, detailSpt.tglSelesai || detailSpt.sampaiTanggal)}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{getDurationText(detailSpt)}</span>
                    </div>
                  </div>

                  <div className="spt-detail-item">
                    <div className="spt-detail-item-icon">
                      <User size={16} />
                    </div>
                    <div className="spt-detail-item-content">
                      <span className="spt-detail-item-label">Pemohon Penugasan</span>
                      <span className="spt-detail-item-val">{detailSpt.pemohon?.nama || 'Pegawai Balai'}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{detailSpt.pemohon?.unitKerja || 'BRMP DIY'}</span>
                    </div>
                  </div>

                  <div className="spt-detail-item">
                    <div className="spt-detail-item-icon">
                      <Building2 size={16} />
                    </div>
                    <div className="spt-detail-item-content">
                      <span className="spt-detail-item-label">Dasar Pembebanan</span>
                      <span className="spt-detail-item-val">DIPA Petikan BRMP DIY</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Tahun Anggaran 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Team Personnel Cards */}
              <div>
                <div className="spt-modal-section-title">
                  <User size={16} className="text-blue-600" />
                  <span>Personil & Tim Pelaksana ({(detailSpt.anggota || detailSpt.pegawaiBertugas || []).length} Orang)</span>
                </div>
                <div className="spt-personil-chips-wrap">
                  {(detailSpt.anggota || detailSpt.pegawaiBertugas || []).map((ang, idx) => {
                    const isPj = ang.peranDalamTugas && (ang.peranDalamTugas.toLowerCase().includes('pj') || ang.peranDalamTugas.toLowerCase().includes('penanggung'));
                    return (
                      <div key={idx} className="spt-personil-card">
                        <div className="spt-personil-left">
                          <div className={`spt-personil-avatar ${isPj ? 'main' : 'sub'}`}>
                            {getInitials(ang.nama)}
                          </div>
                          <div className="spt-personil-meta">
                            <span className="spt-personil-name">{ang.nama}</span>
                            <span className="spt-personil-nip">
                              NIP. {ang.nip || '-'} {ang.golongan ? `• Gol. ${ang.golongan}` : ''}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className={`spt-role-tag ${isPj ? 'pj' : 'ang'}`}>
                            {isPj ? '★ PJ Kegiatan' : '• Anggota Pelaksana'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Catatan Khusus Verifikator (if any) */}
              {(detailSpt.catatanKetimker || detailSpt.catatanKobagTu) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {detailSpt.catatanKetimker && (
                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: '#0369a1' }}>
                      <strong>Catatan Ketimker:</strong> {detailSpt.catatanKetimker}
                    </div>
                  )}
                  {detailSpt.catatanKobagTu && (
                    <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: '#7e22ce' }}>
                      <strong>Catatan Kobag TU:</strong> {detailSpt.catatanKobagTu}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Timeline Tracking Stepper */}
              <div>
                <div className="spt-modal-section-title">
                  <Clock size={16} className="text-blue-600" />
                  <span>Jejak Alur Persetujuan & Penerbitan Resmi</span>
                </div>
                <div className="spt-timeline-stepper">
                  {getSptTimeline(detailSpt).map((node, i) => (
                    <div key={i} className="spt-timeline-node">
                      <div className={`spt-timeline-bullet ${node.status}`}>
                        {node.status === 'completed' ? (
                          <Check size={16} strokeWidth={2.5} />
                        ) : node.status === 'pending' ? (
                          <Clock size={16} strokeWidth={2.5} />
                        ) : (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }} />
                        )}
                      </div>
                      <div className="spt-timeline-content">
                        <div className="spt-timeline-header-row">
                          <span className="spt-timeline-title">{node.title}</span>
                          <span className="spt-timeline-date">{node.time}</span>
                        </div>
                        <div className="spt-timeline-actor-row">
                          <User size={12} />
                          <span>{node.actor}</span>
                          <span style={{ color: '#94a3b8' }}>•</span>
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>{node.role}</span>
                        </div>
                        {node.note && (
                          <div className="spt-timeline-note-box">
                            {node.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="spt-modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setDetailSpt(null)}
              >
                Tutup
              </button>
              {(detailSpt.status === 'terbit' || detailSpt.isApproved) && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    const toPrint = detailSpt;
                    setDetailSpt(null);
                    setPrintSpt(toPrint);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={16} />
                  <span>Cetak Naskah Resmi SPT</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: UPLOAD LAPORAN HASIL PENUGASAN DINAS (MAKS 5MB)
          ========================================================================= */}
      {laporanModalSpt && (
        <div className="spt-modal-overlay" onClick={() => setLaporanModalSpt(null)}>
          <div className="spt-modal-container max-md" onClick={(e) => e.stopPropagation()}>
            <div className="spt-modal-header">
              <div className="spt-modal-title-wrap">
                <div className="spt-modal-icon-badge emerald">
                  <UploadCloud size={22} />
                </div>
                <div>
                  <h3 className="spt-modal-heading">Upload Laporan Hasil Penugasan Kedinasan</h3>
                  <div className="spt-modal-subheading">Pelaporan bukti pelaksanaan tugas dan pertanggungjawaban dinas</div>
                </div>
              </div>
              <button 
                type="button" 
                className="spt-modal-close-btn"
                onClick={() => setLaporanModalSpt(null)}
                title="Tutup Modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLaporan}>
              <div className="spt-modal-body">
                {/* Summary Context */}
                <div className="spt-upload-summary-box">
                  <div>
                    <div className="spt-upload-summary-title">
                      {laporanModalSpt.nomorSpt || `Usulan #${laporanModalSpt.id}`}
                    </div>
                    <div className="spt-upload-summary-sub">
                      Tujuan: <strong>{laporanModalSpt.tempatTujuan || laporanModalSpt.tujuanDaerah}</strong> • Waktu: {formatRangeId(laporanModalSpt.tglMulai || laporanModalSpt.dariTanggal, laporanModalSpt.tglSelesai || laporanModalSpt.sampaiTanggal)}
                    </div>
                  </div>
                  <div>
                    <span className="spt-cat-tag" style={{ margin: 0 }}>
                      {laporanModalSpt.klasifikasiNama || 'Tugas Kedinasan'}
                    </span>
                  </div>
                </div>

                {/* 1. Ringkasan Hasil Tugas */}
                <div className="spt-form-group">
                  <label className="spt-form-label">
                    <span>Ringkasan Hasil Pelaksanaan Tugas <span className="spt-req-star">*</span></span>
                    <span className="spt-char-counter">{isiLaporanText.length} karakter</span>
                  </label>
                  <textarea
                    className="spt-form-textarea"
                    rows={4}
                    value={isiLaporanText}
                    onChange={(e) => setIsiLaporanText(e.target.value)}
                    placeholder="Uraikan temuan lapangan, hasil koordinasi, tindak lanjut standar instrumen pertanian, dan capaian target penugasan..."
                    required
                  />
                </div>

                {/* 2. File Dokumen Laporan (Drag & Drop Zone) */}
                <div className="spt-form-group">
                  <label className="spt-form-label">
                    <span>Berkas Dokumen Laporan (PDF / DOC maks 5MB)</span>
                  </label>

                  {laporanFileName ? (
                    <div className="spt-selected-file-badge">
                      <div className="spt-selected-file-left">
                        <FileCheck size={18} />
                        <span>{laporanFileName}</span>
                      </div>
                      <button 
                        type="button" 
                        className="spt-remove-file-btn"
                        onClick={() => setLaporanFileName('')}
                        title="Hapus file terpilih"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="spt-file-dropzone">
                      <input 
                        type="file" 
                        className="spt-file-input-hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setLaporanFileName(e.target.files[0].name);
                          }
                        }}
                      />
                      <div className="spt-dropzone-icon">
                        <Paperclip size={20} />
                      </div>
                      <span className="spt-dropzone-text">Pilih atau seret berkas laporan ke sini</span>
                      <span className="spt-dropzone-hint">Mendukung format PDF, DOCX (Maksimal 5 MB)</span>
                    </div>
                  )}
                </div>

                {/* 3. Tautan Foto Dokumentasi Lapangan */}
                <div className="spt-form-group">
                  <label className="spt-form-label">
                    <span>Tautan Foto Dokumentasi Lapangan (Opsional)</span>
                  </label>
                  <input 
                    type="url" 
                    className="spt-form-input"
                    placeholder="https://images.unsplash.com/... atau URL link Google Drive / foto kegiatan"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                  {photoUrl && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img 
                        src={photoUrl} 
                        alt="Preview Foto" 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>✓ Pratinjau foto dokumentasi terhubung</span>
                    </div>
                  )}
                </div>

                {/* Foto Dokumentasi yang sudah ada */}
                {laporanModalSpt.laporan?.fotoDokumentasi && laporanModalSpt.laporan.fotoDokumentasi.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Galeri Foto Dokumentasi Tersimpan:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {laporanModalSpt.laporan.fotoDokumentasi.map((foto, idx) => (
                        <img 
                          key={idx}
                          src={foto.url} 
                          alt="Dokumentasi" 
                          style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* SOP Hint */}
                <div className="spt-sop-hint-alert">
                  <Info size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>
                    <strong>SOP Tata Persuratan BRMP DIY:</strong> Laporan hasil pelaksanaan penugasan wajib dilaporkan secara tertulis paling lambat <strong>5 hari kerja</strong> setelah pelaksanaan dinas selesai untuk pertanggungjawaban administrasi.
                  </span>
                </div>
              </div>

              <div className="spt-modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setLaporanModalSpt(null)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={savingLaporan}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileCheck size={16} />
                  <span>{savingLaporan ? 'Menyimpan...' : 'Simpan & Serahkan Laporan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
