## GitHub Issue Editing Guidelines (using gh with a temporary Markdown file)

Goal: keep web rendering correct, content traceable, and the workflow reusable.

Operational notes:

- Store the issue body in a temporary Markdown file to avoid `\n` escape issues.
- Update issues with `--body-file`; include `--title` if you also rename the issue.
- Reference concrete paths in the body (router/service/schemas/function names).
- Cross-link related issues and task identifiers (for example `#106`, `BE-04-001`).
- Confirm milestone and state before editing:
  - `gh issue list --state all --milestone "M4 - AI Recommendation Engine"`
  - `gh issue list --state open --milestone "M3 - Health Profile Implementation"`

Recommended workflow (temporary file):

```bash
BODY=$(mktemp)
cat > "$BODY" << 'MD'
# <Title>

## Why
- ...

## Scope / Requirements
- ...

## Acceptance Criteria
- ...

## Implementation Paths
- Router: backend/src/eatsential/routers/recommend.py
- Service: backend/src/eatsential/services/recsys
- Schemas: backend/src/eatsential/schemas/recommendation.py
- Function(s): score_candidates_baseline(candidates, user_ctx)

## Links
- #<id>
MD

gh issue edit <number> --title "<new title>" --body-file "$BODY"
rm -f "$BODY"
```

Do / Don’t:

- Do: use `--body-file`, include concrete paths, add cross-links.
- Don’t: write multi-line content directly inside `--body` with embedded `\n`.

---

## Templates (for issue bodies)

### Subtask template

```
# <Concise Title>

## Why

- <reason 1>
- <reason 2>

## Scope / Requirements

- <requirement 1>
- <requirement 2>

## Acceptance Criteria

- <criterion 1>
- <criterion 2>

## Implementation Paths

- Router: `<path>`
- Service: `<path>`
- Schemas: `<path>`
- Function(s): `<signature>`

## Links

- #<issue-id> <short desc>
- <Task ID> <short desc>
```

### API task template

```
# <API Task Title>

## API Endpoints

- `METHOD /path` — <short description>

## Requirements

- <requirement 1>
- <requirement 2>

## Modules / Paths

- Router: `<path>`
- Service: `<path>`
- Schemas: `<path>`

## Observability

- <metric/log>

## Links

- #<issue-id>
```
