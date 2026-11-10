import React, { useState, useEffect } from 'react';
import { MultimeterState } from '../types/mechatronics';
import { 
  Volume2, 
  VolumeX, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Power, 
  Cpu, 
  Sliders, 
  Info, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  ArrowRightLeft,
  Activity,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface DigitalMultimeterProps {
  state: MultimeterState;
  onChange: (newState: Partial<MultimeterState>) => void;
  measuredVoltage?: number;
  measuredCurrent?: number;
  measuredResistance?: number;
}

// Preset test components for the Ohmmeter workbench
type TestComponentType = 
  | 'resistor_single'
  | 'potentiometer'
  | 'open_circuit'
  | 'short_circuit'
  | 'series_resistors'
  | 'parallel_resistors'
  | 'diode_junction'
  | 'dc_motor_coil'
  | 'relay_coil'
  | 'bulb_filament';

interface PresetResistor {
  name: string;
  value: number; // in Ohms
  label: string;
}

const PRESET_RESISTORS: PresetResistor[] = [
  { name: '10 Ω', value: 10, label: '10 أوم (مقاومة منخفضة)' },
  { name: '47 Ω', value: 47, label: '47 أوم' },
  { name: '100 Ω', value: 100, label: '100 أوم' },
  { name: '220 Ω', value: 220, label: '220 أوم (حماية LED)' },
  { name: '330 Ω', value: 330, label: '330 أوم (شائعة)' },
  { name: '470 Ω', value: 470, label: '470 أوم' },
  { name: '1 kΩ', value: 1000, label: '1 كيلو أوم' },
  { name: '2.2 kΩ', value: 2200, label: '2.2 كيلو أوم' },
  { name: '4.7 kΩ', value: 4700, label: '4.7 كيلو أوم (Pull-up)' },
  { name: '10 kΩ', value: 10000, label: '10 كيلو أوم (قياسية)' },
  { name: '47 kΩ', value: 47000, label: '47 كيلو أوم' },
  { name: '100 kΩ', value: 100000, label: '100 كيلو أوم' },
  { name: '1 MΩ', value: 1000000, label: '1 ميجا أوم' },
  { name: '10 MΩ', value: 10000000, label: '10 ميجا أوم (عالية جداً)' }
];

export const DigitalMultimeter: React.FC<DigitalMultimeterProps> = ({
  state,
  onChange,
  measuredVoltage = 5.0,
  measuredCurrent = 0.025,
  measuredResistance = 1000,
}) => {
  // Meter Display & Sound
  const [backlight, setBacklight] = useState(true);
  const [hold, setHold] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ohmRange, setOhmRange] = useState<'AUTO' | '200' | '2k' | '20k' | '200k' | '2M' | '20M'>('AUTO');
  
  // View mode: 'compact' (standalone meter) or 'workbench' (meter + Ohmmeter testing board)
  const [activeView, setActiveView] = useState<'workbench' | 'compact'>('workbench');

  // Ohmmeter Workbench State
  // CRITICAL SAFETY RULE: Resistance can ONLY be measured when power is disconnected!
  const [isPowerDisconnected, setIsPowerDisconnected] = useState<boolean>(true);
  const [liveCircuitVoltage, setLiveCircuitVoltage] = useState<number>(12.0); // simulated voltage if power is ON
  
  // Component under test
  const [testComponent, setTestComponent] = useState<TestComponentType>('resistor_single');
  const [selectedResistorValue, setSelectedResistorValue] = useState<number>(1000);
  const [customResValue, setCustomResValue] = useState<string>('1000');
  const [isCustomResistor, setIsCustomResistor] = useState<boolean>(false);

  // Potentiometer settings (0 - 100%, total 10k)
  const [potPercent, setPotPercent] = useState<number>(50);
  const [potMeasureTerminal, setPotMeasureTerminal] = useState<'AW' | 'WB' | 'AB'>('AW');

  // Series / Parallel secondary resistor
  const [resistor2Value, setResistor2Value] = useState<number>(2200);

  // Diode orientation
  const [diodeBias, setDiodeBias] = useState<'forward' | 'reverse'>('forward');

  // Probes connection status
  const [probeRedConnected, setProbeRedConnected] = useState<boolean>(true);
  const [probeBlackConnected, setProbeBlackConnected] = useState<boolean>(true);
  const [probesShortedTogether, setProbesShortedTogether] = useState<boolean>(false);

  // Audio beeper
  const playTone = (frequency: number, duration: number, type: OscillatorType = 'square') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  };

  // Switch to Resistance mode automatically if student clicks Ohmmeter tool
  useEffect(() => {
    if (activeView === 'workbench' && state.mode !== 'RES' && state.mode !== 'CONT') {
      onChange({ mode: 'RES' });
    }
  }, [activeView]);

  // Compute calculated resistance based on selected component
  const computeWorkbenchResistance = (): { value: number | 'OL'; isPowerHazard: boolean } => {
    // 1. SAFETY INTERLOCK: If power is connected to the circuit, OHMMETER IS HAZARD!
    if (!isPowerDisconnected && liveCircuitVoltage > 0.5) {
      return { value: 'OL', isPowerHazard: true };
    }

    // 2. Probes shorted together (Probe-to-Probe zero test)
    if (probesShortedTogether) {
      return { value: 0.03, isPowerHazard: false };
    }

    // 3. Probes disconnected / floating in air
    if (!probeRedConnected || !probeBlackConnected) {
      return { value: 'OL', isPowerHazard: false };
    }

    // 4. Calculate by component type
    switch (testComponent) {
      case 'open_circuit':
        // Open circuit / Air gap / Broken wire -> Infinite Resistance (O.L)
        return { value: 'OL', isPowerHazard: false };

      case 'short_circuit':
        // Direct wire jumper / switch closed -> near 0 Ohms
        return { value: 0.02, isPowerHazard: false };

      case 'resistor_single': {
        const val = isCustomResistor ? Math.max(0.1, parseFloat(customResValue) || 1000) : selectedResistorValue;
        return { value: val, isPowerHazard: false };
      }

      case 'potentiometer': {
        const totalPot = 10000; // 10k
        if (potMeasureTerminal === 'AB') {
          return { value: totalPot, isPowerHazard: false }; // Total element
        } else if (potMeasureTerminal === 'AW') {
          return { value: Math.max(0.5, Math.round(totalPot * (potPercent / 100))), isPowerHazard: false };
        } else {
          return { value: Math.max(0.5, Math.round(totalPot * ((100 - potPercent) / 100))), isPowerHazard: false };
        }
      }

      case 'series_resistors': {
        // R_total = R1 + R2
        const r1 = isCustomResistor ? Math.max(0.1, parseFloat(customResValue) || 1000) : selectedResistorValue;
        return { value: r1 + resistor2Value, isPowerHazard: false };
      }

      case 'parallel_resistors': {
        // R_total = (R1 * R2) / (R1 + R2)
        const r1 = isCustomResistor ? Math.max(0.1, parseFloat(customResValue) || 1000) : selectedResistorValue;
        const parallel = (r1 * resistor2Value) / (r1 + resistor2Value);
        return { value: parallel, isPowerHazard: false };
      }

      case 'diode_junction':
        // Forward: internal meter test current creates low drop (~650 kΩ equivalent test resistance)
        // Reverse: practically infinite resistance (O.L)
        if (diodeBias === 'forward') {
          return { value: 580, isPowerHazard: false }; // ~580 Ω low dynamic resistance in test current
        } else {
          return { value: 'OL', isPowerHazard: false }; // Reverse blocking = Open Circuit
        }

      case 'dc_motor_coil':
        // Small 5V/12V DC motor armature coil resistance ~12.5 Ω
        return { value: 12.4, isPowerHazard: false };

      case 'relay_coil':
        // 12V Relay coil resistance ~75 Ω
        return { value: 74.8, isPowerHazard: false };

      case 'bulb_filament':
        // Cold tungsten filament resistance ~24.2 Ω
        return { value: 24.2, isPowerHazard: false };

      default:
        return { value: measuredResistance, isPowerHazard: false };
    }
  };

  const resistanceResult = computeWorkbenchResistance();

  // Format value for DMM LCD display
  const getDisplayValue = () => {
    if (hold) return { val: 'HOLD', unit: '' };

    // Hazard alarm if measuring resistance with power on!
    if (state.mode === 'RES' || state.mode === 'CONT') {
      if (resistanceResult.isPowerHazard) {
        return { val: 'VOLT.ERR', unit: '⚡ HAZARD!' };
      }
    }

    switch (state.mode) {
      case 'V_DC':
        if (!isPowerDisconnected) {
          return { val: liveCircuitVoltage.toFixed(3), unit: 'V DC' };
        }
        return { val: measuredVoltage.toFixed(3), unit: 'V DC' };

      case 'V_AC':
        return { val: (measuredVoltage * 0.707).toFixed(3), unit: 'V AC' };

      case 'I_DC':
        if (measuredCurrent < 1) {
          return { val: (measuredCurrent * 1000).toFixed(2), unit: 'mA DC' };
        }
        return { val: measuredCurrent.toFixed(3), unit: 'A DC' };

      case 'RES': {
        const rVal = activeView === 'workbench' ? resistanceResult.value : measuredResistance;
        if (rVal === 'OL') {
          return { val: 'O.L', unit: 'MΩ (OPEN)' };
        }

        // Apply range limits if manually set
        if (ohmRange === '200' && rVal > 200) return { val: 'O.L', unit: 'Ω (OVER)' };
        if (ohmRange === '2k' && rVal > 2000) return { val: 'O.L', unit: 'kΩ (OVER)' };
        if (ohmRange === '20k' && rVal > 20000) return { val: 'O.L', unit: 'kΩ (OVER)' };
        if (ohmRange === '200k' && rVal > 200000) return { val: 'O.L', unit: 'kΩ (OVER)' };
        if (ohmRange === '2M' && rVal > 2000000) return { val: 'O.L', unit: 'MΩ (OVER)' };

        if (rVal >= 1000000) {
          return { val: (rVal / 1000000).toFixed(3), unit: 'MΩ' };
        }
        if (rVal >= 1000) {
          return { val: (rVal / 1000).toFixed(2), unit: 'kΩ' };
        }
        return { val: rVal.toFixed(1), unit: 'Ω' };
      }

      case 'CONT': {
        const rVal = activeView === 'workbench' ? resistanceResult.value : measuredResistance;
        if (rVal !== 'OL' && rVal < 30) {
          return { val: `${rVal.toFixed(1)}`, unit: 'Ω • BEEP' };
        }
        return { val: 'O.L', unit: 'OPEN' };
      }

      default:
        return { val: '0.000', unit: 'V' };
    }
  };

  const currentDisplay = getDisplayValue();

  // Trigger continuity beep if active
  useEffect(() => {
    if (state.mode === 'CONT' && currentDisplay.unit.includes('BEEP')) {
      playTone(2400, 0.12);
    } else if (resistanceResult.isPowerHazard && (state.mode === 'RES' || state.mode === 'CONT')) {
      playTone(600, 0.18, 'sawtooth');
    }
  }, [currentDisplay.val, resistanceResult.isPowerHazard, state.mode]);

  // Compute 4-Band Resistor Color Bands
  const getResistorColorBands = (ohms: number) => {
    if (ohms <= 0 || ohms > 99000000) return null;
    const str = Math.round(ohms).toString();
    const d1 = parseInt(str[0]) || 1;
    const d2 = str.length > 1 ? parseInt(str[1]) : 0;
    const zeros = str.length - 2;

    const colorMap: Record<number, { name: string; hex: string; textHex?: string }> = {
      0: { name: 'أسود (0)', hex: '#0f172a' },
      1: { name: 'بني (1)', hex: '#78350f' },
      2: { name: 'أحمر (2)', hex: '#dc2626' },
      3: { name: 'برتقالي (3)', hex: '#ea580c' },
      4: { name: 'أصفر (4)', hex: '#eab308', textHex: '#0f172a' },
      5: { name: 'أخضر (5)', hex: '#16a34a' },
      6: { name: 'أزرق (6)', hex: '#2563eb' },
      7: { name: 'بنفسجي (7)', hex: '#9333ea' },
      8: { name: 'رمادي (8)', hex: '#64748b' },
      9: { name: 'أبيض (9)', hex: '#f8fafc', textHex: '#0f172a' }
    };

    const multiplierColors: Record<number, { name: string; hex: string; mult: string }> = {
      [-1]: { name: 'ذهبي (×0.1)', hex: '#d97706', mult: '×0.1' },
      0: { name: 'أسود (×1)', hex: '#0f172a', mult: '×1' },
      1: { name: 'بني (×10)', hex: '#78350f', mult: '×10' },
      2: { name: 'أحمر (×100)', hex: '#dc2626', mult: '×100' },
      3: { name: 'برتقالي (×1k)', hex: '#ea580c', mult: '×1k' },
      4: { name: 'أصفر (×10k)', hex: '#eab308', mult: '×10k' },
      5: { name: 'أخضر (×100k)', hex: '#16a34a', mult: '×100k' },
      6: { name: 'أزرق (×1M)', hex: '#2563eb', mult: '×1M' },
    };

    return {
      band1: colorMap[d1] || colorMap[1],
      band2: colorMap[d2] || colorMap[0],
      multiplier: multiplierColors[zeros] || multiplierColors[1],
      tolerance: { name: 'ذهبي (±5%)', hex: '#d97706' }
    };
  };

  const currentOhmsForColor = typeof resistanceResult.value === 'number' 
    ? resistanceResult.value 
    : (isCustomResistor ? parseFloat(customResValue) || 1000 : selectedResistorValue);
    
  const colorBands = getResistorColorBands(currentOhmsForColor);

  return (
    <div className="w-full bg-[#0a1329]/95 border-2 border-[#00d2ff]/30 rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-100 flex flex-col gap-4 font-sans select-none backdrop-blur-md">
      
      {/* Top Banner & Tool Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#00d2ff]/20 pb-3 gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-[#040915] font-black shadow-lg shadow-amber-500/30">
            <span className="text-base font-mono">Ω</span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>أداة قياس المقاومة والأفوميتر (Ohmmeter & DMM)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-[#fbbf24] border border-amber-500/40">
                فحص الدوائر المفتوحة
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              قياس المقاومات المعزولة، الدوائر المفتوحة (O.L)، وفحص كود الألوان مع ميزة الأمان لفصل الطاقة.
            </p>
          </div>
        </div>

        {/* View Switcher: Workbench vs Compact Meter */}
        <div className="flex items-center gap-1.5 bg-[#040915] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView('workbench')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeView === 'workbench'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-[#040915] shadow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>معمل قياس المقاومات (Workbench)</span>
          </button>

          <button
            onClick={() => setActiveView('compact')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeView === 'compact'
                ? 'bg-[#0088ff] text-white shadow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>الملتيميتر فقط</span>
          </button>
        </div>
      </div>

      {/* Main Grid: DMM Device + Ohmmeter Testing Bench */}
      <div className={`grid gap-4 items-start ${activeView === 'workbench' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-sm mx-auto'}`}>
        
        {/* ======================================================== */}
        {/* LEFT / COL 1: The Physical FLUKE 87V Digital Multimeter  */}
        {/* ======================================================== */}
        <div className={`${activeView === 'workbench' ? 'lg:col-span-5' : 'w-full'} bg-amber-500/90 p-4 rounded-3xl border-4 border-amber-600 shadow-2xl text-slate-900 flex flex-col gap-3 font-sans`}>
          
          {/* Brand & Fluke Banner */}
          <div className="flex items-center justify-between border-b-2 border-amber-600/40 pb-2">
            <div>
              <h4 className="font-black text-slate-950 tracking-wider text-base">FLUKE 87V</h4>
              <span className="text-[10px] text-slate-900 font-bold block">TRUE RMS MULTIMETER & OHMMETER</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-slate-950 transition"
                title="كتم / تفعيل صوت الطنين"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <div className="px-2 py-0.5 bg-amber-600/60 rounded text-[10px] font-bold text-slate-900">
                CAT IV 600V
              </div>
            </div>
          </div>

          {/* LCD Digital Display */}
          <div
            dir="ltr"
            className={`p-3.5 rounded-xl border-4 border-slate-700 transition shadow-inner font-mono relative force-ltr ${
              resistanceResult.isPowerHazard
                ? 'bg-rose-300 text-rose-950 animate-pulse border-rose-600'
                : backlight
                ? 'bg-emerald-300 text-slate-900'
                : 'bg-slate-300 text-slate-800'
            }`}
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          >
            <div className="flex justify-between items-center text-[10px] font-black pb-0.5 text-slate-700">
              <span>{ohmRange === 'AUTO' ? 'AUTO RANGE' : `MANUAL ${ohmRange}Ω`}</span>
              <span>{hold && 'HOLD'}</span>
              <span>{state.mode === 'RES' ? 'Ω OHM' : state.mode}</span>
              <span>{soundEnabled && '♪'}</span>
            </div>

            {/* Main Value Readout */}
            <div className="flex items-baseline justify-between py-1">
              <span className="text-3xl font-black tracking-tight">{currentDisplay.val}</span>
              <span className="text-sm font-black ml-2">{currentDisplay.unit}</span>
            </div>

            {/* Analog Bar Graph */}
            <div className="w-full bg-slate-900/15 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-slate-900 h-full transition-all duration-300"
                style={{
                  width: `${
                    currentDisplay.val === 'O.L' || resistanceResult.isPowerHazard
                      ? 100
                      : Math.min(100, Math.max(5, (typeof resistanceResult.value === 'number' ? (resistanceResult.value % 1000) / 10 : 30)))
                  }%`
                }}
              />
            </div>
          </div>

          {/* Function Buttons Row */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setHold(!hold)}
              className={`py-1.5 rounded-lg text-xs font-bold transition shadow ${
                hold ? 'bg-amber-300 text-slate-950 font-black' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              HOLD
            </button>
            <button
              onClick={() => setBacklight(!backlight)}
              className={`py-1.5 rounded-lg text-xs font-bold transition shadow ${
                backlight ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              إضاءة
            </button>
            <button
              onClick={() => {
                if (state.mode === 'CONT') playTone(2400, 0.15);
              }}
              className="py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition shadow"
            >
              فحص طنين
            </button>
          </div>

          {/* Rotary Mode Selector Dial */}
          <div className="bg-slate-900 p-2.5 rounded-2xl flex flex-col gap-1.5 text-white">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
              <span>قرص تحديد نمط القياس (Dial)</span>
              <span className="text-amber-400 font-mono">{state.mode}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onChange({ mode: 'RES' })}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition ${
                  state.mode === 'RES' ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span className="text-base font-black">Ω</span>
                <span>المقاومة (Ohm)</span>
              </button>

              <button
                onClick={() => onChange({ mode: 'CONT' })}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition ${
                  state.mode === 'CONT' ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>•)))</span>
                <span>توصيلية (Beep)</span>
              </button>

              <button
                onClick={() => onChange({ mode: 'V_DC' })}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition ${
                  state.mode === 'V_DC' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>V (DC) جهد</span>
              </button>

              <button
                onClick={() => onChange({ mode: 'V_AC' })}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition ${
                  state.mode === 'V_AC' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>~ V</span>
                <span>V (AC) متناوب</span>
              </button>

              <button
                onClick={() => onChange({ mode: 'I_DC' })}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition ${
                  state.mode === 'I_DC' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>A / mA</span>
                <span>تيار (Current)</span>
              </button>

              <div className="py-2 rounded-lg text-[10px] bg-slate-800/60 text-slate-400 flex flex-col items-center justify-center font-mono">
                <span>OFF</span>
                <span>إيقاف</span>
              </div>
            </div>

            {/* Manual Range Selector for Ohmmeter */}
            {state.mode === 'RES' && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">مدى الأوميتر (Range):</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {(['AUTO', '200', '2k', '20k', '200k', '2M'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setOhmRange(r)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        ohmRange === r ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Test Lead Banana Jacks */}
          <div className="flex justify-around items-center pt-1 border-t border-amber-600/50">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full bg-red-600 border-2 border-red-800 shadow-inner flex items-center justify-center text-[9px] font-bold text-white ${
                probeRedConnected ? 'ring-2 ring-red-400' : 'opacity-60'
              }`}>
                +
              </div>
              <span className="text-[10px] font-bold text-slate-900">V / Ω / mA</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center text-[9px] font-bold text-white ${
                probeBlackConnected ? 'ring-2 ring-slate-400' : 'opacity-60'
              }`}>
                -
              </div>
              <span className="text-[10px] font-bold text-slate-900">COM (GND)</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-amber-700 border-2 border-amber-900 shadow-inner flex items-center justify-center text-[9px] font-bold text-white opacity-50">
                10A
              </div>
              <span className="text-[10px] font-bold text-slate-900">FUSED</span>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT / COL 2: Ohmmeter Testing Bench & Open Circuit     */}
        {/* ======================================================== */}
        {activeView === 'workbench' && (
          <div className="lg:col-span-7 bg-[#070e1e] border-2 border-[#00d2ff]/25 rounded-3xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
            
            {/* Header: Power-Off Golden Safety Interlock */}
            <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-all ${
              isPowerDisconnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/50 border-rose-500/60 text-rose-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isPowerDisconnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                }`}>
                  <Power className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span>حالة مصدر الطاقة في الدائرة:</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      isPowerDisconnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
                    }`}>
                      {isPowerDisconnected ? '🔌 مفصولة تماماً (De-energized - آمن)' : '⚡ متصلة بجهد حي (12V Powered)'}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80">
                    {isPowerDisconnected
                      ? 'قاعدة الأمان محققة: يمكن قياس المقاومة بدقة عبر حقن تيار الاختبار الداخلي للأوميتر.'
                      : 'تحذير هندسي: يمنع قياس المقاومة أثناء وجود جهد كهربائي لتجنب احتراق الأوميتر!'}
                  </p>
                </div>
              </div>

              {/* Power Toggle Button */}
              <button
                onClick={() => {
                  playTone(1500, 0.05);
                  setIsPowerDisconnected(!isPowerDisconnected);
                }}
                className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl text-xs font-black transition active:scale-95 shrink-0 ${
                  isPowerDisconnected
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                }`}
              >
                {isPowerDisconnected ? 'محاكاة توصيل الطاقة ⚡' : 'افصل الطاقة فوراً 🔌'}
              </button>
            </div>

            {/* If Power Hazard Active, Show Major Alert */}
            {!isPowerDisconnected && (
              <div className="p-3 bg-rose-950/70 border-2 border-rose-500 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black text-rose-300 block">
                    ⚠️ تنبيه الأمان المخبري: لا يمكن للأوميتر قياس المقاومة والدائرة تحت الجهد!
                  </span>
                  <p className="text-[11px] leading-relaxed text-rose-200/90">
                    يقيس الأوميتر المقاومة بحقن تيار اختبار داخلي صغير جداً وحساب نسبة الجهد. عند وجود مصدر طاقة خارجي (مثل بطارية 12V)، يتداخل الجهد الخارجي مما قد يؤدي لاحتراق فيوز الجهاز أو تلف دائرة القياس. افصل التغذية الكهربائية للقياس بأمان.
                  </p>
                </div>
              </div>
            )}

            {/* Component Selection Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>المكون أو حالة الدائرة المراد قياسها:</span>
                <span className="text-[10px] text-amber-400">انقر للاختبار الفوري</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => setTestComponent('resistor_single')}
                  className={`p-2 rounded-xl border text-right transition flex flex-col gap-0.5 ${
                    testComponent === 'resistor_single'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#0a1329] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold">مقاومة معزولة R</span>
                  <span className="text-[9px] text-slate-400">Single Resistor</span>
                </button>

                <button
                  onClick={() => setTestComponent('open_circuit')}
                  className={`p-2 rounded-xl border text-right transition flex flex-col gap-0.5 ${
                    testComponent === 'open_circuit'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#0a1329] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold">دائرة مفتوحة (O.L)</span>
                  <span className="text-[9px] text-slate-400">Open Circuit / Air</span>
                </button>

                <button
                  onClick={() => setTestComponent('potentiometer')}
                  className={`p-2 rounded-xl border text-right transition flex flex-col gap-0.5 ${
                    testComponent === 'potentiometer'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#0a1329] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold">مقاومة متغيرة Pot</span>
                  <span className="text-[9px] text-slate-400">0 - 10 kΩ Variable</span>
                </button>

                <button
                  onClick={() => setTestComponent('short_circuit')}
                  className={`p-2 rounded-xl border text-right transition flex flex-col gap-0.5 ${
                    testComponent === 'short_circuit'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#0a1329] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold">دائرة قصر (0 Ω)</span>
                  <span className="text-[9px] text-slate-400">Short Wire •)))</span>
                </button>

                <button
                  onClick={() => setTestComponent('series_resistors')}
                  className={`p-2 rounded-xl border text-right transition flex flex-col gap-0.5 ${
                    testComponent === 'series_resistors'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#0a1329] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold">توصيل توالي R1+R2</span>
                  <span className="text-[9px] text-slate-400">Series Combination</span>
                </button>

                <button
                  onClick={() => setTestComponent('parallel_resistors')}
                  className={`p-2 rounded-xl border text-right transition flex flex-col gap-0.5 ${
                    testComponent === 'parallel_resistors'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#0a1329] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold">توصيل توازي R1||R2</span>
                  <span className="text-[9px] text-slate-400">Parallel Combination</span>
                </button>

                <button
                  onClick={() => setTestComponent('diode_junction')}
                  className={`p-2 rounded-xl border text-right transition flex flex-col gap-0.5 ${
                    testComponent === 'diode_junction'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#0a1329] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold">دايود سيلكون</span>
                  <span className="text-[9px] text-slate-400">Diode PN Junction</span>
                </button>

                <button
                  onClick={() => setTestComponent('relay_coil')}
                  className={`p-2 rounded-xl border text-right transition flex flex-col gap-0.5 ${
                    testComponent === 'relay_coil'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#0a1329] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold">ملف ريليه (75 Ω)</span>
                  <span className="text-[9px] text-slate-400">Relay Coil Test</span>
                </button>
              </div>
            </div>

            {/* Interactive Component Controls & Visualizer */}
            <div className="p-4 bg-[#0a1329] border border-[#00d2ff]/20 rounded-2xl space-y-3">
              
              {/* Resistor Selector & Color Bands */}
              {(testComponent === 'resistor_single' || testComponent === 'series_resistors' || testComponent === 'parallel_resistors') && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">اختر قيمة المقاومة R1:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsCustomResistor(false)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          !isCustomResistor ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        قيم قياسية
                      </button>
                      <button
                        onClick={() => setIsCustomResistor(true)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCustomResistor ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        قيمة مخصصة
                      </button>
                    </div>
                  </div>

                  {!isCustomResistor ? (
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_RESISTORS.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setSelectedResistorValue(r.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                            selectedResistorValue === r.value
                              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {r.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="20000000"
                        value={customResValue}
                        onChange={(e) => setCustomResValue(e.target.value)}
                        placeholder="أدخل قيمة المقاومة بالأوم"
                        className="w-full px-3 py-1.5 bg-[#040915] border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-300">أوم (Ω)</span>
                    </div>
                  )}

                  {/* Secondary Resistor Selector for Series / Parallel */}
                  {(testComponent === 'series_resistors' || testComponent === 'parallel_resistors') && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-300">المقاومة الثانية R2:</span>
                      <select
                        value={resistor2Value}
                        onChange={(e) => setResistor2Value(parseInt(e.target.value))}
                        className="px-2.5 py-1 bg-[#040915] border border-slate-700 rounded-lg text-xs font-mono text-amber-300"
                      >
                        <option value={220}>220 Ω</option>
                        <option value={330}>330 Ω</option>
                        <option value={1000}>1 kΩ (1000 Ω)</option>
                        <option value={2200}>2.2 kΩ (2200 Ω)</option>
                        <option value={4700}>4.7 kΩ (4700 Ω)</option>
                        <option value={10000}>10 kΩ (10000 Ω)</option>
                      </select>
                    </div>
                  )}

                  {/* Visual 4-Band Resistor Drawing */}
                  {colorBands && (
                    <div className="p-3 bg-[#040915] rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Resistor Lead Wire Left */}
                        <div className="w-6 h-0.5 bg-slate-400" />
                        {/* Resistor Body */}
                        <div className="w-32 h-8 bg-amber-100 rounded-full border border-amber-300 flex items-center justify-between px-3 shadow-inner relative overflow-hidden">
                          {/* Band 1 */}
                          <div className="w-2 h-full shadow" style={{ backgroundColor: colorBands.band1.hex }} title={colorBands.band1.name} />
                          {/* Band 2 */}
                          <div className="w-2 h-full shadow" style={{ backgroundColor: colorBands.band2.hex }} title={colorBands.band2.name} />
                          {/* Multiplier Band */}
                          <div className="w-2 h-full shadow" style={{ backgroundColor: colorBands.multiplier.hex }} title={colorBands.multiplier.name} />
                          {/* Tolerance Band (Gold) */}
                          <div className="w-2 h-full shadow" style={{ backgroundColor: colorBands.tolerance.hex }} title={colorBands.tolerance.name} />
                        </div>
                        {/* Resistor Lead Wire Right */}
                        <div className="w-6 h-0.5 bg-slate-400" />
                      </div>

                      {/* Color Bands Legend */}
                      <div className="text-[10px] text-slate-300 flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-amber-400">أكواد الألوان:</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono" style={{ color: colorBands.band1.hex === '#0f172a' ? '#fff' : colorBands.band1.hex }}>{colorBands.band1.name}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono" style={{ color: colorBands.band2.hex === '#0f172a' ? '#fff' : colorBands.band2.hex }}>{colorBands.band2.name}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono" style={{ color: colorBands.multiplier.hex === '#0f172a' ? '#fff' : colorBands.multiplier.hex }}>{colorBands.multiplier.name}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">ذهبي ±5%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Potentiometer Interactive Slider */}
              {testComponent === 'potentiometer' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">التحكم في منزلق المقاومة المتغيرة (Wiper %):</span>
                    <span className="font-mono text-amber-400 font-bold">{potPercent}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={potPercent}
                    onChange={(e) => setPotPercent(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-300">نقطة القياس بين الأطراف:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPotMeasureTerminal('AW')}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                          potMeasureTerminal === 'AW' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        الطرف A والمنزلق W ({Math.round(10000 * (potPercent / 100))} Ω)
                      </button>
                      <button
                        onClick={() => setPotMeasureTerminal('WB')}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                          potMeasureTerminal === 'WB' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        المنزلق W والطرف B ({Math.round(10000 * ((100 - potPercent) / 100))} Ω)
                      </button>
                      <button
                        onClick={() => setPotMeasureTerminal('AB')}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                          potMeasureTerminal === 'AB' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        الطرفين A و B (10 kΩ ثابتة)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Open Circuit Visualizer */}
              {testComponent === 'open_circuit' && (
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5 text-xs text-amber-200">
                  <span className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Info className="w-4 h-4 text-amber-400" />
                    حالة الدائرة المفتوحة (Open Circuit / Air Gap):
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    في الدائرة المفتوحة (سلك مقطوع، مفتاح مطفأ، أو فجوة هوائية بين المجسين)، تكون المقاومة لانهائية (<span className="font-mono font-bold text-amber-400">R = ∞</span>). يعرض جهاز الملتيميتر الرمز <code className="font-mono text-emerald-400 font-black bg-slate-900 px-1 rounded">O.L</code> (Over Limit) مشيراً إلى أن المقاومة تجاوزت الحد الأقصى للمدى، مما يؤكد انقطاع التوصيل.
                  </p>
                </div>
              )}

              {/* Short Circuit Visualizer */}
              {testComponent === 'short_circuit' && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs text-emerald-200">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    حالة دائرة القصر (Short Circuit & Continuity):
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    توصيل سلك نحاسي سليم أو إغلاق مسار تيار ينتج مقاومة شبه معدومة (<span className="font-mono font-bold text-emerald-400">R ≈ 0.02 Ω</span>). في وضع فحص الطنين (Continuity •)))، يطلق الأوميتر صوتاً فورياً لتأكيد سلامة التوصيل وعدم وجود قطع في السلك.
                  </p>
                </div>
              )}

              {/* Diode Forward vs Reverse */}
              {testComponent === 'diode_junction' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">قطبية فحص الدايود بالملتيميتر:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDiodeBias('forward')}
                        className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          diodeBias === 'forward' ? 'bg-emerald-600 text-white font-black' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        انحياز أمامي (+ على المصعد Anode)
                      </button>
                      <button
                        onClick={() => setDiodeBias('reverse')}
                        className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          diodeBias === 'reverse' ? 'bg-amber-600 text-white font-black' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        انحياز عكسي (+ على المهبط Cathode)
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {diodeBias === 'forward' 
                      ? 'في الانحياز الأمامي: يمرر تيار الفحص ويعطي مقاومة منخفضة (~580 Ω أو هبوط 0.6V).'
                      : 'في الانحياز العكسي: تمنع الوصلة الثنائية مرور التيار وتعطي مقاومة عزل لانهائية (O.L).'}
                  </p>
                </div>
              )}

            </div>

            {/* Test Probes Attachment Panel */}
            <div className="p-3 bg-[#0a1329] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">مجسات الفحص (Probes):</span>
                <span className="text-[10px] text-slate-400">
                  {probesShortedTogether 
                    ? 'المجسان متلامسان ببعضهما (Short)' 
                    : probeRedConnected && probeBlackConnected 
                    ? 'متصلان بطرفي المكون' 
                    : 'أحد المجسين مفصول في الهواء (Open)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setProbesShortedTogether(false);
                    setProbeRedConnected(true);
                    setProbeBlackConnected(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    !probesShortedTogether && probeRedConnected && probeBlackConnected
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  توصيل طبيعي بالمكون
                </button>

                <button
                  onClick={() => {
                    setProbesShortedTogether(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    probesShortedTogether ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ملامسة المجسين (0 Ω)
                </button>

                <button
                  onClick={() => {
                    setProbesShortedTogether(false);
                    setProbeRedConnected(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    !probeRedConnected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  فصل المجس (دائرة مفتوحة)
                </button>
              </div>
            </div>

            {/* Educational Takeaway Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div className="flex items-start gap-1.5 p-2 bg-[#040915] rounded-xl border border-slate-800">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>قانون أوم الداخلي:</strong> يحسب الأوميتر القيمة عبر المعادلة: <code className="text-amber-300 font-mono">R = V_test / I_test</code>.
                </span>
              </div>

              <div className="flex items-start gap-1.5 p-2 bg-[#040915] rounded-xl border border-slate-800">
                <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                <span>
                  <strong>فحص الدوائر المطبوعة:</strong> افصل طرفاً واحداً من المقاومة عند فحصها في لوحة معقدة لمنع تأثير المسارات المتوازية.
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
