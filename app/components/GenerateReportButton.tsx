'use client'

import { useState, useEffect } from 'react';
import { useBatch } from '../context/BatchContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Loader2 } from 'lucide-react';

export default function GenerateReportButton() {
  const { selectedBatch } = useBatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleGenerateReport = async () => {
    if (!selectedBatch) {
      alert("Please select a batch first.");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Fetch the raw data for the current batch
      const dataRes = await fetch(`/api/data?batch=${selectedBatch}`);
      const dataResult = await dataRes.json();
      const records = dataResult.data;

      if (!records || records.length === 0) throw new Error("No data found for this batch");

      // 2. Aggregate data to save AI tokens
      const totalStations = records.length;
      const avgPli = (records.reduce((sum: number, r: any) => sum + Number(r.pli), 0) / totalStations).toFixed(2);
      const highRiskCount = records.filter((r: any) => r.risk_level === 'HIGH' || r.risk_level === 'VERY HIGH').length;
      const highestStation = records.reduce((prev: any, current: any) => (Number(prev.pli) > Number(current.pli)) ? prev : current).station_id;

      const summary = { totalStations, avgPli, highRiskCount, highestStation, dominantMetal: 'Nickel (Ni)' };

      // 3. Request AI Insights
      const aiRes = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary })
      });
      const aiResult = await aiRes.json();
      const insightsText = aiResult.insights || "AI insights could not be generated at this time.";

      // 4. Generate the PDF
      const doc = new jsPDF();
      
      // -- Header
      doc.setFontSize(22);
      doc.setTextColor(24, 24, 27); // Dark gray
      doc.text("Geo-RISK Environmental Report", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Batch ID: ${selectedBatch} | Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

      // -- AI Insights Section
      doc.setFontSize(14);
      doc.setTextColor(24, 24, 27);
      doc.text("AI Executive Summary", 14, 40);
      
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      // Split text so it wraps properly in the PDF
      const splitText = doc.splitTextToSize(insightsText, 180);
      doc.text(splitText, 14, 48);

      // -- Data Table Section
      // Calculate where the table should start based on how long the AI text was
      const tableStartY = 48 + (splitText.length * 5) + 10; 
      
      doc.setFontSize(14);
      doc.setTextColor(24, 24, 27);
      doc.text("Raw Sampling Data", 14, tableStartY - 5);

      // Format data for autoTable
      const tableColumn = ["Station", "Risk Level", "PLI", "Cr", "Ni", "Pb"]; // Add metals as needed
      const tableRows = records.map((r: any) => [
        r.station_id, 
        r.risk_level, 
        Number(r.pli).toFixed(2),
        r.cr_mg_kg || 'N/A',
        r.ni_mg_kg || 'N/A',
        r.pb_mg_kg || 'N/A'
      ]);

      autoTable(doc, {
        startY: tableStartY,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [244, 63, 94] }, // Rose-500 to match your theme
        styles: { fontSize: 9 }
      });

      // 5. Download the PDF
      doc.save(`GeoRisk_Report_${selectedBatch}.pdf`);

    } catch (error) {
      console.error("Report Generation Failed:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={handleGenerateReport}
      disabled={!mounted || isGenerating || !selectedBatch}
      className="w-full flex justify-center items-center gap-2 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
      {isGenerating ? 'Generating AI PDF...' : 'Generate AI Report'}
    </button>
  );
}