DELIMITER //

CREATE FUNCTION STAY_LEN(check_in_date DATE, check_out_date DATE) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE days INT;
    SET days = DATEDIFF(check_out_date, check_in_date);
    RETURN days;
END//

DELIMITER ;