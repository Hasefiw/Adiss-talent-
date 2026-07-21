import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ActorPortal from './components/ActorPortal';
import ProducerPortal from './components/ProducerPortal';
import ProfileModal from './components/ProfileModal';
import CreateCastingModal from './components/CreateCastingModal';
import SignUpModal from './components/SignUpModal';
import AdminPortal from './components/AdminPortal';
import VisitorLanding from './components/VisitorLanding';
import { DEFAULT_ACTORS, DEFAULT_CASTING_CALLS } from './data/seedData';
import { Actor, CastingCall, Application, PortalType, Partner, NewsArticle, PaymentRequest } from './types';
import { User, Shield, Sparkles, Plus, CheckCircle, Database } from 'lucide-react';

const DEFAULT_PARTNERS: Partner[] = [
  { id: 'part-1', name: 'KANA TV', iconName: 'Film' },
  { id: 'part-2', name: 'EBS TELEVISION', iconName: 'Globe' },
  { id: 'part-3', name: 'SEWASEW MULTIMEDIA', iconName: 'Award' },
  { id: 'part-4', name: 'SODERE FILMS', iconName: 'TrendingUp' },
  { id: 'part-5', name: 'ADDIS CINEMA CO.', iconName: 'Shield' }
];

const DEFAULT_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'art-1',
    title: 'Sewasew Multimedia Announces 15 New Drama Acquisitions for 2026',
    category: 'Industry Update',
    date: 'July 18, 2026',
    author: 'Elshadai Girma (Addis Film Board)',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600',
    excerpt: 'The leading Ethiopian streaming and multimedia platform announces a landmark 120 Million ETB investment budget for original, local serialized cinema and dramas.',
    content: 'Sewasew Multimedia has officially signed contracts for 15 new drama and screenplay productions, slated to begin filming in late 2026 across Addis Ababa, Hawassa, and Gonder. According to platform directors, this expansion will require over 200 speaking roles and countless extras. "Our mission is to elevate Ethiopian storytelling to an international standard," stated Elshadai Girma. Actors are highly encouraged to keep their physical portfolio composite cards, headshots, and voice reels up-to-date in digital casting registries like Addis Talent. Shortlisted casting calls are expected to go live next month.'
  },
  {
    id: 'art-2',
    title: 'The Art of the Amharic Monologue: Sincerity Over Loudness',
    category: 'Audition Advice',
    date: 'June 29, 2026',
    author: 'Dawit Yohannes (National Theatre)',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
    excerpt: 'Local casting directors are shifting away from traditional theatrical projection toward intimate, screen-friendly naturalism. Here is what you need to adjust.',
    content: 'For decades, Ethiopian stage actors trained at the National Theatre and Addis Ababa University have leaned heavily on voice projection and grand gestures designed to reach the back row of a amphitheatre. However, with the surge of high-definition cinematic serials and international co-productions, casting directors are requesting "micro-acting". Dawit Yohannes explains: "The camera captures everything—even a slight swallow or eye movement. When you record your self-tapes or deliver an audition monologue, focus on authentic internal feeling rather than external volume. Let the microphone do the work. Speak as if talking to a friend sitting just two feet away from you."'
  },
  {
    id: 'art-3',
    title: 'Addis Cinema Cooperative Sets Up New Escrow Contract Safeguards',
    category: 'Platform News',
    date: 'May 14, 2026',
    author: 'Platform Safety Editorial',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600',
    excerpt: 'Protecting independent actors and small-scale directors from payment delays and contract disputes with localized deposit and escrow pipelines.',
    content: 'A major pain point in the local entertainment landscape has been the issue of payment security. Actors often complete weeks of rehearsals and shooting only to face months of delay, while directors face sudden cast drop-outs. To tackle this, the Addis Cinema Cooperative, in partnership with local fintech hubs, has endorsed digital escrow standards. Platform registries like Addis Talent now offer a smart-contract or clear-deposit casting flow. Producers deposit the talent compensation before production begins. Once the actor delivers their final performance, funds are released safely, building immense professional trust on both sides.'
  }
];

