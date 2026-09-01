#!/usr/bin/env python3
"""Build the Madrid 2026-2027 orientation catalog from the official PDFs.

The importer is intentionally deterministic: the same source bytes produce the
same catalog, validation report and SQL seed. It never guesses a degree match.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
import uuid
from collections import Counter, defaultdict
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path
from typing import Any, Iterable

import pdfplumber


ACADEMIC_YEAR = "2026-2027"
EXTRACTED_AT = "2026-08-31T00:00:00Z"
COMMUNITY = "Comunidad de Madrid"
NAMESPACE = uuid.UUID("bbdbb80a-0f50-5f14-8c81-5334f06bd018")

NOTES_URL = (
    "https://www.comunidad.madrid/docs/2026-07/"
    "notas-de-corte-dum-2026-27.pdf?VersionId=49d24KZFf.vcTtvs6AWBu9v8erTCgMnB"
)
WEIGHTINGS_URL = (
    "https://www.comunidad.madrid/docs/assets/2026/03/02/"
    "ponderaciones_26-27_pdf_27_02_26.pdf?VersionId=axC4uzT2OgwXcJn6SNy_cC49YFVok9hd"
)
LANDING_URL = "https://www.comunidad.madrid/educacion/herramientas-orientacion-universitaria"

UNIVERSITIES = {
    "UCM": ("Universidad Complutense de Madrid", "https://www.ucm.es/"),
    "UAM": ("Universidad Autónoma de Madrid", "https://www.uam.es/"),
    "UAH": ("Universidad de Alcalá", "https://www.uah.es/"),
    "UC3M": ("Universidad Carlos III de Madrid", "https://www.uc3m.es/"),
    "UPM": ("Universidad Politécnica de Madrid", "https://www.upm.es/"),
    "URJC": ("Universidad Rey Juan Carlos", "https://www.urjc.es/"),
}

PAGE_UNIVERSITY = {
    **{page: "UCM" for page in range(1, 4)},
    **{page: "UAM" for page in range(4, 7)},
    **{page: "UAH" for page in range(7, 9)},
    **{page: "UC3M" for page in range(9, 11)},
    **{page: "UPM" for page in range(11, 13)},
    **{page: "URJC" for page in range(13, 19)},
}

# The order is the left-to-right order printed in the official weighting PDF.
SUBJECTS = [
    ("analisis-musical-ii", "Análisis Musical II"),
    ("artes-escenicas-ii", "Artes Escénicas II"),
    ("ciencias-generales", "Ciencias Generales"),
    ("dibujo-artistico-ii", "Dibujo Artístico II"),
    ("latin-ii", "Latín II"),
    ("matematicas-ii", "Matemáticas II"),
    ("matematicas-aplicadas-ccss-ii", "Matemáticas Aplicadas a las CC.SS II"),
    ("biologia", "Biología"),
    ("coro-tecnica-vocal-ii", "Coro y Técnica Vocal II"),
    ("dibujo-tecnico-ii", "Dibujo Técnico II"),
    ("dibujo-tecnico-artes-plasticas-diseno-ii", "Dibujo Técnico Aplicado a las Artes Plásticas y Diseño II"),
    ("diseno", "Diseño"),
    ("empresa-diseno-modelos-negocio", "Empresa y Diseño de Modelos de Negocio"),
    ("fisica", "Física"),
    ("fundamentos-artisticos", "Fundamentos Artísticos"),
    ("geografia", "Geografía"),
    ("geologia-ciencias-ambientales", "Geología y Ciencias Ambientales"),
    ("griego-ii", "Griego II"),
    (
        "historia-filosofia-o-espana-admision",
        "Historia de la Filosofía / Historia de España (sólo de la fase de admisión)",
    ),
    ("historia-musica-danza", "Historia de la Música y de la Danza"),
    ("historia-arte", "Historia del Arte"),
    ("literatura-dramatica", "Literatura Dramática"),
    ("movimientos-culturales-artisticos", "Movimientos Culturales y Artísticos"),
    ("quimica", "Química"),
    ("tecnicas-expresion-grafico-plasticas", "Técnicas de Expresión Gráfico-Plásticas"),
    ("tecnologia-ingenieria-ii", "Tecnología e Ingeniería II"),
    (
        "lengua-extranjera-adicional",
        "Lengua Extranjera adicional: Inglés, Francés, Portugués, Italiano o Alemán",
    ),
]

FOOTNOTES = {
    "1": ("historia-filosofia", "Historia de la Filosofía", "Sólo pondera Historia de la Filosofía."),
    "2": ("frances", "Francés", "Sólo pondera Francés."),
}

NOTES_SOURCE_LABEL = "Comunidad de Madrid · Notas de acceso DUM 2026-2027"
WEIGHTINGS_SOURCE_LABEL = "Comunidad de Madrid · Ponderaciones 2026-2027 (27/02/2026)"


def clean_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def ascii_key(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.casefold())
    value = "".join(char for char in value if not unicodedata.combining(char))
    value = value.replace("–", "-").replace("—", "-")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def stable_uuid(kind: str, key: str) -> str:
    return str(uuid.uuid5(NAMESPACE, f"{kind}:{key}"))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest().upper()


def parse_score(value: str) -> Decimal | None:
    value = clean_text(value)
    if not re.fullmatch(r"\d{1,2},\d{3}", value):
        return None
    score = Decimal(value.replace(",", "."))
    return score if Decimal("5") <= score <= Decimal("14") else None


def is_double_degree(name: str) -> bool:
    key = ascii_key(name)
    return " - " in name or key.startswith("doble grado") or "doble titulacion" in key


def parse_cutoffs(path: Path) -> list[dict[str, Any]]:
    degrees: list[dict[str, Any]] = []
    with pdfplumber.open(path) as document:
        if len(document.pages) != 18:
            raise ValueError(f"Expected 18 cutoff pages, found {len(document.pages)}")
        for page_number, page in enumerate(document.pages, 1):
            acronym = PAGE_UNIVERSITY[page_number]
            adscribed_hits = page.search("CENTROS ADSCRITOS")
            adscribed_top = min((hit["top"] for hit in adscribed_hits), default=None)
            for table in page.find_tables():
                if adscribed_top is not None and table.bbox[1] >= adscribed_top:
                    continue
                extracted = table.extract()
                section = ""
                for row in extracted:
                    if not row:
                        continue
                    first = clean_text(row[0])
                    if first and not re.fullmatch(r"\d{4}", first):
                        candidate = ascii_key(first)
                        if "rama" in candidate or "dobles" in candidate or "conjuntos" in candidate:
                            section = first
                    if len(row) < 3 or not re.fullmatch(r"\d{4}", first):
                        continue
                    name = clean_text(row[1])
                    score = parse_score(row[2])
                    if not name or score is None:
                        continue
                    identity_key = f"{acronym}:{first}:{ascii_key(name)}"
                    stable_code = f"{acronym}:{first}:{hashlib.sha256(identity_key.encode('utf-8')).hexdigest()[:8]}"
                    degree_id = stable_uuid("degree", identity_key)
                    degrees.append(
                        {
                            "id": degree_id,
                            "stable_code": stable_code,
                            "official_code": first,
                            "university_code": acronym,
                            "official_name": name,
                            "search_name": ascii_key(name),
                            "campus": None,
                            "degree_kind": "double" if is_double_degree(name) or "doble" in ascii_key(section) else "single",
                            "official_url": NOTES_URL,
                            "source_page": page_number,
                            "source_section": section or None,
                            "cutoff": {
                                "id": stable_uuid("cutoff", f"{identity_key}:{ACADEMIC_YEAR}:grupo-1-ordinaria"),
                                "academic_year": ACADEMIC_YEAR,
                                "access_group": "Grupo 1",
                                "admission_round": "ordinaria",
                                "cutoff_score": float(score),
                                "source_url": NOTES_URL,
                                "source_label": NOTES_SOURCE_LABEL,
                                "source_document": "Notas de corte DUM 2026-2027",
                                "source_page": page_number,
                                "source_updated_at": "2026-07-10",
                                "verified_at": EXTRACTED_AT,
                            },
                            "weightings": [],
                        }
                    )
    unique: dict[str, dict[str, Any]] = {}
    for degree in degrees:
        previous = unique.get(degree["id"])
        if previous is None:
            unique[degree["id"]] = degree
            continue
        if (
            previous["official_name"] != degree["official_name"]
            or previous["cutoff"]["cutoff_score"] != degree["cutoff"]["cutoff_score"]
        ):
            raise ValueError(f"Conflicting duplicated cutoff row for {degree['stable_code']}")
    return list(unique.values())


def extract_weight(raw: str | None) -> Decimal | None:
    """Recover a printed 0,1/0,2 even when a PDF background label crosses it."""
    compact = re.sub(r"[^0-9,.]", "", raw or "")
    matches = re.findall(r"0[,\.]([12])", compact)
    if len(matches) != 1:
        return None
    return Decimal(f"0.{matches[0]}")


def weight_row_title(raw: str) -> tuple[str, set[str], str | None]:
    footnote_match = re.search(r"\(([12])\)\s*$", raw)
    footnote = footnote_match.group(1) if footnote_match else None
    title = re.sub(r"\s*\([12]\)\s*$", "", clean_text(raw))
    university_codes = {
        code for code in UNIVERSITIES if re.search(rf"(?<![A-Z0-9]){re.escape(code)}(?![A-Z0-9])", title)
    }
    # Remove only pure institution groups. Qualifiers such as "Sorbona - Título
    # Internacional" or adscribed-centre names remain part of the title.
    institution_codes = {*UNIVERSITIES, "UAB", "UPF"}

    def strip_institution_group(match: re.Match[str]) -> str:
        content = clean_text(match.group(1))
        remainder = re.sub(r"\b(?:" + "|".join(institution_codes) + r")\b", "", content, flags=re.IGNORECASE)
        remainder = re.sub(r"\binteruniversitario\b|\by\b|\be\b", "", remainder, flags=re.IGNORECASE)
        remainder = re.sub(r"[\s,;/&+\-]+", "", remainder)
        return "" if not remainder else match.group(0)

    title = re.sub(r"\s*\(([^)]*)\)", strip_institution_group, title)
    return clean_text(title), university_codes, footnote


RELAXED_QUALIFIERS = {
    "alcorcon", "aranjuez", "fuenlabrada", "madrid", "madrid quintana", "mostoles", "vicalvaro",
    "guadalajara", "colmenarejo", "campus sur", "campus de colmenarejo", "presencial",
    "semipresencial", "a distancia", "online", "bilingue", "en ingles", "ingles", "frances",
    "arabe", "chino", "japones", "espanol o ingles", "espanol o bilingue", "opcion ingles",
    "grupo bilingue espanol ingles", "grado de la alianza europea yufe", "pendiente autorizacion", "inef",
    "facultad medicina uam",
}


def is_relaxed_qualifier(value: str) -> bool:
    key = ascii_key(value)
    return key in RELAXED_QUALIFIERS or (
        any(mode in key for mode in ("presencial", "semipresencial", "a distancia"))
        and any(campus in key for campus in ("alcorcon", "aranjuez", "fuenlabrada", "madrid", "mostoles", "vicalvaro"))
    )


def match_key(name: str, relaxed: bool = False) -> str:
    value = clean_text(name)
    if relaxed:
        value = re.sub(
            r"\(([^()]*)\)",
            lambda match: "" if is_relaxed_qualifier(match.group(1)) else match.group(0),
            value,
        )
        value = re.sub(r"\s*-\s*Árabe,\s*Chino\s*y\s*Japonés\s*$", "", value, flags=re.IGNORECASE)
    value = re.sub(r"^Grado en\s+", "", value, flags=re.IGNORECASE)
    return ascii_key(value)


@dataclass
class WeightingRow:
    page: int
    raw_title: str
    title: str
    university_codes: set[str]
    footnote: str | None
    values: list[Decimal | None]


def parse_weighting_rows(path: Path) -> list[WeightingRow]:
    rows: list[WeightingRow] = []
    with pdfplumber.open(path) as document:
        if len(document.pages) != 20:
            raise ValueError(f"Expected 20 weighting pages, found {len(document.pages)}")
        for page_number, page in enumerate(document.pages, 1):
            tables = page.find_tables()
            if len(tables) != 1:
                raise ValueError(f"Expected one weighting table on page {page_number}, found {len(tables)}")
            table = tables[0]
            extracted = table.extract()
            page_chars = page.chars
            header_cells = table.rows[3].cells
            if len(header_cells) != 29 or any(header_cells[index] is None for index in range(2, 29)):
                raise ValueError(f"Could not recover subject columns on page {page_number}")
            subject_bounds = [(header_cells[index][0], header_cells[index][2]) for index in range(2, 29)]
            for row_index, (row, geometry) in enumerate(zip(extracted, table.rows)):
                if row_index < 5 or not row or len(row) < 2 or geometry.cells[1] is None:
                    continue
                name_cell = geometry.cells[1]
                name_chars = [
                    char for char in page_chars
                    if name_cell[0] <= (char["x0"] + char["x1"]) / 2 < name_cell[2]
                    and name_cell[1] <= (char["top"] + char["bottom"]) / 2 < name_cell[3]
                    and 7.0 <= float(char.get("size", 0)) <= 7.6
                ]
                name_lines: dict[float, list[dict[str, Any]]] = defaultdict(list)
                for char in name_chars:
                    name_lines[round(char["top"], 1)].append(char)
                raw_title = clean_text(" ".join(
                    "".join(char["text"] for char in sorted(chars, key=lambda item: item["x0"]))
                    for _, chars in sorted(name_lines.items())
                )) or clean_text(row[1])
                title, university_codes, footnote = weight_row_title(raw_title)
                if not title or not university_codes:
                    continue
                y0 = min(cell[1] for cell in geometry.cells if cell is not None)
                y1 = max(cell[3] for cell in geometry.cells if cell is not None)
                values = []
                for x0, x1 in subject_bounds:
                    # Cropping/reflowing the page once per cell is prohibitively slow.
                    # Character centres give the same fixed-grid answer in one pass.
                    chars = [
                        char for char in page_chars
                        if x0 <= (char["x0"] + char["x1"]) / 2 < x1
                        and y0 <= (char["top"] + char["bottom"]) / 2 < y1
                    ]
                    chars.sort(key=lambda char: (round(char["top"], 1), char["x0"]))
                    raw_cell = "".join(char["text"] for char in chars)
                    values.append(extract_weight(raw_cell))
                if any(value is not None for value in values):
                    rows.append(WeightingRow(page_number, raw_title, title, university_codes, footnote, values))
    return rows


def attach_weightings(degrees: list[dict[str, Any]], rows: list[WeightingRow]) -> dict[str, Any]:
    exact: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    relaxed: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for degree in degrees:
        exact[(degree["university_code"], match_key(degree["official_name"]))].append(degree)
        relaxed[(degree["university_code"], match_key(degree["official_name"], relaxed=True))].append(degree)

    unmatched: list[dict[str, Any]] = []
    ambiguous: list[dict[str, Any]] = []
    assignments = 0
    method_counts: Counter[str] = Counter()
    assigned_degree_ids: set[str] = set()

    grouped_rows: dict[tuple[tuple[str, ...], str, str | None], list[WeightingRow]] = defaultdict(list)
    for row in rows:
        grouped_rows[(tuple(sorted(row.university_codes)), match_key(row.title), row.footnote)].append(row)
    deduplicated_rows: list[WeightingRow] = []
    conflicting_source_rows: list[dict[str, Any]] = []
    for grouped in grouped_rows.values():
        first = grouped[0]
        if any(item.values != first.values for item in grouped[1:]):
            conflicting_source_rows.append(
                {"title": first.raw_title, "pages": [item.page for item in grouped], "reason": "different duplicated matrices"}
            )
            continue
        deduplicated_rows.append(first)

    for row in deduplicated_rows:
        row_matches: dict[str, tuple[dict[str, Any], str]] = {}
        for code in sorted(row.university_codes):
            candidates = exact.get((code, match_key(row.title)), [])
            method = "exact"
            if not candidates:
                candidates = relaxed.get((code, match_key(row.title, relaxed=True)), [])
                method = "campus_or_mode_relaxed"
            if not candidates:
                continue
            # Several official codes can represent the same title on different campuses/modes.
            for candidate in candidates:
                row_matches[candidate["id"]] = (candidate, method)

        if not row_matches:
            unmatched.append({"page": row.page, "title": row.raw_title, "universities": sorted(row.university_codes)})
            continue

        # A row may intentionally apply to multiple public universities/campuses.
        normalized_names = {match_key(item[0]["official_name"], relaxed=True) for item in row_matches.values()}
        if len(normalized_names) != 1 or next(iter(normalized_names)) != match_key(row.title, relaxed=True):
            ambiguous.append(
                {
                    "page": row.page,
                    "title": row.raw_title,
                    "candidate_codes": sorted(item[0]["official_code"] for item in row_matches.values()),
                }
            )
            continue

        for degree, method in row_matches.values():
            for index, value in enumerate(row.values):
                if value is None:
                    continue
                subject_code, official_subject_name = SUBJECTS[index]
                rule_note = None
                if (row.footnote == "1" and index == 18) or (row.footnote == "2" and index == 26):
                    subject_code, official_subject_name, rule_note = FOOTNOTES[row.footnote]
                weighting_id = stable_uuid(
                    "weighting", f"{degree['university_code']}:{degree['official_code']}:{ACADEMIC_YEAR}:{subject_code}"
                )
                degree["weightings"].append(
                    {
                        "id": weighting_id,
                        "subject_code": subject_code,
                        "official_subject_name": official_subject_name,
                        "weighting": float(value),
                        "rule_note": rule_note,
                        "academic_year": ACADEMIC_YEAR,
                        "source_url": WEIGHTINGS_URL,
                        "source_label": WEIGHTINGS_SOURCE_LABEL,
                        "source_document": "Parámetros de ponderación 2026-2027",
                        "source_page": row.page,
                        "source_updated_at": "2026-02-27",
                        "verified_at": EXTRACTED_AT,
                    }
                )
            degree["weightings"].sort(key=lambda item: item["subject_code"])
            assignments += 1
            method_counts[method] += 1
            assigned_degree_ids.add(degree["id"])

    return {
        "weighting_source_rows": len(rows),
        "deduplicated_weighting_rows": len(deduplicated_rows),
        "weighting_row_assignments": assignments,
        "degrees_with_weightings": len(assigned_degree_ids),
        "degrees_without_weightings": [
            {
                "university": degree["university_code"],
                "official_code": degree["official_code"],
                "official_name": degree["official_name"],
            }
            for degree in degrees
            if not degree["weightings"]
        ],
        "match_methods": dict(sorted(method_counts.items())),
        "unmatched_weighting_rows": unmatched,
        "ambiguous_weighting_rows": ambiguous,
        "conflicting_weighting_rows_excluded": conflicting_source_rows,
    }


def sql_literal(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float, Decimal)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def values_statement(table: str, columns: list[str], rows: Iterable[Iterable[Any]], conflict: str, batch_size: int = 250) -> str:
    materialized = list(rows)
    statements = []
    for start in range(0, len(materialized), batch_size):
        batch = materialized[start : start + batch_size]
        rendered = ",\n".join("  (" + ", ".join(sql_literal(value) for value in row) + ")" for row in batch)
        statements.append(
            f"insert into public.{table} ({', '.join(columns)}) values\n{rendered}\n{conflict};"
        )
    return "\n\n".join(statements)


def generate_sql(catalog: dict[str, Any]) -> str:
    degrees = catalog["degrees"]
    university_rows = []
    for university in catalog["universities"]:
        university_rows.append(
            (
                university["id"], university["name"], university["acronym"], university["stable_code"],
                COMMUNITY, university["official_url"], True,
            )
        )
    degree_rows = [
        (
            degree["id"], degree["university_id"], degree["official_name"], degree["campus"],
            degree["official_url"], True, degree["official_code"], degree["official_name"],
            degree["search_name"], degree["degree_kind"], degree["source_page"], degree["source_section"], degree["stable_code"],
        )
        for degree in degrees
    ]
    cutoff_rows = [
        (
            degree["cutoff"]["id"], degree["id"], ACADEMIC_YEAR, "grupo_1_ordinaria",
            degree["cutoff"]["cutoff_score"], degree["cutoff"]["source_url"], degree["cutoff"]["source_label"],
            degree["cutoff"]["verified_at"], "verified", degree["cutoff"]["access_group"],
            degree["cutoff"]["source_document"], degree["cutoff"]["source_page"],
            degree["cutoff"]["source_updated_at"], "official",
        )
        for degree in degrees
    ]
    weighting_rows = [
        (
            weighting["id"], degree["id"], ACADEMIC_YEAR, weighting["official_subject_name"],
            weighting["weighting"], weighting["source_url"], weighting["source_label"],
            weighting["verified_at"], "verified", weighting["subject_code"],
            weighting["official_subject_name"], weighting["source_document"], weighting["source_page"],
            weighting["source_updated_at"], weighting["rule_note"], "official",
        )
        for degree in degrees for weighting in degree["weightings"]
    ]

    header = """-- Generated by scripts/orientation/import_madrid_2026_2027.py.
