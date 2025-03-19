-- Sample data for Hotel Management System

-- Insert Customers
INSERT INTO Customer (first_name, last_name, email, phone, address) VALUES
('John', 'Doe', 'john@example.com', '555-123-4567', '123 Main St, Boston, MA'),
('Jane', 'Smith', 'jane@example.com', '555-987-6543', '456 Oak Ave, New York, NY'),
('Robert', 'Johnson', 'robert@example.com', '555-456-7890', '789 Pine St, Chicago, IL'),
('Emily', 'Williams', 'emily@example.com', '555-789-0123', '321 Elm St, San Francisco, CA'),
('Michael', 'Brown', 'michael@example.com', '555-234-5678', '654 Maple Ave, Miami, FL');

-- Insert Hotels
INSERT INTO Hotel (name, address, city, state, country, phone, email, rating, description) VALUES
('Grand Hotel', '123 Main St', 'Boston', 'MA', 'USA', '555-111-2222', 'info@grandhotel.com', 4.5, 'Luxury hotel in downtown Boston'),
('Luxury Resort', '456 Ocean Ave', 'Miami', 'FL', 'USA', '555-333-4444', 'info@luxuryresort.com', 5.0, 'Beachfront resort with full amenities'),
('City Center Hotel', '789 Downtown Blvd', 'New York', 'NY', 'USA', '555-555-6666', 'info@citycenterhotel.com', 4.2, 'Modern hotel in the heart of Manhattan'),
('Mountain View Lodge', '101 Alpine Way', 'Denver', 'CO', 'USA', '555-777-8888', 'info@mountainviewlodge.com', 4.7, 'Scenic lodge with mountain views'),
('Seaside Inn', '202 Beach Dr', 'San Diego', 'CA', 'USA', '555-999-0000', 'info@seasideinn.com', 4.0, 'Cozy inn near the beach');

-- Insert Rooms
-- Grand Hotel (id: 1)
INSERT INTO Room (hotel_id, room_number, type, price, capacity, status, description) VALUES
(1, '101', 'Standard', 120.00, 2, 'Available', 'Standard room with queen bed'),
(1, '102', 'Standard', 120.00, 2, 'Available', 'Standard room with queen bed'),
(1, '201', 'Deluxe', 180.00, 3, 'Available', 'Deluxe room with king bed and sofa'),
(1, '202', 'Deluxe', 180.00, 3, 'Maintenance', 'Deluxe room with king bed and sofa'),
(1, '301', 'Suite', 250.00, 4, 'Available', 'Suite with separate living area');

-- Luxury Resort (id: 2)
INSERT INTO Room (hotel_id, room_number, type, price, capacity, status, description) VALUES
(2, '101', 'Standard', 150.00, 2, 'Available', 'Standard room with ocean view'),
(2, '102', 'Standard', 150.00, 2, 'Occupied', 'Standard room with ocean view'),
(2, '201', 'Deluxe', 220.00, 3, 'Available', 'Deluxe room with balcony and ocean view'),
(2, '202', 'Deluxe', 220.00, 3, 'Available', 'Deluxe room with balcony and ocean view'),
(2, '301', 'Suite', 350.00, 4, 'Occupied', 'Luxury suite with private terrace');

-- City Center Hotel (id: 3)
INSERT INTO Room (hotel_id, room_number, type, price, capacity, status, description) VALUES
(3, '101', 'Standard', 140.00, 2, 'Available', 'Standard room with city view'),
(3, '102', 'Standard', 140.00, 2, 'Available', 'Standard room with city view'),
(3, '201', 'Deluxe', 200.00, 3, 'Occupied', 'Deluxe room with premium city view'),
(3, '202', 'Deluxe', 200.00, 3, 'Available', 'Deluxe room with premium city view'),
(3, '301', 'Suite', 300.00, 4, 'Available', 'Executive suite with living room');

-- Mountain View Lodge (id: 4)
INSERT INTO Room (hotel_id, room_number, type, price, capacity, status, description) VALUES
(4, '101', 'Standard', 130.00, 2, 'Available', 'Standard room with mountain view'),
(4, '102', 'Standard', 130.00, 2, 'Maintenance', 'Standard room with mountain view'),
(4, '201', 'Deluxe', 190.00, 3, 'Available', 'Deluxe room with fireplace'),
(4, '202', 'Deluxe', 190.00, 3, 'Available', 'Deluxe room with fireplace'),
(4, '301', 'Suite', 280.00, 4, 'Occupied', 'Family suite with kitchen');

-- Seaside Inn (id: 5)
INSERT INTO Room (hotel_id, room_number, type, price, capacity, status, description) VALUES
(5, '101', 'Standard', 110.00, 2, 'Available', 'Standard room with garden view'),
(5, '102', 'Standard', 110.00, 2, 'Available', 'Standard room with garden view'),
(5, '201', 'Deluxe', 170.00, 3, 'Available', 'Deluxe room with partial ocean view'),
(5, '202', 'Deluxe', 170.00, 3, 'Occupied', 'Deluxe room with partial ocean view'),
(5, '301', 'Suite', 240.00, 4, 'Available', 'Beach suite with full ocean view');

-- Insert Reservations
INSERT INTO Reservation (customer_id, room_id, check_in_date, check_out_date, status) VALUES
(1, 2, '2023-11-01', '2023-11-05', 'Confirmed'),
(2, 7, '2023-11-03', '2023-11-10', 'Checked In'),
(3, 13, '2023-11-05', '2023-11-07', 'Confirmed'),
(4, 20, '2023-11-10', '2023-11-15', 'Confirmed'),
(5, 24, '2023-11-12', '2023-11-14', 'Confirmed');

-- Insert Invoices
INSERT INTO Invoice (reservation_id, amount, issue_date, due_date, status) VALUES
(1, 480.00, '2023-10-25', '2023-11-01', 'Paid'),
(2, 1540.00, '2023-10-27', '2023-11-03', 'Paid'),
(3, 400.00, '2023-10-30', '2023-11-05', 'Unpaid'),
(4, 1400.00, '2023-11-01', '2023-11-10', 'Unpaid'),
(5, 340.00, '2023-11-05', '2023-11-12', 'Unpaid');

-- Insert Payments
INSERT INTO Payment (invoice_id, amount, payment_date, payment_method, transaction_id) VALUES
(1, 480.00, '2023-10-26', 'Credit Card', 'TXN123456'),
(2, 1540.00, '2023-10-28', 'Credit Card', 'TXN789012');