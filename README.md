# Star Badminton Club Management System

A modern, fast, and responsive web-based management system for Star Badminton Club.

## Features

- **Secure Authentication**: JWT-based login system
- **Modern Dashboard**: Real-time statistics with beautiful cards
- **Player Management**: Add, edit, delete, and search players
- **Payment Management**: Single/multiple/all player payments
- **Investment Tracking**: Track expenses and investments
- **Shuttle Stock Management**: Monitor and manage shuttle inventory
- **Records Module**: View all payment and investment records
- **PDF Export**: Generate professional PDF reports
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Premium UI**: Glassmorphism, animations, dark/light mode

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React.js (Vite)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- jsPDF for PDF generation

## Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   cd d:/STAR-project
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up PostgreSQL database**
   - Create a database named `star_badminton_db`
   - Update the `DATABASE_URL` in `server/.env` if needed

4. **Initialize the database**
   ```bash
   cd server
   npx prisma db push
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend server on http://localhost:3000

6. **Initialize admin account**
   - Open browser and go to http://localhost:3000
   - The app will automatically create the default admin account on first API call
   - Login with:
     - Username: `yahya`
     - Password: `yahya123`

## Project Structure

```
star-badminton-club/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Express server
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── index.js       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── package.json
│   └── .env
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/init` - Initialize default admin

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get single player
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player
- `GET /api/players/search/:query` - Search players

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments/single` - Add payment for single player
- `POST /api/payments/multiple` - Add payment for multiple players
- `POST /api/payments/all` - Add payment for all players
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `DELETE /api/payments/player/:playerId` - Delete all payments for a player

### Investments
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Create investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment
- `DELETE /api/investments` - Delete all investments

### Shuttle Stock
- `GET /api/shuttle/stock` - Get shuttle stock
- `POST /api/shuttle/use` - Record shuttle usage
- `POST /api/shuttle/reset` - Reset shuttle stock

## Default Credentials

- Username: `yahya`
- Password: `yahya123`

## Features in Detail

### Dashboard
- Total Received Payments
- Current Balance
- Total Investment
- Total Shuttle Stock
- Remaining Shuttle Stock
- Total Players

### Player Management
- Auto-generated player codes (SB001, SB002, etc.)
- Profile picture upload
- Search by name, father name, or player code
- Edit and delete functionality

### Payment Management
- Single player payment
- Multiple players payment
- All players payment
- Automatic date and time recording

### Investment Management
- Custom expense types (Shuttle, Court Rent, Electricity, Repair, Other)
- Automatic shuttle stock update when adding shuttle expenses
- Quantity tracking

### Shuttle Usage
- Record shuttle usage
- Automatic stock decrement
- Stock reset functionality

### Records
- Payment records with player details
- Investment records
- PDF export functionality
- Delete individual or all records

## Design Features

- Glassmorphism UI
- Smooth animations with Framer Motion
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Toast notifications
- Confirmation dialogs
- Loading animations
- Premium color scheme

## Development

### Backend
```bash
cd server
npm run dev
```

### Frontend
```bash
cd client
npm run dev
```

### Database Migrations
```bash
cd server
npx prisma studio  # View and edit database
npx prisma db push # Push schema changes
```

## Build for Production

```bash
npm run build
npm start
```

## License

MIT

## Support

For issues and questions, please contact the development team.