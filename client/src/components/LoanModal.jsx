import React, { useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { X, Camera, ShieldCheck, CreditCard, ArrowRight, Info } from 'lucide-react';

const LoanModal = ({ isOpen, onClose, refreshLoans }) => {
    const [formData, setFormData] = useState({
        amount: '',
        duration: '3',
        purpose: 'Business Expansion',
        idNumber: ''
    });
    const [idFile, setIdFile] = useState(null);
    const [selfieFile, setSelfieFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🚀 DYNAMIC INTEREST CALCULATION
    const principal = Number(formData.amount) || 0;
    const serviceFee = Math.round(principal * 0.10);
    const totalRepayable = principal + serviceFee;

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!idFile || !selfieFile) {
            return toast.error("Identity documents and a selfie are required.");
        }

        setLoading(true);
        const data = new FormData();
        data.append('amount', formData.amount);
        data.append('duration', formData.duration);
        data.append('purpose', formData.purpose);
        data.append('idNumber', formData.idNumber);
        data.append('idImage', idFile);
        data.append('selfie', selfieFile);

        try {
            await API.post('/loans/apply', data);
            toast.success("Application Submitted for Review!");
            onClose();
            if (refreshLoans) refreshLoans();
        } catch (err) {
            toast.error(err.response?.data?.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/10">
                
                {/* Header */}
                <div className="bg-brand-dark p-8 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black italic">Loan Application</h3>
                        <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em]">Capital Deployment</p>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto">
                    
                    {/* Input Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Amount (KES)</label>
                            <input 
                                type="number" 
                                className="w-full p-4 bg-brand-surface border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-lg"
                                placeholder="e.g. 10000"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">National ID Number</label>
                            <input 
                                type="text" 
                                className="w-full p-4 bg-brand-surface border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold"
                                placeholder="8 Digits"
                                onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {/* 📊 THE TRANSPARENCY BOX */}
                    {principal > 0 && (
                        <div className="bg-brand-dark rounded-3xl p-6 border border-brand-primary/20 shadow-xl animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-2 mb-4 text-brand-primary">
                                <Info size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Financial Breakdown</span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Principal Amount</span>
                                    <span className="text-white font-black">KES {principal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Service Fee (10%)</span>
                                    <span className="text-brand-primary font-black">+ KES {serviceFee.toLocaleString()}</span>
                                </div>
                                
                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-white text-xs font-black uppercase">Total Repayable</span>
                                    <span className="text-brand-primary text-2xl font-black italic">KES {totalRepayable.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Duration (Months)</label>
                            <select 
                                className="w-full p-4 bg-brand-surface border border-slate-200 rounded-2xl outline-none font-bold"
                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                            >
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Purpose</label>
                            <select 
                               className="w-full p-4 bg-brand-surface border border-slate-200 rounded-2xl outline-none font-bold"
                               value={formData.purpose}
                               onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                            >
                               <option value="Business Expansion">Business Expansion</option>
                               <option value="Education">Education</option>
                               <option value="Emergency">Emergency</option>
                               <option value="Asset Purchase">Asset Purchase</option>
                           </select>
                       </div>
                    </div>

                    {/* Upload Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-brand-surface transition-all bg-slate-50/50">
                            <div className="flex flex-col items-center justify-center py-2 text-center px-4">
                                <CreditCard className="text-slate-300 mb-2" size={20} />
                                <p className="text-[10px] text-slate-500 font-black uppercase truncate max-w-full">
                                    {idFile ? idFile.name : "Front of ID"}
                                </p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setIdFile(e.target.files[0])} />
                        </label>

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-brand-surface transition-all bg-slate-50/50">
                            <div className="flex flex-col items-center justify-center py-2 text-center px-4">
                                <Camera className="text-slate-300 mb-2" size={20} />
                                <p className="text-[10px] text-slate-500 font-black uppercase truncate max-w-full">
                                    {selfieFile ? selfieFile.name : "Capture Selfie"}
                                </p>
                            </div>
                            <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => setSelfieFile(e.target.files[0])} />
                        </label>
                    </div>

                    <button 
                        disabled={loading}
                        type="submit"
                        className="w-full bg-brand-primary hover:bg-brand-dark text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-brand-primary/20 flex justify-center items-center gap-3 uppercase text-xs tracking-widest"
                    >
                        {loading ? "Authenticating..." : "Submit Application"} <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoanModal;