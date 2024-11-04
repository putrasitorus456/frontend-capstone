"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTachometerAlt, FaChartLine, FaHistory, FaBolt } from 'react-icons/fa';
import clsx from 'clsx';
import { LuMenu } from "react-icons/lu";

const Sidebar = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed state

  // Handle window resize to auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true); // Automatically collapse when screen width < 768px
      }
    };

    // Run on mount to set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Width of the sidebar when collapsed or expanded
  const sidebarWidth = isCollapsed ? '5rem' : '16rem'; // 5rem = w-20, 16rem = w-64

  return (
    <>
      <div
        className={clsx(
          "bg-blue-900 text-white fixed top-0 left-0 h-full flex flex-col items-center overflow-y-auto transition-all duration-300",
          isCollapsed ? "w-20" : "w-64" // Sidebar width when collapsed/expanded
        )}
      >
        <div className="p-4 flex items-center justify-between">
          <span className={clsx("font-semibold text-lg", isCollapsed ? "hidden" : "block")}></span>
          <button
            className="focus:outline-none"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <LuMenu size={24} className="text-white" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-4">
          <Link href="/dashboard" legacyBehavior>
            <a className="flex items-center space-x-4 hover:bg-blue-700 p-2 rounded">
              <FaTachometerAlt size={24} />
              {!isCollapsed && <span>Dashboard</span>}
            </a>
          </Link>
          <Link href="/insight" legacyBehavior>
            <a className="flex items-center space-x-4 hover:bg-blue-700 p-2 rounded">
              <FaChartLine size={24} />
              {!isCollapsed && <span>Insights</span>}
            </a>
          </Link>
          <Link href="/history" legacyBehavior>
            <a className="flex items-center space-x-4 hover:bg-blue-700 p-2 rounded">
              <FaHistory size={24} />
              {!isCollapsed && <span>History</span>}
            </a>
          </Link>
          <Link href="/streetlight" legacyBehavior>
            <a className="flex items-center space-x-4 hover:bg-blue-700 p-2 rounded">
              <FaBolt size={24} />
              {!isCollapsed && <span>Street Light</span>}
            </a>
          </Link>
        </nav>
      </div>

      {/* Adjust main content padding based on the sidebar width */}
      <style jsx global>{`
        body {
          padding-left: ${sidebarWidth};
          transition: padding-left 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default Sidebar;