import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlitchButton } from '@/app/components/GlitchButton';
import { Eye, EyeOff, Lock, User, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import bgImage from '@/assets/885408bc9f9e51f743a471a27b12eef7765bbfd6.png';
import axios from 'axios';
import { toast } from 'sonner';

interface LoginData {
  username: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    if (!loginData.username.trim()) newErrors.username = 'Username required';
    if (!loginData.password) newErrors.password = 'Password required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/login`,
        loginData
      );

      if (response.status === 200) {
        // Save token and username to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', loginData.username);
        toast.success('Login successful!',{
          duration: 2000,
        });
        navigate('/home');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Invalid username or password. Please try again.';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100vh]relative size-full bg-[#1e3a5f] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="Fort Breach Background"
          className="size-full object-cover"
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/60 via-[#1e3a5f]/40 to-[#1e3a5f]/30" />
      </div>

      {/* Background noise texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="h-[100vh] relative flex size-full">
        {/* Left Side - Logo/Branding */}
        <motion.div
          className="relative w-full lg:w-1/2 flex items-end p-12"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Logo and tagline */}
          <div className="z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1
                className="mb-2 tracking-wider text-cyan-400"
                style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '3.5rem', lineHeight: '1.2' }}
              >
                FORT BREACH
              </h1>
              <div className="flex items-center gap-3">
                <div className="h-[2px] w-12 bg-orange-500" />
                <p
                  className="tracking-[0.3em] text-sky-300 uppercase"
                  style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.25rem' }}
                >
                  Zero Protocol
                </p>
              </div>
            </motion.div>
          </div>

          {/* Corner accents */}
          <div className="absolute top-12 left-12 w-24 h-24 border-l-2 border-t-2 border-cyan-400/50" />
          <div className="absolute bottom-12 right-12 w-24 h-24 border-r-2 border-b-2 border-orange-500/50" />
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          className="relative w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Glass-morphism form container */}
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Shield size={32} color="#22d3ee" />
                <h2
                  className="tracking-wider text-white uppercase"
                  style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.875rem' }}
                >
                  Authenticate
                </h2>
              </div>
              <p
                className="text-sky-300 tracking-wide"
                style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}
              >
                Access your tactical profile
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Glass-morphism container */}
              <div
                className="p-6 rounded-none relative backdrop-blur-md bg-[#1e3a5f]/60 border border-cyan-400/30"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                }}
              >
                {/* Corner decorations */}
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-orange-500" />

                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block mb-2 text-cyan-400 uppercase tracking-wide"
                      style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}
                    >
                      Username
                    </label>
                    <div className="relative">
                      <User size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0ea5e9'}} />
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={loginData.username}
                        onChange={handleChange}
                        className="w-full bg-[#0f2847]/80 border border-sky-700 focus:border-cyan-400 text-white pl-10 pr-4 py-2.5 outline-none transition-all"
                        style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                        }}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-orange-400" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}>
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-cyan-400 uppercase tracking-wide"
                      style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0ea5e9'}} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        className="w-full bg-[#0f2847]/80 border border-sky-700 focus:border-cyan-400 text-white pl-10 pr-12 py-2.5 outline-none transition-all"
                        style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-cyan-400 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} color="#0ea5e9" /> : <Eye size={16} color="#0ea5e9" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-orange-400" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}>
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <GlitchButton type="submit" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Authenticate'}
              </GlitchButton>

              {/* Footer text */}
              <p
                className="text-center text-sky-400 tracking-wide"
                style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}
              >
                New agent?{' '}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/signup');
                  }}
                  className="text-orange-500 hover:text-orange-400 transition-colors bg-none border-none cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Scan lines overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-30" />
    </div>
  );
}
