const fs = require('fs');
const path = require('path');
const p = "/home/castlo/Documents/Binu's Dental/dental-frontend/src/pages/Booking.tsx";
let code = fs.readFileSync(p, 'utf8');

// replace today definition
code = code.replace(
  "const today = new Date().toISOString().split('T')[0];",
  `const getLocalDateString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };
  const today = getLocalDateString();
  
  const isTimeSlotPast = (slotStr) => {
    if (date !== today) return false;
    const [timeStr, period] = slotStr.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const now = new Date();
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime < now;
  };`
);

// update select for time
code = code.replace(
  "{MORNING_SLOTS.map(s => <option key={s} value={s} disabled={bookedSlots.includes(s)}>{s}{bookedSlots.includes(s) ? ' — ' + t('booked_label') : ''}</option>)}",
  "{MORNING_SLOTS.map(s => <option key={s} value={s} disabled={bookedSlots.includes(s) || isTimeSlotPast(s)}>{s}{(bookedSlots.includes(s) || isTimeSlotPast(s)) ? ' — ' + (bookedSlots.includes(s) ? t('booked_label') : 'Unavailable') : ''}</option>)}"
);

code = code.replace(
  "{EVENING_SLOTS.map(s => <option key={s} value={s} disabled={bookedSlots.includes(s)}>{s}{bookedSlots.includes(s) ? ' — ' + t('booked_label') : ''}</option>)}",
  "{EVENING_SLOTS.map(s => <option key={s} value={s} disabled={bookedSlots.includes(s) || isTimeSlotPast(s)}>{s}{(bookedSlots.includes(s) || isTimeSlotPast(s)) ? ' — ' + (bookedSlots.includes(s) ? t('booked_label') : 'Unavailable') : ''}</option>)}"
);

// make the calendar a little big (native input styling)
code = code.replace(
  "className={`w-full px-5 py-4 bg-white rounded-2xl border ${date && isSunday(date) ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-primary outline-none text-gray-700 font-medium`}",
  "className={`w-full px-5 py-4 bg-white rounded-2xl border text-lg min-h-[64px] shadow-inner ${date && isSunday(date) ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-700'} focus:ring-2 focus:ring-primary outline-none font-bold transition-all`}"
);

// also time select
code = code.replace(
  "className=\"w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-700 font-medium disabled:opacity-50\"",
  "className=\"w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-700 font-bold text-lg min-h-[64px] shadow-inner disabled:opacity-50 transition-all\""
);

fs.writeFileSync(p, code);
