# LIFE QUEST audio asset slots

This project currently contains **no music recordings or licensed sound-effect files**. The audio catalog stays empty until original or properly licensed tracks are provided; do not add commercial recordings without permission. When assets are installed, register local same-origin paths in `src/audio-catalog.js`.

Use short, loop-ready OGG or MP3 files, ideally 30–90 seconds and under roughly 1.5 MB each. Normalize loudness consistently and avoid clipping. Music loops should have clean loop points; keep spoken content out of music loops. Record source, creator, license, and attribution requirements alongside supplied files before release.

| Category | Suggested files | Use |
| --- | --- | --- |
| `menu/` | `menu-groove-a.ogg`, `menu-groove-b.ogg` | Bright, energetic menu groove |
| `gameplay/` | `journey-groove-a.ogg`, `journey-groove-b.ogg`, `challenge-groove-a.ogg` | Forward-moving Life Journey; restrained challenge bed |
| `decisions/` | `decision-pulse-a.ogg`, `decision-pulse-b.ogg` | Quiet, restrained decision tension |
| `outcomes/` | `outcome-reflective-a.ogg`, `outcome-neutral-a.ogg` | Short, emotionally appropriate consequence transitions |
| `achievements/` | `milestone-a.ogg`, `milestone-b.ogg` | Uplifting chapter and achievement stings |
| `transitions/` | `alternative-discovery-a.ogg`, `alternative-discovery-b.ogg` | Alternative-future discovery transition |

Add multiple files to a pool when available so the player can vary selections without immediate repetition. The audio manager loops a selected music bed and crossfades between scene pools. Keep short stings as UI cues rather than adding them to looping music pools.
