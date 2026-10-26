---
description: Restrict all file modifications and terminal operations strictly to admin_web directory
alwaysApply: true
---

# Scope Restriction: Only Edit Inside `admin_web`

- **Absolute Rule**: Never modify, create, move, or delete any file outside the `d:\project\AdminWeb\internalBRMP\admin_web` directory.
- Sibling folders such as `../client/`, `../backend/`, and `../brmpSPT/` are maintained by other team members and MUST NOT be modified under any circumstances.
- All file writes (`write_to_file`, `replace_file_content`, `multi_replace_file_content`) MUST target files inside `admin_web/`.
- Terminal working directory (`Cwd`) MUST always be `d:\project\AdminWeb\internalBRMP\admin_web`.
- Never run Git operations that touch, checkout, or merge changes into teammate folders outside `admin_web`.
