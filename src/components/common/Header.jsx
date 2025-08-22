import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="KhetiKara" className="h-8 w-8" />
            <span className="text-lg font-bold text-gray-900">KhetiKara</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Products
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 text-xs grid place-items-center bg-green-600 text-white rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
