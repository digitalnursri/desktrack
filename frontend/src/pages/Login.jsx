import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!domain) {
      setError('Please enter your company domain first');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Simulate Google Auth redirect/callback
      await googleLogin(domain);
      navigate('/');
    } catch (err) {
      setError('Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-600/10 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
             <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-display tracking-tight">Welcome to DeskTrack</h1>
          <p className="text-slate-400 mt-2 font-medium">The ultimate workforce management suite</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl p-8 border-t border-t-white/10">
          {error && (
            <div className="mb-6 p-3 bg-alert-500/10 border border-alert-500/20 rounded-xl text-alert-500 text-sm font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Company Domain</label>
              <Input 
                icon={Globe}
                placeholder="yourcompany.desktrack.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary-500"
              />
            </div>

            <Button 
              onClick={handleGoogleLogin}
              variant="secondary" 
              className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 font-bold gap-3 shadow-lg transition-all"
              disabled={isLoading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-slate-600 uppercase tracking-widest">or email</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input 
                icon={Mail}
                type="email"
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600"
              />
              <Input 
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600"
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary-600 hover:bg-primary-500 text-white font-bold gap-2 shadow-[0_4px_15px_rgba(37,99,235,0.3)] group"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs font-medium">
              By signing in, you agree to our <a href="#" className="text-primary-500 hover:underline">Terms</a> and <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </Card>
        
        <div className="mt-8 text-center text-slate-600 text-sm font-medium">
          New to DeskTrack? <a href="#" className="text-primary-500 font-bold hover:underline">Contact Sales</a>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
