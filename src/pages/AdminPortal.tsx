import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, Clock, X } from "lucide-react";

const API_URL = "https://binu-s-dental-backend.vercel.app/api/v1";

export default function AdminPortal() {
  const [selectedDate, setSelectedDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [count, setCount] = useState(0);
  
  // Treatment Scheduling state
  const [selectedApptForTreatment, setSelectedApptForTreatment] = useState<any>(null);
  const [treatmentForm, setTreatmentForm] = useState({
    treatmentName: "",
    treatmentDays: 1,
    startDate: "",
    endDate: "",
    dailyStartTime: "10:00",
    dailyEndTime: "11:00",
    notes: ""
  });
  const [isSubmittingTreatment, setIsSubmittingTreatment] = useState(false);
  
  // Using token from our Auth context if available, otherwise fallback to localStorage
  const { currentUser } = useAuth();
  const [token, setToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        if (!currentUser) {
          setAuthLoading(false);
          return;
        }

        const freshToken = await currentUser.getIdToken(true);
        setToken(freshToken);
      } catch (error) {
        console.error("Admin init error:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAdmin();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedDate) return;

    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    axios
      .get(`${API_URL}/appointments/by-date/${selectedDate}`, { headers })
      .then((res) => {
        setAppointments(res.data.appointments);
        setCount(res.data.count);
      })
      .catch((err) => {
        console.error("Failed to fetch appointments:", err);
      });
  }, [selectedDate, token]);

  const handleScheduleTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptForTreatment || !token) return;

    setIsSubmittingTreatment(true);
    
    try {
      // Auto-generate sessions based on days and start date
      const sessions = [];
      const start = new Date(treatmentForm.startDate);
      for (let i = 0; i < treatmentForm.treatmentDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        // Format to YYYY-MM-DD
        const dateString = currentDate.toISOString().split('T')[0];
        
        sessions.push({
          date: dateString,
          startTime: treatmentForm.dailyStartTime,
          endTime: treatmentForm.dailyEndTime
        });
      }

      const payload = {
        patientId: selectedApptForTreatment.patientId || selectedApptForTreatment._id, // Fallback if no patientId
        patientName: selectedApptForTreatment.patientName,
        treatmentName: treatmentForm.treatmentName,
        treatmentDays: treatmentForm.treatmentDays,
        sessions,
        notes: treatmentForm.notes
      };

      await axios.post(`${API_URL}/treatment-schedules`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Treatment schedule saved successfully");
      setSelectedApptForTreatment(null);
      setTreatmentForm({
        treatmentName: "",
        treatmentDays: 1,
        startDate: "",
        endDate: "",
        dailyStartTime: "10:00",
        dailyEndTime: "11:00",
        notes: ""
      });
    } catch (err: any) {
      console.error("Error saving treatment schedule:", err);
      alert(err.response?.data?.message || "Failed to save treatment schedule");
    } finally {
      setIsSubmittingTreatment(false);
    }
  };
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2>Loading Admin Portal...</h2>
      </div>
    );
  }

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
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full w-fit">
                      {appt.status || "Scheduled"}
                    </span>
                    <button
                      onClick={() => setSelectedApptForTreatment(appt)}
                      className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                    >
                      Schedule Treatment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            selectedDate && <p className="text-gray-500 italic">No appointments for this date.</p>
          )}
        </div>
      </div>

      {/* Treatment Scheduling Modal */}
      {selectedApptForTreatment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Schedule Multi-Day Treatment</h3>
              <button 
                onClick={() => setSelectedApptForTreatment(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleTreatment} className="p-6 space-y-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                Scheduling for <span className="font-bold">{selectedApptForTreatment.patientName}</span>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Treatment Name</label>
                <input 
                  type="text" required 
                  placeholder="e.g., Root Canal"
                  value={treatmentForm.treatmentName}
                  onChange={e => setTreatmentForm({...treatmentForm, treatmentName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Number of Days</label>
                  <input 
                    type="number" required min="1" max="30"
                    value={treatmentForm.treatmentDays}
                    onChange={e => {
                      const days = parseInt(e.target.value) || 1;
                      // Auto-calculate end date if start date is set
                      let endDate = treatmentForm.endDate;
                      if (treatmentForm.startDate) {
                        const start = new Date(treatmentForm.startDate);
                        start.setDate(start.getDate() + days - 1);
                        endDate = start.toISOString().split('T')[0];
                      }
                      setTreatmentForm({...treatmentForm, treatmentDays: days, endDate});
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Start Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="date" required 
                      value={treatmentForm.startDate}
                      onChange={e => {
                        const startStr = e.target.value;
                        let endDate = treatmentForm.endDate;
                        if (startStr) {
                          const start = new Date(startStr);
                          start.setDate(start.getDate() + treatmentForm.treatmentDays - 1);
                          endDate = start.toISOString().split('T')[0];
                        }
                        setTreatmentForm({...treatmentForm, startDate: startStr, endDate});
                      }}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">End Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date" required readOnly
                    value={treatmentForm.endDate}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Daily Start Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="time" required 
                      value={treatmentForm.dailyStartTime}
                      onChange={e => setTreatmentForm({...treatmentForm, dailyStartTime: e.target.value})}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Daily End Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="time" required 
                      value={treatmentForm.dailyEndTime}
                      onChange={e => setTreatmentForm({...treatmentForm, dailyEndTime: e.target.value})}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Notes (Optional)</label>
                <textarea 
                  rows={2}
                  value={treatmentForm.notes}
                  onChange={e => setTreatmentForm({...treatmentForm, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedApptForTreatment(null)}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingTreatment}
                  className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {isSubmittingTreatment ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
