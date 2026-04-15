"""
Risk snapshot endpoint.
  GET /risk-snapshot  — all products sorted by stockout risk probability
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
import requests

from app.models.schema import RiskItem, RiskSnapshotResponse
from app.services import supabase_client as db

router = APIRouter(prefix="/risk-snapshot", tags=["risk"])

_VALID_LEVELS = {"STABLE", "URGENT", "CRITICAL"}


@router.get("", response_model=RiskSnapshotResponse)
def get_risk_snapshot(
    nivel_riesgo: Optional[str] = Query(
        None, description="Filter by risk level: STABLE, URGENT, or CRITICAL"
    ),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """
    Returns all products sorted by LightGBM stockout-risk probability (highest first).
    nivel_riesgo levels:
      - CRITICAL  → riesgo_proba ≥ 0.70
      - URGENT    → 0.40 ≤ riesgo_proba < 0.70
      - STABLE    → riesgo_proba < 0.40
    """
    if nivel_riesgo and nivel_riesgo.upper() not in _VALID_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"nivel_riesgo must be one of: {', '.join(sorted(_VALID_LEVELS))}",
        )
    try:
        rows = db.get_risk_snapshot(nivel_riesgo=nivel_riesgo, limit=limit, offset=offset)
    except requests.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Supabase error: {exc}") from exc

    return RiskSnapshotResponse(
        total=len(rows),
        limit=limit,
        offset=offset,
        data=[RiskItem(**r) for r in rows],
    )
