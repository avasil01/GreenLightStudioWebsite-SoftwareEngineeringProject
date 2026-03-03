document.addEventListener("DOMContentLoaded", function () {
    var reservationBoxes = document.querySelectorAll('.reservation-bar');
    try {
        reservationBoxes.forEach(function (box) {
            box.addEventListener('click', onReservationBoxClick);
        });
    }
    catch (err) {
        console.log(err);
    }
});

function onReservationBarClick() {
    console.log("Reservation box clicked!");
}