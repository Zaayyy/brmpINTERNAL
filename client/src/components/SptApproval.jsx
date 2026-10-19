import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Check, 
  X,
  AlertCircle,
  Building,
  Calendar
} from 'lucide-react';

export default function SptApproval({ user, onNavigateToReport }) {
  const [activeTab, setActiveTab] = useState('ketimker'); // 'ketimker' | 'kobag'
  const [sptList, setSptList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getSpt();
      if (res && res.sptList) {
        setSptList(res.sptList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (sptId, role) => {
    setProcessingId(sptId);
    try {
      const note = notes[sptId] || '';
      const res = await apiService.approveSpt(sptId, role, note);
      if (res.success) {
        alert(`Persetujuan tingkat ${role === 'ketimker' ? 'Unit Kerja (Ketimker)' : 'Kobag TU (Utama)'} berhasil disahkan!`);
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menyetujui SPT');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (sptId, role) => {
    const reason = prompt('Masukkan alasan penolakan / catatan revisi untuk pemohon:');
    if (!reason) return;

    setProcessingId(sptId);
    try {
      const res = await apiService.rejectSpt(sptId, role, reason);
      if (res.success) {
        alert('Status usulan berhasil diperbarui menjadi Ditolak / Perlu Perbaikan.');
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menolak SPT');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter lists based on approval workflow
  const ketimkerPending = sptList.filter(s => s.status === 'diajukan');
  const kobagPending = sptList.filter(s => s.status === 'approved_ketimker');

  return (
    <div className="spt-module-container">
      {/* Header */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <CheckCircle2 size={24} className="text-blue-600" />
            <span>Approval Berjenjang Surat Perintah Tugas (SPT)</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">Verifikasi Multi-Level (Ketimker & Kobag TU)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-4">
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '8px 16px', gap: '8px', borderRadius: '12px 12px 0 0' }}>
          <button
            onClick={() => setActiveTab('ketimker')}
            className={`btn ${activeTab === 'ketimker' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Building size={16} />
            <span>1. Approval Unit Kerja (Ketimker)</span>
            <span style={{ background: activeTab === 'ketimker' ? '#1d4ed8' : '#e2e8f0', color: activeTab === 'ketimker' ? '#fff' : '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
              {ketimkerPending.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('kobag')}
            className={`btn ${activeTab === 'kobag' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle2 size={16} />
            <span>2. Approval Utama (Kobag TU)</span>
            <span style={{ background: activeTab === 'kobag' ? '#1d4ed8' : '#e2e8f0', color: activeTab === 'kobag' ? '#fff' : '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
              {kobagPending.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Ketimker */}
        {activeTab === 'ketimker' && (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                Verifikasi Usulan Tingkat Unit Kerja (10 Tim Kerja BRMP DIY)
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Ketua Tim Kerja memeriksa relevansi personil pelaksana, urgensi lokasi penugasan, dan output kedinasan sebelum diteruskan ke Kepala Bagian Tata Usaha.
              </p>
            </div>

            {ketimkerPending.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px' }}>
                ✓ Tidak ada usulan penugasan dinas yang menunggu persetujuan Ketimker saat ini.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ketimkerPending.map((spt) => (
                  <div key={spt.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                          Menunggu Telaah Ketimker
                        </span>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '8px 0 4px 0' }}>
                          [{spt.klasifikasiNama || 'Penugasan'}] {spt.uraian || spt.untukMelaksanakan}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span>📍 Lokasi: <strong>{spt.tempatTujuan || spt.tujuanDaerah}</strong></span>
                          <span>📅 Jadwal: <strong>{spt.tanggalSpt || `${spt.tglMulai} s/d ${spt.tglSelesai}`}</strong> ({spt.lamaHari || `${spt.durasiHari || 1} hari`})</span>
                          <span>👤 Pemohon: <strong>{spt.pemohon?.nama || 'Pegawai'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Personil pelaksana list */}
                    <div style={{ margin: '12px 0', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}>
                      <strong style={{ display: 'block', marginBottom: '4px', color: '#334155' }}>Personil Pelaksana Tugas:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(spt.anggota || spt.pegawaiBertugas || []).map((ang, idx) => (
                          <span key={idx} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px' }}>
                            {ang.nama} • <em>{ang.peranDalamTugas || 'Pelaksana'}</em>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action form */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Catatan telaah Ketimker (opsional)..."
                        value={notes[spt.id] || ''}
                        onChange={(e) => setNotes({ ...notes, [spt.id]: e.target.value })}
                        style={{ flex: 1, minWidth: '220px', fontSize: '12.5px' }}
                      />
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleReject(spt.id, 'ketimker')}
                        disabled={processingId === spt.id}
                        style={{ color: '#ef4444', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <X size={15} />
                        <span>Minta Revisi / Tolak</span>
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleApprove(spt.id, 'ketimker')}
                        disabled={processingId === spt.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={15} />
                        <span>Setujui Usulan (Teruskan ke Kobag TU)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Kobag TU */}
        {activeTab === 'kobag' && (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                Persetujuan Utama (Kepala Bagian Tata Usaha - Agung Ariyanto, SEI., M.Ec., Dev.)
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Persetujuan substantif definitif sebelum penerbitan nomor dinas resmi dan tanda tangan resmi oleh Sekretariat.
              </p>
            </div>

            {kobagPending.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px' }}>
                ✓ Tidak ada usulan penugasan dinas yang menunggu persetujuan Kobag TU saat ini.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {kobagPending.map((spt) => (
                  <div key={spt.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                          Disetujui Ketimker • Menunggu Approval Kobag TU
                        </span>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '8px 0 4px 0' }}>
                          [{spt.klasifikasiNama || 'Penugasan'}] {spt.uraian || spt.untukMelaksanakan}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span>📍 Lokasi: <strong>{spt.tempatTujuan || spt.tujuanDaerah}</strong></span>
                          <span>📅 Jadwal: <strong>{spt.tanggalSpt || `${spt.tglMulai} s/d ${spt.tglSelesai}`}</strong> ({spt.lamaHari || `${spt.durasiHari || 1} hari`})</span>
                          <span>👤 Pemohon: <strong>{spt.pemohon?.nama || 'Pegawai'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {spt.catatanKetimker && (
                      <div style={{ margin: '8px 0', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#0369a1' }}>
                        <strong>Catatan Telaah Ketimker:</strong> {spt.catatanKetimker}
                      </div>
                    )}

                    {/* Personil pelaksana list */}
                    <div style={{ margin: '10px 0', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}>
                      <strong style={{ display: 'block', marginBottom: '4px', color: '#334155' }}>Personil Pelaksana Tugas:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(spt.anggota || spt.pegawaiBertugas || []).map((ang, idx) => (
                          <span key={idx} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px' }}>
                            {ang.nama} • <em>{ang.peranDalamTugas || 'Pelaksana'}</em>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action form */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Catatan kebijakan Kobag TU (opsional)..."
                        value={notes[spt.id] || ''}
                        onChange={(e) => setNotes({ ...notes, [spt.id]: e.target.value })}
                        style={{ flex: 1, minWidth: '220px', fontSize: '12.5px' }}
                      />
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleReject(spt.id, 'kobag_tu')}
                        disabled={processingId === spt.id}
                        style={{ color: '#ef4444', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <X size={15} />
                        <span>Minta Penyesuaian</span>
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleApprove(spt.id, 'kobag_tu')}
                        disabled={processingId === spt.id}
                        style={{ background: '#7e22ce', borderColor: '#7e22ce', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={15} />
                        <span>Setujui Definitif (Teruskan ke Sekretariat)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
