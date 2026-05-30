import { useState, useEffect } from "react";

import adultChart from "../assets/dental-chart.png";
import childChart from "../assets/child-dental-chart.png";
import { auth } from "../lib/firebase";

const adultUpper = [
  "1", "2", "3", "4", "5", "6", "7", "8",
  "9", "10", "11", "12", "13", "14", "15", "16"
];

const adultLower = [
  "32", "31", "30", "29", "28", "27", "26", "25",
  "24", "23", "22", "21", "20", "19", "18", "17"
];

const childUpper = [
  "A", "B", "C", "D", "E",
  "F", "G", "H", "I", "J"
];

const childLower = [
  "T", "S", "R", "Q", "P",
  "O", "N", "M", "L", "K"
];

const conditions = [
  "Healthy",
  "RCT",
  "Filling",
  "Missing",
  "Cavity",
  "Crown",
  "Extraction",
  "Implant",
  "Fracture",
];

export default function InteractiveDentalChart({
  appointmentId,
  existingChart,
  onSave
}: any) {

  let parsedChart: any = {};
  if (existingChart) {
    if (typeof existingChart === 'string') {
      try {
        parsedChart = JSON.parse(existingChart);
      } catch (e) {
        console.error("Failed to parse existingChart:", e);
      }
    } else {
      parsedChart = existingChart;
    }
  }

  const [selectedTeeth, setSelectedTeeth] = useState<string[]>(parsedChart.selectedTeeth || []);
  const [toothConditions, setToothConditions] = useState<any>(parsedChart.toothConditions || {});
  const [bitewing, setBitewing] = useState(parsedChart.bitewing || false);
  const [viewType, setViewType] = useState(parsedChart.viewType || "LM");
  const [gender, setGender] = useState(parsedChart.gender || "female");
  const [dentitionType, setDentitionType] = useState(parsedChart.dentitionType || "adult");

  const toggleTooth = (tooth: string) => {
    if (selectedTeeth.includes(tooth)) {
      setSelectedTeeth(
        selectedTeeth.filter(
          (t) => t !== tooth
        )
      );
    } else {
      setSelectedTeeth([
        ...selectedTeeth,
        tooth,
      ]);

      const textArea = document.getElementById('historyField') as HTMLTextAreaElement;
      if (textArea) {
        const textToAdd = `Tooth ${tooth}`;
        if (!textArea.value.includes(textToAdd)) {
          textArea.value = textArea.value ? `${textArea.value}\n${textToAdd}` : textToAdd;
        }
      }
    }
  };



  const updateCondition = (
    tooth: string,
    value: string
  ) => {
    setToothConditions({
      ...toothConditions,
      [tooth]: value,
    });

    if (value) {
      const textArea = document.getElementById('historyField') as HTMLTextAreaElement;
      if (textArea) {
        const textToAdd = `Tooth ${tooth} - ${value}`;
        if (!textArea.value.includes(`Tooth ${tooth} -`)) {
          textArea.value = textArea.value ? `${textArea.value}\n${textToAdd}` : textToAdd;
        } else {
          const regex = new RegExp(`Tooth ${tooth} - [^\\n]+`);
          textArea.value = textArea.value.replace(regex, textToAdd);
        }
      }
    }
  };

  useEffect(() => {
    if (!existingChart) return;

    let chart = existingChart;
    if (typeof existingChart === 'string') {
      try {
        chart = JSON.parse(existingChart);
      } catch (e) {
        chart = {};
      }
    }

    console.log("Loaded chart:", chart);

    setGender(chart?.gender ?? "female");
    setDentitionType(chart?.dentitionType ?? "adult");
    setBitewing(chart?.bitewing ?? false);
    setViewType(chart?.viewType ?? "LM");
    setSelectedTeeth(chart?.selectedTeeth ?? []);
    setToothConditions(chart?.toothConditions ?? {});
  }, [existingChart]);

  const saveDentalChart = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Login required");
        return;
      }

      const token = await user.getIdToken(true);

      console.log({
        gender,
        dentitionType,
        bitewing,
        viewType,
        selectedTeeth,
        toothConditions,
      });

      const response = await fetch(
        `https://binu-s-dental-backend.vercel.app/api/v1/medical/appointments/${appointmentId}/dental-chart`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gender,
            dentitionType,
            bitewing,
            viewType,
            selectedTeeth,
            toothConditions,
            dentalChart: {
              gender,
              dentitionType,
              bitewing,
              viewType,
              selectedTeeth,
              toothConditions,
            }
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        alert(data.message || "Save failed");
        return;
      }

      if (onSave) onSave();
      alert("Dental chart saved");

    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    }
  };

  return (
    <div className="bg-[#061326] rounded-xl p-5 mt-6">

      <h2 className="text-white text-xl mb-5 font-bold">
        Interactive Dental Chart
      </h2>

      <div className="flex gap-3 mb-4">

        <button
          onClick={() =>
            setGender("male")
          }
          className={`px-4 py-2 rounded font-bold ${gender === "male"
            ? "bg-blue-600 text-white"
            : "bg-gray-300 text-gray-800"
            }`}
        >
          ♂ Male
        </button>

        <button
          onClick={() =>
            setGender("female")
          }
          className={`px-4 py-2 rounded font-bold ${gender === "female"
            ? "bg-pink-600 text-white"
            : "bg-gray-300 text-gray-800"
            }`}
        >
          ♀ Female
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setDentitionType("adult")}
          className={`px-4 py-2 rounded font-bold ${dentitionType === "adult"
            ? "bg-blue-600 text-white"
            : "bg-gray-300 text-gray-800"
            }`}
        >
          Adult
        </button>

        <button
          onClick={() => setDentitionType("child")}
          className={`px-4 py-2 rounded font-bold ${dentitionType === "child"
            ? "bg-green-600 text-white"
            : "bg-gray-300 text-gray-800"
            }`}
        >
          Child
        </button>
      </div>

      <div className="relative">

        <img
          src={
            dentitionType === "child"
              ? childChart
              : adultChart
          }
          alt="Dental Chart"
          className="w-full rounded"
        />

        {/* Upper Teeth */}
        <div className="absolute top-3 left-0 w-full flex justify-center gap-2">

          {(dentitionType === "adult" ? adultUpper : childUpper).map(
            (tooth) => (
              <button
                key={tooth}
                onClick={() =>
                  toggleTooth(
                    tooth
                  )
                }
                className={`
                w-10
                h-10
                rounded-full
                text-xs
                font-bold
                transition-all

                ${selectedTeeth.includes(
                  tooth
                )
                    ? "bg-cyan-500 text-white scale-110 shadow-lg"
                    : "bg-white/80 hover:bg-cyan-200 text-gray-900"
                  }
                `}
              >
                {tooth}
              </button>
            )
          )}
        </div>

        {/* Lower Teeth */}
        <div className="absolute bottom-5 left-0 w-full flex justify-center gap-2">

          {(dentitionType === "adult" ? adultLower : childLower).map(
            (tooth) => (
              <button
                key={tooth}
                onClick={() =>
                  toggleTooth(
                    tooth
                  )
                }
                className={`
                w-10
                h-10
                rounded-full
                text-xs
                font-bold
                transition-all

                ${selectedTeeth.includes(
                  tooth
                )
                    ? "bg-cyan-500 text-white scale-110 shadow-lg"
                    : "bg-white/80 hover:bg-cyan-200 text-gray-900"
                  }
                `}
              >
                {tooth}
              </button>
            )
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

        {selectedTeeth.map(
          (tooth) => (
            <div key={tooth}>

              <p className="text-white text-sm mb-1 font-semibold">
                Tooth {tooth}
              </p>

              <select
                value={
                  toothConditions[
                  tooth
                  ] || ""
                }
                onChange={(e) =>
                  updateCondition(
                    tooth,
                    e.target.value
                  )
                }
                className="w-full p-2 rounded text-gray-900 font-medium"
              >
                <option value="">
                  Select Condition
                </option>

                {conditions.map(
                  (
                    condition
                  ) => (
                    <option
                      key={
                        condition
                      }
                    >
                      {
                        condition
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          )
        )}
      </div>

      <div className="mt-5 text-white">

        <label className="flex items-center cursor-pointer">

          <input
            type="checkbox"
            checked={bitewing}
            onChange={() =>
              setBitewing(
                !bitewing
              )
            }
            className="w-5 h-5 rounded"
          />

          <span className="ml-2 font-medium">
            Bitewing Selection
          </span>

        </label>
      </div>

      <div className="flex gap-5 mt-5 text-white flex-wrap">

        {[
          "LM",
          "RM",
          "RMP",
          "LMP",
          "LP",
          "RP",
        ].map((view) => (

          <label key={view} className="flex items-center cursor-pointer">

            <input
              type="radio"
              checked={
                viewType === view
              }
              onChange={() =>
                setViewType(
                  view
                )
              }
              className="w-4 h-4"
            />

            <span className="ml-2 font-medium">
              {view}
            </span>

          </label>
        ))}
      </div>

      <button
        onClick={
          saveDentalChart
        }
        className="
        bg-blue-600
        hover:bg-blue-500
        transition-colors
        text-white
        px-6
        py-3
        rounded-lg
        mt-6
        font-bold
        "
      >
        Save Dental Chart
      </button>
    </div>
  );
}
