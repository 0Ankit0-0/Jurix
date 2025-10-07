from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.auth import user_bp
from routes.case_route import case_bp
from routes.simulation_route import simulation_bp
from routes.report_route import report_bp
from routes.discussion_route import discussion_bp
from routes.upload import upload_bp
from routes.chatbot_route import chatbot_bp
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS setup - more explicit configuration
if os.getenv("ENVIRONMENT") == "production":
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://jurix.vercel.app",
        "https://*.app.github.dev",
        "https://accounts.google.com",
        "https://oauth2.googleapis.com",
        "https://www.googleapis.com",
        "https://ssl.gstatic.com",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
    ]

print(f"🔧 Configured CORS origins: {allowed_origins}")

CORS(app,
     origins=allowed_origins,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
     allow_headers=[
         "Content-Type", 
         "Authorization", 
         "X-Requested-With", 
         "Accept", 
         "Origin",
         "Access-Control-Request-Method",
         "Access-Control-Request-Headers",
         "X-CSRF-Token"
     ],
     supports_credentials=True,
     expose_headers=["Content-Range", "X-Content-Range"],
     max_age=3600
)

@app.before_request
def handle_preflight():
    """Handle CORS preflight requests"""
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        headers = response.headers
        origin = request.headers.get('Origin')
        
        # Allow specific origin or all if in development
        if origin and (origin in allowed_origins or os.getenv("ENVIRONMENT") != "production"):
            headers['Access-Control-Allow-Origin'] = origin
        
        headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
        headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With,Accept,Origin'
        headers['Access-Control-Allow-Credentials'] = 'true'
        headers['Access-Control-Max-Age'] = '3600'
        
        return response

@app.before_request
def log_request():
    """Log all incoming requests for debugging"""
    if request.endpoint and not request.endpoint.startswith('static'):
        print(f"📥 {request.method} {request.path} - Origin: {request.headers.get('Origin', 'None')}")

# Register all blueprints with error handling
try:
    app.register_blueprint(user_bp, url_prefix="/api")
    print("✅ Auth routes registered")
except Exception as e:
    print(f"❌ Failed to register auth routes: {e}")

try:
    app.register_blueprint(case_bp, url_prefix="/api")  
    print("✅ Case routes registered")
except Exception as e:
    print(f"❌ Failed to register case routes: {e}")

try:
    app.register_blueprint(simulation_bp, url_prefix="/api")
    print("✅ Simulation routes registered") 
except Exception as e:
    print(f"❌ Failed to register simulation routes: {e}")

try:
    app.register_blueprint(report_bp, url_prefix="/api")
    print("✅ Report routes registered")
except Exception as e:
    print(f"❌ Failed to register report routes: {e}")

try:
    app.register_blueprint(discussion_bp, url_prefix="/api")
    print("✅ Discussion routes registered")
except Exception as e:
    print(f"❌ Failed to register discussion routes: {e}")

try:
    app.register_blueprint(upload_bp, url_prefix="/api")
    print("✅ Upload routes registered")
except Exception as e:
    print(f"❌ Failed to register upload routes: {e}")

try:
    app.register_blueprint(chatbot_bp, url_prefix="/api")
    print("✅ Chatbot routes registered")
except Exception as e:
    print(f"❌ Failed to register chatbot routes: {e}")

# Root endpoint
@app.route("/")
def home():
    return jsonify({"message": "Jurix Backend is running! 🏛️", "status": "healthy"})

# Favicon handler to prevent 404 errors
@app.route("/favicon.ico")
def favicon():
    """Handle favicon requests to prevent 404 errors"""
    return '', 204

# Enhanced health check
@app.route("/api/health")
def health_check():
    try:
        # Test database connection
        from db.mongo import test_connection
        db_status, db_message = test_connection()
        
        return jsonify({
            "status": "All systems running!",
            "services": ["auth", "cases", "simulation", "reports", "discussions"],
            "database": {
                "status": "healthy" if db_status else "unhealthy",
                "message": db_message
            },
            "environment": os.getenv('ENVIRONMENT', 'development'),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "Partial outage",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

# 404 error handler
@app.errorhandler(404)
def handle_not_found(error):
    print(f"❌ 404 Not Found: {request.path}")
    return jsonify({
        "error": "Not Found",
        "message": "The requested resource was not found on this server."
    }), 404

# Global error handler
@app.errorhandler(Exception)
def handle_error(error):
    print(f"❌ Unhandled error: {error}")
    import traceback
    traceback.print_exc()
    return jsonify({
        "error": "Internal server error",
        "message": str(error) if os.getenv("ENVIRONMENT") != "production" else "Something went wrong"
    }), 500

if __name__ == "__main__":
    print("🚀 Starting Jurix Backend...")
    print(f"🌐 CORS origins: {allowed_origins}")
    print(f"🔧 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"🔑 JWT Secret configured: {'Yes' if os.getenv('JWT_SECRET') else 'No'}")
    print(f"🗄️ MongoDB URI configured: {'Yes' if os.getenv('MONGO_URI') else 'No'}")
    
    app.run(debug=True, host="0.0.0.0", port=5001 )
    