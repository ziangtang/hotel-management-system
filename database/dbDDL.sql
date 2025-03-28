-- Drop existing objects first to avoid conflicts
DROP TRIGGER IF EXISTS UPDATE_ROOM_ON_CANCELLATION;
DROP FUNCTION IF EXISTS STAY_LEN;
DROP VIEW IF EXISTS PENDING_PMT;
DROP TABLE IF EXISTS ROOM;
DROP TABLE IF EXISTS REVIEW;
DROP TABLE IF EXISTS INVOICE1;
DROP TABLE IF EXISTS INVOICE;
DROP TABLE IF EXISTS CANCELLATION;
DROP TABLE IF EXISTS PAYMENT;
DROP TABLE IF EXISTS GUEST;
DROP TABLE IF EXISTS BOOKING;

-- Create tables
CREATE TABLE BOOKING (
    BookID INT(6) NOT NULL,
    GusID INT(6) NOT NULL,
    Total_Price DECIMAL(5, 2) NOT NULL,
    Check_in DATE,
    Check_out DATE,
    Book_date DATE,
    Room_no INT(4),
    State VARCHAR(2),
    City VARCHAR(15),
    Street VARCHAR(15),
    PRIMARY KEY (BookID)
);

CREATE TABLE GUEST (
    GusID INT(6) NOT NULL,
    Lname VARCHAR(11) NOT NULL,
    Fname VARCHAR(11),
    Phone VARCHAR(15),
    Email VARCHAR(30),
    Address VARCHAR(15),
    PRIMARY KEY(GusID)
);

CREATE TABLE PAYMENT (
    PayID INT(6) NOT NULL,
    BookID INT(6),
    GusID INT(6) NOT NULL,
    Pd_amt DECIMAL,
    Remain_bal DECIMAL(10,2),
    Method VARCHAR(12),
    Fully_pd BIT(1),
    PRIMARY KEY(PayID)
);

CREATE TABLE CANCELLATION (
    CanID VARCHAR(6) NOT NULL,
    BookID INT(6) NOT NULL,
    GusID INT(6) NOT NULL,
    Refund_amt DECIMAL,
    Can_date DATE,
    PRIMARY KEY(CanID)
);

CREATE TABLE INVOICE (
    Invoi_no VARCHAR(6) NOT NULL,
    BookID INT(6),
    GusID INT(6) NOT NULL,
    Total_Price DECIMAL(5, 2) NOT NULL,
    PRIMARY KEY(Invoi_no)
);

CREATE TABLE INVOICE1 (
    BookID INT(6),
    Book_date DATE,
    PRIMARY KEY(BookID)
);

CREATE TABLE REVIEW (
    RevID VARCHAR(6) NOT NULL,
    GusID INT(6),
    Rating INT(1),
    Comments VARCHAR(100),
    Rev_date DATE,
    PRIMARY KEY (RevID)
);

CREATE TABLE ROOM (
    Room_no INT(4) NOT NULL,
    BookID INT(6),
    Descriptions VARCHAR(100),
    Capacity INT(2),
    Square_ft INT(4),
    Deluxe_flag VARCHAR(1),
    Kitchen VARCHAR(100),
    Superior_flag VARCHAR(1),
    Balcony VARCHAR(20),
    Standard_flag VARCHAR(1),
    Amentities VARCHAR(50),
    Ocean_view_flag VARCHAR(1),
    Ocean VARCHAR(15),
    Cityview_flag VARCHAR(1),
    City VARCHAR(15),
    Mtview_flag VARCHAR(1),
    Mountain VARCHAR(15),
    price_per_night DECIMAL(10,2) DEFAULT 100.00,
    PRIMARY KEY(Room_no)
);

-- Create view
CREATE VIEW PENDING_PMT AS
SELECT P.PayID, B.GusID, B.Total_Price, P.Remain_bal
FROM PAYMENT P
JOIN BOOKING B ON B.GusID = P.GusID
WHERE P.Remain_bal > 0;

-- Create function
CREATE FUNCTION STAY_LEN(Check_in DATE, Check_out DATE)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE NUMB_OF_DAY INT;
    SET NUMB_OF_DAY = DATEDIFF(Check_out, Check_in);
    RETURN NUMB_OF_DAY;
END;

-- Create trigger
CREATE TRIGGER UPDATE_ROOM_ON_CANCELLATION
AFTER INSERT ON CANCELLATION
FOR EACH ROW
BEGIN
    UPDATE BOOKING
    SET Room_no = 0000
    WHERE BookID = NEW.BookID;
END;

