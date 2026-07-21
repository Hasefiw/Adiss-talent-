import React, { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Eye, Award, CheckCircle, Mail, MessageSquare, Plus, CheckCircle2, ChevronRight, XCircle, AlertCircle, Video, Mic, Sparkles, RefreshCw, CreditCard, Send, X, ShieldAlert, Check } from 'lucide-react';
import { Actor, CastingCall, Application, ActorType } from '../types';

interface ProducerPortalProps {
  actors: Actor[];
  castingCalls: CastingCall[];
  applications: Application[];
  shortlistedActorIds: string[];
  onToggleShortlist: (actorId: string) => void;
  onUpdateApplicationStatus: (appId: string, status: Application['status']) => void;
  onOpenCreateCastingModal: () => void;
  onViewActorProfile: (actor: Actor) => void;
  isProducerLoggedIn?: boolean;
  onJoinForFree?: () => void;
  isProducerPremium: boolean;
  onProducerLogout?: () => void;
  onSubmitPaymentRequest?: (data: {
    userName: string;
    userEmail: string;
    userPhone: string;
    userType: 'actor' | 'producer';
    planName: string;
    amount: number;
    transactionRef: string;
  }) => void;
  onSendAuditionInvite?: (actorId: string, castingCallId: string, roleTitle: string, message: string) => void;
  showToast?: (type: 'success' | 'info', text: string) => void;
}

