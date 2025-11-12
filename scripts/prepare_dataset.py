# scripts/prepare_dataset.py
"""
Flatten ACORD 2–5-star Excel (demo) -> cleaned CSV for training.
Keeps only: clause_text, rating
"""

import os, re, json
import pandas as pd
from tqdm import tqdm

# --------- PATHS (relative to project root) ---------
BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CORPUS_PATH = os.path.join(BASE, "data", "raw", "ACORD", "corpus.jsonl")
EXCEL_PATH  = os.path.join(BASE, "data", "raw", "ACORD", "ACORD 2-5 Star Clause Pairs.xlsx")
OUTPUT_PATH = os.path.join(BASE, "data", "processed", "cleaned_clauses.csv")

def clean_text(text: str) -> str:
    if pd.isna(text): 
        return ""
    text = str(text)
    text = re.sub(r"\s+", " ", text.replace("\u00a0", " ")).strip()
    # keep common punctuation that appears in contracts
    text = re.sub(r"[^\w\s.,;:%$()\-/']", "", text)
    return text

def load_corpus(path):
    # not strictly needed for the demo excel, but we keep it for future use
    if not os.path.exists(path):
        print(f"⚠️ corpus.jsonl not found at {path} (skipping)")
        return {}
    clauses = {}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            obj = json.loads(line)
            clauses[obj.get("_id")] = obj.get("text", "")
    print(f"✅ Loaded {len(clauses)} clauses from corpus.")
    return clauses

def load_and_flatten_excel(path):
    print("📘 Loading Excel (2–5 star pairs) ...")
    df = pd.read_excel(path, engine="openpyxl")

    # text columns = anything that's NOT a Rating* column
    rating_cols = [c for c in df.columns if c.lower().startswith("rating")]
    text_cols   = [c for c in df.columns if c not in rating_cols]

    # pair them in order (Excel is arranged as alternating text/Rating.*)
    pairs = []
    for i in range(min(len(text_cols), len(rating_cols))):
        tcol, rcol = text_cols[i], rating_cols[i]
        tmp = df[[tcol, rcol]].dropna()
        tmp.columns = ["clause_text", "rating"]
        pairs.append(tmp)

    if not pairs:
        raise RuntimeError("Could not find matched text/rating columns in the Excel file.")

    flat = pd.concat(pairs, ignore_index=True)
    print(f"✅ Flattened {len(flat)} text–rating pairs.")
    return flat

def preprocess_and_save(df, out_path):
    tqdm.pandas()
    df["clause_text"] = df["clause_text"].progress_apply(clean_text)
    # keep rows with non-empty text and numeric rating in [2,5]
    df = df[df["clause_text"].str.len() > 20].copy()
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce")
    df = df[df["rating"].between(2, 5)]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    df[["clause_text", "rating"]].to_csv(out_path, index=False)
    print(f"💾 Saved: {out_path} | rows={len(df)}")

if __name__ == "__main__":
    _ = load_corpus(CORPUS_PATH)  # loaded for future, not used in demo Excel
    flat = load_and_flatten_excel(EXCEL_PATH)
    preprocess_and_save(flat, OUTPUT_PATH)
    print("🎯 Clean dataset ready.")
