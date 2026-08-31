<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project instructions

- This project is Kairo/Pausia, an educational application for preparing for the PAU.
- This is a shared repository. Before editing, review `git status`, the current branch, and the configured remote. Update from `origin/main` without overwriting local changes.
- Never force-push.
- Do not modify, restore, or include other people's local changes in commits.
- Do not touch the untracked file `te en MathAnswerToolbar`.
- If the following files appear locally modified, do not touch them or include them in commits:
  - `docs/beta/explicacion-pausia-camino-pau-beta.pdf`
  - `docs/qa/p0-corrections-report.json`
- The aesthetic commit `c7cc073` attempted to refine Camino, the sidebar, themes, chat, and onboarding, but the visual changes appeared imperceptible.
- Before making another aesthetic change, verify whether the deployment contains the commit, whether the styles are being applied, and whether Tailwind is overriding them.
- For exclusively aesthetic tasks, do not modify logic, LaTeX/KaTeX, prompts, academic data, Supabase, Google Calendar, the scheduler, corrections, authentication, or billing.
- Before finishing any task, review the diff and run the appropriate validations.
