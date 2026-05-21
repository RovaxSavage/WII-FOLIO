# WiiFolio

Portfolio React/Vite ispirato al menu Nintendo Wii. La UI usa una griglia di canali, un cursore personalizzato, un orologio in stile console e pannelli dettaglio apribili per raccontare profilo, progetti, skill, percorso e contatti.

## Comandi

```bash
npm run dev
npm run build
npm run lint
```

Su PowerShell, se `npm.ps1` e bloccato dalla policy locale, usa `npm.cmd`:

```bash
npm.cmd run dev
```

## Personalizzazione

I contenuti dei canali sono nel file `src/App.jsx`, dentro la costante `CHANNELS`. Per sostituire i placeholder basta aggiornare testi, statistiche, colori `accent` e punti chiave.
