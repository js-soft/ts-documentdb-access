#!/usr/bin/env bash
set -euo pipefail

allowed_labels=(
  "breaking-change"
  "bug"
  "chore"
  "ci"
  "dependencies"
  "documentation"
  "enhancement"
  "refactoring"
  "test"
  "wip"
)

if [[ -z "${GITHUB_EVENT_PATH:-}" ]]; then
  echo "GITHUB_EVENT_PATH is not set."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to validate pull request labels."
  exit 1
fi

mapfile -t pr_labels < <(jq -r '.pull_request.labels[].name // empty' "$GITHUB_EVENT_PATH")

if [[ ${#pr_labels[@]} -eq 0 ]]; then
  echo "Pull request must have at least one label."
  exit 1
fi

for label in "${pr_labels[@]}"; do
  for allowed in "${allowed_labels[@]}"; do
    if [[ "$label" == "$allowed" ]]; then
      echo "Found valid label: $label"
      exit 0
    fi
  done
done

echo "No valid labels found on pull request."
echo "Allowed labels: ${allowed_labels[*]}"
exit 1
