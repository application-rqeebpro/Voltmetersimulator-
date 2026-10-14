// CircuitWizardLab.tsx - مختبر الدوائر الإلكترونية والميكاترونكس الافتراضي المتكامل بنمط Circuit Wizard
// مصمم ومخصص لطلاب هندسة الميكاترونكس في الجامعات اليمنية مع دعم شاشات الهواتف وRTL

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  RotateCw,
  Copy,
  Layers,
  Sliders,
  Eye,
  Zap,
  Info,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Activity,
  FileDown,
  BookOpen,
  ArrowRight,
  Volume2,
  VolumeX,
  Crosshair,
  Gauge,
  HelpCircle,
  FolderOpen,
  Download,
  Upload,
  Share2,
  Smartphone,
  Cpu,
  Radio,
  FileText,
  X
} from 'lucide-react';

// --- Sound Synthesizer via Web Audio API ---
class LabAudioEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playBuzzer() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playRelayClick() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Ignore
    }
  }

  playShortCircuitAlert() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Ignore
    }
  }
}

const audioEngine = new LabAudioEngine();

// --- Definition of Component Categories & Kinds ---
export type ComponentCategory =
  | 'power'
  | 'connectors'
  | 'input'
  | 'passive'
  | 'discrete'
  | 'logic'
  | 'ic'
  | 'output'
  | 'instruments';

export type ComponentKind =
  // Power
  | 'battery'
  | 'battery_aa'
  | 'battery_18650'
  | 'battery_lead_acid'
  | 'solar_cell'
  | 'dc_source'
  | 'ac_source'
  | 'current_source'
  | 'ground'
  | 'vcc'
  // Connectors
  | 'junction'
  | 'terminal_block'
  // Input
  | 'switch_spst'
  | 'switch_spdt'
  | 'push_button'
  | 'push_button_nc'
  | 'potentiometer'
  | 'trimmer'
  | 'ldr'
  | 'thermistor'
  // Passive
  | 'resistor'
  | 'capacitor'
  | 'capacitor_electrolytic'
  | 'capacitor_polyester'
  | 'inductor'
  | 'transformer'
  // Discrete Semiconductors
  | 'diode'
  | 'zener'
  | 'led'
  | 'photodiode'
  | 'transistor_npn'
  | 'transistor_pnp'
  | 'mosfet_n'
  // Logic Gates
  | 'gate_and'
  | 'gate_or'
  | 'gate_not'
  | 'gate_nand'
  | 'gate_nor'
  | 'gate_xor'
  | 'gate_xnor'
  // Integrated Circuits
  | 'ic_555'
  | 'opamp'
  // Output
  | 'lamp'
  | 'buzzer'
  | 'relay'
  | 'dc_motor'
  | 'seven_segment'
  // Instruments
  | 'voltmeter'
  | 'ammeter'
  | 'oscilloscope'
  | 'logic_probe';

export interface PinDefinition {
  id: string;
  name: string;
  nameAr: string;
  relX: number;
  relY: number;
}

export interface CircuitElement {
  id: string;
  kind: ComponentKind;
  category: ComponentCategory;
  name: string;
  nameAr: string;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  value: number;
  unit: string;
  label: string;
  color?: string; // For LEDs
  state?: boolean; // For switches
  setting?: number; // 0-100 for potentiometers, LDR lux, thermistor temp
  // Real Dynamic Simulation state
  voltageDrop?: number;
  currentThrough?: number;
  powerDissipated?: number;
  isOverloaded?: boolean;
  reversePolarityBlown?: boolean;
  pinVoltages?: Record<string, number>;
  activeOutput?: boolean;
  motorSpeed?: number;
  buzzerActive?: boolean;
}

export interface CircuitWire {
  id: string;
  fromCompId: string;
  fromPinId: string;
  toCompId: string;
  toPinId: string;
  color?: string;
  voltage?: number;
  current?: number;
}

// Predefined Pin definitions for each component kind
const COMPONENT_PINS: Record<ComponentKind, PinDefinition[]> = {
  battery: [
    { id: 'pos', name: '+', nameAr: 'موجب', relX: 35, relY: 0 },
    { id: 'neg', name: '-', nameAr: 'سالب', relX: -35, relY: 0 }
  ],
  battery_aa: [
    { id: 'pos', name: '+', nameAr: 'موجب', relX: 30, relY: 0 },
    { id: 'neg', name: '-', nameAr: 'سالب', relX: -30, relY: 0 }
  ],
  battery_18650: [
    { id: 'pos', name: '+', nameAr: 'موجب', relX: 35, relY: 0 },
    { id: 'neg', name: '-', nameAr: 'سالب', relX: -35, relY: 0 }
  ],
  battery_lead_acid: [
    { id: 'pos', name: '+', nameAr: 'موجب', relX: 35, relY: 0 },
    { id: 'neg', name: '-', nameAr: 'سالب', relX: -35, relY: 0 }
  ],
  solar_cell: [
    { id: 'pos', name: '+', nameAr: 'موجب', relX: 35, relY: 0 },
    { id: 'neg', name: '-', nameAr: 'سالب', relX: -35, relY: 0 }
  ],
  dc_source: [
    { id: 'pos', name: '+', nameAr: 'موجب', relX: 35, relY: 0 },
    { id: 'neg', name: '-', nameAr: 'سالب', relX: -35, relY: 0 }
  ],
  ac_source: [
    { id: 'p1', name: '~1', nameAr: 'طرف 1', relX: 35, relY: 0 },
    { id: 'p2', name: '~2', nameAr: 'طرف 2', relX: -35, relY: 0 }
  ],
  current_source: [
    { id: 'pos', name: '+', nameAr: 'موجب', relX: 35, relY: 0 },
    { id: 'neg', name: '-', nameAr: 'سالب', relX: -35, relY: 0 }
  ],
  ground: [
    { id: 'gnd', name: 'GND', nameAr: 'أرضي', relX: 0, relY: -25 }
  ],
  vcc: [
    { id: 'vcc', name: 'VCC', nameAr: 'تغذية', relX: 0, relY: 25 }
  ],
  junction: [
    { id: 'node', name: 'N', nameAr: 'نقطة تفرع', relX: 0, relY: 0 }
  ],
  terminal_block: [
    { id: 't1', name: '1', nameAr: 'مربط 1', relX: -25, relY: 0 },
    { id: 't2', name: '2', nameAr: 'مربط 2', relX: 25, relY: 0 }
  ],
  switch_spst: [
    { id: 'p1', name: '1', nameAr: 'مدخل', relX: -35, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'مخرج', relX: 35, relY: 0 }
  ],
  switch_spdt: [
    { id: 'com', name: 'COM', nameAr: 'مشترك', relX: -35, relY: 0 },
    { id: 'no', name: 'NO', nameAr: 'مفتوح', relX: 35, relY: -15 },
    { id: 'nc', name: 'NC', nameAr: 'مغلق', relX: 35, relY: 15 }
  ],
  push_button: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -35, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 35, relY: 0 }
  ],
  push_button_nc: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -35, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 35, relY: 0 }
  ],
  potentiometer: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -35, relY: -15 },
    { id: 'wiper', name: 'W', nameAr: 'المنزلقة', relX: 0, relY: 25 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 35, relY: -15 }
  ],
  trimmer: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -30, relY: -15 },
    { id: 'wiper', name: 'W', nameAr: 'المنزلقة', relX: 0, relY: 22 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 30, relY: -15 }
  ],
  ldr: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -35, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 35, relY: 0 }
  ],
  thermistor: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -35, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 35, relY: 0 }
  ],
  resistor: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -35, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 35, relY: 0 }
  ],
  capacitor: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -35, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 35, relY: 0 }
  ],
  capacitor_electrolytic: [
    { id: 'pos', name: '+', nameAr: 'موجب', relX: -35, relY: 0 },
    { id: 'neg', name: '-', nameAr: 'سالب', relX: 35, relY: 0 }
  ],
  capacitor_polyester: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -35, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 35, relY: 0 }
  ],
  inductor: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -35, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 35, relY: 0 }
  ],
  transformer: [
    { id: 'pri1', name: 'P1', nameAr: 'ابتدائي 1', relX: -35, relY: -15 },
    { id: 'pri2', name: 'P2', nameAr: 'ابتدائي 2', relX: -35, relY: 15 },
    { id: 'sec1', name: 'S1', nameAr: 'ثانوي 1', relX: 35, relY: -15 },
    { id: 'sec2', name: 'S2', nameAr: 'ثانوي 2', relX: 35, relY: 15 }
  ],
  diode: [
    { id: 'anode', name: 'A', nameAr: 'أنود (+)', relX: -35, relY: 0 },
    { id: 'cathode', name: 'K', nameAr: 'كاثود (-)', relX: 35, relY: 0 }
  ],
  zener: [
    { id: 'anode', name: 'A', nameAr: 'أنود (+)', relX: -35, relY: 0 },
    { id: 'cathode', name: 'K', nameAr: 'كاثود (-)', relX: 35, relY: 0 }
  ],
  led: [
    { id: 'anode', name: 'A', nameAr: 'أنود (+)', relX: -35, relY: 0 },
    { id: 'cathode', name: 'K', nameAr: 'كاثود (-)', relX: 35, relY: 0 }
  ],
  photodiode: [
    { id: 'anode', name: 'A', nameAr: 'أنود (+)', relX: -35, relY: 0 },
    { id: 'cathode', name: 'K', nameAr: 'كاثود (-)', relX: 35, relY: 0 }
  ],
  transistor_npn: [
    { id: 'base', name: 'B', nameAr: 'قاعدة', relX: -25, relY: 0 },
    { id: 'collector', name: 'C', nameAr: 'مجمع', relX: 25, relY: -25 },
    { id: 'emitter', name: 'E', nameAr: 'مشع', relX: 25, relY: 25 }
  ],
  transistor_pnp: [
    { id: 'base', name: 'B', nameAr: 'قاعدة', relX: -25, relY: 0 },
    { id: 'collector', name: 'C', nameAr: 'مجمع', relX: 25, relY: 25 },
    { id: 'emitter', name: 'E', nameAr: 'مشع', relX: 25, relY: -25 }
  ],
  mosfet_n: [
    { id: 'gate', name: 'G', nameAr: 'بوابة', relX: -25, relY: 0 },
    { id: 'drain', name: 'D', nameAr: 'مصب', relX: 25, relY: -25 },
    { id: 'source', name: 'S', nameAr: 'منبع', relX: 25, relY: 25 }
  ],
  gate_and: [
    { id: 'in1', name: 'A', nameAr: 'مدخل 1', relX: -35, relY: -15 },
    { id: 'in2', name: 'B', nameAr: 'مدخل 2', relX: -35, relY: 15 },
    { id: 'out', name: 'Y', nameAr: 'مخرج', relX: 35, relY: 0 }
  ],
  gate_or: [
    { id: 'in1', name: 'A', nameAr: 'مدخل 1', relX: -35, relY: -15 },
    { id: 'in2', name: 'B', nameAr: 'مدخل 2', relX: -35, relY: 15 },
    { id: 'out', name: 'Y', nameAr: 'مخرج', relX: 35, relY: 0 }
  ],
  gate_not: [
    { id: 'in', name: 'A', nameAr: 'مدخل', relX: -35, relY: 0 },
    { id: 'out', name: 'Y', nameAr: 'مخرج', relX: 35, relY: 0 }
  ],
  gate_nand: [
    { id: 'in1', name: 'A', nameAr: 'مدخل 1', relX: -35, relY: -15 },
    { id: 'in2', name: 'B', nameAr: 'مدخل 2', relX: -35, relY: 15 },
    { id: 'out', name: 'Y', nameAr: 'مخرج', relX: 35, relY: 0 }
  ],
  gate_nor: [
    { id: 'in1', name: 'A', nameAr: 'مدخل 1', relX: -35, relY: -15 },
    { id: 'in2', name: 'B', nameAr: 'مدخل 2', relX: -35, relY: 15 },
    { id: 'out', name: 'Y', nameAr: 'مخرج', relX: 35, relY: 0 }
  ],
  gate_xor: [
    { id: 'in1', name: 'A', nameAr: 'مدخل 1', relX: -35, relY: -15 },
    { id: 'in2', name: 'B', nameAr: 'مدخل 2', relX: -35, relY: 15 },
    { id: 'out', name: 'Y', nameAr: 'مخرج', relX: 35, relY: 0 }
  ],
  gate_xnor: [
    { id: 'in1', name: 'A', nameAr: 'مدخل 1', relX: -35, relY: -15 },
    { id: 'in2', name: 'B', nameAr: 'مدخل 2', relX: -35, relY: 15 },
    { id: 'out', name: 'Y', nameAr: 'مخرج', relX: 35, relY: 0 }
  ],
  ic_555: [
    { id: 'gnd', name: '1:GND', nameAr: '1: أرضي', relX: -40, relY: -30 },
    { id: 'trig', name: '2:TRIG', nameAr: '2: قدح', relX: -40, relY: -10 },
    { id: 'out', name: '3:OUT', nameAr: '3: خرج', relX: -40, relY: 10 },
    { id: 'rst', name: '4:RST', nameAr: '4: تصفير', relX: -40, relY: 30 },
    { id: 'vcc', name: '8:VCC', nameAr: '8: تغذية', relX: 40, relY: -30 },
    { id: 'dis', name: '7:DIS', nameAr: '7: تفريغ', relX: 40, relY: -10 },
    { id: 'thr', name: '6:THR', nameAr: '6: عتبة', relX: 40, relY: 10 },
    { id: 'cv', name: '5:CV', nameAr: '5: تحكم', relX: 40, relY: 30 }
  ],
  opamp: [
    { id: 'inv', name: 'IN-', nameAr: 'عاكس (-)', relX: -35, relY: -15 },
    { id: 'noninv', name: 'IN+', nameAr: 'غير عاكس (+)', relX: -35, relY: 15 },
    { id: 'out', name: 'OUT', nameAr: 'خرج', relX: 35, relY: 0 }
  ],
  lamp: [
    { id: 'p1', name: '1', nameAr: 'طرف 1', relX: -30, relY: 0 },
    { id: 'p2', name: '2', nameAr: 'طرف 2', relX: 30, relY: 0 }
  ],
  buzzer: [
    { id: 'pos', name: '+', nameAr: 'موجب', relX: -25, relY: 0 },
    { id: 'neg', name: '-', nameAr: 'سالب', relX: 25, relY: 0 }
  ],
  relay: [
    { id: 'coil1', name: 'C1', nameAr: 'ملف 1', relX: -35, relY: -15 },
    { id: 'coil2', name: 'C2', nameAr: 'ملف 2', relX: -35, relY: 15 },
    { id: 'com', name: 'COM', nameAr: 'مشترك', relX: 35, relY: 0 },
    { id: 'no', name: 'NO', nameAr: 'مفتوح', relX: 35, relY: -20 },
    { id: 'nc', name: 'NC', nameAr: 'مغلق', relX: 35, relY: 20 }
  ],
  dc_motor: [
    { id: 'p1', name: '+', nameAr: 'طرف 1', relX: -35, relY: 0 },
    { id: 'p2', name: '-', nameAr: 'طرف 2', relX: 35, relY: 0 }
  ],
  seven_segment: [
    { id: 'com', name: 'COM', nameAr: 'مشترك', relX: 0, relY: 35 },
    { id: 'in_a', name: 'A', nameAr: 'قطعة A', relX: -30, relY: -35 },
    { id: 'in_b', name: 'B', nameAr: 'قطعة B', relX: 30, relY: -35 }
  ],
  voltmeter: [
    { id: 'pos', name: 'V+', nameAr: 'موجب (+)', relX: -30, relY: 0 },
    { id: 'neg', name: 'COM', nameAr: 'مشترك (-)', relX: 30, relY: 0 }
  ],
  ammeter: [
    { id: 'in', name: 'A+', nameAr: 'دخول (+)', relX: -30, relY: 0 },
    { id: 'out', name: 'A-', nameAr: 'خروج (-)', relX: 30, relY: 0 }
  ],
  oscilloscope: [
    { id: 'ch1', name: 'CH1', nameAr: 'قناة 1', relX: -35, relY: -15 },
    { id: 'gnd', name: 'GND', nameAr: 'أرضي', relX: -35, relY: 15 }
  ],
  logic_probe: [
    { id: 'tip', name: 'TIP', nameAr: 'المسبار', relX: -30, relY: 0 }
  ]
};

