import { useEffect } from 'react'

export function useKeyboardShortcut(keys, callback, options = {}) {
  const { target = document, preventDefault = true } = options

  useEffect(() => {
    const handleKeyDown = (event) => {
      const keysArray = Array.isArray(keys) ? keys : [keys]
      const pressedKeys = []

      if (event.ctrlKey) pressedKeys.push('ctrl')
      if (event.metaKey) pressedKeys.push('cmd')
      if (event.shiftKey) pressedKeys.push('shift')
      if (event.altKey) pressedKeys.push('alt')
      
      pressedKeys.push(event.key.toLowerCase())

      const shortcutPressed = keysArray.every(key => 
        pressedKeys.includes(key.toLowerCase())
      )

      if (shortcutPressed) {
        if (preventDefault) {
          event.preventDefault()
        }
        callback(event)
      }
    }

    target.addEventListener('keydown', handleKeyDown)

    return () => {
      target.removeEventListener('keydown', handleKeyDown)
    }
  }, [keys, callback, target, preventDefault])
}