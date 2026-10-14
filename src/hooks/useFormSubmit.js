import { useState } from 'react'

export function useFormSubmit() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function submit(e) {
    e.preventDefault()
    setStatus('sending')
    const form = e.target
    const data = new FormData(form)

    try {
      const res = await fetch('/api/contact.php', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })

      if (res.ok) {
        setStatus('sent')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return { status, submit }
}
