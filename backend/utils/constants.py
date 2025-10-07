# Case Types
CASE_TYPES = {
    'criminal': 'Criminal Law',
    'civil': 'Civil Law',
    'corporate': 'Corporate Law',
    'family': 'Family Law',
    'constitutional': 'Constitutional Law'
}

# Case Status
CASE_STATUS = {
    'draft': 'Draft',
    'ready_for_simulation': 'Ready for Simulation',
    'in_simulation': 'In Simulation',
    'completed': 'Completed',
    'archived': 'Archived'
}

# Evidence Types
EVIDENCE_TYPES = {
    'document': 'Document',
    'image': 'Image',
    'video': 'Video',
    'audio': 'Audio',
    'other': 'Other'
}

# File Size Limits
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
MAX_EVIDENCE_PER_CASE = 20

# Simulation Settings
SIMULATION_TIMEOUT = 300  # 5 minutes
MAX_SIMULATION_RETRIES = 3

# API Rate Limits
API_RATE_LIMIT = {
    'gemini': 60,  # requests per minute
    'openai': 50,  # requests per minute
}

# Report Settings
REPORT_MAX_LENGTH = 10000  # characters
SUMMARY_MAX_LENGTH = 500  # characters