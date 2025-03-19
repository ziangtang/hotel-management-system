-- Insert data into Hotel table
INSERT INTO Hotel (name, address, city, state, country, phone, email, rating, description) VALUES
('Grand Hotel', '123 Main St', 'Boston', 'MA', 'USA', '555-111-2222', 'info@grandhotel.com', 4.5, 'Luxury hotel in downtown Boston'),
('Luxury Resort', '456 Ocean Ave', 'Miami', 'FL', 'USA', '555-333-4444', 'info@luxuryresort.com', 5.0, 'Beachfront resort with full amenities'),
('City Center Hotel', '789 Downtown Blvd', 'New York', 'NY', 'USA', '555-555-6666', 'info@citycenterhotel.com', 4.2, 'Modern hotel in the heart of Manhattan'),
('Mountain View Lodge', '101 Alpine Way', 'Denver', 'CO', 'USA', '555-777-8888', 'info@mountainviewlodge.com', 4.7, 'Scenic lodge with mountain views'),
('Seaside Inn', '202 Beach Dr', 'San Diego', 'CA', 'USA', '555-999-0000', 'info@seasideinn.com', 4.0, 'Cozy inn near the beach');

-- Insert data into Room table
INSERT INTO Room (hotel_id, room_number, type, price, capacity, status, description) VALUES
(1, '101', 'Standard', 120.00, 2, 'Available', 'Standard room with queen bed'),
(1, '102', 'Deluxe', 180.00, 2, 'Available', 'Deluxe room with king bed and city view'),
(1, '103', 'Suite', 250.00, 4, 'Available', 'Suite with separate living area'),
(2, '201', 'Standard', 150.00, 2, 'Available', 'Standard room with ocean view'),
(2, '202', 'Deluxe', 220.00, 3, 'Available', 'Deluxe room with balcony'),
(2, '203', 'Suite', 350.00, 4, 'Available', 'Luxury suite with ocean view'),
(3, '301', 'Standard', 140.00, 2, 'Available', 'Standard room in downtown'),
(3, '302', 'Deluxe', 200.00, 2, 'Available', 'Deluxe room with city view'),
(3, '303', 'Suite', 280.00, 4, 'Available', 'Suite with living room and kitchen'),
(4, '401', 'Standard', 130.00, 2, 'Available', 'Standard room with mountain view'),
(4, '402', 'Deluxe', 190.00, 3, 'Available', 'Deluxe room with balcony'),
(4, '403', 'Suite', 270.00, 4, 'Available', 'Suite with fireplace'),
(5, '501', 'Standard', 110.00, 2, 'Available', 'Standard room near the beach'),
(5, '502', 'Deluxe', 170.00, 2, 'Available', 'Deluxe room with partial ocean view'),
(5, '503', 'Suite', 240.00, 4, 'Available', 'Suite with full kitchen');

-- Insert data into Customer table
INSERT INTO Customer (first_name, last_name, email, phone, address) VALUES
('Maria', 'Garcia', 'maria.garcia@email.com', '702-123-4567', '123 Sunset Blvd, Las Vegas, NV'),
('David', 'Brown', 'david.brown@email.com', '305-987-6543', '456 Ocean Drive, Miami, FL'),
('Kevin', 'Lee', 'kevin.lee@email.com', '213-567-8901', '789 Hollywood Blvd, Los Angeles, CA'),
('Emma', 'Johnson', 'emma.johnson@email.com', '646-345-6789', '101 5th Avenue, Manhattan, NY'),
('Sophia', 'Williams', 'sophia.williams@email.com', '312-876-5432', '202 Lake Shore Dr, Chicago, IL'),
('James', 'Davis', 'james.davis@email.com', '206-345-9876', '303 Pike Street, Seattle, WA'),
('Luis', 'Martinez', 'luis.martinez@email.com', '214-678-2345', '404 Main Street, Dallas, TX'),
('John', 'Taylor', 'john.taylor@email.com', '720-456-7890', '505 Union Street, Denver, CO'),
('Sarah', 'White', 'sarah.white@email.com', '602-345-1234', '606 Desert Road, Phoenix, AZ'),
('Robert', 'Clark', 'robert.clark@email.com', '704-876-4321', '707 King Street, Charlotte, NC');

-- Insert data into Reservation table (assuming you have customers and rooms already inserted)
INSERT INTO Reservation (customer_id, room_id, check_in_date, check_out_date, status) VALUES
(1, 1, '2023-12-10', '2023-12-15', 'Confirmed'),
(2, 4, '2023-12-12', '2023-12-14', 'Confirmed'),
(3, 7, '2023-12-15', '2023-12-20', 'Confirmed'),
(4, 10, '2023-12-18', '2023-12-22', 'Confirmed'),
(5, 13, '2023-12-20', '2023-12-25', 'Confirmed');