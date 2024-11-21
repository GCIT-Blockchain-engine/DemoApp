const BASE_URL = 'http://localhost:3000'; 
const BLOCKCHAIN_API_URL = 'http://127.0.0.1:5000';
let html5QrCode;
let userData = {}; // Store the user's data globally

// Function to show the custom alert modal
window.showAlert = function (title, message) {
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const customAlert = document.getElementById('customAlert');

    if (alertTitle && alertMessage && customAlert) {
        // Set the title and message for the alert
        alertTitle.innerText = title || "Error";
        alertMessage.innerText = message || "Something went wrong.";

        // Show the alert modal
        customAlert.style.display = 'flex';
    } else {
        console.error("Custom alert elements are missing in the DOM.");
    }
};

// Function to close the alert modal
window.closeAlert = function () {
    const customAlert = document.getElementById('customAlert');
    if (customAlert) {
        customAlert.style.display = 'none';
    }
};


// Login function
window.login = async function () {
    console.log("Login function called");
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        showAlert("Input Error", "Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            console.log("Login successful");
            localStorage.setItem('token', data.token);
            showAlert("Login Successful", "You are now logged in.");
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        } else {
            console.error("Login failed:", data.message);
            showAlert("Login Failed", data.message || "Invalid email or password.");
        }
    } catch (error) {
        console.error("Login error:", error);
        showAlert("Error", "An error occurred while logging in. Please try again.");
    }
}

// Registration function
window.registerStep1 = async function () {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!name || !email || !password) {
        showAlert("Input Error", "Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();

        

        if (response.ok) {
            showAlert("Step 1 Complete", "Please proceed to generate your keys.");
            document.getElementById('initialForm').style.display = 'none';
            document.getElementById('keyForm').style.display = 'block';

            // Save user ID for key generation
            localStorage.setItem('userId', data.userId);
        } else {
            showAlert("Registration Failed", data.message || "Unable to register.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        showAlert("Error", "An error occurred while registering. Please try again.");
    }
};

window.saveKeys = async function () {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        showAlert("Error", "User ID not found.");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/generate-keys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();

        if (response.ok) {
            showAlert("Keys Saved", "Your keys have been saved successfully.");
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            showAlert("Error", data.message || "Unable to save keys.");
        }
    } catch (error) {
        console.error("Key generation error:", error);
        showAlert("Error", "An error occurred while saving keys. Please try again.");
    }
};


// Logout function
window.logout = function () {
    console.log("Logout function called");
    localStorage.removeItem('token');
    showAlert("Logged Out", "You have been logged out successfully.");
    setTimeout(() => window.location.href = 'login.html', 1500);
}

// Fetch and display user data, including privateKey and publicKey
window.displayUserData = async function () {
    console.log("DisplayUserData function called");
    const token = localStorage.getItem('token');
    if (!token) {
        console.log("No token found, redirecting to login");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();

        if (response.ok) {
            console.log("User data fetched successfully:", user);
            const emailElement = document.getElementById("userEmail");
            const publicKeyElement = document.getElementById("userPublicKey");
            const privateKeyElement = document.getElementById("userPrivateKey");

            if (emailElement) {
                emailElement.textContent = `Email: ${user.email}`;
            }

            if (publicKeyElement) {
                publicKeyElement.textContent = `Public Key: ${user.publicKey || "Not Generated"}`;
            }

            if (privateKeyElement) {
                privateKeyElement.textContent = `Private Key: ${user.privateKey || "Not Generated"}`;
            }
        } else {
            console.error(`Failed to fetch user data: ${user.message}`);
            showAlert("Error", "Failed to load user data. Please log in again.");
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        showAlert("Error", "An error occurred while loading user data. Please try again.");
    }
};



// Show a custom alert
function showAlert(title, message) {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('customAlert').style.display = 'block';
}

// Close the custom alert
function closeAlert() {
    document.getElementById('customAlert').style.display = 'none';
}

// Call displayBalance on page load
document.addEventListener('DOMContentLoaded', () => {
    displayBalance();
});



// Generate random keys and populate the form
async function generateKeys() {
    console.log("Generate keys function called");

    try {
        // Fetch the keys from the backend
        const response = await fetch(`${BLOCKCHAIN_API_URL}/wallet/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();

            if (data && data.private_key && data.public_key) {
                // Populate the form fields
                document.getElementById('privateKey').value = data.private_key;
                document.getElementById('publicKey').value = data.public_key;

                console.log("Keys generated:", {
                    privateKey: data.private_key,
                    publicKey: data.public_key
                });
            } else {
                throw new Error('Invalid response from the server');
            }
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error generating keys:", error);
        alert('Error generating wallet credentials');
    }
}

// Attach to button click
document.getElementById('generateKeysButton').addEventListener('click', generateKeys);


// Save the keys to the database
window.saveKeys = async function () {
    const userId = localStorage.getItem('userId');
    const privateKey = document.getElementById('privateKey').value;
    const publicKey = document.getElementById('publicKey').value;

    if (!privateKey || !publicKey) {
        showAlert("Error", "Please generate the keys before saving.");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/generate-keys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, privateKey, publicKey })
        });
        const data = await response.json();

        if (response.ok) {
            showAlert("Keys Saved", "Your keys have been saved successfully.");
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            showAlert("Error", data.message || "Unable to save keys.");
        }
    } catch (error) {
        console.error("Key save error:", error);
        showAlert("Error", "An error occurred while saving keys. Please try again.");
    }
};





// Generate QR Code function
window.generateQRCode = async function () {
    console.log("GenerateQRCode function called");

    const token = localStorage.getItem('token');
    if (!token) {
        showAlert("Authentication Error", "You need to log in first.");
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch user data from the API
        const response = await fetch(`${BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("Error fetching user data for QR Code:", errorMessage);
            showAlert("Error", "Unable to fetch user data. Please try again.");
            return;
        }

        const user = await response.json();
        console.log("User data for QR Code:", user);

        if (!user.address) {
            console.error("User address not found for QR Code.");
            showAlert("Error", "User address is not available. Please update your profile.");
            return;
        }

        // Get QR code container and canvas elements
        const qrContainer = document.getElementById('qrContainer');
        const qrCodeCanvas = document.getElementById('qrCode');
        if (!qrContainer || !qrCodeCanvas) {
            console.error("QR container or canvas not found");
            showAlert("Error", "QR Code elements not found.");
            return;
        }

        // Clear previous QR code if any
        qrCodeCanvas.width = qrCodeCanvas.width; // Resets the canvas to clear it

        // Generate QR code
        new QRious({
            element: qrCodeCanvas,
            size: 200,
            value: user.address // Adjust if the backend uses a different field for the address
        });

        // Display the QR code container
        qrContainer.style.display = 'block';
        console.log("QR Code generated and displayed.");
    } catch (error) {
        console.error("Error fetching user data or generating QR code:", error);
        showAlert("Error", "An error occurred while generating the QR code. Please try again.");
    }
};


// Close QR Popup
window.closeQrPopup = function () {
    console.log("CloseQrPopup function called");
    const qrContainer = document.getElementById('qrContainer');
    if (qrContainer) {
        qrContainer.style.display = 'none';
    }
}

// Start QR Scanner function
window.startQrScanner = function () {
    console.log("StartQrScanner function called");
    const qrScannerContainer = document.getElementById('qrScannerContainer');
    if (!qrScannerContainer) {
        console.error("QR scanner container not found");
        return;
    }

    qrScannerContainer.style.display = 'block';
    html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.start(
        { facingMode: "environment" }, // Use the rear camera on mobile devices
        {
            fps: 10, // Frames per second
            qrbox: { width: 250, height: 250 } // QR code scanning box size
        },
        qrCodeMessage => {
            console.log("QR Code scanned:", qrCodeMessage);
            // Show the transaction form with the scanned recipient address
            showTransactionForm(qrCodeMessage);
            stopQrScanner();
        },
        errorMessage => {
            console.log(`QR Code scan error: ${errorMessage}`);
        }
    ).catch(err => {
        console.error("Error starting QR scanner:", err);
        showAlert("Unable to access camera", "Please check permissions and try again.");
    });
}

// Stop QR Scanner function
window.stopQrScanner = function () {
    console.log("StopQrScanner function called");
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            const qrScannerContainer = document.getElementById('qrScannerContainer');
            if (qrScannerContainer) {
                qrScannerContainer.style.display = 'none';
            }
            html5QrCode = null; // Reset the html5QrCode instance
            console.log("QR Scanner stopped.");
        }).catch(err => {
            console.error("Error stopping QR scanner:", err);
            showAlert("Error", "Unable to stop the QR scanner. Please try again.");
        });
    }
}

