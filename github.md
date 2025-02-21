
# 1. First, ensure both branches exist remotely
git checkout dev
git push -u origin dev  # Create dev branch on remote if missing
git checkout test
git push -u origin test  # Create test branch on remote if missing

# 2. Get latest changes from remote
git fetch --all  # Refresh all remote branches

# 3. Merge test into dev
git checkout dev
git merge test

# 4. If merge conflicts occur:
# - Fix files with conflicts
# - Mark them resolved with:
git add .
git commit -m "Resolve merge conflicts"

# 5. Push the merged result
git push origin dev

E78

Press i to enter insert mode
2. Write a meaningful merge message like: "Merge test branch into dev for feature updates"
Press ESC to exit insert mode
Type :wq and press Enter to save and quit
If you want to abort the merge instead:
Delete all lines (including the commented ones)
Press ESC
3. Type :q! and press Enter



SUMMARY

git add .
git commit -m "Resolve merge conflicts"

git checkout dev
git merge test
git push origin dev
git checkout test