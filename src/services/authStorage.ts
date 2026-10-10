import { StudentUser, Experiment } from '../types/mechatronics';

const USERS_STORAGE_KEY = 'yemen_mechatronics_users_v1';
const CURRENT_USER_KEY = 'yemen_mechatronics_current_user_v1';
const CUSTOM_LESSONS_KEY = 'yemen_mechatronics_custom_lessons_v1';
const OWNER_PASSWORD_STORAGE_KEY = 'yemen_mechatronics_owner_pwd_v1';

// Default master recovery keys for the owner (primary: owner's direct phone number 785502919)
export const DEFAULT_OWNER_PASSWORD = '785502919';
export const MASTER_OWNER_PASSWORDS = ['785502919', 'mechatronics2026', 'admin785502919', 'owner@yemen'];

// Pre-seeded initial mock users so the platform is ready
const INITIAL_USERS: StudentUser[] = [
  {
    id: 'usr_demo_1',
    name: 'المهندس أحمد صالح',
    phone: '771234567',
    password: '123',
    university: 'جامعة صنعاء',
    academicYear: 1,
    isAcademySubscriber: true,
    isActivated: true,
    registeredAt: '2026-03-15',
    role: 'student'
  },
  {
    id: 'usr_demo_2',
    name: 'المهندسة سارة محمد',
    phone: '779876543',
    password: '123',
    university: 'جامعة العلوم والتكنولوجيا',
    academicYear: 2,
    isAcademySubscriber: true,
    isActivated: true,
    registeredAt: '2026-03-20',
    role: 'student'
  },
  {
    id: 'usr_demo_3',
    name: 'المهندس خالد العبسي',
    phone: '734567890',
    password: '123',
    university: 'جامعة الرشيد الذكية',
    academicYear: 3,
    isAcademySubscriber: false,
    isActivated: false,
    registeredAt: '2026-03-22',
    role: 'student'
  }
];

