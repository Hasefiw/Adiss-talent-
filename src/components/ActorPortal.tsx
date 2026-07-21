import React, { useState, useEffect } from 'react';
import { 
  Search, User, Mail, Phone, MapPin, Sparkles, AlertCircle, Edit, Save, Plus, 
  ArrowRight, CheckCircle2, History, Send, X, Video, Mic, Volume2, Play, 
  Square, Check, RefreshCw, BookOpen, Camera, Award, CreditCard, DollarSign,
  ChevronRight, HelpCircle, AlertTriangle, ShieldAlert, Lock, Trash2
} from 'lucide-react';
import { Actor, CastingCall, Application, WorkExperience, ActorType } from '../types';

interface ActorPortalProps {
  actors: Actor[];
  castingCalls: CastingCall[];
  applications: Application[];
  activeActor: Actor | null;
  isActorLoggedIn?: boolean;
  onUpdateActor: (updatedActor: Actor) => void;
  onApply: (castingCallId: string, roleId: string, actorId: string, message: string, selfTapeUrl?: string, audioAuditionUrl?: string) => void;
  showToast?: (type: 'success' | 'info', text: string) => void;
  onJoinForFree?: () => void;
  onSubmitPaymentRequest?: (data: {
    userName: string;
    userEmail: string;
    userPhone: string;
    userType: 'actor' | 'producer';
    planName: string;
    amount: number;
    transactionRef: string;
  }) => void;
}

