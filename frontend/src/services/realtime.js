import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function connectRealtime(onGrievance, onFeedback) {
  const client = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 2000,
  })

  client.onConnect = () => {
    client.subscribe('/topic/grievances', (message) => {
      try {
        onGrievance?.(JSON.parse(message.body))
      } catch {
        onGrievance?.(null)
      }
    })

    client.subscribe('/topic/feedback', (message) => {
      try {
        onFeedback?.(JSON.parse(message.body))
      } catch {
        onFeedback?.(null)
      }
    })
  }

  client.activate()
  return () => client.deactivate()
}
