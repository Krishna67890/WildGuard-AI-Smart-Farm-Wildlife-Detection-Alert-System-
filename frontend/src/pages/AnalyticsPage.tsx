import React, { useState, useEffect } from 'react';
import { 
  BarChart2, TrendingUp, PieChart as PieIcon, Clock, 
  Sparkles, ShieldAlert, AlertTriangle, ShieldCheck, Zap 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { fetchApi } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchApi<{ success: boolean; data: any }>('/analytics')
      .then((res: any) => {
        if (res.success && res.data) {
          setAnalyticsData(res.data);
        }
      })
      .catch((err: any) => console.warn('Analytics fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4', '#8b5cf6'];
  const THREAT_COLORS = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#10b981'
  };

  // Format species data for charts
  const speciesChartData = analyticsData?.speciesCounts ? [
    { name: 'Wild Boar', count: analyticsData.speciesCounts.wild_boar },
    { name: 'Deer', count: analyticsData.speciesCounts.deer },
    { name: 'Monkey', count: analyticsData.speciesCounts.monkey },
    { name: 'Elephant', count: analyticsData.speciesCounts.elephant },
    { name: 'Leopard', count: analyticsData.speciesCounts.leopard },
    { name: 'Tiger', count: analyticsData.speciesCounts.tiger }
  ] : [];

  const threatChartData = analyticsData?.threatCounts ? [
    { name: 'Critical', value: analyticsData.threatCounts.CRITICAL, color: '#ef4444' },
    { name: 'High', value: analyticsData.threatCounts.HIGH, color: '#f97316' },
    { name: 'Medium', value: analyticsData.threatCounts.MEDIUM, color: '#eab308' },
    { name: 'Low', value: analyticsData.threatCounts.LOW, color: '#10b981' }
  ] : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            <span>Wildlife Intrusion Intelligence & Spatial Analytics</span>
          </h1>
          <p className="text-xs text-slate-400">
            Empirical distribution analysis across temporal windows, animal taxonomy, and sector vulnerabilities
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Avg MTTR: <strong className="text-emerald-400">{analyticsData?.averageResolutionTimeMinutes || 14.8} mins</strong>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Alarms Activated: <strong className="text-rose-400">{analyticsData?.totalAlarmsSounded || 20}</strong>
          </div>
        </div>
      </div>

      {/* Prominent AI-Generated Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 p-6 rounded-2xl border-2 border-emerald-500/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              AI-Generated Intelligence Summary
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Source: WildGuard Threat Engine v2.4 (Explicitly AI-Generated)
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          &ldquo;{analyticsData?.aiGeneratedInsight?.summary || 'Most wildlife activity occurred between 19:00 and 02:00 this week, with the North Forest Perimeter recording the highest number of confirmed apex predator incidents (Leopard & Tiger).'}&rdquo;
        </p>

        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Key Autonomous Recommendations:
          </span>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-300">
            {(analyticsData?.aiGeneratedInsight?.recommendations || [
              'Reinforce acoustic buzzer frequency on CAM-01 between 20:00 and 04:00.',
              'Deploy solar strobe deterrents along East boundary canal to repel elephant herds non-violently.',
              'Maintain farm personnel curfew near Zone 4 homestead past 21:00.'
            ]).map((rec: string, idx: number) => (
              <li key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span className="text-[11px] leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 1: Weekly Incident Trends (Area) & Threat Level Distribution (Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Weekly Intrusion Detections vs Confirmed Critical Alarms</span>
            </h3>
            <span className="text-[11px] text-slate-400">Past 7 Days</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.weeklyTrends || []}>
                <defs>
                  <linearGradient id="colorDet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" textAnchor="middle" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="detections" name="Total Wildlife Detections" stroke="#10b981" fillOpacity={1} fill="url(#colorDet)" />
                <Area type="monotone" dataKey="critical" name="Critical Incidents" stroke="#ef4444" fillOpacity={1} fill="url(#colorCrit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Level Distribution (1 Col) */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <PieIcon className="w-4 h-4 text-rose-400" />
              <span>Threat Level Share</span>
            </h3>
            <span className="text-[11px] text-slate-400">Categorical</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {threatChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            Multi-factor threat engine filters minor herbivore events into LOW/MEDIUM.
          </p>
        </div>

      </div>

      {/* Row 2: 24-Hour Intrusion Activity & Species Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 24-Hour Activity Bar Chart */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Incidents by Hour (24-Hour Circadian Profile)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Peak Nocturnal Activity</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.hourlyActivity || []}>
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="incidents" name="Incidents Logged" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Species Frequency */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Wildlife Taxonomy Frequency</span>
            </h3>
            <span className="text-[11px] text-slate-400">Confirmed Sightings</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speciesChartData} layout="vertical">
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" name="Frequency" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
