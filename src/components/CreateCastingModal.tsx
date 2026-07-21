import React, { useState } from 'react';
import { X, Plus, Trash2, Briefcase, Sparkles, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';
import { CastingCall, CastingRole } from '../types';

interface CreateCastingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (castingCall: Omit<CastingCall, 'id' | 'dateCreated'>) => void;
  isProducerPremium: boolean;
  onUnlockProducerPremium: () => void;
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

export default function CreateCastingModal({ isOpen, onClose, onSubmit, isProducerPremium, onUnlockProducerPremium, onSubmitPaymentRequest }: CreateCastingModalProps) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [director, setDirector] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'film' | 'tv' | 'commercial' | 'theater' | 'modeling'>('film');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [roles, setRoles] = useState<Omit<CastingRole, 'id'>[]>([
    { title: '', gender: 'all', ageMin: 18, ageMax: 40, description: '', compensation: '', sidesText: '' }
  ]);

  const [aiConcept, setAiConcept] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Recruiter payment state
  const [isPaying, setIsPaying] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [txRef, setTxRef] = useState('');
  const [recruiterName, setRecruiterName] = useState('Addis Casting Director');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handlePayProducerPremium = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !txRef) return;
    setIsPaying(true);

    if (onSubmitPaymentRequest) {
      onSubmitPaymentRequest({
        userName: recruiterName || 'Casting Director',
        userEmail: 'recruiter@addistalent.com',
        userPhone: phoneNumber,
        userType: 'producer',
        planName: 'Recruiter Pro Pass (1,500 ETB)',
        amount: 1500,
        transactionRef: txRef
      });
    }

    setTimeout(() => {
      setIsPaying(false);
      setSubmittedSuccess(true);
    }, 1200);
  };

  const handleDraftCasting = async () => {
    if (!aiConcept) return;
    setIsDrafting(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/ai/role-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: aiConcept,
          type,
          budget: budget || 'Competitive'
        })
      });
      const data = await response.json();
      if (response.ok && data.title) {
        setTitle(data.title);
        setDescription(data.description || '');
        if (Array.isArray(data.roles) && data.roles.length > 0) {
          setRoles(data.roles.map((r: any) => ({
            title: r.title || 'Supporting Role',
            gender: r.gender || 'all',
            ageMin: Number(r.ageMin) || 18,
            ageMax: Number(r.ageMax) || 45,
            description: r.description || '',
            sidesText: `[Audition sides script for role: ${r.title}] Read clearly with emotional nuance.`,
            compensation: r.compensation || budget || 'Negotiable'
          })));
        }
        setAiConcept('');
      } else {
        throw new Error(data.error || 'AI builder returned error');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`AI Role Builder failed: ${err.message || 'Key missing'}`);
    } finally {
      setIsDrafting(false);
    }
  };

  if (!isOpen) return null;

  if (!isProducerPremium) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl bg-[#0e0e11] shadow-2xl overflow-hidden border border-white/10">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080809]">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-md font-bold text-white font-display uppercase tracking-wide">Recruiter Premium</h2>
                <p className="text-[10px] text-white/40 font-mono">Unlock Audition Publishing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {submittedSuccess ? (
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase font-display">Payment Request Submitted!</h3>
                <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed">
                  Your Telebirr payment reference code <strong>{txRef}</strong> has been submitted to the platform owner on <strong>+251911381970</strong>. Once approved, Recruiter Pro features will automatically unlock.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmittedSuccess(false);
                  onClose();
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl cursor-pointer shadow-lg"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayProducerPremium} className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Recruiter Pro Membership Required</h3>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Standard accounts can browse talent registries. To publish active casting calls, review applicant headshots, and receive audition self-tapes, upgrade to Recruiter Pro.
                </p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-amber-400 font-bold">1. TELEBIRR RECIPIENT ACCOUNT</span>
                  <span className="text-white font-bold font-mono">+251911381970</span>
                </div>
                <div className="h-[1px] bg-amber-500/20" />
                <p className="text-[10px] text-white/70 leading-relaxed">
                  Transfer <strong>1,500 ETB</strong> via Telebirr (*127# or Telebirr App) to account <strong>+251911381970</strong>, then enter your transaction reference ID below for platform owner approval.
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[10px] text-white/50 uppercase font-bold tracking-wider font-mono">Recruiter / Production Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Nile Films"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                />
              </div>

              {/* Phone & Ref */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] text-white/50 uppercase font-bold tracking-wider font-mono">Your Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0911223344"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-amber-400 uppercase font-bold tracking-wider font-mono">Telebirr Ref Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TLB891203"
                    value={txRef}
                    onChange={(e) => setTxRef(e.target.value)}
                    className="w-full rounded-lg border border-amber-500/40 bg-[#080809] px-3 py-2 text-xs text-amber-300 focus:border-amber-400 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-bold text-white/70 hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying || !phoneNumber || !txRef}
                  className="flex-2 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPaying ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin text-black" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit for Owner Approval</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  const handleAddRole = () => {
    setRoles([...roles, { title: '', gender: 'all', ageMin: 18, ageMax: 40, description: '', compensation: '', sidesText: '' }]);
  };

  const handleRemoveRole = (index: number) => {
    if (roles.length === 1) return;
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleRoleChange = (index: number, field: keyof Omit<CastingRole, 'id'>, value: any) => {
    const updated = [...roles];
    updated[index] = { ...updated[index], [field]: value };
    setRoles(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !description || !location || !deadline) {
      setErrorMessage('Please fill in all required fields marked with *');
      return;
    }

    // Map role list with generated temporary IDs
    const formattedRoles: CastingRole[] = roles.map((role, idx) => ({
      ...role,
      id: `role_gen_${Date.now()}_${idx}`
    }));

    onSubmit({
      title,
      company,
      director: director || 'TBA',
      description,
      location,
      type,
      budget: budget || 'Compensation specified per role',
      deadline,
      status: 'open',
      roles: formattedRoles,
      imageUrl: type === 'modeling'
        ? 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&h=400&q=80'
        : type === 'film'
        ? 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&h=400&q=80'
        : type === 'theater'
        ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&h=400&q=80'
        : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=400&q=80'
    });

    // Reset Form
    setTitle('');
    setCompany('');
    setDirector('');
    setDescription('');
    setLocation('');
    setType('film');
    setBudget('');
    setDeadline('');
    setErrorMessage('');
    setRoles([{ title: '', gender: 'all', ageMin: 18, ageMax: 40, description: '', compensation: '', sidesText: '' }]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="create-casting-modal"
        className="relative w-full max-w-3xl rounded-2xl bg-[#0e0e11] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080809]">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white font-display uppercase tracking-wide">Post New Casting Call</h2>
              <p className="text-[10px] text-white/40 font-mono">Create auditions, specifications, and compensation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AI Drafting Generator Header */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-[#0e0e11] to-amber-500/5 p-4 space-y-3">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">✨ AI Casting Call Draft Generator</h4>
            </div>
            <p className="text-[10px] text-white/60 leading-relaxed">
              Don't want to write casting calls from scratch? Provide a quick story concept (e.g., "A modern romance about a coffee barista in Addis Ababa") and we'll draft the roles, character bios, and details instantly.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. A suspense thriller about a detective investigating a stolen ancient cross in Lalibela"
                value={aiConcept}
                onChange={(e) => setAiConcept(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden placeholder:text-white/20"
              />
              <button
                type="button"
                disabled={isDrafting || !aiConcept}
                onClick={handleDraftCasting}
                className="shrink-0 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 px-3.5 py-1.5 text-xs font-bold text-black transition-all cursor-pointer flex items-center space-x-1"
              >
                {isDrafting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                <span>{isDrafting ? 'Drafting...' : 'Draft with AI'}</span>
              </button>
            </div>
          </div>

          {/* General Project Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono mb-4 flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
              1. Production Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Rain"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">Production Company / Agency *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solis Pictures"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">Director Name</label>
                <input
                  type="text"
                  placeholder="e.g. Claire Henderson"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">Casting Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Los Angeles, CA or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">Production Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                >
                  <option value="film">Independent / Feature Film</option>
                  <option value="tv">TV / Streaming Series</option>
                  <option value="commercial">Commercial / Digital Promo</option>
                  <option value="theater">Stage Play / Musical Theater</option>
                  <option value="modeling">Fashion Runway / Editorial Print</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">Application Deadline *</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-white/60 mb-1">Overall Project Budget / Rate Note</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="e.g. $450/day (SAG-AFTRA) or $1,200 Flat Rate"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#080809] pl-9 pr-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-white/60 mb-1">Project Synopsis / Casting Overview *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Briefly describe the theme, plot, schedule, or artistic direction of the shoot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-hidden transition-all font-sans placeholder:text-white/20"
                />
              </div>
            </div>
          </div>

          {/* Roles Specifications Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 font-mono flex items-center">
                <Plus className="h-3.5 w-3.5 mr-1 text-amber-500" />
                2. Roles / Character Breakdowns
              </h3>
              <button
                type="button"
                onClick={handleAddRole}
                className="inline-flex items-center space-x-1 text-xs text-amber-400 font-bold hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Another Role</span>
              </button>
            </div>

            <div className="space-y-4">
              {roles.map((role, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl border border-white/5 bg-white/5 p-4 space-y-3"
                >
                  {/* Delete Role Button */}
                  {roles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="absolute top-4 right-4 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Role"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1 font-mono">
                        Role Title / Character Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sergeant Jax Thorne"
                        value={role.title}
                        onChange={(e) => handleRoleChange(idx, 'title', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1 font-mono">
                        Gender Requirement
                      </label>
                      <select
                        value={role.gender}
                        onChange={(e) => handleRoleChange(idx, 'gender', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                      >
                        <option value="all">Open to All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-Binary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1 font-mono">
                        Min Age
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={role.ageMin}
                        onChange={(e) => handleRoleChange(idx, 'ageMin', parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1 font-mono">
                        Max Age
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={role.ageMax}
                        onChange={(e) => handleRoleChange(idx, 'ageMax', parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1 font-mono">
                        Compensation / Rate
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $650/day"
                        value={role.compensation}
                        onChange={(e) => handleRoleChange(idx, 'compensation', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all placeholder:text-white/20"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1 font-mono">
                        Character Description / Skills Needed
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Muscular build, athletic, comfortable with fight choreographies and tactical gear. Outspoken and protective."
                        value={role.description}
                        onChange={(e) => handleRoleChange(idx, 'description', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all font-sans placeholder:text-white/20"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1 font-mono flex items-center gap-1">
                        <span>🎭 Audition Sides Script (for practice)</span>
                        <span className="text-[9px] font-normal lowercase text-white/30">(optional - pre-filled by AI)</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. [SIDES] Character: 'I never wanted it to end this way... but the choice was never mine.'"
                        value={role.sidesText || ''}
                        onChange={(e) => handleRoleChange(idx, 'sidesText', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#080809] px-3 py-1.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden transition-all font-serif placeholder:text-white/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              Publish Casting Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
