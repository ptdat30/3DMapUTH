"""
Master Export Script for Campus CAD Deliverables
Builds parametric 3D models and exports them into the Next.js public directory:
`public/models/cs3/`

Usage:
  cadgen run cad_models/exports.py
"""

import sys
from pathlib import Path
from cadgen import export

# Import parametric campus models
from building_h import building_h

ROOT_DIR = Path(__file__).resolve().parent.parent
CS3_MODELS_DIR = ROOT_DIR / "public" / "models" / "cs3"


def export_all():
    CS3_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    print("==========================================")
    print("Building & Exporting Campus 3 3D CAD Models")
    print("==========================================")
    
    # 1. Tòa H (Hero U-shaped 5-story academic & administrative complex)
    toa_h_path = CS3_MODELS_DIR / "toa_h.glb"
    print(f"-> Building & Exporting Tòa H to {toa_h_path.name}...")
    doc_h = building_h()
    export(doc_h, toa_h_path)
    print(f"   [DONE] {toa_h_path.name} exported successfully ({toa_h_path.stat().st_size} bytes)")
    
    print("==========================================")
    print("All CAD models exported to public/models/cs3/")
    print("==========================================")


if __name__ == "__main__":
    export_all()

