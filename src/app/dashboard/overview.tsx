import React, { useEffect, useState } from 'react';
import { FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaWrench } from 'react-icons/fa';

const StreetLightOverview = () => {
  const [stats, setStats] = useState({
    totalStreetlights: 0,
    installed_yet_1: 0,
    installed_yet_0: 0,
    condition_1: 0,
    condition_0: 0,
    repaired: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/streetlights/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching street light stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex justify-between w-full">
      {/* Bagian 1: Total Streetlights */}
      <div className="flex flex-col items-start w-1/2">
        <h3 className="text-sm font-bold underline">Total Streetlights</h3>
        <div className="flex space-x-10 mt-1">
          <div className="flex items-center">
            <FaLightbulb className="text-xl mr-4" />
            <div className="text-left">
              <span className="text-xl font-bold">{stats.totalStreetlights}</span>
              <p className="text-sm">Streetlights</p>
            </div>
          </div>
          <div className="flex items-center">
            <FaLightbulb className="text-xl mr-4" />
            <div className="text-left">
              <span className="text-xl font-bold">{stats.installed_yet_1}</span>
              <p className="text-sm">System Installed</p>
            </div>
          </div>
          <div className="flex items-center">
            <FaExclamationTriangle className="text-xl mr-4 text-red-500" />
            <div className="text-left">
              <span className="text-xl font-bold">{stats.installed_yet_0}</span>
              <p className="text-sm">Not Installed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian 2: Streetlights Overview */}
      <div className="flex flex-col items-start w-1/2">
        <h3 className="text-sm font-bold underline">Streetlights Overview</h3>
        <div className="flex space-x-10 mt-1">
          <div className="flex items-center">
            <FaCheckCircle className="text-xl mr-4 text-green-500" />
            <div className="text-left">
              <span className="text-xl font-bold">{stats.condition_1}</span>
              <p className="text-sm">Healthy</p>
            </div>
          </div>
          <div className="flex items-center">
            <FaExclamationTriangle className="text-xl mr-4 text-red-500" />
            <div className="text-left">
              <span className="text-xl font-bold">{stats.condition_0}</span>
              <p className="text-sm">Have Issues</p>
            </div>
          </div>
          <div className="flex items-center">
            <FaWrench className="text-xl mr-4" />
            <div className="text-left">
              <span className="text-xl font-bold">{stats.repaired}</span> {/* Hardcoded example */}
              <p className="text-sm">Repaired</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetLightOverview;