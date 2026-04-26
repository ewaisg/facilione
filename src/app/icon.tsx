import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1F3864',
          borderRadius: '6px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3L4 8V20H9V14H15V20H20V8L12 3Z"
            fill="white"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="7" y="11" width="2" height="2" fill="#1F3864" />
          <rect x="11" y="11" width="2" height="2" fill="#1F3864" />
          <rect x="15" y="11" width="2" height="2" fill="#1F3864" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
