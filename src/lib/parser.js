export const TEMPOS = { slow: 0.55, normal: 1, fast: 1.5 }

function parseInlineEmphasis(text) {
  const out = []
  const re = /==([^=]+)==|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ t: 'text', text: text.slice(last, m.index) })
    if (m[1] !== undefined) out.push({ t: 'em', text: m[1] })
    else if (m[2] !== undefined) out.push({ t: 'bold', text: m[2] })
    else out.push({ t: 'italic', text: m[3] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ t: 'text', text: text.slice(last) })
  return out.filter((s) => s.text.length > 0)
}

const MARKER_RE = /\[(slow|normal|fast|naik|turun)\]/gi
const BLOCK_MARKER_RE = /\[(slow|normal|fast)\]/gi

function tokenizeLine(line) {
  const tokens = []
  let buf = ''
  let bufIntonation = null

  const flushBuf = () => {
    if (!buf.trim()) {
      buf = buf ? ' ' : ''
      bufIntonation = null
    }
    const trimmed = buf.trim()
    if (!trimmed) {
      buf = ''
      bufIntonation = null
      return
    }
    const parts = parseInlineEmphasis(trimmed)
    const words = []
    for (const p of parts) {
      for (const seg of p.text.split(/(\s+)/)) {
        if (!seg) continue
        if (/^\s+$/.test(seg)) {
          if (words.length > 0 && words[words.length - 1].t !== 'space') {
            words.push({ t: 'space', text: ' ' })
          }
        } else {
          words.push({ t: /^\/{2,}$/.test(seg) ? 'beat' : p.t, text: seg })
        }
      }
    }
    if (words.length > 0) {
      let lastIdx = words.length - 1
      while (lastIdx >= 0 && words[lastIdx].t === 'space') lastIdx--
      if (lastIdx >= 0 && bufIntonation) words[lastIdx].intonation = bufIntonation
      tokens.push(...words)
    }
    buf = ''
    bufIntonation = null
  }

  let last = 0
  let m
  MARKER_RE.lastIndex = 0
  while ((m = MARKER_RE.exec(line)) !== null) {
    buf += line.slice(last, m.index)
    const kind = m[1].toLowerCase()
    if (kind === 'naik' || kind === 'turun') {
      flushBuf()
      for (let i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].t !== 'space' && !isPunct(tokens[i].text)) {
          tokens[i].intonation = kind
          break
        }
      }
    } else {
      flushBuf()
    }
    last = m.index + m[0].length
  }
  buf += line.slice(last)
  flushBuf()
  return tokens
}

function isPunct(w) {
  return /^[.,!?;:"'\u201C\u201D\u2018\u2019()\u2026-]+$/.test(w)
}

export function parseScript(src) {
  const blocks = []
  let tempo = 'normal'

  src = src.replace(/<!--[\s\S]*?-->/g, '')

  for (const rawLine of src.split('\n')) {
    const trimmedStart = rawLine.trimStart()
    if (trimmedStart.startsWith('#')) {
      blocks.push({ kind: 'comment', tempo, text: trimmedStart })
      continue
    }

    const line = trimmedStart

    let rest = line
    while (rest.length > 0) {
      BLOCK_MARKER_RE.lastIndex = 0
      const m = BLOCK_MARKER_RE.exec(rest)
      if (!m) break
      const before = rest.slice(0, m.index)
      if (before.trim()) blocks.push(makePara(tokenizeLine(before), tempo))
      tempo = m[1].toLowerCase()
      rest = rest.slice(m.index + m[0].length)
    }
    if (rest.trim()) blocks.push(makePara(tokenizeLine(rest), tempo))
  }

  function makePara(tokens, t) {
    const words = tokens.map((w) => ({
      ...w,
      punct: w.t !== 'space' && w.t !== 'beat' && isPunct(w.text),
    }))
    const lastWord = [...words].reverse().find((w) => w.t !== 'space')
    return {
      kind: 'para',
      tempo: t,
      words,
      endsSentence: lastWord ? /[.!?…]["'\u201D\u2019)]?$/.test(lastWord.text) : false,
    }
  }

  return blocks
}

export function estimateSeconds(blocks, baseWpm = 130) {
  let totalWords = 0
  let weighted = 0
  for (const b of blocks) {
    if (b.kind === 'para') {
      const n = b.words.filter((w) => w.t !== 'space' && w.t !== 'beat' && !w.punct).length
      weighted += n * TEMPOS[b.tempo]
      totalWords += n
    }
  }
  if (totalWords === 0) return { estimate: 0, words: 0 }
  const avgFactor = weighted / totalWords
  return {
    estimate: Math.round((totalWords / (baseWpm / 60)) * avgFactor),
    words: totalWords,
  }
}
