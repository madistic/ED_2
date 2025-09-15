# Developer Documentation

This document provides detailed information for developers on how to modify, extend, and maintain the School Payment Dashboard Application.

## 🔧 Development Setup

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- VS Code (recommended) with the following extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Thunder Client (for API testing)

### Development Workflow

1. **Start both backend and frontend in development mode:**
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

2. **Watch for changes:** Both servers support hot reload for faster development.

## 🗄️ Database Configuration

### Updating MongoDB URI

1. **Update environment variable:**
```bash
# In backend/.env
MONGO_URI=mongodb+srv://new-username:new-password@new-cluster.mongodb.net/new-database?retryWrites=true&w=majority
```

2. **Restart the backend server** to apply changes.

3. **Database will auto-seed** with sample data on first connection.

### Adding New Schemas

1. **Create schema file in `backend/src/schemas/`:**
```typescript
// backend/src/schemas/new-entity.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewEntityDocument = NewEntity & Document;

@Schema({ timestamps: true })
export class NewEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const NewEntitySchema = SchemaFactory.createForClass(NewEntity);

// Add indexes
NewEntitySchema.index({ name: 1 });
```

2. **Create corresponding service and controller:**
```typescript
// backend/src/new-entity/new-entity.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewEntity, NewEntityDocument } from '../schemas/new-entity.schema';

@Injectable()
export class NewEntityService {
  constructor(
    @InjectModel(NewEntity.name) 
    private newEntityModel: Model<NewEntityDocument>,
  ) {}

  async findAll() {
    return this.newEntityModel.find();
  }

  async create(createDto: any) {
    const entity = new this.newEntityModel(createDto);
    return entity.save();
  }
}
```

3. **Register in app module:**
```typescript
// backend/src/app.module.ts
import { NewEntityModule } from './new-entity/new-entity.module';

@Module({
  imports: [
    // ... existing imports
    NewEntityModule,
  ],
})
export class AppModule {}
```

## 🔐 Authentication & Security

### Updating JWT Configuration

1. **Change JWT secret:**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in backend/.env
JWT_SECRET=your-new-super-secret-key
JWT_EXPIRY=24h  # Or desired expiry time
```

2. **Restart backend server** to apply changes.

### Adding New User Roles

1. **Update User schema:**
```typescript
// backend/src/schemas/user.schema.ts
@Prop({ 
  default: 'user',
  enum: ['user', 'admin', 'supervisor', 'new-role'] // Add new role here
})
role: string;
```

2. **Create role-based guards:**
```typescript
// backend/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
```

3. **Use in controllers:**
```typescript
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'supervisor')
@Get('/admin-only')
adminOnlyEndpoint() {
  return { message: 'Admin access granted' };
}
```

## 🔌 API Extensions

### Adding New Endpoints

1. **Create DTO for request validation:**
```typescript
// backend/src/module/dto/create-item.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}
```

2. **Add to controller:**
```typescript
// backend/src/module/controller.ts
@Post()
@UseGuards(JwtAuthGuard)
async create(@Body() createItemDto: CreateItemDto) {
  return this.itemService.create(createItemDto);
}

@Get(':id')
@UseGuards(JwtAuthGuard)
async findOne(@Param('id') id: string) {
  return this.itemService.findOne(id);
}
```

3. **Implement in service:**
```typescript
// backend/src/module/service.ts
async create(createItemDto: CreateItemDto) {
  const item = new this.itemModel(createItemDto);
  return item.save();
}

async findOne(id: string) {
  const item = await this.itemModel.findById(id);
  if (!item) {
    throw new NotFoundException(`Item with ID ${id} not found`);
  }
  return item;
}
```

### Payment Gateway Configuration

1. **Update payment credentials:**
```bash
# In backend/.env
PG_KEY=new-pg-key
API_KEY=new-api-key
SCHOOL_ID=new-school-id
PAYMENT_API_URL=https://new-payment-api.com/endpoint
```

2. **Modify payment service for different gateways:**
```typescript
// backend/src/payment/payment.service.ts
async createPayment(createPaymentDto: CreatePaymentDto) {
  const gateway = this.configService.get<string>('PAYMENT_GATEWAY') || 'edviron';
  
  switch (gateway) {
    case 'edviron':
      return this.createEdvironPayment(createPaymentDto);
    case 'razorpay':
      return this.createRazorpayPayment(createPaymentDto);
    default:
      throw new BadRequestException('Unsupported payment gateway');
  }
}
```

## 🎨 Frontend Development

### Adding New Pages

1. **Create page component:**
```typescript
// frontend/src/pages/NewPage.tsx
import React from 'react';

const NewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        New Page
      </h1>
      {/* Page content */}
    </div>
  );
};

export default NewPage;
```

2. **Add route in App.tsx:**
```typescript
// frontend/src/App.tsx
import NewPage from './pages/NewPage';

<Routes>
  <Route path="/new-page" element={<NewPage />} />
  {/* Other routes */}
</Routes>
```

3. **Add navigation item in Layout:**
```typescript
// frontend/src/components/Layout.tsx
const navigation = [
  { name: 'New Page', href: '/new-page', icon: NewIcon },
  // Other navigation items
];
```

### Styling Guidelines

1. **Use Tailwind CSS classes consistently:**
```typescript
// Card component pattern
<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
  {/* Card content */}
