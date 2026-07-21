import React, { useState } from 'react';
import { 
  Film, User, Shield, Briefcase, Sparkles, ArrowRight, Camera, Award, 
  CheckCircle2, Globe, TrendingUp, Database, ArrowUpRight, Zap,
  Newspaper, HelpCircle, ChevronDown, ChevronUp, X, Clock, MessageSquare, RefreshCw
} from 'lucide-react';
import { PortalType, Actor, CastingCall, Partner, NewsArticle } from '../types';

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  imageUrl: string;
  excerpt: string;
  content: string;
}

const INDUSTRY_NEWS_ARTICLES: Article[] = [];

const FAQ_ITEMS = [
  {
    question: "How does the Addis Talent casting board work for actors?",
    answer: "Actors register a free digital composite card detailing physical characteristics (height, hair, eye color), localized skill tags, and headshots. They can browse casting calls published by verified directors and submit digital audition pitches. Actors can even generate a custom AI audition monologue and record self-tape rehearsals directly on the platform."
  },
  {
    question: "Is there payment protection or escrow casting for my roles?",
    answer: "Yes! Addis Talent integrates a professional escrow framework. Casting directors specify the compensation rate when launching a call. Before auditions are completed, our system encourages producers to deposit a retainer. Once you finish your contract or scene and the director verifies it, funds are transferred securely, avoiding any payment delays."
  },
  {
    question: "How do casting directors filter and shortlist talents?",
    answer: "Producers and casting directors have access to an advanced Multi-Filter Search Panel. They can filter actors by location, age playing range, gender, height, and specific acting skills (e.g., Amharic dialects, action choreography, physical theater). They can view composite cards, listen to audio reels, and directly trigger shortlists and audition invitations."
  },
  {
    question: "How do I make my portfolio biography look professional?",
    answer: "We have an integrated AI Profile Bio & Skills Optimizer right inside your Actor dashboard. By analyzing your existing resume and skills list, the AI suggests constructive enhancements and writes a captivating, industry-standard biography that highlights your castability to local and international agencies."
  }
];

interface VisitorLandingProps {
  actors: Actor[];
  castingCalls: CastingCall[];
  partners: Partner[];
  newsArticles: NewsArticle[];
  setPortal: (portal: PortalType) => void;
  onJoinForFree: () => void;
  isOwner?: boolean;
}

