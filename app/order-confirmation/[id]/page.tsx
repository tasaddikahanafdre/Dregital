import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Printer, ArrowRight, Truck, Phone, PackageCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/utils';
import PrintButton from './PrintButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;
  const order = await db.getOrderByIdOrNumber(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      
      {/* Success Banner */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
          Order Successfully Placed
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight mt-3">
          Thank You, {order.customer_name}!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-2">
          Your order has been recorded. Our customer representative will call you at{' '}
          <strong className="text-black">{order.customer_phone}</strong> to confirm your dispatch.
        </p>
      </div>

      {/* Invoice Card */}
      <div id="invoice-printable" className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden mb-8">
        
        {/* Invoice Header */}
        <div className="bg-neutral-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xl font-black uppercase tracking-tighter">DREGITAL.</span>
            <p className="text-xs text-neutral-400 mt-1">Order #{order.order_number}</p>
          </div>
          <div className="text-left sm:text-right text-xs">
            <span className="inline-block bg-white/20 text-white px-2.5 py-1 rounded font-semibold uppercase text-[10px]">
              {order.order_status}
            </span>
            <p className="text-neutral-400 mt-1.5">{formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="p-6 sm:p-8 border-b border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-2">Delivery Details</h3>
            <p className="font-bold text-neutral-900 text-sm">{order.customer_name}</p>
            <p className="text-neutral-600 mt-0.5">{order.customer_phone}</p>
            <p className="text-neutral-600 mt-1">{order.delivery_address}</p>
            <p className="text-neutral-900 font-semibold mt-0.5">{order.area}, {order.district}</p>
          </div>

          <div>
            <h3 className="font-bold text-neutral-400 uppercase tracking-wider mb-2">Payment Details</h3>
            <p className="font-bold text-neutral-900">{order.payment_method}</p>
            <p className="text-neutral-500 mt-0.5">Status: <strong className="text-neutral-800">{order.payment_status}</strong></p>
            {order.tracking_number && (
              <p className="text-neutral-700 mt-2">
                Tracking No: <span className="font-mono font-bold">{order.tracking_number}</span>
              </p>
            )}
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="p-6 sm:p-8">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Ordered Products</h3>
          <div className="divide-y divide-neutral-100 text-xs">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name} className="w-10 h-10 object-cover rounded border border-neutral-200" />
                  )}
                  <div>
                    <p className="font-semibold text-neutral-900">{item.product_name}</p>
                    <p className="text-neutral-500 text-[11px]">Qty: {item.quantity} × {formatPrice(item.product_price)}</p>
                  </div>
                </div>
                <span className="font-bold text-neutral-900">
                  {formatPrice(item.subtotal || item.product_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-neutral-200 mt-6 pt-4 space-y-2 text-xs text-neutral-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-semibold text-neutral-900">{formatPrice(order.delivery_charge)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-black pt-2 border-t border-neutral-100">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <PrintButton />
        <Link
          href={`/track-order?orderNumber=${order.order_number}&phone=${order.customer_phone}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-neutral-300 text-neutral-700 px-6 py-3 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors"
        >
          <span>Return to Store</span>
        </Link>
      </div>

    </div>
  );
}
