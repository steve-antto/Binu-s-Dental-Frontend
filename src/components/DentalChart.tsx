import {
  useEffect,
  useState,
} from "react";

interface Props {
  appointmentId: string;
  existingChart?: any;
  token: string;
}

const upperTeeth = [
  "18","17","16","15","14","13","12","11",
  "21","22","23","24","25","26","27","28",
];

const lowerTeeth = [
  "48","47","46","45","44","43","42","41",
  "31","32","33","34","35","36","37","38",
];

const toothConditions = [
  "Healthy",
  "Cavity",
  "Root Canal",
  "Extraction",
  "Implant",
  "Crown",
  "Bridge",
  "Sensitive",
];

export default function DentalChart({
  appointmentId,
  existingChart,
  token,
}: Props) {

  const [gender, setGender] =
    useState("female");

  const [bitewing, setBitewing] =
    useState(false);

  const [viewType, setViewType] =
    useState("LM");

  const [selectedTeeth,
  setSelectedTeeth] =
  useState<string[]>([]);

  const [conditions,
  setConditions] =
  useState<Record<string,string>>(
    {}
  );

  useEffect(() => {

    if(existingChart){

      setGender(
        existingChart.gender
        || "female"
      );

      setBitewing(
        existingChart.bitewing
        || false
      );

      setViewType(
        existingChart.viewType
        || "LM"
      );

      setSelectedTeeth(
        existingChart.selectedTeeth
        || []
      );

      const mapped: any = {};

      existingChart
      ?.toothConditions
      ?.forEach(
        (item:any)=>{
          mapped[item.tooth] =
          item.condition;
        }
      );

      setConditions(mapped);
    }

  },[existingChart]);

  const toggleTooth =
  (tooth:string)=>{

    if(
      selectedTeeth.includes(
        tooth
      )
    ){

      setSelectedTeeth(
        selectedTeeth.filter(
          (t)=>t!==tooth
        )
      );

    }else{

      setSelectedTeeth([
        ...selectedTeeth,
        tooth,
      ]);

    }
  };

  const saveChart =
  async()=>{

    try{

      const toothData =
      Object.entries(
        conditions
      ).map(
        ([tooth,condition])=>({
          tooth,
          condition,
        })
      );

      const response =
      await fetch(
`https://binu-s-dental-backend.vercel.app/api/v1/medical/appointments/${appointmentId}/dental-chart`,
{
method:"PUT",

headers:{
"Content-Type":
"application/json",

Authorization:
`Bearer ${token}`,
},

body:JSON.stringify({
gender,
bitewing,
viewType,
selectedTeeth,
toothConditions:
toothData,
}),
}
);

      if(!response.ok){
        throw new Error(
          "Save failed"
        );
      }

      alert(
        "Dental chart saved"
      );

    }catch(error){

      console.error(error);

      alert(
        "Error saving dental chart"
      );
    }
  };

  const renderTooth =
  (tooth:string)=>(
    <div
      key={tooth}
      className="flex flex-col items-center"
    >
      <button
        onClick={()=>
          toggleTooth(
            tooth
          )
        }
        className={`
          border
          rounded
          p-2
          w-14
          h-14
          text-sm
          font-semibold

          ${
          selectedTeeth.includes(
            tooth
          )
          ?
          "bg-blue-600 text-white"
          :
          "bg-white"
          }
        `}
      >
        {tooth}
      </button>

      <select
        className="border rounded mt-1 text-xs p-1 w-16"
        value={
          conditions[tooth]
          || ""
        }
        onChange={(e)=>
          setConditions({
            ...conditions,
            [tooth]:
            e.target.value,
          })
        }
      >
        <option value="">
          --
        </option>

        {
        toothConditions.map(
          (condition)=>(
          <option
            key={condition}
            value={condition}
          >
            {condition}
          </option>
        ))}
      </select>
    </div>
  );

  return(

    <div className="mt-6 border rounded-xl p-5 bg-white">

      <h2 className="text-xl font-bold mb-4">
        Dental Chart
      </h2>

      {/* Gender */}

      <div className="flex gap-3 mb-4">

        <button
          onClick={()=>
            setGender(
              "male"
            )
          }
          className={`px-4 py-2 rounded
          ${
            gender==="male"
            ?
            "bg-blue-600 text-white"
            :
            "bg-gray-200"
          }`}
        >
          ♂ Male
        </button>

        <button
          onClick={()=>
            setGender(
              "female"
            )
          }
          className={`px-4 py-2 rounded
          ${
            gender==="female"
            ?
            "bg-pink-600 text-white"
            :
            "bg-gray-200"
          }`}
        >
          ♀ Female
        </button>

      </div>

      {/* Upper Teeth */}

      <div className="grid grid-cols-8 gap-2 mb-4">
        {upperTeeth.map(
          renderTooth
        )}
      </div>

      {/* Lower Teeth */}

      <div className="grid grid-cols-8 gap-2 mb-5">
        {lowerTeeth.map(
          renderTooth
        )}
      </div>

      {/* Bitewing */}

      <div className="mb-4">

        <label className="flex gap-2 items-center">

          <input
            type="checkbox"
            checked={bitewing}
            onChange={(e)=>
              setBitewing(
                e.target.checked
              )
            }
          />

          Bitewing Selection

        </label>

      </div>

      {/* Views */}

      <div className="flex gap-4 mb-5">

      {[
      "LM",
      "RM",
      "RMP",
      "LMP",
      "LP",
      "RP",
      ].map(
      (option)=>(
      <label
        key={option}
        className="flex gap-2"
      >

      <input
        type="radio"
        checked={
          viewType
          === option
        }
        onChange={()=>
          setViewType(
            option
          )
        }
      />

      {option}

      </label>
      ))}

      </div>

      <button
        onClick={saveChart}
        className="bg-blue-600 text-white px-5 py-2 rounded"
      >
        Save Dental Chart
      </button>

    </div>
  );
}