export const authStorage = {
  getUsers(): StudentUser[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: StudentUser[]) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  },

  getCurrentUser(): StudentUser | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: StudentUser | null) {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to set current user', e);
    }
  },

  // Owner Password management
  getOwnerPassword(): string {
    try {
      const custom = localStorage.getItem(OWNER_PASSWORD_STORAGE_KEY);
      return (custom && custom.trim()) ? custom.trim() : DEFAULT_OWNER_PASSWORD;
    } catch {
      return DEFAULT_OWNER_PASSWORD;
    }
  },

  setOwnerPassword(newPassword: string): { success: boolean; message: string } {
    const clean = newPassword.trim();
    if (!clean || clean.length < 4) {
      return { success: false, message: 'يجب أن تتكون كلمة المرور من 4 أحرف أو أرقام على الأقل' };
    }
    try {
      localStorage.setItem(OWNER_PASSWORD_STORAGE_KEY, clean);
      return { success: true, message: `تم تحديث كلمة سر المالك بنجاح إلى: (${clean})` };
    } catch (e) {
      return { success: false, message: 'تعذر حفظ كلمة المرور في المتصفح' };
    }
  },

  resetOwnerPassword(): { success: boolean; password: string } {
    try {
      localStorage.removeItem(OWNER_PASSWORD_STORAGE_KEY);
    } catch {}
    return { success: true, password: DEFAULT_OWNER_PASSWORD };
  },

  registerUser(payload: {
    name: string;
    phone: string;
    password: string;
    university: string;
    academicYear?: AcademicYear;
    isAcademySubscriber: boolean;
  }): { success: boolean; user?: StudentUser; message: string; requiresActivation?: boolean } {
    const users = this.getUsers();
    const cleanPhone = payload.phone.trim();

    if (!cleanPhone || !payload.name || !payload.password) {
      return { success: false, message: 'يرجى ملء جميع الحقول المطلوبة' };
    }

    const existing = users.find(u => u.phone === cleanPhone);
    if (existing) {
      return { success: false, message: 'رقم الهاتف مسجل بالفعل مسبقاً. يرجى تسجيل الدخول' };
    }

    const newUser: StudentUser = {
      id: `usr_${Date.now()}`,
      name: payload.name.trim(),
      phone: cleanPhone,
      password: payload.password,
      university: payload.university,
      academicYear: payload.academicYear || 1,
      isAcademySubscriber: payload.isAcademySubscriber,
      isActivated: false,
      registeredAt: new Date().toISOString().split('T')[0],
      role: 'student'
    };

    users.push(newUser);
    this.saveUsers(users);

    return {
      success: true,
      user: newUser,
      requiresActivation: true,
      message: 'تم إنشاء الحساب بنجاح! حسابك في انتظار تفعيل المالك.'
    };
  },

  loginUser(phone: string, password: string): { success: boolean; user?: StudentUser; message: string; notActivated?: boolean } {
    const users = this.getUsers();
    const cleanPhone = phone.trim();
    const user = users.find(u => u.phone === cleanPhone);

    if (!user) {
      return { success: false, message: 'رقم الهاتف غير مسجل في المنصة. يرجى إنشاء حساب جديد' };
    }

    if (user.password !== password) {
      return { success: false, message: 'كلمة المرور غير صحيحة' };
    }

    if (!user.isActivated) {
      return { 
        success: false, 
        user,
        notActivated: true, 
        message: 'الحساب غير مفعّل بعد. يرجى التواصل مع المالك لتفعيل الاشتراك عبر الرقم 785502919' 
      };
    }

    this.setCurrentUser(user);
    return { success: true, user, message: 'تم تسجيل الدخول بنجاح' };
  },

  loginOwner(password: string): { success: boolean; user?: StudentUser; message: string } {
    const cleanPass = password.trim();
    const activeOwnerPass = this.getOwnerPassword();

    // Valid if matches active custom password OR any master recovery key
    const isValid = cleanPass === activeOwnerPass || MASTER_OWNER_PASSWORDS.includes(cleanPass);

    if (isValid) {
      const ownerUser: StudentUser = {
        id: 'owner_master',
        name: 'المالك ومدير المنصة (Owner)',
        phone: '785502919',
        university: 'أكاديمية الميكاترونكس اليمنية',
        isAcademySubscriber: true,
        isActivated: true,
        registeredAt: '2026-01-01',
        role: 'owner'
      };
      this.setCurrentUser(ownerUser);
      return { success: true, user: ownerUser, message: 'مرحباً بك في لوحة تحكم المالك' };
    }

    return { success: false, message: 'كلمة مرور المالك غير صحيحة' };
  },

  activateUserByPhone(phone: string): { success: boolean; message: string; user?: StudentUser } {
    const users = this.getUsers();
    const cleanPhone = phone.trim();
    const index = users.findIndex(u => u.phone === cleanPhone);

    if (index === -1) {
      return { success: false, message: `لم يتم العثور على طالب مسجل برقم الهاتف: ${phone}` };
    }

    users[index].isActivated = true;
    users[index].isAcademySubscriber = true;
    this.saveUsers(users);

    return { 
      success: true, 
      user: users[index], 
      message: `تم تفعيل المشترك (${users[index].name}) برقم ${cleanPhone} بنجاح!` 
    };
  },

  toggleUserActivation(userId: string): { success: boolean; isActivated: boolean } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return { success: false, isActivated: false };

    users[index].isActivated = !users[index].isActivated;
    this.saveUsers(users);
    return { success: true, isActivated: users[index].isActivated };
  },

  updateUserAcademicYear(userId: string, year: AcademicYear): { success: boolean } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return { success: false };

    users[index].academicYear = year;
    this.saveUsers(users);
    return { success: true };
  },

  getCustomLessons(): Experiment[] {
    try {
      const data = localStorage.getItem(CUSTOM_LESSONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomLesson(lesson: Experiment) {
    try {
      const lessons = this.getCustomLessons();
      lessons.unshift(lesson);
      localStorage.setItem(CUSTOM_LESSONS_KEY, JSON.stringify(lessons));
    } catch (e) {
      console.error('Failed to save custom lesson', e);
    }
  },

  exportAllData(): string {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ownerPhone: '785502919',
      currentOwnerPassword: this.getOwnerPassword(),
      users: this.getUsers(),
      customLessons: this.getCustomLessons()
    }, null, 2);
  }
};
