import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleRemoveFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setMessage("");
  };

  // ✅ Main Upload Function
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("⚠️ Please select a file to upload!");
      return;
    }

    setUploading(true);
    setMessage("🔍 Uploading and analyzing your document...");

    try {
      const token = localStorage.getItem("token");
      const apiBase = "http://localhost:5000";
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiBase}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log("📦 Backend raw response:", data);

      if (!res.ok) throw new Error(data.error || "Upload failed");

      // ✅ Verify and Navigate
      if (data && data.uploadId) {
        console.log("✅ Navigating to:", `/analysis/${data.uploadId}`);

        // Save for fallback
        localStorage.setItem("lastUploadId", data.uploadId);

        setMessage("✅ File uploaded successfully! Redirecting...");
        setTimeout(() => {
          navigate(`/analysis/${data.uploadId}`, {
            state: { fileName: file.name, uploadId: data.uploadId },
          });
        }, 1000);
      } else {
        console.error("❌ Missing uploadId in response:", data);
        setMessage("⚠️ Upload succeeded, but no upload ID returned.");
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      setMessage("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      {/* Profile Dropdown */}
      <div style={{ position: "absolute", top: "20px", right: "40px" }}>
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: "linear-gradient(90deg, #2077ff, #0054c2)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            borderRadius: "40px",
            boxShadow: "0 4px 12px rgba(32, 119, 255, 0.25)",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              color: "#0054c2",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "U"}
          </div>
          <span style={{ fontWeight: 600 }}>{user?.name || "User"}</span>
        </div>

        {showDropdown && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "60px",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
              width: "200px",
              zIndex: 10,
            }}
          >
            <button
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.95rem",
                color: "#0054c2",
              }}
              onClick={() => alert("📜 Upload History coming soon!")}
            >
              📜 Upload History
            </button>
            <button
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.95rem",
                color: "#d11a2a",
              }}
              onClick={logoutUser}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="auth-container" style={{ marginTop: "120px", width: "420px" }}>
        <h2>Upload a PDF Document</h2>

        <form onSubmit={handleUpload}>
          <label
            htmlFor="file-upload"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "160px",
              border: "2px dashed #2077ff",
              borderRadius: "12px",
              backgroundColor: "#f0f6ff",
              cursor: "pointer",
              marginBottom: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {!file ? (
              <>
                <span style={{ fontSize: "3rem", color: "#2077ff" }}>+</span>
                <p style={{ color: "#003366", fontWeight: "600" }}>
                  Click or Drop PDF here
                </p>
              </>
            ) : (
              <>
                <span style={{ color: "#003366", fontWeight: "600" }}>
                  {file.name}
                </span>
                <div
                  onClick={handleRemoveFile}
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    width: "22px",
                    height: "22px",
                    backgroundColor: "#e7f0ff",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2077ff",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  ✕
                </div>
              </>
            )}
            <input
              id="file-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{
                position: "absolute",
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
                zIndex: 1,
              }}
            />
          </label>

          <button type="submit" className="form-btn" disabled={uploading}>
            {uploading ? "Analyzing..." : "Upload"}
          </button>
        </form>

        {message && (
          <p className="auth-message" style={{ marginTop: "10px" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
