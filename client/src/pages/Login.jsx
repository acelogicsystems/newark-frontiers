import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiChevronRight, FiShield } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send login request to the server
            const res = await API.post('/auth/login', { email, password });
            
            // Save user data (token, name, etc.)
            login(res.data); 
            
            toast.success(`Welcome back, ${res.data.name.split(' ')[0]}`);
            
            // Redirect based on user role (Admin or Customer)
            const userRole = res.data.role;
    
            if (userRole === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Login error:", err);
            toast.error(err.response?.data?.message || "Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0b1120] text-white">
            
            {/* --- LEFT SIDE: Brand Info (Hidden on small screens/phones) --- */}
            <div className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between bg-gradient-to-br from-slate-900 to-black border-r border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                        <FiShield className="text-black" size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-widest">NEWARK</span>
                </div>

                <div>
                    <h2 className="text-6xl font-black mb-6">
                        SMART <br />
                        <span className="text-emerald-500">LENDING.</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-sm">
                        Fast, secure, and reliable loans to help you grow. Access your funds anytime, anywhere.
                    </p>
                </div>

                <p className="text-sm text-slate-500">© 2026 Newark Frontiers</p>
            </div>

            {/* --- RIGHT SIDE: Login Form (Visible on all screens) --- */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
                
                {/* Mobile Logo (Only shows on phones) */}
                <div className="lg:hidden mb-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center">
                        <FiShield className="text-black" size={18} />
                    </div>
                    <span className="font-black italic">NEWARK</span>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h3 className="text-3xl font-bold">Sign In</h3>
                        <p className="text-slate-400 mt-2">Enter your details to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="yourname@email.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button 
                            type="submit" 
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            LOG IN NOW
                            <FiChevronRight size={20} />
                        </button>
                    </form>

                    <footer className="text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account? {' '}
                            <Link to="/register" className="text-emerald-500 font-bold hover:underline">
                                Register here
                            </Link>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Login;