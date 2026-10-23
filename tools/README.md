# Analysis tools

`ftir/` (FT-IR band assignment) and `xrd/` (X-ray diffraction phase matching) are the two analysis tools of the portal. Both are client-side ES modules; nothing is uploaded.

```sh
npm run test:tools      # 45 tests: science, Persian layer, reports (run from the portal root)
```

`package.json` here only marks the folder as ES modules. The READMEs inside each tool describe the science and the data, and were written when the tools were standalone; their "run" instructions no longer apply (the portal serves them). See `docs/integration/PROPOSAL.md` for the integration plan and status.

## History

Both tools were imported with `git subtree`, so their original commits are part of this repository.

- `git blame <file>` follows into the original commits.
- `git log --follow` does **not** cross the import. To read a tool's own history, use the import's second parent:

```sh
git log --oneline bcbc084^2 -- science.js     # FT-IR (paths are relative to the old repository root)
git log --oneline 668251a^2 -- science.js     # XRD
```

## XRD data

`xrd/references.json` is generated from the pinned CIF files in `xrd/library/cif/` by `xrd/scripts/build_library.py` (Python 3.13, `requirements-library.txt`). `xrd/.gitattributes` keeps the CIF bytes exact (`-text`) so the SHA-256 test passes on every platform; do not remove it.