-- Official Madrid public-university catalog, academic year 2026-2027.
-- Idempotent: deterministic UUIDs and ON CONFLICT updates; no destructive deletes.

alter table public.orientation_universities add column if not exists stable_code text;
create unique index if not exists orientation_universities_stable_code_uidx
  on public.orientation_universities (stable_code) where stable_code is not null;

alter table public.orientation_degrees
  add column if not exists official_code text,
  add column if not exists official_name text,
  add column if not exists search_name text,
  add column if not exists degree_kind text,
  add column if not exists source_page integer,
  add column if not exists source_section text,
  add column if not exists stable_code text;
drop index if exists public.orientation_degrees_official_code_uidx;
create unique index if not exists orientation_degrees_stable_code_uidx
  on public.orientation_degrees (stable_code) where stable_code is not null;
create index if not exists orientation_degrees_official_code_idx
  on public.orientation_degrees (university_id, official_code);
create index if not exists orientation_degrees_search_name_idx on public.orientation_degrees (search_name);

alter table public.orientation_admission_cutoffs
  add column if not exists access_group text,
  add column if not exists source_document text,
  add column if not exists source_page integer,
  add column if not exists source_updated_at date,
  add column if not exists source_type text;
alter table public.orientation_admission_cutoffs
  alter column cutoff_score type numeric(5,3) using cutoff_score::numeric(5,3);

