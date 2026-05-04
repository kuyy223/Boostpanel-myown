/* =========================
   DEBUG (optional)
========================= */
window.onerror = function(message, source, lineno) {
  console.error("ERROR:", message, "File:", source, "Line:", lineno);
};

/* =========================
   FIREBASE INIT
========================= */
const firebaseConfig = {
    apiKey: "AIzaSyD0ADo1TMD5ASjJ_l4062EEJtqZ2irmuIw",
    authDomain: "boostpanel-myown.firebaseapp.com",
    projectId: "boostpanel-myown",
    storageBucket: "boostpanel-myown.firebasestorage.app",
    messagingSenderId: "1003583759714",
    appId: "1:1003583759714:web:1b9b88c96825ec5d56783b",
    measurementId: "G-689H4KX1S6"
  };

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

/* =========================
   STATE
========================= */
let isAdmin = false;
let clickCount = 0;

/* =========================
   LOADER
========================= */
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;

  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => loader.style.display = "none", 500);
  }, 1200);
});

/* =========================
   ADMIN AUTH CHECK (1x saja)
========================= */
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    isAdmin = false;
    return;
  }

  try {
    const doc = await db.collection("users").doc(user.uid).get();

    if (doc.exists && doc.data().role === "admin") {
      isAdmin = true;

      const loginEl = document.getElementById("adminLogin");
const contentEl = document.getElementById("adminContent");

if (loginEl && contentEl) {
  loginEl.style.display = "none";
  contentEl.style.display = "block";
}

      console.log("Admin aktif ✅");
    } else {
      isAdmin = false;
    }

  } catch (err) {
    console.error(err);
  }
});

/* =========================
   ADMIN LOGIN
========================= */
async function loginAdmin() {
  const email = document.getElementById("adminEmail").value;
  const pass = document.getElementById("adminPass").value;

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    showPopup("Sukses", "Login berhasil");
    closeAdmin();
  } catch (err) {
    showPopup("Error", err.message);
  }
}

function logoutAdmin() {
  auth.signOut();
  showPopup("Logout", "Berhasil logout");
}

/* =========================
   SECRET ADMIN
========================= */
function openSecretAdmin() {
  clickCount++;

  if (clickCount >= 5) {
    document.getElementById("adminPanel").style.display = "flex";
    clickCount = 0;
  }

  setTimeout(() => clickCount = 0, 2000);
}

function closeAdmin() {
  document.getElementById("adminPanel").style.display = "none";
}

/* =========================
   POPUP
========================= */
function showPopup(title, message, callback = null) {
  const popup = document.getElementById("globalPopup");
  if (!popup) return;

  document.getElementById("popupTitle").innerText = title;
  document.getElementById("popupMessage").innerHTML = message;

  popup.style.display = "flex";

  const btnConfirm = document.getElementById("popupConfirm");
  const btnCancel = document.getElementById("popupCancel");

  btnConfirm.onclick = () => {
    popup.style.display = "none";
    if (callback) callback();
  };

  btnCancel.onclick = () => popup.style.display = "none";

  btnCancel.style.display = callback ? "inline-block" : "none";
}

/* =========================
   DATA
========================= */
const hargaLayanan = {
  "25144": { Followers: 20, Likes: 10, Komentar: 50 },
  "3890": { Likes: 8, Followers: 25, Views: 5 },
  "80954": { Channel: 15, Member: 12 }
};

let selectedType = {
  ig: "Followers",
  tt: "Likes",
  wa: "Channel"
};

/* =========================
   DROPDOWN + OPTION
========================= */
function setOption(type, value, e) {
  e.stopPropagation();

  selectedType[type] = value;

  document.getElementById(type + "Text").innerText = value;
  document.getElementById(type + "Menu").style.display = "none";

  const map = { ig: "25144", tt: "3890", wa: "80954" };
  const radio = document.querySelector(`input[value="${map[type]}"]`);

  document.querySelectorAll(".option").forEach(o => o.classList.remove("active"));

  if (radio) {
    radio.checked = true;
    radio.closest(".option").classList.add("active");
  }

  hitungTotal();
}

/* =========================
   TOTAL
========================= */
function hitungTotal() {
  const jumlah = parseInt(document.getElementById("jumlah").value) || 0;
  const service = document.querySelector('input[name="service"]:checked');
  if (!service) return;

  const type =
    service.value === "25144" ? selectedType.ig :
    service.value === "3890" ? selectedType.tt :
    selectedType.wa;

  const harga = hargaLayanan[service.value]?.[type] || 0;
  const total = (jumlah / 1000) * harga;

  document.getElementById("total").innerText =
    Math.floor(total).toLocaleString("id-ID");
}

