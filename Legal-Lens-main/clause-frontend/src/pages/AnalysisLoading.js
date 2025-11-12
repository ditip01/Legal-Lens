import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AnalysisLoading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing your document...");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/upload-status/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.upload) {
          setFileName(data.upload.fileName || "your file");

          // ✅ When analysisResult appears in DB → redirect to results
          if (data.upload.analysisResult && data.upload.analysisResult.overallRisk) {
            navigate(`/analysis/${id}`);
          } else {
            setStatus("🧠 AI is analyzing your document...");
          }
        } else {
          setStatus("⚠️ Unable to check analysis status.");
        }
      } catch {
        setStatus("❌ Server connection lost.");
      }
    };

    const interval = setInterval(fetchStatus, 3000); // check every 3s
    return () => clearInterval(interval);
  }, [id, navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        background: "#f8fbff",
      }}
    >
      {/* ✅ Inject the animation globally */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* ✅ Spinner element */}
      <div
        style={{
          border: "6px solid rgba(32,119,255,0.2)",
          borderTop: "6px solid #2077ff",
          borderRadius: "50%",
          width: "80px",
          height: "80px",
          animation: "spin 1s linear infinite", // ✅ will now rotate smoothly
          marginBottom: "30px",
          boxShadow: "0 0 15px rgba(32,119,255,0.2)",
        }}
      ></div>

      <h2 style={{ color: "#003366" }}>{status}</h2>

      {fileName && (
        <p style={{ color: "#555", marginTop: "10px" }}>
          📄 File: <strong>{fileName}</strong>
        </p>
      )}
    </div>
  );
}