async function showTransactionForm(qrCodeMessage) {
    console.log("ShowTransactionForm function called with message:", qrCodeMessage);

    // Fetch token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Authentication token not found.");
        alert("You need to log in first.");
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch user details from the backend API
        const response = await fetch(`${BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error("Failed to fetch user data:", await response.text());
            alert("Unable to fetch user data. Please log in again.");
            window.location.href = 'login.html';
            return;
        }

        const userData = await response.json();
        console.log("Fetched user data:", userData);

        // Update the transaction form with user details and scanned recipient address
        const recipientAddressInput = document.getElementById('recipientAddress');
        const privateKeyInput = document.getElementById('privateKey');
        const publicKeyInput = document.getElementById('publicKey');

        if (recipientAddressInput) {
            recipientAddressInput.value = qrCodeMessage; // Set recipient address from QR code
            console.log("Recipient address set to:", qrCodeMessage);
        } else {
            console.error("Recipient address input not found.");
        }

        if (privateKeyInput && userData.privateKey) {
            privateKeyInput.value = userData.privateKey; // Set user's private key
            console.log("Private key pre-filled.");
        } else {
            console.error("Private key input not found or unavailable.");
        }

        if (publicKeyInput && userData.publicKey) {
            publicKeyInput.value = userData.publicKey; // Set user's public key
            console.log("Public key pre-filled.");
        } else {
            console.error("Public key input not found or unavailable.");
        }

        const transactionFormModal = document.getElementById('transactionFormModal');
        if (transactionFormModal) {
            transactionFormModal.style.display = 'flex'; // Show transaction form modal
            console.log("Transaction form modal displayed.");
        } else {
            console.error("Transaction form modal not found in the DOM.");
        }
    } catch (error) {
        console.error("Error fetching user details or showing transaction form:", error);
        alert("An error occurred while preparing the transaction form. Please try again.");
    }
}






