import React, { useState } from 'react';
import { LanternConfig, LanternShape, LightEffect, BackgroundTheme, FringeStyle, FringeLength } from '../types';
import { Sparkles, Palette, Lightbulb, Type, Compass, Play, Square, Volume2, VolumeX, ArrowRight, Check, Share2, Copy } from 'lucide-react';
import { ambientSynth } from '../utils/audio';

interface CardCreatorProps {
  config: LanternConfig;
  onChange: (newConfig: LanternConfig) => void;
  from: string;
  onChangeFrom: (val: string) => void;
  to: string;
  onChangeTo: (val: string) => void;
  message: string;
  onChangeMessage: (val: string) => void;
  onSubmit: () => void;
}

const PRESET_COLORS = [
  { name: 'Traditional / පැරණි', core: '#fcd34d', pane: '#ef4444', tail: '#fb923c' },
  { name: 'Peaceful / නිසල', core: '#9bdeac', pane: '#5cacca', tail: '#a8effc' },
  { name: 'Lotus Petal / නෙළුම්', core: '#fda4af', pane: '#ec4899', tail: '#fdf2f8' },
  { name: 'Royal Gold / රාජකීය', core: '#fef08a', pane: '#eab308', tail: '#fffbeb' },
  { name: 'Forest Dew / හරිත', core: '#86efac', pane: '#22c55e', tail: '#e9ffdb' },
  { name: 'Saffron / කහ', core: '#fed7aa', pane: '#ea580c', tail: '#fed7aa' }
];

const PREDEFINED_GREETINGS = [
  "පින්බර වෙසක් මංගල්‍යයක් වේවා! (Wishing a Blessed Vesak!)",
  "මෙත් සිතින් සිසිල් වන, ආලෝකයෙන් බැබළෙන පින්බර වෙසක් උත්සවයක් වේවා!",
  "සිත් තුළ සදහම් ආලෝකය පැතිරී ද්වේශය හා අඳුර දුරුවේවා! පින්බර වෙසක් වේවා!",
  "May the serene light of the Dharma illuminate your path towards perfect peace. Happy Vesak!",
  "Wishing you and your loved ones a blessed, calm, and enlightened Vesak festival!"
];

type CustomizerTab = 'shape' | 'colors' | 'decoration' | 'greeting';

