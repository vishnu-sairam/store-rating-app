import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Spinner from "../components/Spinner";

function getMostCommonRating(ratings) {
  if (!ratings.length) return null;
  const freq = {};
  ratings.forEach(r => { freq[r.rating] = (freq[r.rating] || 0) + 1; });
  let max = 0, val = null;
  Object.entries(freq).forEach(([k, v]) => { if (v > max) { max = v; val = k; } });
  return val;
}

export default function DashboardOwner() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [average, setAverage] = useState(null);
  const [loadingAvg, setLoadingAvg] = useState(false);
  const [avgError, setAvgError] = useState("");
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [ratingsError, setRatingsError] = useState("");

  // Password change modal state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const openPwdModal = () => { setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); setPwdError(''); setPwdSuccess(''); setShowPwdModal(true); };
  const closePwdModal = () => setShowPwdModal(false);
  const handlePwdFormChange = e => {
    const { name, value } = e.target;
    setPwdForm(f => ({ ...f, [name]: value }));
  };
  const handlePwdSubmit = async e => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");
    if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      setPwdError("All fields are required.");
      toast.error("All fields are required.");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("New passwords do not match.");
      toast.error("New passwords do not match.");
      return;
    }
    if (pwdForm.newPassword.length < 8 || pwdForm.newPassword.length > 16) {
      setPwdError("New password must be 8-16 characters.");
      toast.error("New password must be 8-16 characters.");
      return;
    }
    if (!/[A-Z]/.test(pwdForm.newPassword)) {
      setPwdError("New password must contain at least one uppercase letter.");
      toast.error("New password must contain at least one uppercase letter.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(pwdForm.newPassword)) {
      setPwdError("New password must contain at least one special character.");
      toast.error("New password must contain at least one special character.");
      return;
    }
    try {
      const response = await fetch((process.env.REACT_APP_API_URL || "https://store-rating-app-8.onrender.com") + "/owner/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        setPwdError(data.message || "Failed to update password.");
        toast.error(data.message || "Failed to update password.");
      } else {
        setPwdSuccess("Password updated successfully! Logging out...");
        toast.success("Password updated successfully! Logging out...");
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          logout();
          window.location.replace('/login');
        }, 800);
      }
    } catch (err) {
      setPwdError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    }
  };

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const openProfileModal = () => setShowProfileModal(true);
  const closeProfileModal = () => setShowProfileModal(false);

  useEffect(() => {
    async function fetchStore() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch((process.env.REACT_APP_API_URL || "https://store-rating-app-8.onrender.com") + "/owner/store", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch store info");
        }
        const data = await res.json();
        setStore(data);
      } catch (err) {
        setError(err.message);
        setStore(null);
      }
      setLoading(false);
    }
    fetchStore();
  }, [token]);

  useEffect(() => {
    async function fetchAverage() {
      setLoadingAvg(true);
      setAvgError("");
      try {
        const res = await fetch((process.env.REACT_APP_API_URL || "https://store-rating-app-8.onrender.com") + "/owner/average", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch average rating");
        }
        const data = await res.json();
        setAverage(data.averageRating);
      } catch (err) {
        setAvgError(err.message);
        setAverage(null);
      }
      setLoadingAvg(false);
    }
    fetchAverage();
  }, [token]);

  useEffect(() => {
    async function fetchRatings() {
      setLoadingRatings(true);
      setRatingsError("");
      try {
        const res = await fetch((process.env.REACT_APP_API_URL || "https://store-rating-app-8.onrender.com") + "/owner/ratings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch ratings");
        }
        const data = await res.json();
        setRatings(data);
      } catch (err) {
        setRatingsError(err.message);
        setRatings([]);
      }
      setLoadingRatings(false);
    }
    fetchRatings();
  }, [token]);

  // Analytics
  const numRatings = ratings.length;
  const mostRecent = ratings.length ? ratings[ratings.length - 1] : null;
  const mostCommon = getMostCommonRating(ratings);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 p-8 flex flex-col items-center relative">
      {(loading || loadingAvg || loadingRatings) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <Spinner size={60} />
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-8 text-center w-full max-w-4xl relative">
        {/* Top section: Profile avatar, main heading (owner name), and Update Password button inline */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            {store && (
              <button
                onClick={openProfileModal}
                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow hover:bg-blue-700 transition mr-4"
                title="View Profile"
              >
                {store.name && store.name.trim().charAt(0).toUpperCase()}
              </button>
            )}
            <h1 className="text-3xl font-bold text-purple-700 text-left m-0">{store ? store.name : ''}</h1>
          </div>
          <button
            onClick={openPwdModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Update Password
          </button>
        </div>
        {loading ? (
          <div className="text-blue-500">Loading store info...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : store ? (
          <div>
            <h2 className="text-2xl font-semibold text-blue-700 mb-2">{store.name}</h2>
            <div className="mt-6 mb-2">
              <span className="font-semibold text-lg text-purple-700">Average Rating:</span>
              {loadingAvg ? (
                <span className="text-blue-500 ml-2">Loading...</span>
              ) : avgError ? (
                <span className="text-red-500 ml-2">{avgError}</span>
              ) : average ? (
                <span className="text-yellow-500 text-xl ml-2">{average} ★</span>
              ) : (
                <span className="text-gray-400 ml-2">No ratings yet</span>
              )}
            </div>
            {/* Analytics Cards */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 mb-8">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 w-60 shadow-sm flex flex-col items-center">
                <span className="text-3xl text-purple-700 mb-2">📊</span>
                <span className="font-bold text-xl">{numRatings}</span>
                <span className="text-gray-600 mt-1">Total Ratings</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 w-60 shadow-sm flex flex-col items-center">
                <span className="text-3xl text-yellow-500 mb-2">⭐</span>
                <span className="font-bold text-xl">{mostCommon || '-'}</span>
                <span className="text-gray-600 mt-1">Most Common Rating</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 w-60 shadow-sm flex flex-col items-center">
                <span className="text-3xl text-blue-500 mb-2">🕒</span>
                <span className="font-bold text-xl">{mostRecent ? `${mostRecent.rating} ★` : '-'}</span>
                <span className="text-gray-600 mt-1">Most Recent Rating</span>
                {mostRecent && (
                  <span className="text-xs text-gray-500 mt-1">{mostRecent.name}</span>
                )}
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-purple-700 mb-4">User Ratings</h3>
              {loadingRatings ? (
                <div className="text-blue-500">Loading ratings...</div>
              ) : ratingsError ? (
                <div className="text-red-500">{ratingsError}</div>
              ) : ratings.length === 0 ? (
                <div className="text-gray-400">No user ratings yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border text-center">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="px-4 py-2">User Name</th>
                        <th className="px-4 py-2">User Email</th>
                        <th className="px-4 py-2">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratings.map((r) => (
                        <tr key={r.userId} className="border-b">
                          <td className="px-4 py-2">{r.name}</td>
                          <td className="px-4 py-2">{r.email}</td>
                          <td className="px-4 py-2 text-yellow-500 font-bold">{r.rating} ★</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No store found for this owner.</div>
        )}
      </div>
      {/* Password Change Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            {pwdError && <div className="text-red-500 mb-2">{pwdError}</div>}
            {pwdSuccess && <div className="text-green-600 mb-2">{pwdSuccess}</div>}
            <form onSubmit={handlePwdSubmit} className="flex flex-col gap-4">
              <input name="oldPassword" type="password" value={pwdForm.oldPassword} onChange={handlePwdFormChange} placeholder="Old Password" className="border rounded px-3 py-2" />
              <input name="newPassword" type="password" value={pwdForm.newPassword} onChange={handlePwdFormChange} placeholder="New Password" className="border rounded px-3 py-2" />
              <input name="confirmPassword" type="password" value={pwdForm.confirmPassword} onChange={handlePwdFormChange} placeholder="Confirm New Password" className="border rounded px-3 py-2" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={closePwdModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Profile Modal */}
      {showProfileModal && store && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button onClick={closeProfileModal} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Profile</h2>
            <div className="mb-2 text-left"><span className="font-semibold">Name:</span> {store.name}</div>
            <div className="mb-2 text-left"><span className="font-semibold">Email:</span> {store.email}</div>
            <div className="mb-4 text-left"><span className="font-semibold">Address:</span> {store.address}</div>
            <button
              onClick={() => { closeProfileModal(); openPwdModal(); }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full"
            >
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 