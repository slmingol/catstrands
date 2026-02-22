#!/bin/bash

# Script to commit changes and automatically bump patch version
# Usage: ./scripts/commit-and-release.sh "commit message"

if [ -z "$1" ]; then
  echo "Error: Commit message required"
  echo "Usage: ./scripts/commit-and-release.sh \"your commit message\""
  exit 1
fi

COMMIT_MSG="$1"

# Check if there are changes to commit
if git diff --quiet && git diff --staged --quiet; then
  echo "No changes to commit"
  exit 0
fi

# Add all changes
git add -A

# Commit with the provided message
git commit -m "$COMMIT_MSG"

# Bump patch version (this also commits and pushes)
npm version patch --no-git-tag-version

# Get the new version
VERSION=$(node -p "require('./package.json').version")

# Amend the last commit to include version bump
git add package.json
git commit --amend --no-edit

# Push to remote
git push

# Create and push tag
git tag "v$VERSION"
git push --tags

echo "✅ Released v$VERSION"
