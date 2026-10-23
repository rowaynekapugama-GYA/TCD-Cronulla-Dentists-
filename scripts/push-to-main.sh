#!/usr/bin/env bash
#
# The Cronulla Dentists: put a new full-repo zip straight onto `main` (the live site) and confirm the
# Vercel production deployment. Written for the 23 Oct 2026 nib removal (v2.2.4).
#
#   bash push-to-main.sh <zip or folder> ["commit message"] [--build]
#
#   --build   also run `npm ci` and `npm run build` on this Mac before pushing (slower; GYA already
#             built and checked this version before packaging it).
#
# What it does, in order:
#   1. unpacks the zip and checks it is The Cronulla Dentists repo with no secrets in it
#   2. downloads a fresh copy of the GitHub repo (never touches your Downloads folder)
#   3. replaces every file on `main` with the zip, shows exactly what changes, asks you to type yes
#   4. commits and pushes to `main` (never a force push); Vercel starts the production build itself
#   5. shows the Vercel deployments and only runs `vercel --prod` if you ask for it
#   6. once you say it is live, checks the live pages no longer mention nib
#
# Undo: bash push-to-github.sh rollback   (it uses the "before" commit this script records)
# Works with macOS's built-in bash 3.2, git and curl. Vercel CLI is optional (npm i -g vercel).

set -euo pipefail

PROJECT="the-cronulla-dentists"
VERCEL_PROJECT="tcd-cronulla-dentists-ygl2"
LIVE_BRANCH="main"
SITE="${CHECK_SITE:-https://www.thecronulladentists.com.au}"
HOME_DIR="${HOME}/gya-deploy"
WORK="${HOME_DIR}/cronulla-main"
CONF="${HOME_DIR}/cronulla-repo-url.txt"
LAST_MAIN="${HOME_DIR}/cronulla-main-before-promote.txt"
DEFAULT_MSG="chore: remove NIB references from Cronulla site per client request"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
bold() { printf '\033[1m%s\033[0m\n' "$*"; }
die() {
  red "Stopped: $*"
  exit 1
}
ask() {
  # ask "question" -> prints the answer
  local a
  printf '%s ' "$1" >&2
  read -r a
  printf '%s' "$a"
}

# ---------------------------------------------------------------- arguments
SRC_IN=""
MSG="$DEFAULT_MSG"
BUILD=0
for arg in "$@"; do
  case "$arg" in
    --build) BUILD=1 ;;
    *)
      if [ -z "$SRC_IN" ]; then SRC_IN="$arg"; else MSG="$arg"; fi
      ;;
  esac
done
[ -n "$SRC_IN" ] || die "tell me where the new version is, e.g. bash push-to-main.sh ~/Downloads/cronulla-CMS-v2.2.4-FULL-REPO.zip"
[ -e "$SRC_IN" ] || die "${SRC_IN} does not exist."
command -v git >/dev/null 2>&1 || die "git is not installed. Run: xcode-select --install"
mkdir -p "$HOME_DIR"

# ---------------------------------------------------------------- 1. unpack and check the zip
TMP_UNPACK="$(mktemp -d "${HOME_DIR}/unpack.XXXXXX")"
trap 'rm -rf "${TMP_UNPACK:-}"' EXIT
if [ -d "$SRC_IN" ]; then
  cp -R "$SRC_IN"/. "$TMP_UNPACK"/
else
  command -v unzip >/dev/null 2>&1 || die "unzip is not installed."
  unzip -q "$SRC_IN" -d "$TMP_UNPACK"
