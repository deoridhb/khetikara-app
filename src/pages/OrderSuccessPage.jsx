import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Successful!</h1>
        <p className="text-gray-600 mb-2">
          Thank you for your order. We'll be in touch soon!
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Order Number: {orderId}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
