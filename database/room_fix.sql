-- Clear existing room data
DELETE FROM ROOM;

-- Insert data with the correct column specification
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