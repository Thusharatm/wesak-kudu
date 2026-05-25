import React, { useState, useEffect } from 'react';
import { LanternConfig, LanternShape, LightEffect, BackgroundTheme, FringeStyle, FringeLength } from './types';
import LanternPreview from './components/LanternPreview';
import CardCreator from './components/CardCreator';
import { ambientSynth } from './utils/audio';
import { Sparkles, Gift, Heart, Send, Check, Copy, Share2, RefreshCw, Volume2, VolumeX, Lightbulb, Play, ArrowLeft, HeartHandshake } from 'lucide-react';

const DEFAULT_CONFIG: LanternConfig = {
  shape: 'atapattama',
  colorCore: '#fcd34d', // warm yellow
  colorPane: '#ef4444', // vibrant red
  colorTail: '#fb923c', // golden orange
  lightEffect: 'pulse',
  backgroundTheme: 'starry',
  fringeStyle: 'straight',
  fringeLength: 'medium',
  glowStrength: 0.8,
  rotationSpeed: 1.5,
};

export default function App() {
  const [config, setConfig] = useState<LanternConfig>(DEFAULT_CONFIG);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  
  // App view flow states
  const [isReceivedMode, setIsReceivedMode] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');

  // Floating fireflies/particles count for background ambient feeling
  const [particles] = useState(Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 85}%`,
    left: `${Math.random() * 95}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 8}s`,
    size: 2 + Math.random() * 4
  })));

  // Parse query string parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramFrom = params.get('from');
    const paramTo = params.get('to');
    const paramMsg = params.get('msg');
    
    if (paramFrom || paramTo || paramMsg) {
      setIsReceivedMode(true);
      setFrom(paramFrom || '');
      setTo(paramTo || '');
      setMessage(paramMsg || '');

      // Parse lantern variables
      const shape = params.get('shape') as LanternShape;
      const colorCore = params.get('c_core');
      const colorPane = params.get('c_pane');
      const colorTail = params.get('c_tail');
      const lightEffect = params.get('light') as LightEffect;
      const backgroundTheme = params.get('bg') as BackgroundTheme;
      const fringeStyle = params.get('f_style') as FringeStyle;
      const fringeLength = params.get('f_len') as FringeLength;
      const glowStrength = params.get('glow');
      const rotationSpeed = params.get('rot');

      setConfig({
        shape: shape || DEFAULT_CONFIG.shape,
        colorCore: colorCore || DEFAULT_CONFIG.colorCore,
        colorPane: colorPane || DEFAULT_CONFIG.colorPane,
        colorTail: colorTail || DEFAULT_CONFIG.colorTail,
        lightEffect: lightEffect || DEFAULT_CONFIG.lightEffect,
        backgroundTheme: backgroundTheme || DEFAULT_CONFIG.backgroundTheme,
        fringeStyle: fringeStyle || DEFAULT_CONFIG.fringeStyle,
        fringeLength: fringeLength || DEFAULT_CONFIG.fringeLength,
        glowStrength: glowStrength ? parseFloat(glowStrength) : DEFAULT_CONFIG.glowStrength,
        rotationSpeed: rotationSpeed ? parseFloat(rotationSpeed) : DEFAULT_CONFIG.rotationSpeed,
      });
    }
  }, []);

  // Handle building the share URL link
  const handleSubmitCard = () => {
    const params = new URLSearchParams();
    if (from.trim()) params.set('from', from.trim());
    if (to.trim()) params.set('to', to.trim());
    if (message.trim()) params.set('msg', message.trim());
    
    params.set('shape', config.shape);
    params.set('c_core', config.colorCore);
    params.set('c_pane', config.colorPane);
    params.set('c_tail', config.colorTail);
    params.set('light', config.lightEffect);
    params.set('bg', config.backgroundTheme);
    params.set('f_style', config.fringeStyle);
    params.set('f_len', config.fringeLength);
    params.set('glow', config.glowStrength.toString());
    params.set('rot', config.rotationSpeed.toString());

    const finalUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    setGeneratedUrl(finalUrl);
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
      ambientSynth.playWindChime();
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleOpenGift = () => {
    setIsOpened(true);
    // Play sparkling sound & launch chimes synthesiser
    ambientSynth.start();
    ambientSynth.playWindChime();
  };

  const handleCreateOwn = () => {
    // Reset back to standard editing workspace
    setIsReceivedMode(false);
    setIsOpened(false);
    setConfig(DEFAULT_CONFIG);
    setFrom('');
    setTo('');
    setMessage('');
    // Remove search query from URL without reloading
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-[#03030d] text-stone-100 flex flex-col font-sans relative overflow-x-hidden select-none">
      
      {/* BACKGROUND FLOATING GLOW ANIMATIONS (කණාමැදිරියෝ / Fireflies) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-yellow-400/20 mix-blend-screen"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              filter: `blur(${p.size / 2}px)`,
              boxShadow: `0 0 ${p.size * 3}px rgba(234, 179, 8, 0.4)`,
              animation: `float-particle ${p.duration} infinite ease-in-out ${p.delay}`
            }}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) translateX(20px) scale(1.3); opacity: 0.85; }
        }
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.85; }
        }
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(234, 179, 8, 0.2);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.4);
        }
      `}} />

      {/* RENDER VIEW 1: RECEIVED GREETING ENVELOPE (තිලිණ පෙට්ටිය) */}
      {isReceivedMode && !isOpened ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen relative z-10 bg-[radial-gradient(circle_at_center,_#0b0c24_0%,_#02020a_100%)]">
          
          <div 
            className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border border-yellow-500/20 p-8 rounded-3xl text-center shadow-2xl space-y-6 relative"
            style={{ animation: 'subtle-float 4s infinite ease-in-out' }}
          >
            {/* Elegant Buddhist / Lotus decorative borders */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-yellow-500/40 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-yellow-500/40 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-yellow-500/40 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-yellow-500/40 rounded-br-lg"></div>

            {/* Glowing Lantern Icon Box */}
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-500/20 to-amber-500/30 flex items-center justify-center border border-yellow-400/40 relative">
              <div className="absolute inset-0 rounded-full bg-yellow-500/10 animate-ping opacity-40"></div>
              <Gift className="w-10 h-10 text-yellow-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono tracking-[0.25em] text-yellow-500/80 uppercase font-bold block">Digital Vesak Blessing</span>
              <h2 className="text-2xl font-bold tracking-tight text-stone-100 font-sans">ඔබට වෙසක් තිලිණයක්!</h2>
              <p className="text-xs text-neutral-400">ඔබ වෙනුවෙන්ම නිර්මාණය කළ විශේෂිත ඩිජිටල් වෙසක් කූඩුවක් සහ පැතුම් පතක් මෙහි ඇත.</p>
            </div>

            {/* Recipient / Sender Badge */}
            <div className="py-4 px-6 bg-neutral-950/60 rounded-2xl border border-neutral-800/60 flex flex-col items-center justify-center gap-1">
              {to && (
                <div className="text-xs text-stone-400">
                  ලබන්නා: <span className="text-stone-100 font-bold">{to}</span>
                </div>
              )}
              {from && (
                <div className="text-xs text-yellow-500/80 font-medium">
                  එවන්නා: <span className="text-yellow-400 font-bold font-sans">{from}</span>
                </div>
              )}
            </div>

            {/* Activation Button */}
            <button
              onClick={handleOpenGift}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-neutral-950 font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-yellow-500/10 hover:from-yellow-400 hover:to-amber-500 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 text-sm"
            >
              <Lightbulb className="w-4 h-4 text-neutral-950 fill-neutral-950" />
              <span>තිළිණය විවෘත කරන්න (Reveal Light)</span>
            </button>
          </div>

          <div className="mt-8 text-[11px] text-neutral-500 font-mono font-medium">
            විශ්වය සොයා • Digital Wesak Kudu
          </div>
        </div>
      ) : (
        /* RENDER VIEW 2 & 3: OPEN ACTIVE SCREEN (GREETING DISPLAY / DESIGNER WORKSPACE) */
        <div className="flex-1 flex flex-col relative z-10">
          
          {/* HEADER NAV */}
          <header className="border-b border-stone-900 bg-neutral-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-sans font-extrabold text-base tracking-wide text-stone-100 flex items-center gap-1.5">
                  විශ්වය සොයා
                  <span className="text-[10px] bg-yellow-500/15 text-yellow-500 font-mono px-1.5 py-0.5 rounded font-medium">සිංහල</span>
                </h1>
                <p className="text-[10.5px] text-stone-400">ඩිජිටල් වෙසක් කූඩු තිළිණය</p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            {isReceivedMode && (
              <button
                onClick={handleCreateOwn}
                className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/60 hover:bg-neutral-800 text-xs px-3.5 py-1.5 rounded-full text-stone-300 hover:text-stone-100 transition-all shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>මගේම කූඩුවක් හදන්න (Create Mine)</span>
              </button>
            )}
          </header>

          {/* MAIN TWO-COLUMN SPLIT CONTAINER */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: INTERACTIVE PREVIEW SCREEN (7-Cols on Large screens) */}
            <div className="lg:col-span-7 flex flex-col gap-5 w-full">
              
              {/* Dynamic preview canvas */}
              <LanternPreview config={config} />

              {/* RECEIVED CARD MESSAGE GREETING CONTAINER */}
              {isReceivedMode && isOpened && (
                <div 
                  className="bg-gradient-to-br from-[#120e06] to-[#04040a] border border-yellow-500/15 p-6 rounded-2xl flex flex-col md:flex-row items-start gap-4 relative shadow-lg"
                  style={{ animation: 'subtle-float 6s infinite ease-in-out' }}
                >
                  <div className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </div>

                  <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                    <Heart className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 text-xs">
                      {from && (
                        <span className="text-yellow-400 font-bold">
                          {from} <span className="text-neutral-500 font-normal">එවූ</span>
                        </span>
                      )}
                      <span className="text-stone-300 font-semibold">වෙසක් සුබපැතුම් පණිවිඩය:</span>
                    </div>
                    
                    <p className="text-sm font-medium text-stone-200/95 leading-relaxed bg-black/20 p-3.5 rounded-xl border border-neutral-850">
                      "{message || "සැමට පින්බර වෙසක් මංගල්‍යයක් වේවා!"}"
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono pr-2.5">
                      <span>ලබන්නා: {to || "ඔබ සැම"}</span>
                      <span>Sri Lankan Digital Vesak Gift Card</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Small Helpful Tutorial Hint banner */}
              {!isReceivedMode && (
                <div className="p-3.5 bg-neutral-950/40 rounded-xl border border-neutral-900 text-[11px] text-stone-400 flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"></div>
                  <span>
                    <strong>භාවිතය:</strong> කූඩුව මත ක්ලික් කිරීමෙන් හෝ කර්සරය එහා මෙහා කිරීමෙන් කූඩුව සෙලවීමට මෙන්ම සීනු නාදය නැංවීමට හැක. පහළ ඇති මැටි පහන් මත ක්ලික් කර ඒවා දැල්වීම සිදුකල හැක.
                  </span>
                </div>
              )}
            </div>

            {/* COLUMN 2: WORKSPACE CONTROL BLOCK OR RECEIVED RECEIVED-GIFT-RECIPIENT CALL-TO-ACTION (5-Cols) */}
            <div className="lg:col-span-5 w-full h-full">
              {isReceivedMode && isOpened ? (
                /* Secondary card interface in Received mode (Prompting them to build one themselves) */
                <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 p-6 rounded-2xl flex flex-col gap-6 text-stone-100 shadow-xl">
                  
                  <div className="space-y-2.5">
                    <h3 className="font-sans font-extrabold text-lg text-yellow-500 flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-yellow-500" />
                      ධර්මයේ ආලෝකය තිළිණ කරන්න
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      මෙම වෙසක් කූඩුව ඔබේ මිතුරා විසින් තෝරාගත් සව්කොළ වර්ණ, ආලෝක සැකසුම් හා රැලි මෝස්තරයන් ගෙන් සමන්විත වේ. ඔබටත් ඔබේම වෙසක් කූඩුවක් තත්පර කිහිපයකින් නිමවා, ලස්සන පැතුමක් ලියා ඔබේම හිතවතුන් අතරේ බෙදාහැරිය හැක.
                    </p>
                  </div>

                  {/* Interactive Details list of the received lantern */}
                  <div className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-850 space-y-3.5 text-xs text-neutral-400">
                    <div className="flex justify-between border-b border-neutral-900 pb-2">
                      <span>කූඩුවේ හැඩය (Lantern Pattern):</span>
                      <strong className="text-stone-200 capitalize">{config.shape}</strong>
                    </div>
                    <div className="flex justify-between border-b border-neutral-900 pb-2">
                      <span>ආලෝකය (Bulb Effect):</span>
                      <strong className="text-stone-200 capitalize">{config.lightEffect === 'steady' ? 'Steady Glow' : config.lightEffect === 'pulse' ? 'Pulse Breathing' : config.lightEffect === 'candle' ? 'Candle Flame' : 'Rainbow cycle'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-neutral-900 pb-2">
                      <span>රෑන් මෝස්තරය (Fringe Style):</span>
                      <strong className="text-stone-200 capitalize">{config.fringeStyle} ({config.fringeLength})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>පසුබිම් පරිසරය (Atmosphere):</span>
                      <strong className="text-stone-200 capitalize">{config.backgroundTheme}</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleCreateOwn}
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-neutral-950 font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.15)] flex items-center justify-center gap-2 hover:from-yellow-400 hover:to-amber-500 transition-all font-sans text-sm"
                    >
                      <Sparkles className="w-4 h-4 text-neutral-950" />
                      <span>මගේම වෙසක් කූඩුවක් සාදන්න (Make My Own)</span>
                    </button>
                  </div>

                  <div className="text-center text-[10px] text-neutral-500 font-mono mt-1">
                    Spread Light & Kindness This Holy Vesak
                  </div>

                </div>
              ) : (
                /* DESIGNER CONTROLLER PANEL */
                <CardCreator 
                  config={config} 
                  onChange={setConfigValue => setConfig(setConfigValue)}
                  from={from}
                  onChangeFrom={setFrom}
                  to={to}
                  onChangeTo={setTo}
                  message={message}
                  onChangeMessage={setMessage}
                  onSubmit={handleSubmitCard}
                />
              )}
            </div>

          </main>
          
          {/* SECURE PERSISTENT FOOTER */}
          <footer className="mt-auto border-t border-stone-900/40 bg-neutral-950/20 py-4 text-center text-xs text-neutral-500/80 font-mono">
            විශ්වය සොයා ඩිජිටල් වෙසක් ආලෝකය • © 2026 Digital Wesak Kudu Creator
          </footer>

        </div>
      )}

      {/* SHARE LINKS MODAL DIALOG */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
          
          <div className="w-full max-w-md bg-neutral-900 border border-yellow-500/30 rounded-2xl overflow-hidden shadow-2xl relative" style={{ animation: 'subtle-float 5s ease-in-out' }}>
            
            {/* Modal header */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-neutral-800 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-yellow-500" />
                <h3 className="font-sans font-bold text-sm text-yellow-500 tracking-tight">වෙසක් සුබපැතුම් ලින්ක් එක සුදානම්!</h3>
              </div>
              <button 
                onClick={() => {
                  setShowShareModal(false);
                  ambientSynth.playWindChime();
                }}
                className="text-stone-400 hover:text-stone-100 text-xs font-mono font-bold bg-neutral-800/40 w-6 h-6 rounded-full flex items-center justify-center border border-neutral-700 hover:border-neutral-600 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-300 leading-relaxed">
                ඔබ සැකසූ වෙසක් කූඩුව සහ පැතුම අඩංගු සබැඳිය (Shareable Link) සාර්ථකව නිර්මාණය කර ඇත. පහත ඇති ලින්ක් එක කොපි කර ඔබගේ හිතමිතුරන්ට, පවුලේ අයට WhatsApp, Messenger හෝ Facebook මඟින් එවන්න!
              </p>

              {/* Box URL Display */}
              <div className="flex items-center gap-2 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="bg-transparent text-neutral-400 text-xs font-mono w-full select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                    copyStatus 
                      ? 'bg-emerald-600 text-stone-100' 
                      : 'bg-yellow-500 text-neutral-950 hover:bg-yellow-400'
                  }`}
                  title="කොපි කරන්න"
                >
                  {copyStatus ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic instruction previews */}
              <div className="bg-neutral-950/30 p-3.5 rounded-xl border border-neutral-850/60 text-[11px] text-neutral-400 space-y-2">
                <div className="text-yellow-500/80 font-bold">මිතුරාට පෙනෙන්නේ කෙසේද? (Recipient View)</div>
                <p>සබැඳිය ක්ලික් කළ විට, ඔබේ මිතුරාට මුලින්ම ලස්සන "තිළිණ පෙට්ටිය" දැකගත හැකි අතර එය විවෘත කල සැණින් ඔබ තැනූ කූඩුව ඔවුන් ඉදිරියේ දැල්වී ඔබ ලියූ හදපිරි වෙසක් සුබපැතුම් දර්ශනය වනු ලබයි.</p>
              </div>

              {/* Quick WhatsApp share action */}
              <div className="pt-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `ඔබ වෙනුවෙන්ම නිර්මාණය කළ විශේෂිත ඩිජිටල් වෙසක් කූඩුවක් මෙන්න! විවෘත කරන්න: ` + generatedUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-stone-150 bg-green-600 hover:bg-green-500 transition-all text-xs flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(22,163,74,0.15)]"
                >
                  <Send className="w-4 h-4 text-stone-100" />
                  <span>WhatsApp මඟින් යවන්න (Share via WhatsApp)</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
