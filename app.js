
const API_BASE = "https://spread-divine-sensitive-extras.trycloudflare.com/api";

/*
|--------------------------------------------------------------------------
| REQUEST HELPER
|--------------------------------------------------------------------------
*/
async function request(url, options = {}) {

    const res = await fetch(url, options);

    let data = {};

    try {
        data = await res.json();
    } catch (_) {}

    if (!res.ok) {
        throw new Error(data.message || `HTTP Error ${res.status}`);
    }

    return data;
}

/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/
async function getAllDeliveries() {
    return request(`${API_BASE}/delivery`);
}

/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/
async function searchDeliveries(q = "") {
    return request(`${API_BASE}/delivery/search?q=${encodeURIComponent(q)}`);
}

/*
|--------------------------------------------------------------------------
| ADD
|--------------------------------------------------------------------------
*/
async function addDelivery(formData) {
    return request(`${API_BASE}/delivery`, {
        method: "POST",
        body: formData
    });
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/
async function deleteDelivery(id) {

    if (!confirm("Hapus data ini?")) return;

    return request(`${API_BASE}/delivery/${id}`, {
        method: "DELETE"
    });
}

/*
|--------------------------------------------------------------------------
| RENDER LIST
|--------------------------------------------------------------------------
*/
function renderDeliveryList(items = []) {

    const list = document.getElementById("resultList");
    const status = document.getElementById("status");
    const template = document.getElementById("deliveryTemplate");

    list.innerHTML = "";

    if (!items.length) {
        status.textContent = "Tidak ada data";
        return;
    }

    status.textContent = `${items.length} data ditemukan`;

    items.forEach(item => {

        const node = template.content.cloneNode(true);

        node.querySelector(".nama").textContent = item.nama || "-";
        node.querySelector(".alamat").textContent = item.alamat || "-";
        node.querySelector(".keterangan").textContent = item.keterangan || "-";

        /*
        |--------------------------------------------------------------------------
        | FOTO
        |--------------------------------------------------------------------------
        */
        const foto = node.querySelector(".foto");

        if (item.foto) {
            foto.src = item.foto;
        } else {
            foto.style.display = "none";
        }

        /*
        |--------------------------------------------------------------------------
        | MAPS (FIX: LAT LNG)
        |--------------------------------------------------------------------------
        */
        const maps = node.querySelector(".maps");

        if (item.lat && item.lng) {

            maps.src =
                `https://www.google.com/maps?q=${item.lat},${item.lng}&output=embed`;

        } else {
            maps.style.display = "none";
        }

        /*
        |--------------------------------------------------------------------------
        | BUKA MAPS
        |--------------------------------------------------------------------------
        */
        node.querySelector(".lihat-rute").addEventListener("click", () => {

            if (!item.lat || !item.lng) {
                alert("Koordinat tidak tersedia");
                return;
            }

            window.open(
                `https://www.google.com/maps?q=${item.lat},${item.lng}`,
                "_blank"
            );
        });

        /*
        |--------------------------------------------------------------------------
        | EDIT
        |--------------------------------------------------------------------------
        */
        node.querySelector(".edit-data").addEventListener("click", () => {
            location.href = `update.html?id=${item._id}`;
        });

        /*
        |--------------------------------------------------------------------------
        | DELETE
        |--------------------------------------------------------------------------
        */
        const delBtn = document.createElement("button");
        delBtn.textContent = "Hapus";

        delBtn.addEventListener("click", async () => {

            try {
                await deleteDelivery(item._id);
                await loadAllData();
            } catch (err) {
                alert(err.message);
            }

        });

        node.querySelector(".actions").appendChild(delBtn);

        list.appendChild(node);

    });
}

/*
|--------------------------------------------------------------------------
| LOAD DATA
|--------------------------------------------------------------------------
*/
async function loadAllData() {

    const status = document.getElementById("status");

    try {
        status.textContent = "Memuat data...";

        const data = await getAllDeliveries();

        renderDeliveryList(data.data || data);

    } catch (err) {
        console.error(err);
        status.textContent = err.message;
    }
}

/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/
async function searchData() {

    const input = document.getElementById("searchInput");
    const q = input.value.trim();

    if (!q) return loadAllData();

    const data = await searchDeliveries(q);

    renderDeliveryList(data.data || data);
}

/*
|--------------------------------------------------------------------------
| EXPORT GLOBAL
|--------------------------------------------------------------------------
*/
window.loadAllData = loadAllData;
window.searchData = searchData;
window.addDelivery = addDelivery;
window.deleteDelivery = deleteDelivery;
