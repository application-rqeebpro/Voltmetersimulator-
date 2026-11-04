// Secret Activation Codes Registry
// IMPORTANT: These codes are NOT displayed anywhere in the user interface.
// They are strictly used for validating student activation requests.

export const SECRET_ACTIVATION_CODES = new Set<string>([
  "RQ-9938-lab", "RQ-6949-lab", "RQ-4561-lab", "RQ-8015-lab", "RQ-1092-lab", "RQ-2717-lab", "RQ-9283-lab",
  "RQ-0359-lab", "RQ-0652-lab", "RQ-1224-lab", "RQ-8170-lab", "RQ-3664-lab", "RQ-0998-lab", "RQ-7601-lab",
  "RQ-2441-lab", "RQ-5009-lab", "RQ-6603-lab", "RQ-9610-lab", "RQ-9502-lab", "RQ-2866-lab", "RQ-4157-lab",
  "RQ-8267-lab", "RQ-9055-lab", "RQ-9361-lab", "RQ-7429-lab", "RQ-8778-lab", "RQ-8242-lab", "RQ-1394-lab",
  "RQ-5521-lab", "RQ-9620-lab", "RQ-8653-lab", "RQ-2773-lab", "RQ-5940-lab", "RQ-4783-lab", "RQ-0777-lab",
  "RQ-5487-lab", "RQ-7941-lab", "RQ-0988-lab", "RQ-7916-lab", "RQ-6361-lab", "RQ-1299-lab", "RQ-1797-lab",
  "RQ-5344-lab", "RQ-8867-lab", "RQ-4364-lab", "RQ-2968-lab", "RQ-2774-lab", "RQ-7808-lab", "RQ-3049-lab",
  "RQ-9670-lab", "RQ-6650-lab", "RQ-9996-lab", "RQ-4620-lab", "RQ-8156-lab", "RQ-3746-lab", "RQ-0068-lab",
  "RQ-9853-lab", "RQ-7548-lab", "RQ-7639-lab", "RQ-8303-lab", "RQ-7079-lab", "RQ-5351-lab", "RQ-3252-lab",
  "RQ-8822-lab", "RQ-7380-lab", "RQ-0945-lab", "RQ-9017-lab", "RQ-1148-lab", "RQ-6226-lab", "RQ-9300-lab",
  "RQ-3394-lab", "RQ-8869-lab", "RQ-1423-lab", "RQ-9255-lab", "RQ-4676-lab", "RQ-2672-lab", "RQ-7489-lab",
  "RQ-1182-lab", "RQ-3743-lab", "RQ-9773-lab", "RQ-9506-lab", "RQ-6699-lab", "RQ-6773-lab", "RQ-7341-lab",
  "RQ-4972-lab", "RQ-1149-lab", "RQ-9745-lab", "RQ-6059-lab", "RQ-0064-lab", "RQ-2569-lab", "RQ-9430-lab",
  "RQ-3317-lab", "RQ-7915-lab", "RQ-0819-lab", "RQ-3154-lab", "RQ-1375-lab", "RQ-2692-lab", "RQ-0375-lab",
  "RQ-9789-lab", "RQ-2540-lab", "RQ-8020-lab", "RQ-1091-lab", "RQ-3759-lab", "RQ-4084-lab", "RQ-5842-lab",
  "RQ-5160-lab", "RQ-2312-lab", "RQ-1919-lab", "RQ-8093-lab", "RQ-0648-lab", "RQ-0453-lab", "RQ-9740-lab",
  "RQ-7203-lab", "RQ-1243-lab", "RQ-4123-lab", "RQ-2052-lab", "RQ-3504-lab", "RQ-2266-lab", "RQ-0054-lab",
  "RQ-1651-lab", "RQ-1028-lab", "RQ-4154-lab", "RQ-2216-lab", "RQ-8342-lab", "RQ-0416-lab", "RQ-0247-lab",
  "RQ-4369-lab", "RQ-9087-lab", "RQ-0086-lab", "RQ-2025-lab", "RQ-3941-lab", "RQ-5586-lab", "RQ-2708-lab",
  "RQ-4438-lab", "RQ-8419-lab", "RQ-2365-lab", "RQ-2232-lab", "RQ-8114-lab", "RQ-8983-lab", "RQ-5214-lab",
  "RQ-5617-lab", "RQ-8554-lab", "RQ-3433-lab", "RQ-0373-lab", "RQ-8222-lab", "RQ-6452-lab", "RQ-3322-lab",
  "RQ-4868-lab", "RQ-4478-lab", "RQ-6269-lab", "RQ-1366-lab", "RQ-0641-lab", "RQ-5494-lab", "RQ-2523-lab",
  "RQ-9391-lab", "RQ-7402-lab", "RQ-4089-lab", "RQ-4846-lab", "RQ-6931-lab", "RQ-7921-lab", "RQ-1966-lab",
  "RQ-8885-lab", "RQ-1973-lab", "RQ-0561-lab", "RQ-0843-lab", "RQ-7154-lab", "RQ-7328-lab", "RQ-0820-lab",
  "RQ-5289-lab", "RQ-2421-lab", "RQ-2485-lab", "RQ-0968-lab", "RQ-7551-lab", "RQ-1972-lab", "RQ-2007-lab",
  "RQ-8007-lab", "RQ-5749-lab", "RQ-3804-lab", "RQ-5580-lab", "RQ-4624-lab", "RQ-7972-lab", "RQ-4489-lab",
  "RQ-3610-lab", "RQ-0046-lab", "RQ-9157-lab", "RQ-5243-lab", "RQ-5371-lab", "RQ-4652-lab", "RQ-4318-lab",
  "RQ-8124-lab", "RQ-3340-lab", "RQ-1802-lab", "RQ-7443-lab", "RQ-1288-lab", "RQ-1396-lab", "RQ-7462-lab",
  "RQ-0837-lab", "RQ-7864-lab", "RQ-9286-lab", "RQ-3532-lab"
]);

