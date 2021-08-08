import { MessageEvent } from '@line/bot-sdk'
import axios from 'axios'
import * as functions from 'firebase-functions'
import { LINE_INSTANCE } from '../../config'
import { trackItemPayload, trackNotFoundTemplate } from './responseTemplate'

const ThaiPostToken = functions.config().thaipost.token

const ThaipostEndpoint = {
  AuthToken:
    'https://trackapi.thailandpost.co.th/post/api/v1/authenticate/token',
  ItemTrack: `https://trackapi.thailandpost.co.th/post/api/v1/track`,
}

type AuthToken = {
  expire: string
  token: string
}

export type ItemStatus = {
  barcode: string
  status: string
  status_description: string
  status_date: string
  location: string
  postcode: string
  delivery_status: string | null
  delivery_description: string | null
  delivery_datetime: string | null
  receiver_name: string | null
  signature: string | null
}

export type Items = {
  [key: string]: ItemStatus[]
}

type ItemTrackResponse = {
  response: {
    items: Items
    track_count: {
      track_date: string
      count_number: number
      track_count_limit: number
    }
    message: string
    status: boolean
  }
}

const getAuthToken = async () => {
  const res = await axios.post<AuthToken>(
    'https://trackapi.thailandpost.co.th/post/api/v1/authenticate/token',
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${ThaiPostToken}`,
      },
    },
  )
  // console.log(res)
  console.log('Token is ready!')
  // console.log(res.data)

  return res.data
}

const getItemTrack = async (trackNo: string) => {
  const { token } = await getAuthToken()
  // console.log(token)

  const params = {
    status: 'all',
    language: 'TH',
    barcode: [trackNo],
  }

  const res = await axios.post<ItemTrackResponse>(
    ThaipostEndpoint.ItemTrack,
    params,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    },
  )

  // console.log(res)

  return res.data.response.items
}

const thailandPostWebhook = async (message: MessageEvent): Promise<void> => {
  if (message.message.type === 'text') {
    const res = await getItemTrack(message.message.text)

    const trackingItems = Object.values(res)
    console.log(trackingItems)

    if (trackingItems[0].length === 0) {
      await LINE_INSTANCE.replyMessage(
        message.replyToken,
        trackNotFoundTemplate,
      )
    }

    const trackingPayload = trackItemPayload(trackingItems[0])
    console.log(JSON.stringify(trackingPayload))

    await LINE_INSTANCE.replyMessage(message.replyToken, trackingPayload)
  }
}

export { thailandPostWebhook }
