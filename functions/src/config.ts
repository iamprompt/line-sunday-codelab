import * as functions from 'firebase-functions'
import * as line from '@line/bot-sdk'
import { ClientConfig } from '@line/bot-sdk'
// import axios, { AxiosRequestConfig } from 'axios'

const LINE_ACCESS_TOKEN = functions.config().line.channel_access_token || ''

// const LINE_MESSAGING_CONFIG: AxiosRequestConfig = {
//   baseURL: 'https://api.line.me/v2/bot/message',
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
//   },
// }

// const LINE_MESSAGING_INSTANCE = axios.create(LINE_MESSAGING_CONFIG)

// export { LINE_MESSAGING_INSTANCE }

const LINE_CONFIG: ClientConfig = {
  channelAccessToken: LINE_ACCESS_TOKEN,
}

const LINE_INSTANCE = new line.Client(LINE_CONFIG)

export { LINE_INSTANCE }
