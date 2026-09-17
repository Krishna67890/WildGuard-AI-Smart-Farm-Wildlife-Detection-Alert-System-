import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, Info, MapPin, Shield, Camera,
  ChevronRight, Heart, Share2, Download, ExternalLink,
  PawPrint, Leaf, Globe, AlertCircle, ArrowUpRight,
  Clock, Zap, Eye, Video, Image as ImageIcon,
  Layers, BarChart3, Calendar, Play, Activity, RefreshCw
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { Detection, WildlifeSpecies } from '../types/index';

interface AnimalInfo {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
  habitat: string;
  population: string;
  funFact: string;
  imageUrl: string;
  tags: string[];
}

const animals: AnimalInfo[] = [
  {
    id: '1',
    name: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    category: 'Big Cats',
    threatLevel: 'CRITICAL',
    description: 'The Bengal tiger is the most numerous tiger subspecies and is native to the Indian subcontinent. It is the national animal of both India and Bangladesh.',
    habitat: 'Tropical rainforests, marshes, and tall grasses.',
    population: 'Approximately 2,500 - 3,000 in the wild.',
    funFact: 'Each tiger has a completely unique pattern of stripes, much like human fingerprints.',
    imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&q=80&w=800',
    tags: ['Endangered', 'Apex Predator', 'Solitary']
  },
  {
    id: '2',
    name: 'Indian Leopard',
    scientificName: 'Panthera pardus fusca',
    category: 'Big Cats',
    threatLevel: 'HIGH',
    description: 'A highly adaptable predator found across the Indian subcontinent. Known for its stealth and ability to thrive near human settlements.',
    habitat: 'Diverse, ranging from rainforests to arid landscapes and farm boundaries.',
    population: 'Estimated 12,000 - 14,000 in India.',
    funFact: 'Leopards are excellent swimmers and are known to spend much of their day resting in trees.',
    imageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&q=80&w=800',
    tags: ['Stealthy', 'Nocturnal', 'Adaptable']
  },
  {
    id: '3',
    name: 'Indian Elephant',
    scientificName: 'Elephas maximus indicus',
    category: 'Megaherbivores',
    threatLevel: 'HIGH',
    description: 'The largest land animal in Asia, the Indian elephant is a keystone species that plays a vital role in its ecosystem.',
    habitat: 'Grasslands, dry deciduous forests, and wet tropical forests.',
    population: 'Estimated 20,000 - 25,000.',
    funFact: 'Elephants communicate through infrasound, which can travel miles through the ground.',
    imageUrl: 'https://images.unsplash.com/photo-1581081859572-473acc27d422?auto=format&fit=crop&q=80&w=800',
    tags: ['Keystone Species', 'Social', 'Herbivore']
  },
  {
    id: '4',
    name: 'Indian Rhinoceros',
    scientificName: 'Rhinoceros unicornis',
    category: 'Megaherbivores',
    threatLevel: 'CRITICAL',
    description: 'Also known as the Greater One-Horned Rhino, it is distinguished by a single horn and skin with many folds, resembling armor plates.',
    habitat: 'Riverine grasslands and adjacent woodlands.',
    population: 'Over 3,700.',
    funFact: 'Despite their heavy build, rhinos can run at speeds of up to 34 miles per hour.',
    imageUrl: 'https://images.unsplash.com/photo-1534199026738-4e8971f11c7d?auto=format&fit=crop&q=80&w=800',
    tags: ['Vulnerable', 'One-Horned', 'Armor-like Skin']
  },
  {
    id: '5',
    name: 'Wild Boar',
    scientificName: 'Sus scrofa',
    category: 'Suids',
    threatLevel: 'MODERATE',
    description: 'A bulky, massive-bodied suid with relatively short and thin legs. They are highly intelligent and often cause significant crop damage.',
    habitat: 'Woodlands, farmland, and scrub areas.',
    population: 'Abundant / Least Concern.',
    funFact: 'Wild boars have an incredible sense of smell, so much so that they are used to detect truffles.',
    imageUrl: 'https://images.unsplash.com/photo-1590506305942-0f0e0e987489?auto=format&fit=crop&q=80&w=800',
    tags: ['Omnivore', 'Intelligent', 'Hardy']
  },
  {
    id: '6',
    name: 'Snow Leopard',
    scientificName: 'Panthera uncia',
    category: 'Big Cats',
    threatLevel: 'CRITICAL',
    description: 'Known as the "Ghost of the Mountains," these elusive cats are adapted to the cold, high-altitude mountains of Central Asia.',
    habitat: 'Alpine and subalpine zones at elevations of 3,000 to 4,500 meters.',
    population: 'Estimated 450 - 500 in India.',
    funFact: 'Snow leopards cannot roar; instead, they hiss, growl, and puff.',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=800',
    tags: ['Rare', 'High Altitude', 'Ghostly']
  },
  {
    id: '7',
    name: 'Sloth Bear',
    scientificName: 'Melursus ursinus',
    category: 'Bears',
    threatLevel: 'HIGH',
    description: 'A lanky, shaggy bear species native to the Indian subcontinent. They feed primarily on termites and ants.',
    habitat: 'Dry and moist forests, often in rocky areas.',
    population: 'Estimated 6,000 - 11,000.',
    funFact: 'Sloth bears have no front upper incisors, which allows them to suck up termites easily.',
    imageUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&q=80&w=800',
    tags: ['Insectivore', 'Shaggy', 'Aggressive']
  },
  {
    id: '8',
    name: 'Gaur (Indian Bison)',
    scientificName: 'Bos gaurus',
    category: 'Bovines',
    threatLevel: 'MODERATE',
    description: 'The largest extant bovine, the Gaur is a massive, muscular animal found in South and Southeast Asia.',
    habitat: 'Evergreen, semi-evergreen, and moist deciduous forests.',
    population: 'Estimated 13,000 - 30,000.',
    funFact: 'Gaurs have a distinct dorsal ridge on their back and white "stockings" on their legs.',
    imageUrl: 'https://images.unsplash.com/photo-1535941339077-2dd1c79b3df8?auto=format&fit=crop&q=80&w=800',
    tags: ['Massive', 'Herbivore', 'Social']
  }
];

