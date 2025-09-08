// Elements
const categoriesContainer = document.getElementById("category-list");
const plantsGrid = document.getElementById("plants-grid");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const spinner = document.getElementById("spinner");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");

let cart = [];

const API_BASE = "https://openapi.programming-hero.com/api";

// Category list with slugs and friendly names
const CATEGORIES = [
  { id: "all", category: "All Trees" },
  { id: "fruit-trees", category: "Fruit Trees" },
  { id: "flowering-trees", category: "Flowering Trees" },
  { id: "shade-trees", category: "Shade Trees" },
  { id: "medicinal-trees", category: "Medicinal Trees" },
  { id: "timber-trees", category: "Timber Trees" },
  { id: "evergreen-trees", category: "Evergreen Trees" },
  { id: "ornamental-plants", category: "Ornamental Plants" },
  { id: "bamboo", category: "Bamboo" },
  { id: "climbers", category: "Climbers" },
  { id: "aquatic-plants", category: "Aquatic Plants" }
];

// Map slugs to keywords used to match real API/demo categories
const categoryKeywords = {
  "fruit-trees": ["fruit", "fruit tree", "fruit trees", "mango", "guava", "citrus", "orange", "lemon", "mulberry"],
  "flowering-trees": ["flower", "flowering", "flower tree", "flowering tree", "blossom"],
  "shade-trees": ["shade", "shade tree", "shade trees", "oak", "pine"],
  "medicinal-trees": ["medicinal", "neem", "herbal"],
  "timber-trees": ["timber", "timber tree", "timber trees"],
  "evergreen-trees": ["evergreen", "pine", "spruce"],
  "ornamental-plants": ["ornamental", "ornamental plant", "palm"],
  "bamboo": ["bamboo"],
  "climbers": ["climber", "climbing", "climber plant"],
  "aquatic-plants": ["aquatic", "water", "pond"]
};

// Start
document.addEventListener("DOMContentLoaded", () => {
  renderCategories(CATEGORIES);
  loadPlants("all"); // load all initially
  setupModal();
});

// Show/hide spinner
function showSpinner() {
  if (spinner) {
    spinner.style.display = "flex";
    spinner.setAttribute("aria-hidden", "false");
  }
}

function hideSpinner() {
  if (spinner) {
    spinner.style.display = "none";
    spinner.setAttribute("aria-hidden", "true");
  }
}

// Render categories
function renderCategories(categories) {
  if (!categoriesContainer) return;
  categoriesContainer.innerHTML = "";

  categories.forEach((cat, index) => {
    const btn = createCategoryButton(cat, index === 0); // first active
    categoriesContainer.appendChild(btn);
  });
}

function createCategoryButton(cat, active = false) {
  const btn = document.createElement("button");
  btn.className = "category-btn" + (active ? " active" : "");
  btn.type = "button";
  btn.innerText = cat.category;
  btn.dataset.cat = cat.id;
  btn.onclick = () => {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    // loadPlants will filter locally by slug
    loadPlants(cat.id);
  };
  return btn;
}

