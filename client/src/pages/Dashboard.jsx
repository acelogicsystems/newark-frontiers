import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoanModal from '../components/LoanModal';
import API from '../api';
import toast from 'react-hot-toast';
import { 
    LayoutDashboard, Users, FileText, CheckCircle, 
    Clock, XCircle, LogOut, Search, Eye, Download, RefreshCw, Calendar, Phone, Activity, Lock, ShieldCheck, ShieldAlert, ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user, updateUserInfo, logout } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loans, setLoans] = useState([]); 
  const [payLoading, setPayLoading] = useState(null);

  // --- SECURITY STATES ---
  const [pinModal, setPinModal] = useState({ open: false, loanId: null, amount: null });
  const [enteredPin, setEnteredPin] = useState("");
  
  // --- PIN SETUP STATE ---
  const [isPinSetupOpen, setIsPinSetupOpen] = useState(false);
  const [newPin, setNewPin] = useState("");

  const fetchUserProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      updateUserInfo(res.data);
      if (!res.data.transactionPin) {
        setIsPinSetupOpen(true);
      }
    } catch (err){
      console.error("Error updating profile state:", err);
    } 
   };

  const fetchLoans = async () => {
    try {
        const res = await API.get('/loans/my-loans');
        setLoans(res.data);
        fetchUserProfile();
    } catch (err) {
        console.log("Error fetching loans:", err);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleRepayment = (loanId, amount) => {
    setPinModal({ open: true, loanId, amount});
  };

  const handlePaymentSuccess = () => {
    toast.success("STK Push Initiated! Check your phone.");
    fetchLoans(); 
    setPinModal({ open: false, loanId: null, amount: null });
    setEnteredPin("");
  };

  const submitRepayment = async () => {
    if (!enteredPin || enteredPin.length < 4) {
        return toast.error("Please enter your 4-digit PIN");
    }

    setPayLoading(pinModal.loanId);
    try {
        await API.post(`/loans/${pinModal.loanId}/repay`, { 
            pin: enteredPin 
        });
        handlePaymentSuccess();
    } catch (err) {
        toast.error(err.response?.data?.message || "Invalid PIN");
    } finally {
        setPayLoading(null);
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (!newPin || newPin.length !== 4) {
        toast.error("PIN must be exactly 4 digits");
        return;
    }
    try {
        await API.post('/auth/update-pin', { newPin });
        toast.success("Security PIN Established! 🔒");
        setIsPinSetupOpen(false);
        updateUserInfo({ ...user, transactionPin: newPin });
        setNewPin("");
        fetchUserProfile();
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to set PIN.");
    }
  };

  const totalApproved = loans
    .filter(l => l.status === 'approved' || l.status === 'disbursed')
    .reduce((acc, curr) => acc + (curr.totalRepayable || curr.amount), 0);

  return (
    <div className="min-h-screen bg-brand-surface font-sans text-slate-900 pb-10">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 md:h-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-dark rounded-lg md:rounded-xl flex items-center justify-center">
              <span className="text-brand-accent font-black text-lg md:text-xl">N</span>
            </div>
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-brand-dark uppercase">
                NEWARK <span className="text-brand-primary hidden sm:inline">FRONTIERS</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsPinSetupOpen(true)} className="p-2 text-slate-400 hover:text-brand-primary transition-colors">
              <Lock size={18} />
            </button>
            <button onClick={logout} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold hover:text-red-600 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-10">
        <header className="mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tight italic">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-500 mt-1 text-base md:text-lg">Your financial frontier is expanding.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* MAIN BANNER */}
          <div className="lg:col-span-2 relative overflow-hidden bg-brand-dark rounded-3xl md:rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl">
            <div className="relative z-10">
              <span className="bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-primary/30">
                Limit Status
              </span>
              <h3 className="text-4xl md:text-5xl font-black mt-4 md:mt-6 leading-tight text-white">
                Current Limit <br/> 
                <span className="text-brand-primary">
                   KES {user?.creditLimit?.toLocaleString() || "5,000"}
                </span>
              </h3>
              <button onClick={() => setIsModalOpen(true)} className="mt-8 md:mt-10 w-full sm:w-auto bg-white text-brand-dark hover:bg-brand-accent font-black px-10 py-4 rounded-2xl transition-all shadow-xl">
                Apply for Loan
              </button>
            </div>
          </div>

          {/* SIDE STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-emerald-500">Active Debt</p>
              <h4 className="text-2xl md:text-3xl font-black text-brand-dark mt-1">KES {totalApproved.toLocaleString()}</h4>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Level</p>
                  <h4 className="text-brand-dark font-black text-sm uppercase">
                    Tier {Math.floor((user?.totalRepaidLoans || 0) / 3) + 1}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-emerald-500">Upgrade</p>
                  <p className="text-brand-primary font-black text-sm">+ KES 2,500</p>
                </div>
              </div>
              <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-brand-primary transition-all duration-1000" style={{ width: `${((user?.totalRepaidLoans || 0) % 3) / 3 * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- LOAN HISTORY SECTION (Responsive) --- */}
        <section className="mt-10">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Recent Transactions</h3>
          
          {/* DESKTOP TABLE (Hidden on Mobile) */}
          <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400">Principal</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400">Purpose</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400">Status</th>
                  <th className="p-5 text-right text-[10px] font-black uppercase text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                    <tr key={loan._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="p-5 font-bold text-brand-dark text-sm">KES {loan.amount.toLocaleString()}</td>
                        <td className="p-5 text-slate-500 text-sm italic">{loan.purpose}</td>
                        <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border 
                                ${loan.status === 'disbursed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                loan.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {loan.status}
                            </span>
                        </td>
                        <td className="p-5 text-right">
                        {(loan.status === 'approved' || loan.status === 'disbursed') ? (
                            <button 
                                onClick={() => handleRepayment(loan._id, loan.totalRepayable || loan.amount)} 
                                className="bg-brand-primary text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-brand-dark transition-all flex items-center gap-2 ml-auto shadow-md"
                            >
                                Clear Balance <ArrowRight size={12} />
                            </button>
                        ) : loan.status === 'paid' ? (
                            <span className="text-emerald-500 font-black text-[10px] uppercase flex items-center justify-end gap-1">
                                <CheckCircle size={12}/> Settled
                            </span>
                        ) : (
                            <span className="text-slate-300 text-[10px] uppercase font-bold tracking-widest italic">Awaiting Funds</span>
                        )}
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS (Hidden on Desktop) */}
          <div className="md:hidden space-y-4">
            {loans.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs italic">
                    No transactions yet.
                </div>
            ) : (
                loans.map((loan) => (
                    <div key={loan._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Amount Due</p>
                          <h4 className="text-lg font-black text-brand-dark">KES {loan.amount.toLocaleString()}</h4>
                          <p className="text-xs text-slate-500 italic mt-1">{loan.purpose}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border 
                          ${loan.status === 'disbursed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          loan.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {loan.status}
                        </span>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-50">
                        {(loan.status === 'approved' || loan.status === 'disbursed') ? (
                          <button 
                            onClick={() => handleRepayment(loan._id, loan.totalRepayable || loan.amount)} 
                            className="w-full bg-brand-primary text-white py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg"
                          >
                            Clear Balance <ArrowRight size={14} />
                          </button>
                        ) : loan.status === 'paid' ? (
                          <div className="flex items-center justify-center text-emerald-500 font-black text-xs uppercase gap-2">
                            <CheckCircle size={14}/> Successfully Settled
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-[10px] uppercase font-bold italic tracking-widest">
                            Application under review
                          </div>
                        )}
                      </div>
                    </div>
                ))
            )}
          </div>
        </section>
      </main>

      {/* --- PIN SETUP MODAL --- */}
      {isPinSetupOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-dark/95 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative border border-brand-primary/20">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-black text-brand-dark text-center mb-1">Set Security PIN</h3>
            <p className="text-slate-500 text-xs text-center mb-6">Required for all fund transfers.</p>
            <input 
              type="password" 
              maxLength="4"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center text-3xl tracking-[0.5em] font-black p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-primary outline-none transition-all mb-6"
              placeholder="****"
            />
            <button onClick={handleSetPin} disabled={newPin.length < 4} className="w-full bg-brand-dark text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest disabled:opacity-50 transition-all hover:bg-black">
              Confirm PIN
            </button>
          </div>
        </div>
      )}

      {/* --- REPAYMENT PIN MODAL --- */}
      {pinModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center border border-white/10">
            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black text-brand-dark mb-1">Confirm Payment</h3>
            <p className="text-slate-500 text-[10px] mb-6 font-bold uppercase tracking-widest text-brand-primary">Amount: KES {pinModal.amount?.toLocaleString()}</p>
            <input 
              type="password"
              maxLength="4"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center text-3xl tracking-[0.5em] font-black p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-primary outline-none transition-all mb-6"
              placeholder="****"
              autoFocus
            />
            <div className="flex gap-4">
              <button onClick={() => { setPinModal({ open: false }); setEnteredPin(""); }} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] hover:text-red-500 transition-colors">Cancel</button>
              <button onClick={submitRepayment} disabled={enteredPin.length < 4 || payLoading === pinModal.loanId} className="flex-1 bg-brand-primary text-white py-4 rounded-xl font-black uppercase text-[10px] shadow-lg hover:bg-brand-dark transition-all">
                {payLoading === pinModal.loanId ? "Processing..." : "Authorize"}
              </button>
            </div>
          </div>
        </div>
      )}

      <LoanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} refreshLoans={fetchLoans} />
    </div>
  );
};

export default Dashboard;