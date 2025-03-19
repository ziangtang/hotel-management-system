from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
from config import DB_CONFIG
from datetime import datetime

app = Flask(__name__)
CORS(app)  # 启用CORS以允许前端访问

# 数据库连接函数
def create_connection():
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        print("MySQL数据库连接成功")
    except Error as e:
        print(f"数据库连接错误: {e}")
    return connection

# 测试路由
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API连接成功!"})

# 获取所有酒店
@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM Hotel")
            hotels = cursor.fetchall()
            
            # Convert Decimal objects to float for JSON serialization
            for hotel in hotels:
                if 'rating' in hotel and hotel['rating'] is not None:
                    hotel['rating'] = float(hotel['rating'])
            
            cursor.close()
            connection.close()
            return jsonify(hotels)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 获取特定酒店的房间
@app.route('/api/hotels/<int:hotel_id>/rooms', methods=['GET'])
def get_hotel_rooms(hotel_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT * FROM Room 
                WHERE hotel_id = %s
            """, (hotel_id,))
            rooms = cursor.fetchall()
            
            # Convert Decimal objects to float/string for JSON serialization
            for room in rooms:
                if 'price' in room and room['price'] is not None:
                    room['price'] = str(room['price'])
            
            cursor.close()
            connection.close()
            return jsonify(rooms)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 获取所有预订
@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    print("Entering get_reservations function")  # Debug print
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT r.id, r.customer_id, r.room_id, 
                       DATE_FORMAT(r.check_in_date, '%Y-%m-%d') as check_in_date,
                       DATE_FORMAT(r.check_out_date, '%Y-%m-%d') as check_out_date,
                       r.status, c.first_name, c.last_name, 
                       h.name as hotel_name, rm.room_number
                FROM Reservation r
                JOIN Customer c ON r.customer_id = c.id
                JOIN Room rm ON r.room_id = rm.id
                JOIN Hotel h ON rm.hotel_id = h.id
            """
            print("Executing query:", query)  # Debug print
            cursor.execute(query)
            reservations = cursor.fetchall()
            print(f"Found {len(reservations)} reservations")  # Debug print
            cursor.close()
            connection.close()
            return jsonify(reservations)
        except Error as e:
            print(f"Error in get_reservations: {str(e)}")  # Debug print
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 创建预订
# Add this at the top of your file, after the imports
@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())
    app.logger.debug('URL: %s, Method: %s', request.url, request.method)

