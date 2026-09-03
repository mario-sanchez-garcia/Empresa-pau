#!/usr/bin/env python3
"""Build the official Catalunya 2026-2027 orientation catalog.

Only the five-digit official study code is used to join cutoffs and
weightings. Conflicting duplicate weighting matrices are excluded and
reported; names are never used as a fallback join key.
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
from decimal import Decimal
from pathlib import Path
from typing import Any, Iterable

import pdfplumber


ACADEMIC_YEAR = "2026-2027"
COMMUNITY = "Cataluña"
EXTRACTED_AT = "2026-09-03T00:00:00Z"
NAMESPACE = uuid.UUID("c262df96-78e8-56d5-b019-174132017727")

LANDING_URL = "https://universitats.gencat.cat/es/preinscripcions/"
NOTES_PAGE_URL = "https://universitats.gencat.cat/es/preinscripcions/notes-tall/"
NOTES_URL = "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/notes-de-tall/Notes-tall-1a-assignacio_juny_2026.pdf"
WEIGHTINGS_PAGE_URL = "https://universitats.gencat.cat/es/preinscripcions/ponderacions/"
WEIGHTINGS_URL = "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/Ponderacions-2026_v7.pdf"

UNIVERSITIES = {
    "UB": ("Universitat de Barcelona", "https://www.ub.edu/"),
    "UAB": ("Universitat Autònoma de Barcelona", "https://www.uab.cat/"),
    "UPC": ("Universitat Politècnica de Catalunya", "https://www.upc.edu/"),
    "UPF": ("Universitat Pompeu Fabra", "https://www.upf.edu/"),
    "UdL": ("Universitat de Lleida", "https://www.udl.cat/"),
    "UdG": ("Universitat de Girona", "https://www.udg.edu/"),
    "URV": ("Universitat Rovira i Virgili", "https://www.urv.cat/"),
    "UVic-UCC": ("Universitat de Vic - Universitat Central de Catalunya", "https://www.uvic.cat/"),
}
UNIVERSITY_BY_CODE_PREFIX = {"1": "UB", "2": "UAB", "3": "UPC", "4": "UPF", "6": "UdL", "7": "URV", "8": "UdG", "9": "UVic-UCC"}

# Left-to-right columns in Ponderacions-2026_v7.pdf.
SUBJECTS = [
    ("analisis-musical-ii", "Anàlisi Musical II"),
    ("artes-escenicas-ii", "Arts Escèniques II"),
    ("biologia", "Biologia"),
    ("ciencias-generales", "Ciències Generals"),
    ("coro-tecnica-vocal-ii", "Cor i Tècnica Vocal II"),
    ("dibujo-artistico-ii", "Dibuix Artístic II"),
    ("dibujo-tecnico-ii", "Dibuix Tècnic II"),
    ("dibujo-tecnico-artes-plasticas-diseno-ii", "Dibuix Tècnic Aplicat a les Arts Plàstiques i el Disseny II"),
    ("diseno", "Disseny"),
    ("fisica", "Física"),
    ("fundamentos-artisticos", "Fonaments Artístics"),
    ("empresa-diseno-modelos-negocio", "Funcionament de l'Empresa i Disseny de Models de Negoci"),
    ("geografia", "Geografia"),
    ("geologia-ciencias-ambientales", "Geologia i Ciències Ambientals"),
    ("historia-musica-danza", "Història de la Música i de la Dansa"),
    ("historia-arte", "Història de l'Art"),
    ("literatura-castellana", "Literatura Castellana"),
    ("literatura-catalana", "Literatura Catalana"),
    ("literatura-dramatica", "Literatura Dramàtica"),
    ("griego-ii", "Llengua i Cultura Gregues II"),
    ("latin-ii", "Llengua i Cultura Llatines II"),
    ("matematicas-ii", "Matemàtiques II"),
    ("matematicas-aplicadas-ccss-ii", "Matemàtiques Aplicades a les CC.SS. II"),
    ("movimientos-culturales-artisticos", "Moviments Culturals i Artístics"),
    ("quimica", "Química"),
    ("tecnicas-expresion-grafico-plasticas", "Tècniques d'Expressió Graficoplàstica"),
    ("tecnologia-ingenieria-ii", "Tecnologia i Enginyeria II"),
]


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def ascii_key(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.casefold())
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def stable_uuid(kind: str, key: str) -> str:
    return str(uuid.uuid5(NAMESPACE, f"{kind}:{key}"))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest().upper()


def parse_score(value: str | None) -> Decimal | None:
    raw = clean(value)
    if not re.fullmatch(r"\d{1,2},\d{3}", raw):
        return None
    score = Decimal(raw.replace(",", "."))
    return score if Decimal("5") <= score <= Decimal("14") else None


def university_code(raw: str, official_code: str) -> tuple[str | None, str]:
    # Joint programmes list several universities. The first Catalan member is
    # the administering institution printed by the official system.
    normalized = clean(raw)
    for code in sorted(UNIVERSITIES, key=len, reverse=True):
        if re.search(rf"(?<![A-Za-z0-9]){re.escape(code)}(?![A-Za-z0-9])", normalized, re.I):
            return code, "official university cell"
    # One cell in the cutoff PDF (31131) is graphically corrupted during text
    # extraction. Catalonia's official study-code prefix identifies the same
    # administering university and is recorded as the deterministic fallback.
    fallback = UNIVERSITY_BY_CODE_PREFIX.get(official_code[:1])
    return fallback, "official code prefix fallback" if fallback else "unresolved"


def parse_cutoffs(path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    degrees: list[dict[str, Any]] = []
    excluded: list[dict[str, Any]] = []
    university_fallbacks: list[dict[str, Any]] = []
    with pdfplumber.open(path) as document:
        if len(document.pages) != 8:
            raise ValueError(f"Expected 8 cutoff pages, found {len(document.pages)}")
        for page_number, page in enumerate(document.pages, 1):
            tables = page.extract_tables()
            if len(tables) != 1:
                raise ValueError(f"Expected one cutoff table on page {page_number}, found {len(tables)}")
            for row in tables[0]:
                if not row or not re.fullmatch(r"\d{5}", clean(row[0])):
                    continue
                code, name, raw_university = clean(row[0]), clean(row[1]), clean(row[2])
                score = parse_score(row[3] if len(row) > 3 else None)
                acronym, university_method = university_code(raw_university, code)
                if acronym and university_method != "official university cell":
                    university_fallbacks.append({"page": page_number, "code": code, "raw_university": raw_university, "resolved_university": acronym, "method": university_method})
                if not acronym or score is None or not name:
                    excluded.append({"page": page_number, "code": code, "name": name, "university": raw_university, "reason": "unsupported university or invalid PAU/CFGS score"})
                    continue
                identity = f"CAT:{code}"
                degrees.append({
                    "id": stable_uuid("degree", identity),
                    "stable_code": identity,
                    "official_code": code,
                    "university_code": acronym,
                    "official_name": name,
                    "search_name": ascii_key(name),
                    "campus": name,
                    "degree_kind": "joint" if "/" in name or "simultane" in ascii_key(name) else "single",
                    "official_url": NOTES_PAGE_URL,
                    "source_page": page_number,
                    "source_section": raw_university if "/" in raw_university else None,
                    "cutoff": {
                        "id": stable_uuid("cutoff", f"{identity}:{ACADEMIC_YEAR}:primera-assignacio-juny"),
                        "academic_year": ACADEMIC_YEAR,
                        "access_group": "PAU / CFGS",
                        "admission_round": "primera_assignacio_juny",
                        "cutoff_score": float(score),
                        "source_url": NOTES_URL,
                        "source_label": "Generalitat de Catalunya · Notes de tall · 1a assignació juny 2026",
                        "source_document": "Notes de tall 1a assignació juny 2026 (10/07/2026)",
                        "source_page": page_number,
                        "source_updated_at": "2026-07-10",
                        "verified_at": EXTRACTED_AT,
                    },
                    "weightings": [],
                })
    return degrees, excluded, university_fallbacks


def weighting_value(raw: str | None) -> float | None:
    value = clean(raw).replace(",", ".")
    return float(value) if value in {"0.1", "0.2"} else None


def parse_weightings(path: Path) -> tuple[dict[str, list[dict[str, Any]]], dict[str, Any]]:
    by_code: dict[str, list[dict[str, Any]]] = defaultdict(list)
    with pdfplumber.open(path) as document:
        if len(document.pages) != 28:
            raise ValueError(f"Expected 28 weighting pages, found {len(document.pages)}")
        for page_number, page in enumerate(document.pages, 1):
            tables = page.extract_tables()
            if len(tables) != 1:
                raise ValueError(f"Expected one weighting table on page {page_number}, found {len(tables)}")
            for row in tables[0]:
                if not row or len(row) != 30 or not re.fullmatch(r"\d{5}", clean(row[0])):
                    continue
                values = tuple(weighting_value(value) for value in row[3:])
                by_code[clean(row[0])].append({
                    "page": page_number,
                    "name": clean(row[1]),
                    "university": clean(row[2]),
                    "values": values,
                })

    selected: dict[str, list[dict[str, Any]]] = {}
    conflicting: list[dict[str, Any]] = []
    duplicates_identical: list[dict[str, Any]] = []
    for code, rows in by_code.items():
        matrices = {row["values"] for row in rows}
        if len(matrices) != 1:
            conflicting.append({"code": code, "pages": [row["page"] for row in rows], "names": [row["name"] for row in rows], "reason": "conflicting matrices for one official code"})
            continue
        if len(rows) > 1:
            duplicates_identical.append({"code": code, "pages": [row["page"] for row in rows], "names": [row["name"] for row in rows]})
        selected[code] = rows
    return selected, {
        "source_rows": sum(len(rows) for rows in by_code.values()),
        "unique_codes": len(by_code),
        "identical_duplicate_codes": duplicates_identical,
        "conflicting_codes_excluded": conflicting,
    }


def attach_weightings(degrees: list[dict[str, Any]], matrices: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    cutoff_codes = {degree["official_code"] for degree in degrees}
    for degree in degrees:
        rows = matrices.get(degree["official_code"])
        if not rows:
            continue
        row = rows[0]
        for (subject_code, official_name), weight in zip(SUBJECTS, row["values"]):
            if weight is None:
                continue
            degree["weightings"].append({
                "id": stable_uuid("weighting", f"CAT:{degree['official_code']}:{ACADEMIC_YEAR}:{subject_code}"),
                "subject_code": subject_code,
                "official_subject_name": official_name,
                "weighting": weight,
                "rule_note": "Solo cuentan las dos materias aprobadas que aporten más puntos.",
                "academic_year": ACADEMIC_YEAR,
                "source_url": WEIGHTINGS_URL,
                "source_label": "Generalitat de Catalunya · Ponderacions 2026",
                "source_document": "Taula de ponderacions 2026 · versió 7",
                "source_page": row["page"],
                "source_updated_at": "2026-05-28",
                "verified_at": EXTRACTED_AT,
            })
    return {
        "join_method": "exact official five-digit code only",
        "matched_codes": sum(degree["official_code"] in matrices for degree in degrees),
        "cutoff_codes_without_weightings": sorted(degree["official_code"] for degree in degrees if degree["official_code"] not in matrices),
        "weighting_codes_without_cutoff": sorted(code for code in matrices if code not in cutoff_codes),
    }


def sql_literal(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float, Decimal)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def values_statement(table: str, columns: list[str], rows: Iterable[Iterable[Any]], update: str) -> str:
    materialized = list(rows)
    rendered = ",\n".join("  (" + ", ".join(sql_literal(value) for value in row) + ")" for row in materialized)
    return f"insert into public.{table} ({', '.join(columns)}) values\n{rendered}\non conflict (id) do update set {update};\n"


def validation_sql() -> str:
    checks = [
        ("Cataluña · universidades", 8, "select count(*) from public.orientation_universities where community = 'Cataluña' and active = true"),
        ("Cataluña · grados/centros", 560, "select count(*) from public.orientation_degrees where community = 'Cataluña' and active = true"),
        ("Cataluña · notas", 560, "select count(*) from public.orientation_admission_cutoffs where community = 'Cataluña' and academic_year = '2026-2027' and admission_round = 'primera_assignacio_juny' and status = 'verified'"),
        ("Cataluña · ponderaciones", 4797, "select count(*) from public.orientation_subject_weightings where community = 'Cataluña' and academic_year = '2026-2027' and status = 'verified'"),
        ("Madrid · universidades", 6, "select count(*) from public.orientation_universities where community = 'Comunidad de Madrid' and active = true"),
        ("Madrid · grados", 554, "select count(*) from public.orientation_degrees where community = 'Comunidad de Madrid' and active = true"),
        ("Madrid · notas", 554, "select count(*) from public.orientation_admission_cutoffs where community = 'Comunidad de Madrid' and academic_year = '2026-2027' and admission_round = 'grupo_1_ordinaria' and status = 'verified'"),
        ("Madrid · ponderaciones", 4473, "select count(*) from public.orientation_subject_weightings where community = 'Comunidad de Madrid' and academic_year = '2026-2027' and status = 'verified'"),
    ]
    rows = "\nunion all\n".join(
        f"select '{label}' as comprobacion, {expected}::bigint as esperado, ({query})::bigint as real"
        for label, expected, query in checks
    )
    return (
        "-- Ejecutar al final. Todas las filas deben devolver ok = true.\n"
        "with conteos as (\n" + rows + "\n)\n"
        "select comprobacion, esperado, real, real = esperado as ok from conteos order by comprobacion;\n\n"
        "-- Debe devolver cero filas: no puede haber códigos estables duplicados.\n"
        "select stable_code, count(*) as repeticiones from public.orientation_degrees\n"
        "where stable_code like 'CAT:%' group by stable_code having count(*) > 1;\n"
    )


def write_sql_chunks(output: Path, catalog: dict[str, Any], batch_size: int, schema_path: Path) -> tuple[list[str], list[str]]:
    sql_dir = output / "sql"
    sql_dir.mkdir(parents=True, exist_ok=True)
    for stale in sql_dir.glob("*.sql"):
        stale.unlink()
    (sql_dir / "00_LEEME.txt").unlink(missing_ok=True)

    schema_output = sql_dir / "01_schema.sql"
    schema_output.write_text(schema_path.read_text(encoding="utf-8"), encoding="utf-8", newline="\n")
    degree_rows = catalog["degrees"]
    definitions = [
        ("universities", "orientation_universities", ["id", "name", "acronym", "stable_code", "community", "official_url", "active"], [
            (u["id"], u["name"], u["acronym"], u["stable_code"], COMMUNITY, u["official_url"], True) for u in catalog["universities"]
        ], "name=excluded.name, acronym=excluded.acronym, stable_code=excluded.stable_code, community=excluded.community, official_url=excluded.official_url, active=excluded.active"),
        ("degrees", "orientation_degrees", ["id", "university_id", "name", "campus", "official_url", "active", "official_code", "official_name", "search_name", "degree_kind", "source_page", "source_section", "stable_code", "community"], [
            (d["id"], d["university_id"], d["official_name"], d["campus"], d["official_url"], True, d["official_code"], d["official_name"], d["search_name"], d["degree_kind"], d["source_page"], d["source_section"], d["stable_code"], COMMUNITY) for d in degree_rows
        ], "university_id=excluded.university_id, name=excluded.name, campus=excluded.campus, official_url=excluded.official_url, active=excluded.active, official_code=excluded.official_code, official_name=excluded.official_name, search_name=excluded.search_name, degree_kind=excluded.degree_kind, source_page=excluded.source_page, source_section=excluded.source_section, stable_code=excluded.stable_code, community=excluded.community"),
        ("cutoffs", "orientation_admission_cutoffs", ["id", "degree_id", "academic_year", "admission_round", "cutoff_score", "source_url", "source_label", "verified_at", "status", "access_group", "source_document", "source_page", "source_updated_at", "source_type", "community"], [
            (d["cutoff"]["id"], d["id"], ACADEMIC_YEAR, d["cutoff"]["admission_round"], d["cutoff"]["cutoff_score"], d["cutoff"]["source_url"], d["cutoff"]["source_label"], d["cutoff"]["verified_at"], "verified", d["cutoff"]["access_group"], d["cutoff"]["source_document"], d["cutoff"]["source_page"], d["cutoff"]["source_updated_at"], "official", COMMUNITY) for d in degree_rows
        ], "cutoff_score=excluded.cutoff_score, source_url=excluded.source_url, source_label=excluded.source_label, verified_at=excluded.verified_at, status=excluded.status, access_group=excluded.access_group, source_document=excluded.source_document, source_page=excluded.source_page, source_updated_at=excluded.source_updated_at, source_type=excluded.source_type, community=excluded.community"),
        ("weightings", "orientation_subject_weightings", ["id", "degree_id", "academic_year", "subject", "weighting", "source_url", "source_label", "verified_at", "status", "subject_code", "official_subject_name", "source_document", "source_page", "source_updated_at", "rule_note", "source_type", "community"], [
            (w["id"], d["id"], ACADEMIC_YEAR, w["official_subject_name"], w["weighting"], w["source_url"], w["source_label"], w["verified_at"], "verified", w["subject_code"], w["official_subject_name"], w["source_document"], w["source_page"], w["source_updated_at"], w["rule_note"], "official", COMMUNITY) for d in degree_rows for w in d["weightings"]
        ], "subject=excluded.subject, weighting=excluded.weighting, source_url=excluded.source_url, source_label=excluded.source_label, verified_at=excluded.verified_at, status=excluded.status, subject_code=excluded.subject_code, official_subject_name=excluded.official_subject_name, source_document=excluded.source_document, source_page=excluded.source_page, source_updated_at=excluded.source_updated_at, rule_note=excluded.rule_note, source_type=excluded.source_type, community=excluded.community"),
    ]
    seed_paths: list[str] = []
    index = 2
    for label, table, columns, rows, update in definitions:
        for start in range(0, len(rows), batch_size):
            part = start // batch_size + 1
            suffix = "" if len(rows) <= batch_size else f"_part_{part:02d}"
            path = sql_dir / f"{index:02d}_{label}{suffix}.sql"
            header = "-- Generated, idempotent Catalunya 2026-2027 seed chunk. Apply after migration 20260913120000.\n"
            path.write_text(header + values_statement(table, columns, rows[start:start + batch_size], update), encoding="utf-8", newline="\n")
            seed_paths.append(path.relative_to(output).as_posix())
            index += 1
    validation_path = sql_dir / f"{index:02d}_validation.sql"
    validation_path.write_text(validation_sql(), encoding="utf-8", newline="\n")
    manual_paths = [schema_output.relative_to(output).as_posix(), *seed_paths, validation_path.relative_to(output).as_posix()]
    readme = [
        "CARGA MANUAL SUPABASE · ORIENTACIÓN CATALUÑA 2026-2027",
        "",
        "Abre Supabase > SQL Editor. Ejecuta cada archivo completo, en este orden:",
        *[f"PASO {number}: {path.removeprefix('sql/')}" for number, path in enumerate(manual_paths, 1)],
        "",
        "Resultado final esperado en el último archivo:",
        "Cataluña: 8 universidades, 560 grados/centros, 560 notas y 4.797 ponderaciones.",
        "Madrid: 6 universidades, 554 grados, 554 notas y 4.473 ponderaciones.",
        "Todas las filas de conteo deben mostrar ok = true y la consulta de duplicados debe devolver cero filas.",
        "Los archivos son idempotentes: se pueden volver a ejecutar en el mismo orden.",
    ]
    (sql_dir / "00_LEEME.txt").write_text("\n".join(readme) + "\n", encoding="utf-8", newline="\n")
    return seed_paths, manual_paths


def validate(degrees: list[dict[str, Any]], excluded: list[dict[str, Any]], university_fallbacks: list[dict[str, Any]], matrix_report: dict[str, Any], join_report: dict[str, Any]) -> dict[str, Any]:
    errors = {
        "duplicate_codes": [code for code, count in Counter(d["official_code"] for d in degrees).items() if count > 1],
        "duplicate_ids": [value for value, count in Counter(d["id"] for d in degrees).items() if count > 1],
        "invalid_cutoffs": [d["official_code"] for d in degrees if not 5 <= d["cutoff"]["cutoff_score"] <= 14],
        "invalid_weightings": [w["id"] for d in degrees for w in d["weightings"] if w["weighting"] not in (0.1, 0.2)],
    }
    fatal = any(errors.values()) or set(d["university_code"] for d in degrees) != set(UNIVERSITIES)
    return {
        "status": "failed" if fatal else "passed",
        "academic_year": ACADEMIC_YEAR,
        "scope": {"universities": sorted(UNIVERSITIES), "cutoff_semantics": "PAU/CFGS · primera asignación de junio de 2026 (10/07/2026)", "join": "exact official code; no fuzzy fallback"},
        "counts": {
            "universities": len(set(d["university_code"] for d in degrees)),
            "degrees": len(degrees),
            "cutoffs": len(degrees),
            "weightings": sum(len(d["weightings"]) for d in degrees),
            "degrees_with_weightings": sum(bool(d["weightings"]) for d in degrees),
            "degrees_by_university": dict(sorted(Counter(d["university_code"] for d in degrees).items())),
        },
        "errors": errors,
        "matching": {**matrix_report, **join_report},
        "excluded_cutoff_rows": excluded,
        "university_resolution_fallbacks": university_fallbacks,
    }


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def build(args: argparse.Namespace) -> None:
    notes, weightings = args.notes.resolve(), args.weightings.resolve()
    if not notes.is_file() or not weightings.is_file():
        raise FileNotFoundError("Both official PDFs are required")
    degrees, excluded, university_fallbacks = parse_cutoffs(notes)
    matrices, matrix_report = parse_weightings(weightings)
    join_report = attach_weightings(degrees, matrices)
    universities = [{"id": stable_uuid("university", f"CAT:{code}"), "stable_code": f"CAT:{code}", "acronym": code, "name": name, "community": COMMUNITY, "official_url": url} for code, (name, url) in UNIVERSITIES.items()]
    university_ids = {u["acronym"]: u["id"] for u in universities}
    for degree in degrees:
        degree["university_id"] = university_ids[degree["university_code"]]
    universities.sort(key=lambda item: item["acronym"])
    degrees.sort(key=lambda item: item["official_code"])
    report = validate(degrees, excluded, university_fallbacks, matrix_report, join_report)
    if report["status"] != "passed":
        raise ValueError(json.dumps(report["errors"], ensure_ascii=False))
    catalog = {"academic_year": ACADEMIC_YEAR, "source_type": "official", "generated_at": EXTRACTED_AT, "scope": "Catalan university pre-enrolment system: seven public universities and UVic-UCC", "sources_manifest": "sources.json", "universities": universities, "degrees": degrees}
    sources = {"academic_year": ACADEMIC_YEAR, "extracted_at": EXTRACTED_AT, "landing_pages": [LANDING_URL, NOTES_PAGE_URL, WEIGHTINGS_PAGE_URL], "documents": [
        {"id": "catalunya-cutoffs-first-june-2026", "type": "official_cutoffs", "url": NOTES_URL, "local_filename": notes.name, "sha256": sha256(notes), "pages": 8, "source_updated_at": "2026-07-10"},
        {"id": "catalunya-weightings-2026-v7", "type": "official_weightings", "url": WEIGHTINGS_URL, "local_filename": weightings.name, "sha256": sha256(weightings), "pages": 28, "source_updated_at": "2026-05-28"},
    ]}
    write_json(args.output / "catalog.json", catalog)
    write_json(args.output / "sources.json", sources)
    write_json(args.output / "validation-report.json", report)
    chunks, manual_files = write_sql_chunks(args.output, catalog, args.batch_size, args.schema)
    args.migration.parent.mkdir(parents=True, exist_ok=True)
    migration_header = "-- Generated by scripts/orientation/import_catalunya_2026_2027.py.\n-- Apply schema migration 20260913120000 first. Idempotent; no destructive deletes.\n\n"
    args.migration.write_text(migration_header + "\n".join((args.output / chunk).read_text(encoding="utf-8") for chunk in chunks), encoding="utf-8", newline="\n")
    write_json(args.output / "sql-manifest.json", {"instructions": "sql/00_LEEME.txt", "schema_migration": "supabase/migrations/20260913120000_orientation_multi_community.sql", "seed_migration": "supabase/migrations/20260913121000_seed_orientation_catalunya_2026_2027.sql", "apply_in_order": manual_files, "seed_chunks": chunks, "idempotent": True, "batch_size": args.batch_size})
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2, sort_keys=True))


def parser() -> argparse.ArgumentParser:
    root = Path(__file__).resolve().parents[2]
    source = root / "tmp" / "pdfs" / "orientation-catalunya-2026"
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--notes", type=Path, default=source / "notes-tall-1a-assignacio-juny-2026.pdf")
    result.add_argument("--weightings", type=Path, default=source / "ponderacions-2026-v7.pdf")
    result.add_argument("--output", type=Path, default=root / "data" / "orientation" / "catalunya" / ACADEMIC_YEAR)
    result.add_argument("--batch-size", type=int, default=200)
    result.add_argument("--schema", type=Path, default=root / "supabase" / "migrations" / "20260913120000_orientation_multi_community.sql")
    result.add_argument("--migration", type=Path, default=root / "supabase" / "migrations" / "20260913121000_seed_orientation_catalunya_2026_2027.sql")
    return result


if __name__ == "__main__":
    try:
        build(parser().parse_args())
    except Exception as error:
        print(f"orientation import failed: {error}", file=sys.stderr)
        raise
