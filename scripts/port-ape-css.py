"""Port the APE website's site.css into a stylesheet scoped to the Cronulla site's .ape-page wrapper.

- @font-face and the next/font helper classes are dropped (fonts come from components/ape/fonts.ts).
- :root / html / body / main become .ape-page.
- Every other class is renamed .X -> .ape-X so nothing collides with the Cronulla design system, and
  every selector is prefixed with .ape-page. The host site's own `.reveal` class is kept as is.
- Header, nav, footer, booking, FAQ deck, read-more and reveal-animation rules are left out (the Cronulla
  site provides its own header, footer, scroll reveal and the page has its own FAQ list).
"""
import re, sys

src = open(sys.argv[1], encoding='utf8').read()
src = re.sub(r'/\*.*?\*/', '', src, flags=re.S)
out_path = sys.argv[2]

DROP = ['.site-header', '.nav', '.burger', '.mobile-menu', '.scroll-progress', '.site-footer', '.appt-card',
        '#booking', '.chosen-clinic', '.slot-err', '.notice-24h', '.confirm', '.faq-', '.read-more', '.bio-more',
        '.plain-page', '.logo', '.__className', '.__variable', '.sr-only', '.reveal', '.js ', 'html:not', '.path',
        '.disclaimer', '#contact', '.tagline', '.legal', '.foot', '.hero-banner', '.ph-label', '.bio-soon']

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

def scope_selector(sel):
    s = sel.strip()
    if any(d in s for d in DROP):
        return None
    if s in (':root', 'html', 'body', 'main'):
        return '.ape-page'
    s = s.replace('main section[id],', '.ape-page section[id],').replace('main article[id]', '.ape-page article[id]')
    # body.home (the APE homepage) is the page wrapper itself, not a descendant
    if s.startswith('body.'):
        return '.ape-page' + CLASS_RE.sub(lambda m: '.ape-' + m.group(1), s[4:])
    if s.startswith('.ape-page'):
        return s
    s = CLASS_RE.sub(lambda m: '.ape-' + m.group(1), s)
    if s.startswith('main '):
        s = s[5:]
    return '.ape-page ' + s

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