fi
# The shallowest package.json is the repo root.
PKG="$(find "$TMP_UNPACK" -name package.json -not -path '*/node_modules/*' | awk '{ print length(), $0 }' | sort -n | awk 'NR == 1 { sub(/^[0-9]+ /, ""); print }')"
[ -n "$PKG" ] || die "no package.json found in ${SRC_IN}."
SRC="$(dirname "$PKG")"
grep -q "\"name\": \"${PROJECT}\"" "$SRC/package.json" || die "that is not The Cronulla Dentists repo."
VERSION="$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' "$SRC/package.json" | head -1)"
# Never publish build output, installed packages or secrets.
rm -rf "$SRC/node_modules" "$SRC/.next" "$SRC/out" "$SRC/media" "$SRC/.git" "$SRC/.vercel"
find "$SRC" -name '.DS_Store' -delete
if [ -n "$(find "$SRC" -maxdepth 1 -name '.env*' ! -name '.env.example')" ]; then
  die "the zip contains a .env file (secrets). Delete it and run again."
fi
bold "New version: v${VERSION}"

# ---------------------------------------------------------------- 2. fresh copy of the repo
if [ -s "$CONF" ]; then
  REPO_URL="$(cat "$CONF")"
else
  REPO_URL="$(ask 'GitHub repo address (green Code button > HTTPS, ends in .git):')"
  case "$REPO_URL" in https://github.com/* | git@github.com:*) ;; *) die "that does not look like a GitHub repo address." ;; esac
  printf '%s\n' "$REPO_URL" >"$CONF"
fi
rm -rf "$WORK"
bold "Downloading a fresh copy of ${REPO_URL}…"
git clone --quiet "$REPO_URL" "$WORK" || die "could not download the repo. Check you are signed in to GitHub (see the token steps)."
cd "$WORK"
git switch --quiet "$LIVE_BRANCH" 2>/dev/null || git switch --quiet -c "$LIVE_BRANCH" "origin/${LIVE_BRANCH}"
BEFORE="$(git rev-parse HEAD)"
bold "Live (${LIVE_BRANCH}) is now:"
git log -1 --format='   %h  %s  (%cr)'

# ---------------------------------------------------------------- 3. replace the files and show the change
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$SRC"/. .
git add -A
if git diff --cached --quiet; then
  green "The live site already has exactly this version. Nothing to push."
  exit 0
fi
echo
bold "Files that change on the live site:"
git diff --cached --name-status | sed 's/^/   /'
echo
git diff --cached --shortstat
echo
# Anything other than the nib removal shows up here too: read the list before saying yes.
if git diff --cached --name-only | grep -qE '^(lib/relay\.ts|app/api/ensure-admin|docs/EMAIL-FORMS-SETUP\.md)'; then
  yellow "Note: this also puts earlier GYA updates live that were not on main yet (form emails / sign-in rescue)."
fi
# The only places 'nib' may still appear are the notes that explain the removal.
LEFT="$(grep -rniIE '(^|[^a-z])nib([^a-z]|$)' . --exclude-dir=.git --exclude-dir=node_modules \
  | grep -v -E '^\./(CHANGELOG\.md|README-CMS\.md|IMAGES-NEEDED\.md|cms/contentFixes\.ts|scripts/check-banned\.mjs|scripts/push-to-main\.sh|lib/providers\.ts|content/source/)' || true)"
if [ -n "$LEFT" ]; then
  red "nib still appears in these files:"
  printf '%s\n' "$LEFT" | sed 's/^/   /'
  [ "$(ask 'Push anyway? Type yes to continue:')" = "yes" ] || die "nothing was pushed."
else
  green "Checked: no nib on any page, image or setting in this version."
fi

# Optional: prove it builds on this Mac too (Vercel builds it again anyway).
if [ "$BUILD" = "1" ]; then
  command -v npm >/dev/null 2>&1 || die "npm is not installed (needed for --build)."
  bold "Installing packages and building (a few minutes)…"
  npm ci --no-audit --no-fund >/dev/null || die "npm ci failed; nothing was pushed."
  PAYLOAD_SECRET=local-build-check npm run build >/tmp/cronulla-build.log 2>&1 || { tail -30 /tmp/cronulla-build.log; die "the build failed; nothing was pushed."; }
  rm -rf node_modules .next
  git add -A
  green "Build OK."
fi

