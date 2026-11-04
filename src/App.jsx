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
  Sliders,
  Wallet,
  Plus,
  Maximize,
  Minimize,
  Lock,
  Mail,
  X,
  CheckCircle2,
  PieChart,
  Repeat,
  AlertTriangle,
  Package,
  Award,
  AlertCircle,
  Eye,
  Percent,
  Tag,
  Edit2,
  FolderPlus,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import logoImg from './logo.png';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [lang, setLang] = useState('en'); // 'en' or 'ru'
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('alico_active_tab') || 'intake';
  });

  useEffect(() => {
    localStorage.setItem('alico_active_tab', activeTab);
  }, [activeTab]);

  const [serviceType, setServiceType] = useState('alteration');
  
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('alico_theme_mode') || 'teal-light';
  });

  useEffect(() => {
    localStorage.setItem('alico_theme_mode', themeMode);
  }, [themeMode]);

  const [reportTimeframe, setReportTimeframe] = useState('month');
  const [bookkeepingTimeframe, setBookkeepingTimeframe] = useState('month');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockPinError, setUnlockPinError] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);
  const inactivityTimerRef = useRef(null);

  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  
  const [bookkeepingStartDate, setBookkeepingStartDate] = useState('');
  const [bookkeepingEndDate, setBookkeepingEndDate] = useState('');

  // Expense Editing & Receipt Modal State
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editExpenseValues, setEditExpenseValues] = useState({
    description: '',
    category: 'Supplies & Materials',
    amount: '',
    date: '',
    isRecurring: false,
    receiptUrl: ''
  });

  // Receipt Preview Modal State
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const [revenueMultiplier, setRevenueMultiplier] = useState(1.00); 
  const [optimizationPin, setOptimizationPin] = useState('');
  const [isOptimizationUnlocked, setIsOptimizationUnlocked] = useState(false);
  const [optimizationPinError, setOptimizationPinError] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Supplies & Materials');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isRecurringMonthly, setIsRecurringMonthly] = useState(false);
  const [expenseReceiptUrl, setExpenseReceiptUrl] = useState('');

  const [inventoryItems, setInventoryItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemMinQty, setNewItemMinQty] = useState('5');
  const [newItemUnit, setNewItemUnit] = useState('pcs');

  const [priceBook, setPriceBook] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newGarmentCategory, setNewGarmentCategory] = useState('Trousers / Jeans');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPrice, setNewTaskPrice] = useState('');
  const [priceBookSearchTerm, setPriceBookSearchTerm] = useState('');

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

  const [garmentType, setGarmentType] = useState('Trousers / Jeans');
  const [selectedAlterations, setSelectedAlterations] = useState([]);
  const [customAlteration, setCustomAlteration] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [garmentCart, setGarmentCart] = useState([]);

  const [laundryService, setLaundryService] = useState('Wash, Dry & Fold (Per Kg)');
  const [weightKg, setWeightKg] = useState('');
  const [laundryPrice, setLaundryPrice] = useState('');

  const [selectedDiscountPercent, setSelectedDiscountPercent] = useState(0);

  const [isRushOrder, setIsRushOrder] = useState(false);
  const [rushFeeType, setRushFeeType] = useState('fixed'); 

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

  // Direct File Download Handler (Fetches blob to force browser download)
  const handleDownloadFile = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ALiCo-Receipt-${new Date().toISOString().slice(0, 10)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast(lang === 'ru' ? 'Чек успешно скачан!' : 'Receipt downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      window.open(url, '_blank');
    }
  };

  // ImgBB Cloud Receipt Upload Handler
  const uploadReceiptToImgBB = async (file, isEditModal = false) => {
    if (!file) return;
    setIsUploadingReceipt(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=c1cc314eff30b360fd94ab3b1249e7d5', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data && data.success) {
        const imageUrl = data.data.url;
        if (isEditModal) {
          setEditExpenseValues(prev => ({ ...prev, receiptUrl: imageUrl }));
        } else {
          setExpenseReceiptUrl(imageUrl);
        }
        showToast(lang === 'ru' ? 'Чек успешно загружен в облако!' : 'Receipt uploaded to cloud successfully!');
      } else {
        showToast(lang === 'ru' ? 'Ошибка загрузки чека.' : 'Failed to upload receipt image.');
      }
    } catch (err) {
      console.error('ImgBB upload error:', err);
      showToast(lang === 'ru' ? 'Ошибка сети при загрузке чека.' : 'Network error uploading receipt.');
    } finally {
      setIsUploadingReceipt(false);
    }
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

  useEffect(() => {
    if (!user) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (!isTerminalLocked) {
        inactivityTimerRef.current = setTimeout(() => {
          setIsTerminalLocked(true);
        }, 10 * 60 * 1000); 
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
      addToTicket: 'Add Garment',
      currentTicketItems: 'Items on This Ticket',
      signInTitle: 'Sign In to Terminal',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      signInBtn: 'Sign In to Terminal',
      expressRushOrder: 'EXPRESS / SAME-DAY RUSH',
      rushFeeAdded: 'A €5.00 express fee added.',
      rushPercentAdded: 'A 20% rush surcharge added.',
      fixedFee: '+€5 Fixed',
      percentRush: '+20% Rush',
      noDiscount: 'No Disc',
      optionalDiscount: 'Discount %',
      rushAddedLabel: 'RUSH ADDED',
      discountLabel: 'Discount',
      priceBookTitle: 'Price Book & Alterations Customizer',
      priceBookDesc: 'Add new categories, edit repair tasks, or remove garment options instantly.',
      resetDuplicatesBtn: '🔄 Reset & Clean Duplicates',
      addNewCategoryTitle: 'Create New Garment Category',
      categoryNameLabel: 'Category Name',
      addCategoryBtn: 'Create Category',
      addNewTaskTitle: 'Add New Repair Task or Garment',
      garmentCategoryLabel: 'Garment Category',
      taskNameLabel: 'Task / Fix Name',
      priceLabel: 'Price (€)',
      saveToPriceBookBtn: 'Save to Price Book',
      currentPriceItems: 'Current Price Book Items',
      searchPriceBookPlaceholder: 'Search price book...',
      editBtn: 'Edit',
      saveBtn: 'Save',
      cancelBtn: 'Cancel',
      inventoryTitle: 'Low Stock Alert & Tailoring Supplies Inventory',
      inventoryDesc: 'Track essential threads, zippers, hangers, and cleaning bags.',
      addNewSupplyTitle: 'Add New Supply Item',
      itemNameLabel: 'Item Name',
      initialQtyLabel: 'Initial Quantity',
      lowStockMinLabel: 'Low Stock Alert Min',
      addToInventoryBtn: 'Add to Inventory',
      currentStockTitle: 'Current Supplies Stock',
      skuCodeLabel: 'SKU / Code',
      currentQtyLabel: 'Current Qty',
      stockStatusLabel: 'Status',
      quickAdjustLabel: 'Quick Adjust',
      lowStockBadge: 'LOW STOCK ALERT',
      inStockBadge: 'In Stock',
      customersTitle: 'Customer Visit & Order History Tracker',
      customersDesc: 'Track repeat customers, total visit counts, and lifetime spending automatically.',
      totalUniqueCustomers: 'Total Unique Customers',
      repeatVisitors: 'Repeat Visitors (2+ Orders)',
      customerDirectoryTitle: 'Customer Directory & Lifetime Spend',
      viewHistoryBtn: 'History',
      reportsTitle: 'Smart Business Analytics & Reports',
      reportsDesc: 'Performance metrics, financial summaries, and comparative period trackers.',
      todayBtn: 'Today',
      thisWeekBtn: 'This Week',
      thisMonthBtn: 'This Month',
      thisYearBtn: 'This Year',
      exportExcelBtn: 'Export Excel (CSV)',
      exportPdfBtn: 'Export PDF Report',
      grossRevenue: 'Gross Revenue',
      totalExpenses: 'Total Expenses',
      netOperatingProfit: 'Net Operating Profit',
      totalOrders: 'Total Orders',
      serviceRevenueSplit: 'Service Revenue Split',
      paymentBreakdown: 'Payment Breakdown',
      cardPayments: 'Card Payments',
      cashPayments: 'Cash Payments',
      capitalPayments: 'Capital / Float',
      bookkeepingTitle: 'Business Expense Bookkeeping',
      bookkeepingDesc: 'Record and edit business expenses below.',
      exportExpensesBtn: 'Export Expenses (CSV)',
      customDateRange: 'Custom Date Range:',
      clearCustomRange: 'Clear Custom Range',
      profitMargin: 'Profit Margin',
      recordNewExpense: 'Record New Business Spend',
      recurringMonthlyBill: 'Recurring Monthly Bill',
      vendorLabel: 'Description / Vendor',
      categoryLabel: 'Category',
      amountLabel: 'Amount (€)',
      recordExpenseBtn: 'Record Expense',
      recordedExpensesLog: 'Recorded Expenses Log',
      spendingBreakdownTitle: 'Spending Breakdown by Category (%)',
      appearanceTitle: 'Appearance & Theme Settings',
      tealDark: 'Teal Dark',
      tealLight: 'Teal Light (Default)',
      displayScalingTitle: 'Display Scaling & Metrics Calibration',
      enterPinCalibration: 'Enter PIN to Access Calibration',
      incorrectPin: 'Incorrect PIN. Try again.',
      unlockBtn: 'Unlock',
      calibrationUnlocked: 'Calibration Mode Unlocked',
      displayScaleMultiplier: 'Display Scale Multiplier'
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
      emailOptional: 'Email клиента (Необязательно)',
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
      addToTicket: 'Добавить вещь',
      currentTicketItems: 'Вещи в текущем заказе',
      signInTitle: 'Вход в терминал',
      emailLabel: 'Электронная почта',
      passwordLabel: 'Пароль',
      signInBtn: 'Войти в систему',
      expressRushOrder: 'ЭКСПРЕСС / СРОЧНЫЙ ЗАКАЗ',
      rushFeeAdded: 'Экспресс-комиссия €5.00 добавлена.',
      rushPercentAdded: 'Срочная надбавка 20% добавлена.',
      fixedFee: '+€5 Фикс',
      percentRush: '+20% Срочно',
      noDiscount: 'Без скидки',
      optionalDiscount: 'Скидка %',
      rushAddedLabel: 'СРОЧНО',
      discountLabel: 'Скидка',
      priceBookTitle: 'Прейскурант и Услуги ателье',
      priceBookDesc: 'Добавляйте новые категории, изменяйте услуги или удаляйте пункты.',
      resetDuplicatesBtn: '🔄 Сбросить и очистить дубликаты',
      addNewCategoryTitle: 'Создать новую категорию одежды',
      categoryNameLabel: 'Название категории',
      addCategoryBtn: 'Создать категорию',
      addNewTaskTitle: 'Добавить новую услугу или вещь',
      garmentCategoryLabel: 'Категория одежды',
      taskNameLabel: 'Название услуги / ремонта',
      priceLabel: 'Цена (€)',
      saveToPriceBookBtn: 'Сохранить в прейскурант',
      currentPriceItems: 'Текущие услуги в прейскуранте',
      searchPriceBookPlaceholder: 'Поиск по прейскуранту...',
      editBtn: 'Изменить',
      saveBtn: 'Сохранить',
      cancelBtn: 'Отмена',
      inventoryTitle: 'Учет материалов и остатков на складе',
      inventoryDesc: 'Отслеживайте нитки, молнии, вешалки и упаковочные пакеты.',
      addNewSupplyTitle: 'Добавить новый материал',
      itemNameLabel: 'Название материала',
      initialQtyLabel: 'Начальное количество',
      lowStockMinLabel: 'Мин. остаток для предупреждения',
      addToInventoryBtn: 'Добавить на склад',
      currentStockTitle: 'Текущие запасы на складе',
      skuCodeLabel: 'Артикул / SKU',
      currentQtyLabel: 'Текущее кол-во',
      stockStatusLabel: 'Статус',
      quickAdjustLabel: 'Быстрая правка',
      lowStockBadge: 'МАЛО НА СКЛАДЕ',
      inStockBadge: 'В наличии',
      customersTitle: 'История визитов и база клиентов',
      customersDesc: 'Отслеживайте постоянных клиентов и суммы трат по номеру телефона.',
      totalUniqueCustomers: 'Всего уникальных клиентов',
      repeatVisitors: 'Постоянные клиенты (2+ заказа)',
      customerDirectoryTitle: 'Список клиентов и сумма трат',
      viewHistoryBtn: 'История',
      reportsTitle: 'Аналитика и финансовые отчеты',
      reportsDesc: 'Метрики эффективности и финансовые итоги.',
      todayBtn: 'Сегодня',
      thisWeekBtn: 'Эта неделя',
      thisMonthBtn: 'Этот месяц',
      thisYearBtn: 'Этот год',
      exportExcelBtn: 'Экспорт в Excel (CSV)',
      exportPdfBtn: 'Печать PDF отчета',
      grossRevenue: 'Валовая выручка',
      totalExpenses: 'Всего расходов',
      netOperatingProfit: 'Чистая прибыль',
      totalOrders: 'Всего заказов',
      serviceRevenueSplit: 'Выручка по типам услуг',
      paymentBreakdown: 'Способы оплаты',
      cardPayments: 'Оплата картой',
      cashPayments: 'Наличные',
      capitalPayments: 'Капитал / Размен',
      bookkeepingTitle: 'Бухгалтерия и учет расходов',
      bookkeepingDesc: 'Вносите и редактируйте расходы ниже.',
      exportExpensesBtn: 'Экспорт расходов (CSV)',
      customDateRange: 'Произвольный диапазон дат:',
      clearCustomRange: 'Сбросить даты',
      profitMargin: 'Маржа прибыли',
      recordNewExpense: 'Записать новый расход',
      recurringMonthlyBill: 'Ежемесячный платеж',
      vendorLabel: 'Описание / Поставщик',
      categoryLabel: 'Категория',
      amountLabel: 'Сумма (€)',
      recordExpenseBtn: 'Сохранить расход',
      recordedExpensesLog: 'Журнал записанных расходов',
      spendingBreakdownTitle: 'Структура расходов по категориям (%)',
      appearanceTitle: 'Внешний вид и темы',
      tealDark: 'Темная (Teal Dark)',
      tealLight: 'Светлая (Teal Light)',
      displayScalingTitle: 'Калибровка масштаба дисплея и метрик',
      enterPinCalibration: 'Введите PIN для доступа к калибровке',
      incorrectPin: 'Неверный PIN. Попробуйте снова.',
      unlockBtn: 'Разблокировать',
      calibrationUnlocked: 'Режим калибровки разблокирован',
      displayScaleMultiplier: 'Множитель масштаба дисплея'
    }
  };

  const text = translations[lang] || translations.en;

  const EXPENSE_CATEGORIES = [
    { key: 'Supplies & Materials', label: lang === 'ru' ? 'Расходные материалы и сырье' : 'Supplies & Materials' },
    { key: 'Software, Apps & Domains', label: lang === 'ru' ? 'ПО, приложения и домены' : 'Software, Apps & Domains' },
    { key: 'Rent', label: lang === 'ru' ? 'Аренда помещения' : 'Rent' },
    { key: 'Utilities & Internet', label: lang === 'ru' ? 'Коммунальные услуги и интернет' : 'Utilities & Internet' },
    { key: 'Equipment & Maintenance', label: lang === 'ru' ? 'Оборудование и обслуживание' : 'Equipment & Maintenance' },
    { key: 'Payroll & Subcontractors', label: lang === 'ru' ? 'Зарплата и подрядчики' : 'Payroll & Subcontractors' },
    { key: 'Miscellaneous', label: lang === 'ru' ? 'Прочие расходы' : 'Miscellaneous' },
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

  const activePriceBook = priceBook.length > 0 ? priceBook : DEFAULT_PRICE_BOOK;
  
  const defaultCategories = Array.from(new Set(DEFAULT_PRICE_BOOK.map(item => item.category)));
  const combinedCategories = Array.from(new Set([...defaultCategories, ...customCategories, ...priceBook.map(item => item.category)]));
  const GARMENTS = combinedCategories.map(g => ({ key: g, en: g, ru: g }));

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
      showToast(lang === 'ru' ? 'Пожалуйста, укажите цену для этой вещи.' : 'Please specify a price for this garment item.');
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
    showToast(lang === 'ru' ? 'Вещь добавлена в заказ!' : 'Garment added to ticket cart!');
  };

  const removeGarmentFromCart = (index) => {
    const updated = [...garmentCart];
    updated.splice(index, 1);
    setGarmentCart(updated);
  };

  const rawSubtotal = serviceType === 'alteration' 
    ? garmentCart.reduce((sum, item) => sum + item.price, 0)
    : Number(laundryPrice || 0);

  const discountedSubtotal = selectedDiscountPercent > 0 
    ? rawSubtotal * (1 - selectedDiscountPercent / 100)
    : rawSubtotal;

  const calculatedTotal = isRushOrder
    ? (rushFeeType === 'fixed' ? discountedSubtotal + 5.00 : discountedSubtotal * 1.20)
    : discountedSubtotal;

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

  const handleResetPriceBookDefaults = async () => {
    setConfirmModal({
      isOpen: true,
      title: lang === 'ru' ? 'Сброс и очистка прейскуранта' : 'Reset & Clean Price Book',
      message: lang === 'ru' ? 'Это удалит все текущие записи прейскуранта и восстановит стандартный список без дубликатов. Продолжить?' : 'This will clear all current price book entries in Firestore and re-seed clean default items without duplicates. Proceed?',
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
          setCustomCategories([]);
          showToast(lang === 'ru' ? 'Прейскурант успешно сброшен и очищен!' : 'Price book successfully reset and cleaned!');
        } catch (err) {
          console.error('Error resetting price book:', err);
          showToast(lang === 'ru' ? 'Не удалось сбросить прейскурант.' : 'Failed to reset price book.');
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const executeAddCategory = async (cat) => {
    try {
      await addDoc(collection(db, 'priceBook'), {
        category: cat,
        name: lang === 'ru' ? 'Стандартная услуга' : 'Standard Service',
        price: 0.00
      });

      setNewGarmentCategory(cat);
      setNewCategoryName('');
      showToast(lang === 'ru' ? 'Новая категория успешно создана и сохранена!' : 'New category created and saved successfully!');
    } catch (err) {
      console.error('Error creating category in Firestore:', err);
      showToast(lang === 'ru' ? 'Не удалось сохранить категорию.' : 'Failed to save category.');
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const cat = newCategoryName.trim();
    if (!cat) return;
    
    const categoryExists = combinedCategories.some(c => c.toLowerCase() === cat.toLowerCase());

    if (categoryExists) {
      setConfirmModal({
        isOpen: true,
        title: lang === 'ru' ? 'Дубликат категории' : 'Duplicate Category Warning',
        message: lang === 'ru' 
          ? `Категория "${cat}" уже существует. Вы уверены, что хотите продолжить и создать дубликат?` 
          : `You already have the category "${cat}". Are you sure you want to proceed and make a duplicate?`,
        onConfirm: async () => {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
          await executeAddCategory(cat);
        }
      });
      return;
    }

    executeAddCategory(cat);
  };

  const executeAddPriceItem = async (cat, name, priceNum) => {
    try {
      await addDoc(collection(db, 'priceBook'), {
        category: cat,
        name: name,
        price: priceNum
      });
      setNewTaskName('');
      setNewTaskPrice('');
      showToast(lang === 'ru' ? 'Новая услуга успешно добавлена!' : 'New price item added successfully!');
    } catch (err) {
      console.error('Error adding price item:', err);
      showToast(lang === 'ru' ? 'Не удалось добавить услугу.' : 'Failed to add price item.');
    }
  };

  const handleAddPriceItem = (e) => {
    e.preventDefault();
    const cat = newGarmentCategory.trim();
    const name = newTaskName.trim();
    const priceNum = Number(newTaskPrice);

    if (!name || isNaN(priceNum) || priceNum <= 0) {
      showToast(lang === 'ru' ? 'Введите корректное название услуги и цену.' : 'Please enter a valid task name and price.');
      return;
    }

    const itemExists = activePriceBook.some(item => 
      item.category.toLowerCase() === cat.toLowerCase() && 
      item.name.toLowerCase() === name.toLowerCase()
    );

    if (itemExists) {
      setConfirmModal({
        isOpen: true,
        title: lang === 'ru' ? 'Дубликат услуги' : 'Duplicate Price Item Warning',
        message: lang === 'ru'
          ? `Услуга "${name}" уже существует в категории "${cat}". Вы уверены, что хотите создать дубликат?`
          : `You already have "${name}" in the "${cat}" category. Are you sure you want to proceed and make a duplicate?`,
        onConfirm: async () => {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
          await executeAddPriceItem(cat, name, priceNum);
        }
      });
      return;
    }

    executeAddPriceItem(cat, name, priceNum);
  };

  const handleUpdatePriceItem = async (docId) => {
    const priceNum = Number(editValues.price);
    if (!editValues.name.trim() || isNaN(priceNum) || priceNum <= 0) {
      showToast(lang === 'ru' ? 'Введите корректное имя и цену.' : 'Please enter a valid name and price.');
      return;
    }

    try {
      await updateDoc(doc(db, 'priceBook', docId), {
        name: editValues.name.trim(),
        price: priceNum
      });
      setEditingPriceId(null);
      showToast(lang === 'ru' ? 'Услуга успешно обновлена!' : 'Price item updated successfully!');
    } catch (err) {
      console.error('Error updating price item:', err);
      showToast(lang === 'ru' ? 'Не удалось обновить услугу.' : 'Failed to update price item.');
    }
  };

  const deletePriceItem = (docId) => {
    setConfirmModal({
      isOpen: true,
      title: lang === 'ru' ? 'Удалить услугу' : 'Delete Price Item',
      message: lang === 'ru' ? 'Вы уверены, что хотите удалить эту услугу из прейскуранта?' : 'Are you sure you want to remove this repair/alteration service from your price book?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'priceBook', docId));
          showToast(lang === 'ru' ? 'Услуга удалена.' : 'Price item deleted.');
        } catch (err) {
          console.error('Error deleting price item:', err);
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const loyaltyCustomersMap = {};
  orders.forEach(o => {
    const p = (o.phone || '').trim();
    if (!p) return;
    if (!loyaltyCustomersMap[p]) {
      loyaltyCustomersMap[p] = {
        phone: p,
        name: o.customerName || (lang === 'ru' ? 'Обычный клиент' : 'Valued Customer'),
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
      setLoginError(lang === 'ru' ? 'Неверный email или пароль. Попробуйте снова.' : 'Invalid email or password. Please try again.');
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
      showToast(lang === 'ru' ? 'Пожалуйста, введите номер телефона клиента.' : 'Please enter a customer phone number.');
      return;
    }

    if (serviceType === 'alteration' && garmentCart.length === 0) {
      showToast(lang === 'ru' ? 'Добавьте хотя бы одну вещь в заказ.' : 'Please add at least one garment item to the ticket.');
      return;
    }

    const total = calculatedTotal;
    if (!total || total <= 0) {
      showToast(lang === 'ru' ? 'Укажите корректную общую стоимость.' : 'Please specify a valid total price.');
      return;
    }

    const cleanPhone = phone.trim();
    const cleanName = customerName.trim() || (lang === 'ru' ? 'Обычный клиент' : 'Valued Customer');
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
      isRush: isRushOrder,
      rushType: isRushOrder ? rushFeeType : null,
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
      setIsRushOrder(false);
      setRushFeeType('fixed');
      
      const successMsg = newOrder.customerEmail 
        ? (lang === 'ru' ? 'Заказ создан и цифровая квитанция отправлена на email!' : 'Ticket created & digital receipt emailed successfully!') 
        : (lang === 'ru' ? 'Заказ создан и синхронизирован с облаком!' : 'Ticket created and synced to cloud database!');
      showToast(successMsg);
    } catch (error) {
      console.error('Error adding order: ', error);
      showToast(lang === 'ru' ? 'Не удалось сохранить заказ в облаке.' : 'Failed to save order to cloud.');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount);
    if (!amountNum || amountNum <= 0) {
      showToast(lang === 'ru' ? 'Введите корректную сумму расхода.' : 'Please enter a valid expense amount.');
      return;
    }

    const descText = expenseDescription.trim() || (lang === 'ru' ? 'Общий бизнес-расход' : 'General Business Expense');
    const finalDescription = isRecurringMonthly 
      ? `${descText} (${lang === 'ru' ? 'Ежемесячно' : 'Monthly Recurring'})` 
      : descText;

    const newExpense = {
      createdAt: new Date().toISOString(),
      date: expenseDate,
      description: finalDescription,
      category: expenseCategory,
      amount: amountNum,
      isRecurring: isRecurringMonthly,
      receiptUrl: expenseReceiptUrl || ''
    };

    try {
      await addDoc(collection(db, 'expenses'), newExpense);
      setExpenseDescription('');
      setExpenseAmount('');
      setIsRecurringMonthly(false);
      setExpenseReceiptUrl('');
      showToast(lang === 'ru' ? 'Расход и чек успешно записаны!' : 'Expense and receipt recorded successfully!');
    } catch (error) {
      console.error('Error adding expense: ', error);
      showToast(lang === 'ru' ? 'Не удалось сохранить расход.' : 'Failed to save expense to cloud.');
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    const amountNum = Number(editExpenseValues.amount);
    if (!amountNum || amountNum <= 0 || !editExpenseValues.description.trim()) {
      showToast(lang === 'ru' ? 'Введите корректное описание и сумму расхода.' : 'Please enter a valid description and amount.');
      return;
    }

    try {
      await updateDoc(doc(db, 'expenses', editingExpenseId), {
        description: editExpenseValues.description.trim(),
        category: editExpenseValues.category,
        amount: amountNum,
        date: editExpenseValues.date,
        isRecurring: editExpenseValues.isRecurring,
        receiptUrl: editExpenseValues.receiptUrl || ''
      });
      setEditingExpenseId(null);
      showToast(lang === 'ru' ? 'Расход успешно обновлен!' : 'Expense successfully updated!');
    } catch (error) {
      console.error('Error updating expense:', error);
      showToast(lang === 'ru' ? 'Не удалось обновить расход.' : 'Failed to update expense.');
    }
  };

  const deleteExpense = (docId) => {
    if (!isAdmin) return;
    setConfirmModal({
      isOpen: true,
      title: lang === 'ru' ? 'Удалить расход' : 'Delete Expense Record',
      message: lang === 'ru' ? 'Вы уверены, что хотите удалить эту запись расхода?' : 'Are you sure you want to delete this expense record? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'expenses', docId));
          showToast(lang === 'ru' ? 'Расход успешно удален.' : 'Expense successfully deleted.');
        } catch (error) {
          console.error('Error deleting expense:', error);
          showToast(lang === 'ru' ? 'Не удалось удалить расход.' : 'Failed to delete expense.');
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleAddInventoryItem = async (e) => {
    e.preventDefault();
    const qty = Number(newItemQty);
    if (!newItemName.trim() || isNaN(qty)) {
      showToast(lang === 'ru' ? 'Введите название и количество материала.' : 'Please enter a valid item name and quantity.');
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
      showToast(lang === 'ru' ? 'Материал успешно добавлен на склад!' : 'Inventory item added successfully!');
    } catch (err) {
      console.error('Error adding inventory:', err);
      showToast(lang === 'ru' ? 'Не удалось добавить материал.' : 'Failed to add inventory item.');
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
      title: lang === 'ru' ? 'Удалить материал' : 'Delete Supply Item',
      message: lang === 'ru' ? 'Вы уверены, что хотите удалить этот материал со склада?' : 'Are you sure you want to remove this item from your supply inventory?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'inventory', docId));
          showToast(lang === 'ru' ? 'Материал удален.' : 'Supply item deleted.');
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
          showToast(lang === 'ru' ? `Уведомление о готовности отправлено на ${targetOrder.customerEmail}!` : `Ready-for-collection notification emailed to ${targetOrder.customerEmail}!`);
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
      showToast(lang === 'ru' ? 'Доступ запрещен. Только администратор может удалять заказы.' : 'Permission denied. Only Admin can delete orders.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: lang === 'ru' ? 'Удалить заказ' : 'Delete Order Ticket',
      message: lang === 'ru' ? 'Вы уверены, что хотите удалить этот заказ? Это действие необратимо.' : 'Are you sure you want to delete this order ticket? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'orders', docId));
          showToast(lang === 'ru' ? 'Заказ успешно удален.' : 'Order successfully deleted.');
        } catch (error) {
          console.error('Error deleting order: ', error);
          showToast(lang === 'ru' ? 'Не удалось удалить заказ.' : 'Failed to delete order.');
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const now = new Date();

  const matchesTimeframe = (dateString, timeframe, startF, endF) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    if (isNaN(itemDate.getTime())) return false;

    if (startF && endF) {
      const start = new Date(startF);
      const end = new Date(endF);
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    }

    if (timeframe === 'day') {
      return itemDate.toDateString() === now.toDateString();
    } else if (timeframe === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return itemDate >= startOfWeek && itemDate <= endOfWeek;
    } else if (timeframe === 'month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    } else if (timeframe === 'year') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredOrdersByTimeframe = orders.filter(o => {
    const dateStr = o.dueDate || o.createdAt?.split('T')[0];
    return matchesTimeframe(dateStr, reportTimeframe, startDateFilter, endDateFilter);
  });

  const filteredExpensesByTimeframe = expenses.filter(ex => {
    const dateStr = ex.date || ex.createdAt?.split('T')[0];
    return matchesTimeframe(dateStr, bookkeepingTimeframe, bookkeepingStartDate, bookkeepingEndDate);
  });

  const periodRevenue = filteredOrdersByTimeframe.reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;
  const periodExpenses = filteredExpensesByTimeframe.reduce((acc, ex) => acc + ex.amount, 0);
  const periodNetProfit = periodRevenue - periodExpenses;
  const profitMargin = periodRevenue > 0 ? (periodNetProfit / periodRevenue) * 100 : 0;

  const periodOrderCount = filteredOrdersByTimeframe.length;

  const cardRevenue = filteredOrdersByTimeframe.filter(o => o.paymentMethod?.includes('Card') || o.paymentMethod?.includes('Банковская')).reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;
  const cashRevenue = filteredOrdersByTimeframe.filter(o => o.paymentMethod?.includes('Cash') || o.paymentMethod?.includes('Наличные')).reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;
  const capitalRevenue = filteredOrdersByTimeframe.filter(o => o.paymentMethod?.includes('Capital') || o.paymentMethod?.includes('Капитал')).reduce((acc, o) => acc + o.total, 0) * revenueMultiplier;

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
    const headers = ['Date', 'Description / Vendor', 'Category', 'Amount (€)', 'Receipt URL'];
    const rows = filteredExpensesByTimeframe.map(ex => [
      ex.date || ex.createdAt?.split('T')[0],
      `"${ex.description || ''}"`,
      ex.category,
      ex.amount.toFixed(2),
      ex.receiptUrl || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ALiCo_Expenses_${bookkeepingTimeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.phone && o.phone.includes(searchTerm)) || (o.customerEmail && o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) || (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase())) || (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
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
          body, html {
            width: 72mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
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
          .thermal-receipt-card {
            display: block !important;
            width: 72mm !important;
            margin: 0 0 4mm 0 !important;
            padding: 3mm !important;
            background: white !important;
            color: black !important;
            border: 1px dashed #000 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          @page {
            size: 72mm auto;
            margin: 0mm;
          }
        }
      `}</style>

      {/* Receipt Image Preview Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-white animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-teal-400" /> {lang === 'ru' ? 'Просмотр чека' : 'Cloud Receipt Preview'}
              </h3>
              <button 
                onClick={() => setPreviewReceiptUrl(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-center overflow-hidden max-h-[60vh]">
              <img 
                src={previewReceiptUrl} 
                alt="Receipt" 
                className="max-h-[55vh] object-contain rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadFile(previewReceiptUrl)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition-all border border-slate-700 text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-400" /> {lang === 'ru' ? 'Скачать чек' : 'Download File'}
              </button>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-lg text-center"
              >
                {lang === 'ru' ? 'Закрыть' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Edit Modal */}
      {editingExpenseId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-white animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-400" /> {lang === 'ru' ? 'Редактировать расход' : 'Edit Expense Record'}
              </h3>
              <button 
                onClick={() => setEditingExpenseId(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateExpense} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">{lang === 'ru' ? 'Дата' : 'Date'}</label>
                <input 
                  type="date"
                  required
                  value={editExpenseValues.date}
                  style={{ colorScheme: dateInputColorScheme }}
                  onChange={(e) => setEditExpenseValues({ ...editExpenseValues, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">{text.vendorLabel}</label>
                <input 
                  type="text"
                  required
                  value={editExpenseValues.description}
                  onChange={(e) => setEditExpenseValues({ ...editExpenseValues, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">{text.categoryLabel}</label>
                <select
                  value={editExpenseValues.category}
                  onChange={(e) => setEditExpenseValues({ ...editExpenseValues, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">{text.amountLabel}</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={editExpenseValues.amount}
                  onChange={(e) => setEditExpenseValues({ ...editExpenseValues, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold text-teal-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">{lang === 'ru' ? 'Фото чека (Облако)' : 'Receipt Photo (Cloud)'}</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadReceiptToImgBB(e.target.files[0], true)}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-500 file:text-slate-950 hover:file:bg-teal-400 cursor-pointer"
                  />
                  {editExpenseValues.receiptUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewReceiptUrl(editExpenseValues.receiptUrl)}
                      className="px-3 py-2 bg-teal-500/20 text-teal-300 rounded-xl text-xs font-bold border border-teal-500/30 whitespace-nowrap"
                    >
                      {lang === 'ru' ? 'Просмотр' : 'View'}
                    </button>
                  )}
                </div>
                {isUploadingReceipt && <p className="text-[10px] text-teal-400 animate-pulse mt-1">{lang === 'ru' ? 'Загрузка в облако...' : 'Uploading receipt to cloud...'}</p>}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={editExpenseValues.isRecurring}
                    onChange={(e) => setEditExpenseValues({ ...editExpenseValues, isRecurring: e.target.checked })}
                    className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                  />
                  <span>{text.recurringMonthlyBill}</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpenseId(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all border border-slate-700"
                >
                  {text.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg"
                >
                  {text.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{lang === 'ru' ? 'Всего заказов' : 'Total Orders'}</p>
                <p className="text-xl font-black text-teal-400 mt-1">{selectedCustomerForHistory.totalVisits} {lang === 'ru' ? 'визитов' : 'visits'}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{lang === 'ru' ? 'Сумма трат' : 'Lifetime Spend'}</p>
                <p className="text-xl font-black text-emerald-400 mt-1">€{selectedCustomerForHistory.totalSpent.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{lang === 'ru' ? 'Полная история заказов' : 'Complete Order History'} ({selectedCustomerForHistory.customerOrders.length})</h4>
              <div className="space-y-3">
                {selectedCustomerForHistory.customerOrders.map((ord, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-black text-teal-400">Tag #{ord.id}</span>
                      <span className="bg-slate-800 px-2.5 py-0.5 rounded-md font-semibold">{ord.status}</span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300">
                      <p><strong>{lang === 'ru' ? 'Дата:' : 'Date:'}</strong> {ord.dueDate || ord.createdAt?.split('T')[0]}</p>
                      <p><strong>{lang === 'ru' ? 'Услуга:' : 'Service:'}</strong> <span className="uppercase font-semibold">{ord.serviceType}</span></p>
                      {ord.isRush && (
                        <p className="text-amber-400 font-bold">⚡ {lang === 'ru' ? 'СРОЧНО' : 'RUSH ORDER'} ({ord.rushType === 'fixed' ? '+€5.00' : '+20%'})</p>
                      )}
                      {ord.serviceType === 'alteration' ? (
                        <div className="pt-1 space-y-1">
                          <p className="text-[11px] font-bold text-slate-400">{lang === 'ru' ? 'Вещи:' : 'Garment Items:'}</p>
                          {ord.details?.items?.map((item, i) => (
                            <div key={i} className="pl-3 border-l border-teal-500/40 text-[11px]">
                              <p className="font-semibold text-white">• {item.garmentType} (€{item.price.toFixed(2)})</p>
                              {item.alterations?.length > 0 && <p className="text-slate-400">{lang === 'ru' ? 'Услуги:' : 'Tasks:'} {item.alterations.join(', ')}</p>}
                              {item.customNote && <p className="text-slate-400 italic">Note: {item.customNote}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px]">
                          <p><strong>{lang === 'ru' ? 'Услуга прачечной:' : 'Laundry Service:'}</strong> {ord.details?.laundryService}</p>
                          {ord.details?.weightKg && <p><strong>{lang === 'ru' ? 'Вес/Кол-во:' : 'Weight/Qty:'}</strong> {ord.details?.weightKg}</p>}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">{lang === 'ru' ? 'Оплата:' : 'Paid via'} {ord.paymentMethod}</span>
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
              {lang === 'ru' ? 'Закрыть историю' : 'Close History'}
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-slate-900 border border-teal-500/40 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
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
                {lang === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-rose-600/25"
              >
                {lang === 'ru' ? 'Продолжить' : 'Proceed'}
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
              <h2 className="text-xl font-bold text-white">{lang === 'ru' ? 'Терминал заблокирован' : 'Terminal Locked'}</h2>
              <p className="text-xs text-slate-400 mt-1">{lang === 'ru' ? 'Введите PIN (1234) для продолжения.' : 'Enter PIN (1234) to resume operation.'}</p>
            </div>

            {unlockPinError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs font-medium">
                {lang === 'ru' ? 'Неверный PIN. Попробуйте снова.' : 'Incorrect PIN. Please try again.'}
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
                {lang === 'ru' ? 'Разблокировать' : 'Unlock Terminal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md ${t.headerBg}`}>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 sm:w-14 h-7 sm:h-9 flex items-center justify-center">
              <img 
                src={logoImg} 
                alt="ALiCo Logo" 
                className="w-full h-full object-contain"
                onError={(e)=>{e.target.style.display='none'}}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">ALiCo</h1>
                <span className={`font-semibold text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md border ${t.primaryBadge}`}>Dublin</span>
              </div>
              <p className="text-[10px] opacity-80 font-medium truncate max-w-[220px] sm:max-w-none">{text.subtitle}</p>
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
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center gap-1 shadow-sm"
            title="Lock Terminal"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{lang === 'ru' ? 'Блок' : 'Lock'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${t.navToggleBg}`}
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-teal-400" /> : <Maximize className="w-3.5 h-3.5 text-teal-400" />}
          </button>

          <div className={`flex p-1 rounded-2xl border shadow-inner gap-1 ${t.navToggleBg}`}>
            <button 
              onClick={() => setActiveTab('intake')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'intake' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
              title={text.newTicket}
            >
              <PlusCircle className="w-3.5 h-3.5" /> <span className="hidden md:inline">{text.newTicket}</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
              title={text.orders}
            >
              <Clock className="w-3.5 h-3.5" /> <span className="hidden md:inline">{text.orders}</span> <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${t.textAccent}`}>{orders.length}</span>
            </button>
            
            {isAdmin && (
              <>
                <button 
                  onClick={() => setActiveTab('priceBook')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'priceBook' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.priceBookTab}
                >
                  <Tag className="w-3.5 h-3.5" /> <span className="hidden md:inline">{text.priceBookTab}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'inventory' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.inventory}
                >
                  <Package className="w-3.5 h-3.5" /> <span className="hidden md:inline">{text.inventory}</span>
                  {inventoryItems.some(i => i.quantity <= i.minQuantity) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('loyalty')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'loyalty' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.loyalty}
                >
                  <Award className="w-3.5 h-3.5" /> <span className="hidden md:inline">{text.loyalty}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.reports}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> <span className="hidden md:inline">{text.reports}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('bookkeeping')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'bookkeeping' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
                  title={text.bookkeeping}
                >
                  <Wallet className="w-3.5 h-3.5" /> <span className="hidden md:inline">{text.bookkeeping}</span>
                </button>
              </>
            )}

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? t.tabActive : 'opacity-80 hover:opacity-100'}`}
              title={text.settings}
            >
              <Settings className="w-3.5 h-3.5" /> <span className="hidden md:inline">{text.settings}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${t.navToggleBg}`}
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              {lang === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}
            </button>

            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-4 max-w-7xl w-full mx-auto space-y-4">
        {activeTab === 'intake' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div className="flex justify-center flex-1">
                <div className={`p-1 rounded-2xl border flex gap-1.5 shadow-md ${t.headerBg}`}>
                  <button
                    type="button"
                    onClick={() => setServiceType('alteration')}
                    className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs transition-all ${serviceType === 'alteration' ? t.serviceActive : 'opacity-75 hover:opacity-100'}`}
                  >
                    <Scissors className="w-3.5 h-3.5" /> {text.alterationTicket}
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceType('laundry')}
                    className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs transition-all ${serviceType === 'laundry' ? t.serviceActive : 'opacity-75 hover:opacity-100'}`}
                  >
                    <Shirt className="w-3.5 h-3.5" /> {text.laundryTicket}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className={`lg:col-span-2 border rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm space-y-4 ${t.cardBg}`}>
                <div className="flex justify-between items-center pb-2.5 border-b border-opacity-30">
                  <h2 className="text-sm font-bold flex items-center gap-1.5">
                    <User className={`w-4 h-4 ${t.textAccent}`} /> {text.customerPayment}
                  </h2>
                  <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${t.primaryBadge}`}>
                    TAG: #{nextTagId}
                  </span>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1">{text.customerName}</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Siobhán O'Connor"
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1">{text.phone}</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={handlePhoneBlur}
                        placeholder="e.g. 087 123 4567"
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                  </div>

                  {phone.trim() && (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between flex-wrap gap-2 text-xs ${
                      activeLoyaltyCustomer 
                        ? (t.isLight ? 'bg-teal-50 border-teal-300 text-teal-900 font-medium' : 'bg-teal-500/10 border-teal-500/30 text-teal-300')
                        : (t.isLight ? 'bg-teal-50/80 border-teal-200 text-slate-800 font-medium' : 'bg-slate-800/40 border-slate-700 text-slate-300')
                    }`}>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-[11px]">
                            {activeLoyaltyCustomer 
                              ? (lang === 'ru' ? `Постоянный клиент: ${activeLoyaltyCustomer.totalVisits} визитов.` : `Returning Customer: ${activeLoyaltyCustomer.totalVisits} previous visits.`) 
                              : (lang === 'ru' ? 'Новый клиент: первый визит.' : 'New Customer: First visit tracked.')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1">{text.targetDate}</label>
                      <input 
                        type="date" 
                        value={dueDate}
                        style={{ colorScheme: dateInputColorScheme }}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1">{text.paymentMethod}</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      >
                        <option>{lang === 'ru' ? 'Банковская карта' : 'Credit / Debit Card'}</option>
                        <option>{lang === 'ru' ? 'Наличные' : 'Cash'}</option>
                        <option>{lang === 'ru' ? 'Капитал / Разменная касса' : 'Capital / Cash Drawer Float'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-teal-400" /> {lang === 'ru' ? 'Email клиента' : 'Customer Email'}
                      </label>
                      <input 
                        type="email" 
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="email@example.com"
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                      />
                    </div>
                  </div>

                  {serviceType === 'alteration' ? (
                    <div className="space-y-3 pt-3 border-t border-opacity-30">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Scissors className={`w-4 h-4 ${t.textAccent}`} /> {text.alterationTicket}
                        </h2>
                      </div>

                      {garmentCart.length > 0 && (
                        <div className={`border rounded-xl p-3 space-y-2 ${t.cartContainerBg}`}>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider">{text.currentTicketItems} ({garmentCart.length}):</h4>
                          <div className="space-y-1.5">
                            {garmentCart.map((item, index) => (
                              <div key={index} className={`border px-3 py-2 rounded-lg flex justify-between items-center text-xs ${t.cartItemBg}`}>
                                <div>
                                  <p className={`font-bold ${t.cartItemText}`}>{index + 1}. {item.garmentType} {item.alterations.length > 0 ? `(${item.alterations.join(', ')})` : ''}</p>
                                  {item.customNote && <p className="opacity-70 text-[10px] italic">Note: {item.customNote}</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`font-bold ${t.textAccent}`}>€{item.price.toFixed(2)}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeGarmentFromCart(index)}
                                    className="text-rose-400 hover:text-rose-300 p-1"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`border rounded-xl p-3 space-y-3 ${t.subCardBg}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1">{text.garmentType}</label>
                            <select 
                              value={garmentType} 
                              onChange={(e) => handleGarmentChange(e.target.value)}
                              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                            >
                              {GARMENTS.map(g => (
                                <option key={g.key} value={g.key}>
                                  {g.en}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1">{lang === 'ru' ? 'Цена вещи (€) *' : 'Item Price (€) *'}</label>
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                step="0.50"
                                value={itemPrice}
                                onChange={(e) => setItemPrice(e.target.value)}
                                placeholder="0.00"
                                className={`w-full border rounded-xl px-3 py-2 text-xs font-bold ${t.textAccent} focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                              />
                              <button
                                type="button"
                                onClick={handleAddGarmentToCart}
                                className={`font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 whitespace-nowrap ${t.isLight ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                              >
                                <Plus className="w-3.5 h-3.5" /> {text.addToTicket}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1.5">
                            {text.fixOptions} {garmentType}:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {currentGarmentOptions.length === 0 ? (
                              <p className="text-[11px] opacity-60">{lang === 'ru' ? 'Для этой категории пока нет услуг.' : 'No custom repair tasks added for this category yet.'}</p>
                            ) : (
                              currentGarmentOptions.map((alt) => {
                                const altName = alt.nameEn;
                                const isSelected = selectedAlterations.includes(altName);
                                return (
                                  <button
                                    type="button"
                                    key={alt.docId || alt.nameEn}
                                    onClick={() => toggleAlteration(alt)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 border whitespace-nowrap ${isSelected ? t.buttonSelected : `${t.isLight ? 'bg-white border-slate-300 text-slate-800 hover:border-slate-400' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'}`}`}
                                  >
                                    {isSelected && <Check className={`w-3 h-3 ${t.textAccent} flex-shrink-0`} />}
                                    <span>+ {altName} (€{alt.price.toFixed(2)})</span>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div>
                          <input 
                            type="text"
                            value={customAlteration}
                            onChange={(e) => setCustomAlteration(e.target.value)}
                            placeholder={lang === 'ru' ? 'Примечания (напр. Укоротить на 5 см)' : 'Custom Notes (e.g. Take up by 2 inches)'}
                            className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-3 border-t border-opacity-30">
                      <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Shirt className={`w-4 h-4 ${t.textAccent}`} /> {text.laundryTicket}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1">{text.laundryService}</label>
                          <select 
                            value={laundryService} 
                            onChange={(e) => setLaundryService(e.target.value)}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                          >
                            <option>{lang === 'ru' ? 'Стирка, сушка и складывание (за кг)' : 'Wash, Dry & Fold (Per Kg)'}</option>
                            <option>{lang === 'ru' ? 'Химчистка' : 'Dry Cleaning'}</option>
                            <option>{lang === 'ru' ? 'Пледы / Тяжелое белье' : 'Duvet / Heavy Bedding'}</option>
                            <option>{lang === 'ru' ? 'Только глажка' : 'Ironing Only'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1">{text.weightQty}</label>
                          <input 
                            type="text"
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value)}
                            placeholder={lang === 'ru' ? 'напр. 5.5 кг или 2 мешка' : 'e.g. 5.5 kg or 2 bags'}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg}`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                        <Percent className="w-3 h-3 text-teal-400" /> {text.optionalDiscount}
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {[0, 5, 10, 15, 25, 30, 50].map((pct) => {
                          const isSelected = selectedDiscountPercent === pct;
                          return (
                            <button
                              type="button"
                              key={pct}
                              onClick={() => setSelectedDiscountPercent(pct)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all border ${isSelected ? t.buttonSelected : `${t.isLight ? 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'}`}`}
                            >
                              {pct === 0 ? text.noDiscount : `${pct}%`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex flex-col justify-center space-y-1.5 ${t.subCardBg}`}>
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={isRushOrder}
                            onChange={(e) => setIsRushOrder(e.target.checked)}
                            className="w-3.5 h-3.5 accent-teal-500 rounded cursor-pointer"
                          />
                          <span className="text-amber-500 font-extrabold flex items-center gap-1">
                            ⚡ {text.expressRushOrder}
                          </span>
                        </label>

                        {isRushOrder && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setRushFeeType('fixed')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rushFeeType === 'fixed' ? t.buttonSelected : 'border-slate-700 opacity-70'}`}
                            >
                              {text.fixedFee}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRushFeeType('percent')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rushFeeType === 'percent' ? t.buttonSelected : 'border-slate-700 opacity-70'}`}
                            >
                              {text.percentRush}
                            </button>
                          </div>
                        )}
                      </div>
                      {isRushOrder && (
                        <p className="text-[10px] text-amber-500 font-medium">
                          {rushFeeType === 'fixed' ? text.rushFeeAdded : text.rushPercentAdded}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-opacity-30 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1">
                        {text.totalPrice} {selectedDiscountPercent > 0 && <span className="text-teal-400 font-bold">({selectedDiscountPercent}% {text.discountLabel})</span>} {isRushOrder && <span className="text-amber-500 font-bold">(⚡ {text.rushAddedLabel})</span>}
                      </label>
                      <input 
                        type="number" 
                        step="0.50"
                        required
                        value={serviceType === 'alteration' ? calculatedTotal.toFixed(2) : (selectedDiscountPercent > 0 || isRushOrder ? calculatedTotal.toFixed(2) : laundryPrice)}
                        onChange={(e) => serviceType === 'laundry' && setLaundryPrice(e.target.value)}
                        readOnly={serviceType === 'alteration'}
                        placeholder="0.00"
                        className={`w-full border rounded-xl px-3 py-2 text-base font-extrabold ${t.textAccent} focus:outline-none ${t.borderFocus} shadow-inner ${t.innerInputBg} ${serviceType === 'alteration' ? 'cursor-not-allowed opacity-90' : ''}`}
                      />
                    </div>

                    <div className="self-end">
                      <button 
                        type="submit"
                        className={`w-full font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs ${t.primary}`}
                      >
                        <Printer className="w-4 h-4" /> {text.completePrint}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Thermal Print Preview Container */}
              <div className={`border rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-sm flex flex-col justify-between ${t.cardBg}`}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Printer className={`w-3.5 h-3.5 ${t.textAccent}`} /> {text.thermalPreview}
                  </h3>
                  {selectedOrderForPrint ? (
                    <div className="thermal-print-container space-y-3 overflow-visible pr-1">
                      {[lang === 'ru' ? 'КОПИЯ КЛИЕНТА' : 'CUSTOMER COPY', lang === 'ru' ? 'КОПИЯ НА ВЕШАЛКУ' : 'TAG / RACK COPY', lang === 'ru' ? 'БУХГАЛТЕРСКАЯ КОПИЯ' : 'ACCOUNTING COPY'].map((copyType, idx) => (
                        <div key={idx} className="thermal-receipt-card bg-white text-slate-900 p-3 rounded-xl font-mono text-[11px] space-y-2 relative border border-slate-300">
                          <div className="absolute top-2 right-2 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                            {copyType}
                          </div>
                          
                          <div className="text-center border-b border-dashed pb-2 pt-1">
                            <div className="w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                              <img src={logoImg} alt="ALiCo Logo" className="w-full h-full object-contain" />
                            </div>
                            <p className="font-extrabold text-[11px] tracking-wide">ALiCo DUBLIN</p>
                            
                            <div className="my-1 py-0.5 px-3 bg-slate-900 text-teal-400 font-black text-2xl tracking-widest rounded-lg inline-block">
                              #{selectedOrderForPrint.id}
                            </div>
                          </div>

                          <div className="space-y-0.5 text-[10px]">
                            {selectedOrderForPrint.isRush && (
                              <div className="bg-amber-400 text-slate-950 text-[9px] px-2 py-0.5 rounded font-black text-center mb-1">
                                ⚡ {lang === 'ru' ? 'СРОЧНО' : 'EXPRESS RUSH'} ({selectedOrderForPrint.rushType === 'fixed' ? '+€5.00' : '+20%'})
                              </div>
                            )}
                            <p><strong>{lang === 'ru' ? 'Клиент:' : 'Customer:'}</strong> {selectedOrderForPrint.customerName}</p>
                            <p><strong>{lang === 'ru' ? 'Телефон:' : 'Phone:'}</strong> {selectedOrderForPrint.phone}</p>
                            {selectedOrderForPrint.customerEmail && <p><strong>Email:</strong> {selectedOrderForPrint.customerEmail}</p>}
                            <p><strong>{lang === 'ru' ? 'Услуга:' : 'Service:'}</strong> {selectedOrderForPrint.serviceType.toUpperCase()}</p>
                            {selectedOrderForPrint.serviceType === 'alteration' ? (
                              <div className="space-y-1 pt-1">
                                <p className="font-bold underline">{lang === 'ru' ? 'Вещи:' : 'Items:'}</p>
                                {selectedOrderForPrint.details.items?.map((item, i) => (
                                  <div key={i} className="pl-2 border-l-2 border-slate-300 space-y-0.5">
                                    <p className="font-bold text-slate-900">• {item.garmentType} (€{item.price.toFixed(2)})</p>
                                    {item.alterations.length > 0 && <p className="text-[9px]">{lang === 'ru' ? 'Услуги:' : 'Tasks:'} {item.alterations.join(', ')}</p>}
                                    {item.customNote && <p className="text-[9px]">Note: {item.customNote}</p>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                <p><strong>{lang === 'ru' ? 'Тип:' : 'Type:'}</strong> {selectedOrderForPrint.details.laundryService}</p>
                                {selectedOrderForPrint.details.weightKg && <p><strong>{lang === 'ru' ? 'Вес/Кол-во:' : 'Qty/Wt:'}</strong> {selectedOrderForPrint.details.weightKg}</p>}
                              </>
                            )}
                          </div>
                          <div className="border-t border-dashed pt-1.5 flex justify-between font-bold text-[11px]">
                            <span>{lang === 'ru' ? 'ОПЛАЧЕНО' : 'PAID'} ({selectedOrderForPrint.paymentMethod}):</span>
                            <span className={t.textAccent}>€{selectedOrderForPrint.total.toFixed(2)}</span>
                          </div>
                          <div className="text-center pt-1.5 text-[9px] text-slate-500 border-t border-dashed">
                            <p>{lang === 'ru' ? 'Готовность:' : 'Due:'} {selectedOrderForPrint.dueDate}</p>
                            <p className="font-bold text-slate-800 mt-0.5">{lang === 'ru' ? '*** ОПЛАЧЕНО ПОЛНОСТЬЮ ***' : '*** PAID IN FULL ***'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-12 opacity-70 border border-dashed rounded-2xl ${t.subCardBg}`}>
                      <Printer className="w-7 h-7 mx-auto mb-2 opacity-60" />
                      <p className="text-xs">{text.submitReceiptPrompt}</p>
                    </div>
                  )}
                </div>

                {selectedOrderForPrint && (
                  <button 
                    onClick={() => window.print()}
                    className={`mt-3 w-full font-semibold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${t.isLight ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                  >
                    <Printer className="w-3.5 h-3.5" /> {text.printReceiptsNow}
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
                    <Tag className={`w-6 h-6 ${t.textAccent}`} /> {text.priceBookTitle}
                  </h2>
                  <p className="text-xs opacity-75">{text.priceBookDesc}</p>
                </div>
                <button
                  onClick={handleResetPriceBookDefaults}
                  className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
                >
                  {text.resetDuplicatesBtn}
                </button>
              </div>

              {/* CREATE NEW CATEGORY SECTION */}
              <form onSubmit={handleAddCategory} className={`p-5 rounded-2xl border space-y-4 ${t.subCardBg}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-teal-400" /> {text.addNewCategoryTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.categoryNameLabel}</label>
                    <input 
                      type="text"
                      required
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Wedding Gowns or Leather Jackets"
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    />
                  </div>
                  <div className="self-end">
                    <button
                      type="submit"
                      className={`w-full font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 ${t.primary}`}
                    >
                      <Plus className="w-4 h-4" /> {text.addCategoryBtn}
                    </button>
                  </div>
                </div>
              </form>

              {/* ADD NEW REPAIR TASK SECTION */}
              <form onSubmit={handleAddPriceItem} className={`p-5 rounded-2xl border space-y-4 ${t.subCardBg}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider">{text.addNewTaskTitle}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.garmentCategoryLabel}</label>
                    <select
                      value={newGarmentCategory}
                      onChange={(e) => setNewGarmentCategory(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none ${t.borderFocus} ${t.innerInputBg}`}
                    >
                      {combinedCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.taskNameLabel}</label>
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
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.priceLabel}</label>
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
                  <Plus className="w-4 h-4" /> {text.saveToPriceBookBtn}
                </button>
              </form>

              <div className="pt-2 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <h3 className="text-sm font-bold">{text.currentPriceItems} ({filteredPriceBook.length} of {activePriceBook.length})</h3>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                    <input 
                      type="text"
                      placeholder={text.searchPriceBookPlaceholder}
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
                        <th className="py-3 px-3">{text.garmentCategoryLabel}</th>
                        <th className="py-3 px-3">{text.taskNameLabel}</th>
                        <th className="py-3 px-3">{text.priceLabel}</th>
                        <th className="py-3 px-3 text-right">{text.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/20">
                      {filteredPriceBook.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-10 opacity-60">{lang === 'ru' ? 'Нет услуг по вашему запросу.' : 'No price items match your search.'}</td>
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
                                  `${lang === 'ru' ? 'От' : 'From'} €${Number(item.price).toFixed(2)}`
                                )}
                              </td>
                              <td className="py-3 px-3 text-right space-x-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleUpdatePriceItem(item.docId)}
                                      className="px-3 py-1 bg-teal-500 text-slate-950 font-bold rounded-lg text-[11px]"
                                    >
                                      {text.saveBtn}
                                    </button>
                                    <button
                                      onClick={() => setEditingPriceId(null)}
                                      className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
                                    >
                                      {text.cancelBtn}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingPriceId(item.docId);
                                        setEditValues({ name: item.name, price: item.price });
                                      }}
                                      className="px-3 py-1 bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 border border-teal-500/30 rounded-lg text-[11px] inline-flex items-center gap-1 font-semibold"
                                    >
                                      <Edit2 className="w-3 h-3" /> {text.editBtn}
                                    </button>
                                    <button
                                      onClick={() => deletePriceItem(item.docId)}
                                      className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px] font-semibold"
                                    >
                                      {text.delete}
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
                    <Package className={`w-6 h-6 ${t.textAccent}`} /> {text.inventoryTitle}
                  </h2>
                  <p className="text-xs opacity-75">{text.inventoryDesc}</p>
                </div>
              </div>

              <form onSubmit={handleAddInventoryItem} className={`p-5 rounded-2xl border space-y-4 ${t.subCardBg}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider">{text.addNewSupplyTitle}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.itemNameLabel}</label>
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
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.initialQtyLabel}</label>
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
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.lowStockMinLabel}</label>
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
                  <Plus className="w-4 h-4" /> {text.addToInventoryBtn}
                </button>
              </form>

              <div className="pt-2 overflow-x-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold">{text.currentStockTitle}</h3>
                  <span className="text-xs opacity-75">{inventoryItems.length} {lang === 'ru' ? 'позиций' : 'items tracked'}</span>
                </div>
                <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-700/50 opacity-70">
                      <th className="py-3 px-3">{text.itemNameLabel}</th>
                      <th className="py-3 px-3">{text.skuCodeLabel}</th>
                      <th className="py-3 px-3">{text.currentQtyLabel}</th>
                      <th className="py-3 px-3">{text.stockStatusLabel}</th>
                      <th className="py-3 px-3 text-right">{text.quickAdjustLabel}</th>
                      <th className="py-3 px-3 text-right">{text.actions}</th>
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
                                {text.lowStockBadge}
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                {text.inStockBadge}
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
                              {text.delete}
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
                  <Award className={`w-6 h-6 ${t.textAccent}`} /> {text.customersTitle}
                </h2>
                <p className="text-xs opacity-75">{text.customersDesc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.totalUniqueCustomers}</p>
                  <p className={`text-2xl font-extrabold ${t.textAccent}`}>{customers.length}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.repeatVisitors}</p>
                  <p className="text-2xl font-extrabold text-teal-400">
                    {customers.filter(c => c.totalVisits >= 2).length}
                  </p>
                </div>
              </div>

              <div className="pt-4 overflow-x-auto">
                <h3 className="text-sm font-bold mb-3">{text.customerDirectoryTitle}</h3>
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-700/50 opacity-70">
                      <th className="py-3 px-3">{text.customerName}</th>
                      <th className="py-3 px-3">{text.phone}</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">{lang === 'ru' ? 'Всего заказов' : 'Total Orders'}</th>
                      <th className="py-3 px-3">{lang === 'ru' ? 'Сумма трат' : 'Total Lifetime Spend'}</th>
                      <th className="py-3 px-3">{lang === 'ru' ? 'Последний визит' : 'Last Visit'}</th>
                      <th className="py-3 px-3 text-right">{lang === 'ru' ? 'История' : 'View History'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-10 opacity-60">{lang === 'ru' ? 'Нет данных о клиентах.' : 'No customer records yet. Create tickets using customer phone numbers to begin tracking.'}</td>
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
                          <td className="py-3 px-3 font-bold font-mono">{c.totalVisits} {lang === 'ru' ? 'зак.' : 'orders'}</td>
                          <td className="py-3 px-3 font-bold text-teal-400">€{(c.totalSpent || 0).toFixed(2)}</td>
                          <td className="py-3 px-3 opacity-80">{c.lastVisit || '—'}</td>
                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] font-bold">
                              <Eye className="w-3.5 h-3.5" /> {text.viewHistoryBtn}
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
                <div className="text-center py-12 opacity-60 text-xs">{lang === 'ru' ? 'Заказы не найдены.' : 'No orders found.'}</div>
              ) : (
                filteredOrders.map(o => (
                  <div key={o.docId} className={`p-4 rounded-2xl border space-y-3 ${t.subCardBg}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-black text-sm ${t.textAccent}`}>#{o.id}</span>
                        {o.isRush && (
                          <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded">⚡ {lang === 'ru' ? 'СРОЧНО' : 'RUSH'}</span>
                        )}
                      </div>
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
                      <td colSpan="9" className="text-center py-12 opacity-60">{lang === 'ru' ? 'Заказы не найдены.' : 'No orders found.'}</td>
                    </tr>
                  ) : (
                    filteredOrders.map(o => (
                      <tr key={o.docId} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-4 px-4 font-mono font-black text-sm">
                          <span className={t.textAccent}>#{o.id}</span>
                          {o.isRush && (
                            <span className="ml-2 bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded">⚡ {lang === 'ru' ? 'СРОЧНО' : 'RUSH'}</span>
                          )}
                        </td>
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
                  <h2 className="text-xl font-bold">{text.reportsTitle}</h2>
                  <p className="text-xs opacity-75">{text.reportsDesc}</p>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`flex p-1.5 rounded-2xl border ${t.navToggleBg}`}>
                    <button
                      onClick={() => { setReportTimeframe('day'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'day' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.todayBtn}
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('week'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'week' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.thisWeekBtn}
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('month'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'month' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.thisMonthBtn}
                    </button>
                    <button
                      onClick={() => { setReportTimeframe('year'); setStartDateFilter(''); setEndDateFilter(''); }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${reportTimeframe === 'year' && !startDateFilter ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                    >
                      {text.thisYearBtn}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> {text.exportExcelBtn}
                    </button>
                    <button
                      onClick={exportToPDF}
                      className={`px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${t.isLight ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                      <FileText className="w-4 h-4" /> {text.exportPdfBtn}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">{text.grossRevenue}</p>
                  <h3 className={`text-2xl font-extrabold ${t.textAccent}`}>€{periodRevenue.toFixed(2)}</h3>
                </div>
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">{text.totalExpenses}</p>
                  <h3 className="text-2xl font-extrabold text-rose-400">€{periodExpenses.toFixed(2)}</h3>
                </div>
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">{text.netOperatingProfit}</p>
                  <h3 className={`text-2xl font-extrabold ${periodNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    €{periodNetProfit.toFixed(2)}
                  </h3>
                </div>
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-2`}>
                  <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">{text.totalOrders}</p>
                  <h3 className={`text-2xl font-extrabold ${t.textAccent}`}>{periodOrderCount}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className={`p-6 rounded-2xl border ${t.subCardBg} space-y-4`}>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${t.textAccent}`} /> {text.serviceRevenueSplit}
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
                    <CreditCard className={`w-4 h-4 ${t.textAccent}`} /> {text.paymentBreakdown}
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span>💳 {text.cardPayments}</span>
                      <span className="font-bold">€{cardRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>💵 {text.cashPayments}</span>
                      <span className="font-bold">€{cashRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🏦 {text.capitalPayments}</span>
                      <span className="font-bold">€{capitalRevenue.toFixed(2)}</span>
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
                  <h2 className="text-xl font-bold">{text.bookkeepingTitle}</h2>
                  <p className="text-xs opacity-75">{text.bookkeepingDesc}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={exportExpensesToCSV}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> {text.exportExpensesBtn}
                  </button>
                </div>
              </div>

              {/* Full Timeframe & Custom Date Range Filter for Bookkeeping */}
              <div className={`p-4 rounded-2xl border flex flex-wrap justify-between items-center gap-4 ${t.subCardBg}`}>
                <div className={`flex p-1.5 rounded-2xl border ${t.navToggleBg}`}>
                  <button
                    onClick={() => { setBookkeepingTimeframe('day'); setBookkeepingStartDate(''); setBookkeepingEndDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${bookkeepingTimeframe === 'day' && !bookkeepingStartDate ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                  >
                    {text.todayBtn}
                  </button>
                  <button
                    onClick={() => { setBookkeepingTimeframe('week'); setBookkeepingStartDate(''); setBookkeepingEndDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${bookkeepingTimeframe === 'week' && !bookkeepingStartDate ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                  >
                    {text.thisWeekBtn}
                  </button>
                  <button
                    onClick={() => { setBookkeepingTimeframe('month'); setBookkeepingStartDate(''); setBookkeepingEndDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${bookkeepingTimeframe === 'month' && !bookkeepingStartDate ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                  >
                    {text.thisMonthBtn}
                  </button>
                  <button
                    onClick={() => { setBookkeepingTimeframe('year'); setBookkeepingStartDate(''); setBookkeepingEndDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${bookkeepingTimeframe === 'year' && !bookkeepingStartDate ? t.tabActive : 'opacity-70 hover:opacity-100'}`}
                  >
                    {text.thisYearBtn}
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold opacity-75">{text.customDateRange}</span>
                  <input 
                    type="date"
                    value={bookkeepingStartDate}
                    style={{ colorScheme: dateInputColorScheme }}
                    onChange={(e) => setBookkeepingStartDate(e.target.value)}
                    className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${t.innerInputBg}`}
                  />
                  <span className="text-xs opacity-60">to</span>
                  <input 
                    type="date"
                    value={bookkeepingEndDate}
                    style={{ colorScheme: dateInputColorScheme }}
                    onChange={(e) => setBookkeepingEndDate(e.target.value)}
                    className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${t.innerInputBg}`}
                  />
                  {(bookkeepingStartDate || bookkeepingEndDate) && (
                    <button
                      onClick={() => { setBookkeepingStartDate(''); setBookkeepingEndDate(''); }}
                      className="text-xs text-teal-400 underline font-semibold hover:text-teal-300 ml-1"
                    >
                      {text.clearCustomRange}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.grossRevenue}</p>
                  <p className={`text-xl font-extrabold ${t.textAccent}`}>€{periodRevenue.toFixed(2)}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.totalExpenses}</p>
                  <p className="text-xl font-extrabold text-rose-400">€{periodExpenses.toFixed(2)}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.netOperatingProfit}</p>
                  <p className={`text-xl font-extrabold ${periodNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    €{periodNetProfit.toFixed(2)}
                  </p>
                </div>
                <div className={`p-5 rounded-2xl border ${t.subCardBg} space-y-1`}>
                  <p className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">{text.profitMargin}</p>
                  <p className={`text-xl font-extrabold ${profitMargin >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                    {profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddExpense} className={`p-6 rounded-2xl border space-y-4 ${t.subCardBg}`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Wallet className={`w-4 h-4 ${t.textAccent}`} /> {text.recordNewExpense}
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={isRecurringMonthly}
                      onChange={(e) => setIsRecurringMonthly(e.target.checked)}
                      className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                    />
                    <span className="flex items-center gap-1"><Repeat className="w-3.5 h-3.5 text-teal-400" /> {text.recurringMonthlyBill}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{lang === 'ru' ? 'Дата' : 'Date'}</label>
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
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.vendorLabel}</label>
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
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.categoryLabel}</label>
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
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{text.amountLabel}</label>
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
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider opacity-75 mb-1">{lang === 'ru' ? 'Загрузить чек (Облако)' : 'Attach Receipt Photo'}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadReceiptToImgBB(e.target.files[0], false)}
                        className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-500 file:text-slate-950 hover:file:bg-teal-400 cursor-pointer"
                      />
                      {expenseReceiptUrl && (
                        <span className="text-teal-400 font-bold text-xs flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-4 h-4" /> {lang === 'ru' ? 'Загружен' : 'Ready'}
                        </span>
                      )}
                    </div>
                    {isUploadingReceipt && <p className="text-[10px] text-teal-400 animate-pulse mt-1">{lang === 'ru' ? 'Загрузка в облако...' : 'Uploading receipt to cloud...'}</p>}
                  </div>
                  <div>
                    <button
                      type="submit"
                      className={`w-full font-bold py-2.5 px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${t.primary}`}
                    >
                      <Plus className="w-4 h-4" /> {text.recordExpenseBtn}
                    </button>
                  </div>
                </div>
              </form>

              <div className="pt-4 overflow-x-auto">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <h3 className="text-sm font-bold">{text.recordedExpensesLog}</h3>
                  <span className="font-mono text-sm font-extrabold text-rose-400">Total: €{periodExpenses.toFixed(2)}</span>
                </div>
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-700/50 opacity-70">
                      <th className="py-3 px-3">{lang === 'ru' ? 'Дата' : 'Date'}</th>
                      <th className="py-3 px-3">{text.vendorLabel}</th>
                      <th className="py-3 px-3">{text.categoryLabel}</th>
                      <th className="py-3 px-3">{text.amountLabel}</th>
                      <th className="py-3 px-3">{lang === 'ru' ? 'Чек' : 'Receipt'}</th>
                      <th className="py-3 px-3 text-right">{text.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {filteredExpensesByTimeframe.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-10 opacity-60">{lang === 'ru' ? 'За этот период расходов не найдено.' : 'No expenses recorded for this timeframe.'}</td>
                      </tr>
                    ) : (
                      filteredExpensesByTimeframe.map(ex => (
                        <tr key={ex.docId} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3 px-3 font-mono">{ex.date || ex.createdAt?.split('T')[0]}</td>
                          <td className="py-3 px-3 font-semibold flex items-center gap-2">
                            {ex.description}
                            {ex.isRecurring && (
                              <span className="bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Repeat className="w-3 h-3" /> {lang === 'ru' ? 'Ежемесячно' : 'Monthly'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 opacity-80">{ex.category}</td>
                          <td className="py-3 px-3 font-bold text-rose-400">€{ex.amount.toFixed(2)}</td>
                          <td className="py-3 px-3">
                            {ex.receiptUrl ? (
                              <button
                                onClick={() => setPreviewReceiptUrl(ex.receiptUrl)}
                                className="px-2.5 py-1 bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 border border-teal-500/30 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-sm"
                              >
                                <Eye className="w-3 h-3" /> {lang === 'ru' ? 'Чек' : 'View'}
                              </button>
                            ) : (
                              <span className="opacity-40 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingExpenseId(ex.docId);
                                setEditExpenseValues({
                                  description: ex.description || '',
                                  category: ex.category || 'Supplies & Materials',
                                  amount: ex.amount || '',
                                  date: ex.date || new Date().toISOString().split('T')[0],
                                  isRecurring: !!ex.isRecurring,
                                  receiptUrl: ex.receiptUrl || ''
                                });
                              }}
                              className="px-3 py-1 bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 border border-teal-500/30 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" /> {text.editBtn}
                            </button>
                            <button
                              onClick={() => deleteExpense(ex.docId)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px]"
                            >
                              {text.delete}
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
                  <PieChart className={`w-4 h-4 ${t.textAccent}`} /> {text.spendingBreakdownTitle}
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
                <Palette className={`w-5 h-5 ${t.textAccent}`} /> {text.appearanceTitle}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setThemeMode('teal-dark')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${themeMode === 'teal-dark' ? 'border-teal-500 bg-teal-500/10 shadow-md' : 'border-slate-700 bg-slate-900'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                  <p className="text-xs font-bold text-white">{text.tealDark}</p>
                </button>

                <button
                  onClick={() => setThemeMode('teal-light')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${themeMode === 'teal-light' ? 'border-teal-600 bg-teal-100 text-slate-900 shadow-md' : 'border-slate-300 bg-white text-slate-900'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-teal-600"></div>
                  <p className="text-xs font-bold">{text.tealLight}</p>
                </button>
              </div>
            </div>

            {isAdmin && (
              <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 ${t.cardBg}`}>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sliders className={`w-5 h-5 ${t.textAccent}`} /> {text.displayScalingTitle}
                </h2>

                {!isOptimizationUnlocked ? (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs font-semibold">{text.enterPinCalibration}</p>
                    {optimizationPinError && (
                      <p className="text-xs text-rose-400 font-medium">{text.incorrectPin}</p>
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
                      <span className={t.textAccent}>{text.calibrationUnlocked}</span>
                      <button 
                        onClick={() => setIsOptimizationUnlocked(false)}
                        className="opacity-70 hover:opacity-100 underline"
                      >
                        Lock
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{text.displayScaleMultiplier}</label>
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