# Modify the create_reservation function to add more debugging
@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    app.logger.debug('Entering create_reservation function')
    data = request.json
    print("收到的预订数据:", data)  # 添加调试打印
    
    # Check if data is None
    if data is None:
        print("请求数据为空或不是有效的JSON")
        return jsonify({"error": "请求数据为空或不是有效的JSON"}), 400
    
    # Validate required fields
    required_fields = ['customer_id', 'room_id', 'check_in_date', 'check_out_date', 'status']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        print(f"缺少必填字段: {missing_fields}")  # 添加调试打印
        return jsonify({"error": f"缺少必填字段: {', '.join(missing_fields)}"}), 400
    
    # Validate dates
    try:
        check_in = datetime.strptime(data['check_in_date'], '%Y-%m-%d')
        check_out = datetime.strptime(data['check_out_date'], '%Y-%m-%d')
        
        if check_out <= check_in:
            print("日期验证失败: 退房日期必须晚于入住日期")  # 添加调试打印
            return jsonify({"error": "退房日期必须晚于入住日期"}), 400
    except ValueError as e:
        print(f"日期格式错误: {str(e)}")  # 添加调试打印
        return jsonify({"error": f"日期格式无效，请使用YYYY-MM-DD格式。错误: {str(e)}"}), 400
    
    connection = create_connection()
    if connection:
        try:
            # Start a transaction
            connection.start_transaction()
            
            cursor = connection.cursor()
            
            # 检查房间是否存在且可用
            cursor.execute("SELECT status FROM Room WHERE id = %s", (data['room_id'],))
            room_result = cursor.fetchone()
            if not room_result:
                cursor.close()
                connection.rollback()
                connection.close()
                print(f"房间不存在: {data['room_id']}")  # 添加调试打印
                return jsonify({"error": "房间不存在"}), 404
            
            # 检查客户是否存在
            cursor.execute("SELECT id FROM Customer WHERE id = %s", (data['customer_id'],))
            customer_result = cursor.fetchone()
            if not customer_result:
                cursor.close()
                connection.rollback()
                connection.close()
                print(f"客户不存在: {data['customer_id']}")  # 添加调试打印
                return jsonify({"error": "客户不存在"}), 404
            
            cursor.execute("""
                INSERT INTO Reservation (customer_id, room_id, check_in_date, check_out_date, status)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                data['customer_id'],
                data['room_id'],
                data['check_in_date'],
                data['check_out_date'],
                data['status']
            ))
            
            # Update room status to 'Occupied' or 'Reserved'
            room_status = 'Occupied' if data['status'] == 'Checked In' else 'Reserved'
            cursor.execute("""
                UPDATE Room SET status = %s WHERE id = %s
            """, (room_status, data['room_id']))
            
            connection.commit()
            reservation_id = cursor.lastrowid
            cursor.close()
            connection.close()
            print(f"预订创建成功，ID: {reservation_id}")  # 添加调试打印
            return jsonify({"id": reservation_id, "message": "预订创建成功"}), 201
        except Error as e:
            # Rollback in case of error
            if connection.in_transaction:
                connection.rollback()
            print(f"数据库错误: {str(e)}")  # 添加调试打印
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 删除预订
@app.route('/api/reservations/<int:reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id):
    connection = create_connection()
    if connection:
        try:
            # Start a transaction
            connection.start_transaction()
            
            cursor = connection.cursor()
            
            # Get the room_id before deleting
            cursor.execute("SELECT room_id FROM Reservation WHERE id = %s", (reservation_id,))
            result = cursor.fetchone()
            if not result:
                cursor.close()
                connection.close()
                return jsonify({"error": "预订不存在"}), 404
                
            room_id = result[0]
            
            # Delete the reservation
            cursor.execute("DELETE FROM Reservation WHERE id = %s", (reservation_id,))
            
            # Update room status back to 'Available'
            cursor.execute("UPDATE Room SET status = 'Available' WHERE id = %s", (room_id,))
            
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "预订删除成功"})
        except Error as e:
            # Rollback in case of error
            if connection.in_transaction:
                connection.rollback()
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 获取所有客户
@app.route('/api/customers', methods=['GET'])
def get_customers():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM Customer")
            customers = cursor.fetchall()
            cursor.close()
            connection.close()
            return jsonify(customers)
        except Error as e:
            return jsonify({"error": str(e)}), 500

# 创建新客户
@app.route('/api/customers', methods=['POST'])
def create_customer():
    data = request.json
    
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'email', 'phone']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"缺少必填字段: {', '.join(missing_fields)}"}), 400
    
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Check if email already exists
            cursor.execute("SELECT id FROM Customer WHERE email = %s", (data['email'],))
            if cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "该邮箱已被注册"}), 400
            
            # Insert new customer
            query = """
                INSERT INTO Customer (first_name, last_name, email, phone, address)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                data['first_name'],
                data['last_name'],
                data['email'],
                data['phone'],
                data.get('address', '')  # Address is optional
            ))
            
            connection.commit()
            customer_id = cursor.lastrowid
            cursor.close()
            connection.close()
            return jsonify({"id": customer_id, "message": "客户创建成功"}), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 获取所有可用房间