export default function CardCreator({
  config,
  onChange,
  from,
  onChangeFrom,
  to,
  onChangeTo,
  message,
  onChangeMessage,
  onSubmit
}: CardCreatorProps) {
  const [activeTab, setActiveTab] = useState<CustomizerTab>('shape');
  const [soundPlaying, setSoundPlaying] = useState(false);

  const toggleBgSound = () => {
    if (soundPlaying) {
      ambientSynth.stop();
      setSoundPlaying(false);
    } else {
      ambientSynth.start();
      setSoundPlaying(true);
    }
  };

  const setConfigValue = <K extends keyof LanternConfig>(key: K, value: LanternConfig[K]) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const applyColorPreset = (core: string, pane: string, tail: string) => {
    onChange({
      ...config,
      colorCore: core,
      colorPane: pane,
      colorTail: tail
    });
    ambientSynth.playWindChime();
  };

  return (
    <div id="card-creator-panel" className="w-full flex flex-col h-full bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-neutral-800 p-6 shadow-xl text-stone-100 select-none">
      
      {/* Sound Controller & Heading */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
        <div>
          <h2 className="font-sans font-bold text-lg text-yellow-500 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            වෙසක් කූඩු නිර්මාණකරුවා
          </h2>
          <p className="text-xs text-neutral-400">ඔබේ හිතවතුන්ට ඩිජිටල් වෙසක් ආලෝකයක් තිළිණ කරන්න</p>
        </div>

        {/* Sensory Sound Synth Button */}
        <button
          onClick={toggleBgSound}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all duration-300 ${
            soundPlaying 
              ? 'bg-yellow-500/25 border-yellow-500/40 text-yellow-400 font-medium'
              : 'bg-neutral-850 border-neutral-700 text-stone-400 hover:text-stone-200'
          }`}
        >
          {soundPlaying ? (
            <>
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>නද ක්‍රියාත්මකයි</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span>සංගීතය</span>
            </>
          )}
        </button>
      </div>

      {/* STEP TABS FOR CUSTOMIZATION */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-950/70 rounded-xl mb-6 border border-neutral-800/40">
        {(['shape', 'colors', 'decoration', 'greeting'] as CustomizerTab[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                ambientSynth.playWindChime();
              }}
              className={`py-2 text-[11px] md:text-xs font-semibold rounded-lg capitalize transition-all duration-300 flex flex-col items-center gap-1 ${
                isActive 
                  ? 'bg-yellow-500 text-neutral-950 font-bold shadow' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-neutral-800/30'
              }`}
            >
              {tab === 'shape' && <Compass className="w-4 h-4" />}
              {tab === 'colors' && <Palette className="w-4 h-4" />}
              {tab === 'decoration' && <Lightbulb className="w-4 h-4" />}
              {tab === 'greeting' && <Type className="w-4 h-4" />}
              <span>
                {tab === 'shape' ? 'කූඩුවේ හැඩය' : 
                 tab === 'colors' ? 'වර්න සන්නාමය' : 
                 tab === 'decoration' ? 'ආලෝකය' : 'සුබපැතුම්'}
              </span>
            </button>
          );
        })}
      </div>

      {/* CORE CONTROLS SCROLLER */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 max-h-[420px] scrollbar-thin scrollbar-thumb-neutral-850">
        
        {/* TAB 1: SHAPES SELECTOR */}
        {activeTab === 'shape' && (
          <div className="space-y-4">
            <label className="text-sm font-bold text-stone-300 block mb-2">කූඩුවේ හැඩය තෝරන්න (Select Lantern Shape)</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'atapattama', mainL: 'අටපට්ටම', subL: 'Classic Octagon', desc: 'සම්ප්‍රදායික අටැස් කූඩුව' },
                { id: 'nelum', mainL: 'නෙළුම් කූඩුව', subL: 'Lotus Lantern', desc: 'විචිත්‍ර නෙළුම් මලක හැඩය' },
                { id: 'tharu', mainL: 'තරු කූඩුව', subL: 'Star Lantern', desc: 'ගගන තාරකාවක ආකෘතිය' },
                { id: 'bola', mainL: 'බෝල කූඩුව', subL: 'Globe Lantern', desc: 'සරල වටකුරු ගෝලීය කූඩුව' }
              ].map(item => {
                const isSelected = config.shape === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setConfigValue('shape', item.id as LanternShape);
                      ambientSynth.playWindChime();
                    }}
                    className={`p-4 rounded-xl border flex flex-col text-left transition-all relative ${
                      isSelected 
                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.06)]' 
                        : 'bg-neutral-950/40 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                    )}
                    <span className="font-bold text-sm tracking-tight">{item.mainL}</span>
                    <span className="text-[10px] text-neutral-400 font-mono tracking-wide">{item.subL}</span>
                    <span className="text-[11px] text-stone-500/90 mt-2 block">{item.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-neutral-800/40">
              <label className="text-sm font-bold text-stone-300 block mb-2">පසුබිම් මෝස්තරය (Choose Sunset Background Theme)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'starry', label: 'තරු පිරි දම් අහස', sub: 'Starry Cosmic' },
                  { id: 'temple', label: 'පන්සල වැව අසල', sub: 'Lakeside Stupa' },
                  { id: 'moonlight', label: 'පුන් පොහෝ සඳ රෑ', sub: 'Poya Moonlight' },
                  { id: 'buddhist-flag', label: 'ෂඩ් වර්ණය', sub: 'Buddhist Flag' }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setConfigValue('backgroundTheme', b.id as BackgroundTheme);
                      ambientSynth.playWindChime();
                    }}
                    className={`py-2 px-3 text-xs text-center rounded-lg border transition-all ${
                      config.backgroundTheme === b.id 
                        ? 'border-yellow-500/70 bg-yellow-500/10 text-yellow-400' 
                        : 'bg-neutral-950/30 border-neutral-800 text-stone-400 hover:text-stone-300'
                    }`}
                  >
                    <div className="font-medium">{b.label}</div>
                    <div className="text-[9px] text-neutral-500 font-mono">{b.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COLORS PALETTE */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            
            {/* Quick Presets */}
            <div>
              <label className="text-sm font-bold text-stone-300 block mb-2.5">සම්ප්‍රදායික වර්ණ සංකලන (Traditional Palettes)</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_COLORS.map(preset => {
                  const isActive = config.colorCore === preset.core && config.colorPane === preset.pane && config.colorTail === preset.tail;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset.core, preset.pane, preset.tail)}
                      className={`p-2.5 rounded-lg border text-left bg-neutral-950/40 transition-all flex items-center justify-between ${
                        isActive ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{preset.name}</span>
                        <span className="text-[9px] text-neutral-500">සව්කොළ වර්ණ</span>
                      </div>
                      <div className="flex gap-1.5 ml-2">
                        <div className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.core }} />
                        <div className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.pane }} />
                        <div className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.tail }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Individual Color Fields */}
            <div className="border-t border-neutral-800/40 pt-4 space-y-4">
              <label className="text-xs font-bold text-yellow-500/80 tracking-widest uppercase block">ඔබේම වර්ණ තෝරන්න (Custom Sawkola Color)</label>
              
              <div className="space-y-3.5">
                {/* 1. Core color */}
                <div className="flex items-center justify-between bg-neutral-950/30 p-2.5 rounded-lg border border-neutral-800/30">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-stone-200">මැද හරය (Core Paper Color)</span>
                    <span className="text-[9.5px] text-neutral-500">කූඩුවේ ප්‍රධාන මැද රාමුව</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400 uppercase">{config.colorCore}</span>
                    <input 
                      type="color" 
                      value={config.colorCore} 
                      onChange={(e) => setConfigValue('colorCore', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-700 bg-transparent overflow-hidden"
                    />
                  </div>
                </div>

                {/* 2. Side panels/petals */}
                <div className="flex items-center justify-between bg-neutral-950/30 p-2.5 rounded-lg border border-neutral-800/30">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-stone-200">පැති පෙති / කන් (Pane Petals Color)</span>
                    <span className="text-[9.5px] text-neutral-500">පැති පියන් හා ත්‍රිකෝණ කන්</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400 uppercase">{config.colorPane}</span>
                    <input 
                      type="color" 
                      value={config.colorPane} 
                      onChange={(e) => setConfigValue('colorPane', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-700 bg-transparent overflow-hidden"
                    />
                  </div>
                </div>

                {/* 3. Fringe tails */}
                <div className="flex items-center justify-between bg-neutral-950/30 p-2.5 rounded-lg border border-neutral-800/30">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-stone-200">රැළි හා රෑන් වර්ණය (Tassels / Fringe Color)</span>
                    <span className="text-[9.5px] text-neutral-500">පහළට ඇදෙන සව්කොළ රැලි</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400 uppercase">{config.colorTail}</span>
                    <input 
                      type="color" 
                      value={config.colorTail} 
                      onChange={(e) => setConfigValue('colorTail', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-700 bg-transparent overflow-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DECORATION & LIGHTING */}
        {activeTab === 'decoration' && (
          <div className="space-y-6">
            
            {/* Lighting effects */}
            <div>
              <label className="text-sm font-bold text-stone-300 block mb-2.5">ආලෝකකරණය (Select Bulb / Glow Lighting Effect)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'steady', title: 'නිසල වැදගත් එළිය', desc: 'Constant Warm' },
                  { id: 'pulse', title: 'හුස්ම ගන්නා ආලෝකය', desc: 'Breathing Pulse' },
                  { id: 'candle', title: 'ඉටිපන්දම් සිළුව', desc: 'Candlelight Flicker' },
                  { id: 'rainbow', title: 'දේදුනු වර්ණ චක්‍රය', desc: 'Prismatic Rainbow' }
                ].map(eff => (
                  <button
                    key={eff.id}
                    onClick={() => {
                      setConfigValue('lightEffect', eff.id as LightEffect);
                      ambientSynth.playWindChime();
                    }}
                    className={`py-2 px-3 text-left rounded-lg border transition-all ${
                      config.lightEffect === eff.id 
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' 
                        : 'bg-neutral-950/30 border-neutral-800 text-stone-400 hover:text-stone-300'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{eff.title}</div>
                    <div className="text-[9.5px] text-neutral-500 font-mono tracking-wide">{eff.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fringe style & length */}
            <div className="border-t border-neutral-800/40 pt-4 grid grid-cols-2 gap-4">
              
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-2">රැළි කැපීමේ හැඩය (Fringe Cut)</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'straight', name: 'කෙලින් කෑලි', sub: 'Straight' },
                    { id: 'zigzag', name: 'විග්සැග් කැපුම', sub: 'Serrated' },
                    { id: 'wave', name: 'රළ හැඩය', sub: 'Wavy lines' }
                  ].map(fr => (
                    <button
                      key={fr.id}
                      onClick={() => {
                        setConfigValue('fringeStyle', fr.id as FringeStyle);
                        ambientSynth.playWindChime();
                      }}
                      className={`w-full py-1.5 px-2.5 text-xs text-left rounded border transition-all flex items-center justify-between ${
                        config.fringeStyle === fr.id 
                          ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-500' 
                          : 'bg-neutral-950/20 border-neutral-850 text-stone-400 hover:text-stone-300'
                      }`}
                    >
                      <span>{fr.name}</span>
                      <span className="text-[9px] text-neutral-500 font-mono">{fr.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-2">රැළි දිග ප්‍රමාණය (Fringe Length)</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'short', name: 'කෙටි රැළි', sub: 'Short (70px)' },
                    { id: 'medium', name: 'සාමාන්‍ය', sub: 'Mid (120px)' },
                    { id: 'long', name: 'දිගු ආලෝකය', sub: 'Long Tassels' }
                  ].map(le => (
                    <button
                      key={le.id}
                      onClick={() => {
                        setConfigValue('fringeLength', le.id as FringeLength);
                        ambientSynth.playWindChime();
                      }}
                      className={`w-full py-1.5 px-2.5 text-xs text-left rounded border transition-all flex items-center justify-between ${
                        config.fringeLength === le.id 
                          ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-500' 
                          : 'bg-neutral-950/20 border-neutral-850 text-stone-400'
                      }`}
                    >
                      <span>{le.name}</span>
                      <span className="text-[9px] in-block opacity-40 font-mono">{(le.id)}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Slider parameters */}
            <div className="border-t border-neutral-800/40 pt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-stone-300">ආලෝකයේ දීප්තිය (Glow Strength)</span>
                  <span className="text-xs text-yellow-500 font-mono">{Math.round(config.glowStrength * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.2" 
                  max="1.0" 
                  step="0.05"
                  value={config.glowStrength}
                  onChange={(e) => setConfigValue('glowStrength', parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-neutral-950 rounded-lg outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-stone-300">සුළඟෙහි වේගය (Sway Swaying Speed)</span>
                  <span className="text-xs text-yellow-500 font-mono">x {config.rotationSpeed}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.5"
                  value={config.rotationSpeed}
                  onChange={(e) => setConfigValue('rotationSpeed', parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-neutral-950 rounded-lg outline-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: PERSONAL WISH MESSAGE */}
        {activeTab === 'greeting' && (
          <div className="space-y-4">
            
            {/* Sender & Recipient names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1.5">ඔබේ නම (From / Sender)</label>
                <input 
                  type="text" 
                  value={from}
                  onChange={(e) => onChangeFrom(e.target.value)}
                  placeholder="Amal Bandara"
                  className="w-full px-3 py-2 bg-neutral-950/50 border border-neutral-800 rounded-lg focus:outline-none focus:border-yellow-500 text-xs text-stone-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1.5">ලබන්නාගේ නම (To / Recipient)</label>
                <input 
                  type="text" 
                  value={to}
                  onChange={(e) => onChangeTo(e.target.value)}
                  placeholder="Sumudu Perera"
                  className="w-full px-3 py-2 bg-neutral-950/50 border border-neutral-800 rounded-lg focus:outline-none focus:border-yellow-500 text-xs text-stone-100"
                />
              </div>
            </div>

            {/* Custom wish box */}
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1.5">වෙසක් පණිවිඩය (Vesak Greeting Card Message)</label>
              <textarea 
                rows={3}
                value={message}
                onChange={(e) => onChangeMessage(e.target.value)}
                placeholder="සැමට නිදුක් නිරෝගී සතුට පිරි පින්බර වෙසක් මංගල්‍යයක් වේවා!"
                className="w-full px-3 py-2.5 bg-neutral-950/50 border border-neutral-800 rounded-lg focus:outline-none focus:border-yellow-500 text-xs text-stone-100 resize-none"
              />
            </div>

            {/* Predefined Templates */}
            <div>
              <span className="text-[11px] font-bold text-stone-400 block mb-2">පවතින ආදර්ශ පැතුම් (Quick Blessings Templates)</span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-850">
                {PREDEFINED_GREETINGS.map((greet, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onChangeMessage(greet);
                      ambientSynth.playWindChime();
                    }}
                    className="w-full text-left p-2 rounded border border-neutral-800/40 bg-neutral-950/20 text-stone-300 hover:text-yellow-500 hover:bg-neutral-950/50 text-[11px] leading-relaxed transition-all"
                  >
                    {greet}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* SUBMIT ACTION BUTTON AT THE BOTTOM */}
      <div className="mt-6 border-t border-neutral-800/60 pt-4 flex flex-col gap-2">
        <button
          onClick={() => {
            ambientSynth.playWindChime();
            onSubmit();
          }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-neutral-950 font-bold text-sm py-3 px-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:from-yellow-400 hover:to-amber-500 active:scale-98 transition-all"
        >
          <span>වෙසක් සුබපැතුම් පත සාදන්න (Generate Card Link)</span>
          <ArrowRight className="w-4 h-4 text-neutral-950 stroke-[3]" />
        </button>
        <div className="text-center text-[10px] text-neutral-500 font-mono pt-1 font-medium">
          විශ්වය සොයා • Explore the Universe Digital Wesak Kudu
        </div>
      </div>

    </div>
  );
}
