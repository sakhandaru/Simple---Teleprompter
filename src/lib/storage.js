const KEY = 'teleprompter:v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        script: typeof parsed.script === 'string' ? parsed.script : DEFAULT_SCRIPT,
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      }
    }
  } catch {}
  return { script: DEFAULT_SCRIPT, settings: { ...DEFAULT_SETTINGS } }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
}

export const DEFAULT_SETTINGS = {
  baseSpeed: 1.0,
  fontSize: 32,
}

export const DEFAULT_SCRIPT = `# Pidato Perpisahan

Terima kasih semuanya, atas waktu dan perhatian kalian.

[slow]
Tiga tahun ini... bukan sekadar angka.
Ada ==tawa== di lorong sekolah, ada ==air mata== di lapangan,
ada nama-nama yang tidak akan pernah kita lupakan.

[normal]
Hari ini kita berdiri di ==ambang pintu== —
pintu yang memisahkan antara kenangan dan harapan.[turun]

Apakah kita akan melupakan masa ini?[naik]
Tidak. ==Tidak akan pernah.==[turun]

[slow]
Dan untuk terakhir kalinya...
izinkan aku mengucapkan dengan segenap hati:

Selamat tinggal, sahabatku.
==Semoga kita bertemu lagi==, di puncak masing-masing.[turun]
`
