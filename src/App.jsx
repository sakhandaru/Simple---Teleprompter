import { useEffect, useState } from 'react'
import { loadState, saveState } from './lib/storage'
import Editor from './components/Editor'
import Prompter from './components/Prompter'

export default function App() {
  const [{ script, settings }, setState] = useState(loadState)
  const [reading, setReading] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => saveState({ script, settings }), 400)
    return () => clearTimeout(id)
  }, [script, settings])

  if (reading) {
    return (
      <Prompter
        script={script}
        settings={settings}
        onSpeed={(delta) =>
          setState((s) => ({
            ...s,
            settings: {
              ...s.settings,
              baseSpeed: Math.min(2.5, Math.max(0.3, s.settings.baseSpeed + delta)),
            },
          }))
        }
        onFontSize={(delta) =>
          setState((s) => ({
            ...s,
            settings: {
              ...s.settings,
              fontSize: Math.min(72, Math.max(18, s.settings.fontSize + delta)),
            },
          }))
        }
        onExit={() => setReading(false)}
      />
    )
  }

  return (
    <Editor
      script={script}
      settings={settings}
      onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
      onStart={() => setReading(true)}
    />
  )
}
