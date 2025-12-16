import React, { useState, useEffect, useMemo, useReducer, useCallback } from 'react';
import { 
  ShoppingCart, Search, User as UserIcon, Heart, Menu, X, 
  Trash2, Plus, Minus, CreditCard, LogOut, CheckCircle, 
  Star, TrendingUp, DollarSign, Filter, ArrowRight, ShieldCheck, Truck
} from 'lucide-react';
import { MOCK_PRODUCTS, CATEGORIES } from './data';
import { Product, CartItem, User, Order, SortOption, FilterState } from './types';

// --- Toast Component ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-24 right-4 z-50 glass-panel px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-down border-l-4 ${type === 'success' ? 'border-l-green-500' : 'border-l-red-500'}`}>
      {type === 'success' ? <CheckCircle className="text-green-400" size={20} /> : <ShieldCheck className="text-red-400" size={20} />}
      <p className="font-medium text-white">{message}</p>
    </div>
  );
};

// --- Product Card Component ---
interface ProductCardProps {
  product: Product;
  onAdd: (p: Product) => void;
  onWishlist: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onWishlist }) => {
  const finalPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col h-full relative">
      {product.discount > 0 && (
        <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
          -{product.discount}%
        </div>
      )}
      {product.isNew && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
          NEW
        </div>
      )}
      <div className="relative aspect-square overflow-hidden bg-gray-800/50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button 
          onClick={(e) => { e.stopPropagation(); onWishlist(product); }}
          className="absolute bottom-3 right-3 p-2 rounded-full glass-panel hover:bg-white/20 transition-colors text-white"
        >
          <Heart size={18} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{product.category}</span>
          <div className="flex items-center text-yellow-400 gap-1 text-xs">
            <Star size={12} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
        </div>
        <h3 className="font-display font-bold text-lg leading-tight mb-2 text-white">{product.name}</h3>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white">${finalPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <span className="text-sm text-slate-500 line-through">${product.price}</span>
            )}
          </div>
          <button 
            onClick={() => onAdd(product)}
            className="p-3 bg-white text-slate-900 rounded-xl hover:bg-slate-200 transition-colors font-bold flex items-center gap-2"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---
