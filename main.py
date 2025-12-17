import json
import base64
from pathlib import Path
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
from io import BytesIO

import numpy as np
from PIL import Image
import cv2

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer


# ----------------------------------------------------
# PATHS
# ----------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
CAPTIONS_FILE = BASE_DIR / "captions.jsonl"
IMAGES_DIR = BASE_DIR / "dataset" / "images" / "figures"


# ----------------------------------------------------
# GLOBAL MEMORY
# ----------------------------------------------------
MODEL: SentenceTransformer = None
CAPTIONS: List[Dict[str, Any]] = []
EMB_MATRIX: np.ndarray = None
FIG_INDEX: Dict[str, List[Path]] = {}


# ----------------------------------------------------
# FASTAPI LIFESPAN
# ----------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global MODEL, CAPTIONS, EMB_MATRIX, FIG_INDEX

    print("🔥 Loading model...")
    MODEL = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    print("📁 Indexing images...")
    FIG_INDEX = build_image_index()

    print("📝 Loading captions...")
    CAPTIONS = load_captions()

    print("🔢 Embedding text...")
    EMB_MATRIX = embed_all([c["text"] for c in CAPTIONS])

    print("✔ Backend Ready!")
    yield


app = FastAPI(title="MediSeek API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------------------------------
# UTILITY FUNCTIONS
# ----------------------------------------------------
def clean_inline(tokens: List[Dict[str, Any]]) -> str:
    if not tokens:
        return "No inline references"
    return " ".join(t["text"] for t in tokens)


def clean_subcaption(sc: Dict[str, Any]) -> Dict[str, str]:
    return {k.upper(): f"Subcaption {k.upper()}" for k in sc.keys()}


def polygon_area(pts: List[List[float]]) -> float:
    x = [p[0] for p in pts]
    y = [p[1] for p in pts]
    area = 0.0
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        area += x[i] * y[j]
        area -= y[i] * x[j]
    return abs(area) / 2.0


def crop_subfigure(full_img_path: Path, pts: List[List[float]]) -> Optional[str]:
    """
    Polygon-mask based subfigure cropping (MedICaT style)
    """
    try:
        img = Image.open(full_img_path).convert("RGB")
        img_np = np.array(img)

        polygon = np.array(pts, dtype=np.int32)

        mask = np.zeros(img_np.shape[:2], dtype=np.uint8)
        cv2.fillPoly(mask, [polygon], 255)

        masked = cv2.bitwise_and(img_np, img_np, mask=mask)

        ys, xs = np.where(mask == 255)
        if len(xs) == 0 or len(ys) == 0:
            return None

        x1, x2 = xs.min(), xs.max()
        y1, y2 = ys.min(), ys.max()

        crop = masked[y1:y2, x1:x2]

        buf = BytesIO()
        Image.fromarray(crop).save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode()

        return f"data:image/png;base64,{b64}"

    except Exception as e:
        print("Polygon crop failed:", e)
        return None


def load_image_b64(path: Path) -> str:
    data = base64.b64encode(path.read_bytes()).decode()
    return f"data:image/png;base64,{data}"


def build_image_index():
    index = {}
    for img in IMAGES_DIR.iterdir():
        if img.is_file():
            suffix = img.name.split("_", 1)[1] if "_" in img.name else img.name
            index.setdefault(suffix, []).append(img)
    return index


def resolve_image(fig_uri: str) -> Optional[Path]:
    if fig_uri in FIG_INDEX:
        return FIG_INDEX[fig_uri][0]

    l = fig_uri.lower()
    for s, lst in FIG_INDEX.items():
        if s.lower() == l:
            return lst[0]

    for s, lst in FIG_INDEX.items():
        if l in s.lower():
            return lst[0]

    return None


def load_captions():
    rows = []
    with open(CAPTIONS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            try:
                item = json.loads(line)
            except:
                continue

            fig_uri = item.get("fig_uri")
            text = item.get("text") or item.get("caption")

            if fig_uri and text:
                rows.append({"fig_uri": fig_uri, "text": text, "meta": item})
    return rows


def embed_all(texts):
    return MODEL.encode(texts, convert_to_numpy=True, normalize_embeddings=True)


# ----------------------------------------------------
# SEARCH ENGINE
# ----------------------------------------------------
MEDICAL_TERMS = [
    "lung", "x-ray", "ct", "mri", "radiograph", "scan",
    "tumor", "cancer", "brain", "spine", "fracture",
    "abdomen", "thorax", "medical", "clinical",
    "disease", "infection", "lesion", "nodule"
]


def is_medical_query(q: str) -> bool:
    return any(t in q.lower() for t in MEDICAL_TERMS)


def search_similar(query: str, top_k=5):
    qv = MODEL.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]
    sims = EMB_MATRIX @ qv
    idxs = np.argsort(-sims)

    results = []

    for i in idxs[:top_k]:
        cap = CAPTIONS[i]
        meta = cap["meta"]
        fig_uri = cap["fig_uri"]

        img_path = resolve_image(fig_uri)
        if not img_path:
            continue

        img = Image.open(img_path)
        img_area = img.size[0] * img.size[1]

        subf = []

        for sf in meta.get("subfigures", []):
            area = polygon_area(sf["points"])

            # 🔴 FILTER SMALL / NOISE SUBFIGURES
            if area < 0.05 * img_area:
                continue

            subimg = crop_subfigure(img_path, sf["points"])
            if subimg:

                label = sf["label"].lower()
                token_ids = meta.get("subcaptions", {}).get(label)
                tokens = meta.get("tokens", [])
                subcaption_text = build_subcaption_from_tokens(token_ids, tokens)

                subf.append({
                  "label": label.upper(),
                  "image": subimg,
                  "subcaption": subcaption_text
                })


        # ✅ Fallback for normal figures
        if not subf:
            subf = [{
                "label": "FULL",
                "image": load_image_b64(img_path)
            }]

        results.append({

           "fig_uri": fig_uri,
           "score": float(sims[i]),
           "full_image": load_image_b64(img_path),   # ✅ FIX
            "caption": cap["text"],
            "inline_refs": clean_inline(meta.get("tokens", [])),
            "subfigures": subf
        })
    
    return results

def build_subcaption_from_tokens(token_ids, tokens):
    if not token_ids or not tokens:
        return None
    words = []
    for idx in token_ids:
        if 0 <= idx < len(tokens):
            words.append(tokens[idx]["text"])
    return " ".join(words)


# ----------------------------------------------------
# MODELS
# ----------------------------------------------------
class Query(BaseModel):
    text: str
    top_k: int = 5


# ----------------------------------------------------
# ROUTES
# ----------------------------------------------------
@app.get("/")
def root():
    return {"status": "running", "figures": len(CAPTIONS)}


@app.post("/search")
def search(q: Query):
    if not is_medical_query(q.text):
        return {
            "results": [],
            "warning": "This does not look like a medical query."
        }

    return {"results": search_similar(q.text, q.top_k)}
