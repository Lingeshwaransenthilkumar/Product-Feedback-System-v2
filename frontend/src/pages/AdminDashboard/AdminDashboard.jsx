import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSecureItem } from "../../utils/secureStorage";
import "./AdminDashboard.css";


// chartjs components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
const API_URL = process.env.REACT_APP_API_URL;

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const role = getSecureItem("role");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest"); // "latest" or "oldest"


  useEffect(() => {
    if (role !== "admin") {
      navigate("/");
    }
  }, [role, navigate]);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/feedbacks`);
      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
      setFeedbacks([]);
    }
  };

  const fetchUsersCount = async () => {
    try {
      let res = await fetch(`${API_URL}/users/count`);
      if (res.ok) {
        const json = await res.json();
        setUsersCount(typeof json.count === "number" ? json.count : 0);
        return;
      }
    } catch (e) {
      console.error("Error fetching user count:", e);
    }
    setUsersCount(0);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchFeedbacks(), fetchUsersCount()]);
      setLoading(false);
    })();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/feedbacks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      const updated = data.feedback || data;
      setFeedbacks((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status");
    }
  };

  // Helpers for date parsing & formatting 
  const formatKey = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseDateKey = (raw) => {
    if (!raw) return null;
    const d = new Date(raw);
    if (!isNaN(d)) return formatKey(d);

    // try numeric epoch string
    const n = Number(raw);
    if (!isNaN(n)) {
      const d2 = new Date(n);
      if (!isNaN(d2)) return formatKey(d2);
    }

    return null;
  };

  // metrics & charts data 
  const totalFeedbacks = feedbacks.length;
  const totalUpvotes = feedbacks.reduce((s, f) => s + (f.upvotes || 0), 0);

  const statusLabels = ["Open", "Planned", "In Progress", "Done"];
  const statusCounts = statusLabels.map((s) => feedbacks.filter((f) => f.status === s).length);

  const categoryLabels = ["Feature", "Bug", "UI"];
  const categoryCounts = categoryLabels.map((c) => feedbacks.filter((f) => f.category === c).length);

  // Line chart
  const getLineData = (days = 14) => {
    const now = new Date();
    const buckets = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      buckets.push({ key: formatKey(d), count: 0 });
    }

    let anyParsed = false;
    feedbacks.forEach((f) => {
      const key = parseDateKey(f.createdAt || f.updatedAt);
      if (!key) return;
      anyParsed = true;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.count += 1;
    });

    if (!anyParsed || buckets.every((b) => b.count === 0)) {
      const keys = feedbacks
        .map((f) => parseDateKey(f.createdAt || f.updatedAt))
        .filter(Boolean)
        .sort();

      if (keys.length > 0) {
        const grouped = {};
        keys.forEach((k) => (grouped[k] = (grouped[k] || 0) + 1));
        const unique = Object.keys(grouped).slice(-days);
        return {
          labels: unique,
          datasets: [
            {
              label: "Feedbacks",
              data: unique.map((u) => grouped[u] || 0),
              fill: false,
              tension: 0.3,
              borderColor: "#3b82f6",
              backgroundColor: "#3b82f6",
            },
          ],
        };
      }

      return {
        labels: ["No date data"],
        datasets: [
          {
            label: "Feedbacks",
            data: [0],
            fill: false,
            tension: 0.3,
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f6",
          },
        ],
      };
    }

    return {
      labels: buckets.map((b) => b.key),
      datasets: [
        {
          label: "New feedbacks (last " + days + " days)",
          data: buckets.map((b) => b.count),
          fill: false,
          tension: 0.3,
          borderColor: "#3b82f6",
          backgroundColor: "#3b82f6",
        },
      ],
    };
  };

    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
      plugins: { legend: { display: false } },
    };

    const pieData = {
      labels: statusLabels,
      datasets: [
        {
          data: statusCounts,
          backgroundColor: ["#f97373", "#fb923c", "#60a5fa", "#34d399"],
          hoverOffset: 6,
        },
      ],
    };

    const barData = {
      labels: categoryLabels,
      datasets: [
        {
          label: "Feedback count",
              data: categoryCounts,
          backgroundColor: ["#6366f1", "#ef476f", "#06b6d4"],
        },
      ],
    };

  if (loading) {
    return <div className="admin-wrap"><p>Loading admin dashboard…</p></div>;
  }
  const filteredFeedbacks = feedbacks
  .filter(fb => fb.title.toLowerCase().includes(search.toLowerCase()))
  .filter(fb => filterCategory === "All" ? true : fb.category === filterCategory)
  .sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt);
    const dateB = new Date(b.createdAt || b.updatedAt);
    return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
  });
  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div className="admin-title">
          <h1>Admin Dashboard</h1>
          <p className="sub">Overview & moderation</p>
        </div>
        <div className="admin-actions">
          <div className="greeting">👋 Hi, {getSecureItem("userName") || "Admin"}</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="metrics">
        <div className="metric-card">
          <div className="metric-circle">{Number(usersCount) || 0}</div>
          <div className="metric-title">Total Users</div>
        </div>

        <div className="metric-card">
          <div className="metric-circle">{totalFeedbacks}</div>
          <div className="metric-title">Total Feedbacks</div>
        </div>

        <div className="metric-card">
          <div className="metric-circle">{totalUpvotes}</div>
          <div className="metric-title">Total Upvotes</div>
        </div>
      </section>

      <section className="charts">
      <div className="chart-card pie">
        <h3>Status Distribution</h3>
        <div className="chart-container pie">
          <Pie data={pieData} />
        </div>
      </div>

      <div className="chart-card">
         <h3>Category Breakdown</h3>
        <div className="chart-container">
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="chart-card wide" style={{ height: 320 }}>
        <h3>Feedbacks Over Time</h3>
        <div className="chart-container" style={{ height: 240 }}>
          <Line data={getLineData(14)} options={lineOptions} />
        </div>
      </div>
    </section>
      <section className="table-wrap">
        <div className="table-controls">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Feature">Feature</option>
          <option value="Bug">Bug</option>
          <option value="UI">UI</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

        <h2 className="section-title">All Feedbacks</h2>
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Upvotes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((fb) => (
                <tr key={fb._id}>
                  <td className="title-cell" title={fb.title}>{fb.title}</td>
                  <td data-label="Category">{fb.category}</td>
                  <td data-label="Status">
                    <select
                      value={fb.status}
                      onChange={(e) => handleStatusChange(fb._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Open">Open</option>
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                  <td data-label="Upvotes">{fb.upvotes || 0}</td>
                  <td data-label="Action">
                    <button className="view-btn" onClick={() => navigate(`/feedback/${fb._id}`)}>View</button>
                  </td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No feedbacks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
