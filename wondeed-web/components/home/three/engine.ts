/**
 * Wondeed immersive journey — vanilla three.js engine.
 *
 * The camera travels along a spline through "the clip dimension":
 *   0 arrival   — floating clip cards in deep ink space
 *   1 stream    — tunnel of glowing video frames
 *   2 the cut   — a filmstrip splits open as you fly through
 *   3 swarm     — clips scatter into a connected galaxy
 *   4 verified  — data streams + rising view ticks
 *   5 payout    — rupee rain funnelling into a portal
 *   6 horizon   — rise above the ecosystem, calm CTA
 *
 * All copy lives in DOM overlays (ImmersiveHome.tsx); the engine only
 * renders the world and exposes scroll progress + pointer parallax.
 */
import * as THREE from 'three'

export interface ExperienceOptions {
  /** called every frame with eased global progress 0..1 */
  onProgress?: (p: number) => void
}

export interface ExperienceHandle {
  setProgress(p: number): void
  setPointer(x: number, y: number): void
  resize(): void
  dispose(): void
}

/* ───────────────────────── palette ───────────────────────── */
const INK = 0x06091b
const INK_2 = 0x11163a
const GREEN = 0x00d26a
const GREEN_BRIGHT = 0x33ffa1
const WHITE_SOFT = 0xc9cde0

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

/* ───────────────────── canvas texture helpers ───────────────────── */

function glowTexture(color: string, edge = 'rgba(6,9,27,0)'): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, color)
  g.addColorStop(1, edge)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** A stylised vertical "clip" card — looks like a glowing reel frame. */