// Main loader: fetch full plants list then filter locally by category slug
async function loadPlants(categoryId = "all") {
  try {
    showSpinner();

    // Try to fetch a full list of plants from API (some APIs return all in /plants)
    let fetched = [];
    try {
      const res = await fetch(`${API_BASE}/plants`);
      const json = await res.json();
      if (json) {
        if (json.status === "success" && json.data) {
          fetched = Array.isArray(json.data) ? json.data : (json.data.plants || []);
        } else if (Array.isArray(json)) {
          fetched = json;
        } else if (json.plants && Array.isArray(json.plants)) {
          fetched = json.plants;
        } else if (json.data && Array.isArray(json.data)) {
          fetched = json.data;
        }
      }
    } catch (e) {
      console.warn("API /plants fetch failed, using demo data as primary source.", e);
      fetched = [];
    }

    // If API didn't return anything, use demo data as the source
    let plantsSource = (Array.isArray(fetched) && fetched.length > 0) ? fetched : demoPlants();

    // If a specific category is requested (not "all"), filter locally using keywords map
    let plants = plantsSource;
    if (categoryId && categoryId !== "all") {
      const keywords = (categoryKeywords[categoryId] || [categoryId.replace(/-/g, " ")])
        .map(k => k.toLowerCase());

      const matchesCategory = (p) => {
        const combined = [
          p.category,
          p.category_name,
          p.name,
          p.short_description,
          p.description,
          p.tags && p.tags.join(" ")
        ].filter(Boolean).join(" ").toLowerCase();

        return keywords.some(kw => combined.includes(kw));
      };

      plants = plantsSource.filter(matchesCategory);

      // If API returned nothing matching, try filtering demoPlants specifically
      if (!plants || plants.length === 0) {
        const demoFiltered = demoPlants().filter(matchesCategory);
        if (demoFiltered.length > 0) plants = demoFiltered;
      }
    }

    // If still empty, fallback to full demo list
    if (!plants || plants.length === 0) {
      plants = demoPlants();
    }

    renderPlants(plants.slice(0, 9));
  } catch (err) {
    console.error("Error loading plants:", err);
    renderPlants(demoPlants().slice(0, 9));
  } finally {
    hideSpinner();
  }
}

function renderPlants(plants) {
  if (!plantsGrid) return;
  plantsGrid.innerHTML = "";

  plants.forEach(p => {
    const card = document.createElement("article");
    card.className = "plant-card";
    const imageSrc = p.image || p.thumbnail || 'https://via.placeholder.com/400x240?text=Plant';
    const displayName = p.name || 'Unknown Tree';
    const shortDesc = p.short_description || p.description || 'A great tree to plant in your garden.';
    const categoryLabel = p.category || p.category_name || 'Tree';
    const priceVal = Number(p.price || p.cost || 500);

    card.innerHTML = `
      <img src="${imageSrc}" alt="${escapeHtml(displayName)}">
      <h3 class="plant-name" data-id="${p.id || ''}">${escapeHtml(displayName)}</h3>
      <p class="plant-desc">${escapeHtml(shortDesc)}</p>
      <div class="plant-meta">
        <span class="cat">${escapeHtml(categoryLabel)}</span>
        <span class="price">$${priceVal.toFixed(2)}</span>
      </div>
      <button class="add-cart" data-id="${p.id || ''}" data-name="${escapeHtml(displayName)}" data-price="${priceVal}">Add to Cart</button>
    `;
    plantsGrid.appendChild(card);

    const nameEl = card.querySelector(".plant-name");
    if (nameEl) nameEl.addEventListener("click", () => showDetails(p.id, p));

    const addBtn = card.querySelector(".add-cart");
    if (addBtn) addBtn.addEventListener("click", () => addToCart({
      id: p.id || Math.random().toString(36).slice(2, 9),
      name: p.name || 'Tree',
      price: priceVal
    }));
  });
}

// Show details in modal
async function showDetails(id, fallbackObj = null) {
  try {
    showSpinner();
    let plant = fallbackObj || null;
    if (id) {
      try {
        const res = await fetch(`${API_BASE}/plant/${id}`);
        const json = await res.json();
        if (json.status === "success" && json.data) plant = json.data;
        else if (json.name) plant = json;
      } catch (e) {
        // ignore inner error and use fallback
      }
    }
    if (!plant && fallbackObj) plant = fallbackObj;
    if (!plant) plant = demoPlants()[0];

    modalContent.innerHTML = `
      <h2>${escapeHtml(plant.name || 'Tree')}</h2>
      <img style="width:100%;max-height:320px;object-fit:cover;border-radius:8px;margin:8px 0" src="${plant.image || plant.thumbnail || 'https://via.placeholder.com/900x400?text=Plant'}" alt="${escapeHtml(plant.name || 'Tree')}">
      <p>${escapeHtml(plant.description || plant.long_description || plant.short_description || 'No extended description available.')}</p>
      <p><strong>Category:</strong> ${escapeHtml(plant.category || plant.category_name || 'Tree')}</p>
      <p><strong>Price:</strong> $${Number(plant.price || plant.cost || 500).toFixed(2)}</p>
    `;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  } catch (err) {
    console.error("Error showing details:", err);
  } finally {
    hideSpinner();
  }
}

