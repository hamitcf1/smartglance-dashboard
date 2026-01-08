import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, LayoutGrid, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string, isRegister?: boolean) => void;
  isLoading?: boolean;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading = false, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    if (isRegisterMode && password !== confirmPassword) {
      return;
    }

    onLogin(email, password, isRegisterMode);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text)'
      }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LayoutGrid className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              SmartGlance
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to your dashboard</p>
        </div>

        {/* Login Card */}
        <div 
          className="backdrop-blur-md border rounded-2xl p-8 shadow-lg"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsRegisterMode(false)}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm"
              style={{
                backgroundColor: !isRegisterMode ? 'var(--primary)' : 'var(--surface-alt)',
                color: !isRegisterMode ? 'white' : 'var(--text-secondary)',
                borderColor: 'var(--border)',
                border: '1px solid'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegisterMode(true)}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm"
              style={{
                backgroundColor: isRegisterMode ? 'var(--primary)' : 'var(--surface-alt)',
                color: isRegisterMode ? 'white' : 'var(--text-secondary)',
                borderColor: 'var(--border)',
                border: '1px solid'
              }}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="mb-4 p-3 rounded-lg text-sm border flex gap-2 items-start"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password {isRegisterMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegisterMode ? 'At least 6 characters' : 'Enter your password'}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--surface-alt)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{
                    color: 'var(--text-secondary)'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input (Register Mode Only) */}
            {isRegisterMode && (
              <div>
                <label 
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--surface-alt)',
                    borderColor: password !== confirmPassword ? '#ef4444' : 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
                {isRegisterMode && password !== confirmPassword && (
                  <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                    Passwords do not match
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim() || (isRegisterMode && password !== confirmPassword)}
              className="w-full mt-6 px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--primary)',
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin">⏳</div>
                  {isRegisterMode ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {isRegisterMode ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Info Message */}
          <div 
            className="mt-6 p-3 rounded-lg text-xs text-center border"
            style={{
              backgroundColor: 'var(--surface-alt)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            <p>Secure Firebase Authentication. Your data is encrypted and private.</p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="mt-6 text-center text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          <p>Protect your dashboard with authentication</p>
        </div>
      </div>
    </div>
  );
};