function clipCardTexture(variant: number): THREE.CanvasTexture {
  const W = 256
  const H = 456
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  const r = 28

  // rounded-rect clip path
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.arcTo(W, 0, W, H, r)
  ctx.arcTo(W, H, 0, H, r)
  ctx.arcTo(0, H, 0, 0, r)
  ctx.arcTo(0, 0, W, 0, r)
  ctx.closePath()
  ctx.clip()

  // background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H)
  if (variant % 3 === 0) {
    bg.addColorStop(0, '#101638')
    bg.addColorStop(1, '#070b22')
  } else if (variant % 3 === 1) {
    bg.addColorStop(0, '#0b1230')
    bg.addColorStop(1, '#04130d')
  } else {
    bg.addColorStop(0, '#0d1335')
    bg.addColorStop(1, '#0a0e27')
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // soft inner glow blob
  const gx = rand(60, 196)
  const gy = rand(90, 280)
  const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 180)
  glow.addColorStop(0, variant % 2 === 0 ? 'rgba(0,210,106,0.20)' : 'rgba(120,140,255,0.14)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // scanlines
  ctx.fillStyle = 'rgba(255,255,255,0.02)'
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2)

  // play button
  if (variant % 4 !== 3) {
    ctx.beginPath()
    ctx.arc(W / 2, H / 2 - 20, 34, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(W / 2 - 9, H / 2 - 36)
    ctx.lineTo(W / 2 - 9, H / 2 - 4)
    ctx.lineTo(W / 2 + 17, H / 2 - 20)
    ctx.closePath()
    ctx.fillStyle = variant % 2 === 0 ? 'rgba(0,230,120,0.95)' : 'rgba(255,255,255,0.9)'
    ctx.fill()
  }

  // LIVE chip
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.beginPath()
  ctx.roundRect(18, 18, 86, 26, 13)
  ctx.fill()
  ctx.fillStyle = '#00D26A'
  ctx.beginPath()
  ctx.arc(33, 31, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = '700 13px monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText(pick(['LIVE', 'REEL', 'CLIP', 'SHORT']), 44, 36)

  // caption bars
  ctx.fillStyle = 'rgba(255,255,255,0.30)'
  ctx.beginPath()
  ctx.roundRect(18, H - 78, W - 90, 12, 6)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.beginPath()
  ctx.roundRect(18, H - 56, W - 140, 10, 5)
  ctx.fill()

  // progress bar
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(18, H - 26, W - 36, 5)
  ctx.fillStyle = '#00D26A'
  ctx.fillRect(18, H - 26, (W - 36) * rand(0.25, 0.9), 5)

  // frame edge
  ctx.strokeStyle = variant % 2 === 0 ? 'rgba(0,210,106,0.45)' : 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(2, 2, W - 4, H - 4, r - 2)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/* ───────────────────────── camera path ───────────────────────── */

const PATH_POINTS: [number, number, number][] = [
  [0, 0, 14],      // arrival
  [0, 0.4, -8],
  [0.9, 0.1, -28],  // into the stream
  [-1.1, -0.2, -48],
  [0.4, 0.3, -66],
  [0, 0.2, -88],    // approach the cut
  [0, 0, -104],     // through the gap
  [1.4, 0.5, -124], // swarm drift
  [-1.0, -0.3, -140],
  [0, 0.2, -158],   // verification corridor
  [0, 0, -184],
  [0, -0.6, -208],  // descend toward payout
  [0, -0.2, -228],
  [0, 4.5, -250],   // rise to the horizon
  [0, 7.5, -272],
]

/* ───────────────────────── engine ───────────────────────── */

export function createExperience(
  canvas: HTMLCanvasElement,
  opts: ExperienceOptions = {}
): ExperienceHandle {
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  const isSmall = window.innerWidth < 768
  const lowPower = isCoarse || isSmall
  const Q = lowPower ? 0.55 : 1 // quality multiplier for counts

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: false })
  renderer.setClearColor(INK, 1)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.75 : 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(INK, 0.011)

  const camera = new THREE.PerspectiveCamera(
    62,
    window.innerWidth / window.innerHeight,
    0.1,
    420
  )

  const curve = new THREE.CatmullRomCurve3(
    PATH_POINTS.map(p => new THREE.Vector3(...p)),
    false,
    'catmullrom',
    0.18
  )

  /* shared resources for disposal */
  const textures: THREE.Texture[] = []
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const track = <T extends THREE.Texture | THREE.BufferGeometry | THREE.Material>(x: T): T => {
    if (x instanceof THREE.Texture) textures.push(x)
    else if (x instanceof THREE.BufferGeometry) geometries.push(x)
    else materials.push(x)
    return x
  }

  /** per-frame updaters: fn(elapsed, sceneProgress map) */
  type Updater = (t: number, p: number) => void
  const updaters: Updater[] = []

  /* ── starfield ── */
  {
    const N = Math.floor(1400 * Q)
    const pos = new Float32Array(N * 3)
    const col = new Float32Array(N * 3)
    const cWhite = new THREE.Color(WHITE_SOFT)
    const cGreen = new THREE.Color(GREEN)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = rand(-45, 45)
      pos[i * 3 + 1] = rand(-28, 28)
      pos[i * 3 + 2] = rand(-310, 20)
      const c = Math.random() < 0.22 ? cGreen : cWhite
      const dim = rand(0.25, 1)
      col[i * 3] = c.r * dim
      col[i * 3 + 1] = c.g * dim
      col[i * 3 + 2] = c.b * dim
    }
    const geo = track(new THREE.BufferGeometry())
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const mat = track(
      new THREE.PointsMaterial({
        size: 0.09,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    )
    scene.add(new THREE.Points(geo, mat))
  }

  /* ── ambient glow sprites along the journey ── */
  {
    const texGreen = track(glowTexture('rgba(0,210,106,0.55)'))
    const texBlue = track(glowTexture('rgba(70,90,220,0.5)'))
    const spots: [number, number, number, number, boolean][] = [
      [3, -1, -14, 22, true],
      [-4, 2, -46, 26, false],
      [2, 1, -96, 30, true],
      [-3, -1, -132, 26, false],
      [3, 2, -176, 26, true],
      [0, -4, -226, 30, true],
      [0, 9, -300, 70, true],
    ]
    for (const [x, y, z, s, green] of spots) {
      const mat = track(
        new THREE.SpriteMaterial({
          map: green ? texGreen : texBlue,
          transparent: true,
          opacity: 0.32,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      )
      const sp = new THREE.Sprite(mat)
      sp.position.set(x, y, z)
      sp.scale.setScalar(s)
      scene.add(sp)
    }
  }

  /* ── shared card resources ── */
  const cardGeo = track(new THREE.PlaneGeometry(0.9, 1.6))
  const cardMats: THREE.MeshBasicMaterial[] = []
  for (let i = 0; i < 8; i++) {
    cardMats.push(
      track(
        new THREE.MeshBasicMaterial({
          map: track(clipCardTexture(i)),
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      ) as THREE.MeshBasicMaterial
    )
  }

  /** floating card with gentle bob + sway */
  function addFloatingCard(
    x: number, y: number, z: number,
    scale = 1, ry = 0, drift = 0.25
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(cardGeo, pick(cardMats))
    mesh.position.set(x, y, z)
    mesh.rotation.set(rand(-0.12, 0.12), ry + rand(-0.25, 0.25), rand(-0.1, 0.1))
    mesh.scale.setScalar(scale)
    const seed = rand(0, Math.PI * 2)
    const speed = rand(0.4, 0.8)
    const baseY = y
    const baseRz = mesh.rotation.z
    updaters.push(t => {
      mesh.position.y = baseY + Math.sin(t * speed + seed) * drift
      mesh.rotation.z = baseRz + Math.sin(t * speed * 0.7 + seed) * 0.05
    })
    scene.add(mesh)
    return mesh
  }

  /* ── scene 0: arrival cluster ── */
  {
    const cluster: [number, number, number, number][] = [
      [-2.6, 0.9, 2, 1.0], [2.4, -0.6, 0, 1.15], [-1.6, -1.4, -3, 0.85],
      [3.1, 1.3, -5, 0.9], [-3.4, 0.2, -8, 1.2], [1.2, 1.8, -9, 0.75],
      [-0.8, -2.0, -12, 1.0], [2.6, 0.4, -14, 1.3], [-2.2, 1.6, -16, 0.9],
    ]
    for (const [x, y, z, s] of cluster) addFloatingCard(x, y, z, s)
  }

  /* later stages add: stream tunnel, the cut, swarm, verification, payout, horizon */

  /* ───────────────── camera + render loop ───────────────── */

  let rawProgress = 0
  let eased = 0
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  const clock = new THREE.Clock()
  let raf = 0
  let disposed = false

  const camPos = new THREE.Vector3()
  const camLook = new THREE.Vector3()

  function frame() {
    if (disposed) return
    raf = requestAnimationFrame(frame)
    if (document.hidden) return

    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime

    // critically-damped-ish easing toward scroll target
    eased += (rawProgress - eased) * (1 - Math.exp(-dt * 4.5))
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 3))
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 3))

    const u = THREE.MathUtils.clamp(eased, 0, 1) * 0.985
    curve.getPointAt(u, camPos)
    curve.getPointAt(Math.min(u + 0.028, 1), camLook)

    camera.position.set(
      camPos.x + pointer.sx * 0.55,
      camPos.y + Math.sin(t * 0.5) * 0.06 - pointer.sy * 0.4,
      camPos.z
    )
    camera.lookAt(camLook.x + pointer.sx * 0.8, camLook.y - pointer.sy * 0.6, camLook.z)

    for (const fn of updaters) fn(t, eased)
    opts.onProgress?.(eased)

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  return {
    setProgress(p) {
      rawProgress = THREE.MathUtils.clamp(p, 0, 1)
    },
    setPointer(x, y) {
      pointer.x = x
      pointer.y = y
    },
    resize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      for (const g of geometries) g.dispose()
      for (const m of materials) m.dispose()
      for (const tx of textures) tx.dispose()
      renderer.dispose()
    },
  }
}
