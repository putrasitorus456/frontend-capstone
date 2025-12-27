"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { confirmAlert } from 'react-confirm-alert';
import ProtectedRoute from "../components/ProtectedRoute";

interface Light {
  _id: string;
  anchor_code: string;
  streetlight_code: string;
  location: [number, number];
  installed_yet?: number;
  condition?: number;
  status?: number;
  date?: string;
  __v?: number;
}

const Streetlight = () => {
  const [lights, setLights] = useState<Light[]>([]);
  const [currentLight, setCurrentLight] = useState<Light>({
    _id: "",
    anchor_code: "",
    streetlight_code: "",
    location: [0, 0],
    installed_yet: 1,
    condition: 1,
    status: 0,
    date: new Date().toISOString(),
    __v: 0,
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(lights.length / itemsPerPage);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/streetlights");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        const sortedData = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLights(sortedData);
      } catch (error) {
        toast.error("Error fetching data from the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (light: Light) => {
    setCurrentLight(light);
    setIsEditing(true);
  };

  const handleDelete = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      // ✅ Delay kecil biar terasa seperti request beneran (UX lebih enak)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // ✅ Notif demo yang jelas
      toast.info("Mode Demo: Streetlight tidak dihapus.", {
        autoClose: 4500,
      });

      // ✅ Optional: kalau delete kamu biasanya dari modal, tutup modal di sini
      // setShowDeleteModal(false);

      // ✅ Optional: clear selected item biar terasa action selesai
      // setSelectedLight(null);
    } catch (error) {
      toast.error("Terjadi kesalahan di mode demo. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // PAKE INI KALO REAL CASE
  /* const handleDelete = async (_id: any) => {
    confirmAlert({
        title: 'Konfirmasi Hapus',
        message: 'Apakah anda yakin menghapus data ini?',
        buttons: [
            {
                label: 'Ya',
                onClick: async () => {
                    try {
                        setLoading(true);
                        const response = await fetch(`https://pju-backend.vercel.app/api/streetlights/${_id}`, {
                            method: 'DELETE',
                        });
                        if (!response.ok) throw new Error("Failed to delete data");
                        setLights(lights.filter((light) => light._id !== _id));
                        toast.success("Data berhasil dihapus.");
                    } catch (error) {
                        toast.error("Terjadi kesalahan saat menghapus data.");
                    } finally {
                        setLoading(false);
                    }
                }
            },
            {
                label: 'Tidak',
                onClick: () => {} // Tidak melakukan apa-apa jika "Tidak" dipilih
            }
        ]
    });
}; */

  /* const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `https://pju-backend.vercel.app/api/streetlights/${currentLight._id}`
        : "https://pju-backend.vercel.app/api/streetlights";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentLight),
      });

      if (!response.ok) {
        throw new Error(isEditing ? "Failed to update data" : "Failed to add data");
      }

      const updatedLight = await response.json();
      if (isEditing) {
        setLights(lights.map((light) => (light._id === currentLight._id ? updatedLight : light)));
        toast.success("Data successfully updated.");
      } else {
        setLights([...lights, updatedLight]);
        toast.success("Data successfully added.");
      }

      setCurrentLight({
        _id: "",
        anchor_code: "",
        streetlight_code: "",
        location: [0, 0],
        installed_yet: 1,
        condition: 1,
        status: 0,
        date: new Date().toISOString(),
        __v: 0,
      });
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }; */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Delay kecil biar terasa seperti request beneran (UX lebih enak)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // ✅ Notif yang jelas & enak dibaca
      if (isEditing) {
        toast.info(
          "Mode Demo: Perubahan streetlight tidak disimpan.",
          {
            autoClose: 4500,
          }
        );
      } else {
        toast.info(
          "Mode Demo: Streetlight baru tidak ditambahkan.",
          {
            autoClose: 4500,
          }
        );
      }

      // ✅ Optional: reset form supaya pengguna merasa action selesai
      setCurrentLight({
        _id: "",
        anchor_code: "",
        streetlight_code: "",
        location: [0, 0],
        installed_yet: 1,
        condition: 1,
        status: 0,
        date: new Date().toISOString(),
        __v: 0,
      });

      // ✅ Optional: matikan mode edit
      setIsEditing(false);
    } catch (error) {
      toast.error("Terjadi kesalahan di mode demo. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  // Calculate paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = lights.slice(startIndex, startIndex + itemsPerPage);

  return (
    <ProtectedRoute>
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Overlay Loading */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <div className="loader mb-4"></div> {/* Spinner */}
            <p className="text-lg font-semibold text-white">Loading...</p>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="w-full lg:w-auto">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-grow">
        <Navbar />

        <div className="p-4 lg:p-6 bg-gray-100 h-full overflow-auto text-black">
          <h1 className="text-xl lg:text-2xl font-semibold mb-4">
            Street Light Management
          </h1>
          <hr className="border-2 border-gray-500 w-full mt-1 mb-4" />

          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <input
                type="text"
                name="anchor_code"
                placeholder="Anchor Code"
                value={currentLight.anchor_code}
                onChange={(e) => setCurrentLight({ ...currentLight, anchor_code: e.target.value })}
                required
                className="border border-black px-4 py-2 rounded-lg w-full"
              />
              <input
                type="text"
                name="streetlight_code"
                placeholder="Streetlight Code"
                value={currentLight.streetlight_code}
                onChange={(e) => setCurrentLight({ ...currentLight, streetlight_code: e.target.value })}
                className="border border-black px-4 py-2 rounded-lg w-full"
              />
              <input
                type="text"
                name="latitude"
                placeholder="Latitude"
                value={currentLight.location[0] !== 0 ? currentLight.location[0] : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const lat = parseFloat(value);
                  // Cek validitas angka dan batas latitude
                  if (value === "" || (isNaN(lat) === false && lat >= -90 && lat <= 90)) {
                    setCurrentLight({
                      ...currentLight,
                      location: [value === "" ? 0 : lat, currentLight.location[1]],
                    });
                  }
                }}
                required
                className="border border-black px-4 py-2 rounded-lg w-full"
              />
              <input
                type="text"
                name="longitude"
                placeholder="Longitude"
                value={currentLight.location[1] !== 0 ? currentLight.location[1] : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const lon = parseFloat(value);
                  // Cek validitas angka dan batas longitude
                  if (value === "" || (isNaN(lon) === false && lon >= -180 && lon <= 180)) {
                    setCurrentLight({
                      ...currentLight,
                      location: [currentLight.location[0], value === "" ? 0 : lon],
                    });
                  }
                }}
                required
                className="border border-black px-4 py-2 rounded-lg w-full"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                {isEditing ? "Update" : "Add"}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-blue-600 text-white text-sm">
                  <th className="px-2 py-1">INDEX</th>
                  <th className="px-2 py-1">Anchor Code</th>
                  <th className="px-2 py-1">Streetlight Code</th>
                  <th className="px-2 py-1">Location</th>
                  <th className="px-2 py-1">Installed</th>
                  <th className="px-2 py-1">Condition</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((light, index) => (
                  <tr key={light._id} className={`border-t border-gray-200 text-black text-sm ${index % 2 === 0 ? 'bg-gray-300' : 'bg-white'}`}>
                    <td className="px-2 py-2 text-center">{startIndex + index + 1}</td>
                    <td className="px-2 py-2 text-center">{light.anchor_code}</td>
                    <td className="px-2 py-2 text-center">
                      {light.streetlight_code ? light.streetlight_code : "Anchor"}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {light.location && light.location.length >= 2 ? (
                        <a
                          href={`https://www.google.com/maps?q=${light.location[0]},${light.location[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Location
                        </a>
                      ) : (
                        "Location not available"
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">{light.installed_yet}</td>
                    <td className="px-2 py-2 text-center">{light.condition}</td>
                    <td className="px-2 py-2 text-center">{light.status}</td>
                    <td className="px-2 py-2 text-center">
                      {new Date(light.date ?? '').toLocaleString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => handleEdit(light)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete}
                        // onClick={() => handleDelete(light._id)}
                        className="text-red-600 hover:underline ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handlePreviousPage}
              className={`px-4 py-2 border border-gray-300 rounded-l transition-colors duration-200 ${
                currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600'
              }`}
              disabled={currentPage === 1}
            >
              {"<"}
            </button>

            <span className="px-4 py-2 bg-blue-500 text-white font-semibold border border-gray-300">
              {currentPage}
            </span>

            <button
              onClick={handleNextPage}
              className={`px-4 py-2 border border-gray-300 rounded-r transition-colors duration-200 ${
                currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600'
              }`}
              disabled={currentPage === totalPages}
            >
              {">"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default Streetlight;