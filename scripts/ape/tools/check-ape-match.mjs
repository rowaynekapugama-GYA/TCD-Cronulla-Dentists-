#!/usr/bin/env node
/**
 * check-ape-match.mjs
 *
 * Checks that the APE sections of a practice-site page say exactly what the APE website says.
 * No packages needed (Node 18 or newer).
 *
 *   node tools/check-ape-match.mjs <page.html | http://localhost:3000/dental-anxiety/> [options]
 *
 * Options
 *   --scope <class>     class on the element that wraps the APE sections (default: ape-page).
 *                       If it is not found the script falls back to <main>, then the whole page, and says so.
 *   --allow "<text>"    text that may appear inside the APE sections although the APE site does not have it,
 *                       for example the page's own H1. Repeat for more than one.
 *   --no-team           the page deliberately leaves out Alex and Lauren (their names, roles and bios are skipped).
 *   --json              print the result as JSON as well.
 *
 * It reports four things:
 *   1. Missing: wording from the APE site that is not on the page, or is there with the wrong apostrophes.
 *   2. Order: wording that is on the page but not in the APE site's order (paragraphs and headings; short labels are counted).
 *   3. Extra: wording inside the APE sections that is not on the APE site.
 *   4. Photos and banned items: each APE photo with its alt text, and the list of things that must not appear.
 *
 * Exit code 0 means the page matches. Anything else is listed.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
if (!args.length || args[0].startsWith('--')) {
  console.error('Usage: node tools/check-ape-match.mjs <page.html | URL> [--scope ape-page] [--allow "text"] [--no-team] [--json]')
  process.exit(2)
}
const target = args[0]
const opt = { scope: 'ape-page', allow: [], team: true, json: false }
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--scope') opt.scope = args[++i]
  else if (args[i] === '--allow') opt.allow.push(args[++i])
  else if (args[i] === '--no-team') opt.team = false
  else if (args[i] === '--json') opt.json = true
}

const spec = JSON.parse(await readFile(path.join(here, '..', 'expected-text.json'), 'utf8'))

async function load(t) {
  if (/^https?:\/\//.test(t)) {
    const r = await fetch(t, { redirect: 'follow' })
    if (!r.ok) throw new Error(`${t} answered ${r.status}`)
    return await r.text()
  }
  return await readFile(t, 'utf8')
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '\u2019', lsquo: '\u2018', ldquo: '\u201C', rdquo: '\u201D', trade: '\u2122', ndash: '\u2013', mdash: '\u2014', hellip: '\u2026', copy: '\u00A9' }
function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m))
}

/** The inner HTML of the first element whose class list has `cls` (tags of the same name are counted to find its end). */
function scopeByClass(html, cls) {
  const safe = cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  const open = new RegExp(`<([a-zA-Z0-9]+)\\b[^>]*\\bclass="(?:[^"]*\\s)?${safe}(?:\\s[^"]*)?"[^>]*>`, 'i')
  const m = open.exec(html)
  if (!m) return null
  const tag = m[1]
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi')
  re.lastIndex = m.index + m[0].length
  let depth = 1
  let x
  while ((x = re.exec(html))) {
    if (x[0].endsWith('/>')) continue
    depth += x[1] ? -1 : 1
    if (depth === 0) return html.slice(m.index + m[0].length, x.index)
  }
  return html.slice(m.index + m[0].length)
}
function scopeByTag(html, tag) {
  const m = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*)</${tag}>`, 'i').exec(html)
  return m ? m[1] : null
}

const INLINE = 'a|abbr|b|bdi|bdo|cite|code|data|dfn|em|i|kbd|mark|q|s|samp|small|span|strong|sub|sup|time|u|var|wbr|font'
function clean(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|svg|noscript|template|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
}
/** Text blocks as a visitor reads them: inline tags vanish, every other tag ends a block. */
function blocks(html) {
  const inlineRe = new RegExp(`</?(?:${INLINE})\\b[^>]*>`, 'gi')
  return clean(html)
    .replace(inlineRe, '\u0001')
    .split(/<[^>]+>/)
    .map((b) => decode(b).replace(/\u0001/g, ' ').replace(/[\s\u00A0]+/g, ' ').trim())
    .filter(Boolean)
}
const squash = (s) => s.replace(/[\s\u00A0]+/g, '')
const plainQuotes = (s) => s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')

const raw = await load(target)
let scopeUsed = `.${opt.scope}`
let scoped = scopeByClass(raw, opt.scope)
if (scoped == null) { scoped = scopeByTag(raw, 'main'); scopeUsed = '<main> (no element with class "' + opt.scope + '" was found)' }
if (scoped == null) { scoped = scopeByTag(raw, 'body') ?? raw; scopeUsed = 'the whole page (no "' + opt.scope + '" class and no <main>)' }

const pageBlocks = blocks(scoped)
const pageText = squash(pageBlocks.join(' '))
const pagePlain = plainQuotes(pageText)

const TEAM_SKIP = ['Alex Loupos', 'Lauren Bright']
let skipping = false
const expected = spec.expected.filter((e) => {
  if (opt.team) return true
  if (e.kind === 'name') skipping = TEAM_SKIP.includes(e.text)
  if (e.id !== 'team') skipping = false
  return !skipping
})

const missing = []
const wrongQuotes = []
const outOfOrder = []
// Long wording is checked in the APE site's order. Short wording (button labels, names, list items) repeats on
// the page, so it is counted instead: the page needs it at least as many times as the APE site has it.
const LONG = 30
const count = (hay, needle) => (needle ? hay.split(needle).length - 1 : 0)
const need = new Map()
let cursor = 0
for (const e of expected) {
  const want = squash(e.text)
  if (want.length < LONG) {
    const n = (need.get(want) ?? 0) + 1
    need.set(want, n)
    if (count(pageText, want) >= n) continue
    if (count(pagePlain, plainQuotes(want)) >= n) wrongQuotes.push(e)
    else missing.push(e)
    continue
  }
  const at = pageText.indexOf(want, cursor)
  if (at >= 0) { cursor = at + want.length; continue }
  if (pageText.includes(want)) { outOfOrder.push(e); continue }
  if (pagePlain.includes(plainQuotes(want))) { wrongQuotes.push(e); continue }
  missing.push(e)
}

// extra wording: blocks inside the APE sections that are not on the APE site
const expectedSquashed = spec.expected.map((e) => squash(e.text))
const allowed = [
  'Read more', 'Read less', '(opens Google Maps)', 'opens Google Maps', 'opens in a new tab', '(opens in a new tab)', 'Previous question', 'Next question', 'Previous', 'Next',
  ...opt.allow,
].map(squash)
const extra = []
for (const b of pageBlocks) {
  const s = squash(b)
  if (!s) continue
  if (/^\d{1,2}$/.test(s) || /^\d{1,2}\/\d{1,2}$/.test(s) || /^[|\u00B7\u2022\u2192\u2193,.]+$/.test(s)) continue
  if (allowed.includes(s)) continue
  if (expectedSquashed.some((x) => x.includes(s))) continue
  // a block that is several expected strings run together (for example a label and its value)
  let rest = s
  let progressed = true
  while (rest && progressed) {
    progressed = false
    for (const x of [...expectedSquashed, ...allowed].sort((a, b) => b.length - a.length)) {
      if (x && rest.startsWith(x)) { rest = rest.slice(x.length); progressed = true; break }
    }
  }
  if (!rest) continue
  extra.push(b)
}

// photos
const imgs = [...clean(scoped).matchAll(/<(?:img|source)\b[^>]*>/gi)].map((m) => {
  const t = m[0]
  const get = (n) => { const x = new RegExp(`\\b${n}="([^"]*)"`, 'i').exec(t); return x ? decode(x[1]) : '' }
  return { src: decodeURIComponent(get('src') + ' ' + get('srcset')), alt: get('alt') }
})
const stem = (f) => f.replace(/\.(webp|jpe?g|png)$/i, '').replace(/-\d{4}-\d{2}-\d{2}$/, '')
const photoProblems = []
const expectedStems = []
for (const p of spec.imageAlts) {
  if (!opt.team && /alex-loupos|lauren-bright/.test(p.file)) continue
  const st = stem(p.file)
  expectedStems.push(st)
  const using = imgs.filter((i) => i.src.includes(st))
  if (!using.length) { photoProblems.push(`${p.file}: not used on the page`); continue }
  if (!using.some((i) => i.alt === p.alt)) photoProblems.push(`${p.file}: alt text differs. Found "${using.find((i) => i.alt)?.alt ?? ''}", expected "${p.alt}"`)
}
const otherPhotos = [...new Set(imgs.map((i) => i.src.trim()).filter((s) => s && !expectedStems.some((st) => s.includes(st))))]

