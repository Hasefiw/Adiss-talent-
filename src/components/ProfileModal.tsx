import React, { useState } from 'react';
import { X, Mail, Phone, Instagram, Globe, Sparkles, Award, MapPin, Calendar, PlusCircle, Lock, Camera, Video, FileText, RefreshCw } from 'lucide-react';
import { Actor } from '../types';

interface ProfileModalProps {
  actor: Actor | null;
  isOpen: boolean;
  onClose: () => void;
  isProducerView: boolean;
  isShortlisted: boolean;
  onToggleShortlist: (actorId: string) => void;
  onInviteToAudition?: (actorId: string) => void;
  isProducerPremium?: boolean;
  onUnlockProducerPremium?: () => void;
}

export default function ProfileModal({
  actor,
  isOpen,
  onClose,
  isProducerView,
  isShortlisted,
  onToggleShortlist,
  onInviteToAudition,
  isProducerPremium = false,
  onUnlockProducerPremium
}: ProfileModalProps) {
  const [isContactUnlocked, setIsContactUnlocked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Payment Gateway Form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'telebirr' | 'cbe' | 'chapa'>('telebirr');
  const [paymentOption, setPaymentOption] = useState<'single' | 'premium'>('single');

  const handleUnlockContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsContactUnlocked(true);
      setShowPaymentForm(false);
      if (paymentOption === 'premium' && onUnlockProducerPremium) {
        onUnlockProducerPremium();
      }
    }, 2000);
  };

  if (!isOpen || !actor) {
    // Reset state when closed
    if (isContactUnlocked) setIsContactUnlocked(false);
    if (isProcessingPayment) setIsProcessingPayment(false);
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      {/* Fixed Close Button for Mobile */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 md:hidden z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white/90 hover:text-white shadow-lg border border-white/20 transition-all cursor-pointer backdrop-blur-xl"
      >
        <X className="h-5 w-5" />
      </button>

      <div 
        id={`profile-modal-${actor.id}`}
        className="relative w-full max-w-4xl rounded-2xl bg-[#0e0e11] shadow-2xl overflow-y-auto md:overflow-hidden max-h-[95vh] md:max-h-[90vh] flex flex-col md:flex-row border border-white/10"
      >
        
        {/* Desktop Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white/60 hover:text-white shadow-md border border-white/10 transition-all hover:scale-105 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: Photo & Quick Contact Stats */}
        <div className="w-full md:w-2/5 flex-none bg-[#080809] text-white relative flex flex-col justify-between p-6 border-r border-white/10">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10">
            {/* Aspect ratio framed headshot */}
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <img
                src={actor.headshotUrl}
                alt={actor.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-5">
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20 font-mono">
                {actor.type === 'both' ? 'Actor & Model' : actor.type === 'actor' ? 'Actor' : 'Model'}
              </span>
              <div className="flex justify-center items-center space-x-2 mt-2">
                <h2 className="text-2xl font-bold tracking-tight font-display">{actor.name}</h2>
                {(actor.isVerified || (actor.experience && actor.experience.length >= 2)) && (
                  <Sparkles className="h-5 w-5 text-amber-500" title="Verified Premium Talent" />
                )}
              </div>
              <p className="flex items-center text-xs text-white/60 mt-1">
                <MapPin className="mr-1 h-3.5 w-3.5 text-amber-500" />
                {actor.location}
              </p>
            </div>
          </div>

          {/* Quick Stats Block & Contacts */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 space-y-3 text-xs text-white/70 font-mono">
            <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Contact Details</h4>
            
            {isProducerView ? (
              (isContactUnlocked || isProducerPremium) ? (
                <>
                  <a href={`mailto:${actor.contactEmail}`} className="flex items-center space-x-2 hover:text-amber-400 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-white/40" />
                    <span className="truncate">{actor.contactEmail}</span>
                  </a>

                  <a href={`tel:${actor.phone}`} className="flex items-center space-x-2 hover:text-amber-400 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-white/40" />
                    <span>{actor.phone}</span>
                  </a>

                  {actor.instagram && (
                    <div className="flex items-center space-x-2">
                      <Instagram className="h-3.5 w-3.5 text-white/40" />
                      <span className="text-amber-400 font-medium">{actor.instagram}</span>
                    </div>
                  )}

                  {actor.website && (
                    <a href={`https://${actor.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-amber-400 transition-colors">
                      <Globe className="h-3.5 w-3.5 text-white/40" />
                      <span className="underline truncate">{actor.website}</span>
                    </a>
                  )}
                </>
              ) : !showPaymentForm ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 blur-[4px] select-none opacity-50">
                    <Mail className="h-3.5 w-3.5 text-white/40" />
                    <span className="truncate">hidden@example.com</span>
                  </div>
                  <div className="flex items-center space-x-2 blur-[4px] select-none opacity-50">
                    <Phone className="h-3.5 w-3.5 text-white/40" />
                    <span>+251 9XX XXX XXX</span>
                  </div>
                  
                  <button 
                    onClick={() => setShowPaymentForm(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 py-2 rounded-lg transition-all cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Pay to Unlock Contact</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUnlockContact} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Payment Gateway</span>
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="text-[9px] font-mono text-white/40 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Payment option selector */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('single')}
                      className={`p-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all text-center border ${
                        paymentOption === 'single'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-transparent border-white/10 text-white/60'
                      }`}
                    >
                      Single: 100 ETB
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOption('premium')}
                      className={`p-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all text-center border ${
                        paymentOption === 'premium'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-transparent border-white/10 text-white/60'
                      }`}
                    >
                      Pro Plan: 1,200 ETB
                    </button>
                  </div>

                  {/* Provider Selector */}
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'telebirr', name: 'telebirr' },
                      { id: 'cbe', name: 'CBE' },
                      { id: 'chapa', name: 'Chapa' }
                    ].map((prov) => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => setPaymentProvider(prov.id as any)}
                        className={`py-1 rounded text-[8px] font-mono font-bold uppercase transition-all ${
                          paymentProvider === prov.id
                            ? 'bg-amber-500 text-black'
                            : 'bg-white/5 text-white/60'
                        }`}
                      >
                        {prov.name}
                      </button>
                    ))}
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0912345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded border border-white/10 bg-[#080809] px-2 py-1 text-[10px] text-white font-mono focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment || !phoneNumber}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-[10px] font-bold rounded uppercase transition-all flex items-center justify-center gap-1"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                        <span>Authorizing...</span>
                      </>
                    ) : (
                      <span>Pay {paymentOption === 'single' ? '100 ETB' : '1,200 ETB'}</span>
                    )}
                  </button>
                </form>
              )
            ) : (
              <div className="text-white/40 text-[10px] italic">
                Log in as a Hiring Manager/Producer to view and unlock direct contact details.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Comp Card & Credits (Scrollable) */}
        <div className="w-full md:w-3/5 p-6 sm:p-8 overflow-visible md:overflow-y-auto flex-none md:flex-1 flex flex-col justify-between bg-[#0e0e11]/85 backdrop-blur-md">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-white/10 pb-4">
              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                Representation: Freelance / Independent
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                Union Status: Non-Union
              </span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                Willing to Travel
              </span>
            </div>

            {/* Professional Statistics Grid */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono mb-3">Physical Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-lg bg-white/5 border border-white/5 p-2.5 text-center">
                  <p className="text-[10px] text-white/40 uppercase font-mono font-medium">Height</p>
                  <p className="text-xs font-semibold text-white mt-0.5">
                    {actor.heightCm} cm <span className="text-[9px] font-normal text-white/40">({Math.floor(actor.heightCm / 30.48)}&apos;{Math.round((actor.heightCm % 30.48) / 2.54)}&quot;)</span>
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/5 p-2.5 text-center">
                  <p className="text-[10px] text-white/40 uppercase font-mono font-medium">Playing Range</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{actor.age} yrs</p>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/5 p-2.5 text-center">
                  <p className="text-[10px] text-white/40 uppercase font-mono font-medium">Eye Color</p>
                  <p className="text-xs font-semibold text-white mt-0.5 capitalize">{actor.eyeColor}</p>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/5 p-2.5 text-center">
                  <p className="text-[10px] text-white/40 uppercase font-mono font-medium">Hair</p>
                  <p className="text-xs font-semibold text-white mt-0.5 capitalize">{actor.hairColor} / {actor.hairLength}</p>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono mb-2">Biography</h3>
              <p className="text-xs text-white/80 leading-relaxed font-sans">{actor.bio}</p>
            </div>

            {/* Skills / Special Attributes */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono mb-2.5">Skills & Special Attributes</h3>
              <div className="flex flex-wrap gap-1.5">
                {actor.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-xs text-amber-400 font-medium font-mono"
                  >
                    <Sparkles className="mr-1 h-3 w-3 text-amber-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages & Fluencies */}
            {actor.languages && actor.languages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono mb-2.5">Languages & Fluency</h3>
                <div className="flex flex-wrap gap-1.5">
                  {actor.languages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs text-blue-400 font-bold font-mono"
                    >
                      🌍 {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Media Reels (Video & Audio VO) */}
            {actor.mediaReels && (actor.mediaReels.videoUrl || actor.mediaReels.audioUrl) && (
              <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse animate-duration-1000"></span>
                  Active Demo Reels & Voice Samples
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {actor.mediaReels.videoUrl && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono text-white/60 font-semibold flex items-center gap-1">
                        📺 Video Showreel: <span className="text-amber-400">{actor.mediaReels.videoTitle || 'Dramatic Monologue'}</span>
                      </p>
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-white/5">
                        <video
                          src={actor.mediaReels.videoUrl}
                          controls
                          className="w-full h-full object-cover"
                          preload="none"
                        />
                      </div>
                    </div>
                  )}
                  {actor.mediaReels.audioUrl && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono text-white/60 font-semibold flex items-center gap-1">
                        🎙️ Voiceover (VO) Reel: <span className="text-amber-400">{actor.mediaReels.audioTitle || 'Commercial Voice Demo'}</span>
                      </p>
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center">
                        <audio
                          src={actor.mediaReels.audioUrl}
                          controls
                          className="w-full h-8"
                          preload="none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Theatrical / Screen Resumé */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono mb-2">
                Professional Resume / Selected Credits
              </h3>
              
              {actor.experience && actor.experience.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-left text-xs font-sans">
                    <thead className="bg-white/5 font-mono text-[10px] uppercase font-bold text-white/40">
                      <tr>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2">Project</th>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2">Production / Company</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#080809]/50 text-white/70">
                      {actor.experience.map((exp) => (
                        <tr key={exp.id} className="hover:bg-white/5">
                          <td className="px-3 py-2 font-mono text-white/40">{exp.year}</td>
                          <td className="px-3 py-2 font-semibold text-white">{exp.project}</td>
                          <td className="px-3 py-2 text-amber-400 font-medium">{exp.role}</td>
                          <td className="px-3 py-2 text-white/50">{exp.production}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-white/40 italic">No acting experience logged yet.</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Comp Card & Digitals</span>
              </h3>
              {actor.isPremium ? (
                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold font-mono">
                  ★ Talent Pro Portfolio
                </span>
              ) : (
                <span className="text-[9px] bg-white/5 text-white/40 border border-white/10 px-2.5 py-0.5 rounded-full font-bold font-mono">
                  Standard Profile
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Slot 0: Primary Headshot (Always Unlocked) */}
              <div className="aspect-[3/4] bg-[#080809] rounded-lg overflow-hidden border border-amber-500/20 relative group cursor-pointer shadow-lg">
                <img 
                  src={actor.headshotUrl} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-300" 
                  alt="Primary Headshot" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[10px] text-amber-400 font-mono font-bold">Primary Headshot</span>
                </div>
              </div>

              {/* Slots 1, 2, 3 (The professional photo gallery looks) */}
              {[1, 2, 3].map((slotIdx) => {
                const photoUrl = actor.professionalPhotos?.[slotIdx - 1];
                const isPremium = actor.isPremium;

                if (isPremium) {
                  if (photoUrl) {
                    return (
                      <div key={slotIdx} className="aspect-[3/4] bg-[#080809] rounded-lg overflow-hidden border border-white/10 relative group cursor-pointer shadow-lg">
                        <img 
                          src={photoUrl} 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-300" 
                          alt={`Look 0${slotIdx + 1}`}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[10px] text-white/95 font-mono font-medium">Look 0{slotIdx + 1}</span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={slotIdx} className="aspect-[3/4] bg-white/[0.02] rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center p-3 text-center">
                        <Camera className="h-5 w-5 text-white/20 mb-1" />
                        <span className="text-[9px] font-mono text-white/40 block">Look 0{slotIdx + 1}</span>
                        <span className="text-[8px] text-white/20 block mt-0.5">Empty Slot</span>
                      </div>
                    );
                  }
                } else {
                  return (
                    <div key={slotIdx} className="aspect-[3/4] bg-black/40 rounded-lg border border-dashed border-white/5 relative flex flex-col items-center justify-center p-3 text-center overflow-hidden group">
                      <img 
                        src={`https://images.unsplash.com/photo-${slotIdx === 1 ? '1494790108377-be9c29b29330' : slotIdx === 2 ? '1506794778202-cad84cf45f1d' : '1500648767791-00dcc994a43e'}?auto=format&fit=crop&w=150&h=200&q=20`}
                        className="absolute inset-0 w-full h-full object-cover opacity-10 blur-[8px] select-none pointer-events-none"
                        alt=""
                      />
                      <Lock className="h-4 w-4 text-white/25 group-hover:text-amber-500/50 transition-colors z-10" />
                      <span className="text-[9px] font-mono text-white/30 block mt-1 z-10">Look 0{slotIdx + 1} Locked</span>
                      <span className="text-[8px] text-amber-500/40 font-semibold uppercase tracking-wider block mt-0.5 z-10">Talent Pro</span>
                    </div>
                  );
                }
              })}
            </div>
            
            <div className="mt-4 flex gap-2">
              <button className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all">
                <FileText className="h-3.5 w-3.5 text-white/60" />
                <span>Export PDF Resume</span>
              </button>
              <button className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all">
                <Video className="h-3.5 w-3.5 text-white/60" />
                <span>View Acting Reel</span>
              </button>
            </div>
          </div>

          {/* Bottom Call-To-Action Controls */}
          {isProducerView && (
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
              <button
                onClick={() => onToggleShortlist(actor.id)}
                className={`w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold border transition-all cursor-pointer ${
                  isShortlisted
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-transparent border-white/20 text-white/80 hover:bg-white/10'
                }`}
              >
                <Award className={`mr-1.5 h-4 w-4 ${isShortlisted ? 'text-amber-400 fill-amber-400/20' : 'text-white/40'}`} />
                {isShortlisted ? 'In Shortlist' : 'Add to Shortlist'}
              </button>
              
              {onInviteToAudition && (
                <button
                  onClick={() => onInviteToAudition(actor.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition-all shadow-md cursor-pointer"
                >
                  <PlusCircle className="mr-1.5 h-4 w-4 text-black" />
                  Invite to Audition
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