@app.route('/api/rooms/available', methods=['GET'])
def get_available_rooms():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT r.*, h.name as hotel_name
                FROM Room r
                JOIN Hotel h ON r.hotel_id = h.id
                WHERE r.status = 'Available'
            """)
            rooms = cursor.fetchall()
            cursor.close()
            connection.close()
            return jsonify(rooms)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 更新房间状态
@app.route('/api/rooms/<int:room_id>/status', methods=['PUT'])
def update_room_status(room_id):
    data = request.json
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                UPDATE Room SET status = %s WHERE id = %s
            """, (data['status'], room_id))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "房间状态更新成功"})
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 更新客户信息
@app.route('/api/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    data = request.json
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                UPDATE Customer
                SET first_name = %s, last_name = %s, email = %s, phone = %s, address = %s
                WHERE id = %s
            """, (
                data['first_name'],
                data['last_name'],
                data['email'],
                data['phone'],
                data['address'],
                customer_id
            ))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "客户信息更新成功"})
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 删除客户
@app.route('/api/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    connection = create_connection()
    if connection:
        try:
            # Check if customer has reservations
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM Reservation WHERE customer_id = %s", (customer_id,))
            count = cursor.fetchone()[0]
            if count > 0:
                cursor.close()
                connection.close()
                return jsonify({"error": "无法删除客户，该客户有关联的预订记录"}), 400
                
            cursor.execute("DELETE FROM Customer WHERE id = %s", (customer_id,))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "客户删除成功"})
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 更新预订
@app.route('/api/reservations/<int:reservation_id>', methods=['PUT'])
def update_reservation(reservation_id):
    data = request.json
    
    # Validate required fields
    required_fields = ['customer_id', 'room_id', 'check_in_date', 'check_out_date', 'status']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"缺少必填字段: {field}"}), 400
    
    # Validate dates
    try:
        check_in = datetime.strptime(data['check_in_date'], '%Y-%m-%d')
        check_out = datetime.strptime(data['check_out_date'], '%Y-%m-%d')
        
        if check_out <= check_in:
            return jsonify({"error": "退房日期必须晚于入住日期"}), 400
    except ValueError:
        return jsonify({"error": "日期格式无效，请使用YYYY-MM-DD格式"}), 400
    
    connection = create_connection()
    if connection:
        try:
            # Start a transaction
            connection.start_transaction()
            
            cursor = connection.cursor()
            
            # Get the current room_id
            cursor.execute("SELECT room_id FROM Reservation WHERE id = %s", (reservation_id,))
            result = cursor.fetchone()
            if not result:
                cursor.close()
                connection.rollback()
                connection.close()
                return jsonify({"error": "预订不存在"}), 404
            
            current_room_id = result[0]
            
            # If room is changing, update the old room's status back to Available
            if current_room_id != data['room_id']:
                cursor.execute("UPDATE Room SET status = 'Available' WHERE id = %s", (current_room_id,))
            
            # Update the reservation
            cursor.execute("""
                UPDATE Reservation
                SET customer_id = %s, room_id = %s, check_in_date = %s, check_out_date = %s, status = %s
                WHERE id = %s
            """, (
                data['customer_id'],
                data['room_id'],
                data['check_in_date'],
                data['check_out_date'],
                data['status'],
                reservation_id
            ))
            
            # Update the new room's status
            room_status = 'Occupied' if data['status'] == 'Checked In' else 'Reserved'
            cursor.execute("UPDATE Room SET status = %s WHERE id = %s", (room_status, data['room_id']))
            
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "预订更新成功"})
        except Error as e:
            # Rollback in case of error
            if connection.in_transaction:
                connection.rollback()
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 获取单个预订
# 获取特定预订
@app.route('/api/reservations/<int:reservation_id>', methods=['GET'])
def get_reservation(reservation_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT r.id, r.customer_id, r.room_id, 
                       DATE_FORMAT(r.check_in_date, '%Y-%m-%d') as check_in_date,
                       DATE_FORMAT(r.check_out_date, '%Y-%m-%d') as check_out_date,
                       r.status, c.first_name, c.last_name, 
                       h.id as hotel_id, h.name as hotel_name, rm.room_number
                FROM Reservation r
                JOIN Customer c ON r.customer_id = c.id
                JOIN Room rm ON r.room_id = rm.id
                JOIN Hotel h ON rm.hotel_id = h.id
                WHERE r.id = %s
            """, (reservation_id,))
            reservation = cursor.fetchone()
            
            if not reservation:
                cursor.close()
                connection.close()
                return jsonify({"error": "预订不存在"}), 404
                
            cursor.close()
            connection.close()
            return jsonify(reservation)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 获取单个客户
