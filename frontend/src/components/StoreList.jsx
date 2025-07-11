import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function StarDisplay({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function StoreList({ onRate, refresh }) {
  const { token } = useAuth();
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStoresAndRatings() {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:4000/stores?name=${encodeURIComponent(search)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setStores(data);
        console.log('Fetched stores:', data); // Debug log
        // Fetch user ratings for each store
        const ratingsObj = {};
        await Promise.all(
          data.map(async (store) => {
            try {
              const res = await fetch(`http://localhost:4000/ratings/${store.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                const ratingData = await res.json();
                ratingsObj[store.id] = ratingData;
              }
            } catch {}
          })
        );
        setUserRatings(ratingsObj);
      } catch {
        setStores([]);
        setUserRatings({});
      }
      setLoading(false);
    }
    fetchStoresAndRatings();
  }, [search, token, refresh]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search stores by name..."
          className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center text-blue-600">Loading stores...</div>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Rating</th>
              <th className="px-4 py-2 text-left">Your Rating</th>
              <th className="px-4 py-2 text-left">Your Comment</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-b">
                <td className="px-4 py-2">{store.name}</td>
                <td className="px-4 py-2">{store.address}</td>
                <td className="px-4 py-2">{store.avgrating !== null && store.avgrating !== undefined ? `${store.avgrating}/5` : <span className="text-gray-400">-</span>}</td>
                <td className="px-4 py-2">
                  {userRatings[store.id]?.rating ? (
                    <StarDisplay rating={userRatings[store.id].rating} />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {userRatings[store.id]?.comment ? (
                    <span>{userRatings[store.id].comment}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    onClick={() => onRate(store)}
                  >
                    Rate
                  </button>
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No stores found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
} 