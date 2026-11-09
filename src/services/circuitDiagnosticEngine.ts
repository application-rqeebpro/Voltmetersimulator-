import { CWElement, CWWire, ComponentKind, COMPONENT_PINS } from '../components/CircuitWizardLab';

export interface DiagnosticFault {
  id: string;
  type: 
    | 'short_circuit' 
    | 'reverse_polarity' 
    | 'missing_ground' 
    | 'overvoltage' 
    | 'miswired_meter' 
    | 'improper_resistance' 
    | 'unconnected_wire' 
    | 'open_circuit';
  severity: 'critical' | 'warning' | 'educational';
  titleAr: string;
  titleEn: string;
  compId?: string;
  compNameAr?: string;
  causeAr: string;
  hintAr: string;
  fixSuggestionAr: string;
}

export function inspectCircuitDiagnostics(
  elements: CWElement[],
  wires: CWWire[]
): { faults: DiagnosticFault[]; isSafeToRun: boolean; summaryAr: string } {
  const faults: DiagnosticFault[] = [];

  // Find power sources (Batteries, DC Power Supply)
  const powerSources = elements.filter(
    (e) => e.kind === 'battery_aa' || e.kind === 'battery_9v' || e.kind === 'battery_4aa' || e.kind === 'dc_supply'
  );

  if (powerSources.length === 0 && elements.length > 0) {
    faults.push({
      id: 'fault_no_power',
      type: 'open_circuit',
      severity: 'warning',
      titleAr: '⚠️ غياب مصدر التغذية الكهربائية',
      titleEn: 'Missing Power Source',
      causeAr: 'الدائرة لا تحتوي على أي مصدر جهد (بطارية أو وحدة تغذية DC Power Supply).',
      hintAr: 'اسحب بطارية 1.5V أو 9V أو وحدة تغذية من قائمة الأدوات وضَعها على مساحة العمل.',
      fixSuggestionAr: 'إضافة مصدر جهد مناسب وتوصيله بالدائرة.'
    });
    return { faults, isSafeToRun: false, summaryAr: 'الدائرة غير متصلة بمصدر تغذية.' };
  }

  // Build pin connectivity adjacency map
  const adj: Record<string, Array<{ compId: string; pinId: string; wireId: string }>> = {};
  wires.forEach((w) => {
    const fromKey = `${w.fromCompId}:${w.fromPinId}`;
    const toKey = `${w.toCompId}:${w.toPinId}`;
    if (!adj[fromKey]) adj[fromKey] = [];
    if (!adj[toKey]) adj[toKey] = [];
    adj[fromKey].push({ compId: w.toCompId, pinId: w.toPinId, wireId: w.id });
    adj[toKey].push({ compId: w.fromCompId, pinId: w.fromPinId, wireId: w.id });
  });

  // Check 1: Short Circuit directly across power sources
  powerSources.forEach((src) => {
    const posKey = `${src.id}:pos`;
    const negKey = `${src.id}:neg`;

    const posNeighbors = adj[posKey] || [];
    const negNeighbors = adj[negKey] || [];

    // Check if pos and neg connect directly or via ammeter only
    posNeighbors.forEach((pn) => {
      const targetComp = elements.find((e) => e.id === pn.compId);
      if (pn.compId === src.id && pn.pinId === 'neg') {
        faults.push({
          id: `fault_short_${src.id}`,
          type: 'short_circuit',
          severity: 'critical',
          titleAr: '💥 قصر كهربائي مباشر (Short Circuit)',
          titleEn: 'Direct Short Circuit',
          compId: src.id,
          compNameAr: src.nameAr || src.name,
          causeAr: `تم توصيل القطب الموجب بالقطب السالب لمصدر التغذية (${src.nameAr}) بشكل مباشر دون وجود أي حمل أو مقاومة.`,
          hintAr: 'ضع حِصناً أو حمل كهربائي (مثل مقاومة R أو مصباح) بين القطبين الموجب والسالب.',
          fixSuggestionAr: 'قم بقطع السلك المباشر بين الموجب والسالب وتوصيل مكون يستهلك الطاقة.'
        });
      }

      if (targetComp && targetComp.kind === 'ammeter') {
        negNeighbors.forEach((nn) => {
          if (nn.compId === targetComp.id) {
            faults.push({
              id: `fault_ammeter_parallel_${targetComp.id}`,
              type: 'miswired_meter',
              severity: 'critical',
              titleAr: '⚠️ خطأ خطير: توصيل الأمبيرميتر على التوازي',
              titleEn: 'Ammeter Connected in Parallel',
              compId: targetComp.id,
              compNameAr: targetComp.nameAr || targetComp.name,
              causeAr: 'تم توصيل جهاز الأمبيرميتر (Ammeter) مباشرة بين قطبي التغذية على التوازي. الأمبيرميتر ذو مقاومة مقارية للصفر وسيؤدي لتماس كهربائي وتلف الجهاز.',
              hintAr: 'يجب توصيل جهاز الأمبيرميتر دائماً على التوالي داخل مسار التيار وليس على التوازي مع المصدر.',
              fixSuggestionAr: 'افصل أحد أسلاك الحمل وصل الأمبيرميتر في المسار على التوالي.'
            });
          }
        });
      }
    });
  });

  // Check 2: Voltmeter connected in series inside current path
  const voltmeters = elements.filter((e) => e.kind === 'voltmeter');
  voltmeters.forEach((vm) => {
    const posConn = adj[`${vm.id}:pos`] || [];
    const negConn = adj[`${vm.id}:neg`] || [];

    // If voltmeter is used as the sole link between a source and a load
    const isOnlySeries = posConn.length > 0 && negConn.length > 0 && posConn.some(p => p.compId !== vm.id) && negConn.some(n => n.compId !== vm.id);
    if (isOnlySeries) {
      // Check if current must pass through voltmeter
      const isVoltmeterInSeriesPath = posConn.some(p => {
        const c = elements.find(el => el.id === p.compId);
        return c && c.kind !== 'voltmeter' && (c.kind === 'bulb' || c.kind === 'led' || c.kind === 'motor');
      });

      if (isVoltmeterInSeriesPath) {
        faults.push({
          id: `fault_vm_series_${vm.id}`,
          type: 'miswired_meter',
          severity: 'warning',
          titleAr: '⚠️ توصيل الفولتميتر على التوالي (Voltmeter in Series)',
          titleEn: 'Voltmeter Wired in Series',
          compId: vm.id,
          compNameAr: vm.nameAr || vm.name,
          causeAr: 'الفولتميتر يتميز بمقاومة داخلية عقلانية ضخمة جدًا (10MΩ). عند توصيله على التوالي، يمنع مرور التيار ولا يعمل المصباح أو المحرك.',
          hintAr: 'وصل الفولتميتر دائماً على التوازي عبر طرفي المكون المراد قياس جهده دون قطع الدائرة الرئيسية.',
          fixSuggestionAr: 'عدّل توصيل الفولتميتر ليكون على التوازي بين طرفي العنصر.'
        });
      }
    }
  });

  // Check 3: LEDs connected without limiting resistor on 9V / 12V
  const leds = elements.filter((e) => e.kind === 'led');
  leds.forEach((led) => {
    // Check if directly connected to 9V battery with no resistor in path
    const anodeConn = adj[`${led.id}:anode`] || [];
    const cathodeConn = adj[`${led.id}:cathode`] || [];

    let connectedTo9V = false;
    let hasResistorInPath = false;

    anodeConn.forEach((cn) => {
      const c = elements.find((e) => e.id === cn.compId);
      if (c && c.kind === 'battery_9v' && cn.pinId === 'pos') connectedTo9V = true;
      if (c && c.kind === 'resistor') hasResistorInPath = true;
    });

    cathodeConn.forEach((cn) => {
      const c = elements.find((e) => e.id === cn.compId);
      if (c && c.kind === 'resistor') hasResistorInPath = true;
    });

    if (connectedTo9V && !hasResistorInPath) {
      faults.push({
        id: `fault_led_overvoltage_${led.id}`,
        type: 'overvoltage',
        severity: 'critical',
        titleAr: '⚡ جهد زائد يتلف الـ LED (Overvoltage Damage)',
        titleEn: 'LED Overvoltage Damage',
        compId: led.id,
        compNameAr: led.nameAr || led.name,
        causeAr: `تم توصيل الدايود المشع (${led.nameAr}) بجهد 9V مباشرة دون مقاومة حد التيار. الـ LED يعمل بجهد 2.1V واحتراق البلورة حتمي!`,
        hintAr: 'أضف مقاومة حماية على التوالي بقيمة بين 220Ω و 1kΩ لحماية الـ LED من الاحتراق.',
        fixSuggestionAr: 'أدخل مقاومة 470Ω على التوالي مع طرف الأنود للـ LED.'
      });
    }

    // Check 4: Reverse polarity on LED
    let connectedAnodeToNeg = false;
    let connectedCathodeToPos = false;

    anodeConn.forEach((cn) => {
      const c = elements.find((e) => e.id === cn.compId);
      if (c && (c.kind.startsWith('battery') || c.kind === 'dc_supply') && cn.pinId === 'neg') {
        connectedAnodeToNeg = true;
      }
    });

    cathodeConn.forEach((cn) => {
      const c = elements.find((e) => e.id === cn.compId);
      if (c && (c.kind.startsWith('battery') || c.kind === 'dc_supply') && cn.pinId === 'pos') {
        connectedCathodeToPos = true;
      }
    });

    if (connectedAnodeToNeg || connectedCathodeToPos) {
      faults.push({
        id: `fault_led_reverse_${led.id}`,
        type: 'reverse_polarity',
        severity: 'warning',
        titleAr: '🔄 عكس القطبية في الـ LED (Reverse Polarity)',
        titleEn: 'LED Reverse Polarity',
        compId: led.id,
        compNameAr: led.nameAr || led.name,
        causeAr: 'الأنود (+) متصل بالسالب والكاثود (-) متصل بالموجب. الـ LED يسمح بمرور التيار بالاتجاه الأمامي فقط ولن يضيء بهذا التوصيل.',
        hintAr: 'اعكس توصيل الطرفين أو أدر الـ LED بحيث يتصل الأنود بالموجب والكاثود بالأرضي.',
        fixSuggestionAr: 'أدر الـ LED 180 درجة أو اعكس أسلاك التوصيل.'
      });
    }
  });

  // Check 5: Active modules (Arduino, ESP32, Ultrasonic, Servo) missing Ground (GND)
  const activeModules = elements.filter(
    (e) => e.kind === 'arduino' || e.kind === 'esp32' || e.kind === 'ultrasonic' || e.kind === 'servo' || e.kind === 'motor_driver'
  );

  activeModules.forEach((mod) => {
    const pins = COMPONENT_PINS[mod.kind] || [];
    const gndPin = pins.find(p => p.id === 'gnd' || p.id === 'neg' || p.id === 'p2');
    if (gndPin) {
      const gndKey = `${mod.id}:${gndPin.id}`;
      const conn = adj[gndKey] || [];
      if (conn.length === 0) {
        faults.push({
          id: `fault_missing_gnd_${mod.id}`,
          type: 'missing_ground',
          severity: 'warning',
          titleAr: '🔌 غياب القطب السالب / الأرضي (Missing Ground GND)',
          titleEn: 'Missing GND Connection',
          compId: mod.id,
          compNameAr: mod.nameAr || mod.name,
          causeAr: `المكون الرقمي الذكي (${mod.nameAr}) يحتاج خط أرضي مرجعي مشترك (GND) ليكتمل عمل الشريحة.`,
          hintAr: 'وصل دبوس GND بسلك إلى القطب السالب للبطارية أو خط GND في اللوحة.',
          fixSuggestionAr: 'توصيل سلك أسود من دبوس GND إلى السالب.'
        });
      }
    }
  });

  const isCritical = faults.some((f) => f.severity === 'critical');
  const isSafeToRun = !isCritical;

  let summaryAr = 'الدائرة خالية من الأخطاء الحرجة وهي آمنة للتشغيل!';
  if (faults.length > 0) {
    if (isCritical) {
      summaryAr = `تم اكتشاف ${faults.length} أخطاء حرجة تتطلب التعديل قبل التشغيل الآمن.`;
    } else {
      summaryAr = `تم اكتشاف ${faults.length} ملاحظات وتنبيهات تعليمية في التوصيل.`;
    }
  }

  return { faults, isSafeToRun, summaryAr };
}
