/**
 * ASD-STE100 (Simplified Technical English) checker for docs.sifa.id prose.
 *
 * The rule and its rationale live in the workspace at
 * decisions/2026-08-06-docs-simplified-technical-english.md. Rule ids below
 * (S1..S13) match that document.
 *
 * Machine-checked here: S1 S2 S3 S4 S5 S6 S7 S8 S9 S11.
 * Review-only (in CONTRIBUTING.md, not checkable without a parser that
 * understands meaning): S10 noun clusters, S12 warning placement, S13 articles.
 *
 * We check prose only. Code fences, inline code, JSX tag syntax, URLs and
 * import/export lines are masked out with spaces before any rule runs, so
 * character offsets still map to the original line numbers.
 *
 * Escape hatch: put `{/* ste-allow: S4 short reason *\/}` on the offending
 * line or the line above it. A reason is required.
 */

export interface Violation {
  rule: string
  line: number
  message: string
  excerpt: string
}

/** Words that mark a sentence as an instruction (20-word cap, not 25). */
const IMPERATIVE_VERBS = new Set([
  'add',
  'ask',
  'change',
  'check',
  'choose',
  'click',
  'collapse',
  'confirm',
  'connect',
  'copy',
  'create',
  'delete',
  'disconnect',
  'do',
  'download',
  'drag',
  'drop',
  'enter',
  'expand',
  'export',
  'fill',
  'find',
  'follow',
  'give',
  'go',
  'hide',
  'hover',
  'import',
  'install',
  'keep',
  'leave',
  'link',
  'log',
  'make',
  'move',
  'note',
  'open',
  'paste',
  'pick',
  'press',
  'put',
  'read',
  'refresh',
  'reload',
  'remove',
  'rename',
  'repeat',
  'replace',
  'restart',
  'return',
  'review',
  'run',
  'save',
  'scroll',
  'search',
  'see',
  'select',
  'send',
  'set',
  'share',
  'show',
  'sign',
  'skip',
  'split',
  'start',
  'stop',
  'switch',
  'take',
  'tap',
  'tell',
  'test',
  'try',
  'turn',
  'type',
  'update',
  'upload',
  'use',
  'verify',
  'view',
  'visit',
  'wait',
  'write',
])

/** Irregular past participles, for the passive-voice and perfect-tense checks. */
const PARTICIPLES = [
  'begun',
  'born',
  'brought',
  'built',
  'bought',
  'broken',
  'caught',
  'chosen',
  'dealt',
  'done',
  'drawn',
  'driven',
  'felt',
  'found',
  'given',
  'gone',
  'held',
  'hidden',
  'kept',
  'known',
  'left',
  'lost',
  'made',
  'meant',
  'put',
  'read',
  'run',
  'seen',
  'sent',
  'set',
  'shown',
  'spoken',
  'stolen',
  'taken',
  'taught',
  'thought',
  'thrown',
  'told',
  'understood',
  'written',
]

/**
 * Gerunds allowed because they belong to a Technical Name or a product term,
 * not because the sentence needed a participle.
 */
const ALLOWED_ING = new Set([
  'according',
  'anything',
  'branding',
  'during',
  'engineering',
  'everything',
  'heading',
  'landing',
  'listing',
  'living',
  'meaning',
  'nothing',
  'onboarding',
  'ping',
  'rating',
  'setting',
  'settings',
  'something',
  'string',
  'thing',
  'things',
  'training',
  'warning',
  'warnings',
])

