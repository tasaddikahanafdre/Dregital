'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Package, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import { Order, Product } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/products?limit=100').then(r => r.json())
    ])
      .then(([ordersData, productsData]) => {
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (productsData && Array.isArray(productsData.products)) {
          setProducts(productsData.products);
        }
      })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Compute live analytics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.order_status !== 'Cancelled' ? (o.total || o.total_amount || 0) : 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.order_status === 'Pending').length;
  const deliveredOrders = orders.filter(o => o.order_status === 'Delivered').length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Executive Overview
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Live database metrics for Dregital Bangladesh retail operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Sales</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{formatPrice(totalRevenue)}</p>
            <span className="text-[11px] text-neutral-500">Across {totalOrders} total recorded orders</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pending Orders</span>
              <div className="w-8 h-8 rounded-lg bg-amber-950/60 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{pendingOrders}</p>
            <span className="text-[11px] text-amber-400 font-semibold">Requires verification / dispatch</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Catalog Size</span>
              <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{products.length}</p>
            <span className="text-[11px] text-neutral-500">Active products in database</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Low Stock Alert</span>
              <div className="w-8 h-8 rounded-lg bg-red-950/60 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{lowStockProducts.length}</p>
            <span className="text-[11px] text-red-400 font-semibold">≤ 5 units remaining</span>
          </div>

        </div>

        {/* Recent Orders & Low Stock Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders Table (2 cols) */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-400" />
                <span>Recent Customer Orders</span>
              </h2>
              <Link href="/admin/orders" className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">No orders have been recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-neutral-500 border-b border-neutral-800">
                    <tr>
                      <th className="pb-3 font-semibold">Order</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {orders.slice(0, 6).map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-800/40">
                        <td className="py-3 font-mono font-bold text-white">{order.order_number}</td>
                        <td className="py-3">
                          <p className="font-semibold text-neutral-200">{order.customer_name}</p>
                          <p className="text-[10px] text-neutral-500">{order.customer_phone}</p>
                        </td>
                        <td className="py-3 font-bold text-white">{formatPrice(order.total)}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.order_status === 'Delivered' ? 'bg-emerald-950 text-emerald-400' :
                            order.order_status === 'Shipped' ? 'bg-blue-950 text-blue-400' :
                            order.order_status === 'Cancelled' ? 'bg-red-950 text-red-400' :
                            'bg-amber-950 text-amber-400'
                          }`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td className="py-3 text-neutral-400 text-[11px]">{formatDate(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock Warning List (1 col) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Low Stock Warning</span>
              </h2>
              <Link href="/admin/inventory" className="text-xs font-semibold text-neutral-400 hover:text-white">
                Manage
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">All inventory levels are healthy.</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((prod) => (
                  <div key={prod.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{prod.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">SKU: {prod.sku || 'N/A'}</p>
                    </div>
                    <span className="font-bold text-red-400 shrink-0 bg-red-950/60 px-2 py-1 rounded">
                      {prod.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
