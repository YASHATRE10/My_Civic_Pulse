import { useEffect, useRef, useState } from 'react'

export function useSpeechToText() {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    setSupported(true)
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
  }, [])

  const start = (onResult) => {
    const recognition = recognitionRef.current
    if (!recognition) return

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
      onResult?.(transcript)
    }

    recognition.start()
  }

  const stop = () => recognitionRef.current?.stop()

  return { supported, listening, start, stop }
}
