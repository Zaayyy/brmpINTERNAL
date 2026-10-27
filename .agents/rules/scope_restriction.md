---
description: Strict scope restriction limiting edits to client/src/admin and server/src/admin
globs: **/*
alwaysApply: true
---

# Scope Restriction: Admin Only

The agent must STRICTLY limit any file modifications or creations to the following two directories:
1. `client/src/admin/` (Frontend Administrator)
2. `server/src/admin/` (Backend Administrator)

All other folders (such as `client/src/components/`, `server/src/routes/`, `server/src/data/`, `php_backend/`, `brmpSPT/`, etc.) must remain 100% UNTOUCHED to protect other team members' work.
