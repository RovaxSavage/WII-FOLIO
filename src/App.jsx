import { useEffect, useRef, useState } from 'react'
import './App.css'
import contactMiiImage from './assets/contactmewii.PNG'
import myWorksMiiImage from './assets/myworksmii.PNG'
import BookLoader from './BookLoader'

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

const CHANNELS = [
  {
    id: 'profile',
    label: 'Profilo Mii',
    eyebrow: 'Chi sono',
    icon: 'mii',
    accent: '#69c7ea',
    summary: "Identita, tono e competenze principali in un colpo d'occhio.",
    title: 'Frontend orientato a interfacce curate',
    description:
      'Un portfolio pensato come menu Wii: immediato, giocoso e leggibile, ma con struttura solida per raccontare lavoro, metodo e personalita.',
    highlights: ['UI React responsive', 'Microinterazioni leggere', 'Accessibilita e performance'],
    stat: '01',
  },
  {
    id: 'projects',
    label: 'Project Channel',
    eyebrow: 'Case study',
    icon: 'spark',
    accent: '#7ac943',
    imageSrc: myWorksMiiImage,
    summary: 'Spazio per progetti selezionati, risultati e link live.',
    title: 'Progetti con contesto e risultati',
    description:
      "Ogni progetto puo diventare un canale: problema, soluzione, stack usato, ruolo e risultato finale senza disperdere l'attenzione.",
    highlights: ['Web app', 'Landing esperienziali', 'Dashboard e tool interattivi'],
    stat: '08',
  },
  {
    id: 'skills',
    label: 'Skill Channel',
    eyebrow: 'Stack',
    icon: 'grid',
    accent: '#f2b441',
    summary: 'Tecnologie, strumenti e punti forti organizzati per area.',
    title: 'Stack chiaro, non una lista infinita',
    description:
      'La sezione competenze privilegia categorie utili: interfaccia, logica, tooling, accessibilita e cura del dettaglio visivo.',
    highlights: ['React e Vite', 'CSS moderno', 'Design system pragmatici'],
    stat: '24',
  },
  {
    id: 'lab',
    label: 'Lab Channel',
    eyebrow: 'Esperimenti',
    icon: 'wave',
    accent: '#ff7aa2',
    summary: 'Animazioni, prototipi e dettagli che mostrano gusto tecnico.',
    title: 'Un laboratorio per provare idee',
    description:
      'Questo canale puo ospitare micro-prototipi, esperimenti grafici e piccole interazioni che rendono memorabile il portfolio.',
    highlights: ['Motion UI', 'Canvas e SVG', 'Prototipi rapidi'],
    stat: '12',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    eyebrow: 'Percorso',
    icon: 'dots',
    accent: '#9a8cff',
    summary: 'Esperienze, formazione e traguardi in sequenza leggibile.',
    title: 'Una storia professionale facile da seguire',
    description:
      'La timeline evita blocchi di testo troppo lunghi e trasforma il percorso in passaggi essenziali, perfetti per recruiter e clienti.',
    highlights: ['Esperienze', 'Formazione', 'Milestone rilevanti'],
    stat: '05',
  },
  {
    id: 'contact',
    label: 'Messaggi',
    eyebrow: 'Contatti',
    icon: 'mail',
    accent: '#54bce8',
    imageSrc: contactMiiImage,
    summary: 'Una sezione diretta per email, social e disponibilita.',
    title: 'Contatto rapido, senza frizione',
    description:
      'Il canale messaggi raccoglie i punti di contatto e puo diventare la zona per email, GitHub, LinkedIn e disponibilita attuale.',
    highlights: ['Email in evidenza', 'Social selezionati', 'Disponibilita sintetica'],
    stat: 'ON',
  },
  {
    id: 'resume',
    label: 'CV Channel',
    eyebrow: 'Resume',
    icon: 'doc',
    accent: '#5fcf97',
    summary: 'Un punto unico per scaricare CV e leggere il profilo breve.',
    title: 'CV e profilo breve nello stesso posto',
    description:
      'Questo spazio puo collegare il curriculum, una bio compatta e una versione stampabile del profilo professionale.',
    highlights: ['Profilo breve', 'Download CV', 'Competenze chiave'],
    stat: 'PDF',
  },
  {
    id: 'now',
    label: 'Now Playing',
    eyebrow: 'Focus',
    icon: 'play',
    accent: '#ff9b54',
    summary: 'Cosa stai costruendo ora e quali collaborazioni cerchi.',
    title: 'Stato attuale e direzione',
    description:
      'Un canale "now" rende il portfolio vivo: racconta su cosa stai lavorando, cosa vuoi migliorare e che tipo di progetti cerchi.',
    highlights: ['Focus attuale', 'Obiettivi', 'Collaborazioni ideali'],
    stat: 'NOW',
  },
]