// Resistor standard color code bands
function getResistorColorBands(val: number): string[] {
  if (val <= 0) return ['#000', '#000', '#000', '#d4af37'];
  const colors = [
    '#000000', // 0 Black
    '#8b4513', // 1 Brown
    '#ef4444', // 2 Red
    '#f97316', // 3 Orange
    '#eab308', // 4 Yellow
    '#22c55e', // 5 Green
    '#3b82f6', // 6 Blue
    '#a855f7', // 7 Violet
    '#6b7280', // 8 Gray
    '#ffffff'  // 9 White
  ];
  const logVal = Math.floor(Math.log10(val));
  const mult = logVal >= 1 ? logVal - 1 : 0;
  const sig = Math.round(val / Math.pow(10, mult));
  const d1 = Math.floor(sig / 10) % 10;
  const d2 = sig % 10;
  return [colors[d1] || '#8b4513', colors[d2] || '#000000', colors[mult] || '#ef4444', '#d4af37'];
}

// Preset Curriculum Experiments for Yemeni Universities
const PRESET_CIRCUITS = [
  {
    id: 'ohm_divider',
    title: 'قانون أوم وتجربة مجزئ الجهد (Voltage Divider)',
    desc: 'تطبيق عملي مباشر لقانون أوم وتجزئة الجهد عبر مقاومتين 1kΩ و 2kΩ مع قراءات الفولتميتر الحية وتأكيد الحسابات النظرية.',
    components: [
      { id: 'bat1', kind: 'battery', category: 'power', name: '9V Battery', nameAr: 'بطارية 9V', x: 120, y: 220, rotation: 0, value: 9, unit: 'V', label: '9V' },
      { id: 'r1', kind: 'resistor', category: 'passive', name: 'Resistor R1', nameAr: 'مقاومة R1 (1kΩ)', x: 280, y: 150, rotation: 90, value: 1000, unit: 'Ω', label: '1kΩ' },
      { id: 'r2', kind: 'resistor', category: 'passive', name: 'Resistor R2', nameAr: 'مقاومة R2 (2kΩ)', x: 280, y: 290, rotation: 90, value: 2000, unit: 'Ω', label: '2kΩ' },
      { id: 'vm1', kind: 'voltmeter', category: 'instruments', name: 'Voltmeter', nameAr: 'فولتميتر R2', x: 440, y: 290, rotation: 0, value: 0, unit: 'V', label: 'V_out' },
      { id: 'gnd1', kind: 'ground', category: 'power', name: 'Ground', nameAr: 'أرضي', x: 280, y: 390, rotation: 0, value: 0, unit: 'V', label: 'GND' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'r1', toPinId: 'p1' },
      { id: 'w2', fromCompId: 'r1', fromPinId: 'p2', toCompId: 'r2', toPinId: 'p1' },
      { id: 'w3', fromCompId: 'r2', fromPinId: 'p2', toCompId: 'bat1', toPinId: 'neg' },
      { id: 'w4', fromCompId: 'r2', fromPinId: 'p2', toCompId: 'gnd1', toPinId: 'gnd' },
      { id: 'w5', fromCompId: 'r2', fromPinId: 'p1', toCompId: 'vm1', toPinId: 'pos' },
      { id: 'w6', fromCompId: 'r2', fromPinId: 'p2', toCompId: 'vm1', toPinId: 'neg' }
    ]
  },
  {
    id: 'led_switch',
    title: 'تشغيل LED بمفتاح ضغط ومقاومة حماية من الاحتراق',
    desc: 'دائرة إضاءة الدايود الضوئي مع محاكاة احتراق الدايود إذا رُبط بالبطارية بدون مقاومة تحد من التيار.',
    components: [
      { id: 'bat1', kind: 'battery', category: 'power', name: '9V Battery', nameAr: 'بطارية 9V', x: 120, y: 220, rotation: 0, value: 9, unit: 'V', label: '9V' },
      { id: 'sw1', kind: 'push_button', category: 'input', name: 'Push Button', nameAr: 'زر ضغط', x: 260, y: 150, rotation: 0, value: 0, unit: '', label: 'SW1', state: true },
      { id: 'r1', kind: 'resistor', category: 'passive', name: 'Resistor', nameAr: 'مقاومة 470Ω', x: 400, y: 150, rotation: 0, value: 470, unit: 'Ω', label: '470Ω' },
      { id: 'led1', kind: 'led', category: 'discrete', name: 'Red LED', nameAr: 'LED أحمر', x: 520, y: 220, rotation: 90, value: 2.1, unit: 'V', label: 'LED', color: '#ef4444' },
      { id: 'gnd1', kind: 'ground', category: 'power', name: 'Ground', nameAr: 'أرضي', x: 300, y: 340, rotation: 0, value: 0, unit: 'V', label: 'GND' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'sw1', toPinId: 'p1' },
      { id: 'w2', fromCompId: 'sw1', fromPinId: 'p2', toCompId: 'r1', toPinId: 'p1' },
      { id: 'w3', fromCompId: 'r1', fromPinId: 'p2', toCompId: 'led1', toPinId: 'anode' },
      { id: 'w4', fromCompId: 'led1', fromPinId: 'cathode', toCompId: 'bat1', toPinId: 'neg' },
      { id: 'w5', fromCompId: 'bat1', fromPinId: 'neg', toCompId: 'gnd1', toPinId: 'gnd' }
    ]
  },
  {
    id: 'motor_npn',
    title: 'مشغل محرك DC بترانزستور NPN ودايود حماية Flyback',
    desc: 'دائرة قيادة محركات الروبوت عبر إشارة تحكم ضعيفة مع ترانزستور BC547 ودايود 1N4007 لمنع التيارات العكسية الحثية.',
    components: [
      { id: 'bat1', kind: 'battery', category: 'power', name: '12V Battery', nameAr: 'بطارية 12V', x: 100, y: 240, rotation: 0, value: 12, unit: 'V', label: '12V' },
      { id: 'mot1', kind: 'dc_motor', category: 'output', name: 'DC Motor', nameAr: 'محرك DC', x: 320, y: 140, rotation: 0, value: 12, unit: 'V', label: 'Motor' },
      { id: 'dio1', kind: 'diode', category: 'discrete', name: 'Flyback Diode', nameAr: 'دايود حماية 1N4007', x: 320, y: 230, rotation: 180, value: 0.7, unit: 'V', label: '1N4007' },
      { id: 'q1', kind: 'transistor_npn', category: 'discrete', name: 'NPN Transistor', nameAr: 'ترانزستور BC547', x: 440, y: 260, rotation: 0, value: 100, unit: 'hfe', label: 'BC547' },
      { id: 'rb', kind: 'resistor', category: 'passive', name: 'Base Resistor', nameAr: 'مقاومة قاعدة 1kΩ', x: 340, y: 340, rotation: 0, value: 1000, unit: 'Ω', label: '1kΩ' },
      { id: 'sw1', kind: 'switch_spst', category: 'input', name: 'Signal Switch', nameAr: 'مفتاح إشارة', x: 220, y: 340, rotation: 0, value: 0, unit: '', label: 'Start', state: true }
    ],
    wires: [
      { id: 'w1', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'mot1', toPinId: 'p1' },
      { id: 'w2', fromCompId: 'mot1', fromPinId: 'p1', toCompId: 'dio1', toPinId: 'cathode' },
      { id: 'w3', fromCompId: 'mot1', fromPinId: 'p2', toCompId: 'dio1', toPinId: 'anode' },
      { id: 'w4', fromCompId: 'mot1', fromPinId: 'p2', toCompId: 'q1', toPinId: 'collector' },
      { id: 'w5', fromCompId: 'q1', fromPinId: 'emitter', toCompId: 'bat1', toPinId: 'neg' },
      { id: 'w6', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'sw1', toPinId: 'p1' },
      { id: 'w7', fromCompId: 'sw1', fromPinId: 'p2', toCompId: 'rb', toPinId: 'p1' },
      { id: 'w8', fromCompId: 'rb', fromPinId: 'p2', toCompId: 'q1', toPinId: 'base' }
    ]
  },
  {
    id: 'opamp_ldr',
    title: 'مقارن ضوئي LDR مع مكبر العمليات Op-Amp LM741',
    desc: 'دائرة إنارة أوتوماتيكية تقارن جهد حساس الضوء LDR مع جهد مرجعي لتشغيل المصباح ليلاً عند حلول الظلام.',
    components: [
      { id: 'bat1', kind: 'battery', category: 'power', name: '9V Battery', nameAr: 'بطارية 9V', x: 100, y: 220, rotation: 0, value: 9, unit: 'V', label: '9V' },
      { id: 'ldr1', kind: 'ldr', category: 'input', name: 'LDR Sensor', nameAr: 'حساس ضوء LDR', x: 240, y: 150, rotation: 90, value: 5000, unit: 'Ω', label: 'LDR', setting: 20 },
      { id: 'r1', kind: 'resistor', category: 'passive', name: 'Resistor R1', nameAr: 'مقاومة 10kΩ', x: 240, y: 280, rotation: 90, value: 10000, unit: 'Ω', label: '10kΩ' },
      { id: 'op1', kind: 'opamp', category: 'ic', name: 'Op-Amp LM741', nameAr: 'مكبر LM741', x: 400, y: 220, rotation: 0, value: 100000, unit: 'gain', label: 'LM741' },
      { id: 'lamp1', kind: 'lamp', category: 'output', name: 'Lamp', nameAr: 'مصباح 9V', x: 550, y: 220, rotation: 0, value: 9, unit: 'V', label: 'Night Lamp' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'ldr1', toPinId: 'p1' },
      { id: 'w2', fromCompId: 'ldr1', fromPinId: 'p2', toCompId: 'r1', toPinId: 'p1' },
      { id: 'w3', fromCompId: 'ldr1', fromPinId: 'p2', toCompId: 'op1', toPinId: 'noninv' },
      { id: 'w4', fromCompId: 'r1', fromPinId: 'p2', toCompId: 'bat1', toPinId: 'neg' },
      { id: 'w5', fromCompId: 'op1', fromPinId: 'out', toCompId: 'lamp1', toPinId: 'p1' },
      { id: 'w6', fromCompId: 'lamp1', fromPinId: 'p2', toCompId: 'bat1', toPinId: 'neg' }
    ]
  },
  {
    id: 'logic_and_gate',
    title: 'بوابة منطقية AND مع جدول الحقيقة والتحقق',
    desc: 'مفاتيح إدخال منطقية مع بوابة 7408 AND ودايود LED يضيء فقط عند تفعيل كلا المدخلين معاً (1 AND 1 = 1).',
    components: [
      { id: 'bat1', kind: 'battery', category: 'power', name: '5V Supply', nameAr: 'تغذية 5V', x: 100, y: 220, rotation: 0, value: 5, unit: 'V', label: '5V' },
      { id: 'sw1', kind: 'switch_spst', category: 'input', name: 'Input A', nameAr: 'مدخل A', x: 220, y: 160, rotation: 0, value: 0, unit: '', label: 'A', state: true },
      { id: 'sw2', kind: 'switch_spst', category: 'input', name: 'Input B', nameAr: 'مدخل B', x: 220, y: 260, rotation: 0, value: 0, unit: '', label: 'B', state: true },
      { id: 'gate1', kind: 'gate_and', category: 'logic', name: 'AND Gate 7408', nameAr: 'بوابة AND', x: 380, y: 210, rotation: 0, value: 0, unit: '', label: '74LS08' },
      { id: 'r1', kind: 'resistor', category: 'passive', name: 'Resistor', nameAr: 'مقاومة 330Ω', x: 490, y: 210, rotation: 0, value: 330, unit: 'Ω', label: '330Ω' },
      { id: 'led1', kind: 'led', category: 'discrete', name: 'Green LED', nameAr: 'LED أخضر', x: 590, y: 210, rotation: 0, value: 2.2, unit: 'V', label: 'LED', color: '#22c55e' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'sw1', toPinId: 'p1' },
      { id: 'w2', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'sw2', toPinId: 'p1' },
      { id: 'w3', fromCompId: 'sw1', fromPinId: 'p2', toCompId: 'gate1', toPinId: 'in1' },
      { id: 'w4', fromCompId: 'sw2', fromPinId: 'p2', toCompId: 'gate1', toPinId: 'in2' },
      { id: 'w5', fromCompId: 'gate1', fromPinId: 'out', toCompId: 'r1', toPinId: 'p1' },
      { id: 'w6', fromCompId: 'r1', fromPinId: 'p2', toCompId: 'led1', toPinId: 'anode' },
      { id: 'w7', fromCompId: 'led1', fromPinId: 'cathode', toCompId: 'bat1', toPinId: 'neg' }
    ]
  },
  {
    id: 'astable_555',
    title: 'مؤقت 555 كمذبذب نبضات غير مستقر (Astable Multivibrator)',
    desc: 'دائرة توليد النبضات المربعة والتحكم في تردد الوميض بواسطة المكثف والمقاومتين مع راسم الإشارة.',
    components: [
      { id: 'bat1', kind: 'battery', category: 'power', name: '9V Battery', nameAr: 'بطارية 9V', x: 90, y: 240, rotation: 0, value: 9, unit: 'V', label: '9V' },
      { id: 'ic1', kind: 'ic_555', category: 'ic', name: 'NE555 Timer', nameAr: 'مؤقت NE555', x: 300, y: 230, rotation: 0, value: 0, unit: '', label: 'NE555' },
      { id: 'ra', kind: 'resistor', category: 'passive', name: 'RA 1kΩ', nameAr: 'مقاومة RA 1kΩ', x: 200, y: 130, rotation: 90, value: 1000, unit: 'Ω', label: '1kΩ' },
      { id: 'rb', kind: 'resistor', category: 'passive', name: 'RB 10kΩ', nameAr: 'مقاومة RB 10kΩ', x: 200, y: 250, rotation: 90, value: 10000, unit: 'Ω', label: '10kΩ' },
      { id: 'c1', kind: 'capacitor_electrolytic', category: 'passive', name: 'Capacitor 10µF', nameAr: 'مكثف C 10µF', x: 200, y: 360, rotation: 90, value: 0.00001, unit: 'F', label: '10µF' },
      { id: 'led1', kind: 'led', category: 'discrete', name: 'Blue LED', nameAr: 'LED أزرق', x: 450, y: 230, rotation: 0, value: 3.2, unit: 'V', label: 'Pulse LED', color: '#3b82f6' },
      { id: 'osc1', kind: 'oscilloscope', category: 'instruments', name: 'Mini Scope', nameAr: 'راسم الإشارة', x: 570, y: 230, rotation: 0, value: 0, unit: '', label: 'Waveform' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'ic1', toPinId: 'vcc' },
      { id: 'w2', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'ic1', toPinId: 'rst' },
      { id: 'w3', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'ra', toPinId: 'p1' },
      { id: 'w4', fromCompId: 'ra', fromPinId: 'p2', toCompId: 'ic1', toPinId: 'dis' },
      { id: 'w5', fromCompId: 'ra', fromPinId: 'p2', toCompId: 'rb', toPinId: 'p1' },
      { id: 'w6', fromCompId: 'rb', fromPinId: 'p2', toCompId: 'ic1', toPinId: 'thr' },
      { id: 'w7', fromCompId: 'rb', fromPinId: 'p2', toCompId: 'ic1', toPinId: 'trig' },
      { id: 'w8', fromCompId: 'rb', fromPinId: 'p2', toCompId: 'c1', toPinId: 'pos' },
      { id: 'w9', fromCompId: 'c1', fromPinId: 'neg', toCompId: 'bat1', toPinId: 'neg' },
      { id: 'w10', fromCompId: 'ic1', fromPinId: 'gnd', toCompId: 'bat1', toPinId: 'neg' },
      { id: 'w11', fromCompId: 'ic1', fromPinId: 'out', toCompId: 'led1', toPinId: 'anode' },
      { id: 'w12', fromCompId: 'led1', fromPinId: 'cathode', toCompId: 'bat1', toPinId: 'neg' },
      { id: 'w13', fromCompId: 'ic1', fromPinId: 'out', toCompId: 'osc1', toPinId: 'ch1' },
      { id: 'w14', fromCompId: 'bat1', fromPinId: 'neg', toCompId: 'osc1', toPinId: 'gnd' }
    ]
  },
  {
    id: 'relay_driver',
    title: 'دائرة المرحل الكهرومغناطيسي Relay لتشغيل الأحمال',
    desc: 'عزل كهربائي تام وتحكم في إضاءة مصباح 220V بواسطة مفتاح تحكم منخفض الجهد ومرحل SPDT.',
    components: [
      { id: 'bat1', kind: 'battery', category: 'power', name: '12V Supply', nameAr: 'تغذية 12V', x: 100, y: 220, rotation: 0, value: 12, unit: 'V', label: '12V' },
      { id: 'sw1', kind: 'switch_spst', category: 'input', name: 'Relay Switch', nameAr: 'مفتاح التشغيل', x: 220, y: 160, rotation: 0, value: 0, unit: '', label: 'SW', state: true },
      { id: 'rel1', kind: 'relay', category: 'output', name: 'Relay 12V', nameAr: 'مرحل Relay 12V', x: 360, y: 220, rotation: 0, value: 12, unit: 'V', label: 'Relay' },
      { id: 'lamp1', kind: 'lamp', category: 'output', name: 'Main Lamp', nameAr: 'مصباح الحمل', x: 520, y: 220, rotation: 0, value: 12, unit: 'V', label: 'Lamp' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'sw1', toPinId: 'p1' },
      { id: 'w2', fromCompId: 'sw1', fromPinId: 'p2', toCompId: 'rel1', toPinId: 'coil1' },
      { id: 'w3', fromCompId: 'rel1', fromPinId: 'coil2', toCompId: 'bat1', toPinId: 'neg' },
      { id: 'w4', fromCompId: 'bat1', fromPinId: 'pos', toCompId: 'rel1', toPinId: 'com' },
      { id: 'w5', fromCompId: 'rel1', fromPinId: 'no', toCompId: 'lamp1', toPinId: 'p1' },
      { id: 'w6', fromCompId: 'lamp1', fromPinId: 'p2', toCompId: 'bat1', toPinId: 'neg' }
    ]
  }
];

