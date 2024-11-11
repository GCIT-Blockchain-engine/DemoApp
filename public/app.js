const BASE_URL = 'http://localhost:3000';       // Express.js backend
const BLOCKCHAIN_API_URL = 'http://localhost:5000';
let html5QrCode;

// Inject custom alert modal HTML into the DOM
function injectAlertModal() {
    const alertModalHTML = `
        <div id="customAlert" class="alert-modal" style="display: none;">
            <div class="alert-content">
                <span class="close-alert" onclick="closeAlert()">&times;</span>
                <h2 id="alertTitle">Alert</h2>
                <p id="alertMessage">This is a custom alert message.</p>
                <button onclick="closeAlert()">OK</button>
            </div>
        </div>
    `;
    const alertContainer = document.createElement('div');
    alertContainer.innerHTML = alertModalHTML;
    document.body.appendChild(alertContainer);
}

// Inject the modal when the script loads
injectAlertModal();

// Function to show the custom alert modal
function showAlert(title, message) {
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const customAlert = document.getElementById('customAlert');

    if (alertTitle && alertMessage && customAlert) {
        alertTitle.innerText = title;
        alertMessage.innerText = message;
        customAlert.style.display = 'flex';
    } else {
        console.error("Custom alert elements not found in the DOM.");
    }
}

// Function to close the custom alert modal
function closeAlert() {
    const customAlert = document.getElementById('customAlert');
    if (customAlert) {
        customAlert.style.display = 'none';
    }
}

// Login function
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            showAlert("Login Successful", "You are now logged in.");
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        } else {
            showAlert("Login Failed", data.message || "Invalid email or password.");
        }
    } catch (error) {
        console.error("Login error:", error);
        showAlert("Error", "An error occurred while logging in. Please try again.");
    }
}

// Registration function
async function register() {
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const privateKey = document.getElementById('privateKey').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, address, privateKey, password })
        });
        const data = await response.json();

        if (response.ok) {
            showAlert("Registration Successful", "Your account has been created. Redirecting to login...");
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            showAlert("Registration Failed", data.message || "Unable to register. Please try again.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        showAlert("Error", "An error occurred while registering. Please try again.");
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');

    if (!localStorage.getItem('token')) {
        // showAlert("Logged Out", "You have been logged out successfully.");
        setTimeout(() => window.location.href = 'login.html', 1500);
    } else {
        showAlert("Logout Error", "Unable to log out properly. Please try again.");
    }
}


async function generateQRCode() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("You need to log in first");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();

        if (response.ok) {
            const qrContainer = document.getElementById('qrContainer');
            if (!qrContainer) throw new Error("QR container not found");

            const qr = new QRious({
                element: document.getElementById('qrCode'),
                size: 200,
                value: user.address
            });

            qrContainer.style.display = 'block';
        } else {
            alert(`Error: ${user.message}`);
        }
    } catch (error) {
        console.error('Error fetching user data or generating QR code:', error);
    }
}
function closeQrPopup() {
    document.getElementById('qrContainer').style.display = 'none';
}
async function displayBalance() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("You need to log in first");
        window.location.href = 'login.html';
        return;
    }

    try {
        const userResponse = await fetch(`${BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await userResponse.json();

        if (userResponse.ok) {
            const address = user.address;

            // Fetch balance from Flask Blockchain Backend
            const balanceResponse = await fetch(`${BLOCKCHAIN_API_URL}/balance/${address}`);
            const balanceData = await balanceResponse.json();

            if (balanceResponse.ok) {
                const balance = balanceData.balance;
                document.getElementById('balance').textContent = `Balance: ${balance} Coins`;
                console.log(balance)
            } else {
                alert("Failed to retrieve balance");
            }
        } else {
            alert(`Error: ${user.message}`);
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

function startQrScanner() {
    const qrScannerContainer = document.getElementById('qrScannerContainer');
    if (!qrScannerContainer) {
        console.error("QR scanner container not found");
        return;
    }

    qrScannerContainer.style.display = 'block';
    html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.start(
        { facingMode: "environment" },  // Use the rear camera on mobile devices
        {
            fps: 10,                     // Frames per second
            qrbox: { width: 250, height: 250 }  // QR code scanning box size
        },
        qrCodeMessage => {
            alert(`QR Code detected: ${qrCodeMessage}`);
            stopQrScanner();
        },
        errorMessage => {
            console.log(`QR Code scan error: ${errorMessage}`);
        }
    ).catch(err => {
        console.error("Error starting QR scanner:", err);
        alert("Unable to access camera. Please check permissions and try again.");
    });
}

function stopQrScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            document.getElementById('qrScannerContainer').style.display = 'none';
            html5QrCode = null;  // Reset the html5QrCode instance
        }).catch(err => {
            console.error("Error stopping QR scanner:", err);
        });
    }
}


// Function to fetch and display user data
async function displayUserData() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirect to login if no token is found
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch user details from the server using the token for authentication
        const response = await fetch(`${BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();

        if (response.ok) {
            // Display the user's email and blockchain address in the HTML
            document.querySelector(".card-content h4").textContent = `Email: ${user.email}`;
            document.querySelector(".card-content p").textContent = `Blockchain Address: ${user.address}`;
        } else {
            console.error(`Failed to fetch user data: ${user.message}`);
            alert("Failed to load user data. Please log in again.");
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert("An error occurred while loading user data. Please try again.");
    }
}




// Call displayUserData when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Redirect to login if no token is found, except when already on the login page
    // if (!localStorage.getItem('token') && window.location.pathname !== '/login.html') {
    //     window.location.href = 'login.html';
    // } else {
        // Call functions that depend on the token only if it exists
        if (localStorage.getItem('token')) {
            displayUserData(); // Only call if token is present
            displayBalance();  // Only call if token is present
        }
    // }
});




