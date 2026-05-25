import React, { useState, useEffect, useRef } from 'react';
import { LanternConfig, FringeStyle, FringeLength } from '../types';
import { ambientSynth } from '../utils/audio';

interface LanternPreviewProps {
  config: LanternConfig;
  interactive?: boolean;
}

export default function LanternPreview({ config, interactive = true }: LanternPreviewProps) {
  const [swayOffset, setSwayOffset] = useState(0);
  const [lanternAngle, setLanternAngle] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(1);
  const [rainbowHue, setRainbowHue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const impulseRef = useRef(0);
  
  // Interactive lamp states: 4 lamps at the bottom of the scene
  const [lamps, setLamps] = useState([
    { id: 1, lit: true, x: 20 },
    { id: 2, lit: true, x: 40 },
    { id: 3, lit: false, x: 60 },
    { id: 4, lit: true, x: 80 }
  ]);

  // Handle cursor hover/mousemove for interactive wind/sway
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const cursorX = e.clientX;
    const distanceX = cursorX - centerX;
    
    // Calculate a gentle push angle based on cursor horizontal distance from center
    const maxPush = 12; // max degrees of push
    const relativeDistance = Math.max(-1, Math.min(1, distanceX / (rect.width / 2)));
    
    setSwayOffset(relativeDistance * maxPush);
  };

  const handleMouseLeave = () => {
    setSwayOffset(0);
  };

  // Sound and chime triggered on lantern click
  const handleLanternClick = () => {
    if (!interactive) return;
    ambientSynth.playWindChime();
    
    // Add a momentary kinetic momentum punch (decayed in physics tick)
    impulseRef.current += (Math.random() > 0.5 ? 14 : -14);
  };

  // Simulate constant physical swinging (micro wind) + interactive sway
  useEffect(() => {
    let animationFrameId: number;
    let t = 0;

    const baseSpeed = config.rotationSpeed > 0 ? config.rotationSpeed * 0.05 : 0.015;

    const update = () => {
      t += baseSpeed;
      
      // Decay impulse slowly back to zero
      impulseRef.current *= 0.95;

      // Gentle natural sine wave swing
      const naturalSway = Math.sin(t) * (2 + config.rotationSpeed);
      // Blend natural swinging with current interactive cursor push + decaying impulse
      const targetAngle = naturalSway + swayOffset + impulseRef.current;
      
      setLanternAngle(prev => prev + (targetAngle - prev) * 0.08); // smooth interpolation
      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [config.rotationSpeed, swayOffset]);

  // Handle dynamic light effects
  useEffect(() => {
    let lightInterval: any;
    let t = 0;

    if (config.lightEffect === 'pulse') {
      lightInterval = setInterval(() => {
        t += 0.07;
        // Pulse between 0.6 and 1.3
        setGlowIntensity(0.85 + Math.sin(t) * 0.45);
      }, 30);
    } else if (config.lightEffect === 'candle') {
      lightInterval = setInterval(() => {
        // High frequency tiny flickers for realistic candlelight
        setGlowIntensity(0.9 + Math.random() * 0.25 + (Math.sin(Date.now() / 200) * 0.05));
      }, 50);
    } else if (config.lightEffect === 'rainbow') {
      lightInterval = setInterval(() => {
        setRainbowHue(prev => (prev + 2.5) % 360);
        setGlowIntensity(1.0);
      }, 30);
    } else {
      setGlowIntensity(1.0);
    }

    return () => {
      if (lightInterval) clearInterval(lightInterval);
    };
  }, [config.lightEffect]);

  // Color selection helper with rainbow option
  const getCoreColor = () => {
    if (config.lightEffect === 'rainbow') {
      return `hsl(${rainbowHue}, 90%, 65%)`;
    }
    return config.colorCore;
  };

  const getPaneColor = () => {
    if (config.lightEffect === 'rainbow') {
      return `hsl(${(rainbowHue + 120) % 360}, 85%, 60%)`;
    }
    return config.colorPane;
  };

  const getTailColor = () => {
    if (config.lightEffect === 'rainbow') {
      return `hsl(${(rainbowHue + 240) % 360}, 85%, 62%)`;
    }
    return config.colorTail;
  };

  const toggleLamp = (id: number) => {
    setLamps(prev => prev.map(l => l.id === id ? { ...l, lit: !l.lit } : l));
    if (interactive) {
      ambientSynth.playWindChime();
    }
  };

  // Generates tail shapes based on styles
  const renderTailTassels = (xPos: number, yPos: number, count: number = 3, scaleY: number = 1) => {
    const tailHeight = config.fringeLength === 'short' ? 70 : config.fringeLength === 'medium' ? 120 : 180;
    const scale = fringeLengthMultiplier(config.fringeLength) * scaleY;
    const spacing = 14;

    return Array.from({ length: count }).map((_, idx) => {
      const offset = (idx - (count - 1)/2) * spacing;
      const initialSwayDelay = idx * 0.2;
      const customAngle = -lanternAngle * 0.75; // tail drags behind the lantern rotation
      
      return (
        <g 
          key={idx} 
          transform={`translate(${xPos + offset}, ${yPos}) rotate(${customAngle})`}
          style={{ transition: 'transform 0.1s ease-out' }}
        >
          {/* Fringes rendering */}
          {config.fringeStyle === 'straight' && (
            <path 
              d={`M0,0 L0,${tailHeight} M-3,0 L-3,${tailHeight - 10} M3,0 L3,${tailHeight - 15}`} 
              stroke={getTailColor()} 
              strokeWidth="2.5" 
              strokeOpacity="0.8"
              strokeDasharray={idx % 2 === 0 ? "none" : "8,4"}
              fill="none"
            />
          )}

          {config.fringeStyle === 'zigzag' && (
            <path 
              d={`M-4,0 L-4,5 L-1,12 L-4,19 L-1,26 L-4,33 L-1,40 L-4,47 L-1,54 L-4,61 L-1,68 
                  ${tailHeight > 80 ? 'L-4,75 L-1,82 L-4,89 L-1,96 L-4,103 L-1,110' : ''} 
                  ${tailHeight > 130 ? 'L-4,117 L-1,124 L-4,131 L-1,138 L-4,145 L-1,152 L-4,159 L-1,166' : ''}`}
              stroke={getTailColor()} 
              strokeWidth="2.5" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeOpacity="0.85"
            />
          )}

          {config.fringeStyle === 'wave' && (
            <path 
              d={`M 0,0 
                  Q ${3 + Math.sin(idx)*2},10 0,20 
                  T ${-3 - Math.sin(idx)*2},40 0,60 
                  T ${3},80 0,100
                  ${tailHeight > 110 ? `T ${-3},120 0,140` : ''}
                  ${tailHeight > 160 ? `T ${3},160 0,180` : ''}`}
              stroke={getTailColor()} 
              strokeWidth="2.8" 
              fill="none" 
              strokeOpacity="0.85"
            />
          )}

          {/* Glowing bottom paper flower capsule */}
          <circle cx="0" cy="0" r="4.5" fill={getPaneColor()} filter="url(#glow-soft)" />
        </g>
      );
    });
  };

  const fringeLengthMultiplier = (len: FringeLength) => {
    if (len === 'short') return 0.6;
    if (len === 'medium') return 1.0;
    return 1.5;
  };

  return (
    <div 
      id="lantern-canvas-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-[540px] rounded-2xl overflow-hidden select-none flex flex-col items-center justify-center border border-yellow-500/15 shadow-2xl transition-all duration-700 ${
        config.backgroundTheme === 'starry' ? 'bg-gradient-to-b from-[#030310] via-[#05051e] to-[#01010a]' :
        config.backgroundTheme === 'temple' ? 'bg-gradient-to-b from-[#020514] via-[#040c26] to-[#0d091a]' :
        config.backgroundTheme === 'moonlight' ? 'bg-gradient-to-b from-[#051026] via-[#0a1e3d] to-[#030a14]' :
        'bg-gradient-to-b from-[#140b02] via-[#0d0702] to-[#000000]'
      }`}
    >
      {/* 1. BACKGROUND SCENE ELEMENT ACCENTS */}
      
      {/* Starry Sky Core Extras */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glowing Stars */}
        <div className="absolute top-[8%] left-[12%] w-1 h-1 bg-white rounded-full animate-ping duration-1000 opacity-60"></div>
        <div className="absolute top-[25%] left-[8%] w-1.5 h-1.5 bg-yellow-200/80 rounded-full blur-[0.5px]"></div>
        <div className="absolute top-[15%] right-[20%] w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute top-[40%] right-[10%] w-1.5 h-1.5 bg-yellow-100/75 rounded-full blur-[1px]"></div>
        <div className="absolute top-[35%] left-[28%] w-1 h-1 bg-white rounded-full opacity-40"></div>
        <div className="absolute top-[18%] left-[65%] w-1 h-1 bg-white rounded-full animate-pulse opacity-70"></div>
        <div className="absolute top-[28%] right-[32%] w-2 h-2 bg-yellow-300/30 rounded-full blur-[2px] animate-pulse"></div>
        <div className="absolute top-[52%] left-[15%] w-1 h-1 bg-white rounded-full opacity-50"></div>

        {/* Floating meditative lanterns/fireflies drifting in sky */}
        <div className="absolute bottom-[28%] left-[8%] w-2.5 h-2.5 bg-yellow-500/30 rounded-full blur-[3px] animate-bounce duration-4000"></div>
        <div className="absolute bottom-[44%] right-[12%] w-3 h-3 bg-red-500/25 rounded-full blur-[4px] animate-pulse duration-3000"></div>
        <div className="absolute bottom-[58%] right-[25%] w-2.5 h-2.5 bg-orange-400/20 rounded-full blur-[3px] animate-bounce duration-6000"></div>
        <div className="absolute bottom-[35%] left-[34%] w-2 h-2 bg-yellow-400/30 rounded-full blur-[2px] animate-pulse duration-2000"></div>
      </div>

      {/* A. Lakeside Temple Accents */}
      {config.backgroundTheme === 'temple' && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end">
          {/* Serene Lake reflection and Temple landscape shape */}
          <div className="w-full h-[180px] relative">
            {/* Dagoba / Stupa silhouette */}
            <svg className="absolute bottom-[35px] right-[10%] w-[130px] h-[120px] opacity-25 text-neutral-900" viewBox="0 0 100 100">
              {/* Spire */}
              <line x1="50" y1="5" x2="50" y2="40" stroke="currentColor" strokeWidth="2" />
              <path d="M47,40 L53,40 L50,5 Z" fill="currentColor" />
              {/* Square chamber */}
              <rect x="44" y="40" width="12" height="10" fill="currentColor" />
              {/* Dome */}
              <path d="M25,80 C25,50 75,50 75,80 Z" fill="currentColor" />
              {/* Base rings */}
              <rect x="20" y="80" width="60" height="5" fill="currentColor" />
              <rect x="15" y="85" width="70" height="7" fill="currentColor" />
            </svg>

            {/* Subtle trees */}
            <div className="absolute bottom-[35px] left-[5%] w-[80px] h-[80px] opacity-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-transparent blur-[3px]"></div>
            <div className="absolute bottom-[35px] right-[30%] w-[50px] h-[70px] opacity-15 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-transparent blur-[2px]"></div>

            {/* Lake Surface */}
            <div className="absolute bottom-0 w-full h-[35px] bg-gradient-to-t from-[#020510] to-[#040e2d] border-t border-blue-950/40 flex items-center justify-center overflow-hidden">
              {/* Reflected glow */}
              <div 
                className="w-[180px] h-[30px] rounded-full filter blur-[12px] opacity-45 mix-blend-screen transition-colors duration-500"
                style={{ backgroundColor: getCoreColor() }}
              />
            </div>
          </div>
        </div>
      )}

      {/* B. Moonlit Sky Theme Accents */}
      {config.backgroundTheme === 'moonlight' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Big glowing Poya Moon (පුන් පෝය හඳ) */}
          <div className="absolute top-[11%] left-[16%] w-[100px] h-[100px] rounded-full bg-gradient-to-br from-yellow-50 to-amber-100 shadow-[0_0_50px_rgba(255,253,230,0.55)] flex items-center justify-center">
            {/* Soft moon crater texture details */}
            <div className="absolute w-[90px] h-[90px] rounded-full bg-[radial-gradient(circle_at_30%_20%,_transparent_55%,_rgba(100,80,40,0.06)_80%)]"></div>
            <div className="w-[18px] h-[10px] bg-emerald-900/5 rounded-full absolute top-[30px] left-[20px] blur-[1px]"></div>
            <div className="w-[25px] h-[15px] bg-emerald-900/5 rounded-full absolute top-[55px] right-[25px] blur-[2px]"></div>
          </div>
          {/* Passages of quiet translucent clouds passing behind moon/lantern */}
          <div className="absolute top-[28%] left-[-10%] w-[120%] h-[60px] bg-gradient-to-r from-transparent via-blue-900/10 to-transparent blur-md"></div>
          <div className="absolute top-[18%] -right-[50px] w-[300px] h-[40px] bg-gradient-to-l from-transparent via-slate-500/5 to-transparent blur-md"></div>
        </div>
      )}

      {/* C. Buddhist Flag Theme Accents */}
      {config.backgroundTheme === 'buddhist-flag' && (
        <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-between">
          <div className="w-[16.6%] h-full bg-blue-600"></div>
          <div className="w-[16.6%] h-full bg-yellow-400"></div>
          <div className="w-[16.6%] h-full bg-red-600"></div>
          <div className="w-[16.6%] h-full bg-stone-100"></div>
          <div className="w-[16.6%] h-full bg-amber-600"></div>
          <div className="w-[16.6%] h-full flex flex-col">
            <div className="h-[20%] bg-blue-600"></div>
            <div className="h-[20%] bg-yellow-400"></div>
            <div className="h-[20%] bg-red-600"></div>
            <div className="h-[20%] bg-stone-100"></div>
            <div className="h-[20%] bg-amber-600"></div>
          </div>
        </div>
      )}

      {/* Hanging rope line for the lantern */}
      <div 
        className="w-[1.5px] h-[110px] bg-gradient-to-b from-[#332211] to-[#b3773b]/30 z-[1]"
        style={{
          transformOrigin: 'top center',
          transform: `rotate(${lanternAngle}deg)`,
          transition: 'transform 0.08s ease-out'
        }}
      />

      {/* 2. THE MAIN INTERACTIVE GLOWING LANTERN */}
      <div 
        id="interactive-wesak-kudu-body"
        onClick={handleLanternClick}
        className="cursor-pointer relative z-[2] -mt-[4px]"
        style={{
          transformOrigin: 'top center',
          transform: `rotate(${lanternAngle}deg)`,
          transition: 'transform 0.08s ease-out'
        }}
      >
        <svg 
          width="400" 
          height="450" 
          viewBox="0 0 400 450" 
          className="overflow-visible"
        >
          {/* DEFINITIONS FOR DYNAMIC EFFECTS */}
          <defs>
            {/* Main Inner/Bulb Soft Glow */}
            <filter id="glow-bulb" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={15 * glowIntensity * config.glowStrength} />
            </filter>
            
            {/* Surrounding paper soft glow filter */}
            <filter id="glow-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation={6 * glowIntensity * config.glowStrength} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Extreme glow filter for peak intensity */}
            <filter id="glow-hard" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation={25 * glowIntensity * config.glowStrength} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Core facet gradients to simulate high-contrast glowing paper facets */}
            <radialGradient id="grad-core" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="35%" stopColor={getCoreColor()} stopOpacity="0.85" />
              <stop offset="100%" stopColor={getCoreColor()} stopOpacity="0.45" />
            </radialGradient>

            <linearGradient id="grad-pane" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getPaneColor()} stopOpacity="0.85" />
              <stop offset="50%" stopColor={getPaneColor()} stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1a000d" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="grad-border" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffe680" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#cca300" stopOpacity="0.4" />
            </linearGradient>

            {/* Traditional Sri Lankan geometric pattern textures for translucent panels */}
            <pattern id="traditional-grid" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 0 12 L 12 0 M 0 0 L 12 12" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.12" />
            </pattern>
          </defs>

          {/* BACKGROUND AMBIENT RADIAL LIGHTING FLUSHED ON SKY */}
          <circle 
            cx="200" 
            cy="150" 
            r={130 * glowIntensity} 
            fill={getCoreColor()} 
            opacity={0.17 * config.glowStrength} 
            filter="url(#glow-bulb)" 
          />
          <circle 
            cx="200" 
            cy="150" 
            r={70 * glowIntensity} 
            fill="#fff3cc" 
            opacity={0.12 * config.glowStrength} 
            filter="url(#glow-bulb)" 
          />

          {/* LANTERN RENDER GENERATION BY TYPE */}
          {config.shape === 'atapattama' && (
            <g id="shape-atapattama" transform="translate(0, 30)">
              {/* BACK PANELS AND GLOW SILHOUETTES */}
              <circle cx="200" cy="120" r="45" fill={getCoreColor()} filter="url(#glow-bulb)" opacity="0.65" />
              
              {/* SIDE EARS / FLAPS (Triangle protrusions on left and right) */}
              {/* Left ear */}
              <polygon 
                points="110,120 70,120 110,80" 
                fill={getPaneColor()} 
                opacity="0.8" 
                stroke="#ffd24d" 
                strokeWidth="1.2" 
                strokeLinejoin="round"
              />
              <polygon 
                points="110,120 70,120 110,160" 
                fill={getPaneColor()} 
                opacity="0.7" 
                stroke="#ffd24d" 
                strokeWidth="1.2" 
                strokeLinejoin="round"
              />
              {/* Right ear */}
              <polygon 
                points="290,120 330,120 290,80" 
                fill={getPaneColor()} 
                opacity="0.8" 
                stroke="#ffd24d" 
                strokeWidth="1.2" 
                strokeLinejoin="round"
              />
              <polygon 
                points="290,120 330,120 290,160" 
                fill={getPaneColor()} 
                opacity="0.7" 
                stroke="#ffd24d" 
                strokeWidth="1.2" 
                strokeLinejoin="round"
              />

              {/* MAIN CENTRAL ATAPATTAMA DOUBLE-PIRAMID FRAME */}
              
              {/* Top Triangle Panels */}
              <polygon points="200,40 145,85 200,120" fill="url(#grad-pane)" stroke="#ffe680" strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points="200,40 255,85 200,120" fill={getPaneColor()} opacity="0.8" stroke="#ffe680" strokeWidth="1.5" strokeLinejoin="round" />
              
              <polygon points="145,85 110,120 200,120" fill={getPaneColor()} opacity="0.75" stroke="#ffe680" strokeWidth="1.5" />
              <polygon points="255,85 290,120 200,120" fill="url(#grad-pane)" stroke="#ffe680" strokeWidth="1.5" />

              {/* Bottom Triangle Panels */}
              <polygon points="110,120 145,155 200,120" fill={getPaneColor()} opacity="0.7" stroke="#ffe680" strokeWidth="1.5" />
              <polygon points="290,120 255,155 200,120" fill="url(#grad-pane)" stroke="#ffe680" strokeWidth="1.5" />
              
              <polygon points="200,200 145,155 200,120" fill="url(#grad-pane)" stroke="#ffe680" strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points="200,200 255,155 200,120" fill={getPaneColor()} opacity="0.85" stroke="#ffe680" strokeWidth="1.5" strokeLinejoin="round" />

              {/* CENTRAL CORE FACET (Interactive front-most glowing Diamond) */}
              <polygon 
                points="200,55 135,120 200,185 265,120" 
                fill="url(#grad-core)" 
                stroke="url(#grad-border)" 
                strokeWidth="2.5" 
                filter="url(#glow-soft)" 
                strokeLinejoin="round"
              />

              {/* Overlay grid on core facet for texture */}
              <polygon points="200,55 135,120 200,185 265,120" fill="url(#traditional-grid)" pointerEvents="none" />

              {/* Inner glowing flame/bulb representation */}
              <circle cx="200" cy="120" r={16 * glowIntensity} fill="#ffffff" filter="url(#glow-bulb)" opacity="0.9" />
              <circle cx="200" cy="120" r="5" fill="#ffe066" />

              {/* Dangle rings connectors for tails */}
              <circle cx="200" cy="200" r="2.5" fill="#ffd24d" />
              <circle cx="145" cy="155" r="2" fill="#ffd24d" />
              <circle cx="255" cy="155" r="2" fill="#ffd24d" />
              <circle cx="70" cy="120" r="2" fill="#ffd24d" />
              <circle cx="330" cy="120" r="2" fill="#ffd24d" />

              {/* TAILS ATTACHMENTS */}
              {renderTailTassels(200, 201, 3, 1)}        {/* Bottom index center */}
              {renderTailTassels(145, 156, 1, 0.8)}      {/* Bottom left */}
              {renderTailTassels(255, 156, 1, 0.8)}      {/* Bottom right */}
              {renderTailTassels(70, 121, 1, 0.75)}      {/* Left side ear */}
              {renderTailTassels(330, 121, 1, 0.75)}      {/* Right side ear */}
            </g>
          )}

          {config.shape === 'nelum' && (
            <g id="shape-nelum" transform="translate(0, 30)">
              {/* BACKGROUND BULB */}
              <circle cx="200" cy="120" r="55" fill={getCoreColor()} filter="url(#glow-bulb)" opacity="0.75" />

              {/* LAYERED LOTUS VECTORS */}
              {/* Back Petals layer */}
              <path d="M120,120 C100,60 150,60 200,120 C250,60 300,60 280,120 C320,150 280,200 200,120 C120,200 80,150 120,120 Z" fill={getPaneColor()} opacity="0.5" />
              
              {/* Elegant curved lotus side petals */}
              <path d="M200,120 C130,50 110,120 130,160 C150,200 200,130 200,120 Z" fill={getPaneColor()} opacity="0.8" stroke="#ffe680" strokeWidth="1" />
              <path d="M200,120 C270,50 290,120 270,160 C250,200 200,130 200,120 Z" fill={getPaneColor()} opacity="0.8" stroke="#ffe680" strokeWidth="1" />
              
              <path d="M200,120 C160,30 140,50 150,110 Z" fill={getPaneColor()} opacity="0.7" />
              <path d="M200,120 C240,30 260,50 250,110 Z" fill={getPaneColor()} opacity="0.7" />

              {/* Glowing round center core */}
              <circle cx="200" cy="120" r="48" fill="url(#grad-core)" stroke="url(#grad-border)" strokeWidth="2.5" filter="url(#glow-soft)" />
              <circle cx="200" cy="120" r="48" fill="url(#traditional-grid)" pointerEvents="none" />

              {/* Inner petal highlights */}
              <path d="M200,72 C180,95 180,120 200,168 C220,120 220,95 200,72 Z" fill="#ffffff" opacity="0.22" />

              {/* Central Fire/Bulb */}
              <circle cx="200" cy="120" r={15 * glowIntensity} fill="#ffffff" filter="url(#glow-bulb)" opacity="0.9" />

              {/* Dangle rings for tails */}
              <circle cx="200" cy="168" r="2.5" fill="#ffd24d" />
              <circle cx="130" cy="160" r="2" fill="#ffd24d" />
              <circle cx="270" cy="160" r="2" fill="#ffd24d" />

              {/* Tails render */}
              {renderTailTassels(200, 169, 3, 1.1)}      {/* Center large tassel */}
              {renderTailTassels(130, 161, 1, 0.85)}     {/* Left side petal tail */}
              {renderTailTassels(270, 161, 1, 0.85)}     {/* Right side petal tail */}
            </g>
          )}

          {config.shape === 'tharu' && (
            <g id="shape-tharu" transform="translate(0, 30)">
              {/* STAR SHAPED GLOW */}
              <polygon 
                points="200,15 235,90 315,90 250,140 275,215 200,165 125,215 150,140 85,90 165,90" 
                fill={getPaneColor()} 
                opacity="0.3" 
                filter="url(#glow-soft)" 
              />

              {/* Outer Star Triangular Rays */}
              <polygon points="200,20 230,85 200,120" fill={getPaneColor()} opacity="0.8" stroke="#ffe680" strokeWidth="1.2" />
              <polygon points="200,20 170,85 200,120" fill="url(#grad-pane)" stroke="#ffe680" strokeWidth="1.2" />

              <polygon points="310,90 245,115 200,120" fill={getPaneColor()} opacity="0.8" stroke="#ffe680" strokeWidth="1.2" />
              <polygon points="310,90 255,145 200,120" fill="url(#grad-pane)" stroke="#ffe680" strokeWidth="1.2" />

              <polygon points="270,210 235,155 200,120" fill={getPaneColor()} opacity="0.8" stroke="#ffe680" strokeWidth="1.2" />
              <polygon points="270,210 200,165 200,120" fill="url(#grad-pane)" stroke="#ffe680" strokeWidth="1.2" />

              <polygon points="130,210 165,155 200,120" fill={getPaneColor()} opacity="0.8" stroke="#ffe680" strokeWidth="1.2" />
              <polygon points="130,210 200,165 200,120" fill="url(#grad-pane)" stroke="#ffe680" strokeWidth="1.2" />

              <polygon points="90,90 155,115 200,120" fill={getPaneColor()} opacity="0.85" stroke="#ffe680" strokeWidth="1.2" />
              <polygon points="90,90 145,145 200,120" fill="url(#grad-pane)" stroke="#ffe680" strokeWidth="1.2" />

              {/* Glowing Central Pentagonal Core */}
              <polygon 
                points="200,75 240,105 225,150 175,150 160,105" 
                fill="url(#grad-core)" 
                stroke="url(#grad-border)" 
                strokeWidth="2.5" 
                filter="url(#glow-soft)" 
                strokeLinejoin="round"
              />
              <polygon points="200,75 240,105 225,150 175,150 160,105" fill="url(#traditional-grid)" pointerEvents="none" />

              {/* Central bulb */}
              <circle cx="200" cy="120" r={14 * glowIntensity} fill="#ffffff" filter="url(#glow-bulb)" opacity="0.9" />

              {/* Connected loop rings for star-tip tails */}
              <circle cx="200" cy="165" r="2" fill="#ffd24d" />
              <circle cx="270" cy="210" r="2.5" fill="#ffd24d" />
              <circle cx="130" cy="210" r="2.5" fill="#ffd24d" />

              {/* Tails rendered from the tips */}
              {renderTailTassels(200, 166, 1, 0.95)}
              {renderTailTassels(270, 211, 2, 0.9)}
              {renderTailTassels(130, 211, 2, 0.9)}
            </g>
          )}

          {config.shape === 'bola' && (
            <g id="shape-bola" transform="translate(0, 30)">
              {/* LARGE RADIAL CIRCLE */}
              <circle cx="200" cy="125" r="65" fill={getPaneColor()} opacity="0.3" filter="url(#glow-bulb)" />
              
              {/* Rotating glowing segments of paper globe */}
              <path d="M 200,60 A 65,65 0 0,0 135,125 A 65,65 0 0,0 200,190 Z" fill={getPaneColor()} opacity="0.75" stroke="#ffe680" strokeWidth="1.2" />
              <path d="M 200,60 A 65,65 0 0,1 265,125 A 65,65 0 0,1 200,190 Z" fill="url(#grad-pane)" opacity="0.8" stroke="#ffe680" strokeWidth="1.2" />
              
              <path d="M 200,60 A 35,65 0 0,0 165,125 A 35,65 0 0,0 200,190 Z" fill={getPaneColor()} opacity="0.65" stroke="#ffe680" />
              <path d="M 200,60 A 35,65 0 0,1 235,125 A 35,65 0 0,1 200,190 Z" fill="url(#grad-pane)" stroke="#ffe680" />

              {/* Central Glowing core belt */}
              <polygon 
                points="135,125 155,110 245,110 265,125 245,140 155,140" 
                fill="url(#grad-core)" 
                stroke="url(#grad-border)" 
                strokeWidth="2.0" 
                filter="url(#glow-soft)"
              />

              <circle cx="200" cy="125" r={16 * glowIntensity} fill="#ffffff" filter="url(#glow-bulb)" opacity="0.95" />

              {/* Loop rings */}
              <circle cx="200" cy="190" r="2.5" fill="#ffd24d" />
              <circle cx="165" cy="180" r="2" fill="#ffd24d" />
              <circle cx="235" cy="180" r="2" fill="#ffd24d" />

              {/* Tails from sphere bottom edge */}
              {renderTailTassels(200, 191, 3, 1)}
              {renderTailTassels(165, 181, 1, 0.8)}
              {renderTailTassels(235, 181, 1, 0.8)}
            </g>
          )}
        </svg>
      </div>

      {/* 3. CLAY OIL LAMPS BAR (මැටි පහන්) - EXTREMELY TANGIBLE SRI LANKAN ACCENT */}
      <div className="absolute bottom-[10px] left-0 w-full px-8 flex justify-around items-end z-[5] pointer-events-auto">
        {lamps.map(lamp => (
          <div 
            key={lamp.id} 
            onClick={() => toggleLamp(lamp.id)}
            style={{ left: `${lamp.x}%` }}
            className="group flex flex-col items-center cursor-pointer select-none transition-transform active:scale-95"
            title="මැටි පහනක් දල්වන්න / නිවන්න"
          >
            {/* Flame */}
            {lamp.lit && (
              <div className="relative w-[14px] h-[22px] flex items-end justify-center -mb-[3px] animate-pulse">
                {/* Outermost fire halo glow */}
                <div className="absolute w-[28px] h-[28px] rounded-full bg-amber-500/30 blur-[6px] -bottom-[2px]"></div>
                {/* Inner fire shape */}
                <div className="w-[10px] h-[18px] rounded-full bg-gradient-to-t from-red-600 via-amber-400 to-yellow-100 rounded-b-xl shadow-[0_0_8px_rgba(245,158,11,0.9)] origin-bottom animate-bounce duration-1000"></div>
                {/* Core peak spark */}
                <div className="absolute w-[3px] h-[6px] rounded-full bg-white blur-[0.2px] bottom-[3px]"></div>
              </div>
            )}
            
            {/* Clay base bowl */}
            <svg width="45" height="18" viewBox="0 0 45 18">
              {/* Outer Clay Terracotta Pot style */}
              <path 
                d="M1,4 C8,1 37,1 44,4 C44,4 40,17 22.5,17 C5,17 1,4 1,4 Z" 
                fill={lamp.lit ? '#bf5b30' : '#8c3d1d'} 
                stroke="#59220a" 
                strokeWidth="1" 
              />
              {/* Inner oil line */}
              <ellipse cx="22.5" cy="4.5" rx="19.5" ry="2.5" fill={lamp.lit ? '#cc7a29' : '#331a00'} />
              {/* Cotton wick */}
              <line x1="22.5" y1="5" x2="22.5" y2={lamp.lit ? '-1' : '3'} stroke={lamp.lit ? '#ffeedd' : '#222222'} strokeWidth="1.8" />
            </svg>
            
            {/* Instruction tooltip on hover */}
            <span className="opacity-0 group-hover:opacity-100 absolute -bottom-5 text-[9px] font-mono text-yellow-500/75 transition-opacity pointer-events-none duration-300">
              {lamp.lit ? 'නිවන්න' : 'දල්වන්න'}
            </span>
          </div>
        ))}
      </div>

      {/* Atmospheric Audio Indicator and Overlay Watermark */}
      <div className="absolute top-4 left-4 z-[4] flex items-center space-x-2 pointer-events-none">
        <span className="font-mono text-[10px] tracking-widest text-yellow-500/55 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm shadow border border-yellow-500/10 uppercase">
          {config.shape} • {config.backgroundTheme}
        </span>
      </div>
    </div>
  );
}
