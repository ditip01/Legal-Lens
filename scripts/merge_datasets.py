import os
import pandas as pd

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Paths
ACORD_PATH = os.path.join(BASE, "data", "processed", "cleaned_clauses.csv")
CUAD_PATH = os.path.join(BASE, "data", "processed", "cuad_clauses_mapped.csv")
INDIAN_PATH = os.path.join(BASE, "data", "external", "legal_contract_clauses.csv")
OUTPUT_PATH = os.path.join(BASE, "data", "processed", "final_merged_dataset.csv")

print("📂 Loading datasets...")

# --- Load ACORD dataset ---
acord = pd.read_csv(ACORD_PATH)
acord.columns = [c.strip().lower() for c in acord.columns]
if "rating" in acord.columns:
    acord["risk"] = acord["rating"].apply(
        lambda r: "Low" if r <= 2.5 else ("Medium" if r <= 3.5 else "High")
    )
acord = acord[["clause_text", "risk"]]

# --- Load CUAD dataset ---
cuad = pd.read_csv(CUAD_PATH)
cuad.columns = [c.strip().lower() for c in cuad.columns]
cuad = cuad[["clause_text", "risk"]]

# --- Load Indian dataset ---
if os.path.exists(INDIAN_PATH):
    indian = pd.read_csv(INDIAN_PATH)
    indian.columns = [c.strip().lower() for c in indian.columns]

    # Rename risk_level → risk for consistency
    if "risk_level" in indian.columns:
        indian.rename(columns={"risk_level": "risk"}, inplace=True)

    indian = indian[["clause_text", "risk"]].dropna()
    indian = indian[indian["clause_text"].str.len() > 15]

    print(f"✅ Loaded Indian dataset with {len(indian)} samples.")
else:
    print("⚠️ Indian dataset not found — skipping.")
    indian = pd.DataFrame(columns=["clause_text", "risk"])

# --- Merge all datasets ---
merged = pd.concat([acord, cuad, indian], ignore_index=True)

# --- Normalize risk labels (make consistent) ---
merged["risk"] = merged["risk"].astype(str).str.strip().str.capitalize()

# --- Remove duplicates if any ---
merged.drop_duplicates(subset=["clause_text"], inplace=True)

# --- Show stats ---
print(f"\n✅ Combined dataset size: {len(merged)}")
print("\n📊 Risk distribution after normalization:")
print(merged["risk"].value_counts())

# --- Save final dataset ---
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
merged.to_csv(OUTPUT_PATH, index=False)
print(f"\n💾 Final merged dataset saved to: {OUTPUT_PATH}")
