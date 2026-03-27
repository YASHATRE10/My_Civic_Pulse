# CivicPulse Hub

A citizen-centric **smart grievance management platform** that enables transparent, efficient resolution of civic complaints through role-aware workflows, AI-powered categorization, real-time tracking, and SLA monitoring.

---

## 🎯 Features

### For Citizens
- 📝 **Smart Complaint Submission** - Submit grievances with auto-categorization
- 🎤 **Voice Input Support** - Record complaints using speech-to-text
- 📍 **Geo-location** - Tag complaint locations on interactive maps
- 🖼️ **Media Upload** - Attach images and evidence
- 📊 **Real-time Tracking** - Monitor complaint status and resolutions
- 💬 **Feedback System** - Rate and review resolutions

### For Officers
- 📋 **Assigned Queue** - View complaints assigned to you
- ✅ **Update Tracking** - Submit before/after proof with timeline
- 💭 **Comments & Remarks** - Add resolution updates and notes
- 📈 **Performance Metrics** - Track SLA compliance and resolution times

### For Admins
- 🤖 **Smart Assignment** - AI-powered automatic grievance routing
- 📊 **Kanban Board** - Visual SLA monitoring and workflow management
- 🎯 **Priority Management** - Set and adjust complaint priorities
- 📡 **Real-time Control Center** - City-wide grievance oversight
- 📈 **Analytics Dashboard** - Insights on complaint trends and resolution rates

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.11
- **Language**: Java 21
- **Security**: JWT Authentication & OAuth2
- **Database**: H2 (In-memory) / PostgreSQL (Production)
- **Build Tool**: Gradle
- **WebSocket**: Spring WebSocket for real-time updates
- **ORM**: Spring Data JPA + Hibernate

### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite 8.0.1
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: React Context API
- **Real-time**: SockJS + STOMP WebSocket
- **Charting**: Recharts 3.8.1
- **UI Components**: shadcn/ui
- **Routing**: React Router v7
- **Internationalization**: i18next

---

## 🚀 Quick Start

### Prerequisites
- **Java 21+** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/#java21)
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **Git** - For version control

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/YASHATRE10/My_Civic_Pulse.git
cd civic_pulse_hub-main
```

#### 2. Backend Setup
```bash
# Set JAVA_HOME to JDK 21 installation directory
export JAVA_HOME="C:\Program Files\Java\jdk-21"  # Windows
# or
export JAVA_HOME="/usr/libexec/java_home -v 21"  # macOS

# Build and run Spring Boot
./gradlew bootRun
```
Backend runs on: **http://localhost:9090**

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend runs on: **http://localhost:5173**

---

## 📝 Project Structure

```
civic_pulse_hub-main/
├── src/main/java/com/civic/smartcity/
│   ├── config/          # Security & WebSocket configuration
│   ├── controller/      # REST API endpoints
│   ├── model/          # JPA entities
│   ├── repository/     # Data access layer
│   ├── security/       # JWT & authentication
│   ├── service/        # Business logic
│   └── dto/            # Data transfer objects
├── frontend/
│   ├── src/
│   │   ├── components/  # React UI components
│   │   ├── pages/      # Application pages
│   │   ├── services/   # API client & real-time
│   │   ├── context/    # React Context (Auth)
│   │   └── utils/      # Utilities & i18n
│   ├── vite.config.js  # Vite configuration
│   └── package.json    # Dependencies
├── build.gradle        # Gradle build configuration
├── settings.gradle     # Gradle settings
└── README.md          # This file
```

---

## 🔐 Authentication

### User Roles
| Role | Permissions |
|------|-------------|
| **CITIZEN** | Submit, track, and provide feedback on grievances |
| **OFFICER** | View assigned grievances and update status |
| **ADMIN** | Manage all grievances, assign officers, view analytics |

### Default Demo Accounts
(For testing purposes)

```
Citizen:  username: citizen_demo   | password: password
Officer:  username: officer_demo   | password: password
Admin:    username: admin_demo     | password: password
```

### JWT Configuration
- **Secret Key**: Configured in `application.properties`
- **Expiration**: 24 hours
- **Algorithm**: HS512

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Grievances
- `POST /api/grievances/submit` - Submit new grievance
- `GET /api/grievances/my` - Get citizen's grievances
- `GET /api/grievances/all` - Get all grievances (Admin)
- `GET /api/grievances/officer/assigned` - Get officer's assigned grievances
- `PUT /api/grievances/{id}/status` - Update grievance status
- `GET /api/grievances/analytics` - Get analytics data

### Admin
- `POST /api/grievances/admin/assign` - Assign grievance to officer
- `POST /api/grievances/admin/auto-assign` - Auto-assign by category

### WebSocket
- `/ws` - WebSocket endpoint for real-time updates
- Topics: `/topic/grievance-updates`, `/topic/notifications`

---

## 🔧 Configuration

### Backend Configuration (`src/main/resources/application.properties`)
```properties
spring.application.name=smartcity
server.port=9090

# Database
spring.datasource.url=jdbc:h2:mem:civicpulsedb
spring.jpa.hibernate.ddl-auto=create-drop

# JWT
jwt.secret=CivicPulseSecretKey_MustBeAtLeast64CharactersLongForHS512Algorithms!!
jwt.expirationMs=86400000
```

### Frontend Configuration (`frontend/vite.config.js`)
```javascript
// API proxy to backend
proxy: {
  '/api': {
    target: 'http://localhost:9090',
    changeOrigin: true,
  },
  '/ws': {
    target: 'http://localhost:9090',
    ws: true,
  },
}
```

---

## 🧪 Testing

### Run Backend Tests
```bash
./gradlew test
```

### Run Frontend Linting
```bash
cd frontend
npm run lint
```

---

## 🛠️ Development

### Backend Development
- Hot reload enabled with Spring DevTools
- H2 console available at `http://localhost:9090/h2-console`
- Debug mode enabled for Spring Security

### Frontend Development
- Vite HMR (Hot Module Replacement) enabled
- ESLint for code quality
- Babel React Compiler for optimizations

---

## 📊 Architecture

### Data Flow
```
Frontend (React) 
    ↓ (HTTP/WebSocket)
API Gateway (Vite Proxy)
    ↓
Spring Boot Backend
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (JPA)
    ↓
H2/PostgreSQL Database
```

### Real-time Updates
- **WebSocket**: SockJS + STOMP for real-time notifications
- **Topics**: Grievance updates, notification broadcasts
- **Events**: Status changes, new assignments, resolutions

---

## 🚢 Deployment

### Docker (Recommended)
```bash
# Build Docker image
docker build -t civicpulse:latest .

# Run container
docker run -p 9090:9090 -p 5173:5173 civicpulse:latest
```

### Cloud Deployment
- **Backend**: Azure App Service / AWS Elastic Beanstalk
- **Frontend**: Azure Static Web Apps / AWS S3 + CloudFront
- **Database**: Azure Database for PostgreSQL / AWS RDS

---

## 📋 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI analytics
- [ ] Multi-language support (i18n)
- [ ] SMS/Email notifications
- [ ] Integration with municipal systems
- [ ] Predictive analytics for SLA

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

**Developed by**: YASHATRE10 & Contributors

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/YASHATRE10/My_Civic_Pulse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YASHATRE10/My_Civic_Pulse/discussions)
- **Email**: support@civicpulse.dev

---

## 🙏 Acknowledgments

- Spring Boot & React communities
- Contributors and testers
- Open source libraries and frameworks

---

**Made with ❤️ for better civic engagement**
