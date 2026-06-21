import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const cairoRegular = fetch(new URL('../../../public/fonts/Cairo-Regular.ttf', import.meta.url)).then((res) => res.arrayBuffer())
const amiriBold = fetch(new URL('../../../public/fonts/Amiri-Bold.ttf', import.meta.url)).then((res) => res.arrayBuffer())

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const hasTitle = searchParams.has('title')
    const title = hasTitle
      ? searchParams.get('title')?.slice(0, 100)
      : 'FEPS Hub — Faculty of Economics & Political Science'
      
    const category = searchParams.get('category') || 'Academic Materials'
    
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const logoUrl = `${protocol}://${host}/feps-logo.png`

    const [cairoData, amiriData] = await Promise.all([cairoRegular, amiriBold])

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#F4F1EA',
            padding: '80px',
            border: '20px solid #1A2B4C',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'flex-start',
              marginBottom: 40,
            }}
          >
            <div
              style={{
                display: 'flex',
                textTransform: 'uppercase',
                color: '#B22222',
                letterSpacing: '0.1em',
                fontSize: 32,
                fontFamily: '"Cairo"',
                fontWeight: 400,
              }}
            >
              {category}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} width="120" height="120" alt="FEPS Logo" style={{ objectFit: 'contain' }} />
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: title && title.length > 50 ? 60 : 80,
              fontFamily: '"Amiri"',
              color: '#1A2B4C',
              lineHeight: 1.2,
              fontWeight: 700,
              marginBottom: 40,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          
          <div
            style={{
              display: 'flex',
              marginTop: 'auto',
              width: '100%',
              borderTop: '4px solid #1A2B4C',
              paddingTop: 40,
              fontSize: 32,
              color: '#0D0D0D',
              justifyContent: 'space-between',
              fontFamily: '"Cairo"',
            }}
          >
            <span>Faculty of Economics & Political Science</span>
            <span>Cairo University</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Cairo',
            data: cairoData,
            style: 'normal',
          },
          {
            name: 'Amiri',
            data: amiriData,
            style: 'normal',
          },
        ],
      }
    )
  } catch (e: unknown) {
    console.error(e)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
