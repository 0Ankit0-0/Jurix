import os
import json
from datetime import datetime
from typing import Dict, Any

class DocumentExporter:
    """Export documents in various formats"""
    
    def __init__(self):
        self.export_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'exports')
        os.makedirs(self.export_dir, exist_ok=True)
        os.makedirs(os.path.join(self.export_dir, 'reports'), exist_ok=True)
        os.makedirs(os.path.join(self.export_dir, 'sessions'), exist_ok=True)
    
    def export_json(self, data: Dict, filename: str = None) -> str:
        """Export data as JSON"""
        if not filename:
            filename = f"export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        
        filepath = os.path.join(self.export_dir, 'reports', filename)
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        return filepath
    
    def export_text(self, content: str, filename: str = None) -> str:
        """Export content as text file"""
        if not filename:
            filename = f"report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.txt"
        
        filepath = os.path.join(self.export_dir, 'reports', filename)
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        return filepath
    
    def export_session(self, session_data: Dict) -> str:
        """Export simulation session data"""
        filename = f"session_{session_data.get('case_id')}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(self.export_dir, 'sessions', filename)
        
        with open(filepath, 'w') as f:
            json.dump(session_data, f, indent=2, default=str)
        
        return filepath