export default function ActorPortal({
  actors,
  castingCalls,
  applications,
  activeActor,
  isActorLoggedIn = false,
  onUpdateActor,
  onApply,
  showToast,
  onJoinForFree,
  onSubmitPaymentRequest
}: ActorPortalProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchCastingQuery, setSearchCastingQuery] = useState<string>('');

  // Custom Marketplace & Academy Hub states
  const [bookedPhotoshoot, setBookedPhotoshoot] = useState<{
    studio: string;
    datetime: string;
    status: 'pending' | 'delivered';
    deliveredPhotoIdx?: number;
  } | null>(null);
  const [enrolledMasterclass, setEnrolledMasterclass] = useState<boolean>(false);
  const [activeMasterclassTab, setActiveMasterclassTab] = useState<'lessons' | 'microphone' | 'lighting'>('lessons');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<'photography' | 'masterclass' | 'talent_pro' | 'producer_premium' | null>(null);
  const [uploadingSlotIdx, setUploadingSlotIdx] = useState<number | null>(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  
  // Checkout variables
  const [selectedStudio, setSelectedStudio] = useState<string>('Bole Professional Studio Hub');
  const [bookingDate, setBookingDate] = useState<string>('2026-07-25');
  const [bookingTime, setBookingTime] = useState<string>('14:00');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbebirr' | 'chapa'>('telebirr');
  const [actorCheckoutPhone, setActorCheckoutPhone] = useState<string>(activeActor?.phone || '0911223344');
  const [actorCheckoutTxRef, setActorCheckoutTxRef] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Delivered studio mockup photos for selection after shoot delivery
  const studioMockupPhotos = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80', // Professional headshot 1
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80', // Professional headshot 2
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&h=600&q=80', // Professional headshot 3
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=600&q=80'  // Professional headshot 4
  ];
  
  // Application modal state
  const [applyingRole, setApplyingRole] = useState<{ call: CastingCall; roleId: string; roleTitle: string } | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [auditionType, setAuditionType] = useState<'pitch' | 'video' | 'audio'>('pitch');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | undefined>(undefined);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | undefined>(undefined);
  const [audioVolume, setAudioVolume] = useState<number[]>([10, 20, 15, 30, 10, 5]);

  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    let timeout: any = null;
    if (countdown > 0) {
      timeout = setTimeout(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            setIsRecording(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [countdown]);

  useEffect(() => {
    let volInterval: any = null;
    if (isRecording) {
      volInterval = setInterval(() => {
        setAudioVolume(Array.from({ length: 14 }, () => Math.floor(Math.random() * 85) + 10));
      }, 120);
    } else {
      setAudioVolume([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
    }
    return () => clearInterval(volInterval);
  }, [isRecording]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Local edit state for the active actor
  const [editName, setEditName] = useState(activeActor?.name || '');
  const [editType, setEditType] = useState<ActorType>(activeActor?.type || 'both');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'non-binary'>(activeActor?.gender || 'male');
  const [editAge, setEditAge] = useState(activeActor?.age || 25);
  const [editHeight, setEditHeight] = useState(activeActor?.heightCm || 175);
  const [editEye, setEditEye] = useState(activeActor?.eyeColor || '');
  const [editHairCol, setEditHairCol] = useState(activeActor?.hairColor || '');
  const [editHairLen, setEditHairLen] = useState(activeActor?.hairLength || '');
  const [editEthnicity, setEditEthnicity] = useState(activeActor?.ethnicity || '');
  const [editLocation, setEditLocation] = useState(activeActor?.location || '');
  const [editBio, setEditBio] = useState(activeActor?.bio || '');
  const [editSkills, setEditSkills] = useState(activeActor?.skills.join(', ') || '');
  const [editEmail, setEditEmail] = useState(activeActor?.contactEmail || '');
  const [editPhone, setEditPhone] = useState(activeActor?.phone || '');
  const [editInstagram, setEditInstagram] = useState(activeActor?.instagram || '');
  const [editWebsite, setEditWebsite] = useState(activeActor?.website || '');
  
  // Edit experience state
  const [editExperience, setEditExperience] = useState<WorkExperience[]>(activeActor?.experience || []);

  // AI Integration States
  const [isGeneratingMonologue, setIsGeneratingMonologue] = useState(false);
  const [generatedMonologue, setGeneratedMonologue] = useState<string | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isCritiquingBio, setIsCritiquingBio] = useState(false);
  const [critiqueSuggestions, setCritiqueSuggestions] = useState<string[] | null>(null);
  const [optimizedBio, setOptimizedBio] = useState<string | null>(null);
  const [optimizedSkills, setOptimizedSkills] = useState<string[] | null>(null);

  const handleGenerateAiMonologue = async (roleTitle: string, roleDesc: string, projectTitle: string, projectDesc: string) => {
    setIsGeneratingMonologue(true);
    setGeneratedMonologue(null);
    try {
      const response = await fetch('/api/ai/monologue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleTitle,
          roleDescription: roleDesc,
          projectTitle,
          projectDescription: projectDesc
        })
      });
      const data = await response.json();
      if (response.ok && data.monologue) {
        setGeneratedMonologue(data.monologue);
        if (showToast) showToast('success', 'AI monologue script generated successfully!');
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast('info', `AI monologue failed: ${err.message || 'Key missing'}`);
    } finally {
      setIsGeneratingMonologue(false);
    }
  };

  const handleGenerateAiPitch = async (roleTitle: string, roleDesc: string, projectTitle: string) => {
    if (!activeActor) return;
    setIsGeneratingPitch(true);
    try {
      const response = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorName: activeActor.name,
          actorBio: activeActor.bio,
          actorSkills: activeActor.skills,
          roleTitle,
          roleDescription: roleDesc,
          projectTitle
        })
      });
      const data = await response.json();
      if (response.ok && data.pitch) {
        setApplicationMessage(data.pitch);
        if (showToast) showToast('success', 'AI cover pitch generated and pre-filled!');
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast('info', `AI pitch failed: ${err.message || 'Key missing'}`);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleCritiqueProfile = async () => {
    setIsCritiquingBio(true);
    setCritiqueSuggestions(null);
    setOptimizedBio(null);
    setOptimizedSkills(null);
    try {
      const response = await fetch('/api/ai/critique-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: editBio,
          skills: editSkills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        })
      });
      const data = await response.json();
      if (response.ok && data.optimizedBio) {
        setCritiqueSuggestions(data.suggestions || []);
        setOptimizedBio(data.optimizedBio);
        setOptimizedSkills(data.optimizedSkills || []);
        if (showToast) showToast('success', 'AI profile audit and optimization complete!');
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast('info', `AI bio critique failed: ${err.message || 'Key missing'}`);
    } finally {
      setIsCritiquingBio(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActor) return;

    const skillsArray = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated: Actor = {
      ...activeActor,
      name: editName,
      type: editType,
      gender: editGender,
      age: Number(editAge) || activeActor.age,
      heightCm: Number(editHeight) || activeActor.heightCm,
      eyeColor: editEye,
      hairColor: editHairCol,
      hairLength: editHairLen,
      ethnicity: editEthnicity,
      location: editLocation,
      bio: editBio,
      skills: skillsArray,
      contactEmail: editEmail,
      phone: editPhone,
      instagram: editInstagram,
      website: editWebsite,
      experience: editExperience
    };

    onUpdateActor(updated);
    setIsEditingProfile(false);
  };

  const handleCheckoutInitiate = (type: 'photography' | 'masterclass' | 'talent_pro' | 'producer_premium') => {
    setIsCheckoutModalOpen(type);
    setPaymentSuccess(false);
    setIsPaying(false);
  };

  const handleCheckoutPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);

    const planTitle = isCheckoutModalOpen === 'photography' 
      ? 'Headshot Photo Session' 
      : isCheckoutModalOpen === 'talent_pro' 
      ? 'Talent Pro Annual Membership' 
      : 'Academy Masterclass Series';

    const costAmount = isCheckoutModalOpen === 'photography' 
      ? 3500 
      : isCheckoutModalOpen === 'talent_pro' 
      ? 450 
      : 1800;

    if (onSubmitPaymentRequest) {
      onSubmitPaymentRequest({
        userName: activeActor?.name || 'Actor Talent',
        userEmail: activeActor?.contactEmail || 'talent@addistalent.com',
        userPhone: actorCheckoutPhone,
        userType: 'actor',
        planName: planTitle,
        amount: costAmount,
        transactionRef: actorCheckoutTxRef || `TLB${Math.floor(10000000 + Math.random() * 90000000)}`
      });
    }
    
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      
      if (isCheckoutModalOpen === 'photography') {
        setBookedPhotoshoot({
          studio: selectedStudio,
          datetime: `${bookingDate} at ${bookingTime}`,
          status: 'pending'
        });
        if (showToast) showToast('success', `${costAmount.toLocaleString()} ETB Telebirr payment submitted! Scheduled at ${selectedStudio}. Awaiting owner approval.`);
      } else if (isCheckoutModalOpen === 'talent_pro') {
        if (activeActor) {
          const updated: Actor = {
            ...activeActor,
            isPremium: true
          };
          onUpdateActor(updated);
        }
        if (showToast) showToast('success', `${costAmount.toLocaleString()} ETB Telebirr payment submitted! Awaiting owner approval on +251911381970.`);
      } else {
        setEnrolledMasterclass(true);
        if (showToast) showToast('success', `${costAmount.toLocaleString()} ETB Telebirr payment request submitted for Masterclass! Awaiting owner approval.`);
      }
    }, 1500);
  };

  const handleApplyDeliveredPhoto = (photoUrl: string, idx: number) => {
    if (!activeActor) return;
    const updatedActor: Actor = {
      ...activeActor,
      headshotUrl: photoUrl
    };
    onUpdateActor(updatedActor);
    if (bookedPhotoshoot) {
      setBookedPhotoshoot({
        ...bookedPhotoshoot,
        status: 'delivered',
        deliveredPhotoIdx: idx
      });
    }
    if (showToast) showToast('success', 'Your comp card profile headshot has been updated to the premium studio portrait!');
  };

  const handleAddExperienceRow = () => {
    const newRow: WorkExperience = {
      id: `exp_gen_${Date.now()}`,
      year: new Date().getFullYear().toString(),
      project: '',
      role: '',
      production: ''
    };
    setEditExperience([...editExperience, newRow]);
  };

  const handleExperienceChange = (id: string, field: keyof WorkExperience, val: string) => {
    setEditExperience(
      editExperience.map((exp) => (exp.id === id ? { ...exp, [field]: val } : exp))
    );
  };

  const handleRemoveExperienceRow = (id: string) => {
    setEditExperience(editExperience.filter((exp) => exp.id !== id));
  };

  const handleOpenApplyModal = (call: CastingCall, roleId: string, roleTitle: string) => {
    if (!isActorLoggedIn) {
      if (showToast) showToast('info', 'Please sign up or create an account to submit an audition application!');
      if (onJoinForFree) onJoinForFree();
      return;
    }
    setApplyingRole({ call, roleId, roleTitle });
    setApplicationMessage('');
    setAuditionType('pitch');
    setIsRecording(false);
    setRecordedVideoUrl(undefined);
    setRecordedAudioUrl(undefined);
    setRecordingSeconds(0);
    setCountdown(0);
  };

  const handleCloseApplyModal = () => {
    setIsRecording(false);
    setApplyingRole(null);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActor || !applyingRole) return;

    onApply(
      applyingRole.call.id,
      applyingRole.roleId,
      activeActor.id,
      applicationMessage,
      auditionType === 'video' ? recordedVideoUrl : undefined,
      auditionType === 'audio' ? recordedAudioUrl : undefined
    );
    handleCloseApplyModal();
  };

  if (!activeActor && isActorLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-white/30 animate-pulse" />
        <h3 className="mt-4 text-lg font-bold text-white font-display">No active actor profile selected</h3>
        <p className="text-sm text-white/50 max-w-sm mt-2">Please register or switch your actor persona in the portal to begin.</p>
      </div>
    );
  }

  // Filter casting calls
  const filteredCastingCalls = castingCalls.filter((call) => {
    const matchesType = filterType === 'all' || call.type === filterType;
    const matchesSearch = call.title.toLowerCase().includes(searchCastingQuery.toLowerCase()) || 
                          call.description.toLowerCase().includes(searchCastingQuery.toLowerCase()) ||
                          call.company.toLowerCase().includes(searchCastingQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Actor's own applications
  const actorApplications = activeActor ? applications.filter((app) => app.actorId === activeActor.id) : [];

  // Recommended casting calls for the active actor
  const recommendedCastingCalls = React.useMemo(() => {
    if (!activeActor) return [];
    
    return castingCalls.map(call => {
      let score = 0;
      
      // Match location
      if (activeActor.location.toLowerCase().includes(call.location.toLowerCase()) || 
          call.location.toLowerCase().includes(activeActor.location.toLowerCase())) {
        score += 3;
      }
      
      // Match skills
      const lowerDesc = call.description.toLowerCase();
      activeActor.skills.forEach(skill => {
        if (lowerDesc.includes(skill.toLowerCase())) {
          score += 1;
        }
      });
      
      // Match roles age/gender
      let roleScore = 0;
      call.roles.forEach(role => {
        if (
          (role.gender === 'all' || role.gender === activeActor.gender) &&
          (activeActor.age >= role.ageMin && activeActor.age <= role.ageMax)
        ) {
          roleScore += 2;
        }
      });
      score += roleScore;
      
      // Match type
      if (activeActor.type === 'both' || (activeActor.type === 'model' && call.type === 'modeling') || (activeActor.type === 'actor' && call.type !== 'modeling')) {
          score += 1;
      }

      return { call, score };
    })
    .filter(item => item.score > 2) // Only suggest if there is a decent match
    .sort((a, b) => b.score - a.score)
    .slice(0, 3) // Top 3 recommendations
    .map(item => item.call);
  }, [activeActor, castingCalls]);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Intro Hero banner */}
      {!isActorLoggedIn ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#121217] via-[#1a1a24] to-[#0e0e11] border border-amber-500/20 p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl hidden lg:block"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Browsing in Guest Mode</span>
              </div>
              <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight mt-1 font-display uppercase">
                Browse Live Castings & <span className="text-amber-500 italic font-medium">Open Roles</span>
              </h2>
              <p className="text-white/60 text-sm max-w-xl mt-1.5 leading-relaxed">
                You are viewing the Addis Ababa central talent casting directory and open auditions. Sign up to create your high-impact digital comp card, upload headshots, and submit HD self-tape auditions.
              </p>
            </div>
            
            <button
              onClick={onJoinForFree}
              className="self-start md:self-center inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/25 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Create Actor Profile</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl hidden lg:block"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Talent Portal Status: Active</span>
              </div>
              <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight mt-1 font-display">
                Welcome back, <span className="text-amber-500 italic font-medium">{activeActor?.name}</span>
              </h2>
              <p className="text-white/60 text-sm max-w-xl mt-1.5 leading-relaxed">
                Browse matching projects, check casting deadlines, apply to direct screenplays, and keep your casting stats up to date.
              </p>
            </div>
            
            <button
              onClick={() => {
                if (!activeActor) return;
                // Sync local state to activeActor values when starting editing
                setEditName(activeActor.name);
                setEditType(activeActor.type);
                setEditGender(activeActor.gender);
                setEditAge(activeActor.age);
                setEditHeight(activeActor.heightCm);
                setEditEye(activeActor.eyeColor);
                setEditHairCol(activeActor.hairColor);
                setEditHairLen(activeActor.hairLength);
                setEditEthnicity(activeActor.ethnicity);
                setEditLocation(activeActor.location);
                setEditBio(activeActor.bio);
                setEditSkills(activeActor.skills.join(', '));
                setEditEmail(activeActor.contactEmail);
                setEditPhone(activeActor.phone);
                setEditInstagram(activeActor.instagram || '');
                setEditWebsite(activeActor.website || '');
                setEditExperience(activeActor.experience);
                setIsEditingProfile(!isEditingProfile);
              }}
              className="self-start md:self-center inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/25 cursor-pointer"
            >
              {isEditingProfile ? <User className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              <span>{isEditingProfile ? 'View Profile Info' : 'Edit Comp Card & Resume'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Edit Form vs Profile Overview or Guest Cards */}
      {isActorLoggedIn && actorApplications.some(a => a.status !== 'pending') && (
        <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center space-x-4 shadow-lg shadow-amber-500/5 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-emerald-500"></div>
          <div className="h-10 w-10 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0 animate-pulse">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display tracking-wide">Casting Update Received!</h3>
            <p className="text-xs text-white/70 mt-0.5">
              A hiring manager has reviewed your profile and updated your application status. Check the <strong className="text-amber-400">Your Audition Applications</strong> section below for details.
            </p>
          </div>
        </div>
      )}

      {isActorLoggedIn ? (
        isEditingProfile ? (
        <form onSubmit={handleSaveProfile} className="rounded-2xl border border-white/10 bg-[#0e0e11]/90 p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-md font-bold text-white font-display uppercase tracking-wide">Edit Comp Card & Theatrical Stats</h3>
              <p className="text-xs text-white/40 font-mono mt-0.5">Physical specs and contact details used for matching casting criteria</p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Primary Columns */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">1. Personal & Physical Stats</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Full Legal / Stage Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Registry Type *</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                  >
                    <option value="actor">Actor Only</option>
                    <option value="model">Model Only</option>
                    <option value="both">Actor & Model</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Gender Identification</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Playing Age (Years) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editAge}
                    onChange={(e) => setEditAge(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Height (cm) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editHeight}
                    onChange={(e) => setEditHeight(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Ethnicity / Cultural Heritage</label>
                  <input
                    type="text"
                    value={editEthnicity}
                    onChange={(e) => setEditEthnicity(e.target.value)}
                    placeholder="e.g. East Asian, Caucasian, Black"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Eye Color</label>
                  <input
                    type="text"
                    value={editEye}
                    onChange={(e) => setEditEye(e.target.value)}
                    placeholder="e.g. Blue, Brown, Hazel"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Hair Color & Length</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editHairCol}
                      onChange={(e) => setEditHairCol(e.target.value)}
                      placeholder="Color: Blonde"
                      className="w-full rounded-lg border border-white/10 bg-[#080809] px-2 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden placeholder:text-white/20"
                    />
                    <input
                      type="text"
                      value={editHairLen}
                      onChange={(e) => setEditHairLen(e.target.value)}
                      placeholder="Length: Long"
                      className="w-full rounded-lg border border-white/10 bg-[#080809] px-2 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-white/70 mb-1">Based In (Location) *</label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Contacts & Social Side column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">2. Representational Contacts</h4>
              
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                  <label className="block text-[10px] font-bold text-white/60 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/60 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/60 mb-1">Instagram handle</label>
                  <input
                    type="text"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    placeholder="@actor_handle"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/60 mb-1">Portfolio website</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="www.myportfolio.com"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Skills Tag Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-white/70 mb-1">Artist Biography *</label>
              <textarea
                required
                rows={4}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Share your background, style, vocal range, acting training, or general representation notes..."
                className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden font-sans placeholder:text-white/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Special Skills (Comma Separated)</label>
              <textarea
                rows={4}
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                placeholder="Martial Arts, Singing (Baritone), French accent, Horse Riding, Salsa Dancing..."
                className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden font-sans placeholder:text-white/20"
              />
              <p className="text-[10px] text-white/40 mt-1">Separate skills with commas so they search cleanly.</p>
            </div>
          </div>

          {/* AI Bio Critique & Optimizer */}
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span>✨ AI Profile Bio & Skills Optimizer</span>
                </h4>
                <p className="text-xs text-white/50 mt-0.5">Let our AI analyze your biography and suggest professional enhancements to make you stand out to casting agencies.</p>
              </div>
              <button
                type="button"
                disabled={isCritiquingBio || !editBio}
                onClick={handleCritiqueProfile}
                className="shrink-0 self-start sm:self-center inline-flex items-center space-x-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-400 disabled:opacity-40 transition-all cursor-pointer"
              >
                {isCritiquingBio ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{isCritiquingBio ? 'Analyzing with AI...' : 'Optimize Bio & Skills'}</span>
              </button>
            </div>

            {critiqueSuggestions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">AI Suggestions & Advice</h5>
                  <ul className="space-y-1.5 text-xs text-white/70 list-disc list-inside">
                    {critiqueSuggestions.map((sug, idx) => (
                      <li key={idx} className="leading-relaxed">{sug}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">Suggested Rewrite</h5>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-white/40 uppercase font-mono">Optimized Bio</span>
                    <p className="text-xs text-white/85 leading-relaxed bg-[#080809] p-2.5 rounded-lg border border-white/5 italic">
                      "{optimizedBio}"
                    </p>
                  </div>

                  {optimizedSkills && optimizedSkills.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-white/40 uppercase font-mono">Optimized Skills Tags</span>
                      <div className="flex flex-wrap gap-1 bg-[#080809] p-2 rounded-lg border border-white/5">
                        {optimizedSkills.map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-sm font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (optimizedBio) setEditBio(optimizedBio);
                        if (optimizedSkills) setEditSkills(optimizedSkills.join(', '));
                        if (showToast) showToast('success', 'Optimized biography and skills applied!');
                      }}
                      className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-black hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      <span>Apply Optimized Bio & Skills</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCritiqueSuggestions(null);
                        setOptimizedBio(null);
                        setOptimizedSkills(null);
                      }}
                      className="text-[10px] text-white/40 hover:text-white cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resume Table Custom Fields */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">3. Work Credits Resume</h4>
              <button
                type="button"
                onClick={handleAddExperienceRow}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Film/Stage Credit</span>
              </button>
            </div>

            {editExperience.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {editExperience.map((exp, idx) => (
                  <div key={exp.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white/5 p-2.5 rounded-lg border border-white/5 items-center">
                    <input
                      type="text"
                      placeholder="Year (e.g. 2025)"
                      value={exp.year}
                      onChange={(e) => handleExperienceChange(exp.id, 'year', e.target.value)}
                      className="rounded-md border border-white/10 bg-[#080809] px-2 py-1 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                    />
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={exp.project}
                      onChange={(e) => handleExperienceChange(exp.id, 'project', e.target.value)}
                      className="rounded-md border border-white/10 bg-[#080809] px-2 py-1 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Juliet)"
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                      className="rounded-md border border-white/10 bg-[#080809] px-2 py-1 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Producer/Company"
                        value={exp.production}
                        onChange={(e) => handleExperienceChange(exp.id, 'production', e.target.value)}
                        className="rounded-md border border-white/10 bg-[#080809] px-2 py-1 text-xs text-white focus:border-amber-500/50 focus:outline-hidden flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExperienceRow(exp.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                <p className="text-xs text-white/40 italic">No theatrical/film experience credits added yet.</p>
                <button
                  type="button"
                  onClick={handleAddExperienceRow}
                  className="mt-2 inline-flex items-center space-x-1 text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add your first credit row</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 cursor-pointer"
            >
              Cancel Edit
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 shadow-md cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Static Comp Card Dashboard Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Details Left */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center space-x-4">
              <img
                src={activeActor.headshotUrl}
                alt={activeActor.name}
                className="h-16 w-16 rounded-xl object-cover border border-white/20 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-white font-display leading-snug text-md">{activeActor.name}</h3>
                  {(activeActor.isVerified || (activeActor.experience && activeActor.experience.length >= 2)) && (
                    <CheckCircle2 className="h-4 w-4 text-amber-500" title="Verified Premium Talent" />
                  )}
                </div>
                <p className="text-[10px] text-amber-500 font-mono uppercase tracking-wider font-semibold mt-0.5">
                  {activeActor.type === 'both' ? 'Actor & Model' : activeActor.type === 'actor' ? 'Actor' : 'Model'}
                </p>
                <p className="text-xs text-white/50 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-0.5 text-amber-500" />
                  {activeActor.location}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <span className="text-white/40 block uppercase">Height</span>
                <strong className="text-white/90 text-xs">{activeActor.heightCm} cm</strong>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <span className="text-white/40 block uppercase">Age Range</span>
                <strong className="text-white/90 text-xs">{activeActor.age} yrs</strong>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <span className="text-white/40 block uppercase">Hair/Eyes</span>
                <strong className="text-white/90 text-xs truncate capitalize">{activeActor.hairColor}</strong>
              </div>
            </div>

            <div className="pt-1.5 space-y-2">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-white/40">Bio synopsis</h4>
              <p className="text-xs text-white/60 leading-relaxed font-sans line-clamp-3">{activeActor.bio}</p>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1">
              {activeActor.skills.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 px-1.5 py-0.5 rounded-md font-medium">
                  {skill}
                </span>
              ))}
              {activeActor.skills.length > 4 && (
                <span className="text-[9px] text-white/40 self-center font-mono ml-1">+{activeActor.skills.length - 4} more</span>
              )}
            </div>
          </div>

          {/* Submissions History Right */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl flex flex-col justify-between backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center space-x-1.5">
                  <History className="h-4 w-4 text-amber-500" />
                  <h3 className="font-bold text-white text-sm font-display uppercase tracking-wide">Your Audition Applications</h3>
                </div>
                <span className="font-mono text-[10px] bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-amber-500 font-bold">
                  {actorApplications.length} Submissions Total
                </span>
              </div>

              {actorApplications.length > 0 ? (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {actorApplications.map((app) => {
                    const casting = castingCalls.find((c) => c.id === app.castingCallId);
                    const role = casting?.roles.find((r) => r.id === app.roleId);
                    
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-[#0e0e11]/80 rounded-xl border border-white/5">
                        <div className="space-y-0.5 flex-1 min-w-0 pr-4">
                          <h4 className="text-xs font-bold text-white truncate font-display">
                            {role?.title || 'Unknown Role'}
                          </h4>
                          <p className="text-[10px] text-white/60 font-mono truncate">
                            {casting?.title || 'Unknown Production'} • {casting?.company}
                          </p>
                          <p className="text-[10px] text-white/40">
                            Applied: {new Date(app.dateApplied).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase ${
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
                          
                          <p className="text-[9px] text-right text-amber-400 font-semibold max-w-[150px] truncate italic">
                            {app.status === 'invited' ? 'Audition Invite Recieved!' : app.status === 'shortlisted' ? 'Added to Shortlist' : app.status === 'accepted' ? 'Hired / Approved!' : 'Reviewing Resume'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-white/40 italic">You haven&apos;t applied to any roles yet.</p>
                  <p className="text-[10px] text-white/40 mt-1">Select an active casting call below to submit your digital comp card!</p>
                </div>
              )}
            </div>

            {/* Quick Helper Hint */}
            <div className="mt-4 p-2.5 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-[10px] text-white/80 leading-snug">
                <strong className="text-amber-500">Tip:</strong> Apply to a role below, then use the <strong>Director Portal</strong> in the top-right to immediately shortlist or hire yourself and see the status change here!
              </p>
            </div>
          </div>
        </div>

        {/* PROFESSIONAL PORTFOLIO GALLERY */}
        <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Showcase Your Range</span>
              <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider mt-0.5">Professional Photo Gallery</h3>
              <p className="text-xs text-white/50 font-mono">Manage additional headshots, character styles, and commercial looks seen by directors</p>
            </div>
            
            {activeActor?.isPremium ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full px-3 py-1 uppercase tracking-wide">
                ★ Talent Pro Active
              </span>
            ) : (
              <button
                onClick={() => handleCheckoutInitiate('talent_pro')}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2 text-xs font-bold text-black shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4 text-black animate-pulse" />
                <span>Unlock Talent Pro Portfolio</span>
              </button>
            )}
          </div>

          {activeActor && (
            <div className="space-y-6">
              {!activeActor.isPremium && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center max-w-2xl mx-auto space-y-4">
                  <Lock className="h-8 w-8 text-amber-500/80 mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Addis Talent Pro Portfolio is Locked</h4>
                    <p className="text-xs text-white/60 leading-relaxed max-w-md mx-auto">
                      Free profiles are limited to one primary profile headshot. Upgrade to <strong>Talent Pro</strong> to open 3 additional professional look slots, showcase your styling versatility to recruiters, and rank higher in casting search filters!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-md mx-auto pt-2 text-[10px] font-mono text-white/70">
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-amber-500 font-bold block">✓ RANGE LOOKS</span>
                      Upload commercial, high-fashion, and film archetypes.
                    </div>
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-amber-500 font-bold block">✓ HIGHER RANK</span>
                      Show up first on director&apos;s candidate lookup databases.
                    </div>
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-amber-500 font-bold block">✓ CONTACT INFO</span>
                      Unlocks email, phone, and social linking to casting crews.
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => handleCheckoutInitiate('talent_pro')}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      Unlock for 450 ETB / year
                    </button>
                  </div>
                </div>
              )}

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Slot 0: Primary Profile Headshot (Always Unlocked for self-review) */}
                <div className="aspect-[3/4] rounded-2xl border border-amber-500/30 bg-[#080809] overflow-hidden relative group shadow-xl">
                  <img
                    src={activeActor.headshotUrl}
                    alt="Primary headshot"
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold font-mono tracking-wider w-fit mb-1 uppercase">Primary Headshot</span>
                    <p className="text-[10px] text-white/50 leading-tight">Your main profile portrait visible on standard registry lookups.</p>
                  </div>
                </div>

                {/* Slots 1, 2, 3: Pro looks */}
                {[1, 2, 3].map((slotIdx) => {
                  const photoUrl = activeActor.professionalPhotos?.[slotIdx - 1];
                  
                  if (!activeActor.isPremium) {
                    // Locked state visualization
                    return (
                      <div
                        key={slotIdx}
                        className="aspect-[3/4] rounded-2xl border border-dashed border-white/5 bg-black/40 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group"
                      >
                        <img 
                          src={`https://images.unsplash.com/photo-${slotIdx === 1 ? '1494790108377-be9c29b29330' : slotIdx === 2 ? '1506794778202-cad84cf45f1d' : '1500648767791-00dcc994a43e'}?auto=format&fit=crop&w=150&h=200&q=20`}
                          className="absolute inset-0 w-full h-full object-cover opacity-5 blur-[10px] select-none pointer-events-none"
                          alt=""
                        />
                        <Lock className="h-5 w-5 text-white/20 group-hover:text-amber-500/50 transition-colors duration-300" />
                        <span className="text-[10px] font-mono text-white/30 font-bold block mt-2">Portfolio Look 0{slotIdx + 1}</span>
                        <span className="text-[8px] bg-white/5 text-white/40 border border-white/10 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider block mt-1.5">Locked</span>
                      </div>
                    );
                  }

                  // Unlocked Pro states
                  if (photoUrl) {
                    return (
                      <div
                        key={slotIdx}
                        className="aspect-[3/4] rounded-2xl border border-white/10 bg-[#080809] overflow-hidden relative group shadow-xl"
                      >
                        <img
                          src={photoUrl}
                          alt={`Look 0${slotIdx + 1}`}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                          <span className="text-[9px] bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded font-bold font-mono tracking-wider w-fit mb-1.5">Look 0{slotIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextPhotos = [...(activeActor.professionalPhotos || [])];
                              nextPhotos.splice(slotIdx - 1, 1);
                              onUpdateActor({
                                ...activeActor,
                                professionalPhotos: nextPhotos
                              });
                              if (showToast) showToast('success', `Removed look 0${slotIdx + 1} from your portfolio gallery.`);
                            }}
                            className="w-full inline-flex items-center justify-center space-x-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-[10px] uppercase font-mono shadow-md transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete Look</span>
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={() => {
                          setUploadingSlotIdx(slotIdx - 1);
                          setCustomPhotoUrl('');
                        }}
                        className="aspect-[3/4] rounded-2xl border border-dashed border-white/15 hover:border-amber-500/40 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer group shadow-inner"
                      >
                        <div className="h-8 w-8 rounded-full bg-white/5 group-hover:bg-amber-500/10 flex items-center justify-center text-white/40 group-hover:text-amber-500 transition-all mb-2.5">
                          <Plus className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[10px] font-mono text-white/50 group-hover:text-white font-bold block">Add Portfolio Look</span>
                        <span className="text-[8px] text-white/30 block mt-0.5 font-mono uppercase">Look Slot 0{slotIdx + 1}</span>
                      </button>
                    );
                  }
                })}
              </div>

              {/* Upload photo workflow micro-panel */}
              {uploadingSlotIdx !== null && (
                <div className="p-5 rounded-2xl border border-white/10 bg-[#080809] space-y-4 max-w-xl mx-auto animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Configure Portfolio Look 0{uploadingSlotIdx + 2}</span>
                    <button
                      type="button"
                      onClick={() => setUploadingSlotIdx(null)}
                      className="text-[9px] font-mono text-white/40 hover:text-white font-bold uppercase"
                    >
                      Dismiss Panel
                    </button>
                  </div>

                  {/* Predefined range look selectors */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-white/50 uppercase font-bold font-mono tracking-wider">Option A: Select From Popular Casting Presets</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { title: '🎭 Dramatic Character Portrait', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=800&q=80' },
                        { title: '🕶️ Commercial Editorial', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80' },
                        { title: '💻 Corporate Professional', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=800&q=80' },
                        { title: '🎬 Active / Athletic styling', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&h=800&q=80' },
                        { title: '🍂 Warm Cinematic Profile', url: 'https://images.unsplash.com/photo-1539571696357-a69c17a67c6?auto=format&fit=crop&w=600&h=800&q=80' },
                        { title: '🌸 Bright Studio Closeup', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const nextPhotos = [...(activeActor.professionalPhotos || [])];
                            nextPhotos[uploadingSlotIdx] = preset.url;
                            onUpdateActor({
                              ...activeActor,
                              professionalPhotos: nextPhotos
                            });
                            setUploadingSlotIdx(null);
                            if (showToast) showToast('success', `Saved preset "${preset.title}" to Look 0${uploadingSlotIdx + 2}!`);
                          }}
                          className="p-2 bg-[#0e0e11] hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-xl text-[9px] text-left text-white/80 transition-all font-mono leading-tight flex items-center justify-between"
                        >
                          <span>{preset.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center text-white/20 text-[9px] font-mono uppercase justify-center gap-2">
                    <span className="h-[1px] bg-white/5 flex-1" />
                    <span>OR</span>
                    <span className="h-[1px] bg-white/5 flex-1" />
                  </div>

                  {/* Custom URL input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-white/50 uppercase font-bold font-mono tracking-wider">Option B: Enter Custom Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Paste image address (e.g., https://...)"
                        value={customPhotoUrl}
                        onChange={(e) => setCustomPhotoUrl(e.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-[#0e0e11] px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500/40 font-mono"
                      />
                      <button
                        type="button"
                        disabled={!customPhotoUrl}
                        onClick={() => {
                          const nextPhotos = [...(activeActor.professionalPhotos || [])];
                          nextPhotos[uploadingSlotIdx] = customPhotoUrl;
                          onUpdateActor({
                            ...activeActor,
                            professionalPhotos: nextPhotos
                          });
                          setUploadingSlotIdx(null);
                          if (showToast) showToast('success', `Successfully added custom photo look 0${uploadingSlotIdx + 2}!`);
                        }}
                        className="rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black px-4 py-1.5 text-xs font-bold transition-all cursor-pointer font-mono"
                      >
                        Apply Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ADDIS TALENT MARKETPLACE & ACADEMY HUB */}
        <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Addis Talent Pro Suite</span>
              <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider mt-0.5">Marketplace & Academy Hub</h3>
              <p className="text-xs text-white/40">Acquire professional assets and master essential theatrical skills directly inside Addis Ababa</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PORTRAIT PHOTOGRAPHY PACKAGE */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Camera className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-purple-400 font-mono tracking-wider">3,500 ETB / session</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-display tracking-wider">Premium Headshot Photography Package</h4>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">
                    Complete your theatrical portfolio with high-resolution portraits. Partnered with the premier digital photography studios in Addis Ababa (Bole Area & Piazza) to deliver casting-compliant comp cards.
                  </p>
                </div>

                <ul className="text-[11px] text-white/60 space-y-1 pt-1">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>10 Retouched High-Definition headshots & full-body cards</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>Professional portrait studio makeup & lighting setup included</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>Instant automatic sync and upload directly into Addis Talent database</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-white/5">
                {!bookedPhotoshoot ? (
                  <button
                    onClick={() => handleCheckoutInitiate('photography')}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-purple-600/10 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Book Photo Session (3,500 ETB)</span>
                  </button>
                ) : bookedPhotoshoot.status === 'pending' ? (
                  <div className="space-y-3.5 bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Session Scheduled!
                      </span>
                      <span className="text-[10px] font-mono text-white/40">Status: Waiting Shoot</span>
                    </div>
                    <div className="text-[11px] text-white/70 space-y-1 font-mono">
                      <p>📍 Studio: <span className="text-white font-bold">{bookedPhotoshoot.studio}</span></p>
                      <p>📅 Schedule: <span className="text-white font-bold">{bookedPhotoshoot.datetime}</span></p>
                    </div>

                    {/* Simulation: Delivered Photos */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <span className="block text-[10px] text-amber-400 font-bold uppercase font-mono tracking-wider">
                        📸 Simulation: Studio Has Delivered Photos!
                      </span>
                      <p className="text-[10px] text-white/50 leading-relaxed">
                        Select a premium retouched headshot delivered by the studio below to instantly overwrite your current comp-card profile photo:
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {studioMockupPhotos.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => handleApplyDeliveredPhoto(img, i)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              bookedPhotoshoot.deliveredPhotoIdx === i ? 'border-purple-500 scale-95' : 'border-transparent hover:border-white/20'
                            }`}
                          >
                            <img src={img} alt="Retouched portrait option" className="h-full w-full object-cover" />
                            {bookedPhotoshoot.deliveredPhotoIdx === i && (
                              <div className="absolute inset-0 bg-purple-900/50 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white font-bold" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Premium Portrait Applied!
                      </span>
                      <span className="text-[10px] font-mono text-white/40">Status: Completed</span>
                    </div>
                    <p className="text-[11px] text-white/60 font-sans leading-relaxed">
                      Your high-fashion studio headshot has been synced. Film and commercial producers will see your premium high-end composite image when reviewing applications.
                    </p>
                    <button
                      onClick={() => handleCheckoutInitiate('photography')}
                      className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white/80 font-bold text-[10px] transition-all cursor-pointer"
                    >
                      Book a New Session (3,500 ETB)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ACTING & MODELING MASTERCLASS */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-400 font-mono tracking-wider">1,800 ETB / full access</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-display tracking-wider">Acting & Modeling Masterclass Package</h4>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">
                    Acquire elite on-screen confidence. Master vocal monologues, stage presence, screenplay analysis, and self-tape lighting under direct online tutorage of acclaimed Ethiopian film directors and modeling coaches.
                  </p>
                </div>

                <ul className="text-[11px] text-white/60 space-y-1 pt-1">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>12 Premium HD video lessons covering casting, lighting, and drama</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Digital Monologue Sides workbook with real movie screenplay clips</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Exclusive representation & listing tips for the Addis Ababa market</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-white/5">
                {!enrolledMasterclass ? (
                  <button
                    onClick={() => handleCheckoutInitiate('masterclass')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-lg hover:shadow-amber-500/10 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Award className="h-4 w-4" />
                    <span>Enroll in Masterclass (1,800 ETB)</span>
                  </button>
                ) : (
                  <div className="space-y-4 bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-xs border-b border-amber-500/10 pb-2">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 animate-pulse" /> Academy Course Unlocked
                      </span>
                      <span className="text-[10px] font-mono text-white/40">Status: Active</span>
                    </div>

                    {/* Mini Learning Desk Tabs */}
                    <div className="grid grid-cols-3 gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                      <button
                        onClick={() => setActiveMasterclassTab('lessons')}
                        className={`py-1 text-[9px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                          activeMasterclassTab === 'lessons' ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Lessons
                      </button>
                      <button
                        onClick={() => setActiveMasterclassTab('microphone')}
                        className={`py-1 text-[9px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                          activeMasterclassTab === 'microphone' ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Vocal Practice
                      </button>
                      <button
                        onClick={() => setActiveMasterclassTab('lighting')}
                        className={`py-1 text-[9px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                          activeMasterclassTab === 'lighting' ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Lighting Layout
                      </button>
                    </div>

                    {/* Masterclass Tab Content */}
                    <div className="min-h-[110px] flex flex-col justify-between">
                      {activeMasterclassTab === 'lessons' && (
                        <div className="space-y-1.5 text-[11px] text-white/80">
                          <div className="flex justify-between items-center bg-white/5 p-1.5 rounded border border-white/5">
                            <span className="truncate">🎬 1. Intro to Ethiopian Screenplays</span>
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded shrink-0 font-mono font-bold">12m</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/5 p-1.5 rounded border border-white/5">
                            <span className="truncate">🗣️ 2. Mastering Amharic & English Diction</span>
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded shrink-0 font-mono font-bold">18m</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/5 p-1.5 rounded border border-white/5">
                            <span className="truncate">📷 3. Audition Body Language & Eyes</span>
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded shrink-0 font-mono font-bold">14m</span>
                          </div>
                        </div>
                      )}

                      {activeMasterclassTab === 'microphone' && (
                        <div className="space-y-2 text-[11px] text-white/80">
                          <p className="text-[10px] text-white/50 font-sans leading-relaxed">
                            Practice your monologue projection. Use the simulator audio cue below to find the perfect tone:
                          </p>
                          <div className="bg-black/40 p-2 rounded border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between text-[9px] font-mono text-amber-400">
                              <span>Vocal Coach Audio Guideline</span>
                              <span>PLAYBACK SIMULATOR</span>
                            </div>
                            <button
                              onClick={() => {
                                if (showToast) showToast('info', 'Simulating professional vocal coaching monologue playback: "Project your diaphragm..."');
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px] rounded hover:bg-amber-500/20 transition-all cursor-pointer"
                            >
                              <Play className="h-3 w-3" />
                              <span>Listen to Coach Voice Guide</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {activeMasterclassTab === 'lighting' && (
                        <div className="space-y-2 text-[11px] text-white/80">
                          <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                            Set up your home smartphone camera studio using standard 3-point lighting:
                          </p>
                          <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[9px] text-white/60">
                            <div className="p-1.5 bg-white/5 rounded border border-white/5">
                              <span className="block font-bold text-amber-400">Key Light</span>
                              <span>45° Right side</span>
                            </div>
                            <div className="p-1.5 bg-white/5 rounded border border-white/5">
                              <span className="block font-bold text-amber-400">Fill Light</span>
                              <span>45° Left side</span>
                            </div>
                            <div className="p-1.5 bg-white/5 rounded border border-white/5">
                              <span className="block font-bold text-amber-400">Back Light</span>
                              <span>Separates hair</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </>
    )) : (
      /* Guest Mode Dashboard section */
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Guest CTA 1 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center flex flex-col justify-between items-center space-y-4 backdrop-blur-xl hover:border-amber-500/30 transition-all duration-300">
          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Camera className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white font-display text-sm uppercase tracking-wide">Register Digital Comp Card</h3>
              <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                Join Addis Ababa's central registry. Build your physical specs profile, upload HD headshots, and list dramatic talents so regional casting directors can headhunt you.
              </p>
            </div>
          </div>
          <button
            onClick={onJoinForFree}
            className="w-full mt-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black py-2.5 text-xs font-bold transition-all shadow-md hover:shadow-amber-500/15 cursor-pointer"
          >
            Build Comp Card &rarr;
          </button>
        </div>

        {/* Guest CTA 2 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center flex flex-col justify-between items-center space-y-4 backdrop-blur-xl hover:border-amber-500/30 transition-all duration-300">
          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Video className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white font-display text-sm uppercase tracking-wide">Built-In Audition Studio</h3>
              <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                Get full access to our digital self-tape recorder and voiceover deck. Read real screenplay sides on-screen and upload video tapes directly to submissions.
              </p>
            </div>
          </div>
          <button
            onClick={onJoinForFree}
            className="w-full mt-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black py-2.5 text-xs font-bold transition-all shadow-md hover:shadow-amber-500/15 cursor-pointer"
          >
            Access Audition Tools &rarr;
          </button>
        </div>

        {/* Guest CTA 3 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center flex flex-col justify-between items-center space-y-4 backdrop-blur-xl hover:border-amber-500/30 transition-all duration-300">
          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white font-display text-sm uppercase tracking-wide">Modeling Academy & Photoshoots</h3>
              <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                Enroll in elite physical runway workshops, lighting masterclasses, or book direct studio photoshoots with trusted regional photographers in Bole.
              </p>
            </div>
          </div>
          <button
            onClick={onJoinForFree}
            className="w-full mt-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black py-2.5 text-xs font-bold transition-all shadow-md hover:shadow-amber-500/15 cursor-pointer"
          >
            Enroll & Book Now &rarr;
          </button>
        </div>
      </div>
    )}

      {/* Recommended for You */}
      {isActorLoggedIn && activeActor && recommendedCastingCalls.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-white text-md font-display uppercase tracking-wide">Recommended for You</h3>
              <p className="text-xs text-white/40 font-mono">Based on your location, skills, and profile details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedCastingCalls.map((call) => (
              <div
                key={call.id}
                className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl"
              >
                <div>
                  <div className="h-32 bg-[#0e0e11] relative overflow-hidden">
                    {call.imageUrl ? (
                      <img
                        src={call.imageUrl}
                        alt={call.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full bg-amber-500/5 flex items-center justify-center">
                        <User className="h-8 w-8 text-amber-500/40" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="rounded-md bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                        {call.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <p className="text-[10px] text-white/40 font-mono">{call.company}</p>
                      {call.isVerified && (
                        <CheckCircle2 className="h-3 w-3 text-amber-500" title="Verified Company" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white font-display line-clamp-1">{call.title}</h4>
                    <p className="mt-1 text-xs text-white/60 line-clamp-2">{call.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Casting Auditions Call Board */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-4">
          <div>
            <h3 className="font-bold text-white text-md font-display uppercase tracking-wide">Live Casting & Audition Board</h3>
            <p className="text-xs text-white/40 font-mono">Select a production breakdown to view roles and apply instantly</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search castings..."
                value={searchCastingQuery}
                onChange={(e) => setSearchCastingQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#080809] pl-9 pr-4 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
              />
              <Search className="absolute left-3 top-2 h-4 w-4 text-white/40" />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-1 bg-white/5 border border-white/10 p-1 rounded-xl self-start sm:self-center overflow-x-auto whitespace-nowrap max-w-full">
              {['all', 'film', 'commercial', 'tv', 'theater', 'modeling'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
                    filterType === type
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Casting Calls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCastingCalls.length > 0 ? (
            filteredCastingCalls.map((call) => (
              <div
                key={call.id}
                className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl"
              >
                <div>
                  {/* Aspect Card Cover Image */}
                  <div className="h-43 bg-[#0e0e11] relative overflow-hidden">
                    {call.imageUrl ? (
                      <img
                        src={call.imageUrl}
                        alt={call.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full bg-amber-500/5 flex items-center justify-center">
                        <User className="h-10 w-10 text-amber-500/40" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="rounded-md bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {call.type}
                      </span>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#080809] to-transparent p-4 text-white">
                      <div className="flex items-center space-x-1.5">
                        <p className="text-[10px] font-mono text-white/60">{call.company}</p>
                        {call.isVerified && (
                          <CheckCircle2 className="h-3 w-3 text-amber-500" title="Verified Company" />
                        )}
                      </div>
                      <h4 className="font-bold tracking-tight text-lg font-display">{call.title}</h4>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
                      <span className="flex items-center">
                        <MapPin className="mr-0.5 h-3.5 w-3.5 text-amber-500" />
                        {call.location}
                      </span>
                      <span className="text-amber-500 font-semibold">
                        Deadline: {new Date(call.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed font-sans line-clamp-2">
                      {call.description}
                    </p>

                    {/* Roles Under this Casting Call */}
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <h5 className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-2 font-mono">Available Character Breaks:</h5>
                      <div className="space-y-2">
                        {call.roles.map((role) => {
                          const hasApplied = applications.some(
                            (app) => app.actorId === activeActor?.id && app.roleId === role.id
                          );
                          
                          return (
                            <div key={role.id} className="rounded-xl bg-white/5 border border-white/5 p-3 flex flex-col justify-between">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <div className="leading-snug">
                                  <h6 className="text-xs font-bold text-white">{role.title}</h6>
                                  <p className="text-[10px] text-white/50 font-mono mt-0.5">
                                    Gender: <span className="capitalize">{role.gender}</span> • Age playing: {role.ageMin}-{role.ageMax}
                                  </p>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-0.5 self-start">
                                  {role.compensation}
                                </span>
                              </div>
                              
                              <p className="text-[11px] text-white/60 leading-relaxed mt-1.5 font-sans border-l-2 border-amber-500/40 pl-2">
                                {role.description}
                              </p>

                              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-end">
                                {hasApplied ? (
                                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                                    ✓ Applied Already
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleOpenApplyModal(call, role.id, role.title)}
                                    className="inline-flex items-center space-x-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 text-[10px] font-bold transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer"
                                  >
                                    <span>Apply to Role</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 rounded-2xl border border-dashed border-white/10 py-12 text-center">
              <p className="text-xs text-white/40 italic">No open casting calls found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Application Custom Dialog Modal */}
      {applyingRole && (() => {
        const activeRole = applyingRole.call.roles.find((r) => r.id === applyingRole.roleId);
        
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-[#0e0e11] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[92vh]">
              
              {/* Header */}
              <div className="px-6 py-4 bg-[#080809] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">African Cast Digital Audition Studio</h3>
                    <p className="text-[10px] text-white/40 font-mono">Simulate HD Self-Tape Submissions & Voiceovers</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseApplyModal}
                  className="rounded-full p-1 text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* Role Details */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-wider">Project: {applyingRole.call.title}</span>
                    <h4 className="text-md font-bold text-white font-display mt-0.5">{applyingRole.roleTitle}</h4>
                    <p className="text-xs text-white/60 font-sans mt-0.5">
                      {applyingRole.call.company} • {applyingRole.call.location}
                    </p>
                  </div>
                  <div className="text-right sm:self-center">
                    <p className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1 inline-block">
                      {activeRole?.compensation || 'Rate specified'}
                    </p>
                  </div>
                </div>

                {/* Audition Sides Script Block */}
                {activeRole?.sidesText && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center">
                        🎭 Audition Script Sides (Read This Out Loud)
                      </span>
                      <span className="text-[9px] font-mono text-white/40">Read with emotion</span>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-serif text-xs leading-relaxed text-amber-100 italic select-none">
                      {activeRole.sidesText}
                    </div>
                  </div>
                )}

                {/* AI Audition Monologue Companion */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                      <span className="text-xs font-bold text-white font-display">✨ AI Audition Monologue Generator</span>
                    </div>
                    <button
                      type="button"
                      disabled={isGeneratingMonologue}
                      onClick={() => handleGenerateAiMonologue(applyingRole.roleTitle, activeRole?.description || '', applyingRole.call.title, applyingRole.call.description)}
                      className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 transition-all cursor-pointer disabled:opacity-40"
                    >
                      <span>{isGeneratingMonologue ? 'Writing script...' : 'Generate Monologue'}</span>
                    </button>
                  </div>
                  
                  {generatedMonologue ? (
                    <div className="space-y-2">
                      <div className="bg-[#080809] p-3 rounded-lg border border-white/5 font-serif text-xs leading-relaxed text-amber-200/90 whitespace-pre-wrap select-text max-h-48 overflow-y-auto">
                        {generatedMonologue}
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-white/40 font-mono">
                        <span>💡 You can rehearse this monologue for your audition tape.</span>
                        <button 
                          type="button" 
                          onClick={() => setGeneratedMonologue(null)} 
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-white/50 leading-relaxed">
                      Need custom audition material? Generate a professional monologue customized for this character role and screenplay theme.
                    </p>
                  )}
                </div>

                {/* Selector Tabs for Audition Mode */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 font-mono">
                    Select Submission Method
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-[#080809] p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuditionType('pitch');
                        setIsRecording(false);
                      }}
                      className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        auditionType === 'pitch'
                          ? 'bg-amber-500 text-black shadow-lg'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Text Pitch Note
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuditionType('video');
                        setIsRecording(false);
                      }}
                      className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                        auditionType === 'video'
                          ? 'bg-amber-500 text-black shadow-lg'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Video className="h-3.5 w-3.5 shrink-0" />
                      <span>Video Self-Tape</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuditionType('audio');
                        setIsRecording(false);
                      }}
                      className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                        auditionType === 'audio'
                          ? 'bg-amber-500 text-black shadow-lg'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Mic className="h-3.5 w-3.5 shrink-0" />
                      <span>Audio Voiceover</span>
                    </button>
                  </div>
                </div>

                {/* Tab 1: Standard Text Pitch */}
                {auditionType === 'pitch' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 font-mono">
                        Introduce yourself / Director Note
                      </label>
                      <button
                        type="button"
                        onClick={() => handleGenerateAiPitch(applyingRole.roleTitle, activeRole?.description || '', applyingRole.call.title)}
                        disabled={isGeneratingPitch}
                        className="inline-flex items-center space-x-1 text-[9px] font-bold text-amber-400 hover:text-amber-300 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        <span>{isGeneratingPitch ? 'Drafting pitch...' : '✨ Generate AI Pitch Note'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      placeholder="e.g. Habari! I am incredibly passionate about this story. I have studied theater and can bring absolute intensity to this role. I am fully available..."
                      className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden placeholder:text-white/20 font-sans"
                    />
                  </div>
                )}

                {/* Tab 2: Simulated HD Video Self-Tape */}
                {auditionType === 'video' && (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-white/10 flex flex-col justify-between p-4 shadow-inner">
                      
                      {/* Simulated Camera Overlay HUD */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-white/60 select-none z-10">
                        <div className="flex items-center space-x-1.5">
                          {isRecording ? (
                            <span className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-sm border border-red-500/30 font-bold uppercase">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse mr-0.5"></span>
                              REC
                            </span>
                          ) : (
                            <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-sm">STANDBY</span>
                          )}
                          <span className="hidden sm:inline">• HD 1080P</span>
                        </div>
                        <div>
                          <span>60 FPS</span>
                          <span className="ml-2">• BATT 88%</span>
                        </div>
                      </div>

                      {/* Center Viewport */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                        {countdown > 0 ? (
                          <div className="h-20 w-20 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-display font-black text-4xl flex items-center justify-center animate-ping">
                            {countdown}
                          </div>
                        ) : isRecording ? (
                          <div className="text-center space-y-1">
                            <p className="text-xl font-bold tracking-widest text-white/90 uppercase animate-pulse">Recording Action</p>
                            <p className="text-[10px] font-mono text-amber-400">Read your lines from the sides above</p>
                          </div>
                        ) : recordedVideoUrl ? (
                          <div className="text-center bg-black/80 px-4 py-3 rounded-xl border border-white/10 max-w-xs space-y-1.5 z-10">
                            <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Self-Tape Recorded!
                            </p>
                            <p className="text-[9px] text-white/50">You can preview, re-record, or click submit below.</p>
                          </div>
                        ) : (
                          <div className="text-center space-y-1 text-white/30 max-w-xs px-4">
                            <Video className="h-8 w-8 mx-auto mb-1 opacity-50 text-amber-500" />
                            <p className="text-xs font-bold text-white/80">Digital Front-Camera Studio</p>
                            <p className="text-[9px]">Position your camera, read the script above, and press Record.</p>
                          </div>
                        )}
                      </div>

                      {/* Video Player Preview if recorded */}
                      {recordedVideoUrl && !isRecording && !countdown && (
                        <video
                          src={recordedVideoUrl}
                          className="absolute inset-0 w-full h-full object-cover z-0"
                          controls
                          autoPlay
                          muted
                        />
                      )}

                      {/* Wave Audio indicator for Mic feedback */}
                      <div className="flex items-end justify-center space-x-0.5 h-6 z-10 pointer-events-none select-none">
                        {audioVolume.map((vol, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${vol}%` }}
                            className={`w-1 rounded-t-xs transition-all duration-100 ${
                              isRecording ? 'bg-amber-400' : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Recording Timer HUD */}
                      <div className="flex justify-between items-center z-10 text-[9px] font-mono text-white/60">
                        <span>AUDIO: SIM_MIC_INT</span>
                        <span className="font-bold text-white bg-black/40 px-2 py-0.5 rounded-sm">
                          {formatTime(recordingSeconds)}
                        </span>
                      </div>
                    </div>

                    {/* Camera Control Panel */}
                    <div className="flex items-center justify-center space-x-3">
                      {!isRecording && !countdown ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCountdown(3);
                            setRecordedVideoUrl(undefined);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                        >
                          <span className="h-2 w-2 rounded-full bg-white animate-ping mr-0.5" />
                          <span>{recordedVideoUrl ? 'Re-Record Self-Tape' : 'Record Audition Self-Tape'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsRecording(false);
                            setCountdown(0);
                            setRecordedVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
                          }}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-white/90 text-black font-bold text-xs flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                        >
                          <Square className="h-3.5 w-3.5 fill-black" />
                          <span>Stop & Save Tape</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Simulated Audio Voiceover Sample */}
                {auditionType === 'audio' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 flex flex-col justify-between h-44 relative overflow-hidden">
                      {/* Background sound wave layout */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                        <div className="flex items-center space-x-1.5 w-full px-12">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-sm ${isRecording ? 'bg-amber-500 animate-pulse' : 'bg-white'}`}
                              style={{ height: `${Math.floor(Math.random() * 80) + 10}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] font-mono text-white/40">
                        <span>STUDIO MIC INPUT</span>
                        <span>RATE: 48 KHZ</span>
                      </div>

                      {/* Central Status */}
                      <div className="text-center z-10 select-none">
                        {countdown > 0 ? (
                          <p className="text-amber-500 font-mono text-lg font-bold">Ready in {countdown}...</p>
                        ) : isRecording ? (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-red-400 animate-pulse flex items-center justify-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                              Simulated Voiceover Recording...
                            </p>
                            <p className="text-[10px] text-white/40 font-mono">Speak clearly. Timer: {formatTime(recordingSeconds)}</p>
                          </div>
                        ) : recordedAudioUrl ? (
                          <div className="space-y-2 z-10">
                            <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                              <Check className="h-3.5 w-3.5" /> High-Quality Audio Monologue Saved!
                            </p>
                            <div className="max-w-xs mx-auto border border-white/5 bg-black/50 p-1 rounded-lg">
                              <audio src={recordedAudioUrl} controls className="w-full h-8" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Mic className="h-6 w-6 text-amber-400 mx-auto opacity-60 mb-0.5" />
                            <p className="text-xs font-bold text-white/80">Digital Mic Studio Simulator</p>
                            <p className="text-[9px] text-white/40 max-w-xs mx-auto">Click record to submit high-fidelity voice character samples.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between text-[10px] font-mono text-white/40">
                        <span>FORMAT: CJS.MP3</span>
                        <span className="font-bold text-white bg-black px-1.5 py-0.5 rounded">
                          {formatTime(recordingSeconds)}
                        </span>
                      </div>
                    </div>

                    {/* Audio Recorder Controls */}
                    <div className="flex items-center justify-center space-x-3">
                      {!isRecording && !countdown ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCountdown(2);
                            setRecordedAudioUrl(undefined);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                        >
                          <Mic className="h-3.5 w-3.5" />
                          <span>{recordedAudioUrl ? 'Re-Record Voice Clip' : 'Record Audition Audio'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsRecording(false);
                            setCountdown(0);
                            setRecordedAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');
                          }}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-white/90 text-black font-bold text-xs flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                        >
                          <Square className="h-3.5 w-3.5 fill-black" />
                          <span>Stop & Save Audio</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-[#080809] border-t border-white/10 flex items-center justify-between">
                <p className="text-[10px] text-white/30 font-mono hidden sm:block">
                  Comp-card & resume bundled automatically
                </p>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleCloseApplyModal}
                    className="rounded-xl border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRecording || countdown > 0}
                    onClick={handleSubmitApplication}
                    className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400 shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {auditionType === 'pitch'
                      ? 'Submit Written Pitch'
                      : auditionType === 'video'
                      ? recordedVideoUrl
                        ? 'Submit with Self-Tape'
                        : 'Submit with Standard Reel'
                      : recordedAudioUrl
                      ? 'Submit with Voiceover'
                      : 'Submit with Standard Voice'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* SECURE CHECKOUT MODAL (ETHIO TELECOM & LOCAL BANKS) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0e0e11] shadow-2xl overflow-hidden border border-white/10 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 bg-[#080809] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide">Addis Booking Portal</h3>
                  <p className="text-[10px] text-white/40 font-mono">Secure Booking Reservation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(null)}
                className="rounded-full p-1 text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6">
              {isPaying ? (
                <div className="py-8 text-center space-y-4">
                  <div className="relative h-16 w-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Processing Request...</p>
                    <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
                      Please wait while we secure your booking allocation.
                    </p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg text-[9px] text-white/40 font-mono max-w-xs mx-auto">
                    Awaiting network confirmation
                  </div>
                </div>
              ) : paymentSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="h-6 w-6 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Booking Authorized Successfully!</h4>
                    <p className="text-xs text-white/50 max-w-xs mx-auto">
                      Your booking request is confirmed. We will reach out shortly.
                    </p>
                  </div>

                  <div className="bg-black/50 p-3.5 rounded-xl border border-white/5 space-y-1 text-left font-mono text-[10px] text-white/80 max-w-xs mx-auto">
                    <div className="flex justify-between">
                      <span className="text-white/40">Status:</span>
                      <span className="text-emerald-400 font-bold">PAID</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Reference ID:</span>
                      <span>ETH_TEL_TXN_88192A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Amount:</span>
                      <span className="text-amber-400 font-bold">
                        {isCheckoutModalOpen === 'photography' ? '3,500 ETB' : isCheckoutModalOpen === 'talent_pro' ? '450 ETB' : '1,800 ETB'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCheckoutModalOpen(null)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    Unlock Pro Assets & Return
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutPayment} className="space-y-4">
                  
                  {/* Package Summary HUD */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Authorized Package</span>
                      <h4 className="text-xs font-bold text-white mt-0.5">
                        {isCheckoutModalOpen === 'photography' 
                          ? '📷 Premium Headshot Photo Session' 
                          : isCheckoutModalOpen === 'talent_pro' 
                          ? '★ Talent Pro Annual Membership' 
                          : '🎭 Academy Acting Masterclass Series'}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/40 block font-mono">Amount due</span>
                      <strong className="text-xs font-bold text-amber-400">
                        {isCheckoutModalOpen === 'photography' 
                          ? '3,500 ETB' 
                          : isCheckoutModalOpen === 'talent_pro' 
                          ? '450 ETB' 
                          : '1,800 ETB'}
                      </strong>
                    </div>
                  </div>

                  {/* Booking Fields specifically for Photography */}
                  {isCheckoutModalOpen === 'photography' && (
                    <div className="space-y-2.5 p-3 rounded-xl bg-black/40 border border-white/5">
                      <span className="block text-[10px] text-white/40 font-mono uppercase font-bold">Shoot Configuration</span>
                      
                      <div>
                        <label className="block text-[10px] text-white/60 mb-0.5">Preferred Professional Studio</label>
                        <select
                          value={selectedStudio}
                          onChange={(e) => setSelectedStudio(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#0e0e11] px-2 py-1.5 text-xs text-white focus:outline-hidden"
                        >
                          <option value="Bole Professional Studio Hub">Bole Area Studio Hub (Camera & Makeup)</option>
                          <option value="Piazza Historic Portrait Studio">Piazza Historic Portrait Studio (Artistic/Creative)</option>
                          <option value="Old Airport Elite Digital Lab">Old Airport Elite Digital Lab (High-Fashion Focus)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-white/60 mb-0.5">Preferred Date</label>
                          <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-[#0e0e11] px-2 py-1 text-xs text-white focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-white/60 mb-0.5">Preferred Time Slot</label>
                          <input
                            type="time"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-[#0e0e11] px-2 py-1 text-xs text-white focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                      Telebirr Recipient Account
                    </span>
                    <p className="text-xs text-white font-mono font-bold">
                      +251911381970
                    </p>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      Transfer the exact amount to account <strong>+251911381970</strong> on Telebirr (*127# or app), then submit your reference code below.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-white/60 font-mono uppercase font-bold mb-0.5">
                        Your Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0912345678"
                        value={actorCheckoutPhone}
                        onChange={(e) => setActorCheckoutPhone(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-amber-400 font-mono uppercase font-bold mb-0.5">
                        Telebirr Ref Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TLB9812739"
                        value={actorCheckoutTxRef}
                        onChange={(e) => setActorCheckoutTxRef(e.target.value)}
                        className="w-full rounded-lg border border-amber-500/50 bg-black px-3 py-2 text-xs text-amber-300 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutModalOpen(null)}
                      className="flex-1 py-2 rounded-xl border border-white/10 text-white/80 font-bold text-xs hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-all cursor-pointer"
                    >
                      Request Booking
                    </button>
                  </div>

                </form>
              )}
            </div>

            {/* Footer security badge */}
            <div className="px-6 py-3 bg-[#080809] border-t border-white/5 flex items-center justify-between text-[9px] text-white/30 font-mono uppercase">
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-emerald-400" /> AES-256 Encrypted
              </span>
              <span>Ethio Telecom Broker</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Custom simple Trash Icon definition
function Trash2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
