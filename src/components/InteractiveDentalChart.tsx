import { useState } from "react";
const dentalImage = "/dental-arch.jpeg";
import axios from "axios";

type Props = {
  appointmentId: string;
  existingChart?: any;
  token: string;
};

const toothMap = [
  { id: "18", left: "5%", top: "8%" },
  { id: "17", left: "11%", top: "7%" },
  { id: "16", left: "17%", top: "8%" },
  { id: "15", left: "23%", top: "10%" },
  { id: "14", left: "29%", top: "11%" },
  { id: "13", left: "35%", top: "12%" },
  { id: "12", left: "41%", top: "12%" },
  { id: "11", left: "47%", top: "11%" },

  { id: "21", left: "53%", top: "11%" },
  { id: "22", left: "59%", top: "12%" },
  { id: "23", left: "65%", top: "12%" },
  { id: "24", left: "71%", top: "11%" },
  { id: "25", left: "77%", top: "10%" },
  { id: "26", left: "83%", top: "8%" },
  { id: "27", left: "89%", top: "7%" },
  { id: "28", left: "95%", top: "8%" },

  { id: "48", left: "5%", top: "67%" },
  { id: "47", left: "11%", top: "68%" },
  { id: "46", left: "17%", top: "69%" },
  { id: "45", left: "23%", top: "71%" },
  { id: "44", left: "29%", top: "72%" },
  { id: "43", left: "35%", top: "73%" },
  { id: "42", left: "41%", top: "73%" },
  { id: "41", left: "47%", top: "72%" },

  { id: "31", left: "53%", top: "72%" },
  { id: "32", left: "59%", top: "73%" },
  { id: "33", left: "65%", top: "73%" },
  { id: "34", left: "71%", top: "72%" },
  { id: "35", left: "77%", top: "71%" },
  { id: "36", left: "83%", top: "69%" },
  { id: "37", left: "89%", top: "68%" },
  { id: "38", left: "95%", top: "67%" },
];

export default function InteractiveDentalChart({
  appointmentId,
  existingChart,
  token,
}: Props) {

  const [selectedTeeth, setSelectedTeeth] =
    useState<string[]>(
      existingChart?.selectedTeeth || []
    );

  const [conditions, setConditions] =
    useState(
      existingChart?.toothConditions || {}
    );

  const toggleTooth = (
    tooth: string
  ) => {
    setSelectedTeeth((prev) =>
      prev.includes(tooth)
        ? prev.filter(
            (t) => t !== tooth
          )
        : [...prev, tooth]
    );
  };

  const saveDentalChart =
    async () => {
      try {

        await axios.put(
          `${import.meta.env.VITE_API_URL || ''}/api/v1/medical/dental-chart/${appointmentId}`,
          {
            selectedTeeth,
            toothConditions: conditions,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Dental chart saved");

      } catch (err) {
        console.error(err);
      }
    };

  return (
    <div className="mt-6 border rounded-2xl p-5">

      <h2 className="font-bold text-xl mb-4">
        Interactive Dental Chart
      </h2>

      <div className="relative w-full max-w-4xl mx-auto">

        <img
          src={dentalImage}
          className="w-full"
        />

        {toothMap.map((tooth) => (

          <button
            key={tooth.id}
            onClick={() =>
              toggleTooth(tooth.id)
            }
            className={`absolute w-10 h-10 rounded-full border-2 transition-all duration-300 font-bold ${
              selectedTeeth.includes(tooth.id)
                ? 'bg-cyan-500 text-white shadow-lg scale-110'
                : 'bg-white/20 hover:bg-cyan-400'
            }`}
            style={{
              left: tooth.left,
              top: tooth.top,
            }}
          >
            {tooth.id}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">

        {selectedTeeth.map(
          (tooth) => (

<div key={tooth}>

<label>
Tooth {tooth}
</label>

<select
className="border rounded w-full p-2"
onChange={(e)=>
setConditions({
...conditions,
[tooth]: e.target.value,
})
}
>

<option>Healthy</option>
<option>Cavity</option>
<option>Root Canal</option>
<option>Crown</option>
<option>Extraction</option>
<option>Filling</option>
<option>Missing</option>

</select>

</div>
))}
      </div>

      <button
        onClick={saveDentalChart}
        className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-xl"
      >
        Save Dental Chart
      </button>
    </div>
  );
}
