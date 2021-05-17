import * as admin from 'firebase-admin'
import * as cheerio from 'cheerio'
import axios from 'axios'

import { LINE_INSTANCE } from '../../config'

const scrapingData = async (): Promise<void> => {
  const response = await axios.get('https://covid19.ddc.moph.go.th/')
  const html = response.data

  const $ = cheerio.load(html)
  const selector = $('div.block-st-all h1')
  const selectorDate = $('.block-title-page.hidden-md.hidden-lg h2')

  if (selector.length !== 4 && selectorDate.length !== 1) {
    return
  }

  let current = ''
  const currentDate = $(selectorDate).text().split(' : ')[1].trim() || ''

  if (currentDate === '') {
    return
  }

  selector.each((index, element) => {
    if (index === 0) {
      current = $(element).text()
    } else {
      current = current.concat('|', $(element).text())
    }
  })
  // broadcast(current, currentDate)

  const previousStats = await admin.firestore().doc('line/covid19').get()
  // console.log(previousStats.data())

  if (
    !previousStats.exists ||
    previousStats.data()?.report !== current ||
    previousStats.data()?.updated !== currentDate
  ) {
    await admin
      .firestore()
      .doc('line/covid19')
      .set({ report: current, updated: currentDate })
    broadcast(current, currentDate)
  }

  return
}

const broadcast = async (
  currentReport: string,
  ReportedDate: string,
): Promise<void> => {
  const stats = currentReport.split('|')

  await LINE_INSTANCE.broadcast([
    {
      sender: {
        name: 'COVID-19 Reporter',
      },
      type: 'flex',
      altText: 'รายงานสถานการณ์ โควิด-19',
      contents: {
        type: 'bubble',
        size: 'giga',
        direction: 'ltr',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'รายงานสถานการณ์​โควิด-19',
              color: '#FFFFFF',
              weight: 'bold',
              align: 'center',
              size: 'xxl',
            },
            {
              type: 'text',
              text: `ข้อมูลวันที่ ${ReportedDate}`,
              size: 'md',
              color: '#FFFFFF',
              weight: 'regular',
            },
          ],
          alignItems: 'center',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'ติดเชื้อสะสม',
                          color: '#FFFFFF',
                          size: 'lg',
                        },
                        {
                          type: 'text',
                          text: stats[0],
                          color: '#FFFFFF',
                          size: '3xl',
                          weight: 'bold',
                        },
                      ],
                      backgroundColor: '#E1298EFF',
                      alignItems: 'center',
                      paddingAll: '3%',
                      cornerRadius: '10px',
                    },
                  ],
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'หายแล้ว',
                      color: '#FFFFFF',
                      size: 'sm',
                    },
                    {
                      type: 'text',
                      text: stats[1],
                      color: '#FFFFFF',
                      size: 'xl',
                      weight: 'bold',
                    },
                  ],
                  backgroundColor: '#046034',
                  alignItems: 'center',
                  paddingAll: '3%',
                  cornerRadius: '10px',
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'รักษาอยู่ใน รพ.',
                      color: '#FFFFFF',
                      size: 'sm',
                    },
                    {
                      type: 'text',
                      text: stats[2],
                      color: '#FFFFFF',
                      size: 'xl',
                      weight: 'bold',
                    },
                  ],
                  backgroundColor: '#179c9b',
                  alignItems: 'center',
                  paddingAll: '3%',
                  cornerRadius: '10px',
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'เสียชีวิต',
                      color: '#FFFFFF',
                      size: 'sm',
                    },
                    {
                      type: 'text',
                      text: stats[3],
                      color: '#FFFFFF',
                      size: 'xl',
                      weight: 'bold',
                    },
                  ],
                  backgroundColor: '#666666',
                  alignItems: 'center',
                  paddingAll: '3%',
                  cornerRadius: '10px',
                },
              ],
              spacing: 'md',
            },
          ],
          spacing: 'md',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'ข้อมูล: กรมควบคุมโรค',
                uri: 'https://covid19.ddc.moph.go.th/',
              },
              color: '#006738',
              height: 'sm',
              style: 'primary',
              margin: 'none',
            },
          ],
          paddingStart: '5%',
          paddingEnd: '5%',
        },
        styles: {
          header: {
            backgroundColor: '#006738',
          },
          body: {
            backgroundColor: '#FFFFFF',
          },
        },
      },
    },
  ])
  return
}

export { scrapingData }
