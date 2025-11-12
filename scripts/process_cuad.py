import os
import pandas as pd

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CUAD_PATH = os.path.join(BASE, "data", "external", "master_clauses.csv")
OUTPUT_PATH = os.path.join(BASE, "data", "processed", "cuad_clauses_mapped.csv")

print("📂 Loading CUAD master clauses...")
df = pd.read_csv(CUAD_PATH)

# Get all clause columns that end with "-Answer"
clause_cols = [c for c in df.columns if c.endswith("-Answer")]

records = []
for _, row in df.iterrows():
    for col in clause_cols:
        clause_type = col.replace("-Answer", "")
        text = str(row[col]).strip()
        if text and text.lower() not in ["[]", "nan", "no", "none", ""]:
            records.append({
                "clause_text": text,
                "clause_type": clause_type
            })

cuad_long = pd.DataFrame(records)
print(f"✅ Extracted {len(cuad_long)} clause samples.")

# --- Risk mapping for clause types ---
risk_map = {
    # High-risk clauses
    "Indemnification": "High",
    "Uncapped Liability": "High",
    "Cap On Liability": "High",
    "Insurance": "High",
    "Liquidated Damages": "High",
    "Termination For Convenience": "High",
    "Change Of Control": "High",
    "Anti-Assignment": "High",

    # Medium-risk clauses
    "Non-Compete": "Medium",
    "Exclusivity": "Medium",
    "No-Solicit Of Customers": "Medium",
    "No-Solicit Of Employees": "Medium",
    "Audit Rights": "Medium",
    "Rofr/Rofo/Rofn": "Medium",
    "Post-Termination Services": "Medium",
    "Source Code Escrow": "Medium",

    # Low-risk clauses
    "Confidentiality": "Low",
    "Governing Law": "Low",
    "Warranty Duration": "Low",
    "License Grant": "Low",
    "Affiliate License-Licensor": "Low",
    "Affiliate License-Licensee": "Low",
    "Third Party Beneficiary": "Low",
    "Covenant Not To Sue": "Low",
}

cuad_long["risk"] = cuad_long["clause_type"].map(risk_map).fillna("Low")

# Save processed dataset
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
cuad_long.to_csv(OUTPUT_PATH, index=False)

print(f"💾 Saved processed CUAD clauses to: {OUTPUT_PATH}")
print(cuad_long["risk"].value_counts())
