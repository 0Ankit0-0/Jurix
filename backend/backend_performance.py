"""
Performance Benchmark Script
Run before and after optimizations to measure improvements
"""

import time
import sys
import os
import psutil
import requests
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'

class PerformanceBenchmark:
    def __init__(self, base_url="http://localhost:5001"):
        self.base_url = base_url
        self.results = {}
        self.process = psutil.Process()
        
    def print_header(self, text):
        print(f"\n{Colors.BLUE}{'='*70}{Colors.END}")
        print(f"{Colors.BLUE}{text.center(70)}{Colors.END}")
        print(f"{Colors.BLUE}{'='*70}{Colors.END}\n")
    
    def print_test(self, name):
        print(f"{Colors.CYAN}🧪 Testing: {name}{Colors.END}", end=" ... ")
    
    def print_result(self, duration, status="success"):
        if status == "success":
            if duration < 1.0:
                color = Colors.GREEN
                emoji = "🚀"
            elif duration < 5.0:
                color = Colors.YELLOW
                emoji = "⚡"
            else:
                color = Colors.RED
                emoji = "🐌"
            print(f"{color}{emoji} {duration:.2f}s{Colors.END}")
        else:
            print(f"{Colors.RED}❌ Failed{Colors.END}")
    
    def test_server_health(self):
        """Test server health endpoint"""
        self.print_test("Server Health Check")
        
        try:
            start = time.time()
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            duration = time.time() - start
            
            if response.status_code == 200:
                self.results['health_check'] = duration
                self.print_result(duration)
                return True
            else:
                self.print_result(duration, "failed")
                return False
        except Exception as e:
            print(f"{Colors.RED}❌ Server not reachable: {e}{Colors.END}")
            return False
    
    def test_database_connection(self):
        """Test database connection speed"""
        self.print_test("Database Connection")
        
        try:
            from db.mongo import test_connection
            
            start = time.time()
            success, message = test_connection()
            duration = time.time() - start
            
            if success:
                self.results['db_connection'] = duration
                self.print_result(duration)
                return True
            else:
                self.print_result(duration, "failed")
                return False
        except Exception as e:
            print(f"{Colors.RED}❌ {e}{Colors.END}")
            return False
    
    def test_case_query(self):
        """Test case query performance"""
        self.print_test("Case Query (GET /api/cases)")
        
        try:
            from model.case_model import get_all_cases
            
            start = time.time()
            result = get_all_cases(page=1, per_page=20)
            duration = time.time() - start
            
            self.results['case_query'] = duration
            self.print_result(duration)
            print(f"         → Found {len(result.get('cases', []))} cases")
            return True
        except Exception as e:
            print(f"{Colors.RED}❌ {e}{Colors.END}")
            return False
    
    def test_document_parser(self):
        """Test document parser performance"""
        self.print_test("Document Parser (Image OCR)")
        
        # Create a test image if not exists
        test_image = "backend/test_image.png"
        if not os.path.exists(test_image):
            print(f"{Colors.YELLOW}⚠️  No test image found{Colors.END}")
            return False
        
        try:
            from services.parsing.document_parsing_services import master_parser
            
            start = time.time()
            result = master_parser(test_image, use_cache=False)
            duration = time.time() - start
            
            if 'error' not in result:
                self.results['document_parser'] = duration
                self.print_result(duration)
                print(f"         → Method: {result.get('extraction_method')}")
                print(f"         → Extracted: {result.get('word_count', 0)} words")
                return True
            else:
                self.print_result(duration, "failed")
                return False
        except Exception as e:
            print(f"{Colors.RED}❌ {e}{Colors.END}")
            return False
    
    def test_ai_agent_response(self):
        """Test AI agent response time"""
        self.print_test("AI Agent Response")
        
        try:
            from services.ai_services.ai_agents.prosecutor import ProsecutorAgent
            
            prosecutor = ProsecutorAgent()
            test_prompt = "Provide a brief opening statement for a theft case."
            
            start = time.time()
            response = prosecutor.respond(test_prompt, "test")
            duration = time.time() - start
            
            self.results['ai_response'] = duration
            self.print_result(duration)
            print(f"         → Response length: {len(response)} chars")
            
            # Cleanup
            prosecutor.clear_memory()
            return True
        except Exception as e:
            print(f"{Colors.RED}❌ {e}{Colors.END}")
            return False
    
    def test_memory_usage(self):
        """Check current memory usage"""
        self.print_test("Memory Usage")
        
        mem = self.process.memory_info()
        mem_mb = mem.rss / (1024 * 1024)
        
        self.results['memory_usage'] = mem_mb
        
        if mem_mb < 500:
            print(f"{Colors.GREEN}✅ {mem_mb:.0f} MB (Excellent){Colors.END}")
        elif mem_mb < 1000:
            print(f"{Colors.YELLOW}⚡ {mem_mb:.0f} MB (Good){Colors.END}")
        else:
            print(f"{Colors.RED}⚠️  {mem_mb:.0f} MB (High){Colors.END}")
        
        return True
    
    def test_database_indexes(self):
        """Check if database indexes exist"""
        self.print_test("Database Indexes")
        
        try:
            from db.mongo import get_db
            db = get_db()
            
            # Check cases collection indexes
            cases_indexes = db['cases'].index_information()
            
            required_indexes = ['user_id_1_created_at_-1', 'case_id_1', 'is_public_1_created_at_-1']
            missing = [idx for idx in required_indexes if idx not in cases_indexes]
            
            if not missing:
                print(f"{Colors.GREEN}✅ All indexes present{Colors.END}")
                self.results['indexes'] = True
                return True
            else:
                print(f"{Colors.YELLOW}⚠️  Missing {len(missing)} index(es){Colors.END}")
                print(f"         → Run: python backend/setup_indexes.py")
                self.results['indexes'] = False
                return False
        except Exception as e:
            print(f"{Colors.RED}❌ {e}{Colors.END}")
            return False
    
    def run_benchmark(self):
        """Run all benchmarks"""
        self.print_header("🚀 PERFORMANCE BENCHMARK")
        
        print(f"{Colors.CYAN}Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}\n")
        
        # Run tests
        tests = [
            ("Server Health", self.test_server_health),
            ("Database Connection", self.test_database_connection),
            ("Database Indexes", self.test_database_indexes),
            ("Case Query", self.test_case_query),
            ("Document Parser", self.test_document_parser),
            ("AI Agent Response", self.test_ai_agent_response),
            ("Memory Usage", self.test_memory_usage)
        ]
        
        passed = 0
        total = len(tests)
        
        for name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                print(f"{Colors.RED}❌ {name} failed: {e}{Colors.END}")
        
        # Results summary
        self.print_header("📊 BENCHMARK RESULTS")
        
        print(f"Tests Passed: {passed}/{total}\n")
        
        # Performance table
        print("Performance Metrics:")
        print("-" * 70)
        
        metrics = [
            ("Health Check", "health_check", 0.5, "s"),
            ("DB Connection", "db_connection", 1.0, "s"),
            ("Case Query", "case_query", 0.5, "s"),
            ("Document Parser", "document_parser", 5.0, "s"),
            ("AI Response", "ai_response", 3.0, "s"),
            ("Memory Usage", "memory_usage", 500, "MB")
        ]
        
        for name, key, threshold, unit in metrics:
            if key in self.results:
                value = self.results[key]
                
                if key == "memory_usage":
                    status = "✅" if value < threshold else "⚠️ "
                else:
                    status = "✅" if value < threshold else "⚠️ "
                
                print(f"{status} {name:25} {value:6.2f} {unit}")
        
        print("-" * 70)
        
        # Overall score
        score = (passed / total) * 100
        
        if score >= 80:
            grade = "A"
            color = Colors.GREEN
            emoji = "🎉"
        elif score >= 60:
            grade = "B"
            color = Colors.YELLOW
            emoji = "👍"
        else:
            grade = "C"
            color = Colors.RED
            emoji = "⚠️ "
        
        print(f"\n{color}{emoji} Overall Score: {score:.0f}% (Grade: {grade}){Colors.END}")
        
        # Recommendations
        self.print_recommendations()
        
        return self.results
    
    def print_recommendations(self):
        """Print optimization recommendations"""
        print("\n💡 Recommendations:")
        
        recommendations = []
        
        if self.results.get('document_parser', 999) > 10:
            recommendations.append("🔴 Document parser is slow - disable BLIP-2 on CPU")
        
        if self.results.get('db_connection', 999) > 2:
            recommendations.append("🟡 Database connection is slow - check timeout settings")
        
        if self.results.get('case_query', 999) > 1:
            recommendations.append("🟡 Queries are slow - add database indexes")
        
        if self.results.get('memory_usage', 0) > 1000:
            recommendations.append("🔴 High memory usage - implement cleanup")
        
        if not self.results.get('indexes', False):
            recommendations.append("🟡 Database indexes missing - run setup_indexes.py")
        
        if self.results.get('ai_response', 999) > 5:
            recommendations.append("🟡 AI responses are slow - add caching")
        
        if not recommendations:
            print("   ✅ All systems performing well!")
        else:
            for rec in recommendations:
                print(f"   {rec}")
    
    def save_results(self, filename="benchmark_results.json"):
        """Save benchmark results to file"""
        import json
        
        data = {
            'timestamp': datetime.now().isoformat(),
            'results': self.results
        }
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"\n💾 Results saved to: {filename}")

def main():
    """Main benchmark function"""
    print(f"{Colors.BLUE}")
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║           📊 PERFORMANCE BENCHMARK SUITE v1.0             ║
    ║           Measure Backend Performance Metrics             ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    print(f"{Colors.END}")
    
    benchmark = PerformanceBenchmark()
    results = benchmark.run_benchmark()
    
    # Ask to save results
    print(f"\n{Colors.CYAN}Save benchmark results? (y/n): {Colors.END}", end="")
    try:
        response = input().strip().lower()
        if response == 'y':
            benchmark.save_results()
    except:
        pass
    
    print(f"\n{Colors.GREEN}✅ Benchmark complete!{Colors.END}\n")

if __name__ == "__main__":
    main()