</div>

// Button pattern
<button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
  Button Text
</button>

// Form input pattern
<input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" />
```

2. **Add new color schemes:**
```javascript
// frontend/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        // Add custom colors
      },
    },
  },
};
```

### State Management

1. **Create new context:**
```typescript
// frontend/src/contexts/NewContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface NewContextType {
  data: any[];
  setData: (data: any[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const NewContext = createContext<NewContextType | undefined>(undefined);

export const useNewContext = () => {
  const context = useContext(NewContext);
  if (!context) {
    throw new Error('useNewContext must be used within NewProvider');
  }
  return context;
};

export const NewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <NewContext.Provider value={{ data, setData, loading, setLoading }}>
      {children}
    </NewContext.Provider>
  );
};
```

2. **Add API service functions:**
```typescript
// frontend/src/services/api.ts
export const newEndpointService = {
  getAll: () => api.get('/new-endpoint'),
  getById: (id: string) => api.get(`/new-endpoint/${id}`),
  create: (data: any) => api.post('/new-endpoint', data),
  update: (id: string, data: any) => api.put(`/new-endpoint/${id}`, data),
  delete: (id: string) => api.delete(`/new-endpoint/${id}`),
};
```

## 🧪 Testing

### Backend Testing

1. **Unit tests with Jest:**
```typescript
// backend/src/module/module.service.spec.ts
describe('ModuleService', () => {
  let service: ModuleService;
  let model: Model<ModuleDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        {
          provide: getModelToken('Module'),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ModuleService>(ModuleService);
    model = module.get<Model<ModuleDocument>>(getModelToken('Module'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

2. **Integration tests:**
```typescript
// backend/test/module.e2e-spec.ts
describe('Module (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/module (GET)', () => {
    return request(app.getHttpServer())
      .get('/module')
      .expect(200)
      .expect('Hello World!');
  });
});
```

### Frontend Testing

1. **Component tests with React Testing Library:**
```typescript
// frontend/src/components/__tests__/Component.test.tsx
import { render, screen } from '@testing-library/react';
import Component from '../Component';

test('renders component correctly', () => {
  render(<Component />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## 📦 Deployment

### Environment-Specific Configurations

1. **Development environment:**
```bash
# backend/.env.development
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/school-payments-dev
JWT_SECRET=dev-secret
FRONTEND_URL=http://localhost:5173
```

2. **Production environment:**
```bash
# backend/.env.production
NODE_ENV=production
MONGO_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/school-payments-prod
JWT_SECRET=super-secure-production-secret
FRONTEND_URL=https://yourdomain.com
```

### Docker Configuration

1. **Backend Dockerfile:**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

2. **Frontend Dockerfile:**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

3. **Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## 🔍 Debugging

### Backend Debugging

1. **Enable debug logging:**
```typescript
// backend/src/main.ts
if (process.env.NODE_ENV === 'development') {
  app.useLogger(['log', 'debug', 'error', 'verbose', 'warn']);
}
```

2. **VS Code debug configuration:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/main.ts",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"]
    }
  ]
}
```

### Frontend Debugging

1. **React Developer Tools:** Install browser extension for component inspection.

2. **Console debugging:**
```typescript
// Add temporary debug logs
console.log('Debug data:', data);
console.table(transactions);
```

## 📊 Performance Optimization

### Backend Optimization

1. **Database indexing:**
```typescript
// Add compound indexes for better query performance
OrderSchema.index({ school_id: 1, status: 1, payment_time: -1 });
OrderStatusSchema.index({ collect_id: 1, status: 1 });
```

2. **Query optimization:**
```typescript
// Use aggregation pipelines for complex queries
const pipeline = [
  { $match: { school_id: schoolId } },
  { $lookup: { from: 'orderstatuses', localField: '_id', foreignField: 'collect_id', as: 'status' } },
  { $limit: limit },
  { $skip: skip }
];
```

### Frontend Optimization

1. **Code splitting:**
```typescript
// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Transactions = React.lazy(() => import('./pages/Transactions'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/transactions" element={<Transactions />} />
  </Routes>
</Suspense>
```

2. **Image optimization:**
```typescript
// Use optimized images
<img 
  src="https://images.pexels.com/photos/image-id/image.jpg?auto=compress&cs=tinysrgb&w=400" 
  alt="Description"
  loading="lazy"
/>
```

## 🔒 Security Best Practices

1. **Input sanitization:**
```typescript
// Backend - use class-validator
@IsString()
@IsNotEmpty()
@Matches(/^[a-zA-Z0-9\s-_]+$/, { message: 'Invalid characters in input' })
name: string;
```

2. **Rate limiting:**
```typescript
// backend/src/main.ts
import * as rateLimit from 'express-rate-limit';

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

3. **CORS configuration:**
```typescript
app.enableCors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173'],
  credentials: true,
});
```

## 📝 Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for type safety
- Prefer const over let
- Use async/await over promises
- Follow ESLint configuration

### React
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use proper prop types

### CSS/Styling
- Use Tailwind CSS utility classes
- Follow responsive design patterns
- Maintain consistent spacing (8px grid)
- Use semantic color names

This developer documentation should be updated as the project evolves. Keep it current with any architectural changes or new features added to the system.