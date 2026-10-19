import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  CalendarOff, 
  Save, 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  ShieldCheck,
  UserCheck,
  Check,
  X,
  User,
  Users,
  Search,
  ArrowRight,
  Filter,
  Printer,
  ChevronRight,
  FileCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function PengajuanCuti({ user: initialUser, onSwitchUser }) {
  // Active Tab: 'form' | 'my-history' | 'verification' | 'user-roles'
  const [activeTab, setActiveTab] = useState('form');

  const [currentUser, setCurrentUser] = useState(initialUser);
  const [cutiSummary, setCutiSummary] = useState({
    totalPengajuan: 0,
    menungguVerif1: 0,
    menungguVerif2: 0,
    disetujui: 0,
    ditolak: 0
  });

  // Form states
  const [jenisCuti, setJenisCuti] = useState('Tahunan');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [alasan, setAlasan] = useState('');
  const [jumlahHari, setJumlahHari] = useState(0);

  // Data states
  const [myHistory, setMyHistory] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [pendingVerif1, setPendingVerif1] = useState([]);
  const [pendingVerif2, setPendingVerif2] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Loading & Alert states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal Verification Action (Approve / Reject)
  const [selectedCuti, setSelectedCuti] = useState(null);
  const [verifyStage, setVerifyStage] = useState(1);
  const [verifyAction, setVerifyAction] = useState('approve'); // 'approve' | 'reject'
  const [verifyNote, setVerifyNote] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
    }
  }, [initialUser]);

  // Compute number of days automatically
  useEffect(() => {
    if (tanggalMulai && tanggalAkhir) {
      const start = new Date(tanggalMulai);
      const end = new Date(tanggalAkhir);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setJumlahHari(days);
      } else {
        setJumlahHari(0);
      }
    } else {
      setJumlahHari(0);
    }
  }, [tanggalMulai, tanggalAkhir]);

  // Fetch initial cuti data
  const loadCutiData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCuti(currentUser?.nip, currentUser?.approvalRole);
      if (res) {
        if (res.user) {
          setCurrentUser(prev => ({ ...prev, ...res.user }));
        }
        if (res.summary) setCutiSummary(res.summary);
        if (res.myHistory) setMyHistory(res.myHistory);
        if (res.history) setAllHistory(res.history);
        if (res.pendingVerif1) setPendingVerif1(res.pendingVerif1);
        if (res.pendingVerif2) setPendingVerif2(res.pendingVerif2);
      }

      // Also fetch user list for admin/role switcher
      const usersRes = await apiService.getUsers();
      if (usersRes) setAllUsers(usersRes);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memuat data cuti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCutiData();
  }, [currentUser?.nip, currentUser?.approvalRole]);

  // Submit pengajuan cuti baru
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!jenisCuti || !tanggalMulai || !tanggalAkhir || !alasan.trim()) {
      setErrorMsg('Semua kolom form wajib diisi');
      return;
    }

    if (new Date(tanggalAkhir) < new Date(tanggalMulai)) {
      setErrorMsg('Tanggal akhir tidak boleh lebih awal dari tanggal mulai');
      return;
    }

    if (jenisCuti === 'Tahunan' && currentUser?.sisaCuti < jumlahHari) {
      setErrorMsg(`Sisa cuti Anda (${currentUser?.sisaCuti} hari) tidak mencukupi untuk ${jumlahHari} hari pengajuan.`);
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        pegawaiId: currentUser?.id,
        nip: currentUser?.nip,
        nama: currentUser?.nama,
        jabatan: currentUser?.jabatan,
        divisi: currentUser?.divisi,
        jenisCuti,
        tanggalMulai,
        tanggalAkhir,
        alasan
      };

      const res = await apiService.submitCuti(payload);
      if (res.success) {
        setSuccessMsg('Pengajuan cuti berhasil diajukan! Berkas otomatis masuk ke antrean Verifikasi 1 (Atasan Langsung).');
        // Reset form
        setAlasan('');
        setTanggalMulai('');
        setTanggalAkhir('');
        setJumlahHari(0);
        await loadCutiData();
        setActiveTab('my-history');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan pengajuan cuti.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Verify Modal
  const openVerificationModal = (cutiItem, stage, action) => {
    setSelectedCuti(cutiItem);
    setVerifyStage(stage);
    setVerifyAction(action);
    setVerifyNote(action === 'approve' ? 'Disetujui. Tugas dinas selama cuti telah dikoordinasikan.' : 'Mohon maaf, permohonan cuti belum dapat disetujui karena beban agenda dinas padat.');
    setShowVerifyModal(true);
  };

  // Submit Verification (Approve / Reject)
  const handleConfirmVerification = async () => {
    if (!selectedCuti) return;
    setActionLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await apiService.verifyCuti(
        selectedCuti.id,
        verifyStage,
        verifyAction,
        currentUser,
        verifyNote
      );

      if (res.success) {
        setSuccessMsg(res.message || 'Verifikasi berhasil disimpan.');
        setShowVerifyModal(false);
        setSelectedCuti(null);
        await loadCutiData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal melakukan verifikasi.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Cuti (Pemohon)
  const handleCancelCuti = async (cutiId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pengajuan cuti ini?')) return;
    try {
      setActionLoading(true);
      const res = await apiService.cancelCuti(cutiId);
      if (res.success) {
        setSuccessMsg('Pengajuan cuti berhasil dibatalkan.');
        await loadCutiData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membatalkan cuti.');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Change Employee Role
  const handleChangeRole = async (targetUserId, newRole) => {
    try {
      setActionLoading(true);
      const res = await apiService.updateUserRole(targetUserId, {
        approvalRole: newRole,
        systemRole: newRole === 'admin' ? 'admin' : 'pegawai'
      });

      if (res.success) {
        setSuccessMsg(`Role berhasil diubah menjadi: ${res.data.roleLabel}`);
        await loadCutiData();
        // If updating the active user itself, update state
        if (currentUser?.id === targetUserId || currentUser?.nip === targetUserId) {
          setCurrentUser(prev => ({
            ...prev,
            approvalRole: newRole,
            roleLabel: res.data.roleLabel,
            systemRole: newRole === 'admin' ? 'admin' : 'pegawai'
          }));
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memperbarui role pegawai.');
    } finally {
      setActionLoading(false);
    }
  };

  const jenisCutiList = [
    "Tahunan",
    "Sakit",
    "Alasan Penting",
    "Melahirkan",
    "Karena Istri Melahirkan",
    "Cuti Besar",
    "Cuti di Luar Tanggungan Negara"
  ];

  // Helper render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'menunggu_verif_1':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} />
            <span>Menunggu Verifikasi 1 (Atasan)</span>
          </span>
        );
      case 'menunggu_verif_2':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} />
            <span>Menunggu Verifikasi 2 (Kepala TU)</span>
          </span>
        );
      case 'disetujui':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <CheckCircle2 size={13} />
            <span>Disetujui Lengkap (Final)</span>
          </span>
        );
      case 'ditolak_verif_1':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <X size={13} />
            <span>Ditolak Verifikator 1</span>
          </span>
        );
      case 'ditolak_verif_2':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <X size={13} />
            <span>Ditolak Verifikator 2 (Kepala TU)</span>
          </span>
        );
      default:
        return <span className="status-badge pending">{status}</span>;
    }
  };

  // Helper render 2-step verification progress bar
  const renderVerificationStepper = (item) => {
    const v1 = item.verifikasi?.tahap1;
    const v2 = item.verifikasi?.tahap2;

    const isV1Done = v1?.status === 'disetujui';
    const isV1Rejected = v1?.status === 'ditolak';
    const isV2Done = v2?.status === 'disetujui';
    const isV2Rejected = v2?.status === 'ditolak';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
        {/* Step 1 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: isV1Done ? '#10b981' : isV1Rejected ? '#ef4444' : '#f59e0b',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 800,
            flexShrink: 0,
            marginTop: '1px'
          }}>
            {isV1Done ? '✓' : isV1Rejected ? '✕' : '1'}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>
              Tahap 1: Atasan Langsung
            </div>
            <div style={{ fontSize: '0.7rem', color: isV1Done ? '#15803d' : isV1Rejected ? '#b91c1c' : '#64748b' }}>
              {isV1Done ? `Disetujui (${v1?.verifikatorNama || 'Atasan'})` : isV1Rejected ? 'Ditolak Atasan' : 'Menunggu persetujuan'}
            </div>
            {v1?.catatan && (
              <div style={{ fontSize: '0.68rem', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                "{v1.catatan}"
              </div>
            )}
          </div>
        </div>

        {/* Connector Line */}
        <div style={{ width: '2px', height: '10px', background: isV1Done ? '#10b981' : '#cbd5e1', marginLeft: '9px' }} />

        {/* Step 2 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: isV2Done ? '#10b981' : isV2Rejected ? '#ef4444' : isV1Done ? '#f59e0b' : '#cbd5e1',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 800,
            flexShrink: 0,
            marginTop: '1px'
          }}>
            {isV2Done ? '✓' : isV2Rejected ? '✕' : '2'}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>
              Tahap 2: Kepala Bagian TU (Final)
            </div>
            <div style={{ fontSize: '0.7rem', color: isV2Done ? '#15803d' : isV2Rejected ? '#b91c1c' : '#64748b' }}>
              {isV2Done ? `Disetujui Final (${v2?.verifikatorNama || 'Kobag TU'})` : isV2Rejected ? 'Ditolak Kobag TU' : isV1Done ? 'Menunggu persetujuan' : 'Antre setelah tahap 1'}
            </div>
            {v2?.catatan && (
              <div style={{ fontSize: '0.68rem', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                "{v2.catatan}"
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Determine permissions
  const isVerifikator1 = currentUser?.approvalRole === 'verifikator_1' || currentUser?.approvalRole === 'admin' || currentUser?.systemRole === 'admin';
  const isVerifikator2 = currentUser?.approvalRole === 'verifikator_2' || currentUser?.approvalRole === 'admin' || currentUser?.systemRole === 'admin';
  const isAdmin = currentUser?.systemRole === 'admin' || currentUser?.approvalRole === 'admin';

  // Filtered inbox for verification
  const inboxItems = allHistory.filter(item => {
    if (currentUser?.approvalRole === 'verifikator_1') {
      return item.status === 'menunggu_verif_1';
    }
    if (currentUser?.approvalRole === 'verifikator_2') {
      return item.status === 'menunggu_verif_2';
    }
    return true; // Admin sees all
  });

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Breadcrumb Header */}
      <div className="breadcrumb-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="breadcrumb-title">
              <CalendarOff size={24} className="text-blue-600" />
              <span>Sistem Cuti Internal Pegawai BRMP DIY</span>
            </h1>
            <div className="breadcrumb-path">
              <span>KITA BRMP DIY</span>
              <span>/</span>
              <span>Cuti Pegawai</span>
              <span>/</span>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>Alur 2 Kali Verifikasi</span>
            </div>
          </div>

          {/* Current Active Role Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#ffffff',
            padding: '8px 14px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: isAdmin ? '#fee2e2' : isVerifikator2 ? '#fef3c7' : isVerifikator1 ? '#e0e7ff' : '#dcfce7',
              color: isAdmin ? '#dc2626' : isVerifikator2 ? '#d97706' : isVerifikator1 ? '#4338ca' : '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Peran Pengguna Saat Ini
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                {currentUser?.roleLabel || (isAdmin ? 'Administrator' : isVerifikator1 ? 'Verifikator 1 (Atasan)' : isVerifikator2 ? 'Verifikator 2 (Kobag TU)' : 'Pegawai (Pemohon)')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="brmp-card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Sisa Cuti Tahunan</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: '4px 0 0 0' }}>
                {currentUser?.sisaCuti ?? 12} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Hari</span>
              </h3>
            </div>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '10px', color: '#2563eb' }}>
              <Calendar size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '6px', fontWeight: 600 }}>
            • Terpakai: {currentUser?.cutiTerpakai || 0} hari
          </div>
        </div>

        <div className="brmp-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Menunggu Verif 1 (Atasan)</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: '4px 0 0 0' }}>
                {cutiSummary.menungguVerif1} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Berkas</span>
              </h3>
            </div>
            <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
              <Clock size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
            Tahap 1 Ketua Tim Kerja
          </div>
        </div>

        <div className="brmp-card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Menunggu Verif 2 (Kobag TU)</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5', margin: '4px 0 0 0' }}>
                {cutiSummary.menungguVerif2} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Berkas</span>
              </h3>
            </div>
            <div style={{ padding: '10px', background: '#e0e7ff', borderRadius: '10px', color: '#4f46e5' }}>
              <FileCheck size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
            Tahap 2 Persetujuan Akhir
          </div>
        </div>

        <div className="brmp-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Disetujui Lengkap</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', margin: '4px 0 0 0' }}>
                {cutiSummary.disetujui} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Berkas</span>
              </h3>
            </div>
            <div style={{ padding: '10px', background: '#dcfce7', borderRadius: '10px', color: '#15803d' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
            Selesai 2 kali verifikasi
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
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
          gap: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: 500 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#166534' }}>
            <X size={16} />
          </button>
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
          gap: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: 500 }}>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#b91c1c' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Modern Main Tab Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => setActiveTab('form')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'form' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'form' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'form' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <CalendarOff size={17} />
          <span>Form Pengajuan Cuti</span>
        </button>

        <button
          onClick={() => setActiveTab('my-history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'my-history' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'my-history' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'my-history' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Clock size={17} />
          <span>Riwayat Cuti Saya</span>
          <span style={{ background: activeTab === 'my-history' ? '#eff6ff' : '#f1f5f9', color: activeTab === 'my-history' ? '#2563eb' : '#64748b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            {myHistory.length}
          </span>
        </button>

        {/* Tab Verifikasi (Tersedia untuk Verifikator 1, Verifikator 2, atau Admin) */}
        {(isVerifikator1 || isVerifikator2 || isAdmin) && (
          <button
            onClick={() => setActiveTab('verification')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'verification' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'verification' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'verification' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <ShieldCheck size={17} />
            <span>Persetujuan / Verifikasi Cuti</span>
            {(pendingVerif1.length > 0 || pendingVerif2.length > 0) && (
              <span style={{ background: '#f59e0b', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                {isVerifikator1 && !isVerifikator2 ? pendingVerif1.length :
                 isVerifikator2 && !isVerifikator1 ? pendingVerif2.length :
                 pendingVerif1.length + pendingVerif2.length}
              </span>
            )}
          </button>
        )}

        {/* Tab Manajemen Role Pegawai (Khusus Admin / Pengaturan Role) */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('user-roles')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'user-roles' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'user-roles' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'user-roles' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Users size={17} />
            <span>Kelola Role Pegawai (Admin)</span>
          </button>
        )}
      </div>

      {/* TAB 1: FORMULIR PENGAJUAN CUTI */}
      {activeTab === 'form' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 480px) 1fr', gap: '1.75rem', alignItems: 'start' }}>
          {/* Left: Input Form */}
          <div className="brmp-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                <CalendarOff size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Form Pengajuan Cuti
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Otomatis diverifikasi 2 tahap (Atasan & Kobag TU)
                </span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Pegawai Info */}
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Pemohon:</span>
                  <strong style={{ color: '#1e293b' }}>{currentUser?.nama}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>NIP / Jabatan:</span>
                  <span style={{ color: '#475569' }}>{currentUser?.nip} ({currentUser?.jabatan})</span>
                </div>
              </div>

              {/* Jenis Cuti */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Jenis Cuti</label>
                <select
                  className="form-input"
                  value={jenisCuti}
                  onChange={(e) => setJenisCuti(e.target.value)}
                  style={{ height: '42px' }}
                >
                  {jenisCutiList.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal Mulai & Akhir */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Tanggal Mulai</label>
                  <input
                    type="date"
                    className="form-input"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Tanggal Akhir</label>
                  <input
                    type="date"
                    className="form-input"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Total Hari Kalkulasi */}
              {jumlahHari > 0 && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Calendar size={16} />
                    <span>Total Durasi Cuti:</span>
                  </div>
                  <span style={{ background: '#16a34a', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem' }}>
                    {jumlahHari} Hari Kerja
                  </span>
                </div>
              )}

              {/* Alasan Cuti */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Alasan Cuti</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Tuliskan alasan lengkap pengajuan cuti Anda..."
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Tombol Simpan & Kirim */}
              <button
                type="submit"
                className="btn-primary"
                disabled={actionLoading}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '8px',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                }}
              >
                <Save size={18} />
                <span>{actionLoading ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Cuti'}</span>
              </button>
            </form>
          </div>

          {/* Right: Alur Verifikasi & Ketentuan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="brmp-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} className="text-blue-600" />
                <span>Alur 2 Kali Verifikasi Pengajuan Cuti</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Step 1 Box */}
                <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                      Verifikasi 1: Atasan Langsung / Ketua Tim Kerja
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      Ketua Tim Kerja (Ketimker) memeriksa ketersediaan pengganti tugas, relevansi alasan, dan jadwal kegiatan tim sebelum memberikan persetujuan awal.
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <ArrowRight size={18} style={{ transform: 'rotate(90deg)' }} />
                </div>

                {/* Step 2 Box */}
                <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                      Verifikasi 2: Kepala Bagian Tata Usaha (Persetujuan Final)
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      Kobag TU memberikan pengesahan cuti definitif. Sisa cuti tahunan pegawai otomatis terpotong dan lembar persetujuan cuti resmi dapat dicetak.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Sisa Cuti Info */}
            <div className="brmp-card" style={{ padding: '1.25rem', background: '#faf5ff', border: '1px solid #e9d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7e22ce', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                <Sparkles size={16} />
                <span>Ketentuan Sisa Cuti & Kuota Tahunan</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b21a8', lineHeight: 1.5 }}>
                Berdasarkan regulasi BKN & Kementan RI, kuota cuti tahunan pegawai adalah 12 hari kerja per tahun kalender. Hak cuti yang tidak digunakan dapat hangus sesuai batas waktu kadaluarsa kedinasan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT CUTI SAYA */}
      {activeTab === 'my-history' && (
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Riwayat Pengajuan Cuti Saya
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Pantau progres status verifikasi 2 tahap secara transparan
              </span>
            </div>

            <button
              onClick={() => setActiveTab('form')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563eb',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <CalendarOff size={15} />
              <span>Ajukan Cuti Baru</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="brmp-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>NO</th>
                  <th>TGL PENGAJUAN</th>
                  <th>RENTANG TANGGAL</th>
                  <th>DURASI</th>
                  <th>JENIS CUTI</th>
                  <th>ALASAN</th>
                  <th style={{ minWidth: '240px' }}>PROGRES 2 VERIFIKASI</th>
                  <th>STATUS AKHIR</th>
                  <th style={{ textAlign: 'center' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {myHistory.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      <CalendarOff size={36} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                      <div>Belum ada pengajuan cuti yang tercatat.</div>
                    </td>
                  </tr>
                ) : (
                  myHistory.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                      <td>{item.tanggalPengajuan}</td>
                      <td>
                        <strong>{item.tanggalMulai}</strong> <br />
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>s/d {item.tanggalAkhir}</span>
                      </td>
                      <td>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                          {item.jumlahHari} hari
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.jenisCuti}</span>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.8rem', color: '#475569' }}>
                        {item.alasan}
                      </td>
                      <td>
                        {renderVerificationStepper(item)}
                      </td>
                      <td>
                        {renderStatusBadge(item.status)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.status === 'menunggu_verif_1' && (
                          <button
                            onClick={() => handleCancelCuti(item.id)}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fca5a5',
                              color: '#dc2626',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            title="Batalkan permohonan cuti"
                          >
                            Batalkan
                          </button>
                        )}

                        {item.status === 'disetujui' && (
                          <button
                            onClick={() => window.print()}
                            style={{
                              background: '#f0fdf4',
                              border: '1px solid #86efac',
                              color: '#15803d',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Cetak lembar persetujuan cuti"
                          >
                            <Printer size={13} />
                            <span>Cetak</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INBOX VERIFIKASI CUTI (APPROVAL BERJENJANG) */}
      {activeTab === 'verification' && (
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} className="text-blue-600" />
                <span>Inbox Persetujuan Cuti Pegawai</span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Hak wewenang Anda: <strong>{currentUser?.roleLabel}</strong>
              </span>
            </div>

            {/* Stage filter pills */}
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === 'all' ? '#fff' : 'transparent',
                  color: statusFilter === 'all' ? '#2563eb' : '#64748b',
                  boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Semua Antrean ({allHistory.length})
              </button>
              <button
                onClick={() => setStatusFilter('tahap1')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === 'tahap1' ? '#fff' : 'transparent',
                  color: statusFilter === 'tahap1' ? '#d97706' : '#64748b',
                  boxShadow: statusFilter === 'tahap1' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Tahap 1 Menunggu ({pendingVerif1.length})
              </button>
              <button
                onClick={() => setStatusFilter('tahap2')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === 'tahap2' ? '#fff' : 'transparent',
                  color: statusFilter === 'tahap2' ? '#4f46e5' : '#64748b',
                  boxShadow: statusFilter === 'tahap2' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Tahap 2 Menunggu ({pendingVerif2.length})
              </button>
            </div>
          </div>

          {/* Table Inbox */}
          <div style={{ overflowX: 'auto' }}>
            <table className="brmp-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>DATA PEGAWAI</th>
                  <th>TGL CUTI</th>
                  <th>DURASI</th>
                  <th>JENIS & ALASAN</th>
                  <th>STATUS SAAT INI</th>
                  <th style={{ minWidth: '180px' }}>AKSI VERIFIKASI</th>
                </tr>
              </thead>
              <tbody>
                {allHistory
                  .filter(item => {
                    if (statusFilter === 'tahap1') return item.status === 'menunggu_verif_1';
                    if (statusFilter === 'tahap2') return item.status === 'menunggu_verif_2';
                    return true;
                  })
                  .map((item, idx) => {
                    const canVerifyTahap1 = (isVerifikator1 || isAdmin) && item.status === 'menunggu_verif_1';
                    const canVerifyTahap2 = (isVerifikator2 || isAdmin) && item.status === 'menunggu_verif_2';

                    return (
                      <tr key={item.id || idx}>
                        <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                        <td>
                          <strong style={{ display: 'block', color: '#1e293b' }}>{item.nama}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>NIP: {item.nip}</span> <br />
                          <span style={{ fontSize: '0.7rem', color: '#2563eb' }}>{item.divisi}</span>
                        </td>
                        <td>
                          <strong>{item.tanggalMulai}</strong> <br />
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>s/d {item.tanggalAkhir}</span>
                        </td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                            {item.jumlahHari} hari
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{item.jenisCuti}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', maxWidth: '180px' }}>
                            "{item.alasan}"
                          </div>
                        </td>
                        <td>
                          {renderStatusBadge(item.status)}
                        </td>
                        <td>
                          {/* Aksi Verifikasi Tahap 1 */}
                          {canVerifyTahap1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <span style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 700 }}>
                                Wewenang: Verifikator 1
                              </span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => openVerificationModal(item, 1, 'approve')}
                                  style={{
                                    background: '#16a34a',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Check size={14} />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={() => openVerificationModal(item, 1, 'reject')}
                                  style={{
                                    background: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <X size={14} />
                                  <span>Tolak</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Aksi Verifikasi Tahap 2 */}
                          {canVerifyTahap2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <span style={{ fontSize: '0.68rem', color: '#4338ca', fontWeight: 700 }}>
                                Wewenang: Verifikator 2 (Final)
                              </span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => openVerificationModal(item, 2, 'approve')}
                                  style={{
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Setujui Final</span>
                                </button>
                                <button
                                  onClick={() => openVerificationModal(item, 2, 'reject')}
                                  style={{
                                    background: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <X size={14} />
                                  <span>Tolak</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Info Jika Bukan Giliran Verifikasi */}
                          {!canVerifyTahap1 && !canVerifyTahap2 && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                              {item.status === 'disetujui' ? 'Sudah selesai disetujui' :
                               item.status.startsWith('ditolak') ? 'Berkas sudah ditolak' :
                               item.status === 'menunggu_verif_1' ? 'Menunggu verifikasi Atasan Langsung' :
                               'Menunggu verifikasi Kepala TU'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KELOLA ROLE PEGAWAI (KHUSUS ADMIN) */}
      {activeTab === 'user-roles' && isAdmin && (
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} className="text-blue-600" />
                <span>Manajemen Hak Akses & Role Pegawai</span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Ganti peran kedinasan pegawai (Pemohon Cuti, Verifikator 1, Verifikator 2, atau Admin) secara langsung
              </span>
            </div>

            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
              {allUsers.length} Pegawai Terdaftar
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="brmp-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>NIP & NAMA PEGAWAI</th>
                  <th>JABATAN / DIVISI</th>
                  <th>SISA CUTI</th>
                  <th>PERAN AKTIF (ROLE)</th>
                  <th style={{ minWidth: '220px' }}>GANTI ROLE PEGAWAI</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((peg, idx) => (
                  <tr key={peg.id || idx}>
                    <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{peg.nama}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NIP: {peg.nip}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{peg.jabatan}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{peg.divisi}</div>
                    </td>
                    <td>
                      <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
                        {peg.sisaCuti} Hari
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: peg.approvalRole === 'admin' ? '#fee2e2' : peg.approvalRole === 'verifikator_2' ? '#fef3c7' : peg.approvalRole === 'verifikator_1' ? '#e0e7ff' : '#f1f5f9',
                        color: peg.approvalRole === 'admin' ? '#dc2626' : peg.approvalRole === 'verifikator_2' ? '#d97706' : peg.approvalRole === 'verifikator_1' ? '#4338ca' : '#475569'
                      }}>
                        {peg.roleLabel || peg.approvalRole}
                      </span>
                    </td>
                    <td>
                      <select
                        value={peg.approvalRole}
                        onChange={(e) => handleChangeRole(peg.id || peg.nip, e.target.value)}
                        disabled={actionLoading}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        <option value="pemohon">Pegawai Biasa (Pemohon Cuti)</option>
                        <option value="verifikator_1">Verifikator 1 (Atasan / Ketimker)</option>
                        <option value="verifikator_2">Verifikator 2 (Kepala Bagian TU)</option>
                        <option value="admin">Administrator Kepegawaian</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI (SETUJUI / TOLAK) */}
      {showVerifyModal && selectedCuti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {verifyAction === 'approve' ? (
                  <CheckCircle2 size={22} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={22} className="text-red-600" />
                )}
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {verifyAction === 'approve' ? `Setujui Verifikasi Tahap ${verifyStage}` : `Tolak Pengajuan Tahap ${verifyStage}`}
                </h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Pemohon Cuti:</span>
                <strong style={{ color: '#1e293b' }}>{selectedCuti.nama}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Jenis & Durasi:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{selectedCuti.jenisCuti} ({selectedCuti.jumlahHari} hari)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Alasan:</span>
                <span style={{ color: '#475569', fontStyle: 'italic' }}>"{selectedCuti.alasan}"</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                Catatan Verifikasi {verifyAction === 'reject' ? '(Wajib - Alasan Penolakan)' : '(Opsional)'}
              </label>
              <textarea
                className="form-input"
                rows="3"
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                placeholder="Tuliskan catatan disposisi / verifikasi..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowVerifyModal(false)}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmVerification}
                disabled={actionLoading}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: verifyAction === 'approve' ? '#16a34a' : '#dc2626',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {verifyAction === 'approve' ? <Check size={16} /> : <X size={16} />}
                <span>{actionLoading ? 'Memproses...' : verifyAction === 'approve' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
