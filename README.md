# ReWear Platform - Hackathon Development Prompts

## SHARED CONTEXT (READ THIS FIRST - BOTH TEAMS)

### Project Overview
ReWear is a community clothing exchange platform promoting sustainable fashion through clothing swaps and point-based redemption. Users can upload clothing items, request swaps, or redeem items using earned points.

### Key Business Logic
- **Points System**: Users earn 10 points per approved item upload, spend 10 points per item redemption
- **Green Score**: Calculated as (items_uploaded + successful_swaps) * 10
- **Swap Process**: Request → Accept → Both parties confirm exchange → Points awarded
- **Item States**: pending, approved, rejected, available, reserved, swapped

### API Contract (Both teams must follow exactly)

**Base URL**: `http://localhost:5000/api`

#### Authentication Endpoints
- `POST /auth/register` - Body: `{email, password, name}`
- `POST /auth/login` - Body: `{email, password}` - Returns: `{token, user}`
- `GET /auth/me` - Headers: `{Authorization: Bearer token}`

#### User Endpoints
- `GET /users/profile` - Get user profile with points and green score
- `PUT /users/profile` - Update profile - Body: `{name, bio, location}`

#### Items Endpoints
- `GET /items` - Query: `{category?, search?, status?, page?, limit?}`
- `POST /items` - Body: `{title, description, category, type, size, condition, tags[], images[]}`
- `GET /items/:id` - Get single item with uploader info
- `PUT /items/:id` - Update item (owner only)
- `DELETE /items/:id` - Delete item (owner/admin only)

#### Swap Endpoints
- `POST /swaps` - Body: `{itemId, message?}` - Create swap request
- `GET /swaps` - Get user's swap requests and received requests
- `PUT /swaps/:id/accept` - Accept swap request
- `PUT /swaps/:id/reject` - Reject swap request
- `PUT /swaps/:id/complete` - Mark swap as completed

#### Admin Endpoints
- `GET /admin/items` - Get all items for moderation
- `PUT /admin/items/:id/approve` - Approve item
- `PUT /admin/items/:id/reject` - Reject item
- `GET /admin/stats` - Platform statistics

#### Point System Endpoints
- `POST /points/redeem` - Body: `{itemId}` - Redeem item with points
- `GET /points/history` - Get points transaction history

### Database Schema (MongoDB)
```javascript
// User Schema
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  bio: String,
  location: String,
  points: Number (default: 0),
  greenScore: Number (default: 0),
  isAdmin: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}

// Item Schema
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String, // tops, bottoms, dresses, shoes, accessories, outerwear
  type: String, // shirt, jeans, sneakers, etc.
  size: String, // XS, S, M, L, XL, XXL
  condition: String, // new, excellent, good, fair
  tags: [String],
  images: [String], // URLs or base64
  uploaderId: ObjectId,
  uploaderName: String,
  status: String, // pending, approved, rejected, available, reserved, swapped
  createdAt: Date,
  updatedAt: Date
}

// Swap Schema
{
  _id: ObjectId,
  itemId: ObjectId,
  requesterId: ObjectId,
  ownerId: ObjectId,
  message: String,
  status: String, // pending, accepted, rejected, completed
  createdAt: Date,
  updatedAt: Date
}

// Points Transaction Schema
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // earned, spent
  amount: Number,
  reason: String, // item_upload, item_redemption, swap_completion
  itemId: ObjectId,
  createdAt: Date
}
```

### Socket.io Events
- `swap_request` - Notify item owner of new swap request
- `swap_accepted` - Notify requester of accepted swap
- `swap_rejected` - Notify requester of rejected swap
- `item_approved` - Notify uploader of item approval
- `item_rejected` - Notify uploader of item rejection

### Frontend Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard
- `/items` - Browse items
- `/items/:id` - Item detail page
- `/add-item` - Add new item
- `/swaps` - User's swaps
- `/admin` - Admin panel (admin only)

---

## BACKEND PROMPT (Node.js/Express/MongoDB)

You are developing the backend for ReWear, a clothing exchange platform. Create a production-ready REST API with the following requirements:

### Tech Stack
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **File Upload**: Multer for image handling
- **Real-time**: Socket.io for notifications
- **Security**: bcrypt, helmet, cors, rate limiting
- **Validation**: Joi or express-validator

### Project Structure
```
backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── app.ts
├── uploads/
└── package.json
```

### Core Requirements

1. **Authentication System**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Protected routes middleware
   - Role-based access (user/admin)

2. **User Management**
   - User registration/login
   - Profile management
   - Points and green score calculation
   - Admin user creation

