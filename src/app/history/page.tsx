"use client";

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationTab from './NotificationTab';
import RepairTab from './RepairTab';
import ProtectedRoute from '../components/ProtectedRoute';

const History = () => {
  const [activeTab, setActiveTab] = useState<'notification' | 'repair'>('notification');

  return (
    <ProtectedRoute>
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Sidebar */}
      <div className="w-full lg:w-auto">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-grow">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div className="p-4 lg:p-4 bg-gray-100 h-full overflow-auto">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 text-black">History Section</h1>
          
          {/* Tabs */}
          <div className="flex flex-col items-start mb-6">
            <div className="flex flex-wrap space-x-2 lg:space-x-4">
              <button
                className={`px-4 py-2 rounded-lg font-semibold focus:outline-none transition duration-200 ease-in-out transform ${activeTab === 'notification' ? 'bg-blue-600 text-white hover:bg-blue-500 hover:text-white hover:scale-105' : 'bg-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white hover:scale-105'}`}
                onClick={() => setActiveTab('notification')}
              >
                Notification
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold focus:outline-none transition duration-200 ease-in-out transform ${activeTab === 'repair' ? 'bg-blue-600 text-white hover:bg-blue-500 hover:text-white hover:scale-105' : 'bg-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white hover:scale-105'}`}
                onClick={() => setActiveTab('repair')}
              >
                Repair
              </button>
            </div>
            <hr className="border-2 border-gray-500 w-full mt-4" />
          </div>

          {/* Tab Content */}
          {activeTab === 'notification' ? <NotificationTab /> : <RepairTab />}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default History;
