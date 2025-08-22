import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../lib/hooks/useProducts';
import { Card, CardContent, CardTitle, LoadingSpinner } from '../components/ui';
import { useCart } from '../context/CartContext';

const HomePage = () => {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();

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

  const featuredProducts = products.filter(product => product.featured);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-green-50 rounded-3xl p-8 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fresh Vegetables & Fruits Direct from Farms
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Quality produce at wholesale prices, delivered to your doorstep
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                <p className="text-gray-600 mb-4">{product.variety}</p>
                <div className="flex justify-between items-center">
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
                      grade: 'A1'
                    })}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-block px-6 py-3 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition"
          >
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
