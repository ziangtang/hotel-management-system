-- Example SQL queries for Hotel Management System

-- 1. Find all available rooms in a specific hotel
SELECT r.id, r.room_number, r.type, r.price, r.capacity
FROM Room r
WHERE r.hotel_id = 1 AND r.status = 'Available'
ORDER BY r.price;

-- 2. Find all reservations for a specific customer
SELECT r.id, h.name as hotel_name, rm.room_number, r.check_in_date, r.check_out_date, r.status
FROM Reservation r
JOIN Room rm ON r.room_id = rm.id
JOIN Hotel h ON rm.hotel_id = h.id
WHERE r.customer_id = 2
ORDER BY r.check_in_date;

-- 3. Get occupancy rate for each hotel
SELECT 
    h.id,
    h.name,
    COUNT(r.id) as total_rooms,
    SUM(CASE WHEN r.status = 'Occupied' THEN 1 ELSE 0 END) as occupied_rooms,
    (SUM(CASE WHEN r.status = 'Occupied' THEN 1 ELSE 0 END) / COUNT(r.id)) * 100 as occupancy_rate
FROM Hotel h
JOIN Room r ON h.id = r.hotel_id
GROUP BY h.id, h.name
ORDER BY occupancy_rate DESC;

-- 4. Find all reservations for a specific date range
SELECT 
    r.id,
    c.first_name,
    c.last_name,
    h.name as hotel_name,
    rm.room_number,
    r.check_in_date,
    r.check_out_date,
    r.status
FROM Reservation r
JOIN Customer c ON r.customer_id = c.id
JOIN Room rm ON r.room_id = rm.id
JOIN Hotel h ON rm.hotel_id = h.id
WHERE 
    (r.check_in_date BETWEEN '2023-11-01' AND '2023-11-15') OR
    (r.check_out_date BETWEEN '2023-11-01' AND '2023-11-15') OR
    (r.check_in_date <= '2023-11-01' AND r.check_out_date >= '2023-11-15')
ORDER BY r.check_in_date;

-- 5. Calculate revenue by hotel
SELECT 
    h.id,
    h.name,
    SUM(i.amount) as total_revenue
FROM Hotel h
JOIN Room rm ON h.id = rm.hotel_id
JOIN Reservation r ON rm.id = r.room_id
JOIN Invoice i ON r.id = i.reservation_id
WHERE i.status = 'Paid'
GROUP BY h.id, h.name
ORDER BY total_revenue DESC;

-- 6. Find customers who have made multiple reservations
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    COUNT(r.id) as reservation_count
FROM Customer c
JOIN Reservation r ON c.id = r.customer_id
GROUP BY c.id, c.first_name, c.last_name, c.email
HAVING COUNT(r.id) > 1
ORDER BY reservation_count DESC;

-- 7. Find rooms that need maintenance
SELECT 
    h.name as hotel_name,
    r.room_number,
    r.type,
    r.status
FROM Room r
JOIN Hotel h ON r.hotel_id = h.id
WHERE r.status = 'Maintenance'
ORDER BY h.name, r.room_number;

-- 8. Calculate average length of stay
SELECT 
    AVG(DATEDIFF(r.check_out_date, r.check_in_date)) as avg_stay_length
FROM Reservation r
WHERE r.status IN ('Confirmed', 'Checked In', 'Checked Out');

-- 9. Find unpaid invoices
SELECT 
    i.id as invoice_id,
    c.first_name,
    c.last_name,
    h.name as hotel_name,
    rm.room_number,
    i.amount,
    i.issue_date,
    i.due_date
FROM Invoice i
JOIN Reservation r ON i.reservation_id = r.id
JOIN Customer c ON r.customer_id = c.id
JOIN Room rm ON r.room_id = rm.id
JOIN Hotel h ON rm.hotel_id = h.id
WHERE i.status = 'Unpaid' AND i.due_date < CURDATE()
ORDER BY i.due_date;

-- 10. Get room type distribution by hotel
SELECT 
    h.name as hotel_name,
    r.type as room_type,
    COUNT(*) as room_count
FROM Hotel h
JOIN Room r ON h.id = r.hotel_id
GROUP BY h.name, r.type
ORDER BY h.name, room_count DESC;