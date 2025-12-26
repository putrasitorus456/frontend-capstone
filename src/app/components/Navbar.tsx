import { useState, useEffect, useRef } from "react";
import { FaPhone, FaBars, FaComment, FaSignOutAlt, FaExclamationTriangle, FaCog } from "react-icons/fa";
import { MdNotifications } from "react-icons/md"; // Import notification icon from Material Design
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  interface Notification {
    _id: string;
    title: string;
    date: string;
  }

  interface Response {
    _id: string;
    title: string;
    body: string;
    date: string;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const router = useRouter();

  const notificationRef = useRef<HTMLDivElement | null>(null);
  const responseRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    if (typeof window !== 'undefined') { // Ensure this only runs on the client
      localStorage.clear();
      router.push("/login");
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch("https://pju-backend.vercel.app/api/notification");
      const data = await response.json();

      // Urutkan data berdasarkan tanggal terbaru
      const sortedData = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNotifications(sortedData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Fetch Responses
  const fetchResponses = async () => {
    try {
      const response = await fetch("https://pju-backend.vercel.app/api/responses");
      const data = await response.json();

      // Urutkan data berdasarkan tanggal terbaru
      const sortedData = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setResponses(sortedData);
    } catch (error) {
      console.error("Error fetching responses:", error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
      setShowNotifications(false);
    }
    if (responseRef.current && !responseRef.current.contains(event.target as Node)) {
      setShowResponses(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchResponses();

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md p-4 relative z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <img src="./img/logo.png" alt="Logo" className="h-8" />
            <div className="ml-2">
              <h1 className="text-lg font-semibold text-blue-900">MONITORING DASHBOARD</h1>
              <p className="text-sm text-gray-500 hidden lg:block">Yogyakarta Smart Freeway Street Light System</p>
            </div>
          </div>
        </div>

        <div className="sm:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
            <FaBars size={24} className="transition duration-200 hover:text-blue-500" />
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-6">
          <button
            onClick={() => window.open('https://t.me/ykstreetlight_bot', '_blank')}
            className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition duration-200 hover:bg-red-600"
          >
            <FaPhone />
            <span>Dishub Helpline</span>
          </button>
          <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)} ref={notificationRef}>
          <MdNotifications size={30} className="text-gray-700 transition duration-200 hover:text-blue-600" />
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(notification => (
                  <div key={notification._id} className="p-3 border-b border-gray-200 hover:bg-gray-100 transition duration-200 flex items-center">
                    {notification.title.includes("tidak") ? <FaExclamationTriangle className="text-red-500 mr-4" /> : <FaCog className="text-blue-500 mr-4" />}
                    <div>
                      <strong className="font-bold text-gray-800 text-[15px]">{notification.title}</strong>
                      <p className="text-xs text-gray-400">Notification by Sistem</p>
                      <p className="font-semibold mt-2 text-[13px] text-gray-400">{new Date(notification.date).toLocaleString()}</p>
                    </div>
                  </div>
                )) : <div className="p-3 text-center text-gray-500">No notifications</div>}
              </div>
            </div>
          )}
        </div>
        <div className="relative cursor-pointer" onClick={() => setShowResponses(!showResponses)} ref={responseRef}>
          <FaComment size={24} className="text-gray-700 transition duration-200 hover:text-blue-600" />
          {showResponses && (
            <div className="absolute right-0 mt-2 w-[500px] bg-white shadow-lg rounded-lg overflow-hidden z-50">
              <div className="max-h-80 overflow-y-auto">
                {responses.length > 0 ? responses.map(response => (
                  <div key={response._id} className="p-3 border-b border-gray-200 hover:bg-gray-100 transition duration-200 flex items-center">
                    {response.title.includes("Permasalahan") ? <FaExclamationTriangle size={20} className="text-red-500 mr-4" /> : <FaCog size={30} className="text-blue-500 mr-4" />}
                    <div>
                      <strong className="font-bold text-gray-800 text-[15px]">{response.title}</strong>
                      <p className="text-[12px] text-gray-600">{response.body}</p>
                      <p className="text-xs text-gray-400">Notification by Sistem</p>
                      <p className="font-semibold mt-2 text-[13px] text-gray-400">{new Date(response.date).toLocaleString()}</p>
                    </div>
                  </div>
                )) : <div className="p-3 text-center text-gray-500">No responses</div>}
              </div>
            </div>
          )}
        </div>
          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center transition duration-200 hover:bg-blue-600"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden mt-4 space-y-4">
          <button className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 w-full transition duration-200 hover:bg-red-600">
            <FaPhone />
            <span>Dishub Helpline</span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded-full w-full flex items-center transition duration-200 hover:bg-blue-600"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;