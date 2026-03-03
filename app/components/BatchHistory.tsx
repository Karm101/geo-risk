"use client";

import { useState } from 'react';
import { Circle, CheckCircle, Archive, History, Calendar, FileText, Layers } from 'lucide-react';

export default function BatchHistory() {
  // 1. Mock Data (Replace this with real data later)
  const [batches] = useState([
    { id: 101, name: "Batch_Import_Mining_Data_A", date: "2024-03-01", records: 1250, status: "Active" },
    { id: 102, name: "Batch_Sensor_Readings_Q1", date: "2024-02-28", records: 890, status: "Archived" },
    { id: 103, name: "Legacy_MGB_Files_2023", date: "2024-02-15", records: 4500, status: "Active" },
  ]);

  // 2. State for handling selections
  // We store the IDs of selected rows in an array
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 3. Logic: Add ID if not present, remove if it is (Toggle)
  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl flex flex-col">
       {/* Card Header */}
       <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/20 rounded-lg">
                <History className="text-purple-400 w-5 h-5"/>
             </div>
             <h3 className="text-lg font-bold text-white">Batch Import History</h3>
          </div>
          <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
             Recent Activity
          </div>
       </div>

       {/* Table Header Row */}
       <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-gray-400 border-b border-gray-700 bg-gray-900/20 uppercase tracking-wider">
          <div className="col-span-5 pl-2">History Name</div>
          <div className="col-span-3">Date Added</div>
          <div className="col-span-2">Records</div>
          <div className="col-span-2 text-right pr-2">Actions</div>
       </div>

       {/* Table Rows Container */}
       <div className="flex-1 overflow-auto max-h-[300px]">
          {batches.map((batch) => {
             // Check if this specific row is selected
             const isSelected = selectedIds.includes(batch.id);

             return (
                <div
                   key={batch.id}
                   className={`
                     grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-700/50 
                     transition-all duration-300 ease-in-out cursor-pointer group
                     ${isSelected 
                        ? 'bg-blue-600/10 border-l-4 border-l-blue-500' // Highlighted Style
                        : 'hover:bg-gray-700/40 border-l-4 border-l-transparent' // Normal + Hover Style
                     }
                   `}
                >
                   {/* Column 1: History Name */}
                   <div className="col-span-5 font-medium text-gray-200 flex items-center gap-3">
                      <Layers className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-gray-600'}`} />
                      <span className="truncate">{batch.name}</span>
                   </div>

                   {/* Column 2: Date */}
                   <div className="col-span-3 text-gray-400 text-sm flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 opacity-70"/> {batch.date}
                   </div>

                   {/* Column 3: Records */}
                   <div className="col-span-2 text-gray-400 text-sm flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 opacity-70"/> 
                      {batch.records.toLocaleString()}
                   </div>

                   {/* Column 4: Actions (Select & Archive) */}
                   <div className="col-span-2 flex justify-end gap-3 pr-2">
                      
                      {/* SELECT BUTTON */}
                      <button
                         onClick={() => toggleSelect(batch.id)}
                         className="group/btn transition-transform active:scale-95"
                         title={isSelected ? "Deselect Row" : "Select Row"}
                      >
                         {isSelected ? (
                            <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                         ) : (
                            <Circle className="w-6 h-6 text-gray-600 group-hover/btn:text-gray-400" />
                         )}
                      </button>

                      {/* ARCHIVE BUTTON (Placeholder) */}
                      <button
                         className="group/archive transition-transform active:scale-95"
                         title="Archive Batch"
                         onClick={(e) => {
                            e.stopPropagation(); // Stop row click
                            console.log("Archive clicked for", batch.id);
                         }}
                      >
                         <Archive className="w-6 h-6 text-gray-600 group-hover/archive:text-rose-400 transition-colors" />
                      </button>
                   </div>
                </div>
             )
          })}
       </div>
    </div>
  );
}