type GalleryTab = 'ENCYCLOPEDIA' | 'LIVE_SIGHTINGS' | 'MEDIA_LIBRARY';

export const GalleryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalInfo | null>(null);
  const [activeTab, setActiveTab] = useState<GalleryTab>('ENCYCLOPEDIA');
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'LIVE_SIGHTINGS') {
      fetchDetections();
    }
  }, [activeTab]);

  const fetchDetections = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{ success: boolean; detections: Detection[] }>('/detections?limit=20');
      if (res.success) setRecentDetections(res.detections);
    } catch (err) {
      console.error('Failed to fetch detections:', err);
    } finally {
      setLoading(false);
    }
  };

  const mediaArchive = useMemo(() => {
    // Generate some interesting looking placeholder media for the library
    return Array.from({ length: 12 }).map((_, i) => ({
      id: `media-${i}`,
      type: i % 3 === 0 ? 'video' : 'image',
      url: `https://images.unsplash.com/photo-1${500000000000 + (i * 123456)}?auto=format&fit=crop&q=80&w=800`,
      timestamp: new Date(Date.now() - (i * 1000 * 60 * 60 * 2)).toISOString(),
      sector: `Sector ${0 + (i % 4)}`,
      filename: `HW_NODE_RECORD_${1000 + i}`,
      species: ['leopard', 'tiger', 'elephant', 'wild_boar', 'deer'][i % 5]
    }));
  }, []);

  const filteredAnimals = useMemo(() =>
    animals.filter(animal =>
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      animal.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* 1. ADVANCED HEADER WITH DYNAMIC STATS */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] -z-0" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-cyan-500/5 blur-[100px] -z-0" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              <span>Real-time Wildlife Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Species <span className="text-emerald-500">Guardian</span> <br/>
              <span className="text-slate-500">Intelligence Hub</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Advanced neural-network powered identification system and global wildlife archive.
              Bridging the gap between human agricultural zones and wild ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-72">
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-3xl backdrop-blur-md">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Species</div>
              <div className="text-2xl font-black text-white">428</div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-3xl backdrop-blur-md">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Live Sightings</div>
              <div className="text-2xl font-black text-emerald-500">24h+</div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-3xl backdrop-blur-md col-span-2">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-1">AI Confidence Avg</div>
              <div className="text-2xl font-black text-cyan-400">94.2%</div>
            </div>
          </div>
        </div>

        {/* 2. TAB NAVIGATION */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mt-12 w-fit">
          {[
            { id: 'ENCYCLOPEDIA', label: 'Encyclopedia', icon: Globe },
            { id: 'LIVE_SIGHTINGS', label: 'Live Sightings', icon: Activity },
            { id: 'MEDIA_LIBRARY', label: 'Captured Media', icon: ImageIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as GalleryTab)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. DYNAMIC SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder={
              activeTab === 'ENCYCLOPEDIA' ? "Search species, habitats, or categories..." :
              activeTab === 'LIVE_SIGHTINGS' ? "Search by camera, species, or location..." :
              "Search snapshots and recordings..."
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-3xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xl shadow-black/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 hover:text-white hover:border-slate-700 transition-all">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold">Filter</span>
          </button>
          {activeTab === 'LIVE_SIGHTINGS' && (
            <button
              onClick={fetchDetections}
              className="p-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-3xl hover:bg-emerald-600/20 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. CONTENT RENDERING */}
      {activeTab === 'ENCYCLOPEDIA' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimals.map((animal) => (
            <div
              key={animal.id}
              onClick={() => setSelectedAnimal(animal)}
              className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 transform hover:-translate-y-2"
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={animal.imageUrl}
                  alt={animal.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                   <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter backdrop-blur-md border ${
                    animal.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    animal.threatLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {animal.threatLevel} PRIORITY
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{animal.category}</div>
                  <h3 className="text-2xl font-black text-white leading-tight">{animal.name}</h3>
                  <div className="flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {animal.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-bold px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-white/70 border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'LIVE_SIGHTINGS' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <div className="text-slate-500 text-xs font-black uppercase tracking-widest">Accessing Sensor Data...</div>
            </div>
          ) : recentDetections.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentDetections.map((det) => (
                <div key={det.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col sm:flex-row p-4 gap-6 group hover:border-emerald-500/30 transition-all">
                  <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden bg-black relative flex-shrink-0">
                    {det.frameImageUrl ? (
                      <img src={det.frameImageUrl} className="w-full h-full object-cover" alt="Detection" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Camera className="w-12 h-12 text-slate-700" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-rose-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase">
                      Incident #{det.id.slice(0, 4)}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${det.threatLevel === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                          <h4 className="text-xl font-black text-white uppercase">{det.species}</h4>
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold flex items-center space-x-2">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(det.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[18px] font-black text-emerald-400">{Math.round(det.confidence * 100)}%</div>
                        <div className="text-[8px] text-slate-500 font-black uppercase">Confidence</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[8px] text-slate-500 font-black uppercase mb-0.5">Location / Zone</div>
                        <div className="text-[10px] text-white font-bold truncate">{det.cameraName} • {det.zoneName}</div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[8px] text-slate-500 font-black uppercase mb-0.5">Analysis</div>
                        <div className="text-[10px] text-white font-bold">{det.direction} • {det.distanceToBoundaryMeters}m</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase py-2.5 rounded-xl transition shadow-lg shadow-emerald-900/20">
                        View Analysis
                      </button>
                      <button className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-[2.5rem] py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-10 h-10 text-slate-600" />
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                <h3 className="text-white font-black uppercase">No Recent Sightings</h3>
                <p className="text-slate-500 text-xs">All sectors currently reported as secure. AI surveillance active.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'MEDIA_LIBRARY' && (
        <div className="space-y-8">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -z-0" />
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Hardware Stream Archive</h3>
                   <p className="text-slate-500 text-sm font-medium">Local device recordings and snapshot history from mobile/PC nodes.</p>
                </div>
                <div className="flex space-x-3">
                   <button className="px-6 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-black text-white uppercase hover:bg-slate-800 transition-all">
                      Storage: 84% Free
                   </button>
                   <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                      Sync All Nodes
                   </button>
                </div>
             </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaArchive.map((media, i) => (
              <div key={media.id} className="group relative aspect-square bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10">
                <div className="w-full h-full bg-slate-800/50 flex items-center justify-center relative overflow-hidden">
                  <ImageIcon className="w-10 h-10 text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                  <img
                    src={media.url}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                    alt={media.filename}
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                </div>

                <div className="absolute top-4 left-4 right-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white border border-white/10 uppercase">
                     {media.type}
                   </span>
                   <button className="p-2 bg-emerald-600 rounded-full text-white shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      {media.type === 'video' ? <Play className="w-3 h-3 fill-current" /> : <Eye className="w-3 h-3" />}
                   </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">{media.sector} • {media.species}</div>
                  <div className="text-sm font-black text-white truncate">{media.filename}</div>
                  <div className="flex items-center space-x-3 mt-3">
                    <button className="p-2 bg-white/10 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors text-white/70">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-rose-500 hover:text-white rounded-lg transition-colors text-white/70">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Detailed View */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative">
            <button
              onClick={() => setSelectedAnimal(null)}
              className="absolute top-8 right-8 z-50 p-4 bg-black/50 text-white rounded-full hover:bg-rose-500 transition-all border border-white/10"
            >
              <ArrowUpRight className="w-6 h-6 rotate-45" />
            </button>

            {/* Left Column: Image & Quick Stats */}
            <div className="lg:w-1/2 relative bg-black overflow-hidden group">
              <img
                src={selectedAnimal.imageUrl}
                alt={selectedAnimal.name}
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div className="absolute bottom-12 left-12 right-12 space-y-6">
                <div className="space-y-2">
                  <div className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">{selectedAnimal.category}</div>
                  <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">{selectedAnimal.name}</h2>
                  <p className="text-slate-400 font-mono italic text-sm">{selectedAnimal.scientificName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10">
                    <p className="text-[10px] text-white/50 font-black uppercase mb-1 flex items-center">
                      <Globe className="w-3 h-3 mr-2" /> Global Population
                    </p>
                    <p className="text-xl font-black text-white">{selectedAnimal.population}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10">
                    <p className="text-[10px] text-white/50 font-black uppercase mb-1 flex items-center">
                      <Shield className="w-3 h-3 mr-2 text-rose-400" /> Risk Assessment
                    </p>
                    <p className={`text-xl font-black ${
                      selectedAnimal.threatLevel === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                    }`}>{selectedAnimal.threatLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Information */}
            <div className="lg:w-1/2 p-12 overflow-y-auto space-y-10 bg-slate-900">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Info className="w-5 h-5" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em]">Guardian Protocol Intelligence</h3>
                </div>
                <p className="text-slate-300 leading-relaxed text-xl italic font-medium">
                  "{selectedAnimal.description}"
                </p>
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Biogeographic Habitat</span>
                      </div>
                      <p className="text-md text-slate-300 font-bold bg-slate-950 p-4 rounded-2xl border border-slate-800">{selectedAnimal.habitat}</p>
                    </div>

                    <div className="p-8 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10 space-y-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                        <PawPrint className="w-32 h-32 text-emerald-500" />
                      </div>
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Behavioral Insight</span>
                      </h4>
                      <p className="text-lg text-slate-200 leading-relaxed font-medium">
                        {selectedAnimal.funFact}
                      </p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identification Tags</div>
                    <div className="flex flex-wrap gap-2">
                       {selectedAnimal.tags.map(tag => (
                         <span key={tag} className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                           #{tag.toUpperCase()}
                         </span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="pt-10 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl shadow-emerald-900/20 active:scale-95">
                      <ExternalLink className="w-4 h-4" />
                      <span>Conservation Archive</span>
                    </button>
                    <button className="flex items-center space-x-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase transition-all border border-slate-700">
                      <Download className="w-4 h-4" />
                      <span>Download Dataset</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-slate-700">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-slate-700">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Call to Action */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-800 rounded-[3.5rem] p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl shadow-emerald-950/40">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[120px] -mr-48 -mt-48 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/20 blur-[100px] -ml-24 -mb-24 rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
              Community Contribution
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] uppercase">
              Expand the Neural <br/> Knowledge Base
            </h2>
            <p className="text-emerald-50/70 text-lg leading-relaxed font-medium">
              WildGuard AI is a living ecosystem. Your field observations and high-resolution imagery
              help refine our species identification models, ensuring maximum protection for both
              farmers and wildlife.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button className="flex items-center justify-center space-x-3 px-10 py-5 bg-white text-emerald-800 rounded-[1.5rem] font-black text-xs uppercase shadow-2xl hover:bg-emerald-50 transition-all active:scale-95 group">
              <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Contribute Media</span>
            </button>
            <button className="flex items-center justify-center space-x-3 px-10 py-5 bg-emerald-800/30 backdrop-blur-xl border border-white/20 text-white rounded-[1.5rem] font-black text-xs uppercase hover:bg-emerald-800/50 transition-all active:scale-95">
              <BarChart3 className="w-5 h-5" />
              <span>Network Statistics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
