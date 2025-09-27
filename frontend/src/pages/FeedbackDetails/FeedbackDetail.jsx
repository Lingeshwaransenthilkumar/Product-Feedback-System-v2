import { useEffect, useState } from "react";
import { useParams,Link} from "react-router-dom";
import "./FeedbackDetails.css";
import { getSecureItem } from "../../utils/secureStorage";
const API_URL = process.env.REACT_APP_API_URL;

export default function FeedbackDetails() {
  const { id } = useParams(); // feedback id from URL
  const [feedback, setFeedback] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const storedName = getSecureItem("userName") || "Anonymous";

  // Fetch feedback details
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`${API_URL}/feedbacks/${id}`);
        const data = await res.json();
        setFeedback(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeedback();
  }, [id]);

    // Add a new comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(
        `${API_URL}/feedbacks/${id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: storedName, text: commentText }), // ✅ use storedName
        }
      );
      const data = await res.json();
      setFeedback(data);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  // Add a reply
  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(
        `${API_URL}/feedbacks/${id}/comment/${commentId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: storedName, text: replyText }), // ✅ use storedName
        }
      );
      const data = await res.json();
      setFeedback(data);
      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const role = getSecureItem("role");
  if (!feedback) return <p>Loading...</p>;

  return (

    <div className="feedback-details-container">
      {/* breadcrumbs */}
    <nav className="breadcrumbs">
      {role === "admin" ? (
        <>
          <Link to="/admin">Home</Link> &gt;{" "}
          <Link to="/admin">Feedbacks</Link> &gt;{" "}
          <span>{feedback.title}</span>
        </>
      ) : (
        <>
          <Link to="/home">Home</Link> &gt;{" "}
          <Link to="/home">Feedbacks</Link> &gt;{" "}
          <span>{feedback.title}</span>
        </>
      )}
    </nav>

      <h1 className="feedback-title">{feedback.title}</h1>
      <p className="feedback-desc">{feedback.description}</p>
      <p className="feedback-meta">
        Category: {feedback.category} | Status: {feedback.status} | Upvotes: {feedback.upvotes}
      </p>

      <h2 className="comments-title">Comments</h2>

      {(!feedback.comments || feedback.comments.length === 0) && (
        <p>No comments yet. Be the first!</p>
      )}

      {feedback.comments?.map((comment) => (
        <div key={comment._id || Math.random()} className="comment-card">
          <p className="comment-user">{comment.userName || "Anonymous"}</p>
          <p className="comment-text">{comment.text}</p>
          <button className="reply-btn" onClick={() => setReplyingTo(comment._id)}>
            Reply
          </button>

          {comment.replies?.length > 0 && (
            <div className="replies-container">
              {comment.replies.map((reply) => (
                <div key={reply._id || Math.random()} className="reply-card">
                  <p className="reply-user">{reply.userName || "Anonymous"}</p>
                  <p className="reply-text">{reply.text}</p>
                </div>
              ))}
            </div>
          )}

          {replyingTo === comment._id && (
            <div className="reply-form">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
              />
              <button onClick={() => handleReply(comment._id)}>Send</button>
            </div>
          )}
        </div>
      ))}

      <div className="add-comment-form">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={handleAddComment}>Post</button>
      </div>
    </div>
  );
}
