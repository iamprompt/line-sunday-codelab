import { FlexBox, FlexMessage, TextMessage } from '@line/bot-sdk'
import { ItemStatus } from '.'

const statusColor: { [key: string]: string } = {
  '501': '#6BFF6B',
  '201': '#FCFEC9',
}

const trackItemStatus = (postStatus: ItemStatus): FlexBox => {
  const payload: FlexBox = {
    type: 'box',
    layout: 'horizontal',
    contents: [
      {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: `${postStatus.status_date}`,
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: `${postStatus.status_description}`,
                size: 'sm',
              },
            ],
            spacing: 'none',
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: `${postStatus.location}`,
                size: 'sm',
              },
              {
                type: 'text',
                text: `${postStatus.postcode}`,
                size: 'sm',
              },
            ],
            spacing: 'none',
            margin: 'md',
          },
        ],
      },
    ],
    backgroundColor: statusColor[postStatus.status] || '#EEEEEE',
    cornerRadius: 'md',
    paddingAll: '10px',
  }

  if (postStatus.receiver_name) {
    // @ts-expect-error contents
    payload.contents[0].contents.push({
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: `ผู้รับ ${postStatus.receiver_name}`,
          size: 'sm',
        },
      ],
      spacing: 'none',
      margin: 'md',
    })
  }

  return payload
}

const trackItemPayload = (postItem: ItemStatus[]): FlexMessage => {
  const flexStatus = postItem.map((s) => {
    return trackItemStatus(s)
  })

  console.log(flexStatus)

  return {
    type: 'flex',
    altText: 'สถานะการส่งของ',
    contents: {
      type: 'bubble',
      size: 'giga',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${postItem[0].barcode}`,
            decoration: 'none',
            size: 'xl',
            weight: 'bold',
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: flexStatus,
            spacing: 'sm',
            margin: 'md',
          },
        ],
      },
    },
  }
}

const trackNotFoundTemplate: TextMessage = {
  type: 'text',
  text: 'ไม่พบหมายเลขพัสดุที่ระบุ',
}

export { trackItemPayload, trackNotFoundTemplate }
