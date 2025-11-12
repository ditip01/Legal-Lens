from flask import Flask, request, jsonify
import fitz  # PyMuPDF for PDF reading
import io

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        file = request.data
        pdf = fitz.open(stream=io.BytesIO(file), filetype="pdf")
        text = ""
        for page in pdf:
            text += page.get_text()

        # --- Your ML model prediction here ---
        # result = model.predict([text])
        result = {
            "classification": "Exculpatory Clause",
            "risk_level": "High",
            "confidence": 0.92
        }

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
