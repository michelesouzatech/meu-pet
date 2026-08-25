import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export function usePushNotifications(userId) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  const subscribeAndSave = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const json = subscription.toJSON()
    await supabase.from('inscricoes_push').upsert(
      {
        usuario_id: userId,
        endpoint: json.endpoint,
        chave_p256dh: json.keys.p256dh,
        chave_auth: json.keys.auth,
      },
      { onConflict: 'endpoint' }
    )
  }, [userId])

  async function requestPermission() {
    if (typeof Notification === 'undefined') {
      setPermission('unsupported')
      return 'unsupported'
    }
    // O navegador só mostra o popup de permissão uma vez; depois disso
    // ele sempre devolve a resposta que a pessoa já deu (granted/denied).
    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted' && userId) {
      await subscribeAndSave()
    }

    return result
  }

  return { permission, requestPermission }
}
