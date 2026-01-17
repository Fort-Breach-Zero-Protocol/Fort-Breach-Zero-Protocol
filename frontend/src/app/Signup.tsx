import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlitchButton } from '@/app/components/GlitchButton';
import { Eye, EyeOff, Lock, User, Calendar, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import bgImage from '@/assets/885408bc9f9e51f743a471a27b12eef7765bbfd6.png';
import axios from 'axios';

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) newErrors.firstName = 'First name must be at least 2 characters';
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) newErrors.lastName = 'Last name must be at least 2 characters';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth required';
    if (!formData.username.trim() || formData.username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

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
      // Transform formData to match backend expectations
      const dataToSend = {
        fullname: {
          firstname: formData.firstName,
          lastname: formData.lastName,
        },
        birthdate: formData.dateOfBirth,
        username: formData.username,
        password: formData.password,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/register`,
        dataToSend
      );

      if (response.status === 201) {
        // Save token and username to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', formData.username);
        alert('Account created successfully!');
        navigate('/home');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to create account. Please try again.';
        alert(errorMessage);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative size-full bg-[#1e3a5f] overflow-hidden">
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

      <div className="relative flex size-full">
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

        {/* Right Side - Registration Form */}
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
                  Create Account
                </h2>
              </div>
              <p
                className="text-sky-300 tracking-wide"
                style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}
              >
                Initialize your tactical profile
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
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block mb-2 text-cyan-400 uppercase tracking-wide"
                        style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <User size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0ea5e9'}} />
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full bg-[#0f2847]/80 border border-sky-700 focus:border-cyan-400 text-white pl-10 pr-4 py-2.5 outline-none transition-all"
                          style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                          }}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-orange-400" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}>
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block mb-2 text-cyan-400 uppercase tracking-wide"
                        style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}
                      >
                        Last Name
                      </label>
                      <div className="relative">
                        <User size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0ea5e9'}} />
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full bg-[#0f2847]/80 border border-sky-700 focus:border-cyan-400 text-white pl-10 pr-4 py-2.5 outline-none transition-all"
                          style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                          }}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1 text-orange-400" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="block mb-2 text-cyan-400 uppercase tracking-wide"
                      style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}
                    >
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0ea5e9'}} />
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full bg-[#0f2847]/80 border border-sky-700 focus:border-cyan-400 text-white pl-10 pr-4 py-2.5 outline-none transition-all"
                        style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                        }}
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-orange-400" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}>
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

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
                        value={formData.username}
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
                        value={formData.password}
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

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block mb-2 text-cyan-400 uppercase tracking-wide"
                      style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0ea5e9'}} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-[#0f2847]/80 border border-sky-700 focus:border-cyan-400 text-white pl-10 pr-12 py-2.5 outline-none transition-all"
                        style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-cyan-400 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} color="#0ea5e9" /> : <Eye size={16} color="#0ea5e9" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-orange-400" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <GlitchButton type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </GlitchButton>

              {/* Footer text */}
              <p
                className="text-center text-sky-400 tracking-wide"
                style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.875rem' }}
              >
                Already have an account?{' '}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                  className="text-orange-500 hover:text-orange-400 transition-colors bg-none border-none cursor-pointer"
                >
                  Authenticate
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