export default function App() {
  // State
  const [view, setView] = useState<'home' | 'checkout' | 'profile'>('home');
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Filters & Sorting
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    minPrice: 0,
    maxPrice: 1000,
    search: '',
    minRating: 0
  });
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  // Persistence
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // Actions
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast('Not enough stock available', 'error');
          return prev;
        }
        showToast('Quantity updated', 'success');
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      showToast('Added to cart', 'success');
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.includes(product.id)) {
        showToast('Removed from wishlist');
        return prev.filter(id => id !== product.id);
      }
      showToast('Added to wishlist');
      return [...prev, product.id];
    });
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    
    // Simulating Auth
    setTimeout(() => {
      setUser({
        id: 'user-123',
        name: email.split('@')[0],
        email: email,
        city: 'Cyber City',
        country: 'Netland',
        address: '123 Virtual Lane'
      });
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${email.split('@')[0]}!`);
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    showToast('Logged out successfully');
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    showToast('Processing payment...', 'success');
    setTimeout(() => {
      setCart([]);
      setView('home');
      showToast('Order placed successfully! #ORD-' + Math.floor(Math.random() * 10000));
    }, 2000);
  };

  // Derived State
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = filters.category === 'All' || p.category === filters.category;
        const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
        const matchesRating = p.rating >= filters.minRating;
        return matchesCategory && matchesSearch && matchesPrice && matchesRating;
      })
      .sort((a, b) => {
        const priceA = a.price * (1 - a.discount/100);
        const priceB = b.price * (1 - b.discount/100);
        
        switch(sortBy) {
          case 'price-asc': return priceA - priceB;
          case 'price-desc': return priceB - priceA;
          case 'newest': return (a.isNew ? -1 : 1);
          default: return b.rating - a.rating; // popularity
        }
      });
  }, [products, filters, sortBy]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);

  // --- Views ---

  // Home View
  const HomeView = () => (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filter */}
      <aside className="lg:w-64 flex-shrink-0 space-y-6">
        <div className="glass-panel rounded-2xl p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xl">Filters</h3>
            <Filter size={20} className="text-slate-400" />
          </div>
          
          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Categories</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setFilters(f => ({...f, category: 'All'}))}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${filters.category === 'All' ? 'bg-white text-black font-medium' : 'hover:bg-white/10 text-slate-300'}`}
              >
                All Products
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilters(f => ({...f, category: cat}))}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${filters.category === cat ? 'bg-white text-black font-medium' : 'hover:bg-white/10 text-slate-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Max Price: ${filters.maxPrice}</h4>
            <input 
              type="range" 
              min="0" 
              max="1000" 
              step="10"
              value={filters.maxPrice}
              onChange={(e) => setFilters(f => ({...f, maxPrice: Number(e.target.value)}))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({...f, search: e.target.value}))}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-pink-500 transition-all text-white placeholder-slate-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 cursor-pointer"
            >
              <option value="popularity">Popularity</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl">
            <h3 className="text-2xl font-bold mb-2">No products found</h3>
            <p className="text-slate-400">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredProducts.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onAdd={addToCart} 
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );

  // Checkout View
  const CheckoutView = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-display font-bold mb-8">Checkout</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Shipping Form */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Truck className="text-pink-500" /> Shipping Information
            </h3>
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First Name" defaultValue={user?.name?.split(' ')[0]} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-pink-500 focus:outline-none" />
                <input required placeholder="Last Name" defaultValue={user?.name?.split(' ')[1]} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-pink-500 focus:outline-none" />
              </div>
              <input required type="email" placeholder="Email Address" defaultValue={user?.email} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-pink-500 focus:outline-none" />
              <input required placeholder="Address" defaultValue={user?.address} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-pink-500 focus:outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="City" defaultValue={user?.city} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-pink-500 focus:outline-none" />
                <input required placeholder="Country" defaultValue={user?.country} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-pink-500 focus:outline-none" />
              </div>
              <input required type="tel" placeholder="Phone" defaultValue={user?.phone} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:border-pink-500 focus:outline-none" />
            </form>
          </div>

          {/* Payment Method */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="text-pink-500" /> Payment Method
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <label className="cursor-pointer">
                <input type="radio" name="payment" defaultChecked className="peer sr-only" />
                <div className="p-4 border border-white/10 rounded-xl peer-checked:bg-pink-500/20 peer-checked:border-pink-500 transition-all text-center">
                  <div className="font-bold">Card</div>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="payment" className="peer sr-only" />
                <div className="p-4 border border-white/10 rounded-xl peer-checked:bg-pink-500/20 peer-checked:border-pink-500 transition-all text-center">
                  <div className="font-bold">PayPal</div>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="payment" className="peer sr-only" />
                <div className="p-4 border border-white/10 rounded-xl peer-checked:bg-pink-500/20 peer-checked:border-pink-500 transition-all text-center">
                  <div className="font-bold">Yape / Plin</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="glass-panel p-6 rounded-2xl sticky top-24">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{item.quantity}x</span>
                    <span className="truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span>${((item.price * (1 - item.discount/100)) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (10%)</span>
                <span>${(cartTotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-2">
                <span>Total</span>
                <span>${(cartTotal * 1.1).toFixed(2)}</span>
              </div>
            </div>
            <button 
              type="submit" 
              form="checkout-form"
              className="w-full mt-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-200 font-sans pb-20">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 glass-panel border-b border-white/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div 
            className="text-2xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 cursor-pointer"
            onClick={() => setView('home')}
          >
            LUMINA.
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => user ? handleLogout() : setIsAuthModalOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors relative group"
            >
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                </div>
              ) : (
                <UserIcon size={24} />
              )}
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
            >
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        {view === 'home' && <HomeView />}
        {view === 'checkout' && <CheckoutView />}
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0f172a] h-full shadow-2xl flex flex-col border-l border-white/10 animate-slide-in">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
              <h2 className="text-xl font-bold font-display">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-slate-800" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{item.name}</h4>
                      <p className="text-slate-400 text-sm mb-2">${(item.price * (1 - item.discount/100)).toFixed(2)}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                          <Minus size={14} />
                        </button>
                        <span className="font-mono text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-400 hover:text-red-300">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20">
              <div className="flex justify-between items-center mb-6 text-xl font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => {
                  if (cart.length === 0) return;
                  if (!user) {
                    setIsCartOpen(false);
                    setIsAuthModalOpen(true);
                    showToast('Please login to checkout', 'error');
                  } else {
                    setIsCartOpen(false);
                    setView('checkout');
                  }
                }}
                disabled={cart.length === 0}
                className="w-full bg-white text-black font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsAuthModalOpen(false)} />
          <div className="relative w-full max-w-sm glass-panel p-8 rounded-3xl animate-fade-in shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-6">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase font-bold">Email</label>
                <input name="email" type="email" required className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-pink-500 focus:outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase font-bold">Password</label>
                <input name="password" type="password" required className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:border-pink-500 focus:outline-none transition-colors" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 rounded-lg font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all mt-4">
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-400">
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-white font-bold hover:underline">
                {authMode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}