/** S8. One word, one meaning. */
const SUBSTITUTIONS: Array<[RegExp, string]> = [
  [/\butiliz(e|es|ed|ing)\b/gi, 'use'],
  [/\bleverag(e|es|ed|ing)\b/gi, 'use'],
  [/\bperform(s|ed)?\b/gi, 'do or run'],
  [/\bprior to\b/gi, 'before'],
  [/\bin advance of\b/gi, 'before'],
  [/\bsubsequent to\b/gi, 'after'],
  [/\bin order to\b/gi, 'to'],
  [/\badditionally\b/gi, 'also'],
  [/\bfurthermore\b/gi, 'also'],
  [/\bmoreover\b/gi, 'also'],
  [/\bapproximately\b/gi, 'about'],
  [/\bobtain(s|ed|ing)?\b/gi, 'get'],
  [/\bacquir(e|es|ed|ing)\b/gi, 'get'],
  [/\bcommenc(e|es|ed|ing)\b/gi, 'start'],
  [/\binitiat(e|es|ed|ing)\b/gi, 'start'],
  [/\btermina(te|tes|ted|ting)\b/gi, 'stop'],
  [/\bceas(e|es|ed|ing)\b/gi, 'stop'],
  [/\brequir(e|es|ed|ing)\b/gi, 'need'],
  [/\bensur(e|es|ed|ing)\b/gi, 'make sure'],
  [/\bvia\b/gi, 'with or by'],
  [/\bassist(s|ed|ing)?\b/gi, 'help'],
  [/\battempt(s|ed|ing)?\b/gi, 'try'],
  [/\bnumerous\b/gi, 'many'],
  [/\bsufficient\b/gi, 'enough'],
  [/\bcurrently\b/gi, 'now'],
  [/\bpresently\b/gi, 'now'],
  [/\bin the event that\b/gi, 'if'],
]

/** S9. Idiom, slang, figurative language, and empty intensifiers. */
const IDIOMS: RegExp[] = [
  /\bunder the hood\b/gi,
  /\bout of the box\b/gi,
  /\bspin(s|ning)? up\b/gi,
  /\bdrop in\b/gi,
  /\bhit the\b/gi,
  /\bgrab(s|bing)?\b/gi,
  /\bdive into\b/gi,
  /\bseamless(ly)?\b/gi,
  /\bmagic(al)?\b/gi,
  /\bsimply\b/gi,
  /\bpowerful\b/gi,
  /\bblazing\b/gi,
  /\bunder the covers\b/gi,
  /\bheavy lifting\b/gi,
  /\bfirst-class citizen\b/gi,
]

/** S11. Approved spellings for AT Protocol ecosystem terms. */
const TERMS: Array<[RegExp, string]> = [
  [/\bATproto\b/g, 'atproto'],
  [/\bATProtocol\b/g, 'AT Protocol'],
  [/\bAtProto\b/g, 'atproto'],
  [/\bat protocol\b/g, 'AT Protocol'],
  [/\batProtocol\b/g, 'AT Protocol'],
  [/(?<![/\w.-])atmosphere\b/g, 'Atmosphere'],
]

const ABBREVIATIONS = ['e.g', 'i.e', 'etc', 'vs', 'Dr', 'Mr', 'Ms', 'No', 'Inc', 'approx']

/** Replace a slice with spaces, keeping newlines so offsets stay valid. */
function blank(text: string): string {
  return text.replace(/[^\n]/g, ' ')
}

function maskRange(chars: string[], start: number, end: number): void {
  for (let i = start; i < end && i < chars.length; i += 1) {
    if (chars[i] !== '\n') chars[i] = ' '
  }
}

/**
 * Blank out everything that is not prose, preserving length and newlines.
 * Prose we keep: body text, headings, list item text, table cell text,
 * link text, the frontmatter `description` value, and the alt/caption
 * attribute values of JSX components.
 */
