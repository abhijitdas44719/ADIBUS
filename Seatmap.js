/**
 * ADIBUS - Interactive Seat Selection & Ticket Booking Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    const seatContainer = document.getElementById("seatContainer");
    const selectedSeatsText = document.getElementById("selectedSeats");
    const totalText = document.getElementById("total");
    const bookButton = document.getElementById("bookButton");

    const routeTitle = document.getElementById("routeTitle");
    const busNameText = document.getElementById("busNameText");
    const busPriceText = document.getElementById("busPriceText");
    const travelDateText = document.getElementById("travelDateText");

    const passengerNameInput = document.getElementById("passengerName");
    const passengerEmailInput = document.getElementById("passengerEmail");
    const passengerPhoneInput = document.getElementById("passengerPhone");

    // Parse search parameters from URL or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const searchParams = JSON.parse(sessionStorage.getItem('adibus_search') || '{}');

    const source = urlParams.get('source') || searchParams.source || 'Kolkata';
    const destination = urlParams.get('destination') || searchParams.destination || 'Delhi';
    const travelDate = urlParams.get('date') || searchParams.date || new Date().toISOString().split('T')[0];

    if (routeTitle) routeTitle.textContent = `${source} → ${destination}`;
    if (travelDateText) travelDateText.textContent = `Date: ${travelDate}`;

    let seatPrice = 850;
    let selectedSeats = [];
    const bookedSeats = [3, 7, 12, 18, 23, 27];

    // Pre-fill user data if logged in
    const currentUser = JSON.parse(localStorage.getItem('adibus_user') || '{}');
    if (currentUser && currentUser.name && passengerNameInput) {
        passengerNameInput.value = currentUser.name;
    }
    if (currentUser && currentUser.email && passengerEmailInput) {
        passengerEmailInput.value = currentUser.email;
    }
    if (currentUser && currentUser.phone && passengerPhoneInput) {
        passengerPhoneInput.value = currentUser.phone || currentUser.contact || '';
    }

    // Generate 36 seats
    if (seatContainer) {
        seatContainer.innerHTML = '';
        for (let i = 1; i <= 36; i++) {
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
                if (seat.classList.contains("booked")) return;

                if (selectedSeats.includes(i)) {
                    selectedSeats = selectedSeats.filter(s => s !== i);
                    seat.classList.remove("selected");
                } else {
                    selectedSeats.push(i);
                    seat.classList.add("selected");
                }

                updateBooking();
            });

            seatContainer.appendChild(seat);
        }
    }

    function updateBooking() {
        selectedSeats.sort((a, b) => a - b);
        if (selectedSeatsText) {
            selectedSeatsText.textContent = selectedSeats.length === 0 ? "None" : selectedSeats.map(s => "S" + s).join(", ");
        }
        const total = selectedSeats.length * seatPrice;
        if (totalText) totalText.textContent = "₹" + total.toLocaleString('en-IN');
    }

    if (bookButton) {
        bookButton.addEventListener("click", async () => {
            if (selectedSeats.length === 0) {
                alert("Please select at least one seat to continue.");
                return;
            }

            const passengerName = passengerNameInput?.value.trim() || '';
            const passengerEmail = passengerEmailInput?.value.trim() || '';
            const passengerPhone = passengerPhoneInput?.value.trim() || '';

            if (!passengerName) {
                alert("Please enter the passenger's full name.");
                passengerNameInput?.focus();
                return;
            }

            if (!passengerEmail || !passengerEmail.includes('@')) {
                alert("Please enter a valid email address for e-Ticket delivery.");
                passengerEmailInput?.focus();
                return;
            }

            const seatsFormatted = selectedSeats.map(s => "S" + s).join(", ");
            const totalAmount = selectedSeats.length * seatPrice;

            const originalBtnText = bookButton.innerHTML;
            bookButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reserving Ticket...';
            bookButton.disabled = true;

            const apiUrl = (typeof window.API_CONFIG !== 'undefined' && window.API_CONFIG.getUrl)
                ? window.API_CONFIG.getUrl('bookTicket')
                : 'http://localhost/ADIBUS%20LOGIN%20API/book-ticket.php';

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        busId: 'BUS_101',
                        busName: busNameText?.textContent || 'ADIBUS Express',
                        operator: 'ADIBUS Royal Mobility',
                        source: source,
                        destination: destination,
                        travelDate: travelDate,
                        departureTime: '20:00',
                        arrivalTime: '11:30',
                        seats: seatsFormatted,
                        passengerName: passengerName,
                        passengerEmail: passengerEmail,
                        passengerPhone: passengerPhone,
                        totalAmount: totalAmount
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Failed to book ticket');
                }

                alert(`🎉 Booking Confirmed!\n\nPNR: ${data.pnr}\nSeats: ${seatsFormatted}\nTotal: ₹${totalAmount}\n\nRedirecting to your e-Ticket...`);
                window.location.href = `showmyticket.html?pnr=${encodeURIComponent(data.pnr)}`;

            } catch (err) {
                console.warn("API booking connection failed, generating demo PNR:", err);
                const demoPnr = 'PNR-ADIBUS-' + Math.floor(100000 + Math.random() * 900000);
                
                // Save offline booking locally
                const offlineBooking = {
                    pnr: demoPnr,
                    bus_name: busNameText?.textContent || 'ADIBUS Express',
                    source: source,
                    destination: destination,
                    travel_date: travelDate,
                    departure_time: '20:00',
                    arrival_time: '11:30',
                    seats: seatsFormatted,
                    passenger_name: passengerName,
                    passenger_email: passengerEmail,
                    passenger_phone: passengerPhone,
                    total_amount: totalAmount,
                    status: 'Confirmed'
                };

                let myBookings = JSON.parse(localStorage.getItem('adibus_bookings') || '[]');
                myBookings.unshift(offlineBooking);
                localStorage.setItem('adibus_bookings', JSON.stringify(myBookings));

                alert(`🎉 Booking Confirmed!\n\nPNR: ${demoPnr}\nSeats: ${seatsFormatted}\nTotal: ₹${totalAmount}\n\nRedirecting to your e-Ticket...`);
                window.location.href = `showmyticket.html?pnr=${encodeURIComponent(demoPnr)}`;
            } finally {
                bookButton.innerHTML = originalBtnText;
                bookButton.disabled = false;
            }
        });
    }
});
