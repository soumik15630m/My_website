import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { checkEmail, register, login, sendOTP, verifyOTP } from '../api';
import { motion } from 'framer-motion';

type Step = 'email' | 'password' | 'register' | 'otp';

export function LoginPage() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);

    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await checkEmail(email);
            if (!result.authorized) {
                setError(result.error || 'Access denied');
                return;
            }
            setHasPassword(result.hasPassword);
            setStep(result.hasPassword ? 'password' : 'register');
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result.error) {
                setError(result.error);
                return;
            }
            authLogin(result.token, result.user);
            navigate('/admin');
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await register(email, password, mobile || undefined);
            if (result.error) {
                setError(result.error);
                return;
            }
            authLogin(result.token, result.user);
            navigate('/admin');
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        setError('');
        setLoading(true);

        try {
            const result = await sendOTP(email);
            if (result.error) {
                setError(result.error);
                return;
            }
            setStep('otp');
        } catch {
            setError('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await verifyOTP(email, otp);
            if (result.error) {
                setError(result.error);
                return;
            }
            authLogin(result.token, result.user);
            navigate('/admin');
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-primaryText mb-2">Admin Panel</h1>
                        <p className="text-secondaryText text-sm">Sign in to manage your portfolio</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-secondaryText mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-primaryText placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Checking...' : 'Continue'}
                            </button>
                        </form>
                    )}

                    {step === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="text-sm text-secondaryText mb-4">
                                Signing in as <span className="text-primaryText">{email}</span>
                            </div>
                            <div>
                                <label className="block text-sm text-secondaryText mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-primaryText placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full py-3 bg-transparent border border-border text-secondaryText font-medium rounded-lg hover:bg-surface hover:text-primaryText transition-colors disabled:opacity-50"
                            >
                                Sign in with OTP instead
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-sm text-secondaryText hover:text-primaryText transition-colors"
                            >
                                ← Back to email
                            </button>
                        </form>
                    )}

                    {step === 'register' && (
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="text-sm text-secondaryText mb-4">
                                Create password for <span className="text-primaryText">{email}</span>
                            </div>
                            <div>
                                <label className="block text-sm text-secondaryText mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password (min 6 chars)"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-primaryText placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-secondaryText mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-primaryText placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-secondaryText mb-2">Mobile (optional, for OTP)</label>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="+91 99999 99999"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-primaryText placeholder:text-secondaryText/50 focus:outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-sm text-secondaryText hover:text-primaryText transition-colors"
                            >
                                ← Back to email
                            </button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <form onSubmit={handleOTPSubmit} className="space-y-4">
                            <div className="text-sm text-secondaryText mb-4">
                                Enter OTP sent to <span className="text-primaryText">{email}</span>
                            </div>
                            <div>
                                <label className="block text-sm text-secondaryText mb-2">One-Time Password</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit OTP"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-primaryText text-center text-2xl tracking-widest placeholder:text-secondaryText/50 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-accent transition-colors"
                                    required
                                    maxLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full text-sm text-secondaryText hover:text-primaryText transition-colors"
                            >
                                Resend OTP
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(hasPassword ? 'password' : 'email')}
                                className="w-full text-sm text-secondaryText hover:text-primaryText transition-colors"
                            >
                                ← Back
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
