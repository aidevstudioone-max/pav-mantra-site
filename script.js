// ---------- Menu Data (based on Pav Mantra's real signature dishes) ----------
const MENU = [
  {
    category: "Pav Corner",
    icon: "vada-pav",
    items: [
      { id: "vp1", name: "Classic Vada Pav", desc: "Spiced potato vada, soft house-baked pav, garlic & tamarind chutney.", price: 40 },
      { id: "vp2", name: "VIP Vada Pav", desc: "Our signature — extra-crisp vada, three secret chutneys, fried green chilli.", price: 60 },
      { id: "vp3", name: "Cheese Vada Pav", desc: "Classic vada pav loaded with melted cheese.", price: 70 },
      { id: "vp4", name: "Schezwan Vada Pav", desc: "Vada pav tossed in a fiery schezwan glaze.", price: 65 },
    ],
  },
  {
    category: "Misal & Pulao",
    icon: "misal",
    items: [
      { id: "mp1", name: "Kolhapuri Misal Pav", desc: "Sprouted moth beans in a fiery Kolhapuri gravy, farsan, pav on the side.", price: 110 },
      { id: "mp2", name: "Tawa Pulao", desc: "Mumbai-style buttery masala pulao tossed on a hot tawa.", price: 130 },
      { id: "mp3", name: "Pav Bhaji", desc: "Buttery mashed mixed-vegetable bhaji, toasted pav, onion & lime.", price: 120 },
      { id: "mp4", name: "Sabudana Khichdi", desc: "Classic Maharashtrian tapioca pearl khichdi with peanuts.", price: 100 },
    ],
  },
  {
    category: "Snacks & Bhajji",
    icon: "chili",
    items: [
      { id: "sn1", name: "Dabeli", desc: "Sweet-tangy potato filling in a masala pav, topped with peanuts & pomegranate.", price: 55 },
      { id: "sn2", name: "Sabudana Vada", desc: "Crisp fried tapioca & peanut fritters, served with chutney.", price: 90 },
      { id: "sn3", name: "Kolhapuri Stuffed Mirchi Bhajji", desc: "Large green chillies stuffed with spiced masala, batter-fried.", price: 75 },
      { id: "sn4", name: "Bun Maska", desc: "Soft bun, generous butter, toasted golden.", price: 45 },
    ],
  },
  {
    category: "Beverages & Mastani",
    icon: "chai",
    items: [
      { id: "bv1", name: "Ginger Chai", desc: "Hot masala chai brewed with fresh ginger.", price: 25 },
      { id: "bv2", name: "Mango Lassi", desc: "Thick, chilled yogurt lassi blended with mango pulp.", price: 90 },
      { id: "bv3", name: "Mango Mastani", desc: "Signature layered mango milkshake topped with ice cream & dry fruits.", price: 140 },
      { id: "bv4", name: "Masala Chaas", desc: "Spiced buttermilk with roasted cumin & curry leaves.", price: 40 },
    ],
  },
];

// ---------- State ----------
let cart = JSON.parse(localStorage.getItem("pavMantraCart") || "{}");
let activeCategory = "all";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof gsap !== "undefined";
if (hasGsap && typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

function iconRef(id) {
  return `<svg class="icon"><use href="#icon-${id}"/></svg>`;
}

// ---------- Render Category Pills ----------
function renderPills() {
  const wrap = document.getElementById("categoryPills");
  const all = [{ category: "all", icon: "plate" }, ...MENU];
  wrap.innerHTML = all
    .map(
      (c) =>
        `<button class="pill-btn ${activeCategory === c.category ? "active" : ""}" data-cat="${c.category}">${iconRef(c.icon)} ${c.category === "all" ? "All" : c.category}</button>`
    )
    .join("");
  wrap.querySelectorAll(".pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderPills();
      renderMenu();
      if (activeCategory !== "all") {
        const el = document.getElementById("cat-" + slug(activeCategory));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

// ---------- Render Menu ----------
function renderMenu() {
  const container = document.getElementById("menuContainer");
  const searchTerm = document.getElementById("menuSearch").value.trim().toLowerCase();
  let anyVisible = false;
  let html = "";

  MENU.forEach((cat) => {
    if (activeCategory !== "all" && activeCategory !== cat.category) return;

    const filteredItems = cat.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.desc.toLowerCase().includes(searchTerm)
    );
    if (filteredItems.length === 0) return;

    anyVisible = true;
    html += `<div class="menu-category" id="cat-${slug(cat.category)}">
      <h3 class="menu-category-title">${iconRef(cat.icon)} ${cat.category} <span class="count">${filteredItems.length} dishes</span></h3>
      <div class="menu-grid">
        ${filteredItems.map(renderItem).join("")}
      </div>
    </div>`;
  });

  container.innerHTML = html;
  document.getElementById("noResults").classList.toggle("hidden", anyVisible);

  container.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
  container.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(btn.dataset.inc, 1));
  });
  container.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(btn.dataset.dec, -1));
  });

  animateMenuIn();
}

