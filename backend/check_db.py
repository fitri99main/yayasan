import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="hrd_yayasan"
    )
    cursor = conn.cursor(dictionary=True)
    
    print("--- USERS ---")
    cursor.execute("SELECT id, name, email, role FROM users")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- SEKOLAH ---")
    cursor.execute("SELECT id, nama, jenjang, kode_invoice FROM sekolah")
    for row in cursor.fetchall():
        print(row)
        
except Exception as e:
    print(f"Error: {e}")
