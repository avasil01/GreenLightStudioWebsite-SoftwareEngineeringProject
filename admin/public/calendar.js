const roomColorMap = {
  red: "pink",
  blue: "lightblue",
  green: "lightgreen",
  yellow: "lightsalmon",
};

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

function getMonthStartEndDates(year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

function clearReservations() {
  const reservationBars = document.querySelectorAll(".reservation-bar");
  reservationBars.forEach(bar => bar.remove());
}

window.onload = function () {
  const today = new Date();
  let currentMonth = today.getMonth(); //0-indexed
  let currentYear = today.getFullYear();

  const populateTimeOptions = () => {
    const startTimeSelect = document.getElementById("startTime");
    const endTimeSelect = document.getElementById("endTime");
    for (let hour = 9; hour < 18; hour++) {
      ["00", "30"].forEach((min) => {                       //start and endTimeSelect have options from 09:00 through 17:30
        let timeValue = `${hour}:${min.padStart(2, "0")}`;
        let option = document.createElement("option");
        option.value = timeValue;
        option.text = timeValue;
        startTimeSelect.appendChild(option.cloneNode(true));
        endTimeSelect.appendChild(option.cloneNode(true)); 
      });
    }
    endTimeSelect.appendChild(new Option("18:00", "18:00")); // Add 18:00 as an option only to endTimeSelect
  };

  const generateCalendar = () => {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML =
      "<tr><th>Sunday</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th></tr>";
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    let date = 1;
    for (let row = 0; row < 6; row++) {
      let rowHTML = "<tr>";
      for (let col = 0; col < 7; col++) {
        if (row === 0 && col < firstDay) {
          rowHTML += "<td></td>"; // Empty cells
        } else if (date > daysInMonth) {
          rowHTML += "<td></td>"; // Remaining empty cells after end of month
        } else {
          rowHTML += `<td data-date="${date}">${date}</td>`;
          date++;
        }
      }
      rowHTML += "</tr>";
      calendar.innerHTML += rowHTML;
      if (date > daysInMonth) {
        break; // Stop if we've finished the last date of the month
      }
    }

    document.getElementById("month-year-label").innerText = `${new Date(
      currentYear,
      currentMonth
    ).toLocaleString("default", { month: "long" })} ${currentYear}`;
  };

  // Populate time options on form load
  populateTimeOptions();

  generateCalendar();
  let reservationCountPerDay = {};
  const displayReservation = (reservation) => {

    const { STARTTIME: startTime, ENDTIME: endTime, ROOMID: roomID } = reservation;
    let color_of_room = "";
    if (roomID == 1) {
      color_of_room = roomColorMap["red"];
    }
    else if (roomID == 2) {
      color_of_room = roomColorMap["blue"];
    }
    else if (roomID == 3) {
      color_of_room = roomColorMap["green"];
    }
    else if (roomID == 4) {
      color_of_room = roomColorMap["yellow"];
    }
    
    const startTimeDateObj = new Date(startTime); // Find corresponding day cell in the calendar
    const day = startTimeDateObj.getDate();       // Extract only the day part
    const date = String(day);                     // 'day' is now the day part of the date, as a number
    const reservationDayCell = document.querySelector(`td[data-date="${date}"]`);
    if (!reservationDayCell) {
      return; // Skip if no corresponding cell found
    }

    const reservationBar = document.createElement("div");
    reservationBar.classList.add("reservation-bar");
    reservationBar.tabIndex = 0;
    reservationBar.id = reservation.RESERVATIONID;
    reservationBar.addEventListener('click', onReservationBarClick);
    reservationBar.style.backgroundColor = color_of_room;

    const startTimeObj = new Date(startTime);
    const endTimeObj = new Date(endTime);
    startTimeObj.setHours(startTimeObj.getHours() - 2);
    endTimeObj.setHours(endTimeObj.getHours() - 2);

    const newStartTime = formatTime(startTimeObj);
    const newEndTime = formatTime(endTimeObj);
    const timeText = `${newStartTime}-${newEndTime}`;
    reservationBar.textContent = timeText;

    reservationBar.style.width = "fit-content";
    reservationBar.style.height = "fit-content";
    reservationBar.style.fontSize = "medium";
    reservationBar.style.color = "black";
    reservationBar.style.textAlign = "center";
    reservationBar.style.padding = "5px";
    reservationBar.style.borderRadius = "5px";
    reservationBar.style.padding = "5px";
    reservationBar.style.display = "inline-block";
    reservationBar.style.whiteSpace = "nowrap"; // Prevent text from wrapping
    reservationBar.style.overflow = "hidden"; // Hide overflow text
    reservationBar.style.textOverflow = "ellipsis"; // Show ellipsis for long text

    const year = startTimeDateObj.getFullYear();
    const month = (startTimeDateObj.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
    const dayb = startTimeDateObj.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${dayb}`;
    if (!reservationCountPerDay[formattedDate]) {
      reservationCountPerDay[formattedDate] = 0;
    }
    reservationCountPerDay[formattedDate]++;

    // Check if more than two reservations and update "+more" button
    if (reservationCountPerDay[formattedDate] > 2) {
      displayMoreButton(reservationDayCell, formattedDate);
    } else {
      reservationDayCell.appendChild(reservationBar);
    }

  };

  const displayMoreButton = (cell, date) => {
    let moreButton = cell.querySelector('.more-button');
    if (!moreButton) {
      moreButton = document.createElement('button');
      moreButton.textContent = '+more';
      moreButton.classList.add('more-button');
      moreButton.onclick = () => showAllReservationsForDay(date);
      cell.appendChild(moreButton);
    }
    moreButton.textContent = `+${reservationCountPerDay[date] - 2} more`; // Update button text
  };

  const showAllReservationsForDay = (date) => {
    const modal = document.getElementById('reservationsModal');
    const modalDate = document.getElementById('modalDate');
    const modalReservationsList = document.getElementById('modalReservationsList');
    const closeModal = modal.querySelector('.reservationsCloseButton');
    modalDate.textContent = date;
    modalReservationsList.innerHTML = ''; 
    const dateObj = new Date(date);
    dateObj.setMonth(dateObj.getMonth() - 1);

    // Format the new date back into a string
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 2).toString().padStart(2, '0'); // getMonth is 0-indexed
    const day = dateObj.getDate().toString().padStart(2, '0');
    const newDateString = `${year}-${month}-${day}`;

    // Fetch and display reservations for the selected day
    const url = `/getReservationsRange?startDate=${encodeURIComponent(newDateString)}&endDate=${encodeURIComponent(newDateString)}`;

    fetch(url)
      .then(response => response.json())
      .then(reservations => {
        reservations.forEach(reservation => {
          if (reservation.ISACTIVE) {
            let color_of_room = "";
            if (reservation.ROOMID == 1) {
              color_of_room = roomColorMap["red"];
            }
            else if (reservation.ROOMID == 2) {
              color_of_room = roomColorMap["blue"];
            }
            else if (reservation.ROOMID == 3) {
              color_of_room = roomColorMap["green"];
            }
            else if (reservation.ROOMID == 4) {
              color_of_room = roomColorMap["yellow"];
            }
            const listItem = document.createElement('div');
            listItem.className = 'reservation-box';
            listItem.id = reservation.RESERVATIONID;
            listItem.addEventListener('click', onReservationBarClick);
            listItem.style.backgroundColor = color_of_room;
            const startTimeObj = new Date(reservation.STARTTIME);
            const endTimeObj = new Date(reservation.ENDTIME);
            startTimeObj.setHours(startTimeObj.getHours() - 2);
            const newStartTime = formatTime(startTimeObj);
            endTimeObj.setHours(endTimeObj.getHours() - 2);
            const newEndTime = formatTime(endTimeObj); 
            listItem.textContent = `${newStartTime} - ${newEndTime}`;
            modalReservationsList.appendChild(listItem);
          }
        })
      })
      .catch(error => {
        console.error('Error fetching reservations:', error);
        return []; 
      });

    modal.style.display = 'block';      // Show the modal

    closeModal.onclick = () => {        // close it on click,
      modal.style.display = 'none';
    };

    window.onclick = (event) => {     //or if clicked outside of modal.
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };
  };

  const fetchAndDisplayReservations = (startDate, endDate) => {

    const url = `/getReservationsRange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    fetch(url)
      .then(response => response.json())
      .then(reservations => {
        reservations.forEach(reservation => {
          if (reservation.ISACTIVE) {
            displayReservation(reservation);
          }
        });
      })
      .catch(error => console.error('Error:', error));
  };
  
  const { startDate, endDate } = getMonthStartEndDates(currentYear, currentMonth);
  fetchAndDisplayReservations(startDate, endDate);

  // Navigation Buttons
  document.getElementById("prev-month").onclick = () => {
    reservationCountPerDay = {};
    if (currentYear === 2023 && currentMonth === 10) {
      return; // Do not go back before November 2023
    }
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear -= 1;
    } else {
      currentMonth -= 1;
    }
    generateCalendar();

    const { startDate, endDate } = getMonthStartEndDates(currentYear, currentMonth);
    clearReservations();
    fetchAndDisplayReservations(startDate, endDate);
  };

  document.getElementById("next-month").onclick = () => {
    reservationCountPerDay = {};
    if (currentYear === 2100 && currentMonth === 10) {
      return; // Do not proceed past November 2100
    }
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear += 1;
    } else {
      currentMonth += 1;
    }
    generateCalendar();
    clearReservations();
    const { startDate, endDate } = getMonthStartEndDates(currentYear, currentMonth);
    fetchAndDisplayReservations(startDate, endDate);
  };

  const modal = document.getElementById("reservation-form-modal");
  document.getElementById("create-reservation-btn").onclick = () => {
    modal.style.display = "block";
  };

  document.getElementsByClassName("close")[0].onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  document.getElementById("reservation-form").onsubmit = (e) => {
    e.preventDefault();
    // Extract data from form:
    const roomSelect = document.getElementById("roomSelect");
    const roomValue = roomSelect.value;
    const roomColor = roomColorMap[roomValue]; 
    const dateValue = document.getElementById("date").value; 
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value; 
    // Convert dateValue into Date object
    const [day, month, year] = dateValue.split("/").map((num) => parseInt(num));

    const dayCells = document.querySelectorAll(
      "#calendar td[data-date='" + day + "']"
    );
    if (dayCells.length > 0) {
      const reservationDayCell = dayCells[0];
      // Create the reservation bar
      const reservationBar = document.createElement("div");
      reservationBar.classList.add("reservation-bar");
      reservationBar.style.backgroundColor = roomColor;
      const timeText = `${startTime}-${endTime}`;
      reservationBar.textContent = timeText;
      const width = timeText.length * 10;
      reservationBar.style.width = `${width}px`;
      reservationDayCell.appendChild(reservationBar);
    }
  };
};

