const seatContainer = document.getElementById("seatContainer");
const selectedSeatsText = document.getElementById("selectedSeats");
const totalText = document.getElementById("total");
const bookButton = document.getElementById("bookButton");

const seatPrice = 500;

// Already booked seats
const bookedSeats = [3, 7, 12, 18, 23, 27];

let selectedSeats = [];

// Create 30 seats
for (let i = 1; i <= 30; i++) {

    // Add aisle after every 2 seats
    if ((i - 1) % 4 === 2) {
        const aisle = document.createElement("div");
        aisle.classList.add("aisle");
        seatContainer.appendChild(aisle);
    }

    const seat = document.createElement("div");

    seat.classList.add("seat");
    seat.textContent = i;

    if (bookedSeats.includes(i)) {
        seat.classList.add("booked");
    }

    seat.addEventListener("click", () => {

        if (seat.classList.contains("booked")) {
            return;
        }

        if (selectedSeats.includes(i)) {

            // Remove selection
            selectedSeats = selectedSeats.filter(
                seatNumber => seatNumber !== i
            );

            seat.classList.remove("selected");

        } else {

            // Add selection
            selectedSeats.push(i);

            seat.classList.add("selected");
        }

        updateBooking();
    });

    seatContainer.appendChild(seat);
}


function updateBooking() {

    selectedSeats.sort((a, b) => a - b);

    if (selectedSeats.length === 0) {
        selectedSeatsText.textContent = "None";
    } else {
        selectedSeatsText.textContent =
            selectedSeats.map(seat => "S" + seat).join(", ");
    }

    const total = selectedSeats.length * seatPrice;

    totalText.textContent = "₹" + total;
}


bookButton.addEventListener("click", () => {

    if (selectedSeats.length === 0) {
        alert("Please select at least one seat.");
        return;
    }

    const seats = selectedSeats
        .map(seat => "S" + seat)
        .join(", ");

    alert(
        "Booking Summary\n\n" +
        "Seats: " + seats + "\n" +
        "Total: ₹" + (selectedSeats.length * seatPrice)
    );
});
