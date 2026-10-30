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
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
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
  CheckCircle2
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

  // Save theme preference whenever it changes
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

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
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
    { key: 'Rent & Utilities', label: 'Rent & Utilities' },
    { key: 'Equipment & Maintenance', label: 'Equipment & Maintenance' },
    { key: 'Payroll & Subcontractors', label: 'Payroll & Subcontractors' },
    { key: 'Miscellaneous', label: 'Miscellaneous' },
  ];

  const GARMENTS = [
    { key: 'Trousers / Jeans', en: 'Trousers / Jeans', ru: 'Брюки / Джинсы' },
    { key: 'Suit Jacket / Blazer', en: 'Suit Jacket / Blazer', ru: 'Пиджак / Блейзер' },
    { key: 'Dress / Formal Wear', en: 'Dress / Formal Wear', ru: 'Платье / Нарядная одежда' },
    { key: 'Skirt', en: 'Skirt', ru: 'Юбка' },
    { key: 'Shirt / Blouse', en: 'Shirt / Blouse', ru: 'Рубашка / Блузка' },
    { key: 'Coat / Jacket', en: 'Coat / Jacket', ru: 'Пальто / Куртка' },
    { key: 'Curtains / Home Textiles', en: 'Curtains / Home Textiles', ru: 'Шторы / Домашний текстиль' }
  ];

  const GARMENT_ALTERATIONS = {
    'Trousers / Jeans': [
      { nameEn: 'Standard Hemming', nameRu: 'Стандартный подшив низа', price: 12.00 },
      { nameEn: 'Original Hemming (Keep Fade)', nameRu: 'Сохранение оригинального низа', price: 15.00 },
      { nameEn: 'Waist Take-in / Let-out', nameRu: 'Ушив / Расшив по поясу', price: 16.00 },
      { nameEn: 'Full Zip Replacement', nameRu: 'Замена молнии полностью', price: 18.00 },
      { nameEn: 'Zip Runner / Slider Replacement', nameRu: 'Замена бегунка молнии', price: 8.00 },
      { nameEn: 'Taper Legs', nameRu: 'Заужение штанин', price: 18.00 },
      { nameEn: 'Patch / Mending', nameRu: 'Штопка / Заплатка', price: 8.00 },
      { nameEn: 'New Button / Hook & Bar', nameRu: 'Новая пуговица / крючок', price: 5.00 }
    ],
    'Suit Jacket / Blazer': [
      { nameEn: 'Sleeve Shortening (Plain)', nameRu: 'Укорачивание рукавов (простое)', price: 22.00 },
      { nameEn: 'Sleeve Shortening (Working Cuffs)', nameRu: 'Укорачивание рукавов (шлицы/петли)', price: 35.00 },
      { nameEn: 'Take in Side Seams', nameRu: 'Ушив по боковым швам', price: 28.00 },
      { nameEn: 'Shorten Length from Bottom', nameRu: 'Укорачивание длины снизу', price: 30.00 },
      { nameEn: 'Replace Lining', nameRu: 'Замена подкладки', price: 65.00 },
      { nameEn: 'Shoulder Adjustment', nameRu: 'Подгонка по плечам', price: 45.00 }
    ],
    'Dress / Formal Wear': [
      { nameEn: 'Hem Shortening (Single Layer)', nameRu: 'Укорачивание низа (однослойное)', price: 25.00 },
      { nameEn: 'Hem Shortening (Multi-Layer / Pleated)', nameRu: 'Укорачивание низа (многослойное/плиссе)', price: 40.00 },
      { nameEn: 'Take in Side Seams', nameRu: 'Ушив по боковым швам', price: 25.00 },
      { nameEn: 'Strap Adjustment', nameRu: 'Регулировка бретелей', price: 15.00 },
      { nameEn: 'Full Zip Replacement', nameRu: 'Замена молнии полностью', price: 22.00 },
      { nameEn: 'Zip Runner / Slider Replacement', nameRu: 'Замена бегунка молнии', price: 10.00 },
      { nameEn: 'Add Darts for Fit', nameRu: 'Добавление вытачек', price: 18.00 }
    ],
    'Skirt': [
      { nameEn: 'Hem Shortening', nameRu: 'Укорачивание низа юбки', price: 18.00 },
      { nameEn: 'Waist Take-in / Let-out', nameRu: 'Ушив / Расшив по поясу', price: 16.00 },
      { nameEn: 'Full Zip Replacement', nameRu: 'Замена молнии полностью', price: 18.00 },
      { nameEn: 'Zip Runner / Slider Replacement', nameRu: 'Замена бегунка молнии', price: 8.00 }
    ],
    'Shirt / Blouse': [
      { nameEn: 'Sleeve Shortening', nameRu: 'Укорачивание рукавов', price: 18.00 },
      { nameEn: 'Take in Side Seams (Slim fit)', nameRu: 'Ушив по бокам (притаивание)', price: 16.00 },
      { nameEn: 'Shorten Shirt Length', nameRu: 'Укорачивание длины рубашки', price: 15.00 },
      { nameEn: 'Add Back Darts', nameRu: 'Добавление вытачек на спине', price: 12.00 }
    ],
    'Coat / Jacket': [
      { nameEn: 'Sleeve Shortening', nameRu: 'Укорачивание рукавов', price: 25.00 },
      { nameEn: 'Full Zip Replacement (Heavy Duty)', nameRu: 'Замена молнии (тяжелая)', price: 28.00 },
      { nameEn: 'Zip Runner / Slider Replacement', nameRu: 'Замена бегунка молнии', price: 12.00 },
      { nameEn: 'Replace Buttons / Snaps', nameRu: 'Замена пуговиц / кнопок', price: 10.00 },
      { nameEn: 'Patch / Mending / Tear Repair', nameRu: 'Ремонт разрыва / штопка', price: 15.00 }
    ],
    'Curtains / Home Textiles': [
      { nameEn: 'Hemming per metre', nameRu: 'Подшив за метр', price: 15.00 },
      { nameEn: 'Alter Width per metre', nameRu: 'Изменение ширины за метр', price: 18.00 },
      { nameEn: 'Re-taping Header', nameRu: 'Замена шторной тесьмы', price: 22.00 },
      { nameEn: 'Cushion Cover Zip Replacement', nameRu: 'Замена молнии на чехле подушки', price: 12.00 }
    ]
  };

  const currentGarmentOptions = GARMENT_ALTERATIONS[garmentType] || [];

  const handleGarmentChange = (newGarment) => {
    setGarmentType(newGarment);
    setSelectedAlterations([]);
    setItemPrice('');
  };

  const toggleAlteration = (alt) => {
    const altName = lang === 'ru' ? alt.nameRu : alt.nameEn;
    if (selectedAlterations.includes(altName)) {
      setSelectedAlterations(selectedAlterations.filter(item => item !== altName));
      setItemPrice(prev => Math.max(0, Number(prev) - alt.price).toFixed(2));
    } else {
      setSelectedAlterations([...selectedAlterations, altName]);
      setItemPrice(prev => (Number(prev || 0) + alt.price).toFixed(2));
    }
  };

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
    
    // Reset current garment form for next item
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

  // Calculate total price automatically from cart (for alterations) or laundry price
  const calculatedTotal = serviceType === 'alteration' 
    ? garmentCart.reduce((sum, item) => sum + item.price, 0)
    : Number(laundryPrice || 0);

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

    const newOrder = {
      id: nextTagId,
      createdAt: new Date().toISOString(),
      serviceType,
      customerName: customerName.trim() || 'Valued Customer',
      phone,
      customerEmail: customerEmail.trim() || '',
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

      // Send Live Email via EmailJS if customer email is provided
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
          console.log('Digital receipt email successfully sent via EmailJS!');
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

    const newExpense = {
      createdAt: new Date().toISOString(),
      date: expenseDate,
      description: expenseDescription.trim() || 'General Business Expense',
      category: expenseCategory,
      amount: amountNum
    };

    try {
      await addDoc(collection(db, 'expenses'), newExpense);
      setExpenseDescription('');
      setExpenseAmount('');
      showToast('Expense recorded successfully!');
    } catch (error) {
      console.error('Error adding expense: ', error);
      showToast('Failed to save expense to cloud.');
    }
  };

  const deleteExpense = async (docId) => {
    if (!isAdmin) return;
    if (confirm('Delete this expense record?')) {
      try {
        await deleteDoc(doc(db, 'expenses', docId));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const updateStatus = async (docId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', docId);
      await updateDoc(orderRef, { status: newStatus });

      // If status is changed to Completed and customer has email, send collection notification using template_boon6r6
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

  const deleteOrder = async (docId) => {
    if (!isAdmin) {
      showToast('Permission denied. Only Admin can delete orders.');
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

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  orders.forEach(o => {
    const d = new Date(o.createdAt).getDay();
    dayTotals[d] += (o.total * revenueMultiplier);
  });
  const maxDayRevenue = Math.max(...dayTotals, 1);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthTotals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    if (d.getFullYear() === now.getFullYear()) {
      monthTotals[d.getMonth()] += (o.total * revenueMultiplier);
    }
  });
  const maxMonthRevenue = Math.max(...monthTotals, 1);

  const currentYearNum = now.getFullYear();
  const yearLabels = [currentYearNum - 3, currentYearNum - 2, currentYearNum - 1, currentYearNum];
  const yearTotals = [0, 0, 0, 0];
  orders.forEach(o => {
    const y = new Date(o.createdAt).getFullYear();
    const idx = yearLabels.indexOf(y);
    if (idx !== -1) {
      yearTotals[idx] += (o.total * revenueMultiplier);
    }
  });
  const maxYearRevenue = Math.max(...yearTotals, 1);

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

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${t.appBg} relative`}>
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

      <header className={`border-b px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-3 sm:gap-4 shadow-md ${t.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-14 sm:w-16 h-10 flex items-center justify-center">
            <img 
              src={logoImg} 
              alt="ALiCo Logo" 
              className="w-full h-full object-contain"
              onError={(e)=>{e.target.style.display='none'}}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">ALiCo</h1>
              <span className={`font-semibold text-xs sm:text-sm px-2 py-0.5 rounded-md border ${t.primaryBadge}`}>Dublin</span>
              <span className="text-[10px] opacity-70 font-mono hidden md:inline">({user.email} - {isAdmin ? 'Admin' : 'Employee'})</span>
            </div>
            <p className="text-[11px] sm:text-xs opacity-80 font-medium truncate max-w-[200px] sm:max-w-none">{text.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {revenueMultiplier !== 1.00 && (
            <span className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-semibold hidden lg:flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-400" /> Scale: {Math.round(revenueMultiplier * 100)}%
            </span>
          )}

          <button
            onClick={() => setIsTerminalLocked(true)}
            className="px-2.5 sm:px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Lock Terminal against accidental clicks"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden xl:inline">Lock Screen</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${t.navToggleBg}`}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-teal-400" /> : <Maximize className="w-4 h-4 text-teal-400" />}
            <span className="hidden xl:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>

          <button
            onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
            className={`px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${t.navToggleBg}`}
            title="Toggle Language / Сменить язык"
          >
            <Globe className="w-4 h-4 text-teal-400" />
            {lang === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}
          </button>

          <div className={`flex flex-wrap p-1 rounded-2xl border shadow-inner gap-1 ${t.navToggleBg}`}>
            <button 
              onClick={() => setActiveTab('intake')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'intake' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
            >
              <PlusCircle className="w-4 h-4" /> <span className="hidden sm:inline">{text.newTicket}</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
            >
              <Clock className="w-4 h-4" /> <span className="hidden sm:inline">{text.orders}</span> <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${t.textAccent}`}>{orders.length}</span>
            </button>
            
            {isAdmin && (
              <>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                >
                  <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">{text.reports}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('bookkeeping')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'bookkeeping' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                >
                  <Wallet className="w-4 h-4" /> <span className="hidden sm:inline">{text.bookkeeping}</span>
                </button>
              </>
            )}

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
            >
              <Settings className="w-4 h-4" /> <span className="hidden sm:inline">{text.settings}</span>
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold flex items-center gap-1.5"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
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
              <div className={`lg:col-span-2 border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-8 ${t.cardBg}`}>
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
                        placeholder="e.g. 087 123 4567"
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                  </div>

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

                      {/* Display Items Already Added to Ticket Cart */}
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

                      {/* Garment Builder Section */}
                      <div className={`border rounded-2xl p-5 space-y-4 ${t.subCardBg}`}>
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
                                {lang === 'ru' ? g.ru : g.en}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-3">
                            {text.fixOptions} {GARMENTS.find(g => g.key === garmentType)?.[lang === 'ru' ? 'ru' : 'en'] || garmentType}:
                          </label>
                          <div className="flex flex-wrap gap-2.5">
                            {currentGarmentOptions.map((alt) => {
                              const altName = lang === 'ru' ? alt.nameRu : alt.nameEn;
                              const isSelected = selectedAlterations.includes(altName);
                              return (
                                <button
                                  type="button"
                                  key={alt.nameEn}
                                  onClick={() => toggleAlteration(alt)}
                                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${isSelected ? t.buttonSelected : `${t.isLight ? 'bg-white border-slate-300 text-slate-800 hover:border-slate-400' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'}`}`}
                                >
                                  {isSelected && <Check className={`w-3.5 h-3.5 ${t.textAccent}`} />}
                                  + {altName} (€{alt.price.toFixed(2)})
                                </button>
                              );
                            })}
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

                  <div className="pt-6 border-t border-opacity-30 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.totalPrice}</label>
                      <input 
                        type="number" 
                        step="0.50"
                        required
                        value={serviceType === 'alteration' ? calculatedTotal.toFixed(2) : laundryPrice}
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

              <div className={`border rounded-3xl p-6 shadow-2xl backdrop-blur-sm flex flex-col justify-between ${t.cardBg}`}>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Printer className={`w-4 h-4 ${t.textAccent}`} /> {text.thermalPreview}
                  </h3>
                  {selectedOrderForPrint ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {['CUSTOMER COPY', 'TAG / RACK COPY', 'ACCOUNTING COPY'].map((copyType, idx) => (
                        <div key={idx} className="bg-white text-slate-900 p-5 rounded-2xl font-mono text-xs shadow-inner space-y-3 relative border-2 border-dashed border-slate-300">
                          <div className="absolute top-2 right-2 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                            {copyType}
                          </div>
                          
                          <div className="text-center border-b border-dashed pb-3 pt-2">
                            <p className="font-extrabold text-xs tracking-wide">ALiCo DUBLIN</p>
                            
                            <div className="my-2 py-2 px-6 bg-slate-900 text-teal-400 font-black text-4xl tracking-widest rounded-2xl inline-block shadow-lg">
                              #{selectedOrderForPrint.id}
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-1 text-[11px] opacity-80">
                            <p><strong>Customer:</strong> {selectedOrderForPrint.customerName}</p>
                            <p><strong>Phone:</strong> {selectedOrderForPrint.phone}</p>
                            {selectedOrderForPrint.customerEmail && <p><strong>Email:</strong> {selectedOrderForPrint.customerEmail}</p>}
                            <p><strong>Service:</strong> {selectedOrderForPrint.serviceType.toUpperCase()}</p>
                            {selectedOrderForPrint.serviceType === 'alteration' ? (
                              <div className="space-y-2 pt-1">
                                <p className="font-bold underline">Items:</p>
                                {selectedOrderForPrint.details.items?.map((item, i) => (
                                  <div key={i} className="pl-2 border-l-2 border-slate-300 space-y-0.5">
                                    <p className="font-bold text-slate-900">• {item.garmentType} (€{item.price.toFixed(2)})</p>
                                    {item.alterations.length > 0 && <p className="text-[10px]">Tasks: {item.alterations.join(', ')}</p>}
                                    {item.customNote && <p className="text-[10px]">Note: {item.customNote}</p>}
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
                          <div className="border-t border-dashed pt-3 flex justify-between font-bold text-xs">
                            <span>PAID ({selectedOrderForPrint.paymentMethod}):</span>
                            <span className={t.textAccent}>€{selectedOrderForPrint.total.toFixed(2)}</span>
                          </div>
                          <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-dashed">
                            <p>Due: {selectedOrderForPrint.dueDate}</p>
                            <p className="font-bold text-slate-800 mt-1">*** PAID IN FULL ***</p>
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
                    className={`mt-6 w-full font-semibold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-md ${t.isLight ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                  >
                    <Printer className="w-4 h-4" /> {text.printReceiptsNow}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-lg font-bold">{text.ticketHistory}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 opacity-50" />
                  <input 
                    type="text"
                    placeholder={text.searchPlaceholder}
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
                  <option value="All">{text.allStatuses}</option>
                  <option value="Pending">{text.pending}</option>
                  <option value="In Progress">{text.inProgress}</option>
                  <option value="Completed">{text.completed}</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
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
                            onClick={() => setSelectedOrderForPrint(o)}
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
            <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
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
            <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
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

              {/* Custom Date Range Filter Bar */}
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
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Wallet className={`w-4 h-4 ${t.textAccent}`} /> Record New Business Spend
                </h3>
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
                      placeholder="e.g. Thread, Zippers, Rent"
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
                          <td className="py-3 px-3 font-semibold">{ex.description}</td>
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

            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
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
              <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
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
