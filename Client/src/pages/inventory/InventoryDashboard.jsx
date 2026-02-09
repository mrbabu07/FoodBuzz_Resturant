import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { showError } from '../../utils/toast';

export default function InventoryDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/inventory/stats');
      setStats(data);
    } catch (err) {
      showError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white py-12 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-2">📦 Inventory Management</h1>
          <p className="text-white/90 text-lg">
            Track ingredients, manage stock, control costs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Ingredients */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100 p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <i className="fas fa-box text-white text-2xl"></i>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-gray-900">
                  {stats?.totalIngredients || 0}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
            </div>
            <div className="text-blue-600 font-bold">All Ingredients</div>
          </div>

          {/* Low Stock */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-100 p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-gray-900">
                  {stats?.lowStockCount || 0}
                </div>
                <div className="text-sm text-gray-600">Items</div>
              </div>
            </div>
            <div className="text-yellow-600 font-bold">Low Stock Alert</div>
          </div>

          {/* Out of Stock */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-red-100 p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <i className="fas fa-times-circle text-white text-2xl"></i>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-gray-900">
                  {stats?.outOfStockCount || 0}
                </div>
                <div className="text-sm text-gray-600">Items</div>
              </div>
            </div>
            <div className="text-red-600 font-bold">Out of Stock</div>
          </div>

          {/* Inventory Value */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-green-100 p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <i className="fas fa-dollar-sign text-white text-2xl"></i>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-gray-900">
                  ৳{Math.round(stats?.inventoryValue || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
            <div className="text-green-600 font-bold">Inventory Value</div>
          </div>

          {/* Total Purchases */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-100 p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <i className="fas fa-shopping-cart text-white text-2xl"></i>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-gray-900">
                  {stats?.totalPurchases || 0}
                </div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
            </div>
            <div className="text-purple-600 font-bold">Total Purchases</div>
          </div>

          {/* Pending Purchases */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-100 p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <i className="fas fa-clock text-white text-2xl"></i>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-gray-900">
                  {stats?.pendingPurchases || 0}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
            <div className="text-orange-600 font-bold">Pending Approval</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-100 p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/inventory/ingredients"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              <i className="fas fa-box text-3xl"></i>
              <div>
                <div className="font-bold">Ingredients</div>
                <div className="text-sm text-white/80">Manage stock</div>
              </div>
            </Link>

            <Link
              to="/inventory/suppliers"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              <i className="fas fa-truck text-3xl"></i>
              <div>
                <div className="font-bold">Suppliers</div>
                <div className="text-sm text-white/80">Manage vendors</div>
              </div>
            </Link>

            <Link
              to="/inventory/purchases"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              <i className="fas fa-shopping-cart text-3xl"></i>
              <div>
                <div className="font-bold">Purchases</div>
                <div className="text-sm text-white/80">Purchase orders</div>
              </div>
            </Link>

            <Link
              to="/inventory/adjustments"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              <i className="fas fa-edit text-3xl"></i>
              <div>
                <div className="font-bold">Adjustments</div>
                <div className="text-sm text-white/80">Stock changes</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {stats?.lowStockCount > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-white text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-yellow-900">
                  Low Stock Alert!
                </h3>
                <p className="text-yellow-700">
                  {stats.lowStockCount} items are running low. Please reorder
                  soon.
                </p>
              </div>
              <Link
                to="/inventory/ingredients?status=low-stock"
                className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all"
              >
                View Items
              </Link>
            </div>
          </div>
        )}

        {stats?.outOfStockCount > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <i className="fas fa-times-circle text-white text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-red-900">
                  Out of Stock!
                </h3>
                <p className="text-red-700">
                  {stats.outOfStockCount} items are out of stock. Immediate
                  action required!
                </p>
              </div>
              <Link
                to="/inventory/ingredients?status=out-of-stock"
                className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all"
              >
                View Items
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
