import { useMemo, useRef, useState } from 'react'
import { parseScript, estimateSeconds } from '../lib/parser'

function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Editor({ script, settings, onChange, onStart }) {
  const taRef = useRef(null)
  const fileRef = useRef(null)
  const [showHelp, setShowHelp] = useState(false)
  const blocks = useMemo(() => parseScript(script), [script])
  const est = useMemo(() => estimateSeconds(blocks), [blocks])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (script.trim() && !window.confirm('Ganti naskah saat ini dengan isi file ini?')) {
      e.target.value = ''
      return
    }
    const text = await file.text()
    onChange({ script: text })
    e.target.value = ''
  }

  function insert(insert, wrap) {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    let text
    let cursorPos
    if (wrap !== undefined && start !== end) {
      const sel = script.slice(start, end)
      text =
        script.slice(0, start) +
        '==' + sel + '==' +
        script.slice(end)
      cursorPos = start + sel.length + 4
    } else if (wrap !== undefined) {
      text = script.slice(0, start) + insert + script.slice(end)
      cursorPos = start + 2
    } else {
      const needNlBefore = /[\S]$/.test(script.slice(0, start)) && !insert.startsWith('\n')
      const prefix = needNlBefore ? '\n' : ''
      text = script.slice(0, start) + prefix + insert + script.slice(end)
      cursorPos = start + prefix.length + insert.length
    }
    onChange({ script: text })
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(cursorPos, cursorPos)
    })
  }

  function applyToSelection(marker, blockLevel) {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = script.slice(0, start)
    const sel = script.slice(start, end) || ' '
    const after = script.slice(end)
    if (blockLevel) {
      const nl = before.endsWith('\n') || before === '' ? '' : '\n'
      onChange({ script: before + nl + marker + '\n' + sel + after })
    } else {
      onChange({ script: before + marker + sel + after })
    }
  }

  const btn =
    'px-2.5 py-1.5 rounded-lg bg-zinc-800/80 active:bg-indigo-600 text-xs font-medium whitespace-nowrap'

  return (
    <div className="h-full flex flex-col max-w-xl mx-auto">
      <header className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Teleprompter</h1>
          <p className="text-xs text-zinc-500">
            {est.words} kata · estimasi {fmt(est.estimate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(true)}
            title="Panduan penulisan"
            className="bg-zinc-800 active:bg-zinc-700 px-3 py-2.5 rounded-xl text-sm font-medium"
          >
            ❓
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.markdown,.txt,text/plain"
            className="hidden"
            onChange={handleFile}
          />
          <button
            onClick={() => fileRef.current?.click()}
            title="Impor naskah dari file"
            className="bg-zinc-800 active:bg-zinc-700 px-3.5 py-2.5 rounded-xl text-sm font-medium"
          >
            📂 Impor
          </button>
          <button
            onClick={onStart}
            disabled={est.words === 0}
            className="bg-indigo-600 active:bg-indigo-500 disabled:opacity-40 px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            ▶ Mulai Baca
          </button>
        </div>
      </header>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 py-2 border-b border-zinc-800/60">
        <button className={btn} onClick={() => insert('[slow]\n')}>
          🐢 Lambat
        </button>
        <button className={btn} onClick={() => insert('[normal]\n')}>
          Normal
        </button>
        <button className={btn} onClick={() => insert('[fast]\n')}>
          🐇 Cepat
        </button>
        <button className={btn} onClick={() => insert('==teks==', 2)}>
          ✨ Tekankan
        </button>
        <button className={btn} onClick={() => applyToSelection('[naik]', false)}>
          ↗ Naik
        </button>
        <button className={btn} onClick={() => applyToSelection('[turun]', false)}>
          ↘ Turun
        </button>
      </div>

      <textarea
        ref={taRef}
        value={script}
        onChange={(e) => onChange({ script: e.target.value })}
        spellCheck={false}
        placeholder="Tulis naskahmu di sini… gunakan toolbar di atas untuk menyisipkan marker."
        className="flex-1 w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-zinc-600 font-mono"
      />

      <div className="px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 flex items-center gap-3 text-xs text-zinc-400 border-t border-zinc-800/60">
        <label className="flex items-center gap-2 flex-1">
          Kecepatan
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.05"
            value={settings.baseSpeed}
            onChange={(e) => onChange({ settings: { ...settings, baseSpeed: parseFloat(e.target.value) } })}
            className="flex-1 accent-indigo-500"
          />
          <span className="tabular-nums w-10 text-right">{settings.baseSpeed.toFixed(2)}×</span>
        </label>
        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 rounded-lg bg-zinc-800 active:bg-zinc-700 text-base leading-none"
            onClick={() => onChange({ settings: { ...settings, fontSize: Math.max(18, settings.fontSize - 2) } })}
          >
            A
          </button>
          <button
            className="w-8 h-8 rounded-lg bg-zinc-800 active:bg-zinc-700 text-lg leading-none"
            onClick={() => onChange({ settings: { ...settings, fontSize: Math.min(72, settings.fontSize + 2) } })}
          >
            A
          </button>
        </div>
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700/60 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5 space-y-4 text-sm leading-relaxed"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">📖 Panduan Naskah</h2>
              <button onClick={() => setShowHelp(false)} className="text-zinc-400 px-2 text-lg">
                ✕
              </button>
            </div>
            <p className="text-zinc-400">Satu baris = satu blok di layar. Semua marker opsional.</p>
            <div>
              <h3 className="font-semibold text-indigo-300 mb-1">Tempo (berlaku sampai diganti)</h3>
              <code className="block bg-zinc-800 rounded px-2 py-1">[slow] lambat · [normal] dasar · [fast] cepat</code>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-300 mb-1">Penekanan</h3>
              <code className="block bg-zinc-800 rounded px-2 py-1">==highlight== · **tebal** · *miring*</code>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-300 mb-1">Intonasi (tempel di akhir kata)</h3>
              <code className="block bg-zinc-800 rounded px-2 py-1">[naik] ↗ hijau · [turun] ↘ merah</code>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Tanda jeda manual</h3>
              <code className="block bg-zinc-800 rounded px-2 py-1">// = pengingat mampir, tampil abu-abu (tanpa efek kecepatan)</code>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Catatan panggung (abu, miring)</h3>
              <code className="block bg-zinc-800 rounded px-2 py-1"># tampil abu-abu miring · {'<!-- .. -->'} tersembunyi total</code>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Contoh</h3>
              <pre className="bg-zinc-800 rounded-lg p-3 text-xs whitespace-pre-wrap">{`[slow]
Hari ini... kita sampai di ==puncak==.

Apakah kita akan lupa?[naik]
Tidak. ==Tidak akan pernah.==[turun]`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
