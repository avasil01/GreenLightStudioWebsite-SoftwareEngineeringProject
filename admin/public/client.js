async function fetchReservations() {   
    try {
        const response = await fetch('/reservations');
        const reservations = await response.json();
 
        const tableBody = document.getElementById('reservationsTable').getElementsByTagName('tbody')[0];
        reservations.forEach(reservation => {
            const row = document.createElement('tr');
 
            // Show tick instead of accept button if already verified.
            let buttonsHtml = '';
            if (reservation.ISACTIVE) {
                buttonsHtml = `<div class="actions-container">
                                <span>✔️</span>
                                <button class="action-btn reject" onclick="rejectReservation(${reservation.RESERVATIONID})">Reject</button>
                                <button class="action-btn modify" onclick="openModifyModal(${reservation.RESERVATIONID}, '${reservation.STARTTIME}', '${reservation.ENDTIME}', ${reservation.ROOMID}, '${reservation.StaffName}', '${reservation.EquipmentName}')">Modify</button>
                            </div>`;
            } else {
                buttonsHtml = `<div class="actions-container">
                                <button class="action-btn accept" onclick="acceptReservation(${reservation.RESERVATIONID})">Accept</button>
                                <button class="action-btn reject" onclick="rejectReservation(${reservation.RESERVATIONID})">Reject</button>
                                <button class="action-btn modify" onclick="openModifyModal(${reservation.RESERVATIONID}, '${reservation.STARTTIME}', '${reservation.ENDTIME}', ${reservation.ROOMID}, '${reservation.StaffName}', '${reservation.EquipmentName}')">Modify</button>
                            </div>`;
            }
 
            row.innerHTML = `
            <td>${reservation.RESERVATIONID}</td>
            <td>${reservation.FullName}</td>
            <td>${reservation.ContactPhone}</td>
            <td>${reservation.ContactEmail}</td>
            <td>${reservation.ContactCompany}</td>
            <td>${reservation.ROOMID}</td>
            <td>${new Date(reservation.STARTTIME).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
            <td>${reservation.STARTTIME.split('T')[1].substring(0, 5)}</td>
            <td>${reservation.ENDTIME.split('T')[1].substring(0, 5)}</td>
            <td class="fixed-width-column">${reservation.StaffName}</td>
            <td class="fixed-width-column">${reservation.EquipmentName}</td>
            <td>${buttonsHtml}</td>
            `;
 
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Error fetching reservations:', err);
    }
}
 
async function openModifyModal(reservationID, currentStartTime, currentEndTime, currentRoomID, currentStaff, currentEquipment) {

    const date = new Date(currentStartTime).toISOString().split('T')[0];
    const formattedStartTime = currentStartTime.substr(11,5);
    const formattedEndTime = currentEndTime.substr(11,5);
    document.getElementById('reservationIdToModify').value = reservationID;
    document.getElementById('newDate').value = date;
    document.getElementById('newStartTime').value = formattedStartTime;
    document.getElementById('newEndTime').value = formattedEndTime;
    document.getElementById('newRoomID').value = currentRoomID;
    if (currentStaff==="-"){
        document.getElementById('newStaff').ariaPlaceholder = "-";
    }
    else{
        document.getElementById('newStaff').value = currentStaff;
    }
    if (currentEquipment==="-"){
        document.getElementById('newEquipment').ariaPlaceholder = "-";
    }
    else{
        document.getElementById('newEquipment').value = currentEquipment;
    }
 
    document.getElementById('modifyModal').style.display = 'block';
}
 
function populateTimeOptions(startTimeFieldId, endTimeFieldId) {
    const start = 9; 
    const end = 17;
    let options = '';
    for (let hour = start; hour <= end; hour++) {                                                   //add 9:00 through 17:30
        options += `<option value="${hour.toString().padStart(2, '0')}:00">${hour}:00</option>`;
        options += `<option value="${hour.toString().padStart(2, '0')}:30">${hour}:30</option>`;    
    }                                                                               
 
    document.getElementById(startTimeFieldId).innerHTML = options;
    options += `<option value="18:00">18:00</option>`;                  //18:00 only as soption for end time.
    document.getElementById(endTimeFieldId).innerHTML = options;
}
 
document.addEventListener('DOMContentLoaded', function () {
    populateTimeOptions('newStartTime', 'newEndTime');
});
 
// closes the modal
document.getElementsByClassName('close-btn')[0].onclick = function () {
    document.getElementById('modifyModal').style.display = 'none';
}
 
async function submitModification() {
    const reservationID = document.getElementById('reservationIdToModify').value;
    const newDate = document.getElementById('newDate').value;
    const newStartTime = document.getElementById('newStartTime').value;
    const newEndTime = document.getElementById('newEndTime').value;
    const newRoomID = document.getElementById('newRoomID').value;
    var newStaff = document.getElementById('newStaff').value;
    var newEquipment = document.getElementById('newEquipment').value;
    const newStartDateTime = newDate + ' ' + newStartTime;
    const newEndDateTime = newDate + ' ' + newEndTime;
 
    newStaff = newStaff.replace(/[\/\\.]/g,' ');
    newEquipment = newEquipment.replace(/[\/\\.]/g,' ');
    if(newStaff.trim() === '')
        newStaff ='-';
    if(newEquipment.trim() ==='')
        newEquipment = '-';
    
    try {   
        const response = await fetch(`/modifyReservation/${reservationID}/${newStartDateTime}/${newEndDateTime}/${newRoomID}/${newStaff}/${newEquipment}`, { method: 'POST' });
        const errorMessage = await response.text();
        if (!response.ok) {
            alert(errorMessage); 
        } else {
            document.getElementById('modifyModal').style.display = 'none';
            location.reload(); // Reload page to update table
        }
    } catch (err) {
        console.error('Error modifying reservation:', error);
        alert(err.message);
    }
}
 
async function acceptReservation(reservationID) {
    try {
        const response = await fetch(`/acceptReservation/${reservationID}`, { method: 'POST' });
        const errorMessage = await response.text();
        if (!response.ok) {
            alert(errorMessage); 
        } else {
            location.reload();
        }
    } catch (err) {
        console.error('Error verifying reservation:', err);
        alert(err.message); 
    }
}
 
async function rejectReservation(reservationID) {
    if (confirm('Are you sure you want to reject this reservation?')) {
        try {
            const response = await fetch(`/cancelReservation/${reservationID}`, { method: 'POST' });
            const errorMessage = await response.text();
            if (!response.ok){
                alert(errorMessage);
            }
            else{
                location.reload();
            }
        } catch (err) {
            console.error('Error rejecting reservation:', err.message);
        }
    }
}
 
fetchReservations();