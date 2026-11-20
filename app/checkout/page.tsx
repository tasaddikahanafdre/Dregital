'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { BANGLADESH_DISTRICTS } from '@/lib/bangladeshDistricts';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('Dhanmondi');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod] = useState<'Cash on Delivery'>('Cash on Delivery');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Selected district options
  const selectedDistrictData = BANGLADESH_DISTRICTS.find(d => d.name === district) || BANGLADESH_DISTRICTS[0];

  // When district changes, update area to first area
  useEffect(() => {
    if (selectedDistrictData.areas.length > 0) {
      setArea(selectedDistrictData.areas[0]);
    }
  }, [district]);

  // Calculate delivery charge
  const isDhaka = selectedDistrictData.isDhaka;
  const isFreeDhakaShipping = isDhaka && cartSubtotal >= 3000;
  const deliveryCharge = isFreeDhakaShipping ? 0 : (isDhaka ? 60 : 120);
  const finalTotal = cartSubtotal + deliveryCharge;

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-xs text-neutral-500 mb-6">Add items to your cart before proceeding to checkout.</p>
        <Link href="/shop" className="inline-block bg-black text-white text-xs font-semibold px-5 py-2.5 rounded">
          Go to Shop
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage('Please enter a valid 11-digit mobile number (e.g. 01712345678)');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please provide your detailed delivery address');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customer_name: fullName.trim(),
        customer_phone: cleanPhone,
        customer_email: email.trim() || null,
        delivery_address: address.trim(),
        district,
        area,
        notes: notes.trim() || null,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Pending',
        delivery_charge: deliveryCharge,
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          quantity: item.quantity,
          product_sku: item.product.sku,
          variant_details: item.variant ? `${item.variant.variant_name}: ${item.variant.variant_value}` : null,
          image_url: item.product.image_url
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      router.push(`/order-confirmation/${data.id || data.order_number}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-neutral-200 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
          Express Checkout
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Fast and reliable delivery across all 64 districts in Bangladesh
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Cols: Customer & Shipping Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Customer Information Block */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider pb-3 border-b border-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Hossain"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">Order verification code will be sent via SMS</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-800 block mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Delivery Address Block (Bangladesh Specific) */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider pb-3 border-b border-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Delivery Address (Bangladesh)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1.5">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} {d.isDhaka ? '(Inside Dhaka - ৳60)' : '(Outside Dhaka - ৳120)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1.5">
                  Thana / Area <span className="text-red-500">*</span>
                </label>
                {selectedDistrictData.areas.length > 0 ? (
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    {selectedDistrictData.areas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter Thana / Sub-district"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-800 block mb-1.5">
                Full Street Address, House & Flat No. <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="House #, Road #, Sector/Block, Landmark details..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-800 block mb-1.5">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Call before delivery, deliver after 3 PM"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Payment Method Block (COD Only) */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider pb-3 border-b border-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Payment Method</span>
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery Only */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-black bg-neutral-50 ring-1 ring-black">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={true}
                  readOnly
                  className="mt-0.5 text-black focus:ring-0 accent-black cursor-default"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-neutral-800" />
                    <span className="text-xs font-bold text-neutral-900">Cash on Delivery (COD)</span>
                    <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      ONLY PAYMENT METHOD
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    Pay securely with cash upon delivery when the courier hands your parcel to you at your doorstep. No advance payment required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Order Breakdown & Confirm Button */}
        <div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-4 sticky top-24">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider pb-3 border-b border-neutral-200">
              Items in Your Order ({cart.length})
            </h2>

            {/* Items preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-neutral-200 text-xs">
              {cart.map((item) => (
                <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                  <img
                    src={item.product.image_url || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=80'}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded border border-neutral-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-neutral-500">Qty: {item.quantity} × {formatPrice(item.product.price)}</p>
                  </div>
                  <span className="font-bold text-neutral-900 shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-neutral-200 pt-3 space-y-2 text-xs text-neutral-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-black">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge ({district})</span>
                <span className="font-semibold text-black">
                  {isFreeDhakaShipping ? <span className="text-emerald-700 font-bold">FREE</span> : formatPrice(deliveryCharge)}
                </span>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-black">Total Amount</span>
              <span className="text-2xl font-black text-black">{formatPrice(finalTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Order ({formatPrice(finalTotal)})</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-neutral-500">
                By placing this order, you agree to Dregital&apos;s Terms and Return Policy.
              </p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
