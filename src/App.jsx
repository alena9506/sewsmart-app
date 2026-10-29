import React, { useState, useEffect } from 'react';
import { db } from './firebase';
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
  Euro,
  User,
  Trash2,
  Check,
  Settings,
  Palette
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('intake');
  const [serviceType, setServiceType] = useState('alteration');
  
  // Theme state
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
  const [nextTagId, setNextTagId] = useState('ALT-' + Math.floor(7000 + Math.random() * 900));

  // Explicit theme styling configuration
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
      iconBox: 'bg-teal-600 text-white shadow-teal-600/20'
    },
    'indigo-dark': {
      isLight: false,
      appBg: 'bg-slate-900 text-slate-100',
      headerBg: 'bg-slate-900 border-slate-800 text-white',
      cardBg: 'bg-slate-800/80 border-slate-700/80 text-slate-100',
      innerInputBg: 'bg-slate-900 border-slate-700 text-white placeholder-slate-500',
      navToggleBg: 'bg-slate-800/80 border-slate-700/60 text-slate-300',
      subCardBg: 'bg-slate-800/40 text-slate-200',
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      primaryBadge: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
      textAccent: 'text-indigo-400',
      borderFocus: 'focus:border-indigo-500',
      buttonSelected: 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md',
      tabActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20',
      iconBox: 'bg-indigo-600 text-white shadow-indigo-500/20'
    },
    'indigo-light': {
      isLight: true,
      appBg: 'bg-slate-100 text-slate-900',
      headerBg: 'bg-white border-slate-200 text-slate-900 shadow-sm',
      cardBg: 'bg-white border-slate-200 text-slate-900 shadow-xl',
      innerInputBg: 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 font-medium',
      navToggleBg: 'bg-slate-200 border-slate-300 text-slate-800',
      subCardBg: 'bg-slate-100 text-slate-800',
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      primaryBadge: 'bg-indigo-100 border-indigo-300 text-indigo-800',
      textAccent: 'text-indigo-700',
      borderFocus: 'focus:border-indigo-600',
      buttonSelected: 'bg-indigo-100 border-indigo-500 text-indigo-900 shadow-sm font-bold',
      tabActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20',
      iconBox: 'bg-indigo-600 text-white shadow-teal-600/20'
    }
  };

  const t = themes[themeMode] || themes['teal-dark'];

  // Fetch orders from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  const ALT_OPTIONS = [
    { name: 'Trousers Hemming', price: 12.00 },
    { name: 'Zip Replacement (Jacket/Jeans)', price: 18.00 },
    { name: 'Waist Take-in / Let-out', price: 16.00 },
    { name: 'Dress Shortening / Hemming', price: 25.00 },
    { name: 'Sleeve Shortening (Jacket/Coat)', price: 22.00 },
    { name: 'Curtain Hemming (per metre)', price: 15.00 },
    { name: 'Patch / Mending', price: 8.00 }
  ];

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
      setNextTagId('ALT-' + Math.floor(7000 + Math.random() * 900));

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

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'In Progress').length;
  const readyCount = orders.filter(o => o.status === 'Ready for Pickup').length;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${t.appBg}`}>
      <header className={`border-b px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-md ${t.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl font-bold shadow-lg ${t.iconBox}`}>
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">SewSmart</h1>
              <span className={`font-semibold text-sm px-2 py-0.5 rounded-md border ${t.primaryBadge}`}>Dublin</span>
            </div>
            <p className="text-xs opacity-80 font-medium">Alterations & Service Laundry POS (Cloud Sync)</p>
          </div>
        </div>

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
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
          >
            <BarChart3 className="w-4 h-4" /> Reports
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
          >
            <Settings className="w-4 h-4" /> Settings
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
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${serviceType === 'alteration' ? `shadow-md border ${t.textAccent} border-opacity-30 ${t.isLight ? 'bg-white text-slate-900 font-extrabold' : 'bg-slate-950 text-white'}` : 'opacity-80 hover:opacity-100'}`}
                >
                  <Scissors className="w-4 h-4" /> Alteration Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('laundry')}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${serviceType === 'laundry' ? `shadow-md border ${t.textAccent} border-opacity-30 ${t.isLight ? 'bg-white text-slate-900 font-extrabold' : 'bg-slate-950 text-white'}` : 'opacity-80 hover:opacity-100'}`}
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
                        <option>Revolut</option>
                        <option>Other</option>
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
                          onChange={(e) => setGarmentType(e.target.value)}
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
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-3">Quick Select Presets:</label>
                        <div className="flex flex-wrap gap-2.5">
                          {ALT_OPTIONS.map((alt) => {
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
                        <p className="font-extrabold text-sm tracking-wide">SEWSMART DUBLIN</p>
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
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Clock className={`w-5 h-5 ${t.textAccent}`} /> Shop Orders & Tracking
              </h2>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 opacity-50" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search phone, name, tag..."
                    className={`w-full border rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`border rounded-2xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-opacity-30">
              <table className="w-full text-left text-xs">
                <thead className={`border-b opacity-90 font-bold ${t.subCardBg}`}>
                  <tr>
                    <th className="p-4">Tag ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-opacity-20">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 opacity-70">No orders found.</td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.docId} className="hover:opacity-100 transition-opacity">
                        <td className={`p-4 font-mono font-bold ${t.textAccent}`}>{order.id}</td>
                        <td className="p-4">
                          <div className="font-semibold">{order.customerName}</div>
                          <div className="opacity-75 text-[11px]">{order.phone}</div>
                        </td>
                        <td className="p-4 capitalize">
                          <span className={`px-2.5 py-1 rounded-lg border border-opacity-30 font-medium ${t.subCardBg}`}>{order.serviceType}</span>
                        </td>
                        <td className="p-4 opacity-90">{order.dueDate}</td>
                        <td className={`p-4 font-bold ${t.textAccent}`}>€{order.total.toFixed(2)}</td>
                        <td className="p-4">
                          <select 
                            value={order.status}
                            onChange={(e) => updateStatus(order.docId, e.target.value)}
                            className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => setSelectedOrderForPrint(order)}
                            className={`p-1.5 rounded-lg border border-opacity-30 ${t.textAccent} ${t.subCardBg}`}
                            title="Preview Print"
                          >
                            <Printer className="w-4 h-4 inline" />
                          </button>
                          <button 
                            onClick={() => deleteOrder(order.docId)}
                            className="text-rose-500 hover:text-rose-400 p-1.5 rounded-lg border border-opacity-30"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold flex items-center gap-2">
              <BarChart3 className={`w-5 h-5 ${t.textAccent}`} /> Executive Summary & Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`border rounded-3xl p-6 shadow-xl ${t.cardBg}`}>
                <p className="text-xs opacity-80 font-semibold uppercase tracking-wider">Total Collected Revenue</p>
                <p className={`text-3xl font-extrabold mt-2 ${t.textAccent}`}>€{totalRevenue.toFixed(2)}</p>
              </div>
              <div className={`border rounded-3xl p-6 shadow-xl ${t.cardBg}`}>
                <p className="text-xs opacity-80 font-semibold uppercase tracking-wider">Pending / In Progress Orders</p>
                <p className="text-3xl font-extrabold text-amber-500 mt-2">{pendingCount}</p>
              </div>
              <div className={`border rounded-3xl p-6 shadow-xl ${t.cardBg}`}>
                <p className="text-xs opacity-80 font-semibold uppercase tracking-wider">Ready For Pickup</p>
                <p className="text-3xl font-extrabold text-emerald-500 mt-2">{readyCount}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`border rounded-3xl p-8 shadow-2xl space-y-6 max-w-2xl mx-auto ${t.cardBg}`}>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Palette className={`w-5 h-5 ${t.textAccent}`} /> Theme & Display Settings
            </h2>
            <p className="text-xs opacity-80 font-medium">Choose between crisp light and dark daytime/nighttime modes for your store counter display.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                type="button"
                onClick={() => setThemeMode('teal-dark')}
                className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${themeMode === 'teal-dark' ? 'bg-teal-500/20 border-teal-500 shadow-lg font-bold' : 'opacity-80 hover:opacity-100 border-opacity-35'}`}
              >
                <div className="w-8 h-8 rounded-full bg-teal-500 shadow-md shrink-0"></div>
                <div className="text-left">
                  <p className="text-xs font-bold">Teal Dark Mode</p>
                  <p className="text-[10px] opacity-70">Classic Dublin storefront dark theme</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('teal-light')}
                className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${themeMode === 'teal-light' ? 'bg-teal-100 border-teal-500 text-slate-900 shadow-lg font-bold' : 'opacity-80 hover:opacity-100 border-opacity-35'}`}
              >
                <div className="w-8 h-8 rounded-full bg-teal-600 shadow-md shrink-0"></div>
                <div className="text-left">
                  <p className="text-xs font-bold">Teal Light Mode</p>
                  <p className="text-[10px] opacity-70">Bright and crisp daytime look</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('indigo-dark')}
                className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${themeMode === 'indigo-dark' ? 'bg-indigo-500/20 border-indigo-500 shadow-lg font-bold' : 'opacity-80 hover:opacity-100 border-opacity-35'}`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 shadow-md shrink-0"></div>
                <div className="text-left">
                  <p className="text-xs font-bold">Indigo Dark Mode</p>
                  <p className="text-[10px] opacity-70">Sleek midnight blue style</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('indigo-light')}
                className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${themeMode === 'indigo-light' ? 'bg-indigo-100 border-indigo-500 text-slate-900 shadow-lg font-bold' : 'opacity-80 hover:opacity-100 border-opacity-35'}`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 shadow-md shrink-0"></div>
                <div className="text-left">
                  <p className="text-xs font-bold">Indigo Light Mode</p>
                  <p className="text-[10px] opacity-70">Clean professional light theme</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}