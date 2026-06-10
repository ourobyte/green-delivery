/*
|--------------------------------------------------------------------------
| app.js
| Delivery Greencentermart Frontend
|--------------------------------------------------------------------------
|
| Cloudflare Worker Endpoint
| Contoh:
| https://delivery-worker.<subdomain>.workers.dev
|
*/

const API_BASE = "https://YOUR_WORKER_URL.workers.dev/api";

/*
|--------------------------------------------------------------------------
| Helper Request
|--------------------------------------------------------------------------
*/

async function request(url, options = {}) {

    const response = await fetch(url, options);

    let data = {};

    try {
        data = await response.json();
    } catch (_) {}

    if (!response.ok) {
        throw new Error(
            data.message ||
            `HTTP Error ${response.status}`
        );
    }

    return data;
}

/*
|--------------------------------------------------------------------------
| Ambil Semua Data
|--------------------------------------------------------------------------
*/

async function getAllDeliveries() {

    return await request(
        `${API_BASE}/delivery`
    );

}

/*
|--------------------------------------------------------------------------
| Cari Data
|--------------------------------------------------------------------------
*/

async function searchDeliveries(keyword = "") {

    return await request(
        `${API_BASE}/delivery/search?q=${encodeURIComponent(keyword)}`
    );

}

/*
|--------------------------------------------------------------------------
| Ambil Detail
|--------------------------------------------------------------------------
*/

async function getDeliveryById(id) {

    return await request(
        `${API_BASE}/delivery/${id}`
    );

}

/*
|--------------------------------------------------------------------------
| Tambah Data
|--------------------------------------------------------------------------
*/

async function addDelivery(formData) {

    return await request(
        `${API_BASE}/delivery`,
        {
            method: "POST",
            body: formData
        }
    );

}

/*
|--------------------------------------------------------------------------
| Update Data
|--------------------------------------------------------------------------
*/

async function updateDelivery(id, formData) {

    return await request(
        `${API_BASE}/delivery/${id}`,
        {
            method: "PUT",
            body: formData
        }
    );

}

/*
|--------------------------------------------------------------------------
| Hapus Data
|--------------------------------------------------------------------------
*/

async function deleteDelivery(id) {

    const confirmDelete = confirm(
        "Yakin ingin menghapus data ini?"
    );

    if (!confirmDelete) {
        return;
    }

    return await request(
        `${API_BASE}/delivery/${id}`,
        {
            method: "DELETE"
        }
    );

}

/*
|--------------------------------------------------------------------------
| Render Daftar
|--------------------------------------------------------------------------
*/

function renderDeliveryList(items = []) {

    const resultList =
        document.getElementById("resultList");

    const status =
        document.getElementById("status");

    const template =
        document.getElementById("deliveryTemplate");

    if (!resultList || !template) {
        return;
    }

    resultList.innerHTML = "";

    if (!items.length) {

        status.textContent =
            "Tidak ada data.";

        return;
    }

    status.textContent =
        `${items.length} data ditemukan`;

    items.forEach(item => {

        const clone =
            template.content.cloneNode(true);

        clone.querySelector(".nama").textContent =
            item.nama || "-";

        clone.querySelector(".alamat").textContent =
            item.alamat || "-";

        clone.querySelector(".keterangan").textContent =
            item.keterangan || "-";

        /*
        |--------------------------------------------------------------------------
        | Foto Rumah
        |--------------------------------------------------------------------------
        */

        const foto =
            clone.querySelector(".foto");

        if (item.foto) {

            foto.src = item.foto;

        } else {

            foto.alt = "Tidak ada foto";

            foto.style.display = "none";

        }

        /*
        |--------------------------------------------------------------------------
        | Maps Preview
        |--------------------------------------------------------------------------
        */

        const maps =
            clone.querySelector(".maps");

        if (item.sharelock) {

            maps.src =
                "https://www.google.com/maps?q="
                + encodeURIComponent(item.sharelock)
                + "&output=embed";

        } else {

            maps.style.display = "none";

        }

        /*
        |--------------------------------------------------------------------------
        | Tombol Buka Maps
        |--------------------------------------------------------------------------
        */

        clone
            .querySelector(".lihat-rute")
            .addEventListener("click", () => {

                if (!item.sharelock) {

                    alert(
                        "Sharelock tidak tersedia."
                    );

                    return;
                }

                window.open(
                    item.sharelock,
                    "_blank"
                );

            });

        /*
        |--------------------------------------------------------------------------
        | Tombol Edit
        |--------------------------------------------------------------------------
        */

        clone
            .querySelector(".edit-data")
            .addEventListener("click", () => {

                location.href =
                    `update.html?id=${item._id}`;

            });

        /*
        |--------------------------------------------------------------------------
        | Tombol Hapus
        |--------------------------------------------------------------------------
        */

        const actionContainer =
            clone.querySelector(".actions");

        const deleteBtn =
            document.createElement("button");

        deleteBtn.textContent =
            "Hapus";

        deleteBtn.addEventListener(
            "click",
            async () => {

                try {

                    await deleteDelivery(
                        item._id
                    );

                    await loadAllData();

                } catch (err) {

                    alert(
                        err.message ||
                        "Gagal menghapus data."
                    );

                }

            }
        );

        actionContainer.appendChild(
            deleteBtn
        );

        resultList.appendChild(clone);

    });

}

/*
|--------------------------------------------------------------------------
| Load Semua Data
|--------------------------------------------------------------------------
*/

async function loadAllData() {

    const status =
        document.getElementById("status");

    try {

        if (status) {

            status.textContent =
                "Memuat data...";

        }

        const data =
            await getAllDeliveries();

        renderDeliveryList(
            data.data || data
        );

    } catch (err) {

        console.error(err);

        if (status) {

            status.textContent =
                err.message ||
                "Gagal memuat data.";

        }

    }

}

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

async function searchData() {

    const input =
        document.getElementById("searchInput");

    const keyword =
        input
            ? input.value.trim()
            : "";

    const status =
        document.getElementById("status");

    try {

        if (status) {

            status.textContent =
                "Mencari...";

        }

        if (!keyword) {

            await loadAllData();

            return;
        }

        const data =
            await searchDeliveries(
                keyword
            );

        renderDeliveryList(
            data.data || data
        );

    } catch (err) {

        console.error(err);

        if (status) {

            status.textContent =
                err.message ||
                "Pencarian gagal.";

        }

    }

}

/*
|--------------------------------------------------------------------------
| Utility
|--------------------------------------------------------------------------
*/

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    return new Date(dateString)
        .toLocaleString("id-ID");

}

/*
|--------------------------------------------------------------------------
| PWA Install
|--------------------------------------------------------------------------
*/

let deferredPrompt = null;

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredPrompt = event;

        console.log(
            "PWA dapat diinstall."
        );

    }
);

/*
|--------------------------------------------------------------------------
| Export ke Global Scope
|--------------------------------------------------------------------------
*/

window.loadAllData =
    loadAllData;

window.searchData =
    searchData;

window.addDelivery =
    addDelivery;

window.updateDelivery =
    updateDelivery;

window.deleteDelivery =
    deleteDelivery;

window.getDeliveryById =
    getDeliveryById;

window.getAllDeliveries =
    getAllDeliveries;

window.searchDeliveries =
    searchDeliveries;
