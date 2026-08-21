// =========================================================================
// Pav Mantra — Three.js gallery carousel + Theatre.js hero float.
// Separate ES module (script.js stays a classic script) so these two
// libraries can be loaded via plain <script type="module"> CDN imports
// with no build step.
// =========================================================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Gallery: 3D rotating carousel (Three.js + CSS3DRenderer) ----------
// Arranges the 6 existing .gallery-tile elements (real DOM, so their SVG
// icons and existing hover/reveal behavior all keep working) around a
// horizontal ring in true 3D space, auto-rotating and drag-to-spin, with the
// front-facing tile spotlighted (brighter/larger) and the rest dimmed by how
// far around the ring they've turned. This is one of three deliberately
// different carousel mechanics across the three sites: Shree Gift's spins
// on a *vertical* axis (a drum), Hangout Cafe's is a front-facing coverflow
// arc rather than a closed ring at all.
async function initGalleryCarousel() {
  const mount = document.getElementById("galleryCarousel");
  const tiles = mount ? Array.from(mount.querySelectorAll(".gallery-tile")) : [];
  if (!mount || !tiles.length) return;

  const [THREE, { CSS3DRenderer, CSS3DObject }] = await Promise.all([
    import("https://esm.sh/three@0.170.0"),
    import("https://esm.sh/three@0.170.0/examples/jsm/renderers/CSS3DRenderer.js"),
  ]);

  const width = mount.clientWidth;
  const height = mount.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
  camera.position.z = 1150;

  const renderer = new CSS3DRenderer();
  renderer.setSize(width, height);
  mount.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const radius = 560;
  const count = tiles.length;
  const objects = tiles.map((tile, i) => {
    const angle = (i / count) * Math.PI * 2;
    const obj = new CSS3DObject(tile);
    obj.position.set(radius * Math.sin(angle), 0, radius * Math.cos(angle));
    obj.rotation.y = angle;
    obj.userData.baseAngle = angle;
    group.add(obj);
    return obj;
  });

  let autoRotate = !reduceMotion;
  let targetRotationY = 0;
  let currentRotationY = 0;
  let dragging = false;
  let lastX = 0;

  mount.addEventListener("pointerdown", (e) => {
    dragging = true;
    autoRotate = false;
    lastX = e.clientX;
    mount.setPointerCapture(e.pointerId);
  });
  mount.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    targetRotationY += dx * 0.008;
  });
  const stopDrag = () => {
    dragging = false;
  };
  mount.addEventListener("pointerup", stopDrag);
  mount.addEventListener("pointercancel", stopDrag);
  mount.addEventListener("mouseenter", () => {
    autoRotate = false;
  });
  mount.addEventListener("mouseleave", () => {
    if (!dragging && !reduceMotion) autoRotate = true;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate) targetRotationY += 0.0022;
    currentRotationY += (targetRotationY - currentRotationY) * 0.08;
    group.rotation.y = currentRotationY;

    // Spotlight the tile currently facing the camera: normalize each tile's
    // world-facing angle to [0, PI] (0 = facing the viewer, PI = facing
    // away) and fade/scale it accordingly.
    objects.forEach((obj) => {
      let facing = (obj.userData.baseAngle + currentRotationY) % (Math.PI * 2);
      if (facing < 0) facing += Math.PI * 2;
      const distFromFront = Math.min(facing, Math.PI * 2 - facing);
      const t = 1 - distFromFront / Math.PI;
      obj.element.style.opacity = String(0.45 + 0.55 * t);
      obj.scale.setScalar(0.86 + 0.14 * t);
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  const step = (Math.PI * 2) / count;
  document.getElementById("carouselPrev")?.addEventListener("click", () => {
    autoRotate = false;
    targetRotationY -= step;
  });
  document.getElementById("carouselNext")?.addEventListener("click", () => {
    autoRotate = false;
    targetRotationY += step;
  });
}

// ---------- Hero: Theatre.js float/tilt sequence ----------
// The state below was authored live in Theatre Studio (not hand-guessed —
// toggled "Sequence this prop" on y/rot, set two keyframes each via
// studio.transaction, then read the resulting project state back out of
// Studio's own localStorage persistence) and is baked in here so the
// published site never needs Studio, matching @theatre/core's documented
// "author once, export the state, drop Studio" production workflow.
async function initHeroTheatre() {
  const ticket = document.getElementById("heroTicket");
  if (!ticket || reduceMotion) return;

  const TheatreCore = (await import("https://esm.sh/@theatre/core@0.7.2")).default;
  const { getProject } = TheatreCore;

  const state = {
    sheetsById: {
      Hero: {
        staticOverrides: { byObject: {} },
        sequence: {
          subUnitsPerUnit: 30,
          length: 1,
          type: "PositionalSequence",
          tracksByObject: {
            Ticket: {
              trackData: {
                trkY: {
                  type: "BasicKeyframedTrack",
                  __debugName: 'Ticket:["y"]',
                  keyframes: [
                    { id: "k1", position: 0, connectedRight: true, handles: [0.5, 1, 0.5, 0], type: "bezier", value: 0 },
                    { id: "k2", position: 1, connectedRight: true, handles: [0.5, 1, 0.5, 0], type: "bezier", value: -14 },
                  ],
                },
                trkRot: {
                  type: "BasicKeyframedTrack",
                  __debugName: 'Ticket:["rot"]',
                  keyframes: [
                    { id: "k3", position: 0, connectedRight: true, handles: [0.5, 1, 0.5, 0], type: "bezier", value: -1 },
                    { id: "k4", position: 1, connectedRight: true, handles: [0.5, 1, 0.5, 0], type: "bezier", value: 1 },
                  ],
                },
              },
              trackIdByPropPath: { '["y"]': "trkY", '["rot"]': "trkRot" },
            },
          },
        },
      },
    },
    definitionVersion: "0.4.0",
    revisionHistory: [],
  };

  const project = getProject("PavMantraHero", { state });
  const sheet = project.sheet("Hero");
  const obj = sheet.object("Ticket", { y: 0, rot: 0 });

  obj.onValuesChange((values) => {
    ticket.style.transform = `translateY(${values.y}px) rotate(${values.rot}deg)`;
  });

  // Runs after the existing GSAP hero-entrance timeline (~1.1s) so the card
  // finishes sliding in before it starts its float loop.
  window.setTimeout(() => {
    sheet.sequence.play({ iterationCount: Infinity, direction: "alternate" });
  }, 1200);
}

initGalleryCarousel();
initHeroTheatre();
