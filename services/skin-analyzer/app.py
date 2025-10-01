import io
import os
import warnings
warnings.filterwarnings('ignore')

from typing import Optional, Dict, Any, List
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import cv2

from medical_analyzer import MedicalSkinAnalyzer
from advanced_skin_analyzer import AdvancedSkinAnalyzer

app = FastAPI(title="Medical-Grade Skin Analyzer", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize advanced medical-grade analyzer
analyzer = AdvancedSkinAnalyzer()


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0", "type": "medical-grade"}

@app.get("/test")
def test():
    return {"message": "Python service is working!", "analyzer": "MedicalSkinAnalyzer"}


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    age: Optional[int] = Form(None),
    location: Optional[str] = Form(""),
    symptoms: Optional[str] = Form(""),
    history: Optional[str] = Form(""),
):
    try:
        # Read and process image
        content = await file.read()
        img = Image.open(io.BytesIO(content))
        bgr_image = np.array(img.convert("RGB"))
        bgr_image = cv2.cvtColor(bgr_image, cv2.COLOR_RGB2BGR)
        
        # Perform comprehensive medical-grade analysis
        results = analyzer.analyze_skin_comprehensive(bgr_image, age, symptoms, history)
        
        return JSONResponse(results)
        
    except Exception as e:
        return JSONResponse({
            "error": f"Analysis failed: {str(e)}",
            "disclaimer": "This analysis is not a substitute for professional medical advice."
        }, status_code=400)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("PORT", "8000")))



