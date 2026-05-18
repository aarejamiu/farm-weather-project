const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}

const getWeatherBtn = document.getElementById('getWeatherBtn');
if (getWeatherBtn) {
    getWeatherBtn.addEventListener('click', async () => {
        const location = document.getElementById('search').value.trim();
        if (!location) {
            alert('Please enter a location');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/weather/weather?location=${encodeURIComponent(location)}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Unable to fetch weather');
            }

            const data = await res.json();
            const weather = data.weather;

            document.getElementById('temp').textContent = `Temp: ${weather.temp} °C`;
            document.getElementById('humidity').textContent = `Humidity: ${weather.humidity}%`;
            document.getElementById('wind').textContent = `Wind: ${weather.wind} km/h`;
            document.getElementById('condition').textContent = `Condition: ${weather.condition}`;
            document.getElementById('location').textContent = `Location: ${weather.location}`;
        } catch (error) {
            console.error('Error fetching weather:', error);
            alert(error.message || 'Failed to fetch weather');
        }
    });
}

const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        const note = document.getElementById('note').value;
        const location = document.getElementById('location').textContent.split(': ')[1] || document.getElementById('search').value;
        const temp = document.getElementById('temp').textContent.split(': ')[1];
        const humidity = document.getElementById('humidity').textContent.split(': ')[1];
        const wind = document.getElementById('wind').textContent.split(': ')[1];
        const condition = document.getElementById('condition').textContent.split(': ')[1];

    try {
        const res = await fetch("http://localhost:5000/api/dates/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ note, location, temp, humidity, wind, condition })
        });

        const data = await res.json();
        alert(data.message);

        loadSavedDates();
    } catch (error) {
        console.error("Error saving date:", error);
    }
    });
}

const loadSavedDates = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/dates", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        const container = document.getElementById('savedDates');
        container.innerHTML = '';

        data.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('saved-date');
            div.innerHTML = `
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Temp:</strong> ${item.temp}°C</p>
                <p><strong>Humidity:</strong> ${item.humidity}%</p>
                <p><strong>Wind:</strong> ${item.wind} km/h</p>
                <p><strong>Condition:</strong> ${item.condition}</p>
                <p><strong>Note:</strong> ${item.note}</p>
                <button class="deleteBtn" data-id="${item._id}">Delete</button>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading saved dates:", error);
    }
};

const deleteDate = async (id) => {
    try {
        const res = await fetch(`http://localhost:5000/api/dates/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        loadSavedDates();
    } catch (error) {
        console.error("Error deleting date:", error);
    }
};

const loadProfile = async () => {
    try{
        const res = await fetch("http://localhost:5000/api/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        document.getElementById('profileName').textContent = data.name;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profileLocation').textContent = data.farmLocation || "Not set";

        if (data.farmLocation){
            document.getElementById('newLocation').value = data.farmLocation;
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
};

const updateBtn = document.getElementById('updateLocationBtn');
updateBtn.addEventListener('click', async () => {
    const newLocation = document.getElementById('newLocation').value;

    try {
        const res = await fetch("http://localhost:5000/api/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ farmLocation: newLocation })
        });

        const data = await res.json();
        alert(data.message);
        loadProfile();
    } catch (error) {
        console.error("Error updating location:", error);
    }
});

loadSavedDates();
loadProfile()