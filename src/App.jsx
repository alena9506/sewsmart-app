import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot 
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
  Bot,
  X,
  Send,
  Sparkles,
  DollarSign
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('intake');
  const [serviceType, setServiceType] = useState('alteration');
  
  // Customer & Order Info
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit / Debit Card');

  // Multi-Garment Cart state for Alterations
  const [garmentType, setGarmentType] = useState('Trousers / Jeans');
  const [selectedAlterations, setSelectedAlterations] = useState([]);
  const [itemPrice, setItemPrice] = useState('');
  const [cartItems, setCartItems] = useState([]);

  // Laundry specific state
  const [laundryService, setLaundryService] = useState('Wash, Dry & Fold (Per Kg)');
  const [weightKg, setWeightKg] = useState('');
  const [laundryPrice, setLaundryPrice] = useState('');

  // Persistent Orders Database from Firestore
  const [orders, setOrders] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);
  const [nextTagId, setNextTagId] = useState(() => Math.floor(7000 + Math.random() * 900).toString());

  // AI Assistant Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "Hello! I am your AI shop assistant connected to your live database. Ask me anything like 'Were there any orders today?', 'What is our revenue?', or 'Show pending tickets'." }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Firebase Auth Observer
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    const timer = setTimeout(() => setAuthLoading(false), 1500);
    return () => {
      unsubscribeAuth();
      clearTimeout(timer);
    };
  }, []);

  // Firebase Real-time Orders Sync
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
      setItemPrice(prev => Math.max(0, Number(prev) - alt.price).toFixed(2));
    } else {
      setSelectedAlterations([...selectedAlterations, alt.name]);
      setItemPrice(prev => (Number(prev || 0) + alt.price).toFixed(2));
    }
  };

  const handleAddGarmentToCart = () => {
    const priceVal = Number(itemPrice);
    if (!priceVal || priceVal <= 0) {
      alert('Please specify a valid price for this garment.');
      return;
    }
    const newItem = {
      garmentType,
      alterations: [...selectedAlterations],
      price: priceVal
    };
    setCartItems([...cartItems, newItem]);
    setSelectedAlterations([]);
    setItemPrice('');
  };

  const removeCartItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

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

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!phone) {
      alert('Please enter a customer phone number.');
      return;
    }

    let orderDetails = {};
    let total = 0;

    if (serviceType === 'alteration') {
      if (cartItems.length === 0) {
        alert('Please add at least one garment to the ticket cart.');
        return;
      }
      total = cartItems.reduce((acc, item) => acc + item.price, 0);
      orderDetails = { items: cartItems };
    } else {
      total = Number(laundryPrice);
      if (!total || total <= 0) {
        alert('Please specify a valid laundry price.');
        return;
      }
      orderDetails = { laundryService, weightKg };
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
      details: orderDetails
    };

    try {
      await addDoc(collection(db, 'orders'), newOrder);
      setSelectedOrderForPrint(newOrder);
      setNextTagId(Math.floor(7000 + Math.random() * 900).toString());

      // Reset form
      setCustomerName('');
      setPhone('');
      setNotes('');
      setCartItems([]);
      setLaundryPrice('');
      setWeightKg('');
      alert('Ticket created successfully and synced to Firebase cloud!');
    } catch (error) {
      console.error('Error adding order to Firestore:', error);
      alert('Failed to save order to cloud database.');
    }
  };

  const updateStatus = async (docId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', docId), { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteOrder = async (docId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'orders', docId));
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  // AI Assistant Live Database Query Engine
  const handleAiQuery = (queryText) => {
    const q = queryText.toLowerCase();
    let reply = "";

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt?.startsWith(todayStr));
    const totalRev = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'In Progress');

    if (q.includes('today') || q.includes('order today') || q.includes('orders today')) {
      reply = `You have ${todayOrders.length} order(s) placed today. Total value: €${todayOrders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2)}.`;
    } else if (q.includes('revenue') || q.includes('sales') || q.includes('money') || q.includes('total')) {
      reply = `Total accumulated revenue across all ${orders.length} recorded orders is €${totalRev.toFixed(2)}.`;
    } else if (q.includes('pending') || q.includes('progress') || q.includes('active')) {
      reply = `There are currently ${pendingOrders.length} active/pending orders in the workshop queue.`;
    } else if (q.includes('customer') || q.includes('search')) {
      const match = orders.find(o => (o.customerName && q.includes(o.customerName.toLowerCase())) || q.includes(o.phone));
      if (match) {
        reply = `Found order #${match.id} for ${match.customerName} (${match.phone}) - Status: ${match.status}, Total: €${match.total.toFixed(2)}.`;
      } else {
        reply = `I searched your live Firestore records but couldn't find a matching customer name or phone number.`;
      }
    } else {
      reply = `I inspected your live database of ${orders.length} orders. You can ask me about today's orders, revenue totals, pending tickets, or specific customer names!`;
    }

    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: queryText },
      { sender: 'ai', text: reply }
    ]);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.phone && o.phone.includes(searchTerm)) || (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase())) || (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'In Progress').length;
  const readyCount = orders.filter(o => o.status === 'Ready for Pickup').length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
        <p className="text-sm font-medium animate-pulse">Loading SewSmart POS...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-bold">
              <Scissors className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SewSmart Terminal</h1>
            <p className="text-xs text-slate-400">Sign in to sync with cloud database</p>
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
                placeholder="e.g. alena@sewsmart.ie"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg"
            >
              Sign In to Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-slate-950 font-bold">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">SewSmart Alterations & Laundry</h1>
            <p className="text-xs text-slate-400">Cloud-Synced Tablet POS & Workshop Hub</p>
          </div>
        </div>

        {/* Navigation Tabs & Logout */}
        <div className="flex items-center space-x-4">
          <nav className="flex space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('intake')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'intake' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Ticket</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'orders' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Order Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </nav>

          <button 
            onClick={handleLogout}
            className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'intake' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Intake Form */}
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <Scissors className="w-5 h-5 text-emerald-400" />
                  <span>Service Intake & Ticket Generation</span>
                </h2>
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setServiceType('alteration')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      serviceType === 'alteration' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Alterations
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceType('laundry')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      serviceType === 'laundry' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Laundry Service
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-6">
                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Customer Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Siobhán O'Connor"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+353 85 000 0000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Service Specific Section */}
                {serviceType === 'alteration' ? (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                      <Scissors className="w-4 h-4" />
                      <span>Multi-Garment Alteration Builder</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Garment Type</label>
                        <select
                          value={garmentType}
                          onChange={(e) => setGarmentType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option>Trousers / Jeans</option>
                          <option>Jacket / Coat</option>
                          <option>Dress / Formal Wear</option>
                          <option>Shirt / Blouse</option>
                          <option>Skirt</option>
                          <option>Curtains / Home Textiles</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Item Price (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={itemPrice}
                          onChange={(e) => setItemPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Specific Alterations & Presets</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {ALT_OPTIONS.map((alt) => {
                          const isSelected = selectedAlterations.includes(alt.name);
                          return (
                            <button
                              type="button"
                              key={alt.name}
                              onClick={() => toggleAlteration(alt)}
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                                isSelected ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                              }`}
                            >
                              <span className="font-medium">{alt.name}</span>
                              <span className="text-emerald-400 font-semibold mt-1">€{alt.price.toFixed(2)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddGarmentToCart}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 border border-slate-600"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      <span>Add Garment to Ticket Cart</span>
                    </button>

                    {/* Cart List */}
                    {cartItems.length > 0 && (
                      <div className="mt-4 border-t border-slate-700 pt-4 space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items on This Ticket ({cartItems.length})</h4>
                        {cartItems.map((ci, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 text-sm">
                            <div>
                              <span className="font-semibold text-white">{ci.garmentType}</span>
                              <p className="text-xs text-slate-400">{ci.alterations.join(', ') || 'Custom alteration'}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-bold text-emerald-400">€{ci.price.toFixed(2)}</span>
                              <button type="button" onClick={() => removeCartItem(idx)} className="text-red-400 hover:text-red-300">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                      <Shirt className="w-4 h-4" />
                      <span>Laundry Intake Details</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Service Type</label>
                        <select
                          value={laundryService}
                          onChange={(e) => setLaundryService(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option>Wash, Dry & Fold (Per Kg)</option>
                          <option>Dry Cleaning (Suit / Coat)</option>
                          <option>Duvet & Comforter Cleaning</option>
                          <option>Ironing Only Service</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Weight / Quantity</label>
                        <input
                          type="text"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          placeholder="e.g. 5.5 kg or 2 bags"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Total Price (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={laundryPrice}
                        onChange={(e) => setLaundryPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Due Date & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Completion Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option>Credit / Debit Card</option>
                      <option>Cash</option>
                      <option>Account / Pre-paid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Special Workshop Notes</label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Pin fitting instructions, stain warnings..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Printer className="w-5 h-5" />
                  <span>Save Order to Cloud & Generate 3 Thermal Receipts</span>
                </button>
              </form>
            </div>

            {/* Right Col: Live Receipt Preview */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center space-x-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Thermal Receipt Preview (#{nextTagId})</span>
              </h3>

              <div className="flex-1 bg-white text-slate-950 p-4 rounded-xl font-mono text-xs shadow-inner overflow-y-auto space-y-4 max-h-[500px]">
                <div className="text-center border-b border-dashed border-slate-300 pb-3">
                  <h4 className="font-bold text-sm">SEWSMART DUBLIN</h4>
                  <p className="text-[10px] text-slate-500">Professional Tailoring & Laundry</p>
                  <p className="text-[10px] text-slate-500">Ticket: #{nextTagId}</p>
                </div>
                
                <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
                  <p><span className="font-bold">Customer:</span> {customerName || 'Valued Customer'}</p>
                  <p><span className="font-bold">Phone:</span> {phone || 'N/A'}</p>
                  <p><span className="font-bold">Due Date:</span> {dueDate}</p>
                </div>

                <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
                  <p className="font-bold">ITEMS / SERVICES:</p>
                  {serviceType === 'alteration' ? (
                    cartItems.length > 0 ? (
                      cartItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.garmentType}</span>
                          <span>€{item.price.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic">No items added to cart yet...</p>
                    )
                  ) : (
                    <div className="flex justify-between">
                      <span>{laundryService} ({weightKg || 'Standard'})</span>
                      <span>€{laundryPrice || '0.00'}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>TOTAL:</span>
                  <span>€{serviceType === 'alteration' ? cartItems.reduce((s, i) => s + i.price, 0).toFixed(2) : (Number(laundryPrice) || 0).toFixed(2)}</span>
                </div>

                <div className="text-center text-[10px] text-slate-500 pt-4 border-t border-dashed border-slate-300">
                  <p>Copy 1: Customer Claim Check</p>
                  <p>Copy 2: Garment Tag</p>
                  <p>Copy 3: Shop Audit Slip</p>
                  <p className="mt-2 font-bold">Thank you for your business!</p>
                </div>
              </div>

              {selectedOrderForPrint && (
                <button
                  onClick={() => window.print()}
                  className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 border border-slate-600"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print 3-Copy Thermal Receipt</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by phone, name, or ticket ID..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto">
                {['All', 'Pending', 'In Progress', 'Ready for Pickup', 'Completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === status ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-3.5">Ticket ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.docId} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-emerald-400">#{order.id}</td>
                        <td className="p-3.5 font-medium text-white">{order.customerName}</td>
                        <td className="p-3.5 text-slate-300">{order.phone}</td>
                        <td className="p-3.5 text-slate-300">{order.dueDate}</td>
                        <td className="p-3.5 font-bold text-emerald-400">€{(order.total || 0).toFixed(2)}</td>
                        <td className="p-3.5">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.docId, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                          >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Ready for Pickup</option>
                            <option>Completed</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => { setSelectedOrderForPrint(order); window.print(); }}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors inline-block"
                            title="Print Thermal Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteOrder(order.docId)}
                            className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors inline-block"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-500">No matching orders found in cloud.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Total Cloud Revenue</p>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">€{totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                  <DollarSign className="w-8 h-8" />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Active Workshop Queue</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">{pendingCount} Orders</h3>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-xl text-amber-400">
                  <Clock className="w-8 h-8" />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Ready for Pickup</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">{readyCount} Orders</h3>
                </div>
                <div className="bg-sky-500/10 p-3 rounded-xl text-sky-400">
                  <Check className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating AI Assistant Chat Widget (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4 rounded-full shadow-2xl flex items-center space-x-2 transition-transform hover:scale-105 font-bold"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="hidden md:inline">AI Shop Assistant</span>
          </button>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-80 md:w-96 shadow-2xl flex flex-col overflow-hidden max-h-[500px]">
            {/* Chat Header */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-500 p-1.5 rounded-lg text-slate-950">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Smart AI Assistant</h4>
                  <p className="text-[10px] text-emerald-400 font-medium">Live Firestore Connected</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl ${
                    msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-900 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-slate-900 border-t border-slate-700 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    handleAiQuery(chatInput);
                    setChatInput('');
                  }
                }}
                placeholder="Ask about orders, revenue..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => {
                  if (chatInput.trim()) {
                    handleAiQuery(chatInput);
                    setChatInput('');
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
