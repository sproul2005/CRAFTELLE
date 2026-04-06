import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/'); // Redirect to home on success
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', backgroundColor: '#f8fafc' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '440px', backgroundColor: 'white', padding: 'clamp(2rem, 5vw, 3.5rem)', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.05)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontFamily: 'serif', fontSize: '2.4rem', color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Welcome Back</h2>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Enter your details to access your account</p>
                </div>

                {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #fee2e2' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#f8fafc', transition: 'all 0.2s', outline: 'none' }}
                            onFocus={(e) => { e.target.style.borderColor = '#111'; e.target.style.backgroundColor = 'white'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#f8fafc', transition: 'all 0.2s', outline: 'none' }}
                            onFocus={(e) => { e.target.style.borderColor = '#111'; e.target.style.backgroundColor = 'white'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{ marginTop: '0.5rem', width: '100%', padding: '14px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#111'}
                    >
                        Sign In
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
                    New to Craftelle? <Link to="/register" style={{ color: '#111', fontWeight: 600, textDecoration: 'none' }}>Create an Account</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
