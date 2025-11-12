import mongoose from "mongoose";

// 🔹 Each clause entry inside the "clauses" array
const clauseSchema = new mongoose.Schema(
  {
    Clause_No: { type: Number, required: true },
    Clause_Text: { type: String, required: true },
    Predicted_Risk: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    Confidence: { type: Number, required: true }, // Confidence in percentage
  },
  { _id: false }
);

// 🔹 The main analysis result object
const analysisSchema = new mongoose.Schema(
  {
    documentType: { type: String, required: true },
    documentTypeConfidence: { type: Number, required: true }, // % confidence for document type
    overallRisk: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    riskPercentage: { type: Number, required: true }, // document-level % risk
    clauses: { type: [clauseSchema], default: [] }, // array of clause results
  },
  { _id: false }
);

// 🔹 Upload document structure in MongoDB
const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  analysisResult: { type: analysisSchema, default: null }, // full risk report
  uploadedAt: { type: Date, default: Date.now },
});

const Upload = mongoose.model("Upload", uploadSchema);

export default Upload;