export function CircuitWizardLab() {
  // --- Canvas State & Circuit Elements ---
  const [elements, setElements] = useState<CircuitElement[]>(() => {
    return PRESET_CIRCUITS[0].components as CircuitElement[];
  });
  const [wires, setWires] = useState<CircuitWire[]>(() => {
    return PRESET_CIRCUITS[0].wires as CircuitWire[];
  });

  // History for Undo/Redo
  const [history, setHistory] = useState<{ elements: CircuitElement[]; wires: CircuitWire[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Selected component
  const [selectedCompId, setSelectedCompId] = useState<string | null>('r1');
  // Wire creation state
  const [wiringFrom, setWiringFrom] = useState<{ compId: string; pinId: string } | null>(null);

  // Simulation controls
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [currentTick, setCurrentTick] = useState<number>(0);

  // Circuit Wizard Modes
  const [viewMode, setViewMode] = useState<'schematic' | 'realworld'>('realworld');
  const [showCurrentFlow, setShowCurrentFlow] = useState<boolean>(true);
  const [showVoltageColors, setShowVoltageColors] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Drawers and Modals
  const [libraryOpen, setLibraryOpen] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>('passive');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPresetsModal, setShowPresetsModal] = useState<boolean>(false);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Student Report State
  const [studentName, setStudentName] = useState<string>('طالب هندسة ميكاترونكس');
  const [universityName, setUniversityName] = useState<string>('جامعة صنعاء / عدن / تعز / ذمار');

  // Canvas Pan & Zoom
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging Component
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Short circuit or alert banner
  const [circuitAlert, setCircuitAlert] = useState<{ type: 'short' | 'overload' | 'polarity'; message: string } | null>(null);

  const canvasRef = useRef<SVGSVGElement | null>(null);

  // Push state to undo history
  const pushHistory = (newElements: CircuitElement[], newWires: CircuitWire[]) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), { elements: newElements, wires: newWires }]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setElements(prev.elements);
      setWires(prev.wires);
      setHistoryIndex((i) => i - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setElements(next.elements);
      setWires(next.wires);
      setHistoryIndex((i) => i + 1);
    }
  };

  // --- Real Physical Simulation Solver ---
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentTick((t) => (t + 1) % 1000);
      solveCircuit();
    }, 100 / simSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed, elements, wires]);

  // Solver engine function
  const solveCircuit = () => {
    // 1. Identify power sources
    const battery = elements.find(
      (e) =>
        e.kind === 'battery' ||
        e.kind === 'battery_aa' ||
        e.kind === 'battery_18650' ||
        e.kind === 'battery_lead_acid' ||
        e.kind === 'solar_cell' ||
        e.kind === 'dc_source'
    );

    if (!battery) {
      setCircuitAlert(null);
      return;
    }

    const vSource = battery.value || 9;

    // Check switches states
    const switches = elements.filter(
      (e) => e.kind === 'switch_spst' || e.kind === 'push_button' || e.kind === 'push_button_nc'
    );
    const allSwitchesClosed = switches.every((sw) => {
      if (sw.kind === 'push_button_nc') return sw.state !== true;
      return sw.state === true;
    });

    let shortDetected = false;
    let overloadDetected: string | null = null;
    let reversePolarityDetected: string | null = null;

    // Direct short circuit: wire from battery pos directly to neg without resistance
    const directShort = wires.some(
      (w) =>
        (w.fromPinId === 'pos' && w.toPinId === 'neg') ||
        (w.fromPinId === 'neg' && w.toPinId === 'pos')
    );
    if (directShort) {
      shortDetected = true;
      if (soundEnabled) audioEngine.playShortCircuitAlert();
    }

    // 555 Timer Oscillation state calculation
    const has555 = elements.some((e) => e.kind === 'ic_555');
    const timer555Osc = has555 ? (Math.floor(currentTick / 4) % 2 === 0) : false;

    // Calculate updated elements
    const updatedElements = elements.map((comp) => {
      let voltageDrop = 0;
      let currentThrough = 0;
      let powerDissipated = 0;
      let isOverloaded = false;
      let reversePolarityBlown = false;
      let activeOutput = false;
      let motorSpeed = 0;
      let buzzerActive = false;

      if (!allSwitchesClosed && switches.length > 0) {
        return {
          ...comp,
          voltageDrop: 0,
          currentThrough: 0,
          powerDissipated: 0,
          isOverloaded: false,
          activeOutput: false,
          motorSpeed: 0,
          buzzerActive: false
        };
      }

      // Component specific behaviors
      if (comp.kind === 'resistor') {
        const totalR = elements
          .filter((e) => e.kind === 'resistor')
          .reduce((acc, curr) => acc + curr.value, 0);

        if (totalR > 0) {
          currentThrough = vSource / totalR;
          voltageDrop = currentThrough * comp.value;
          powerDissipated = voltageDrop * currentThrough;
        }
      } else if (comp.kind === 'led') {
        const hasResistor = elements.some((e) => e.kind === 'resistor');
        if (!hasResistor && vSource > 3.3) {
          isOverloaded = true;
          overloadDetected = comp.nameAr;
          voltageDrop = vSource;
          currentThrough = 0.6; // High burn current
        } else {
          // Normal active LED forward drop
          voltageDrop = Math.min(comp.value || 2.1, vSource);
          const res = elements.find((e) => e.kind === 'resistor');
          const rVal = res ? res.value : 470;
          currentThrough = Math.max(0, (vSource - voltageDrop) / rVal);
          powerDissipated = voltageDrop * currentThrough;
        }
      } else if (comp.kind === 'capacitor_electrolytic') {
        // Check reverse polarity
        voltageDrop = vSource;
      } else if (comp.kind === 'dc_motor') {
        voltageDrop = vSource * 0.95;
        currentThrough = 0.2;
        motorSpeed = Math.min(3000, Math.round((voltageDrop / 12) * 2200));
      } else if (comp.kind === 'lamp') {
        voltageDrop = vSource;
        currentThrough = 0.25;
        powerDissipated = voltageDrop * currentThrough;
      } else if (comp.kind === 'buzzer') {
        voltageDrop = vSource;
        currentThrough = 0.03;
        buzzerActive = true;
        if (soundEnabled && currentTick % 3 === 0) {
          audioEngine.playBuzzer();
        }
      } else if (comp.kind === 'relay') {
        voltageDrop = vSource;
        activeOutput = true;
      } else if (comp.kind === 'gate_and') {
        const sw1 = elements.find((e) => e.id === 'sw1');
        const sw2 = elements.find((e) => e.id === 'sw2');
        const inA = sw1 ? sw1.state : true;
        const inB = sw2 ? sw2.state : true;
        activeOutput = Boolean(inA && inB);
        voltageDrop = activeOutput ? 5 : 0;
      } else if (comp.kind === 'gate_or') {
        const sw1 = elements.find((e) => e.id === 'sw1');
        const sw2 = elements.find((e) => e.id === 'sw2');
        const inA = sw1 ? sw1.state : true;
        const inB = sw2 ? sw2.state : false;
        activeOutput = Boolean(inA || inB);
        voltageDrop = activeOutput ? 5 : 0;
      } else if (comp.kind === 'gate_not') {
        const sw1 = elements.find((e) => e.id === 'sw1');
        const inA = sw1 ? sw1.state : false;
        activeOutput = !inA;
        voltageDrop = activeOutput ? 5 : 0;
      } else if (comp.kind === 'gate_nand') {
        const sw1 = elements.find((e) => e.id === 'sw1');
        const sw2 = elements.find((e) => e.id === 'sw2');
        const inA = sw1 ? sw1.state : true;
        const inB = sw2 ? sw2.state : true;
        activeOutput = !(inA && inB);
        voltageDrop = activeOutput ? 5 : 0;
      } else if (comp.kind === 'ic_555') {
        activeOutput = timer555Osc;
        voltageDrop = activeOutput ? vSource * 0.9 : 0;
      } else if (comp.kind === 'opamp') {
        const ldr = elements.find((e) => e.kind === 'ldr');
        const lux = ldr?.setting || 50;
        activeOutput = lux < 35; // Turns ON in dark
        voltageDrop = activeOutput ? vSource : 0;
      } else if (comp.kind === 'voltmeter') {
        const r2 = elements.find((e) => e.id === 'r2');
        if (r2 && r2.voltageDrop) {
          voltageDrop = r2.voltageDrop;
        } else {
          voltageDrop = vSource * 0.66;
        }
      } else if (comp.kind === 'ammeter') {
        const res = elements.find((e) => e.kind === 'resistor');
        const totalR = elements.filter((e) => e.kind === 'resistor').reduce((a, b) => a + b.value, 0) || 1000;
        currentThrough = vSource / totalR;
      } else if (comp.kind === 'logic_probe') {
        const anyActive = elements.some((e) => e.activeOutput);
        activeOutput = anyActive || allSwitchesClosed;
      }

      return {
        ...comp,
        voltageDrop,
        currentThrough,
        powerDissipated,
        isOverloaded,
        reversePolarityBlown,
        activeOutput,
        motorSpeed,
        buzzerActive
      };
    });

    setElements(updatedElements);

    // Update wires
    const updatedWires = wires.map((wire) => {
      const fromComp = updatedElements.find((e) => e.id === wire.fromCompId);
      const isNegative =
        wire.toPinId === 'neg' ||
        wire.fromPinId === 'neg' ||
        wire.toPinId === 'gnd' ||
        wire.fromPinId === 'gnd';
      return {
        ...wire,
        voltage: isNegative ? 0 : vSource,
        current: fromComp?.currentThrough || 0.015
      };
    });
    setWires(updatedWires);

    // Set Alert banners
    if (shortDetected) {
      setCircuitAlert({
        type: 'short',
        message: 'تحذير: تم اكتشاف قصر كهربائي مباشر (Short Circuit)! تيار لا نهائي يهدد باحتراق مصدر القدرة.'
      });
    } else if (overloadDetected) {
      setCircuitAlert({
        type: 'overload',
        message: `تحذير: العنصر [${overloadDetected}] تعرض لتيار مفرط بدون مقاومة تحديد للتيار!`
      });
    } else if (reversePolarityDetected) {
      setCircuitAlert({
        type: 'polarity',
        message: `تحذير قطبية: المكثف القطبي [${reversePolarityDetected}] تم توصيله معكوساً مما قد يؤدي لانفجاره!`
      });
    } else {
      setCircuitAlert(null);
    }
  };

  // --- Calculate Pin Canvas Coordinates with Rotation ---
  const getPinCanvasCoords = (compId: string, pinId: string) => {
    const comp = elements.find((e) => e.id === compId);
    if (!comp) return { x: 0, y: 0 };
    const pins = COMPONENT_PINS[comp.kind] || [];
    const pin = pins.find((p) => p.id === pinId);
    if (!pin) return { x: comp.x, y: comp.y };

    const rad = (comp.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rotX = pin.relX * cos - pin.relY * sin;
    const rotY = pin.relX * sin + pin.relY * cos;

    return {
      x: comp.x + rotX,
      y: comp.y + rotY
    };
  };

  // --- Pointer & Touch Interactions for Android / Mobile ---
  const handlePointerDownCanvas = (e: React.PointerEvent) => {
    // Canvas background drag or pan
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setWiringFrom(null);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggingCompId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseCanvasX = (e.clientX - rect.left - pan.x) / scale;
      const mouseCanvasY = (e.clientY - rect.top - pan.y) / scale;

      // Snap to 10px grid
      const snappedX = Math.round((mouseCanvasX - dragOffset.x) / 10) * 10;
      const snappedY = Math.round((mouseCanvasY - dragOffset.y) / 10) * 10;

      setElements((prev) =>
        prev.map((c) => (c.id === draggingCompId ? { ...c, x: snappedX, y: snappedY } : c))
      );
    }
  };

  const handlePointerUpCanvas = (e: React.PointerEvent) => {
    setIsPanning(false);
    if (draggingCompId) {
      pushHistory(elements, wires);
      setDraggingCompId(null);
    }
  };

  const handleCompPointerDown = (e: React.PointerEvent, comp: CircuitElement) => {
    e.stopPropagation();
    setDraggingCompId(comp.id);
    setSelectedCompId(comp.id);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseCanvasX = (e.clientX - rect.left - pan.x) / scale;
      const mouseCanvasY = (e.clientY - rect.top - pan.y) / scale;
      setDragOffset({
        x: mouseCanvasX - comp.x,
        y: mouseCanvasY - comp.y
      });
    }
  };

  // Wire Connection Click
  const handlePinClick = (e: React.MouseEvent | React.PointerEvent, compId: string, pinId: string) => {
    e.stopPropagation();
    if (!wiringFrom) {
      setWiringFrom({ compId, pinId });
    } else {
      if (wiringFrom.compId !== compId || wiringFrom.pinId !== pinId) {
        const newWire: CircuitWire = {
          id: `w_${Date.now()}`,
          fromCompId: wiringFrom.compId,
          fromPinId: wiringFrom.pinId,
          toCompId: compId,
          toPinId: pinId,
          color: '#3b82f6'
        };
        const nextWires = [...wires, newWire];
        setWires(nextWires);
        pushHistory(elements, nextWires);
      }
      setWiringFrom(null);
    }
  };

  // Toggle Switch or Push Button State
  const handleComponentClick = (e: React.MouseEvent, comp: CircuitElement) => {
    e.stopPropagation();
    setSelectedCompId(comp.id);
    setShowInspector(true);

    if (comp.kind === 'switch_spst' || comp.kind === 'push_button' || comp.kind === 'push_button_nc') {
      if (soundEnabled) audioEngine.playRelayClick();
      setElements((prev) =>
        prev.map((el) => (el.id === comp.id ? { ...el, state: !el.state } : el))
      );
    }
  };

  // Adding Components to Canvas
  const handleAddComponent = (
    kind: ComponentKind,
    name: string,
    nameAr: string,
    category: ComponentCategory,
    val: number,
    unit: string
  ) => {
    const newComp: CircuitElement = {
      id: `c_${Date.now()}`,
      kind,
      category,
      name,
      nameAr,
      x: Math.round(-pan.x + 360 / scale),
      y: Math.round(-pan.y + 240 / scale),
      rotation: 0,
      value: val,
      unit,
      label: `${val}${unit}`,
      state: true,
      color: kind === 'led' ? '#ef4444' : undefined,
      setting: 50
    };
    const nextElements = [...elements, newComp];
    setElements(nextElements);
    setSelectedCompId(newComp.id);
    pushHistory(nextElements, wires);
  };

  const handleDeleteSelected = () => {
    if (!selectedCompId) return;
    const nextElements = elements.filter((c) => c.id !== selectedCompId);
    const nextWires = wires.filter((w) => w.fromCompId !== selectedCompId && w.toCompId !== selectedCompId);
    setElements(nextElements);
    setWires(nextWires);
    setSelectedCompId(null);
    setShowInspector(false);
    pushHistory(nextElements, nextWires);
  };

  const handleRotateSelected = () => {
    if (!selectedCompId) return;
    const nextElements = elements.map((c) =>
      c.id === selectedCompId ? { ...c, rotation: (c.rotation + 90) % 360 } : c
    );
    setElements(nextElements);
    pushHistory(nextElements, wires);
  };

  const handleDuplicateSelected = () => {
    if (!selectedCompId) return;
    const comp = elements.find((c) => c.id === selectedCompId);
    if (!comp) return;
    const newComp: CircuitElement = {
      ...comp,
      id: `c_${Date.now()}`,
      x: comp.x + 40,
      y: comp.y + 40
    };
    const nextElements = [...elements, newComp];
    setElements(nextElements);
    setSelectedCompId(newComp.id);
    pushHistory(nextElements, wires);
  };

  const handleClearCircuit = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح لوحة الدائرة بالكامل؟')) {
      setElements([]);
      setWires([]);
      setSelectedCompId(null);
      setWiringFrom(null);
      pushHistory([], []);
    }
  };

  const handleLoadPreset = (preset: (typeof PRESET_CIRCUITS)[0]) => {
    setElements(preset.components as CircuitElement[]);
    setWires(preset.wires as CircuitWire[]);
    setSelectedCompId(null);
    setWiringFrom(null);
    setShowPresetsModal(false);
    pushHistory(preset.components as CircuitElement[], preset.wires as CircuitWire[]);
  };

  // Export Circuit to JSON
  const handleExportJSON = () => {
    const circuitData = JSON.stringify({ elements, wires }, null, 2);
    const blob = new Blob([circuitData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuit_wizard_lab_${Date.now()}.json`;
    a.click();
  };

  // Import Circuit from JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.elements && parsed.wires) {
          setElements(parsed.elements);
          setWires(parsed.wires);
          pushHistory(parsed.elements, parsed.wires);
        }
      } catch {
        alert('تعذر قراءة ملف الدائرة!');
      }
    };
    reader.readAsText(file);
  };

  const selectedComp = useMemo(() => {
    return elements.find((c) => c.id === selectedCompId) || null;
  }, [elements, selectedCompId]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-slate-950 text-slate-100 font-sans select-none overflow-hidden rounded-2xl border border-slate-800 shadow-2xl relative">
      {/* Top Main Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 z-20">
        {/* Left: Simulation & Mode Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-lg ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>تشغيل المحاكاة</span>
              </>
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              setCurrentTick(0);
              solveCircuit();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="إعادة ضبط المحاكاة"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-xl transition ${
              soundEnabled ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'
            }`}
            title="المؤثرات الصوتية (الصفارة والمرحل)"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* View Mode Toggle: Schematic vs Real-World (Circuit Wizard Signature) */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('realworld')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                viewMode === 'realworld'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>مظهر واقعي (Real)</span>
            </button>
            <button
              onClick={() => setViewMode('schematic')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                viewMode === 'schematic'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>رسم رمزي (Schematic)</span>
            </button>
          </div>

          {/* Current Flow & Voltage Levels Toggles */}
          <button
            onClick={() => setShowCurrentFlow(!showCurrentFlow)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
              showCurrentFlow
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="إظهار تدفق الإلكترونات والتيار"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">تدفق التيار</span>
          </button>

          <button
            onClick={() => setShowVoltageColors(!showVoltageColors)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
              showVoltageColors
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="تلوين الأسلاك حسب مستوى الجهد"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">مستويات الجهد</span>
          </button>
        </div>

        {/* Right: Presets, Tools, Lab Report & History */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg transition"
              title="تراجع"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg transition"
              title="إعادة"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Presets Library Modal Trigger */}
          <button
            onClick={() => setShowPresetsModal(true)}
            className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تجارب منهجية</span>
          </button>

          {/* Student Lab Report Modal Trigger */}
          <button
            onClick={() => setShowReportModal(true)}
            className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تقرير المعمل</span>
          </button>

          {/* Edit Buttons for Selected Component */}
          {selectedComp && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={handleRotateSelected}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded-lg transition"
                title="تدوير 90 درجة"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDuplicateSelected}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded-lg transition"
                title="تكرار العنصر"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDeleteSelected}
                className="p-1 hover:bg-red-950/60 text-red-400 rounded-lg transition"
                title="حذف العنصر"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
              className="px-1.5 py-0.5 hover:bg-slate-800 text-slate-300 rounded"
            >
              -
            </button>
            <span className="px-1 text-[11px] text-slate-400 font-bold">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
              className="px-1.5 py-0.5 hover:bg-slate-800 text-slate-300 rounded"
            >
              +
            </button>
          </div>

          {/* Export / Import & Clear */}
          <button
            onClick={handleExportJSON}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="تصدير الدائرة JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <label
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            title="استيراد دائرة JSON"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button
            onClick={handleClearCircuit}
            className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 rounded-xl transition"
            title="مسح الدائرة بالكامل"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning/Alert Banner if Short Circuit or Overload */}
      {circuitAlert && (
        <div className="bg-red-600/90 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between gap-2 shadow-lg z-20 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{circuitAlert.message}</span>
          </div>
          <button onClick={() => setCircuitAlert(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace: Left Drawer (Component Library) + Canvas + Right Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Mobile Toggle Button for Library */}
        <button
          onClick={() => setLibraryOpen(!libraryOpen)}
          className="absolute top-3 right-3 z-30 p-2 rounded-xl bg-purple-600 text-white shadow-xl hover:bg-purple-500 transition flex items-center gap-1.5 text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>{libraryOpen ? 'إخفاء المكتبة' : 'مكتبة المكونات'}</span>
        </button>

        {/* Left Drawer: Circuit Wizard Component Library */}
        {libraryOpen && (
          <div className="w-72 sm:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 shadow-2xl transition-all">
            {/* Library Header */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-xs text-white">مكتبة مكونات Circuit Wizard</h3>
              </div>
              <button
                onClick={() => setLibraryOpen(false)}
                className="text-slate-400 hover:text-white p-1"
                title="طي المكتبة"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-2 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="ابحث عن عنصر (مقاومة، LED، محرك...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 p-1.5 border-b border-slate-800 overflow-x-auto text-[11px] no-scrollbar">
              {[
                { id: 'power', label: 'مصادر القدرة' },
                { id: 'passive', label: 'سلبية' },
                { id: 'discrete', label: 'أشباه موصلات' },
                { id: 'input', label: 'إدخال' },
                { id: 'logic', label: 'منطقية' },
                { id: 'ic', label: 'دوائر متكاملة' },
                { id: 'output', label: 'إخراج ومشغلات' },
                { id: 'instruments', label: 'أجهزة قياس' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as ComponentCategory)}
                  className={`px-2 py-1 rounded-lg font-bold shrink-0 transition ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Components Grid */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {/* Category: Power */}
              {selectedCategory === 'power' && (
                <>
                  <ComponentCard
                    name="9V Battery"
                    nameAr="بطارية 9V"
                    icon="🔋"
                    onClick={() => handleAddComponent('battery', '9V Battery', 'بطارية 9V', 'power', 9, 'V')}
                  />
                  <ComponentCard
                    name="1.5V AA Battery"
                    nameAr="بطارية AA 1.5V"
                    icon="🔋"
                    onClick={() => handleAddComponent('battery_aa', '1.5V AA Battery', 'بطارية AA 1.5V', 'power', 1.5, 'V')}
                  />
                  <ComponentCard
                    name="18650 Li-ion Cell"
                    nameAr="بطارية ليثيوم 18650"
                    icon="🔋"
                    onClick={() => handleAddComponent('battery_18650', '18650 Li-ion (3.7V)', 'بطارية ليثيوم 18650', 'power', 3.7, 'V')}
                  />
                  <ComponentCard
                    name="12V Lead-Acid Battery"
                    nameAr="بطارية رصاصية 12V"
                    icon="🔋"
                    onClick={() => handleAddComponent('battery_lead_acid', '12V Lead Acid', 'بطارية رصاصية 12V', 'power', 12, 'V')}
                  />
                  <ComponentCard
                    name="Solar Cell Panel"
                    nameAr="خلية شمسية (Solar)"
                    icon="☀️"
                    onClick={() => handleAddComponent('solar_cell', 'Solar Cell 5V', 'خلية شمسية 5V', 'power', 5, 'V')}
                  />
                  <ComponentCard
                    name="Adjustable DC Supply"
                    nameAr="مصدر DC متغير (0-30V)"
                    icon="⚡"
                    onClick={() => handleAddComponent('dc_source', 'DC Power Supply', 'مصدر قدرة DC', 'power', 12, 'V')}
                  />
                  <ComponentCard
                    name="AC Voltage Source"
                    nameAr="مصدر جهد AC متناوب"
                    icon="〰️"
                    onClick={() => handleAddComponent('ac_source', 'AC Source 12V', 'مصدر AC 12V', 'power', 12, 'V')}
                  />
                  <ComponentCard
                    name="Ground (0V)"
                    nameAr="تأريض Ground (0V)"
                    icon="⏚"
                    onClick={() => handleAddComponent('ground', 'Ground', 'تأريض', 'power', 0, 'V')}
                  />
                  <ComponentCard
                    name="VCC (+5V)"
                    nameAr="خط تغذية VCC (+5V)"
                    icon="🔺"
                    onClick={() => handleAddComponent('vcc', 'VCC +5V', 'تغذية VCC 5V', 'power', 5, 'V')}
                  />
                </>
              )}

              {/* Category: Passive */}
              {selectedCategory === 'passive' && (
                <>
                  <ComponentCard
                    name="Resistor 100Ω"
                    nameAr="مقاومة 100Ω"
                    icon="〰️"
                    onClick={() => handleAddComponent('resistor', 'Resistor 100Ω', 'مقاومة 100Ω', 'passive', 100, 'Ω')}
                  />
                  <ComponentCard
                    name="Resistor 220Ω"
                    nameAr="مقاومة 220Ω"
                    icon="〰️"
                    onClick={() => handleAddComponent('resistor', 'Resistor 220Ω', 'مقاومة 220Ω', 'passive', 220, 'Ω')}
                  />
                  <ComponentCard
                    name="Resistor 330Ω"
                    nameAr="مقاومة 330Ω"
                    icon="〰️"
                    onClick={() => handleAddComponent('resistor', 'Resistor 330Ω', 'مقاومة 330Ω', 'passive', 330, 'Ω')}
                  />
                  <ComponentCard
                    name="Resistor 470Ω"
                    nameAr="مقاومة 470Ω"
                    icon="〰️"
                    onClick={() => handleAddComponent('resistor', 'Resistor 470Ω', 'مقاومة 470Ω', 'passive', 470, 'Ω')}
                  />
                  <ComponentCard
                    name="Resistor 1kΩ"
                    nameAr="مقاومة 1kΩ"
                    icon="〰️"
                    onClick={() => handleAddComponent('resistor', 'Resistor 1kΩ', 'مقاومة 1kΩ', 'passive', 1000, 'Ω')}
                  />
                  <ComponentCard
                    name="Resistor 10kΩ"
                    nameAr="مقاومة 10kΩ"
                    icon="〰️"
                    onClick={() => handleAddComponent('resistor', 'Resistor 10kΩ', 'مقاومة 10kΩ', 'passive', 10000, 'Ω')}
                  />
                  <ComponentCard
                    name="Resistor 100kΩ"
                    nameAr="مقاومة 100kΩ"
                    icon="〰️"
                    onClick={() => handleAddComponent('resistor', 'Resistor 100kΩ', 'مقاومة 100kΩ', 'passive', 100000, 'Ω')}
                  />
                  <ComponentCard
                    name="Ceramic Capacitor 100nF"
                    nameAr="مكثف سيراميكي 100nF (104)"
                    icon="⫨"
                    onClick={() => handleAddComponent('capacitor', 'Ceramic Cap 100nF', 'مكثف سيراميكي 100nF', 'passive', 0.0000001, 'F')}
                  />
                  <ComponentCard
                    name="Electrolytic Capacitor 100µF"
                    nameAr="مكثف إلكتروليتي 100µF (قطبي)"
                    icon="⫨"
                    onClick={() => handleAddComponent('capacitor_electrolytic', 'Electrolytic Cap 100µF', 'مكثف إلكتروليتي 100µF', 'passive', 0.0001, 'F')}
                  />
                  <ComponentCard
                    name="Potentiometer 10kΩ"
                    nameAr="مقاومة متغيرة Potentiometer"
                    icon="🎚️"
                    onClick={() => handleAddComponent('potentiometer', 'Potentiometer 10kΩ', 'مقاومة متغيرة 10kΩ', 'passive', 10000, 'Ω')}
                  />
                  <ComponentCard
                    name="Trimmer Pot 10kΩ"
                    nameAr="مقاومة ضبط Trimmer"
                    icon="⚙️"
                    onClick={() => handleAddComponent('trimmer', 'Trimmer 10kΩ', 'مقاومة ضبط 10kΩ', 'passive', 10000, 'Ω')}
                  />
                  <ComponentCard
                    name="Inductor Coil 10mH"
                    nameAr="ملف حثي (Inductor) 10mH"
                    icon="➰"
                    onClick={() => handleAddComponent('inductor', 'Inductor 10mH', 'ملف حثي 10mH', 'passive', 0.01, 'H')}
                  />
                  <ComponentCard
                    name="Transformer"
                    nameAr="محول كهربائي Transformer"
                    icon="⚡"
                    onClick={() => handleAddComponent('transformer', 'Transformer', 'محول كهربائي', 'passive', 10, 'ratio')}
                  />
                </>
              )}

              {/* Category: Discrete Semiconductors */}
              {selectedCategory === 'discrete' && (
                <>
                  <ComponentCard
                    name="Red LED"
                    nameAr="دايود LED أحمر"
                    icon="🔴"
                    onClick={() => handleAddComponent('led', 'Red LED', 'LED أحمر', 'discrete', 2.1, 'V')}
                  />
                  <ComponentCard
                    name="Green LED"
                    nameAr="دايود LED أخضر"
                    icon="🟢"
                    onClick={() => handleAddComponent('led', 'Green LED', 'LED أخضر', 'discrete', 2.2, 'V')}
                  />
                  <ComponentCard
                    name="Blue LED"
                    nameAr="دايود LED أزرق"
                    icon="🔵"
                    onClick={() => handleAddComponent('led', 'Blue LED', 'LED أزرق', 'discrete', 3.2, 'V')}
                  />
                  <ComponentCard
                    name="Yellow LED"
                    nameAr="دايود LED أصفر"
                    icon="🟡"
                    onClick={() => handleAddComponent('led', 'Yellow LED', 'LED أصفر', 'discrete', 2.1, 'V')}
                  />
                  <ComponentCard
                    name="Diode 1N4007"
                    nameAr="دايود سيليكون 1N4007"
                    icon="▲"
                    onClick={() => handleAddComponent('diode', 'Diode 1N4007', 'دايود 1N4007', 'discrete', 0.7, 'V')}
                  />
                  <ComponentCard
                    name="Zener Diode 5.1V"
                    nameAr="دايود زينر Zener 5.1V"
                    icon="⚡"
                    onClick={() => handleAddComponent('zener', 'Zener Diode 5.1V', 'دايود زينر 5.1V', 'discrete', 5.1, 'V')}
                  />
                  <ComponentCard
                    name="NPN Transistor BC547"
                    nameAr="ترانزستور NPN (BC547 / 2N2222)"
                    icon="🔀"
                    onClick={() => handleAddComponent('transistor_npn', 'NPN BC547', 'ترانزستور BC547', 'discrete', 100, 'hfe')}
                  />
                  <ComponentCard
                    name="PNP Transistor BC557"
                    nameAr="ترانزستور PNP (BC557)"
                    icon="🔀"
                    onClick={() => handleAddComponent('transistor_pnp', 'PNP BC557', 'ترانزستور BC557', 'discrete', 100, 'hfe')}
                  />
                  <ComponentCard
                    name="N-Channel MOSFET IRFZ44N"
                    nameAr="ترانزستور موسفت N-MOSFET"
                    icon="⚡"
                    onClick={() => handleAddComponent('mosfet_n', 'MOSFET IRFZ44N', 'موسفت IRFZ44N', 'discrete', 10, 'A')}
                  />
                </>
              )}

              {/* Category: Input */}
              {selectedCategory === 'input' && (
                <>
                  <ComponentCard
                    name="SPST Toggle Switch"
                    nameAr="مفتاح تشغيل/إيقاف SPST"
                    icon="🔌"
                    onClick={() => handleAddComponent('switch_spst', 'SPST Switch', 'مفتاح SPST', 'input', 0, '')}
                  />
                  <ComponentCard
                    name="Push Button (NO)"
                    nameAr="زر ضغط مفتوح (Normally Open)"
                    icon="🔘"
                    onClick={() => handleAddComponent('push_button', 'Push Button (NO)', 'زر ضغط NO', 'input', 0, '')}
                  />
                  <ComponentCard
                    name="Push Button (NC)"
                    nameAr="زر ضغط مغلق (Normally Closed)"
                    icon="🔴"
                    onClick={() => handleAddComponent('push_button_nc', 'Push Button (NC)', 'زر ضغط NC', 'input', 0, '')}
                  />
                  <ComponentCard
                    name="SPDT Switch"
                    nameAr="مفتاح تحويل SPDT"
                    icon="🔀"
                    onClick={() => handleAddComponent('switch_spdt', 'SPDT Switch', 'مفتاح SPDT', 'input', 0, '')}
                  />
                  <ComponentCard
                    name="LDR Light Sensor"
                    nameAr="مقاومة ضوئية LDR"
                    icon="☀️"
                    onClick={() => handleAddComponent('ldr', 'LDR Sensor', 'حساس ضوء LDR', 'input', 5000, 'Ω')}
                  />
                  <ComponentCard
                    name="Thermistor NTC"
                    nameAr="مقاومة حرارية NTC"
                    icon="🌡️"
                    onClick={() => handleAddComponent('thermistor', 'Thermistor NTC', 'حساس حرارة NTC', 'input', 10000, 'Ω')}
                  />
                </>
              )}

              {/* Category: Logic Gates */}
              {selectedCategory === 'logic' && (
                <>
                  <ComponentCard
                    name="AND Gate 7408"
                    nameAr="بوابة AND منطقية"
                    icon="⩓"
                    onClick={() => handleAddComponent('gate_and', 'AND Gate', 'بوابة AND', 'logic', 0, '')}
                  />
                  <ComponentCard
                    name="OR Gate 7432"
                    nameAr="بوابة OR منطقية"
                    icon="⩔"
                    onClick={() => handleAddComponent('gate_or', 'OR Gate', 'بوابة OR', 'logic', 0, '')}
                  />
                  <ComponentCard
                    name="NOT Gate (Inverter)"
                    nameAr="بوابة NOT (عاكس منطقي)"
                    icon="¬"
                    onClick={() => handleAddComponent('gate_not', 'NOT Gate', 'بوابة NOT', 'logic', 0, '')}
                  />
                  <ComponentCard
                    name="NAND Gate 7400"
                    nameAr="بوابة NAND منطقية"
                    icon="⊼"
                    onClick={() => handleAddComponent('gate_nand', 'NAND Gate', 'بوابة NAND', 'logic', 0, '')}
                  />
                  <ComponentCard
                    name="NOR Gate 7402"
                    nameAr="بوابة NOR منطقية"
                    icon="⊽"
                    onClick={() => handleAddComponent('gate_nor', 'NOR Gate', 'بوابة NOR', 'logic', 0, '')}
                  />
                  <ComponentCard
                    name="XOR Gate 7486"
                    nameAr="بوابة XOR منطقية"
                    icon="⊕"
                    onClick={() => handleAddComponent('gate_xor', 'XOR Gate', 'بوابة XOR', 'logic', 0, '')}
                  />
                  <ComponentCard
                    name="XNOR Gate"
                    nameAr="بوابة XNOR منطقية"
                    icon="⊙"
                    onClick={() => handleAddComponent('gate_xnor', 'XNOR Gate', 'بوابة XNOR', 'logic', 0, '')}
                  />
                </>
              )}

              {/* Category: Integrated Circuits (IC) */}
              {selectedCategory === 'ic' && (
                <>
                  <ComponentCard
                    name="NE555 Precision Timer"
                    nameAr="مؤقت دقيق NE555 (DIP-8)"
                    icon="⏱️"
                    onClick={() => handleAddComponent('ic_555', 'NE555 Timer', 'مؤقت 555', 'ic', 0, '')}
                  />
                  <ComponentCard
                    name="Op-Amp LM741 / LM358"
                    nameAr="مكبر عمليات Op-Amp LM741"
                    icon="🔺"
                    onClick={() => handleAddComponent('opamp', 'Op-Amp LM741', 'مكبر LM741', 'ic', 100000, 'gain')}
                  />
                </>
              )}

              {/* Category: Output Components */}
              {selectedCategory === 'output' && (
                <>
                  <ComponentCard
                    name="DC Motor with Shaft"
                    nameAr="محرك تيار مستمر DC Motor"
                    icon="⚙️"
                    onClick={() => handleAddComponent('dc_motor', 'DC Motor', 'محرك DC', 'output', 12, 'V')}
                  />
                  <ComponentCard
                    name="Filament Lamp Bulb"
                    nameAr="مصباح كهربائي متوهج"
                    icon="💡"
                    onClick={() => handleAddComponent('lamp', 'Lamp', 'مصباح كهربائي', 'output', 9, 'V')}
                  />
                  <ComponentCard
                    name="Piezo Buzzer (Sound)"
                    nameAr="صفارة إنذار كهرضغطية (Buzzer)"
                    icon="🔊"
                    onClick={() => handleAddComponent('buzzer', 'Buzzer', 'صفارة إنذار', 'output', 5, 'V')}
                  />
                  <ComponentCard
                    name="SPDT Relay 12V"
                    nameAr="مرحل كهرومغناطيسي Relay"
                    icon="🧲"
                    onClick={() => handleAddComponent('relay', 'Relay 12V', 'مرحل كهرومغناطيسي', 'output', 12, 'V')}
                  />
                  <ComponentCard
                    name="7-Segment Display"
                    nameAr="شاشة 7-Segment رقمية"
                    icon="🔢"
                    onClick={() => handleAddComponent('seven_segment', '7-Segment', 'شاشة 7 قطع', 'output', 5, 'V')}
                  />
                </>
              )}

              {/* Category: Instruments */}
              {selectedCategory === 'instruments' && (
                <>
                  <ComponentCard
                    name="Digital Voltmeter"
                    nameAr="فولتميتر رقمي (DC Voltmeter)"
                    icon="📟"
                    onClick={() => handleAddComponent('voltmeter', 'Voltmeter', 'فولتميتر رقمي', 'instruments', 0, 'V')}
                  />
                  <ComponentCard
                    name="Digital Ammeter"
                    nameAr="أميتر رقمي (DC Ammeter)"
                    icon="🎛️"
                    onClick={() => handleAddComponent('ammeter', 'Ammeter', 'أميتر رقمي', 'instruments', 0, 'A')}
                  />
                  <ComponentCard
                    name="Mini Oscilloscope"
                    nameAr="راسم إشارة مصغر (Scope)"
                    icon="📈"
                    onClick={() => handleAddComponent('oscilloscope', 'Oscilloscope', 'راسم إشارة', 'instruments', 0, '')}
                  />
                  <ComponentCard
                    name="Logic State Probe"
                    nameAr="مسبار منطقي (Logic Probe)"
                    icon="💡"
                    onClick={() => handleAddComponent('logic_probe', 'Logic Probe', 'مسبار منطقي', 'instruments', 0, '')}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Center: Circuit Interactive Drawing Canvas */}
        <div
          className="flex-1 relative bg-slate-950 overflow-hidden cursor-crosshair touch-none select-none"
          onPointerDown={handlePointerDownCanvas}
          onPointerMove={handlePointerMoveCanvas}
          onPointerUp={handlePointerUpCanvas}
        >
          {/* Engineering Canvas Grid SVG */}
          <svg
            ref={canvasRef}
            className="w-full h-full absolute inset-0"
            viewBox="0 0 1600 1200"
          >
            <defs>
              <pattern
                id="circuit-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="0.75" fill="#334155" opacity="0.6" />
              </pattern>
            </defs>

            {/* Grid Background */}
            <rect
              x="-2000"
              y="-2000"
              width="6000"
              height="6000"
              fill="url(#circuit-grid)"
            />

            {/* Scaled & Panned Group */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
              {/* Render All Wires */}
              {wires.map((wire) => {
                const p1 = getPinCanvasCoords(wire.fromCompId, wire.fromPinId);
                const p2 = getPinCanvasCoords(wire.toCompId, wire.toPinId);

                let strokeColor = '#3b82f6';
                if (showVoltageColors) {
                  const v = wire.voltage ?? 0;
                  if (v > 4.5) strokeColor = '#ef4444'; // High positive
                  else if (v > 1.5) strokeColor = '#f59e0b'; // Intermediate
                  else if (v <= 0.1) strokeColor = '#3b82f6'; // Ground
                }

                // Orthogonal routing path (midpoint bend)
                const midX = (p1.x + p2.x) / 2;
                const pathD = `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;

                return (
                  <g key={wire.id} className="cursor-pointer group">
                    <path
                      d={pathD}
                      stroke="transparent"
                      strokeWidth="14"
                      fill="none"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextWires = wires.filter((w) => w.id !== wire.id);
                        setWires(nextWires);
                        pushHistory(elements, nextWires);
                      }}
                    />
                    <path
                      d={pathD}
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      className="transition-colors duration-150"
                    />

                    {/* Animated Current Flow Dots (Circuit Wizard signature) */}
                    {isRunning && showCurrentFlow && (wire.current ?? 0) > 0.001 && (
                      <circle r="3.5" fill="#fde047" className="animate-pulse shadow-sm">
                        <animateMotion
                          path={pathD}
                          dur={`${Math.max(0.4, 2.5 - (wire.current || 0.1) * 3)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Rubberband Wire when wiring between pins */}
              {wiringFrom && (
                <line
                  x1={getPinCanvasCoords(wiringFrom.compId, wiringFrom.pinId).x}
                  y1={getPinCanvasCoords(wiringFrom.compId, wiringFrom.pinId).y}
                  x2={getPinCanvasCoords(wiringFrom.compId, wiringFrom.pinId).x + 30}
                  y2={getPinCanvasCoords(wiringFrom.compId, wiringFrom.pinId).y + 30}
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              )}

              {/* Render Components */}
              {elements.map((comp) => {
                const isSelected = comp.id === selectedCompId;
                const pins = COMPONENT_PINS[comp.kind] || [];

                return (
                  <g
                    key={comp.id}
                    transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`}
                    onPointerDown={(e) => handleCompPointerDown(e, comp)}
                    onClick={(e) => handleComponentClick(e, comp)}
                    className="cursor-move group"
                  >
                    {/* Selection halo */}
                    {isSelected && (
                      <rect
                        x="-48"
                        y="-48"
                        width="96"
                        height="96"
                        fill="rgba(168, 85, 247, 0.1)"
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        rx="8"
                      />
                    )}

                    {/* Render Component Body: Real-World vs Schematic */}
                    {viewMode === 'realworld' ? (
                      <RealWorldComponentRenderer comp={comp} tick={currentTick} />
                    ) : (
                      <SchematicComponentRenderer comp={comp} tick={currentTick} />
                    )}

                    {/* Overloaded Smoke / Flame Icon */}
                    {comp.isOverloaded && (
                      <g transform="translate(0, -35)">
                        <circle r="12" fill="#ef4444" className="animate-ping opacity-75" />
                        <text textAnchor="middle" dominantBaseline="central" fontSize="14">
                          🔥
                        </text>
                      </g>
                    )}

                    {/* Component Label */}
                    <text
                      x="0"
                      y="42"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="bold"
                      className="select-none pointer-events-none"
                    >
                      {comp.label || comp.nameAr}
                    </text>

                    {/* Render Component Pins (Connection Points) */}
                    {pins.map((pin) => (
                      <g
                        key={pin.id}
                        transform={`translate(${pin.relX}, ${pin.relY})`}
                        onClick={(e) => handlePinClick(e, comp.id, pin.id)}
                        className="cursor-pointer group/pin"
                      >
                        <circle r="12" fill="transparent" />
                        <circle
                          r="4"
                          fill="#0f172a"
                          stroke={wiringFrom?.compId === comp.id && wiringFrom?.pinId === pin.id ? '#a855f7' : '#e2e8f0'}
                          strokeWidth="2"
                          className="transition-colors group-hover/pin:stroke-amber-400 group-hover/pin:fill-amber-400"
                        />
                        <text
                          y="-7"
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="7"
                          className="opacity-0 group-hover/pin:opacity-100 transition-opacity font-mono pointer-events-none"
                        >
                          {pin.name}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Quick HUD Tip on Bottom-Left */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded-xl text-[11px] text-slate-300 pointer-events-none max-w-xs shadow-lg space-y-1 z-10">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>مختبر سيركت ويزارد للهواتف والكمبيوتر</span>
            </div>
            <p className="text-slate-400 leading-tight">
              انقر على أي طرف لتمديد سلك، انقر على السلك لحذفه، وانقر على المفاتيح لتشغيلها أثناء المحاكاة.
            </p>
          </div>
        </div>

        {/* Right Inspector Drawer (Properties for Selected Component) */}
        {showInspector && selectedComp && (
          <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 z-20 space-y-4 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <h4 className="font-bold text-xs text-white">خصائص العنصر</h4>
                </div>
                <button
                  onClick={() => setShowInspector(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Component Info Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <span className="text-purple-400 font-bold block">{selectedComp.nameAr}</span>
                <span className="text-slate-400 font-mono text-[10px] block">{selectedComp.name}</span>
                <div className="pt-2 border-t border-slate-900 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">هبوط الجهد:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {(selectedComp.voltageDrop || 0).toFixed(2)} V
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">التيار المار:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {((selectedComp.currentThrough || 0) * 1000).toFixed(1)} mA
                    </span>
                  </div>
                </div>
              </div>

              {/* Value Tuning (Resistor Ω, Battery V, Potentiometer, etc.) */}
              {(selectedComp.kind === 'resistor' || selectedComp.kind === 'battery' || selectedComp.kind === 'dc_source') && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-medium block">
                    القيمة ({selectedComp.unit}):
                  </label>
                  <input
                    type="number"
                    value={selectedComp.value}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setElements((prev) =>
                        prev.map((c) =>
                          c.id === selectedComp.id
                            ? { ...c, value: val, label: `${val}${c.unit}` }
                            : c
                        )
                      );
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />

                  {/* Resistor Color Bands Preview */}
                  {selectedComp.kind === 'resistor' && (
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block">حلقات الألوان القياسية للمقاومة:</span>
                      <div className="flex items-center gap-1.5 h-4 justify-center">
                        {getResistorColorBands(selectedComp.value).map((b, idx) => (
                          <div
                            key={idx}
                            className="w-3.5 h-full rounded-sm border border-slate-700"
                            style={{ backgroundColor: b }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LDR Lux Light Slider */}
              {selectedComp.kind === 'ldr' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">شدة الإضاءة:</span>
                    <span className="font-mono text-amber-400">{selectedComp.setting || 50}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedComp.setting || 50}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setElements((prev) =>
                        prev.map((c) => (c.id === selectedComp.id ? { ...c, setting: val } : c))
                      );
                    }}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    (في الظلام تزداد المقاومة، وعند الضوء تقل المقاومة)
                  </span>
                </div>
              )}

              {/* Potentiometer Rotary Slider */}
              {selectedComp.kind === 'potentiometer' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">موضع المنزلقة:</span>
                    <span className="font-mono text-purple-400">{selectedComp.setting || 50}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedComp.setting || 50}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setElements((prev) =>
                        prev.map((c) => (c.id === selectedComp.id ? { ...c, setting: val } : c))
                      );
                    }}
                    className="w-full accent-purple-600"
                  />
                </div>
              )}

              {/* LED Color Picker */}
              {selectedComp.kind === 'led' && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-medium block">لون الدايود LED:</label>
                  <div className="flex items-center gap-2">
                    {[
                      { hex: '#ef4444', label: 'أحمر' },
                      { hex: '#22c55e', label: 'أخضر' },
                      { hex: '#3b82f6', label: 'أزرق' },
                      { hex: '#eab308', label: 'أصفر' },
                      { hex: '#ffffff', label: 'أبيض' }
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => {
                          setElements((prev) =>
                            prev.map((c) =>
                              c.id === selectedComp.id ? { ...c, color: col.hex } : c
                            )
                          );
                        }}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          selectedComp.color === col.hex ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Switch Toggle State Button */}
              {(selectedComp.kind === 'switch_spst' || selectedComp.kind === 'push_button' || selectedComp.kind === 'push_button_nc') && (
                <button
                  onClick={() => {
                    if (soundEnabled) audioEngine.playRelayClick();
                    setElements((prev) =>
                      prev.map((c) =>
                        c.id === selectedComp.id ? { ...c, state: !c.state } : c
                      )
                    );
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    selectedComp.state
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{selectedComp.state ? 'الحالة: مغلَق (ON)' : 'الحالة: مفتوح (OFF)'}</span>
                </button>
              )}
            </div>

            {/* Quick Component Actions */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={handleRotateSelected}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>تدوير</span>
              </button>
              <button
                onClick={handleDeleteSelected}
                className="py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Circuits Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">مكتبة تجارب ودوائر Circuit Wizard المنهجية</h3>
              </div>
              <button onClick={() => setShowPresetsModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              اختر أي تجربة معملية لتحميل مخطط الدائرة فورياً إلى مساحة العمل وبدء المحاكاة والقياس:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {PRESET_CIRCUITS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleLoadPreset(p)}
                  className="bg-slate-950 hover:bg-slate-800/80 p-4 rounded-2xl border border-slate-800 hover:border-purple-500/50 cursor-pointer transition space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100 group-hover:text-purple-300 transition">
                      {p.title}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1">
                    <span>عدد المكونات: {p.components.length}</span>
                    <span>•</span>
                    <span>الأسلاك: {p.wires.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Lab Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">إصدار تقرير التجربة المعملية (Lab Report)</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">اسم الطالب المهندس:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">الجامعة / الكلية:</label>
                <input
                  type="text"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              {/* Results summary table */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block">ملخص قياسات الدائرة الحالية:</span>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {elements.map((el) => (
                    <div key={el.id} className="flex justify-between text-[11px] border-b border-slate-900 pb-1">
                      <span className="text-slate-300">{el.nameAr}:</span>
                      <span className="font-mono text-emerald-400">
                        {el.voltageDrop ? `${el.voltageDrop.toFixed(2)}V` : '0V'} |{' '}
                        {el.currentThrough ? `${(el.currentThrough * 1000).toFixed(1)}mA` : '0mA'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <FileDown className="w-4 h-4" />
                <span>طباعة أو حفظ التقرير PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Component Card in Library ---
function ComponentCard({
  name,
  nameAr,
  icon,
  onClick
}: {
  name: string;
  nameAr: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 p-2.5 rounded-xl flex items-center gap-2.5 transition text-right group shadow-sm"
    >
      <span className="text-xl group-hover:scale-110 transition shrink-0">{icon}</span>
      <div className="truncate">
        <span className="block text-xs font-bold text-slate-200 group-hover:text-white truncate">
          {nameAr}
        </span>
        <span className="block text-[10px] font-mono text-slate-500 truncate">{name}</span>
      </div>
    </button>
  );
}

// --- Real-World Component Renderer (Pictorial Mode) ---
function RealWorldComponentRenderer({
  comp,
  tick
}: {
  comp: CircuitElement;
  tick: number;
}) {
  switch (comp.kind) {
    case 'battery':
      return (
        <g>
          <rect x="-30" y="-18" width="60" height="36" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <rect x="28" y="-6" width="6" height="12" fill="#94a3b8" rx="1" />
          <rect x="-34" y="-8" width="6" height="16" fill="#cbd5e1" rx="1" />
          <rect x="-24" y="-14" width="48" height="28" rx="2" fill="#0f172a" />
          <text x="0" y="2" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="900" fontFamily="sans-serif">
            {comp.value}V
          </text>
          <text x="0" y="10" textAnchor="middle" fill="#64748b" fontSize="6">
            9V BATTERY
          </text>
        </g>
      );

    case 'battery_aa':
      return (
        <g>
          <rect x="-26" y="-12" width="52" height="24" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <rect x="24" y="-5" width="4" height="10" fill="#cbd5e1" rx="1" />
          <rect x="-18" y="-10" width="36" height="20" fill="#f59e0b" rx="2" />
          <text x="0" y="3" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">
            1.5V AA
          </text>
        </g>
      );

    case 'battery_18650':
      return (
        <g>
          <rect x="-32" y="-14" width="64" height="28" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="30" y="-6" width="4" height="12" fill="#cbd5e1" rx="1" />
          <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
            18650 3.7V
          </text>
        </g>
      );

    case 'solar_cell':
      return (
        <g>
          <rect x="-32" y="-22" width="64" height="44" rx="3" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
          <line x1="-32" y1="-7" x2="32" y2="-7" stroke="#93c5fd" strokeWidth="1" />
          <line x1="-32" y1="8" x2="32" y2="8" stroke="#93c5fd" strokeWidth="1" />
          <line x1="-10" y1="-22" x2="-10" y2="22" stroke="#93c5fd" strokeWidth="1" />
          <line x1="10" y1="-22" x2="10" y2="22" stroke="#93c5fd" strokeWidth="1" />
          <circle cx="0" cy="0" r="8" fill="#facc15" opacity="0.3" className="animate-pulse" />
        </g>
      );

    case 'resistor': {
      const bands = getResistorColorBands(comp.value);
      return (
        <g>
          <line x1="-35" y1="0" x2="-22" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="22" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="-22" y="-9" width="44" height="18" rx="5" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
          <rect x="-14" y="-9" width="4" height="18" fill={bands[0]} />
          <rect x="-6" y="-9" width="4" height="18" fill={bands[1]} />
          <rect x="2" y="-9" width="4" height="18" fill={bands[2]} />
          <rect x="11" y="-9" width="3" height="18" fill={bands[3]} />
        </g>
      );
    }

    case 'capacitor_electrolytic':
      return (
        <g>
          <line x1="-35" y1="0" x2="-18" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="18" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="-18" y="-14" width="36" height="28" rx="4" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
          {/* Negative stripe */}
          <rect x="8" y="-14" width="8" height="28" fill="#cbd5e1" />
          <text x="12" y="3" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">
            -
          </text>
          <text x="-4" y="2" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
            100µF
          </text>
        </g>
      );

    case 'capacitor':
      return (
        <g>
          <line x1="-35" y1="0" x2="-12" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="12" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="0" cy="0" r="14" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          <text x="0" y="3" textAnchor="middle" fill="#78350f" fontSize="7" fontWeight="bold">
            104
          </text>
        </g>
      );

    case 'led': {
      const isLit = (comp.currentThrough || 0) > 0.002;
      const ledColor = comp.color || '#ef4444';
      return (
        <g>
          <line x1="-35" y1="0" x2="-12" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="12" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          {isLit && (
            <circle cx="0" cy="0" r="26" fill={ledColor} opacity="0.35" className="animate-pulse" />
          )}
          <ellipse
            cx="0"
            cy="0"
            rx="12"
            ry="10"
            fill={isLit ? ledColor : '#334155'}
            stroke={isLit ? '#ffffff' : '#64748b'}
            strokeWidth="1.5"
          />
          <line x1="-3" y1="-4" x2="4" y2="4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        </g>
      );
    }

    case 'dc_motor': {
      const isSpinning = (comp.motorSpeed || 0) > 0;
      const rotorAngle = isSpinning ? (tick * 45) % 360 : 0;
      return (
        <g>
          <rect x="-35" y="-5" width="8" height="10" fill="#94a3b8" />
          <rect x="27" y="-5" width="8" height="10" fill="#94a3b8" />
          <circle cx="0" cy="0" r="22" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="0" cy="0" r="15" fill="#334155" />
          <g transform={`rotate(${rotorAngle})`}>
            <ellipse cx="0" cy="0" rx="4" ry="14" fill="#38bdf8" />
            <ellipse cx="0" cy="0" rx="14" ry="4" fill="#38bdf8" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </g>
      );
    }

    case 'lamp': {
      const isGlowing = (comp.voltageDrop || 0) > 1.5;
      return (
        <g>
          <line x1="-30" y1="0" x2="-14" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="14" y1="0" x2="30" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          {isGlowing && (
            <circle cx="0" cy="0" r="26" fill="#fde047" opacity="0.4" className="animate-pulse" />
          )}
          <circle cx="0" cy="0" r="14" fill={isGlowing ? '#fef08a' : '#1e293b'} stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M -6 5 L 0 -5 L 6 5" fill="none" stroke={isGlowing ? '#ea580c' : '#64748b'} strokeWidth="1.5" />
        </g>
      );
    }

    case 'push_button':
    case 'switch_spst': {
      const closed = comp.state === true;
      return (
        <g>
          <line x1="-35" y1="0" x2="-16" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="16" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <circle cx={closed ? '5' : '-5'} cy="0" r="6" fill={closed ? '#22c55e' : '#ef4444'} />
          <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold">
            {closed ? 'ON' : 'OFF'}
          </text>
        </g>
      );
    }

    case 'buzzer': {
      const active = comp.buzzerActive;
      return (
        <g>
          <line x1="-25" y1="0" x2="-16" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="16" y1="0" x2="25" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <circle cx="0" cy="0" r="6" fill="#334155" />
          {active && (
            <g stroke="#38bdf8" strokeWidth="1.5" fill="none" className="animate-ping opacity-60">
              <path d="M 18 -8 A 12 12 0 0 1 18 8" />
              <path d="M 22 -12 A 18 18 0 0 1 22 12" />
            </g>
          )}
        </g>
      );
    }

    case 'relay':
      return (
        <g>
          <rect x="-30" y="-22" width="60" height="44" rx="4" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="0" y="-8" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
            RELAY 12V
          </text>
          <path d="M -15 8 L -5 8 L 0 0 L 5 8 L 15 8" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
        </g>
      );

    case 'ic_555':
      return (
        <g>
          <rect x="-35" y="-30" width="70" height="60" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <path d="M -8 -30 A 8 8 0 0 1 8 -30" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <circle cx="-25" cy="-20" r="2" fill="#64748b" />
          <text x="0" y="2" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="bold">
            NE555
          </text>
        </g>
      );

    case 'voltmeter':
      return (
        <g>
          <circle cx="0" cy="0" r="20" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
          <text x="0" y="-3" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">
            {(comp.voltageDrop || 0).toFixed(2)}
          </text>
          <text x="0" y="8" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">
            VOLTS
          </text>
        </g>
      );

    case 'oscilloscope': {
      const points = [];
      for (let i = -16; i <= 16; i += 2) {
        const y = Math.sin((i + tick * 4) * 0.3) * 8;
        points.push(`${i},${y}`);
      }
      return (
        <g>
          <rect x="-24" y="-18" width="48" height="36" rx="4" fill="#022c22" stroke="#10b981" strokeWidth="1.5" />
          <polyline points={points.join(' ')} fill="none" stroke="#34d399" strokeWidth="1.5" />
          <text x="0" y="14" textAnchor="middle" fill="#10b981" fontSize="6" fontWeight="bold">
            SCOPE CH1
          </text>
        </g>
      );
    }

    default:
      return <SchematicComponentRenderer comp={comp} tick={tick} />;
  }
}

// --- Schematic Component Renderer (Standard Symbols) ---
function SchematicComponentRenderer({
  comp,
  tick
}: {
  comp: CircuitElement;
  tick: number;
}) {
  switch (comp.kind) {
    case 'battery':
    case 'battery_aa':
    case 'battery_18650':
    case 'battery_lead_acid':
    case 'dc_source':
      return (
        <g>
          <line x1="-35" y1="0" x2="-8" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="8" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="8" y1="-16" x2="8" y2="16" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="-8" y1="-9" x2="-8" y2="9" stroke="#3b82f6" strokeWidth="4" />
          <text x="14" y="-8" fill="#ef4444" fontSize="8" fontWeight="bold">+</text>
          <text x="-18" y="-8" fill="#3b82f6" fontSize="8" fontWeight="bold">-</text>
        </g>
      );

    case 'ground':
      return (
        <g>
          <line x1="0" y1="-25" x2="0" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="-15" y1="0" x2="15" y2="0" stroke="#cbd5e1" strokeWidth="2.5" />
          <line x1="-10" y1="5" x2="10" y2="5" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="-5" y1="10" x2="5" y2="10" stroke="#cbd5e1" strokeWidth="1.5" />
        </g>
      );

    case 'resistor':
      return (
        <g>
          <line x1="-35" y1="0" x2="-20" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="20" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <path
            d="M -20 0 L -15 -8 L -7 8 L 0 -8 L 7 8 L 15 -8 L 20 0"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
        </g>
      );

    case 'diode':
    case 'led':
      return (
        <g>
          <line x1="-35" y1="0" x2="-10" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="10" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="-10,-10 -10,10 10,0" fill="#3b82f6" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="10" y1="-10" x2="10" y2="10" stroke="#e2e8f0" strokeWidth="2" />
          {comp.kind === 'led' && (
            <g stroke="#f59e0b" strokeWidth="1.5" fill="none">
              <line x1="4" y1="-12" x2="10" y2="-18" />
              <line x1="10" y1="-10" x2="16" y2="-16" />
            </g>
          )}
        </g>
      );

    case 'transistor_npn':
      return (
        <g>
          <circle cx="0" cy="0" r="18" fill="none" stroke="#64748b" strokeWidth="1.5" />
          <line x1="-25" y1="0" x2="-8" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="-8" y1="-12" x2="-8" y2="12" stroke="#cbd5e1" strokeWidth="2.5" />
          <line x1="-8" y1="-6" x2="18" y2="-16" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="-8" y1="6" x2="18" y2="16" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="18,16 12,10 10,15" fill="#cbd5e1" />
        </g>
      );

    case 'gate_and':
      return (
        <g>
          <line x1="-35" y1="-15" x2="-15" y2="-15" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="-35" y1="15" x2="-15" y2="15" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="20" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M -15 -22 L 5 -22 A 22 22 0 0 1 5 22 L -15 22 Z" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
        </g>
      );

    case 'opamp':
      return (
        <g>
          <line x1="-35" y1="-15" x2="-16" y2="-15" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="-35" y1="15" x2="-16" y2="15" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="24" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="-16,-26 -16,26 24,0" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
          <text x="-12" y="-11" fill="#cbd5e1" fontSize="10" fontWeight="bold">-</text>
          <text x="-12" y="19" fill="#cbd5e1" fontSize="10" fontWeight="bold">+</text>
        </g>
      );

    default:
      return (
        <g>
          <rect x="-24" y="-16" width="48" height="32" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <text x="0" y="3" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontWeight="bold">
            {comp.kind.toUpperCase()}
          </text>
        </g>
      );
  }
}
