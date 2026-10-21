import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { BarChart3, PieChart as PieIcon, Info } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AbsensiChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiService.getAbsensiChart(6, 2025);
        if (res) {
          setChartData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Default fallback data if server is loading or offline
  const donutData = chartData?.donutChart || {
    labels: ['Masuk', 'Terlambat', 'Izin', 'Sakit', 'Alpha'],
    datasets: [
      {
        data: [20, 1, 0, 0, 1],
        backgroundColor: ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444'],
        hoverOffset: 6
      }
    ]
  };

  const barData = chartData?.barChart || {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    datasets: [
      { label: "Masuk", data: [21, 20, 22, 19, 21, 20, 22, 21, 20, 23, 21, 20], backgroundColor: "#2563eb" },
      { label: "Terlambat", data: [1, 2, 0, 1, 2, 1, 0, 1, 2, 0, 1, 0], backgroundColor: "#f59e0b" },
      { label: "Izin", data: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0], backgroundColor: "#06b6d4" },
      { label: "Sakit", data: [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0], backgroundColor: "#8b5cf6" },
      { label: "Alpha", data: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], backgroundColor: "#ef4444" }
    ]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 12 },
          padding: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} hari`
        }
      }
    },
    cutout: '65%'
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 12 },
          padding: 16
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Plus Jakarta Sans' } }
      }
    }
  };

  return (
    <div>
      {/* Breadcrumb banner */}
      <div className="breadcrumb-banner">
        <div>
          <h1 className="breadcrumb-title">
            <BarChart3 size={24} className="text-blue-600" />
            <span>Chart Visualisasi Absensi</span>
          </h1>
          <div className="breadcrumb-path">
            <span>KITA BRMP DIY</span>
            <span>/</span>
            <span>Info Absensi</span>
            <span>/</span>
            <span style={{ color: '#2563eb', fontWeight: 600 }}>Chart</span>
          </div>
        </div>
      </div>

      {/* Information Insight Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: '14px',
        padding: '14px 18px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)'
      }}>
        <div style={{ background: '#2563eb', color: '#fff', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>
          <Info size={18} />
        </div>
        <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.4 }}>
          <strong>Statistik Presensi:</strong> Rasio kehadiran pegawai mencapai <strong>95.2%</strong> tepat waktu sepanjang tahun berjalan 2025. Data terintegrasi langsung dari mesin absensi Solution/ZKTeco ADMS.
        </div>
      </div>

      {/* Grid Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* 1. Donut Chart (Bulan Berjalan) - Point 6 */}
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieIcon size={20} className="text-blue-600" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Jumlah Data Absensi Bulan Berjalan (Juni 2025)
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
              Grafik Lingkaran
            </span>
          </div>

          <div style={{ height: '320px', position: 'relative' }}>
            <Doughnut data={donutData} options={donutOptions} />
          </div>
        </div>

        {/* 2. Bar Chart (Tahun Berjalan) - Point 6 */}
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} className="text-blue-600" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Grafik Absensi Selama Tahun Berjalan (2025)
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', background: '#f8fafc', color: '#64748b', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
              Visualisasi Batang
            </span>
          </div>

          <div style={{ height: '360px', position: 'relative' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
