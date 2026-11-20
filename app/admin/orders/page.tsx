'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  ShoppingBag, 
  Search, 
  Download, 
  Printer, 
  Eye, 
  X, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Selected Order for Modal View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status);
    setTrackingNumberInput(order.tracking_number || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdateLoading(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          tracking_number: trackingNumberInput.trim() || null
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        setSelectedOrder(updated);
        alert('Order status successfully updated');
      }
    } catch {
      alert('Failed to update order status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const exportCSV = () => {
    if (orders.length === 0) return;

    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'District', 'Address', 'Payment Method', 'Payment Status', 'Order Status', 'Total (BDT)'];
    const rows = orders.map(o => [
      o.order_number,
      o.created_at || '',
      `"${o.customer_name}"`,
      `"${o.customer_phone}"`,
      `"${o.district}"`,
      `"${o.delivery_address.replace(/"/g, '""')}"`,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.total
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dregital-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchesStatus = statusFilter === 'All' || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Order Fulfillment & Management
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Process customer orders, update tracking numbers, and print courier receipts
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors border border-neutral-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by Order ID, phone or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 text-xs px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <span className="text-xs text-neutral-500 ml-auto">
            Showing <strong className="text-white">{filteredOrders.length}</strong> orders
          </span>
        </div>

        {/* Orders Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order Number</th>
                  <th className="py-3 px-4 font-semibold">Customer & Phone</th>
                  <th className="py-3 px-4 font-semibold">District / Thana</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {o.order_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-neutral-200">{o.customer_name}</p>
                      <p className="text-[10px] text-neutral-400">{o.customer_phone}</p>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-300">
                      <span>{o.district}</span>
                      <span className="block text-[10px] text-neutral-500">{o.area}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-neutral-300 font-medium">{o.payment_method}</span>
                      <span className="block text-[10px] text-neutral-500">{o.payment_status}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatPrice(o.total)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        o.order_status === 'Delivered' ? 'bg-emerald-950 text-emerald-400' :
                        o.order_status === 'Shipped' ? 'bg-blue-950 text-blue-400' :
                        o.order_status === 'Cancelled' ? 'bg-red-950 text-red-400' :
                        'bg-amber-950 text-amber-400'
                      }`}>
                        {o.order_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderModal(o)}
                        className="inline-flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details & Status Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-white shadow-2xl space-y-6">
              
              {/* Modal Top */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-base font-bold uppercase tracking-tight">
                    Order Details: {selectedOrder.order_number}
                  </h2>
                  <p className="text-[11px] text-neutral-400">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update Control */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Update Fulfillment Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1">Order Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Courier Tracking ID (e.g. REDX, Steadfast)</label>
                    <input
                      type="text"
                      placeholder="e.g. STEAD-DH-84912"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updateLoading}
                    className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-neutral-200 uppercase tracking-wider disabled:opacity-50"
                  >
                    {updateLoading ? 'Saving...' : 'Apply Status Update'}
                  </button>
                </div>
              </div>

              {/* Customer & Address Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div>
                  <h4 className="font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Recipient Info</h4>
                  <p className="font-semibold text-white">{selectedOrder.customer_name}</p>
                  <p className="text-neutral-400">{selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && <p className="text-neutral-400">{selectedOrder.customer_email}</p>}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Delivery Address</h4>
                  <p className="text-neutral-300">{selectedOrder.delivery_address}</p>
                  <p className="text-white font-semibold mt-0.5">{selectedOrder.area}, {selectedOrder.district}</p>
                  {selectedOrder.notes && (
                    <p className="text-neutral-400 italic mt-1.5">Note: &quot;{selectedOrder.notes}&quot;</p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Purchased Items</h4>
                <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-xl overflow-hidden text-xs">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3 bg-neutral-950 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{item.product_name}</p>
                        <p className="text-[11px] text-neutral-400">
                          Qty: {item.quantity} × {formatPrice(item.product_price)}
                        </p>
                      </div>
                      <span className="font-bold text-white">
                        {formatPrice(item.subtotal || item.product_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-2 text-xs space-y-1.5 text-neutral-400 border-t border-neutral-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="text-white">{formatPrice(selectedOrder.delivery_charge)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-neutral-800">
                  <span>Grand Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
