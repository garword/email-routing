"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, Shield, Globe } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoggedIn } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error(t('msg.loginRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(username, password, rememberMe);
      
      if (success) {
        toast.success(t('msg.loginSuccess'));
        
        // Use Next.js router for better navigation
        router.push('/');
      } else {
        toast.error(t('msg.loginError'));
      }
    } catch (error) {
      toast.error(t('msg.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading or redirect if logged in
  if (isLoggedIn) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
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
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {t('app.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('app.subtitle')}
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-slate-900 dark:text-white">{t('login.title')}</CardTitle>
            </div>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('login.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('login.username')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder={language === 'id' ? 'Masukkan username' : 'Enter username'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('login.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={language === 'id' ? 'Masukkan password' : 'Enter password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('login.rememberMe')}
                </Label>
              </div>

              {/* Login Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t('login.processing')}
                    </>
                  ) : (
                    t('login.button')
                  )}
                </Button>
              </div>
            </form>

            {/* Info Alert */}
            <div className="pt-2">
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <Shield className="w-4 h-4 text-blue-500" />
                <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                  <strong>{t('login.info')}:</strong><br />
                  {t('login.infoText')}<br />
                  <em>{t('login.rememberText')}</em>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 mb-8 text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} {t('app.title')}. {t('footer.rights')}</p>
        </div>
      </div>
    </div>
  );
}