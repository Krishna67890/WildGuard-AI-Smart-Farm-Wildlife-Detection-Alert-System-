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

// Import local assets
import leopard1 from '../assets/leopard_1.jpg';
import leopard2 from '../assets/leopard_2.jpg';
import leopard3 from '../assets/leopard_3.jpg';
import leopard4 from '../assets/leopard_4.webp';
import leopard5 from '../assets/leopard_5.jpg';
import leopard6 from '../assets/leopard_1.jpg';
import leopard7 from '../assets/leopard_2.jpg';
import leopard8 from '../assets/leopard_3.jpg';
import leopard9 from '../assets/leopard_4.webp';
import leopard10 from '../assets/leopard_5.jpg';

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
    name: 'African leopard (P. p. pardus)',
    scientificName: 'Panthera pardus pardus',
    category: 'Leopard Subspecies',
    threatLevel: 'CRITICAL',
    description: 'It is the most widespread leopard subspecies and is native to most of Sub-Saharan Africa. The leopard (Panthera pardus) has a pale yellowish to dark golden fur with dark spots grouped in rosettes.',
    habitat: 'Sub-Saharan Africa, rainforest to steppe.',
    population: 'Declining / Vulnerable',
    funFact: 'First described by Carl Linnaeus in 1758.',
    imageUrl: leopard1,
    tags: ['Widespread', 'Sub-Saharan', 'Panthera']
  },
  {
    id: '2',
    name: 'Indian leopard (P. p. fusca)',
    scientificName: 'Panthera pardus fusca',
    category: 'Leopard Subspecies',
    threatLevel: 'HIGH',
    description: 'It occurs in the Indian subcontinent, Myanmar and southern Tibet. It relies on its spotted pattern for camouflage as it stalks and ambushes its prey.',
    habitat: 'Indian subcontinent, forests, and agricultural borders.',
    population: 'Listed as Near Threatened.',
    funFact: 'Thrives in diverse environments ranging from forests to near human settlements.',
    imageUrl: leopard2,
    tags: ['Indian Subcontinent', 'Stealthy', 'Near Threatened']
  },
  {
    id: '3',
    name: 'Javan leopard (P. p. melas)',
    scientificName: 'Panthera pardus melas',
    category: 'Leopard Subspecies',
    threatLevel: 'CRITICAL',
    description: 'It is native to Java in Indonesia. It inhabits dense tropical rainforests and dry deciduous forests.',
    habitat: 'Java, Indonesia.',
    population: 'Assessed as Endangered.',
    funFact: 'Exhibits high frequency of melanism (black panthers).',
    imageUrl: leopard3,
    tags: ['Java', 'Endangered', 'Tropical Rainforest']
  },
  {
    id: '4',
    name: 'Arabian leopard (P. p. nimr)',
    scientificName: 'Panthera pardus nimr',
    category: 'Leopard Subspecies',
    threatLevel: 'CRITICAL',
    description: 'It is the smallest leopard subspecies and considered endemic to the Arabian Peninsula. Extremely fragmented population.',
    habitat: 'Arabian Peninsula, arid and montane areas.',
    population: 'Estimated 100–120 individuals in Oman and Yemen.',
    funFact: 'The smallest recognized subspecies of leopard.',
    imageUrl: leopard4,
    tags: ['Arabian Peninsula', 'Critically Endangered', 'Smallest']
  },
  {
    id: '5',
    name: 'Amur leopard (P. p. orientalis)',
    scientificName: 'Panthera pardus orientalis',
    category: 'Leopard Subspecies',
    threatLevel: 'CRITICAL',
    description: 'It is native to the Russian Far East and northern China, adapted to temperate coniferous forests where winter temperatures reach low levels.',
    habitat: 'Russian Far East and Northern China.',
    population: 'Critically Endangered.',
    funFact: 'Grows thick, beautiful fur to survive freezing winter conditions.',
    imageUrl: leopard5,
    tags: ['Russian Far East', 'Coniferous Forests', 'Cold Adapted']
  },
  {
    id: '6',
    name: 'Indochinese leopard (P. p. delacouri)',
    scientificName: 'Panthera pardus delacouri',
    category: 'Leopard Subspecies',
    threatLevel: 'CRITICAL',
    description: 'Native to mainland Southeast Asia and southern China. It has become increasingly rare due to habitat loss and poaching.',
    habitat: 'Southeast Asia, Southern China.',
    population: 'Critically Endangered / Endangered.',
    funFact: 'Often found in tropical rain forests and dry evergreen forests.',
    imageUrl: leopard6,
    tags: ['Southeast Asia', 'Rainforest', 'Rare']
  },
  {
    id: '7',
    name: 'Sri Lankan leopard (P. p. kotiya)',
    scientificName: 'Panthera pardus kotiya',
    category: 'Leopard Subspecies',
    threatLevel: 'HIGH',
    description: 'A leopard subspecies native to Sri Lanka. It is the island\'s top predator, as there are no other big cat species there.',
    habitat: 'Sri Lanka, various habitats including dry evergreen monsoon forests.',
    population: 'Endangered.',
    funFact: 'Being the apex predator, they are less nocturnal than other leopards.',
    imageUrl: leopard7,
    tags: ['Sri Lanka', 'Apex Predator', 'Endemic']
  },
  {
    id: '8',
    name: 'Persian leopard (P. p. tulliana)',
    scientificName: 'Panthera pardus tulliana',
    category: 'Leopard Subspecies',
    threatLevel: 'CRITICAL',
    description: 'Also known as the Caucasian leopard, it is native to the Iranian Plateau and surrounding regions. It is the largest leopard subspecies.',
    habitat: 'Iran, Caucasus, Turkey, Turkmenistan.',
    population: 'Endangered.',
    funFact: 'The largest subspecies of leopard.',
    imageUrl: leopard8,
    tags: ['Largest', 'Middle East', 'Caucasus']
  },
  {
    id: '9',
    name: 'North-Chinese Leopard',
    scientificName: 'Panthera pardus japonensis',
    category: 'Leopard Subspecies',
    threatLevel: 'CRITICAL',
    description: 'Native to northern China. It is roughly the same size as the Amur leopard, but its coat is darker and more yellowish.',
    habitat: 'Northern China, forests and mountains.',
    population: 'Estimated fewer than 2,500 mature individuals.',
    funFact: 'First described in 1862 by Gray.',
    imageUrl: leopard9,
    tags: ['North China', 'Rare', 'Mountain Habitat']
  },
  {
    id: '10',
    name: 'Anatolian Leopard',
    scientificName: 'Panthera pardus tulliana',
    category: 'Leopard Subspecies',
    threatLevel: 'CRITICAL',
    description: 'Native to the Taurus Mountains in Turkey. Long thought extinct, but recent sightings have confirmed their presence.',
    habitat: 'Taurus Mountains, Turkey.',
    population: 'Critically Endangered.',
    funFact: 'Named after the ancient region of Anatolia.',
    imageUrl: leopard10,
    tags: ['Turkey', 'Rediscovered', 'Taurus Mountains']
  }
];

