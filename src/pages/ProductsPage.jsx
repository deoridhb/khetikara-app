import React, { useState, useMemo } from 'react';
import { useProducts } from '../lib/hooks/useProducts';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from '../components/ui';
import { Search } from 'lucide-react';

const ProductsPage = () => {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('A1');

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.variety.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.variety}</p>
              
              {/* Grade Selection */}
              <div className="mb-3">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="A1">A1 - Premium Grade</option>
                  <option value="A2">A2 - Standard Grade</option>
                  <option value="A3">A3 - Economy Grade</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{product.base_price}
                  </span>
                  <span className="text-sm text-gray-500">/{product.unit}</span>
                </div>
                <button
                  onClick={() => addToCart({
                    id: product.id,
                    name: product.name,
                    variety: product.variety,
                    price: product.base_price,
                    unit: product.unit,
                    quantity: 1,
                    grade: selectedGrade
                  })}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl text-gray-600">No products found</h3>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
