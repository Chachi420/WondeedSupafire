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

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPower,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(INK, 1)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2))
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

  /** map a world z on the path to eased-progress (0..1) for scroll-driven scene anims */
  const uSamples: { u: number; z: number }[] = []
  for (let i = 0; i <= 240; i++) {
    const u = i / 240
    uSamples.push({ u, z: curve.getPointAt(u).z })
  }
  function progressAtZ(z: number): number {
    for (let i = 1; i < uSamples.length; i++) {
      if (uSamples[i].z <= z) {
        const a = uSamples[i - 1]
        const b = uSamples[i]
        const f = (a.z - z) / (a.z - b.z || 1)
        return (a.u + (b.u - a.u) * f) / 0.985
      }
    }
    return 1
  }

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

  /* ── scene 1: the stream — tunnel of clip frames ── */
  {
    const rings = Math.max(8, Math.floor(16 * Q))
    for (let r = 0; r < rings; r++) {
      const z = -22 - (r / (rings - 1)) * 48 // -22 .. -70
      const perRing = lowPower ? 4 : 6
      for (let i = 0; i < perRing; i++) {
        const ang = (i / perRing) * Math.PI * 2 + rand(-0.4, 0.4) + r * 0.65
        const radius = rand(3.8, 6.8)
        const x = Math.cos(ang) * radius
        const y = Math.sin(ang) * radius * 0.72
        const mesh = addFloatingCard(x, y, z + rand(-1.2, 1.2), rand(0.8, 1.4), 0, 0.18)
        mesh.lookAt(0, y * 0.3, z) // face the flight axis
        mesh.rotation.z += rand(-0.18, 0.18)
      }
    }

    // streaking light lines for motion
    const N = Math.floor(46 * Q)
    const pos = new Float32Array(N * 2 * 3)
    for (let i = 0; i < N; i++) {
      const ang = rand(0, Math.PI * 2)
      const radius = rand(5.5, 9)
      const x = Math.cos(ang) * radius
      const y = Math.sin(ang) * radius * 0.72
      const z = rand(-74, -18)
      const len = rand(2, 7)
      pos.set([x, y, z, x, y, z - len], i * 6)
    }
    const geo = track(new THREE.BufferGeometry())
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = track(
      new THREE.LineBasicMaterial({
        color: GREEN,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    scene.add(new THREE.LineSegments(geo, mat))
  }

  /* ── scene 2: the cut — a filmstrip splits open ── */
  {
    const CUT_Z = -96
    const pStart = progressAtZ(-80)
    const pEnd = progressAtZ(-100)

    const left = new THREE.Group()
    const right = new THREE.Group()
    left.position.z = right.position.z = CUT_Z
    scene.add(left, right)

    const frames = 9 // per side
    const fw = 1.5
    const gap = 0.14
    const railGeo = track(new THREE.PlaneGeometry(frames * (fw + gap), 0.16))
    const railMat = track(
      new THREE.MeshBasicMaterial({
        color: INK_2,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      })
    )
    for (const side of [-1, 1]) {
      const group = side < 0 ? left : right
      for (let i = 0; i < frames; i++) {
        const x = side * (0.9 + i * (fw + gap))
        const mesh = new THREE.Mesh(cardGeo, pick(cardMats))
        mesh.position.set(x, 0, 0)
        mesh.scale.set(1.55, 1.35, 1)
        group.add(mesh)
      }
      for (const ry of [-1.25, 1.25]) {
        const rail = new THREE.Mesh(railGeo, railMat)
        rail.position.set(side * (0.9 + (frames * (fw + gap)) / 2 - (fw + gap) / 2), ry, 0)
        group.add(rail)
      }
    }

    // glowing cut line + sparks at the seam
    const lineGeo = track(new THREE.PlaneGeometry(0.07, 13))
    const lineMat = track(
      new THREE.MeshBasicMaterial({
        color: GREEN_BRIGHT,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    )
    const cutLine = new THREE.Mesh(lineGeo, lineMat)
    cutLine.position.set(0, 0, CUT_Z + 0.1)
    scene.add(cutLine)

    const SPARKS = Math.floor(90 * Q)
    const sPos = new Float32Array(SPARKS * 3)
    const sSeed: number[] = []
    for (let i = 0; i < SPARKS; i++) {
      sPos[i * 3] = rand(-0.3, 0.3)
      sPos[i * 3 + 1] = rand(-5, 5)
      sPos[i * 3 + 2] = CUT_Z + rand(-0.4, 0.4)
      sSeed.push(rand(0, Math.PI * 2))
    }
    const sGeo = track(new THREE.BufferGeometry())
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
    const sMat = track(
      new THREE.PointsMaterial({
        color: GREEN_BRIGHT,
        size: 0.12,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    scene.add(new THREE.Points(sGeo, sMat))

    updaters.push((t, p) => {
      const local = THREE.MathUtils.smoothstep(p, pStart, pEnd)
      const split = local * local * 7.5
      left.position.x = -split
      right.position.x = split
      left.rotation.z = local * 0.10
      right.rotation.z = -local * 0.10

      const flare = Math.sin(Math.min(local * 1.45, 1) * Math.PI)
      ;(lineMat as THREE.MeshBasicMaterial).opacity = flare * 0.9
      cutLine.scale.y = 0.25 + flare * 0.75
      ;(sMat as THREE.PointsMaterial).opacity = flare * 0.95
      const arr = sGeo.attributes.position.array as Float32Array
      for (let i = 0; i < SPARKS; i++) {
        arr[i * 3] = Math.sin(t * 9 + sSeed[i]) * 0.35 * flare + rand(-0.04, 0.04)
        arr[i * 3 + 1] = ((sSeed[i] * 3 + t * (1.5 + (i % 5))) % 10) - 5
      }
      sGeo.attributes.position.needsUpdate = true
    })
  }

  /* ── scene 3: the swarm — clips multiply into a galaxy ── */
  {
    const COUNT = Math.floor(110 * Q)
    const pStart = progressAtZ(-104)
    const pMid = progressAtZ(-126)
    interface SwarmCard {
      mesh: THREE.Mesh
      target: THREE.Vector3
      origin: THREE.Vector3
      spin: number
      seed: number
    }
    const cards: SwarmCard[] = []
    for (let i = 0; i < COUNT; i++) {
      const z = rand(-156, -108)
      const ang = rand(0, Math.PI * 2)
      const radius = rand(2.5, 15)
      const target = new THREE.Vector3(
        Math.cos(ang) * radius,
        Math.sin(ang) * radius * 0.7,
        z
      )
      const mesh = new THREE.Mesh(cardGeo, pick(cardMats))
      mesh.scale.setScalar(rand(0.28, 0.7))
      mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI))
      mesh.position.set(0, 0, z)
      scene.add(mesh)
      cards.push({
        mesh,
        target,
        origin: new THREE.Vector3(0, 0, z),
        spin: rand(0.08, 0.4),
        seed: rand(0, Math.PI * 2),
      })
    }

    // faint network lines between nearby clips
    const pairs: number[] = []
    for (let i = 0; i < COUNT && pairs.length < 70 * 6; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        if (cards[i].target.distanceTo(cards[j].target) < 5.5 && Math.random() < 0.18) {
          pairs.push(
            cards[i].target.x, cards[i].target.y, cards[i].target.z,
            cards[j].target.x, cards[j].target.y, cards[j].target.z
          )
          break
        }
      }
    }
    const lGeo = track(new THREE.BufferGeometry())
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pairs), 3))
    const lMat = track(
      new THREE.LineBasicMaterial({
        color: GREEN,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    scene.add(new THREE.LineSegments(lGeo, lMat))

    updaters.push((t, p) => {
      const burst = THREE.MathUtils.smoothstep(p, pStart, pMid)
      for (const c of cards) {
        const e = THREE.MathUtils.clamp(burst * 1.6 - (c.seed / (Math.PI * 2)) * 0.6, 0, 1)
        const k = 1 - Math.pow(1 - e, 3)
        c.mesh.position.lerpVectors(c.origin, c.target, k)
        c.mesh.position.y += Math.sin(t * 0.6 + c.seed) * 0.18
        c.mesh.rotation.y += c.spin * 0.004
        c.mesh.rotation.z += c.spin * 0.002
      }
      ;(lMat as THREE.LineBasicMaterial).opacity =
        burst * (0.10 + Math.sin(t * 1.4) * 0.04)
    })
  }

  /* ── scene 4: verification corridor — rising ticks + data pillars ── */
  {
    // ✓ tick sprite texture
    const tc = document.createElement('canvas')
    tc.width = tc.height = 64
    const tctx = tc.getContext('2d')!
    tctx.beginPath()
    tctx.arc(32, 32, 26, 0, Math.PI * 2)
    tctx.fillStyle = 'rgba(0,210,106,0.92)'
    tctx.fill()
    tctx.strokeStyle = '#06091B'
    tctx.lineWidth = 7
    tctx.lineCap = 'round'
    tctx.lineJoin = 'round'
    tctx.beginPath()
    tctx.moveTo(19, 33)
    tctx.lineTo(28, 42)
    tctx.lineTo(46, 23)
    tctx.stroke()
    const tickTex = track(new THREE.CanvasTexture(tc))
    tickTex.colorSpace = THREE.SRGBColorSpace

    const N = Math.floor(120 * Q)
    const pos = new Float32Array(N * 3)
    const speed: number[] = []
    for (let i = 0; i < N; i++) {
      pos[i * 3] = rand(-7, 7)
      pos[i * 3 + 1] = rand(-7, 7)
      pos[i * 3 + 2] = rand(-196, -158)
      speed.push(rand(0.6, 2.2))
    }
    const geo = track(new THREE.BufferGeometry())
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = track(
      new THREE.PointsMaterial({
        map: tickTex,
        size: 0.34,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        sizeAttenuation: true,
      })
    )
    scene.add(new THREE.Points(geo, mat))
    updaters.push((t, _p) => {
      const arr = geo.attributes.position.array as Float32Array
      for (let i = 0; i < N; i++) {
        arr[i * 3 + 1] += speed[i] * 0.016
        if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = -7
      }
      geo.attributes.position.needsUpdate = true
    })

    // light pillars
    const pillarGeo = track(new THREE.PlaneGeometry(0.08, 12))
    for (let i = 0; i < Math.floor(14 * Q); i++) {
      const m = track(
        new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? GREEN : INK_2,
          transparent: true,
          opacity: rand(0.18, 0.5),
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      ) as THREE.MeshBasicMaterial
      const pillar = new THREE.Mesh(pillarGeo, m)
      const side = Math.random() < 0.5 ? -1 : 1
      pillar.position.set(side * rand(3.2, 7.5), rand(-2, 2), rand(-198, -156))
      scene.add(pillar)
      const base = m.opacity
      const seed = rand(0, Math.PI * 2)
      updaters.push(t => {
        m.opacity = base * (0.7 + Math.sin(t * 1.8 + seed) * 0.3)
      })
    }
  }

  /* ── scene 5: payout — rupee rain into a portal ── */
  {
    // ₹ glyph texture
    const rc = document.createElement('canvas')
    rc.width = rc.height = 64
    const rctx = rc.getContext('2d')!
    rctx.font = '800 44px system-ui, sans-serif'
    rctx.textAlign = 'center'
    rctx.textBaseline = 'middle'
    rctx.shadowColor = 'rgba(0,232,118,0.9)'
    rctx.shadowBlur = 10
    rctx.fillStyle = '#7CFFC2'
    rctx.fillText('₹', 32, 36)
    const rupeeTex = track(new THREE.CanvasTexture(rc))
    rupeeTex.colorSpace = THREE.SRGBColorSpace

    const PORTAL = new THREE.Vector3(0, -3.2, -234)
    const N = Math.floor(150 * Q)
    const pos = new Float32Array(N * 3)
    const vel: number[] = []
    for (let i = 0; i < N; i++) {
      pos[i * 3] = rand(-6, 6)
      pos[i * 3 + 1] = rand(-4, 8)
      pos[i * 3 + 2] = rand(-236, -204)
      vel.push(rand(1.2, 3.2))
    }
    const geo = track(new THREE.BufferGeometry())
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = track(
      new THREE.PointsMaterial({
        map: rupeeTex,
        size: 0.42,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    )
    scene.add(new THREE.Points(geo, mat))
    updaters.push((t, _p) => {
      const arr = geo.attributes.position.array as Float32Array
      for (let i = 0; i < N; i++) {
        let y = arr[i * 3 + 1] - vel[i] * 0.016
        // gentle funnel toward the portal as the glyph falls
        const pull = THREE.MathUtils.clamp((2 - y) / 10, 0, 0.035)
        arr[i * 3] += (PORTAL.x - arr[i * 3]) * pull
        arr[i * 3 + 2] += (PORTAL.z - arr[i * 3 + 2]) * pull * 0.5
        if (y < PORTAL.y) {
          y = rand(6, 9)
          arr[i * 3] = rand(-6, 6)
          arr[i * 3 + 2] = rand(-236, -204)
        }
        arr[i * 3 + 1] = y
      }
      geo.attributes.position.needsUpdate = true
    })

    // the portal ring
    const ringGeo = track(new THREE.TorusGeometry(2.6, 0.07, 12, 72))
    const ringMat = track(
      new THREE.MeshBasicMaterial({
        color: GREEN_BRIGHT,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.copy(PORTAL)
    ring.rotation.x = Math.PI / 2
    scene.add(ring)

    const ringGlowMat = track(
      new THREE.SpriteMaterial({
        map: track(glowTexture('rgba(0,232,118,0.7)')),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    )
    const ringGlow = new THREE.Sprite(ringGlowMat)
    ringGlow.position.copy(PORTAL)
    ringGlow.scale.setScalar(9)
    scene.add(ringGlow)

    updaters.push(t => {
      ring.rotation.z = t * 0.4
      const pulse = 1 + Math.sin(t * 2.2) * 0.06
      ring.scale.setScalar(pulse)
      ringGlow.scale.setScalar(9 * pulse)
    })
  }

  /* ── scene 6: horizon — the ecosystem seen from above ── */
  {
    const N = Math.floor(700 * Q)
    const pos = new Float32Array(N * 3)
    const col = new Float32Array(N * 3)
    const cGreen = new THREE.Color(GREEN)
    const cWhite = new THREE.Color(WHITE_SOFT)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = rand(-55, 55)
      pos[i * 3 + 1] = rand(-9, -4)
      pos[i * 3 + 2] = rand(-340, -240)
      const c = Math.random() < 0.4 ? cGreen : cWhite
      const dim = rand(0.3, 1)
      col[i * 3] = c.r * dim
      col[i * 3 + 1] = c.g * dim
      col[i * 3 + 2] = c.b * dim
    }
    const geo = track(new THREE.BufferGeometry())
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const mat = track(
      new THREE.PointsMaterial({
        size: 0.14,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    )
    scene.add(new THREE.Points(geo, mat))
  }

  /* ───────────────── camera + render loop ───────────────── */

  let rawProgress = 0
  let eased = 0
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  let raf = 0
  let disposed = false
  let last = performance.now()
  let elapsed = 0

  const camPos = new THREE.Vector3()
  const camLook = new THREE.Vector3()

  function frame(now: number) {
    if (disposed) return
    raf = requestAnimationFrame(frame)
    if (document.hidden) { last = now; return }

    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    elapsed += dt
    const t = elapsed

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
    // subtle banking into turns — makes the flight feel piloted
    camera.rotateZ(
      THREE.MathUtils.clamp((camLook.x - camPos.x) * -0.055 - pointer.sx * 0.02, -0.12, 0.12)
    )

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