export default function App() {
  const [portal, setPortal] = useState<PortalType>('visitor');
  
  // Base State with LocalStorage Caching
  const [actors, setActors] = useState<Actor[]>([]);
  const [castingCalls, setCastingCalls] = useState<CastingCall[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [shortlistedActorIds, setShortlistedActorIds] = useState<string[]>([]);
  const [activeActorId, setActiveActorId] = useState<string>('act_1');
  const [isActorLoggedIn, setIsActorLoggedIn] = useState<boolean>(() => {
    const cached = localStorage.getItem('cast_platform_actor_logged_in');
    return cached === 'true';
  });
  const [isProducerLoggedIn, setIsProducerLoggedIn] = useState<boolean>(() => {
    const cached = localStorage.getItem('cast_platform_producer_logged_in');
    return cached === 'true';
  });

  // Owner Mode State
  const [isOwner, setIsOwner] = useState<boolean>(() => {
    const cached = localStorage.getItem('cast_platform_is_owner');
    if (cached === 'true') return true;
    
    const search = window.location.search.toLowerCase();
    if (search.includes('owner') || search.includes('admin') || search.includes('hasefiw')) {
      localStorage.setItem('cast_platform_is_owner', 'true');
      return true;
    }
    return false;
  });

  const [isProducerPremium, setIsProducerPremium] = useState<boolean>(() => {
    const cached = localStorage.getItem('cast_platform_producer_premium');
    return cached === 'true';
  });

  const handleUnlockProducerPremium = () => {
    setIsProducerPremium(true);
    localStorage.setItem('cast_platform_producer_premium', 'true');
    showToast('success', '1,200 ETB paid successfully! Recruiter Plan is now fully active.');
  };

  const handleToggleOwner = () => {
    setIsOwner((prev) => {
      const next = !prev;
      localStorage.setItem('cast_platform_is_owner', next ? 'true' : 'false');
      showToast('success', next ? 'Owner Mode Unlocked! Admin controls are now visible.' : 'Owner Mode Locked. Admin controls are now hidden.');
      if (!next && portal === 'admin') {
        setPortal('visitor');
      }
      return next;
    });
  };

  // Modals & View States
  const [selectedActorProfile, setSelectedActorProfile] = useState<Actor | null>(null);
  const [isCreateCastingOpen, setIsCreateCastingOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [signUpDefaultType, setSignUpDefaultType] = useState<'talent' | 'producer'>('talent');
  const [activeProducerName, setActiveProducerName] = useState('Claire Henderson');
  const [activeProducerCompany, setActiveProducerCompany] = useState('Nollywood Prime Studios');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const handleProducerLogout = () => {
    setIsProducerLoggedIn(false);
    localStorage.setItem('cast_platform_producer_logged_in', 'false');
    setActiveProducerName('Claire Henderson');
    setActiveProducerCompany('Nollywood Prime Studios');
    localStorage.removeItem('cast_platform_producer_name');
    localStorage.removeItem('cast_platform_producer_company');
    showToast('success', 'Logged out of Recruiter Workspace successfully.');
  };

  // Load from Database APIs or fall back to local storage
  useEffect(() => {
    const cachedProducerName = localStorage.getItem('cast_platform_producer_name');
    const cachedProducerCompany = localStorage.getItem('cast_platform_producer_company');
    const cachedShortlist = localStorage.getItem('cast_platform_shortlist');
    const cachedActiveActor = localStorage.getItem('cast_platform_active_actor');

    if (cachedProducerName) {
      setActiveProducerName(cachedProducerName);
    }
    if (cachedProducerCompany) {
      setActiveProducerCompany(cachedProducerCompany);
    }

    if (cachedShortlist) {
      setShortlistedActorIds(JSON.parse(cachedShortlist));
    } else {
      setShortlistedActorIds(['act_1', 'act_4']); // Pre-seed two in shortlist
      localStorage.setItem('cast_platform_shortlist', JSON.stringify(['act_1', 'act_4']));
    }

    if (cachedActiveActor) {
      setActiveActorId(cachedActiveActor);
    } else {
      setActiveActorId('act_1');
      localStorage.setItem('cast_platform_active_actor', 'act_1');
    }

    async function loadFromDB() {
      let loadedFromDB = false;
      try {
        const [actorsRes, callsRes, appsRes, partnersRes, newsRes, payRes] = await Promise.all([
          fetch('/api/actors'),
          fetch('/api/casting-calls'),
          fetch('/api/applications'),
          fetch('/api/partners'),
          fetch('/api/news'),
          fetch('/api/payment-requests')
        ]);

        if (actorsRes.ok && callsRes.ok && appsRes.ok && partnersRes.ok && newsRes.ok) {
          const fetchedActors = await actorsRes.json();
          const fetchedCalls = await callsRes.json();
          const fetchedApps = await appsRes.json();
          const fetchedPartners = await partnersRes.json();
          const fetchedNews = await newsRes.json();
          const fetchedPay = payRes.ok ? await payRes.json() : [];

          setActors(fetchedActors);
          setCastingCalls(fetchedCalls);
          setApplications(fetchedApps);
          setPartners(fetchedPartners.length > 0 ? fetchedPartners : DEFAULT_PARTNERS);
          setNewsArticles(fetchedNews.length > 0 ? fetchedNews : DEFAULT_NEWS_ARTICLES);
          setPaymentRequests(fetchedPay);

          localStorage.setItem('cast_platform_actors', JSON.stringify(fetchedActors));
          localStorage.setItem('cast_platform_calls', JSON.stringify(fetchedCalls));
          localStorage.setItem('cast_platform_apps', JSON.stringify(fetchedApps));
          localStorage.setItem('cast_platform_partners', JSON.stringify(fetchedPartners.length > 0 ? fetchedPartners : DEFAULT_PARTNERS));
          localStorage.setItem('cast_platform_news', JSON.stringify(fetchedNews.length > 0 ? fetchedNews : DEFAULT_NEWS_ARTICLES));
          localStorage.setItem('cast_platform_payments', JSON.stringify(fetchedPay));
          loadedFromDB = true;
          return;
        }
      } catch (err) {
        console.warn("PostgreSQL backend unavailable, using local cache fallback:", err);
      }

      if (!loadedFromDB) {
        // Local storage fallback if API is not responding
        const cachedActors = localStorage.getItem('cast_platform_actors');
        const cachedCalls = localStorage.getItem('cast_platform_calls');
        const cachedApps = localStorage.getItem('cast_platform_apps');
        const cachedPartners = localStorage.getItem('cast_platform_partners');
        const cachedNews = localStorage.getItem('cast_platform_news');

        if (cachedActors) {
          setActors(JSON.parse(cachedActors));
        } else {
          setActors(DEFAULT_ACTORS);
          localStorage.setItem('cast_platform_actors', JSON.stringify(DEFAULT_ACTORS));
        }

        if (cachedCalls) {
          setCastingCalls(JSON.parse(cachedCalls));
        } else {
          setCastingCalls(DEFAULT_CASTING_CALLS);
          localStorage.setItem('cast_platform_calls', JSON.stringify(DEFAULT_CASTING_CALLS));
        }

        if (cachedPartners) {
          setPartners(JSON.parse(cachedPartners));
        } else {
          setPartners(DEFAULT_PARTNERS);
          localStorage.setItem('cast_platform_partners', JSON.stringify(DEFAULT_PARTNERS));
        }

        if (cachedNews) {
          setNewsArticles(JSON.parse(cachedNews));
        } else {
          setNewsArticles(DEFAULT_NEWS_ARTICLES);
          localStorage.setItem('cast_platform_news', JSON.stringify(DEFAULT_NEWS_ARTICLES));
        }

        if (cachedApps) {
          setApplications(JSON.parse(cachedApps));
        } else {
          const initialApps: Application[] = [
            {
              id: 'app_1',
              castingCallId: 'call_1',
              roleId: 'role_1_1',
              actorId: 'act_1',
              dateApplied: '2026-07-12T10:00:00Z',
              status: 'pending',
              message: 'Hello Claire! I am highly interested in the role of Chidi - Master Hacker. I have similar project experience and feel this fit is perfect.'
            },
            {
              id: 'app_2',
              castingCallId: 'call_2',
              roleId: 'role_2_1',
              actorId: 'act_4',
              dateApplied: '2026-07-15T14:30:00Z',
              status: 'shortlisted',
              message: 'Hi Pierre, I would love to join the Savanna Campaign. Ready to travel and speak fluent Swahili as requested.'
            },
            {
              id: 'app_3',
              castingCallId: 'call_3',
              roleId: 'role_3_1',
              actorId: 'act_8',
              dateApplied: '2026-07-16T09:00:00Z',
              status: 'invited',
              message: 'I am extremely passionate about this high-action sci-fi project. Ready for training.'
            }
          ];
          setApplications(initialApps);
          localStorage.setItem('cast_platform_apps', JSON.stringify(initialApps));
        }
      }
    }

    loadFromDB();
  }, []);

  // Sync back to local storage and PostgreSQL Database on changes
  const saveActors = async (newActors: Actor[]) => {
    setActors(newActors);
    localStorage.setItem('cast_platform_actors', JSON.stringify(newActors));
    try {
      // Sync in background to not block UI
      for (const actor of newActors) {
        fetch('/api/actors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actor)
        }).catch(err => console.warn("Failed to sync actor profile to SQL:", err));
      }
    } catch (e) {}
  };

  const saveCastingCalls = async (newCalls: CastingCall[]) => {
    setCastingCalls(newCalls);
    localStorage.setItem('cast_platform_calls', JSON.stringify(newCalls));
    try {
      for (const call of newCalls) {
        fetch('/api/casting-calls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(call)
        }).catch(err => console.warn("Failed to sync casting call to SQL:", err));
      }
    } catch (e) {}
  };

  const saveApplications = async (newApps: Application[]) => {
    setApplications(newApps);
    localStorage.setItem('cast_platform_apps', JSON.stringify(newApps));
    try {
      for (const app of newApps) {
        fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(app)
        }).catch(err => console.warn("Failed to sync application to SQL:", err));
      }
    } catch (e) {}
  };

  const handleAddOrUpdatePartner = async (partner: Partner) => {
    const updated = partners.some(p => p.id === partner.id)
      ? partners.map(p => p.id === partner.id ? partner : p)
      : [...partners, partner];
    
    setPartners(updated);
    localStorage.setItem('cast_platform_partners', JSON.stringify(updated));

    try {
      await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partner)
      });
      showToast('success', `Partner "${partner.name}" saved successfully to SQL.`);
    } catch (err) {
      console.warn("Offline or db issue, partner saved locally:", err);
      showToast('info', `Partner "${partner.name}" saved locally.`);
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    const partnerName = partners.find(p => p.id === partnerId)?.name || 'Partner';
    const updated = partners.filter(p => p.id !== partnerId);
    setPartners(updated);
    localStorage.setItem('cast_platform_partners', JSON.stringify(updated));

    try {
      await fetch(`/api/partners/${partnerId}`, {
        method: 'DELETE'
      });
      showToast('success', `Partner "${partnerName}" deleted from SQL.`);
    } catch (err) {
      console.warn("Offline or db issue, partner deleted locally:", err);
      showToast('info', `Partner "${partnerName}" deleted locally.`);
    }
  };

  const handleAddOrUpdateNews = async (article: NewsArticle) => {
    const updated = newsArticles.some(a => a.id === article.id)
      ? newsArticles.map(a => a.id === article.id ? article : a)
      : [...newsArticles, article];
    
    setNewsArticles(updated);
    localStorage.setItem('cast_platform_news', JSON.stringify(updated));

    try {
      await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      showToast('success', `Article "${article.title}" saved successfully to SQL.`);
    } catch (err) {
      console.warn("Offline or db issue, news saved locally:", err);
      showToast('info', `Article "${article.title}" saved locally.`);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    const articleTitle = newsArticles.find(a => a.id === newsId)?.title || 'Article';
    const updated = newsArticles.filter(a => a.id !== newsId);
    setNewsArticles(updated);
    localStorage.setItem('cast_platform_news', JSON.stringify(updated));

    try {
      await fetch(`/api/news/${newsId}`, {
        method: 'DELETE'
      });
      showToast('success', `Article deleted from SQL.`);
    } catch (err) {
      console.warn("Offline or db issue, news deleted locally:", err);
      showToast('info', `Article deleted locally.`);
    }
  };

  const saveShortlist = (newShortlist: string[]) => {
    setShortlistedActorIds(newShortlist);
    localStorage.setItem('cast_platform_shortlist', JSON.stringify(newShortlist));
  };


  const handleSelectActiveActor = (id: string) => {
    setActiveActorId(id);
    localStorage.setItem('cast_platform_active_actor', id);
    showToast('info', `Switched active login to ${actors.find(a => a.id === id)?.name}`);
  };

  // Toast notifications
  const showToast = (type: 'success' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Toggle Shortlist
  const handleToggleShortlist = (actorId: string) => {
    const isShortlisted = shortlistedActorIds.includes(actorId);
    let updated: string[];
    if (isShortlisted) {
      updated = shortlistedActorIds.filter((id) => id !== actorId);
      showToast('info', `Removed from shortlisted talents`);
    } else {
      updated = [...shortlistedActorIds, actorId];
      showToast('success', `Added to shortlisted talents!`);
    }
    saveShortlist(updated);
  };

  // Payment Requests Handlers
  const handleSubmitPaymentRequest = async (data: {
    userName: string;
    userEmail: string;
    userPhone: string;
    userType: 'actor' | 'producer';
    planName: string;
    amount: number;
    transactionRef: string;
  }) => {
    const newReq: PaymentRequest = {
      id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userName: data.userName,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
      userType: data.userType,
      planName: data.planName,
      amount: data.amount,
      transactionRef: data.transactionRef,
      status: 'pending',
      dateSubmitted: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      });
      if (res.ok) {
        const saved = await res.json();
        setPaymentRequests(prev => [saved, ...prev]);
      } else {
        setPaymentRequests(prev => [newReq, ...prev]);
      }
    } catch (err) {
      console.error("Error submitting payment request:", err);
      setPaymentRequests(prev => [newReq, ...prev]);
    }
    showToast('success', `Payment request submitted! Telebirr Ref: ${data.transactionRef}. Awaiting owner approval on +251911381970.`);
  };

  const handleUpdatePaymentRequestStatus = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await fetch(`/api/payment-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        const updatedReq = await res.json();
        setPaymentRequests(prev => prev.map(r => r.id === id ? updatedReq : r));
      } else {
        setPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status, ownerNotes: notes } : r));
      }
    } catch (err) {
      console.error("Error updating payment request status:", err);
      setPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status, ownerNotes: notes } : r));
    }

    const targetReq = paymentRequests.find(r => r.id === id);
    if (status === 'approved' && targetReq) {
      if (targetReq.userType === 'actor') {
        const matchingActor = actors.find(a => a.phone === targetReq.userPhone || a.contactEmail === targetReq.userEmail);
        if (matchingActor) {
          const updatedActor = { ...matchingActor, isVerified: true, isPremium: true };
          saveActors(actors.map(a => a.id === matchingActor.id ? updatedActor : a));
        }
      } else if (targetReq.userType === 'producer') {
        setIsProducerPremium(true);
        localStorage.setItem('cast_platform_producer_premium', 'true');
      }
      showToast('success', `Approved payment for ${targetReq.userName}! Account features unlocked.`);
    } else {
      showToast('info', `Payment request rejected.`);
    }
  };

  // Audition Invitation Handler
  const handleSendAuditionInvite = async (actorId: string, castingCallId: string, roleTitle: string, message: string) => {
    const existingIndex = applications.findIndex(a => a.actorId === actorId && a.castingCallId === castingCallId);
    
    if (existingIndex >= 0) {
      const updated = [...applications];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status: 'invited',
        message: message || updated[existingIndex].message
      };
      saveApplications(updated);
    } else {
      const newApp: Application = {
        id: `app_inv_${Date.now()}`,
        castingCallId: castingCallId || (castingCalls[0]?.id || 'call_1'),
        roleId: roleTitle || 'Lead Role',
        actorId,
        status: 'invited',
        message,
        dateApplied: new Date().toISOString()
      };
      saveApplications([...applications, newApp]);
    }

    const targetActor = actors.find(a => a.id === actorId);
    showToast('success', `Audition Invitation sent to ${targetActor?.name || 'Talent'}!`);
  };

  // Submit new actor registration/edit
  const handleUpdateActorProfile = (updatedActor: Actor) => {
    const updated = actors.map((act) => (act.id === updatedActor.id ? updatedActor : act));
    saveActors(updated);
    showToast('success', 'Talent composite card updated successfully!');
  };

  // Create new Actor Profile
  const handleRegisterNewActor = () => {
    const newId = `act_gen_${Date.now()}`;
    const newActor: Actor = {
      id: newId,
      name: 'New Registered Talent',
      type: 'actor',
      gender: 'non-binary',
      age: 25,
      heightCm: 175,
      eyeColor: 'brown',
      hairColor: 'brown',
      hairLength: 'medium',
      ethnicity: 'Unspecified',
      location: 'Los Angeles, CA',
      bio: 'Click "Edit Comp Card & Resume" to complete your modeling or dramatic acting portfolio!',
      skills: ['Dramatic Acting', 'Improv'],
      experience: [],
      headshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80', // Default fallback
      contactEmail: 'talent@example.com',
      phone: '+1 (555) 000-0000',
      createdAt: new Date().toISOString()
    };

    saveActors([...actors, newActor]);
    setActiveActorId(newId);
    localStorage.setItem('cast_platform_active_actor', newId);
    setIsActorLoggedIn(true);
    localStorage.setItem('cast_platform_actor_logged_in', 'true');
    showToast('success', 'Created a new blank talent profile!');
  };

  // Sign up Talent (Join for Free)
  const handleSignUpTalent = (talentData: Omit<Actor, 'id' | 'createdAt' | 'experience'>) => {
    const newId = `act_gen_${Date.now()}`;
    const newActor: Actor = {
      ...talentData,
      id: newId,
      experience: [],
      createdAt: new Date().toISOString()
    };

    saveActors([...actors, newActor]);
    setActiveActorId(newId);
    localStorage.setItem('cast_platform_active_actor', newId);
    setIsActorLoggedIn(true);
    localStorage.setItem('cast_platform_actor_logged_in', 'true');
    
    if (talentData.contactEmail.toLowerCase().trim() === 'hasefiw@gmail.com') {
      setIsOwner(true);
      localStorage.setItem('cast_platform_is_owner', 'true');
      showToast('success', 'Owner account detected! Mode active.');
    }
    
    setPortal('actor');
    showToast('success', `Welcome to Addis Talent, ${talentData.name}! Your profile is now active.`);
  };

  // Sign up Producer (Join for Free)
  const handleSignUpProducer = (producerData: { name: string; company: string; type: string; email: string }) => {
    setActiveProducerName(producerData.name);
    setActiveProducerCompany(producerData.company);
    localStorage.setItem('cast_platform_producer_name', producerData.name);
    localStorage.setItem('cast_platform_producer_company', producerData.company);
    
    setIsProducerLoggedIn(true);
    localStorage.setItem('cast_platform_producer_logged_in', 'true');
    
    if (producerData.email.toLowerCase().trim() === 'hasefiw@gmail.com') {
      setIsOwner(true);
      localStorage.setItem('cast_platform_is_owner', 'true');
      showToast('success', 'Owner account detected! Mode active.');
    }

    setPortal('producer');
    showToast('success', `Welcome, Director ${producerData.name}! Addis Talent agency dashboard is ready.`);
  };

  // Post New Casting Call (Producer side)
  const handleCreateCastingCall = (newCallData: Omit<CastingCall, 'id' | 'dateCreated'>) => {
    const newCall: CastingCall = {
      ...newCallData,
      id: `call_gen_${Date.now()}`,
      dateCreated: new Date().toISOString()
    };

    saveCastingCalls([newCall, ...castingCalls]);
    showToast('success', `Published "${newCall.title}" Auditions!`);
  };

  // Submit application (Actor side)
  const handleApplyToRole = (
    castingCallId: string,
    roleId: string,
    actorId: string,
    message: string,
    selfTapeUrl?: string,
    audioAuditionUrl?: string
  ) => {
    // Prevent duplicate applications
    const exists = applications.some((app) => app.actorId === actorId && app.roleId === roleId);
    if (exists) {
      showToast('info', 'You have already applied for this role');
      return;
    }

    const newApp: Application = {
      id: `app_gen_${Date.now()}`,
      castingCallId,
      roleId,
      actorId,
      dateApplied: new Date().toISOString(),
      status: 'pending',
      message,
      selfTapeUrl,
      audioAuditionUrl
    };

    saveApplications([...applications, newApp]);
    showToast('success', 'Application submitted to Casting Director!');
  };

  // Update Application Status (Producer side)
  const handleUpdateApplicationStatus = (appId: string, status: Application['status']) => {
    const updated = applications.map((app) => (app.id === appId ? { ...app, status } : app));
    saveApplications(updated);
    
    const targetApp = applications.find(a => a.id === appId);
    const actorName = actors.find(a => a.id === targetApp?.actorId)?.name || 'Talent';
    showToast('success', `Status updated: ${actorName} is now "${status}"!`);
  };

  // Audition Invitation from Profile Modal
  const handleInviteToAuditionFromModal = (actorId: string) => {
    // Automatically match or prompt an invite.
    // For simplicity, we invite this actor to their first open casting call.
    const openCall = castingCalls[0];
    if (!openCall || openCall.roles.length === 0) {
      showToast('info', 'No active casting calls found to invite this actor to');
      return;
    }

    const role = openCall.roles[0];
    const exists = applications.some((app) => app.actorId === actorId && app.roleId === role.id);
    
    if (exists) {
      // Update existing application to 'invited'
      const updated = applications.map((app) => 
        (app.actorId === actorId && app.roleId === role.id) ? { ...app, status: 'invited' as const } : app
      );
      saveApplications(updated);
    } else {
      // Create new application with 'invited' status
      const newApp: Application = {
        id: `app_gen_${Date.now()}`,
        castingCallId: openCall.id,
        roleId: role.id,
        actorId,
        dateApplied: new Date().toISOString(),
        status: 'invited',
        message: `Inquiry: Casting director Claire Henderson has reviewed your profile and invited you to audit for the role of ${role.title}.`
      };
      saveApplications([...applications, newApp]);
    }
    
    showToast('success', `Sent audition invitation to ${actors.find(a => a.id === actorId)?.name}!`);
  };

  const activeActor = actors.find((act) => act.id === activeActorId) || null;

  return (
    <div className="min-h-screen bg-[#080809] text-white flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-1/2 h-[500px] opacity-15 pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-l from-amber-500/40 to-transparent blur-3xl"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-1/3 h-[400px] opacity-10 pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-tr from-amber-500/30 to-transparent blur-3xl"></div>
      </div>

      {/* Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 rounded-xl bg-[#0e0e11]/90 backdrop-blur-md px-4 py-3 text-xs text-white shadow-2xl border border-amber-500/20 animate-fade-in animate-bounce">
          <div className={`h-2 w-2 rounded-full ${toastMessage.type === 'success' ? 'bg-amber-500' : 'bg-blue-400'}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Primary Header */}
      <Header
        portal={portal}
        setPortal={setPortal}
        activeActor={activeActor}
        actorsCount={actors.length}
        castingCount={castingCalls.length}
        activeProducerName={activeProducerName}
        activeProducerCompany={activeProducerCompany}
        onJoinForFree={() => {
          setSignUpDefaultType(portal === 'producer' ? 'producer' : 'talent');
          setIsSignUpOpen(true);
        }}
        isOwner={isOwner}
        onToggleOwner={handleToggleOwner}
        isActorLoggedIn={isActorLoggedIn}
        isProducerLoggedIn={isProducerLoggedIn}
      />

      {/* Main Workspace Frame */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 z-10 relative">
        
        {/* Dual Persona Active Control Bar (Only shown on Actor side to switch simulation logins) */}
        {portal === 'actor' && (
          <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                <Database className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase font-display">Acting Personas Simulator</h3>
                <p className="text-[10px] text-white/40 font-mono">Switch logged-in actor profiles to test individual applications</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={isActorLoggedIn ? activeActorId : 'guest'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'guest') {
                    setIsActorLoggedIn(false);
                    localStorage.setItem('cast_platform_actor_logged_in', 'false');
                    showToast('success', 'Switched simulation to Guest Mode');
                  } else {
                    handleSelectActiveActor(val);
                    setIsActorLoggedIn(true);
                    localStorage.setItem('cast_platform_actor_logged_in', 'true');
                    showToast('success', 'Logged in as simulated talent');
                  }
                }}
                className="rounded-lg border border-white/10 bg-[#0e0e11] px-3 py-1.5 text-xs text-white/90 focus:outline-hidden focus:border-amber-500/50"
              >
                <option value="guest" className="bg-[#0e0e11] text-white">
                  Guest Mode (Not Logged In)
                </option>
                {actors.map((act) => (
                  <option key={act.id} value={act.id} className="bg-[#0e0e11] text-white">
                    Simulate: {act.name} ({act.type === 'both' ? 'Actor/Model' : act.type})
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  const next = !isProducerLoggedIn;
                  setIsProducerLoggedIn(next);
                  localStorage.setItem('cast_platform_producer_logged_in', next ? 'true' : 'false');
                  showToast('success', next ? 'Logged in as Hiring Manager/Producer' : 'Logged out of Producer portal');
                }}
                className={`inline-flex items-center space-x-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                  isProducerLoggedIn 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                  : 'border-white/10 hover:border-white/20 text-white/60 hover:text-white bg-white/5'
                }`}
              >
                <span>{isProducerLoggedIn ? 'Producer Logged In' : 'Simulate Producer Log In'}</span>
              </button>

              <button
                onClick={handleRegisterNewActor}
                className="inline-flex items-center space-x-1 rounded-lg border border-amber-500/30 hover:border-amber-500 text-amber-500 hover:bg-amber-500/10 bg-transparent px-3 py-1.5 text-xs font-bold transition-all duration-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Register New Actor Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Portal Router */}
        {portal === 'visitor' ? (
          <VisitorLanding
            actors={actors}
            castingCalls={castingCalls}
            partners={partners}
            newsArticles={newsArticles}
            setPortal={setPortal}
            onJoinForFree={() => {
              setSignUpDefaultType('talent');
              setIsSignUpOpen(true);
            }}
            isOwner={isOwner}
          />
        ) : portal === 'actor' ? (
          <ActorPortal
            actors={actors}
            castingCalls={castingCalls}
            applications={applications}
            activeActor={activeActor}
            onUpdateActor={handleUpdateActorProfile}
            onApply={handleApplyToRole}
            showToast={showToast}
            isActorLoggedIn={isActorLoggedIn}
            onJoinForFree={() => {
              setSignUpDefaultType('talent');
              setIsSignUpOpen(true);
            }}
            onSubmitPaymentRequest={handleSubmitPaymentRequest}
          />
        ) : portal === 'producer' ? (
          <ProducerPortal
            actors={actors}
            castingCalls={castingCalls}
            applications={applications}
            shortlistedActorIds={shortlistedActorIds}
            onToggleShortlist={handleToggleShortlist}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onOpenCreateCastingModal={() => setIsCreateCastingOpen(true)}
            onViewActorProfile={(actor) => setSelectedActorProfile(actor)}
            isProducerLoggedIn={isProducerLoggedIn}
            onJoinForFree={() => {
              setSignUpDefaultType('producer');
              setIsSignUpOpen(true);
            }}
            isProducerPremium={isProducerPremium}
            onProducerLogout={handleProducerLogout}
            onSendAuditionInvite={handleSendAuditionInvite}
            onSubmitPaymentRequest={handleSubmitPaymentRequest}
            showToast={showToast}
          />
        ) : (
          <AdminPortal
            actors={actors}
            castingCalls={castingCalls}
            applications={applications}
            partners={partners}
            newsArticles={newsArticles}
            paymentRequests={paymentRequests}
            onUpdatePaymentRequestStatus={handleUpdatePaymentRequestStatus}
            onAddOrUpdatePartner={handleAddOrUpdatePartner}
            onDeletePartner={handleDeletePartner}
            onAddOrUpdateNews={handleAddOrUpdateNews}
            onDeleteNews={handleDeleteNews}
            onAddActors={(newActors) => {
              const updated = [...actors, ...newActors];
              saveActors(updated);
            }}
            onUpdateActor={(updatedActor) => {
              const updated = actors.map(a => a.id === updatedActor.id ? updatedActor : a);
              saveActors(updated);
            }}
            onUpdateCastingCall={(updatedCall) => {
              const updated = castingCalls.map(c => c.id === updatedCall.id ? updatedCall : c);
              saveCastingCalls(updated);
            }}
            onDeleteActor={(id) => {
              const updatedActors = actors.filter(a => a.id !== id);
              saveActors(updatedActors);
              
              const updatedApps = applications.filter(a => a.actorId !== id);
              saveApplications(updatedApps);
              
              if (shortlistedActorIds.includes(id)) {
                 const updatedShortlist = shortlistedActorIds.filter(actorId => actorId !== id);
                 setShortlistedActorIds(updatedShortlist);
                 localStorage.setItem('cast_platform_shortlist', JSON.stringify(updatedShortlist));
              }

              if (activeActorId === id) {
                setActiveActorId('guest');
                setIsActorLoggedIn(false);
                localStorage.setItem('cast_platform_active_actor', 'guest');
                localStorage.setItem('cast_platform_actor_logged_in', 'false');
              }

              // Background database sync
              fetch(`/api/actors/${id}`, { method: 'DELETE' }).catch(err => console.warn("Failed to delete actor from SQL:", err));
            }}
            showToast={showToast}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-md py-6 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between">
          <p className="text-xs text-white/40 font-sans">
            &copy; 2026 Addis Talent. Designed for Film Producers, Marketing Agencies, and Talent Registries.
          </p>
          <div className="flex justify-center space-x-4 mt-2 sm:mt-0 text-[10px] font-mono text-white/40 uppercase tracking-widest font-semibold">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>Security Rules: Active</span>
            <span>•</span>
            <span>Durable LocalState Persistence</span>
          </div>
        </div>
      </footer>

      {/* Modals Containers */}
      <ProfileModal
        actor={selectedActorProfile}
        isOpen={selectedActorProfile !== null}
        onClose={() => setSelectedActorProfile(null)}
        isProducerView={portal === 'producer'}
        isShortlisted={selectedActorProfile ? shortlistedActorIds.includes(selectedActorProfile.id) : false}
        onToggleShortlist={handleToggleShortlist}
        onInviteToAudition={handleInviteToAuditionFromModal}
        isProducerPremium={isProducerPremium}
        onUnlockProducerPremium={handleUnlockProducerPremium}
      />

      <CreateCastingModal
        isOpen={isCreateCastingOpen}
        onClose={() => setIsCreateCastingOpen(false)}
        onSubmit={handleCreateCastingCall}
        isProducerPremium={isProducerPremium}
        onUnlockProducerPremium={handleUnlockProducerPremium}
        onSubmitPaymentRequest={handleSubmitPaymentRequest}
      />

      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSignUpTalent={handleSignUpTalent}
        onSignUpProducer={handleSignUpProducer}
        defaultAccountType={signUpDefaultType}
      />

    </div>
  );
}
