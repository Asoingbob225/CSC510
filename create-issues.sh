#!/usr/bin/env bash
# Script to help create GitHub issues for Hello Workflow
# Usage: ./create-issues.sh

set -e

REPO="Asoingbob225/CSC510"
ISSUES_DIR="docs/issues"

echo "🚀 Hello Workflow Issue Creator"
echo "================================"
echo ""
echo "This script helps create GitHub issues from the templates in ${ISSUES_DIR}/"
echo ""
echo "Prerequisites:"
echo "  - GitHub CLI (gh) must be installed and authenticated"
echo "  - You must have write access to the repository"
echo ""
echo "To install GitHub CLI:"
echo "  - macOS: brew install gh"
echo "  - Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
echo "  - Windows: https://github.com/cli/cli/releases"
echo ""
echo "Authenticate with: gh auth login"
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "   Please install it from https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo "   Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Confirm before proceeding
read -p "Create issues from templates? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Creating issues..."
echo ""

# Array to store created issue numbers
declare -a issue_numbers

# Create issues from each template
for i in {1..8}; do
    issue_file="${ISSUES_DIR}/0${i}-*.md"
    
    if [ ! -f $issue_file ]; then
        echo "⚠️  Warning: Issue file ${issue_file} not found, skipping..."
        continue
    fi
    
    filename=$(basename $issue_file)
    echo "Creating issue from ${filename}..."
    
    # Extract title (first line starting with #)
    title=$(grep -m 1 "^# " "$issue_file" | sed 's/^# //')
    
    # Extract labels if present
    labels=$(grep -m 1 "^\*\*Labels:\*\*" "$issue_file" | sed 's/\*\*Labels:\*\* //' | sed 's/`//g')
    
    # Create the issue and capture the number
    issue_url=$(gh issue create \
        --repo "$REPO" \
        --title "$title" \
        --body-file "$issue_file" \
        --label "hello-workflow" \
        ${labels:+--label "$labels"})
    
    issue_number=$(echo "$issue_url" | grep -o '[0-9]*$')
    issue_numbers+=("$issue_number")
    
    echo "✅ Created issue #${issue_number}: ${title}"
    echo "   ${issue_url}"
    echo ""
    
    # Small delay to avoid rate limiting
    sleep 1
done

echo ""
echo "🎉 All issues created successfully!"
echo ""
echo "Created issues:"
for i in "${!issue_numbers[@]}"; do
    num=$((i + 1))
    echo "  Issue ${num}: #${issue_numbers[$i]}"
done

echo ""
echo "Next steps:"
echo "  1. Review the created issues on GitHub"
echo "  2. Assign each issue to a different teammate"
echo "  3. Update 'Closes #[ISSUE_NUMBER]' in each issue with the actual number"
echo "  4. Add any additional context or specific requirements"
echo ""
echo "Issues can be found at: https://github.com/${REPO}/issues"
echo ""
