import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_URL = "https://binu-s-dental-backend.vercel.app/api/v1";

export default function AdminPortal() {
  const [selectedDate, setSelectedDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [count, setCount] = useState(0);
  
  // Using token from our Auth context if available, otherwise fallback to localStorage
  const { currentUser } = useAuth();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (currentUser) {
      currentUser.getIdToken().then(setToken);
    } else {
      setToken(localStorage.getItem("token") || "");
    }
  }, [currentUser]);

  useEffect(() => {
    if (!selectedDate || !token) return;

    axios
      .get(`${API_URL}/appointments/by-date/${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAppointments(res.data.appointments);
        setCount(res.data.count);
      })
      .catch((err) => {
        console.error("Failed to fetch appointments:", err);
      });
  }, [selectedDate, token]);

  return (
    <div className="pt-32 pb-16 min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Admin Portal</h1>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border p-2 rounded outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">
            Appointments: {count}
          </h2>
          
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appt: any, i: number) => (
                <div key={i} className="p-4 border rounded-xl bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <p className="font-bold text-gray-900">{appt.patientName}</p>
                    <p className="text-sm text-gray-500">{appt.service} · {appt.time}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full w-fit">
                    {appt.status || "Scheduled"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            selectedDate && <p className="text-gray-500 italic">No appointments for this date.</p>
          )}
        </div>
      </div>
    </div>
  );
}
