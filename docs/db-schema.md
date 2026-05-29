# Database Schema - QR Code Ordering System

## Entities

### 1. Tables (โต๊ะอาหาร)
- `id`: UUID (Primary Key)
- `table_number`: String (เช่น "T1", "5")
- `status`: Enum ('available', 'occupied', 'cleaning')
- `qr_code_token`: String (Unique token for validation)

### 2. Categories (หมวดหมู่)
- `id`: UUID
- `name`: String (เช่น "Appetizers", "Main Course")
- `display_order`: Integer

### 3. Menus (รายการอาหาร)
- `id`: UUID
- `category_id`: UUID (Foreign Key)
- `name`: String
- `description`: Text
- `price`: Decimal
- `image_url`: String
- `is_available`: Boolean (Default: true)

### 4. Orders (คำสั่งซื้อรวมของโต๊ะ)
- `id`: UUID (Primary Key)
- `table_id`: String (Foreign Key)
- `session_token`: String (เชื่อมกับ session ปัจจุบัน)
- `status`: Enum ('pending', 'cooking', 'served', 'paid', 'cancelled')
- `total_price`: Decimal
- `created_at`: Timestamp

### 5. OrderItems (รายการอาหารย่อยในออเดอร์)
- `id`: UUID
- `order_id`: UUID (Foreign Key)
- `menu_id`: UUID (Foreign Key)
- `quantity`: Integer
- `notes`: Text (เก็บ JSON string ของ options หรือหมายเหตุ)
- `price_at_order`: Decimal (บันทึกราคา ณ ขณะที่สั่ง)

### 6. Table Sessions (เซสชันการนั่งโต๊ะ)
- `id`: UUID
- `table_id`: String
- `token`: String (Unique QR Token)
- `status`: Enum ('active', 'calling_bill', 'completed')
- `is_calling_bill`: Boolean
- `created_at`: Timestamp
