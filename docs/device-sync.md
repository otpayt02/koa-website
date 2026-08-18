# KOA device sync

GitHub is the shared source of truth for KOA. The `origin` remote should point to `https://github.com/otpayt02/koa-website.git` on every device.

## Set up another computer

1. In GitHub Desktop, clone `otpayt02/koa-website` into a normal local folder.
2. Open that cloned folder in Codex or Hermes.
3. Run `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-koa-auto-sync.ps1` once from the repository root.

The installed Windows task checks GitHub every minute. It commits safe project changes, rebases the latest shared work, and pushes when there is no conflict. GitHub Desktop will show the same repository and history.

## Important limits

- Do not edit the same file on two computers at the same time. Git will stop on a conflict; resolve it in GitHub Desktop before sync resumes.
- `.env` files, keys, credentials, personal tokens, and private connection settings are intentionally excluded. A Git repository is not a safe place for Hermes/MCP login secrets or webhook tokens.
- Versioned Hermes reference material under `.hermes/ref/` can sync automatically. Existing versioned attachments can update; review and commit new attachments manually. Reconnect any private apps, plugins, MCP servers, and webhooks on each computer using their own secure login/setup flow.
- GitHub syncs source files. Publishing to a `chatgpt.site` URL remains a separate deployment step.