export default function VisitorLanding({
  actors,
  castingCalls,
  partners,
  newsArticles,
  setPortal,
  onJoinForFree,
  isOwner = false
}: VisitorLandingProps) {
  // Stats
  const actorsCount = actors.length;
  const castingCount = castingCalls.length;
  const rolesCount = castingCalls.reduce((acc, call) => acc + call.roles.length, 0);

  // Accordion & Modal States
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isGeneratingCoachTips, setIsGeneratingCoachTips] = useState(false);
  const [coachTipsResult, setCoachTipsResult] = useState<{ coachTips: string[]; practiceAction: string } | null>(null);
  const [coachError, setCoachError] = useState<string | null>(null);

  const handleFetchCoachTips = async (article: NewsArticle) => {
    setIsGeneratingCoachTips(true);
    setCoachTipsResult(null);
    setCoachError(null);
    try {
      const response = await fetch('/api/ai/news-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: article.title,
          articleContent: article.content
        })
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.coachTips)) {
        setCoachTipsResult(data);
      } else {
        throw new Error(data.error || 'Failed to generate coach advice');
      }
    } catch (err: any) {
      console.error(err);
      setCoachError(err.message || 'Error communicating with AI Casting Coach');
    } finally {
      setIsGeneratingCoachTips(false);
    }
  };

  const getPartnerIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film': return <Film className="h-4 w-4 text-amber-500" />;
      case 'Globe': return <Globe className="h-4 w-4 text-amber-500" />;
      case 'Award': return <Award className="h-4 w-4 text-amber-500" />;
      case 'TrendingUp': return <TrendingUp className="h-4 w-4 text-amber-500" />;
      case 'Shield': return <Shield className="h-4 w-4 text-amber-500" />;
      default: return <Film className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-16 py-4 animate-fade-in">
      
      {/* HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-amber-400 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Addis Ababa's Unified Casting Network</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase font-display text-white leading-none">
          Bridging <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Ethiopian Talent</span> With Acclaimed Production
        </h1>

        <p className="text-sm text-white/60 leading-relaxed max-w-2xl mx-auto">
          Addis Talent is the ultimate digital composite card registry and escrow casting board. Empowering actors to showcase their physical profile portfolios, directing crews to source elite talent, and agencies to oversee casting contracts.
        </p>

        {/* Live System Metrics Grid (Clickable Stats Cards) */}
        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-4">
          <button
            onClick={() => setPortal('producer')}
            className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 p-3.5 rounded-2xl text-center transition-all duration-300 hover:scale-105 cursor-pointer group text-left sm:text-center focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          >
            <span className="block text-[10px] text-white/40 group-hover:text-amber-400 uppercase font-mono font-bold tracking-wider transition-colors">Verified Cast</span>
            <span className="block text-xl font-bold text-white group-hover:text-white mt-0.5 font-mono">{actorsCount}</span>
            <span className="block text-[8px] text-amber-500/60 font-mono group-hover:text-amber-500 transition-colors mt-0.5">Explore Talents &rarr;</span>
          </button>
          
          <button
            onClick={() => setPortal('actor')}
            className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 p-3.5 rounded-2xl text-center transition-all duration-300 hover:scale-105 cursor-pointer group text-left sm:text-center focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          >
            <span className="block text-[10px] text-white/40 group-hover:text-amber-400 uppercase font-mono font-bold tracking-wider transition-colors">Active Board</span>
            <span className="block text-xl font-bold text-amber-400 mt-0.5 font-mono">{castingCount} Calls</span>
            <span className="block text-[8px] text-amber-500/60 font-mono group-hover:text-amber-500 transition-colors mt-0.5">View Castings &rarr;</span>
          </button>

          <button
            onClick={() => setPortal('actor')}
            className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 p-3.5 rounded-2xl text-center transition-all duration-300 hover:scale-105 cursor-pointer group text-left sm:text-center focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          >
            <span className="block text-[10px] text-white/40 group-hover:text-amber-400 uppercase font-mono font-bold tracking-wider transition-colors">Open Roles</span>
            <span className="block text-xl font-bold text-white group-hover:text-white mt-0.5 font-mono">{rolesCount}</span>
            <span className="block text-[8px] text-amber-500/60 font-mono group-hover:text-amber-500 transition-colors mt-0.5">Apply Now &rarr;</span>
          </button>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onJoinForFree}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-amber-500/20 cursor-pointer"
          >
            <span>Register Free Profile</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href="#three-portals"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-white font-bold text-xs uppercase tracking-wider transition-all text-center"
          >
            Explore Portals Below
          </a>
        </div>
      </div>

      {/* TRUSTED BY LEADING BRANDS */}
      <div className="border-t border-b border-white/5 py-8 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-bold">
            Trusted by Eastern Africa's Leading Broadcasters & Studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-50 hover:opacity-85 transition-opacity duration-300">
            {partners.map(partner => (
              <div key={partner.id} className="flex items-center space-x-2 text-white/80 font-display font-black tracking-tighter text-sm">
                {getPartnerIcon(partner.iconName)}
                <span>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PORTAL PATH SELECTION GRID */}
      <div id="three-portals" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">Select Your Workspace Persona</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase font-display tracking-wider">Choose One of the Portals</h2>
          <p className="text-xs text-white/40 max-w-md mx-auto">
            You can dynamically switch your persona at any time using the workspace controller in the navigation bar.
          </p>
        </div>

        <div className={`grid grid-cols-1 ${isOwner ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'} gap-6`}>
          
          {/* CAST PORTAL */}
          <div className="relative group bg-gradient-to-b from-white/5 to-[#0e0e11] border border-white/5 hover:border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <span className="text-[9px] font-mono text-white/30 uppercase border border-white/5 px-2 py-0.5 rounded-full">Portal A</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider">Cast Portal</h3>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mt-1">For Actors & Models</span>
                <p className="text-xs text-white/50 leading-relaxed mt-2">
                  Build a premium composite card resume specifying details like physical traits (height, hair, eyes), age bracket, and localized theatrical skill tags. Record monologue audio or self-tape video clips directly into your online portfolio.
                </p>
              </div>

              <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/5">
                <span className="block text-[9px] font-mono text-white/40 uppercase font-bold">Available Features:</span>
                <ul className="text-[11px] text-white/70 space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Interactive Comp Card Builder</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Self-Tape Video & Monologue Audio recorder</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Book Headshots & Acting Masterclasses</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setPortal('actor')}
              className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Enter as Cast</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {/* DIRECTOR PORTAL */}
          <div className="relative group bg-gradient-to-b from-white/5 to-[#0e0e11] border border-white/5 hover:border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                  <Film className="h-6 w-6" />
                </div>
                <span className="text-[9px] font-mono text-white/30 uppercase border border-white/5 px-2 py-0.5 rounded-full">Portal B</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider">Director Portal</h3>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mt-1">For Filmmakers & Casting Directors</span>
                <p className="text-xs text-white/50 leading-relaxed mt-2">
                  Create and manage high-profile film, television, commercial, and modeling campaigns. Use the multi-dimensional filter index to search physical heights, locations, hair characteristics, or dialects, and shortlist or invite talent directly.
                </p>
              </div>

              <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/5">
                <span className="block text-[9px] font-mono text-white/40 uppercase font-bold">Available Features:</span>
                <ul className="text-[11px] text-white/70 space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Casting Call Board Manager</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Advanced Multi-Filter Search Panel</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Shortlist Board & Audition inviter</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setPortal('producer')}
              className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Enter as Director</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {/* OWNER HUB PORTAL (Conditionally shown based on isOwner prop) */}
          {isOwner && (
            <div className="relative group bg-gradient-to-b from-white/5 to-[#0e0e11] border border-white/5 hover:border-purple-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                  <span className="text-[9px] font-mono text-white/30 uppercase border border-white/5 px-2 py-0.5 rounded-full">Portal C</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider">Owner Hub</h3>
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block mt-1">For Platform Agency Administrators</span>
                  <p className="text-xs text-white/50 leading-relaxed mt-2">
                    Oversee the full back-office ecosystem. Moderate audition audio monologues and video tapes, manage the directory records, configure local domains, and track bookings.
                  </p>
                </div>

                <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/5">
                  <span className="block text-[9px] font-mono text-white/40 uppercase font-bold">Available Features:</span>
                  <ul className="text-[11px] text-white/70 space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span>Database Record Vetting Panel</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span>Audition Self-Tape Video Moderator</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span>Financial Balance Oversight</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setPortal('admin')}
                className="mt-6 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Enter as Owner</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* FEATURED DIRECTORY HIGHLIGHTS */}
      <div className="border-t border-white/5 pt-12 pb-4 space-y-12">
        
        {/* Featured Castings */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-5xl mx-auto px-4">
            <div>
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">Live Opportunities</span>
              <h3 className="text-xl font-bold text-white uppercase font-display tracking-wider mt-1">Featured Casting Calls</h3>
            </div>
            <button
              onClick={() => setPortal('actor')}
              className="text-[10px] text-white/50 hover:text-amber-400 font-mono uppercase tracking-wider flex items-center transition-colors"
            >
              View All Castings <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto px-4">
            {castingCalls.slice(0, 3).map((call) => (
              <div key={call.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group">
                <div className="h-32 bg-[#0e0e11] relative overflow-hidden">
                  {call.imageUrl ? (
                    <img src={call.imageUrl} alt={call.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-500/5">
                      <Film className="h-6 w-6 text-amber-500/40" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/80 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-amber-400 px-2 py-1 rounded-md border border-white/10">
                      {call.type}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center space-x-1.5 mb-2">
                    <p className="text-[10px] font-mono text-white/40">{call.company}</p>
                    {call.isVerified && (
                      <CheckCircle2 className="h-3 w-3 text-amber-500" title="Verified Company" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white font-display line-clamp-1">{call.title}</h4>
                  <p className="text-[10px] font-mono text-amber-500">Deadline: {new Date(call.deadline).toLocaleDateString()}</p>
                  <p className="text-[11px] text-white/60 line-clamp-2 mt-2">{call.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Talents */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-5xl mx-auto px-4">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">Curated Roster</span>
              <h3 className="text-xl font-bold text-white uppercase font-display tracking-wider mt-1">Featured Talents</h3>
            </div>
            <button
              onClick={() => setPortal('producer')}
              className="text-[10px] text-white/50 hover:text-purple-400 font-mono uppercase tracking-wider flex items-center transition-colors"
            >
              Search Database <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto px-4">
            {actors.filter(a => a.headshotUrl).slice(0, 4).map((actor) => (
              <div key={actor.id} className="group rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => setPortal('producer')}>
                <div className="aspect-[3/4] bg-white/5 relative">
                  <img src={actor.headshotUrl} alt={actor.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <h4 className="font-bold text-white font-display leading-none text-sm">{actor.name}</h4>
                      {(actor.isVerified || (actor.experience && actor.experience.length >= 2)) && (
                        <CheckCircle2 className="h-3 w-3 text-amber-500" title="Verified Premium Talent" />
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-1">{actor.type}</p>
                    <div className="flex gap-1 overflow-hidden">
                      {actor.skills.slice(0, 2).map((skill, i) => (
                        <span key={i} className="text-[9px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded-md whitespace-nowrap">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* INDUSTRY NEWS & AUDITION TIPS SECTION */}
      <div className="border-t border-white/5 pt-12 pb-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-5xl mx-auto px-4">
          <div>
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">Industry Pulse</span>
            <h3 className="text-xl font-bold text-white uppercase font-display tracking-wider mt-1">Casting News & Audition Tips</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
          {newsArticles.map((article) => (
            <div 
              key={article.id} 
              onClick={() => {
                setSelectedArticle(article);
                setCoachTipsResult(null);
                setCoachError(null);
              }}
              className="bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="h-40 bg-[#0e0e11] relative overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-white/10 ${
                      article.category === 'Industry Update' 
                        ? 'bg-amber-500/80 text-black border-amber-400/20' 
                        : article.category === 'Audition Advice' 
                        ? 'bg-purple-600/80 text-white border-purple-500/20' 
                        : 'bg-zinc-800/80 text-white border-zinc-700/20'
                    }`}>
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center space-x-1.5 text-[10px] text-white/40 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{article.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-display group-hover:text-amber-400 transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <span className="text-[10px] font-bold font-mono text-amber-500 group-hover:translate-x-1 inline-flex items-center transition-transform gap-1">
                  Read Article & AI Tips &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS SECTION */}
      <div className="border-t border-white/5 pt-12 pb-4 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">Got Questions?</span>
          <h3 className="text-xl font-bold text-white uppercase font-display tracking-wider">Frequently Asked Questions</h3>
          <p className="text-xs text-white/40 max-w-md mx-auto">
            Everything you need to know about navigating the Addis Talent platform as an actor or casting director.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-4 space-y-3">
          {FAQ_ITEMS.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-display font-bold text-sm text-white hover:text-amber-400 transition-colors focus:outline-none"
              >
                <span>{faq.question}</span>
                {activeFaq === idx ? (
                  <ChevronUp className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-white/40 shrink-0" />
                )}
              </button>
              
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-white/60 leading-relaxed border-t border-white/5 pt-3 bg-black/10">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CORE INTEGRATION SHOWCASE (BENTO INSPIRED DETAIL CARDS) */}
      <div className="border-t border-white/5 pt-12 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">Comprehensive Capabilities</span>
          <h3 className="text-base font-bold text-white uppercase font-display tracking-wider">Built-In Addis Ababa Casting Infrastructure</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 hover:border-white/10 transition-colors">
            <Camera className="h-5 w-5 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Premium Headshots</h4>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Book retouched photography sessions (3,500 ETB) with our verified digital studios in Bole.
            </p>
          </div>
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 hover:border-white/10 transition-colors">
            <Award className="h-5 w-5 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Modeling Academy</h4>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Learn screen projection, lighting techniques, and monologue articulation with localized masterclasses.
            </p>
          </div>
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 hover:border-white/10 transition-colors">
            <Zap className="h-5 w-5 text-amber-500" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verified Contact Network</h4>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Unlock direct communication with talent by upgrading to a Hiring Manager account.
            </p>
          </div>
        </div>
      </div>

      {/* ARTICLE DETAIL & AI COACH TIPS MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0e11] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative custom-scrollbar">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header info */}
            <div className="space-y-3 pt-2">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10 inline-block ${
                selectedArticle.category === 'Industry Update' 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' 
                  : selectedArticle.category === 'Audition Advice' 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/20'
                  : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/20'
              }`}>
                {selectedArticle.category}
              </span>
              <h2 className="text-lg sm:text-2xl font-bold font-display uppercase tracking-wide text-white leading-tight">
                {selectedArticle.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/40 font-mono">
                <span>By {selectedArticle.author}</span>
                <span>•</span>
                <span>Published: {selectedArticle.date}</span>
              </div>
            </div>

            {/* Cover Image */}
            <div className="h-56 w-full rounded-2xl overflow-hidden border border-white/10">
              <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            {/* Article Content */}
            <div className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans space-y-4">
              <p>{selectedArticle.content}</p>
            </div>

            {/* AI COACH INTEGRATION CARD */}
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-[#0e0e11] to-transparent p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">✨ Consult Addis Talent AI Casting Coach</h4>
                  <p className="text-[10px] text-white/50">Get instant, custom preparation drills and physical rehearsal instructions tailored for this topic.</p>
                </div>
              </div>

              {!coachTipsResult ? (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isGeneratingCoachTips}
                    onClick={() => handleFetchCoachTips(selectedArticle)}
                    className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 px-4 py-2.5 text-xs font-bold text-black transition-all cursor-pointer"
                  >
                    {isGeneratingCoachTips ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Analyzing with AI Coach...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Generate Rehearsal Tips & Audition Drill</span>
                      </>
                    )}
                  </button>
                  {coachError && (
                    <p className="text-[10px] text-rose-400 mt-2 font-mono">{coachError}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 pt-1 border-t border-white/5 animate-fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 font-mono block uppercase">🎯 ACTING TIPS FOR THIS TOPIC:</span>
                    <ul className="space-y-2 text-xs text-white/80">
                      {coachTipsResult.coachTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-black/35 p-3.5 rounded-xl border border-amber-500/10">
                    <span className="text-[10px] font-bold text-purple-400 font-mono block uppercase mb-1">🎬 REHEARSAL DRILL EXERCISE:</span>
                    <p className="text-xs font-serif text-white/90 leading-relaxed italic">
                      &ldquo;{coachTipsResult.practiceAction}&rdquo;
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setCoachTipsResult(null)}
                      className="text-[10px] font-mono text-white/30 hover:text-white uppercase tracking-wider"
                    >
                      Clear Advice
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
