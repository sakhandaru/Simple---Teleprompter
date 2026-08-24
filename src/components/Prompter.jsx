import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { parseScript, estimateSeconds, TEMPOS } from '../lib/parser'

const ZONE_COLOR = { normal: '#6b7280', slow: '#3b82f6', fast: '#f59e0b' }

function fmt(sec) {
  sec = Math.max(0, Math.round(sec))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const Word = memo(function Word({ w }) {
  if (w.t === 'space') return <span>{' '}</span>
  if (w.t === 'beat') {
    return <span className="italic text-zinc-500 font-bold">//</span>
  }
  if (w.punct) {
    return <span className="text-amber-200/90">{w.text}</span>
  }
  const intonation =
    w.intonation === 'naik'
      ? { arrow: '↗', color: 'text-emerald-400' }
      : w.intonation === 'turun'
        ? { arrow: '↘', color: 'text-rose-400' }
        : null
  let cls = 'text-zinc-100'
  if (/[.!?…]["'\u201D\u2019)]?$/.test(w.text)) cls = 'text-amber-200'
  if (w.t === 'em') cls = 'bg-yellow-300 text-zinc-950 font-bold rounded px-[0.12em]'
  else if (w.t === 'bold') cls = 'font-bold text-white'
  else if (w.t === 'italic') cls = 'italic'

  return (
    <>
      <span className={cls}>{w.text}</span>
      {intonation && (
        <span className={`${intonation.color} font-black`} style={{ fontSize: '1.1em' }}>
          {'\u00A0'}
          {intonation.arrow}
        </span>
      )}
    </>
  )
})

const ScriptContent = memo(function ScriptContent({ blocks, fontSize }) {
  return (
    <div className="px-5 pb-[75vh]" style={{ fontSize, lineHeight: 1.55 }}>
      <div style={{ height: '45vh' }} />
      {blocks.map((b, i) => {
        if (b.kind === 'comment') {
          return (
            <p
              key={i}
              data-tempo={b.tempo}
              className="italic text-zinc-500 mb-[0.6em]"
              style={{ fontSize: '0.85em' }}
            >
              {b.text}
            </p>
          )
        }
        return (
          <p
            key={i}
            data-tempo={b.tempo}
            className={b.endsSentence ? 'mb-[0.9em]' : 'mb-[0.45em]'}
          >
            {b.words.map((w, j) => (
              <Word key={j} w={w} />
            ))}
          </p>
        )
      })}
    </div>
  )
})

export default function Prompter({ script, settings, onSpeed, onFontSize, onExit }) {
  const blocks = useMemo(() => parseScript(script), [script])
  const est = useMemo(() => estimateSeconds(blocks), [blocks])

  const scrollRef = useRef(null)
  const contentRef = useRef(null)
  const progressElRef = useRef(null)
  const remainingElRef = useRef(null)
  const pctElRef = useRef(null)
  const stripRef = useRef(null)
  const pausedRef = useRef(false)

  const [phase, setPhase] = useState('countdown')
  const [countdown, setCountdown] = useState(3)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {})
    return () => {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  useEffect(() => {
    let lock
    let cancelled = false
    navigator.wakeLock
      ?.request('screen')
      .then((l) => {
        if (cancelled) l.release?.()
        else lock = l
      })
      .catch(() => {})
    return () => {
      cancelled = true
      try {
        lock?.release()
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (phase !== 'countdown') return undefined
    let n = 3
    const id = setInterval(() => {
      n -= 1
      if (n <= 0) {
        clearInterval(id)
        setPhase('playing')
      } else setCountdown(n)
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return undefined
    const el = scrollRef.current
    const content = contentRef.current
    if (!el || !content) return undefined

    const zoneEls = Array.from(content.querySelectorAll('[data-tempo]'))

    let raf
    let last = performance.now()
    let currentFactor = TEMPOS.normal
    let lastZone = ''

    function currentTempo(scrollY) {
      const midY = scrollY + el.clientHeight * 0.38
      for (let i = zoneEls.length - 1; i >= 0; i--) {
        if (zoneEls[i].offsetTop <= midY) return zoneEls[i].dataset.tempo
      }
      return 'normal'
    }

    function tick(now) {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)

      if (pausedRef.current) {
        last = now
        return
      }

      const tempo = currentTempo(el.scrollTop)
      const targetFactor = TEMPOS[tempo] ?? TEMPOS.normal
      currentFactor += (targetFactor - currentFactor) * Math.min(1, dt * 5)

      const zone = currentFactor < 0.85 ? 'slow' : currentFactor > 1.15 ? 'fast' : 'normal'
      if (zone !== lastZone && stripRef.current) {
        lastZone = zone
        stripRef.current.style.background = ZONE_COLOR[zone]
      }

      const pxPerSecBase = settings.fontSize * 2.4 * settings.baseSpeed
      el.scrollTop += pxPerSecBase * currentFactor * dt

      const maxScroll = el.scrollHeight - el.clientHeight
      const prog = maxScroll > 0 ? Math.min(1, el.scrollTop / maxScroll) : 1
      if (progressElRef.current) progressElRef.current.style.width = `${(prog * 100).toFixed(1)}%`
      if (pctElRef.current) pctElRef.current.textContent = `${Math.round(prog * 100)}%`
      if (remainingElRef.current)
        remainingElRef.current.textContent = `⏱ ${fmt(est.estimate * (1 - prog))}`

      if (el.scrollTop >= maxScroll - 1) cancelAnimationFrame(raf)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, settings.fontSize, settings.baseSpeed, est.estimate])

  function togglePlay() {
    setPaused((p) => !p)
  }

  function handleTouchMove(e) {
    if (!pausedRef.current) e.preventDefault()
  }

  useEffect(() => {
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => document.removeEventListener('touchmove', handleTouchMove)
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#050508] select-none">
      <div className="h-1 bg-zinc-800 shrink-0">
        <div ref={progressElRef} className="h-full bg-indigo-500" style={{ width: '0%' }} />
      </div>

      <div className="shrink-0 flex justify-between items-center px-3 py-1.5 text-xs text-zinc-400">
        <span ref={remainingElRef} className="tabular-nums">⏱ --</span>
        <span ref={pctElRef} className="tabular-nums">0%</span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar">
          <div ref={contentRef}>
            <ScriptContent blocks={blocks} fontSize={settings.fontSize} />
          </div>
        </div>

        <div
          ref={stripRef}
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: ZONE_COLOR.normal }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#050508] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050508] to-transparent" />

        {phase === 'countdown' && (
          <button
            onClick={() => setPhase('playing')}
            className="absolute inset-0 flex items-center justify-center bg-black/60"
          >
            <span key={countdown} className="text-9xl font-black text-white countdown-pop">
              {countdown > 0 ? countdown : 'GO!'}
            </span>
          </button>
        )}

        {phase === 'playing' && paused && (
          <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/40 fade-in">
            <span className="text-5xl font-bold text-white">❚❚</span>
          </button>
        )}

        {phase === 'playing' && !paused && (
          <button onClick={togglePlay} className="absolute inset-0" aria-label="tap untuk pause/play" />
        )}
      </div>

      <div
        className="shrink-0 border-t border-zinc-800/60 px-2 py-2 flex items-center justify-around gap-1 pb-[max(env(safe-area-inset-bottom),0.5rem)]"
      >
        <button
          onPointerDown={(e) => {
            e.stopPropagation()
            onFontSize(-2)
          }}
          className="px-3 py-3 rounded-xl bg-zinc-800 active:bg-zinc-700 font-semibold"
        >
          A−
        </button>
        <button
          onPointerDown={(e) => {
            e.stopPropagation()
            onSpeed(-0.1)
          }}
          className="px-5 py-3 rounded-xl bg-zinc-800 active:bg-zinc-700 text-xl font-bold w-14"
        >
          −
        </button>
        <span className="tabular-nums text-sm w-11 text-center text-zinc-300">
          {settings.baseSpeed.toFixed(1)}×
        </span>
        <button
          onPointerDown={(e) => {
            e.stopPropagation()
            onSpeed(0.1)
          }}
          className="px-5 py-3 rounded-xl bg-zinc-800 active:bg-zinc-700 text-xl font-bold w-14"
        >
          +
        </button>
        <button
          onPointerDown={(e) => {
            e.stopPropagation()
            onFontSize(2)
          }}
          className="px-3 py-3 rounded-xl bg-zinc-800 active:bg-zinc-700 font-semibold"
        >
          A+
        </button>
        <button
          onPointerDown={(e) => {
            e.stopPropagation()
            onExit()
          }}
          className="px-3 py-3 rounded-xl bg-rose-900/60 active:bg-rose-800 font-semibold text-sm"
        >
          Keluar
        </button>
      </div>
    </div>
  )
}
