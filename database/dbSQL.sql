-- dbSQL.sql - Queries based on relational algebra (Step 7)
-- This script contains SQL queries using joins, aggregation, and subqueries.

-- Query 1: Retrieve all bookings that were later canceled
-- This query joins the BOOKING and CANCELLATION tables to find all canceled bookings.
SELECT B.BookID, B.GusID, B.Check_in, B.Check_out
FROM BOOKING B
JOIN CANCELLATION C ON B.BookID = C.BookID;

-- Query 2: Find the total amount paid by each guest
-- This query groups by GusID and sums the payment amounts, ordering by total paid in descending order.
SELECT GusID, SUM(Pd_amt) AS TotalPaid
FROM PAYMENT
GROUP BY GusID
HAVING SUM(Pd_amt) > 500
ORDER BY TotalPaid DESC;

-- Query 3: Get the total revenue generated from all bookings
-- This query sums the total price from the INVOICE table.
SELECT SUM(total_price) AS TotalRevenue
FROM INVOICE;


-- Query 4: Find all guests who have booked a Deluxe room
-- This query joins ROOM and BOOKING and filters results where Deluxe_flag is set to 1.
SELECT DISTINCT B.GusID
FROM BOOKING B
JOIN ROOM R ON B.Room_no = R.Room_no
WHERE R.Deluxe_flag = 'Y';


-- Query 5: Find guests who have paid more than the average payment amount
-- This query uses a subquery to compare guest payments against the average payment amount.
SELECT GusID, SUM(Pd_amt) AS TotalPaid
FROM PAYMENT
GROUP BY GusID
HAVING SUM(Pd_amt) > (SELECT AVG(Pd_amt) FROM PAYMENT);


-- Query 6: Are there any available rooms for the weekend?
-- Select rooms that do not have overlapping bookings for the weekend.
SELECT ROOM_NO
FROM ROOM
WHERE ROOM_NO NOT IN (
    SELECT ROOM_NO FROM BOOKING
    WHERE Check_In > '2025-02-14' AND Check_Out < '2025-02-17'
);



-- Query 7: Is it possible to switch to a standard room?
-- Lists available suites not booked.
SELECT Room_No 
FROM ROOM
WHERE Descriptions = 'Standard' AND Room_No NOT IN (
    SELECT Room_No FROM BOOKING
);


-- Query 8: Show the profit and occupancy rate in the past month.
-- Aggregates total revenue and occupancy.
SELECT SUM(Total_Price) AS TotalRevenue, 
       COUNT(DISTINCT Room_No) / COUNT(*) AS OccupancyRate
FROM BOOKING
WHERE Check_In >= '2025-02-01' AND Check_Out <= '2025-02-28';

