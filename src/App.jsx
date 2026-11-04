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
  Receipt, 
  BookOpen, 
  BarChart3, 
  Plus, 
  Trash2, 
  Printer, 
  DollarSign, 
  AlertCircle,
  LogOut 
} from 'lucide-react';
import emailjs from '@emailjs/browser';

const STORAGE_KEYS = {
  ACTIVE_TAB: 'alico_pos_active_tab_v1'
};

const DEFAULT_PRICE_BOOK = [
  { id: '1', item: 'Trouser Hemming', category: 'Alteration', price: 15.00 },
  { id: '2', item: 'Taper Trouser Legs', category: 'Alteration', price: 22.00 },
  { id: '3', item: 'Jacket Sleeve Shortening', category: 'Alteration', price: 25.00 },
  { id: '4', item: 'Replace Zipper (Jeans/Trousers)', category: 'Alteration', price: 18.00 },
  { id: '5', item: 'Shirt Wash & Press', category: 'Laundry', price: 4.50 },
  { id: '6', item: 'Suit Dry Clean & Press', category: 'Laundry', price: 18.00 },
  { id: '7', item: 'Duvet Cleaning (King)', category: 'Laundry', price: 24.00 }
];

export default function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || 'intake';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  // --- FIRESTORE DATA STATES ---
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [priceBook, setPriceBook] = useState(DEFAULT_PRICE_BOOK);

  // --- AUTH LISTENER ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // --- REAL-TIME FIRESTORE SYNC ---
  useEffect(() => {
    if (!user) return;
    
    // Sync Orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
      setOrders(ordersData);
    }, (err) => console.error("Orders sync error:", err));

    // Sync Expenses
    const qExpenses = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const expData = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
      setExpenses(expData);
    }, (err) => console.error("Expenses sync error:", err));

    return () => {
      unsubOrders();
      unsubExpenses();
    };
  }, [user]);

  // --- HANDLERS: AUTH ---
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

  // --- INTAKE FORM STATE ---
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [serviceType, setServiceType] = useState('Alteration');
  const [itemsDescription, setItemsDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [depositPaid, setDepositPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [dueDate, setDueDate] = useState('');

  // --- BOOKKEEPING & FILTER STATE ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Expense Edit State
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', description: '', category: '', amount: '' });

  // New Expense Form State
  const [newExpDate, setNewExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpCategory, setNewExpCategory] = useState('Supplies & Materials');
  const [newExpAmount, setNewExpAmount] = useState('');

  // --- DUPLICATE SAFEGUARD FOR PRICE BOOK / CATEGORIES ---
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Alteration');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const handleAddPriceBookItem = (e) => {
    e.preventDefault();
    setDuplicateWarning('');
    
    const trimmedName = newItemName.trim().toLowerCase();
    const exists = priceBook.some(item => item.item.trim().toLowerCase() === trimmedName && item.category === newItemCategory);
    
    if (exists) {
      setDuplicateWarning(`Warning: "${newItemName}" already exists under category "${newItemCategory}"!`);
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      item: newItemName,
      category: newItemCategory,
      price: parseFloat(newItemPrice) || 0
    };

    setPriceBook([...priceBook, newItem]);
    setNewItemName('');
    setNewItemPrice('');
  };

  // --- HANDLERS: ORDERS ---
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !totalAmount) return;

    const newOrder = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      customerName,
      phone: customerPhone,
      email: customerEmail,
      serviceType,
      itemsDescription,
      total: parseFloat(totalAmount) || 0,
      depositPaid: parseFloat(depositPaid) || 0,
      balanceDue: Math.max(0, (parseFloat(totalAmount) || 0) - (parseFloat(depositPaid) || 0)),
      paymentMethod,
      status: 'In Progress',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      await addDoc(collection(db, 'orders'), newOrder);
      
      // Send EmailJS Notification (Order Confirmation)
      if (customerEmail) {
        const templateParams = {
          customer_name: customerName,
          order_id: newOrder.id,
          service_type: serviceType,
          total: newOrder.total.toFixed(2),
          payment_method: paymentMethod,
          due_date: newOrder.dueDate,
          reply_to: customerEmail
        };
        emailjs.send('service_u334299', 'template_2ka75ti', templateParams, 'YOUR_PUBLIC_KEY')
          .catch(err => console.error('EmailJS error:', err));
      }

      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setItemsDescription('');
      setTotalAmount('');
      setDepositPaid('');
      setDueDate('');
      alert(`Order #${newOrder.id} successfully created and synced!`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error saving order to Firestore.');
    }
  };

  const handleUpdateStatus = async (docId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', docId);
      await updateDoc(orderRef, { status: newStatus });

      const targetOrder = orders.find(o => o.docId === docId);
      if (newStatus === 'Ready for Pickup' && targetOrder && targetOrder.email) {
        const templateParams = {
          customer_name: targetOrder.customerName,
          order_id: targetOrder.id,
          service_type: targetOrder.serviceType,
          total: targetOrder.total.toFixed(2),
          reply_to: targetOrder.email
        };
        emailjs.send('service_u334299', 'template_boon6r6', templateParams, 'YOUR_PUBLIC_KEY')
          .catch(err => console.error('EmailJS Ready error:', err));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteOrder = async (docId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'orders', docId));
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  // --- HANDLERS: EXPENSES ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpDesc || !newExpAmount) return;
    
    const exp = {
      date: newExpDate,
      description: newExpDesc,
      category: newExpCategory,
      amount: parseFloat(newExpAmount) || 0
    };

    try {
      await addDoc(collection(db, 'expenses'), exp);
      setNewExpDesc('');
      setNewExpAmount('');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error saving expense to Firestore.');
    }
  };

  const handleSaveEditExpense = async (docId) => {
    try {
      const expRef = doc(db, 'expenses', docId);
      await updateDoc(expRef, {
        date: editForm.date,
        description: editForm.description,
        category: editForm.category,
        amount: parseFloat(editForm.amount) || 0
      });
      setEditingExpenseId(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (docId) => {
    if (confirm('Delete this expense entry?')) {
      try {
        await deleteDoc(doc(db, 'expenses', docId));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  // Filtered Expenses calculation
  const filteredExpenses = expenses.filter(exp => {
    if (!startDate && !endDate) return true;
    if (startDate && exp.date < startDate) return false;
    if (endDate && exp.date > endDate) return false;
    return true;
  });

  const totalFilteredExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Expense breakdown calculations for reports
  const totalExpensesAll = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalRevenueAll = orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  // --- RENDER LOGIN GATE IF NOT AUTHENTICATED ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400">
        <div className="text-center space-y-2">
          <Scissors className="w-10 h-10 animate-spin mx-auto" />
          <p className="text-sm font-semibold">Loading ALiCo POS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-block bg-teal-500/10 border border-teal-500/30 p-3 rounded-2xl text-teal-400 mb-3">
              <Scissors className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-white">ALiCo DUBLIN</h1>
            <p className="text-xs text-slate-400 mt-1">Sign in with your staff account to access the POS</p>
          </div>

          {loginError && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Email</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="staff@sewsmart.ie"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-teal-900/30 transition"
            >
              Sign In to POS
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-500/10 border border-teal-500/30 p-2 rounded-xl text-teal-400">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              ALiCo DUBLIN <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/30 font-medium">POS v2.5</span>
            </h1>
            <p className="text-xs text-slate-400">Professional Alterations & Laundry Management</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'intake', label: 'Intake & Orders', icon: Shirt },
            { id: 'receipts', label: 'Thermal Print', icon: Receipt },
            { id: 'bookkeeping', label: 'Bookkeeping', icon: BookOpen },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'prices', label: 'Price Book', icon: DollarSign },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{user.email}</div>
            <div className="text-[10px] text-teal-400 font-semibold">Active Staff</div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {/* TAB 1: INTAKE & ORDERS */}
        {activeTab === 'intake' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* New Order Form */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-400" /> New Garment Intake
              </h2>
              <p className="text-xs text-slate-400 mb-6">Register a new customer order and assign a tag number.</p>

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name *</label>
                  <input 
                    type="text" 
                    required
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Alena Murariu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={customerPhone} 
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="+353..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={customerEmail} 
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="client@mail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Service Category</label>
                  <select 
                    value={serviceType} 
                    onChange={e => setServiceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Alteration">Alteration & Tailoring</option>
                    <option value="Laundry">Laundry & Dry Cleaning</option>
                    <option value="Express">Express 24h Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Garments & Alteration Details</label>
                  <textarea 
                    rows="3"
                    value={itemsDescription} 
                    onChange={e => setItemsDescription(e.target.value)}
                    placeholder="e.g. Hem 2 inches, take in waist..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Total Price (€) *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required
                      value={totalAmount} 
                      onChange={e => setTotalAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Paid (€)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={depositPaid} 
                      onChange={e => setDepositPaid(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                    <select 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Revolut">Revolut</option>
                      <option value="Unpaid">Unpaid / Pay on Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Ready Date</label>
                    <input 
                      type="date" 
                      value={dueDate} 
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-teal-900/30 transition flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Order & Send Email</span>
                </button>
              </form>
            </div>

            {/* Active Orders List */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Active Counter Orders</h2>
                  <p className="text-xs text-slate-400">Manage order statuses and notify customers.</p>
                </div>
                <div className="text-xs bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 font-medium">
                  Total Active: <span className="text-teal-400 font-bold">{orders.length}</span>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                      <th className="py-3 px-4">Tag #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {orders.map(order => (
                      <tr key={order.docId} className="hover:bg-slate-800/30 transition">
                        <td className="py-4 px-4 font-mono font-bold text-teal-400">#{order.id}</td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white">{order.customerName}</div>
                          <div className="text-xs text-slate-400">{order.phone || order.email || 'No contact'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg uppercase font-medium">
                            {order.serviceType}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-white">€{(Number(order.total) || 0).toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.docId, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-xl border focus:outline-none ${
                              order.status === 'Ready for Pickup' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            <option value="In Progress">In Progress</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button 
                            onClick={() => handleDeleteOrder(order.docId)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-slate-500 text-sm">
                          No active orders found in Firebase. Create one using the intake form.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: THERMAL PRINT SIMULATOR */}
        {activeTab === 'receipts' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="inline-block bg-teal-500/10 p-3 rounded-2xl text-teal-400 mb-2 border border-teal-500/30">
                <Printer className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white">Thermal Receipt Printer</h2>
              <p className="text-xs text-slate-400">Select an order to print standard 80mm claim ticket.</p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Order</label>
              <select 
                id="receiptSelect"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {orders.map(o => (
                  <option key={o.docId} value={o.id}>#{o.id} - {o.customerName} (€{(Number(o.total) || 0).toFixed(2)})</option>
                ))}
              </select>
            </div>

            {/* Thermal Receipt Preview Paper */}
            <div className="bg-white text-slate-900 font-mono p-6 rounded-xl shadow-inner text-xs space-y-3 mb-6 border border-slate-300">
              <div className="text-center border-b border-dashed border-slate-400 pb-3">
                <div className="font-black text-base">ALiCo DUBLIN</div>
                <div className="text-[10px]">Alterations & Laundry Services</div>
                <div className="text-[10px] text-slate-500 mt-1">Dublin, Ireland • +353 1 234 5678</div>
              </div>

              <div className="space-y-1 py-1">
                <div className="flex justify-between"><span>Date:</span><span>{new Date().toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span>Ticket #:</span><span className="font-bold">#7037</span></div>
                <div className="flex justify-between"><span>Customer:</span><span>Alena Murariu</span></div>
              </div>

              <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1">
                <div className="font-bold uppercase">Suit Trousers Hemming</div>
                <div className="flex justify-between text-slate-600"><span>Service Charge</span><span>€20.00</span></div>
              </div>

              <div className="space-y-1 font-bold pt-1">
                <div className="flex justify-between"><span>TOTAL PAID:</span><span>€20.00</span></div>
                <div className="flex justify-between text-xs text-slate-600"><span>Balance Due:</span><span>€0.00</span></div>
              </div>

              <div className="text-center border-t border-dashed border-slate-400 pt-3 text-[10px] text-slate-600">
                Please present this ticket upon collection.<br/>
                Items not collected within 30 days are subject to storage fees.<br/>
                *** THANK YOU FOR YOUR BUSINESS ***
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-teal-900/30 transition flex items-center justify-center space-x-2"
            >
              <Printer className="w-5 h-5" />
              <span>Print Thermal Receipt</span>
            </button>
          </div>
        )}

        {/* TAB 3: BOOKKEEPING & EXPENSES */}
        {activeTab === 'bookkeeping' && (
          <div className="space-y-8">
            
            {/* Filter Bar with Quick Timeframe Buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Business Expense Bookkeeping</h2>
                  <p className="text-sm text-slate-400">Record, filter, and manage your business expenses.</p>
                </div>
                
                {/* Quick Timeframe Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-teal-600/20 hover:text-teal-400 text-slate-300 rounded-lg border border-slate-700 transition"
                  >
                    This Month
                  </button>
                  <button 
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                      const end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-teal-600/20 hover:text-teal-400 text-slate-300 rounded-lg border border-slate-700 transition"
                  >
                    This Year
                  </button>
                  <button 
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-teal-600/20 hover:text-teal-400 text-slate-300 rounded-lg border border-slate-700 transition"
                  >
                    All Time
                  </button>
                </div>
              </div>

              {/* Custom Date Inputs */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">Date Range Filter:</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500"
                />
                <span className="text-slate-500 text-xs">to</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500"
                />
                {(startDate || endDate) && (
                  <button 
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-xs text-slate-400 hover:text-white underline ml-auto"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Add Expense Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-md font-bold text-white mb-4">Record New Expense</h3>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newExpDate} 
                    onChange={e => setNewExpDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Vendor</label>
                  <input 
                    type="text" 
                    value={newExpDesc} 
                    onChange={e => setNewExpDesc(e.target.value)}
                    placeholder="e.g. Electric Bill, Thread Supplies"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select 
                    value={newExpCategory} 
                    onChange={e => setNewExpCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Supplies & Materials">Supplies & Materials</option>
                    <option value="Rent">Rent</option>
                    <option value="Utilities & Internet">Utilities & Internet</option>
                    <option value="Payroll & Subcontractors">Payroll & Subcontractors</option>
                    <option value="Software, Apps & Domains">Software, Apps & Domains</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (€)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      step="0.01" 
                      value={newExpAmount} 
                      onChange={e => setNewExpAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                    <button 
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl transition flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Expenses Log Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-md font-bold text-white">Recorded Expenses Log</h3>
                <span className="text-sm font-bold text-rose-400">Total: €{totalFilteredExpenses.toFixed(2)}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description / Vendor</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filteredExpenses.map(exp => (
                      <tr key={exp.docId} className="hover:bg-slate-800/35 transition">
                        {editingExpenseId === exp.docId ? (
                          <>
                            <td className="py-3 px-4"><input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="bg-slate-950 text-white text-xs p-1.5 rounded border border-slate-700"/></td>
                            <td className="py-3 px-4"><input type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="bg-slate-950 text-white text-xs p-1.5 rounded border border-slate-700 w-full"/></td>
                            <td className="py-3 px-4">
                              <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="bg-slate-950 text-white text-xs p-1.5 rounded border border-slate-700">
                                <option value="Supplies & Materials">Supplies & Materials</option>
                                <option value="Rent">Rent</option>
                                <option value="Utilities & Internet">Utilities & Internet</option>
                                <option value="Payroll & Subcontractors">Payroll & Subcontractors</option>
                                <option value="Software, Apps & Domains">Software, Apps & Domains</option>
                              </select>
                            </td>
                            <td className="py-3 px-4"><input type="number" step="0.01" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="bg-slate-950 text-white text-xs p-1.5 rounded border border-slate-700 w-24"/></td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleSaveEditExpense(exp.docId)} className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">Save</button>
                              <button onClick={() => setEditingExpenseId(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg font-semibold">Cancel</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-slate-300">{exp.date}</td>
                            <td className="py-3 px-4 text-white font-medium">{exp.description}</td>
                            <td className="py-3 px-4 text-slate-300">{exp.category}</td>
                            <td className="py-3 px-4 text-rose-400 font-bold">€{(Number(exp.amount) || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button 
                                onClick={() => { setEditingExpenseId(exp.docId); setEditForm({ date: exp.date, description: exp.description, category: exp.category, amount: exp.amount }); }}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteExpense(exp.docId)}
                                className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg border border-rose-500/20 transition"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-slate-500 text-sm">
                          No expenses found for the selected date range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-2">Financial Reports & P&L Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Gross Revenue</div>
                <div className="text-3xl font-black text-teal-400">
                  €{totalRevenueAll.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Expenses</div>
                <div className="text-3xl font-black text-rose-400">
                  €{totalExpensesAll.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Net Operating Profit</div>
                <div className="text-3xl font-black text-emerald-400">
                  €{(totalRevenueAll - totalExpensesAll).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRICE BOOK & CATEGORIES WITH DUPLICATE SAFEGUARDS */}
        {activeTab === 'prices' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Add Price Item with Duplicate Safeguard */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-md font-bold text-white mb-2">Add New Item or Category</h3>
              <p className="text-xs text-slate-400 mb-4">Protected against duplicate category and item names.</p>

              {duplicateWarning && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              <form onSubmit={handleAddPriceBookItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category / Service</label>
                  <select 
                    value={newItemCategory} 
                    onChange={e => setNewItemCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Alteration">Alteration</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Express">Express</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={newItemName} 
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="e.g. Coat Hemming"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Standard Price (€)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      step="0.01" 
                      required
                      value={newItemPrice} 
                      onChange={e => setNewItemPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                    <button 
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl transition flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Price Book Catalog Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Price Book Catalog</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Standard Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {priceBook.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-semibold text-white">{item.item}</td>
                        <td className="py-3 px-4 text-slate-300">{item.category}</td>
                        <td className="py-3 px-4 text-right font-bold text-teal-400">€{Number(item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
