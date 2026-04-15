"""
Pydantic response schemas for SupplyPredict API.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ── products ──────────────────────────────────────────────────────────────────

class Product(BaseModel):
    id_producto: str
    clase_abc: str
    demanda_diaria_media: Optional[float] = None
    lead_time_media: Optional[float] = None
    safety_stock: Optional[float] = None
    reorder_point: int = 0


class ProductDetail(Product):
    created_at: Optional[datetime] = None


class ProductsResponse(BaseModel):
    total: int
    limit: int
    offset: int
    data: List[Product]


# ── forecasts ─────────────────────────────────────────────────────────────────

class ForecastPoint(BaseModel):
    fecha: date
    demanda_forecast: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    confidence: Optional[str] = "high"


class ForecastResponse(BaseModel):
    id_producto: str
    total_days: int
    forecasts: List[ForecastPoint]


# ── risk_snapshot ─────────────────────────────────────────────────────────────

class RiskItem(BaseModel):
    id_producto: str
    stock_disponible: Optional[int] = None
    reorder_point: Optional[int] = None
    riesgo_proba: Optional[float] = Field(None, ge=0, le=1)
    riesgo_pred: Optional[int] = None
    nivel_riesgo: Optional[str] = None
    updated_at: Optional[datetime] = None


class RiskSnapshotResponse(BaseModel):
    total: int
    limit: int
    offset: int
    data: List[RiskItem]


# ── health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    supabase_url: str
    version: str = "1.0.0"
