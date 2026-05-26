"""Normalize user-facing slugs to URL-safe ASCII (lowercase, hyphens)."""

from __future__ import annotations

import re
import unicodedata

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def normalize_slug(raw: str | None) -> str:
    """
    Accept uppercase, underscores, spaces, and accented letters (e.g. Dülmen → duelmen).
    Returns a canonical slug or raises ValueError.
    """
    if raw is None or not str(raw).strip():
        raise ValueError("Invalid or missing slug")

    text = str(raw).strip().lower()
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[_\s]+", "-", text)
    text = re.sub(r"[^a-z0-9-]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")

    if not text or not SLUG_RE.match(text):
        raise ValueError("Invalid or missing slug")
    return text
