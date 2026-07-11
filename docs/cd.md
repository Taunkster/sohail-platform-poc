# Continuous Deployment

## CI vs CD
- **Continuous Integration (CI):** Automatically building and testing every code change.
- **Continuous Deployment (CD):** Automatically releasing every passing build to production.

## Gating on Green Builds
Deployment is gated on a green build - tests must pass. This ties to our Phase 4/5 test suite that validates:
- Row-Level Security
- Cross-tenant isolation
- API contract compliance

## Rollback Strategy
A rollback reverts to the last known good deployment. Our pipeline supports:
- Git revert on main
- Manual redeploy of previous commit SHA via Render dashboard

## Pipeline Design
- Test job runs first on any push
- Deploy job only runs if tests pass AND branch is main
- Secrets stored encrypted in GitHub Secrets

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Broken code reaches production | Test gate blocks deployment |
| Logical error passes tests | Staging environment (future) |
| Deployment fails | Rollback to previous version |
| Secrets exposed | GitHub encrypted secrets |