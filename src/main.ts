import "./style.css"

import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import Lenis from "@studio-freight/lenis"
import SplitType from "split-type"

gsap.registerPlugin(ScrollTrigger)
const loader = new GLTFLoader()

const canvas = document.querySelector("canvas.webGL") as HTMLCanvasElement
if (!canvas) throw new Error("Canvas element not found")

const scene = new THREE.Scene()

let crate: THREE.Group<THREE.Object3DEventMap> | null = null

loader.load("/models/table.glb", gltf => {
   crate = gltf.scene
   crate.position.y = -0.95
   crate.position.z = 2.44
   scene.add(crate)

   const tl = gsap.timeline({
      defaults: {
         ease: "power3.out",
         onComplete: startScrollAnimation,
      },
   })

   const hlText = new SplitType("h1")

   gsap.set("p.subhead", { yPercent: 100 })
   gsap.set(".innerLi", { yPercent: 100 })

   tl.to(crate.position, { duration: 2, z: -0.14 })
   tl.from(hlText.chars, { duration: 1, yPercent: 100, stagger: 0.1 }, "-=1.7")
   tl.to("p.subhead", { yPercent: 0 }, "-=1")

   const detailsTl = gsap.timeline({
      scrollTrigger: {
         trigger: "section.details",
         start: "top bottom",
         end: "bottom center",
         scrub: true,
      },
      defaults: {
         ease: "power3.out",
         duration: 2,
      },
   })

   function startScrollAnimation() {
      if (crate) {
         detailsTl.to(crate.position, { x: 0, y: 0.06, z: 1.25 })
         detailsTl.to(crate.rotation, { x: 1.11, y: 0.19, z: 0.06 }, "<")
      }
   }

   gsap.to(".innerLi", {
      scrollTrigger: {
         trigger: ".innerLi",
         start: "top bottom",
         end: "bottom center",
         toggleActions: "play none none reverse",
      },
      yPercent: 0,
      stagger: 0.1,
   })
})

const pointLight = new THREE.PointLight(0xffffff, 30) as THREE.PointLight
pointLight.position.set(3, -0.87, -1)
scene.add(pointLight)

const sizes = {
   width: window.innerWidth,
   height: window.innerHeight,
}

window.addEventListener("resize", () => {
   sizes.width = window.innerWidth
   sizes.height = window.innerHeight
   camera.aspect = sizes.width / sizes.height
   camera.updateProjectionMatrix()
   renderer.setSize(sizes.width, sizes.height)
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const renderer = new THREE.WebGLRenderer({
   canvas: canvas,
   alpha: true,
   antialias: true,
   powerPreference: "high-performance",
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

const controls = new OrbitControls(camera, canvas)

// Set renderer settings
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Add renderer to the DOM
document.body.appendChild(renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enableZoom = false
controls.enablePan = true
controls.enableRotate = true
controls.mouseButtons = {
   LEFT: THREE.MOUSE.ROTATE,
   MIDDLE: THREE.MOUSE.PAN,
   RIGHT: THREE.MOUSE.PAN,
}

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const clock = new THREE.Clock()

const tick = () => {
   controls.update()

   const elapsedTime = clock.getElapsedTime()

   if (crate) {
      crate.rotation.y = 0.5 * elapsedTime
   }

   renderer.render(scene, camera)
   window.requestAnimationFrame(tick)
}

// Start the animation loop
tick()

// Initialize Lenis
const lenis = new Lenis()

// Start Lenis animation
function raf(time: number) {
   lenis.raf(time)
   requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
