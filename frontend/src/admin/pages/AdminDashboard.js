import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import AdminMenuManager from '../components/AdminMenuManager';
import AdminCategoryManager from '../components/AdminCategoryManager';
import {
  AdminShell,
  StatCard,
  OrderStatusBadge,
  AdminPanel,
  AdminDataTable,
  AdminModal,
  AdminAlert
} from '../ui';


export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchCategories();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders');
      setOrders(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const calculateStats = (orderList) => {
    const total = orderList.length;
    const pending = orderList.filter(o => o.status === 'pending').length;
    const completed = orderList.filter(o => o.status === 'completed').length;
    const revenue = orderList
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);

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
      'Order Status': order.status,
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
    doc.text('Customer', 45, yPosition);
    doc.text('Amount', 85, yPosition);
    doc.text('Status', 115, yPosition);
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
      doc.text((order.customerName || 'Walk-in').substring(0, 15), 45, yPosition);
      doc.text(`${order.totalAmount.toFixed(2)} PHP`, 85, yPosition);
      doc.text(order.status, 115, yPosition);
      yPosition += 6;
    });
    
    doc.save(`sales_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const dashboardActions =
    currentSection === 'dashboard' ? (
      <>
        <button type="button" onClick={exportToCSV} className="btn-secondary text-sm">
          Export CSV
        </button>
        <button type="button" onClick={exportToPDF} className="btn-primary text-sm">
          Export PDF
        </button>
      </>
    ) : null;

  return (
    <>
      <AdminShell
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        onLogout={() => setShowLogoutConfirm(true)}
        headerActions={dashboardActions}
      >
        {currentSection === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total orders" value={stats.totalOrders} variant="orders" />
              <StatCard label="Pending" value={stats.pendingOrders} variant="pending" />
              <StatCard label="Completed" value={stats.completedOrders} variant="completed" />
              <StatCard label="Revenue (completed)" value={`₱${stats.totalRevenue.toFixed(0)}`} variant="revenue" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AdminPanel title="Orders by status">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                      data={[
                        { name: 'Pending', value: stats.pendingOrders, fill: '#D4A574' },
                        { name: 'Completed', value: stats.completedOrders, fill: '#6B5344' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </AdminPanel>

              <AdminPanel title="Items by category">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={categories.map((cat) => ({
                      name: cat.name,
                      count: orders.reduce(
                        (total, order) =>
                          total + order.items.filter((item) => item.category === cat.name).length,
                        0
                      )
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD4" />
                    <XAxis dataKey="name" tick={{ fill: '#6B5344', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6B5344', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B6F47" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </AdminPanel>
            </div>

            <AdminPanel title="Recent orders" description="Last 10 orders">
              <AdminDataTable
                columns={['Order #', 'Customer', 'Amount', 'Status', 'Time']}
                isEmpty={orders.length === 0}
              >
                {orders.slice(0, 10).map((order) => (
                  <tr key={order._id}>
                    <td className="font-semibold text-tea">{order.orderNumber}</td>
                    <td>{order.customerName || '—'}</td>
                    <td className="font-semibold">₱{order.totalAmount.toFixed(2)}</td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="text-tea-muted">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </AdminDataTable>
            </AdminPanel>
          </div>
        )}

        {currentSection === 'menu' && <AdminMenuManager categories={categories} />}
        {currentSection === 'categories' && (
          <AdminCategoryManager onCategoriesChange={setCategories} />
        )}
        {currentSection === 'orders' && <AdminOrders orders={orders} onRefresh={fetchOrders} />}
        {currentSection === 'analytics' && (
          <AdminAnalytics orders={orders} categories={categories} />
        )}
        {currentSection === 'settings' && <AdminSettings />}
      </AdminShell>

      {showLogoutConfirm && (
        <AdminModal
          title="Sign out?"
          description="You will need to sign in again to access the admin panel."
          onClose={() => setShowLogoutConfirm(false)}
          footer={
            <>
              <button type="button" onClick={() => setShowLogoutConfirm(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="button" onClick={handleLogout} className="btn-danger flex-1">
                Sign out
              </button>
            </>
          }
        />
      )}
    </>
  );
}

function AdminOrders({ orders, onRefresh }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end">
        <button type="button" onClick={onRefresh} className="btn-secondary">
          Refresh
        </button>
      </div>
      <AdminDataTable
        columns={['Order #', 'Customer', 'Items', 'Amount', 'Status', 'Time']}
        isEmpty={orders.length === 0}
        emptyMessage="No orders yet"
      >
        {orders.map((order) => (
          <tr key={order._id}>
            <td className="font-semibold text-tea">{order.orderNumber}</td>
            <td>{order.customerName || '—'}</td>
            <td className="text-tea-muted">{order.items.length} items</td>
            <td className="font-semibold">₱{order.totalAmount.toFixed(2)}</td>
            <td>
              <OrderStatusBadge status={order.status} />
            </td>
            <td className="text-tea-muted">
              {new Date(order.createdAt).toLocaleDateString()}{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </td>
          </tr>
        ))}
      </AdminDataTable>
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
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={`₱${totalRevenue.toFixed(2)}`} variant="revenue" />
        <StatCard label="Average order" value={`₱${avgOrderValue.toFixed(2)}`} variant="default" />
        <StatCard label="Total orders" value={orders.length} variant="orders" />
        <StatCard label="Unique customers" value={Object.keys(customerStats).length} variant="pending" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminPanel title="Daily revenue">
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {Object.entries(sortedRevenue).length > 0 ? (
              Object.entries(sortedRevenue).map(([date, revenue]) => (
                <div
                  key={date}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-milk/50 px-4 py-3"
                >
                  <span className="font-medium text-tea">{date}</span>
                  <span className="font-semibold text-tea-dark">₱{revenue.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-tea-muted">No revenue data yet</p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Top selling items">
          <div className="space-y-2">
            {topItems.length > 0 ? (
              topItems.map(([item, count], idx) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl bg-tea px-4 py-3 text-white"
                >
                  <span className="truncate font-medium">
                    <span className="mr-2 text-brew-caramel">#{idx + 1}</span>
                    {item}
                  </span>
                  <span className="ml-2 shrink-0 rounded-lg bg-white/15 px-2 py-0.5 text-sm font-bold">
                    {count}×
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-tea-muted">No sales data yet</p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Top customers">
          <div className="space-y-2">
            {topCustomers.length > 0 ? (
              topCustomers.map(([customer, custStats], idx) => (
                <div key={customer} className="rounded-xl border border-surface-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-tea">
                      <span className="mr-2 text-tea-muted">#{idx + 1}</span>
                      {customer}
                    </span>
                    <span className="badge bg-sky-50 text-sky-800 ring-sky-200">
                      {custStats.count} orders
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-tea-muted">₱{custStats.totalSpent.toFixed(2)} spent</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-tea-muted">No customer data yet</p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Peak order hours">
          <div className="space-y-4">
            {peakHoursSorted.length > 0 ? (
              peakHoursSorted.map(([time, count]) => {
                const maxCount = Math.max(...Object.values(peakHours), 1);
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={time}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-tea">{time}</span>
                      <span className="font-semibold text-tea-muted">{count} orders</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-milk">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brew-caramel to-tea transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-tea-muted">No order time data yet</p>
            )}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
function AdminSettings() {
  const { user } = useContext(AuthContext);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [newStaffForm, setNewStaffForm] = useState({ username: '', password: '', confirmPassword: '', displayName: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  const fetchStaff = async () => {
    try {
      const response = await api.get('/api/staff/users');
      setStaffList(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  useEffect(() => {
    api.get('/health')
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));
    fetchStaff();
  }, []);

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
      await api.put(`/api/admin/users/${user?.username}/password`, {
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

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newStaffForm.password !== newStaffForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newStaffForm.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/staff/users', {
        username: newStaffForm.username,
        password: newStaffForm.password,
        displayName: newStaffForm.displayName || newStaffForm.username
      });
      setMessage({ type: 'success', text: 'Kitchen staff account created! They can log in at /kitchen' });
      setNewStaffForm({ username: '', password: '', confirmPassword: '', displayName: '' });
      setShowAddStaff(false);
      fetchStaff();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create staff' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (username) => {
    if (!window.confirm(`Remove kitchen staff "${username}"?`)) return;
    try {
      await api.delete(`/api/staff/users/${username}`);
      setMessage({ type: 'success', text: `Staff "${username}" removed` });
      fetchStaff();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete staff' });
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
      await api.post('/api/admin/users', {
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
    <div className="space-y-6 animate-fade-in">
      {message.text && <AdminAlert type={message.type === 'success' ? 'success' : 'error'}>{message.text}</AdminAlert>}

      <AdminPanel title="Account" description="Manage your admin credentials" className="lg:col-span-2">
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="rounded-xl border border-surface-border bg-milk px-5 py-4 min-w-[140px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-tea-muted">Signed in as</p>
            <p className="mt-1 font-semibold text-tea">{user?.username || 'admin'}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowChangePassword(!showChangePassword);
              setMessage({ type: '', text: '' });
            }}
            className="btn-secondary"
          >
            Change password
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddAdmin(!showAddAdmin);
              setMessage({ type: '', text: '' });
            }}
            className="btn-primary"
          >
            Add admin
          </button>
        </div>

        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="mb-6 space-y-4 rounded-xl border border-surface-border bg-surface-soft p-6">
            <h4 className="font-semibold text-tea">Change password</h4>
            <input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              className="input-field"
              placeholder="Current password"
              required
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input-field"
              placeholder="New password"
              required
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="input-field"
              placeholder="Confirm new password"
              required
            />
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                {loading ? 'Updating…' : 'Update'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {showAddAdmin && (
          <form onSubmit={handleCreateAdmin} className="space-y-4 rounded-xl border border-surface-border bg-surface-soft p-6">
            <h4 className="font-semibold text-tea">New admin account</h4>
            <input
              type="text"
              value={newAdminForm.username}
              onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
              className="input-field"
              placeholder="Username"
              required
            />
            <input
              type="password"
              value={newAdminForm.password}
              onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
              className="input-field"
              placeholder="Password"
              required
            />
            <input
              type="password"
              value={newAdminForm.confirmPassword}
              onChange={(e) => setNewAdminForm({ ...newAdminForm, confirmPassword: e.target.value })}
              className="input-field"
              placeholder="Confirm password"
              required
            />
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                {loading ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddAdmin(false);
                  setNewAdminForm({ username: '', password: '', confirmPassword: '' });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </AdminPanel>

      <AdminPanel
        title="Kitchen staff"
        description="Staff sign in at /kitchen — not linked from the customer menu"
        action={
          <button
            type="button"
            onClick={() => {
              setShowAddStaff(!showAddStaff);
              setMessage({ type: '', text: '' });
            }}
            className="btn-accent text-sm"
          >
            Add staff
          </button>
        }
      >
        {showAddStaff && (
          <form onSubmit={handleCreateStaff} className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-surface-border bg-surface-soft p-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-tea">Username</label>
              <input
                type="text"
                value={newStaffForm.username}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, username: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-tea">Display name</label>
              <input
                type="text"
                value={newStaffForm.displayName}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, displayName: e.target.value })}
                className="input-field"
                placeholder="e.g. Maria"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-tea">Password</label>
              <input
                type="password"
                value={newStaffForm.password}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-tea">Confirm password</label>
              <input
                type="password"
                value={newStaffForm.confirmPassword}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, confirmPassword: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? 'Creating…' : 'Create staff account'}
              </button>
            </div>
          </form>
        )}

        {staffList.length === 0 ? (
          <p className="text-sm text-tea-muted">
            No kitchen staff yet. Add one above or restart the backend for the default account.
          </p>
        ) : (
          <ul className="divide-y divide-surface-border rounded-xl border border-surface-border">
            {staffList.map((s) => (
              <li key={s.username} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-semibold text-tea">{s.display_name || s.username}</p>
                  <p className="text-xs text-tea-muted">@{s.username}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteStaff(s.username)}
                  className="text-sm font-semibold text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <AdminPanel title="System">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-tea-muted">Version</dt>
              <dd className="font-semibold text-tea">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-tea-muted">Backend</dt>
              <dd
                className={`font-semibold ${
                  backendStatus === 'connected'
                    ? 'text-emerald-600'
                    : backendStatus === 'disconnected'
                      ? 'text-red-600'
                      : 'text-amber-600'
                }`}
              >
                {backendStatus === 'connected' && 'Connected'}
                {backendStatus === 'disconnected' && 'Disconnected'}
                {backendStatus === 'checking' && 'Checking…'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-tea-muted">Storage</dt>
              <dd className="font-semibold text-emerald-600">Supabase</dd>
            </div>
          </dl>
        </AdminPanel>

        <AdminPanel title="Data">
          <p className="text-sm text-tea-muted">Orders and menu data sync automatically to your database.</p>
        </AdminPanel>

        <AdminPanel title="Support">
          <p className="text-sm text-tea-muted">support@bigbrew.com</p>
        </AdminPanel>
      </div>
    </div>
  );
}
