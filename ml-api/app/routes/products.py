"""
Product endpoints.
  GET /products              — list with optional clase_abc filter, pagination
  GET /products/{id}         — single product detail
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
import requests

from app.models.schema import Product, ProductDetail, ProductsResponse
from app.services import supabase_client as db

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductsResponse)
def list_products(
    clase_abc: Optional[str] = Query(None, description="Filter by ABC class: A, B, or C"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """
    Returns all products with their reorder point and ABC classification.
    Optionally filter by clase_abc (A / B / C).
    """
    if clase_abc and clase_abc.upper() not in ("A", "B", "C"):
        raise HTTPException(status_code=400, detail="clase_abc must be A, B, or C")
    try:
        rows = db.get_products(clase_abc=clase_abc, limit=limit, offset=offset)
    except requests.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Supabase error: {exc}") from exc

    return ProductsResponse(
        total=len(rows),
        limit=limit,
        offset=offset,
        data=[Product(**r) for r in rows],
    )


@router.get("/{id_producto}", response_model=ProductDetail)
def get_product(id_producto: str):
    """Returns full details for a single product by ID."""
    try:
        row = db.get_product(id_producto)
    except requests.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Supabase error: {exc}") from exc

    if row is None:
        raise HTTPException(status_code=404, detail=f"Product '{id_producto}' not found")
    return ProductDetail(**row)
