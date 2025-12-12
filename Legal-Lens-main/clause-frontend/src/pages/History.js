import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function History() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true);
      setMessage("");
      try {
        const token = localStorage.getItem("token");
        if (!token) return setMessage("🔒 Not authenticated. Please log in.");

        // Build a resilient API base URL:
        // - If REACT_APP_API_URL is a valid absolute URL, use it.
        // - If it starts with ':' (like ":5000"), treat it as localhost:port.
        // - Fallback to http://localhost:5000 for local dev when unset.
        const rawBase = process.env.REACT_APP_API_URL;
        let apiBase = "";
        if (rawBase && rawBase.startsWith("http")) apiBase = rawBase;
        else if (rawBase && rawBase.startsWith(":")) apiBase = `http://localhost${rawBase}`;
        else apiBase = rawBase || "http://localhost:5000";

        const url = `${apiBase.replace(/\/$/, "")}/api/upload-status`;
        console.debug("Fetching uploads from:", url);

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          setMessage("🔒 Session expired. Please log in again.");
          setTimeout(() => (window.location.href = "/login"), 1000);
          return;
        }

        // Guard: ensure response is JSON before parsing (avoids HTML parse errors)
        const contentType = res.headers.get("content-type") || "";
        let data = null;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error("Unexpected non-JSON response from upload-status:", text);
          throw new Error("Non-JSON response received from server");
        }
        if (!res.ok) throw new Error(data.error || "Failed to fetch uploads");

        setUploads(data);
      } catch (err) {
        console.error("Error fetching uploads:", err);
        setMessage("❌ Could not load uploads. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Upload History</h2>
      <p style={{ color: "#666", marginTop: "8px" }}>
        {user?.name ? `Showing uploads for ${user.name}` : "Your upload history"}
      </p>

      {loading ? (
        <p style={{ marginTop: 20 }}>Loading...</p>
      ) : message ? (
        <p style={{ marginTop: 20, color: "#b33" }}>{message}</p>
      ) : uploads.length === 0 ? (
        <p style={{ marginTop: 20, color: "#666" }}>No uploads yet.</p>
      ) : (
        <div style={{ marginTop: 20 }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {uploads.map((u) => (
              <li
                key={u.uploadId}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #eee",
                  borderRadius: 8,
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{u.fileName}</strong>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    {new Date(u.uploadedAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ marginBottom: 6 }}>
                    {u.analysisResult ? (
                      <>
                        <span style={{ fontWeight: 700 }}>{u.analysisResult.overallRisk}</span>
                        <span style={{ marginLeft: 8, color: "#666" }}>
                          ({u.analysisResult.riskPercentage}% risk)
                        </span>
                      </>
                    ) : (
                      <span style={{ color: "#888" }}>Pending analysis</span>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => navigate(`/analysis/${u.uploadId}`, { state: { uploadId: u.uploadId } })}
                      style={{
                        background: "#2077ff",
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "#2077ff",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