3. **Item Management**
   - CRUD operations for clothing items
   - Image upload handling (store locally or base64)
   - Item categorization and search
   - Status management (pending → approved → available → swapped)

4. **Swap System**
   - Create swap requests
   - Accept/reject swaps
   - Track swap status
   - Points awarding on completion

5. **Points System**
   - Award points for approved uploads (10 points)
   - Deduct points for redemptions (10 points)
   - Transaction history tracking

6. **Admin Features**
   - Item moderation (approve/reject)
   - Platform statistics
   - User management

7. **Real-time Features**
   - Socket.io integration
   - Notification system for swaps and approvals

### Key Implementation Details
- Use MongoDB aggregation for complex queries
- Implement proper error handling and logging
- Add request validation for all endpoints
- Include CORS configuration for frontend
- Add rate limiting for API protection
- Implement proper file upload limits and validation
- Use environment variables for configuration

### Database Connection
```javascript
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear');
};
```

### Critical Features to Implement First (Priority Order)
1. User authentication and JWT middleware
2. Item CRUD operations
3. Swap request system
4. Points system integration
5. Admin moderation features
6. Socket.io notifications
7. File upload handling

Start with basic functionality and expand. Focus on API reliability and proper error handling. The frontend team is waiting for stable endpoints, so prioritize core CRUD operations first.

---

## FRONTEND PROMPT (React/TypeScript/Tailwind)

You are developing the frontend for ReWear, a clothing exchange platform. Create a responsive, user-friendly React application with the following requirements:

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Material-UI components
- **Routing**: React Router v6
- **State Management**: Redux Toolkit + RTK Query
- **HTTP Client**: Axios (configured with interceptors)
- **Real-time**: Socket.io-client
- **Forms**: React Hook Form + Yup validation
- **Image Upload**: File handling with preview

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   └── layout/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
├── public/
└── package.json
```

### Core Pages & Components

1. **Landing Page**
   - Hero section with platform introduction
   - Featured items carousel
   - Call-to-action buttons
   - Statistics display (total items, users, swaps)

2. **Authentication**
   - Login/Register forms with validation
   - JWT token management
   - Protected route wrapper

3. **User Dashboard**
   - Profile overview (points, green score)
   - My items grid
   - Active swaps list
   - Quick action buttons

4. **Items**
   - Browse items with filtering/search
   - Item detail page with image gallery
   - Add new item form with image upload
   - Swap request modal

5. **Swap Management**
   - Incoming/outgoing swap requests
   - Swap status tracking
   - Accept/reject actions

6. **Admin Panel**
   - Item moderation queue
   - User management
   - Platform statistics dashboard

### Key UI Components
- **ItemCard**: Display item with image, title, condition, points
- **SwapRequestModal**: Handle swap requests with message
- **ImageUpload**: Drag & drop with preview
- **FilterBar**: Category, size, condition filters
- **NotificationToast**: Real-time notifications
- **LoadingSpinner**: Loading states
- **ConfirmDialog**: Action confirmations

### State Management Setup
```typescript
// store/slices/authSlice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// store/slices/itemsSlice.ts
interface ItemsState {
  items: Item[];
  currentItem: Item | null;
  filters: ItemFilters;
  isLoading: boolean;
}

// store/slices/swapsSlice.ts
interface SwapsState {
  incomingSwaps: Swap[];
  outgoingSwaps: Swap[];
  isLoading: boolean;
}
```

### API Integration
- Configure Axios with base URL and auth interceptors
- Use RTK Query for efficient data fetching
- Implement proper error handling and loading states
- Add request/response logging for debugging

### Socket.io Integration
```typescript
// Real-time notifications for:
- New swap requests
- Swap status updates
- Item approval/rejection
- Points updates
```

### Responsive Design
- Mobile-first approach
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Touch-friendly interactions
- Optimized image loading

### Critical Features to Implement First (Priority Order)
1. Authentication flow and protected routes
2. Items browsing and detail pages
3. Add item form with image upload
4. User dashboard with basic stats
5. Swap request system
6. Admin moderation interface
7. Real-time notifications
8. Advanced filtering and search

### Design System
- **Colors**: Primary (green theme), Secondary (blue), Neutral grays
- **Typography**: Clean, modern fonts with proper hierarchy
- **Spacing**: Consistent spacing using Tailwind utilities
- **Components**: Material-UI components styled with Tailwind
- **Icons**: Material-UI icons for consistency

Start with the basic layout and authentication, then build pages incrementally. Focus on core user flows first: browse items → create swap request → manage swaps. The backend team is building APIs in parallel, so mock data initially if needed.

### Environment Variables
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Both teams should implement error boundaries and proper loading states. Communication is key - sync on API changes immediately!