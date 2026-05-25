import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { summary } = await request.json();

    const prompt = `
      You are an environmental data analyst for the Mines and Geosciences Bureau (MGB). 
      Write a concise, professional, 3-paragraph executive summary based on the following riverine heavy metal data summary.
      Focus on the environmental risks, the dominant pollutants, and recommendations for monitoring.
      Do not use markdown formatting like asterisks or hashtags, just plain text paragraphs.
      
      DATA SUMMARY:
      Total Stations: ${summary.totalStations}
      Average Pollution Load Index (PLI): ${summary.avgPli}
      Stations at High/Very High Risk: ${summary.highRiskCount}
      Highest Risk Station: ${summary.highestStation}
      Dominant Pollutant across batch: ${summary.dominantMetal}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return NextResponse.json({ success: true, insights: response.text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate insights" }, { status: 500 });
  }
}