const USED_CODES_KEY = 'yemen_mechatronics_used_codes_v1';

export function getUsedActivationCodes(): Set<string> {
  try {
    const raw = localStorage.getItem(USED_CODES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function markActivationCodeAsUsed(code: string): void {
  try {
    const used = getUsedActivationCodes();
    used.add(code.trim());
    localStorage.setItem(USED_CODES_KEY, JSON.stringify(Array.from(used)));
  } catch (e) {
    console.error('Failed to mark activation code as used', e);
  }
}

export function validateActivationCode(inputCode: string): { valid: boolean; message: string } {
  const clean = inputCode.trim();
  if (!clean) {
    return { valid: false, message: 'يرجى إدخال كود التفعيل الخاص بك' };
  }
  
  // Accept standard format or uppercase/lowercase variants
  const upperCode = clean.toUpperCase();
  const formatCode = upperCode.startsWith('RQ-') && upperCode.endsWith('-LAB')
    ? upperCode
    : `RQ-${clean.replace(/^(RQ-)?/i, '').replace(/(-LAB)?$/i, '')}-LAB`;
  
  const isValidSecret = SECRET_ACTIVATION_CODES.has(clean) || SECRET_ACTIVATION_CODES.has(formatCode) || SECRET_ACTIVATION_CODES.has(clean.toUpperCase());

  if (!isValidSecret) {
    return { valid: false, message: 'كود التفعيل المدخل غير صحيح. يرجى التثبت من الكود المكتوب أو التواصل مع المالك.' };
  }

  const used = getUsedActivationCodes();
  if (used.has(clean) || used.has(formatCode)) {
    return { valid: false, message: 'تم استخدام كود التفعيل هذا مسبقاً لمشترك آخر.' };
  }

  return { valid: true, message: 'كود التفعيل صحيح ومعتمد!' };
}
