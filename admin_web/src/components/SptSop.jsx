import React from 'react';
import { DATA_SOP_SPT } from '../data/sopData';
import { BookOpen, ShieldCheck, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export default function SptSop() {
  return (
    <div className="spt-module-container">
      {/* Header */}
      <div className="breadcrumb-banner no-print">
        <div>
          <h1 className="breadcrumb-title">
            <BookOpen size={24} className="text-blue-600" />
            <span>Standar Operasional Prosedur (SOP) Penerbitan SPT</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>SPT Digital</span>
            <span>/</span>
            <span className="current">SOP & Matriks Wewenang RACI</span>
          </div>
        </div>
        <div>
          <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            Nomor: {DATA_SOP_SPT.nomorSop}
          </span>
        </div>
      </div>

      <div className="card mb-4">
        <div style={{ padding: '24px' }}>
          {/* Dasar Hukum & Prinsip Utama */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Dasar Hukum */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
                <ShieldCheck size={18} />
                <span>📜 Landasan Yuridis & Dasar Hukum:</span>
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.6 }}>
                {DATA_SOP_SPT.dasarHukum.map((d, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Prinsip Pokok & Anti-Bentrok */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
                <ShieldCheck size={18} />
                <span>🛡️ Prinsip Utama Tata Kelola:</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {DATA_SOP_SPT.prinsipUtama.map((p, idx) => (
                  <div key={idx} style={{ fontSize: '12.5px' }}>
                    <strong style={{ color: '#0f172a' }}>{p.judul}:</strong>{' '}
                    <span style={{ color: '#475569' }}>{p.deskripsi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6 Tahap Alur */}
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Bagan 6 Tahap Alur Standar Pelayanan Penerbitan SPT:
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginBottom: '32px' }}>
            {DATA_SOP_SPT.tahapanAlur.map((step) => (
              <div 
                key={step.step}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    {step.step}
                  </span>
                  <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    SLA: {step.sla}
                  </span>
                </div>

                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', margin: '4px 0' }}>
                  {step.tahap}
                </h4>

                <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 600, marginBottom: '6px' }}>
                  Pelaksana: {step.pelaksana}
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 10px 0', flex: 1 }}>
                  {step.uraian}
                </p>

                <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: '#334155' }}>
                  <strong>Output:</strong> {step.output}
                </div>
              </div>
            ))}
          </div>

          {/* Matriks RACI */}
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Matriks Wewenang & Tanggung Jawab (RACI Matrix):
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
            R = Responsible (Pelaksana), A = Accountable (Penanggung Jawab Utama), C = Consulted (Pihak Berkonsultasi), I = Informed (Pihak Mendapat Informasi)
          </p>

          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Aktivitas Penugasan Kedinasan</th>
                  <th style={{ textAlign: 'center' }}>User / Pemohon</th>
                  <th style={{ textAlign: 'center' }}>Ketimker</th>
                  <th style={{ textAlign: 'center' }}>Kobag TU</th>
                  <th style={{ textAlign: 'center' }}>Kopoks</th>
                  <th style={{ textAlign: 'center' }}>Admin Sekretariat</th>
                </tr>
              </thead>
              <tbody>
                {DATA_SOP_SPT.matriksRaci.map((raci, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{raci.aktivitas}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: raci.user.includes('R') || raci.user.includes('A') ? '#2563eb' : '#64748b' }}>
                      {raci.user}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: raci.ketimker.includes('R') || raci.ketimker.includes('A') ? '#2563eb' : '#64748b' }}>
                      {raci.ketimker}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: raci.kobagTu.includes('R') || raci.kobagTu.includes('A') ? '#2563eb' : '#64748b' }}>
                      {raci.kobagTu}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: raci.kopoks.includes('R') || raci.kopoks.includes('A') ? '#2563eb' : '#64748b' }}>
                      {raci.kopoks}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: raci.adminSekretariat.includes('R') || raci.adminSekretariat.includes('A') ? '#2563eb' : '#64748b' }}>
                      {raci.adminSekretariat}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
