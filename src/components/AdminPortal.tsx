import React, { useState } from 'react';
import { 
  Database, DollarSign, Settings, RefreshCw, FileText, 
  CheckCircle2, Trash2, Users, Briefcase, ArrowRight, 
  Lock, Globe, UploadCloud, Check, Plus, Play, Filter, 
  ShieldAlert, Sparkles, Sliders, AlertCircle, HelpCircle,
  Download, Eye, AlertTriangle, Award, Film, Shield, 
  TrendingUp, X, ChevronDown, ChevronUp, CreditCard
} from 'lucide-react';
import { Actor, CastingCall, Application, Partner, NewsArticle, PaymentRequest } from '../types';

interface AdminPortalProps {
  actors: Actor[];
  castingCalls: CastingCall[];
  applications: Application[];
  partners: Partner[];
  newsArticles: NewsArticle[];
  paymentRequests?: PaymentRequest[];
  onAddActors: (newActors: Actor[]) => void;
  onUpdateActor: (updatedActor: Actor) => void;
  onUpdateCastingCall?: (updatedCall: CastingCall) => void;
  onDeleteActor: (id: string) => void;
  onAddOrUpdatePartner: (partner: Partner) => void;
  onDeletePartner: (partnerId: string) => void;
  onAddOrUpdateNews: (article: NewsArticle) => void;
  onDeleteNews: (newsId: string) => void;
  onUpdatePaymentRequestStatus?: (id: string, status: 'approved' | 'rejected', notes?: string) => void;
  showToast: (type: 'success' | 'info', text: string) => void;
  onUpdateApplicationStatus?: (appId: string, status: Application['status']) => void;
}

