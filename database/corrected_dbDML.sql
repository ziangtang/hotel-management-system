INSERT INTO BOOKING VALUES 
(100001, 000001, 720.00, '2024-05-10', '2024-05-15', '2024-04-01', 520, 'NV', 'Las Vegas', 'Sunset Blvd'),
(100002, 000002, 360.50, '2024-06-12', '2024-06-14', '2024-05-20', 610, 'FL', 'Miami', 'Ocean Drive'),
(100003, 000003, 815.75, '2024-07-05', '2024-07-10', '2024-06-01', 715, 'CA', 'Los Angeles', 'Hollywood Blvd'),
(100004, 000004, 450.00, '2024-08-01', '2024-08-05', '2024-07-10', 820, 'NY', 'Manhattan', '5th Avenue'),
(100005, 000005, 999.99, '2024-09-12', '2024-09-20', '2024-08-01', 910, 'IL', 'Chicago', 'Lake Shore Dr'),
(100006, 000006, 299.99, '2024-10-15', '2024-10-18', '2024-09-10', 1025, 'WA', 'Seattle', 'Pike Street'),
(100007, 000007, 600.00, '2024-11-05', '2024-11-10', '2024-10-20', 1130, 'TX', 'Dallas', 'Main Street'),
(100008, 000008, 540.00, '2024-04-18', '2024-04-20', '2024-03-10', 1140, 'CO', 'Denver', 'Union Street'),
(100009, 000009, 820.50, '2024-07-22', '2024-07-26', '2024-06-15', 1150, 'AZ', 'Phoenix', 'Desert Road'),
(100010, 000010, 400.00, '2024-08-05', '2024-08-10', '2024-07-05', 1160, 'NC', 'Charlotte', 'King Street'),
(100011, 000011, 690.00, '2024-09-25', '2024-09-28', '2024-08-15', 1170, 'OR', 'Portland', 'Main Ave'),
(100012, 000012, 750.00, '2024-10-12', '2024-10-15', '2024-09-22', 1180, 'TN', 'Nashville', 'Broadway'),
(100013, 000013, 680.00, '2024-03-05', '2024-03-10', '2024-02-20', 1190, 'MO', 'St. Louis', 'Market Street'),
(100014, 000014, 570.00, '2024-06-30', '2024-07-05', '2024-06-10', 1200, 'GA', 'Atlanta', 'Peach Street');

INSERT INTO GUEST VALUES 
(000001, 'Garcia', 'Maria', '(702)123-4567', 'maria.garcia@email.com', 'Sunset Blvd'),
(000002, 'Brown', 'David', '(305)987-6543', 'david.brown@email.com', 'Ocean Drive'),
(000003, 'Lee', 'Kevin', '(213)567-8901', 'kevin.lee@email.com', 'Hollywood Blvd'),
(000004, 'Johnson', 'Emma', '(646)345-6789', 'emma.johnson@email.com', '5th Avenue'),
(000005, 'Williams', 'Sophia', '(312)876-5432', 'sophia.williams@email.com', 'Lake Shore Dr'),
(000006, 'Davis', 'James', '(206)345-9876', 'james.davis@email.com', 'Pike Street'),
(000007, 'Martinez', 'Luis', '(214)678-2345', 'luis.martinez@email.com', 'Main Street'),
(000008, 'Taylor', 'John', '(720)456-7890', 'john.taylor@email.com', 'Union Street'),
(000009, 'White', 'Sarah', '(602)345-1234', 'sarah.white@email.com', 'Desert Road'),
(000010, 'Clark', 'Robert', '(704)876-4321', 'robert.clark@email.com', 'King Street'),
(000011, 'Hall', 'Emily', '(503)678-9876', 'emily.hall@email.com', 'Main Ave'),
(000012, 'Hernandez', 'Daniel', '(615)789-6543', 'daniel.hernandez@email.com', 'Broadway'),
(000013, 'Young', 'Jessica', '(314)567-3456', 'jessica.young@email.com', 'Market Street'),
(000014, 'Adams', 'Michael', '(404)234-5678', 'michael.adams@email.com', 'Peach Street');

INSERT INTO PAYMENT VALUES 
(5671, 100001, 000001, 720.00, 0.00, 'cash', 1),
(5672, 100003, 000003, 400.00, 415.75, 'debit card', 0),
(5673, 100005, 000005, 500.00, 499.99, 'credit card', 0),
(5674, 100007, 000007, 600.00, 0.00, 'credit card', 1),
(5675, 100009, 000009, 820.50, 0.00, 'debit card', 1),
(5676, 100011, 000011, 690.00, 0.00, 'cash', 1),
(5677, 100013, 000013, 680.00, 0.00, 'PayPal', 1);

