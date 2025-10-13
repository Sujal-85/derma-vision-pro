import io
import os
import warnings
warnings.filterwarnings('ignore')

from typing import Optional, Dict, Any, List
import csv
import json
import re
from functools import lru_cache
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import cv2

from medical_analyzer import MedicalSkinAnalyzer
from advanced_skin_analyzer import AdvancedSkinAnalyzer
import requests
from bs4 import BeautifulSoup

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

# Paths and caches
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CSV_PATH = os.path.join(PROJECT_ROOT, 'src', 'assets', 'skincare_products_clean.csv')
_IMAGE_URL_CACHE: Dict[str, str] = {}


def _parse_price(price_str: str) -> float:
    try:
        # Remove currency symbols and commas
        cleaned = re.sub(r"[^0-9.]+", "", price_str)
        return float(cleaned) if cleaned else 0.0
    except Exception:
        return 0.0


def _parse_ingredients(ingred_str: str) -> List[str]:
    # The CSV stores a python-list-like string; normalize to a list of lowercase tokens
    try:
        # Try json.loads after converting single quotes to double quotes
        s = ingred_str.strip()
        if s.startswith("[") and s.endswith("]"):
            s_json = s.replace("'", '"')
            items = json.loads(s_json)
            return [str(x).strip().lower() for x in items]
        # Fallback: split by comma
        return [p.strip().lower() for p in re.split(r",\s*", ingred_str)]
    except Exception:
        return []


@lru_cache(maxsize=1)
def _load_products_from_csv() -> List[Dict[str, Any]]:
    products: List[Dict[str, Any]] = []
    if not os.path.exists(CSV_PATH):
        return products
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('product_name') or ''
            url = row.get('product_url') or ''
            ptype = row.get('product_type') or ''
            ingreds = _parse_ingredients(row.get('clean_ingreds') or '')
            price_raw = row.get('price') or '0'
            products.append({
                'product_name': name,
                'product_url': url,
                'product_type': ptype,
                'ingredients': ingreds,
                'price_raw': price_raw,
                'price': _parse_price(price_raw),
            })
    return products


def _fetch_image_url(page_url: str) -> Optional[str]:
    if not page_url:
        return None
    if page_url in _IMAGE_URL_CACHE:
        return _IMAGE_URL_CACHE[page_url]
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
        }
        r = requests.get(page_url, headers=headers, timeout=8)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        # Prefer OpenGraph image
        og = soup.find('meta', attrs={'property': 'og:image'})
        if og and og.get('content'):
            _IMAGE_URL_CACHE[page_url] = og['content']
            return og['content']
        # Fallback: first large product image
        img = soup.find('img', attrs={'src': True})
        if img:
            _IMAGE_URL_CACHE[page_url] = img['src']
            return img['src']
    except Exception:
        return None
    return None


def _score_product(p: Dict[str, Any], metrics: Dict[str, float], concerns: List[Dict[str, Any]]) -> Dict[str, Any]:
    score = 0.0
    reasons: List[str] = []
    ingreds = set(p.get('ingredients', []))
    ptype = (p.get('product_type') or '').lower()

    # Helper for ingredient match
    def has(*tokens):
        return any(t.lower() in ingreds for t in tokens)

    # Hydration
    hydration = metrics.get('hydration', 0)
    if hydration < 60 or any(c.get('type', '').lower() in ['dehydrated skin', 'dryness'] for c in concerns):
        if ptype in ['moisturiser', 'moisturizer', 'cream', 'gel']:
            score += 15; reasons.append('Good for hydration (moisturiser)')
        if has('sodium hyaluronate', 'hyaluronic acid', 'glycerin', 'ceramide', 'ceramide np', 'ceramide ap', 'squalene', 'panthenol', 'aloe'):
            score += 20; reasons.append('Hydrating ingredients')

    # Texture / pores
    texture = metrics.get('texture', 100)
    if texture < 60 or any(c.get('type', '').lower() in ['uneven skin texture'] for c in concerns):
        if has('niacinamide', 'salicylic acid', 'bha', 'lactic acid', 'aha'):
            score += 15; reasons.append('Texture-smoothing actives')

    # Pigmentation
    if any('hyperpigmentation' in c.get('type', '').lower() for c in concerns):
        if has('vitamin c', 'ascorbic', 'alpha arbutin', 'niacinamide', 'azelaic acid'):
            score += 20; reasons.append('Hyperpigmentation actives')

    # Redness / inflammation
    if any('inflammation' in c.get('type', '').lower() or 'redness' in c.get('type', '').lower() for c in concerns):
        if has('niacinamide', 'ceramide', 'colloidal oatmeal', 'aloe', 'bisabolol'):
            score += 15; reasons.append('Soothing ingredients')
        if has('parfum', 'fragrance'):
            score -= 10; reasons.append('Contains fragrance (may irritate)')

    # Wrinkles / anti-aging
    if any('wrinkle' in c.get('type', '').lower() for c in concerns):
        if has('retinol', 'retinal', 'peptide', 'palmitoyl', 'vitamin c'):
            score += 15; reasons.append('Anti-aging actives')

    # Sunscreen preference when uvProtection low
    uvp = metrics.get('uvProtection', 100)
    if uvp < 60:
        if ptype in ['sunscreen', 'spf']:
            score += 25; reasons.append('UV protection priority')

    # Price weighting: prefer mid-priced products
    price = float(p.get('price') or 0)
    if price > 0:
        if price < 8:
            score += 3; reasons.append('Budget-friendly')
        elif 8 <= price <= 30:
            score += 8; reasons.append('Good value range')
        elif price > 60:
            score -= 5; reasons.append('Premium priced')

    return {
        **p,
        'score': round(score, 2),
        'reasons': reasons,
    }


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


@app.post("/recommend")
async def recommend(payload: Dict[str, Any]):
    """
    Recommend skincare products from the CSV based on analysis metrics and concerns.
    Expected payload: { metrics: {hydration, elasticity, texture, uvProtection}, concerns: [{type, severity, ...}], topK?: int }
    """
    try:
        metrics = payload.get('metrics') or {}
        concerns = payload.get('concerns') or []
        top_k = int(payload.get('topK') or 24)

        products = _load_products_from_csv()
        if not products:
            return JSONResponse({ 'items': [], 'count': 0 })

        scored = [_score_product(p, metrics, concerns) for p in products]
        # Filter out items with non-positive scores to keep list relevant
        scored = [p for p in scored if p['score'] > 0]
        scored.sort(key=lambda x: x['score'], reverse=True)
        top = scored[:top_k]

        # Attach image URLs (best-effort)
        result_items: List[Dict[str, Any]] = []
        for item in top:
            image_url = _fetch_image_url(item.get('product_url', '')) or ''
            result_items.append({
                'id': item.get('product_url') or item.get('product_name'),
                'name': item.get('product_name'),
                'brand': (item.get('product_name') or '').split(' ')[0],
                'category': item.get('product_type'),
                'price': item.get('price'),
                'price_raw': item.get('price_raw'),
                'image': image_url,
                'rating': 4.5,
                'reviews': 0,
                'tags': list(set([*(t for t in item.get('reasons', []))] + [item.get('product_type', '')]))[:6],
                'description': 'Recommended based on your analysis',
                'ingredients': item.get('ingredients', []),
                'product_url': item.get('product_url'),
                'score': item.get('score'),
                'reasons': item.get('reasons', []),
            })

        return JSONResponse({ 'items': result_items, 'count': len(result_items) })
    except Exception as e:
        return JSONResponse({ 'error': f'Recommendation failed: {str(e)}' }, status_code=400)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("PORT", "8000")))



