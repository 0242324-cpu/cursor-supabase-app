"""
Forecast endpoint.
  GET /forecasts/{id_producto}  — 30-day Prophet demand forecast
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
import requests

from app.models.schema import ForecastPoint, ForecastResponse
from app.services import supabase_client as db

router = APIRouter(prefix="/forecasts", tags=["forecasts"])


@router.get("/{id_producto}", response_model=ForecastResponse)
def get_forecast(id_producto: str):
    """
    Returns the 30-day Prophet demand forecast for a product.
    Only the top-20 Class A products (by average daily demand) have forecasts.
    """
    try:
        rows = db.get_forecasts(id_producto)
    except requests.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Supabase error: {exc}") from exc

    if not rows:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No forecast found for '{id_producto}'. "
                "Forecasts are available only for the top-20 Class A products."
            ),
        )

    return ForecastResponse(
        id_producto=id_producto,
        total_days=len(rows),
        forecasts=[ForecastPoint(**r) for r in rows],
    )