export default function ProducerPortal({
  actors,
  castingCalls,
  applications,
  shortlistedActorIds,
  onToggleShortlist,
  onUpdateApplicationStatus,
  onOpenCreateCastingModal,
  onViewActorProfile,
  isProducerLoggedIn = false,
  onJoinForFree,
  isProducerPremium,
  onProducerLogout,
  onSubmitPaymentRequest,
  onSendAuditionInvite,
  showToast
}: ProducerPortalProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(75);
  const [minHeight, setMinHeight] = useState<number>(150);
  const [maxHeight, setMaxHeight] = useState<number>(200);

  // Invite Talent Audition Modal state
  const [inviteModalActor, setInviteModalActor] = useState<Actor | null>(null);
  const [selectedInviteCastingId, setSelectedInviteCastingId] = useState<string>(castingCalls[0]?.id || '');
  const [inviteRoleTitle, setInviteRoleTitle] = useState<string>('Lead Role');
  const [inviteMessage, setInviteMessage] = useState<string>('We reviewed your profile and comp card on Addis Talent Platform and would love to invite you for an audition for our upcoming production!');

  // Recruiter Pro Telebirr Payment Modal state
  const [isRecruiterPaymentModalOpen, setIsRecruiterPaymentModalOpen] = useState(false);
  const [recruiterPhone, setRecruiterPhone] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [recruiterName, setRecruiterName] = useState('Addis Casting Director');
  const [recruiterTxRef, setRecruiterTxRef] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState(false);

  // Active view state inside the producer portal: 'database' | 'applications' | 'shortlist'
  const [producerTab, setProducerTab] = useState<'database' | 'castings' | 'applications' | 'shortlist'>('database');
  
  // Selected casting call for application review
  const [selectedCallId, setSelectedCallId] = useState<string>(castingCalls[0]?.id || 'all');

  // AI Match Analysis states
  const [matchAnalyses, setMatchAnalyses] = useState<Record<string, {
    score: number;
    verdict: string;
    matchingStrengths: string[];
    areasForImprovement: string[];
  }>>({});
  const [isAnalyzingAppId, setIsAnalyzingAppId] = useState<string | null>(null);

  const handleAnalyzeMatch = async (appId: string, actor: Actor, role: any) => {
    if (!actor || !role) return;
    setIsAnalyzingAppId(appId);
    try {
      const response = await fetch('/api/ai/match-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorProfile: {
            name: actor.name,
            bio: actor.bio,
            skills: actor.skills,
            age: actor.age,
            heightCm: actor.heightCm,
            gender: actor.gender
          },
          roleRequirements: {
            title: role.title,
            description: role.description || '',
            gender: role.gender || 'all',
            ageMin: role.ageMin || 18,
            ageMax: role.ageMax || 99
          }
        })
      });
      const data = await response.json();
      if (response.ok && typeof data.score === 'number') {
        setMatchAnalyses(prev => ({
          ...prev,
          [appId]: data
        }));
      } else {
        throw new Error(data.error || 'Match analysis endpoint error');
      }
    } catch (err: any) {
      console.error(err);
      alert(`AI Match Analysis failed: ${err.message || 'Key missing'}`);
    } finally {
      setIsAnalyzingAppId(null);
    }
  };

  // Filter lists
  const locations = Array.from(new Set(actors.map((a) => a.location.split(', ')[1] || a.location)));

  // Filter Actors
  const filteredActors = actors.filter((actor) => {
    // Search Query
    const nameMatch = actor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const skillMatch = actor.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const bioMatch = actor.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const queryMatch = nameMatch || skillMatch || bioMatch;

    // Type
    const typeMatch = typeFilter === 'all' || actor.type === typeFilter || actor.type === 'both';

    // Gender
    const genderMatch = genderFilter === 'all' || actor.gender === genderFilter;

    // Location
    const locMatch = locationFilter === 'all' || actor.location.includes(locationFilter);

    // Age
    const ageMatch = actor.age >= minAge && actor.age <= maxAge;

    // Height
    const heightMatch = actor.heightCm >= minHeight && actor.heightCm <= maxHeight;

    return queryMatch && typeMatch && genderMatch && locMatch && ageMatch && heightMatch;
  });

  // Shortlisted Actors List
  const shortlistedActors = actors.filter((a) => shortlistedActorIds.includes(a.id));

  // Applications matching the selected casting call or all
  const filteredApplications = applications.filter((app) => {
    if (selectedCallId === 'all') return true;
    return app.castingCallId === selectedCallId;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper Brand / Actions Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
              Casting Agency Workspace
            </span>
            {isProducerPremium ? (
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                ★ Recruiter Pro Active
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecruiterPaymentModalOpen(true)}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 font-bold uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1"
              >
                <CreditCard className="h-3 w-3" />
                <span>Upgrade Recruiter Pro (Telebirr)</span>
              </button>
            )}
            {isProducerLoggedIn && onProducerLogout && (
              <button
                onClick={onProducerLogout}
                className="text-[9px] font-mono text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest bg-rose-500/5 hover:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display uppercase mt-1">Casting Director Workspace</h2>
          <p className="text-xs text-white/50 font-mono">
            {isProducerLoggedIn 
              ? "Filter the talent registries, manage your active auditions, and review incoming roles" 
              : "Viewing in Guest Mode. Please log in or register as recruiter to post casting calls and contact talents."}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isProducerLoggedIn && onJoinForFree) {
              onJoinForFree();
            } else {
              onOpenCreateCastingModal();
            }
          }}
          className="inline-flex items-center space-x-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-400 shadow-lg hover:shadow-amber-500/20 transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="h-4 w-4 text-black" />
          <span>Launch Casting Audition</span>
        </button>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setProducerTab('database')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            producerTab === 'database'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-white/40 hover:text-white'
          }`}
        >
          Talent Database ({filteredActors.length})
        </button>
        <button
          onClick={() => setProducerTab('castings')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            producerTab === 'castings'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-white/40 hover:text-white'
          }`}
        >
          My Casting Calls ({castingCalls.length})
        </button>
        <button
          onClick={() => setProducerTab('applications')}
          className={`relative px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            producerTab === 'applications'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-white/40 hover:text-white'
          }`}
        >
          Applications Inbox ({applications.length})
          {applications.some((a) => a.status === 'pending') && (
            <span className="absolute top-2.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>
        <button
          onClick={() => setProducerTab('shortlist')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            producerTab === 'shortlist'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-white/40 hover:text-white'
          }`}
        >
          Casting Shortlists ({shortlistedActorIds.length})
        </button>
      </div>

      {/* RENDER DATABASE TAB */}
      {producerTab === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Side Advanced Filtering Bar */}
          <div className="lg:col-span-1 bg-white/5 rounded-2xl border border-white/10 p-5 space-y-5 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-1.5">
                <SlidersHorizontal className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Casting Filters</h3>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setGenderFilter('all');
                  setLocationFilter('all');
                  setMinAge(18);
                  setMaxAge(75);
                  setMinHeight(150);
                  setMaxHeight(200);
                }}
                className="text-[10px] font-bold text-amber-500 hover:text-amber-400 cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Keyword search */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Keyword Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
                <input
                  type="text"
                  placeholder="e.g. guitar, martial, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#080809] pl-8 pr-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Talent Type Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Talent Registry</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
              >
                <option value="all">Actors & Models (All)</option>
                <option value="actor">Actors Only</option>
                <option value="model">Models Only</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Gender Identity</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-Binary</option>
              </select>
            </div>

            {/* Location filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Talent Hub Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
              >
                <option value="all">Worldwide (All)</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Playing Age Slider Block */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">
                <span>Playing Age Range</span>
                <span className="font-mono text-amber-400 font-semibold">{minAge} - {maxAge} yrs</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="range"
                  min="18"
                  max="75"
                  value={minAge}
                  onChange={(e) => setMinAge(Math.min(parseInt(e.target.value) || 18, maxAge - 2))}
                  className="w-1/2 accent-amber-500 bg-white/10 h-1 rounded-lg"
                />
                <input
                  type="range"
                  min="18"
                  max="75"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Math.max(parseInt(e.target.value) || 75, minAge + 2))}
                  className="w-1/2 accent-amber-500 bg-white/10 h-1 rounded-lg"
                />
              </div>
            </div>

            {/* Height Limits */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">
                <span>Height Limits</span>
                <span className="font-mono text-amber-400 font-semibold">{minHeight} - {maxHeight} cm</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={minHeight}
                  onChange={(e) => setMinHeight(Math.min(parseInt(e.target.value) || 150, maxHeight - 5))}
                  className="w-1/2 accent-amber-500 bg-white/10 h-1 rounded-lg"
                />
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(Math.max(parseInt(e.target.value) || 200, minHeight + 5))}
                  className="w-1/2 accent-amber-500 bg-white/10 h-1 rounded-lg"
                />
              </div>
            </div>

          </div>

          {/* Actor Profile Grid Right */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-white/40 font-mono">
              <span>Showing <strong>{filteredActors.length}</strong> matching candidates</span>
              {searchQuery && <span>Search results for &quot;{searchQuery}&quot;</span>}
            </div>

            {filteredActors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredActors.map((actor) => {
                  const isShortlisted = shortlistedActorIds.includes(actor.id);
                  const hasVerifiedBadge = actor.isVerified || (actor.experience && actor.experience.length >= 2);
                  
                  return (
                    <div
                      key={actor.id}
                      className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl"
                    >
                      {/* Photo Header */}
                      <div className="aspect-[4/3] bg-[#0e0e11] relative overflow-hidden">
                        <img
                          src={actor.headshotUrl}
                          alt={actor.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => {
                            if (!isProducerLoggedIn && onJoinForFree) {
                              onJoinForFree();
                            } else {
                              onToggleShortlist(actor.id);
                            }
                          }}
                          className={`absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-md transition-all hover:scale-110 cursor-pointer ${
                            isShortlisted ? 'text-amber-400' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          <Award className={`h-4.5 w-4.5 ${isShortlisted ? 'fill-amber-400/20' : ''}`} />
                        </button>
                        
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#080809] to-transparent p-3 text-white">
                          <span className="rounded-md bg-white/20 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase font-mono border border-white/10 text-amber-400">
                            {actor.type === 'both' ? 'Actor/Model' : actor.type}
                          </span>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <h4 className="font-bold text-sm font-display">{actor.name}</h4>
                            {hasVerifiedBadge && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" title="Verified Premium Talent" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-white/50 flex items-center font-mono">
                            <MapPin className="mr-0.5 h-3.5 w-3.5 text-amber-500 shrink-0" />
                            {actor.location}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="text-white/60">Age Range: <strong className="text-white">{actor.age}</strong></div>
                            <div className="text-white/60">Height: <strong className="text-white">{actor.heightCm}cm</strong></div>
                          </div>
                          
                          <p className="text-xs text-white/60 leading-normal line-clamp-2 font-sans pt-1">
                            {actor.bio}
                          </p>
                        </div>

                        {/* Custom visual skills capsules */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {actor.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 px-1.5 py-0.5 rounded-md font-medium font-mono">
                              {skill}
                            </span>
                          ))}
                          {actor.skills.length > 3 && (
                            <span className="text-[9px] font-mono text-white/40 self-center">+{actor.skills.length - 3}</span>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isProducerLoggedIn && onJoinForFree) {
                                onJoinForFree();
                              } else {
                                onViewActorProfile(actor);
                              }
                            }}
                            className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Comp Card</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!isProducerLoggedIn && onJoinForFree) {
                                onJoinForFree();
                              } else {
                                setInviteModalActor(actor);
                              }
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-all cursor-pointer shadow"
                          >
                            <Send className="h-3 w-3" />
                            <span>Invite</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                <AlertCircle className="h-10 w-10 text-white/20 mx-auto" />
                <p className="text-xs text-white/40 italic mt-3">No talent matches your current filtering criteria.</p>
                <p className="text-[10px] text-white/30 mt-1">Try broadening your age/height ranges or simplifying your keyword search.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER MY CASTINGS TAB */}
      {producerTab === 'castings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display uppercase tracking-widest text-white">Active Casting Calls</h2>
              <p className="text-xs text-white/50 mt-1 font-mono">Manage your projects and view incoming application metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {castingCalls.map((casting) => {
              const appCount = applications.filter(a => a.castingCallId === casting.id).length;
              const pendingCount = applications.filter(a => a.castingCallId === casting.id && a.status === 'pending').length;
              const shortlistedCount = applications.filter(a => a.castingCallId === casting.id && a.status === 'shortlisted').length;
              
              return (
                <div key={casting.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between group relative overflow-hidden backdrop-blur-sm">
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
                  
                  <div>
                    <div className="flex items-start justify-between mb-3 relative z-10">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest ${
                        casting.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {casting.status === 'open' ? 'Accepting Applications' : 'Closed'}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">{new Date(casting.dateCreated).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-tight font-display relative z-10">{casting.title}</h3>
                    <div className="flex items-center space-x-1.5 mt-1 mb-4 relative z-10">
                      <p className="text-xs text-white/50 font-mono">{casting.company} • {casting.location}</p>
                      {casting.isVerified && (
                        <CheckCircle2 className="h-3 w-3 text-amber-500" title="Verified Company" />
                      )}
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-white/10 relative z-10">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/50">Total Applicants</span>
                        <span className="font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded-md">{appCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/50">Pending Review</span>
                        <span className="font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md">{pendingCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/50">Shortlisted</span>
                        <span className="font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md">{shortlistedCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-end relative z-10">
                    <button
                      onClick={() => {
                        setSelectedCallId(casting.id);
                        setProducerTab('applications');
                      }}
                      className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-wider font-mono flex items-center space-x-1"
                    >
                      <span>Review Applicants</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER APPLICATIONS TAB */}
      {producerTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Casting Calls Selector left column */}
          <div className="lg:col-span-1 bg-white/5 rounded-2xl border border-white/10 p-4 space-y-2 backdrop-blur-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono mb-3 px-1">Filter by Casting</h3>
            
            <button
              onClick={() => setSelectedCallId('all')}
              className={`w-full text-left rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                selectedCallId === 'all'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold'
                  : 'hover:bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <span>All Casting Projects</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                selectedCallId === 'all' ? 'bg-black/20 text-black' : 'bg-white/5 text-white/60'
              }`}>{applications.length}</span>
            </button>

            {castingCalls.map((call) => {
              const appCount = applications.filter((a) => a.castingCallId === call.id).length;
              return (
                <button
                  key={call.id}
                  onClick={() => setSelectedCallId(call.id)}
                  className={`w-full text-left rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedCallId === call.id
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold'
                      : 'hover:bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <span className="truncate">{call.title}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    selectedCallId === call.id ? 'bg-black/20 text-black' : 'bg-white/5 text-white/60'
                  }`}>{appCount}</span>
                </button>
              );
            })}
          </div>

          {/* Applications Inbox Card list */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-white/40 font-mono">
              <span>Reviewing <strong>{filteredApplications.length}</strong> submitted candidates</span>
            </div>

            {filteredApplications.length > 0 ? (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const actor = actors.find((a) => a.id === app.actorId);
                  const call = castingCalls.find((c) => c.id === app.castingCallId);
                  const role = call?.roles.find((r) => r.id === app.roleId);

                  if (!actor) return null;

                  return (
                    <div
                      key={app.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl hover:border-amber-500/30 transition-all flex flex-col md:flex-row gap-5 backdrop-blur-xl"
                    >
                      {/* Left: Applicant avatar */}
                      <div className="flex items-center md:items-start space-x-3 md:space-x-0 md:flex-col md:w-32 shrink-0">
                        <img
                          src={actor.headshotUrl}
                          alt={actor.name}
                          className="h-14 w-14 md:h-20 md:w-20 rounded-xl object-cover border border-white/20 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        <div className="md:mt-2 md:text-center md:w-full min-w-0">
                          <h4 className="font-bold text-xs text-white truncate leading-tight font-display">{actor.name}</h4>
                          <span className="text-[10px] text-amber-500 font-mono font-medium block mt-0.5">
                            {actor.age} yrs • {actor.heightCm}cm
                          </span>
                          <button
                            type="button"
                            onClick={() => { if (!isProducerLoggedIn && onJoinForFree) { onJoinForFree(); } else { onViewActorProfile(actor); } }}
                            className="text-[10px] text-amber-500 hover:text-amber-400 font-bold md:mt-1 block mx-auto cursor-pointer hover:underline"
                          >
                            Full Profile
                          </button>
                        </div>
                      </div>

                      {/* Middle: Applied Role & Pitch details */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            Applied Role: {role?.title || 'Unknown Role'}
                          </span>
                          <p className="text-xs font-bold text-white mt-1 font-display">
                            {call?.title} <span className="font-normal text-white/50">({call?.company})</span>
                          </p>
                        </div>

                        {app.message ? (
                          <div className="bg-[#080809] rounded-xl p-3 border border-white/5 flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                            <p className="text-xs text-white/70 font-sans italic leading-relaxed">
                              &ldquo;{app.message}&rdquo;
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 italic">No introduction message pitch attached.</p>
                        )}

                        {/* Interactive Audition Media Playback */}
                        {(app.selfTapeUrl || app.audioAuditionUrl) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-white/5 mt-2">
                            {app.selfTapeUrl && (
                              <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1.5">
                                <div className="flex items-center space-x-1.5">
                                  <Video className="h-3.5 w-3.5 text-red-400" />
                                  <span className="text-[10px] font-bold text-red-400 font-mono uppercase tracking-wider">Submitted Audition Self-Tape</span>
                                </div>
                                <video
                                  src={app.selfTapeUrl}
                                  className="w-full rounded-lg border border-white/10 aspect-video object-cover"
                                  controls
                                  preload="none"
                                />
                              </div>
                            )}

                            {app.audioAuditionUrl && (
                              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-1.5">
                                <div className="flex items-center space-x-1.5">
                                  <Mic className="h-3.5 w-3.5 text-amber-400" />
                                  <span className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider">Submitted Audition Voiceover</span>
                                </div>
                                <div className="bg-black/40 p-1.5 rounded-lg border border-white/5 flex items-center justify-center">
                                  <audio
                                    src={app.audioAuditionUrl}
                                    className="w-full h-8"
                                    controls
                                    preload="none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI Match Analysis report */}
                        <div className="mt-2.5 pt-2.5 border-t border-white/5 space-y-2">
                          {!matchAnalyses[app.id] ? (
                            <button
                              type="button"
                              disabled={isAnalyzingAppId === app.id}
                              onClick={() => handleAnalyzeMatch(app.id, actor, role)}
                              className="w-full inline-flex items-center justify-center space-x-1.5 rounded-xl border border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-500 transition-all cursor-pointer disabled:opacity-40"
                            >
                              {isAnalyzingAppId === app.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                              )}
                              <span>{isAnalyzingAppId === app.id ? 'Analyzing compatibility...' : 'Analyze Match Compatibility with AI'}</span>
                            </button>
                          ) : (
                            <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-black/40 to-transparent p-3.5 space-y-2.5 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                  <span className="text-[10px] font-bold text-white uppercase tracking-wider font-display">AI Compatibility Match Analysis</span>
                                </div>
                                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                                  matchAnalyses[app.id].score >= 80 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                    : matchAnalyses[app.id].score >= 50 
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}>
                                  {matchAnalyses[app.id].score}% Match
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    matchAnalyses[app.id].score >= 80 ? 'bg-emerald-500' : matchAnalyses[app.id].score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${matchAnalyses[app.id].score}%` }}
                                />
                              </div>

                              <p className="text-[11px] text-white/80 leading-relaxed font-sans italic">
                                &ldquo;{matchAnalyses[app.id].verdict}&rdquo;
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10px] pt-1">
                                <div className="space-y-1">
                                  <span className="text-emerald-400 font-bold block font-mono">✓ MATCHING STRENGTHS</span>
                                  <ul className="list-disc list-inside space-y-0.5 text-white/60">
                                    {matchAnalyses[app.id].matchingStrengths.map((s, idx) => (
                                      <li key={idx} className="truncate">{s}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-amber-500 font-bold block font-mono">⚠ AREAS OF DIFFERENCE</span>
                                  <ul className="list-disc list-inside space-y-0.5 text-white/60">
                                    {matchAnalyses[app.id].areasForImprovement.map((a, idx) => (
                                      <li key={idx} className="truncate">{a}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                          <span>Applicant Hub: {actor.location}</span>
                          <span>Submitted: {new Date(app.dateApplied).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-5 flex flex-row md:flex-col justify-end md:justify-center items-center md:w-44 gap-2 shrink-0">
                        {/* Status Label */}
                        <div className="text-right w-full hidden md:block mb-2">
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block font-mono">Current Status</span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase font-mono mt-0.5 ${
                            app.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : app.status === 'shortlisted'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : app.status === 'invited'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                              : app.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/5 text-white/50 border border-white/10'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Core Controls */}
                        <div className="flex flex-wrap md:flex-col items-center justify-end md:w-full gap-1.5 text-xs">
                          <select
                            value={app.status}
                            onChange={(e) => onUpdateApplicationStatus(app.id, e.target.value as Application['status'])}
                            className={`w-full rounded-lg border px-3 py-2 text-xs font-bold transition-all focus:outline-hidden cursor-pointer appearance-none text-center ${
                              app.status === 'pending'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                : app.status === 'shortlisted'
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                : app.status === 'invited'
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                : app.status === 'accepted'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                : 'bg-white/5 border-white/10 text-white/50'
                            }`}
                          >
                            <option value="pending" className="bg-black text-white">Pending Review</option>
                            <option value="shortlisted" className="bg-black text-amber-400">Shortlisted</option>
                            <option value="invited" className="bg-black text-blue-400">Invited to Audition</option>
                            <option value="accepted" className="bg-black text-emerald-400">Hired / Accepted</option>
                            <option value="declined" className="bg-black text-white/50">Declined</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                <p className="text-xs text-white/40 italic">No applications filed for this casting call yet.</p>
                <p className="text-[10px] text-white/30 mt-1">Switch to the Actor Portal to submit mock applications and review them here!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER SHORTLIST TAB */}
      {producerTab === 'shortlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-white/40 font-mono">
            <span>You have shortlisted <strong>{shortlistedActors.length}</strong> candidates</span>
          </div>

          {shortlistedActors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shortlistedActors.map((actor) => (
                <div
                  key={actor.id}
                  className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl"
                >
                  <div className="aspect-[4/3] bg-[#0e0e11] relative">
                    <img
                      src={actor.headshotUrl}
                      alt={actor.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => onToggleShortlist(actor.id)}
                      className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-black/80 border border-white/10 text-amber-400 shadow-md transition-all hover:scale-110 cursor-pointer"
                    >
                      <Award className="h-4.5 w-4.5 fill-amber-400/20" />
                    </button>
                    
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#080809] to-transparent p-3 text-white">
                      <span className="rounded-md bg-white/20 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase font-mono border border-white/10 text-amber-400">
                        {actor.type}
                      </span>
                      <h4 className="font-bold text-sm mt-1 font-display">{actor.name}</h4>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-white/50 flex items-center font-mono">
                        <MapPin className="mr-0.5 h-3.5 w-3.5 text-amber-500" />
                        {actor.location}
                      </p>
                      
                      <div className="text-[10px] font-mono text-white/40">
                        Playing Range: <strong className="text-white">{actor.age} yrs</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => { if (!isProducerLoggedIn && onJoinForFree) { onJoinForFree(); } else { onViewActorProfile(actor); } }}
                      className="mt-4 inline-flex items-center space-x-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors border-t border-white/10 pt-2.5 w-full cursor-pointer hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Open Composite Card</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <Award className="h-10 w-10 text-white/20 mx-auto" />
              <p className="text-xs text-white/40 italic mt-3">Your shortlisted performers will appear here.</p>
              <p className="text-[10px] text-white/30 mt-1">Browse the talent database and click the badge icon in the corner to shortlist profiles.</p>
            </div>
          )}
        </div>
      )}

    {/* INVITE TALENT TO AUDITION MODAL */}
      {inviteModalActor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e0e11] border border-white/10 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full overflow-hidden border border-amber-500/30 shrink-0">
                  <img src={inviteModalActor.headshotUrl} alt={inviteModalActor.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Invite {inviteModalActor.name} for Audition</h3>
                  <p className="text-[10px] text-white/50 font-mono">Direct Recruiter Invitation & Role Request</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalActor(null)}
                className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onSendAuditionInvite) {
                  onSendAuditionInvite(inviteModalActor.id, selectedInviteCastingId, inviteRoleTitle, inviteMessage);
                } else {
                  showToast?.('success', `Audition Invitation sent to ${inviteModalActor.name}!`);
                }
                setInviteModalActor(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] text-white/60 font-mono uppercase font-bold mb-1">
                  Select Production / Casting Call
                </label>
                <select
                  value={selectedInviteCastingId}
                  onChange={(e) => setSelectedInviteCastingId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-sans"
                >
                  {castingCalls.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0e0e11] text-white">
                      {c.title} — ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-white/60 font-mono uppercase font-bold mb-1">
                  Role Title & Character Category
                </label>
                <input
                  type="text"
                  required
                  value={inviteRoleTitle}
                  onChange={(e) => setInviteRoleTitle(e.target.value)}
                  placeholder="e.g. Lead Female Protagonist / Supporting Actor"
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/60 font-mono uppercase font-bold mb-1">
                  Invitation Note / Monologue Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black p-3 text-xs text-white focus:outline-hidden focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setInviteModalActor(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 font-bold text-xs hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Audition Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECRUITER PRO TELEBIRR UPGRADE MODAL */}
      {isRecruiterPaymentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0e0e11] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#080809] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide">Recruiter Pro Membership</h3>
                  <p className="text-[10px] text-emerald-400 font-mono">Telebirr Account: +251911381970</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRecruiterPaymentModalOpen(false);
                  setPaymentSuccessMessage(false);
                }}
                className="rounded-full p-1 text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {paymentSuccessMessage ? (
                <div className="py-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="h-6 w-6 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Payment Request Submitted!</h4>
                    <p className="text-xs text-white/60 max-w-xs mx-auto">
                      Your transfer request has been submitted to the platform owner on Telebirr (+251911381970). Your Recruiter Pro status will be activated upon owner approval.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecruiterPaymentModalOpen(false);
                      setPaymentSuccessMessage(false);
                    }}
                    className="w-full py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Done & Return to Workspace
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmittingPayment(true);
                    if (onSubmitPaymentRequest) {
                      onSubmitPaymentRequest({
                        userName: recruiterName || 'Casting Director',
                        userEmail: recruiterEmail || 'recruiter@addistalent.com',
                        userPhone: recruiterPhone,
                        userType: 'producer',
                        planName: 'Recruiter Pro Pass (1,500 ETB)',
                        amount: 1500,
                        transactionRef: recruiterTxRef
                      });
                    }
                    setTimeout(() => {
                      setIsSubmittingPayment(false);
                      setPaymentSuccessMessage(true);
                    }, 1000);
                  }}
                  className="space-y-4"
                >
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                      1. Send 1,500 ETB to Telebirr
                    </span>
                    <p className="text-xs text-white/80 font-bold font-mono">
                      Account: +251911381970
                    </p>
                    <p className="text-[10px] text-white/50 leading-relaxed">
                      Transfer 1,500 ETB via Telebirr app or *127#, then enter your transaction reference ID below for owner approval.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/60 font-mono uppercase font-bold mb-1">
                      Your Name / Production House
                    </label>
                    <input
                      type="text"
                      required
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-white/60 font-mono uppercase font-bold mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0911223344"
                        value={recruiterPhone}
                        onChange={(e) => setRecruiterPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/60 font-mono uppercase font-bold mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. studio@film.et"
                        value={recruiterEmail}
                        onChange={(e) => setRecruiterEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-amber-400 font-mono uppercase font-bold mb-1">
                      Telebirr Transaction Ref ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TLB89120394"
                      value={recruiterTxRef}
                      onChange={(e) => setRecruiterTxRef(e.target.value)}
                      className="w-full rounded-xl border border-amber-500/50 bg-black px-3 py-2 text-xs text-amber-300 font-mono focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsRecruiterPaymentModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 font-bold text-xs hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingPayment || !recruiterTxRef || !recruiterPhone}
                      className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      {isSubmittingPayment ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <span>Submit for Owner Approval</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