alter table public.orientation_subject_weightings
  add column if not exists subject_code text,
  add column if not exists official_subject_name text,
  add column if not exists source_document text,
  add column if not exists source_page integer,
  add column if not exists source_updated_at date,
  add column if not exists rule_note text,
  add column if not exists source_type text;
create unique index if not exists orientation_weightings_subject_code_uidx
  on public.orientation_subject_weightings (degree_id, academic_year, subject_code) where subject_code is not null;

alter table public.perfiles
  add column if not exists target_degree_id uuid references public.orientation_degrees(id) on delete set null,
  add column if not exists target_university_id uuid references public.orientation_universities(id) on delete set null;
alter table public.perfiles
  alter column target_admission_score type numeric(5,3) using target_admission_score::numeric(5,3);
create index if not exists perfiles_target_degree_idx on public.perfiles (target_degree_id);

"""
    sections = [header]
    sections.append(values_statement(
        "orientation_universities",
        ["id", "name", "acronym", "stable_code", "community", "official_url", "active"],
        university_rows,
        "on conflict (id) do update set name=excluded.name, acronym=excluded.acronym, stable_code=excluded.stable_code, community=excluded.community, official_url=excluded.official_url, active=excluded.active",
    ))
    sections.append(values_statement(
        "orientation_degrees",
        ["id", "university_id", "name", "campus", "official_url", "active", "official_code", "official_name", "search_name", "degree_kind", "source_page", "source_section", "stable_code"],
        degree_rows,
        "on conflict (id) do update set university_id=excluded.university_id, name=excluded.name, campus=excluded.campus, official_url=excluded.official_url, active=excluded.active, official_code=excluded.official_code, official_name=excluded.official_name, search_name=excluded.search_name, degree_kind=excluded.degree_kind, source_page=excluded.source_page, source_section=excluded.source_section, stable_code=excluded.stable_code",
    ))
    sections.append(values_statement(
        "orientation_admission_cutoffs",
        ["id", "degree_id", "academic_year", "admission_round", "cutoff_score", "source_url", "source_label", "verified_at", "status", "access_group", "source_document", "source_page", "source_updated_at", "source_type"],
        cutoff_rows,
        "on conflict (id) do update set cutoff_score=excluded.cutoff_score, source_url=excluded.source_url, source_label=excluded.source_label, verified_at=excluded.verified_at, status=excluded.status, access_group=excluded.access_group, source_document=excluded.source_document, source_page=excluded.source_page, source_updated_at=excluded.source_updated_at, source_type=excluded.source_type",
    ))
    sections.append(values_statement(
        "orientation_subject_weightings",
        ["id", "degree_id", "academic_year", "subject", "weighting", "source_url", "source_label", "verified_at", "status", "subject_code", "official_subject_name", "source_document", "source_page", "source_updated_at", "rule_note", "source_type"],
        weighting_rows,
        "on conflict (id) do update set subject=excluded.subject, weighting=excluded.weighting, source_url=excluded.source_url, source_label=excluded.source_label, verified_at=excluded.verified_at, status=excluded.status, subject_code=excluded.subject_code, official_subject_name=excluded.official_subject_name, source_document=excluded.source_document, source_page=excluded.source_page, source_updated_at=excluded.source_updated_at, rule_note=excluded.rule_note, source_type=excluded.source_type",
    ))
    return "\n\n".join(sections).rstrip() + "\n"


def validate(degrees: list[dict[str, Any]], attachment_report: dict[str, Any]) -> dict[str, Any]:
    repeated_official_codes = [
        {"university": key[0], "official_code": key[1], "count": count}
        for key, count in Counter((item["university_code"], item["official_code"]) for item in degrees).items()
        if count > 1
    ]
    duplicate_stable_codes = [key for key, count in Counter(item["stable_code"] for item in degrees).items() if count > 1]
    duplicate_ids = [key for key, count in Counter(item["id"] for item in degrees).items() if count > 1]
    invalid_cutoffs = [item["id"] for item in degrees if not 5 <= item["cutoff"]["cutoff_score"] <= 14]
    invalid_weightings = [
        weighting["id"] for degree in degrees for weighting in degree["weightings"]
        if weighting["weighting"] not in (0.1, 0.2)
    ]
    duplicate_weightings = []
    for degree in degrees:
        duplicates = [
            code for code, count in Counter(item["subject_code"] for item in degree["weightings"]).items() if count > 1
        ]
        if duplicates:
            duplicate_weightings.append({"degree_id": degree["id"], "subject_codes": duplicates})

    by_university = Counter(item["university_code"] for item in degrees)
    weightings_by_university = Counter(
        degree["university_code"] for degree in degrees if degree["weightings"]
    )
    fatal = bool(duplicate_stable_codes or duplicate_ids or invalid_cutoffs or invalid_weightings or duplicate_weightings)
    if set(by_university) != set(UNIVERSITIES):
        fatal = True
    report = {
        "status": "failed" if fatal else "passed",
        "academic_year": ACADEMIC_YEAR,
        "scope": {
            "universities": sorted(UNIVERSITIES),
            "public_universities_only": True,
            "adscribed_centres_excluded": True,
            "cutoff_semantics": "Grupo 1 · convocatoria ordinaria",
        },
        "counts": {
            "universities": len(by_university),
            "degrees": len(degrees),
            "double_or_joint_degrees": sum(item["degree_kind"] == "double" for item in degrees),
            "cutoffs": len(degrees),
            "weightings": sum(len(item["weightings"]) for item in degrees),
            "degrees_by_university": dict(sorted(by_university.items())),
            "degrees_with_weightings_by_university": dict(sorted(weightings_by_university.items())),
        },
        "errors": {
            "duplicate_degree_stable_codes": duplicate_stable_codes,
            "duplicate_degree_ids": duplicate_ids,
            "invalid_cutoffs": invalid_cutoffs,
            "invalid_weightings": invalid_weightings,
            "duplicate_weightings": duplicate_weightings,
        },
        "warnings": {"repeated_official_codes": repeated_official_codes},
        "matching": attachment_report,
    }
    return report


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def build(args: argparse.Namespace) -> None:
    notes_path = args.notes.resolve()
    weightings_path = args.weightings.resolve()
    for path in (notes_path, weightings_path):
        if not path.is_file():
            raise FileNotFoundError(path)

    degrees = parse_cutoffs(notes_path)
    weighting_rows = parse_weighting_rows(weightings_path)
    matching_report = attach_weightings(degrees, weighting_rows)

    universities = []
    for acronym, (name, official_url) in UNIVERSITIES.items():
        university_id = stable_uuid("university", acronym)
        universities.append(
            {
                "id": university_id,
                "stable_code": acronym,
                "acronym": acronym,
                "name": name,
                "community": COMMUNITY,
                "official_url": official_url,
            }
        )
    university_ids = {item["acronym"]: item["id"] for item in universities}
    for degree in degrees:
        degree["university_id"] = university_ids[degree["university_code"]]
    universities.sort(key=lambda item: item["acronym"])
    degrees.sort(key=lambda item: (item["university_code"], item["official_code"]))

    sources = {
        "academic_year": ACADEMIC_YEAR,
        "extracted_at": EXTRACTED_AT,
        "landing_page": LANDING_URL,
        "documents": [
            {
                "id": "madrid-dum-cutoffs-2026-2027",
                "type": "official_cutoffs",
                "url": NOTES_URL,
                "local_filename": notes_path.name,
                "sha256": sha256(notes_path),
                "pages": 18,
                "source_updated_at": "2026-07-10",
            },
            {
                "id": "madrid-weightings-2026-2027",
                "type": "official_weightings",
                "url": WEIGHTINGS_URL,
                "local_filename": weightings_path.name,
                "sha256": sha256(weightings_path),
                "pages": 20,
                "source_updated_at": "2026-02-27",
            },
        ],
    }
    catalog = {
        "academic_year": ACADEMIC_YEAR,
        "source_type": "official",
        "generated_at": EXTRACTED_AT,
        "scope": "Six public universities in the Madrid single district; adscribed centres excluded",
        "sources_manifest": "sources.json",
        "universities": universities,
        "degrees": degrees,
    }
    report = validate(degrees, matching_report)
    if report["status"] != "passed":
        raise ValueError(json.dumps(report["errors"], ensure_ascii=False))

    write_json(args.output / "sources.json", sources)
    write_json(args.output / "catalog.json", catalog)
    write_json(args.output / "validation-report.json", report)
    args.sql.parent.mkdir(parents=True, exist_ok=True)
    args.sql.write_text(generate_sql(catalog), encoding="utf-8", newline="\n")
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2, sort_keys=True))
    print(f"SQL: {args.sql}")


def parser() -> argparse.ArgumentParser:
    root = Path(__file__).resolve().parents[2]
    source_dir = root / "tmp" / "pdfs" / "orientation-madrid-2026-2027"
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--notes", type=Path, default=source_dir / "notas-de-corte-dum-2026-27.pdf")
    result.add_argument("--weightings", type=Path, default=source_dir / "ponderaciones-26-27.pdf")
    result.add_argument("--output", type=Path, default=root / "data" / "orientation" / "madrid" / ACADEMIC_YEAR)
    result.add_argument(
        "--sql", type=Path,
        default=root / "supabase" / "migrations" / "20260831213000_seed_orientation_madrid_2026_2027.sql",
    )
    return result


if __name__ == "__main__":
    try:
        build(parser().parse_args())
    except Exception as error:
        print(f"orientation import failed: {error}", file=sys.stderr)
        raise
