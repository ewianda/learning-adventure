#!/usr/bin/env bash

set -euo pipefail

if ! command -v gcloud > /dev/null 2>&1; then
  echo "gcloud CLI is required but was not found on PATH." >&2
  exit 1
fi

PROJECT_ID="${1:-}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "Usage: $0 <gcp-project-id>" >&2
  exit 1
fi

echo "Creating composite Firestore indexes for project: ${PROJECT_ID}"

gcloud firestore indexes composite create \
  --collection-group=activities \
  --project="${PROJECT_ID}" \
  --quiet \
  --field-config=field-path=childId,order=ascending \
  --field-config=field-path=date,order=descending

echo "All Firestore indexes created (or already exist)."
echo # Added for a clean newline
