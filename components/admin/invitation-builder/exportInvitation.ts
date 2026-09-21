import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

async function renderInvitation(card: HTMLElement): Promise<string> {
  await document.fonts.ready
  await waitForImages(card)

  return toPng(card, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })
}

export async function downloadInvitationImage(card: HTMLElement, fileName: string): Promise<string> {
  const imageData = await renderInvitation(card)
  return downloadBlob(dataUrlToBlob(imageData), `${fileName}.png`)
}

export async function downloadInvitationPdf(card: HTMLElement, fileName: string): Promise<string> {
  const imageData = await renderInvitation(card)
  const imageDimensions = await getImageDimensions(imageData)
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 8
  const availableWidth = pageWidth - margin * 2
  const availableHeight = pageHeight - margin * 2
  const imageRatio = imageDimensions.width / imageDimensions.height
  const pageRatio = availableWidth / availableHeight
  const width = imageRatio > pageRatio ? availableWidth : availableHeight * imageRatio
  const height = imageRatio > pageRatio ? availableWidth / imageRatio : availableHeight

  pdf.addImage(
    imageData,
    'PNG',
    (pageWidth - width) / 2,
    (pageHeight - height) / 2,
    width,
    height,
    undefined,
    'FAST',
  )
  return downloadBlob(pdf.output('blob'), `${fileName}.pdf`)
}

function downloadBlob(blob: Blob, fileName: string): string {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = fileName
  link.href = objectUrl
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  return objectUrl
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [metadata, encodedData] = dataUrl.split(',')
  const mimeType = metadata.match(/^data:([^;]+);base64$/)?.[1] || 'application/octet-stream'
  const binary = window.atob(encodedData)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: mimeType })
}

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = reject
    image.src = src
  })
}

async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'))
  await Promise.all(images.map(image => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve()
    return new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => reject(new Error(`تعذر تحميل الصورة: ${image.alt}`)), { once: true })
    })
  }))
}
