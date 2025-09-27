import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { getSecureItem } from "../../utils/secureStorage";
const API_URL = process.env.REACT_APP_API_URL;


function Home() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    description: "",
    category: "Feature",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Search, Filter, Sort, Pagination
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal state
  const [showModal, setShowModal] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/feedbacks`);
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleChange = (e) => {
    setNewFeedback({ ...newFeedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFeedback),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Feedback submitted!");
        setNewFeedback({ title: "", description: "", category: "Feature" });
        fetchFeedbacks();
        setShowModal(false); // close modal after submit
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong");
    }
  };

  const handleUpvote = async (id) => {
    try {
      const userId = getSecureItem("userId");
      if (!userId) return alert("Login first to like!");

      const res = await fetch(`${API_URL}/feedbacks/${id}/upvote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const updated = await res.json();
      setFeedbacks((prev) => prev.map(f => f._id === updated._id ? updated : f));
    } catch (err) {
      console.error(err);
    }
  };
  // for greeting purpose
  const userName = getSecureItem("userName"); 

  // 🔹 Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const statusColor = (status) => {
    switch (status) {
      case "Open": return "status-open";
      case "Planned": return "status-planned";
      case "In Progress": return "status-progress";
      case "Done": return "status-done";
      default: return "status-default";
    }
  };

  // Filter, Search, Sort
  useEffect(() => {
    let data = [...feedbacks];

    if (search) {
      data = data.filter(fb =>
        fb.title.toLowerCase().includes(search.toLowerCase()) ||
        fb.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterCategory !== "All") {
      data = data.filter(fb => fb.category === filterCategory);
    }

    if (filterStatus !== "All") {
      data = data.filter(fb => fb.status === filterStatus);
    }

    if (sortOption === "Newest") {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "Most Upvoted") {
      data.sort((a, b) => b.upvotes - a.upvotes);
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [feedbacks, search, filterCategory, filterStatus, sortOption]);

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>User Feedback Dashboard</h1>
        <div className="user-info">
          <span>👋 Hi, {userName || "Guest"}</span>
          {userName && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
      <div className="controls">
        <input className="controls"
          type="text"
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="controls" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Feature">Feature</option>
          <option value="Bug">Bug</option>
          <option value="UI">UI</option>
        </select>
        <select className="controls" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select className="controls" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="Newest">Newest</option>
          <option value="Most Upvoted">Most Upvoted</option>
        </select>
        <button className="controls" onClick={() => setShowModal(true)}>+ Add Feedback</button>
      </div>

      {message && <p className="message">{message}</p>}

      {/* Feedback Table */}
      <div className="feedback-table-container">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Status</th>
              <th>Upvotes</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((fb) => (
              <tr key={fb._id}>
                <td data-label="Title">{fb.title}</td>
                <td data-label="Description">{fb.description}</td>
                <td data-label="Category">{fb.category}</td>
                <td data-label="Status">
                  <span className={`status-badge ${statusColor(fb.status)}`}>
                    {fb.status}
                  </span>
                </td>
                <td data-label="Upvotes">
                  {fb.upvotes}
                  <button onClick={() => handleUpvote(fb._id)}>
                    {fb.upvotedBy.includes(getSecureItem("userId"))
                      ? "✅ Liked"
                      : "⬆ Like"}
                  </button>
                </td>
                 <td>
                  <button
                      onClick={() => navigate(`/feedback/${fb._id}`)}
                      style={{
                        backgroundImage: "linear-gradient(90deg, #2563eb, #1d4ed8)",
                        color: "#fff",
                        border: "none",
                                            padding: "6px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600
                      }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
          ◀ Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
          Next ▶
        </button>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>❌</button>
            <h2>Submit New Feedback</h2>
            <form onSubmit={handleSubmit} className="feedback-form">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={newFeedback.title}
                onChange={handleChange}
                required
              />
              <select
                name="category"
                value={newFeedback.category}
                onChange={handleChange}
              >
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="UI">UI</option>
              </select>
              <textarea
                name="description"
                placeholder="Description"
                value={newFeedback.description}
                onChange={handleChange}
                required
              />
              <button type="submit">Submit Feedback</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