export function maskNonProse(source: string): string {
  let out = source

  // Frontmatter: keep only the description value.
  out = out.replace(/^---\n([\s\S]*?)\n---/, (block, body: string) => {
    const kept = body.replace(
      /^(\s*)(\w+):([^\n]*)$/gm,
      (line, indent, key: string, value: string) => {
        if (key === 'description') return `${indent}${blank(key)} ${value}`
        return blank(line)
      }
    )
    return `${blank('---')}\n${kept}\n${blank('---')}`
  })

  // Fenced code blocks.
  out = out.replace(/^ *```[\s\S]*?^ *```/gm, blank)

  // import / export lines.
  out = out.replace(/^(import|export)\s[^\n]*/gm, blank)

  // Inline code.
  out = out.replace(/`[^`\n]*`/g, blank)

  // ste-allow directives are read separately; blank them here.
  out = out.replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)

  // JSX attributes: keep alt and caption text, drop everything else.
  const chars = out.split('')
  const tagPattern = /<\/?[A-Za-z][^>]*>/g
  let tag: RegExpExecArray | null
  while ((tag = tagPattern.exec(out)) !== null) {
    const start = tag.index
    const text = tag[0]
    const keep: Array<[number, number]> = []
    const attrPattern = /(alt|caption|title)="([^"]*)"/g
    let attr: RegExpExecArray | null
    while ((attr = attrPattern.exec(text)) !== null) {
      const valueStart = start + attr.index + attr[0].indexOf('"') + 1
      keep.push([valueStart, valueStart + (attr[2] ?? '').length])
    }
    let cursor = start
    for (const [from, to] of keep) {
      maskRange(chars, cursor, from)
      cursor = to
    }
    maskRange(chars, cursor, start + text.length)
  }
  out = chars.join('')

  // Markdown links and images: keep the label, drop the target.
  out = out.replace(
    /!?\[([^\]\n]*)\]\(([^)\n]*)\)/g,
    (whole, label: string) => `${' '}${label}${' '.repeat(whole.length - label.length - 1)}`
  )

  // Bare URLs.
  out = out.replace(/https?:\/\/\S+/g, blank)

  // Structural markdown punctuation.
  out = out.replace(/^ {0,3}#{1,6} /gm, (marker) => blank(marker))
  out = out.replace(/^ *([-*+]|\d+\.) /gm, (marker) => blank(marker))
  out = out.replace(/^ *> ?/gm, (marker) => blank(marker))
  out = out.replace(/^ *\|[-: |]+\| *$/gm, blank)
  out = out.replace(/\|/g, ' ')
  out = out.replace(/\*\*|__|\*|~~/g, (marker) => ' '.repeat(marker.length))

  return out
}

export interface AllowDirective {
  line: number
  rule: string
}

export function readAllowDirectives(source: string): AllowDirective[] {
  const directives: AllowDirective[] = []
  const lines = source.split('\n')
  lines.forEach((text, index) => {
    const match = /\{\/\*\s*ste-allow:\s*(S\d+)\s+(\S[^*]*?)\s*\*\/\}/.exec(text)
    if (match?.[1]) directives.push({ line: index + 1, rule: match[1] })
  })
  return directives
}

/** A directive on the same line or the line above suppresses a violation. */
function isAllowed(directives: AllowDirective[], violation: Violation): boolean {
  return directives.some(
    (d) => d.rule === violation.rule && (d.line === violation.line || d.line === violation.line - 1)
  )
}

function lineOf(masked: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < masked.length; i += 1) {
    if (masked[i] === '\n') line += 1
  }
  return line
}

interface Sentence {
  text: string
  offset: number
}

/** Split one block of prose into sentences, keeping offsets into `masked`. */
function splitSentences(block: string, base: number): Sentence[] {
  const sentences: Sentence[] = []
  let start = 0
  for (let i = 0; i < block.length; i += 1) {
    const ch = block[i]
    if (ch !== '.' && ch !== '!' && ch !== '?' && ch !== ':') continue
    const next = block[i + 1]
    if (next !== undefined && !/\s/.test(next)) continue
    const before = block.slice(Math.max(0, i - 12), i)
    const lastWord = /([A-Za-z.]+)$/.exec(before)?.[1] ?? ''
    if (ABBREVIATIONS.some((abbr) => lastWord.toLowerCase().endsWith(abbr.toLowerCase()))) continue
    if (/\d$/.test(before) && /^\d/.test(next ?? '')) continue
    const text = block.slice(start, i + 1).trim()
    if (text) sentences.push({ text, offset: base + start + block.slice(start).indexOf(text) })
    start = i + 1
  }
  const tail = block.slice(start).trim()
  if (tail) sentences.push({ text: tail, offset: base + start + block.slice(start).indexOf(tail) })
  return sentences
}

function wordCount(sentence: string): number {
  return sentence.split(/\s+/).filter((word) => /[A-Za-z0-9]/.test(word)).length
}

function firstWord(sentence: string): string {
  return (/[A-Za-z']+/.exec(sentence)?.[0] ?? '').toLowerCase()
}

function excerptOf(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > 96 ? `${flat.slice(0, 93)}...` : flat
}

function checkPattern(
  rule: string,
  pattern: RegExp,
  masked: string,
  message: (match: string) => string,
  violations: Violation[]
): void {
  const search = new RegExp(
    pattern.source,
    pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
  )
  let match: RegExpExecArray | null
  while ((match = search.exec(masked)) !== null) {
    violations.push({
      rule,
      line: lineOf(masked, match.index),
      message: message(match[0]),
      excerpt: excerptOf(masked.slice(Math.max(0, match.index - 40), match.index + 60)),
    })
    if (match[0].length === 0) search.lastIndex += 1
  }
}

export function checkSource(source: string): Violation[] {
  const masked = maskNonProse(source)
  const violations: Violation[] = []

  // A list or a table is not a paragraph, so S2 skips those blocks. Rows and
  // items still go through the sentence-level rules.
  const listLines = new Set<number>()
  const tableLines = new Set<number>()
  // Text inside a JSX attribute (alt, caption) is not a paragraph either.
  const attributeLines = new Set<number>()
  const tagSpan = /<\/?[A-Za-z][^>]*>/g
  let tagMatch: RegExpExecArray | null
  while ((tagMatch = tagSpan.exec(source)) !== null) {
    const first = source.slice(0, tagMatch.index).split('\n').length
    const span = tagMatch[0].split('\n').length
    for (let i = 0; i < span; i += 1) attributeLines.add(first + i)
  }
  source.split('\n').forEach((text, index) => {
    if (/^\s*\|/.test(text)) tableLines.add(index + 1)
    if (/^\s*(?:[-*+]|\d+\.)\s/.test(text) || /^\s*\|/.test(text)) listLines.add(index + 1)
  })

  // Block-level rules: S1 sentence length, S2 paragraph length, S3 one
  // instruction per sentence.
  const blockPattern = /[^\n]+(?:\n[^\n]+)*/g
  let block: RegExpExecArray | null
  while ((block = blockPattern.exec(masked)) !== null) {
    if (!/[A-Za-z]/.test(block[0])) continue
    const firstLine = lineOf(masked, block.index)
    const lineSpan = block[0].split('\n').length
    const isList = Array.from({ length: lineSpan }, (_, i) => firstLine + i).some((line) =>
      listLines.has(line)
    )
    const isAttribute = Array.from({ length: lineSpan }, (_, i) => firstLine + i).some((line) =>
      attributeLines.has(line)
    )
    // Each item of a list is its own unit. Splitting the whole block at once
    // would fuse items that carry no full stop into one giant "sentence".
    let sentences: Sentence[]
    if (isList) {
      sentences = []
      let cursor = block.index
      for (const line of block[0].split('\n')) {
        sentences.push(...splitSentences(line, cursor))
        cursor += line.length + 1
      }
    } else {
      sentences = splitSentences(block[0], block.index)
    }
    if (!isList && !isAttribute && sentences.length > 6) {
      violations.push({
        rule: 'S2',
        line: firstLine,
        message: `paragraph has ${sentences.length} sentences, limit is 6`,
        excerpt: excerptOf(block[0]),
      })
    }
    for (const sentence of sentences) {
      const instruction = IMPERATIVE_VERBS.has(firstWord(sentence.text))
      const limit = instruction ? 20 : 25
      const count = wordCount(sentence.text)
      // A table row is a set of cells, not a sentence, so S1 does not apply.
      if (count > limit && !tableLines.has(lineOf(masked, sentence.offset))) {
        violations.push({
          rule: 'S1',
          line: lineOf(masked, sentence.offset),
          message: `${instruction ? 'instruction' : 'descriptive'} sentence is ${count} words, limit is ${limit}`,
          excerpt: excerptOf(sentence.text),
        })
      }
      if (instruction) {
        const joined = /\band then\b|\bafter that\b|,\s*then\b/i.exec(sentence.text)
        const andVerb = /\band\s+([a-z]+)\b/i.exec(sentence.text)
        const secondAction = IMPERATIVE_VERBS.has((andVerb?.[1] ?? '').toLowerCase())
        if (joined || secondAction) {
          violations.push({
            rule: 'S3',
            line: lineOf(masked, sentence.offset),
            message: 'instruction carries more than one action, split it into separate sentences',
            excerpt: excerptOf(sentence.text),
          })
        }
      }
    }
  }

  // S4 passive voice.
  // The trailing lookahead keeps hyphenated adjectives such as "read-only" out.
  const participle = `(?:\\w+ed|${PARTICIPLES.join('|')})(?!-)`
  checkPattern(
    'S4',
    new RegExp(`\\b(?:is|are|was|were|be|been|being)\\s+(?:\\w+ly\\s+)?${participle}\\b`, 'gi'),
    masked,
    (match) => `passive voice ("${match.trim()}"), rewrite with the actor as subject`,
    violations
  )

  // S5 perfect and continuous tenses.
  checkPattern(
    'S5',
    new RegExp(`\\b(?:have|has|had)\\s+(?:\\w+ly\\s+)?${participle}\\b`, 'gi'),
    masked,
    (match) => `perfect tense ("${match.trim()}"), use simple present or simple past`,
    violations
  )
  checkPattern(
    'S5',
    /\b(?:is|are|was|were|am)\s+(?:\w+ly\s+)?\w+ing\b/gi,
    masked,
    (match) => `continuous tense ("${match.trim()}"), use a simple tense`,
    violations
  )

  // S6 -ing participles after a preposition or opening a sentence.
  checkPattern(
    'S6',
    /\b(?:after|before|by|for|without|when|while|on|in|of|through)\s+(\w+ing)\b/gi,
    masked,
    (match) => `-ing participle ("${match.trim()}"), rewrite with a subject and a simple verb`,
    violations
  )

  // S7 contractions. Possessive 's is not a contraction and stays, so `'s`
  // only counts when the stem is a pronoun or an auxiliary that cannot own
  // anything ("it's", "there's", "let's").
  checkPattern(
    'S7',
    /\b\w+['’](?:t|re|ve|ll|d|m)\b/gi,
    masked,
    (match) => `contraction ("${match}"), write it out in full`,
    violations
  )
  checkPattern(
    'S7',
    /\b(?:it|that|this|there|here|what|who|where|when|how|let|he|she|one|everything|nothing|something|everyone)['’]s\b/gi,
    masked,
    (match) => `contraction ("${match}"), write it out in full`,
    violations
  )

  // S8 one word, one meaning.
  for (const [pattern, replacement] of SUBSTITUTIONS) {
    checkPattern(
      'S8',
      pattern,
      masked,
      (match) => `"${match}" is not the approved word, use "${replacement}"`,
      violations
    )
  }

  // S9 idiom and slang.
  for (const pattern of IDIOMS) {
    checkPattern(
      'S9',
      pattern,
      masked,
      (match) => `idiomatic or figurative ("${match}"), say it plainly`,
      violations
    )
  }

  // S11 approved ecosystem spellings.
  for (const [pattern, correct] of TERMS) {
    checkPattern(
      'S11',
      pattern,
      masked,
      (match) => `"${match}" is not an approved spelling, use "${correct}"`,
      violations
    )
  }

  const directives = readAllowDirectives(source)
  const kept = violations.filter((violation) => !isAllowed(directives, violation))

  // S6 false positives: the participle allowlist.
  return kept
    .filter((violation) => {
      if (violation.rule !== 'S6') return true
      const word = /(\w+ing)\b/.exec(violation.message)?.[1]?.toLowerCase()
      return word ? !ALLOWED_ING.has(word) : true
    })
    .sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule))
}
