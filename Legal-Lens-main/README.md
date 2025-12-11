# LegalLens

LegalLens is a small-suite for clause-level risk analysis of contracts using a fine-tuned Legal-BERT model

This repository contains:

- A Node.js backend (`server`) that exposes endpoints for file upload and result storage.
- A React frontend (`clause-frontend`) for uploading contracts and viewing clause-level risk reports.
- Python scripts and model code under `scripts/` and `models/` used to prepare data, train a Legal-BERT classifier, and run predictions.

## Quick start (developer)

1. Clone the repo and open the project folder.
2. Install Node dependencies and start backend + frontend (see detailed steps below).
3. Create a Python virtual environment and install Python dependencies (see below).

## Where things live

- `clause-frontend/` — React app (run `npm install` and `npm start` here)
- `server/` — Node/Express backend (run `npm install` and `npm run dev` here)
- `ml-service/` — small Flask ML demo service
- `models/` — model weights and training script (`legalbert_clause_classifier.py`)
- `scripts/` — data preparation, prediction and analysis helpers

## Dependencies

The project uses both Node (frontend/backend) and Python (modeling & scripts). The high-level dependency groups are listed below, and step-by-step install commands follow.

Node (run per-folder):

- Frontend (`clause-frontend/package.json`) dependencies include: react, react-dom, react-router-dom, axios, jspdf, jspdf-autotable, lucide-react, web-vitals, mongodb (client)
- Backend (`server/package.json`) dependencies include: express, mongoose, cors, dotenv, jsonwebtoken, bcryptjs, multer, axios

Python (core packages used by scripts and models):

- pandas
- numpy
- tqdm
- openpyxl (used for reading Excel)
- PyPDF2 (PDF extraction)
- PyMuPDF (imported as `fitz` in the ml-service)
- Flask (for `ml-service/app.py`)
- torch (PyTorch) — used to run the model (install per your CUDA/CPU configuration)
- transformers (Hugging Face Transformers)
- datasets (Hugging Face Datasets)
- scikit-learn
- matplotlib

Note: some tokenizer/model combos may also require `sentencepiece` or `tokenizers` depending on which pretrained models you use.

### Installing Node dependencies

Open PowerShell in the repository root and run:

```powershell
cd .\Legal-Lens-main\clause-frontend
npm install

# in a new terminal (or after the previous finishes)
cd ..\server
npm install
```

Then run the backend and frontend in their respective folders using `npm run dev` (server) and `npm start` (frontend).

### Installing Python dependencies

From the `Legal-Lens-main` folder create and activate a virtual environment (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the Python packages listed in `requirements.txt`:

```powershell
pip install -r requirements.txt
```

Installing PyTorch (torch):

PyTorch is large and platform/CUDA specific. Please follow the official guide to get the correct command for your system: https://pytorch.org/get-started/locally/

Example CPU-only install (may change over time):

```powershell
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

Or use the site to get a CUDA-enabled wheel if you have an NVIDIA GPU.

## After install

- Prepare data: use scripts in `scripts/` (for example `python scripts/prepare_dataset.py`).
- Train (if you want): `python models/legalbert_clause_classifier.py` (requires GPU/memory for reasonable speed).
- Run the prediction script for a PDF: `python scripts/predict_risk.py path/to/file.pdf` (this will load the model from `models/legalbert_final_model`)

## Dependencies (copy/paste) — what to install after cloning/pulling

1) Node: run `npm install` inside both `clause-frontend` and `server` directories.

2) Python: from `Legal-Lens-main` activate a venv and run:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Then install torch separately following https://pytorch.org/get-started/locally/
```

If you prefer a one-line pip install for the packages we commonly use (excluding torch):

```powershell
pip install pandas numpy tqdm openpyxl PyPDF2 PyMuPDF Flask transformers datasets scikit-learn matplotlib
```

---

If you'd like, I can also:

- Add a top-level `requirements-dev.txt` including exact pinned versions.
- Create simple startup scripts (PowerShell/Bash) that set up venv, install dependencies, and run both server & frontend for development.

## License / Acknowledgements

See project files for model artifacts and licenses for pretrained models used (e.g., Legal-BERT via Hugging Face).
