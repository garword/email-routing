"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Globe, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle,
  Sparkles,
  Shield,
  Clock,
  Zap,
  Settings,
  Key,
  Database,
  Server,
  HardDrive,
  LogOut,
  User
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

interface CloudflareZone {
  id: string;
  name: string;
  status: string;
}

interface EmailRouting {
  id: string;
  zoneId: string;
  zoneName: string;
  aliasPart: string;
  fullEmail: string;
  ruleId: string;
  destination: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiConfig {
  cloudflareApiToken: string;
  accountId: string;
  d1Database: string;
  workerApi: string;
  kvStorage: string;
}

const indonesianFirstNames = [
  "budi", "siti", "agus", "dewi", "eko", "rina", "fajar", "dian", "rizky", "nur",
  "andi", "maya", "hendra", "sari", "joko", "putri", "bayu", "fitri", "dimas", "angga",
  "wati", "bambang", "yuni", "doni", "indah", "reza", "kartika", "ahmad", "susanti", "pratama"
];

const indonesianLastNames = [
  "santoso", "pratama", "wijaya", "kusuma", "hidayat", "saputra", "wulandari", "nugroho",
  "siregar", "nasution", "putra", "dewi", "pertiwi", "permata", "cahyono", "rahman",
  "hakim", "fauzi", "subekti", "marlina", "handoko", "susilo", "fitriani", "rahmawati"
];

const suggestedEmails = [
  "manulsinul99@gmail.com",
  "admin@example.com",
  "support@example.com",
  "info@example.com"
];

export default function EmailRoutingManager() {
  const router = useRouter();
  const { isLoggedIn, username, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [zones, setZones] = useState<CloudflareZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [emailList, setEmailList] = useState<EmailRouting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [manualAlias, setManualAlias] = useState("");
  const [destinationEmail, setDestinationEmail] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    cloudflareApiToken: "",
    accountId: "",
    d1Database: "",
    workerApi: "",
    kvStorage: ""
  });
  const [showApiConfig, setShowApiConfig] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    // Only redirect if we're certain user is not logged in
    if (isLoggedIn === false) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Load zones on mount
  useEffect(() => {
    if (isLoggedIn) {
      loadZones();
      loadEmailList();
      loadApiConfig();
      
      // Check for dark mode preference
      const isDark = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, [isLoggedIn]);

  // Show loading while checking authentication
  if (isLoggedIn === null || isLoggedIn === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('loading.authenticating')}</p>
        </div>
      </div>
    );
  }

