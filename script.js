const categoriesContainer = document.getElementById("categories");
const plantsContainer = document.getElementById("plants");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const spinner = document.getElementById("spinner");

let cart = [];

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadPlants();
});

// Load Categories
async function loadCategories() {
  try {
    const res = await fetch("https://openapi.programming-hero.com/api/categories");
    const data = await res.json();
    displayCategories(data.categories);
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function displayCategories(categories) {
  categoriesContainer.innerHTML = "";
  categories.forEach((cat) => {
    const button = document.createElement("button");
    button.innerText = cat.category;
    button.className = "category-btn";
    button.onclick = () => loadPlants(cat.id, button);
    categoriesContainer.appendChild(button);
  });
}

// Load Plants
async function loadPlants(categoryId = null, button = null) {
  try {
    spinner.style.display = "block";
    let url = "https://openapi.programming-hero.com/api/plants";
    if (categoryId) {
      url = `https://openapi.programming-hero.com/api/category/${categoryId}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    displayPlants(data.plants || data);

    // Active button
    document.querySelectorAll(".category-btn").forEach((btn) => btn.classList.remove("active"));
    if (button) button.classList.add("active");
  } catch (error) {
    console.error("Error loading plants:", error);
  } finally {
    spinner.style.display = "none";
  }
}

function displayPlants(plants) {
  plantsContainer.innerHTML = "";
  plants.forEach((plant) => {
    const card = document.createElement("div");
    card.className = "plant-card";
    card.innerHTML = `
      <img src="${plant.image}" alt="${plant.name}">
      <h3 class="plant-name" onclick="showDetails(${plant.id})">${plant.name}</h3>
      <p>${plant.short_description || "No description available"}</p>
      <p><strong>Category:</strong> ${plant.category}</p>
      <p><strong>Price:</strong> $${plant.price}</p>
      <button onclick="addToCart(${plant.id}, '${plant.name}', ${plant.price})">Add to Cart</button>
    `;
    plantsContainer.appendChild(card);
  });
}

// Modal Details
async function showDetails(id) {
  try {
    const res = await fetch(`https://openapi.programming-hero.com/api/plant/${id}`);
    const data = await res.json();
    const plant = data;

    modalContent.innerHTML = `
      <span id="close-modal" style="cursor:pointer;float:right;font-size:24px;">&times;</span>
      <h2>${plant.name}</h2>
      <img src="${plant.image}" alt="${plant.name}">
      <p>${plant.description}</p>
      <p><strong>Category:</strong> ${plant.category}</p>
      <p><strong>Price:</strong> $${plant.price}</p>
    `;

    modal.style.display = "flex";
    document.getElementById("close-modal").onclick = () => (modal.style.display = "none");
  } catch (error) {
    console.error("Error loading details:", error);
  }
}

// Cart
function addToCart(id, name, price) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} (x${item.qty}) - $${item.price * item.qty}
      <button onclick="removeFromCart(${item.id})">❌</button>
    `;
    cartItems.appendChild(li);
  });

  cartTotal.innerText = total;
}

// Close modal outside click
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