function animateMenuIn() {
  const rows = document.querySelectorAll(".menu-item");
  if (!hasGsap || reduceMotion) return;
  gsap.fromTo(
    rows,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.035, overwrite: true }
  );
  gsap.fromTo(
    document.querySelectorAll(".menu-category-title"),
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.06, overwrite: true }
  );
}

function renderItem(item) {
  const qty = cart[item.id] || 0;
  return `
  <div class="menu-item">
    <div class="menu-item-body">
      <div class="menu-item-top">
        <span class="veg-icon"><i></i></span>
        <span class="menu-item-name">${item.name}</span>
      </div>
      <p class="menu-item-desc">${item.desc}</p>
    </div>
    <div class="menu-item-side">
      <span class="menu-item-price">₹${item.price}</span>
      ${
        qty > 0
          ? `<div class="qty-control">
              <button data-dec="${item.id}">−</button>
              <span>${qty}</span>
              <button data-inc="${item.id}">+</button>
            </div>`
          : `<button class="add-btn" data-add="${item.id}">Add +</button>`
      }
    </div>
  </div>`;
}

function findItem(id) {
  for (const cat of MENU) {
    const found = cat.items.find((i) => i.id === id);
    if (found) return found;
  }
  return null;
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderMenu();
  renderCart();
  showToast(`${findItem(id).name} added to cart`);
  bumpCartBadge();
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderMenu();
  renderCart();
}

function saveCart() {
  localStorage.setItem("pavMantraCart", JSON.stringify(cart));
}

function bumpCartBadge() {
  if (!hasGsap || reduceMotion) return;
  gsap.fromTo(
    "#cartBadge",
    { scale: 1 },
    { scale: 1.5, duration: 0.16, ease: "power1.out", yoyo: true, repeat: 1, overwrite: true }
  );
  gsap.fromTo(
    "#cartToggle",
    { rotate: 0 },
    { rotate: -12, duration: 0.09, ease: "power1.out", yoyo: true, repeat: 3, overwrite: true }
  );
}

// ---------- Cart Drawer ----------
function renderCart() {
  const itemsWrap = document.getElementById("cartItems");
  const ids = Object.keys(cart);
  const badge = document.getElementById("cartBadge");
  const totalCount = ids.reduce((sum, id) => sum + cart[id], 0);
  badge.textContent = totalCount;

  if (ids.length === 0) {
    itemsWrap.innerHTML = `<p class="cart-empty" id="cartEmpty">Your cart is empty. Add something tasty.</p>`;
    document.getElementById("cartTotal").textContent = "₹0";
    return;
  }

  let total = 0;
  itemsWrap.innerHTML = ids
    .map((id) => {
      const item = findItem(id);
      const qty = cart[id];
      total += item.price * qty;
      return `
      <div class="cart-line">
        <div>
          <div class="cart-line-name">${item.name}</div>
          <div class="cart-line-price">₹${item.price} x ${qty}</div>
        </div>
        <div class="cart-line-qty">
          <button data-dec="${id}">−</button>
          <span>${qty}</span>
          <button data-inc="${id}">+</button>
        </div>
      </div>`;
    })
    .join("");

  document.getElementById("cartTotal").textContent = `₹${total}`;

  itemsWrap.querySelectorAll("[data-inc]").forEach((btn) => btn.addEventListener("click", () => changeQty(btn.dataset.inc, 1)));
  itemsWrap.querySelectorAll("[data-dec]").forEach((btn) => btn.addEventListener("click", () => changeQty(btn.dataset.dec, -1)));
}

function openCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  overlay.classList.add("open");
  drawer.classList.add("open");
  if (hasGsap && !reduceMotion) {
    gsap.to(overlay, { opacity: 1, duration: 0.25, ease: "power1.out", overwrite: true });
    gsap.to(drawer, { right: 0, duration: 0.45, ease: "power3.out", overwrite: true });
  }
}
function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (hasGsap && !reduceMotion) {
    gsap.to(overlay, { opacity: 0, duration: 0.25, ease: "power1.in", overwrite: true, onComplete: () => overlay.classList.remove("open") });
    gsap.to(drawer, {
      right: -420,
      duration: 0.35,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => drawer.classList.remove("open"),
    });
  } else {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
  }
}

// ---------- Toast ----------
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  clearTimeout(toastTimer);
  if (hasGsap && !reduceMotion) {
    gsap.fromTo(
      toast,
      { opacity: 0, y: 16, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(2)", overwrite: true }
    );
    toastTimer = setTimeout(() => {
      gsap.to(toast, { opacity: 0, y: 10, duration: 0.25, ease: "power1.in", overwrite: true });
    }, 2200);
  } else {
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }
}

// ---------- Navbar scroll + mobile menu ----------
function initNav() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  });

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });

  // Active link on scroll
  const sections = ["home", "menu", "about", "gallery", "reviews", "location"];
  const links = document.querySelectorAll(".nav-link");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ---------- Hero entrance ----------
function playHeroIntro() {
  if (!hasGsap || reduceMotion) return;
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.fromTo(".pill", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 })
    .fromTo(".hero-copy h1", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.65 }, "-=0.3")
    .fromTo(".hero-sub", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.35")
    .fromTo(".hero-stats .stat", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, "-=0.25")
    .fromTo(".hero-actions .btn", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, "-=0.25")
    .fromTo(
      ".ticket",
      { opacity: 0, x: 40, rotate: 3 },
      { opacity: 1, x: 0, rotate: 0, duration: 0.7, ease: "power3.out" },
      "-=0.55"
    );
}

// ---------- Scroll reveals ----------
function initScrollReveals() {
  if (!hasGsap || !ScrollTrigger || reduceMotion) return;

  const groups = [
    { selector: ".section-heading", y: 24 },
    { selector: ".about-copy > *", y: 20, stagger: 0.08 },
    { selector: ".about-emoji-grid span", y: 20, stagger: 0.08 },
    { selector: ".gallery-tile", y: 24, stagger: 0.07 },
    { selector: ".rating-summary", y: 24 },
    { selector: ".tag-cloud .tag", y: 14, stagger: 0.04 },
    { selector: ".detail-card", y: 20, stagger: 0.08 },
    { selector: ".map-wrap", y: 20 },
    { selector: ".footer-col", y: 16, stagger: 0.06 },
  ];

  groups.forEach(({ selector, y, stagger }) => {
    const els = gsap.utils.toArray(selector);
    if (!els.length) return;
    els.forEach((el) => (el.style.opacity = 0));
    ScrollTrigger.batch(els, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: stagger || 0, overwrite: true }),
    });
    gsap.set(els, { y });
  });
}

// ---------- Gallery hover ----------
function initGalleryHover() {
  if (!hasGsap || reduceMotion) return;
  document.querySelectorAll(".gallery-tile").forEach((tile) => {
    const icon = tile.querySelector(".icon");
    tile.addEventListener("mouseenter", () => {
      gsap.to(icon, { scale: 1.15, rotate: -6, duration: 0.3, ease: "back.out(3)", overwrite: true });
    });
    tile.addEventListener("mouseleave", () => {
      gsap.to(icon, { scale: 1, rotate: 0, duration: 0.3, ease: "power2.out", overwrite: true });
    });
  });
}

// ---------- Button press feedback ----------
function initButtonFeedback() {
  if (!hasGsap || reduceMotion) return;
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn, .add-btn, .pill-btn, .qty-control button");
    if (!btn) return;
    gsap.fromTo(btn, { scale: 0.94 }, { scale: 1, duration: 0.25, ease: "elastic.out(1, 0.5)", overwrite: true });
  });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderPills();
  renderMenu();
  renderCart();
  initNav();

  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
  document.getElementById("menuSearch").addEventListener("input", renderMenu);

  playHeroIntro();
  initScrollReveals();
  initGalleryHover();
  initButtonFeedback();
});
