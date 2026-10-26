# Agent Behavioral Rules & Workspace Boundaries

## CRITICAL SCOPE RESTRICTION: STRICTLY ADMIN_WEB ONLY

1. **ABSOLUTE WORKSPACE BOUNDARY**:
   - The agent is STRICTLY restricted to operating ONLY inside `d:\project\AdminWeb\internalBRMP\admin_web`.
   - Under NO circumstances should any file outside of `admin_web/` be edited, created, renamed, or deleted.
   - Sibling folders belong to other team members and MUST REMAIN 100% UNTOUCHED:
     * `../client/` (FORBIDDEN — Pegawai Portal milik rekan)
     * `../backend/` (FORBIDDEN — Backend API milik rekan)
     * `../brmpSPT/` (FORBIDDEN — SPT Portal milik rekan)
     * Root repository files (e.g., `../deploy_cpanel.py`, etc.) (FORBIDDEN)

2. **TOOL USAGE RESTRICTIONS**:
   - **File Operations** (`write_to_file`, `replace_file_content`, `multi_replace_file_content`): `TargetFile` MUST be inside `d:\project\AdminWeb\internalBRMP\admin_web\`.
   - **Terminal Commands** (`run_command`): `Cwd` MUST ALWAYS be `d:\project\AdminWeb\internalBRMP\admin_web`.
   - **Git Operations**: Do NOT run operations that overwrite or touch files outside `admin_web/` (e.g., merging branches that modify `client/` or `backend/`).

3. **TEAM INTEGRITY**:
   - This user develops exclusively the Admin Portal (`admin_web`).
   - Sibling directories must remain 100% untouched to prevent merge conflicts or unintended changes to teammates' code.
