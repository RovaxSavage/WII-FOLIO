import { useEffect } from 'react'
import './BookLoader.css'

function usePageKeyframes(count) {
  useEffect(() => {
    const id = '__bl-page-keyframes'
    let style = document.getElementById(id)
    if (!style) {
      style = document.createElement('style')
      style.id = id
      document.head.appendChild(style)
    }

    const winStart = 18
    const winEnd = 66
    const slot = (winEnd - winStart) / count
    const flipDur = slot * 1.55

    let css = ''
    for (let i = 0; i < count; i += 1) {
      const s = winStart + i * slot
      const e = Math.min(winEnd + 6, s + flipDur)
      const name = `bl-flipPage_${i}`
      css += `
        @keyframes ${name} {
          0%, ${s.toFixed(2)}%   { transform: rotateY(0deg) translateZ(var(--bl-z)); }
          ${e.toFixed(2)}%       { transform: rotateY(-180deg) translateZ(var(--bl-z)); }
          72%                    { transform: rotateY(-180deg) translateZ(var(--bl-z)); }
          86%, 100%              { transform: rotateY(0deg) translateZ(var(--bl-z)); }
        }
        .bl-page-${i} {
          animation: ${name} var(--bl-duration, 4.9s) cubic-bezier(.55,.05,.45,1) infinite;
        }
      `
    }
    style.textContent = css
  }, [count])
}

function seededRng(seed) {
  let s = (seed * 9301 + 49297) % 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function makeWavePath(x0, y0, w, amp = 1.9, cycleW = 5.5) {
  if (w <= 0) return ''
  let d = `M ${x0.toFixed(1)},${y0.toFixed(1)}`
  let x = x0
  let sign = 1
  while (x < x0 + w - 0.3) {
    const step = Math.min(cycleW / 2, x0 + w - x)
    const cpx = (x + step / 2).toFixed(1)
    const cpy = (y0 - sign * amp).toFixed(1)
    x = Math.min(x + step, x0 + w)
    d += ` Q ${cpx},${cpy} ${x.toFixed(1)},${y0.toFixed(1)}`
    sign = -sign
  }
  return d
}

function PageText({ seed }) {
  const rng = seededRng(seed)
  const numRows = 13
  const marginX = 7
  const marginTopY = 9
  const marginBotY = 7
  const W = 86
  const H = 100
  const usableW = W - marginX * 2
  const usableH = H - marginTopY - marginBotY
  const lineH = usableH / numRows

  const paths = []
  for (let row = 0; row < numRows; row += 1) {
    const y = marginTopY + row * lineH + lineH * 0.58
    const rowMaxW = usableW * (0.76 + rng() * 0.22)
    let x = marginX + rng() * 1.5
    let wi = 0
    while (x < marginX + rowMaxW - 4) {
      const ww = 5 + rng() * 15
      const ex = Math.min(x + ww, marginX + rowMaxW)
      if (ex - x > 2.5) {
        paths.push(<path key={`${row}-${wi}`} d={makeWavePath(x, y, ex - x)} />)
      }
      wi += 1
      x = ex + 2.2 + rng() * 2.2
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        padding: '4px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      fill="none"
      stroke="rgba(82,82,82,0.50)"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      {paths}
    </svg>
  )
}

function Book({ size, pageCount, tilt, duration }) {
  usePageKeyframes(pageCount)

  const zCover = pageCount + 2
  const pages = []
  for (let i = 0; i < pageCount; i += 1) {
    const z = pageCount + 1 - i
    pages.push(
      <div
        key={i}
        className={`bl-leaf bl-page bl-page-${i}`}
        style={{ '--bl-z': `${z}px` }}
      >
        <div className="bl-page-face bl-page-front">
          <PageText seed={i * 17 + 3} />
        </div>
        <div className="bl-page-face bl-page-back">
          <PageText seed={i * 17 + 11} />
        </div>
      </div>,
    )
  }

  return (
    <div
      className="bl-book"
      style={{
        '--bl-size': `${size}px`,
        '--bl-tilt': `${tilt}deg`,
        '--bl-duration': `${duration}s`,
      }}
    >
      <div className="bl-shadow" />
      <div className="bl-leaf bl-back-cover" style={{ transform: 'translateZ(1px)' }} />
      {pages}
      <div className="bl-leaf bl-front-cover" style={{ '--bl-z-cover': `${zCover}px` }} />
    </div>
  )
}

export default function BookLoader({
  size = 160,
  pageCount = 4,
  tilt = 30,
  duration = 4.9,
  perspective = 1800,
  label,
}) {
  return (
    <div className="bl-stage" style={{ perspective: `${perspective}px` }} role="status" aria-live="polite">
      <Book size={size} pageCount={pageCount} tilt={tilt} duration={duration} />
      {label ? <p className="bl-status">{label}</p> : null}
    </div>
  )
}
