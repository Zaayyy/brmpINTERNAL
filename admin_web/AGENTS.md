# Agent Instructions & Boundary Rules

## CRITICAL SCOPE RESTRICTION: STRICTLY ADMIN_WEB ONLY

1. **ABSOLUTE WORKSPACE BOUNDARY**:
   - The agent is STRICTLY restricted to operating ONLY inside `d:\project\AdminWeb\internalBRMP\admin_web`.
   - NEVER create, edit, rename, move, or delete any file or directory outside of `admin_web/`.
   - Sibling folders belong to other team members and MUST REMAIN 100% UNTOUCHED:
     * `../client/` (FORBIDDEN)
     * `../backend/` (FORBIDDEN)
     * `../brmpSPT/` (FORBIDDEN)
     * Root files (e.g., `../deploy_cpanel.py`, `../README.md`, etc.) (FORBIDDEN)

2. **TOOL USAGE RESTRICTIONS**:
   - **File Write Tools** (`write_to_file`, `replace_file_content`, `multi_replace_file_content`): `TargetFile` MUST be inside `d:\project\AdminWeb\internalBRMP\admin_web\`. Reject any request that would write to external folders.
   - **Terminal Commands** (`run_command`): `Cwd` MUST ALWAYS be `d:\project\AdminWeb\internalBRMP\admin_web`. Never run commands that operate outside this folder.
   - **Git Operations**: Never perform merges, resets, checkouts, or pulls that overwrite, discard, or conflict with sibling directories (`client/`, `backend/`, etc.).

3. **DEVELOPMENT FOCUS**:
   - All code, components, styles, routes, configurations, and API services for the Admin Portal must be self-contained within `admin_web/`.