INSERT INTO CANCELLATION VALUES 
('C0001', 100002, 000002, 360.50, '2024-05-25'),
('C0002', 100004, 000004, 450.00, '2024-07-15'),
('C0003', 100006, 000006, 299.99, '2024-09-12'),
('C0004', 100008, 000008, 540.00, '2024-04-15'),
('C0005', 100010, 000010, 400.00, '2024-07-30'),
('C0006', 100012, 000012, 750.00, '2024-10-08'),
('C0007', 100014, 000014, 570.00, '2024-06-25');

INSERT INTO INVOICE VALUES 
('IN0001', 100001, 000001, 720.00),
('IN0002', 100003, 000003, 815.75),
('IN0003', 100005, 000005, 999.99),
('IN0004', 100007, 000007, 600.00),
('IN0005', 100009, 000009, 820.50),
('IN0006', 100011, 000011, 690.00),
('IN0007', 100013, 000013, 680.00);

INSERT INTO INVOICE1 VALUES 
(100001, '2024-04-01'),
(100003, '2024-06-01'),
(100005, '2024-08-01'),
(100007, '2024-10-20'),
(100009, '2024-06-15'),
(100011, '2024-08-15'),
(100013, '2024-02-20');

INSERT INTO REVIEW VALUES 
('R0001', 000001, 4, 'Nice hotel, but a bit noisy.', '2024-05-16'),
('R0002', 000003, 5, 'Amazing experience, will come again!', '2024-07-12'),
('R0003', 000005, 3, 'Average service, expected better.', '2024-09-25'),
('R0004', 000007, 4, 'Great location and friendly staff.', '2024-11-12'),
('R0005', 000009, 5, 'Best vacation ever, highly recommend!', '2024-07-28'),
('R0006', 000011, 2, 'Room was small and not very clean.', '2024-09-30'),
('R0007', 000013, 4, 'Good value for money.', '2024-03-12');

-- ROOM table insert corrected with price_per_night field
INSERT INTO ROOM (Room_no, BookID, Descriptions, Capacity, Square_ft, Deluxe_flag, Kitchen, Superior_flag, Balcony, Standard_flag, Amentities, Ocean_view_flag, Ocean, Cityview_flag, City, Mtview_flag, Mountain, price_per_night) VALUES 
(520, 100001, 'King', 4, 400, 'Y', 'Full kitchen', 'Y', 'Large balcony', 'N', 'Wi-Fi, TV', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 120.00),
(610, 100002, 'Queen', 2, 250, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'TV, Mini fridge', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 90.00),
(715, 100003, 'Standard', 4, 500, 'Y', 'Full kitchen', 'N', 'Large balcony', 'Y', 'Wi-Fi, Microwave', 'Y', 'Ocean', 'N', 'No city', 'N', 'No mountain', 150.00),
(820, 100004, 'Standard', 6, 600, 'Y', 'Full kitchen', 'Y', 'Huge balcony', 'N', 'Wi-Fi, Jacuzzi', 'Y', 'Ocean', 'Y', 'City', 'N', 'No mountain', 200.00),
(910, 100005, 'Queen', 2, 300, 'N', 'No kitchen', 'N', 'Small balcony', 'Y', 'TV, Wi-Fi', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 110.00),
(1025, 100006, 'Standard', 2, 200, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'TV, Wi-Fi', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 85.00),
(1130, 100007, 'King', 4, 450, 'Y', 'Full kitchen', 'Y', 'Large balcony', 'N', 'Wi-Fi, Mini Bar', 'Y', 'Ocean', 'Y', 'City', 'N', 'No mountain', 180.00),
(1140, 100008, 'King', 1, 150, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 75.00),
(1150, 100009, 'Queen', 2, 280, 'N', 'No kitchen', 'Y', 'Small balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 95.00),
(1160, 100010, 'Standard', 3, 350, 'Y', 'Full kitchen', 'N', 'Large balcony', 'Y', 'Wi-Fi, Office setup', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 130.00),
(1170, 100011, 'Standard', 6, 750, 'Y', 'Full kitchen', 'Y', 'Massive balcony', 'N', 'Wi-Fi, Jacuzzi, Private Bar', 'Y', 'Ocean', 'Y', 'City', 'Y', 'Mountain', 250.00),
(1180, 100012, 'King', 2, 220, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 80.00),
(1190, 100013, 'King', 5, 500, 'Y', 'Full kitchen', 'Y', 'Large balcony', 'N', 'Wi-Fi, Mini Bar, Home Theater', 'Y', 'Ocean', 'Y', 'City', 'N', 'No mountain', 190.00),
(1200, 100014, 'Queen', 3, 320, 'Y', 'Small kitchen', 'N', 'Small balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 120.00); 