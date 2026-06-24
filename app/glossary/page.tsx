'use client'

import { GeoRiskSidebar } from '../components/GeoRiskSidebar'
import { BookOpen, ChevronDown } from 'lucide-react'
import * as Accordion from '@radix-ui/react-accordion'

const GLOSSARY = [
  {
    tag: 'PLI',
    tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    term: 'PLI — Pollution Load Index',
    simple: 'An overall contamination score for a site.',
    detail: (
      <div className="space-y-3">
        <p>The PLI summarises the total heavy metal contamination burden at a sampling station into a single number.</p>
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-center text-amber-300">
          PLI = (CF₁ × CF₂ × … × CFₙ)^(1/n)
        </div>
        <p>Where <span className="text-white font-medium">n</span> is the number of metals and each <span className="text-white font-medium">CF</span> is the Contamination Factor for that metal.</p>
        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-center">
            <div className="text-emerald-400 font-bold">PLI &lt; 1</div>
            <div className="text-gray-400 mt-0.5">Low — Unpolluted</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
            <div className="text-amber-400 font-bold">1 ≤ PLI ≤ 2</div>
            <div className="text-gray-400 mt-0.5">Moderate</div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 text-center">
            <div className="text-rose-400 font-bold">2 &lt; PLI ≤ 3</div>
            <div className="text-gray-400 mt-0.5">High</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-center">
            <div className="text-purple-400 font-bold">PLI &gt; 3</div>
            <div className="text-gray-400 mt-0.5">Very High</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: 'Igeo',
    tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    term: 'Igeo — Geo-accumulation Index',
    simple: 'How much a specific metal has built up above natural levels.',
    detail: (
      <div className="space-y-3">
        <p>Proposed by Müller (1969), Igeo measures enrichment of a single metal relative to its natural geochemical background.</p>
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-center text-blue-300">
          Igeo = log₂( Cₙ ÷ (1.5 × Bₙ) )
        </div>
        <ul className="text-xs space-y-1 text-gray-400">
          <li><span className="text-white font-medium">Cₙ</span> — measured concentration of metal n (mg/kg)</li>
          <li><span className="text-white font-medium">Bₙ</span> — geochemical background value of metal n (mg/kg)</li>
          <li><span className="text-white font-medium">1.5</span> — correction factor for natural lithogenic variation</li>
        </ul>
        <div className="space-y-1 text-xs mt-1">
          {[
            { range: 'Igeo < 0',     label: 'Practically Unpolluted',          color: 'text-emerald-400' },
            { range: '0 – 1',        label: 'Unpolluted to Moderately Polluted', color: 'text-teal-400' },
            { range: '1 – 2',        label: 'Moderately Polluted',              color: 'text-amber-400' },
            { range: '2 – 3',        label: 'Moderate to Strongly Polluted',    color: 'text-orange-400' },
            { range: '3 – 4',        label: 'Strongly Polluted',                color: 'text-rose-400' },
            { range: '4 – 5',        label: 'Strongly to Extremely Polluted',   color: 'text-rose-500' },
            { range: 'Igeo > 5',     label: 'Extremely Polluted',               color: 'text-purple-400' },
          ].map(row => (
            <div key={row.range} className="flex items-center gap-3">
              <span className="font-mono text-gray-300 w-20 flex-shrink-0">{row.range}</span>
              <span className={row.color}>{row.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: 'CF',
    tagColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    term: 'CF — Contamination Factor',
    simple: 'A ratio comparing a measured metal level to its natural background.',
    detail: (
      <div className="space-y-3">
        <p>The CF is the building block of the PLI — one CF is calculated per metal, then all CFs are combined geometrically.</p>
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-center text-teal-300">
          CF = Cₘₑₐₛᵤᵣₑ_ₙ ÷ Cᵦₐ꜀ₖ_ₙ
        </div>
        <ul className="text-xs space-y-1 text-gray-400">
          <li><span className="text-white font-medium">CF = 1</span> — metal is exactly at natural background</li>
          <li><span className="text-white font-medium">CF = 3</span> — metal is 3× above natural background</li>
          <li><span className="text-white font-medium">CF &lt; 1</span> — metal is below background (uncommon)</li>
        </ul>
      </div>
    ),
  },
  {
    tag: 'BG',
    tagColor: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    term: 'Background Values',
    simple: 'The natural, unpolluted concentration of metals in soil/sediment.',
    detail: (
      <div className="space-y-3">
        <p>This system uses <span className="text-white font-medium">Turekian & Wedepohl (1961)</span> world average shale values as geochemical baselines.</p>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
          {[
            { symbol: 'Cr', value: '90',     unit: 'mg/kg' },
            { symbol: 'Mn', value: '850',    unit: 'mg/kg' },
            { symbol: 'Fe', value: '47,200', unit: 'mg/kg' },
            { symbol: 'Co', value: '20',     unit: 'mg/kg' },
            { symbol: 'Ni', value: '68',     unit: 'mg/kg' },
            { symbol: 'Cu', value: '45',     unit: 'mg/kg' },
            { symbol: 'Zn', value: '95',     unit: 'mg/kg' },
            { symbol: 'As', value: '13',     unit: 'mg/kg' },
            { symbol: 'Cd', value: '0.3',    unit: 'mg/kg' },
            { symbol: 'Hg', value: '0.4',    unit: 'mg/kg' },
            { symbol: 'Pb', value: '20',     unit: 'mg/kg' },
          ].map(m => (
            <div key={m.symbol} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-center">
              <div className="text-white font-bold">{m.symbol}</div>
              <div className="text-gray-400 text-[10px]">{m.value} {m.unit}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: 'Risk',
    tagColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    term: 'Risk Levels',
    simple: 'A 4-tier label summarising how dangerous a site\'s contamination is.',
    detail: (
      <div className="space-y-2">
        <p className="mb-3">Risk level is assigned per station based on its computed PLI value:</p>
        {[
          { level: 'LOW',       pli: 'PLI < 1',        desc: 'Metals at or below natural background. No immediate concern.',                color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
          { level: 'MODERATE',  pli: '1 ≤ PLI ≤ 2',   desc: 'Detectable contamination above background. Regular monitoring advised.',      color: 'text-amber-400',   border: 'border-amber-500/30',  bg: 'bg-amber-500/10'   },
          { level: 'HIGH',      pli: '2 < PLI ≤ 3',   desc: 'Significant contamination. Environmental investigation recommended.',          color: 'text-rose-400',    border: 'border-rose-500/30',   bg: 'bg-rose-500/10'    },
          { level: 'VERY HIGH', pli: 'PLI > 3',        desc: 'Severe contamination. Immediate remediation action may be required.',         color: 'text-purple-400',  border: 'border-purple-500/30', bg: 'bg-purple-500/10'  },
        ].map(r => (
          <div key={r.level} className={`${r.bg} border ${r.border} rounded-lg px-4 py-2.5`}>
            <div className="flex items-center gap-3 mb-0.5">
              <span className={`font-bold text-sm ${r.color}`}>{r.level}</span>
              <span className="font-mono text-xs text-gray-400">{r.pli}</span>
            </div>
            <p className="text-xs text-gray-300">{r.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: 'Station',
    tagColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    term: 'Sampling Station',
    simple: 'A specific geographic point where sediment or water samples were collected.',
    detail: (
      <p>Each station has a unique ID (e.g. <span className="font-mono text-white">S-01</span>), GPS coordinates, and is associated with a river and barangay. Multiple samples from the same station across different field campaigns are grouped into data batches.</p>
    ),
  },
  {
    tag: 'Batch',
    tagColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    term: 'Batch',
    simple: 'A single field campaign or data upload — a snapshot in time.',
    detail: (
      <p>A batch groups all stations processed in one CSV upload. Each batch has a unique ID based on the upload timestamp (e.g. <span className="font-mono text-white">batch_1718000000000</span>). Comparing batches over time enables trend analysis of contamination levels.</p>
    ),
  },
  {
    tag: 'Metals',
    tagColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    term: 'Heavy Metals Monitored',
    simple: 'The 11 elements tested for in each sample.',
    detail: (
      <div className="space-y-3">
        <p>These are priority pollutants associated with mining and industrial activity in the Davao Oriental region.</p>
        <div className="grid grid-cols-4 gap-1.5 text-xs font-mono text-center">
          {['Cr','Mn','Fe','Co','Ni','Cu','Zn','As','Cd','Hg','Pb'].map(m => (
            <div key={m} className="bg-gray-900 border border-gray-700 rounded-lg py-2 text-orange-300 font-bold">{m}</div>
          ))}
        </div>
        <p className="text-xs text-gray-400">Chromium · Manganese · Iron · Cobalt · Nickel · Copper · Zinc · Arsenic · Cadmium · Mercury · Lead</p>
      </div>
    ),
  },
]

export default function GlossaryPage() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <GeoRiskSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-3 bg-rose-600/20 rounded-xl">
              <BookOpen className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Glossary</h1>
              <p className="text-gray-400 mt-1">Technical terms, formulas, and calculations used in Geo-RISK</p>
            </div>
          </div>

          <Accordion.Root type="multiple" className="space-y-3">
            {GLOSSARY.map((item) => (
              <Accordion.Item
                key={item.term}
                value={item.term}
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
              >
                <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-4 text-left group hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <div>
                      <p className="text-white font-semibold">{item.term}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{item.simple}</p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="px-6 pb-5 text-gray-300 text-sm leading-relaxed border-t border-gray-700 pt-4">
                  {item.detail}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>

          <p className="text-xs text-gray-600 mt-8">
            References: Turekian & Wedepohl (1961) · Müller (1969) · Tomlinson et al. (1980)
          </p>
        </div>
      </main>
    </div>
  )
}
