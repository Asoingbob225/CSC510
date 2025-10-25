---
applyTo: "**"
---

## How to run command

This is a monoproject repository. To run commands, you need to navigate to the specific project directory first. Then based on the package manager used in that project, you can run the desired command. We use `uv` for backend projects and `bun`/`bunx` for frontend projects. For the overall monorepo, we use `bun`/`bunx`.

For example, to run a command in the `proj2` backend, you would do the following using `uv` as pkg manager:

```bash
cd proj2/backend
uv run pytest ...
```

To run a command in the `proj2` frontend, you would do the following using `bun` as pkg manager:

```bash
cd proj2/frontend
bunx vitest ...
```
