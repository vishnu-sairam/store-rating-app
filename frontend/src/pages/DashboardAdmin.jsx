import React, { useState, useEffect } from "react";
import * as adminService from "../services/adminService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Spinner from "../components/Spinner";

const sections = [
  { id: "analytics", label: "Analytics" },
  { id: "users", label: "Users" },
  { id: "stores", label: "Stores" },
];

export default function DashboardAdmin() {
  const [activeSection, setActiveSection] = useState("analytics");

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Users and stores state
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [storesError, setStoresError] = useState("");

  // Analytics state
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  // Refresh stores state
  const [refreshStores, setRefreshStores] = useState(0);
  const [refreshUsers, setRefreshUsers] = useState(0);

  // Fetch users and stores on mount
  useEffect(() => {
    if (!token) return;
    setLoadingUsers(true);
    setUsersError("");
    adminService.fetchUsers(token)
      .then(data => setUsers(data))
      .catch(() => setUsersError("Failed to fetch users."))
      .finally(() => setLoadingUsers(false));
    setLoadingStores(true);
    setStoresError("");
    adminService.fetchStores(token)
      .then(data => setStores(data))
      .catch(() => setStoresError("Failed to fetch stores."))
      .finally(() => setLoadingStores(false));
  }, [token, refreshStores, refreshUsers]);

  // Fetch analytics on mount and when users or stores change
  useEffect(() => {
    if (!token) return;
    setLoadingAnalytics(true);
    setAnalyticsError("");
    adminService.fetchDashboard(token)
      .then(data => setAnalytics(data))
      .catch(() => setAnalyticsError("Failed to fetch analytics."))
      .finally(() => setLoadingAnalytics(false));
  }, [token, refreshUsers, refreshStores]);

  // Mock analytics data
  const totalUsers = users.length;
  const totalStores = stores.length;
  const totalRatings = 42; // This will need to be updated to fetch from backend

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  // Update userForm state to include password
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", address: "", role: "user", shop: "" });
  const [storeForm, setStoreForm] = useState({ name: "", owner: "", email: "", address: "" });
  const [userError, setUserError] = useState("");
  const [storeError, setStoreError] = useState("");

  // Edit/Delete state
  const [editUser, setEditUser] = useState(null);
  const [editStore, setEditStore] = useState(null);
  const [showDeleteUserId, setShowDeleteUserId] = useState(null);
  const [showDeleteStoreId, setShowDeleteStoreId] = useState(null);

  // Password update modal state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Search/filter state
  const [userSearch, setUserSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");

  // Filtered users and stores
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });
  const filteredStores = stores.filter(s => {
    const q = storeSearch.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.owner && s.owner.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  // Handlers for user modal
  const openUserModal = () => { setUserForm({ name: "", email: "", password: "", address: "", role: "User", shop: "" }); setUserError(""); setShowUserModal(true); };
  const closeUserModal = () => setShowUserModal(false);
  const handleUserFormChange = e => {
    const { name, value } = e.target;
    setUserForm(f => ({ ...f, [name]: value }));
  };
  const handleUserSubmit = e => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password || !userForm.role) {
      setUserError("All fields except shop are required.");
      toast.error("All fields except shop are required.");
      return;
    }
    if (userForm.name.length < 20 || userForm.name.length > 60) {
      setUserError("Name must be between 20 and 60 characters.");
      toast.error("Name must be between 20 and 60 characters.");
      return;
    }
    if (
      userForm.password.length < 8 ||
      userForm.password.length > 16 ||
      !/[A-Z]/.test(userForm.password) ||
      !/[^A-Za-z0-9]/.test(userForm.password)
    ) {
      setUserError("Password must be 8-16 characters, include an uppercase letter and a special character.");
      toast.error("Password must be 8-16 characters, include an uppercase letter and a special character.");
      return;
    }
    adminService.createUser(token, userForm)
      .then(() => {
        setRefreshUsers(r => r + 1);
        toast.success("User added successfully!");
      })
      .catch(err => {
        setUserError(err.message || "Failed to add user.");
        toast.error(err.message || "Failed to add user.");
      })
      .finally(() => closeUserModal());
  };

  // Edit user handlers
  const openEditUser = (user) => { setEditUser({ ...user }); setUserError(""); };
  const closeEditUser = () => setEditUser(null);
  const handleEditUserChange = e => {
    const { name, value } = e.target;
    setEditUser(f => ({ ...f, [name]: value }));
  };
  const handleEditUserSubmit = e => {
    e.preventDefault();
    if (!editUser.name || !editUser.email || !editUser.role) {
      setUserError("All fields except shop are required.");
      toast.error("All fields except shop are required.");
      return;
    }
    adminService.updateUser(token, editUser.id, editUser)
      .then(updatedUser => {
        setUsers(prev => prev.map(u => u.id === editUser.id ? updatedUser : u));
        setRefreshUsers(r => r + 1);
        toast.success("User updated successfully!");
      })
      .catch(err => {
        setUserError(err.message || "Failed to update user.");
        toast.error(err.message || "Failed to update user.");
      })
      .finally(() => closeEditUser());
  };

  // Delete user handlers
  const confirmDeleteUser = (id) => setShowDeleteUserId(id);
  const cancelDeleteUser = () => setShowDeleteUserId(null);
  const handleDeleteUser = () => {
    adminService.deleteUser(token, showDeleteUserId)
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== showDeleteUserId));
        setRefreshUsers(r => r + 1);
        toast.success("User deleted successfully!");
      })
      .catch(err => {
        setUserError(err.message || "Failed to delete user.");
        toast.error(err.message || "Failed to delete user.");
      })
      .finally(() => setShowDeleteUserId(null));
  };

  // Handlers for store modal
  const openStoreModal = () => { setStoreForm({ name: "", owner: "", email: "", address: "" }); setStoreError(""); setShowStoreModal(true); };
  const closeStoreModal = () => setShowStoreModal(false);
  const handleStoreFormChange = e => {
    const { name, value } = e.target;
    setStoreForm(f => ({ ...f, [name]: value }));
  };
  const handleStoreSubmit = e => {
    e.preventDefault();
    if (!storeForm.name || !storeForm.owner || !storeForm.email || !storeForm.address) {
      setStoreError("All fields are required.");
      toast.error("All fields are required.");
      return;
    }
    adminService.createStore(token, storeForm)
      .then(newStore => {
        setStores(prev => [...prev, newStore]);
        setRefreshStores(r => r + 1);
        toast.success("Store added successfully!");
      })
      .catch(err => {
        setStoreError(err.message || "Failed to add store.");
        toast.error(err.message || "Failed to add store.");
      })
      .finally(() => closeStoreModal());
  };

  // Edit store handlers
  const openEditStore = (store) => { setEditStore({ ...store }); setStoreError(""); };
  const closeEditStore = () => setEditStore(null);
  const handleEditStoreChange = e => {
    const { name, value } = e.target;
    setEditStore(f => ({ ...f, [name]: value }));
  };
  const handleEditStoreSubmit = e => {
    e.preventDefault();
    if (!editStore.name || !editStore.owner || !editStore.email || !editStore.address) {
      setStoreError("All fields are required.");
      toast.error("All fields are required.");
      return;
    }
    adminService.updateStore(token, editStore.id, editStore)
      .then(updatedStore => {
        setStores(prev => prev.map(s => s.id === editStore.id ? updatedStore : s));
        setRefreshStores(r => r + 1);
        toast.success("Store updated successfully!");
      })
      .catch(err => {
        setStoreError(err.message || "Failed to update store.");
        toast.error(err.message || "Failed to update store.");
      })
      .finally(() => closeEditStore());
  };

  // Delete store handlers
  const confirmDeleteStore = (id) => setShowDeleteStoreId(id);
  const cancelDeleteStore = () => setShowDeleteStoreId(null);
  const handleDeleteStore = () => {
    adminService.deleteStore(token, showDeleteStoreId)
      .then(() => {
        setStores(prev => prev.filter(s => s.id !== showDeleteStoreId));
        setRefreshStores(r => r + 1);
        toast.success("Store deleted successfully!");
      })
      .catch(err => {
        setStoreError(err.message || "Failed to delete store.");
        toast.error(err.message || "Failed to delete store.");
      })
      .finally(() => setShowDeleteStoreId(null));
  };

  // Password update handlers
  const openPwdModal = () => { 
    setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); 
    setPwdError(''); 
    setPwdSuccess(''); 
    setShowPwdModal(true); 
  };
  const closePwdModal = () => setShowPwdModal(false);
  const handlePwdFormChange = e => {
    const { name, value } = e.target;
    setPwdForm(f => ({ ...f, [name]: value }));
  };
  const handlePwdSubmit = async e => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      setPwdError('All fields are required.');
      toast.error('All fields are required.');
      return;
    }

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('New passwords do not match.');
      toast.error('New passwords do not match.');
      return;
    }

    if (pwdForm.newPassword.length < 8 || pwdForm.newPassword.length > 16) {
      setPwdError('New password must be 8-16 characters.');
      toast.error('New password must be 8-16 characters.');
      return;
    }

    if (!/[A-Z]/.test(pwdForm.newPassword)) {
      setPwdError('New password must contain at least one uppercase letter.');
      toast.error('New password must contain at least one uppercase letter.');
      return;
    }

    if (!/[^A-Za-z0-9]/.test(pwdForm.newPassword)) {
      setPwdError('New password must contain at least one special character.');
      toast.error('New password must contain at least one special character.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/admin/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setPwdError(data.message || 'Failed to update password.');
        toast.error(data.message || 'Failed to update password.');
      } else {
        setPwdSuccess('Password updated successfully! Logging out...');
        toast.success('Password updated successfully! Logging out...');
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          logout();
          window.location.replace('/login');
        }, 800);
      }
    } catch (err) {
      setPwdError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-100 to-purple-300 relative">
      {(loadingUsers || loadingStores || loadingAnalytics) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <Spinner size={60} />
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-8 text-center">Admin</h2>
        <nav className="flex flex-col gap-4">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeSection === section.id
                  ? "bg-purple-200 text-purple-800"
                  : "text-gray-700 hover:bg-purple-100"
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-200">
          <button
            onClick={openPwdModal}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
          >
            Update Password
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        {activeSection === "analytics" && (
          <div>
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Analytics</h1>
            {loadingAnalytics ? (
              <div className="text-blue-600 mb-4">Loading analytics...</div>
            ) : analyticsError ? (
              <div className="text-red-600 mb-4">{analyticsError}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-6 flex flex-col items-center shadow">
                  <span className="text-4xl mb-2">👥</span>
                  <span className="text-2xl font-bold text-purple-800">{analytics.totalUsers}</span>
                  <span className="text-gray-700">Total Users</span>
                </div>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 flex flex-col items-center shadow">
                  <span className="text-4xl mb-2">🏬</span>
                  <span className="text-2xl font-bold text-blue-800">{analytics.totalStores}</span>
                  <span className="text-gray-700">Total Stores</span>
                </div>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6 flex flex-col items-center shadow">
                  <span className="text-4xl mb-2">⭐</span>
                  <span className="text-2xl font-bold text-yellow-700">{analytics.totalRatings}</span>
                  <span className="text-gray-700">Total Ratings</span>
                </div>
              </div>
            )}
          </div>
        )}
        {activeSection === "users" && (
          <div>
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Users</h1>
            <button onClick={openUserModal} className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">Add User</button>
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search users by name, email, role, or shop..."
              className="mb-4 ml-4 px-3 py-2 border rounded w-72"
            />
            <div className="overflow-x-auto bg-white rounded-lg shadow p-6">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">Loading users...</td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-red-600">{usersError}</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">No users found.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2 capitalize">{user.role}</td>
                        <td className="px-4 py-2">{user.address || <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-2">
                          <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditUser(user)}>Edit</button>
                          <button className="text-red-600 hover:underline" onClick={() => confirmDeleteUser(user.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* User Modal */}
            {showUserModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Add User</h2>
                  {userError && <div className="text-red-500 mb-2">{userError}</div>}
                  <form onSubmit={handleUserSubmit} className="flex flex-col gap-4">
                    <input name="name" value={userForm.name} onChange={handleUserFormChange} placeholder="Name" className="border rounded px-3 py-2" />
                    <input name="email" value={userForm.email} onChange={handleUserFormChange} placeholder="Email" className="border rounded px-3 py-2" />
                    <input name="password" value={userForm.password} onChange={handleUserFormChange} placeholder="Password" type="password" className="border rounded px-3 py-2" />
                    <input name="address" value={userForm.address} onChange={handleUserFormChange} placeholder="Address" className="border rounded px-3 py-2" />
                    <select name="role" value={userForm.role} onChange={handleUserFormChange} className="border rounded px-3 py-2">
                      <option value="Admin">Admin</option>
                      <option value="Owner">Owner</option>
                      <option value="User">User</option>
                    </select>
                    {userForm.role === "Owner" && (
                      <input name="shop" value={userForm.shop} onChange={handleUserFormChange} placeholder="Shop Name" className="border rounded px-3 py-2" />
                    )}
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={closeUserModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Add</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Edit User Modal */}
            {editUser && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Edit User</h2>
                  {userError && <div className="text-red-500 mb-2">{userError}</div>}
                  <form onSubmit={handleEditUserSubmit} className="flex flex-col gap-4">
                    <input name="name" value={editUser.name} onChange={handleEditUserChange} placeholder="Name" className="border rounded px-3 py-2" />
                    <input name="email" value={editUser.email} onChange={handleEditUserChange} placeholder="Email" className="border rounded px-3 py-2" />
                    <select name="role" value={editUser.role} onChange={handleEditUserChange} className="border rounded px-3 py-2">
                      <option value="Admin">Admin</option>
                      <option value="Owner">Owner</option>
                      <option value="User">User</option>
                    </select>
                    {editUser.role === "Owner" && (
                      <input name="shop" value={editUser.shop || ""} onChange={handleEditUserChange} placeholder="Shop Name" className="border rounded px-3 py-2" />
                    )}
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={closeEditUser} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Save</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Delete User Confirmation */}
            {showDeleteUserId && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm text-center">
                  <h2 className="text-xl font-bold mb-4">Delete User?</h2>
                  <p className="mb-4">Are you sure you want to delete this user?</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={cancelDeleteUser} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeSection === "stores" && (
          <div>
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Stores</h1>
            <button onClick={openStoreModal} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Add Store</button>
            <input
              type="text"
              value={storeSearch}
              onChange={e => setStoreSearch(e.target.value)}
              placeholder="Search stores by name, owner, or email..."
              className="mb-4 ml-4 px-3 py-2 border rounded w-72"
            />
            <div className="overflow-x-auto bg-white rounded-lg shadow p-6">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="px-4 py-2 text-left">Store Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left">Avg Rating</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStores ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">Loading stores...</td>
                    </tr>
                  ) : storesError ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-red-600">{storesError}</td>
                    </tr>
                  ) : filteredStores.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">No stores found.</td>
                    </tr>
                  ) : (
                    filteredStores.map((store) => (
                      <tr key={store.id} className="border-b">
                        <td className="px-4 py-2">{store.name}</td>
                        <td className="px-4 py-2">{store.email}</td>
                        <td className="px-4 py-2">{store.address}</td>
                        <td className="px-4 py-2">{store.avgrating !== null && store.avgrating !== undefined ? `${store.avgrating}/5` : <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-2">
                          <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditStore(store)}>Edit</button>
                          <button className="text-red-600 hover:underline" onClick={() => confirmDeleteStore(store.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Store Modal */}
            {showStoreModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Add Store</h2>
                  {storeError && <div className="text-red-500 mb-2">{storeError}</div>}
                  <form onSubmit={handleStoreSubmit} className="flex flex-col gap-4">
                    <input name="name" value={storeForm.name} onChange={handleStoreFormChange} placeholder="Store Name" className="border rounded px-3 py-2" />
                    <input name="owner" value={storeForm.owner} onChange={handleStoreFormChange} placeholder="Owner Name" className="border rounded px-3 py-2" />
                    <input name="email" value={storeForm.email} onChange={handleStoreFormChange} placeholder="Owner Email" className="border rounded px-3 py-2" />
                    <input name="address" value={storeForm.address} onChange={handleStoreFormChange} placeholder="Store Address" className="border rounded px-3 py-2" />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={closeStoreModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Edit Store Modal */}
            {editStore && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Edit Store</h2>
                  {storeError && <div className="text-red-500 mb-2">{storeError}</div>}
                  <form onSubmit={handleEditStoreSubmit} className="flex flex-col gap-4">
                    <input name="name" value={editStore.name} onChange={handleEditStoreChange} placeholder="Store Name" className="border rounded px-3 py-2" />
                    <input name="owner" value={editStore.owner} onChange={handleEditStoreChange} placeholder="Owner Name" className="border rounded px-3 py-2" />
                    <input name="email" value={editStore.email} onChange={handleEditStoreChange} placeholder="Owner Email" className="border rounded px-3 py-2" />
                    <input name="address" value={editStore.address} onChange={handleEditStoreChange} placeholder="Store Address" className="border rounded px-3 py-2" />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={closeEditStore} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Delete Store Confirmation */}
            {showDeleteStoreId && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm text-center">
                  <h2 className="text-xl font-bold mb-4">Delete Store?</h2>
                  <p className="mb-4">Are you sure you want to delete this store?</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={cancelDeleteStore} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    <button onClick={handleDeleteStore} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Password Update Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Password</h2>
            {pwdError && <div className="text-red-500 mb-2">{pwdError}</div>}
            {pwdSuccess && <div className="text-green-500 mb-2">{pwdSuccess}</div>}
            <form onSubmit={handlePwdSubmit} className="flex flex-col gap-4">
              <input 
                name="oldPassword" 
                value={pwdForm.oldPassword} 
                onChange={handlePwdFormChange} 
                placeholder="Current Password" 
                type="password" 
                className="border rounded px-3 py-2" 
              />
              <input 
                name="newPassword" 
                value={pwdForm.newPassword} 
                onChange={handlePwdFormChange} 
                placeholder="New Password" 
                type="password" 
                className="border rounded px-3 py-2" 
              />
              <input 
                name="confirmPassword" 
                value={pwdForm.confirmPassword} 
                onChange={handlePwdFormChange} 
                placeholder="Confirm New Password" 
                type="password" 
                className="border rounded px-3 py-2" 
              />
              <div className="text-sm text-gray-600">
                Password must be 8-16 characters, include an uppercase letter and a special character.
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={closePwdModal} 
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 