export default function AdminPortal({
  actors,
  castingCalls,
  applications,
  partners,
  newsArticles,
  paymentRequests = [],
  onAddActors,
  onUpdateActor,
  onUpdateCastingCall,
  onDeleteActor,
  onAddOrUpdatePartner,
  onDeletePartner,
  onAddOrUpdateNews,
  onDeleteNews,
  onUpdatePaymentRequestStatus,
  showToast,
  onUpdateApplicationStatus
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'financials' | 'telebirr_payments' | 'airtable' | 'registry' | 'applications' | 'castings' | 'hosting' | 'partners_news'>('telebirr_payments');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  
  // Financial Settings state (Simulated but fully customizable)
  const [talentFee, setTalentFee] = useState(250); // Birr per month
  const [producerCallFee, setProducerCallFee] = useState(1500); // Birr per post
  const [agencyCommission, setAgencyCommission] = useState(12); // % of booking value
  
  // Airtable Sync configuration
  const [airtableToken, setAirtableToken] = useState('pat.addisfilmhub_secret_key_2026_prod');
  const [airtableBaseId, setAirtableBaseId] = useState('appAddisTalentRegistry');
  const [airtableTableName, setAirtableTableName] = useState('TalentsMaster');
  const [csvInput, setCsvInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  
  // Registry Filters
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryTypeFilter, setRegistryTypeFilter] = useState<'all' | 'actor' | 'model' | 'both'>('all');
  
  // Custom Hosting & Domain states
  const [domainStatus, setDomainStatus] = useState<'pending' | 'configured'>('pending');
  const [nameserverCheck, setNameserverCheck] = useState(false);

  // Partners Form State
  const [partnerName, setPartnerName] = useState('');
  const [partnerIcon, setPartnerIcon] = useState('Film');

  // News Form State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('Industry Update');
  const [newsAuthor, setNewsAuthor] = useState('');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [showNewsForm, setShowNewsForm] = useState(false);

  const handleEditArticle = (article: NewsArticle) => {
    setEditingArticleId(article.id);
    setNewsTitle(article.title);
    setNewsCategory(article.category);
    setNewsAuthor(article.author);
    setNewsImageUrl(article.imageUrl);
    setNewsExcerpt(article.excerpt);
    setNewsContent(article.content);
    setShowNewsForm(true);
  };

  // Financial Stats calculation
  const premiumTalentsCount = actors.filter(a => a.id.startsWith('act_gen_') || a.id.length % 2 === 0).length;
  const estimatedTalentRevenue = premiumTalentsCount * talentFee;
  const estimatedProducerRevenue = castingCalls.length * producerCallFee;
  const estimatedCommissionRevenue = applications.filter(app => app.status === 'accepted').length * 4500;
  const totalSimulatedRevenue = estimatedTalentRevenue + estimatedProducerRevenue + estimatedCommissionRevenue;

  const downloadBackupJSON = () => {
    try {
      const backupData = {
        exportDate: new Date().toISOString(),
        actorsCount: actors.length,
        castingCallsCount: castingCalls.length,
        applicationsCount: applications.length,
        actors,
        castingCalls,
        applications
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `addis_talent_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('success', 'Full platform database backup JSON downloaded successfully!');
    } catch (err) {
      showToast('info', 'Unable to initiate local file download. Open in New Tab or allow browser downloads.');
    }
  };

  // Handle manual JSON/CSV paste from Airtable
  const handleAirtableIngest = () => {
    if (!csvInput.trim()) {
      showToast('info', 'Please paste CSV or JSON data first.');
      return;
    }

    setIsSyncing(true);
    setSyncLogs(['Initializing Airtable pipeline...', 'Resolving column schema mapping...']);

    setTimeout(() => {
      try {
        let importedCount = 0;
        const newActorsList: Actor[] = [];

        // Check if user pasted JSON
        if (csvInput.trim().startsWith('[') || csvInput.trim().startsWith('{')) {
          const parsed = JSON.parse(csvInput);
          const records = Array.isArray(parsed) ? parsed : (parsed.records || [parsed]);
          
          records.forEach((rec: any, idx: number) => {
            // Support raw Airtable structure or simplified JSON
            const fields = rec.fields || rec;
            const name = fields.name || fields.Name || fields.fullName || `Airtable Artist #${100 + idx}`;
            const type = (fields.type || fields.Type || 'both').toLowerCase() as any;
            const gender = (fields.gender || fields.Gender || 'female').toLowerCase() as any;
            const age = Number(fields.age || fields.Age || 25);
            const location = fields.location || fields.Location || 'Addis Ababa, Ethiopia';
            const email = fields.email || fields.Email || `${name.toLowerCase().replace(/\s+/g, '')}@addisfilmhub.com.et`;
            const phone = fields.phone || fields.Phone || '+251 911 000 000';
            const bio = fields.bio || fields.Bio || 'Professional talent imported securely from Airtable Master Registry.';
            const headshotUrl = fields.headshotUrl || fields.photoUrl || fields.Photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80';
            const skills = fields.skills || fields.Skills ? (typeof fields.skills === 'string' ? fields.skills.split(',') : fields.skills) : ['Acting', 'Modeling'];

            newActorsList.push({
              id: `airtable_${Date.now()}_${idx}`,
              name,
              type: ['actor', 'model', 'both'].includes(type) ? type : 'both',
              gender: ['male', 'female', 'non-binary'].includes(gender) ? gender : 'female',
              age: isNaN(age) ? 24 : age,
              heightCm: fields.heightCm || fields.Height || 172,
              eyeColor: fields.eyeColor || 'brown',
              hairColor: fields.hairColor || 'black',
              hairLength: fields.hairLength || 'natural',
              ethnicity: fields.ethnicity || 'East African',
              location,
              bio,
              skills: Array.isArray(skills) ? skills.map((s: any) => String(s).trim()) : ['Acting'],
              headshotUrl,
              contactEmail: email,
              phone,
              experience: [],
              createdAt: new Date().toISOString()
            });
            importedCount++;
          });
        } else {
          // Parse as basic comma/tab separated CSV values
          const lines = csvInput.split('\n');
          const headers = lines[0].split(/[,\t]/).map(h => h.trim().toLowerCase());
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const cols = lines[i].split(/[,\t]/).map(c => c.trim().replace(/^"|"$/g, ''));
            
            // Basic column matching
            const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('title'));
            const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('role'));
            const ageIdx = headers.findIndex(h => h.includes('age'));
            const locationIdx = headers.findIndex(h => h.includes('location') || h.includes('city'));
            const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('contact'));
            
            const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Talent Row #${i}`;
            const typeRaw = typeIdx !== -1 && cols[typeIdx] ? cols[typeIdx].toLowerCase() : 'both';
            const type = ['actor', 'model', 'both'].includes(typeRaw) ? typeRaw : 'both';
            const age = ageIdx !== -1 && !isNaN(Number(cols[ageIdx])) ? Number(cols[ageIdx]) : 26;
            const location = locationIdx !== -1 && cols[locationIdx] ? cols[locationIdx] : 'Addis Ababa';
            const email = emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : 'info@addisfilmhub.com.et';

            newActorsList.push({
              id: `csv_${Date.now()}_${i}`,
              name,
              type: type as any,
              gender: 'female',
              age,
              heightCm: 170,
              eyeColor: 'brown',
              hairColor: 'black',
              hairLength: 'natural',
              ethnicity: 'East African',
              location,
              bio: 'Bulk imported talent from Airtable spreadsheet CSV.',
              skills: ['Acting', 'Modeling'],
              headshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
              contactEmail: email,
              phone: '+251 911 000 000',
              experience: [],
              createdAt: new Date().toISOString()
            });
            importedCount++;
          }
        }

        if (newActorsList.length > 0) {
          onAddActors(newActorsList);
          setSyncLogs(prev => [
            ...prev,
            `Column matching successful.`,
            `Parsed ${importedCount} unique talent records.`,
            `Updating secure state registry...`,
            `🎉 Import complete! Successfully injected ${importedCount} talents into Addis Talent live index.`
          ]);
          showToast('success', `Successfully imported ${importedCount} talents into Addis Talent database!`);
          setCsvInput('');
        } else {
          throw new Error('No valid records parsed from input text.');
        }

      } catch (err: any) {
        setSyncLogs(prev => [...prev, `❌ Error parsing Airtable payload: ${err.message}`]);
        showToast('info', 'Failed to parse paste data. Please ensure it is clean JSON/CSV format.');
      } finally {
        setIsSyncing(false);
      }
    }, 1500);
  };

  // Prepopulate 700 Simulated Airtable Talents
  const load700SimulatedTalents = () => {
    setIsSyncing(true);
    setSyncLogs(['Simulating link with Airtable base...', 'Downloading records chunk 1/4...', 'Downloading records chunk 2/4...', 'Downloading records chunk 3/4...', 'Downloading records chunk 4/4...']);

    setTimeout(() => {
      const generated: Actor[] = [];
      const ethiopianNames = [
        'Yared Tesfaye', 'Selamawit Kebede', 'Tewodros Kassahun', 'Helena Berhanu',
        'Dawit Abebe', 'Meron Getachew', 'Solomon Gebre', 'Bethlehem Mekonnen',
        'Kaleb Girma', 'Lidya Hailu', 'Abdi Mohammed', 'Fana Teshome',
        'Tariku Birhanu', 'Saba Girmay', 'Ephrem Tadesse', 'Zenebech Tolossa'
      ];
      
      const skillsPool = ['Acting', 'Model Walk', 'Vocalist', 'Voiceover', 'Amharic Speaker', 'Oromiffa Speaker', 'Tigrinya Speaker', 'TV Commercial Extra'];
      const locations = ['Addis Ababa, Ethiopia', 'Hawassa, Ethiopia', 'Adama, Ethiopia', 'Bahir Dar, Ethiopia', 'Dire Dawa, Ethiopia'];

      // Generate 15 premium customized templates first
      ethiopianNames.forEach((name, i) => {
        generated.push({
          id: `airtable_sim_${Date.now()}_${i}`,
          name,
          type: i % 3 === 0 ? 'actor' : i % 3 === 1 ? 'model' : 'both',
          gender: i % 2 === 0 ? 'male' : 'female',
          age: 18 + (i * 3) % 25,
          heightCm: 165 + (i * 2) % 30,
          eyeColor: 'brown',
          hairColor: 'black',
          hairLength: i % 2 === 0 ? 'shaved' : 'long braided',
          ethnicity: 'East African',
          location: locations[i % locations.length],
          bio: `Highly skilled artistic talent. Specialist in ${skillsPool[i % skillsPool.length]} and screen presence. Certified Addis Talent member.`,
          skills: [skillsPool[i % skillsPool.length], 'Film Extra', 'Multilingual Dialogue'],
          headshotUrl: i % 2 === 0 
            ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
          contactEmail: `${name.toLowerCase().replace(/\s+/g, '')}@addisfilmhub.com.et`,
          phone: `+251 911 ${200000 + i}`,
          experience: [],
          createdAt: new Date().toISOString()
        });
      });

      // Inject bulk simulated record marker to reach 715+ registered talents
      for (let j = 0; j < 700; j++) {
        generated.push({
          id: `airtable_bulk_${j}`,
          name: `Airtable Talent #${1001 + j}`,
          type: j % 2 === 0 ? 'actor' : 'model',
          gender: j % 3 === 0 ? 'male' : 'female',
          age: 20 + (j % 15),
          heightCm: 170 + (j % 12),
          eyeColor: 'dark brown',
          hairColor: 'black',
          hairLength: 'natural',
          ethnicity: 'Ethiopian',
          location: 'Addis Ababa',
          bio: 'Archived portfolio registered in Airtable database under Master ID.',
          skills: ['Acting Extra', 'Runway Walk'],
          headshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
          contactEmail: `talent_${j}@addisfilmhub.com.et`,
          phone: '+251 911 000 000',
          experience: [],
          createdAt: new Date().toISOString()
        });
      }

      onAddActors(generated);
      setSyncLogs(prev => [
        ...prev,
        'Matched Base Scheme: "Airtable 700+ Actors Sync"',
        'Extracted 716 active profiles successfully.',
        'Committing transaction to LocalStorage index...',
        '🎉 Complete! Fully synced all 716 actor portfolios into Addis Talent Registry.'
      ]);
      showToast('success', 'Synced 716 registered talent portfolios directly from Airtable!');
      setIsSyncing(false);
    }, 2000);
  };

  // Remove actor
  const handleDeleteActorClick = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the active platform index?`)) {
      onDeleteActor(id);
      showToast('info', `Removed ${name} from database registry.`);
    }
  };

  // Filter registry
  const filteredActors = actors.filter(actor => {
    const matchesSearch = actor.name.toLowerCase().includes(registrySearch.toLowerCase()) || 
                          actor.location.toLowerCase().includes(registrySearch.toLowerCase()) ||
                          actor.skills.some(s => s.toLowerCase().includes(registrySearch.toLowerCase()));
    const matchesType = registryTypeFilter === 'all' || actor.type === registryTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div id="admin-portal" className="space-y-6">
      
      {/* Admin Control Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-black to-[#0e0e11] border border-purple-500/15 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 select-none">
          <Settings className="h-44 w-44 animate-spin-slow text-purple-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
              <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-ping"></span>
              <span>Platform Owner HQ</span>
            </div>
            <h2 className="text-2xl font-black text-white font-display tracking-tight uppercase">
              Addis Talent Administrative Dashboard
            </h2>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              Manage your premium domain <strong className="text-amber-400">addisfilmhub.com.et</strong>, synchronize with your Airtable talent base, control subscription pricing models, and monitor global platform revenue metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load700SimulatedTalents}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg shadow-purple-500/15"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Simulate Airtable Sync (700+ Talents)</span>
            </button>
          </div>
        </div>

        {/* Global KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
          <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider">Total Active Index</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">{actors.length}</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">+ {actors.filter(a => a.id.startsWith('airtable_')).length} Airtable</span>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider">Simulated Monthly Revenue</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-amber-400 font-mono">{totalSimulatedRevenue.toLocaleString()}</span>
              <span className="text-[10px] text-white/40 font-mono">ETB</span>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider">Active Agency Clients</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">14</span>
              <span className="text-[10px] text-white/40 font-mono">Verified</span>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider">Hires & Applications</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">{applications.length}</span>
              <span className="text-[10px] text-purple-400 font-mono font-bold">{applications.filter(a => a.status === 'accepted').length} Casted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side Tab Navigation */}
        <div className="lg:col-span-1 space-y-2 bg-[#0e0e11] p-3.5 rounded-2xl border border-white/5">
          <span className="block px-3.5 text-[9px] font-bold uppercase tracking-widest text-white/30 font-mono mb-2">
            Owner Command Center
          </span>

          <button
            onClick={() => setActiveTab('telebirr_payments')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'telebirr_payments'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span>1. Telebirr Approvals</span>
            </div>
            {paymentRequests.filter(r => r.status === 'pending').length > 0 ? (
              <span className="bg-emerald-500 text-black font-mono font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                {paymentRequests.filter(r => r.status === 'pending').length} Pending
              </span>
            ) : (
              <span className="text-[10px] font-mono opacity-80">{paymentRequests.length} Total</span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('financials')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'financials'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>2. Pricing & Monetization</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('airtable')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'airtable'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>2. Airtable Sync (700+)</span>
            </div>
            {actors.filter(a => a.id.startsWith('airtable_')).length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded-sm">Synced</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>3. Talent Directory</span>
            </div>
            <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded-sm text-white">{actors.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>4. Submissions Manager</span>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-sm border border-amber-500/10">{applications.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('castings')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'castings'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>5. Casting Calls</span>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-sm border border-amber-500/10">{castingCalls.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('hosting')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'hosting'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>5. Web Hosting Setup</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">.com.et</span>
          </button>

          <button
            onClick={() => setActiveTab('partners_news')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'partners_news'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10 border border-purple-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>6. Partners & News Hub</span>
            </div>
            <span className="text-[10px] font-mono opacity-80 bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-sm">Active</span>
          </button>

          <div className="pt-4 mt-4 border-t border-white/5 px-3">
            <div className="flex items-center space-x-2 text-[10px] text-white/40">
              <ShieldAlert className="h-3 w-3 text-amber-500" />
              <span className="font-mono">Owner Token Verified</span>
            </div>
            <p className="text-[9px] text-white/30 font-sans mt-1">
              You are signed in as Administrator of Addis Talent Platform.
            </p>
          </div>
        </div>

        {/* Right Side Working Content Area */}
        <div className="lg:col-span-3 min-h-[500px]">
          
          {/* TAB 0: TELEBIRR PAYMENT REQUESTS & OWNER APPROVALS */}
          {activeTab === 'telebirr_payments' && (
            <div className="bg-[#0e0e11] border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase">
                    <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Telebirr Account: +251911381970</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider">
                    Telebirr Payment Requests & Gateway Approvals
                  </h3>
                  <p className="text-xs text-white/60">
                    Review incoming Telebirr transfer requests from talents and recruiters. Approve transactions after verifying the reference code.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('+251911381970');
                      showToast('success', 'Copied Telebirr account +251911381970 to clipboard!');
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Copy Account: +251911381970</span>
                  </button>
                </div>
              </div>

              {/* Quick Telebirr Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Approved Telebirr Revenue</span>
                  <p className="text-xl font-mono font-black text-emerald-400">
                    {paymentRequests.filter(r => r.status === 'approved').reduce((acc, r) => acc + (r.amount || 0), 0).toLocaleString()} ETB
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Pending Review Requests</span>
                  <p className="text-xl font-mono font-black text-amber-400">
                    {paymentRequests.filter(r => r.status === 'pending').length} Requests
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Total Requests Recorded</span>
                  <p className="text-xl font-mono font-black text-white">
                    {paymentRequests.length} Transactions
                  </p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPaymentStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      paymentStatusFilter === st
                        ? 'bg-amber-500 text-black font-extrabold'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'All Transactions' : st}
                    {st === 'pending' && paymentRequests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="ml-1.5 bg-amber-400 text-black px-1.5 py-0.2 rounded-full text-[9px] font-black">
                        {paymentRequests.filter(r => r.status === 'pending').length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Requests Table / Cards */}
              {(() => {
                const filtered = paymentRequests.filter(r => paymentStatusFilter === 'all' || r.status === paymentStatusFilter);
                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-white/10">
                      <CreditCard className="h-10 w-10 text-white/20 mx-auto" />
                      <p className="text-xs text-white/40 italic mt-3">No payment requests found in this view.</p>
                      <p className="text-[10px] text-white/30 mt-1">Talent and recruiter payment requests submitted via Telebirr will appear here for your approval.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map((req) => (
                      <div
                        key={req.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          req.status === 'pending'
                            ? 'bg-gradient-to-r from-amber-500/10 via-black to-black border-amber-500/30'
                            : req.status === 'approved'
                            ? 'bg-black/50 border-emerald-500/30'
                            : 'bg-black/30 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                              req.userType === 'actor' 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {req.userType === 'actor' ? 'Talent' : 'Recruiter'}
                            </span>
                            <span className="text-xs font-bold text-white font-display">{req.userName}</span>
                            <span className="text-[10px] text-white/40 font-mono">({req.userPhone})</span>
                          </div>

                          <div className="text-xs text-white/70 space-x-2">
                            <span className="text-amber-400 font-bold font-mono">{req.planName}</span>
                            <span>•</span>
                            <span className="text-white font-bold font-mono">{req.amount} ETB</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/50 font-mono pt-1">
                            <div>
                              <span>Telebirr Ref: </span>
                              <strong className="text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono text-xs">
                                {req.transactionRef}
                              </strong>
                            </div>
                            <span>Submitted: {new Date(req.dateSubmitted).toLocaleDateString()}</span>
                            {req.userEmail && <span>Email: {req.userEmail}</span>}
                          </div>
                        </div>

                        {/* Status & Controls */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdatePaymentRequestStatus) {
                                    onUpdatePaymentRequestStatus(req.id, 'approved', 'Approved by platform owner via Telebirr verification');
                                    showToast('success', `Approved payment of ${req.amount} ETB for ${req.userName}! Account upgraded.`);
                                  }
                                }}
                                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-lg flex items-center space-x-1 cursor-pointer"
                              >
                                <Check className="h-4 w-4" />
                                <span>Approve & Upgrade</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdatePaymentRequestStatus) {
                                    onUpdatePaymentRequestStatus(req.id, 'rejected', 'Transaction reference code not found or invalid');
                                    showToast('info', `Rejected payment request for ${req.userName}.`);
                                  }
                                }}
                                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all flex items-center space-x-1 cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : req.status === 'approved' ? (
                            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Approved & Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                              <X className="h-4 w-4" />
                              <span>Rejected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 1: HOW TO BENEFIT FINANCIALLY */}
          {activeTab === 'financials' && (
            <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">Monetization & Financial Architecture</h3>
                  <p className="text-[11px] text-white/40 font-mono">Configure monetization models for Addis Talent to yield recurring dividends</p>
                </div>
                <DollarSign className="h-6 w-6 text-amber-400" />
              </div>

              {/* Three monetization pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Pillar 1 */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-display tracking-wider">Talent Membership Tiers</h4>
                    <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                      Charge actors/models a small monthly fee to show up in premium casting pools and submit self-tape applications.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40">Active Price/mo:</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={talentFee}
                        onChange={(e) => setTalentFee(Number(e.target.value))}
                        className="w-16 bg-black border border-white/10 rounded-md py-0.5 px-1.5 text-xs text-amber-400 font-bold text-center focus:outline-hidden"
                      />
                      <span className="text-[10px] font-mono text-white/60">ETB</span>
                    </div>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg text-[9px] text-emerald-400 font-mono flex justify-between">
                    <span>Simulated Revenue:</span>
                    <span>{(premiumTalentsCount * talentFee).toLocaleString()} ETB</span>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-display tracking-wider">Agency Listing Fees</h4>
                    <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                      Charge casting directors, movie producers, or corporate advertisement brands a fee to publish audition slots.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40">Active Price/post:</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={producerCallFee}
                        onChange={(e) => setProducerCallFee(Number(e.target.value))}
                        className="w-16 bg-black border border-white/10 rounded-md py-0.5 px-1.5 text-xs text-purple-400 font-bold text-center focus:outline-hidden"
                      />
                      <span className="text-[10px] font-mono text-white/60">ETB</span>
                    </div>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg text-[9px] text-purple-400 font-mono flex justify-between">
                    <span>Simulated Revenue:</span>
                    <span>{(castingCalls.length * producerCallFee).toLocaleString()} ETB</span>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-display tracking-wider">Booking Commission</h4>
                    <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                      Act as the premier local agency escrow and claim a direct percentage cut on active contracts signed.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40">Active Comm %:</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min="5"
                        max="30"
                        value={agencyCommission}
                        onChange={(e) => setAgencyCommission(Number(e.target.value))}
                        className="w-16 bg-black border border-white/10 rounded-md py-0.5 px-1.5 text-xs text-emerald-400 font-bold text-center focus:outline-hidden"
                      />
                      <span className="text-[10px] font-mono text-white/60">%</span>
                    </div>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg text-[9px] text-emerald-400 font-mono flex justify-between">
                    <span>Casted Placements:</span>
                    <span>{estimatedCommissionRevenue.toLocaleString()} ETB</span>
                  </div>
                </div>

              </div>



              {/* Premium Packages Settings & Simulated Revenue */}
              <div className="p-5 rounded-2xl bg-[#080809] border border-white/5 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase font-mono">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Pro Services & Academy Package Settings</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Addis Talent hosts native on-demand portals for specialized talent assets. Configure active rates for localized photoshoot sessions and online masterclasses to grow cash flow streams.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Photo package configuration */}
                  <div className="p-4 rounded-xl bg-[#0e0e11] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-400 font-mono uppercase tracking-wider">Premium Portrait Package</span>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-mono font-bold">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Listed Cost:</span>
                      <strong className="text-white">3,500 ETB</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Your Profit Split (20%):</span>
                      <strong className="text-emerald-400">700 ETB / shoot</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5 font-mono text-[10px]">
                      <span className="text-white/40">Simulated bookings / mo:</span>
                      <span className="text-purple-400">45 sessions</span>
                    </div>
                    <div className="bg-purple-950/20 p-2 rounded-lg text-[9px] text-purple-400 font-mono flex justify-between">
                      <span>Monthly Yield Estimation:</span>
                      <span>31,500 ETB</span>
                    </div>
                  </div>

                  {/* Acting masterclass package configuration */}
                  <div className="p-4 rounded-xl bg-[#0e0e11] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider">Acting Masterclass Academy</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Listed Cost:</span>
                      <strong className="text-white">1,800 ETB</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Your Profit Split (100%):</span>
                      <strong className="text-emerald-400">1,800 ETB / enrollment</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5 font-mono text-[10px]">
                      <span className="text-white/40">Simulated enrollments / mo:</span>
                      <span className="text-amber-400">60 actors</span>
                    </div>
                    <div className="bg-amber-950/20 p-2 rounded-lg text-[9px] text-amber-400 font-mono flex justify-between">
                      <span>Monthly Yield Estimation:</span>
                      <span>108,000 ETB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monetization tips */}
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[11px] leading-relaxed text-white/70 flex items-start space-x-3">
                <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Pro Owner Tip:</strong> We have successfully activated the <strong>Premium Headshot Photography Package (3,500 ETB)</strong> and <strong>Acting & Modeling Masterclass (1,800 ETB)</strong> inside the Talent Portal! Talents can book sessions or enroll directly to instantly unlock professional features.
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AIRTABLE SYNC & INGEST TOOL */}
          {activeTab === 'airtable' && (
            <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">Airtable Database Integration</h3>
                  <p className="text-[11px] text-white/40 font-mono">Connect your existing Airtable base with 700+ registered talents</p>
                </div>
                <Database className="h-6 w-6 text-amber-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Airtable Personal Access Token
                  </label>
                  <input
                    type="password"
                    value={airtableToken}
                    onChange={(e) => setAirtableToken(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Base ID (appXXXXXX)
                  </label>
                  <input
                    type="text"
                    value={airtableBaseId}
                    onChange={(e) => setAirtableBaseId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1 font-mono">
                    Table Name
                  </label>
                  <input
                    type="text"
                    value={airtableTableName}
                    onChange={(e) => setAirtableTableName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Import box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 font-mono">
                    Direct CSV / JSON Text Ingester
                  </label>
                  <span className="text-[9px] text-white/40">JSON format: [{`{"name": "...", "skills": "..."}`}]</span>
                </div>
                <textarea
                  rows={4}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder='Paste your Airtable data export here. (You can download Airtable as CSV or copy-paste JSON payload directly. E.g.
fullName, type, age, location, email
"Hiwot Abraham", "actor", 24, "Addis Ababa", "hiwot@addisfilmhub.com.et"
"Lidiya Bekele", "model", 22, "Hawassa", "lidiya@addisfilmhub.com.et"
)'
                  className="w-full rounded-xl border border-white/10 bg-black p-3.5 text-xs text-white focus:border-amber-500/50 focus:outline-hidden font-mono leading-relaxed"
                />
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={load700SimulatedTalents}
                  className="text-xs font-semibold text-amber-500 hover:text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>💡 No data ready? Simulate instant Airtable Sync</span>
                </button>
                <button
                  onClick={handleAirtableIngest}
                  disabled={isSyncing}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/10 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing Airtable Stream...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Verify & Ingest Influx Data</span>
                    </>
                  )}
                </button>
              </div>

              {/* Logs */}
              {syncLogs.length > 0 && (
                <div className="p-4 bg-black rounded-xl border border-white/10 space-y-1 font-mono text-[10px] text-white/80 max-h-44 overflow-y-auto">
                  <span className="block text-amber-500 font-bold uppercase tracking-wider mb-1.5 text-[9px]">Airtable Sync Stream Logs</span>
                  {syncLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 py-0.5 border-b border-white/5 last:border-0">
                      <span className="text-white/30">[{new Date().toLocaleTimeString()}]</span>
                      <span className={log.includes('🎉') || log.includes('complete') ? 'text-emerald-400 font-bold' : log.includes('❌') ? 'text-red-400' : 'text-white/80'}>{log}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Explainer */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <span className="block text-xs font-bold text-white font-mono uppercase">Syncing Live via Server proxy API</span>
                <p className="text-xs text-white/60 leading-relaxed">
                  In a deployed application, we leverage the server to execute secure requests to the official Airtable API: <code className="font-mono text-purple-400">https://api.airtable.com/v0/{`{baseId}`}/{`{tableName}`}</code>. The API key remains safely hidden server-side, and synchronization keeps your main platform up to date automatically every 6 hours.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: TALENT & CLIENT REGISTRY */}
          {activeTab === 'registry' && (
            <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">Talent Registry Directory</h3>
                  <p className="text-[11px] text-white/40 font-mono">Monitor, verify, promote, or delete active platform users</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={downloadBackupJSON}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-amber-400 hover:text-amber-300 text-xs font-mono transition-all cursor-pointer"
                    title="Export Full Platform Database Backup JSON"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Backup JSON</span>
                  </button>
                  <Users className="h-6 w-6 text-amber-400" />
                </div>
              </div>

              {/* Filtering */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={registrySearch}
                  onChange={(e) => setRegistrySearch(e.target.value)}
                  placeholder="Search by talent name, location, or skill..."
                  className="flex-1 rounded-xl border border-white/10 bg-black px-3.5 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                />
                <select
                  value={registryTypeFilter}
                  onChange={(e) => setRegistryTypeFilter(e.target.value as any)}
                  className="rounded-xl border border-white/10 bg-black px-3.5 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-hidden"
                >
                  <option value="all">All Specialties</option>
                  <option value="actor">Actors Only</option>
                  <option value="model">Models Only</option>
                  <option value="both">Actor & Model</option>
                </select>
              </div>

              {/* Talent Table / Grid */}
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#080809]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/60 font-mono text-[10px] uppercase">
                      <th className="p-3">Talent Profile</th>
                      <th className="p-3">Type / Category</th>
                      <th className="p-3">Primary Contact</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredActors.slice(0, 10).map((actor) => (
                      <tr key={actor.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={actor.headshotUrl}
                              alt={actor.name}
                              className="h-8 w-8 rounded-full object-cover border border-white/20 shrink-0"
                            />
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="block font-bold text-white">{actor.name}</span>
                                {actor.isVerified && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" title="Verified Premium Talent" />
                                )}
                              </div>
                              <span className="block text-[10px] text-white/40">{actor.location}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-amber-500/10 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-md border border-amber-500/10 capitalize">
                            {actor.type === 'both' ? 'Actor & Model' : actor.type}
                          </span>
                        </td>
                        <td className="p-3 text-white/80">
                          <span className="block">{actor.contactEmail}</span>
                          <span className="block text-[10px] text-white/40 font-mono">{actor.phone}</span>
                        </td>
                        <td className="p-3 text-center">
                          {actor.id.startsWith('airtable_') ? (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Airtable Sync
                            </span>
                          ) : (
                            <span className="bg-purple-500/10 text-purple-400 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-500/20">
                              Direct Web
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                onUpdateActor({
                                  ...actor,
                                  isVerified: !actor.isVerified
                                });
                                showToast('success', `Toggled verification badge for ${actor.name}`);
                              }}
                              className="p-1 rounded-md text-white/60 hover:text-amber-400 hover:bg-white/5 transition-all cursor-pointer"
                              title="Toggle Verification Status"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteActorClick(actor.id, actor.name)}
                              className="p-1 rounded-md text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Archive Profile"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredActors.length === 0 && (
                  <div className="py-8 text-center text-white/40 space-y-1">
                    <AlertCircle className="h-8 w-8 text-white/20 mx-auto" />
                    <p className="text-xs font-mono font-bold">No matching talents found in database</p>
                  </div>
                )}
              </div>

              {filteredActors.length > 10 && (
                <div className="flex items-center justify-between text-xs font-mono text-white/40 pt-2 border-t border-white/5">
                  <span>Showing top 10 profiles of {filteredActors.length} matched talents...</span>
                  <button 
                    onClick={() => setRegistrySearch('')}
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    Clear Filter to View All
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: SUBMISSIONS & AUDITIONS MODERATION */}
          {activeTab === 'applications' && (
            <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">Submissions & Auditions Moderator</h3>
                  <p className="text-[11px] text-white/40 font-mono">Moderate active applicant pools, screen audio/video self-tapes, and update status</p>
                </div>
                <Briefcase className="h-6 w-6 text-amber-400" />
              </div>

              {/* Status Overview cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="block text-[10px] text-white/40 font-mono uppercase font-bold">Total Applied</span>
                  <span className="block text-lg font-bold text-white mt-0.5">{applications.length}</span>
                </div>
                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-center">
                  <span className="block text-[10px] text-amber-400 font-mono uppercase font-bold">Pending Review</span>
                  <span className="block text-lg font-bold text-amber-400 mt-0.5">
                    {applications.filter(a => a.status === 'pending').length}
                  </span>
                </div>
                <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-center">
                  <span className="block text-[10px] text-emerald-400 font-mono uppercase font-bold">Accepted</span>
                  <span className="block text-lg font-bold text-emerald-400 mt-0.5">
                    {applications.filter(a => a.status === 'accepted').length}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="block text-[10px] text-white/40 font-mono uppercase font-bold">Self-Tapes</span>
                  <span className="block text-lg font-bold text-purple-400 mt-0.5">
                    {applications.filter(a => a.selfTapeUrl || a.audioAuditionUrl).length}
                  </span>
                </div>
              </div>

              {/* Submissions List */}
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                    <AlertTriangle className="h-8 w-8 text-amber-500/60 mx-auto" />
                    <p className="text-xs font-mono font-bold text-white/80">No active casting submissions found in database</p>
                    <p className="text-[10px] text-white/40 max-w-sm mx-auto">
                      Switch to the "Actor" persona in the top navigation to submit new audition tape applications.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {applications.map((app) => {
                      const actor = actors.find(a => a.id === app.actorId);
                      const castingCall = castingCalls.find(c => c.id === app.castingCallId);
                      const role = castingCall?.roles.find(r => r.id === app.roleId);

                      if (!actor) return null;

                      return (
                        <div key={app.id} className="p-4 bg-[#080809] border border-white/5 rounded-2xl space-y-3.5 hover:border-white/10 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={actor.headshotUrl}
                                alt={actor.name}
                                className="h-10 w-10 rounded-xl object-cover border border-white/10"
                              />
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-xs font-bold text-white">{actor.name}</span>
                                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-sm text-white/60 font-mono">
                                    {actor.location}
                                  </span>
                                </div>
                                <span className="block text-[10px] text-white/40 font-mono mt-0.5">
                                  Applied to: <strong className="text-white/60">{castingCall?.title || 'Unknown Film'}</strong> &bull; Role: <strong className="text-amber-400">{role?.title || 'Role'}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                app.status === 'shortlisted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                app.status === 'declined' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              }`}>
                                {app.status}
                              </span>
                              <span className="text-[9px] text-white/30 font-mono">
                                {new Date(app.dateApplied).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Message and links */}
                          <div className="space-y-2">
                            {app.message && (
                              <p className="text-xs text-white/70 italic bg-white/5 p-2.5 rounded-xl border border-white/5">
                                "{app.message}"
                              </p>
                            )}

                            {/* Self tape play mockup */}
                            {(app.selfTapeUrl || app.audioAuditionUrl) && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {app.selfTapeUrl && (
                                  <button
                                    onClick={() => showToast('success', `Simulating playback of video self-tape audition from ${actor.name}...`)}
                                    className="inline-flex items-center space-x-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                                  >
                                    <Play className="h-3 w-3" />
                                    <span>Play Video Self-Tape</span>
                                  </button>
                                )}
                                {app.audioAuditionUrl && (
                                  <button
                                    onClick={() => showToast('success', `Simulating audio playback of monologue vocal sides from ${actor.name}...`)}
                                    className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                                  >
                                    <Play className="h-3 w-3" />
                                    <span>Play Monologue Audio</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Moderation Controls */}
                          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/5">
                            <span className="text-[10px] font-mono text-white/40 mr-auto">Moderate Application:</span>
                            
                            <button
                              onClick={() => {
                                if (onUpdateApplicationStatus) {
                                  onUpdateApplicationStatus(app.id, 'shortlisted');
                                } else {
                                  showToast('info', 'Status updated (Simulated)');
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                app.status === 'shortlisted' ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-amber-400 border-amber-400/30 hover:border-amber-400 hover:bg-amber-400/10'
                              }`}
                            >
                              Shortlist
                            </button>

                            <button
                              onClick={() => {
                                if (onUpdateApplicationStatus) {
                                  onUpdateApplicationStatus(app.id, 'accepted');
                                } else {
                                  showToast('info', 'Status updated (Simulated)');
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                app.status === 'accepted' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent text-emerald-400 border-emerald-400/30 hover:border-emerald-400 hover:bg-emerald-400/10'
                              }`}
                            >
                              Accept
                            </button>

                            <button
                              onClick={() => {
                                if (onUpdateApplicationStatus) {
                                  onUpdateApplicationStatus(app.id, 'declined');
                                } else {
                                  showToast('info', 'Status updated (Simulated)');
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                app.status === 'declined' ? 'bg-red-500 text-black border-red-500' : 'bg-transparent text-red-400 border-red-400/30 hover:border-red-400 hover:bg-red-400/10'
                              }`}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Security note */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-xs font-bold text-white font-mono uppercase">Vetting and Legal Escrow Contract</span>
                <p className="text-xs text-white/50 leading-relaxed mt-1">
                  Once an application is marked as <strong className="text-emerald-400">Accepted</strong>, an automated booking token is generated. The agency triggers a service contract linking the actor/model with the production client.
                </p>
              </div>

            </div>
          )}

          {/* TAB 5: CASTING CALLS DIRECTORY */}
          {activeTab === 'castings' && (
            <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">Casting Calls Directory</h3>
                  <p className="text-[11px] text-white/40 font-mono">Monitor, verify, or manage casting calls</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/60 font-mono text-[10px] uppercase">
                      <th className="p-3">Title</th>
                      <th className="p-3">Company</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {castingCalls.map((casting) => (
                      <tr key={casting.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <span className="block font-bold text-white">{casting.title}</span>
                          <span className="block text-[10px] text-white/40">{casting.type} • {casting.location}</span>
                        </td>
                        <td className="p-3 text-white/80">
                          <div className="flex items-center space-x-1.5">
                            <span className="block">{casting.company}</span>
                            {casting.isVerified && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" title="Verified Company" />
                            )}
                          </div>
                          <span className="block text-[10px] text-white/40 font-mono">{casting.director}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider border ${
                            casting.status === 'open' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {casting.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                if (onUpdateCastingCall) {
                                  onUpdateCastingCall({
                                    ...casting,
                                    isVerified: !casting.isVerified
                                  });
                                  showToast('success', `Toggled verification badge for ${casting.company}`);
                                }
                              }}
                              className="p-1 rounded-md text-white/60 hover:text-amber-400 hover:bg-white/5 transition-all cursor-pointer"
                              title="Toggle Verification Status"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {castingCalls.length === 0 && (
                  <div className="py-8 text-center text-white/40 space-y-1">
                    <AlertCircle className="h-8 w-8 text-white/20 mx-auto" />
                    <p className="text-xs font-mono font-bold">No casting calls found in database</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: WEB HOSTING & DOMAIN DIRECTIVE */}
          {activeTab === 'hosting' && (
            <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">Web Hosting & Domain Registrar Manual</h3>
                  <p className="text-[11px] text-white/40 font-mono">Link this React app to your paid domain purchased from Ethio Telecom (.et / .com.et)</p>
                </div>
                <Globe className="h-6 w-6 text-amber-400" />
              </div>

              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 space-y-2">
                <span className="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-wider">Ethio Telecom DNS & Registrar Profile</span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="block text-sm font-bold text-white font-mono">yournewdomain.et / addisfilmhub.com.et</span>
                    <span className="block text-[10px] text-white/40 font-mono">Ethio Telecom Registered Namespace (.ET)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">Ready for Ethio Telecom Domain Mapping</span>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Configuration Wizard */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Deployment and Launch Procedures</h4>
                
                <div className="space-y-3.5">
                  
                  {/* Step 1 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-amber-400 shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="space-y-1">
                      <span className="block text-xs font-bold text-white uppercase">Compile the Production Assets</span>
                      <p className="text-xs text-white/50 leading-relaxed">
                        To build the final ready-to-run assets, run the build command. This compiles your TypeScript, bundles your Tailwind CSS classes, and outputs a highly optimized static directory containing `index.html` and bundled assets in <code className="text-amber-400 font-mono">/dist</code>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-amber-400 shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="space-y-1">
                      <span className="block text-xs font-bold text-white uppercase">Upload to your Paid Hosting Server</span>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Since you have already purchased hosting, log in to your provider's hosting manager (such as cPanel, Plesk, or GoDaddy Admin), navigate to your **File Manager**, and upload the complete contents of the compiled <code className="text-amber-400 font-mono">/dist</code> folder directly into your root directory (typically named <code className="text-purple-400 font-mono">public_html</code> or <code className="text-purple-400 font-mono">www/</code>).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-amber-400 shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="space-y-1">
                      <span className="block text-xs font-bold text-white uppercase">Configure Domain Name CNAME & A Records</span>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Log in to your .ET domain registrar (often Ethio Telecom or local reseller). Navigate to DNS Zone File Settings and set:
                      </p>
                      <div className="bg-black p-3.5 rounded-xl border border-white/10 space-y-2 mt-1.5 font-mono text-[11px] text-white/80">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-white/40">Record Type</span>
                          <span className="text-white/40">Host / Name</span>
                          <span className="text-white/40">Points To / Value</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-400">A Record</span>
                          <span className="text-white font-bold">@</span>
                          <span className="text-emerald-400 font-bold">your_server_ip_address</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-400">CNAME</span>
                          <span className="text-white font-bold">www</span>
                          <span className="text-emerald-400 font-bold">addisfilmhub.com.et</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Status checklist */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <span className="block text-xs font-bold text-white font-mono uppercase">Pre-Launch Verification Checklist</span>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2.5 text-xs text-white/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={nameserverCheck}
                      onChange={(e) => setNameserverCheck(e.target.checked)}
                      className="rounded bg-black border-white/15 text-amber-500 focus:ring-0"
                    />
                    <span>Nameserver points correctly to your web host DNS zone</span>
                  </label>
                  <label className="flex items-center space-x-2.5 text-xs text-white/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={domainStatus === 'configured'}
                      onChange={(e) => setDomainStatus(e.target.checked ? 'configured' : 'pending')}
                      className="rounded bg-black border-white/15 text-amber-500 focus:ring-0"
                    />
                    <span>Let's Encrypt Free SSL Certificate activated for HTTPS</span>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: PARTNERS & NEWS HUB */}
          {activeTab === 'partners_news' && (
            <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-6 space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1 text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                    <Sparkles className="h-3 w-3" />
                    <span>Dynamic Client-Facing Content</span>
                  </div>
                  <h3 className="text-lg font-black text-white font-display uppercase tracking-wider mt-1 font-mono">Partners & News Command Center</h3>
                  <p className="text-xs text-white/50">Manage broadcast partners and update the interactive Casting news & advice feed instantly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* PARTNERS SECTION (COL SPAN 5) */}
                <div className="xl:col-span-5 space-y-6">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center space-x-2 text-white border-b border-white/5 pb-2">
                      <Globe className="h-4 w-4 text-purple-400" />
                      <span className="text-xs font-bold uppercase font-mono tracking-wider">Add Partner Studio</span>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!partnerName.trim()) {
                        showToast('info', 'Please enter a partner name.');
                        return;
                      }
                      const newPartner: Partner = {
                        id: `part_gen_${Date.now()}`,
                        name: partnerName,
                        iconName: partnerIcon
                      };
                      onAddOrUpdatePartner(newPartner);
                      setPartnerName('');
                      showToast('success', `Partner "${newPartner.name}" added successfully!`);
                    }} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono text-white/40 uppercase font-bold mb-1">Brand Name</label>
                        <input
                          type="text"
                          value={partnerName}
                          onChange={(e) => setPartnerName(e.target.value)}
                          placeholder="e.g. KANA TV"
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-white/40 uppercase font-bold mb-1">Visual Symbol Icon</label>
                        <select
                          value={partnerIcon}
                          onChange={(e) => setPartnerIcon(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-mono"
                        >
                          <option value="Film">Film Reel (Cinema)</option>
                          <option value="Globe">Globe / Web (Broadcast)</option>
                          <option value="Award">Award Badge (Studio)</option>
                          <option value="TrendingUp">Trending Up (Agency)</option>
                          <option value="Shield">Shield (Secure Network)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs uppercase font-bold rounded-xl transition-all font-mono tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg hover:shadow-purple-600/15"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Publish Partner</span>
                      </button>
                    </form>
                  </div>

                  {/* Partners list */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-mono text-white/40 uppercase font-bold px-1">Current Active Partners ({partners.length})</span>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-2 divide-y divide-white/5">
                      {partners.length === 0 ? (
                        <div className="py-6 text-center text-xs text-white/30 font-mono">No partner studios configured yet.</div>
                      ) : (
                        partners.map(p => {
                          const getPartnerIcon = (iconName: string) => {
                            switch (iconName) {
                              case 'Film': return <Film className="h-4 w-4 text-purple-400" />;
                              case 'Globe': return <Globe className="h-4 w-4 text-purple-400" />;
                              case 'Award': return <Award className="h-4 w-4 text-purple-400" />;
                              case 'TrendingUp': return <TrendingUp className="h-4 w-4 text-purple-400" />;
                              case 'Shield': return <Shield className="h-4 w-4 text-purple-400" />;
                              default: return <Film className="h-4 w-4 text-purple-400" />;
                            }
                          };
                          return (
                            <div key={p.id} className="flex items-center justify-between p-3.5">
                              <div className="flex items-center space-x-2.5">
                                <div className="h-8 w-8 rounded-lg bg-purple-500/5 border border-purple-500/10 flex items-center justify-center">
                                  {getPartnerIcon(p.iconName)}
                                </div>
                                <span className="text-xs font-bold text-white font-mono">{p.name}</span>
                              </div>
                              <button
                                onClick={() => {
                                  onDeletePartner(p.id);
                                  showToast('success', `Partner brand deleted successfully!`);
                                }}
                                className="text-white/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer animate-fade-in"
                                title="Remove Partner"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* NEWS & ARTICLES SECTION (COL SPAN 7) */}
                <div className="xl:col-span-7 space-y-6">
                  
                  {/* Toggle Form / Trigger Button */}
                  {!showNewsForm ? (
                    <button
                      onClick={() => {
                        setEditingArticleId(null);
                        setNewsTitle('');
                        setNewsCategory('Industry Update');
                        setNewsAuthor('');
                        setNewsImageUrl('');
                        setNewsExcerpt('');
                        setNewsContent('');
                        setShowNewsForm(true);
                      }}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-2 text-white/50 hover:text-white transition-all cursor-pointer"
                    >
                      <Plus className="h-6 w-6 text-purple-400" />
                      <span className="text-xs font-bold uppercase font-mono tracking-wider">Publish New Audition Tip or News Article</span>
                      <span className="text-[10px] text-white/30">Generate fresh content for landing page visitors</span>
                    </button>
                  ) : (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center space-x-2 text-white">
                          <FileText className="h-4 w-4 text-purple-400" />
                          <span className="text-xs font-bold uppercase font-mono tracking-wider">
                            {editingArticleId ? 'Edit News Article' : 'Write News Article'}
                          </span>
                        </div>
                        <button 
                          onClick={() => setShowNewsForm(false)}
                          className="text-white/40 hover:text-white p-1 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newsTitle.trim() || !newsContent.trim() || !newsAuthor.trim()) {
                          showToast('info', 'Title, Author, and Content are required fields.');
                          return;
                        }
                        const article: NewsArticle = {
                          id: editingArticleId || `news_gen_${Date.now()}`,
                          title: newsTitle,
                          category: newsCategory,
                          author: newsAuthor,
                          imageUrl: newsImageUrl.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
                          excerpt: newsExcerpt.trim() || newsContent.substring(0, 100) + '...',
                          content: newsContent,
                          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        };
                        onAddOrUpdateNews(article);
                        
                        // Reset Form
                        setEditingArticleId(null);
                        setNewsTitle('');
                        setNewsCategory('Industry Update');
                        setNewsAuthor('');
                        setNewsImageUrl('');
                        setNewsExcerpt('');
                        setNewsContent('');
                        setShowNewsForm(false);
                        showToast('success', editingArticleId ? 'Article updated successfully!' : 'News article published!');
                      }} className="space-y-4">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-white/40 uppercase font-bold mb-1">Article Title</label>
                            <input
                              type="text"
                              value={newsTitle}
                              onChange={(e) => setNewsTitle(e.target.value)}
                              placeholder="e.g. Major Production House Audition"
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-white/40 uppercase font-bold mb-1">Author Name</label>
                            <input
                              type="text"
                              value={newsAuthor}
                              onChange={(e) => setNewsAuthor(e.target.value)}
                              placeholder="e.g. Dawit Abebe"
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-white/40 uppercase font-bold mb-1">Category</label>
                            <select
                              value={newsCategory}
                              onChange={(e) => setNewsCategory(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-mono"
                            >
                              <option value="Industry Update">Industry Update</option>
                              <option value="Audition Advice">Audition Advice</option>
                              <option value="Platform News">Platform News</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-white/40 uppercase font-bold mb-1">Cover Image URL</label>
                            <input
                              type="text"
                              value={newsImageUrl}
                              onChange={(e) => setNewsImageUrl(e.target.value)}
                              placeholder="Unsplash image URL"
                              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                            />
                          </div>
                        </div>

                        {/* Image URL presets */}
                        <div className="space-y-1">
                          <span className="block text-[9px] font-mono text-white/30 uppercase">Cover Image Presets (Click to Auto-fill)</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setNewsImageUrl('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80')}
                              className="text-[9px] font-mono bg-white/5 hover:bg-purple-600/20 hover:text-purple-300 border border-white/5 rounded px-2 py-0.5 transition-all text-white/50 cursor-pointer"
                            >
                              🎬 Cinema / Filming
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewsImageUrl('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80')}
                              className="text-[9px] font-mono bg-white/5 hover:bg-purple-600/20 hover:text-purple-300 border border-white/5 rounded px-2 py-0.5 transition-all text-white/50 cursor-pointer"
                            >
                              🎙️ Studio Microphone
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewsImageUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80')}
                              className="text-[9px] font-mono bg-white/5 hover:bg-purple-600/20 hover:text-purple-300 border border-white/5 rounded px-2 py-0.5 transition-all text-white/50 cursor-pointer"
                            >
                              📱 Audition Advice
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-white/40 uppercase font-bold mb-1">Short Excerpt (Teaser)</label>
                          <input
                            type="text"
                            value={newsExcerpt}
                            onChange={(e) => setNewsExcerpt(e.target.value)}
                            placeholder="A 1-sentence quick summary to capture interest..."
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-white/40 uppercase font-bold mb-1">Full Article Content</label>
                          <textarea
                            value={newsContent}
                            onChange={(e) => setNewsContent(e.target.value)}
                            rows={5}
                            placeholder="Write the full news announcement or educational tips here..."
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-sans leading-relaxed"
                          />
                        </div>

                        <div className="flex items-center space-x-2 pt-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingArticleId(null);
                              setNewsTitle('');
                              setNewsCategory('Industry Update');
                              setNewsAuthor('');
                              setNewsImageUrl('');
                              setNewsExcerpt('');
                              setNewsContent('');
                              setShowNewsForm(false);
                            }}
                            className="px-4 py-2 border border-white/10 text-white/60 hover:text-white text-xs uppercase font-bold rounded-xl transition-all font-mono cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs uppercase font-bold rounded-xl transition-all font-mono tracking-wider cursor-pointer shadow-lg hover:shadow-purple-600/20"
                          >
                            {editingArticleId ? 'Save Changes' : 'Publish Article'}
                          </button>
                        </div>

                      </form>
                    </div>
                  )}

                  {/* News list */}
                  <div className="space-y-3">
                    <span className="block text-[10px] font-mono text-white/40 uppercase font-bold px-1">Currently Published Articles ({newsArticles.length})</span>
                    <div className="space-y-3">
                      {newsArticles.length === 0 ? (
                        <div className="bg-black/40 border border-white/5 py-12 text-center rounded-2xl text-xs text-white/30 font-mono">
                          No news articles configured yet.
                        </div>
                      ) : (
                        newsArticles.map(art => (
                          <div key={art.id} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-500/20 transition-all">
                            <div className="flex items-start space-x-3.5">
                              <div className="h-14 w-14 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                                <img
                                  src={art.imageUrl}
                                  alt={art.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/5 ${
                                    art.category === 'Industry Update' 
                                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/10' 
                                      : art.category === 'Audition Advice' 
                                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/10' 
                                      : 'bg-zinc-800/20 text-zinc-400 border-zinc-700/10'
                                  }`}>
                                    {art.category}
                                  </span>
                                  <span className="text-[10px] text-white/30 font-mono">By {art.author}</span>
                                </div>
                                <h4 className="text-xs font-bold text-white leading-snug">{art.title}</h4>
                                <p className="text-[11px] text-white/50 line-clamp-1">{art.excerpt}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                              <button
                                onClick={() => {
                                  handleEditArticle(art);
                                }}
                                className="px-3 py-1.5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 text-white/60 hover:text-purple-300 text-[10px] font-bold font-mono rounded-lg transition-all cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteNews(art.id);
                                  showToast('success', 'Article deleted successfully!');
                                }}
                                className="p-1.5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 text-white/40 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                                title="Delete Article"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
