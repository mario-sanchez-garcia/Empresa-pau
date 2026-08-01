-- fix_curriculum_content.sql
-- Correcciones de LaTeX corrupto (TAREA 1) + renumeración de headings (TAREA 2)
-- Ejecutar en Supabase SQL Editor. Las dos tareas son idempotentes.
-- Ejecutar TAREA 1 primero, luego TAREA 2.


-- ══════════════════════════════════════════════════════════════════════
-- TAREA 1: Corrección de patrones LaTeX corruptos via REPLACE()
-- Solo modifica los 3 registros afectados. Los demás no se tocan.
-- ══════════════════════════════════════════════════════════════════════

-- algebra-lineal:matrices-operaciones
UPDATE curriculum_content
SET content_markdown = REPLACE(
    content_markdown,
    '**$|A^{-1**|$:}',
    '**$|A^{-1}|$:**')
WHERE subject = 'matematicas_ii'
  AND block_slug = 'algebra-lineal'
  AND topic_slug = 'matrices-operaciones';

-- algebra-lineal:sistemas-gauss
UPDATE curriculum_content
SET content_markdown = REPLACE(
    content_markdown,
    '\begin{pmatrix** 5 \\ 17 \end{pmatrix}$):}',
    '\begin{pmatrix} 5 \\ 17 \end{pmatrix}$):**')
WHERE subject = 'matematicas_ii'
  AND block_slug = 'algebra-lineal'
  AND topic_slug = 'sistemas-gauss';

-- geometria-3d:producto-vectorial
UPDATE curriculum_content
SET content_markdown = REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    content_markdown,
    '$\overrightarrow{AB**$:}',
    '$\overrightarrow{AB}$:**'),
    '($||\vec{u**||$):}',
    '($||\vec{u}||$):**'),
    '($\vec{u** \perp \vec{v}$):}',
    '($\vec{u} \perp \vec{v}$):**'),
    '$\vec{u** \times \vec{v}$ por Sarrus:}',
    '$\vec{u} \times \vec{v}$ por Sarrus:**'),
    '($\mathbb{R' || chr(10) || '^2$)}',
    '($\mathbb{R}^2$)'),
    '($\mathbb{R' || chr(10) || '^3$)}',
    '($\mathbb{R}^3$)'),
    '($\vec{u' || chr(10) || ' \cdot \vec{v}$)}',
    '($\vec{u} \cdot \vec{v}$)'),
    '($\vec{u' || chr(10) || ' \times \vec{v}$)}',
    '($\vec{u} \times \vec{v}$)')
WHERE subject = 'matematicas_ii'
  AND block_slug = 'geometria-3d'
  AND topic_slug = 'producto-vectorial';