// things that must not be there
const lowerScoped = decode(clean(scoped)).toLowerCase()
const banned = []
for (const g of spec.mustNotAppear) {
  if (!lowerScoped.includes(g.text.toLowerCase())) continue
  if (g.unlessContains && lowerScoped.split(g.text.toLowerCase()).length - 1 === lowerScoped.split(g.unlessContains.toLowerCase()).length - 1) continue
  banned.push(g)
}

const ok = !missing.length && !wrongQuotes.length && !outOfOrder.length && !extra.length && !photoProblems.length && !otherPhotos.length && !banned.length
const line = (e) => `   section ${e.section} (${e.id}), ${e.kind}: ${e.text.length > 110 ? e.text.slice(0, 110) + '...' : e.text}`
console.log(`APE match check: ${target}`)
console.log(`Compared against: ${spec.source}`)
console.log(`Looked inside: ${scopeUsed}`)
console.log(`APE wording found: ${expected.length - missing.length - wrongQuotes.length - outOfOrder.length} of ${expected.length}`)
if (missing.length) { console.log(`\nMISSING (${missing.length}): on the APE site, not on this page`); missing.forEach((e) => console.log(line(e))) }
if (wrongQuotes.length) { console.log(`\nWRONG APOSTROPHES OR QUOTES (${wrongQuotes.length}): the words are there but with straight ' or "`); wrongQuotes.forEach((e) => console.log(line(e))) }
if (outOfOrder.length) { console.log(`\nOUT OF ORDER (${outOfOrder.length}): on the page, but not where the APE site has it`); outOfOrder.forEach((e) => console.log(line(e))) }
if (extra.length) { console.log(`\nEXTRA (${extra.length}): inside the APE sections, not on the APE site`); extra.forEach((b) => console.log('   ' + (b.length > 140 ? b.slice(0, 140) + '...' : b))) }
if (photoProblems.length) { console.log(`\nPHOTOS (${photoProblems.length})`); photoProblems.forEach((p) => console.log('   ' + p)) }
if (otherPhotos.length) { console.log(`\nOTHER IMAGES inside the APE sections (${otherPhotos.length}): not one of the APE photos`); otherPhotos.forEach((p) => console.log('   ' + p.slice(0, 160))) }
if (banned.length) { console.log(`\nMUST NOT APPEAR (${banned.length})`); banned.forEach((g) => console.log(`   "${g.text}": ${g.why}`)) }
console.log(ok ? '\nPASS: the APE sections match the APE website.' : '\nFAIL: see the lists above.')
if (opt.json) console.log(JSON.stringify({ ok, scopeUsed, missing, wrongQuotes, outOfOrder, extra, photoProblems, otherPhotos, banned }, null, 2))
process.exit(ok ? 0 : 1)
