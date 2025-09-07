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

// API base - (as provided in your README). If offline, many demo placeholders will be used.
const API_BASE = "https://openapi.programming-hero.com/api";

// Start
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadPlants(); // load all plants initially
  setupModal();
});

// Helper: Show / hide spinner
function showSpinner() { spinner.style.display = "flex"; spinner.setAttribute("aria-hidden","false"); }
function hideSpinner() { spinner.style.display = "none"; spinner.setAttribute("aria-hidden","true"); }

// Load categories from API
async function loadCategories() {
  try {
    showSpinner();
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    const categories = json.categories || [];
    renderCategories(categories.slice(0,12)); // show up to 12 for layout
  } catch (err) {
    console.error("Error loading categories:", err);
    // fallback demo categories
    renderCategories([
      { id: 1, category: "All Trees" },
      { id: 2, category: "Fruit Trees" },
      { id: 3, category: "Shade Trees" },
      { id: 4, category: "Medicinal Trees" },
    ]);
  } finally {
    hideSpinner();
  }
}

function renderCategories(categories) {
  categoriesContainer.innerHTML = "";
  // add a default "All" button
  const allBtn = createCategoryButton({ id: null, category: "All Trees" }, true);
  categoriesContainer.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = createCategoryButton(cat, false);
    categoriesContainer.appendChild(btn);
  });
}

function createCategoryButton(cat, active=false) {
  const btn = document.createElement("button");
  btn.className = "category-btn" + (active ? " active" : "");
  btn.innerText = cat.category;
  btn.onclick = () => {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadPlants(cat.id);
  };
  return btn;
}

// Load plants (optionally by category)
async function loadPlants(categoryId = null) {
  try {
    showSpinner();
    let url = `${API_BASE}/plants`;
    if (categoryId) url = `${API_BASE}/category/${categoryId}`;
    const res = await fetch(url);
    const json = await res.json();
    // The API structure varies: data might be under .data or .plants, so try a few keys
    let plants = [];
    if (json.status === "success" && json.data) {
      // sometimes data contains array of plants
      plants = Array.isArray(json.data) ? json.data : (json.data.plants || []);
    } else if (json.plants) {
      plants = json.plants;
    } else if (Array.isArray(json)) {
      plants = json;
    } else {
      plants = [];
    }

    // If empty, use fallback demo items
    if (!plants || plants.length === 0) {
      plants = demoPlants();
    }

    renderPlants(plants.slice(0, 9)); // show first 9 for grid like screenshot
  } catch (err) {
    console.error("Error loading plants:", err);
    renderPlants(demoPlants());
  } finally {
    hideSpinner();
  }
}

function renderPlants(plants) {
  plantsGrid.innerHTML = "";
  plants.forEach(p => {
    const card = document.createElement("article");
    card.className = "plant-card";
    card.innerHTML = `
      <img src="${p.image || p.thumbnail || 'https://via.placeholder.com/400x240?text=Plant'}" alt="${escapeHtml(p.name || 'Plant')}">
      <h3 class="plant-name" data-id="${p.id || ''}">${escapeHtml(p.name || 'Unknown Tree')}</h3>
      <p class="plant-desc">${escapeHtml(p.short_description || p.description || 'A great tree to plant in your garden.')}</p>
      <div class="plant-meta">
        <span class="cat">${escapeHtml(p.category || p.category_name || 'Fruit Tree')}</span>
        <span class="price">$${Number(p.price || p.cost || 500)}</span>
      </div>
      <button class="add-cart" data-id="${p.id || ''}" data-name="${escapeHtml(p.name || 'Tree')}" data-price="${Number(p.price || p.cost || 500)}">Add to Cart</button>
    `;
    plantsGrid.appendChild(card);

    // attach events
    const nameEl = card.querySelector(".plant-name");
    nameEl.addEventListener("click", () => showDetails(p.id, p));

    const addBtn = card.querySelector(".add-cart");
    addBtn.addEventListener("click", () => addToCart({
      id: p.id || Math.random().toString(36).slice(2,9),
      name: p.name || 'Tree',
      price: Number(p.price || p.cost || 500)
    }));
  });
}

// show details in modal; if API supports detail call, try that; otherwise use passed object
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
      } catch(e) {
        // ignore inner error and use fallback
      }
    }
    if (!plant && fallbackObj) plant = fallbackObj;
    if (!plant) plant = demoPlants()[0];

    modalContent.innerHTML = `
      <h2>${escapeHtml(plant.name || 'Tree')}</h2>
      <img style="width:100%;max-height:320px;object-fit:cover;border-radius:8px;margin:8px 0" src="${plant.image || plant.thumbnail || 'https://via.placeholder.com/900x400?text=Plant'}" alt="${escapeHtml(plant.name||'Tree')}">
      <p>${escapeHtml(plant.description || plant.long_description || plant.short_description || 'No extended description available.')}</p>
      <p><strong>Category:</strong> ${escapeHtml(plant.category || plant.category_name || 'Fruit Tree')}</p>
      <p><strong>Price:</strong> $${Number(plant.price || plant.cost || 500)}</p>
    `;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden","false");
  } catch (err) {
    console.error("Error showing details:", err);
  } finally {
    hideSpinner();
  }
}

// Modal helpers
function setupModal() {
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}
function closeModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden","true");
}

// CART FUNCTIONALITY
function addToCart(item) {
  const existing = cart.find(ci => ci.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  updateCartUI();
}
function removeFromCart(id) {
  cart = cart.filter(ci => ci.id !== id);
  updateCartUI();
}
function updateCartUI() {
  cartItemsEl.innerHTML = "";
  let total = 0;
  cart.forEach(ci => {
    total += ci.price * ci.qty;
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(ci.name)} (x${ci.qty}) - $${ci.price * ci.qty}</span> <button class="remove-btn" data-id="${ci.id}">✖</button>`;
    cartItemsEl.appendChild(li);
  });
  cartTotalEl.innerText = total;
  // attach remove handlers
  cartItemsEl.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });
}

// small helpers
function escapeHtml(s){
  if (!s && s !== 0) return "";
  return String(s).replace(/[&<>"'`=\/]/g, function(ch) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'})[ch];
  });
}

// Demo fallback data (if API returns nothing)
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

// Donate form simple handler
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
