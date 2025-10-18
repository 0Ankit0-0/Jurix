# Jurix Backend

The backend for the Jurix legal simulation platform, built with Flask and providing RESTful APIs for user authentication, case management, simulations, reports, discussions, uploads, and chatbot interactions.

## Features

- **CORS Support**: Configured for frontend integration
- **SocketIO**: Real-time communication for simulations
- **Blueprint-based Routing**: Modular API structure
- **JWT Authentication**: Secure user authentication
- **Document Processing**: PDF, DOCX, and image handling
- **AI Services**: Integration with Gemini, OpenAI, and custom AI agents
- **OCR**: Text extraction from images and documents
- **Table Extraction**: Advanced table parsing from documents
- **MongoDB**: Database for storing cases, users, and evidence

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Cases
- `GET /api/cases` - List user cases
- `POST /api/cases` - Create new case
- `GET /api/cases/<id>` - Get case details
- `PUT /api/cases/<id>` - Update case
- `DELETE /api/cases/<id>` - Delete case

### Simulations
- `POST /api/simulations/start` - Start legal simulation
- `GET /api/simulations/<id>` - Get simulation status
- `POST /api/simulations/<id>/message` - Send message in simulation

### Reports
- `GET /api/reports/<case_id>` - Generate case report
- `POST /api/reports/export` - Export report as PDF

### Discussions
- `GET /api/discussions/<case_id>` - Get case discussions
- `POST /api/discussions/<case_id>` - Add discussion

### Uploads
- `POST /api/upload/evidence` - Upload evidence files
- `GET /api/upload/files/<filename>` - Download uploaded files

### Chatbot
- `POST /api/chatbot/message` - Send message to chatbot

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Create a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
ENVIRONMENT=development
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://localhost:27017/jurix
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

## Running the Application

### Development
```bash
python app.py
```

The server will start on `http://localhost:5001`

### Production
```bash
gunicorn --bind 0.0.0.0:5001 app:app
```

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── socketio_instance.py  # SocketIO configuration
├── db/
│   └── mongo.py          # MongoDB connection
├── routes/
│   ├── auth.py           # Authentication routes
│   ├── case_route.py     # Case management routes
│   ├── simulation_route.py # Simulation routes
│   ├── report_route.py   # Report generation routes
│   ├── discussion_route.py # Discussion routes
│   ├── upload.py         # File upload routes
│   └── chatbot_route.py  # Chatbot routes
├── services/
│   ├── ai_services/      # AI integrations
│   ├── parsing/          # Document parsing services
│   └── document_Service/ # Document processing
├── model/                # Data models
├── middleware/           # Custom middleware
├── utils/                # Utility functions
└── tests/                # Unit tests
```

## Dependencies

The backend uses the following key dependencies:

- **Flask**: Web framework
- **Flask-SocketIO**: Real-time communication
- **PyMongo**: MongoDB driver
- **PyJWT**: JWT token handling
- **Google Generative AI**: AI services
- **OpenAI**: AI services
- **Transformers**: NLP models
- **PyMuPDF**: PDF processing
- **EasyOCR**: OCR functionality
- **Pillow**: Image processing
- **ReportLab**: PDF generation

## Health Check

The application provides a health check endpoint at `/api/health` that verifies:
- Database connectivity
- Service availability
- Environment status

## Error Handling

The application includes comprehensive error handling with:
- 404 error responses for unknown routes
- 500 error responses for server errors
- Detailed logging for debugging
- CORS preflight handling

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation as needed
4. Ensure all dependencies are properly listed in requirements.txt

## License

This project is part of the Jurix legal simulation platform.
