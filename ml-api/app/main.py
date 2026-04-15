"""
SupplyPredict API — entry point.
Endpoints:
  GET /health
  GET /products
  GET /products/{id_producto}
  GET /forecasts/{id_producto}
  GET /risk-snapshot
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.schema import HealthResponse
from app.routes.forecasts import router as forecasts_router
from app.routes.products import router as products_router
from app.routes.risk import router as risk_router

app = FastAPI(
    title="SupplyPredict API",
    description=(
        "Stockout prediction and reorder-point API for Toyo Foods. "
        "Powered by Prophet (demand forecasting) and LightGBM (risk classification)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Vercel frontend + localhost in dev
_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(forecasts_router)
app.include_router(risk_router)


@app.get("/health", response_model=HealthResponse, tags=["meta"])
def health():
    """Liveness check. Returns Supabase URL and API version."""
    supabase_url = os.getenv("SUPABASE_URL", "not-configured")
    return HealthResponse(
        status="ok",
        supabase_url=supabase_url,
    )
