import { useRef, useEffect } from 'react'

const COLORS = ['#FFB5C2', '#FF8FAB', '#C9B1FF', '#B794F4', '#9FECC9', '#FFD4A8', '#FF9F8F', '#FADADD', '#FFDFD3']
const REACTIONS = ['🌸', '✨', '💕', '🎀', '🩷', '⭐', '🦋', '💗', '🌟', '💖', '🌷', '🫧']
const S = 8
const FLOATING = ['🌸', '✨', '💕', '🦋', '💗', '💖', '🌷']

export default function App() {
  const r = useRef(null)

  useEffect(() => {
    const c = r.current
    const x = c.getContext('2d')
    let w = 0, h = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      c.width = w
      c.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    const p = []
    const trail = []
    const ripples = []
    const sparkles = []
    const words = []
    const floaters = []
    let t = 0
    let mx = -999, my = -999, down = false, wasDown = false, firstDraw = true
    let bgHue = 340
    let reactionTimer = 0

    const ang = Array.from({ length: S }, (_, i) => (i / S) * Math.PI * 2)

    for (let i = 0; i < 40; i++) {
      sparkles.push({
        x: Math.random() * w, y: Math.random() * h,
        sz: 0.5 + Math.random() * 2,
        spd: 0.005 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() * 60 + 280,
      })
    }

    for (let i = 0; i < 12; i++) {
      floaters.push({
        x: Math.random() * w, y: Math.random() * h,
        sz: 14 + Math.random() * 20,
        spd: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        wobbleX: Math.random() * 50 + 20,
        wobbleSpd: 0.3 + Math.random() * 0.5,
        emoji: FLOATING[Math.floor(Math.random() * FLOATING.length)],
      })
    }

    const go = () => {
      t += 0.016
      bgHue += 0.01
      reactionTimer = Math.max(0, reactionTimer - 0.016)

      const bg = `rgba(${255 + Math.sin(bgHue * 0.02) * 3}, ${245 + Math.sin(bgHue * 0.02 + 1) * 3}, ${242 + Math.sin(bgHue * 0.02 + 2) * 3}, 0.06)`
      x.fillStyle = bg
      x.fillRect(0, 0, w, h)

      for (const sp of sparkles) {
        const al = Math.sin(t * sp.spd + sp.phase) * 0.4 + 0.6
        x.beginPath()
        x.arc(sp.x, sp.y, sp.sz, 0, Math.PI * 2)
        x.fillStyle = `hsla(${sp.hue}, 50%, 80%, ${al * 0.5})`
        x.fill()
      }

      for (const fl of floaters) {
        const yOff = Math.sin(t * fl.wobbleSpd + fl.phase) * 30
        const xOff = Math.sin(t * 0.5 + fl.phase) * fl.wobbleX
        const al = Math.sin(t * 0.3 + fl.phase) * 0.15 + 0.2
        x.save()
        x.globalAlpha = al
        x.font = `${fl.sz}px sans-serif`
        x.textAlign = 'center'
        x.textBaseline = 'middle'
        x.fillText(fl.emoji, fl.x + xOff, fl.y + yOff + Math.sin(t * fl.spd + fl.phase) * 20)
        x.restore()
      }

      if (down && mx > 0 && my > 0) {
        if (!wasDown) {
          const rIdx = Math.floor(Math.random() * REACTIONS.length)
          words.push({
            text: REACTIONS[rIdx],
            x: mx + (Math.random() - 0.5) * 30,
            y: my - 20,
            vy: -0.8 - Math.random() * 0.5,
            life: 1,
            wobble: Math.random() * 10,
          })
          for (let k = 0; k < 40; k++) {
            const a = Math.random() * Math.PI * 2
            const spd = 1 + Math.random() * 4
            p.push({
              x: mx, y: my, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 1,
              life: 1, sz: 1.5 + Math.random() * 4,
              hue: 300 + Math.random() * 80,
              col: COLORS[Math.floor(Math.random() * COLORS.length)],
              type: Math.random() > 0.3 ? 'heart' : 'dot',
            })
          }
          ripples.push({ x: mx, y: my, r: 0, life: 1 })
        }
        wasDown = true
        if (firstDraw) { firstDraw = false; if (diyorra < 0) diyorra = 0; words.push({ text: '💗', x: w/2, y: h/2 - 60, vy: -0.3, life: 1, wobble: 5 }) }

        trail.push({ x: mx, y: my, t })
        for (let i = 0; i < 4; i++) {
          p.push({
            x: mx + (Math.random() - 0.5) * 6, y: my + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5 - 0.5,
            life: 1, sz: 1.5 + Math.random() * 3.5,
            hue: 300 + Math.random() * 80,
            col: COLORS[Math.floor(Math.random() * COLORS.length)],
            type: Math.random() > 0.3 ? 'heart' : 'dot',
          })
        }
      } else {
        wasDown = false
      }

      for (let i = words.length - 1; i >= 0; i--) {
        const wd = words[i]
        wd.y += wd.vy
        wd.vy *= 0.99
        wd.life -= 0.008
        if (wd.life <= 0) { words.splice(i, 1); continue }
        const al = wd.life * (0.5 + Math.sin(t * 2 + wd.wobble) * 0.2)
        const wobX = Math.sin(t * 2 + wd.wobble) * 4
        x.save()
        x.globalAlpha = al
        x.font = `bold ${20 + (1 - wd.life) * 8}px sans-serif`
        x.textAlign = 'center'
        x.textBaseline = 'middle'
        x.fillText(wd.text, wd.x + wobX, wd.y)
        x.restore()
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.r += 3 + rp.life * 4
        rp.life -= 0.012
        if (rp.life <= 0) { ripples.splice(i, 1); continue }
        const al = rp.life * 0.4
        for (let j = 0; j < S; j++) {
          const an = ang[j]
          const rx = (rp.x - w / 2) * Math.cos(an) - (rp.y - h / 2) * Math.sin(an) + w / 2
          const ry = (rp.x - w / 2) * Math.sin(an) + (rp.y - h / 2) * Math.cos(an) + h / 2
          x.beginPath()
          x.arc(rx, ry, rp.r, 0, Math.PI * 2)
          x.strokeStyle = `hsla(${340 + j * 25}, 80%, 75%, ${al})`
          x.lineWidth = 2
          x.stroke()
          x.beginPath()
          x.arc(rx, ry, rp.r * 0.7, 0, Math.PI * 2)
          x.strokeStyle = `hsla(${340 + j * 25 + 30}, 85%, 80%, ${al * 0.5})`
          x.lineWidth = 1
          x.stroke()
        }
      }

      while (trail.length > 60) trail.shift()
      if (trail.length > 1) {
        for (let i = 2; i < trail.length; i++) {
          const a = trail[i - 1], b = trail[i]
          const al = i / trail.length
          if (al < 0.15) continue
          const a2 = al * 0.4 * (0.5 + Math.sin(t * 2 + i * 0.5) * 0.3)
          for (let j = 0; j < S; j++) {
            const an = ang[j]
            const ca = Math.cos(an), sa = Math.sin(an)
            const ax = (a.x - w / 2) * ca - (a.y - h / 2) * sa + w / 2
            const ay = (a.x - w / 2) * sa + (a.y - h / 2) * ca + h / 2
            const bx = (b.x - w / 2) * ca - (b.y - h / 2) * sa + w / 2
            const by = (b.x - w / 2) * sa + (b.y - h / 2) * ca + h / 2
            x.beginPath()
            x.moveTo(ax, ay)
            x.lineTo(bx, by)
            x.strokeStyle = `hsla(${(340 + j * 40 + i * 2) % 360}, 70%, 68%, ${a2})`
            x.lineWidth = 1 + Math.sin(t * 3 + i * 0.5) * 0.5
            x.stroke()
          }
        }
      }

      for (let i = p.length - 1; i >= 0; i--) {
        const d = p[i]
        d.x += d.vx; d.y += d.vy
        d.vy += 0.012
        d.vx *= 0.99; d.vy *= 0.99
        d.life -= 0.005
        if (d.life <= 0) { p.splice(i, 1); continue }

        const al = d.life * (0.6 + Math.sin(t * 4 + i) * 0.15)
        const twinkle = 0.8 + Math.sin(t * 5 + i * 1.7) * 0.2

        for (let j = 0; j < S; j++) {
          const an = ang[j]
          const rx = (d.x - w / 2) * Math.cos(an) - (d.y - h / 2) * Math.sin(an) + w / 2
          const ry = (d.x - w / 2) * Math.sin(an) + (d.y - h / 2) * Math.cos(an) + h / 2

          if (d.sz > 3) {
            const gr = x.createRadialGradient(rx, ry, 0, rx, ry, d.sz * 4)
            gr.addColorStop(0, d.col + '45')
            gr.addColorStop(1, d.col + '00')
            x.fillStyle = gr
            x.beginPath()
            x.arc(rx, ry, d.sz * 4, 0, Math.PI * 2)
            x.fill()
          }

          if (d.type === 'heart') {
            x.save()
            x.translate(rx, ry)
            const s = d.sz * 0.45 * d.life * twinkle
            x.scale(s, s)
            x.rotate(Math.sin(t * 2 + i * 0.3) * 0.1)
            x.beginPath()
            x.moveTo(0, 3)
            x.bezierCurveTo(-5, -2.5, -8, 2.5, 0, 7.5)
            x.bezierCurveTo(8, 2.5, 5, -2.5, 0, 3)
            x.fillStyle = `hsla(${d.hue + j * 15}, 85%, 72%, ${al * 0.9})`
            x.fill()
            x.restore()
          } else {
            x.beginPath()
            x.arc(rx, ry, d.sz * d.life * twinkle, 0, Math.PI * 2)
            x.fillStyle = `hsla(${d.hue + j * 10}, ${70 + 20 * d.life}%, ${65 + 25 * d.life}%, ${al * 0.85})`
            x.fill()
          }
        }
      }

      if (p.length > 400) p.splice(0, p.length - 400)

      if (reactionTimer <= 0 && !down && Math.random() > 0.997) {
        const rIdx = Math.floor(Math.random() * REACTIONS.length)
        words.push({
          text: REACTIONS[rIdx],
          x: Math.random() * w * 0.8 + w * 0.1,
          y: h + 20,
          vy: -0.4 - Math.random() * 0.3,
          life: 1,
          wobble: Math.random() * 10,
        })
        reactionTimer = 3 + Math.random() * 4
      }

      if (diyorra >= 0) {
        diyorra += 0.016
        let alpha = 0, scale = 0.3
        if (diyorra < 1) {
          const p = diyorra / 1
          scale = 0.3 + p * 0.7
          alpha = Math.min(1, p * 1.2)
        } else if (diyorra < 3) {
          scale = 1
          alpha = 1
        } else if (diyorra < 4.5) {
          alpha = 1 - (diyorra - 3) / 1.5
          scale = 1
        } else {
          diyorra = -1
        }
        if (alpha > 0) {
          x.save()
          x.globalAlpha = alpha * 0.9
          x.translate(w / 2, h / 2)
          x.scale(scale, scale)
          x.font = 'bold 72px Dancing Script, cursive'
          x.textAlign = 'center'
          x.textBaseline = 'middle'
          x.fillStyle = '#E8A0B0'
          x.shadowColor = 'rgba(232,160,176,0.3)'
          x.shadowBlur = 40
          x.fillText('Diyoraa', 0, 0)
          x.shadowBlur = 80
          x.shadowColor = 'rgba(232,160,176,0.15)'
          x.fillText('Diyoraa', 0, 0)
          x.restore()
        }
      }

      requestAnimationFrame(go)
    }

    let diyorra = -1

    const gp = (e) => {
      const b = c.getBoundingClientRect()
      if (e.touches?.[0]) return { x: e.touches[0].clientX - b.left, y: e.touches[0].clientY - b.top }
      return { x: e.clientX - b.left, y: e.clientY - b.top }
    }
    const ds = (e) => { e.preventDefault(); const g = gp(e); mx = g.x; my = g.y; down = true }
    const dm = (e) => { e.preventDefault(); const g = gp(e); mx = g.x; my = g.y }
    const de = (e) => { e.preventDefault(); down = false }

    c.addEventListener('touchstart', ds, { passive: false })
    c.addEventListener('touchmove', dm, { passive: false })
    c.addEventListener('touchend', de, { passive: false })
    c.addEventListener('touchcancel', de, { passive: false })
    c.addEventListener('mousedown', ds)
    window.addEventListener('mousemove', (e) => { if (down) { const g = gp(e); mx = g.x; my = g.y } })
    window.addEventListener('mouseup', de)

    requestAnimationFrame(go)
    return () => { window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={r}
      style={{
        display: 'block', width: '100%', height: '100%',
        cursor: 'crosshair', touchAction: 'none',
        background: '#FFF5F0',
      }}
    />
  )
} 
