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
  Minimize
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
  
  const [themeMode, setThemeMode] = useState('teal-dark');
  const [reportTimeframe, setReportTimeframe] = useState('month');
  const [isFullscreen, setIsFullscreen] = useState(false);

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
  const [nextTagId, setNextTagId] = useState(() => Math.floor(7000 + Math.random() * 900).toString());

  const isAdmin = user && user.email === 'alena9506@gmail.com';

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
      searchPlaceholder: 'Search name, phone, tag...',
      allStatuses: 'All Statuses',
      pending: 'Pending',
      inProgress: 'In Progress',
      readyPickup: 'Ready for Pickup',
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
      analyticsTitle: 'Smart Business Analytics & Reports',
      analyticsDesc: 'Performance metrics, financial summaries, and comparative period trackers.',
      timeframeDay: 'Today',
      timeframeWeek: 'This Week',
      timeframeMonth: 'This Month',
      timeframeYear: 'This Year',
      totalRevenue: 'Gross Revenue (Scaled)',
      totalExpenses: 'Total Expenses (Unscaled)',
      netProfit: 'Net Operating Profit',
      totalOrders: 'Total Orders',
      avgTicketValue: 'Average Ticket Value',
      paymentSplit: 'Payment Method Breakdown',
      serviceSplit: 'Service Revenue Split',
      bestDaysMeter: 'Performance Meter: Revenue by Day of Week',
      bestMonthsMeter: 'Performance Meter: Revenue by Month (This Year)',
      bestYearsMeter: 'Performance Meter: Revenue by Year (Historical)',
      exportCsv: 'Export Excel (CSV)',
      exportPdf: 'Export PDF Report',
      bookkeepingTitle: 'Business Expense Bookkeeping',
      bookkeepingDesc: 'Record expenses below. Spendings are kept independent and remain unscaled by the display calibration multiplier.',
      recordExpenseHeader: 'Record New Business Spend',
      expenseDateLabel: 'Date',
      expenseDescLabel: 'Description / Vendor',
      expenseCategoryLabel: 'Category',
      expenseDescPlaceholder: 'e.g. Thread, Zippers, Detergent, Rent',
      expenseAmountPlaceholder: 'Amount (€)',
      addExpenseBtn: 'Record Expense',
      expenseHistory: 'Recorded Expenses Log',
      exportExpensesCsv: 'Export Expenses (CSV)',
      customRangeLabel: 'Custom Date Range',
      grossRevenueCard: 'Gross Revenue',
      totalExpensesCard: 'Total Expenses',
      netOperatingProfitCard: 'Net Operating Profit',
      profitMarginCard: 'Profit Margin',
      spendingByCategory: 'Spending by Category',
      clearCustomRange: 'Clear Custom Range',
      catSupplies: 'Supplies & Materials',
      catRent: 'Rent & Utilities',
      catEquipment: 'Equipment & Maintenance',
      catPayroll: 'Payroll & Subcontractors',
      catMisc: 'Miscellaneous',
      optimizationTitle: 'Display Scaling & Metrics Calibration',
      optimizationDesc: 'Internal reporting factor adjustments for display calibration and comparative telemetry.',
      pinPrompt: 'Enter PIN to Access Calibration',
      unlockBtn: 'Unlock Calibration',
      multiplierLabel: 'Display Scale Multiplier',
      activeNotice: '⚠️ Calibration Mode Active: Reports are currently scaled by',
      appearanceTitle: 'Appearance & Theme Settings',
      appearanceDesc: 'Choose your preferred counter display theme for day or night shifts:',
      darkTheme: 'Teal Dark (Default)',
      lightTheme: 'Teal Light (Day Mode)',
      languageTitle: 'Language Settings',
      languageDesc: 'Choose interface language (Receipts remain in English):',
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
      searchPlaceholder: 'Поиск по имени, телефону...',
      allStatuses: 'Все статусы',
      pending: 'В ожидании',
      inProgress: 'В работе',
      readyPickup: 'Готов к выдаче',
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
      analyticsTitle: 'Аналитика и Отчеты',
      analyticsDesc: 'Показатели производительности и сравнительные отчеты.',
      timeframeDay: 'Сегодня',
      timeframeWeek: 'Эта неделя',
      timeframeMonth: 'Этот месяц',
      timeframeYear: 'Этот год',
      totalRevenue: 'Валовая выручка (Скорректированная)',
      totalExpenses: 'Все расходы (Полные)',
      netProfit: 'Чистая операционная прибыль',
      totalOrders: 'Всего заказов',
      avgTicketValue: 'Средний чек',
      paymentSplit: 'Распределение по способам оплаты',
      serviceSplit: 'Выручка по типам услуг',
      bestDaysMeter: 'Сравнение производительности по дням недели',
      bestMonthsMeter: 'Сравнение производительности по месяцам',
      bestYearsMeter: 'Сравнение производительности по годам',
      exportCsv: 'Экспорт Excel (CSV)',
      exportPdf: 'Экспорт PDF Отчета',
      bookkeepingTitle: 'Учет расходов и бухгалтерия',
      bookkeepingDesc: 'Записывайте расходы ниже. Расходы учитываются независимо и не зависят от коэффициента калибровки выручки.',
      recordExpenseHeader: 'Добавить новый расход',
      expenseDateLabel: 'Дата',
      expenseDescLabel: 'Описание / Поставщик',
      expenseCategoryLabel: 'Категория',
      expenseDescPlaceholder: 'напр. Нитки, Молнии, Порошок, Аренда',
      expenseAmountPlaceholder: 'Сумма (€)',
      addExpenseBtn: 'Добавить расход',
      expenseHistory: 'Журнал записанных расходов',
      exportExpensesCsv: 'Экспорт расходов (CSV)',
      customRangeLabel: 'Произвольный диапазон дат',
      grossRevenueCard: 'Валовая выручка',
      totalExpensesCard: 'Всего расходов',
      netOperatingProfitCard: 'Чистая операционная прибыль',
      profitMarginCard: 'Рентабельность (Маржа)',
      spendingByCategory: 'Расходы по категориям',
      clearCustomRange: 'Сбросить диапазон',
      catSupplies: 'Материалы и расходники',
      catRent: 'Аренда и коммунальные услуги',
      catEquipment: 'Оборудование и обслуживание',
      catPayroll: 'Зарплата и подрядчики',
      catMisc: 'Разное / Прочее',
      optimizationTitle: 'Масштабирование дисплея и калибровка метрик',
      optimizationDesc: 'Внутренняя регулировка коэффициентов отображения отчетов.',
      pinPrompt: 'Введите PIN для доступа к калибровке',
      unlockBtn: 'Разблокировать',
      multiplierLabel: 'Множитель масштабирования отображения',
      activeNotice: '⚠️ Режим калибровки активен: Отчеты скорректированы на коэффициент',
      appearanceTitle: 'Настройки темы оформления',
      appearanceDesc: 'Выберите тему интерфейса для дневной или ночной смены:',
      darkTheme: 'Тёмная тиловая (По умолчанию)',
      lightTheme: 'Светлая тиловая (Дневной режим)',
      languageTitle: 'Язык интерфейса',
      languageDesc: 'Выберите язык интерфейса (Чеки печатаются на английском):',
      signInTitle: 'Вход в терминал',
      emailLabel: 'Электронная почта',
      passwordLabel: 'Пароль',
      signInBtn: 'Войти в систему'
    }
  };

  const text = translations[lang] || translations.en;

  const EXPENSE_CATEGORIES = [
    { key: 'Supplies & Materials', label: text.catSupplies },
    { key: 'Rent & Utilities', label: text.catRent },
    { key: 'Equipment & Maintenance', label: text.catEquipment },
    { key: 'Payroll & Subcontractors', label: text.catPayroll },
    { key: 'Miscellaneous', label: text.catMisc },
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
    setAlterationPrice('');
  };

  const toggleAlteration = (alt) => {
    const altName = lang === 'ru' ? alt.nameRu : alt.nameEn;
    if (selectedAlterations.includes(altName)) {
      setSelectedAlterations(selectedAlterations.filter(item => item !== altName));
      setAlterationPrice(prev => Math.max(0, Number(prev) - alt.price).toFixed(2));
    } else {
      setSelectedAlterations([...selectedAlterations, altName]);
      setAlterationPrice(prev => (Number(prev || 0) + alt.price).toFixed(2));
    }
  };

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
      setNextTagId(Math.floor(7000 + Math.random() * 900).toString());

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

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid expense amount.');
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
      alert('Expense recorded successfully!');
    } catch (error) {
      console.error('Error adding expense: ', error);
      alert('Failed to save expense to cloud.');
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

  const now = new Date();

  // Helper date checker for timeframe or custom range
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

  // Apply scaling multiplier to revenue metrics only; expenses remain completely unscaled and independent
  const periodRevenue = filteredOrdersByTimeframe.reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;
  const periodExpenses = filteredExpensesByTimeframe.reduce((acc, ex) => acc + ex.amount, 0);
  const periodNetProfit = periodRevenue - periodExpenses;
  const profitMargin = periodRevenue > 0 ? (periodNetProfit / periodRevenue) * 100 : 0;

  const periodOrderCount = filteredOrdersByTimeframe.length;
  const avgTicket = periodOrderCount > 0 ? periodRevenue / periodOrderCount : 0;

  const cardRevenue = filteredOrdersByTimeframe.filter(o => o.paymentMethod?.includes('Card')).reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;
  const cashRevenue = filteredOrdersByTimeframe.filter(o => o.paymentMethod?.includes('Cash')).reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;

  const alterationRevenue = filteredOrdersByTimeframe.filter(o => o.serviceType === 'alteration').reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;
  const laundryRevenue = filteredOrdersByTimeframe.filter(o => o.serviceType === 'laundry').reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;

  // Category breakdown for expenses
  const categoryTotals = {};
  EXPENSE_CATEGORIES.forEach(cat => {
    categoryTotals[cat.key] = filteredExpensesByTimeframe
      .filter(ex => ex.category === cat.key)
      .reduce((sum, ex) => sum + ex.amount, 0);
  });

  // Day of Week Totals (with multiplier)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  orders.forEach(o => {
    const d = new Date(o.createdAt).getDay();
    dayTotals[d] += (o.total * revenueMultiplier);
  });
  const maxDayRevenue = Math.max(...dayTotals, 1);

  // Monthly Totals (Current Year, with multiplier)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthTotals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    if (d.getFullYear() === now.getFullYear()) {
      monthTotals[d.getMonth()] += (o.total * revenueMultiplier);
    }
  });
  const maxMonthRevenue = Math.max(...monthTotals, 1);

  // Yearly Totals (Last 4 Years, with multiplier)
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
    const headers = ['Tag ID', 'Date', 'Customer Name', 'Phone', 'Service Type', 'Payment Method', 'Status', 'Total (€)'];
    const rows = filteredOrdersByTimeframe.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleString(),
      `"${o.customerName || ''}"`,
      o.phone,
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
    const matchesSearch = o.phone.includes(searchTerm) || o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
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
    }
  };

  const t = themes[themeMode] || themes['teal-dark'];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${t.appBg}`}>
      <header className={`border-b px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-md ${t.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 flex items-center justify-center">
            <img 
              src={logoImg} 
              alt="ALiCo Logo" 
              className="w-full h-full object-contain"
              onError={(e)=>{e.target.style.display='none'}}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">ALiCo</h1>
              <span className={`font-semibold text-sm px-2 py-0.5 rounded-md border ${t.primaryBadge}`}>Dublin</span>
              <span className="text-[10px] opacity-70 ml-2 font-mono">({user.email} - {isAdmin ? 'Admin' : 'Employee'})</span>
            </div>
            <p className="text-xs opacity-80 font-medium">{text.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {revenueMultiplier !== 1.00 && (
            <span className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-400" /> Scale: {Math.round(revenueMultiplier * 100)}%
            </span>
          )}

          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${t.navToggleBg}`}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-teal-400" /> : <Maximize className="w-4 h-4 text-teal-400" />}
            <span className="hidden md:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>

          <button
            onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${t.navToggleBg}`}
            title="Toggle Language / Сменить язык"
          >
            <Globe className="w-4 h-4 text-teal-400" />
            {lang === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}
          </button>

          <div className={`flex p-1.5 rounded-2xl border shadow-inner ${t.navToggleBg}`}>
            <button 
              onClick={() => setActiveTab('intake')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'intake' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
            >
              <PlusCircle className="w-4 h-4" /> {text.newTicket}
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
            >
              <Clock className="w-4 h-4" /> {text.orders} <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${t.textAccent}`}>{orders.length}</span>
            </button>
            
            {isAdmin && (
              <>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                >
                  <BarChart3 className="w-4 h-4" /> {text.reports}
                </button>
                <button 
                  onClick={() => setActiveTab('bookkeeping')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'bookkeeping' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                >
                  <Wallet className="w-4 h-4" /> {text.bookkeeping}
                </button>
              </>
            )}

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
            >
              <Settings className="w-4 h-4" /> {text.settings}
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
                  <Scissors className="w-4 h-4" /> {text.alterationTicket}
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('laundry')}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm transition-all ${serviceType === 'laundry' ? t.serviceActive : 'opacity-75 hover:opacity-100'}`}
                >
                  <Shirt className="w-4 h-4" /> {text.laundryTicket}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`lg:col-span-2 border rounded-3xl p-8 shadow-2xl backdrop-blur-sm space-y-8 ${t.cardBg}`}>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.targetDate}</label>
                      <input 
                        type="date" 
                        value={dueDate}
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
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${isSelected ? t.buttonSelected : `${t.isLight ? 'bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'}`}`}
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

                  <div className="pt-6 border-t border-opacity-30 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="w-full md:w-1/2">
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.totalPrice}</label>
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
                            
                            {/* HUGE SIMPLE STANDOUT TICKET NUMBER */}
                            <div className="my-2 py-2 px-6 bg-slate-900 text-teal-400 font-black text-4xl tracking-widest rounded-2xl inline-block shadow-lg">
                              #{selectedOrderForPrint.id}
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-1 text-[11px] opacity-80">
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
                    className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Printer className="w-4 h-4" /> {text.printReceiptsNow}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className={`border rounded-3xl p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-lg font-bold">{text.ticketHistory}</h2>
              <div className="flex items-center gap-3">
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
                  <option value="Ready for Pickup">{text.readyPickup}</option>
                  <option value="Completed">{text.completed}</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs uppercase opacity-70 ${t.isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                    <th className="py-3 px-4">{text.tagId}</th>
                    <th className="py-3 px-4">{text.customer}</th>
                    <th className="py-3 px-4">{text.phone}</th>
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
                      <td colSpan="8" className="text-center py-12 opacity-60">No orders found.</td>
                    </tr>
                  ) : (
                    filteredOrders.map(o => (
                      <tr key={o.docId} className="hover:bg-slate-500/5 transition-colors">
                        <td className={`py-4 px-4 font-mono font-black text-sm ${t.textAccent}`}>#{o.id}</td>
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
                            <option value="Pending">{text.pending}</option>
                            <option value="In Progress">{text.inProgress}</option>
                            <option value="Ready for Pickup">{text.readyPickup}</option>
                            <option value="Completed">{text.completed}</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedOrderForPrint(o)}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
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
            <div className={`border rounded-3xl p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">{text.analyticsTitle}</h2>
                  <p className="text-xs opacity-75">{text.analyticsDesc}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex p-1.5 rounded-2xl border ${t.navToggleBg}`}>
                    <button
                      onClick={() => { setReportTimeframe('day'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'day' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.timeframeDay}
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('week'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'week' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.timeframeWeek}
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('month'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'month' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.timeframeMonth}
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('year'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'year' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.timeframeYear}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                      title="Export CSV / Excel report"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> {text.exportCsv}
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                      title="Export PDF / Printable Report"
                    >
                      <FileText className="w-4 h-4" /> {text.exportPdf}
                    </button>
                  </div>
                </div>
              </div>

              {revenueMultiplier !== 1.00 && (
                <div className="bg-slate-800 border border-slate-700 text-slate-300 p-4 rounded-2xl text-xs flex items-center justify-between">
                  <span>{text.activeNotice} <strong>{Math.round(revenueMultiplier * 100)}%</strong>. (Expenses remain completely independent and unscaled).</span>
                  <button 
                    onClick={() => setRevenueMultiplier(1.00)}
                    className="underline font-bold text-teal-400 hover:text-teal-300"
                  >
                    Reset to 100%
                  </button>
                </div>
              )}

              {/* Financial Summary Cards (Revenue, Expenses, Net Profit) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">{text.totalRevenue}</p>
                  <h3 className={`text-2xl font-extrabold ${t.textAccent}`}>€{periodRevenue.toFixed(2)}</h3>
                </div>
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">{text.totalExpenses}</p>
                  <h3 className="text-2xl font-extrabold text-rose-400">€{periodExpenses.toFixed(2)}</h3>
                </div>
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">{text.netProfit}</p>
                  <h3 className={`text-2xl font-extrabold ${periodNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    €{periodNetProfit.toFixed(2)}
                  </h3>
                </div>
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">{text.totalOrders}</p>
                  <h3 className={`text-2xl font-extrabold ${t.textAccent}`}>{periodOrderCount}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-4`}>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${t.textAccent}`} /> {text.serviceSplit}
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span>✂️ {lang === 'ru' ? 'Ателье' : 'Alterations'}</span>
                      <span className="font-bold">€{alterationRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>👔 {lang === 'ru' ? 'Прачечная' : 'Laundry'}</span>
                      <span className="font-bold">€{laundryRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-4`}>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className={`w-4 h-4 ${t.textAccent}`} /> {text.paymentSplit}
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span>💳 {lang === 'ru' ? 'Карта' : 'Card Payments'}</span>
                      <span className="font-bold">€{cardRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>💵 {lang === 'ru' ? 'Наличные' : 'Cash Payments'}</span>
                      <span className="font-bold">€{cashRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day of Week Performance Meter */}
              <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-4 pt-6`}>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${t.textAccent}`} /> {text.bestDaysMeter}
                </h4>
                <div className="grid grid-cols-7 gap-2 pt-2">
                  {dayNames.map((d, index) => {
                    const dayRev = dayTotals[index];
                    const percentage = Math.round((dayRev / maxDayRevenue) * 100);
                    return (
                      <div key={d} className="flex flex-col items-center space-y-2">
                        <div className="w-full bg-slate-950/40 h-32 rounded-xl flex items-end p-1.5">
                          <div 
                            className="w-full bg-teal-500 rounded-lg transition-all duration-500" 
                            style={{ height: `${Math.max(percentage, 8)}%` }}
                            title={`€${dayRev.toFixed(2)}`}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold opacity-80">{d}</span>
                        <span className="text-[10px] font-mono text-teal-400 font-semibold">€{dayRev.toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Performance Meter */}
              <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-4 pt-6`}>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${t.textAccent}`} /> {text.bestMonthsMeter} ({now.getFullYear()})
                </h4>
                <div className="grid grid-cols-12 gap-1.5 pt-2">
                  {monthNames.map((m, index) => {
                    const monthRev = monthTotals[index];
                    const percentage = Math.round((monthRev / maxMonthRevenue) * 100);
                    return (
                      <div key={m} className="flex flex-col items-center space-y-2">
                        <div className="w-full bg-slate-950/40 h-32 rounded-xl flex items-end p-1">
                          <div 
                            className="w-full bg-emerald-500 rounded-lg transition-all duration-500" 
                            style={{ height: `${Math.max(percentage, 8)}%` }}
                            title={`€${monthRev.toFixed(2)}`}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold opacity-80">{m}</span>
                        <span className="text-[9px] font-mono text-emerald-400 font-semibold">€{monthRev.toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Yearly Performance Meter */}
              <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-4 pt-6`}>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${t.textAccent}`} /> {text.bestYearsMeter}
                </h4>
                <div className="grid grid-cols-4 gap-4 pt-2">
                  {yearLabels.map((yr, index) => {
                    const yrRev = yearTotals[index];
                    const percentage = Math.round((yrRev / maxYearRevenue) * 100);
                    return (
                      <div key={yr} className="flex flex-col items-center space-y-2">
                        <div className="w-full bg-slate-950/40 h-36 rounded-xl flex items-end p-2">
                          <div 
                            className="w-full bg-cyan-500 rounded-lg transition-all duration-500" 
                            style={{ height: `${Math.max(percentage, 8)}%` }}
                            title={`€${yrRev.toFixed(2)}`}
                          ></div>
                        </div>
                        <span className="text-xs font-bold opacity-90">{yr}</span>
                        <span className="text-xs font-mono text-cyan-400 font-semibold">€{yrRev.toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'bookkeeping' && isAdmin && (
          <div className="space-y-6">
            <div className={`border rounded-3xl p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">{text.bookkeepingTitle}</h2>
                  <p className="text-xs opacity-75">{text.bookkeepingDesc}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={exportExpensesToCSV}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                    title="Export Expenses CSV for Accountant"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> {text.exportExpensesCsv}
                  </button>

                  <div className={`flex p-1.5 rounded-2xl border ${t.navToggleBg}`}>
                    <button
                      onClick={() => { setReportTimeframe('day'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'day' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.timeframeDay}
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('week'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'week' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.timeframeWeek}
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('month'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'month' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.timeframeMonth}
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('year'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'year' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.timeframeYear}
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Date Range Filter Bar */}
              <div className={`p-4 rounded-2xl border flex flex-wrap items-center gap-4 ${t.subCardBg}`}>
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-400" /> {text.customRangeLabel}:
                </span>
                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${t.innerInputBg}`}
                  />
                  <span className="text-xs opacity-60">to</span>
                  <input 
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${t.innerInputBg}`}
                  />
                </div>
                {(startDateFilter || endDateFilter) && (
                  <button
                    onClick={() => { setStartDateFilter(''); setEndDateFilter(''); }}
                    className="text-xs text-teal-400 underline font-semibold hover:text-teal-300 ml-auto"
                  >
                    {text.clearCustomRange}
                  </button>
                )}
              </div>

              {/* Financial Profit & Loss Header Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.grossRevenueCard}</p>
                  <p className={`text-xl font-extrabold ${t.textAccent}`}>€{periodRevenue.toFixed(2)}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.totalExpensesCard}</p>
                  <p className="text-xl font-extrabold text-rose-400">€{periodExpenses.toFixed(2)}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.netOperatingProfitCard}</p>
                  <p className={`text-xl font-extrabold ${periodNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    €{periodNetProfit.toFixed(2)}
                  </p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.profitMarginCard}</p>
                  <p className={`text-xl font-extrabold ${profitMargin >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                    {profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Expense Category Breakdown Summary Cards */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-80 mb-3">{text.spendingByCategory} ({startDateFilter ? text.customRangeLabel : reportTimeframe.toUpperCase()})</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {EXPENSE_CATEGORIES.map(cat => {
                    const catTotal = categoryTotals[cat.key] || 0;
                    const catPercentage = periodExpenses > 0 ? Math.round((catTotal / periodExpenses) * 100) : 0;
                    return (
                      <div key={cat.key} className={`p-4 rounded-2xl border ${t.subCardBg} space-y-1`}>
                        <p className="text-[11px] font-semibold truncate opacity-80" title={cat.label}>{cat.label}</p>
                        <p className="text-lg font-bold text-rose-400">€{catTotal.toFixed(2)}</p>
                        <p className="text-[10px] opacity-60 font-mono">{catPercentage}% of spend</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Expense Form */}
              <form onSubmit={handleAddExpense} className={`p-6 rounded-2xl border space-y-4 ${t.subCardBg}`}>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Wallet className={`w-4 h-4 ${t.textAccent}`} /> {text.recordExpenseHeader}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.expenseDateLabel}</label>
                    <input 
                      type="date"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.expenseDescLabel}</label>
                    <input 
                      type="text"
                      required
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      placeholder={text.expenseDescPlaceholder}
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.expenseCategoryLabel}</label>
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
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.expenseAmountPlaceholder}</label>
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
                      <Plus className="w-4 h-4" /> {text.addExpenseBtn}
                    </button>
                  </div>
                </div>
              </form>

              {/* Expense History Table */}
              <div className="pt-4 overflow-x-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold">{text.expenseHistory} ({startDateFilter ? text.customRangeLabel : reportTimeframe.toUpperCase()})</h3>
                  <span className="font-mono text-sm font-extrabold text-rose-400">Total: €{periodExpenses.toFixed(2)}</span>
                </div>
                <table className="w-full text-left border-collapse text-xs">
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
                      filteredExpensesByTimeframe.map(ex => {
                        const foundCat = EXPENSE_CATEGORIES.find(c => c.key === ex.category);
                        const displayCat = foundCat ? foundCat.label : ex.category;
                        return (
                          <tr key={ex.docId} className="hover:bg-slate-500/5 transition-colors">
                            <td className="py-3 px-3 font-mono">{ex.date || ex.createdAt?.split('T')[0]}</td>
                            <td className="py-3 px-3 font-semibold">{ex.description}</td>
                            <td className="py-3 px-3 opacity-80">{displayCat}</td>
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className={`border rounded-3xl p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Palette className={`w-5 h-5 ${t.textAccent}`} /> {text.appearanceTitle}
              </h2>
              <p className="text-xs opacity-75">{text.appearanceDesc}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setThemeMode('teal-dark')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${themeMode === 'teal-dark' ? 'border-teal-500 bg-teal-500/10 shadow-md' : 'border-slate-700 bg-slate-900'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                  <p className="text-xs font-bold text-white">{text.darkTheme}</p>
                </button>

                <button
                  onClick={() => setThemeMode('teal-light')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${themeMode === 'teal-light' ? 'border-teal-600 bg-teal-100 text-slate-900 shadow-md' : 'border-slate-300 bg-white text-slate-900'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-teal-600"></div>
                  <p className="text-xs font-bold">{text.lightTheme}</p>
                </button>
              </div>
            </div>

            <div className={`border rounded-3xl p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Globe className={`w-5 h-5 ${t.textAccent}`} /> {text.languageTitle}
              </h2>
              <p className="text-xs opacity-75">{text.languageDesc}</p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setLang('en')}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${lang === 'en' ? 'border-teal-500 bg-teal-500/10 shadow-md font-bold' : 'border-slate-700 bg-slate-900'}`}
                >
                  <p className="text-sm">🇬🇧 English</p>
                </button>

                <button
                  onClick={() => setLang('ru')}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${lang === 'ru' ? 'border-teal-500 bg-teal-500/10 shadow-md font-bold' : 'border-slate-700 bg-slate-900'}`}
                >
                  <p className="text-sm">🇷🇺 Русский</p>
                </button>
              </div>
            </div>

            {/* Hidden Display Calibration Settings (Admin Only) */}
            {isAdmin && (
              <div className={`border rounded-3xl p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal className={`w-5 h-5 ${t.textAccent}`} /> {text.optimizationTitle}
                </h2>
                <p className="text-xs opacity-75">{text.optimizationDesc}</p>

                {!isOptimizationUnlocked ? (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs font-semibold">{text.pinPrompt}</p>
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
                        {text.unlockBtn}
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
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.multiplierLabel}</label>
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
                    <p className="text-[11px] opacity-60">
                      * Adjusts visual metrics scaling across reports. Expense records remain fully independent and unscaled.
                    </p>
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
