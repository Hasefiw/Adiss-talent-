import React, { useState } from 'react';
import { X, Sparkles, User, Shield, Check, Mail, Phone, MapPin, Building, Award } from 'lucide-react';
import { Actor, ActorType } from '../types';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpTalent: (talentData: Omit<Actor, 'id' | 'createdAt' | 'experience'>) => void;
  onSignUpProducer: (producerData: { name: string; company: string; type: string; email: string }) => void;
  defaultAccountType?: 'talent' | 'producer';
}

export default function SignUpModal({ isOpen, onClose, onSignUpTalent, onSignUpProducer, defaultAccountType = 'talent' }: SignUpModalProps) {
  const [accountType, setAccountType] = useState<'talent' | 'producer'>(defaultAccountType);
  
  React.useEffect(() => {
    if (isOpen) {
      setAccountType(defaultAccountType);
    }
  }, [isOpen, defaultAccountType]);
  
  // Talent Form state
  const [talentName, setTalentName] = useState('');
  const [talentAge, setTalentAge] = useState(24);
  const [talentGender, setTalentGender] = useState<'male' | 'female' | 'non-binary'>('female');
  const [talentType, setTalentType] = useState<ActorType>('both');
  const [talentLocation, setTalentLocation] = useState('Addis Ababa, Ethiopia');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80');
  const [talentBio, setTalentBio] = useState('');
  const [talentEmail, setTalentEmail] = useState('');
  const [talentPhone, setTalentPhone] = useState('');
  const [talentSkills, setTalentSkills] = useState('Acting, Voiceover, Singing, Fashion Walk');

  // Producer Form state
  const [producerName, setProducerName] = useState('');
  const [producerCompany, setProducerCompany] = useState('');
  const [producerRole, setProducerRole] = useState('Casting Director');
  const [producerEmail, setProducerEmail] = useState('');

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accountType === 'talent') {
      if (!talentName || !talentEmail) {
        alert('Please fill in your Name and Email.');
        return;
      }
      
      const skillsArray = talentSkills.split(',').map(s => s.trim()).filter(Boolean);
      
      onSignUpTalent({
        name: talentName,
        type: talentType,
        gender: talentGender,
        age: Number(talentAge),
        heightCm: 175,
        eyeColor: 'brown',
        hairColor: 'black',
        hairLength: 'natural',
        ethnicity: 'East African',
        location: talentLocation,
        bio: talentBio || 'Premium Addis Talent registry member. Ready for local and international casting roles.',
        skills: skillsArray.length > 0 ? skillsArray : ['Acting', 'Modeling'],
        headshotUrl: customAvatarUrl,
        contactEmail: talentEmail,
        phone: talentPhone || '+251 911 000 000',
        instagram: talentName ? `@${talentName.toLowerCase().replace(/\s+/g, '_')}` : '@addis_talent'
      });
    } else {
      if (!producerName || !producerCompany || !producerEmail) {
        alert('Please fill in your Name, Studio/Company and Email.');
        return;
      }
      
      onSignUpProducer({
        name: producerName,
        company: producerCompany,
        type: producerRole,
        email: producerEmail
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#0e0e11] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#080809] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">Join Addis Talent</h3>
              <p className="text-[10px] text-white/40 font-mono">Create your free verified industry account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Account Type Selector Tab */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 font-mono">
              Choose your Account Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#080809] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setAccountType('talent')}
                className={`py-3 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  accountType === 'talent'
                    ? 'bg-amber-500 text-black shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="h-4 w-4 shrink-0" />
                <span>Creative Talent (Actor, Model, Voice)</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('producer')}
                className={`py-3 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                  accountType === 'producer'
                    ? 'bg-amber-500 text-black shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span>Hiring Client (Director, Producer, Agent)</span>
              </button>
            </div>
          </div>

          {accountType === 'talent' ? (
            /* Talent Signup Form */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Full Professional Name
                  </label>
                  <input
                    type="text"
                    required
                    value={talentName}
                    onChange={(e) => setTalentName(e.target.value)}
                    placeholder="e.g. Bethlehem Abebe"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={talentEmail}
                    onChange={(e) => setTalentEmail(e.target.value)}
                    placeholder="e.g. betty@addistalent.com"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Age Group
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={talentAge}
                    onChange={(e) => setTalentAge(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Gender Identity
                  </label>
                  <select
                    value={talentGender}
                    onChange={(e) => setTalentGender(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  >
                    <option value="female" className="bg-[#0e0e11]">Female</option>
                    <option value="male" className="bg-[#0e0e11]">Male</option>
                    <option value="non-binary" className="bg-[#0e0e11]">Non-binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Specialty Category
                  </label>
                  <select
                    value={talentType}
                    onChange={(e) => setTalentType(e.target.value as ActorType)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  >
                    <option value="both" className="bg-[#0e0e11]">Actor & Model</option>
                    <option value="actor" className="bg-[#0e0e11]">Actor Only</option>
                    <option value="model" className="bg-[#0e0e11]">Model Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Primary Location Hub
                  </label>
                  <input
                    type="text"
                    value={talentLocation}
                    onChange={(e) => setTalentLocation(e.target.value)}
                    placeholder="e.g. Addis Ababa, Ethiopia"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={talentPhone}
                    onChange={(e) => setTalentPhone(e.target.value)}
                    placeholder="e.g. +251 911 234567"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Headshot Upload */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 font-mono">
                  Upload your Professional Headshot
                </label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-[#080809] border border-white/10 shrink-0">
                    <img src={customAvatarUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full rounded-lg border border-dashed border-white/20 bg-[#080809] px-4 py-3 text-xs text-white/60 hover:text-white hover:border-amber-500/50 hover:bg-white/5 transition-all cursor-pointer">
                      <Sparkles className="h-4 w-4 mr-2" />
                      <span>Select Photo from Device</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                  Your Creative Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={talentSkills}
                  onChange={(e) => setTalentSkills(e.target.value)}
                  placeholder="Acting, Vocal Solos, Runway Walk, Amharic Speaker"
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                  Short Creative Bio
                </label>
                <textarea
                  rows={2}
                  value={talentBio}
                  onChange={(e) => setTalentBio(e.target.value)}
                  placeholder="Share a brief statement about your acting experience, training, modeling interests, and availability."
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                />
              </div>
            </div>
          ) : (
            /* Producer/Director Signup Form */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Full Professional Name
                  </label>
                  <input
                    type="text"
                    required
                    value={producerName}
                    onChange={(e) => setProducerName(e.target.value)}
                    placeholder="e.g. Abebe Bekele"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={producerEmail}
                    onChange={(e) => setProducerEmail(e.target.value)}
                    placeholder="e.g. bekele@addisfilmstudios.com"
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Production Company / Agency Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                    <input
                      type="text"
                      required
                      value={producerCompany}
                      onChange={(e) => setProducerCompany(e.target.value)}
                      placeholder="e.g. Addis Film Studios"
                      className="w-full rounded-lg border border-white/10 bg-[#080809] pl-9 pr-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Professional Role Title
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                    <input
                      type="text"
                      value={producerRole}
                      onChange={(e) => setProducerRole(e.target.value)}
                      placeholder="e.g. Film Director / Head of Casting"
                      className="w-full rounded-lg border border-white/10 bg-[#080809] pl-9 pr-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] leading-relaxed text-white/70">
                🚀 <strong>Casting Networks Power Features</strong> are unlocked for verified Hiring Clients! You will instantly be able to create unlimited casting calls, shortlist talent portfolios, review video self-tapes, and invite actors directly to digital auditions.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-0 pt-4 border-t border-white/10 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              Complete Registration & Sign In
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
