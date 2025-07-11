import StoreList from "../components/StoreList";
import RateModal from "../components/RateModal";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Spinner from "../components/Spinner";

export default function DashboardUser() {
  const [selectedStore, setSelectedStore] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [initialRating, setInitialRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

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
      const response = await fetch("http://localhost:4000/user/update-password", {
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

  const handleOpenRateModal = async (store) => {
    setLoadingRating(true);
    setSelectedStore(store);
    setSuccessMsg("");
    try {
      const res = await fetch(`http://localhost:4000/ratings/${store.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInitialRating({ rating: data.rating, comment: data.comment });
      } else {
        setInitialRating(null);
      }
    } catch {
      setInitialRating(null);
    }
    setLoadingRating(false);
  };

  // Add toast for rating submission/update
  const handleRate = async (storeId, rating, comment) => {
    setRatingError("");
    setRatingSuccess("");
    try {
      const response = await fetch(`http://localhost:4000/user/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ storeId, rating, comment })
      });
      const data = await response.json();
      if (!response.ok) {
        setRatingError(data.message || "Failed to submit rating.");
        toast.error(data.message || "Failed to submit rating.");
      } else {
        setRatingSuccess("Rating submitted successfully!");
        toast.success("Rating submitted successfully!");
        // Optionally refresh ratings list here
      }
    } catch (err) {
      setRatingError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setSelectedStore(null);
    setInitialRating(null);
    setSuccessMsg("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-8 relative">
      {loadingRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <Spinner size={60} />
        </div>
      )}
      <div className="flex justify-end mb-4">
        <button onClick={openPwdModal} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Update Password</button>
      </div>
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">{user && user.name ? `Welcome, ${user.name}` : 'Welcome'}</h1>
      <StoreList onRate={handleOpenRateModal} key={refresh} refresh={refresh} />
      <RateModal
        store={selectedStore}
        onClose={handleCloseModal}
        onSubmit={handleRate}
        initialRating={initialRating}
        loading={loadingRating}
        successMsg={successMsg}
      />
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
    </div>
  );
} 