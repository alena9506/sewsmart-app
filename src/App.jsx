import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  Scissors, 
  Shirt, 
  PlusCircle, 
  Search, 
  Printer, 
  BarChart3, 
  Clock, 
  User,
  Trash2,
  Check,
  Settings,
  Palette,
  LogOut
} from 'lucide-react';
import logoImg from './logo.png';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('intake');
  const [serviceType, setServiceType] = useState('alteration');
  
  const [themeMode, setThemeMode] = useState('teal-dark');

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit / Debit Card');

  const [garmentType, setGarmentType] = useState('Trousers / Jeans');
  const [selectedAlterations, setSelectedAlterations] = useState([]);
  const [customAlteration, setCustomAlteration] = useState('');
  const [alterationPrice, setAlterationPrice] = useState('');

  const [laundryService, setLaundryService] = useState('Wash, Dry & Fold (Per Kg)');
  const [weightKg, setWeightKg] = useState('');
  const [laundryPrice, setLaundryPrice] = useState('');

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);
  const [nextTagId, setNextTagId] = useState('ALICOW-' + Math.floor(7000 + Math.random() * 900));

  const isAdmin = user && user.email === 'alena9506@gmail.com';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    });
    return () => unsubscribeOrders();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error) {
      setLoginError('Invalid email or password. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const themes = {
    'teal-dark': {
      isLight: false,
      appBg: 'bg-slate-900 text-slate-100',
      headerBg: 'bg-slate-900 border-slate-800 text-white',
      cardBg: 'bg-slate-800/80 border-slate-700/80 text-slate-100',
      innerInputBg: 'bg-slate-900 border-slate-700 text-white placeholder-slate-500',
      navToggleBg: 'bg-slate-800/80 border-slate-700/60 text-slate-300',
      subCardBg: 'bg-slate-800/40 text-slate-200',
      primary: 'bg-teal-500 hover:bg-teal-400 text-slate-950',
      primaryBadge: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
      textAccent: 'text-teal-400',
      borderFocus: 'focus:border-teal-500',
      buttonSelected: 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md',
      tabActive: 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20',
      serviceActive: 'bg-teal-500 text-slate-950 shadow-md font-extrabold',
      iconBox: 'bg-teal-500 text-slate-950 shadow-teal-500/20'
    },
    'teal-light': {
      isLight: true,
      appBg: 'bg-slate-100 text-slate-900',
      headerBg: 'bg-white border-slate-200 text-slate-900 shadow-sm',
      cardBg: 'bg-white border-slate-200 text-slate-900 shadow-xl',
      innerInputBg: 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 font-medium',
      navToggleBg: 'bg-slate-200 border-slate-300 text-slate-800',
      subCardBg: 'bg-slate-100 text-slate-800',
      primary: 'bg-teal-600 hover:bg-teal-500 text-white',
      primaryBadge: 'bg-teal-100 border-teal-300 text-teal-800',
      textAccent: 'text-teal-700',
      borderFocus: 'focus:border-teal-600',
      buttonSelected: 'bg-teal-100 border-teal-500 text-teal-900 shadow-sm font-bold',
      tabActive: 'bg-teal-600 text-white shadow-md shadow-teal-600/20',
      serviceActive: 'bg-teal-600 text-white shadow-md font-extrabold',
      iconBox: 'bg-teal-600 text-white shadow-teal-600/20'
    }
  };

  const t = themes[themeMode] || themes['teal-dark'];

  // Comprehensive garment-specific alterations including zip runner replacements
  const GARMENT_ALTERATIONS = {
    'Trousers / Jeans': [
      { name: 'Standard Hemming', price: 12.00 },
      { name: 'Original Hemming (Keep Fade)', price: 15.00 },
      { name: 'Waist Take-in / Let-out', price: 16.00 },
      { name: 'Full Zip Replacement', price: 18.00 },
      { name: 'Zip Runner / Slider Replacement', price: 8.00 },
      { name: 'Taper Legs', price: 18.00 },
      { name: 'Patch / Mending', price: 8.00 },
      { name: 'New Button / Hook & Bar', price: 5.00 }
    ],
    'Suit Jacket / Blazer': [
      { name: 'Sleeve Shortening (Plain)', price: 22.00 },
      { name: 'Sleeve Shortening (Working Cuffs)', price: 35.00 },
      { name: 'Take in Side Seams', price: 28.00 },
      { name: 'Shorten Length from Bottom', price: 30.00 },
      { name: 'Replace Lining', price: 65.00 },
      { name: 'Shoulder Adjustment', price: 45.00 }
    ],
    'Dress / Formal Wear': [
      { name: 'Hem Shortening (Single Layer)', price: 25.00 },
      { name: 'Hem Shortening (Multi-Layer / Pleated)', price: 40.00 },
      { name: 'Take in Side Seams', price: 25.00 },
      { name: 'Strap Adjustment', price: 15.00 },
      { name: 'Full Zip Replacement', price: 22.00 },
      { name: 'Zip Runner / Slider Replacement', price: 10.00 },
      { name: 'Add Darts for Fit', price: 18.00 }
    ],
    'Skirt': [
      { name: 'Hem Shortening', price: 18.00 },
      { name: 'Waist Take-in / Let-out', price: 16.00 },
      { name: 'Full Zip Replacement', price: 18.00 },
      { name: 'Zip Runner / Slider Replacement', price: 8.00 }
    ],
    'Shirt / Blouse': [
      { name: 'Sleeve Shortening', price: 18.00 },
      { name: 'Take in Side Seams (Slim fit)', price: 16.00 },
      { name: 'Shorten Shirt Length', price: 15.00 },
      { name: 'Add Back Darts', price: 12.00 }
    ],
    'Coat / Jacket': [
      { name: 'Sleeve Shortening', price: 25.00 },
      { name: 'Full Zip Replacement (Heavy Duty)', price: 28.00 },
      { name: 'Zip Runner / Slider Replacement', price: 12.00 },
      { name: 'Replace Buttons / Snaps', price: 10.00 },
      { name: 'Patch / Mending / Tear Repair', price: 15.00 }
    ],
    'Curtains / Home Textiles': [
      { name: 'Hemming per metre', price: 15.00 },
      { name: 'Alter Width per metre', price: 18.00 },
      { name: 'Re-taping Header', price: 22.00 },
      { name: 'Cushion Cover Zip Replacement', price: 12.00 }
    ]
  };

  const currentGarmentOptions = GARMENT_ALTERATIONS[garmentType] || [];

  const handleGarmentChange = (newGarment) => {
    setGarmentType(newGarment);
    setSelectedAlterations([]);
    setAlterationPrice('');
  };

  const toggleAlteration = (alt) => {
    if (selectedAlterations.includes(alt.name)) {
      setSelectedAlterations(selectedAlterations.filter(item => item !== alt.name));
      setAlterationPrice(prev => Math.max(0, Number(prev) - alt.price).toFixed(2));
    } else {
      setSelectedAlterations([...selectedAlterations, alt.name]);
      setAlterationPrice(prev => (Number(prev || 0) + alt.price).toFixed(2));
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!phone) {
      alert('Please enter a customer phone number.');
      return;
    }

    const total = serviceType === 'alteration' ? Number(alterationPrice) : Number(laundryPrice);
    if (!total || total <= 0) {
      alert('Please specify a valid price.');
      return;
    }

    const newOrder = {
      id: nextTagId,
      createdAt: new Date().toISOString(),
      serviceType,
      customerName: customerName.trim() || 'Valued Customer',
      phone,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      notes,
      paymentMethod,
      total,
      status: 'Pending',
      details: serviceType === 'alteration' ? {
        garmentType,
        alterations: selectedAlterations,
        customAlteration
      } : {
        laundryService,
        weightKg
      }
    };

    try {
      await addDoc(collection(db, 'orders'), newOrder);
      setSelectedOrderForPrint(newOrder);
      setNextTagId('ALICOW-' + Math.floor(7000 + Math.random() * 900));

      setCustomerName('');
      setPhone('');
      setNotes('');
      setSelectedAlterations([]);
      setAlterationPrice('');
      setWeightKg('');
      setLaundryPrice('');
      alert('Ticket created and synced to cloud database!');
    } catch (error) {
      console.error('Error adding order: ', error);
      alert('Failed to save order to cloud.');
    }
  };

  const updateStatus = async (docId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', docId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error('Error updating status: ', error);
    }
  };

  const deleteOrder = async (docId) => {
    if (!isAdmin) {
      alert('Permission denied. Only Admin can delete orders.');
      return;
    }
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'orders', docId));
      } catch (error) {
        console.error('Error deleting order: ', error);
      }
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.phone.includes(searchTerm) || o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(o => o.createdAt.startsWith(todayStr));
  const todaysRevenue = todaysOrders.reduce((acc, o) => acc + o.total, 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
        <p className="text-sm font-medium animate-pulse">Loading ALiCo POS...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-24 h-14 mx-auto flex items-center justify-center">
              <img src={logoImg} alt="ALiCo Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ALiCo</h1>
            <p className="text-xs text-slate-400">Sign in to your counter POS terminal</p>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
              <input 
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. alena9506@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Password</label>
              <input 
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20"
            >
              Sign In to Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${t.appBg}`}>
      <header className={`border-b px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-md ${t.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 flex items-center justify-center">
            <img src={logoImg} alt="ALiCo Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">ALiCo</h1>
              <span className={`font-semibold text-sm px-2 py-0.5 rounded-md border ${t.primaryBadge}`}>Dublin</span>
              <span className="text-[10px] opacity-70 ml-2 font-mono">({user.email} - {isAdmin ? 'Admin' : 'Employee'})</span>
            </div>
            <p className="text-xs opacity-80 font-medium">Alterations & Service Laundry POS (Cloud Sync)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex p-1.5 rounded-2xl border shadow-inner ${t.navToggleBg}`}>
            <button 
              onClick={() => setActiveTab('intake')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'intake' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
            >
              <PlusCircle className="w-4 h-4" /> New Ticket
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
            >
              <Clock className="w-4 h-4" /> Orders <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${t.textAccent}`}>{orders.length}</span>
            </button>
            
            {isAdmin && (
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
              >
                <BarChart3 className="w-4 h-4" /> Reports
              </button>
            )}

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold flex items-center gap-1.5"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === 'intake' && (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className={`p-1.5 rounded-2xl border flex gap-2 shadow-lg ${t.headerBg}`}>
                <button
                  type="button"
                  onClick={() => setServiceType('alteration')}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm transition-all ${serviceType === 'alteration' ? t.serviceActive : 'opacity-75 hover:opacity-100'}`}
                >
                  <Scissors className="w-4 h-4" /> Alteration Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('laundry')}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm transition-all ${serviceType === 'laundry' ? t.serviceActive : 'opacity-75 hover:opacity-100'}`}
                >
                  <Shirt className="w-4 h-4" /> Laundry Ticket
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`lg:col-span-2 border rounded-3xl p-8 shadow-2xl backdrop-blur-sm space-y-8 ${t.cardBg}`}>
                <div className="flex justify-between items-center pb-4 border-b border-opacity-30">
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <User className={`w-5 h-5 ${t.textAccent}`} /> Customer & Payment Details
                  </h2>
                  <span className={`font-mono text-xs px-3 py-1 rounded-full font-semibold border ${t.primaryBadge}`}>
                    TAG: {nextTagId}
                  </span>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Customer Name</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Siobhán O'Connor"
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 087 123 4567"
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Target Ready Date</label>
                      <input 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Upfront Payment Method</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      >
                        <option>Credit / Debit Card</option>
                        <option>Cash</option>
                      </select>
                    </div>
                  </div>

                  {serviceType === 'alteration' ? (
                    <div className="space-y-6 pt-4 border-t border-opacity-30">
                      <div className="flex justify-between items-center">
                        <h2 className="text-base font-bold flex items-center gap-2">
                          <Scissors className={`w-5 h-5 ${t.textAccent}`} /> Garments & Alteration Items
                        </h2>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Garment Type</label>
                        <select 
                          value={garmentType} 
                          onChange={(e) => handleGarmentChange(e.target.value)}
                          className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                        >
                          <option>Trousers / Jeans</option>
                          <option>Suit Jacket / Blazer</option>
                          <option>Dress / Formal Wear</option>
                          <option>Skirt</option>
                          <option>Shirt / Blouse</option>
                          <option>Coat / Jacket</option>
                          <option>Curtains / Home Textiles</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-3">
                          Fix Options for {garmentType}:
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {currentGarmentOptions.map((alt) => {
                            const isSelected = selectedAlterations.includes(alt.name);
                            return (
                              <button
                                type="button"
                                key={alt.name}
                                onClick={() => toggleAlteration(alt)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${isSelected ? t.buttonSelected : `${t.isLight ? 'bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'}`}`}
                              >
                                {isSelected && <Check className={`w-3.5 h-3.5 ${t.textAccent}`} />}
                                + {alt.name} (€{alt.price.toFixed(2)})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Custom Notes / Pinning Instructions</label>
                        <input 
                          type="text"
                          value={customAlteration}
                          onChange={(e) => setCustomAlteration(e.target.value)}
                          placeholder="e.g. Take up by 2 inches, keep original hem"
                          className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 pt-4 border-t border-opacity-30">
                      <h2 className="text-base font-bold flex items-center gap-2">
                        <Shirt className={`w-5 h-5 ${t.textAccent}`} /> Laundry & Dry Cleaning Services
                      </h2>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Service Type</label>
                        <select 
                          value={laundryService} 
                          onChange={(e) => setLaundryService(e.target.value)}
                          className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                        >
                          <option>Wash, Dry & Fold (Per Kg)</option>
                          <option>Dry Cleaning</option>
                          <option>Duvet / Heavy Bedding</option>
                          <option>Ironing Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Weight / Bag Quantity</label>
                        <input 
                          type="text"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          placeholder="e.g. 5.5 kg or 2 bags"
                          className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-opacity-30 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="w-full md:w-1/2">
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Total Price (€) *</label>
                      <input 
                        type="number" 
                        step="0.50"
                        required
                        value={serviceType === 'alteration' ? alterationPrice : laundryPrice}
                        onChange={(e) => serviceType === 'alteration' ? setAlterationPrice(e.target.value) : setLaundryPrice(e.target.value)}
                        placeholder="0.00"
                        className={`w-full border rounded-2xl px-4 py-3 text-lg font-extrabold ${t.textAccent} focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>

                    <div className="w-full md:w-1/2 self-end">
                      <button 
                        type="submit"
                        className={`w-full font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${t.primary}`}
                      >
                        <Printer className="w-5 h-5" /> Complete Intake & Print 3 Receipts
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className={`border rounded-3xl p-6 shadow-2xl backdrop-blur-sm flex flex-col justify-between ${t.cardBg}`}>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Printer className={`w-4 h-4 ${t.textAccent}`} /> Thermal Print Preview
                  </h3>
                  {selectedOrderForPrint ? (
                    <div className="bg-white text-slate-900 p-5 rounded-2xl font-mono text-xs shadow-inner space-y-3">
                      <div className="text-center border-b border-dashed pb-3">
                        <p className="font-extrabold text-sm tracking-wide">ALiCo DUBLIN</p>
                        <p className="text-[10px] text-slate-600">Artaine Castle Shopping Centre</p>
                        <p className={`text-xs font-bold mt-1.5 px-2 py-0.5 bg-slate-100 inline-block rounded ${t.textAccent}`}>
                          {selectedOrderForPrint.id}
                        </p>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <p><strong>Customer:</strong> {selectedOrderForPrint.customerName}</p>
                        <p><strong>Phone:</strong> {selectedOrderForPrint.phone}</p>
                        <p><strong>Service:</strong> {selectedOrderForPrint.serviceType.toUpperCase()}</p>
                        {selectedOrderForPrint.serviceType === 'alteration' ? (
                          <>
                            <p><strong>Garment:</strong> {selectedOrderForPrint.details.garmentType}</p>
                            <p><strong>Tasks:</strong> {selectedOrderForPrint.details.alterations.join(', ')}</p>
                            {selectedOrderForPrint.details.customAlteration && <p><strong>Note:</strong> {selectedOrderForPrint.details.customAlteration}</p>}
                          </>
                        ) : (
                          <>
                            <p><strong>Type:</strong> {selectedOrderForPrint.details.laundryService}</p>
                            {selectedOrderForPrint.details.weightKg && <p><strong>Qty/Wt:</strong> {selectedOrderForPrint.details.weightKg}</p>}
                          </>
                        )}
                      </div>
                      <div className="border-t border-dashed pt-3 flex justify-between font-bold text-xs">
                        <span>PAID ({selectedOrderForPrint.paymentMethod}):</span>
                        <span className={t.textAccent}>€{selectedOrderForPrint.total.toFixed(2)}</span>
                      </div>
                      <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-dashed">
                        <p>Due: {selectedOrderForPrint.dueDate}</p>
                        <p className="font-bold text-slate-800 mt-1">*** PAID IN FULL ***</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-16 opacity-70 border border-dashed rounded-2xl ${t.subCardBg}`}>
                      <Printer className="w-8 h-8 mx-auto mb-3 opacity-60" />
                      <p className="text-xs">Submit an intake ticket to generate printable thermal claim check receipts.</p>
                    </div>
                  )}
                </div>

                {selectedOrderForPrint && (
                  <button 
                    onClick={() => window.print()}
                    className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Printer className="w-4 h-4" /> Print Receipts Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className={`border rounded-3xl p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-lg font-bold">Active Orders & Ticket History</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 opacity-50" />
                  <input 
                    type="text"
                    placeholder="Search name, phone, tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-9 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs border focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs uppercase opacity-70 ${t.isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                    <th className="py-3 px-4">Tag ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Ready Date</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30 text-xs">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 opacity-60">No orders found matching your search.</td>
                    </tr>
                  ) : (
                    filteredOrders.map(o => (
                      <tr key={o.docId} className="hover:bg-slate-500/5 transition-colors">
                        <td className={`py-4 px-4 font-mono font-bold ${t.textAccent}`}>{o.id}</td>
                        <td className="py-4 px-4 font-semibold">{o.customerName}</td>
                        <td className="py-4 px-4 font-mono">{o.phone}</td>
                        <td className="py-4 px-4 uppercase font-medium">{o.serviceType}</td>
                        <td className="py-4 px-4">{o.dueDate}</td>
                        <td className="py-4 px-4 font-bold">€{o.total.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <select
                            value={o.status}
                            onChange={(e) => updateStatus(o.docId, e.target.value)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${t.innerInputBg}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedOrderForPrint(o)}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                          >
                            Print
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteOrder(o.docId)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && isAdmin && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border shadow-xl ${t.cardBg}`}>
                <p className="text-xs uppercase tracking-wider opacity-70 mb-1 font-semibold">Today's Revenue</p>
                <h3 className={`text-3xl font-extrabold ${t.textAccent}`}>€{todaysRevenue.toFixed(2)}</h3>
                <p className="text-xs opacity-60 mt-2">{todaysOrders.length} tickets created today</p>
              </div>
              <div className={`p-6 rounded-3xl border shadow-xl ${t.cardBg}`}>
                <p className="text-xs uppercase tracking-wider opacity-70 mb-1 font-semibold">Total Revenue (All Time)</p>
                <h3 className={`text-3xl font-extrabold ${t.textAccent}`}>€{totalRevenue.toFixed(2)}</h3>
                <p className="text-xs opacity-60 mt-2">{orders.length} total orders recorded</p>
              </div>
              <div className={`p-6 rounded-3xl border shadow-xl ${t.cardBg}`}>
                <p className="text-xs uppercase tracking-wider opacity-70 mb-1 font-semibold">Pending / Active Work</p>
                <h3 className={`text-3xl font-extrabold ${t.textAccent}`}>{orders.filter(o => o.status !== 'Completed').length}</h3>
                <p className="text-xs opacity-60 mt-2">Orders currently in progress or ready</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`border rounded-3xl p-8 shadow-2xl space-y-6 max-w-xl mx-auto w-full ${t.cardBg}`}>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Palette className={`w-5 h-5 ${t.textAccent}`} /> Appearance & Theme Settings
            </h2>
            <p className="text-xs opacity-75">Choose your preferred counter display theme for day or night shifts:</p>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => setThemeMode('teal-dark')}
                className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${themeMode === 'teal-dark' ? 'border-teal-500 bg-teal-500/10 shadow-md' : 'border-slate-700 bg-slate-900'}`}
              >
                <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                <p className="text-xs font-bold text-white">Teal Dark (Default)</p>
              </button>

              <button
                onClick={() => setThemeMode('teal-light')}
                className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${themeMode === 'teal-light' ? 'border-teal-600 bg-teal-100 text-slate-900 shadow-md' : 'border-slate-300 bg-white text-slate-900'}`}
              >
                <div className="w-6 h-6 rounded-full bg-teal-600"></div>
                <p className="text-xs font-bold">Teal Light (Day Mode)</p>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
