#!/usr/bin/env python3
"""
Backend API Tests for WebBoost Martinique
Tests all API endpoints using the public URL from frontend/.env
"""

import requests
import sys
import json
from datetime import datetime

class WebBoostAPITester:
    def __init__(self, base_url="http://localhost:8001/api"):
        # Use the local backend endpoint for testing
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failures = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED")
        else:
            self.failures.append(f"{test_name}: {details}")
            print(f"❌ {test_name}: FAILED - {details}")

    def test_health_endpoint(self):
        """Test GET /api/health"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "ok":
                    self.log_result("Health Check", True, f"Status: {data}")
                    return True
                else:
                    self.log_result("Health Check", False, f"Invalid response format: {data}")
            else:
                self.log_result("Health Check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
        return False

    def test_contact_endpoint(self):
        """Test POST /api/contact"""
        test_payload = {
            "name": "Test User",
            "email": "test@example.com", 
            "phone": "0596123456",
            "sector": "Test Sector",
            "pack": "Essentiel Local",
            "message": "Test message for API testing",
            "consent": True,
            "source": "api_test"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/contact",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                if "id" in data and "saved" in data:
                    self.log_result("Contact Submission", True, f"Response: {data}")
                    return True
                else:
                    self.log_result("Contact Submission", False, f"Invalid response format: {data}")
            else:
                self.log_result("Contact Submission", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Contact Submission", False, f"Exception: {str(e)}")
        return False

    def test_contact_validation(self):
        """Test POST /api/contact with invalid data (missing consent)"""
        invalid_payload = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "0596123456", 
            "consent": False  # Should fail validation
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/contact",
                json=invalid_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 400:
                self.log_result("Contact Validation", True, "Correctly rejected invalid data")
                return True
            else:
                self.log_result("Contact Validation", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_result("Contact Validation", False, f"Exception: {str(e)}")
        return False

    def test_chat_endpoint(self):
        """Test POST /api/chat"""
        test_payload = {
            "messages": [
                {"role": "user", "content": "Comprendre le paiement 50/40/10"}
            ],
            "temperature": 0.3
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30  # Longer timeout for LLM calls
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data and "used_llm" in data:
                    reply_length = len(data["reply"])
                    self.log_result("Chat Endpoint", True, f"Reply length: {reply_length}, Used LLM: {data['used_llm']}")
                    return True
                else:
                    self.log_result("Chat Endpoint", False, f"Invalid response format: {data}")
            else:
                self.log_result("Chat Endpoint", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Chat Endpoint", False, f"Exception: {str(e)}")
        return False

    def test_kpi_endpoint(self):
        """Test GET /api/kpi"""
        try:
            response = requests.get(f"{self.base_url}/kpi", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "leads" in data and "chats" in data:
                    self.log_result("KPI Endpoint", True, f"KPI data: {data}")
                    return True
                else:
                    self.log_result("KPI Endpoint", False, f"Invalid response format: {data}")
            else:
                self.log_result("KPI Endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("KPI Endpoint", False, f"Exception: {str(e)}")
        return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting WebBoost Martinique Backend API Tests")
        print("=" * 60)
        
        # Test all endpoints
        self.test_health_endpoint()
        self.test_contact_endpoint()
        self.test_contact_validation()
        self.test_chat_endpoint()
        self.test_kpi_endpoint()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failures:
            print("\n❌ Failed Tests:")
            for failure in self.failures:
                print(f"  - {failure}")
        else:
            print("\n✅ All tests passed!")
        
        return len(self.failures) == 0

def main():
    """Main test runner"""
    tester = WebBoostAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())