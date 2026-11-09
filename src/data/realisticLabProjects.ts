import { CWElement, CWWire } from '../components/CircuitWizardLab';

export interface RealisticProject {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  levelTitleAr: string;
  title: string;
  titleAr: string;
  descAr: string;
  objectiveAr: string;
  requiredComponents: string[];
  elements: CWElement[];
  wires: CWWire[];
  expectedValues: {
    minVoltage?: number;
    maxVoltage?: number;
    expectedCurrentmA?: number;
    mustBeLit?: boolean;
    mustBeSpinning?: boolean;
  };
  hintsAr: string[];
  xpReward: number;
  badgeNameAr?: string;
}

export const REALISTIC_LAB_PROJECTS: RealisticProject[] = [
  // ==========================================
  // LEVEL 1: الأساسيات والقياسات الكهربائية
  // ==========================================
  {
    id: 'proj_ohms_law',
    level: 1,
    levelTitleAr: 'المستوى الأول: أساسيات الكهرباء والقياس',
    title: "Ohm's Law Verification",
    titleAr: '🔬 تجربة قانون أوم (Ohm\'s Law: V = I × R)',
    descAr: 'التجربة الأساسية الأولى: التحقق العملي والرياضي من قانون أوم بدراسة العلاقة بين الجهد V والمقاومة R والتيار I.',
    objectiveAr: 'قم بضبط مصدر التغذية DC على 12V والمقاومة على 1000Ω (1kΩ). استخدم الأمبيرميتر والفولتميتر لقياس الحسابات وتحقيق قانون أوم.',
    requiredComponents: ['DC Power Supply 12V', 'Resistor 1kΩ', 'Ammeter', 'Voltmeter', 'Connecting Wires'],
    elements: [
      { id: 'dc_1', ref: 'PS1', kind: 'dc_supply', name: 'DC Power Supply 12V', nameAr: 'وحدة تغذية مستمرة 12V', x: 130, y: 310, rotation: 0, value: 12, unit: 'V' },
      { id: 'r_1', ref: 'R1', kind: 'resistor', name: 'Resistor 1kΩ', nameAr: 'مقاومة كربونية 1kΩ', x: 280, y: 180, rotation: 0, value: 1000, unit: 'Ω' },
      { id: 'am_1', ref: 'AM1', kind: 'ammeter', name: 'Ammeter', nameAr: 'أمبيرميتر قياس التيار', x: 420, y: 180, rotation: 0, value: 0, unit: 'mA' },
      { id: 'vm_1', ref: 'VM1', kind: 'voltmeter', name: 'Voltmeter', nameAr: 'فولتميتر قياس الجهد', x: 280, y: 310, rotation: 0, value: 0, unit: 'V' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'dc_1', fromPinId: 'pos', toCompId: 'r_1', toPinId: 'p1', color: '#dc2626' },
      { id: 'w2', fromCompId: 'r_1', fromPinId: 'p2', toCompId: 'am_1', toPinId: 'pos', color: '#dc2626' },
      { id: 'w3', fromCompId: 'am_1', fromPinId: 'neg', toCompId: 'dc_1', toPinId: 'neg', color: '#111827' },
      { id: 'w4', fromCompId: 'vm_1', fromPinId: 'pos', toCompId: 'r_1', toPinId: 'p1', color: '#2563eb' },
      { id: 'w5', fromCompId: 'vm_1', fromPinId: 'neg', toCompId: 'r_1', toPinId: 'p2', color: '#111827' }
    ],
    expectedValues: {
      minVoltage: 11.5,
      maxVoltage: 12.5,
      expectedCurrentmA: 12.0
    },
    hintsAr: [
      'تذكر أن قانون أوم ينص على: I = V / R.',
      'الأمبيرميتر يجب أن يُوصل على التوالي مع المقاومة.',
      'الفولتميتر يُوصل على التوازي بين طرفي المقاومة R1.'
    ],
    xpReward: 150,
    badgeNameAr: 'وسام قانون أوم'
  },
  {
    id: 'proj_led_protection',
    level: 1,
    levelTitleAr: 'المستوى الأول: أساسيات الكهرباء والقياس',
    title: 'LED Protection Circuit',
    titleAr: '💡 تشغيل دايود LED مع مقاومة حماية',
    descAr: 'دراسة أهمية مقاومة حد التيار لتقليل الجهد العالي وحماية الـ LED الحساس من الاحتراق.',
    objectiveAr: 'قم بتوصيل بطارية 9V مع مفتاح SPST ومقاومة 470Ω ودايود ضوئي LED أحمر واختبر الإضاءة.',
    requiredComponents: ['9V Battery', 'SPST Switch', 'Resistor 470Ω', 'Red LED'],
    elements: [
      { id: 'bat_1', ref: 'B1', kind: 'battery_9v', name: '9V Battery', nameAr: 'بطارية 9V', x: 130, y: 310, rotation: 0, value: 9, unit: 'V' },
      { id: 'sw_1', ref: 'SW1', kind: 'switch_spst', name: 'Switch', nameAr: 'مفتاح تشغيل', x: 230, y: 180, rotation: 0, value: 0, unit: '', state: true },
      { id: 'r_1', ref: 'R1', kind: 'resistor', name: 'Resistor 470Ω', nameAr: 'مقاومة 470Ω', x: 330, y: 180, rotation: 0, value: 470, unit: 'Ω' },
      { id: 'led_1', ref: 'LED1', kind: 'led', name: 'Red LED', nameAr: 'LED أحمر', x: 330, y: 310, rotation: 0, value: 2.1, unit: 'V', color: '#ef4444' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'bat_1', fromPinId: 'pos', toCompId: 'sw_1', toPinId: 'p1', color: '#dc2626' },
      { id: 'w2', fromCompId: 'sw_1', fromPinId: 'p2', toCompId: 'r_1', toPinId: 'p1', color: '#dc2626' },
      { id: 'w3', fromCompId: 'r_1', fromPinId: 'p2', toCompId: 'led_1', toPinId: 'anode', color: '#dc2626' },
      { id: 'w4', fromCompId: 'led_1', fromPinId: 'cathode', toCompId: 'bat_1', toPinId: 'neg', color: '#111827' }
    ],
    expectedValues: {
      mustBeLit: true,
      expectedCurrentmA: 14.6
    },
    hintsAr: [
      'تأكد من توصيل الطرف الموجب الأنود (+) بالجهد الموجب والكاثود (-) بالسالب.',
      'تأكد من أن المفتاح في حالة إغلاق ON.'
    ],
    xpReward: 100,
    badgeNameAr: 'وسام الضوء والكهرباء'
  },
  {
    id: 'proj_series_parallel',
    level: 1,
    levelTitleAr: 'المستوى الأول: أساسيات الكهرباء والقياس',
    title: 'Series & Parallel Lamp Circuits',
    titleAr: '⚡ دوائر التوالي والتوازي للمصابيح',
    descAr: 'مقارنة هبوط الجهد وشدة الإضاءة بين توصيل المصابيح على التوالي والتوازي.',
    objectiveAr: 'صل مصباحين على التوالي وقارن الإضاءة والجهد مع التوصيل على التوازي.',
    requiredComponents: ['Power Supply 12V', '2x Incandescent Bulbs', 'Voltmeter'],
    elements: [
      { id: 'dc_1', ref: 'PS1', kind: 'dc_supply', name: '12V Power Supply', nameAr: 'مصدر تغذية 12V', x: 130, y: 310, rotation: 0, value: 12, unit: 'V' },
      { id: 'b_1', ref: 'BL1', kind: 'bulb', name: 'Lamp 1', nameAr: 'مصباح 1', x: 280, y: 180, rotation: 0, value: 12, unit: 'V' },
      { id: 'b_2', ref: 'BL2', kind: 'bulb', name: 'Lamp 2', nameAr: 'مصباح 2', x: 400, y: 180, rotation: 0, value: 12, unit: 'V' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'dc_1', fromPinId: 'pos', toCompId: 'b_1', toPinId: 'p1', color: '#dc2626' },
      { id: 'w2', fromCompId: 'b_1', fromPinId: 'p2', toCompId: 'b_2', toPinId: 'p1', color: '#2563eb' },
      { id: 'w3', fromCompId: 'b_2', fromPinId: 'p2', toCompId: 'dc_1', toPinId: 'neg', color: '#111827' }
    ],
    expectedValues: {
      mustBeLit: true
    },
    hintsAr: [
      'في توصيل التوالي، ينقسم الجهد الكلي 12V بالتساوي على المصباحين فيأخذ كل منهما 6V.',
      'في التوازي يحصل كل مصباح على 12V كاملة.'
    ],
    xpReward: 120,
    badgeNameAr: 'وسام التوالي والتوازي'
  },

  // ==========================================
  // LEVEL 2: الإلكترونيات والتحكم التماثلي
  // ==========================================
  {
    id: 'proj_transistor_switch',
    level: 2,
    levelTitleAr: 'المستوى الثاني: الإلكترونيات والتحكم',
    title: 'NPN Transistor Solid-State Switch',
    titleAr: '🔌 مفتاح الترانزستور الإلكتروني (Transistor Switch)',
    descAr: 'استخدام ترانزستور NPN BJT كمفتاح إلكتروني صلب للتحكم بحمل كبير (محرك/مصباح) باستخدام تيار قاعدة صغير.',
    objectiveAr: 'صل إشارة القاعدة B عبر مقاومة 10kΩ لتحفيز الترانزستور وتشغيل المحرك أو الريليه.',
    requiredComponents: ['NPN Transistor', 'DC Motor', 'Resistor 10kΩ', 'Switch', '9V Battery'],
    elements: [
      { id: 'bat_1', ref: 'B1', kind: 'battery_9v', name: '9V Battery', nameAr: 'بطارية 9V', x: 130, y: 310, rotation: 0, value: 9, unit: 'V' },
      { id: 'sw_1', ref: 'SW1', kind: 'switch_spst', name: 'Control Switch', nameAr: 'مفتاح تحكم القاعدة', x: 230, y: 180, rotation: 0, value: 0, unit: '', state: true },
      { id: 'r_base', ref: 'Rb', kind: 'resistor', name: 'Base Resistor 10kΩ', nameAr: 'مقاومة القاعدة 10kΩ', x: 330, y: 180, rotation: 0, value: 10000, unit: 'Ω' },
      { id: 'q_1', ref: 'Q1', kind: 'transistor', name: 'NPN Transistor', nameAr: 'ترانزستور NPN', x: 420, y: 250, rotation: 0, value: 0, unit: '' },
      { id: 'm_1', ref: 'M1', kind: 'motor', name: 'DC Motor', nameAr: 'محرك مستمر DC', x: 420, y: 130, rotation: 0, value: 9, unit: 'V' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'bat_1', fromPinId: 'pos', toCompId: 'sw_1', toPinId: 'p1', color: '#dc2626' },
      { id: 'w2', fromCompId: 'sw_1', fromPinId: 'p2', toCompId: 'r_base', toPinId: 'p1', color: '#dc2626' },
      { id: 'w3', fromCompId: 'r_base', fromPinId: 'p2', toCompId: 'q_1', toPinId: 'base', color: '#2563eb' },
      { id: 'w4', fromCompId: 'bat_1', fromPinId: 'pos', toCompId: 'm_1', toPinId: 'p1', color: '#dc2626' },
      { id: 'w5', fromCompId: 'm_1', fromPinId: 'p2', toCompId: 'q_1', toPinId: 'collector', color: '#dc2626' },
      { id: 'w6', fromCompId: 'q_1', fromPinId: 'emitter', toCompId: 'bat_1', toPinId: 'neg', color: '#111827' }
    ],
    expectedValues: {
      mustBeSpinning: true
    },
    hintsAr: [
      'تيار صغير داخل إلى القاعدة (Base) يفتح القناة بين المجمع (Collector) والمشع (Emitter).',
      'تأكد من توصيل المشع Emitter إلى الأرضي GND.'
    ],
    xpReward: 200,
    badgeNameAr: 'وسام الترانزستور'
  },
  {
    id: 'proj_relay_driver',
    level: 5,
    levelTitleAr: 'المستوى المتقدم: الأتمتة الميكاترونيكية',
    title: 'Smart Automation System',
    titleAr: '🤖 نظام الأتمتة والتحكم الميكاترونيكي المتكامل',
    descAr: 'تطبيق ميكاترونكس متكامل يدمج الميكروكنترولر، الحساسات، سائق المحركات L298N، والذراع الروبوتية.',
    objectiveAr: 'صل الحساس والميكروكنترولر للتحكم بحركة الذراع الروبوتية والسير الناقل.',
    requiredComponents: ['Arduino UNO', 'Motor Driver L298N', 'Servo Motor', 'Ultrasonic Sensor', 'DC Power Supply'],
    elements: [
      { id: 'ard_1', ref: 'MCU1', kind: 'arduino', name: 'Arduino UNO', nameAr: 'أردوينو أونو', x: 200, y: 260, rotation: 0, value: 5, unit: 'V' },
      { id: 'drv_1', ref: 'DRV1', kind: 'motor_driver', name: 'L298N Driver', nameAr: 'سائق محركات L298N', x: 420, y: 180, rotation: 0, value: 12, unit: 'V' },
      { id: 'srv_1', ref: 'SRV1', kind: 'servo', name: 'Arm Servo', nameAr: 'سيرفو الذراع', x: 580, y: 300, rotation: 0, value: 5, unit: 'V' },
      { id: 'ultra_1', ref: 'US1', kind: 'ultrasonic', name: 'Ultrasonic Sensor', nameAr: 'حساس المسافة Ultrasonic', x: 420, y: 350, rotation: 0, value: 5, unit: 'V' }
    ],
    wires: [
      { id: 'w1', fromCompId: 'ard_1', fromPinId: '5v', toCompId: 'ultra_1', toPinId: 'vcc', color: '#dc2626' },
      { id: 'w2', fromCompId: 'ard_1', fromPinId: 'gnd', toCompId: 'ultra_1', toPinId: 'gnd', color: '#111827' },
      { id: 'w3', fromCompId: 'ard_1', fromPinId: '5v', toCompId: 'srv_1', toPinId: 'vcc', color: '#dc2626' },
      { id: 'w4', fromCompId: 'ard_1', fromPinId: 'gnd', toCompId: 'srv_1', toPinId: 'gnd', color: '#111827' },
      { id: 'w5', fromCompId: 'ard_1', fromPinId: 'd13', toCompId: 'srv_1', toPinId: 'signal', color: '#2563eb' }
    ],
    expectedValues: {
      mustBeSpinning: true
    },
    hintsAr: [
      'تأكد من ربط GND المشترك بين الأردوينو وسائق المحركات وسيرفو الذراع.',
      'إشارة PWM الصادرة من D13 تتحكم بزاوية السيرفو دقيقة بالدرجات.'
    ],
    xpReward: 350,
    badgeNameAr: 'وسام مهندس الأتمتة الميكاترونيكية'
  }
];