[ "$(ask "Type yes to commit and push this to ${LIVE_BRANCH} (the live site):")" = "yes" ] || die "nothing was pushed."

# ---------------------------------------------------------------- 4. commit and push
git -c user.name="$(git config user.name || echo GYA)" -c user.email="$(git config user.email || echo rowayne@gyaclients.com)" \
  commit --quiet -m "$MSG" -m "Website v${VERSION}. 23 Oct 2026: NIB removed per client request (Ram), pending NIB provider approval. Reinstate when confirmed."
printf '%s\n' "$BEFORE" >"$LAST_MAIN" # lets `push-to-github.sh rollback` put the old version back
# Plain push, never --force: if someone changed main in the meantime, GitHub refuses and nothing changes.
git push --quiet origin "HEAD:refs/heads/${LIVE_BRANCH}" || die "GitHub refused the push (someone changed ${LIVE_BRANCH}, or sign-in failed). Nothing changed; run the script again."
NEW="$(git rev-parse --short HEAD)"
green "Pushed to ${LIVE_BRANCH}: commit ${NEW}. Vercel has started the production build from it (about 3 minutes)."

# ---------------------------------------------------------------- 5. Vercel
echo
if command -v vercel >/dev/null 2>&1 && vercel whoami >/dev/null 2>&1; then
  # Link this copy to the right Vercel project (no prompts), then list the latest deployments.
  vercel link --yes --project "$VERCEL_PROJECT" >/dev/null 2>&1 || yellow "Could not link to ${VERCEL_PROJECT}; listing may be empty."
  sleep 15
  bold "Latest Vercel deployments (look for Production building from ${NEW}):"
  vercel ls "$VERCEL_PROJECT" 2>/dev/null | head -12 || true
  echo
  # The push above already deploys. `vercel --prod` uploads this copy as a SECOND production
  # deployment, so only use it if no Production deployment appeared from the push.
  if [ "$(ask 'Run vercel --prod as well? Only if no new Production deployment is listed above. (y/N):')" = "y" ]; then
    vercel --prod --yes
  fi
else
  yellow "Vercel CLI not found or not signed in, which is fine: the push already started the deployment."
  echo "   Check it at vercel.com > ${VERCEL_PROJECT} > Deployments (top row: Production, ${LIVE_BRANCH}, ${NEW})."
  echo "   To use the CLI next time: npm i -g vercel && vercel login"
fi

# ---------------------------------------------------------------- 6. confirm on the live site
echo
ask "When the Production deployment shows Ready, press Return to check the live pages…" >/dev/null
FAIL=0
for p in / /finances/ /contact/ /dental-implants-cronulla/ /services/; do
  # An empty page means the check itself failed (no connection), which must never read as "no nib".
  body="$(curl -s -L --max-time 20 "${SITE}${p}?check=$(date +%s)" || true)"
  if [ -z "$body" ]; then yellow "   ${p}  could not load the page, check it in a browser"; FAIL=1; continue; fi
  n="$(printf '%s' "$body" | grep -oiE '(^|[^a-z])nib([^a-z]|$)' | wc -l | tr -d ' ' || true)"
  if [ "$n" = "0" ]; then green "   ${p}  no nib"; else red "   ${p}  nib found ${n} time(s)"; FAIL=1; fi
done
n="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "${SITE}/images/providers/nib.png" || true)"
if [ "$n" = "404" ]; then green "   nib logo file  gone (404)"; else yellow "   nib logo file  returned ${n} (a cached copy can linger for a short while)"; fi
echo
if [ "$FAIL" = "0" ]; then
  green "Done. nib is off the live site."
else
  red "Not confirmed yet (see above). If the deployment was not Ready, wait a minute and run:"
  echo "   curl -s ${SITE}/finances/ | grep -ci nib"
  echo "If it persists, check the build log in Vercel for lines starting [content-fixes]."
fi
echo "Undo if needed:  bash $(dirname "$0")/push-to-github.sh rollback"
