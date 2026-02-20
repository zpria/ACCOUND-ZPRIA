
import React from 'react';

const CartPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f7] py-12 px-6">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-[32px] font-bold text-[#1d1d1f] mb-6">Shopping Cart</h1>
        <p className="text-[#86868b]">Your cart is empty.</p>
      </div>
    </div>
  );
};

export default CartPage;
