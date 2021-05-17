import { MessageEvent, WebhookRequestBody } from '@line/bot-sdk'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

admin.initializeApp()

// import { scrapingData } from './codelabs/01-covid19-noti'
import {
  saveGroupTextInFireStore,
  handleTranslated,
} from './codelabs/02-translation'

export const helloWorld = functions.https.onRequest((req, res) => {
  functions.logger.info(`It's working!!`, { structuredData: true })
  res.send({ status: 'success' })
})

export const chathook = functions.https.onRequest(async (req, res) => {
  //* Log Incoming Webhook Body
  if (req.rawBody) {
    console.log(`Incomming Body`)
    console.log(JSON.stringify(req.body))
  }

  //* Week 1 : COVID19 Notification LINE Chatbot
  // try {
  //   await scrapingData()
  //   res.send({ status: 'success' })
  //   return
  // } catch (error) {
  //   res.status(400).send(error)
  //   return
  // }

  //* Week 2 : Translation LINE Chatbot (TH-JP)
  try {
    const { body }: { body: WebhookRequestBody } = req
    await saveGroupTextInFireStore(body.events[0] as MessageEvent)
    res.send({ status: 'success' })
    return
  } catch (error) {
    res.status(400).send(error)
    return
  }

  // res.send({ status: 'success' })
  // return
})

//* Week 1 : COVID19 Schedule LINE Chatbot (PUBSUB: every 1 min)
// export const COVID19_NOTI_PUBSUB = functions
//   .region('asia-northeast1')
//   .pubsub.schedule('* * * * *')
//   .timeZone('Asia/Bangkok')
//   .onRun(async (context) => {
//     try {
//       await scrapingData()
//       return
//     } catch (error) {
//       console.error(error)
//       return
//     }
//   })

//* Week 2 : Translation LINE Chatbot
exports.TranslatedReply = functions
  .region('asia-northeast1')
  .firestore.document('translations/{sourceId}')
  .onWrite(handleTranslated)
