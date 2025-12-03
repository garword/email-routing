"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
  language: 'en' | 'id';
  setLanguage: (lang: 'en' | 'id') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // App Title
    'app.title': 'Email Routing Manager',
    'app.subtitle': 'Manage your Cloudflare email addresses easily',
    
    // Login
    'login.title': 'Login',
    'login.subtitle': 'Enter your credentials to continue',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.rememberMe': 'Remember Me',
    'login.button': 'Login',
    'login.processing': 'Processing...',
    'login.info': 'Login Info',
    'login.infoText': 'Use username <code>windaa</code> and password <code>cantik</code> to login',
    'login.rememberText': 'Check "Remember Me" for auto-login in this browser',
    
    // Dashboard
    'dashboard.createEmail': 'Create New Email Routing',
    'dashboard.createEmailDesc': 'Create new email address that forwards to your destination email',
    'dashboard.emailList': 'Email Routing List',
    'dashboard.emailListDesc': 'Manage all created email routing addresses',
    'dashboard.statistics': 'Statistics',
    'dashboard.quickTips': 'Quick Tips',
    'dashboard.recentActivity': 'Recent Activity',
    
    // Form Fields
    'form.domain': 'Domain',
    'form.selectDomain': 'Select domain...',
    'form.emailMode': 'Email Creation Mode',
    'form.autoMode': 'Automatic (Indonesian Name + Random)',
    'form.manualMode': 'Manual (Custom Alias)',
    'form.alias': 'Email Alias',
    'form.aliasPlaceholder': 'example: support',
    'form.destination': 'Destination Email',
    'form.destinationPlaceholder': 'email@example.com',
    'form.createButton': 'Create Email Routing',
    'form.preview': 'Preview Automatic Names',
    
    // Quick Actions
    'quickActions.title': 'Quick Actions',
    'quickActions.useDefault': 'Use Default Email',
    'quickActions.randomEmail': 'Random Email',
    
    // Statistics
    'stats.totalEmail': 'Total Email',
    'stats.active': 'Active',
    'stats.domains': 'Domains',
    'stats.noActivity': 'No recent activity',
    
    // Tips
    'tips.autoMode': 'Generate random Indonesian names for unique email aliases',
    'tips.quickActions': 'Use predefined emails for faster setup',
    'tips.apiConfig': 'Set up your Cloudflare credentials once for seamless integration',
    
    // Recent Activity
    'activity.title': 'Recent Activity',
    
    // API Config
    'api.title': 'Cloudflare API Configuration',
    'api.subtitle': 'Configure your Cloudflare API keys and credentials',
    'api.token': 'Cloudflare API Token',
    'api.tokenPlaceholder': 'Enter your Cloudflare API Token',
    'api.accountId': 'Account ID',
    'api.accountIdPlaceholder': 'Enter your Account ID',
    'api.d1Database': 'D1 Database',
    'api.d1DatabasePlaceholder': 'Enter your D1 Database ID',
    'api.workerApi': 'Worker API',
    'api.workerApiPlaceholder': 'Enter your Worker API key',
    'api.kvStorage': 'KV Storage',
    'api.kvStoragePlaceholder': 'Enter your KV Storage ID',
    'api.saveButton': 'Save Configuration',
    'api.useDemoKeys': 'Use Demo Keys',
    
    // Actions
    'actions.refresh': 'Refresh',
    'actions.copy': 'Copy',
    'actions.delete': 'Delete',
    'actions.logout': 'Logout',
    'actions.apiConfig': 'API Config',
    'actions.darkMode': 'Dark Mode',
    'actions.lightMode': 'Light Mode',
    
    // Messages
    'msg.loginSuccess': 'Login successful!',
    'msg.loginError': 'Username or password is incorrect',
    'msg.loginRequired': 'Username and password are required',
    'msg.loginError': 'An error occurred while logging in',
    'msg.createSuccess': 'Email routing created successfully!',
    'msg.createError': 'Failed to create email routing',
    'msg.deleteSuccess': 'Email routing deleted successfully!',
    'msg.deleteError': 'Failed to delete email routing',
    'msg.apiConfigSaved': 'API Configuration saved successfully!',
    'msg.zoneLoadError': 'Failed to load zones',
    'msg.emailLoadError': 'Failed to load email list',
    'msg.selectZoneAndEmail': 'Please select a zone and destination email',
    'msg.enterAlias': 'Please enter an alias',
    
    // Loading
    'loading.authenticating': 'Checking authentication...',
    'loading.redirecting': 'Redirecting to dashboard...',
    'loading.noRecentActivity': 'No recent activity',
    
    // Footer
    'footer.rights': 'All rights reserved.'
  },
  id: {
    // App Title
    'app.title': 'Manajer Email Routing',
    'app.subtitle': 'Kelola alamat email Cloudflare Anda dengan mudah',
    
    // Login
    'login.title': 'Login',
    'login.subtitle': 'Masukkan kredensial Anda untuk melanjutkan',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.rememberMe': 'Ingat saya',
    'login.button': 'Login',
    'login.processing': 'Memproses...',
    'login.info': 'Info Login',
    'login.infoText': 'Gunakan username <code>windaa</code> dan password <code>cantik</code> untuk login',
    'login.rememberText': 'Cek "Ingat saya" untuk auto-login di browser ini',
    
    // Dashboard
    'dashboard.createEmail': 'Buat Email Routing Baru',
    'dashboard.createEmailDesc': 'Buat alamat email baru yang diteruskan ke email tujuan Anda',
    'dashboard.emailList': 'Daftar Email Routing',
    'dashboard.emailListDesc': 'Kelola semua alamat email routing yang telah dibuat',
    'dashboard.statistics': 'Statistik',
    'dashboard.quickTips': 'Quick Tips',
    'dashboard.recentActivity': 'Aktivitas Terbaru',
    
    // Form Fields
    'form.domain': 'Domain',
    'form.selectDomain': 'Pilih domain...',
    'form.emailMode': 'Mode Pembuatan Email',
    'form.autoMode': 'Otomatis (Nama Indonesia + Random)',
    'form.manualMode': 'Manual (Custom Alias)',
    'form.alias': 'Alias Email',
    'form.aliasPlaceholder': 'contoh: support',
    'form.destination': 'Email Tujuan',
    'form.destinationPlaceholder': 'email@example.com',
    'form.createButton': 'Buat Email Routing',
    'form.preview': 'Preview Nama Otomatis',
    
    // Quick Actions
    'quickActions.title': 'Quick Actions',
    'quickActions.useDefault': 'Gunakan Email Default',
    'quickActions.randomEmail': 'Email Acak',
    
    // Statistics
    'stats.totalEmail': 'Total Email',
    'stats.active': 'Aktif',
    'stats.domains': 'Domain',
    'stats.noActivity': 'Tidak ada aktivitas terbaru',
    
    // Tips
    'tips.autoMode': 'Generate nama Indonesia acak untuk alias email unik',
    'tips.quickActions': 'Gunakan email yang sudah ditentukan untuk setup lebih cepat',
    'tips.apiConfig': 'Siapkan kredensial Cloudflare Anda sekali untuk integrasi yang mulus',
    
    // Recent Activity
    'activity.title': 'Aktivitas Terbaru',
    
    // API Config
    'api.title': 'Konfigurasi API Cloudflare',
    'api.subtitle': 'Konfigurasikan kunci API Cloudflare dan kredensial Anda',
    'api.token': 'Token API Cloudflare',
    'api.tokenPlaceholder': 'Masukkan Token API Cloudflare Anda',
    'api.accountId': 'ID Akun',
    'api.accountIdPlaceholder': 'Masukkan ID Akun Anda',
    'api.d1Database': 'Database D1',
    'api.d1DatabasePlaceholder': 'Masukkan ID Database D1 Anda',
    'api.workerApi': 'API Worker',
    'api.workerApiPlaceholder': 'Masukkan kunci API Worker Anda',
    'api.kvStorage': 'Penyimpanan KV',
    'api.kvStoragePlaceholder': 'Masukkan ID Penyimpanan KV Anda',
    'api.saveButton': 'Simpan Konfigurasi',
    'api.useDemoKeys': 'Gunakan Kunci Demo',
    
    // Actions
    'actions.refresh': 'Refresh',
    'actions.copy': 'Salin',
    'actions.delete': 'Hapus',
    'actions.logout': 'Logout',
    'actions.apiConfig': 'API Config',
    'actions.darkMode': 'Mode Gelap',
    'actions.lightMode': 'Mode Terang',
    
    // Messages
    'msg.loginSuccess': 'Login berhasil!',
    'msg.loginError': 'Username atau password salah',
    'msg.loginRequired': 'Username dan password harus diisi',
    'msg.loginError': 'Terjadi kesalahan saat login',
    'msg.createSuccess': 'Email routing berhasil dibuat!',
    'msg.createError': 'Gagal membuat email routing',
    'msg.deleteSuccess': 'Email routing berhasil dihapus!',
    'msg.deleteError': 'Gagal menghapus email routing',
    'msg.apiConfigSaved': 'Konfigurasi API berhasil disimpan!',
    'msg.zoneLoadError': 'Gagal memuat zones',
    'msg.emailLoadError': 'Gagal memuat daftar email',
    'msg.selectZoneAndEmail': 'Silakan pilih zone dan email tujuan',
    'msg.enterAlias': 'Silakan masukkan alias',
    
    // Loading
    'loading.authenticating': 'Memeriksa autentikasi...',
    'loading.redirecting': 'Mengalihkan ke dashboard...',
    'loading.noRecentActivity': 'Tidak ada aktivitas terbaru',
    
    // Footer
    'footer.rights': 'Semua hak dilindungi.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'id'>('id');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as 'en' | 'id' | null;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: 'en' | 'id') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}