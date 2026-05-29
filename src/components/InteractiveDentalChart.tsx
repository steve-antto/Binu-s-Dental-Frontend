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
  medicalHistory,
}: any) {

  const [selectedTeeth, setSelectedTeeth] =
    useState<string[]>(
      existingChart?.selectedTeeth || []
    );

  const [toothConditions, setToothConditions] =
    useState<any>(
      existingChart?.toothConditions || {}
    );

  const [bitewing, setBitewing] =
    useState(
      existingChart?.bitewing || false
    );

  const [viewType, setViewType] =
    useState(
      existingChart?.viewType || "LM"
    );

  const [gender, setGender] =
    useState(
      existingChart?.gender || "female"
    );

  const [dentitionType, setDentitionType] =
    useState(
      existingChart?.dentitionType || "adult"
    );

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
    }
  };

  useEffect(() => {
    if (!medicalHistory) return;

    const foundTeeth: string[] = [];
    const foundConditions: any = {};

    // Match tooth numbers
    const toothRegex = /\b([A-T]|[1-9]|[1-2][0-9]|3[0-2]|4[1-8])\b/g;

    const matches = medicalHistory.match(toothRegex) || [];

    matches.forEach((tooth: string) => {
      if (!foundTeeth.includes(tooth)) {
        foundTeeth.push(tooth);
      }

      // Find nearby treatment words
      const lowerText = medicalHistory.toLowerCase();

      if (lowerText.includes("crown") || lowerText.includes("ceramic crown")) {
        foundConditions[tooth] = "Crown";
      } else if (lowerText.includes("rct") || lowerText.includes("root canal")) {
        foundConditions[tooth] = "RCT";
      } else if (lowerText.includes("filling")) {
        foundConditions[tooth] = "Filling";
      } else if (lowerText.includes("implant")) {
        foundConditions[tooth] = "Implant";
      } else if (lowerText.includes("extraction")) {
        foundConditions[tooth] = "Extraction";
      } else if (lowerText.includes("cavity")) {
        foundConditions[tooth] = "Cavity";
      }
    });

    // Do NOT clear old data
    setSelectedTeeth((prev) => [...new Set([...prev, ...foundTeeth])]);
    setToothConditions((prev: any) => ({
      ...prev,
      ...foundConditions,
    }));
  }, [medicalHistory]);

  const updateCondition = (
    tooth: string,
    value: string
  ) => {
    setToothConditions({
      ...toothConditions,
      [tooth]: value,
    });
  };

  useEffect(() => {
    if (!existingChart) return;

    setGender(existingChart.gender || "female");
    setDentitionType(existingChart.dentitionType || "adult");
    setBitewing(existingChart.bitewing || false);
    setViewType(existingChart.viewType || "LM");
    setSelectedTeeth(existingChart.selectedTeeth || []);
    setToothConditions(existingChart.toothConditions || {});
  }, [existingChart]);

  const saveDentalChart = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("User not logged in");
        return;
      }

      const token = await user.getIdToken(true);
      const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1';

      const response = await fetch(
        `${API_URL}/api/medical/appointments/${appointmentId}/dental-chart`,
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
          }),
        }
      );

      const data = await response.json();
      console.log("Dental save response:", data);

      if (!response.ok) {
        alert(data.message || "Dental chart save failed");
        return;
      }

      alert("Dental chart saved");

    } catch (error) {
      console.error("Dental save error:", error);
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
          className={`px-4 py-2 rounded font-bold ${
            dentitionType === "adult"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-800"
          }`}
        >
          Adult
        </button>

        <button
          onClick={() => setDentitionType("child")}
          className={`px-4 py-2 rounded font-bold ${
            dentitionType === "child"
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
