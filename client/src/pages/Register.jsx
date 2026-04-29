import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiChevronRight, FiShield } from 'react-icons/fi';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [consent, setConsent] = useState(false); 
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!consent) {
            return toast.error("Please accept the data processing terms to continue.");
        }

        setLoading(true);
        try {
            const res = await API.post('/auth/register', formData);
            login(res.data);
            toast.success("Welcome to Newark Frontiers!");
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#05070a] text-slate-200 selection:bg-brand-primary/30">
            
            {/* --- LEFT SIDE: Brand Experience (Hidden on mobile) --- */}
            <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden bg-[#0a0c10] border-r border-white/5">
                {/* Visual Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />

                <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <FiShield className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white italic">
                            NEWARK <span className="text-brand-primary not-italic font-light">FRONTIERS</span>
                        </span>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-7xl font-black text-white leading-none tracking-tight">
                            START YOUR <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-emerald-400">
                                JOURNEY.
                            </span>
                        </h2>
                        <p className="max-w-md text-lg text-slate-400 leading-relaxed border-l-2 border-brand-primary pl-6">
                            Secure your financial future with access to instant credit and personalized growth paths.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 text-sm font-bold tracking-widest text-slate-500 uppercase">
                        <span>EST. 2024</span>
                        <div className="h-px w-12 bg-white/10"></div>
                        <span>Nairobi, Kenya</span>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: Register Form --- */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative">
                
                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                        <FiShield className="text-white" size={16} />
                    </div>
                    <span className="font-black text-white italic">NEWARK</span>
                </div>

                <div className="w-full max-w-[400px] space-y-6">
                    <header>
                        <h3 className="text-3xl font-bold text-white mb-2">Create Identity</h3>
                        <p className="text-slate-400">Join the elite financial network.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input 
                            icon={<FiUser/>} 
                            placeholder="Full Name" 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        />
                        <Input 
                            icon={<FiMail/>} 
                            type="email" 
                            placeholder="Email Address" 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        />
                        <Input 
                            icon={<FiPhone/>} 
                            placeholder="Phone (e.g. 07...)" 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                        />
                        <Input 
                            icon={<FiLock/>} 
                            type="password" 
                            placeholder="Create Password" 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        />

                        {/* COMPLIANCE CHECKBOX */}
                        <div className="flex items-start gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl my-4">
                            <input 
                                type="checkbox" 
                                id="consent"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-brand-primary focus:ring-brand-primary cursor-pointer accent-brand-primary" 
                                required 
                            />
                            <label htmlFor="consent" className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter cursor-pointer select-none">
                                I authorize <span className="text-white">Newark Frontiers</span> to verify my identity via IPRS 
                                and retrieve CRB data under the Data Protection Act of Kenya.
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !consent}
                            className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 mt-4 shadow-xl 
                                ${consent 
                                    ? 'bg-white text-black hover:bg-brand-primary hover:text-white' 
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                        >
                            {loading ? "PROCESSING..." : "FINALIZE REGISTRATION"} <FiChevronRight/>
                        </button>
                    </form>

                    <footer className="pt-4 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm">
                            Already have an account? {' '}
                            <Link to="/login" className="text-white font-bold hover:text-brand-primary transition-colors decoration-brand-primary/30 underline-offset-4 underline">
                                Sign In
                            </Link>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

// HELPER COMPONENT (Internal)
const Input = ({ icon, ...props }) => (
    <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors">
            {icon}
        </div>
        <input 
            {...props} 
            className="w-full pl-12 pr-4 py-4 bg-[#111622] border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all font-medium text-white placeholder:text-slate-600" 
        />
    </div>
);

export default Register;