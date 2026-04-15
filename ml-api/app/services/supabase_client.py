"""
Supabase REST client (requests-based, no supabase-py dependency).
Calls PostgREST API with the anon key for public reads.
"""
from __future__ import annotations

import os
from typing import Any, Optional

import requests

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_REST = f"{SUPABASE_URL}/rest/v1"


def _headers(service_role: bool = False) -> dict[str, str]:
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_KEY) if service_role else SUPABASE_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def _get(table: str, params: dict[str, Any] | None = None) -> list[dict]:
    """SELECT from a PostgREST table. Raises HTTPException-style on error."""
    resp = requests.get(f"{_REST}/{table}", headers=_headers(), params=params or {}, timeout=10)
    resp.raise_for_status()
    return resp.json()


# ── products ─────────────────────────────────────────────────────────────────

def get_products(clase_abc: Optional[str] = None, limit: int = 100, offset: int = 0) -> list[dict]:
    params: dict[str, Any] = {
        "select": "id_producto,clase_abc,demanda_diaria_media,lead_time_media,safety_stock,reorder_point",
        "order": "clase_abc.asc,id_producto.asc",
        "limit": limit,
        "offset": offset,
    }
    if clase_abc:
        params["clase_abc"] = f"eq.{clase_abc.upper()}"
    return _get("products", params)


def get_product(id_producto: str) -> dict | None:
    rows = _get("products", {
        "id_producto": f"eq.{id_producto}",
        "select": "*",
        "limit": 1,
    })
    return rows[0] if rows else None


# ── forecasts ─────────────────────────────────────────────────────────────────

def get_forecasts(id_producto: str) -> list[dict]:
    return _get("forecasts", {
        "id_producto": f"eq.{id_producto}",
        "select": "fecha,demanda_forecast,lower_bound,upper_bound,confidence",
        "order": "fecha.asc",
    })


# ── risk_snapshot ─────────────────────────────────────────────────────────────

def get_risk_snapshot(
    nivel_riesgo: Optional[str] = None,
    limit: int = 200,
    offset: int = 0,
) -> list[dict]:
    params: dict[str, Any] = {
        "select": (
            "id_producto,stock_disponible,reorder_point,"
            "riesgo_proba,riesgo_pred,nivel_riesgo,updated_at"
        ),
        "order": "riesgo_proba.desc.nullslast",
        "limit": limit,
        "offset": offset,
    }
    if nivel_riesgo:
        params["nivel_riesgo"] = f"eq.{nivel_riesgo.upper()}"
    return _get("risk_snapshot", params)