  const loadApiConfig = () => {
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
      setApiConfig(JSON.parse(savedConfig));
    }
  };

  const saveApiConfig = (config: ApiConfig) => {
    localStorage.setItem('apiConfig', JSON.stringify(config));
    setApiConfig(config);
    
    // Auto-fill the API token in the environment
    if (config.cloudflareApiToken) {
      toast.success(t('msg.apiConfigSaved'));
    }
  };

  const loadZones = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cloudflare/zones');
      const data = await response.json();
      
      if (data.success) {
        setZones(data.zones);
        if (data.zones.length > 0) {
          setSelectedZone(data.zones[0].id);
        }
      } else {
        toast.error(t('msg.zoneLoadError') + ": " + data.error);
      }
    } catch (error) {
      toast.error(t('msg.zoneLoadError'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailList = async () => {
    try {
      const response = await fetch('/api/email-routing');
      const data = await response.json();
      
      if (data.success) {
        setEmailList(data.emails);
      }
    } catch (error) {
      console.error("Failed to load email list:", error);
    }
  };

  const generateIndonesianName = () => {
    const firstName = indonesianFirstNames[Math.floor(Math.random() * indonesianFirstNames.length)];
    const lastName = indonesianLastNames[Math.floor(Math.random() * indonesianLastNames.length)];
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    return `${firstName}${lastName}${randomSuffix}`;
  };

  const createEmailRouting = async () => {
    if (!selectedZone || !destinationEmail) {
      toast.error(t('msg.selectZoneAndEmail'));
      return;
    }

    const aliasPart = isAutoMode ? generateIndonesianName() : manualAlias;
    if (!aliasPart) {
      toast.error(t('msg.enterAlias'));
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/email-routing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zoneId: selectedZone,
          aliasPart,
          destinationEmail
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(t('msg.createSuccess'));
        setManualAlias("");
        loadEmailList();
      } else {
        toast.error(t('msg.createError') + ": " + data.error);
      }
    } catch (error) {
      toast.error(t('msg.createError'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmailRouting = async (id: string, ruleId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/email-routing/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ruleId })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(t('msg.deleteSuccess'));
        loadEmailList();
      } else {
        toast.error(t('msg.deleteError') + ": " + data.error);
      }
    } catch (error) {
      toast.error(t('msg.deleteError'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const selectedZoneData = zones.find(z => z.id === selectedZone);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('loading.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300`}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('app.title')}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Language Toggle */}
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                <Button
                  variant={language === 'en' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                  className="px-3 py-1 text-xs"
                >
                  EN
                </Button>
                <Button
                  variant={language === 'id' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLanguage('id')}
                  className="px-3 py-1 text-xs"
                >
                  ID
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mr-4">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="mr-2"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('actions.apiConfig')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className="mr-2"
              >
                {darkMode ? "☀️" : "🌙"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('actions.logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration Modal */}
      {showApiConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  <CardTitle>{t('api.title')}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowApiConfig(false)}>
                  ×
                </Button>
              </div>
              <CardDescription>
                {t('api.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiToken">
                  <Key className="w-4 h-4 inline mr-2" />
                  {t('api.token')}
                </Label>
                <Input
                  id="apiToken"
                  type="password"
                  placeholder={t('api.tokenPlaceholder')}
                  value={apiConfig.cloudflareApiToken}
                  onChange={(e) => setApiConfig({...apiConfig, cloudflareApiToken: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountId">
                  <Server className="w-4 h-4 inline mr-2" />
                  {t('api.accountId')}
                </Label>
                <Input
                  id="accountId"
                  type="text"
                  placeholder={t('api.accountIdPlaceholder')}
                  value={apiConfig.accountId}
                  onChange={(e) => setApiConfig({...apiConfig, accountId: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="d1Database">
                  <Database className="w-4 h-4 inline mr-2" />
                  {t('api.d1Database')}
                </Label>
                <Input
                  id="d1Database"
                  type="text"
                  placeholder={t('api.d1DatabasePlaceholder')}
                  value={apiConfig.d1Database}
                  onChange={(e) => setApiConfig({...apiConfig, d1Database: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workerApi">
                  <Server className="w-4 h-4 inline mr-2" />
                  {t('api.workerApi')}
                </Label>
                <Input
                  id="workerApi"
                  type="text"
                  placeholder={t('api.workerApiPlaceholder')}
                  value={apiConfig.workerApi}
                  onChange={(e) => setApiConfig({...apiConfig, workerApi: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kvStorage">
                  <HardDrive className="w-4 h-4 inline mr-2" />
                  {t('api.kvStorage')}
                </Label>
                <Input
                  id="kvStorage"
                  type="text"
                  placeholder={t('api.kvStoragePlaceholder')}
                  value={apiConfig.kvStorage}
                  onChange={(e) => setApiConfig({...apiConfig, kvStorage: e.target.value})}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={() => saveApiConfig(apiConfig)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {t('api.saveButton')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setApiConfig({
                      cloudflareApiToken: "DaUhMVKy4ZEMwwG3UF9kPdF7L4DtzYp65HZlf4Sl",
                      accountId: "cd83bf9065a6d97b76cf390d8b1ae1ed",
                      d1Database: "ba9f6de9-78cf-4e21-93c3-cc1c1a14e18f",
                      workerApi: "gNM_ATjIHt7sjRBCRjJEwwHTq5p2jRJQcVUJr305",
                      kvStorage: "fc9664c85b18483392ceffe43293ca12"
                    });
                  }}
                >
                  {t('api.useDemoKeys')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Create Email Routing Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-slate-900 dark:text-white">{t('dashboard.createEmail')}</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {t('dashboard.createEmailDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Zone Selection */}
                <div className="space-y-2">
                  <Label htmlFor="zone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Globe className="w-4 h-4 inline mr-2" />
                    {t('form.domain')}
                  </Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('form.selectDomain')} />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Mode Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('form.emailMode')}
                    </Label>
                    <Switch
                      checked={isAutoMode}
                      onCheckedChange={setIsAutoMode}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    {isAutoMode ? (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>{t('form.autoMode')}</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-green-500" />
                        <span>{t('form.manualMode')}</span>
                      </>
                    )}
                  </div>

                  {isAutoMode ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {t('form.preview')}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                        <p>• budisantoso8x9@{selectedZoneData?.name || 'domain.com'}</p>
                        <p>• sitipratama99a@{selectedZoneData?.name || 'domain.com'}</p>
                        <p>• aguswijaya2b3@{selectedZoneData?.name || 'domain.com'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="alias" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('form.alias')}
                      </Label>
                      <Input
                        id="alias"
                        type="text"
                        placeholder={t('form.aliasPlaceholder')}
                        value={manualAlias}
                        onChange={(e) => setManualAlias(e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Destination Email */}
                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('form.destination')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="destination"
                      type="email"
                      placeholder={t('form.destinationPlaceholder')}
                      value={destinationEmail}
                      onChange={(e) => {
                        setDestinationEmail(e.target.value);
                        setShowEmailSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowEmailSuggestions(destinationEmail.length > 0)}
                      onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
                      disabled={isLoading}
                      className="w-full"
                    />
                    
                    {/* Email Suggestions Dropdown */}
                    {showEmailSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                        {suggestedEmails.map((email, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300"
                            onClick={() => {
                              setDestinationEmail(email);
                              setShowEmailSuggestions(false);
                            }}
                          >
                            {email}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Zap className="w-4 h-4 inline mr-2" />
                    {t('quickActions.title')}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDestinationEmail("manulsinul99@gmail.com")}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      {t('quickActions.useDefault')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const randomEmail = suggestedEmails[Math.floor(Math.random() * suggestedEmails.length)];
                        setDestinationEmail(randomEmail);
                      }}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {t('quickActions.randomEmail')}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={createEmailRouting} 
                  disabled={isLoading || !selectedZone || !destinationEmail}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {t('login.processing')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('form.createButton')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Email List */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-slate-900 dark:text-white">{t('dashboard.emailList')}</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadEmailList}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {t('dashboard.emailListDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emailList.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">{t('stats.noActivity')}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {emailList.map((email) => (
                      <div
                        key={email.id}
                        className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-slate-900 dark:text-white">
                                {email.fullEmail}
                              </h3>
                              <Badge variant={email.isActive ? "default" : "secondary"}>
                                {email.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              → {email.destination}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(email.createdAt).toLocaleDateString('id-ID')}
                              </span>
                              <span className="flex items-center">
                                <Globe className="w-3 h-3 mr-1" />
                                {email.zoneName}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(email.fullEmail, email.id)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedId === email.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEmailRouting(email.id, email.ruleId)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Statistics Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <CardTitle className="text-slate-900 dark:text-white">{t('dashboard.statistics')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('stats.totalEmail')}</span>
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">
                    {emailList.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('stats.active')}</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {emailList.filter(e => e.isActive).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('stats.domains')}</span>
                  <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {zones.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <CardTitle className="text-slate-900 dark:text-white">{t('dashboard.quickTips')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>{t('tips.autoMode')}</strong>
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>{t('tips.quickActions')}</strong>
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>{t('tips.apiConfig')}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-slate-900 dark:text-white">{t('dashboard.recentActivity')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {emailList.slice(0, 3).map((email) => (
                    <div key={email.id} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-600 dark:text-slate-400 truncate">
                        {email.fullEmail}
                      </span>
                    </div>
                  ))}
                  {emailList.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      {t('stats.noActivity')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} {t('app.title')}. {t('footer.rights')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}