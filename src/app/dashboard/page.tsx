"use client";

import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Layout from "../components/Layout";
import StreetLightOverview from "./overview";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faLightbulb, faWifi, faHistory } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";

// Import `MapContainer` dan `TileLayer` secara dinamis
const DynamicMapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const DynamicTileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const DynamicMarker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const DynamicPopup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

type Event = {
  time: string;
  status: string;
  lat: number | null;
  lon: number | null;
  lampId: string;
  color: string;
  alert: string;
  assignable: boolean;
  type: string;
};

const Dashboard: React.FC = () => {
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filterIssues, setFilterIssues] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentEventPage, setCurrentEventPage] = useState(1);
  const eventsPerPage2 = 3;

  const notificationsPerPage = 3;

  useEffect(() => {
    // Impor `leaflet` hanya di client-side
    import("leaflet").then((module) => {
      setL(module);
    });
  }, []);

  const createColoredIcon = (color: string, lampId: string) => {
    // Pastikan `L` sudah diimpor
    if (!L) return undefined;

    return L.divIcon({
      html: `
        <div 
          style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
          ${lampId}
        </div>
      `,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      redirect("/"); // Redirect to login page if not logged in
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("https://backend-capstone-production-99e8.up.railway.app/api/events");
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const formattedEvents = data.map(event => {
            const location = event.location || [null, null];
            const lat = location[0] !== undefined ? location[0] : null;
            const lon = location[1] !== undefined ? location[1] : null;

            const formattedDate = new Date(event.date).toLocaleString("en-GB", {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            });

            return {
              time: formattedDate,
              status: event.last_status === 0 ? "Mati" : event.last_status === 1 ? "Hidup" : "Issue",
              lat: lat,
              lon: lon,
              lampId: event.streetlight_code ? `${event.anchor_code}${event.streetlight_code}` : event.anchor_code,
              color: event.problem ? "#ffa500" : (event.last_status === 0 ? "#808080" : "#007bff"),
              alert: event.problem || "-",
              assignable: !!event.problem,
              type: event.streetlight_code ? "node" : "anchor"
            };
          });
          setEvents(formattedEvents);
        } else {
          console.error("Data is not in the expected format:", data);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events
  .filter(event => (filterIssues ? event.alert !== "-" : true))
  .filter(event =>
    event.lampId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEvent = currentEventPage * eventsPerPage2;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage2;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalEvents = filteredEvents.length;
  const totalEventPages = Math.ceil(totalEvents / eventsPerPage2); // Jumlah total halaman
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (selectedEvent) {
        const lampId = selectedEvent.lampId;
        const anchor_code = lampId.charAt(0) + lampId.charAt(1);
        const streetlight_code = lampId.slice(2);
        console.log(anchor_code, streetlight_code);
        try {
          const response = await fetch(`https://backend-capstone-production-99e8.up.railway.app/api/notification/${anchor_code}/${streetlight_code}`);
          const data = await response.json();
    
          // Periksa jika notifikasi ditemukan
          if (data && data.length > 0) {
            // Urutkan data berdasarkan tanggal terbaru
            const sortedData = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNotifications(sortedData);
          } else {
            // Kosongkan riwayat jika tidak ada notifikasi
            setNotifications([]);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
          setNotifications([]); // Kosongkan riwayat jika terjadi error
        }
      }
    };
    
    fetchNotifications();    
  }, [selectedEvent]);

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleTurnOn = async () => {
    if (selectedEvent) {
      const anchor_code = selectedEvent.lampId;
  
      const requestBody = {
        type: "1",
        anchor_code, 
      };
  
      setIsLoadingData(true); 
  
      try {
        const response = await fetch("https://backend-capstone-production-99e8.up.railway.app/api/notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const data = await response.json();
        console.log(data);
        toast.success("Streetlight turned on successfully!", {
          onClose: () => {
            window.location.reload();
          },
          autoClose: 1500,
        });
      } catch (error) {
        console.error("Error turning on:", error);
        toast.error("Error turning on the streetlight. Please try again.", {
          autoClose: 1500,
        });
      } finally {
        setIsLoadingData(false);  // Set isLoading ke false setelah proses selesai
      }
    }
  };  

  const handleTurnOff = async () => {
    if (selectedEvent) {
      const anchor_code = selectedEvent.lampId;
  
      const requestBody = {
        type: "0",
        anchor_code, 
      };
  
      setIsLoadingData(true); 
  
      try {
        const response = await fetch("https://backend-capstone-production-99e8.up.railway.app/api/notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const data = await response.json();
        console.log(data);
        toast.success("Streetlight turned off successfully!", {
          onClose: () => {
            window.location.reload();
          },
          autoClose: 1500,
        });
      } catch (error) {
        console.error("Error turning off:", error);
        toast.error("Error turning off the streetlight. Please try again.", {
          autoClose: 1500,
        });
      } finally {
        setIsLoadingData(false);  // Set isLoading ke false setelah proses selesai
      }
    }
  };

  return (
    <div className="bg-white min-h-screen h-screen">
      {/* Overlay Loading */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center text-center">
              <div className="loader mb-4"></div> {/* Spinner */}
              <p className="text-lg font-semibold text-white">
                Loading ...
              </p>
            </div>
          </div>
        )}
          {isLoadingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center text-center">
              <div className="loader mb-4"></div> {/* Spinner */}
              <p className="text-lg font-semibold text-white">
                This process takes up to 1-2 minutes, please be patient ...
              </p>
            </div>
          </div>
        )}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Layout>
        <div className="flex flex-col lg:flex-row h-full">
          <div className={clsx("transition-all duration-300 bg-white border-r p-3 relative", isCollapsed ? "w-8" : "w-full lg:w-80")}>
            {!isCollapsed && (
              <div>
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search Events"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="text-black border rounded p-2 w-full"
                    style={{ marginBottom: "1rem" }}
                  />
                  <div className="flex items-center">
                    <div
                      className={`relative w-12 h-6 flex items-center cursor-pointer ${filterIssues ? "bg-green-500" : "bg-gray-300"} rounded-full`}
                      onClick={() => setFilterIssues(!filterIssues)}
                    >
                      <div
                        className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${filterIssues ? "translate-x-6" : "translate-x-0"}`}
                      />
                    </div>
                    <label className="text-black ml-2">Display only issues</label>
                  </div>
                </div>

                {selectedEvent ? (
                  <div className="space-y-4">
                    <button
                      className="text-blue-500 text-left font-semibold"
                      onClick={() => setSelectedEvent(null)}
                    >
                      &larr; Back
                    </button>

                    <div className="border p-6 rounded-lg bg-white shadow-sm text-black space-y-4">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                        <a
                          href={`https://www.google.com/maps?q=${selectedEvent.lat},${selectedEvent.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] font-medium text-blue-700 underline"
                        >
                          Click for Location
                        </a>
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg">
                        <div className="flex flex-col items-center">
                          <FontAwesomeIcon icon={faWifi} className="text-gray-500 text-xl" />
                          <p className="font-semibold text-sm mt-1">Lamp ID</p>
                          <p className="text-lg font-bold">{selectedEvent.lampId}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <FontAwesomeIcon icon={faLightbulb} className="text-gray-500 text-xl" />
                          <p className="font-semibold text-sm mt-1">Last Status</p>
                          <p className="text-lg font-bold">{selectedEvent.status}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-800">History</h4>
                            <div className="flex items-center">
                            <button
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className={`text-white text-[10px] px-2 py-1 rounded transition-transform duration-200 
                                ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'}`}
                            >
                              &lt;&lt;
                            </button>
                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  currentNotifications.length === notificationsPerPage ? prev + 1 : prev
                                )
                              }
                              disabled={currentNotifications.length < notificationsPerPage}
                              className={`text-white text-[10px] px-2 py-1 rounded ml-2 transition-transform duration-200 
                                ${currentNotifications.length < notificationsPerPage ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'}`}
                            >
                              &gt;&gt;
                            </button>
                          </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {currentNotifications.map(notification => (
                          <div key={notification._id} className="border p-2 rounded-md bg-gray-100">
                            <p className="font-semibold text-[10px]">{notification.sender}: {notification.title}</p>
                            <p className="text-[10px] text-gray-500 text-[10px]">{new Date(notification.date).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                      <div className="text-center mt-8">
                        {selectedEvent.alert !== "-" ? (
                          <p className="text-gray-600 font-semibold">Petugas perbaikan telah ditugaskan</p>
                        ) : selectedEvent.status === "Mati" && /^[^\d]+$/.test(selectedEvent.lampId) ? (
                          <div>
                            <p className="text-gray-600 font-semibold">Light this sector?</p>
                            <button
                              className="bg-blue-500 text-white px-6 py-2 mt-2 rounded-full font-semibold text-lg hover:bg-blue-600 hover:scale-105 transition-transform duration-200"
                              onClick={handleTurnOn}
                              disabled={isLoading}
                            >
                              On
                            </button>
                          </div>
                        ) : selectedEvent.status === "Hidup" && /^[^\d]+$/.test(selectedEvent.lampId) ? (
                          <div>
                            <p className="text-gray-600 font-semibold">Turn off this sector?</p>
                            <button
                              className="bg-blue-500 text-white px-6 py-2 mt-2 rounded-full font-semibold text-lg hover:bg-blue-600 hover:scale-105 transition-transform duration-200"
                              onClick={handleTurnOff}
                              disabled={isLoading}
                            >
                              Off
                            </button>
                          </div>
                        ) : null }
                      </div>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {currentEvents.map(event => (
                      <li
                        key={event.lampId}
                        className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-md transition-all duration-300 ease-in-out transform hover:shadow-lg hover:scale-105 cursor-pointer"
                        style={{
                          borderLeftColor: event.color,
                          borderLeftWidth: '5px',
                          borderLeftStyle: 'solid',
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <div>
                          <p className="text-black font-semibold">Lamp ID: {event.lampId}</p>
                          <p className="text-black text-sm">Time: {event.time}</p>
                          <p className="text-black text-sm">Alert: {event.alert}</p>
                          <p className="text-black text-sm">Status: {event.status}</p>
                        </div>
                        <div className="ml-4">
                          {event.alert !== "-" || event.status === "Issue" ? (
                            <button className="bg-orange-500 text-white px-3 py-1 rounded">Issue</button>
                          ) : event.status === "Mati" ? (
                            <button className="bg-gray-500 text-white px-3 py-1 rounded">Off</button>
                          ) : (
                            <button className="bg-blue-500 text-white px-3 py-1 rounded">On</button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex justify-center items-center space-x-2 mt-4">
                  <button
                    onClick={() => setCurrentEventPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentEventPage === 1}
                    className={`text-white px-3 py-1 rounded ${currentEventPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    &lt;&lt;
                  </button>

                  <button
                    onClick={() => setCurrentEventPage(prev => (currentEvents.length === eventsPerPage2 ? prev + 1 : prev))}
                    disabled={currentEvents.length < eventsPerPage2 || currentEventPage === totalEventPages}
                    className={`text-white px-3 py-1 rounded ${currentEvents.length < eventsPerPage2 || currentEventPage === totalEventPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    &gt;&gt;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Map and Header Section */}
          <div className="flex-grow h-screen flex flex-col relative">
            <div className="bg-blue-500 text-white px-4 py-2 flex flex-wrap justify-between items-center">
              <StreetLightOverview />
            </div>

            <div className="flex-grow h-full w-full relative z-0">
              <DynamicMapContainer
                center={[-7.756624975779352, 110.34700231815647]}
                zoom={18}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <DynamicTileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
                />
                {filteredEvents.map(event => (
                  event.lat !== null && event.lon !== null && (
                    <DynamicMarker
                      key={event.lampId}
                      position={[event.lat, event.lon]}
                      icon={createColoredIcon(event.color, event.lampId)}
                    >
                      <DynamicPopup>
                        <div style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                          <strong>Lamp ID: {event.lampId}</strong>
                          <hr />
                          <p>Status: {event.status}</p>
                          <p>Alert: {event.alert}</p>
                          <p>Type: {event.type}</p>
                        </div>
                      </DynamicPopup>
                    </DynamicMarker>
                  )
                ))}
              </DynamicMapContainer>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Dashboard;