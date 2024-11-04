"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { ChartOptions } from 'chart.js';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

interface Notification {
  _id: string;
  sender: string;
  title: string;
  date: string;
  __v: number;
}

interface Repair {
  _id: string;
  sender: string;
  title: string;
  body: string
  date: string;
  __v: number;
}

const Insight = () => {
  const [activeTab, setActiveTab] = useState<'notification' | 'repair'>('notification');
  const [notificationData, setNotificationData] = useState<any>(null);
  const [notificationDataList, setNotificationDataList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repairData, setRepairData] = useState<any>(null);
  const [repairDataList, setRepairDataList] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'notification') {
          const response = await fetch('https://pju-backend.vercel.app/api/notification');
          const data: Notification[] = await response.json();
          setNotificationDataList(data);

          // Proses data notifikasi seperti sebelumnya
          const groupedData: { [key: string]: { issues: number; lampOn: number; lampOff: number } } = {};

          data.forEach(item => {
            const date = new Date(item.date).toLocaleDateString();
            if (!groupedData[date]) {
              groupedData[date] = { issues: 0, lampOn: 0, lampOff: 0 };
            }
            if (item.title.includes('tidak dapat')) {
              groupedData[date].issues += 1;
            } else if (item.title.includes('telah dinyalakan')) {
              groupedData[date].lampOn += 1;
            } else if (item.title.includes('telah dimatikan')) {
              groupedData[date].lampOff += 1;
            }
          });

          const labels = Object.keys(groupedData);
          const issuesData = labels.map(date => groupedData[date].issues);
          const lampOnData = labels.map(date => groupedData[date].lampOn);
          const lampOffData = labels.map(date => groupedData[date].lampOff);

          setNotificationData({
            labels,
            datasets: [
              {
                label: 'Issues',
                data: issuesData,
                borderColor: '#f97316', // Orange
                backgroundColor: '#f97316',
                borderWidth: 2,
                pointRadius: 3,
                fill: false,
              },
              {
                label: 'Lamp On',
                data: lampOnData,
                borderColor: '#3b82f6', // Blue
                backgroundColor: '#3b82f6',
                borderWidth: 2,
                pointRadius: 3,
                fill: false,
              },
              {
                label: 'Lamp Off',
                data: lampOffData,
                borderColor: '#808080', // Gray
                backgroundColor: '#808080',
                borderWidth: 2,
                pointRadius: 3,
                fill: false,
              },
            ],
          });
        } else if (activeTab === 'repair') {
          const response = await fetch('https://pju-backend.vercel.app/api/responses'); // Ganti dengan endpoint API Repair yang sesuai
          const data: Repair[] = await response.json();
          setRepairDataList(data);

          // Proses data repair sesuai struktur data
          const groupedRepairData: { [key: string]: { sensor: number; lampu: number; komunikasi: number } } = {};

          data.forEach(item => {
            const date = new Date(item.date).toLocaleDateString();
            if (!groupedRepairData[date]) {
              groupedRepairData[date] = { sensor: 0, lampu: 0, komunikasi: 0 };
            }
            if (item.body.includes('permasalahan sensor')) {
              groupedRepairData[date].sensor += 1;
            } if (item.body.includes('permasalahan bola lampu') || item.body.includes('permasalahan Bola lampu')) {
              groupedRepairData[date].lampu += 1;
            } else if (item.body.includes('permasalahan komunikasi') || item.body.includes('permasalahan communication')) {
              groupedRepairData[date].komunikasi += 1;
            }
          });

          const labels = Object.keys(groupedRepairData);
          const sensorData = labels.map(date => groupedRepairData[date].sensor);
          const lampuData = labels.map(date => groupedRepairData[date].lampu);
          const komunikasiData = labels.map(date => groupedRepairData[date].komunikasi);

          setRepairData({
            labels,
            datasets: [
              {
                label: 'Sensor Issues',
                data: sensorData,
                borderColor: '#ef4444', // Red
                backgroundColor: '#ef4444',
                borderWidth: 2,
                pointRadius: 3,
                fill: false,
              },
              {
                label: 'Lamp Issues',
                data: lampuData,
                borderColor: '#3b82f6', // Blue
                backgroundColor: '#3b82f6',
                borderWidth: 2,
                pointRadius: 3,
                fill: false,
              },
              {
                label: 'Communication Issues',
                data: komunikasiData,
                borderColor: '#f59e0b', // Amber
                backgroundColor: '#f59e0b',
                borderWidth: 2,
                pointRadius: 3,
                fill: false,
              },
            ],
          });
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleDownloadExcel = () => {
    // Data yang ingin diunduh (gunakan notificationData atau repairData sesuai kondisi tab)
    const dataToExport = activeTab === 'notification' ? notificationDataList : repairDataList;

    if (!dataToExport || dataToExport.length === 0) {
      alert('Tidak ada data untuk diunduh');
      return;
    }

    // Konversi data ke format yang sesuai untuk Excel
    const formattedDataNotification = dataToExport.map((item: any) => ({
      ID: item._id,
      Sender: item.sender,
      Title: item.title,
      Date: new Date(item.date).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      __v: item.__v,
    }));

    // Konversi data ke format yang sesuai untuk Excel
    const formattedDataRepair = dataToExport.map((item: any) => ({
      ID: item._id,
      Sender: item.sender,
      Title: item.title,
      Body: item.body,
      Date: new Date(item.date).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      __v: item.__v,
    }));

    const formattedData = activeTab === 'notification' ? formattedDataNotification : formattedDataRepair;

    // Buat workbook dan worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Insight');

    // Unduh file Excel
    XLSX.writeFile(workbook, `${activeTab}-data.xlsx`);
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
      },
    },
    layout: {
      padding: {
        top: 10,
        left: 10,
        right: 10,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tanggal',
        },
      },
      y: {
        title: {
          display: true,
          text: activeTab === 'notification' ? 'Notifikasi' : 'Perbaikan',
        },
        beginAtZero: true,
      },
    },
  };

  // Hitung statistik berdasarkan activeTab
  const totalIssues = notificationData?.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) || 0;
  const totalLampOn = notificationData?.datasets[1]?.data.reduce((a: number, b: number) => a + b, 0) || 0;
  const totalLampOff = notificationData?.datasets[2]?.data.reduce((a: number, b: number) => a + b, 0) || 0;

  const totalSensor = repairData?.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) || 0;
  const totalLampu = repairData?.datasets[1]?.data.reduce((a: number, b: number) => a + b, 0) || 0;
  const totalKomunikasi = repairData?.datasets[2]?.data.reduce((a: number, b: number) => a + b, 0) || 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <div className="loader mb-4"></div> {/* Spinner */}
            <p className="text-lg font-semibold text-white">Loading...</p>
          </div>
        </div>
      )}
      <Sidebar className="w-1/4 lg:w-1/5 h-full" />
      <div className="flex flex-col flex-grow h-full overflow-y-auto">
        <Navbar />
        <div className="p-2 sm:p-4 bg-gray-200 w-full flex-grow">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 text-black">Insight Section</h1>
            {/* Tab Menu */}
              <div className="mb-4 flex space-x-2 sm:space-x-4">
                <button
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold focus:outline-none transition duration-200 ease-in-out transform ${
                    activeTab === 'notification'
                      ? 'bg-blue-600 text-white hover:bg-blue-500 hover:text-white hover:scale-105'
                      : 'bg-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white hover:scale-105'
                  }`}
                  onClick={() => setActiveTab('notification')}
                >
                  Notification
                </button>
                <button
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold focus:outline-none transition duration-200 ease-in-out transform ${
                    activeTab === 'repair'
                      ? 'bg-blue-600 text-white hover:bg-blue-500 hover:text-white hover:scale-105'
                      : 'bg-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white hover:scale-105'
                  }`}
                  onClick={() => setActiveTab('repair')}
                >
                  Repair
                </button>
              </div>
          <hr className="border-2 border-gray-500 w-full mt-1 mb-4"></hr>

          {/* Statistik */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {activeTab === 'notification' ? (
              <>
                {/* Issues */}
                <div className="flex items-center space-x-4 p-4 bg-orange-100 rounded-lg shadow">
                  <div className="bg-orange-500 text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 11-12.728 0 9 9 0 0112.728 0zM12 12v.01M12 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-orange-600">Issues</h3>
                    <p className="text-gray-700 text-xl">{totalIssues}</p>
                  </div>
                </div>

                {/* Lamp On */}
                <div className="flex items-center space-x-4 p-4 bg-blue-100 rounded-lg shadow">
                  <div className="bg-blue-500 text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a9 9 0 11-9 9 9 9 0 019-9zM12 12h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-600">Lamp On</h3>
                    <p className="text-gray-700 text-xl">{totalLampOn}</p>
                  </div>
                </div>

                {/* Lamp Off */}
                <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg shadow">
                  <div className="bg-gray-500 text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3l-4 4h-4v4H3v4h3v4l4-4h3l4 4h4v-4h3v-4h-3v-4l-4-4h-3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-600">Lamp Off</h3>
                    <p className="text-gray-700 text-xl">{totalLampOff}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Sensors */}
                <div className="flex items-center space-x-4 p-4 bg-red-100 rounded-lg shadow">
                  <div className="bg-red-500 text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M3.375 18h17.25l-8.625-15L3.375 18z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-red-600">Sensor Issues</h3>
                    <p className="text-gray-700 text-xl">{totalSensor}</p>
                  </div>
                </div>

                {/* Lamp */}
                <div className="flex items-center space-x-4 p-4 bg-blue-100 rounded-lg shadow">
                  <div className="bg-blue-500 text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a7 7 0 00-7 7c0 3.31 2.016 5.282 3.5 6.34V19a1 1 0 001 1h4a1 1 0 001-1v-3.66c1.484-1.058 3.5-3.03 3.5-6.34a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-600">Lamp Issues</h3>
                    <p className="text-gray-700 text-xl">{totalLampu}</p>
                  </div>
                </div>

                {/* Komunikasi */}
                <div className="flex items-center space-x-4 p-4 bg-amber-100 rounded-lg shadow">
                  <div className="bg-amber-500 text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.414 19H5a2 2 0 01-2-2v-3.414a2 2 0 01.586-1.414l7-7a2 2 0 012.828 0l3 3m1.414 1.414L21 9a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-3-3m-4.414 4.414L3 21m3-3L21 3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-amber-600">Communication Issues</h3>
                    <p className="text-gray-700 text-xl">{totalKomunikasi}</p>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Chart */}
            <div className="bg-white p-4 rounded-lg shadow relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-poppins font-semibold text-lg lg:text-xl text-blue-600">
                  {activeTab === 'notification' ? 'Notification Graph' : 'Repair Graph'}
                </h2>
                  <button
                    className="flex items-center px-4 py-2 mr-4 text-blue-600 font-semibold hover:underline transition duration-200 ease-in-out"
                    onClick={handleDownloadExcel}
                  >
                    <FontAwesomeIcon icon={faDownload} className="h-5 w-5 mr-4" />
                    Download Data
                  </button>
              </div>
              <div className="w-full h-[200px] sm:h-[300px] lg:h-[400px] max-w-full mx-auto">
                {activeTab === 'notification' && notificationData && <Line data={notificationData} options={options} />}
                {activeTab === 'repair' && repairData && <Line data={repairData} options={options} />}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Insight;