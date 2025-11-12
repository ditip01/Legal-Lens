import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../pages/AnalysisResults.css"; // ✅ make sure this path is correct

export default function AnalysisResults() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(true);

  // ✅ Determine upload ID
  const uploadId =
    paramId && paramId !== "undefined"
      ? paramId
      : location.state?.uploadId ||
        localStorage.getItem("lastUploadId") ||
        null;

  // ✅ Poll backend for analysis data
  useEffect(() => {
    console.log("🟡 useEffect triggered with uploadId:", uploadId);

    if (!uploadId) {
      setError("Invalid upload ID. Please re-upload your document.");
      setLoading(false);
      return;
    }

    localStorage.setItem("lastUploadId", uploadId);
    let intervalId;

    async function fetchData() {
      try {
        const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiBase}/api/upload-status/${uploadId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        console.log("📥 Analysis fetch response:", data);

        if (res.ok && data.analysisResult && Object.keys(data.analysisResult).length > 0) {
          setAnalysis(data.analysisResult);
          setLoading(false);
          setPolling(false);
          clearInterval(intervalId);
        } else if (res.status === 404) {
          setError("Upload not found. Please upload again.");
          setLoading(false);
          setPolling(false);
        } else {
          console.log("⏳ Analysis not ready yet, retrying...");
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Server error while fetching analysis result.");
        setLoading(false);
        setPolling(false);
      }
    }

    fetchData();
    intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [uploadId]);

  // ✅ PDF Download
  const handleDownload = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("LegalLens Contract Risk Analysis Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Document Type: ${analysis.documentType}`, 14, 35);
    doc.text(`Confidence: ${analysis.documentTypeConfidence}%`, 14, 42);
    doc.text(
      `Overall Risk: ${analysis.overallRisk} (${analysis.riskPercentage}%)`,
      14,
      49
    );

    const tableData = (analysis.clauses || []).map((c) => [
      c.Clause_No,
      c.Predicted_Risk,
      `${c.Confidence}%`,
      c.Clause_Text.slice(0, 100) + (c.Clause_Text.length > 100 ? "..." : ""),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["Clause No", "Predicted Risk", "Confidence", "Clause Text"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [32, 119, 255] },
    });

    doc.save(`LegalLens_Report_${analysis.documentType || "Document"}.pdf`);
  };

  // ✅ Loading UI
  if (loading)
    return (
      <div className="auth-container" style={{ textAlign: "center" }}>
        <p className="auth-message">
          {polling
            ? "⏳ Analyzing document... (This may take a few moments)"
            : "Loading analysis..."}
        </p>
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "5px solid #ccc",
            borderTop: "5px solid #2077ff",
            borderRadius: "50%",
            margin: "20px auto",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      </div>
    );

  // ✅ Error UI
  if (error)
    return (
      <div className="auth-container" style={{ textAlign: "center" }}>
        <p className="auth-message">❌ {error}</p>
        <button className="form-btn" onClick={() => navigate("/upload")} style={{ marginTop: "20px" }}>
          ⬅ Back to Upload
        </button>
      </div>
    );

  if (!analysis)
    return <p className="auth-message">⚠️ No analysis data found yet. Please try again.</p>;

  // ✅ Main UI
  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>📄 Results for {location.state?.fileName || "Uploaded Document"}</h2>
        <div className="analysis-info">
          <p><strong>Document Type:</strong> {analysis.documentType}</p>
          <p><strong>Confidence:</strong> {analysis.documentTypeConfidence}%</p>
          <p>
            <strong>Overall Risk:</strong>{" "}
            <span
              style={{
                color:
                  analysis.overallRisk === "High"
                    ? "#d11a2a"
                    : analysis.overallRisk === "Medium"
                    ? "#e6b800"
                    : "#2ca02c",
              }}
            >
              {analysis.overallRisk} ({analysis.riskPercentage}%)
            </span>
          </p>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="clauses-table-container">
          <table className="clauses-table">
            <thead>
              <tr>
                <th>Clause No</th>
                <th>Predicted Risk</th>
                <th>Confidence</th>
                <th>Clause Text</th>
              </tr>
            </thead>
            <tbody>
              {(analysis.clauses || []).map((clause, index) => (
                <tr key={index}>
                  <td>{clause.Clause_No}</td>
                  <td>{clause.Predicted_Risk}</td>
                  <td>{clause.Confidence}%</td>
                  <td>{clause.Clause_Text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="buttons-row">
        <button className="download-btn" onClick={handleDownload}>
          📥 Download Report (PDF)
        </button>
        <button className="back-btn" onClick={() => navigate("/user-home")}>
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
}
