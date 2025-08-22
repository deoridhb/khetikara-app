import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="KhetiKara" className="h-8 w-8" />
              <span className="text-lg font-bold text-gray-900">KhetiKara</span>
            </Link>
            <p className="text-gray-600">
              Fresh vegetables and fruits direct from farms to your doorstep.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-gray-900 transition">
                  Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                support@khetikara.com
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                Mumbai, Maharashtra
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Business Hours</h3>
            <p className="text-gray-600 mb-2">
              Monday - Saturday
              <br />
              9:00 AM - 6:00 PM
            </p>
            <p className="text-gray-600">
              Sunday
              <br />
              Closed
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} KhetiKara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