const CONTACT_CHANNEL_ID = 'contact'
const PROFILE_CHANNEL_ID = 'profile'
const SAMPLE_PDF_URL = '/street-pulse.pdf'
const PROFILE_IMAGE_URL = '/street-pulse-card.png'
const PROFILE_START_IMAGE_URL = '/street-pulse-start.png'
const CHANNEL_VIEW_MENU = 'menu'
const CHANNEL_VIEW_START = 'start'
const CHANNEL_VIEW_BOOK = 'book'
const CHANNEL_START_EXIT_MS = 460
const pdfFlipbookCache = new Map()

function getCachedPdfPageImages(src) {
  return pdfFlipbookCache.get(src)
}

function loadPdfPageImages(src, onProgress) {
  const cached = pdfFlipbookCache.get(src)

  if (cached?.images) {
    return Promise.resolve(cached.images)
  }

  if (cached?.promise) {
    return cached.promise
  }

  const promise = (async () => {
    const [pdfjsLib, workerModule] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.mjs?url'),
    ])

    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default

    const loadingTask = pdfjsLib.getDocument(src)
    const pdf = await loadingTask.promise
    const renderedPages = []

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1.55 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Canvas context unavailable')
      }

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({ canvasContext: context, viewport }).promise
      renderedPages.push(canvas.toDataURL('image/jpeg', 0.92))
      onProgress?.(pageNumber, pdf.numPages)
    }

    pdfFlipbookCache.set(src, { images: renderedPages, promise: Promise.resolve(renderedPages) })
    return renderedPages
  })()

  pdfFlipbookCache.set(src, { images: null, promise })
  promise.catch(() => {
    if (pdfFlipbookCache.get(src)?.promise === promise) {
      pdfFlipbookCache.delete(src)
    }
  })

  return promise
}

function preloadPdfFlipbook(src) {
  loadPdfPageImages(src).catch((error) => {
    console.error(error)
  })
}

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
  const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'short' }).format(value)
  return `${weekday} ${value.getDate()}/${value.getMonth() + 1}`
}

function ChannelIcon({ type }) {
  return (
    <span className={`wii-channel-icon wii-channel-icon--${type}`} aria-hidden="true">
      <span />
    </span>
  )
}

function CleanPdfFlipbook({ src }) {
  const bookRef = useRef(null)
  const pageFlipRef = useRef(null)
  const [pageImages, setPageImages] = useState([])
  const [status, setStatus] = useState('Caricamento PDF')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadPreloadedPages() {
      const cached = getCachedPdfPageImages(src)

      if (cached?.images) {
        setPageImages(cached.images)
        setStatus('')
        return
      }

      if (cached?.promise) {
        setStatus('')
      }

      try {
        const renderedPages = await loadPdfPageImages(src, (pageNumber, pageCount) => {
          if (!cancelled) {
            setStatus(`Preparazione pagine ${pageNumber}/${pageCount}`)
          }
        })

        if (!cancelled) {
          setPageImages(renderedPages)
          setStatus('')
        }
      } catch (renderError) {
        if (!cancelled) {
          setError('Impossibile caricare il PDF')
          console.error(renderError)
        }
      }
    }

    loadPreloadedPages()

    return () => {
      cancelled = true
    }
  }, [src])

  useEffect(() => {
    if (!bookRef.current || pageImages.length === 0) return undefined
    let cancelled = false
    let pageFlip

    async function mountBook() {
      const { PageFlip } = await import('page-flip')

      if (cancelled || !bookRef.current) return

      pageFlip = new PageFlip(bookRef.current, {
        width: 420,
        height: 594,
        size: 'stretch',
        minWidth: 260,
        maxWidth: 510,
        minHeight: 370,
        maxHeight: 720,
        showCover: true,
        usePortrait: true,
        drawShadow: true,
        maxShadowOpacity: 0.24,
        flippingTime: 700,
        mobileScrollSupport: false,
        autoSize: true,
      })

      pageFlip.loadFromImages(pageImages)
      pageFlipRef.current = pageFlip
    }

    mountBook()

    return () => {
      cancelled = true
      pageFlip?.destroy()
      pageFlipRef.current = null
    }
  }, [pageImages])

  return (
    <div className="wii-clean-flipbook" aria-label="Libro PDF sfogliabile">
      {error ? <p className="wii-clean-flipbook__status">{error}</p> : null}
      {!error && pageImages.length === 0 ? (
        <div className="wii-clean-flipbook__loader">
          <BookLoader label={status} />
        </div>
      ) : null}
      <div
        ref={bookRef}
        className={`wii-clean-flipbook__book ${pageImages.length > 0 ? 'is-ready' : ''}`}
      />
    </div>
  )
}

