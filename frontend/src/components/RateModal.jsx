import { useState, useEffect } from "react";

export default function RateModal({ store, onClose, onSubmit, initialRating, loading, successMsg }) {
  const [rating, setRating] = useState(initialRating?.rating || 0);
  const [comment, setComment] = useState(initialRating?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setRating(initialRating?.rating || 0);
    setComment(initialRating?.comment || "");
    setError("");
    setSubmitted(false);
    setSuccess(false);
  }, [store, initialRating]);

  useEffect(() => {
    if (successMsg) {
      setSuccess(true);
      setSubmitted(true);
      setError("");
    }
  }, [successMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!rating && comment) {
      setError("Please give a rating (star) along with your comment.");
      setSubmitted(true);
      setSuccess(false);
      return;
    }
    if (!rating) {
      setError("Please select a rating between 1 and 5.");
      setSubmitted(true);
      setSuccess(false);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(store.id, rating, comment);
      // Don't close modal, just show success
    } catch (err) {
      setError(err.message || "Failed to submit rating.");
      setSubmitted(true);
      setSuccess(false);
    }
    setSubmitting(false);
  };

  if (!store) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-700 text-center">
          Rate {store.name}
        </h2>
        {loading ? (
          <div className="text-center text-blue-500 mb-4">Loading rating...</div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`text-3xl mx-1 focus:outline-none ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                disabled={submitting || loading}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={3}
            placeholder="Optional comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting || loading}
          />
          {submitted && error && !success && (
            <div className="text-red-500 mb-2 text-center">{error}</div>
          )}
          {submitted && success && (
            <div className="text-green-600 mb-2 text-center">Thanks for your review!</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
            disabled={submitting || loading}
          >
            {submitting ? "Submitting..." : initialRating ? "Update Rating" : "Submit Rating"}
          </button>
        </form>
        )}
      </div>
    </div>
  );
} 