function onReservationBarClick() {
  const existingPopup = document.querySelector('.popup');
  if (existingPopup) existingPopup.remove();

  // Create the popup
  const popup = document.createElement('div');
  popup.classList.add('popup');

  // Style it
  const rect = event.target.getBoundingClientRect();
  popup.style.width = `${rect.width * 2.5}px`;
  popup.style.height = "auto";
  popup.style.position = 'absolute';
  popup.style.top = `${window.scrollY + rect.top - rect.height * 5}px`;
  popup.style.padding = "5px";
  popup.style.left = `${rect.left}px`;
  popup.style.backgroundColor = '#a4b490';
  popup.style.border = '1px solid #000';
  popup.style.zIndex = '1000';
  popup.style.borderRadius = '10px';
  popup.textContent = 'Loading...';
  const reservationId = event.target.id;
  var details;
  var contact;
  var staff;
  var equipment;

  fetch('/getReservation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reservationId }),
  })
    .then(async response => {
      if (response.ok) {
        details = await response.json();
        //get staff:
        const staffCode = details[0].STAFFCODE;
        fetch('/getStaff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ staffCode })
        })
          .then(async response => {
            if (response.ok) {
              staff = await response.json();
            }
            if (!response.ok) {
              var errorText = await response.text();
              showError(errorText);
            }
          })
          .catch((err) => {
            console.log('Error', err);
          });

        //get contact details:
        const contactID = details[0].CONTACTID;
        fetch('/getContact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contactID })
        })
          .then(async response => {
            if (response.ok) {
              contact = await response.json();
            }
            if (!response.ok) {
              var errorText = await response.text();
              showError(errorText);
            }
          })
          .catch((err) => {
            console.log('Error', err);
          });

        //get equipment
        const equipmentCode = details[0].EQUIPMENTCODE;
        fetch('/getEquipment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ equipmentCode })
        })
          .then(async response => {
            if (response.ok) {
              equipment = await response.json();
              var stringHTML = 'Reservation details: <br>';
              stringHTML += 'Name: ' + contact[0].FIRST_NAME + ' ' + contact[0].LAST_NAME + '<br>';
              stringHTML += 'Phone: ' + contact[0].PHONE_NUMBER + '<br>';
              stringHTML += 'Room: ' + details[0].ROOMID + '<br>';
              if (details[0].EQUIPMENTCODE != null) {
                stringHTML += 'Equipment: ' + equipment[0].EQUIPMENT + '<br>';
              }
              if (details[0].STAFFCODE != null) {
                stringHTML += 'Staff: ' + staff[0].STAFF;
              }
              popup.innerHTML = stringHTML;
              const closeButton = document.createElement('span');
              closeButton.classList.add('close');
              closeButton.textContent = 'X';
              closeButton.addEventListener('click', function () {
                popup.remove();
                window.removeEventListener('click', removePopup);
              });
              popup.appendChild(closeButton);
              document.body.appendChild(popup);
              window.addEventListener('click', function removePopup(e) {
                if (e.target !== popup && e.target !== event.target) {
                  popup.remove();
                  window.removeEventListener('click', removePopup);
                }
              });
            }
            if (!response.ok) {
              var errorText = await response.text();
              showError(errorText);
            }

          })
          .catch((err) => {
            console.log('Error', err);
          });
      }

      if (!response.ok) {
        var errorText = await response.text();
        showError(errorText);
      }

    })
    .catch((err) => {
      console.log('Error', err);
    });

}