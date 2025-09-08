// ---------------- SELECT ELEMENTS ----------------
const categoryContainer = document.getElementById("category-container");
const cardContainer = document.getElementById("card-container");
const cartContainer = document.getElementById("cart-container");

let totalPrice = 0;

// ---------------- SPINNER ----------------
const manageSpinner = (status) => {
  if (status) {
    document.getElementById("spinner").classList.remove("hidden");
    cardContainer.classList.add("hidden");
  } else {
    document.getElementById("spinner").classList.add("hidden");
    cardContainer.classList.remove("hidden");
  }
};

// ---------------- SHOW PLANTS ----------------
const showPlants = (plants) => {
  cardContainer.innerHTML = "";
  plants.forEach((plant) => {
    cardContainer.innerHTML += `
      <div class="bg-white p-2 rounded-lg">
        <div>
          <img class="rounded-lg max-h-40 w-full object-cover" src="${plant.image}" alt="" />
        </div>
        <h5 onclick="loadPlantDetail(${plant.id})" class="font-bold mt-3 cursor-pointer">${plant.name}</h5>
        <p class="max-h-12 overflow-hidden text-gray-400">${plant.description}</p>
        <div class="flex justify-between items-center mt-6 mb-3">
          <button class="bg-[#DCFCE7] px-3 py-1 text-[#15803D] font-semibold text-sm rounded-3xl">
            ${plant.category}
          </button>
          <h3 class="font-bold">৳ <span>${plant.price}</span></h3>
        </div>
        <button
          class="add-to-cart-btn bg-[#15803D] px-3 py-1 text-white font-semibold text-sm rounded-3xl w-full mt-2"
          data-id="${plant.id}"
          data-name="${plant.name}"
          data-price="${plant.price}"
        >
          Add To Cart
        </button>
      </div>
    `;
  });
  manageSpinner(false);
};

// ---------------- LOAD ALL PLANTS ----------------
const loadAllPlants = () => {
  manageSpinner(true);
  fetch("https://openapi.programming-hero.com/api/plants")
    .then((res) => res.json())
    .then((data) => showPlants(data.plants))
    .catch((err) => console.log(err));
};

// ---------------- LOAD TREES BY CATEGORY ----------------
const loadTreesByCategory = (categoryId) => {
  manageSpinner(true);
  fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`)
    .then((res) => res.json())
    .then((data) => showPlants(data.plants))
    .catch((err) => console.log(err));
};

// ---------------- SHOW CATEGORY ----------------
const showCategory = (categories) => {
  categoryContainer.innerHTML = "";

  // Add "All Trees" category at the top
  const allTreesLi = document.createElement("li");
  allTreesLi.id = "all-trees";
  allTreesLi.textContent = "All Trees";
  allTreesLi.className = "bg-[#15803D] text-white text-left w-full pl-2 cursor-pointer";
  categoryContainer.appendChild(allTreesLi);

  // Add other categories
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.id = cat.id;
    li.textContent = cat.category_name;
    li.className = "hover:bg-[#15803D50] text-left w-full pl-2 cursor-pointer";
    categoryContainer.appendChild(li);
  });

  // Add event listener for **all categories**
  categoryContainer.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;

    // Remove highlight from all
    categoryContainer.querySelectorAll("li").forEach(li => li.classList.remove("bg-[#15803D]", "text-white"));
    // Highlight clicked
    e.target.classList.add("bg-[#15803D]", "text-white");

    if (e.target.id === "all-trees") {
      loadAllPlants();
    } else {
      loadTreesByCategory(e.target.id);
    }
  });

  // Load default category (All Trees)
  allTreesLi.click();
};

// ---------------- LOAD CATEGORIES ----------------
const loadCategory = () => {
  fetch("https://openapi.programming-hero.com/api/categories")
    .then((res) => res.json())
    .then((data) => showCategory(data.categories))
    .catch((err) => console.log(err));
};

// ---------------- CART FUNCTIONALITY ----------------
cardContainer.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("add-to-cart-btn")) {
    const name = e.target.getAttribute("data-name");
    const price = e.target.getAttribute("data-price");
    alert(`🛒 ${name} has been added to your cart.`);
    updateCart(name, price);
  }
});

const updateCart = (name, price) => {
  const cartItem = document.createElement("div");
  cartItem.className = "cart-item p-2 bg-green-200 flex gap-5 rounded-lg mb-2 justify-between items-center shadow-sm";

  cartItem.innerHTML = `
    <div>
      <h5 class="font-semibold">${name}</h5>
      <p class="cart-price text-gray-700">৳ ${price}</p>
    </div>
    <div class="remove-btn cursor-pointer">❌</div>
  `;

  cartContainer.appendChild(cartItem);

  const numericPrice = parseFloat(price);
  totalPrice += numericPrice;
  updateTotalDisplay();

  cartItem.querySelector(".remove-btn").addEventListener("click", () => {
    totalPrice -= numericPrice;
    cartItem.remove();
    updateTotalDisplay();
  });
};

const updateTotalDisplay = () => {
  const totalPriceSpan = document.getElementById("total-price");
  totalPriceSpan.textContent = totalPrice.toFixed(2);
};

// ---------------- PLANT DETAIL ----------------
const loadPlantDetail = async (id) => {
  const res = await fetch(`https://openapi.programming-hero.com/api/plant/${id}`);
  const data = await res.json();
  const plant = data.plants;
  const detailsBox = document.getElementById("details-container");
  detailsBox.innerHTML = `
    <h4 class="font-bold">${plant.name}</h4>
    <img src="${plant.image}" alt="" />
    <h4><span class="font-bold">Category:</span> ${plant.category}</h4>
    <h4><span class="font-bold">Price:</span> ${plant.price}</h4>
    <h4><span class="font-bold">Description:</span> ${plant.description}</h4>
  `;
  document.getElementById("my_modal_1").showModal();
};

// ---------------- DONATE FORM ----------------
const donateBtn = document.querySelector("#plant-a-tree-form button");
donateBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const form = donateBtn.closest("div");
  const name = form.querySelector('input[placeholder="Your Name"]').value;
  const email = form.querySelector('input[placeholder="Your Email Address"]').value;
  const trees = form.querySelector('input[placeholder="Number of Tress"]').value;
  if (!name || !email || !trees) return alert("Please fill all fields!");
  alert(`🎉 Thank you ${name}! You have donated ${trees}.`);
  form.querySelectorAll("input").forEach(input => input.value = "");
});

// ---------------- INIT ----------------
loadCategory();
