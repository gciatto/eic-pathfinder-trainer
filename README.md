# EIC Pathfinder Challenges 2026 — Evaluator quiz trainer

An independent, static web app for self-training on the **exact EIC Pathfinder Challenges 2026** questions and answers supplied with the EU Academy training materials.

**This is not EIC Pathfinder Open 2027 training.** The source documents explicitly identify the programme as *Pathfinder Challenges 2026*.

## Official source coverage

| App part | Official quiz title | Questions | Slides begin |
| --- | --- | ---: | ---: |
| A | General Overview | 13 | 2 |
| B | Guidance for IER and CR | 20 | 60 |
| C | Additional Questions and Lump Sum Budget | 11 | 111 |
| D | Vice Chairs Rapporteurs | 16 | 153 |
| E | VCPs – Individual Evaluation and Portfolio Building | 14 | 201 |
| **Total** | | **74** | |

The fifth quiz PDF is titled *VCPs – Individual Evaluation and Portfolio Building*, while the lecture PDF calls the matching training section *Part E – Guidance for preparation for Panel and portfolio building*.

The correct answers come from `EIC_Pathfinder_Consolidated_Answers.pdf`. **B16 has exactly two correct choices (B and D); all others are single-answer questions.** The PDF question text and response choices are preserved apart from whitespace normalization (line wraps). There are no generated questions or AI-authored explanations. Source PDF filenames and page numbers are shown with each answer. Some source documents contain typographical or grammatical errors, preserved as supplied.

**Answer option order is deliberately fixed.** Some original choices refer to earlier letters (e.g. “Both A and B”), so randomizing the choice order would invalidate them. Question order can be shuffled instead.

## Using the app

- Open `index.html` in a browser (the other files must be in the same directory), or use `eic-pathfinder-challenges-2026-trainer.html` for a single-file version.
- Select Part A, B, C, D, E, or All parts. Select practice (immediate answer feedback) or mock exam (reveal at end).
- Use the question bank for non-scored browsing, and Progress for coverage, lifetime accuracy, bookmarks, and incorrect answers.
- Answer choices can be selected using keys `1`–`5`. Part B Question 16 supports selecting multiple choices.
- Use **Relevant slides** at any time while answering or browsing the question bank. Feedback (including incorrect answers) and session reviews link to the same question-specific slides in a new tab, preserving your session. Page numbers refer to physical PDF pages, since printed slide numbers restart in each part.
- Progress is stored in the browser's `localStorage`. Export/import backup JSON to transfer devices.
- The project archive includes the seven original PDFs in `materials/`. Question and lecture slide links open the corresponding PDF page. The standalone version contains the full bank and keys; to use its slide links, keep the `materials/` folder beside `standalone.html` (the PDFs are not embedded).

## Deploying to GitHub Pages

1. Commit this directory to a GitHub repository's `master` branch.
2. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. The `site.yml` workflow validates quiz data on pushes/PRs. On `master` it deploys the site to GitHub Pages.

No build tool, Node dependencies, server backend, or third-party JS libraries are needed. Files can also be hosted by any static web server.

## Developing / validating

```sh
node --check app.js
node tests/validate.mjs
python scripts/build_standalone.py
python tests/browser_check.py  # requires Playwright and its Chromium browser, or system chromium
```

To regenerate the extracted question bank, run `pdftotext -enc UTF-8 -layout` on each quiz PDF and the consolidated answers into `source_extract/` with matching basenames, then run `python extract_questions.py` from the project root. The included `questions.json` and `questions.js` are generated from those inputs; refer to `extract_questions.py` for explicit mappings and validation. Its `SLIDE_PAGES` mapping records the relevant lecture PDF pages for each question.

## Source and attribution

Materials supplied by the user:

- `EIC_Pathfinder_Part_A_Questions.pdf`
- `EIC_Pathfinder_Part_B_Questions.pdf`
- `EIC_Pathfinder_Part_C_Questions.pdf`
- `EIC_Pathfinder_Part_D_Questions.pdf`
- `EIC_Pathfinder_VCPs_Questions.pdf`
- `EIC_Pathfinder_Consolidated_Answers.pdf`
- `EU_Academy-EIC_2026_Pathfinder_Challenges.pdf`

Original publisher: **European Innovation Council / EISMEA / European Union**. The lecture document states EU reuse attribution conditions (CC BY 4.0, with separate rights potentially applying to third-party materials). The website is **not affiliated with or endorsed by the European Commission**.

This repository's app code may be reused independently of the included training documents, subject to those documents' own licensing and attribution requirements.
