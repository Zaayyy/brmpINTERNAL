import { Router } from 'express';
import { generateMonthlyAbsensi, yearlyChartData } from '../data/store.js';

const router = Router();

// GET /api/absensi/bulanan?bulan=6&tahun=2025
router.get('/bulanan', (req, res) => {
  const bulan = parseInt(req.query.bulan) || 6;
  const tahun = parseInt(req.query.tahun) || 2025;

  const data = generateMonthlyAbsensi(bulan, tahun);

  res.json({
    success: true,
    data: {
      bulan,
      tahun,
      ...data
    }
  });
});

// GET /api/absensi/chart?tahun=2025
router.get('/chart', (req, res) => {
  const bulan = parseInt(req.query.bulan) || 6;
  const tahun = parseInt(req.query.tahun) || 2025;

  // Donut chart for current month
  const monthlyData = generateMonthlyAbsensi(bulan, tahun);
  const rekap = monthlyData.rekap;

  const donutChart = {
    labels: ['Masuk', 'Terlambat', 'Izin', 'Sakit', 'Alpha'],
    datasets: [
      {
        data: [rekap.totalMasuk, rekap.terlambat, rekap.izin, rekap.sakit, rekap.alpha],
        backgroundColor: [
          '#10b981', // green for masuk
          '#f59e0b', // amber for terlambat
          '#06b6d4', // cyan for izin
          '#8b5cf6', // purple for sakit
          '#ef4444'  // red for alpha
        ],
        hoverOffset: 4
      }
    ]
  };

  res.json({
    success: true,
    data: {
      bulan,
      tahun,
      donutChart,
      barChart: yearlyChartData
    }
  });
});

export default router;
