import { useState } from "react";
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { FaUserAlt, FaEnvelope, FaLock, FaMapMarkerAlt, FaUserTag } from 'react-icons/fa';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("User");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, address, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Registration failed");
        toast.error(data.message || "Registration failed");
      } else {
        setSuccess("Registration successful! You can now log in.");
        toast.success("Registration successful! You can now log in.");
        setName(""); setEmail(""); setPassword(""); setAddress(""); setRole("User");
      }
    } catch (err) {
      setError("Network error");
      toast.error("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-300 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob1" style={{top: '-6rem', left: '-6rem'}}></div>
        <div className="absolute w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob2" style={{top: '10rem', right: '-6rem'}}></div>
        <div className="absolute w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob3" style={{bottom: '-6rem', left: '50%'}}></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl p-10 flex flex-col items-center animate-fadeIn">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-4 mb-4 animate-bounce">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Zm-7 17a7 7 0 0 1 14 0v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1Z"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold mb-6 text-purple-800 text-center tracking-tight drop-shadow">Register</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <div className="relative">
              <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Name"
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition shadow-sm bg-white/70"
                required
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition shadow-sm bg-white/70"
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition shadow-sm bg-white/70"
                required
              />
            </div>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Address"
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition shadow-sm bg-white/70"
              />
            </div>
            <div className="relative">
              <FaUserTag className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition shadow-sm bg-white/70"
              >
                <option value="User">User</option>
                <option value="Owner">Owner</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">{success}</div>}
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-600 transition font-semibold text-lg tracking-wide flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <Spinner size={22} color="#fff" /> : "Register"}
            </button>
          </form>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(.4,2,.6,1) both; }
        @keyframes blob1 { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-20px) scale(1.1);} }
        .animate-blob1 { animation: blob1 8s infinite ease-in-out; }
        @keyframes blob2 { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(20px) scale(1.1);} }
        .animate-blob2 { animation: blob2 10s infinite ease-in-out; }
        @keyframes blob3 { 0%,100%{transform:translateX(0) scale(1);} 50%{transform:translateX(-30px) scale(1.1);} }
        .animate-blob3 { animation: blob3 12s infinite ease-in-out; }
      `}</style>
    </div>
  );
} 