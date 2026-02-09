


// 🪑 Τραπέζι από QR
const params = new URLSearchParams(window.location.search);
const tableNumber = params.get("table") || "Άγνωστο";

// ➕➖ Αλλαγή ποσότητας
function changeQty(button, delta) {
  const qtyEl = delta > 0 ? button.previousElementSibling : button.nextElementSibling;
  let qty = parseInt(qtyEl.textContent);
  qty = Math.max(0, qty + delta);
  qtyEl.textContent = qty;

  updateOrderUI();
  saveOrder();
}

// 🔄 Ενημέρωση καλαθιού
function updateOrderUI() {
  const items = document.querySelectorAll('.qty');
  const orderList = document.getElementById("orderList");
  const totalEl = document.getElementById("total");
  const orderBox = document.getElementById("orderBox");

  updateCartCount();

  let html = "";
  let total = 0;

  items.forEach(item => {
    const qty = parseInt(item.textContent);
    if (qty > 0) {
      const name = item.dataset.name;
      const price = parseFloat(item.dataset.price) || 0;
      const sum = qty * price;

      html += `
        <div class="cart-item">
          <span>${name}</span>
          <div class="cart-controls">
            <button onclick="changeQtyFromCart('${name}', -1)">−</button>
            <span>${qty}</span>
            <button onclick="changeQtyFromCart('${name}', 1)">+</button>
          </div>
          <span>${sum.toFixed(2)}€</span>
        </div>
      `;

      total += sum;
    }
  });

  // 📝 Σχόλια στο καλάθι
  const notes = document.getElementById("orderNotes")?.value.trim();
  if (notes && html) {
    html += `
      <div class="order-notes-preview">
        <em>${notes}</em>
      </div>
    `;
  }

  orderList.innerHTML = html || "Δεν έχεις επιλέξει προϊόντα";
  totalEl.textContent = total.toFixed(2);

  if (total === 0) {
    orderBox.classList.remove("active");
  }
}

// 📤 Αποστολή παραγγελίας
// 📤 Αποστολή παραγγελίας
function sendOrder() {
  const items = document.querySelectorAll('.qty');
  const notes = document.getElementById("orderNotes").value.trim();
  const statusEl = document.getElementById("orderStatus");

  let message = `🍽️ Νέα Παραγγελία
🪑 Τραπέζι: ${tableNumber}
`;

  let total = 0;
  let hasOrder = false;

  const orderItems = [];

  items.forEach(item => {
    const qty = parseInt(item.textContent);
    if (qty > 0) {
      hasOrder = true;

      const name = item.dataset.name;
      const price = parseFloat(item.dataset.price) || 0;
      const sum = qty * price;

      // 🧠 για Telegram
      message += `- ${name} x${qty} = ${sum.toFixed(2)}€\n`;
      total += sum;

      // 📊 για στατιστικά
      orderItems.push({
        name: name,
        price: price,
        qty: qty
      });
    }
  });

  if (!hasOrder) {
    alert("Δεν έχεις επιλέξει προϊόντα");
    return;
  }

  if (notes) {
    message += `\n📝 Σχόλια:\n${notes}\n`;
  }

  message += `\n💰 Σύνολο: ${total.toFixed(2)}€`;

  fetch("send_order.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message,
      items: orderItems
    })
  })
  .then(res => res.json())
  .then(() => {
    statusEl.style.display = "block";
    statusEl.innerHTML = "✅ Η παραγγελία στάλθηκε!";

    setTimeout(() => {
      document.getElementById("orderBox").classList.remove("active");
      statusEl.style.display = "none";
      items.forEach(i => i.textContent = "0");
      document.getElementById("orderNotes").value = "";
      updateOrderUI();
      localStorage.removeItem("orderData");
    }, 2000);
  })
  .catch(() => {
    statusEl.textContent = "❌ Σφάλμα σύνδεσης";
    statusEl.style.display = "block";
  });
}


// 🧾 Προεπισκόπηση παραγγελίας
function previewOrder() {
  const items = document.querySelectorAll('.qty');
  const notes = document.getElementById("orderNotes")?.value.trim();
  let text = "🧾 ΕΛΕΓΧΟΣ ΠΑΡΑΓΓΕΛΙΑΣ\n\n";
  let total = 0;
  let hasOrder = false;

  items.forEach(item => {
    const qty = parseInt(item.textContent);
    if (qty > 0) {
      hasOrder = true;
      const name = item.dataset.name;
      const price = parseFloat(item.dataset.price) || 0;
      const sum = qty * price;

      text += `• ${name} x${qty} = ${sum.toFixed(2)}€\n`;
      total += sum;
    }
  });

  if (!hasOrder) {
    alert("❌ Δεν έχεις επιλέξει προϊόντα");
    return;
  }

  if (notes) {
    text += `\n📝 Σχόλια:\n${notes}\n`;
  }

  text += `\n💰 Σύνολο: ${total.toFixed(2)}€`;

  alert(text);
}

// 🛒 Bubble
function updateCartCount() {
  let count = 0;
  document.querySelectorAll('.qty').forEach(item => {
    count += parseInt(item.textContent);
  });

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartBubble").style.display = count > 0 ? "flex" : "none";
}

// Toggle καλάθι/μενού
function toggleCart() {
  document.getElementById("orderBox").classList.toggle("active");
}

function toggleMenu() {
  document.getElementById("sideMenu").classList.toggle("active");
}

// Αλλαγή ποσότητας από καλάθι
function changeQtyFromCart(name, delta) {
  document.querySelectorAll('.qty').forEach(item => {
    if (item.dataset.name === name) {
      let qty = parseInt(item.textContent) + delta;
      qty = Math.max(0, qty);
      item.textContent = qty;
    }
  });

  updateOrderUI();
  saveOrder();
}

// 💾 Αποθήκευση παραγγελίας
function saveOrder() {
  const data = [];
  document.querySelectorAll(".qty").forEach(item => {
    data.push({
      name: item.dataset.name,
      price: item.dataset.price,
      qty: item.textContent
    });
  });

  localStorage.setItem("orderData", JSON.stringify(data));
}

// 📦 Φόρτωση παραγγελίας
function loadOrder() {
  const data = JSON.parse(localStorage.getItem("orderData"));
  if (!data) return;

  document.querySelectorAll(".qty").forEach(item => {
    const found = data.find(d => d.name === item.dataset.name);
    if (found) item.textContent = found.qty;
  });

  updateOrderUI();
}

// Load παραγγελία κατά την φόρτωση σελίδας
window.addEventListener("load", loadOrder);