/* =========================
   INVOICE
========================= */
function showInvoice() {
  const link = document.getElementById("link").value.trim();
  const jumlah = document.getElementById("jumlah").value;
  const total = document.getElementById("total").innerText;

  if (!link || !jumlah) {
    showPopup("Error", "Isi semua data!");
    return;
  }

  const service = document.querySelector('input[name="service"]:checked');

  const layanan =
    service.value === "25144" ? "Instagram" :
    service.value === "3890" ? "Tiktok" : "WhatsApp";

  const tipe =
    service.value === "25144" ? selectedType.ig :
    service.value === "3890" ? selectedType.tt :
    selectedType.wa;

  const html = `
  <div style="display:flex;flex-direction:column;gap:12px">

    <!-- TITLE -->
    <div style="font-size:18px;font-weight:bold">
      📄 Invoice Pesanan
    </div>

    <!-- DETAIL -->
    <div style="display:flex;flex-direction:column;gap:8px;font-size:14px">

      <div style="display:flex;justify-content:space-between">
        <span>Layanan</span>
        <b>${layanan}</b>
      </div>

      <div style="display:flex;justify-content:space-between">
        <span>Tipe</span>
        <b>${tipe}</b>
      </div>

      <div style="display:flex;justify-content:space-between">
        <span>Jumlah</span>
        <b>${jumlah}</b>
      </div>

      <div style="display:flex;justify-content:space-between;gap:10px">
        <span>Link</span>
        <b style="
          max-width:140px;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        ">
          ${link}
        </b>
      </div>

    </div>

    <hr style="opacity:.2">

    <!-- TOTAL -->
    <div style="
      display:flex;
      justify-content:space-between;
      font-size:18px;
      font-weight:bold;
    ">
      <span>Total</span>
      <span style="color:#7c3aed">Rp ${total}</span>
    </div>

    <hr style="opacity:.2">

    <!-- RULES FULL -->
    <div style="
      background:#020617;
      padding:12px;
      border-radius:10px;
      font-size:12px;
      line-height:1.6;
      opacity:.9;
    ">
      <b>📌 Rules Wajib:</b><br>
      • Pastikan link yang dimasukkan benar dan valid<br>
      • Jangan menggunakan 2 layanan pada target yang sama secara bersamaan<br>
      • Akun/private target tidak mendapatkan refund<br>
      • Estimasi proses tergantung server (tidak instan)<br>
      • Tidak menerima komplain jika melanggar rules<br>
      • Dengan melakukan order, Anda dianggap setuju semua aturan
    </div>

    <!-- CHECKBOX -->
    <label style="
      display:flex;
      align-items:center;
      gap:8px;
      font-size:13px;
      margin-top:5px;
    ">
      <input type="checkbox" id="agreeRules">
      Saya telah membaca dan menyetujui rules
    </label>

  </div>
  `;

  showPopup("Konfirmasi Pesanan", html, () => {
    const agree = document.getElementById("agreeRules");

    if (!agree || !agree.checked) {
      showPopup("Peringatan", "Kamu harus menyetujui rules terlebih dahulu!");
      return;
    }

    confirmOrder(layanan, tipe, jumlah, link, total);
  });
}

/* =========================
   ORDER (NO LOGIN REQUIRED)
========================= */
async function confirmOrder(layanan, tipe, jumlah, link, total) {

  const id = "ORD" + Date.now();

  const data = {
    id,
    layanan,
    tipe,
    jumlah,
    link,
    total,
    status: "Pending",
    createdAt: new Date()
  };

  // 🔥 SAFE FIREBASE (tidak blok WA)
  try {
  await db.collection("orders").add(data);
} catch (err) {
  console.error("Firebase error:", err);
}

// JANGAN DI BLOK FIREBASE
setTimeout(() => {
  window.location.href = url;
}, 300);

  // 🔥 FORMAT PESAN
  const pesan = `
Halo Admin BoostPanel 👋

Saya ingin order:

🆔 ID: ${id}
📱 Layanan: ${layanan}
⚙️ Tipe: ${tipe}
🔢 Jumlah: ${jumlah}
🔗 Link: ${link}

💰 Total: Rp ${total}
💳 Metode pembayaran: Transfer / E-Wallet

Mohon info pembayaran 🙏
`;

  // 🔥 NOMOR FIX
  const nomor = "6283142808857";

  const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  console.log("Redirect WA:", url);

  // 🔥 PAKSA REDIRECT
  window.location.href = url;
}

/* =========================
   HISTORY
========================= */
function renderHistory() {
  const tbody = document.querySelector("#historyTable tbody");
  if (!tbody) return;

  db.collection("orders")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {

      tbody.innerHTML = "";

      snapshot.forEach(doc => {
        const d = doc.data();

        tbody.innerHTML += `
        <tr>
          <td>${d.id}</td>
          <td>${d.layanan}</td>
          <td>${d.jumlah}</td>
          <td>${d.status}</td>
          <td>
            ${isAdmin ? `<button onclick="deleteOrder('${doc.id}')">Hapus</button>` : "-"}
          </td>
        </tr>`;
      });

    });
}

/* =========================
   ADMIN ACTION
========================= */
async function deleteOrder(id) {
  if (!isAdmin) return;
  await db.collection("orders").doc(id).delete();
}

/* =========================
   SCROLL
========================= */
function scrollToOrder() {
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
}

function scrollToHistory() {
  document.getElementById("history")?.scrollIntoView({ behavior: "smooth" });
}

function scrollToContact() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

function toggleRules() {
  const r = document.getElementById("rules");
  if (!r) return;
  r.style.display = r.style.display === "block" ? "none" : "block";
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  initOptionClick(); // 🔥 WAJIB
});

function toggleDropdown(id, event) {
  event.stopPropagation();

  const menu = document.getElementById(id);
  if (!menu) return;

  // tutup semua dropdown lain
  document.querySelectorAll(".dropdown-menu").forEach(m => {
    if (m !== menu) m.style.display = "none";
  });

  // toggle
  menu.style.display =
    menu.style.display === "block" ? "none" : "block";
}

function initOptionClick() {
  document.querySelectorAll(".option").forEach(opt => {
    opt.addEventListener("click", function(e) {

      // jangan ganggu dropdown
      if (e.target.closest(".dropdown-menu")) return;

      document.querySelectorAll(".option")
        .forEach(o => o.classList.remove("active"));

      this.classList.add("active");

      const radio = this.querySelector("input");
      if (radio) radio.checked = true;

      hitungTotal();
    });
  });
}

window.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-menu")
    .forEach(m => m.style.display = "none");
});