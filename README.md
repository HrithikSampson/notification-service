# 🛎️ Notification Service

This is a lightweight notification service using **Express**, **TypeORM**, **Redis**, and **BullMQ** to handle real-time and persistent notifications for your application.

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/notification-service.git
```
cd notification-service
2. Install Dependencies
```
npm install
```
3. Environment Configuration
Create a .env file in the root directory:

env
```
PORT=4500
REDIS_HOST=localhost
REDIS_PORT=6379
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=notification_service
```
4. Start PostgreSQL and Redis
Ensure PostgreSQL and Redis are up and running on the configured ports.

5. Run Migrations
```
npm run typeorm migration:run
```
This will run the migrations and create the required tables in the PostgreSQL database.

🚀 Running the Server
```
npm run dev
```
