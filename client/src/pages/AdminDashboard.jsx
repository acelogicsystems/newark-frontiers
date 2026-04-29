import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import toast from 'react-hot-toast';
import { 
    LayoutDashboard, Users, FileText, CheckCircle, 
    Clock, XCircle, LogOut, Search, Eye, Download, RefreshCw, Calendar, Phone, Activity, Menu, X
} from 'lucide-react';

const AdminDashboard = () => {
    const { logout } = useContext(AuthContext);
    const [view, setView] = useState('dashboard');
    const [loans, setLoans] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchData = async (silent = false) => {
        if (!silent) setIsSyncing(true);
        try {
            const [loanRes, userRes] = await Promise.all([
                API.get('/loans/all'),
                API.get('/auth/all-users')
            ]);
            setLoans(Array.isArray(loanRes.data) ? loanRes.data : []);
            setUsers(Array.isArray(userRes.data) ? userRes.data : []);
        } catch (err) {
            if (!silent) toast.error("Cloud synchronization failed");
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 60000);
        return () => clearInterval(interval);
    }, []);

    const exportData = () => {
        const headers = ["Applicant,Email,Amount,Purpose,Status\n"];
        const data = loans.map(l => `${l.user?.name},${l.user?.email},${l.amount},${l.purpose},${l.status}`).join("\n");
        const blob = new Blob([headers + data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Newark_Admin_Export_${new Date().toLocaleDateString()}.csv`;
        a.click();
        toast.success("CSV Ledger Exported");
    };

    const handleLogout = () => {
        logout();
        toast.success("System Session Terminated");
    };

    const updateStatus = async (id, status) => {
        const loading = toast.loading(`Authorizing ${status}...`);
        try {
            await API.patch(`/loans/status/${id}`, { status });
            toast.success(`Asset ${status}`, { id: loading });
            fetchData(true);
            setSelectedLoan(null);
        } catch (err) { toast.error("Action Denied", { id: loading }); }
    };

    const stats = {
        total: loans.length,
        pending: loans.filter(l => l.status === 'pending').length,
        approved: loans.filter(l => ['approved', 'disbursed', 'paid'].includes(l.status)).length,
        volume: loans.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    };

    const filteredLoans = loans
        .filter(l => activeTab === 'all' ? true : l.status === activeTab)
        .filter(l => l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex min-h-screen bg-[#05070a] font-sans text-slate-300 overflow-x-hidden">
            
            {/* --- MOBILE SIDEBAR OVERLAY --- */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0a0c10] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                                <span className="text-black font-black text-xl italic">N</span>
                            </div>
                            <h1 className="text-white font-black text-lg tracking-tighter">NEWARK <span className="text-brand-primary">OPS</span></h1>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <nav className="space-y-2 flex-1">
                        <SidebarLink active={view === 'dashboard'} onClick={() => {setView('dashboard'); setIsSidebarOpen(false)}} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
                        <SidebarLink active={view === 'borrowers'} onClick={() => {setView('borrowers'); setIsSidebarOpen(false)}} icon={<Users size={20}/>} label="Borrowers" />
                    </nav>

                    <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-500 transition-colors font-bold text-sm mt-auto">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className={`flex-1 transition-all duration-300 lg:ml-72 p-4 md:p-12`}>
                
                {/* --- MOBILE HEADER --- */}
                <div className="lg:hidden flex justify-between items-center mb-8 pt-2">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <Menu size={22} className="text-brand-primary" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                            <span className="text-black font-black text-sm italic">N</span>
                        </div>
                        <span className="font-black text-white text-xs tracking-widest uppercase">Matrix</span>
                    </div>
                </div>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <p className="text-brand-primary font-bold text-[9px] uppercase tracking-[0.4em] mb-2">Administrative Hub</p>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Financial <span className="text-slate-700 font-medium italic">Matrix</span></h1>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={exportData} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all">
                            <Download size={14}/> Export
                        </button>
                        <button onClick={() => fetchData()} className={`p-3.5 bg-brand-primary rounded-xl text-black hover:scale-105 transition-all shadow-lg shadow-brand-primary/20 ${isSyncing ? 'animate-spin' : ''}`}>
                            <RefreshCw size={20}/>
                        </button>
                    </div>
                </header>

                {view === 'dashboard' ? (
                    <div className="space-y-10">
                        {/* STATS GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                            <MetricCard label="Total Portfolios" val={stats.total} icon={<Activity/>} color="primary" />
                            <MetricCard label="Under Review" val={stats.pending} icon={<Clock/>} color="amber" />
                            <MetricCard label="Active Assets" val={stats.approved} icon={<CheckCircle/>} color="emerald" />
                            <MetricCard label="System Volume" val={`KES ${(stats.volume / 1000).toFixed(1)}K`} icon={<FileText/>} color="slate" />
                        </div>

                        {/* DATA VIEW */}
                        <div className="bg-white/[0.02] backdrop-blur-md rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                            <div className="p-5 md:p-8 border-b border-white/5 flex flex-col xl:flex-row gap-6 justify-between items-center">
                                <div className="flex flex-wrap gap-2 justify-center xl:justify-start">
                                    {['all', 'pending', 'approved', 'disbursed', 'paid'].map(t => (
                                        <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeTab === t ? 'bg-brand-primary text-black border-brand-primary' : 'text-slate-500 border-white/5 bg-white/5 hover:text-white'}`}>{t}</button>
                                    ))}
                                </div>
                                <div className="relative w-full xl:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                    <input type="text" placeholder="Search borrower..." className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-brand-primary text-sm text-white placeholder:text-slate-700 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>

                            {/* --- RESPONSIVE TABLE/LIST --- */}
                            <div className="block md:hidden p-4 space-y-4">
                                {filteredLoans.map((loan) => (
                                    <div key={loan._id} className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center font-black text-brand-primary border border-brand-primary/20">{loan.user?.name?.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-white text-sm">{loan.user?.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{loan.user?.email}</p>
                                                </div>
                                            </div>
                                            <StatusBadge status={loan.status} />
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-600 uppercase">Amount</p>
                                                <p className="font-black text-white">KES {loan.amount?.toLocaleString()}</p>
                                            </div>
                                            <button onClick={() => setSelectedLoan(loan)} className="p-3 bg-brand-primary rounded-xl text-black shadow-lg shadow-brand-primary/10">
                                                <Eye size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.01] text-[10px] font-black uppercase text-slate-600">
                                        <tr>
                                            <th className="px-10 py-5">Borrower</th>
                                            <th className="px-10 py-5">Amount</th>
                                            <th className="px-10 py-5">Status</th>
                                            <th className="px-10 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredLoans.map((loan) => (
                                            <tr key={loan._id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center font-black text-brand-primary border border-brand-primary/10">{loan.user?.name?.charAt(0)}</div>
                                                        <div>
                                                            <p className="font-black text-white text-sm">{loan.user?.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">{loan.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <p className="font-black text-white">KES {loan.amount?.toLocaleString()}</p>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <StatusBadge status={loan.status} />
                                                </td>
                                                <td className="px-10 py-7 text-right">
                                                    <button onClick={() => setSelectedLoan(loan)} className="p-2.5 bg-white/5 border border-white/5 text-white rounded-xl hover:bg-brand-primary hover:text-black hover:border-brand-primary transition-all shadow-xl">
                                                        <Eye size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* USERS LIST RESPONSIVE */
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest px-1">Network Identity Registry</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {users.map(u => (
                                <div key={u._id} className="bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 hover:border-brand-primary/20 transition-all group">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-brand-primary text-xl border border-white/5 group-hover:scale-110 transition-transform">{u.name?.charAt(0)}</div>
                                        <div>
                                            <p className="font-black text-white text-base">{u.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Phone size={14} className="text-brand-primary" />
                                            <span className="text-xs font-mono">{u.phone || 'N/A'}</span>
                                        </div>
                                        <span className="text-[9px] font-black bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg border border-brand-primary/20 uppercase tracking-widest">
                                            {loans.filter(l => l.user?._id === u._id).length} Loans
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* --- ACTION MODAL --- */}
            {selectedLoan && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0a0c10] border border-white/10 rounded-[2.5rem] w-full max-w-lg my-auto overflow-hidden shadow-2xl">
                        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <h2 className="font-black text-white uppercase tracking-[0.2em] text-[10px]">Security Review</h2>
                            <button onClick={() => setSelectedLoan(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <XCircle className="text-slate-500" />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-brand-primary rounded-[1.5rem] flex items-center justify-center text-black text-2xl font-black shadow-lg shadow-brand-primary/20">{selectedLoan.user?.name?.charAt(0)}</div>
                                <div>
                                    <p className="text-2xl font-black text-white tracking-tight">{selectedLoan.user?.name}</p>
                                    <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">{selectedLoan.user?.phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner">
                                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Principal</p>
                                    <p className="text-xl font-black text-white">KES {selectedLoan.amount?.toLocaleString()}</p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner">
                                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Settlement</p>
                                    <p className="text-xl font-black text-emerald-400">KES {selectedLoan.totalRepayable?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5">
                                <p className="text-[9px] font-black text-brand-primary uppercase mb-3 tracking-widest">Purpose of Credit</p>
                                <p className="text-sm text-slate-400 italic leading-relaxed">"{selectedLoan.purpose}"</p>
                            </div>

                            {selectedLoan.status === 'pending' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <button onClick={() => updateStatus(selectedLoan._id, 'approved')} className="bg-emerald-600 text-white py-4.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/10">Approve & Pay</button>
                                    <button onClick={() => updateStatus(selectedLoan._id, 'rejected')} className="bg-white/5 border border-white/10 text-rose-500 py-4.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-rose-500/10 transition-all">Reject Claim</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MINI COMPONENTS ---

const SidebarLink = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${active ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
        {React.cloneElement(icon, { size: 18 })} {label}
    </button>
);

const MetricCard = ({ label, val, icon, color }) => {
    const colors = {
        primary: 'text-brand-primary border-brand-primary/20 bg-brand-primary/5',
        amber: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
        emerald: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
        slate: 'text-slate-600 border-white/10 bg-white/5'
    };
    return (
        <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-xl transition-transform hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border shadow-inner ${colors[color]}`}>{icon}</div>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
            <p className="text-3xl font-black text-white tracking-tighter">{val}</p>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const config = { 
        pending: 'text-amber-500 border-amber-500/20 bg-amber-500/5', 
        approved: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5', 
        disbursed: 'text-brand-primary border-brand-primary/20 bg-brand-primary/5',
        paid: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5',
        rejected: 'text-rose-500 border-rose-500/20 bg-rose-500/5' 
    };
    return <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase border tracking-widest ${config[status]}`}>{status}</span>;
};

export default AdminDashboard;