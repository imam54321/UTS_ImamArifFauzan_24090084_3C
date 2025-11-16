/* UTILITY (rupiah)*/
function rupiah(num) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
}

/* DATA DUMMY */
const summary = {
    totalProducts: 120,
    totalSales: 85,
    totalRevenue: 12500000
};

const products = [
    { id: 1, name: "Kopi Gayo", price: 25000, stock: 50 },
    { id: 2, name: "Teh Hitam", price: 18000, stock: 30 },
    { id: 3, name: "Coklat Aceh", price: 30000, stock: 20 }
];

/*  LOGIN*/
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorMsg = document.getElementById("loginError");
        errorMsg.textContent = "";
        if (!email || !password) {
            errorMsg.textContent = "Email dan password tidak boleh kosong!";
            return;
        }
        alert("Login berhasil!");
        window.location.href = "dashboard.html";
    });
}

/* SIDEBAR / HAMBURGER (mobile)*/
function initSidebarToggle() {
    const openBtns = document.querySelectorAll('#openMenu');
    const closeBtns = document.querySelectorAll('#closeSidebar');
    const sidebar = document.getElementById('sidebar');

    openBtns.forEach(b => b && b.addEventListener('click', () => {
        if (sidebar) sidebar.classList.add('open');
    }));
    closeBtns.forEach(b => b && b.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('open');
    }));

    // click outside to close (mobile)
    document.addEventListener('click', (e) => {
        if (!sidebar) return;
        const target = e.target;
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(target) && !target.closest('.hamburger')) {
                sidebar.classList.remove('open');
            }
        }
    });
}
initSidebarToggle();

/* DASHBOARD: render summary cards*/
function renderSummaryCards() {
    const wrap = document.getElementById('summaryCards');
    if (!wrap) return;
    const cards = [
        {title: 'Total Produk', value: summary.totalProducts },
        {title: 'Total Penjualan', value: summary.totalSales },
        {title: 'Total Revenue', value: rupiah(summary.totalRevenue) }
    ];
    wrap.innerHTML = cards.map(c => `
        <div class="summary-card">
            <div class="summary-title">${c.title}</div>
            <div class="summary-value">${c.value}</div>
        </div>
    `).join('');
}
renderSummaryCards();

// tombol ke products dari dashboard
const toProducts = document.getElementById('toProducts');
if (toProducts) {
    toProducts.addEventListener('click', () => { window.location.href = 'products.html'; });
}

/* PRODUCTS: render table & mobile list*/
const productTableBody = document.getElementById('productTableBody');
const mobileContainer = document.getElementById('productsMobile');

function bindRowEvents(rowElem, prod) {
    const editBtn = rowElem.querySelector('.edit-btn');
    const delBtn = rowElem.querySelector('.delete-btn');

    if (editBtn) {
        editBtn.addEventListener('click', () => openModal('edit', prod));
    }
    if (delBtn) {
        delBtn.addEventListener('click', () => {
            if (confirm(`Yakin hapus produk "${prod.name}"?`)) {
                // remove from products array
                products = products.filter(p => p.id !== prod.id);
                syncSummary(); renderTable(); renderMobileList();
            }
        });
    }
}

function renderTable() {
    if (!productTableBody) return;
    productTableBody.innerHTML = '';
    products.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td style="text-align:left;padding-left:10px">${p.name}</td>
            <td>${rupiah(p.price)}</td>
            <td>${p.stock}</td>
            <td>
                <button class="action-btn edit-btn">Edit</button>
                <button class="action-btn delete-btn">Hapus</button>
            </td>
        `;
        bindRowEvents(tr, p);
        productTableBody.appendChild(tr);
    });
}

function renderMobileList() {
    if (!mobileContainer) return;
    mobileContainer.setAttribute('aria-hidden', 'false');
    mobileContainer.innerHTML = products.map((p, idx) => `
        <div class="product-card">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <h4 style="margin:0">${p.name}</h4>
                    <p style="margin:6px 0 0;color:var(--muted)">${rupiah(p.price)} • Stok ${p.stock}</p>
                </div>
                <div class="product-actions">
                    <button class="action-btn edit-btn">Edit</button>
                    <button class="action-btn delete-btn">Hapus</button>
                </div>
            </div>
        </div>
    `).join('');

    // after render, bind events for mobile buttons
    mobileContainer.querySelectorAll('.product-card').forEach((cardElem, idx) => {
        const prod = products[idx];
        bindRowEvents(cardElem, prod);
    });
}

renderTable();
renderMobileList();

/* SUMMARY sync after changes*/
function syncSummary() {
    summary.totalProducts = products.length;
    // For demo, totalSales & revenue keep same; adjust as needed
    renderSummaryCards();
}

/* MODAL: add / edit product*/
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const pName = document.getElementById('pName');
const pPrice = document.getElementById('pPrice');
const pStock = document.getElementById('pStock');
const saveProduct = document.getElementById('saveProduct');
const cancelModal = document.getElementById('cancelModal');

let editingId = null;
function openModal(mode, product = null) {
    if (!modal) return;
    modal.style.display = 'grid';
    modal.setAttribute('aria-hidden', 'false');
    if (mode === 'add') {
        modalTitle.textContent = 'Tambah Produk';
        pName.value = ''; pPrice.value = ''; pStock.value = '';
        editingId = null;
    } else if (mode === 'edit') {
        modalTitle.textContent = 'Edit Produk';
        editingId = product.id;
        pName.value = product.name;
        pPrice.value = product.price;
        pStock.value = product.stock;
    }
}
function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    editingId = null;
}
if (cancelModal) cancelModal.addEventListener('click', closeModal);
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

if (saveProduct) {
    saveProduct.addEventListener('click', () => {
        const name = pName.value.trim();
        const price = Number(pPrice.value) || 0;
        const stock = Number(pStock.value) || 0;
        if (!name) { alert('Nama produk wajib diisi'); return; }

        if (editingId) {
            // edit
            products = products.map(p => p.id === editingId ? { ...p, name, price, stock } : p);
        } else {
            // add new (id unique)
            const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, name, price, stock });
        }

        closeModal();
        syncSummary(); renderTable(); renderMobileList();
    });
}

/* Add product button*/
const addProductBtn = document.getElementById('addProductBtn');
if (addProductBtn) addProductBtn.addEventListener('click', () => openModal('add'));

/* MODAL open from edit buttons (already bound in bindRowEvents)*/

/* MISC: logout link handlers*/
const logoutLink = document.getElementById('logoutLink');
const logoutLink2 = document.getElementById('logoutLink2');
if (logoutLink) logoutLink.addEventListener('click', () => { /* optional: clear session */ });
if (logoutLink2) logoutLink2.addEventListener('click', () => { /* optional: clear session */ });
