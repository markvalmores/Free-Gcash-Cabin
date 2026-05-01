/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, CheckCircle2, MessageCircle, Lock } from 'lucide-react';

export default function App() {
  const [claimCode, setClaimCode] = useState<string | null>(() => {
    return localStorage.getItem('claimCode') || null;
  });
  const [isGlowing, setIsGlowing] = useState(() => {
    const saved = localStorage.getItem('isGlowing');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [claimsRemaining, setClaimsRemaining] = useState(() => {
    const saved = localStorage.getItem('claimsRemaining');
    return saved !== null ? parseInt(saved, 10) : 7;
  });
  const [isCopied, setIsCopied] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(() => {
    return localStorage.getItem('lastRefreshed') || new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date());
  });
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem('isAdmin');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState<{code: string, timestamp: string}[]>(() => {
    const saved = localStorage.getItem('generatedCodes');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Effects
  useEffect(() => {
    if (claimCode) localStorage.setItem('claimCode', claimCode);
  }, [claimCode]);

  useEffect(() => {
    localStorage.setItem('isGlowing', JSON.stringify(isGlowing));
  }, [isGlowing]);

  useEffect(() => {
    localStorage.setItem('claimsRemaining', claimsRemaining.toString());
  }, [claimsRemaining]);

  useEffect(() => {
    localStorage.setItem('lastRefreshed', lastRefreshed);
  }, [lastRefreshed]);

  useEffect(() => {
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('generatedCodes', JSON.stringify(generatedCodes));
  }, [generatedCodes]);

  useEffect(() => {
    if (!localStorage.getItem('lastRefreshed')) {
      setLastRefreshed(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()));
    }
  }, []);

  // For demonstration, simulate the "random refresh times in a month" via a faster timer.
  // It waits 15-30 seconds after claiming to "glow" again representing a new claiming window.
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!isGlowing && claimsRemaining > 0) {
      const randomWait = Math.floor(Math.random() * 15000) + 15000; // 15 to 30 seconds
      timeoutId = setTimeout(() => {
        setIsGlowing(true);
        setLastRefreshed(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()));
      }, randomWait);
    }
    return () => clearTimeout(timeoutId);
  }, [isGlowing, claimsRemaining]);

  const generateRandomCode = () => {
    const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
    const numbers = Math.floor(1000 + Math.random() * 9000);
    return `GCA-${numbers}-${letters}`;
  };

  const handleClaim = () => {
    if (!isGlowing || claimsRemaining <= 0) return;
    
    const code = generateRandomCode();
    setClaimCode(code);
    setGeneratedCodes(prev => [
      { code, timestamp: new Date().toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' }) },
      ...prev
    ]);
    setIsCopied(false);
    setIsGlowing(false);
    setClaimsRemaining(prev => prev - 1);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'mdv4244@gmail.com' && password === 'mark4246') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError('');
      setEmail('');
      setPassword('');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const copyToClipboard = () => {
    if (claimCode) {
      navigator.clipboard.writeText(claimCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#002A66] overflow-y-auto overflow-x-hidden relative flex flex-col items-center justify-center font-sans p-4 sm:p-8 py-16">
      {/* Top Admin Login Button */}
      <div className="absolute top-4 right-4 z-50">
        {isAdmin ? (
          <button 
            onClick={() => setIsAdmin(false)} 
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium px-4 py-2 bg-black/20 rounded-xl border border-white/10 transition-colors"
          >
            <Lock size={16} /> Logout Admin
          </button>
        ) : (
          <button 
            onClick={() => setShowLoginModal(true)} 
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium px-4 py-2 bg-black/20 rounded-xl border border-white/10 transition-colors"
          >
            <Lock size={16} /> Admin Login
          </button>
        )}
      </div>

      {/* Animated-style Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#0055D3] rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00A1FF] rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#FF007A] rounded-full blur-[150px] opacity-20"></div>
      </div>

      {/* Main Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] px-6 py-10 sm:p-12 shadow-2xl flex flex-col items-center"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-4">
            Official Reward Cabin
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Free GCash <span className="text-blue-400">Rewards</span>
          </h1>
          <p className="text-blue-100/70 mt-3 text-lg sm:text-xl italic">
            Exclusive rewards for loyal supporters
          </p>
        </div>

        {/* Main Interactive Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-2">
          
          {/* Left Side: Action */}
          <div className="flex flex-col items-center justify-center space-y-8 p-4">
            <div className="relative group w-full flex justify-center">
              {/* The Glowing Button */}
              <AnimatePresence>
                {isGlowing && claimsRemaining > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-blue-400 blur-2xl opacity-50 rounded-full w-3/4 mx-auto" 
                  />
                )}
              </AnimatePresence>
              
              <motion.button 
                whileHover={isGlowing ? { scale: 1.02 } : {}}
                whileTap={isGlowing ? { scale: 0.95 } : {}}
                onClick={handleClaim}
                disabled={!isGlowing || claimsRemaining <= 0}
                className={`relative px-8 py-5 sm:px-12 sm:py-6 rounded-3xl text-white text-xl sm:text-2xl font-black border transition-all duration-300 w-full max-w-sm flex items-center justify-center gap-3
                  ${isGlowing 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.6)] border-blue-400 cursor-pointer' 
                    : 'bg-white/5 shadow-none border-white/10 text-white/50 cursor-not-allowed'
                  }`}
              >
                {claimsRemaining <= 0 
                  ? 'NO CLAIMS LEFT' 
                  : isGlowing 
                    ? 'CLAIM ₱50 GCASH' 
                    : 'WAITING FOR WINDOW'
                }
              </motion.button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full max-w-sm text-center min-h-[104px] flex flex-col justify-center relative overflow-hidden">
              <span className="text-blue-200/80 text-xs sm:text-sm block mb-2 uppercase tracking-tighter font-bold">
                Your Unique Claim Code
              </span>
              
              {claimCode ? (
                <div className="flex items-center justify-between bg-black/20 rounded-xl p-3 border border-white/5">
                  <div className="text-xl sm:text-2xl font-mono text-white tracking-widest font-bold">
                    {claimCode}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-300 hover:text-white"
                    title="Copy code"
                  >
                    {isCopied ? <CheckCircle2 size={20} className="text-green-400" /> : <Copy size={20} />}
                  </button>
                </div>
              ) : (
                <div className="text-sm text-white/30 italic">
                  Press claim to generate your code
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Instructions */}
          <div className="bg-black/20 rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-bold text-xl mb-5 flex items-center gap-2">
                Instructions
              </h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="w-7 h-7 bg-blue-500/80 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                    1
                  </div>
                  <p className="text-blue-50 text-sm leading-relaxed pt-0.5">
                    Click the claim button when it glows to generate your unique claim code.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-7 h-7 bg-blue-500/80 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                    2
                  </div>
                  <div className="w-full">
                    <p className="text-blue-50 text-sm leading-relaxed pt-0.5 mb-3">
                      Copy your code and send it to our official messenger profile below to claim your ₱50:
                    </p>
                    <a 
                      href="https://www.facebook.com/usagyuunvtuber5" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between bg-blue-500/10 hover:bg-blue-500/20 p-4 rounded-xl border border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <MessageCircle size={20} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                        <span className="text-blue-200 group-hover:text-white text-sm font-medium transition-colors break-all">
                          fb.com/usagyuunvtuber5
                        </span>
                      </div>
                    </a>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-[11px] leading-relaxed">
                * Wait for the administrator to reply and process your claim. Claiming windows refresh {claimsRemaining > 0 ? '7 times per month' : 'next month'} at random intervals. If the button is not glowing, check back later.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Stats / Status */}
        <div className="w-full flex sm:flex-row flex-col justify-between items-center mt-10 sm:mt-12 px-2 gap-6 sm:gap-0">
          <div className="flex gap-8 sm:gap-12 text-center sm:text-left">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">
                Claims Remaining
              </span>
              <span className="text-white text-lg sm:text-xl font-bold flex items-baseline gap-2 justify-center sm:justify-start">
                {claimsRemaining} / 7 
                <span className="text-xs text-white/40 font-normal hidden sm:inline">this month</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">
                Status
              </span>
              <span className={`text-lg sm:text-xl font-bold uppercase tracking-tight ${isGlowing ? 'text-green-400' : claimsRemaining <= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                {isGlowing ? 'System Ready' : claimsRemaining <= 0 ? 'Limit Reached' : 'Cooling Down'}
              </span>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest block mb-1">
              Last Refreshed
            </span>
            <span className="text-blue-200 text-sm font-medium">
              Today, {lastRefreshed}
            </span>
          </div>
        </div>

      </motion.div>

      {/* Admin Panel (Generated Codes) */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
            className="w-full max-w-4xl bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-[30px] p-6 sm:p-8 shadow-2xl mt-8 overflow-hidden z-10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
              Admin Dashboard: Claimed Codes
            </h2>
            
            {generatedCodes.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-white/40 italic">No codes have been generated yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {generatedCodes.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="flex justify-between items-center bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors rounded-xl p-4 sm:px-6"
                  >
                    <div className="flex flex-col">
                      <span className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">Claim Code</span>
                      <span className="text-white font-mono text-lg sm:text-xl font-bold tracking-wider">{item.code}</span>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Generated At</span>
                      <span className="text-white/70 text-xs sm:text-sm">{item.timestamp}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Elements */}
      <div className="fixed bottom-6 text-white/20 text-[10px] tracking-widest uppercase hidden sm:block pointer-events-none z-0">
        Secure Rewards Cabin Protocol v4.2 // Automated Refresh Cycle Active
      </div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#002A66] border border-blue-500/30 p-8 rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              {/* Modal Background Effect */}
              <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Admin Access</h2>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400 focus:bg-black/40 transition-colors"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400 focus:bg-black/40 transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  {loginError && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-red-400 text-sm font-medium bg-red-400/10 border border-red-400/20 p-3 rounded-xl"
                    >
                      {loginError}
                    </motion.p>
                  )}
                  
                  <div className="flex gap-3 mt-8 pt-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowLoginModal(false);
                        setLoginError('');
                      }}
                      className="flex-1 px-4 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium border border-white/10"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl transition-colors font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-blue-500/30"
                    >
                      Authenticate
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
