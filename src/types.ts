export type LanternShape = 'atapattama' | 'nelum' | 'bola' | 'tharu';
export type LightEffect = 'steady' | 'pulse' | 'candle' | 'rainbow';
export type BackgroundTheme = 'starry' | 'temple' | 'moonlight' | 'buddhist-flag';
export type FringeStyle = 'straight' | 'zigzag' | 'wave';
export type FringeLength = 'short' | 'medium' | 'long';

export interface LanternConfig {
  shape: LanternShape;
  colorCore: string;
  colorPane: string;
  colorTail: string;
  lightEffect: LightEffect;
  backgroundTheme: BackgroundTheme;
  fringeStyle: FringeStyle;
  fringeLength: FringeLength;
  glowStrength: number; // 0.2 to 1.0
  rotationSpeed: number; // 0 (still) to 5 (fast wind)
}

export interface GreetingCardData {
  from: string;
  to: string;
  message: string;
  isCustomMessage: boolean;
  lanternConfig: LanternConfig;
}
