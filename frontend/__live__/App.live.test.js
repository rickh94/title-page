import puppeteer from 'puppeteer'
import '@testing-library/jest-dom/extend-expect'
import faker from 'faker'

const isDebugging = () => {
  const debugging_mode = {
    headless: false,
    slowMo: 25,
    devtools: true,
  }
  // eslint-disable-next-line no-undef
  return process.env.NODE_ENV === 'debug' ? debugging_mode : {}
}

// eslint-disable-next-line no-undef
const timeout = process.env.NODE_ENV === 'debug' ? 50000 : 5000

const piece = {
  title: faker.lorem.words(3),
  composers: [
    faker.fake('{{name.firstName}} {{name.lastName}}'),
    faker.fake('{{name.firstName}} {{name.lastName}}'),
    faker.fake('{{name.firstName}} {{name.lastName}}'),
  ],
  partName: faker.lorem.word(),
  partAdditional: faker.lorem.words(2),
  extraLines: [faker.lorem.words(2), faker.lorem.words(4), faker.lorem.words(8)],
}

let browser
let page
beforeAll(async () => {
  browser = await puppeteer.launch(isDebugging())
  page = await browser.newPage()
  await page.goto('http://localhost:8080')
  page.setViewport({ width: 1024, height: 768 })
})

afterAll(() => {
  if (isDebugging()) {
    browser.close()
  }
})

describe('on page load', () => {
  it('loads title', async () => {
    const title = await page.$eval('#app-title', e => e.textContent)
    expect(title).toEqual('Sheet Music Title Page Creator')
  })

  it('loads form', async () => {
    const form = await page.$eval('[data-testid="form"]', e => e.innerHTML)
    expect(form).toBeTruthy()
  })

  it('loads empty frame', async () => {
    const [frame, insideFrame] = await page.$eval('[data-testid="frame"]', e => [
      e.outerHTML,
      e.innerHTML,
    ])
    expect(frame).toBeTruthy()
    expect(insideFrame).toBeFalsy()
  })

  it(
    'takes input, submits form, then loads frame',
    async () => {
      await page.click('[data-testid="title"]')
      await page.type('[data-testid="title"]', piece.title)

      await page.click('[data-testid="part-name"]')
      await page.type('[data-testid="part-name"]', piece.partName)

      await page.click('[data-testid="part-additional"]')
      await page.type('[data-testid="part-additional"]', piece.partAdditional)

      for (const composer of piece.composers) {
        await page.click('[data-testid="composer-next-input"]')
        await page.type('[data-testid="composer-next-input"]', composer)
        await page.click('[data-testid="composer-add-button"]')
      }

      for (const extraLine of piece.extraLines) {
        await page.click('[data-testid="extra-line-next-input"]')
        await page.type('[data-testid="extra-line-next-input"]', extraLine)
        await page.click('[data-testid="extra-line-add-button"]')
      }

      await page.click('[data-testid="submit-button"]')
      await page.waitForSelector('[data-testid="wrapper-object"]')
      const pdfSrc = await page.$eval('[data-testid="pdf-embed"]', e => e.src)
      expect(pdfSrc).toBeTruthy()
    },
    timeout
  )

  it('clears the form', async () => {
    const testids = ['title', 'part-name', 'part-additional']
    for (let testid of testids) {
      const valueBefore = await page.$eval(`[data-testid="${testid}"]`, e => e.value)
      expect(valueBefore).toBeTruthy()
    }
    const listNames = ['composer', 'extra-line']
    for (let name of listNames) {
      const listBefore = await page.$$(`#${name}s > li`)
      expect(listBefore.length).not.toEqual(0)
    }
    await page.click('[data-testid="clear-button"]')

    for (let testid of testids) {
      const valueAfter = await page.$eval(`[data-testid="${testid}"]`, e => e.value)
      expect(valueAfter).toBeFalsy()
    }
    for (let name of listNames) {
      const listAfter = await page.$$(`#${name}s > li`)
      expect(listAfter.length).toEqual(0)
    }
  })

  it(
    'can remove added items',
    async () => {
      await page.click('[data-testid="clear-button"]')
      for (const composer of piece.composers) {
        await page.click('[data-testid="composer-next-input"]')
        await page.type('[data-testid="composer-next-input"]', composer)
        await page.click('[data-testid="composer-add-button"]')
      }
      const listBefore = await page.$$('#composers > li')
      expect(listBefore).toHaveLength(piece.composers.length)
      await page.click('[data-testid="composer-item-0-remove"]')
      const listAfter = await page.$$('#composers > li')
      expect(listAfter).toHaveLength(piece.composers.length - 1)
    },
    timeout
  )
})