@app.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM Customer WHERE id = %s", (customer_id,))
            customer = cursor.fetchone()
            
            if not customer:
                cursor.close()
                connection.close()
                return jsonify({"error": "客户不存在"}), 404
                
            cursor.close()
            connection.close()
            return jsonify(customer)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 获取单个酒店
@app.route('/api/hotels/<int:hotel_id>', methods=['GET'])
def get_hotel(hotel_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM Hotel WHERE id = %s", (hotel_id,))
            hotel = cursor.fetchone()
            
            if not hotel:
                cursor.close()
                connection.close()
                return jsonify({"error": "酒店不存在"}), 404
            
            # Convert Decimal objects to float for JSON serialization
            if 'rating' in hotel and hotel['rating'] is not None:
                hotel['rating'] = float(hotel['rating'])
                
            cursor.close()
            connection.close()
            return jsonify(hotel)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 获取单个房间
@app.route('/api/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT r.*, h.name as hotel_name
                FROM Room r
                JOIN Hotel h ON r.hotel_id = h.id
                WHERE r.id = %s
            """, (room_id,))
            room = cursor.fetchone()
            
            if not room:
                cursor.close()
                connection.close()
                return jsonify({"error": "房间不存在"}), 404
            
            # Convert Decimal objects to string for JSON serialization
            if 'price' in room and room['price'] is not None:
                room['price'] = str(room['price'])
                
            cursor.close()
            connection.close()
            return jsonify(room)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 获取客户的所有预订
@app.route('/api/customers/<int:customer_id>/reservations', methods=['GET'])
def get_customer_reservations(customer_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT r.id, r.customer_id, r.room_id, 
                       DATE_FORMAT(r.check_in_date, '%Y-%m-%d') as check_in_date,
                       DATE_FORMAT(r.check_out_date, '%Y-%m-%d') as check_out_date,
                       r.status, c.first_name, c.last_name, 
                       h.name as hotel_name, rm.room_number
                FROM Reservation r
                JOIN Customer c ON r.customer_id = c.id
                JOIN Room rm ON r.room_id = rm.id
                JOIN Hotel h ON rm.hotel_id = h.id
                WHERE r.customer_id = %s
            """, (customer_id,))
            reservations = cursor.fetchall()
            cursor.close()
            connection.close()
            return jsonify(reservations)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 创建酒店
@app.route('/api/hotels', methods=['POST'])
def create_hotel():
    data = request.json
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                INSERT INTO Hotel (name, address, city, state, country, phone, email, rating, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                data['name'],
                data['address'],
                data['city'],
                data['state'],
                data['country'],
                data['phone'],
                data['email'],
                data['rating'],
                data['description']
            ))
            connection.commit()
            hotel_id = cursor.lastrowid
            cursor.close()
            connection.close()
            return jsonify({"id": hotel_id, "message": "酒店创建成功"}), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

# 创建房间
@app.route('/api/rooms', methods=['POST'])
def create_room():
    data = request.json
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                INSERT INTO Room (hotel_id, room_number, type, price, capacity, status, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                data['hotel_id'],
                data['room_number'],
                data['type'],
                data['price'],
                data['capacity'],
                data['status'],
                data['description']
            ))
            connection.commit()
            room_id = cursor.lastrowid
            cursor.close()
            connection.close()
            return jsonify({"id": room_id, "message": "房间创建成功"}), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "数据库连接失败"}), 500

if __name__ == '__main__':
    app.run(debug=True)