import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { MessageEvent, Profile } from '@line/bot-sdk'
import { LINE_INSTANCE } from '../../config'

type TextTraslatedDocument = {
  input: string
  timestamp: admin.firestore.Timestamp
  replyToken: string
  sourceType: 'user' | 'group' | 'room'
  sourceUserId: string
  translated?: {
    th: string
    ja: string
  }
}

const saveGroupTextInFireStore = async (e: MessageEvent) => {
  console.group(`-- Save Group Text in Firestore --`)
  console.log(JSON.stringify(e))

  if (e.message.type === 'text') {
    const infoSaved: Partial<TextTraslatedDocument> = {
      input: e.message.text,
      timestamp: admin.firestore.Timestamp.fromMillis(e.timestamp),
      replyToken: e.replyToken,
      sourceType: e.source.type,
      sourceUserId: e.source.userId,
    }

    let sourceId = ''
    switch (e.source.type) {
      case 'user':
        sourceId = e.source.userId
        break

      case 'group':
        sourceId = e.source.groupId
        break

      case 'room':
        sourceId = e.source.roomId
        break
    }

    await admin
      .firestore()
      .collection('translations')
      .doc(sourceId)
      .set(infoSaved, { merge: true })
      .then(function () {
        console.log('Text is saved to Firestore successfully!!')
      })
      .catch(function (error) {
        console.error('Error Writing Document: ', error)
      })
  } else {
    return
  }

  console.groupEnd()
}

const handleTranslated = async (
  change: functions.Change<admin.firestore.DocumentSnapshot>,
  context: functions.EventContext,
) => {
  const {
    params: { sourceId },
  } = context
  const { after, before } = change
  const previousD = before.data() as TextTraslatedDocument
  const latestD = after.data() as TextTraslatedDocument

  console.log(previousD)
  console.log(latestD)

  let senderProfile: Profile

  try {
    switch (latestD.sourceType) {
      case 'user':
        senderProfile = await LINE_INSTANCE.getProfile(latestD.sourceUserId)
        break

      case 'group':
        senderProfile = await LINE_INSTANCE.getGroupMemberProfile(
          sourceId,
          latestD.sourceUserId,
        )
        break

      case 'room':
        senderProfile = await LINE_INSTANCE.getRoomMemberProfile(
          sourceId,
          latestD.sourceUserId,
        )
        break
    }
  } catch (error) {
    throw new Error(error)
  }

  // console.log(senderProfile)

  const japaneseRegEx =
    /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/

  if (previousD && latestD) {
    if (
      !(
        latestD.input === latestD.translated?.ja ||
        latestD.input === latestD.translated?.th
      )
    ) {
      return
    }

    if (latestD.replyToken) {
      await translatedReply(
        latestD.replyToken,
        latestD.input.match(japaneseRegEx)
          ? `🇹🇭 ${latestD.translated?.th}`
          : `🇯🇵 ${latestD.translated?.ja}`,
        senderProfile,
      )
    }
  }

  return
}

const translatedReply = async (
  replyToken: string,
  msg: string,
  senderProfile?: Profile,
) => {
  return await LINE_INSTANCE.replyMessage(replyToken, [
    {
      sender: {
        name: senderProfile?.displayName || 'วุ้นแปลภาษา',
        iconUrl: senderProfile?.pictureUrl,
      },
      type: 'flex',
      altText: 'มีข้อความมาใหม่!!',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: msg,
              wrap: true,
            },
          ],
        },
      },
    },
  ])
}

export { saveGroupTextInFireStore, handleTranslated }
