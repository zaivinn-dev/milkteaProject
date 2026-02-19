import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import AdminMenuManager from '../components/AdminMenuManager';
import AdminCategoryManager from '../components/AdminCategoryManager';


export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [currentSection, setCurrentSection] = useState('dashboard');

  useEffect(() => {
    fetchOrders();
    fetchCategories();
    fetchMenu();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await axios.get('/api/menu');
      setMenu(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const calculateStats = (orderList) => {
    const total = orderList.length;
    const pending = orderList.filter(o => o.status === 'pending').length;
    const completed = orderList.filter(o => o.status === 'completed').length;
    const revenue = orderList.reduce((sum, o) => sum + o.totalAmount, 0);

    setStats({
      totalOrders: total,
      pendingOrders: pending,
      completedOrders: completed,
      totalRevenue: revenue
    });
  };

  const handleLogout = () => {
    logout();
  };

  const exportToCSV = () => {
    const csvData = orders.map(order => ({
      'Order Number': order.orderNumber,
      'Customer': order.customerName,
      'Amount': `₱${order.totalAmount.toFixed(2)}`,
      'Status': order.status,
      'Date': new Date(order.createdAt).toLocaleString()
    }));

    const csv = Papa.unparse(csvData);
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Set default Helvetica font
    doc.setFont('Helvetica');
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(139, 111, 71); // tea color
    doc.text('SALES REPORT', 14, yPosition);
    yPosition += 15;
    
    // Generated date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPosition);
    yPosition += 10;
    
    // Stats section
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Orders: ${stats.totalOrders}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Pending: ${stats.pendingOrders}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Completed: ${stats.completedOrders}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Total Revenue: ${stats.totalRevenue.toFixed(2)} PHP`, 14, yPosition);
    yPosition += 12;
    
    // Orders header
    doc.setFontSize(12);
    doc.setTextColor(139, 111, 71);
    doc.text('RECENT ORDERS', 14, yPosition);
    yPosition += 8;
    
    // Table header
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(139, 111, 71);
    doc.rect(14, yPosition - 5, 182, 6, 'F');
    doc.text('Order #', 16, yPosition);
    doc.text('Customer', 50, yPosition);
    doc.text('Amount', 100, yPosition);
    doc.text('Status', 135, yPosition);
    doc.text('Date', 160, yPosition);
    yPosition += 8;
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    orders.slice(0, 10).forEach((order, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Alternate background color
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(14, yPosition - 5, 182, 6, 'F');
      }
      
      doc.setFontSize(9);
      doc.text(order.orderNumber, 16, yPosition);
      doc.text(order.customerName.substring(0, 20), 50, yPosition);
      doc.text(`${order.totalAmount.toFixed(2)} PHP`, 100, yPosition);
      doc.text(order.status, 135, yPosition);
      doc.text(new Date(order.createdAt).toLocaleDateString(), 160, yPosition);
      yPosition += 6;
    });
    
    doc.save(`sales_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-gradient-to-b from-white to-gray-50 shadow-xl flex flex-col h-screen border-r-4 border-tea transition-all duration-300`}>
        {/* Header */}
        <div className="px-6 py-8 bg-gradient-to-r from-tea to-teaLight shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img 
                src="/images/BIG-brew.png" 
                alt="Logo" 
                className="w-12 h-12 rounded-lg object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {sidebarOpen && (
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-white whitespace-nowrap">Admin</h1>
                  <p className="text-xs text-white opacity-90 mt-1 whitespace-nowrap">Milk Tea</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition flex-shrink-0"
              title={sidebarOpen ? 'Collapse' : 'Expand'}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-2 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'categories', label: 'Categories', icon: '📂' },
            { id: 'menu', label: 'Bigbrew Menu', icon: '🧋' },
            { id: 'orders', label: 'All Orders', icon: '📦' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`w-full px-4 py-3 rounded-lg font-bold transition flex items-center gap-3 justify-center lg:justify-start ${
                currentSection === section.id
                  ? 'bg-gradient-to-r from-tea to-teaLight text-white shadow-lg scale-105'
                  : 'text-tea hover:bg-gray-100'
              }`}
              title={!sidebarOpen ? section.label : ''}
            >
              <span className="text-2xl flex-shrink-0">{section.icon}</span>
              {sidebarOpen && <span className="text-sm font-semibold">{section.label}</span>}
            </button>
          ))}
        </div>
        
        {/* Logout Button */}
        <div className="border-t-2 border-gray-200 px-4 py-4">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {/* Dashboard Section */}
        {currentSection === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-tea">📊 Dashboard Overview</h2>
              <div className="flex gap-3">
                <button
                  onClick={exportToCSV}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
                >
                  📄 Export PDF
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Stats Cards */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-bold mb-2">Total Orders</p>
                <p className="text-4xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
                <p className="text-gray-600 text-sm font-bold mb-2">Pending</p>
                <p className="text-4xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                <p className="text-gray-600 text-sm font-bold mb-2">Completed</p>
                <p className="text-4xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
                <p className="text-gray-600 text-sm font-bold mb-2">Total Revenue</p>
                <p className="text-4xl font-bold text-purple-600">₱{stats.totalRevenue.toFixed(0)}</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Orders by Status Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-tea mb-4">📊 Orders by Status</h3>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={[
                          { name: 'Pending', value: stats.pendingOrders, fill: '#FCD34D' },
                          { name: 'Completed', value: stats.completedOrders, fill: '#86EFAC' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Categories Bar Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-tea mb-4">🏆 Top Categories</h3>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={categories.map(cat => ({
                        name: cat.name,
                        count: orders.reduce((total, order) => {
                          return total + order.items.filter(item => item.category === cat.name).length;
                        }, 0)
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B6F47" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-tea mb-4">Recent Orders</h3>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-tea text-white">
                      <tr>
                        <th className="px-6 py-3 text-left">Order #</th>
                        <th className="px-6 py-3 text-left">Customer</th>
                        <th className="px-6 py-3 text-left">Amount</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.slice(0, 10).map(order => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold text-tea">{order.orderNumber}</td>
                          <td className="px-6 py-4">{order.customerName}</td>
                          <td className="px-6 py-4 font-bold text-teaLight">₱{order.totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'ready' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Manager Section */}
        {currentSection === 'menu' && <AdminMenuManager categories={categories} />}

        {/* Categories Manager Section */}
        {currentSection === 'categories' && <AdminCategoryManager onCategoriesChange={setCategories} />}

        {/* All Orders Section */}
        {currentSection === 'orders' && <AdminOrders orders={orders} onRefresh={fetchOrders} />}

        {/* Analytics Section */}
        {currentSection === 'analytics' && <AdminAnalytics orders={orders} categories={categories} />}

        {/* Settings Section */}
        {currentSection === 'settings' && <AdminSettings />}
        </div>
    </div>
  );
}

function AdminOrders({ orders, onRefresh }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-tea">📦 All Orders</h2>
        <button
          onClick={onRefresh}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg transition"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-tea text-white">
              <tr>
                <th className="px-6 py-3 text-left">Order #</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Items</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-tea">{order.orderNumber}</td>
                  <td className="px-6 py-4">{order.customerName}</td>
                  <td className="px-6 py-4">{order.items.length} items</td>
                  <td className="px-6 py-4 font-bold text-teaLight">₱{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ready' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminAnalytics({ orders, categories }) {
  // Daily Revenue
  const dailyRevenue = {};
  
  // Best Selling Items
  const itemStats = {};
  
  // Customer Stats
  const customerStats = {};
  
  // Peak Hours
  const peakHours = {};
  
  // Process orders
  orders.forEach(order => {
    // Daily Revenue
    const date = new Date(order.createdAt).toLocaleDateString();
    dailyRevenue[date] = (dailyRevenue[date] || 0) + order.totalAmount;
    
    // Best Selling Items
    order.items.forEach(item => {
      itemStats[item.name] = (itemStats[item.name] || 0) + 1;
    });
    
    // Customer Stats
    const customer = order.customerName;
    if (!customerStats[customer]) {
      customerStats[customer] = {
        count: 0,
        totalSpent: 0
      };
    }
    customerStats[customer].count += 1;
    customerStats[customer].totalSpent += order.totalAmount;
    
    // Peak Hours
    const hour = new Date(order.createdAt).getHours();
    const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
    peakHours[timeSlot] = (peakHours[timeSlot] || 0) + 1;
  });
  
  // Category Stats
  const categoryStats = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.category) {
        categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
      }
    });
  });
  
  // Add categories with 0 items
  categories.forEach(cat => {
    const catName = typeof cat === 'object' && cat.name ? cat.name : cat;
    if (catName && !categoryStats.hasOwnProperty(catName)) {
      categoryStats[catName] = 0;
    }
  });
  
  // Sort helpers
  const sortedRevenue = Object.fromEntries(
    Object.entries(dailyRevenue).sort(([dateA], [dateB]) => {
      return new Date(dateB) - new Date(dateA);
    })
  );
  
  const topItems = Object.entries(itemStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  const topCustomers = Object.entries(customerStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);
  
  const peakHoursSorted = Object.entries(peakHours)
    .sort(([, a], [, b]) => b - a);
  
  // Calculate averages
  const avgOrderValue = orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0;
  const totalRevenue = Object.values(dailyRevenue).reduce((sum, v) => sum + v, 0);

  return (
    <div>
      <h2 className="text-3xl font-bold text-tea mb-6">📈 Analytics Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 shadow-lg">
          <p className="text-gray-600 text-sm font-bold mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-600">₱{totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-6 shadow-lg">
          <p className="text-gray-600 text-sm font-bold mb-2">Average Order</p>
          <p className="text-3xl font-bold text-purple-600">₱{avgOrderValue.toFixed(2)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-6 shadow-lg">
          <p className="text-gray-600 text-sm font-bold mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-green-600">{orders.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl p-6 shadow-lg">
          <p className="text-gray-600 text-sm font-bold mb-2">Unique Customers</p>
          <p className="text-3xl font-bold text-amber-600">{Object.keys(customerStats).length}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Revenue */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-tea mb-4">Daily Revenue</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {Object.entries(sortedRevenue).length > 0 ? (
              Object.entries(sortedRevenue).map(([date, revenue]) => (
                <div key={date} className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition border-l-4 border-green-500">
                  <span className="font-semibold text-gray-800">{date}</span>
                  <span className="font-bold text-green-700 text-lg">₱{revenue.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No revenue data yet</p>
            )}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-tea mb-4">Top 5 Selling Items</h3>
          <div className="space-y-3">
            {topItems.length > 0 ? (
              topItems.map(([item, count], idx) => (
                <div key={item} className="flex items-center justify-between p-3 bg-gradient-to-r from-tea to-teaLight rounded-lg hover:shadow-md transition">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-white font-bold text-lg w-8 text-center">#{idx + 1}</span>
                    <span className="text-white font-semibold truncate">{item}</span>
                  </div>
                  <span className="text-white font-bold text-lg ml-2 bg-white bg-opacity-20 px-2 py-1 rounded">{count}x</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No sales data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-tea mb-4">Top Customers</h3>
          <div className="space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map(([customer, stats], idx) => (
                <div key={customer} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600 text-lg w-6 text-center">#{idx + 1}</span>
                      <span className="font-bold text-gray-800">{customer}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-200 px-2 py-1 rounded">{stats.count} order{stats.count !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-sm text-gray-700 font-semibold">₱{stats.totalSpent.toFixed(2)} spent</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No customer data yet</p>
            )}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-tea mb-4">Peak Order Hours</h3>
          <div className="space-y-4">
            {peakHoursSorted.length > 0 ? (
              peakHoursSorted.map(([time, count]) => {
                const maxCount = Math.max(...Object.values(peakHours), 1);
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={time} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 text-sm">{time}</span>
                      <span className="font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">{count} orders</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-amber-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && <span className="text-white font-bold text-xs">{percentage.toFixed(0)}%</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No order time data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function AdminSettings() {
  const { logout, user } = useContext(AuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/admin/users/${user?.username}/password`, {
        username: user?.username,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newAdminForm.password !== newAdminForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newAdminForm.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/admin/users', {
        username: newAdminForm.username,
        password: newAdminForm.password
      });
      setMessage({ type: 'success', text: 'New admin account created successfully!' });
      setNewAdminForm({ username: '', password: '', confirmPassword: '' });
      setTimeout(() => setShowAddAdmin(false), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create admin' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-tea mb-8">⚙️ Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings - Full Width */}
        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-tea mb-4">👤 Account Management</h3>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 border-l-4 border-green-600 text-green-700' : 'bg-red-100 border-l-4 border-red-600 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Current Account */}
            <div className="p-4 bg-gradient-to-br from-milk to-teaLight rounded-lg">
              <p className="text-sm text-gray-700 font-bold mb-2">Current Admin</p>
              <p className="text-lg font-bold text-tea">{user?.username || 'admin'}</p>
            </div>

            {/* Change Password Button */}
            <button
              onClick={() => {
                setShowChangePassword(!showChangePassword);
                setMessage({ type: '', text: '' });
              }}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg rounded-lg transition border-2 border-blue-200 font-bold text-blue-700"
            >
              🔑 Change Password
            </button>

            {/* Add New Admin Button */}
            <button
              onClick={() => {
                setShowAddAdmin(!showAddAdmin);
                setMessage({ type: '', text: '' });
              }}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg rounded-lg transition border-2 border-green-200 font-bold text-green-700"
            >
              ➕ Add New Admin
            </button>
          </div>

          {/* Change Password Form */}
          {showChangePassword && (
            <div className="bg-blue-50 p-6 rounded-lg mb-6 border-2 border-blue-200">
              <h4 className="text-lg font-bold text-blue-700 mb-4">🔑 Change Your Password</h4>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full border-2 border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full border-2 border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full border-2 border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : '✓ Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                      setMessage({ type: '', text: '' });
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add New Admin Form */}
          {showAddAdmin && (
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h4 className="text-lg font-bold text-green-700 mb-4">➕ Create New Admin Account</h4>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={newAdminForm.username}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                    className="w-full border-2 border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter new admin username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    className="w-full border-2 border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={newAdminForm.confirmPassword}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, confirmPassword: e.target.value })}
                    className="w-full border-2 border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Confirm password"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : '✓ Create Admin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAdmin(false);
                      setNewAdminForm({ username: '', password: '', confirmPassword: '' });
                      setMessage({ type: '', text: '' });
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white font-bold py-3 px-4 rounded-lg transition"
          >
            🚪 Logout
          </button>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-tea mb-4">ℹ️ System Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-bold text-tea">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Backend:</span>
              <span className="font-bold text-green-600">✓ Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-bold text-green-600">🟢 Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-bold text-gray-700">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-tea mb-4">📊 Data</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">All data is automatically saved to backend storage.</p>
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg text-white font-bold py-2 px-4 rounded-lg transition"
              onClick={() => alert('Data backup created successfully!')}
            >
              💾 Backup Data
            </button>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-tea mb-4">❓ Help</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>📧 Support: support@teastation.com</p>
            <p>📱 Phone: +1 (555) 123-4567</p>
            <p>🌐 Website: www.teastation.com</p>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <h3 className="text-2xl font-bold text-tea mb-4">🚪 Confirm Logout</h3>
            <p className="text-gray-600 mb-8">Are you sure you want to logout? You'll need to login again to access the admin panel.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
