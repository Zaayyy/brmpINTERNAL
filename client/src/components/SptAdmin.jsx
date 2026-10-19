import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  FileCheck, 
  Settings, 
  Scale, 
  BookOpen, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  Upload, 
  Printer, 
  Building 
} from 'lucide-react';

export default function SptAdmin({ user }) {
  const [activeSubTab, setActiveSubTab] = useState('penerbitan'); // 'penerbitan' | 'menimbang' | 'dasar' | 'pegawai'
  const [sptList, setSptList] = useState([]);
  const [menimbangList, setMenimbangList] = useState([]);
  const [dasarList, setDasarList] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Penomoran modal/form state
  const [selectedSptToTerbit, setSelectedSptToTerbit] = useState(null);
  const [nomorSptInput, setNomorSptInput] = useState('');
  const [fileTtdName, setFileTtdName] = useState('');

  // Menimbang & Dasar editor state
  const [newMenimbangItem, setNewMenimbangItem] = useState('');
  const [newDasarItem, setNewDasarItem] = useState('');
  const [searchPegawai, setSearchPegawai] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [sptRes, pegRes] = await Promise.all([
        apiService.getSpt(),
        apiService.getPegawai()
      ]);

      if (sptRes) {
        if (sptRes.sptList) setSptList(sptRes.sptList);
        if (sptRes.menimbang) setMenimbangList(sptRes.menimbang);
        if (sptRes.dasar) setDasarList(sptRes.dasar);
      }
      if (pegRes) {
        setPegawaiList(pegRes);
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

  // Action: Terbitkan Nomor Resmi
  const handleOpenTerbitkan = (spt) => {
    setSelectedSptToTerbit(spt);
    setNomorSptInput(spt.nomorSpt || `B-${Math.floor(100 + Math.random() * 900)}/KP.320/H.14.7/10/2026`);
    setFileTtdName('');
  };

  const submitTerbitkan = async (e) => {
    e.preventDefault();
    if (!selectedSptToTerbit || !nomorSptInput.trim()) return;

    try {
      const res = await apiService.terbitkanSpt(selectedSptToTerbit.id, {
        nomorSpt: nomorSptInput.trim(),
        fileTtdName: fileTtdName || `SPT_${selectedSptToTerbit.id}_resmi_ttd.pdf`
      });

      if (res.success) {
        alert('Nomor dinas resmi berhasil diterbitkan! SPT siap dicetak.');
        setSelectedSptToTerbit(null);
        await loadData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menerbitkan nomor SPT');
    }
  };

  // Action: Save Menimbang
  const handleAddMenimbang = () => {
    if (!newMenimbangItem.trim()) return;
    setMenimbangList([...menimbangList, newMenimbangItem.trim()]);
    setNewMenimbangItem('');
  };

  const handleRemoveMenimbang = (idx) => {
    setMenimbangList(menimbangList.filter((_, i) => i !== idx));
  };

  const handleSaveAllMenimbang = async () => {
    try {
      const res = await apiService.saveMenimbang(menimbangList);
      if (res.success) {
        alert('Konsiderans Menimbang resmi berhasil disimpan!');
      }
    } catch (err) {
      alert(err.message || 'Gagal menyimpan konsiderans Menimbang');
    }
  };

  // Action: Save Dasar
  const handleAddDasar = () => {
    if (!newDasarItem.trim()) return;
    setDasarList([...dasarList, newDasarItem.trim()]);
    setNewDasarItem('');
  };

  const handleRemoveDasar = (idx) => {
    setDasarList(dasarList.filter((_, i) => i !== idx));
  };

  const handleSaveAllDasar = async () => {
    try {
      const res = await apiService.saveDasar(dasarList);
      if (res.success) {
        alert('Konsiderans Dasar Hukum resmi berhasil disimpan!');
      }
    } catch (err) {
      alert(err.message || 'Gagal menyimpan Dasar Hukum');
    }
  };

  // List ready for number issuance
  const readyForNumber = sptList.filter(s => s.status === 'approved_kobag_tu' || s.status === 'terbit');

  const filteredPegawai = pegawaiList.filter(p => 
    p.nama.toLowerCase().includes(searchPegawai.toLowerCase()) ||
    (p.nip && p.nip.includes(searchPegawai)) ||
    (p.unitKerja && p.unitKerja.toLowerCase().includes(searchPegawai.toLowerCase())) ||
    (p.jabatan && p.jabatan.toLowerCase().includes(searchPegawai.toLowerCase()))
  );

  return (
    <div className="spt-module-container">
      {/* Header */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <Settings size={24} className="text-blue-600" />
            <span>Pusat Administrasi & Tata Naskah Sekretariat BRMP DIY</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">Sekretariat: Penomoran Resmi, Menimbang, Dasar & Database</span>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '8px 16px', gap: '8px', borderRadius: '12px 12px 0 0' }}>
          <button
            onClick={() => setActiveSubTab('penerbitan')}
            className={`btn ${activeSubTab === 'penerbitan' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileCheck size={16} />
            <span>1. Penomoran & Terbitkan SPT ({readyForNumber.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('menimbang')}
            className={`btn ${activeSubTab === 'menimbang' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Scale size={16} />
            <span>2. Update Menimbang ({menimbangList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('dasar')}
            className={`btn ${activeSubTab === 'dasar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={16} />
            <span>3. Update Dasar Hukum ({dasarList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('pegawai')}
            className={`btn ${activeSubTab === 'pegawai' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={16} />
            <span>4. Database 115 Pegawai</span>
          </button>
        </div>

        {/* TAB 1: PENERBITAN & PENOMORAN RESMI */}
        {activeSubTab === 'penerbitan' && (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                Daftar SPT Siap Terbit & Penomoran Naskah Dinas Resmi
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Setelah disetujui Kobag TU, Sekretariat menginput nomor surat dinas resmi, mencetak naskah dinas, dan mengesahkan status Terbit.
              </p>
            </div>

            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>ID / Nomor Surat</th>
                    <th>Klasifikasi & Lokasi</th>
                    <th>Jadwal Penugasan</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Aksi Sekretariat</th>
                  </tr>
                </thead>
                <tbody>
                  {readyForNumber.map((spt) => (
                    <tr key={spt.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {spt.nomorSpt || `Draft #${spt.id}`}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Pemohon: {spt.pemohon?.nama || 'Pegawai'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12.5px' }}>{spt.klasifikasiNama || 'Tugas'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{spt.tempatTujuan || spt.tujuanDaerah}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{spt.tanggalSpt || spt.tglMulai}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{spt.lamaHari || `${spt.durasiHari || 1} hari`}</div>
                      </td>
                      <td>
                        {spt.status === 'terbit' ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                            ✓ Terbit & Siap Cetak
                          </span>
                        ) : (
                          <span style={{ background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                            Siap Input Nomor
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenTerbitkan(spt)}
                          style={{ fontSize: '11.5px', padding: '5px 10px' }}
                        >
                          {spt.status === 'terbit' ? '✏️ Edit Nomor / Berkas' : '⚡ Input Nomor & Sahkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: UPDATE MENIMBANG */}
        {activeSubTab === 'menimbang' && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                  Pengaturan Konsiderans Menimbang Resmi
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Butir-butir pertimbangan resmi yang otomatis tercetak pada bagian <strong>Menimbang</strong> naskah dinas SPT (a, b, c...).
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSaveAllMenimbang}>
                💾 Simpan Perubahan Menimbang
              </button>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {menimbangList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 700, color: '#2563eb', minWidth: '24px' }}>
                    {String.fromCharCode(97 + idx)}.
                  </span>
                  <input 
                    type="text" 
                    className="form-control"
                    value={item}
                    onChange={(e) => {
                      const updated = [...menimbangList];
                      updated[idx] = e.target.value;
                      setMenimbangList(updated);
                    }}
                    style={{ fontSize: '13px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveMenimbang(idx)}
                    title="Hapus butir"
                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Item */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="Tambah butir pertimbangan Menimbang baru (contoh: bahwa dalam rangka optimalisasi...)..."
                value={newMenimbangItem}
                onChange={(e) => setNewMenimbangItem(e.target.value)}
                style={{ fontSize: '13px' }}
              />
              <button className="btn btn-secondary" onClick={handleAddMenimbang} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={16} />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: UPDATE DASAR HUKUM */}
        {activeSubTab === 'dasar' && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                  Pengaturan Landasan Hukum Dasar
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Peraturan perundang-undangan dan DIPA yang otomatis tercetak pada bagian <strong>Dasar</strong> naskah dinas SPT (1, 2, 3...).
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSaveAllDasar}>
                💾 Simpan Perubahan Dasar Hukum
              </button>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {dasarList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 700, color: '#2563eb', minWidth: '24px' }}>
                    {idx + 1}.
                  </span>
                  <input 
                    type="text" 
                    className="form-control"
                    value={item}
                    onChange={(e) => {
                      const updated = [...dasarList];
                      updated[idx] = e.target.value;
                      setDasarList(updated);
                    }}
                    style={{ fontSize: '13px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveDasar(idx)}
                    title="Hapus dasar hukum"
                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Item */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="Tambah butir peraturan / DIPA baru (contoh: Peraturan Menteri Pertanian Nomor...)..."
                value={newDasarItem}
                onChange={(e) => setNewDasarItem(e.target.value)}
                style={{ fontSize: '13px' }}
              />
              <button className="btn btn-secondary" onClick={handleAddDasar} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={16} />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE 115 PEGAWAI */}
        {activeSubTab === 'pegawai' && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                  Database Personil Balai Penerapan Standar Instrumen Pertanian DIY ({pegawaiList.length} Pegawai)
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Referensi master data kepegawaian BRMP DIY untuk penugasan Surat Perintah Tugas digital.
                </p>
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="🔍 Cari nama, NIP, atau jabatan..."
                  value={searchPegawai}
                  onChange={(e) => setSearchPegawai(e.target.value)}
                  style={{ paddingLeft: '36px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
              <table className="app-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>No.</th>
                    <th>Nama & Gelar Pegawai</th>
                    <th>NIP</th>
                    <th>Golongan</th>
                    <th>Jabatan Kedinasan</th>
                    <th>Unit / Tim Kerja</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPegawai.slice(0, 50).map((peg, idx) => (
                    <tr key={peg.id || peg.nip}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}.</td>
                      <td style={{ fontWeight: 600 }}>{peg.nama}</td>
                      <td style={{ fontFamily: 'monospace' }}>{peg.nip || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{peg.golongan || '-'}</td>
                      <td>{peg.jabatan || '-'}</td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>{peg.unitKerja || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '8px' }}>
              Menampilkan {Math.min(filteredPegawai.length, 50)} dari {filteredPegawai.length} personil terdaftar.
            </div>
          </div>
        )}
      </div>

      {/* MODAL INPUT NOMOR SURAT RESMI */}
      {selectedSptToTerbit && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-dialog" style={{ maxWidth: '520px', width: '90%', background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '16px 20px', background: '#1e293b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 600 }}>
                Input Nomor Surat Dinas Resmi & Sahkan SPT
              </h3>
              <button onClick={() => setSelectedSptToTerbit(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={submitTerbitkan}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  Input nomor surat dinas resmi Kementerian Pertanian sesuai buku agenda sekretariat BRMP DIY.
                </p>

                <div className="form-group mb-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                    Nomor Surat Dinas Resmi <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={nomorSptInput}
                    onChange={(e) => setNomorSptInput(e.target.value)}
                    placeholder="Contoh: B-145/KP.320/H.14.7/10/2026"
                    required
                  />
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                    Format naskah dinas standar Kementan: B-[No]/KP.320/H.14.7/[Bulan]/[Tahun]
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                    Nama File Scan/Berkas Ter-TTD (Opsional)
                  </label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={fileTtdName}
                    onChange={(e) => setFileTtdName(e.target.value)}
                    placeholder="Contoh: SPT_Resmi_B-145_Kementan_BRMP_ttd.pdf"
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedSptToTerbit(null)}>Batal</button>
                <button type="submit" className="btn btn-primary">Sah & Terbitkan SPT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
