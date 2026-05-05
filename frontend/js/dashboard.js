const token = localStorage.getItem('token');

if(!token){
    window.location.href = 'login.html';
}

const logoutBtn = document.getElementById('logoutBtn');

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

const saveBtn = document.getElementById('saveBtn');
saveBtn.addEventListener('click', async () => {
    const note = document.getElementById('note').value;
    const location = document.getElementById('location').value;
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

loadSavedDates();