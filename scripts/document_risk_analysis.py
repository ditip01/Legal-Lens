# scripts/document_risk_analysis.py
"""
Analyze a full contract or NDA document using your trained Legal-BERT model.

Steps:
1. Split the document into clauses.
2. Predict each clause's risk using predict_risk.py.
3. Calculate overall document risk based on clause-level results.
"""

import os
import re
import sys
import pandas as pd

# --------------------------------------------------------------------
# Make sure we can import from scripts/
# --------------------------------------------------------------------
BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if os.path.join(BASE, "scripts") not in sys.path:
    sys.path.append(os.path.join(BASE, "scripts"))

from predict_risk import predict_clause_risk, predict_risk_batch

# --------------------------------------------------------------------
# Clause splitting
# --------------------------------------------------------------------
def split_into_clauses(text: str):
    """
    Split document text into clauses.
    Works for both numbered and paragraph-style contracts.
    """
    # Try splitting on numbered sections or uppercase headings
    parts = re.split(
        r"(?:\n\s*\d+(?:\.\d+)*\s*[.)-]?\s+)|(?:\n\s*[A-Z][A-Z0-9 \-_/]{3,}\n)",
        text
    )

    # Fallback: split by sentence boundaries if too few clauses detected
    if len([p for p in parts if p and len(p.strip()) > 0]) < 3:
        parts = re.split(r'(?<=[.;])\s+(?=[A-Z(])', text)

    clauses = [c.strip() for c in parts if c and len(c.strip()) > 20]
    return clauses


# --------------------------------------------------------------------
# Document analysis
# --------------------------------------------------------------------
def analyze_document(text: str):
    """
    Predict clause-level risks and overall document risk.
    Returns a DataFrame of clause risks and the overall risk category.
    """
    clauses = split_into_clauses(text)

    if not clauses:
        print("⚠️ No clauses detected in the document.")
        return pd.DataFrame(columns=["Clause No", "Clause", "Risk"]), "LOW"

    # Predict risks for all clauses at once
    risks = predict_risk_batch(clauses)

    rows = [{"Clause No": i + 1, "Clause": c, "Risk": r}
            for i, (c, r) in enumerate(zip(clauses, risks))]
    df = pd.DataFrame(rows)

    # Compute ratios for overall risk scoring
    counts = df["Risk"].value_counts()
    total = len(df)
    high_ratio = counts.get("High", 0) / total if total else 0
    med_ratio = counts.get("Medium", 0) / total if total else 0

    # Simple heuristic to decide overall document risk
    if high_ratio >= 0.4:
        overall = "HIGH"
    elif high_ratio >= 0.2 or med_ratio >= 0.35:
        overall = "MEDIUM"
    else:
        overall = "LOW"

    return df, overall


# --------------------------------------------------------------------
# Run test if executed directly
# --------------------------------------------------------------------
if __name__ == "__main__":
    sample_path = os.path.join(BASE, "sample_NDA.txt")

    if os.path.exists(sample_path):
        print(f"📄 Analyzing document: {sample_path}")
        with open(sample_path, "r", encoding="utf-8") as f:
            text = f.read()

        df, overall = analyze_document(text)
        print("\nClause-wise Risk Prediction:")
        print(df[["Clause No", "Risk"]])
        print(f"\n🧾 Overall Document Risk: {overall}")

        # Save results to CSV
        out_csv = os.path.join(BASE, "data", "processed", "sample_NDA_risk_report.csv")
        os.makedirs(os.path.dirname(out_csv), exist_ok=True)
        df.to_csv(out_csv, index=False)
        print(f"✅ Saved risk report to: {out_csv}")

    else:
        print("⚠️ sample_NDA.txt not found. Place a sample contract in the project root.")
