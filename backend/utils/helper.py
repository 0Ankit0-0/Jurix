from datetime import datetime
import hashlib
import uuid

def generate_case_id() -> str:
    """Generate unique case ID"""
    return f"CASE_{uuid.uuid4().hex[:8].upper()}"

def generate_evidence_id() -> str:
    """Generate unique evidence ID"""
    return f"EVD_{uuid.uuid4().hex[:8].upper()}"

def format_timestamp(dt: datetime = None) -> str:
    """Format datetime for display"""
    if dt is None:
        dt = datetime.utcnow()
    return dt.strftime('%Y-%m-%d %H:%M:%S UTC')

def calculate_file_hash(filepath: str) -> str:
    """Calculate SHA256 hash of file"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def paginate_results(items: list, page: int = 1, per_page: int = 10) -> dict:
    """Paginate list of items"""
    total = len(items)
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        'items': items[start:end],
        'page': page,
        'per_page': per_page,
        'total': total,
        'pages': (total + per_page - 1) // per_page
    }