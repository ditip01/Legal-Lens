import os
import re
import sys
import json
import torch
import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification

# ---------------------------
# CONFIGURATION
# ---------------------------
MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "models", "legalbert_final_model")
)
device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
model = BertForSequenceClassification.from_pretrained(MODEL_PATH).to(device)
model.eval()


# ---------------------------
# CLEANING HELPER
# ---------------------------
def clean_text(text):
    """Cleans extracted PDF text by removing artifacts, encoding junk, and fixing spacing."""
    if not isinstance(text, str):
        return ""

    # Replace problematic encodings, ligatures, dashes, and quotes
    replacements = {
        "&": "",
        "\xa0": " ",  # non-breaking space
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\ufb00": "ff",
        "\ufb03": "ffi",
        "\ufb04": "ffl",
        "\u2013": "-",  # en dash
        "\u2014": "-",  # em dash
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2022": "•",
    }

    for bad, good in replacements.items():
        text = text.replace(bad, good)

    # Remove repeated symbols (&, =, etc.)
    text = re.sub(r"[&=]{2,}", " ", text)

    # Remove control / non-ASCII characters
    text = re.sub(r"[^\x20-\x7E]+", " ", text)

    # Fix over-spaced words (e.g., "H e l l o" → "Hello")
    text = re.sub(r"(?<=\w)\s+(?=\w)", "", text)

    # Collapse multiple spaces/newlines
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ---------------------------
# DOCUMENT TYPE DETECTION
# ---------------------------
def detect_document_type(text):
    text_lower = text.lower()
    types = {
        "Non-Disclosure Agreement (NDA)": [
            "confidentiality",
            "non-disclosure",
            "recipient",
            "party",
        ],
        "Employment Agreement": [
            "employee",
            "employer",
            "salary",
            "benefits",
            "termination",
        ],
        "Lease Agreement": ["tenant", "landlord", "premises", "rent", "lease"],
        "Consulting Agreement": [
            "consultant",
            "contractor",
            "consulting services",
        ],
        "Service Agreement": [
            "service",
            "deliverables",
            "statement of work",
            "client",
        ],
        "License Agreement": [
            "license",
            "intellectual property",
            "software",
            "licensor",
            "licensee",
        ],
        "General Contract / Unknown Type": [],
    }

    scores = {k: sum(text_lower.count(word) for word in v) for k, v in types.items()}
    best = max(scores, key=scores.get)
    conf = scores[best] / (sum(scores.values()) + 1e-6)
    if conf < 0.1:
        best = "General Contract / Unknown Type"
        conf = 0.0
    return best, round(conf * 100, 1)


# ---------------------------
# CLAUSE SPLITTING
# ---------------------------
def split_into_clauses(text):
    text = re.sub(r"\s+", " ", text)
    # Split based on punctuation and newlines (sentences or clauses)
    clauses = re.split(r"(?<=[.;:])\s+|\n+", text)
    return [clean_text(c) for c in clauses if len(c.strip()) > 30]


# ---------------------------
# RISK PREDICTION
# ---------------------------
def predict_clause_risk(clause):
    inputs = tokenizer(
        clause,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=256,
    ).to(device)

    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=1)
        pred = torch.argmax(probs).item()
        conf = torch.max(probs).item()

    labels = {0: "Low", 1: "Medium", 2: "High"}
    return labels[pred], round(conf * 100, 1)


# ---------------------------
# MAIN ANALYSIS PIPELINE
# ---------------------------
def analyze_document(file_path):
    try:
        import PyPDF2

        text = ""
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for i, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text += clean_text(page_text) + " "
                except Exception as e:
                    print(f"⚠️ Error reading page {i}: {e}", file=sys.stderr)
                    continue

    except Exception as e:
        return {"error": f"Failed to read PDF: {str(e)}"}

    if not text.strip():
        return {"error": "Empty or unreadable PDF text."}

    # Clean again after merging all pages
    text = clean_text(text)

    # Step 1️⃣: Detect document type
    doc_type, doc_conf = detect_document_type(text)

    # Step 2️⃣: Split into clauses
    clauses = split_into_clauses(text)
    if not clauses:
        return {"error": "No valid clauses detected."}

    # Step 3️⃣: Predict risk for each clause
    results = []
    for i, clause in enumerate(clauses, 1):
        risk, conf = predict_clause_risk(clause)
        results.append(
            {
                "Clause_No": i,
                "Clause_Text": clean_text(clause[:500])
                + ("..." if len(clause) > 500 else ""),
                "Predicted_Risk": risk,
                "Confidence": conf,
            }
        )

    df = pd.DataFrame(results)

    # Step 4️⃣: Compute overall document risk
    risk_map = {"Low": 1, "Medium": 2, "High": 3}
    df["Risk_Score"] = df["Predicted_Risk"].map(risk_map)
    avg_score = df["Risk_Score"].mean()

    risk_percentage = round(((avg_score - 1) / 2) * 100, 1)
    overall_risk = "Low" if avg_score < 1.7 else "Medium" if avg_score < 2.3 else "High"

    # ✅ Step 5️⃣: Return structured JSON for Node.js
    return {
        "documentType": doc_type,
        "documentTypeConfidence": doc_conf,
        "overallRisk": overall_risk,
        "riskPercentage": risk_percentage,
        "clauses": results,
    }


# ---------------------------
# ENTRY POINT
# ---------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    result = analyze_document(pdf_path)

    # ✅ Output only JSON (no weird chars)
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0)
