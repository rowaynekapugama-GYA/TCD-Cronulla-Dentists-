"""Port the APE website's site.css into a stylesheet scoped to the Cronulla site's .ape-page wrapper.

    python3 -I scripts/port-ape-css.py <APE site.css> <out.css> [template.tsx ...]

- @font-face and the next/font helper classes are dropped (fonts come from components/ape/fonts.ts).
- :root / html / body / main become .ape-page.
- Every other class is renamed .X -> .ape-X so nothing collides with the Cronulla design system, and
  every selector is prefixed with .ape-page. `.reveal` and its `.in` state keep their names, because
  the same two classes drive the scroll reveal on the rest of the site.
- The APE site hides reveals only when its script is running (`.js .reveal`). Here the `.js` gate is
  dropped (the layout's <noscript> rule shows everything without JavaScript), and the "script has
  started" gate `html:not(.js-ready)` becomes `.ape-page:not(.ape-js-ready)`, set by
  components/ape/ApeBehaviour.tsx.
- Every `h1` rule also applies to `.ape-h1`: on this site the page's own H1 is a small line, and the
  APE hero question takes the APE h1 look without being the h1.
- Header, nav, footer, booking and "Opening special" rules are left out (this site has its own header
  and footer, and booking stays on the APE website).
- When template files are given, only rules whose classes the templates use are kept.
"""
import re, sys

src = open(sys.argv[1], encoding='utf8').read()
src = re.sub(r'/\*.*?\*/', '', src, flags=re.S)
out_path = sys.argv[2]

DROP = ['.site-header', '.nav', '.burger', '.mobile-menu', '.scroll-progress', '.site-footer', '.appt-card',
        '#booking', '.chosen-clinic', '.slot-err', '.notice-24h', '.confirm',
        '.plain-page', '.logo', '.__className', '.__variable', '.sr-only', '.path',
        '.disclaimer', '#contact', '.tagline', '.legal', '.foot', '.hero-banner', '.ph-label', '.bio-soon',
        '.special-', '.questionnaire', '.q-', '.pay-', '.policy', '.age-', '.booking', '.skip-link', 'dialog']

# Classes the templates use (only when template files are passed): rules for anything else are left out.
KEEP_AS_IS = {'reveal', 'in'}
USED = None
if len(sys.argv) > 3:
    USED = {'ape-page', 'ape-is-collapsed', 'ape-js-ready'}
    for path in sys.argv[3:]:
        USED.update(re.findall(r'ape-[a-z0-9][a-z0-9-]*', open(path, encoding='utf8').read()))

def parse(block):
    """Return a list of (prelude, body_or_children). Minified CSS, so whitespace is light."""
    items = []
    i = 0
    n = len(block)
    while i < n:
        while i < n and block[i] in ' \n\t\r;':
            i += 1
        if i >= n:
            break
        j = block.find('{', i)
        if j == -1:
            break
        prelude = block[i:j].strip()
        depth = 1
        k = j + 1
        while k < n and depth:
            if block[k] == '{':
                depth += 1
            elif block[k] == '}':
                depth -= 1
            k += 1
        body = block[j + 1:k - 1]
        if prelude.startswith('@') and not prelude.startswith('@font-face'):
            items.append((prelude, parse(body)))
        else:
            items.append((prelude, body))
        i = k
    return items

CLASS_RE = re.compile(r'\.(?!ape-page)([A-Za-z_][\w-]*)')

def rename(m):
    name = m.group(1)
    return '.' + name if name in KEEP_AS_IS else '.ape-' + name

def scope_selector(sel):
    s = sel.strip()
    if any(d in s for d in DROP):
        return None
    if s in (':root', 'html', 'body', 'main'):
        return '.ape-page'
    not_ready = s.startswith('html:not(.js-ready) ')
    if not_ready:
        s = s[len('html:not(.js-ready) '):]
    if s.startswith('.js '):
        s = s[4:]
    if s.startswith('html') or s.startswith('.js'):
        return None
    s = s.replace('main section[id],', '.ape-page section[id],').replace('main article[id]', '.ape-page article[id]')
    # body.home (the APE homepage) is the page wrapper itself, not a descendant
    if s.startswith('body.'):
        return keep_used('.ape-page' + CLASS_RE.sub(rename, s[4:]))
    # `.home .hero`: `home` is the body class on the APE homepage, which is the wrapper here
    if s.startswith('.home '):
        return keep_used('.ape-page.ape-home ' + CLASS_RE.sub(rename, s[6:]))
    if s.startswith('.ape-page'):
        return s
    s = CLASS_RE.sub(rename, s)
    if s.startswith('main '):
        s = s[5:]
    out = ('.ape-page:not(.ape-js-ready) ' if not_ready else '.ape-page ') + s
    out = keep_used(out)
    if out and re.search(r'(^|[\s>+~,])h1(?![\w-])', out):
        out = out + ',' + re.sub(r'(^|[\s>+~,])h1(?![\w-])', r'\1.ape-h1', out)
    return out

def keep_used(sel):
    if USED is None:
        return sel
    for name in re.findall(r'\.([A-Za-z_][\w-]*)', sel):
        if name in KEEP_AS_IS:
            continue
        if name not in USED:
            return None
    return sel

def fix_body(prelude, body):
    if prelude == ':root':
        body = body.replace('--serif:var(--font-serif),', '--serif:var(--ape-serif),').replace('--sans:var(--font-sans),', '--sans:var(--ape-sans),')
    if prelude == 'body':
        # the page, not the document: no min-height / overflow tricks
        body = re.sub(r'min-height:[^;]+;?', '', body)
    # class names inside bodies (rare: none expected)
    return body

def emit(items, indent=''):
    out = []
    for prelude, body in items:
        if prelude.startswith('@font-face'):
            continue
        if isinstance(body, list):
            inner = emit(body, indent + '  ')
            if inner.strip():
                out.append(f'{indent}{prelude}{{\n{inner}{indent}}}\n')
            continue
        sels = [scope_selector(x) for x in prelude.split(',')]
        sels = [x for x in sels if x]
        if not sels:
            continue
        out.append(f'{indent}{",".join(sels)}{{{fix_body(prelude, body).strip()}}}\n')
    return ''.join(out)

css = emit(parse(src))
open(out_path, 'w', encoding='utf8').write(css)
print(len(css), 'bytes;', css.count('{'), 'rules')
