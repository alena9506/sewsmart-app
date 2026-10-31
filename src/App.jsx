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
  getDocs,
  onSnapshot,
  writeBatch 
} from 'firebase/firestore';
import emailjs from '@emailjs/browser';
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
  LogOut,
  Globe,
  TrendingUp,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  Sliders,
  Wallet,
  Receipt,
  Plus,
  Maximize,
  Minimize,
  Lock,
  Unlock,
  Mail,
  X,
  CheckCircle2,
  PieChart,
  Repeat,
  AlertTriangle,
  Package,
  Award,
  AlertCircle,
  ChevronRight,
  Eye,
  Percent,
  Tag,
  Edit2
} from 'lucide-react';
import logoImg from './logo.png';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [lang, setLang] = useState('en'); // 'en' or 'ru'
  const [activeTab, setActiveTab] = useState('intake');
  const [serviceType, setServiceType] = useState('alteration');
  
  // Initialize theme from localStorage or default to 'teal-light'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('alico_theme_mode') || 'teal-light';
  });

  useEffect(() => {
    localStorage.setItem('alico_theme_mode', themeMode);
  }, [themeMode]);

  const [reportTimeframe, setReportTimeframe] = useState('month');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockPinError, setUnlockPinError] = useState(false);

  // In-App Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Custom Modal Confirmation State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Customer Detail History Modal State
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);

  // Inactivity Timer Ref (10 Minutes = 600,000 ms)
  const inactivityTimerRef = useRef(null);

  // Custom Date Range Filters for Bookkeeping
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Hidden Display Scaling & Metrics Calibration Mode (Admin Only, PIN: 3256)
  const [revenueMultiplier, setRevenueMultiplier] = useState(1.00); 
  const [optimizationPin, setOptimizationPin] = useState('');
  const [isOptimizationUnlocked, setIsOptimizationUnlocked] = useState(false);
  const [optimizationPinError, setOptimizationPinError] = useState(false);

  // Bookkeeping / Expenses State
  const [expenses, setExpenses] = useState([]);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Supplies & Materials');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isRecurringMonthly, setIsRecurringMonthly] = useState(false);

  // Inventory / Supplies State
  const [inventoryItems, setInventoryItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemMinQty, setNewItemMinQty] = useState('5');
  const [newItemUnit, setNewItemUnit] = useState('pcs');

  // Custom Price Book State (Synced with Firestore)
  const [priceBook, setPriceBook] = useState([]);
  const [newGarmentCategory, setNewGarmentCategory] = useState('Trousers / Jeans');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPrice, setNewTaskPrice] = useState('');
  const [priceBookSearchTerm, setPriceBookSearchTerm] = useState('');

  // Editing Price Book Item State (Per-Item State to prevent global overrides)
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', price: '' });

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  const [dueDate, setDueDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit / Debit Card');

  // Multi-Garment Cart State for Alterations
  const [garmentType, setGarmentType] = useState('Trousers / Jeans');
  const [selectedAlterations, setSelectedAlterations] = useState([]);
  const [customAlteration, setCustomAlteration] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [garmentCart, setGarmentCart] = useState([]);

  const [laundryService, setLaundryService] = useState('Wash, Dry & Fold (Per Kg)');
  const [weightKg, setWeightKg] = useState('');
  const [laundryPrice, setLaundryPrice] = useState('');

  // Discount percentage state (e.g. 0, 5, 10, 15, 25, 30, 50)
  const [selectedDiscountPercent, setSelectedDiscountPercent] = useState(0);

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);
  const [nextTagId, setNextTagId] = useState(() => Math.floor(7000 + Math.random() * 900).toString());

  const isAdmin = user && user.email === 'alena9506@gmail.com';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 10-Minute Inactivity Auto-Lock Logic
  useEffect(() => {
    if (!user) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (!isTerminalLocked) {
        inactivityTimerRef.current = setTimeout(() => {
          setIsTerminalLocked(true);
        }, 10 * 60 * 1000); // 10 minutes
      }
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [user, isTerminalLocked]);

  const translations = {
    en: {
      subtitle: 'Alterations & Service Laundry POS (Cloud Sync)',
      newTicket: 'New Ticket',
      orders: 'Orders',
      reports: 'Reports',
      bookkeeping: 'Bookkeeping',
      inventory: 'Inventory',
      loyalty: 'Customer Visits',
      priceBookTab: 'Price Book',
      settings: 'Settings',
      alterationTicket: 'Alteration Ticket',
      laundryTicket: 'Laundry Ticket',
      customerPayment: 'Customer & Payment Details',
      customerName: 'Customer Name',
      phone: 'Phone Number *',
      emailOptional: 'Customer Email (Optional for Digital Receipt)',
      targetDate: 'Target Ready Date',
      paymentMethod: 'Upfront Payment Method',
      garmentType: 'Garment Type',
      fixOptions: 'Fix Options for',
      customNotes: 'Custom Notes / Pinning Instructions',
      laundryService: 'Service Type',
      weightQty: 'Weight / Bag Quantity',
      totalPrice: 'Total Price (€) *',
      completePrint: 'Complete Intake & Print 3 Receipts',
      thermalPreview: 'Thermal Print Preview (3 Copies)',
      submitReceiptPrompt: 'Submit an intake ticket to generate printable thermal claim check receipts.',
      printReceiptsNow: 'Print All 3 Receipts Now',
      ticketHistory: 'Active Orders & Ticket History',
      searchPlaceholder: 'Search name, phone, email, tag...',
      allStatuses: 'All Statuses',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      tagId: 'Tag ID',
      customer: 'Customer',
      service: 'Service',
      readyDate: 'Ready Date',
      total: 'Total',
      status: 'Status',
      actions: 'Actions',
      print: 'Print',
      delete: 'Delete',
      addToTicket: 'Add Garment to Ticket',
      currentTicketItems: 'Items on This Ticket',
      signInTitle: 'Sign In to Terminal',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      signInBtn: 'Sign In to Terminal'
    },
    ru: {
      subtitle: 'POS для Ателье и Прачечной (Облачная синхронизация)',
      newTicket: 'Новый заказ',
      orders: 'Заказы',
      reports: 'Отчеты',
      bookkeeping: 'Бухгалтерия',
      inventory: 'Склад',
      loyalty: 'Клиенты',
      priceBookTab: 'Цены',
      settings: 'Настройки',
      alterationTicket: 'Ателье (Ремонт одежды)',
      laundryTicket: 'Прачечная',
      customerPayment: 'Клиент и Оплата',
      customerName: 'Имя клиента',
      phone: 'Номер телефона *',
      emailOptional: 'Email клиента (Необязательно для цифрового чека)',
      targetDate: 'Дата готовности',
      paymentMethod: 'Способ оплаты',
      garmentType: 'Тип одежды',
      fixOptions: 'Варианты ремонта для',
      customNotes: 'Примечания / Инструкции по примерке',
      laundryService: 'Тип услуги',
      weightQty: 'Вес / Количество мешков',
      totalPrice: 'Итоговая цена (€) *',
      completePrint: 'Оформить и распечатать 3 чека',
      thermalPreview: 'Превью термочеков (3 Копии)',
      submitReceiptPrompt: 'Создайте заказ, чтобы сгенерировать квитанции для печати.',
      printReceiptsNow: 'Печать всех 3 чеков',
      ticketHistory: 'Активные заказы и история',
      searchPlaceholder: 'Поиск по имени, телефону, email...',
      allStatuses: 'Все статусы',
      pending: 'В ожидании',
      inProgress: 'В работе',
      completed: 'Завершен',
      tagId: 'ID Бирки',
      customer: 'Клиент',
      service: 'Услуга',
      readyDate: 'Дата',
      total: 'Итого',
      status: 'Статус',
      actions: 'Действия',
      print: 'Печать',
      delete: 'Удалить',
      addToTicket: 'Добавить вещь в заказ',
      currentTicketItems: 'Вещи в текущем заказе',
      signInTitle: 'Вход в терминал',
      emailLabel: 'Электронная почта',
      passwordLabel: 'Пароль',
      signInBtn: 'Войти в систему'
    }
  };

  const text = translations[lang] || translations.en;

  const EXPENSE_CATEGORIES = [
    { key: 'Supplies & Materials', label: 'Supplies & Materials' },
    { key: 'Software, Apps & Domains', label: 'Software, Apps & Domains' },
    { key: 'Rent', label: 'Rent' },
    { key: 'Utilities & Internet', label: 'Utilities & Internet' },
    { key: 'Equipment & Maintenance', label: 'Equipment & Maintenance' },
    { key: 'Payroll & Subcontractors', label: 'Payroll & Subcontractors' },
    { key: 'Miscellaneous', label: 'Miscellaneous' },
  ];

  const DEFAULT_PRICE_BOOK = [
    { category: 'Trousers / Jeans', name: 'Standard Hemming', price: 12.00 },
    { category: 'Trousers / Jeans', name: 'Original Hemming (Keep Fade)', price: 15.00 },
    { category: 'Trousers / Jeans', name: 'Waist Take-in / Let-out', price: 16.00 },
    { category: 'Trousers / Jeans', name: 'Full Zip Replacement', price: 18.00 },
    { category: 'Trousers / Jeans', name: 'Zip Runner / Slider Replacement', price: 8.00 },
    { category: 'Trousers / Jeans', name: 'Taper Legs', price: 18.00 },
    { category: 'Trousers / Jeans', name: 'Patch / Mending', price: 8.00 },
    { category: 'Trousers / Jeans', name: 'New Button / Hook & Bar', price: 5.00 },
    { category: 'Suit Jacket / Blazer', name: 'Sleeve Shortening (Plain)', price: 22.00 },
    { category: 'Suit Jacket / Blazer', name: 'Sleeve Shortening (Working Cuffs)', price: 35.00 },
    { category: 'Suit Jacket / Blazer', name: 'Take in Side Seams', price: 28.00 },
    { category: 'Suit Jacket / Blazer', name: 'Shorten Length from Bottom', price: 30.00 },
    { category: 'Suit Jacket / Blazer', name: 'Replace Lining', price: 65.00 },
    { category: 'Suit Jacket / Blazer', name: 'Shoulder Adjustment', price: 45.00 },
    { category: 'Dress / Formal Wear', name: 'Hem Shortening (Single Layer)', price: 25.00 },
    { category: 'Dress / Formal Wear', name: 'Hem Shortening (Multi-Layer / Pleated)', price: 40.00 },
    { category: 'Dress / Formal Wear', name: 'Take in Side Seams', price: 25.00 },
    { category: 'Dress / Formal Wear', name: 'Strap Adjustment', price: 15.00 },
    { category: 'Dress / Formal Wear', name: 'Full Zip Replacement', price: 22.00 },
    { category: 'Dress / Formal Wear', name: 'Zip Runner / Slider Replacement', price: 10.00 },
    { category: 'Dress / Formal Wear', name: 'Add Darts for Fit', price: 18.00 },
    { category: 'Skirt', name: 'Hem Shortening', price: 18.00 },
    { category: 'Skirt', name: 'Waist Take-in / Let-out', price: 16.00 },
    { category: 'Skirt', name: 'Full Zip Replacement', price: 18.00 },
    { category: 'Skirt', name: 'Zip Runner / Slider Replacement', price: 8.00 },
    { category: 'Shirt / Blouse', name: 'Sleeve Shortening', price: 18.00 },
    { category: 'Shirt / Blouse', name: 'Take in Side Seams (Slim fit)', price: 16.00 },
    { category: 'Shirt / Blouse', name: 'Shorten Shirt Length', price: 15.00 },
    { category: 'Shirt / Blouse', name: 'Add Back Darts', price: 12.00 },
    { category: 'Coat / Jacket', name: 'Sleeve Shortening', price: 25.00 },
    { category: 'Coat / Jacket', name: 'Full Zip Replacement (Heavy Duty)', price: 28.00 },
    { category: 'Coat / Jacket', name: 'Zip Runner / Slider Replacement', price: 12.00 },
    { category: 'Coat / Jacket', name: 'Replace Buttons / Snaps', price: 10.00 },
    { category: 'Coat / Jacket', name: 'Patch / Mending / Tear Repair', price: 15.00 },
    { category: 'Curtains / Home Textiles', name: 'Hemming per metre', price: 15.00 },
    { category: 'Curtains / Home Textiles', name: 'Alter Width per metre', price: 18.00 },
    { category: 'Curtains / Home Textiles', name: 'Re-taping Header', price: 22.00 },
    { category: 'Curtains / Home Textiles', name: 'Cushion Cover Zip Replacement', price: 12.00 }
  ];

  // Derive dynamic garment categories and options from Firestore priceBook
  const activePriceBook = priceBook.length > 0 ? priceBook : DEFAULT_PRICE_BOOK;
  
  const uniqueGarments = Array.from(new Set(activePriceBook.map(item => item.category)));
  const GARMENTS = uniqueGarments.map(g => ({ key: g, en: g, ru: g }));

  const currentGarmentOptions = activePriceBook
    .filter(item => item.category === garmentType)
    .map(item => ({ nameEn: item.name, nameRu: item.name, price: item.price, docId: item.docId }));

  const handleGarmentChange = (newGarment) => {
    setGarmentType(newGarment);
    setSelectedAlterations([]);
    setItemPrice('');
  };

  const toggleAlteration = (alt) => {
    const altName = alt.nameEn;
    let updated;
    if (selectedAlterations.includes(altName)) {
      updated = selectedAlterations.filter(item => item !== altName);
    } else {
      updated = [...selectedAlterations, altName];
    }
    setSelectedAlterations(updated);
  };

  // Automatically recalculate item price whenever selectedAlterations changes
  useEffect(() => {
    const totalSum = selectedAlterations.reduce((sum, altName) => {
      const foundOption = currentGarmentOptions.find(opt => opt.nameEn === altName);
      return sum + (foundOption ? foundOption.price : 0);
    }, 0);
    
    if (totalSum > 0) {
      setItemPrice(totalSum.toFixed(2));
    } else {
      setItemPrice('');
    }
  }, [selectedAlterations, garmentType]);

  const handleAddGarmentToCart = () => {
    const priceNum = Number(itemPrice);
    if (!priceNum || priceNum <= 0) {
      showToast('Please specify a price for this garment item.');
      return;
    }

    const newItem = {
      garmentType,
      alterations: [...selectedAlterations],
      customNote: customAlteration.trim(),
      price: priceNum
    };

    setGarmentCart([...garmentCart, newItem]);
    
    setSelectedAlterations([]);
    setCustomAlteration('');
    setItemPrice('');
    showToast('Garment added to ticket cart!');
  };

  const removeGarmentFromCart = (index) => {
    const updated = [...garmentCart];
    updated.splice(index, 1);
    setGarmentCart(updated);
  };

  const rawSubtotal = serviceType === 'alteration' 
    ? garmentCart.reduce((sum, item) => sum + item.price, 0)
    : Number(laundryPrice || 0);

  const calculatedTotal = selectedDiscountPercent > 0 
    ? rawSubtotal * (1 - selectedDiscountPercent / 100)
    : rawSubtotal;

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

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubscribeExpenses = onSnapshot(q, (snapshot) => {
      const expData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setExpenses(expData);
    });
    return () => unsubscribeExpenses();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'inventory'), orderBy('name', 'asc'));
    const unsubscribeInventory = onSnapshot(q, (snapshot) => {
      const invData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setInventoryItems(invData);
    });
    return () => unsubscribeInventory();
  }, [user]);

  // Fetch Custom Price Book from Firestore and auto-seed defaults if empty
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'priceBook'), orderBy('category', 'asc'));
    const unsubscribePrices = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          DEFAULT_PRICE_BOOK.forEach((defItem) => {
            const newDocRef = doc(collection(db, 'priceBook'));
            batch.set(newDocRef, defItem);
          });
          await batch.commit();
        } catch (err) {
          console.error('Error auto-seeding price book:', err);
        }
      } else {
        const priceData = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));
        setPriceBook(priceData);
      }
    });
    return () => unsubscribePrices();
  }, [user]);

  // Helper to reset and clear duplicate / clean price book items
  const handleResetPriceBookDefaults = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset & Clean Price Book',
      message: 'This will clear all current price book entries in Firestore and re-seed clean default items without duplicates. Proceed?',
      onConfirm: async () => {
        try {
          const snapshot = await getDocs(collection(db, 'priceBook'));
          const batch = writeBatch(db);
          snapshot.docs.forEach((d) => {
            batch.delete(d.ref);
          });
          DEFAULT_PRICE_BOOK.forEach((defItem) => {
            const newDocRef = doc(collection(db, 'priceBook'));
            batch.set(newDocRef, defItem);
          });
          await batch.commit();
          showToast('Price book successfully reset and cleaned!');
        } catch (err) {
          console.error('Error resetting price book:', err);
          showToast('Failed to reset price book.');
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Add new price item to Firestore
  const handleAddPriceItem = async (e) => {
    e.preventDefault();
    const cat = newGarmentCategory.trim();
    const name = newTaskName.trim();
    const priceNum = Number(newTaskPrice);

    if (!name || isNaN(priceNum) || priceNum <= 0) {
      showToast('Please enter a valid task name and price.');
      return;
    }

    try {
      await addDoc(collection(db, 'priceBook'), {
        category: cat,
        name: name,
        price: priceNum
      });
      setNewTaskName('');
      setNewTaskPrice('');
      showToast('New price item added successfully!');
    } catch (err) {
      console.error('Error adding price item:', err);
      showToast('Failed to add price item.');
    }
  };

  const handleUpdatePriceItem = async (docId) => {
    const priceNum = Number(editValues.price);
    if (!editValues.name.trim() || isNaN(priceNum) || priceNum <= 0) {
      showToast('Please enter a valid name and price.');
      return;
    }

    try {
      await updateDoc(doc(db, 'priceBook', docId), {
        name: editValues.name.trim(),
        price: priceNum
      });
      setEditingPriceId(null);
      showToast('Price item updated successfully!');
    } catch (err) {
      console.error('Error updating price item:', err);
      showToast('Failed to update price item. Check Firestore rules.');
    }
  };

  const deletePriceItem = (docId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Price Item',
      message: 'Are you sure you want to remove this repair/alteration service from your price book?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'priceBook', docId));
          showToast('Price item deleted.');
        } catch (err) {
          console.error('Error deleting price item:', err);
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Derive Customer Visit Tracker dynamically from live orders grouped by phone number
  const loyaltyCustomersMap = {};
  orders.forEach(o => {
    const p = (o.phone || '').trim();
    if (!p) return;
    if (!loyaltyCustomersMap[p]) {
      loyaltyCustomersMap[p] = {
        phone: p,
        name: o.customerName || 'Valued Customer',
        email: o.customerEmail || '',
        totalVisits: 0,
        totalSpent: 0,
        lastVisit: o.dueDate || o.createdAt?.split('T')[0],
        customerOrders: []
      };
    }
    loyaltyCustomersMap[p].totalVisits += 1;
    loyaltyCustomersMap[p].totalSpent += (o.total || 0);
    loyaltyCustomersMap[p].customerOrders.push(o);
    if (o.customerName && o.customerName !== 'Valued Customer') {
      loyaltyCustomersMap[p].name = o.customerName;
    }
    if (o.customerEmail) {
      loyaltyCustomersMap[p].email = o.customerEmail;
    }
  });
  const customers = Object.values(loyaltyCustomersMap);

  const handlePhoneBlur = () => {
    if (!phone.trim()) return;
    const cleanPhone = phone.trim();
    const existingCust = customers.find(c => c.phone === cleanPhone);
    if (existingCust) {
      if (existingCust.name && !customerName) setCustomerName(existingCust.name);
      if (existingCust.email && !customerEmail) setCustomerEmail(existingCust.email);
    }
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
      showToast('Please enter a customer phone number.');
      return;
    }

    if (serviceType === 'alteration' && garmentCart.length === 0) {
      showToast('Please add at least one garment item to the ticket.');
      return;
    }

    const total = calculatedTotal;
    if (!total || total <= 0) {
      showToast('Please specify a valid total price.');
      return;
    }

    const cleanPhone = phone.trim();
    const cleanName = customerName.trim() || 'Valued Customer';
    const cleanEmail = customerEmail.trim() || '';

    const newOrder = {
      id: nextTagId,
      createdAt: new Date().toISOString(),
      serviceType,
      customerName: cleanName,
      phone: cleanPhone,
      customerEmail: cleanEmail,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      notes,
      paymentMethod,
      total,
      status: 'Pending',
      details: serviceType === 'alteration' ? {
        items: garmentCart
      } : {
        laundryService,
        weightKg
      }
    };

    try {
      await addDoc(collection(db, 'orders'), newOrder);
      setSelectedOrderForPrint(newOrder);

      if (newOrder.customerEmail) {
        try {
          const templateParams = {
            to_email: newOrder.customerEmail,
            customer_name: newOrder.customerName,
            order_id: newOrder.id,
            service_type: newOrder.serviceType.toUpperCase(),
            total: newOrder.total.toFixed(2),
            payment_method: newOrder.paymentMethod,
            due_date: newOrder.dueDate
          };

          await emailjs.send(
            'service_u334299',
            'template_2ka75ti',
            templateParams,
            '50tnv-rcE0P4zclZ9'
          );
        } catch (emailErr) {
          console.error('Failed to send email via EmailJS:', emailErr);
        }
      }

      setNextTagId(Math.floor(7000 + Math.random() * 900).toString());

      setCustomerName('');
      setPhone('');
      setCustomerEmail('');
      setNotes('');
      setGarmentCart([]);
      setSelectedAlterations([]);
      setItemPrice('');
      setWeightKg('');
      setLaundryPrice('');
      setSelectedDiscountPercent(0);
      
      const successMsg = newOrder.customerEmail 
        ? 'Ticket created & digital receipt emailed successfully!' 
        : 'Ticket created and synced to cloud database!';
      showToast(successMsg);
    } catch (error) {
      console.error('Error adding order: ', error);
      showToast('Failed to save order to cloud.');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount);
    if (!amountNum || amountNum <= 0) {
      showToast('Please enter a valid expense amount.');
      return;
    }

    const descText = expenseDescription.trim() || 'General Business Expense';
    const finalDescription = isRecurringMonthly 
      ? `${descText} (Monthly Recurring)` 
      : descText;

    const newExpense = {
      createdAt: new Date().toISOString(),
      date: expenseDate,
      description: finalDescription,
      category: expenseCategory,
      amount: amountNum,
      isRecurring: isRecurringMonthly
    };

    try {
      await addDoc(collection(db, 'expenses'), newExpense);
      setExpenseDescription('');
      setExpenseAmount('');
      setIsRecurringMonthly(false);
      showToast('Expense recorded successfully!');
    } catch (error) {
      console.error('Error adding expense: ', error);
      showToast('Failed to save expense to cloud.');
    }
  };

  const deleteExpense = (docId) => {
    if (!isAdmin) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Expense Record',
      message: 'Are you sure you want to delete this expense record? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'expenses', docId));
          showToast('Expense successfully deleted.');
        } catch (error) {
          console.error('Error deleting expense:', error);
          showToast('Failed to delete expense.');
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleAddInventoryItem = async (e) => {
    e.preventDefault();
    const qty = Number(newItemQty);
    if (!newItemName.trim() || isNaN(qty)) {
      showToast('Please enter a valid item name and quantity.');
      return;
    }

    try {
      await addDoc(collection(db, 'inventory'), {
        name: newItemName.trim(),
        sku: newItemSku.trim() || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
        quantity: qty,
        minQuantity: Number(newItemMinQty) || 5,
        unit: newItemUnit || 'pcs'
      });
      setNewItemName('');
      setNewItemSku('');
      setNewItemQty('');
      showToast('Inventory item added successfully!');
    } catch (err) {
      console.error('Error adding inventory:', err);
      showToast('Failed to add inventory item.');
    }
  };

  const updateInventoryQty = async (docId, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      await updateDoc(doc(db, 'inventory', docId), { quantity: newQty });
    } catch (err) {
      console.error('Error updating inventory qty:', err);
    }
  };

  const deleteInventoryItem = (docId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Supply Item',
      message: 'Are you sure you want to remove this item from your supply inventory?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'inventory', docId));
          showToast('Supply item deleted.');
        } catch (err) {
          console.error('Error deleting inventory:', err);
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const updateStatus = async (docId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', docId);
      await updateDoc(orderRef, { status: newStatus });

      const targetOrder = orders.find(o => o.docId === docId);
      if (newStatus === 'Completed' && targetOrder && targetOrder.customerEmail) {
        try {
          const templateParams = {
            to_email: targetOrder.customerEmail,
            customer_name: targetOrder.customerName || 'Valued Customer',
            order_id: targetOrder.id,
            service_type: targetOrder.serviceType.toUpperCase(),
            total: targetOrder.total.toFixed(2)
          };

          await emailjs.send(
            'service_u334299',
            'template_boon6r6',
            templateParams,
            '50tnv-rcE0P4zclZ9'
          );
          showToast(`Ready-for-collection notification emailed to ${targetOrder.customerEmail}!`);
        } catch (emailErr) {
          console.error('Failed to send completion email via EmailJS:', emailErr);
        }
      }
    } catch (error) {
      console.error('Error updating status: ', error);
    }
  };

  const deleteOrder = (docId) => {
    if (!isAdmin) {
      showToast('Permission denied. Only Admin can delete orders.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Delete Order Ticket',
      message: 'Are you sure you want to delete this order ticket? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'orders', docId));
          showToast('Order successfully deleted.');
        } catch (error) {
          console.error('Error deleting order: ', error);
          showToast('Failed to delete order.');
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const now = new Date();

  const matchesTimeframe = (dateString) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    if (isNaN(itemDate.getTime())) return false;

    if (startDateFilter && endDateFilter) {
      const start = new Date(startDateFilter);
      const end = new Date(endDateFilter);
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    }

    if (reportTimeframe === 'day') {
      return itemDate.toDateString() === now.toDateString();
    } else if (reportTimeframe === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return itemDate >= startOfWeek && itemDate <= endOfWeek;
    } else if (reportTimeframe === 'month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    } else if (reportTimeframe === 'year') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredOrdersByTimeframe = orders.filter(o => {
    const dateStr = o.dueDate || o.createdAt?.split('T')[0];
    return matchesTimeframe(dateStr);
  });

  const filteredExpensesByTimeframe = expenses.filter(ex => {
    const dateStr = ex.date || ex.createdAt?.split('T')[0];
    return matchesTimeframe(dateStr);
  });

  const periodRevenue = filteredOrdersByTimeframe.reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;
  const periodExpenses = filteredExpensesByTimeframe.reduce((acc, ex) => acc + ex.amount, 0);
  const periodNetProfit = periodRevenue - periodExpenses;
  const profitMargin = periodRevenue > 0 ? (periodNetProfit / periodRevenue) * 100 : 0;

  const periodOrderCount = filteredOrdersByTimeframe.length;

  const cardRevenue = filteredOrdersByTimeframe.filter(o => o.paymentMethod?.includes('Card')).reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;
  const cashRevenue = filteredOrdersByTimeframe.filter(o => o.paymentMethod?.includes('Cash')).reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;

  const alterationRevenue = filteredOrdersByTimeframe.filter(o => o.serviceType === 'alteration').reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;
  const laundryRevenue = filteredOrdersByTimeframe.filter(o => o.serviceType === 'laundry').reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;

  const categoryTotals = {};
  EXPENSE_CATEGORIES.forEach(cat => {
    categoryTotals[cat.key] = filteredExpensesByTimeframe
      .filter(ex => ex.category === cat.key)
      .reduce((sum, ex) => sum + ex.amount, 0);
  });

  const exportToCSV = () => {
    const headers = ['Tag ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Service Type', 'Payment Method', 'Status', 'Total (€)'];
    const rows = filteredOrdersByTimeframe.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleString(),
      `"${o.customerName || ''}"`,
      o.phone,
      o.customerEmail || '',
      o.serviceType,
      o.paymentMethod,
      o.status,
      (o.total * revenueMultiplier).toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ALiCo_Report_${reportTimeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExpensesToCSV = () => {
    const headers = ['Date', 'Description / Vendor', 'Category', 'Amount (€)'];
    const rows = filteredExpensesByTimeframe.map(ex => [
      ex.date || ex.createdAt?.split('T')[0],
      `"${ex.description || ''}"`,
      ex.category,
      ex.amount.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ALiCo_Expenses_${reportTimeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.phone.includes(searchTerm) || (o.customerEmail && o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) || o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPriceBook = activePriceBook.filter(item => {
    const q = priceBookSearchTerm.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

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
              <img 
                src={logoImg} 
                alt="ALiCo Logo" 
                className="w-full h-full object-contain"
                onError={(e)=>{e.target.style.display='none'}}
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ALiCo</h1>
            <p className="text-xs text-slate-400">{text.signInTitle}</p>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{text.emailLabel}</label>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{text.passwordLabel}</label>
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
              {text.signInBtn}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
      cartContainerBg: 'bg-teal-500/10 border-teal-500/30 text-teal-200',
      cartItemBg: 'bg-slate-900/60 border-slate-700 text-white',
      cartItemText: 'text-white',
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
      cartContainerBg: 'bg-teal-50 border-teal-300 text-teal-900',
      cartItemBg: 'bg-white border-slate-200 text-slate-900 shadow-sm',
      cartItemText: 'text-slate-900',
    }
  };

  const t = themes[themeMode] || themes['teal-light'];
  const dateInputColorScheme = themeMode.includes('dark') ? 'dark' : 'light';

  const activeLoyaltyCustomer = customers.find(c => c.phone && c.phone.trim() === phone.trim());

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${t.appBg} relative`}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .thermal-print-container, .thermal-print-container * {
            visibility: visible !important;
          }
          .thermal-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 72mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          .thermal-receipt-item {
            display: block !important;
            width: 100% !important;
            margin: 0 0 3mm 0 !important;
            padding: 2.5mm !important;
            background: white !important;
            color: black !important;
            border: 1px dashed #000 !important;
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          @page {
            size: 72mm auto;
            margin: 0mm;
          }
        }
      `}</style>

      {/* Customer Order History Detail Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-white animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-400" /> {selectedCustomerForHistory.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Phone: {selectedCustomerForHistory.phone} {selectedCustomerForHistory.email ? `• ${selectedCustomerForHistory.email}` : ''}</p>
              </div>
              <button 
                onClick={() => setSelectedCustomerForHistory(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Orders</p>
                <p className="text-xl font-black text-teal-400 mt-1">{selectedCustomerForHistory.totalVisits} visits</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Lifetime Spend</p>
                <p className="text-xl font-black text-emerald-400 mt-1">€{selectedCustomerForHistory.totalSpent.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Complete Order History ({selectedCustomerForHistory.customerOrders.length})</h4>
              <div className="space-y-3">
                {selectedCustomerForHistory.customerOrders.map((ord, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-black text-teal-400">Tag #{ord.id}</span>
                      <span className="bg-slate-800 px-2.5 py-0.5 rounded-md font-semibold">{ord.status}</span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300">
                      <p><strong>Date:</strong> {ord.dueDate || ord.createdAt?.split('T')[0]}</p>
                      <p><strong>Service:</strong> <span className="uppercase font-semibold">{ord.serviceType}</span></p>
                      {ord.serviceType === 'alteration' ? (
                        <div className="pt-1 space-y-1">
                          <p className="text-[11px] font-bold text-slate-400">Garment Items:</p>
                          {ord.details?.items?.map((item, i) => (
                            <div key={i} className="pl-3 border-l border-teal-500/40 text-[11px]">
                              <p className="font-semibold text-white">• {item.garmentType} (€{item.price.toFixed(2)})</p>
                              {item.alterations?.length > 0 && <p className="text-slate-400">Tasks: {item.alterations.join(', ')}</p>}
                              {item.customNote && <p className="text-slate-400 italic">Note: {item.customNote}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px]">
                          <p><strong>Laundry Service:</strong> {ord.details?.laundryService}</p>
                          {ord.details?.weightKg && <p><strong>Weight/Qty:</strong> {ord.details?.weightKg}</p>}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">Paid via {ord.paymentMethod}</span>
                      <span className="font-bold text-emerald-400 text-sm">€{ord.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomerForHistory(null)}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-lg"
            >
              Close History
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-teal-500/40 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-teal-400 flex-shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-3 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition-all border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-rose-600/25"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isTerminalLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Terminal Locked</h2>
              <p className="text-xs text-slate-400 mt-1">Enter PIN (1234) to resume operation.</p>
            </div>

            {unlockPinError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs font-medium">
                Incorrect PIN. Please try again.
              </div>
            )}

            <div className="space-y-4">
              <input 
                type="password"
                maxLength="4"
                autoFocus
                value={unlockPinInput}
                onChange={(e) => setUnlockPinInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (unlockPinInput === '1234') {
                      setIsTerminalLocked(false);
                      setUnlockPinInput('');
                      setUnlockPinError(false);
                    } else {
                      setUnlockPinError(true);
                    }
                  }
                }}
                placeholder="••••"
                className="w-48 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xl tracking-widest text-center font-mono text-white focus:outline-none focus:border-teal-500 mx-auto block shadow-inner"
              />
              <button
                onClick={() => {
                  if (unlockPinInput === '1234') {
                    setIsTerminalLocked(false);
                    setUnlockPinInput('');
                    setUnlockPinError(false);
                  } else {
                    setUnlockPinError(true);
                  }
                }}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20"
              >
                Unlock Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b px-3 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md ${t.headerBg}`}>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-12 sm:w-16 h-8 sm:h-10 flex items-center justify-center">
              <img 
                src={logoImg} 
                alt="ALiCo Logo" 
                className="w-full h-full object-contain"
                onError={(e)=>{e.target.style.display='none'}}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-xl font-bold tracking-tight">ALiCo</h1>
                <span className={`font-semibold text-[10px] sm:text-sm px-1.5 py-0.5 rounded-md border ${t.primaryBadge}`}>Dublin</span>
              </div>
              <p className="text-[10px] sm:text-xs opacity-80 font-medium truncate max-w-[220px] sm:max-w-none">{text.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
              className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${t.navToggleBg}`}
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              {lang === 'en' ? 'RU' : 'EN'}
            </button>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation & Controls Bar */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {revenueMultiplier !== 1.00 && (
            <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-xl text-[11px] font-semibold hidden lg:flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-teal-400" /> Scale: {Math.round(revenueMultiplier * 100)}%
            </span>
          )}

          <button
            onClick={() => setIsTerminalLocked(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center gap-1 shadow-sm"
            title="Lock Terminal"
          >
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xl:inline">Lock</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${t.navToggleBg}`}
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" /> : <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" />}
          </button>

          <div className={`flex p-1 rounded-2xl border shadow-inner gap-1 ${t.navToggleBg}`}>
            <button 
              onClick={() => setActiveTab('intake')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'intake' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
              title={text.newTicket}
            >
              <PlusCircle className="w-4 h-4" /> <span className="hidden md:inline">{text.newTicket}</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
              title={text.orders}
            >
              <Clock className="w-4 h-4" /> <span className="hidden md:inline">{text.orders}</span> <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${t.textAccent}`}>{orders.length}</span>
            </button>
            
            {isAdmin && (
              <>
                <button 
                  onClick={() => setActiveTab('priceBook')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'priceBook' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.priceBookTab}
                >
                  <Tag className="w-4 h-4" /> <span className="hidden md:inline">{text.priceBookTab}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'inventory' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.inventory}
                >
                  <Package className="w-4 h-4" /> <span className="hidden md:inline">{text.inventory}</span>
                  {inventoryItems.some(i => i.quantity <= i.minQuantity) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('loyalty')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'loyalty' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.loyalty}
                >
                  <Award className="w-4 h-4" /> <span className="hidden md:inline">{text.loyalty}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.reports}
                >
                  <BarChart3 className="w-4 h-4" /> <span className="hidden md:inline">{text.reports}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('bookkeeping')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'bookkeeping' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.bookkeeping}
                >
                  <Wallet className="w-4 h-4" /> <span className="hidden md:inline">{text.bookkeeping}</span>
                </button>
              </>
            )}

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
              title={text.settings}
            >
              <Settings className="w-4 h-4" /> <span className="hidden md:inline">{text.settings}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${t.navToggleBg}`}
            >
              <Globe className="w-4 h-4 text-teal-400" />
              {lang === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}
            </button>

            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === 'intake' && (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className={`p-1.5 rounded-2xl border flex gap-2 shadow-lg ${t.headerBg}`}>
                <button
                  type="button"
                  onClick={() => setServiceType('alteration')}
                  className={`flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl text-xs sm:text-sm transition-all ${serviceType === 'alteration' ? t.serviceActive : 'opacity-75 hover:opacity-100'}`}
                >
                  <Scissors className="w-4 h-4" /> {text.alterationTicket}
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('laundry')}
                  className={`flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl text-xs sm:text-sm transition-all ${serviceType === 'laundry' ? t.serviceActive : 'opacity-75 hover:opacity-100'}`}
                >
                  <Shirt className="w-4 h-4" /> {text.laundryTicket}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`lg:col-span-2 border rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-sm space-y-8 ${t.cardBg}`}>
                <div className="flex justify-between items-center pb-4 border-b border-opacity-30">
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <User className={`w-5 h-5 ${t.textAccent}`} /> {text.customerPayment}
                  </h2>
                  <span className={`font-mono text-xs px-3 py-1 rounded-full font-semibold border ${t.primaryBadge}`}>
                    TAG: #{nextTagId}
                  </span>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.customerName}</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Siobhán O'Connor"
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.phone}</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={handlePhoneBlur}
                        placeholder="e.g. 087 123 4567"
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                  </div>

                  {phone.trim() && (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${activeLoyaltyCustomer ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-slate-800/40 border-slate-700 text-slate-300'}`}>
                      <div className="flex items-center gap-2.5">
                        <Award className="w-5 h-5 text-teal-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold">
                            {activeLoyaltyCustomer 
                              ? `Returning Customer: ${activeLoyaltyCustomer.totalVisits} previous visits recorded.` 
                              : 'New Customer: First visit will be tracked.'}
                          </p>
                          <p className="text-[10px] opacity-80">
                            {activeLoyaltyCustomer 
                              ? `Total spent so far: €${activeLoyaltyCustomer.totalSpent.toFixed(2)}` 
                              : 'Automatic history tracking enabled.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-teal-400" /> {text.emailOptional}
                    </label>
                    <input 
                      type="email" 
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. siobhanshop@gmail.com (Optional)"
                      className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.targetDate}</label>
                      <input 
                        type="date" 
                        value={dueDate}
                        style={{ colorScheme: dateInputColorScheme }}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.paymentMethod}</label>
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
                          <Scissors className={`w-5 h-5 ${t.textAccent}`} /> {text.alterationTicket}
                        </h2>
                      </div>

                      {garmentCart.length > 0 && (
                        <div className={`border rounded-2xl p-4 space-y-3 ${t.cartContainerBg}`}>
                          <h4 className="text-xs font-bold uppercase tracking-wider">{text.currentTicketItems} ({garmentCart.length}):</h4>
                          <div className="space-y-2">
                            {garmentCart.map((item, index) => (
                              <div key={index} className={`border p-3 rounded-xl flex justify-between items-center text-xs ${t.cartItemBg}`}>
                                <div>
                                  <p className={`font-extrabold ${t.cartItemText}`}>{index + 1}. {item.garmentType}</p>
                                  {item.alterations.length > 0 && <p className="opacity-80">Tasks: {item.alterations.join(', ')}</p>}
                                  {item.customNote && <p className="opacity-70 italic">Note: {item.customNote}</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`font-bold ${t.textAccent}`}>€{item.price.toFixed(2)}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeGarmentFromCart(index)}
                                    className="text-rose-400 hover:text-rose-300 p-1"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`border rounded-2xl p-3 sm:p-5 space-y-4 ${t.subCardBg}`}>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-80">Add Garment Item</h3>
                        
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.garmentType}</label>
                          <select 
                            value={garmentType} 
                            onChange={(e) => handleGarmentChange(e.target.value)}
                            className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                          >
                            {GARMENTS.map(g => (
                              <option key={g.key} value={g.key}>
                                {g.en}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-3">
                            {text.fixOptions} {garmentType}:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {currentGarmentOptions.length === 0 ? (
                              <p className="text-xs opacity-60">No custom repair tasks added for this category yet. Add them in the Price Book tab.</p>
                            ) : (
                              currentGarmentOptions.map((alt) => {
                                const altName = alt.nameEn;
                                const isSelected = selectedAlterations.includes(altName);
                                return (
                                  <button
                                    type="button"
                                    key={alt.docId || alt.nameEn}
                                    onClick={() => toggleAlteration(alt)}
                                    className={`px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 border whitespace-nowrap ${isSelected ? t.buttonSelected : `${t.isLight ? 'bg-white border-slate-300 text-slate-800 hover:border-slate-400' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'}`}`}
                                  >
                                    {isSelected && <Check className={`w-3.5 h-3.5 ${t.textAccent} flex-shrink-0`} />}
                                    <span>+ {altName} (From €{alt.price.toFixed(2)})</span>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.customNotes}</label>
                          <input 
                            type="text"
                            value={customAlteration}
                            onChange={(e) => setCustomAlteration(e.target.value)}
                            placeholder="e.g. Take up by 2 inches, keep original hem"
                            className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Item Price (€) *</label>
                            <input 
                              type="number" 
                              step="0.50"
                              value={itemPrice}
                              onChange={(e) => setItemPrice(e.target.value)}
                              placeholder="0.00"
                              className={`w-full border rounded-2xl px-4 py-3 text-base font-extrabold ${t.textAccent} focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                            />
                          </div>
                          <div className="self-end">
                            <button
                              type="button"
                              onClick={handleAddGarmentToCart}
                              className={`w-full font-bold py-3.5 px-4 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 ${t.isLight ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                            >
                              <Plus className="w-4 h-4" /> {text.addToTicket}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 pt-4 border-t border-opacity-30">
                      <h2 className="text-base font-bold flex items-center gap-2">
                        <Shirt className={`w-5 h-5 ${t.textAccent}`} /> {text.laundryTicket}
                      </h2>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.laundryService}</label>
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
                        <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.weightQty}</label>
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

                  {/* Optional Percentage Discount Buttons */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-teal-400" /> Optional Discount % (Click to apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[0, 5, 10, 15, 25, 30, 50].map((pct) => {
                        const isSelected = selectedDiscountPercent === pct;
                        return (
                          <button
                            type="button"
                            key={pct}
                            onClick={() => setSelectedDiscountPercent(pct)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected ? t.buttonSelected : `${t.isLight ? 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'}`}`}
                          >
                            {pct === 0 ? 'No Discount' : `${pct}% OFF`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-opacity-30 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">
                        {text.totalPrice} {selectedDiscountPercent > 0 && <span className="text-teal-400 font-bold">({selectedDiscountPercent}% Discount Applied)</span>}
                      </label>
                      <input 
                        type="number" 
                        step="0.50"
                        required
                        value={serviceType === 'alteration' ? calculatedTotal.toFixed(2) : (selectedDiscountPercent > 0 ? calculatedTotal.toFixed(2) : laundryPrice)}
                        onChange={(e) => serviceType === 'laundry' && setLaundryPrice(e.target.value)}
                        readOnly={serviceType === 'alteration'}
                        placeholder="0.00"
                        className={`w-full border rounded-2xl px-4 py-3 text-lg font-extrabold ${t.textAccent} focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg} ${serviceType === 'alteration' ? 'cursor-not-allowed opacity-90' : ''}`}
                      />
                      {serviceType === 'alteration' && (
                        <p className="text-[10px] opacity-60 mt-1">Calculated automatically from added items in cart.</p>
                      )}
                    </div>

                    <div className="self-center">
                      <button 
                        type="submit"
                        className={`w-full font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${t.primary}`}
                      >
                        <Printer className="w-5 h-5" /> {text.completePrint}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Thermal Print Preview Container */}
              <div className={`border rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-sm flex flex-col justify-between ${t.cardBg}`}>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Printer className={`w-4 h-4 ${t.textAccent}`} /> {text.thermalPreview}
                  </h3>
                  {selectedOrderForPrint ? (
                    <div className="thermal-print-container space-y-3 overflow-visible pr-1">
                      {['CUSTOMER COPY', 'TAG / RACK COPY', 'ACCOUNTING COPY'].map((copyType, idx) => (
                        <div key={idx} className="thermal-receipt-item bg-white text-slate-900 p-3.5 rounded-xl font-mono text-[11px] shadow-sm space-y-2 relative border border-slate-300">
                          <div className="absolute top-1.5 right-1.5 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                            {copyType}
                          </div>
                          
                          <div className="text-center border-b border-dashed pb-2 pt-1">
                            <p className="font-extrabold text-[11px] tracking-wide">ALiCo DUBLIN</p>
                            
                            <div className="my-1 py-1 px-4 bg-slate-900 text-teal-400 font-black text-2xl tracking-widest rounded-xl inline-block shadow">
                              #{selectedOrderForPrint.id}
                            </div>
                          </div>

                          <div className="space-y-1 pt-0.5 text-[10px] opacity-85">
                            <p><strong>Customer:</strong> {selectedOrderForPrint.customerName}</p>
                            <p><strong>Phone:</strong> {selectedOrderForPrint.phone}</p>
                            {selectedOrderForPrint.customerEmail && <p><strong>Email:</strong> {selectedOrderForPrint.customerEmail}</p>}
                            <p><strong>Service:</strong> {selectedOrderForPrint.serviceType.toUpperCase()}</p>
                            {selectedOrderForPrint.serviceType === 'alteration' ? (
                              <div className="space-y-1 pt-0.5">
                                <p className="font-bold underline">Items:</p>
                                {selectedOrderForPrint.details.items?.map((item, i) => (
                                  <div key={i} className="pl-2 border-l-2 border-slate-300 space-y-0.5">
                                    <p className="font-bold text-slate-900">• {item.garmentType} (€{item.price.toFixed(2)})</p>
                                    {item.alterations.length > 0 && <p className="text-[9px]">Tasks: {item.alterations.join(', ')}</p>}
                                    {item.customNote && <p className="text-[9px]">Note: {item.customNote}</p>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                <p><strong>Type:</strong> {selectedOrderForPrint.details.laundryService}</p>
                                {selectedOrderForPrint.details.weightKg && <p><strong>Qty/Wt:</strong> {selectedOrderForPrint.details.weightKg}</p>}
                              </>
                            )}
                          </div>
                          <div className="border-t border-dashed pt-2 flex justify-between font-bold text-[11px]">
                            <span>PAID ({selectedOrderForPrint.paymentMethod}):</span>
                            <span className={t.textAccent}>€{selectedOrderForPrint.total.toFixed(2)}</span>
                          </div>
                          <div className="text-center pt-2 text-[9px] text-slate-500 border-t border-dashed">
                            <p>Due: {selectedOrderForPrint.dueDate}</p>
                            <p className="font-bold text-slate-800 mt-0.5">*** PAID IN FULL ***</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-16 opacity-70 border border-dashed rounded-2xl ${t.subCardBg}`}>
                      <Printer className="w-8 h-8 mx-auto mb-3 opacity-60" />
                      <p className="text-xs">{text.submitReceiptPrompt}</p>
                    </div>
                  )}
                </div>

                {selectedOrderForPrint && (
                  <button 
                    onClick={() => window.print()}
                    className={`mt-4 w-full font-semibold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-md ${t.isLight ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                  >
                    <Printer className="w-4 h-4" /> {text.printReceiptsNow}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRICE BOOK MANAGEMENT TAB */}
        {activeTab === 'priceBook' && isAdmin && (
          <div className="space-y-6">
            <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Tag className={`w-6 h-6 ${t.textAccent}`} /> Price Book & Alterations Customizer
                  </h2>
                  <p className="text-xs opacity-75">Add, edit, rename, or remove garment categories and repair options instantly.</p>
                </div>
                <button
                  onClick={handleResetPriceBookDefaults}
                  className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
                >
                  🔄 Reset & Clean Duplicates
                </button>
              </div>

              <form onSubmit={handleAddPriceItem} className={`p-5 rounded-2xl border space-y-4 ${t.subCardBg}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider">Add New Repair Task or Garment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Garment Category (Pre-written selection)</label>
                    <select
                      value={newGarmentCategory}
                      onChange={(e) => setNewGarmentCategory(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    >
                      {GARMENTS.map(g => (
                        <option key={g.key} value={g.key}>{g.en}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Task / Fix Name (e.g. Custom Taper)</label>
                    <input 
                      type="text"
                      required
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      placeholder="e.g. Heavy Duty Patch"
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Price (€)</label>
                    <input 
                      type="number"
                      step="0.50"
                      required
                      value={newTaskPrice}
                      onChange={(e) => setNewTaskPrice(e.target.value)}
                      placeholder="15.00"
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className={`font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 ${t.primary}`}
                >
                  <Plus className="w-4 h-4" /> Save to Price Book
                </button>
              </form>

              <div className="pt-2 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <h3 className="text-sm font-bold">Current Price Book Items ({filteredPriceBook.length} of {activePriceBook.length})</h3>
                  
                  {/* Search Bar for Price Book */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                    <input 
                      type="text"
                      placeholder="Search price book..."
                      value={priceBookSearchTerm}
                      onChange={(e) => setPriceBookSearchTerm(e.target.value)}
                      className={`pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none ${t.borderFocus} ${t.innerInputBg} w-64`}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-700/50 opacity-70">
                        <th className="py-3 px-3">Garment Category</th>
                        <th className="py-3 px-3">Repair / Task Name</th>
                        <th className="py-3 px-3">Price</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/20">
                      {filteredPriceBook.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-10 opacity-60">No price items match your search.</td>
                        </tr>
                      ) : (
                        filteredPriceBook.map((item) => {
                          const isEditing = editingPriceId === item.docId;
                          return (
                            <tr key={item.docId || item.name} className="hover:bg-slate-500/5 transition-colors">
                              <td className="py-3 px-3 font-semibold text-teal-400">{item.category}</td>
                              <td className="py-3 px-3">
                                {isEditing ? (
                                  <input 
                                    type="text"
                                    value={editValues.name}
                                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                    className={`border rounded-lg px-2 py-1 text-xs w-full ${t.innerInputBg}`}
                                  />
                                ) : (
                                  <span className="font-bold">{item.name}</span>
                                )}
                              </td>
                              <td className="py-3 px-3 font-mono font-extrabold">
                                {isEditing ? (
                                  <input 
                                    type="number"
                                    step="0.50"
                                    value={editValues.price}
                                    onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                                    className={`border rounded-lg px-2 py-1 text-xs w-24 ${t.innerInputBg}`}
                                  />
                                ) : (
                                  `From €${Number(item.price).toFixed(2)}`
                                )}
                              </td>
                              <td className="py-3 px-3 text-right space-x-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleUpdatePriceItem(item.docId)}
                                      className="px-3 py-1 bg-teal-500 text-slate-950 font-bold rounded-lg text-[11px]"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingPriceId(null)}
                                      className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingPriceId(item.docId);
                                        setEditValues({ name: item.name, price: item.price });
                                      }}
                                      className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-[11px] inline-flex items-center gap-1"
                                    >
                                      <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                    <button
                                      onClick={() => deletePriceItem(item.docId)}
                                      className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px]"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && isAdmin && (
          <div className="space-y-6">
            <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className={`w-6 h-6 ${t.textAccent}`} /> Low Stock Alert & Tailoring Supplies Inventory
                  </h2>
                  <p className="text-xs opacity-75">Track essential threads, zippers, hangers, and cleaning bags to prevent running out mid-week.</p>
                </div>
              </div>

              <form onSubmit={handleAddInventoryItem} className={`p-5 rounded-2xl border space-y-4 ${t.subCardBg}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider">Add New Supply Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Item Name</label>
                    <input 
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Heavy Duty Thread (Navy)"
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Initial Quantity</label>
                    <input 
                      type="number"
                      required
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      placeholder="10"
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Low Stock Alert Min</label>
                    <input 
                      type="number"
                      required
                      value={newItemMinQty}
                      onChange={(e) => setNewItemMinQty(e.target.value)}
                      placeholder="3"
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className={`font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 ${t.primary}`}
                >
                  <Plus className="w-4 h-4" /> Add to Inventory
                </button>
              </form>

              <div className="pt-2 overflow-x-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold">Current Supplies Stock</h3>
                  <span className="text-xs opacity-75">{inventoryItems.length} items tracked</span>
                </div>
                <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-700/50 opacity-70">
                      <th className="py-3 px-3">Supply Item</th>
                      <th className="py-3 px-3">SKU / Code</th>
                      <th className="py-3 px-3">Current Qty</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Quick Adjust</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {inventoryItems.map(item => {
                      const isLow = item.quantity <= item.minQuantity;
                      return (
                        <tr key={item.docId} className={`hover:bg-slate-500/5 transition-colors ${isLow ? 'bg-rose-500/5' : ''}`}>
                          <td className="py-3 px-3 font-semibold flex items-center gap-2">
                            {isLow && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />}
                            {item.name}
                          </td>
                          <td className="py-3 px-3 font-mono opacity-80">{item.sku}</td>
                          <td className={`py-3 px-3 font-mono font-extrabold ${isLow ? 'text-rose-400 text-sm' : ''}`}>
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-3">
                            {isLow ? (
                              <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                LOW STOCK ALERT
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right space-x-1">
                            <button
                              onClick={() => updateInventoryQty(item.docId, item.quantity, -1)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
                            >
                              -
                            </button>
                            <button
                              onClick={() => updateInventoryQty(item.docId, item.quantity, 1)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
                            >
                              +
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => deleteInventoryItem(item.docId)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px]"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER VISITS & HISTORY TAB */}
        {activeTab === 'loyalty' && isAdmin && (
          <div className="space-y-6">
            <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className={`w-6 h-6 ${t.textAccent}`} /> Customer Visit & Order History Tracker
                </h2>
                <p className="text-xs opacity-75">Track repeat customers, total visit counts, and lifetime spending automatically grouped by phone number. Click any customer row to view their full order history.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">Total Unique Customers</p>
                  <p className={`text-2xl font-extrabold ${t.textAccent}`}>{customers.length}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">Repeat Visitors (2+ Orders)</p>
                  <p className="text-2xl font-extrabold text-teal-400">
                    {customers.filter(c => c.totalVisits >= 2).length}
                  </p>
                </div>
              </div>

              <div className="pt-4 overflow-x-auto">
                <h3 className="text-sm font-bold mb-3">Customer Directory & Lifetime Spend (Click row to view history)</h3>
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-700/50 opacity-70">
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Phone Number</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Total Orders</th>
                      <th className="py-3 px-3">Total Lifetime Spend</th>
                      <th className="py-3 px-3">Last Visit</th>
                      <th className="py-3 px-3 text-right">View History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-10 opacity-60">No customer records yet. Create tickets using customer phone numbers to begin tracking.</td>
                      </tr>
                    ) : (
                      customers.map((c, i) => (
                        <tr 
                          key={i} 
                          onClick={() => setSelectedCustomerForHistory(c)}
                          className="hover:bg-teal-500/10 cursor-pointer transition-colors group"
                        >
                          <td className="py-3 px-3 font-semibold group-hover:text-teal-400 flex items-center gap-1.5">
                            {c.name}
                          </td>
                          <td className="py-3 px-3 font-mono">{c.phone}</td>
                          <td className="py-3 px-3 font-mono opacity-80">{c.email || '—'}</td>
                          <td className="py-3 px-3 font-bold font-mono">{c.totalVisits} orders</td>
                          <td className="py-3 px-3 font-bold text-teal-400">€{(c.totalSpent || 0).toFixed(2)}</td>
                          <td className="py-3 px-3 opacity-80">{c.lastVisit || '—'}</td>
                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] font-bold">
                              <Eye className="w-3.5 h-3.5" /> History
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className={`border rounded-3xl p-4 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-lg font-bold">{text.ticketHistory}</h2>
              <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 opacity-50" />
                  <input 
                    type="text"
                    placeholder={text.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full sm:w-auto pl-9 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs border focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                >
                  <option value="All">{text.allStatuses}</option>
                  <option value="Pending">{text.pending}</option>
                  <option value="In Progress">{text.inProgress}</option>
                  <option value="Completed">{text.completed}</option>
                </select>
              </div>
            </div>

            <div className="block sm:hidden space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 opacity-60 text-xs">No orders found.</div>
              ) : (
                filteredOrders.map(o => (
                  <div key={o.docId} className={`p-4 rounded-2xl border space-y-3 ${t.subCardBg}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-mono font-black text-sm ${t.textAccent}`}>#{o.id}</span>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.docId, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${t.innerInputBg}`}
                      >
                        <option value="Pending">{text.pending}</option>
                        <option value="In Progress">{text.inProgress}</option>
                        <option value="Completed">{text.completed}</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p><strong>{text.customer}:</strong> {o.customerName}</p>
                      <p><strong>{text.phone}:</strong> {o.phone}</p>
                      {o.customerEmail && <p><strong>Email:</strong> {o.customerEmail}</p>}
                      <p><strong>{text.service}:</strong> <span className="uppercase">{o.serviceType}</span></p>
                      <p><strong>{text.readyDate}:</strong> {o.dueDate}</p>
                      <p><strong>{text.total}:</strong> <span className="font-bold text-teal-500">€{o.total.toFixed(2)}</span></p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/30">
                      <button
                        onClick={() => {
                          setSelectedOrderForPrint(o);
                          setActiveTab('intake');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium text-white ${t.isLight ? 'bg-slate-800' : 'bg-slate-700'}`}
                      >
                        {text.print}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => deleteOrder(o.docId)}
                          className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-medium"
                        >
                          {text.delete}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className={`border-b text-xs uppercase opacity-70 ${t.isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                    <th className="py-3 px-4">{text.tagId}</th>
                    <th className="py-3 px-4">{text.customer}</th>
                    <th className="py-3 px-4">{text.phone}</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">{text.service}</th>
                    <th className="py-3 px-4">{text.readyDate}</th>
                    <th className="py-3 px-4">{text.total}</th>
                    <th className="py-3 px-4">{text.status}</th>
                    <th className="py-3 px-4 text-right">{text.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30 text-xs">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-12 opacity-60">No orders found.</td>
                    </tr>
                  ) : (
                    filteredOrders.map(o => (
                      <tr key={o.docId} className="hover:bg-slate-500/5 transition-colors">
                        <td className={`py-4 px-4 font-mono font-black text-sm ${t.textAccent}`}>#{o.id}</td>
                        <td className="py-4 px-4 font-semibold">{o.customerName}</td>
                        <td className="py-4 px-4 font-mono">{o.phone}</td>
                        <td className="py-4 px-4 font-mono opacity-80">{o.customerEmail || '—'}</td>
                        <td className="py-4 px-4 uppercase font-medium">{o.serviceType}</td>
                        <td className="py-4 px-4">{o.dueDate}</td>
                        <td className="py-4 px-4 font-bold">€{o.total.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <select
                            value={o.status}
                            onChange={(e) => updateStatus(o.docId, e.target.value)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${t.innerInputBg}`}
                          >
                            <option value="Pending">{text.pending}</option>
                            <option value="In Progress">{text.inProgress}</option>
                            <option value="Completed">{text.completed}</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrderForPrint(o);
                              setActiveTab('intake');
                            }}
                            className={`px-3 py-1 rounded-lg font-medium text-white ${t.isLight ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                          >
                            {text.print}
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteOrder(o.docId)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg font-medium"
                            >
                              {text.delete}
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
            <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">Smart Business Analytics & Reports</h2>
                  <p className="text-xs opacity-75">Performance metrics, financial summaries, and comparative period trackers.</p>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`flex p-1.5 rounded-2xl border ${t.navToggleBg}`}>
                    <button
                      onClick={() => { setReportTimeframe('day'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'day' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('week'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'week' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('month'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'month' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('year'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'year' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      This Year
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                      title="Export CSV / Excel report"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Export Excel (CSV)
                    </button>
                    <button
                      onClick={exportToPDF}
                      className={`px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${t.isLight ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                      title="Export PDF / Printable Report"
                    >
                      <FileText className="w-4 h-4" /> Export PDF Report
                    </button>
                  </div>
                </div>
              </div>

              {revenueMultiplier !== 1.00 && (
                <div className="bg-slate-800 border border-slate-700 text-slate-300 p-4 rounded-2xl text-xs flex items-center justify-between flex-wrap gap-2">
                  <span>Calibration Mode Active: Reports scaled by <strong>{Math.round(revenueMultiplier * 100)}%</strong>.</span>
                  <button 
                    onClick={() => setRevenueMultiplier(1.00)}
                    className="underline font-bold text-teal-400 hover:text-teal-300"
                  >
                    Reset to 100%
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Gross Revenue</p>
                  <h3 className={`text-2xl font-extrabold ${t.textAccent}`}>€{periodRevenue.toFixed(2)}</h3>
                </div>
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Total Expenses</p>
                  <h3 className="text-2xl font-extrabold text-rose-400">€{periodExpenses.toFixed(2)}</h3>
                </div>
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Net Operating Profit</p>
                  <h3 className={`text-2xl font-extrabold ${periodNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    €{periodNetProfit.toFixed(2)}
                  </h3>
                </div>
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Total Orders</p>
                  <h3 className={`text-2xl font-extrabold ${t.textAccent}`}>{periodOrderCount}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-4`}>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${t.textAccent}`} /> Service Revenue Split
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span>✂️ Alterations</span>
                      <span className="font-bold">€{alterationRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>👔 Laundry</span>
                      <span className="font-bold">€{laundryRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-4`}>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className={`w-4 h-4 ${t.textAccent}`} /> Payment Breakdown
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span>💳 Card Payments</span>
                      <span className="font-bold">€{cardRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>💵 Cash Payments</span>
                      <span className="font-bold">€{cashRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'bookkeeping' && isAdmin && (
          <div className="space-y-6">
            <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">Business Expense Bookkeeping</h2>
                  <p className="text-xs opacity-75">Record expenses below. Independent and unscaled.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={exportExpensesToCSV}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Export Expenses (CSV)
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-wrap items-center gap-4 ${t.subCardBg}`}>
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-400" /> Custom Date Range:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <input 
                    type="date"
                    value={startDateFilter}
                    style={{ colorScheme: dateInputColorScheme }}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${t.innerInputBg}`}
                  />
                  <span className="text-xs opacity-60">to</span>
                  <input 
                    type="date"
                    value={endDateFilter}
                    style={{ colorScheme: dateInputColorScheme }}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${t.innerInputBg}`}
                  />
                </div>
                {(startDateFilter || endDateFilter) && (
                  <button
                    onClick={() => { setStartDateFilter(''); setEndDateFilter(''); }}
                    className="text-xs text-teal-400 underline font-semibold hover:text-teal-300 ml-auto"
                  >
                    Clear Custom Range
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">Gross Revenue</p>
                  <p className={`text-xl font-extrabold ${t.textAccent}`}>€{periodRevenue.toFixed(2)}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">Total Expenses</p>
                  <p className="text-xl font-extrabold text-rose-400">€{periodExpenses.toFixed(2)}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">Net Operating Profit</p>
                  <p className={`text-xl font-extrabold ${periodNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    €{periodNetProfit.toFixed(2)}
                  </p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">Profit Margin</p>
                  <p className={`text-xl font-extrabold ${profitMargin >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                    {profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddExpense} className={`p-6 rounded-2xl border space-y-4 ${t.subCardBg}`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Wallet className={`w-4 h-4 ${t.textAccent}`} /> Record New Business Spend
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={isRecurringMonthly}
                      onChange={(e) => setIsRecurringMonthly(e.target.checked)}
                      className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                    />
                    <span className="flex items-center gap-1"><Repeat className="w-3.5 h-3.5 text-teal-400" /> Recurring Monthly Bill</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Date</label>
                    <input 
                      type="date"
                      required
                      value={expenseDate}
                      style={{ colorScheme: dateInputColorScheme }}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Description / Vendor</label>
                    <input 
                      type="text"
                      required
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      placeholder="e.g. Electric Ireland, Virgin Media, Rent"
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Category</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    >
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 items-end">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">Amount (€)</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className={`w-full md:w-auto font-bold py-2.5 px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${t.primary}`}
                    >
                      <Plus className="w-4 h-4" /> Record Expense
                    </button>
                  </div>
                </div>
              </form>

              <div className="pt-4 overflow-x-auto">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <h3 className="text-sm font-bold">Recorded Expenses Log</h3>
                  <span className="font-mono text-sm font-extrabold text-rose-400">Total: €{periodExpenses.toFixed(2)}</span>
                </div>
                <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-700/50 opacity-70">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {filteredExpensesByTimeframe.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 opacity-60">No expenses recorded for this timeframe.</td>
                      </tr>
                    ) : (
                      filteredExpensesByTimeframe.map(ex => (
                        <tr key={ex.docId} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3 px-3 font-mono">{ex.date || ex.createdAt?.split('T')[0]}</td>
                          <td className="py-3 px-3 font-semibold flex items-center gap-2">
                            {ex.description}
                            {ex.isRecurring && (
                              <span className="bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Repeat className="w-3 h-3" /> Monthly
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 opacity-80">{ex.category}</td>
                          <td className="py-3 px-3 font-bold text-rose-400">€{ex.amount.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => deleteExpense(ex.docId)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px]"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Spending Breakdown by Category */}
              <div className={`p-6 rounded-2xl border space-y-4 ${t.subCardBg}`}>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <PieChart className={`w-4 h-4 ${t.textAccent}`} /> Spending Breakdown by Category (%)
                </h3>
                <div className="space-y-3 pt-1">
                  {EXPENSE_CATEGORIES.map(cat => {
                    const catTotal = categoryTotals[cat.key] || 0;
                    const percentage = periodExpenses > 0 ? (catTotal / periodExpenses) * 100 : 0;
                    return (
                      <div key={cat.key} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span>{cat.label}</span>
                          <span className="font-mono">€{catTotal.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-900/40 rounded-full h-2.5 overflow-hidden border border-slate-700/40">
                          <div 
                            className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Palette className={`w-5 h-5 ${t.textAccent}`} /> Appearance & Theme Settings
              </h2>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setThemeMode('teal-dark')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${themeMode === 'teal-dark' ? 'border-teal-500 bg-teal-500/10 shadow-md' : 'border-slate-700 bg-slate-900'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                  <p className="text-xs font-bold text-white">Teal Dark</p>
                </button>

                <button
                  onClick={() => setThemeMode('teal-light')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${themeMode === 'teal-light' ? 'border-teal-600 bg-teal-100 text-slate-900 shadow-md' : 'border-slate-300 bg-white text-slate-900'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-teal-600"></div>
                  <p className="text-xs font-bold">Teal Light (Default)</p>
                </button>
              </div>
            </div>

            {isAdmin && (
              <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal className={`w-5 h-5 ${t.textAccent}`} /> Display Scaling & Metrics Calibration
                </h2>

                {!isOptimizationUnlocked ? (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs font-semibold">Enter PIN to Access Calibration</p>
                    {optimizationPinError && (
                      <p className="text-xs text-rose-400 font-medium">Incorrect PIN. Try again.</p>
                    )}
                    <div className="flex gap-3">
                      <input 
                        type="password"
                        maxLength="4"
                        value={optimizationPin}
                        onChange={(e) => setOptimizationPin(e.target.value)}
                        placeholder="••••"
                        className={`w-32 border rounded-xl px-4 py-2.5 text-sm tracking-widest text-center font-mono focus:outline-none ${t.innerInputBg}`}
                      />
                      <button
                        onClick={() => {
                          if (optimizationPin === '3256') {
                            setIsOptimizationUnlocked(true);
                            setOptimizationPinError(false);
                            setOptimizationPin('');
                          } else {
                            setOptimizationPinError(true);
                          }
                        }}
                        className={`px-6 py-2.5 font-bold rounded-xl text-xs transition-all shadow-md ${t.primary}`}
                      >
                        Unlock
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={t.textAccent}>Calibration Mode Unlocked</span>
                      <button 
                        onClick={() => setIsOptimizationUnlocked(false)}
                        className="opacity-70 hover:opacity-100 underline"
                      >
                        Lock
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Display Scale Multiplier</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range"
                          min="0.50"
                          max="1.00"
                          step="0.01"
                          value={revenueMultiplier}
                          onChange={(e) => setRevenueMultiplier(Number(e.target.value))}
                          className="w-full cursor-pointer accent-teal-500"
                        />
                        <span className={`font-mono text-sm font-bold w-16 text-right ${t.textAccent}`}>
                          {Math.round(revenueMultiplier * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