export const GalleryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL_SPECIES' | 'MEDIA_ARCHIVE'>('ALL_SPECIES');
  const [loading, setLoading] = useState(false);
  const [mediaArchive] = useState<any[]>([
    { id: 'm1', url: leopard1, filename: 'AFRICAN_LEOPARD_01.JPG', sector: 'North Perimeter', species: 'Leopard' },
    { id: 'm2', url: leopard2, filename: 'INDIAN_LEOPARD_02.JPG', sector: 'East Sector', species: 'Leopard' },
    { id: 'm3', url: leopard3, filename: 'JAVAN_LEOPARD_03.JPG', sector: 'West Buffer', species: 'Leopard' },
    { id: 'm4', url: leopard4, filename: 'ARABIAN_LEOPARD_04.JPG', sector: 'Central Homestead', species: 'Leopard' },
    { id: 'm5', url: leopard5, filename: 'AMUR_LEOPARD_05.JPG', sector: 'South Boundary', species: 'Leopard' },
    { id: 'm6', url: leopard6, filename: 'INDOCHINESE_LEOPARD_06.WEBP', sector: 'River Trail', species: 'Leopard' },
    { id: 'm7', url: leopard7, filename: 'SRILANKAN_LEOPARD_07.WEBP', sector: 'Ridge View', species: 'Leopard' },
    { id: 'm8', url: leopard8, filename: 'PERSIAN_LEOPARD_08.WEBP', sector: 'Cattle Area', species: 'Leopard' },
    { id: 'm9', url: leopard9, filename: 'NORTHCHINESE_LEOPARD_09.WEBP', sector: 'Maize Fields', species: 'Leopard' },
    { id: 'm10', url: leopard10, filename: 'ANATOLIAN_LEOPARD_10.WEBP', sector: 'Perimeter Wall', species: 'Leopard' }
  ]);

  useEffect(() => {
    // Gallery is strictly Leopard-exclusive. Non-leopard media purged.
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
              <span>Panthera Pardus Intelligence Hub</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Leopard <span className="text-emerald-500">Encyclopedia</span> <br/>
              <span className="text-slate-500">Species Archive</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Advanced neural-network powered identification system and global leopard archive.
              Bridging the gap between human agricultural zones and apex predator habitats.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-72">
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-3xl backdrop-blur-md">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Subspecies</div>
              <div className="text-2xl font-black text-white">08</div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-3xl backdrop-blur-md">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Threat Status</div>
              <div className="text-2xl font-black text-rose-500">CRITICAL</div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-3xl backdrop-blur-md col-span-2">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Detection Logic</div>
              <div className="text-2xl font-black text-cyan-400">MORPHOLOGICAL</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex bg-slate-900 border border-slate-800 rounded-3xl p-1.5 w-full md:w-auto">
          {[
            { id: 'ALL_SPECIES', label: 'Encyclopedia', icon: Leaf },
            { id: 'MEDIA_ARCHIVE', label: 'Media Archive', icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search leopard subspecies, habitats, or regions..."
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
        </div>
      </div>

      {/* 4. CONTENT RENDERING */}
      {activeTab === 'ALL_SPECIES' && (
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

      {activeTab === 'MEDIA_ARCHIVE' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mediaArchive.map((item) => (
            <div key={item.id} className="group relative aspect-square bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all">
              <img src={item.url} alt={item.filename} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="text-[9px] font-black text-emerald-400 truncate">{item.filename}</div>
                <div className="flex items-center text-[8px] text-slate-400 mt-0.5">
                  <MapPin className="w-2 h-2 mr-1" /> {item.sector}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Call to Action */}
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
