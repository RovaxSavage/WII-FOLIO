import { useEffect, useState } from 'react'
import './App.css'

const BG_IMAGE_SIZE = {
  width: 1600,
  height: 893,
}

const WII_BUTTON = {
  x: 75,
  y: 714,
  size: 142,
}

const MAIL_BUTTON = {
  x: 1384,
  y: 714,
  size: 142,
}

const GRID_ZONE = {
  x: 70,
  y: 96,
  width: 1460,
  height: 480,
  columnGap: 10,
  rowGap: 10,
}

const GRID_MIN_TOP_MARGIN = 24
const GRID_BOTTOM_PADDING = 14
const GRID_LINE_ABOVE_BUTTON = 36
const CLOCK_LINE_Y = 780
const GRID_VERTICAL_OFFSET = -10

const CARD_PATH =
  'M24,6 C66,1 154,1 196,6 C210,10 218,26 218,40 C220,58 220,82 218,100 C216,118 208,132 194,136 C154,139 66,139 26,136 C12,132 4,118 2,100 C0,82 0,58 2,40 C4,26 12,10 24,6 Z'

const CARDS = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  label: `Card ${index + 1}`,
}))

function getLayoutMetrics() {
  if (typeof window === 'undefined') {
    return {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      viewportHeight: BG_IMAGE_SIZE.height,
    }
  }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const scale = Math.max(
    viewportWidth / BG_IMAGE_SIZE.width,
    viewportHeight / BG_IMAGE_SIZE.height,
  )

  const scaledImageWidth = BG_IMAGE_SIZE.width * scale
  const scaledImageHeight = BG_IMAGE_SIZE.height * scale

  const offsetX = (viewportWidth - scaledImageWidth) / 2
  const offsetY = viewportHeight - scaledImageHeight

  return {
    scale,
    offsetX,
    offsetY,
    viewportHeight,
  }
}

function getButtonRect(button, metrics = getLayoutMetrics()) {
  const { scale, offsetX, offsetY } = metrics

  return {
    left: `${offsetX + button.x * scale}px`,
    top: `${offsetY + button.y * scale}px`,
    width: `${button.size * scale}px`,
    height: `${button.size * scale}px`,
  }
}

function getGridRect(metrics = getLayoutMetrics()) {
  const { scale, offsetX, offsetY } = metrics
  const lineY = offsetY + (WII_BUTTON.y - GRID_LINE_ABOVE_BUTTON) * scale
  const topLimit = GRID_MIN_TOP_MARGIN
  const bottomLimit = lineY - GRID_BOTTOM_PADDING
  const availableHeight = Math.max(0, bottomLimit - topLimit)
  const desiredHeight = GRID_ZONE.height * scale
  const height = Math.max(0, Math.min(desiredHeight, availableHeight))
  const centeredTop = topLimit + (availableHeight - height) / 2
  const maxTop = bottomLimit - height
  const top = Math.min(maxTop, Math.max(topLimit, centeredTop + GRID_VERTICAL_OFFSET))

  return {
    left: `${offsetX + GRID_ZONE.x * scale}px`,
    top: `${top}px`,
    width: `${GRID_ZONE.width * scale}px`,
    height: `${height}px`,
    '--wii-card-gap': `${GRID_ZONE.columnGap * scale}px`,
    '--wii-card-row-gap': `${GRID_ZONE.rowGap * scale}px`,
  }
}

