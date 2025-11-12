import os
import pandas as pd

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
INDIAN_PATH = os.path.join(BASE, "data", "external", "legal_contract_clauses.csv")
MERGED_PATH = os.path.join(BASE, "data", "processed", "merged_dataset.csv")
FINAL_PATH = os.path.join(BASE, "data", "processed", "final_merged_dataset.csv")

print("📂 Loading datasets...")
indian = pd.read_csv(INDIAN_PATH)
merged = pd.read_csv(MERGED_PATH)

# --- Normalize column names ---
indian.columns = [c.strip().lower() for c in indian.columns]
merged.columns = [c.strip().lower() for c in merged.columns]

# --- Standardize column names ---
if "clause" in indian.columns:
    indian.rename(columns={"clause": "clause_text"}, inplace=True)
elif "text" in indian.columns:
    indian.rename(columns={"text": "clause_text"}, inplace=True)

if "risk_level" in indian.columns:
    indian.rename(columns={"risk_level": "risk"}, inplace=True)

# --- Filter valid rows ---
indian = indian[["clause_text", "risk"]].dropna()
indian = indian[indian["clause_text"].str.len() > 15]

# --- Merge with existing dataset ---
final = pd.concat([merged, indian], ignore_index=True)
print(f"✅ Combined dataset size: {len(final)}")

# --- Check distribution ---
print("\n📊 Risk distribution after adding Indian dataset:")
print(final["risk"].value_counts())

# --- Save final merged dataset ---
os.makedirs(os.path.dirname(FINAL_PATH), exist_ok=True)
final.to_csv(FINAL_PATH, index=False)
print(f"\n💾 Final merged dataset saved to: {FINAL_PATH}")