// Modal helpers
function setupModal() {
  if (!modalClose || !modal) return;
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}

function closeModal() {
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

// Cart functionality
function addToCart(item) {
  const existing = cart.find(ci => ci.id === item.id);
  if (existing) {
    existing.qty += 1;
    alert(`${item.name} quantity updated in cart (x${existing.qty})`);
  } else {
    cart.push({ ...item, qty: 1 });
    alert(`${item.name} added to cart ✅`);
  }
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(ci => ci.id !== id);
  updateCartUI();
}

function updateCartUI() {
  if (!cartItemsEl || !cartTotalEl) return;
  cartItemsEl.innerHTML = "";
  let total = 0;
  cart.forEach(ci => {
    total += ci.price * ci.qty;
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(ci.name)} (x${ci.qty}) - $${(ci.price * ci.qty).toFixed(2)}</span> <button class="remove-btn" data-id="${ci.id}">✖</button>`;
    cartItemsEl.appendChild(li);
  });
  cartTotalEl.innerText = `$${total.toFixed(2)}`;

  cartItemsEl.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });
}

// Escape HTML characters
function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"'`=\/]/g, function (ch) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' })[ch];
  });
}

// Demo fallback data
function demoPlants() {
  return [
    { id: 101, name: "Mango Tree", short_description: "A fast-growing tree producing delicious mangoes.", category: "Fruit Tree", price: 500, image: "https://images.unsplash.com/photo-1524594154900-6f6e7b0d2c40?auto=format&fit=crop&w=800&q=60" },
    { id: 102, name: "Guava Tree", short_description: "Yields sweet guavas; low maintenance.", category: "Fruit Tree", price: 300, image: "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=800&q=60" },
    { id: 103, name: "Neem Tree", short_description: "Medicinal properties and hardy.", category: "Medicinal Trees", price: 450, image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60" },
    { id: 104, name: "Oak Tree", short_description: "Large shade tree, long-living.", category: "Shade Trees", price: 700, image: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=800&q=60" },
    { id: 105, name: "Bamboo", short_description: "Fast-growing and versatile.", category: "Bamboo", price: 200, image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60" },
    { id: 106, name: "Citrus Tree", short_description: "Fresh lemons and oranges.", category: "Fruit Tree", price: 350, image: "https://images.unsplash.com/photo-1502741126161-b048400d3bb5?auto=format&fit=crop&w=800&q=60" },
    { id: 107, name: "Pine Tree", short_description: "Cold-tolerant evergreen.", category: "Evergreen Trees", price: 600, image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=60" },
    { id: 108, name: "Palm", short_description: "Ornamental and tropical.", category: "Ornamental", price: 400, image: "https://images.unsplash.com/photo-1499988922087-6f645c6c1b7b?auto=format&fit=crop&w=800&q=60" },
    { id: 109, name: "Mulberry", short_description: "Fruit & shade in one.", category: "Fruit Tree", price: 320, image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=60" }
  ];
}

// Donate form simple handler (unchanged)
const donateForm = document.getElementById("donate-form");
if (donateForm) {
  donateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const qty = form.qty.value;
    if (!name || !email || !qty) {
      alert("Please fill all fields.");
      return;
    }
    alert(`Thanks ${name}! Your donation for ${qty} tree(s) has been recorded. (Demo)`);
    form.reset();
  });
}
