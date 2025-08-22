import React, { useEffect, useState, useCallback, memo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import {
  ArrowUpCircle,
  ShoppingCart,
  MoreVertical,
  X,
  ChevronDown,
  Minus,
  Plus,
  Truck,
  MapPin,
  Phone,
  User as UserIcon,
  Home,
  Target,
  CheckCircle2,
  AlertCircle,
  Search,
  ShoppingBag,
  Wifi,
  WifiOff
} from "lucide-react";

// Supabase configuration - Replace with your actual Supabase URL and Anon Key
const SUPABASE_URL = "https://ezctmesapmuuoiusjlau.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y3RtZXNhcG11dW9pdXNqbGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0OTIyMTEsImV4cCI6MjA3MTA2ODIxMX0.kV1E_riNha-IgX5__Lf3XO1HTYhP4e01o_GlJ1Pbo_4";

/* ----------------- API Service ----------------- */
class ApiService {
  constructor() {
    this.baseUrl = SUPABASE_URL;
    this.apiKey = SUPABASE_ANON_KEY;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/functions/v1/${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async getProducts() {
    return this.request('products');
  }

  async createOrder(orderData) {
    return this.request('orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(phone) {
    return this.request(`orders?phone=${encodeURIComponent(phone)}`);
  }

  async getMarketMetrics() {
    return this.request('market-metrics');
  }
}

const apiService = new ApiService();

/* ----------------- Error Boundary ----------------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white grid place-content-center p-4">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page and try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ----------------- Utilities ----------------- */
const sanitizeInput = (input) => {
  return input.replace(/[<>"']/g, '').trim();
};

const validatePhone = (phone) => {
  const indianPhoneRegex = /^[+]?91?[6-9]\d{9}$/;
  return indianPhoneRegex.test(phone.replace(/\s+/g, ''));
};

const validatePinCode = (pin) => {
  const pinRegex = /^\d{6}$/;
  return pinRegex.test(pin);
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/* ----------------- Base64 Logo ----------------- */
const LOGO_SVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzE2YTM0YSIvPgo8cGF0aCBkPSJNMTYgNkM5LjM3MjU4IDYgNCA5LjM3MjU4IDQgMTZTOS4zNzI1OCAyNiAxNiAyNlMyOCAyMi42Mjc0IDI4IDE2UzIyLjYyNzQgNiAxNiA2WiIgZmlsbD0id2hpdGUiLz4KPHA+dGggZD0iTTE2IDhDMTAuNDc3MiA4IDYgMTAuNDc3MiA2IDE2UzEwLjQ3NzIgMjQgMTYgMjRTMjYgMjEuNTIyOCAyNiAxNlMyMS41MjI4IDggMTYgOFoiIGZpbGw9IiMxNmEzNGEiLz4KPC9zdmc+";

const FALLBACK_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzEwNS41MjMgMTIwIDExMCAxMTUuNTIzIDExMCAxMTBTMTA1LjUyMyAxMDAgMTAwIDEwMFM5MCA5NS40NzczIDkwIDEwMFM5NC40NzczIDEyMCAxMDAgMTIwWiIgZmlsbD0iI2Q5ZGNlMSIvPgo8L3N2Zz4=";

/* ----------------- UI Primitives ----------------- */
const Button = memo(({ className = "", children, loading = false, ...props }) => (
  <button
    className={`px-4 py-2 rounded-xl font-medium transition border border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    disabled={loading}
    {...props}
  >
    {loading ? "Loading..." : children}
  </button>
));

const Card = memo(({ className = "", children }) => (
  <div className={`rounded-2xl border bg-white ${className}`}>{children}</div>
));

const CardContent = memo(({ className = "", children }) => (
  <div className={className}>{children}</div>
));

const CardTitle = memo(({ className = "", children }) => (
  <div className={`font-semibold ${className}`}>{children}</div>
));

const LoadingSpinner = memo(() => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
));

/* ----------------- Cart Reducer ----------------- */
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_QUANTITY':
      return state.map(item => 
        item.id === action.id 
          ? { ...item, qty: Math.max(0, item.qty + action.delta) }
          : item
      );
    
    case 'SET_GRADE':
      return state.map(item =>
        item.id === action.id
          ? { ...item, grade: action.grade }
          : item
      );
    
    case 'CLEAR_CART':
      return state.map(item => ({ ...item, qty: 0 }));
    
    case 'INITIALIZE':
      return action.items;
    
    default:
      return state;
  }
};

/* ----------------- Optimized Image Component ----------------- */
const OptimizedImage = memo(({ src, alt, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
    setImgSrc(FALLBACK_IMAGE);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse grid place-content-center">
          <LoadingSpinner />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        {...props}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-100 grid place-content-center text-gray-400 text-xs">
          Image unavailable
        </div>
      )}
    </div>
  );
});

/* ----------------- Validated Input Component ----------------- */
const ValidatedInput = memo(({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  validator, 
  errorMessage,
  icon: Icon,
  className = "",
  ...props 
}) => {
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback((e) => {
    const sanitized = sanitizeInput(e.target.value);
    onChange(sanitized);
    
    if (touched && validator) {
      const isValid = validator(sanitized);
      setError(isValid ? "" : errorMessage);
    }
  }, [onChange, validator, errorMessage, touched]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (validator) {
      const isValid = validator(value);
      setError(isValid ? "" : errorMessage);
    }
  }, [validator, value, errorMessage]);

  return (
    <div className="w-full">
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 bg-gray-50 ${error ? 'border-red-300' : 'border-gray-200'} ${className}`}>
        {Icon && <Icon className="h-4 w-4 text-gray-500" />}
        <input
          type={type}
          className="bg-transparent outline-none w-full text-sm"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />
      </div>
      {error && touched && (
        <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
});

/* ----------------- Grade Selector ----------------- */
const GradeSelector = memo(({ open, onClose, item, grade, setGrade, grades }) => {
  const groupName = React.useId();
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 grid place-content-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-4 sm:max-w-[480px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="mb-4">
          <div className="font-bold text-lg">Choose Grade</div>
          <div className="text-sm text-gray-600">
            Select a quality grade for <b>{item.name}</b> ({item.variety})
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-start">
          <OptimizedImage
            src={item.image_url}
            alt={item.name}
            className="col-span-2 rounded-xl w-full aspect-square object-cover"
          />
          <div className="col-span-3 space-y-3">
            {grades.map((g) => (
              <label
                key={g.grade_key}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="text-sm">
                  <div className="font-medium">{g.grade_label}</div>
                  <div className="text-xs text-gray-500">
                    ₹{Math.round(item.base_price * g.price_multiplier)} / {item.unit}
                  </div>
                </div>
                <input
                  type="radio"
                  name={groupName}
                  className="h-5 w-5 accent-green-600"
                  checked={grade === g.grade_key}
                  onChange={() => setGrade(g.grade_key)}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

/* ----------------- Product Card ----------------- */
const ProductCard = memo(({ item, onUpdateQuantity, onOpenGrade }) => {
  const grade = item.product_grades?.find(g => g.grade_key === item.grade);
  const price = Math.round(item.base_price * (grade?.price_multiplier ?? 1));
  const save = Math.max(0, item.mrp - price);

  const handleIncrement = useCallback(() => {
    onUpdateQuantity(item.id, 1);
  }, [item.id, onUpdateQuantity]);

  const handleDecrement = useCallback(() => {
    onUpdateQuantity(item.id, -1);
  }, [item.id, onUpdateQuantity]);

  const handleGradeOpen = useCallback(() => {
    onOpenGrade(item.id);
  }, [item.id, onOpenGrade]);

  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm border-gray-200 transition-transform hover:scale-[1.02]">
      <div className="relative">
        <OptimizedImage 
          src={item.image_url} 
          alt={item.name} 
          className="w-full h-40 object-cover" 
        />
        <div className="absolute top-2 left-2 flex gap-2">
          {save > 0 && (
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              Save ₹{save}
            </span>
          )}
          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
            Festive Offer
          </span>
        </div>
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow hover:bg-white transition"
          onClick={handleGradeOpen}
          aria-label="Choose grade"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base leading-tight">
              {item.name} <span className="text-gray-500">({item.variety})</span>
            </CardTitle>
            <div className="text-xs text-gray-500 mt-1">{grade?.grade_label}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">₹{price}</div>
            {item.mrp > price && (
              <div className="text-xs text-gray-500 line-through">₹{item.mrp}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Truck className="h-4 w-4" /> Free delivery
          </div>
          
          {item.qty === 0 ? (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleIncrement}
            >
              Add to Cart
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-2 py-1 shadow-sm">
              <button
                className="h-7 w-7 grid place-content-center rounded-full hover:bg-gray-100 transition"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-medium">
                {item.qty}
              </span>
              <button
                className="h-7 w-7 grid place-content-center rounded-full hover:bg-gray-100 transition"
                onClick={handleIncrement}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-600 flex items-center">
          Min: {item.min_order_qty} {item.unit} <ChevronDown className="inline h-3 w-3 ml-1" />
        </div>
      </CardContent>
    </Card>
  );
});

/* ----------------- Connection Status ----------------- */
const ConnectionStatus = memo(({ isOnline }) => {
  if (isOnline) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        No internet connection - Working offline
      </div>
    </div>
  );
});

/* ----------------- Main App Component ----------------- */
function KhetiKaraApp() {
  const [screen, setScreen] = useState("splash");
  const [language, setLanguage] = useState("অসমীয়া");
  const [items, dispatch] = useReducer(cartReducer, []);
  const [showLang, setShowLang] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("catalogue");
  const [gradeOpen, setGradeOpen] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [marketMetrics, setMarketMetrics] = useState([]);

  // Recipients with stable keys to prevent input cursor issues
  const [recipients, setRecipients] = useState([
    { id: uid(), name: "", phone: "", flat: "", pin: "", errors: {} },
  ]);

  // Online status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        
        const productsWithCart = response.products.map(product => ({
          ...product,
          grade: product.product_grades?.[0]?.grade_key || 'A1',
          qty: 0
        }));
        
        dispatch({ type: 'INITIALIZE', items: productsWithCart });
      } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to default items if API fails
        const defaultItems = [
          { id: "item-1", name: "Desi Tomatoes", variety: "Bilahi", unit: "kg", base_price: 56, mrp: 62, image_url: "https://images.unsplash.com/photo-1546470427-0fd5d2aa7c39?q=80&w=600&auto=format&fit=crop", product_grades: [
            { grade_key: "A1", grade_label: "A1 - Premium Grade", price_multiplier: 1.0 },
            { grade_key: "A2", grade_label: "A2 - Standard Grade", price_multiplier: 0.9 },
            { grade_key: "A3", grade_label: "A3 - Economy Grade", price_multiplier: 0.78 },
          ]},
          { id: "item-2", name: "Onion", variety: "Red", unit: "kg", base_price: 48, mrp: 54, image_url: "https://images.unsplash.com/photo-1604908554049-9f4a2f2f8bff?q=80&w=600&auto=format&fit=crop", product_grades: [
            { grade_key: "A1", grade_label: "A1 - Premium Grade", price_multiplier: 1.0 },
            { grade_key: "A2", grade_label: "A2 - Standard Grade", price_multiplier: 0.9 },
            { grade_key: "A3", grade_label: "A3 - Economy Grade", price_multiplier: 0.78 },
          ]},
        ].map(item => ({ ...item, grade: "A1", qty: 0, min_order_qty: 1, max_order_qty: 100 }));
        
        dispatch({ type: 'INITIALIZE', items: defaultItems });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load market metrics
  useEffect(() => {
    const loadMarketMetrics = async () => {
      try {
        const response = await apiService.getMarketMetrics();
        setMarketMetrics(response.metrics || []);
      } catch (error) {
        console.error('Failed to load market metrics:', error);
        // Set default metrics
        setMarketMetrics([
          { metric_type: 'market_arrival_volume', metric_value: 2.82, metric_unit: 'percent', description: 'Market Arrival Volume Change' },
          { metric_type: 'demand_index', metric_value: -0.4, metric_unit: 'points', description: 'Demand Index Change' }
        ]);
      }
    };

    loadMarketMetrics();
  }, []);

  // Splash screen timer
  useEffect(() => {
    if (screen === "splash") {
      const timer = setTimeout(() => {
        setScreen("catalogue");
        setActiveTab("catalogue");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Memoized calculations
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const query = search.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.variety.toLowerCase().includes(query)
    );
  }, [items, search]);

  const cartSummary = useMemo(() => {
    const cartItems = items.filter(item => item.qty > 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
    
    const itemTotal = cartItems.reduce((sum, item) => {
      const grade = item.product_grades?.find(g => g.grade_key === item.grade);
      const price = Math.round(item.base_price * (grade?.price_multiplier ?? 1));
      return sum + (price * item.qty);
    }, 0);
    
    const itemMrpTotal = cartItems.reduce((sum, item) => sum + (item.mrp * item.qty), 0);
    const saved = Math.max(0, itemMrpTotal - itemTotal);
    const handlingFee = Math.round(itemTotal * 0.02);
    const totalAmount = itemTotal + handlingFee;

    return {
      items: cartItems,
      count: cartCount,
      itemTotal,
      itemMrpTotal,
      saved,
      handlingFee,
      totalAmount
    };
  }, [items]);

  // Memoized callbacks
  const updateQuantity = useCallback((id, delta) => {
    dispatch({ type: 'UPDATE_QUANTITY', id, delta });
  }, []);

  const setItemGrade = useCallback((id, grade) => {
    dispatch({ type: 'SET_GRADE', id, grade });
    setGradeOpen(null);
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const handleSearch = useCallback((value) => {
    setSearch(value);
  }, []);

  const openGradeSelector = useCallback((itemId) => {
    setGradeOpen(itemId);
  }, []);

  const closeGradeSelector = useCallback(() => {
    setGradeOpen(null);
  }, []);

  // Recipient management with stable updates
  const updateRecipient = useCallback((id, field, value) => {
    setRecipients(prev => prev.map(recipient => 
      recipient.id === id 
        ? { 
            ...recipient, 
            [field]: sanitizeInput(value),
            errors: { ...recipient.errors, [field]: "" } // Clear field error
          }
        : recipient
    ));
  }, []);

  const addRecipient = useCallback(() => {
    setRecipients(prev => [
      ...prev,
      { id: uid(), name: "", phone: "", flat: "", pin: "", errors: {} }
    ]);
  }, []);

  const removeRecipient = useCallback((id) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  }, []);

  const validateRecipients = useCallback(() => {
    let isValid = true;
    const updatedRecipients = recipients.map(recipient => {
      const errors = {};
      
      if (!recipient.name.trim()) {
        errors.name = "Name is required";
        isValid = false;
      }
      
      if (!recipient.phone.trim()) {
        errors.phone = "Phone number is required";
        isValid = false;
      } else if (!validatePhone(recipient.phone)) {
        errors.phone = "Invalid phone number";
        isValid = false;
      }
      
      if (!recipient.flat.trim()) {
        errors.flat = "Address is required";
        isValid = false;
      }
      
      if (!recipient.pin.trim()) {
        errors.pin = "PIN code is required";
        isValid = false;
      } else if (!validatePinCode(recipient.pin)) {
        errors.pin = "Invalid PIN code";
        isValid = false;
      }

      return { ...recipient, errors };
    });

    setRecipients(updatedRecipients);
    return isValid;
  }, [recipients]);

  const handleOrderSubmit = useCallback(async () => {
    if (!validateRecipients()) return;
    
    setLoading(true);
    
    try {
      // Prepare order data for API
      const orderData = {
        customer: {
          phone: recipients[0].phone,
          name: recipients[0].name,
          language_preference: language
        },
        addresses: recipients.map(r => ({
          name: r.name,
          phone: r.phone,
          flat_address: r.flat,
          pin_code: r.pin
        })),
        items: cartSummary.items.map(item => {
          const grade = item.product_grades?.find(g => g.grade_key === item.grade);
          const price = Math.round(item.base_price * (grade?.price_multiplier ?? 1));
          return {
            product_id: item.id,
            product_name: item.name,
            product_variety: item.variety,
            grade_key: item.grade,
            grade_label: grade?.grade_label || 'A1 - Premium Grade',
            unit_price: price,
            quantity: item.qty,
            total_price: price * item.qty
          };
        }),
        items_total: cartSummary.itemTotal,
        handling_fee: cartSummary.handlingFee,
        delivery_fee: 0,
        discount_amount: 0,
        total_amount: cartSummary.totalAmount,
        notes: "Order placed via KhetiKara app"
      };

      const response = await apiService.createOrder(orderData);
      setOrderId(response.order_number);
      setOrderPlaced(true);
    } catch (error) {
      console.error('Order submission failed:', error);
      // Fallback to local order ID generation
      const newOrderId = `KK${Date.now().toString().slice(-6)}`;
      setOrderId(newOrderId);
      setOrderPlaced(true);
    } finally {
      setLoading(false);
    }
  }, [validateRecipients, recipients, language, cartSummary]);

  const handleOrderComplete = useCallback(() => {
    setOrderPlaced(false);
    setScreen("catalogue");
    setActiveTab("catalogue");
    clearCart();
    setRecipients([{ id: uid(), name: "", phone: "", flat: "", pin: "", errors: {} }]);
  }, [clearCart]);

  // Get market metrics for display
  const arrivalVolumeMetric = marketMetrics.find(m => m.metric_type === 'market_arrival_volume');
  const demandIndexMetric = marketMetrics.find(m => m.metric_type === 'demand_index');

  // Screen Components
  const SplashScreen = memo(() => (
    <div className="fixed inset-0 z-50 grid place-content-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <img src={LOGO_SVG} alt="KhetiKara" className="h-16" />
          <div className="absolute -inset-4 bg-green-100 rounded-full animate-ping opacity-20"></div>
        </div>
        
        {showLang && (
          <div className="relative">
            <button
              className="absolute -top-2 -right-2 p-1 bg-white rounded-full border shadow hover:bg-gray-50 transition"
              onClick={() => setShowLang(false)}
              aria-label="Close language selector"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="w-[320px] rounded-2xl border shadow-lg bg-white p-4">
              <div className="font-bold text-lg mb-2">Choose your language</div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "অসমীয়া", value: "অসমীয়া" },
                  { label: "English", value: "English" },
                  { label: "हिंदी", value: "हिंदी" },
                ].map((lng) => (
                  <label
                    key={lng.value}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 cursor-pointer transition"
                  >
                    <span>{lng.label}</span>
                    <input
                      type="radio"
                      name="language-selector"
                      className="h-5 w-5 accent-green-600"
                      checked={language === lng.value}
                      onChange={() => setLanguage(lng.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ));

  const Header = memo(() => (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <img src={LOGO_SVG} alt="KhetiKara" className="h-8" />
        <div className="flex-1">
          <div className="flex items-center gap-2 border rounded-full px-3 py-2 bg-gray-50">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              className="bg-transparent outline-none w-full text-sm"
              placeholder="Search for vegetables, fruits..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
        </div>
      </div>
    </div>
  ));

  const MarketMetrics = memo(() => (
    <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
      <div className="flex items-center gap-2 text-green-700 font-semibold">
        <span className="inline-block h-2 w-2 rounded-full bg-green-600 animate-pulse" />
        +{arrivalVolumeMetric?.metric_value || 2.82}% <span className="text-gray-700 font-normal">Market Arrival Volume</span>
      </div>
      <div className="flex items-center gap-2 text-red-600 font-semibold">
        ↓{Math.abs(demandIndexMetric?.metric_value || 0.4)} <span className="text-gray-700 font-normal">Demand Index</span>
      </div>
    </div>
  ));

  const PromoBanner = memo(() => (
    <div className="rounded-2xl bg-gradient-to-r from-green-100 via-green-50 to-emerald-50 p-4 border border-green-200">
      <div className="text-sm font-medium text-green-800">Fresh from wholesale markets • Morning arrivals</div>
      <div className="text-xs text-green-600 mt-1">Lock-in pre-order prices & reduce wastage</div>
    </div>
  ));

  const BottomCartBar = memo(() => {
    if (cartSummary.count === 0) return null;
    
    return (
      <div className="fixed bottom-16 left-0 right-0 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between bg-white shadow-lg rounded-2xl border p-3">
            <div className="text-sm">
              <div className="font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                {cartSummary.count} item{cartSummary.count !== 1 ? "s" : ""} • ₹{cartSummary.itemTotal}
              </div>
              <div className="text-xs text-purple-600">
                You saved ₹{cartSummary.saved} on this order
              </div>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setScreen("cart");
                setActiveTab("basket");
              }}
            >
              View Cart
            </Button>
          </div>
        </div>
      </div>
    );
  });

  const BottomNav = memo(() => (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t z-40">
      <div className="max-w-5xl mx-auto grid grid-cols-2">
        <button
          className={`flex flex-col items-center gap-1 py-2 transition ${
            activeTab === "catalogue" ? "text-green-700" : "text-gray-500"
          }`}
          onClick={() => {
            setScreen("catalogue");
            setActiveTab("catalogue");
          }}
        >
          <ArrowUpCircle className="h-6 w-6" />
          <span className="text-xs">Catalogue</span>
        </button>
        <button
          className={`flex flex-col items-center gap-1 py-2 transition relative ${
            activeTab === "basket" ? "text-green-700" : "text-gray-500"
          }`}
          onClick={() => {
            setScreen("cart");
            setActiveTab("basket");
          }}
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="text-xs">Basket</span>
          {cartSummary.count > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs grid place-content-center animate-pulse">
              {cartSummary.count > 99 ? "99+" : cartSummary.count}
            </span>
          )}
        </button>
      </div>
    </div>
  ));

  // Main render logic
  if (screen === "splash") {
    return <SplashScreen />;
  }

  if (orderPlaced) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <ConnectionStatus isOnline={isOnline} />
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <CheckCircle2 className="w-full h-full text-green-600" />
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30"></div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600">Order #{orderId}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border text-left space-y-4">
                <h2 className="font-semibold text-lg">Order Summary</h2>
                
                <div className="space-y-2">
                  {cartSummary.items.map(item => {
                    const grade = item.product_grades?.find(g => g.grade_key === item.grade);
                    const price = Math.round(item.base_price * (grade?.price_multiplier ?? 1));
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} ({item.variety}) × {item.qty}</span>
                        <span>₹{price * item.qty}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Items Total</span>
                    <span>₹{cartSummary.itemTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Handling Fee</span>
                    <span>₹{cartSummary.handlingFee}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>₹{cartSummary.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>📱 You'll receive SMS updates on your order status</p>
                <p>🚚 Expected delivery: Tomorrow morning</p>
                <p>💳 Pay cash on delivery</p>
              </div>

              <Button
                className="bg-green-600 hover:bg-green-700 text-white w-full"
                onClick={handleOrderComplete}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (screen === "cart") {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 pb-20">
          <ConnectionStatus isOnline={isOnline} />
          <Header />
          
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            {cartSummary.count === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Add some fresh vegetables to get started</p>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setScreen("catalogue");
                    setActiveTab("catalogue");
                  }}
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-lg">Your Cart ({cartSummary.count} items)</CardTitle>
                    <Button
                      className="text-red-600 hover:bg-red-50 bg-transparent border-none"
                      onClick={clearCart}
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {cartSummary.items.map(item => {
                      const grade = item.product_grades?.find(g => g.grade_key === item.grade);
                      const price = Math.round(item.base_price * (grade?.price_multiplier ?? 1));
                      
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 border rounded-xl">
                          <OptimizedImage
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          
                          <div className="flex-1">
                            <div className="font-medium">{item.name} ({item.variety})</div>
                            <div className="text-sm text-gray-500">{grade?.grade_label}</div>
                            <div className="text-lg font-semibold">₹{price} / {item.unit}</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              className="h-8 w-8 grid place-content-center rounded-full border hover:bg-gray-50 transition"
                              onClick={() => updateQuantity(item.id, -1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[2rem] text-center font-medium">
                              {item.qty}
                            </span>
                            <button
                              className="h-8 w-8 grid place-content-center rounded-full border hover:bg-gray-50 transition"
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold">₹{price * item.qty}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Delivery Information */}
                <Card className="p-4">
                  <CardTitle className="text-lg mb-4">Delivery Information</CardTitle>
                  
                  <div className="space-y-4">
                    {recipients.map((recipient, index) => (
                      <div key={recipient.id} className="space-y-3 p-4 border rounded-xl bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Recipient {index + 1}</div>
                          {recipients.length > 1 && (
                            <button
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                              onClick={() => removeRecipient(recipient.id)}
                              aria-label="Remove recipient"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <ValidatedInput
                              placeholder="Full Name"
                              value={recipient.name}
                              onChange={(value) => updateRecipient(recipient.id, 'name', value)}
                              validator={(value) => value.trim().length > 0}
                              errorMessage="Name is required"
                              icon={UserIcon}
                            />
                            {recipient.errors.name && (
                              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {recipient.errors.name}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <ValidatedInput
                              type="tel"
                              placeholder="Phone Number"
                              value={recipient.phone}
                              onChange={(value) => updateRecipient(recipient.id, 'phone', value)}
                              validator={validatePhone}
                              errorMessage="Invalid phone number"
                              icon={Phone}
                            />
                            {recipient.errors.phone && (
                              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {recipient.errors.phone}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <ValidatedInput
                              placeholder="Flat/House Address"
                              value={recipient.flat}
                              onChange={(value) => updateRecipient(recipient.id, 'flat', value)}
                              validator={(value) => value.trim().length > 0}
                              errorMessage="Address is required"
                              icon={Home}
                            />
                            {recipient.errors.flat && (
                              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {recipient.errors.flat}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <ValidatedInput
                              placeholder="PIN Code"
                              value={recipient.pin}
                              onChange={(value) => updateRecipient(recipient.id, 'pin', value)}
                              validator={validatePinCode}
                              errorMessage="Invalid PIN code"
                              icon={MapPin}
                            />
                            {recipient.errors.pin && (
                              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {recipient.errors.pin}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-dashed border-2 border-gray-300"
                      onClick={addRecipient}
                    >
                      + Add Another Recipient
                    </Button>
                  </div>
                </Card>

                {/* Order Summary */}
                <Card className="p-4">
                  <CardTitle className="text-lg mb-4">Order Summary</CardTitle>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items Total ({cartSummary.count} items)</span>
                      <span>₹{cartSummary.itemTotal}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>You Saved</span>
                      <span>-₹{cartSummary.saved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Handling Fee (2%)</span>
                      <span>₹{cartSummary.handlingFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span>₹{cartSummary.totalAmount}</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleOrderSubmit}
                    loading={loading}
                  >
                    {loading ? "Placing Order..." : "Place Order (Cash on Delivery)"}
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center mt-2">
                    By placing this order, you agree to pay cash on delivery
                  </div>
                </Card>
              </>
            )}
          </div>
          
          <BottomNav />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 pb-20">
        <ConnectionStatus isOnline={isOnline} />
        <Header />
        
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <MarketMetrics />
          <PromoBanner />
          
          {loading ? (
            <div className="grid place-content-center py-12">
              <LoadingSpinner />
              <p className="text-gray-500 mt-4">Loading fresh products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(item => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onOpenGrade={openGradeSelector}
                />
              ))}
            </div>
          )}
          
          {filtered.length === 0 && !loading && search && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No products found</h2>
              <p className="text-gray-500 mb-6">Try searching with different keywords</p>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setSearch("")}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
        
        <BottomCartBar />
        <BottomNav />
        
        {/* Grade Selector Modal */}
        {gradeOpen && (
          <GradeSelector
            open={!!gradeOpen}
            onClose={closeGradeSelector}
            item={items.find(item => item.id === gradeOpen)}
            grade={items.find(item => item.id === gradeOpen)?.grade}
            setGrade={(grade) => setItemGrade(gradeOpen, grade)}
            grades={items.find(item => item.id === gradeOpen)?.product_grades || []}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <CartProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <KhetiKaraApp />
    </CartProvider>
  );
}

export default App;