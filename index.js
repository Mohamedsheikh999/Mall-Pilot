let map;
let userLocation = null;
let markers = [];
let routingControl = null;



// Stores object linking store names to their coordinates and malls
const stores = {
    zara: { name: "Zara", lat: -1.1945, lng: 36.8823, mall: "two_rivers" },
    lc_waikiki: { name: "LC Waikiki", lat: -1.1947, lng: 36.8827, mall: "two_rivers" },
    naivas_two_rivers: { name: "Naivas Supermarket", lat: -1.1948, lng: 36.8830, mall: "two_rivers" },
    woolworths_sarit: { name: "Woolworths", lat: -1.2654, lng: 36.7983, mall: "sarit_centre" },
    mrp_sarit: { name: "MRP", lat: -1.2655, lng: 36.7985, mall: "sarit_centre" },
    java_sarit: { name: "Java House", lat: -1.2657, lng: 36.7989, mall: "sarit_centre" },
    levis_westgate: { name: "Levi's", lat: -1.2680, lng: 36.8050, mall: "westgate" },
    samsung_westgate: { name: "Samsung Store", lat: -1.2681, lng: 36.8052, mall: "westgate" },
    carrefour_garden: { name: "Carrefour", lat: -1.2540, lng: 36.8800, mall: "garden_city" },
    miniso_garden: { name: "Miniso", lat: -1.2541, lng: 36.8802, mall: "garden_city" }
};



// Initialize the map
function initMap() {
    const defaultCenter = [-1.2195, 36.8861]; // Default location
    map = L.map('map').setView(defaultCenter, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);




    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = [position.coords.latitude, position.coords.longitude];
                L.marker(userLocation, { title: "You are here" }).addTo(map);
                map.setView(userLocation, 15);
            },
            () => {
                alert("Could not get your location. Using default center.");
            }
        );
    }
}




// Add a marker for a store
function addStoreMarker(store) {
    const marker = L.marker([store.lat, store.lng]).addTo(map);
    marker.bindPopup(`<strong>${store.name}</strong>`).openPopup();
    markers.push(marker);
}




// Add route from user to store
function addRoute(destination) {
    if (!userLocation) {
        alert("User location not found. Please allow location access.");
        return;
    }

    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(userLocation[0], userLocation[1]),
            L.latLng(destination.lat, destination.lng)
        ],
        routeWhileDragging: true,
        createMarker: function (i, waypoint, n) {
            return L.marker(waypoint.latLng, {
                draggable: false,
                title: i === 0 ? "Start" : i === n - 1 ? "Destination" : "Waypoint",
            });
        }
    }).addTo(map);
}





// Update store options based on selected mall
function updateStoreOptions() {
    const mall = document.getElementById("mall")?.value;
    const storeSelect = document.getElementById("store");

    if (!storeSelect) return;

    storeSelect.innerHTML = '<option value="">--Choose a Store--</option>';

    for (const key in stores) {
        if (stores[key].mall === mall) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = stores[key].name;
            storeSelect.appendChild(option);
        }
    }
}





// Handle form submission
document.addEventListener("DOMContentLoaded", () => {
    initMap();

    document.getElementById("mall")?.addEventListener("change", updateStoreOptions);

    document.getElementById("directionForm")?.addEventListener("submit", function (e) {
        e.preventDefault();

        const selectedStoreKey = document.getElementById("store")?.value;
        if (!selectedStoreKey || !stores[selectedStoreKey]) {
            alert("Please select a valid store.");
            return;
        }

        const store = stores[selectedStoreKey];




        // Clear previous markers
        markers.forEach((m) => m.remove());
        markers = [];



        // Add store marker
        addStoreMarker(store);



        // Center map on store
        map.setView([store.lat, store.lng], 18);



        // Add route to store
        addRoute(store);
    });




    
    // Reset button
    document.getElementById("resetBtn")?.addEventListener("click", () => {
        document.getElementById("directionForm")?.reset();
        markers.forEach((m) => m.remove());
        markers = [];
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
        map.setView(userLocation || [-1.2195, 36.8861], 15);
    });
});