function getClockStyles(metrics = getLayoutMetrics()) {
  const { scale, offsetX, offsetY, viewportHeight } = metrics
  const lineY = offsetY + CLOCK_LINE_Y * scale
  const gridLineY = offsetY + (WII_BUTTON.y - GRID_LINE_ABOVE_BUTTON) * scale
  const topLimit = GRID_MIN_TOP_MARGIN
  const bottomLimit = gridLineY - GRID_BOTTOM_PADDING
  const availableHeight = Math.max(0, bottomLimit - topLimit)
  const desiredHeight = GRID_ZONE.height * scale
  const height = Math.max(0, Math.min(desiredHeight, availableHeight))
  const centeredTop = topLimit + (availableHeight - height) / 2
  const maxTop = bottomLimit - height
  const gridTop = Math.min(maxTop, Math.max(topLimit, centeredTop + GRID_VERTICAL_OFFSET))
  const gridBottom = gridTop + height
  const centerX = offsetX + (BG_IMAGE_SIZE.width * scale) / 2
  const timeHeight = 57.5 * scale
  const dateHeight = 43.7 * scale
  const timeCenterY = gridBottom + (lineY - gridBottom) * 0.5
  const timeTop = timeCenterY - timeHeight / 2
  const dateCenterY = lineY + (viewportHeight - lineY) * 0.5
  const dateTop = dateCenterY - dateHeight / 2
  const dateGap = Math.max(0, dateTop - (timeTop + timeHeight))

  return {
    left: `${centerX}px`,
    top: `${timeTop}px`,
    '--wii-clock-scale': scale,
    '--wii-date-gap': `${dateGap}px`,
  }
}

function getLayoutState() {
  const metrics = getLayoutMetrics()
  return {
    left: getButtonRect(WII_BUTTON, metrics),
    right: getButtonRect(MAIL_BUTTON, metrics),
    grid: getGridRect(metrics),
    clock: getClockStyles(metrics),
  }
}

function formatTime(value) {
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function formatDate(value) {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(value)
  return `${weekday} ${value.getDate()}/${value.getMonth() + 1}`
}

function App() {
  const [layout, setLayout] = useState(() => getLayoutState())
  const [selectedCardId, setSelectedCardId] = useState(1)
  const [now, setNow] = useState(() => new Date())
  const timeText = formatTime(now)
  const [hours, minutes] = timeText.split(':')
  const [hourTens, hourUnits] = hours.split('')
  const [minuteTens, minuteUnits] = minutes.split('')

  useEffect(() => {
    const updateLayout = () => {
      setLayout(getLayoutState())
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)

    return () => {
      window.removeEventListener('resize', updateLayout)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 30000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  return (
    <>
      <main className="wii-card-grid" style={layout.grid} aria-label="Griglia contenuti">
        {CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`wii-card ${selectedCardId === card.id ? 'is-selected' : ''}`}
            onClick={() => setSelectedCardId(card.id)}
            aria-pressed={selectedCardId === card.id}
          >
            <svg
              className="wii-card__shape"
              viewBox="0 0 220 140"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <radialGradient id={`wii-card-grad-${card.id}`} cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#f0f0f0" />
                  <stop offset="100%" stopColor="#dcdcdc" />
                </radialGradient>
                <linearGradient id={`wii-card-gloss-${card.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.88)" />
                  <stop offset="48%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <linearGradient id={`wii-card-shadow-${card.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="58%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
                </linearGradient>
              </defs>
              <path className="wii-card__base" d={CARD_PATH} fill={`url(#wii-card-grad-${card.id})`} />
              <path className="wii-card__gloss" d={CARD_PATH} fill={`url(#wii-card-gloss-${card.id})`} />
              <path className="wii-card__shade" d={CARD_PATH} fill={`url(#wii-card-shadow-${card.id})`} />
              <path className="wii-card__stroke" d={CARD_PATH} />
            </svg>
            <span className="wii-card__label">{card.label}</span>
          </button>
        ))}
      </main>
        <div className="wii-clock" style={layout.clock} aria-label="Ora e data">
          <div className="wii-clock__time" aria-label={timeText}>
            <span className="wii-clock__digit">{hourTens}</span>
            <span className="wii-clock__digit">{hourUnits}</span>
            <span className="wii-clock__colon" aria-hidden="true">
              :
            </span>
            <span className="wii-clock__digit">{minuteTens}</span>
            <span className="wii-clock__digit">{minuteUnits}</span>
          </div>
          <div className="wii-clock__date">{formatDate(now)}</div>
        </div>
      <button
        type="button"
        className="wii-overlay-button"
        style={layout.left}
        aria-label="Pulsante Wii"
      />
      <button
        type="button"
        className="wii-overlay-button"
        style={layout.right}
        aria-label="Pulsante Messaggi"
      />
    </>
  )
}

export default App
