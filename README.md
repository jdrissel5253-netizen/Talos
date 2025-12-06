# Talos HVAC Hiring Platform

A modern, professional landing page for Talos - an HVAC hiring platform with Java Spring Boot backend and React TypeScript frontend.

## Features

- **Professional Landing Page**: Clean, modern design matching high-quality standards
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Interactive Components**: Navigation dropdowns, FAQ accordion, demo request modal
- **Java Spring Boot Backend**: RESTful API with demo request handling
- **React TypeScript Frontend**: Modern component architecture with styled-components

## Project Structure

```
talos-website/
├── backend/          # Java Spring Boot application
│   ├── src/
│   │   └── main/
│   │       ├── java/com/talos/backend/
│   │       └── resources/
│   └── pom.xml
└── frontend/         # React TypeScript application
    ├── src/
    │   ├── components/
    │   └── App.tsx
    └── package.json
```

## Getting Started

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Run the Spring Boot application:**
   ```bash
   ./mvnw spring-boot:run
   ```

   Or on Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

3. **Backend will be available at:** `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Frontend will be available at:** `http://localhost:3000`

## API Endpoints

- `POST /api/demo-request` - Submit demo request form
- `GET /api/health` - Health check endpoint

## Design Features

### Header
- Fixed navigation with Talos logo
- Dropdown menus for "Why Talos?" and "Product"
- Login and "Get Demo" call-to-action buttons

### Hero Section
- Prominent headline: "Your tool for finding reliable techs, and office support"
- Professional background with trust indicators
- Primary call-to-action button

### Content Sections
- **Job Board Section**: "Post on 100+ job boards" highlight
- **Value Propositions**: Premium AI sourcing, accelerated visibility, HVAC insights
- **FAQ Section**: Interactive accordion with common questions

### Footer
- Complete navigation links
- Company information and social links
- Professional styling with dark theme

### Demo Modal
- Professional form for demo requests
- Form validation and submission to backend
- Success confirmation with auto-close

## Styling

- **Color Scheme**: Dark green (#1a5a3a) primary, clean whites and grays
- **Typography**: Modern sans-serif fonts optimized for readability
- **Responsive**: Mobile-first design with breakpoints
- **Animations**: Smooth transitions and hover effects

## Technologies Used

### Backend
- Java 17
- Spring Boot 3.1.5
- Spring Web
- Spring Data JPA
- H2 Database (development)
- Maven

### Frontend
- React 18
- TypeScript
- Styled Components
- Modern CSS Grid and Flexbox
- Responsive Design Principles

## Development

Both applications support hot reload during development:
- Backend: Changes to Java files trigger automatic restart
- Frontend: Changes to React components update immediately

## Production Deployment

### Backend
```bash
cd backend
./mvnw clean package
java -jar target/talos-backend-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
# Deploy build/ directory to your web server
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

Built with ❤️ for HVAC professionals seeking reliable hiring solutions.