function App() {
  const [layout, setLayout] = useState(() => getLayoutState())
  const [selectedChannelId, setSelectedChannelId] = useState(CHANNELS[0].id)
  const [openChannelId, setOpenChannelId] = useState(null)
  const [profileView, setProfileView] = useState(CHANNEL_VIEW_MENU)
  const [isProfileStartExiting, setIsProfileStartExiting] = useState(false)
  const [isBookPaused, setIsBookPaused] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const closeButtonRef = useRef(null)
  const profileStartExitTimerRef = useRef(null)
  const openChannel = CHANNELS.find((channel) => channel.id === openChannelId)
  const isProfileStartVisible = profileView === CHANNEL_VIEW_START
  const isBookVisible = profileView === CHANNEL_VIEW_BOOK
  const isMainMenuVisible = (!isProfileStartVisible && !isBookVisible) || isProfileStartExiting
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

  useEffect(() => {
    preloadPdfFlipbook(SAMPLE_PDF_URL)
  }, [])

  useEffect(() => {
    return () => {
      window.clearTimeout(profileStartExitTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (profileView === CHANNEL_VIEW_BOOK) {
          event.preventDefault()
          setIsBookPaused((isPaused) => !isPaused)
          return
        }

        window.clearTimeout(profileStartExitTimerRef.current)
        setIsProfileStartExiting(false)
        setOpenChannelId(null)
        setProfileView(CHANNEL_VIEW_MENU)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileView])

  useEffect(() => {
    if (openChannelId) {
      closeButtonRef.current?.focus()
    }
  }, [openChannelId])

  const openChannelById = (channelId) => {
    window.clearTimeout(profileStartExitTimerRef.current)
    setIsProfileStartExiting(false)
    setIsBookPaused(false)
    setSelectedChannelId(channelId)

    if (channelId === PROFILE_CHANNEL_ID) {
      setOpenChannelId(null)
      setProfileView(CHANNEL_VIEW_START)
      return
    }

    setOpenChannelId(channelId)
  }

  const returnToMainMenu = () => {
    window.clearTimeout(profileStartExitTimerRef.current)
    setIsProfileStartExiting(false)
    setIsBookPaused(false)
    setOpenChannelId(null)
    setSelectedChannelId(PROFILE_CHANNEL_ID)
    setProfileView(CHANNEL_VIEW_MENU)
  }

  const closeProfileStartToMainMenu = () => {
    if (isProfileStartExiting) {
      return
    }

    setIsProfileStartExiting(true)
    profileStartExitTimerRef.current = window.setTimeout(() => {
      setOpenChannelId(null)
      setSelectedChannelId(PROFILE_CHANNEL_ID)
      setProfileView(CHANNEL_VIEW_MENU)
      setIsProfileStartExiting(false)
    }, CHANNEL_START_EXIT_MS)
  }

  const openBook = () => {
    window.clearTimeout(profileStartExitTimerRef.current)
    setIsProfileStartExiting(false)
    setIsBookPaused(false)
    setSelectedChannelId(PROFILE_CHANNEL_ID)
    setOpenChannelId(null)
    setProfileView(CHANNEL_VIEW_BOOK)
  }

  const resumeBook = () => {
    setIsBookPaused(false)
  }

  return (
    <>
      {isMainMenuVisible ? (
        <>
          <main className="wii-card-grid" style={layout.grid} aria-label="Griglia contenuti">
            {CHANNELS.map((channel) => {
              const channelImageSrc = channel.id === PROFILE_CHANNEL_ID ? PROFILE_IMAGE_URL : channel.imageSrc
              const cardShape = (
                <svg
                  className="wii-card__shape"
                  viewBox="0 0 220 140"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <defs>
                    <radialGradient id={`wii-card-grad-${channel.id}`} cx="50%" cy="50%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#f0f0f0" />
                      <stop offset="100%" stopColor="#dcdcdc" />
                    </radialGradient>
                    <linearGradient id={`wii-card-gloss-${channel.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.88)" />
                      <stop offset="48%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                    <linearGradient id={`wii-card-shadow-${channel.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="58%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
                    </linearGradient>
                    <clipPath id={`wii-card-clip-${channel.id}`}>
                      <path d={CARD_PATH} />
                    </clipPath>
                  </defs>
                  {channelImageSrc ? (
                    <image
                      className="wii-card__image"
                      href={channelImageSrc}
                      x="0"
                      y="0"
                      width="220"
                      height="140"
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#wii-card-clip-${channel.id})`}
                    />
                  ) : (
                    <path className="wii-card__base" d={CARD_PATH} fill={`url(#wii-card-grad-${channel.id})`} />
                  )}
                  <path className="wii-card__gloss" d={CARD_PATH} fill={`url(#wii-card-gloss-${channel.id})`} />
                  <path className="wii-card__shade" d={CARD_PATH} fill={`url(#wii-card-shadow-${channel.id})`} />
                  <path className="wii-card__stroke" d={CARD_PATH} />
                </svg>
              )

              return (
                <button
                  key={channel.id}
                  type="button"
                  className={`wii-card ${channel.id === PROFILE_CHANNEL_ID ? 'is-profile' : ''} ${selectedChannelId === channel.id ? 'is-selected' : ''}`}
                  style={{ '--wii-channel-accent': channel.accent }}
                  onClick={() => openChannelById(channel.id)}
                  onFocus={() => setSelectedChannelId(channel.id)}
                  onMouseEnter={() => setSelectedChannelId(channel.id)}
                  aria-pressed={selectedChannelId === channel.id}
                  aria-label={channel.label}
                >
                  {cardShape}
                </button>
              )
            })}
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
            className="wii-overlay-button wii-overlay-button--home"
            style={layout.left}
            onClick={returnToMainMenu}
            aria-label="Torna al menu"
          />
          <button
            type="button"
            className="wii-overlay-button wii-overlay-button--mail"
            style={layout.right}
            onClick={() => openChannelById(CONTACT_CHANNEL_ID)}
            aria-label="Apri contatti"
          />
        </>
      ) : null}
      {isProfileStartVisible ? (
        <section
          className={`wii-channel-start ${isProfileStartExiting ? 'is-exiting' : ''}`}
          aria-label="Menu avvio Street Pulse"
        >
          <div className="wii-channel-start__stage">
            <div className="wii-channel-start__preview">
              <img src={PROFILE_START_IMAGE_URL} alt="Street Pulse" />
            </div>
          </div>
          <nav className="wii-start-bar" aria-label="Azioni canale">
            <button type="button" className="wii-start-bar__button is-menu" onClick={closeProfileStartToMainMenu}>
              Wii Menu
            </button>
            <button type="button" className="wii-start-bar__button is-start" onClick={openBook}>
              Start
            </button>
          </nav>
        </section>
      ) : null}
      {isBookVisible ? (
        <main className="wii-book-page" aria-label="PDF sfogliabile">
          <div className="wii-book-page__reader">
            <CleanPdfFlipbook src={SAMPLE_PDF_URL} />
          </div>
          {isBookPaused ? (
            <section className="wii-pause-menu" role="dialog" aria-modal="true" aria-label="Menu pausa PDF">
              <header className="wii-pause-menu__header">
                <h1>HOME Menu</h1>
              </header>
              <div className="wii-pause-menu__body">
                <button type="button" className="wii-pause-menu__button" onClick={resumeBook}>
                  Resume
                </button>
                <button type="button" className="wii-pause-menu__button" onClick={returnToMainMenu}>
                  Wii Menu
                </button>
              </div>
            </section>
          ) : null}
        </main>
      ) : null}
      {openChannel ? (
        <div className="wii-panel-backdrop" role="presentation" onPointerDown={() => setOpenChannelId(null)}>
          <section
            className={`wii-channel-panel ${openChannel.id === PROFILE_CHANNEL_ID ? 'wii-channel-panel--flipbook' : ''}`}
            style={{ '--wii-channel-accent': openChannel.accent }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={openChannel.id === PROFILE_CHANNEL_ID ? undefined : 'wii-channel-title'}
            aria-label={openChannel.id === PROFILE_CHANNEL_ID ? 'PDF sfogliabile' : undefined}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="wii-channel-panel__close"
              onClick={() => setOpenChannelId(null)}
              aria-label="Chiudi canale"
            >
              <span aria-hidden="true">x</span>
            </button>
            {openChannel.id === PROFILE_CHANNEL_ID ? (
              <div className="wii-flipbook-reader">
                <CleanPdfFlipbook src={SAMPLE_PDF_URL} />
              </div>
            ) : (
              <>
                <div className="wii-channel-panel__masthead">
                  <ChannelIcon type={openChannel.icon} />
                  <div>
                    <p>{openChannel.eyebrow}</p>
                    <h1 id="wii-channel-title">{openChannel.title}</h1>
                  </div>
                </div>
                <p className="wii-channel-panel__description">{openChannel.description}</p>
                <ul className="wii-channel-panel__list" aria-label="Punti chiave">
                  {openChannel.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <div className="wii-channel-panel__actions">
                  <button type="button" onClick={() => setOpenChannelId(null)}>
                    Menu
                  </button>
                  <button type="button" onClick={() => openChannelById(CONTACT_CHANNEL_ID)}>
                    Contatti
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  )
}

export default App
