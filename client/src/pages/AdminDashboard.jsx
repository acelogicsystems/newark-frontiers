import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import toast from 'react-hot-toast';
import { 
    LayoutDashboard, Users, FileText, CheckCircle, 
    Clock, XCircle, LogOut, Search, Eye, Download, RefreshCw, Calendar, Phone, Activity, Menu
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For Mobile

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
        <div className="flex min-h-screen bg-[#05070a] font-sans text-slate-300">
            
            {/* --- SIDEBAR --- */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0c10] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                            <span className="text-black font-black text-xl italic">N</span>
                        </div>
                        <h1 className="text-white font-black text-lg tracking-tighter">NEWARK <span className="text-brand-primary">OPS</span></h1>
                    </div>
                    
                    <nav className="space-y-2 flex-1">
                        <SidebarLink active={view === 'dashboard'} onClick={() => {setView('dashboard'); setIsSidebarOpen(false)}} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
                        <SidebarLink active={view === 'borrowers'} onClick={() => {setView('borrowers'); setIsSidebarOpen(false)}} icon={<Users size={20}/>} label="Borrowers" />
                    </nav>

                    <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-500 transition-colors font-bold text-sm">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0 lg:ml-64'} p-4 md:p-12`}>
                
                {/* Mobile Header Toggle */}
                <div className="lg:hidden flex justify-between items-center mb-6">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <span className="font-black text-brand-primary">NEWARK OPS</span>
                </div>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <p className="text-brand-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Internal Surveillance</p>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Financial <span className="text-slate-600 font-medium">Matrix</span></h1>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={exportData} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-[10px] font-bold uppercase text-white hover:bg-white/10 transition-all">
                            <Download size={14}/> CSV
                        </button>
                        <button onClick={() => fetchData()} className={`p-3 bg-brand-primary rounded-xl text-black hover:scale-105 transition-all ${isSyncing ? 'animate-spin' : ''}`}>
                            <RefreshCw size={20}/>
                        </button>
                    </div>
                </header>

                {view === 'dashboard' ? (
                    <div className="space-y-10">
                        {/* STATS GRID - Responsive 1 to 4 columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                            <MetricCard label="Total Portfolios" val={stats.total} icon={<Activity/>} color="primary" />
                            <MetricCard label="Under Review" val={stats.pending} icon={<Clock/>} color="amber" />
                            <MetricCard label="Active Assets" val={stats.approved} icon={<CheckCircle/>} color="emerald" />
                            <MetricCard label="System Volume" val={`KES ${(stats.volume / 1000).toFixed(1)}K`} icon={<FileText/>} color="slate" />
                        </div>

                        {/* DATA TABLE CONTAINER */}
                        <div className="bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl">
                            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['all', 'pending', 'approved', 'disbursed', 'paid'].map(t => (
                                        <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === t ? 'bg-brand-primary text-black' : 'text-slate-500 hover:text-white bg-white/5'}`}>{t}</button>
                                    ))}
                                </div>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.01] text-[10px] font-black uppercase text-slate-500">
                                        <tr>
                                            <th className="px-8 py-4">Borrower</th>
                                            <th className="px-8 py-4">Amount</th>
                                            <th className="px-8 py-4">Status</th>
                                            <th className="px-8 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredLoans.map((loan) => (
                                            <tr key={loan._id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center font-bold text-brand-primary">{loan.user?.name?.charAt(0)}</div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm">{loan.user?.name}</p>
                                                            <p className="text-[10px] text-slate-500">{loan.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-white">KES {loan.amount?.toLocaleString()}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <StatusBadge status={loan.status} />
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button onClick={() => setSelectedLoan(loan)} className="p-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-brand-primary hover:text-black transition-all">
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
                    /* USERS LIST */
                    <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.01] text-[10px] font-black uppercase text-slate-500">
                                    <tr><th className="px-8 py-4">Name</th><th className="px-8 py-4">Phone</th><th className="px-8 py-4 text-right">History</th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map(u => (
                                        <tr key={u._id} className="hover:bg-white/[0.02]">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-white text-sm">{u.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase">{u.email}</p>
                                            </td>
                                            <td className="px-8 py-6 font-mono text-brand-primary text-xs">{u.phone || 'N/A'}</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-[10px] font-bold bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                                                    {loans.filter(l => l.user?._id === u._id).length} Loans
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* --- ACTION MODAL --- */}
            {selectedLoan && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#0a0c10] border border-white/10 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="font-black text-white uppercase tracking-widest text-sm">Review Application</h2>
                            <button onClick={() => setSelectedLoan(null)}><XCircle className="text-slate-500" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-brand-primary rounded-xl flex items-center justify-center text-black text-xl font-black">{selectedLoan.user?.name?.charAt(0)}</div>
                                <div>
                                    <p className="text-xl font-bold text-white">{selectedLoan.user?.name}</p>
                                    <p className="text-xs text-brand-primary uppercase tracking-wider">{selectedLoan.user?.phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Amount</p>
                                    <p className="text-lg font-bold text-white">KES {selectedLoan.amount?.toLocaleString()}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Repayable</p>
                                    <p className="text-lg font-bold text-emerald-400">KES {selectedLoan.totalRepayable?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                                <p className="text-[10px] font-bold text-brand-primary uppercase mb-2">Purpose</p>
                                <p className="text-sm text-slate-300 italic">"{selectedLoan.purpose}"</p>
                            </div>

                            {selectedLoan.status === 'pending' && (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button onClick={() => updateStatus(selectedLoan._id, 'approved')} className="bg-emerald-600 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all">Approve & Pay</button>
                                    <button onClick={() => updateStatus(selectedLoan._id, 'rejected')} className="bg-white/5 border border-white/10 text-rose-500 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-rose-500/10 transition-all">Decline</button>
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${active ? 'bg-brand-primary text-black' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
        {icon} {label}
    </button>
);

const MetricCard = ({ label, val, icon, color }) => {
    const colors = {
        primary: 'text-brand-primary border-brand-primary/20 bg-brand-primary/5',
        amber: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
        emerald: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
        slate: 'text-slate-400 border-white/10 bg-white/5'
    };
    return (
        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border ${colors[color]}`}>{icon}</div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{val}</p>
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
    return <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase border ${config[status]}`}>{status}</span>;
};

export default AdminDashboard;