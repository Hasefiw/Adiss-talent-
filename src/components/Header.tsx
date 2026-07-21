import React from 'react';
import { Film, User, Shield, Briefcase, Database, Sparkles, Settings } from 'lucide-react';
import { PortalType, Actor } from '../types';
import addisTalentLogo from '../assets/images/addis_talent_logo_v2_1784643163696.jpg';

interface HeaderProps {
  portal: PortalType;
  setPortal: (portal: PortalType) => void;
  activeActor: Actor | null;
  actorsCount: number;
  castingCount: number;
  activeProducerName: string;
  activeProducerCompany: string;
  onJoinForFree: () => void;
  isOwner?: boolean;
  onToggleOwner?: () => void;
  isActorLoggedIn?: boolean;
  isProducerLoggedIn?: boolean;
}

export default function Header({ 
  portal, 
  setPortal, 
  activeActor, 
  actorsCount, 
  castingCount,
  activeProducerName,
  activeProducerCompany,
  onJoinForFree,
  isOwner = false,
  onToggleOwner,
  isActorLoggedIn = false,
  isProducerLoggedIn = false,
}: HeaderProps) {
  const [logoClicks, setLogoClicks] = React.useState(0);

  const handleLogoClick = () => {
    setPortal('visitor');
    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);
    if (nextClicks >= 5) {
      setLogoClicks(0);
      if (onToggleOwner) {
        onToggleOwner();
      }
    }
  };

  // Get initials for Producer/Director
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AT';
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080809]/95 shadow-2xl backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <button 
          onClick={handleLogoClick}
          className="flex items-center space-x-3 text-left focus:outline-none group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 overflow-hidden border border-amber-500/30 shadow-md transition-transform duration-300 group-hover:scale-105">
            <img src={addisTalentLogo} alt="Addis Talent Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase text-white font-display group-hover:text-amber-400 transition-colors">
              Addis Talent
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500 font-mono">
              Premium Casting Network
            </p>
          </div>
        </button>

        {/* Global Statistics Indicators */}
        <div className="hidden lg:flex items-center space-x-4 text-xs font-mono text-white/60">
          <div className="flex items-center space-x-1.5 bg-white/5 py-1 px-2.5 rounded-full border border-white/5">
            <Database className="h-3.5 w-3.5 text-amber-500" />
            <span>Talent Registry: <strong className="text-white">{actorsCount}</strong> Profiles</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/5 py-1 px-2.5 rounded-full border border-white/5">
            <Briefcase className="h-3.5 w-3.5 text-amber-500" />
            <span>Open Auditions: <strong className="text-white">{castingCount}</strong> Active</span>
          </div>
        </div>

        {/* Portal Switcher & User Status */}
        <div className="flex items-center space-x-3">
          
          {/* Join for Free CTAs */}
          <button
            onClick={onJoinForFree}
            className="relative hidden sm:inline-flex items-center space-x-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20 px-3.5 py-1.5 text-xs font-bold transition-all duration-300 hover:scale-105 cursor-pointer shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Join for Free</span>
          </button>

          {/* Tri-Portal Switch Button */}
          <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              id="switch-actor-portal"
              onClick={() => setPortal('actor')}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                portal === 'actor'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-white/60 hover:text-amber-400'
              }`}
            >
              <User className={`h-3.5 w-3.5 ${portal === 'actor' ? 'text-black' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">Talent</span>
            </button>
            <button
              id="switch-producer-portal"
              onClick={() => setPortal('producer')}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                portal === 'producer'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-white/60 hover:text-amber-400'
              }`}
            >
              <Shield className={`h-3.5 w-3.5 ${portal === 'producer' ? 'text-black' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">Director</span>
            </button>
            {isOwner && (
              <button
                id="switch-admin-portal"
                onClick={() => setPortal('admin')}
                className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  portal === 'admin'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-white/60 hover:text-amber-400'
                }`}
              >
                <Settings className={`h-3.5 w-3.5 ${portal === 'admin' ? 'text-black' : 'text-amber-500'}`} />
                <span className="hidden sm:inline">Owner Hub</span>
              </button>
            )}
          </div>

          {/* Active User Avatar/Details (Actor Mode) */}
          {portal === 'actor' && (
            isActorLoggedIn && activeActor ? (
              <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
                <img
                  src={activeActor.headshotUrl}
                  alt={activeActor.name}
                  className="h-8 w-8 rounded-full border border-white/20 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden md:block text-left leading-tight font-sans">
                  <p className="text-xs font-semibold text-white/95 max-w-[100px] truncate">{activeActor.name}</p>
                  <p className="text-[10px] font-mono text-amber-500 font-medium uppercase tracking-wider">Talent</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white/70 font-bold text-xs select-none">
                  G
                </div>
                <div className="hidden md:block text-left leading-tight font-sans">
                  <p className="text-xs font-semibold text-white/85">Guest Mode</p>
                  <button 
                    onClick={onJoinForFree}
                    className="text-[10px] text-amber-500 hover:text-amber-400 font-bold block text-left hover:underline"
                  >
                    Join for Free
                  </button>
                </div>
              </div>
            )
          )}

          {/* Active User Avatar/Details (Producer Mode) */}
          {portal === 'producer' && (
            isProducerLoggedIn ? (
              <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-xs select-none">
                  {getInitials(activeProducerName)}
                </div>
                <div className="hidden md:block text-left leading-tight font-sans">
                  <p className="text-xs font-semibold text-white/95 max-w-[100px] truncate">{activeProducerName}</p>
                  <p className="text-[10px] font-mono text-amber-500 font-medium uppercase tracking-wider truncate max-w-[100px]">{activeProducerCompany || 'Casting Dir.'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white/70 font-bold text-xs select-none">
                  G
                </div>
                <div className="hidden md:block text-left leading-tight font-sans">
                  <p className="text-xs font-semibold text-white/85">Guest Mode</p>
                  <button 
                    onClick={onJoinForFree}
                    className="text-[10px] text-amber-500 hover:text-amber-400 font-bold block text-left hover:underline"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              </div>
            )
          )}

          {/* Active User Avatar/Details (Admin Mode) */}
          {portal === 'admin' && (
            <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-xs select-none">
                HQ
              </div>
              <div className="hidden md:block text-left leading-tight font-sans">
                <p className="text-xs font-semibold text-white/95 max-w-[100px] truncate">Admin Owner</p>
                <p className="text-[10px] font-mono text-purple-400 font-medium uppercase tracking-wider truncate max-w-[100px]">addisfilmhub</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
