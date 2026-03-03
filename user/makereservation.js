function showToast(message, duration = 3000) {      //toast message for success
    const toast = document.createElement("div");
    toast.className = "toast-message"
    toast.textContent = message;

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }, 100);
}

function showError(message, duration=3000){         // toast message for error
    const toast = document.createElement("div");
    toast.className = "toast-error"; 
    toast.textContent = message; 

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }, 100);
}

document.getElementById('reservation-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Capture form data
    var formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        company: document.getElementById('companyName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        roomSelect: document.getElementById('roomSelect').value,
        equipment: document.getElementById('equipment').value,
        staff: document.getElementById('staff').value,
        date: document.getElementById('date').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value
    };
   
    fetch('/reservation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(async response =>{
        if (response.ok){
        showToast("Your Reservation Request has successfully been made. You will soon be contacted for confirmation. Thank you.");
        }
        if (!response.ok){
            var errorText = await response.text(); 
            showError(errorText);
        }
    })
    .catch((err) => {
        console.error('Error:', err);
    });
});