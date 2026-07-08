#!/usr/bin/env python3
"""
AgencyOS AI Backend API Test Suite
Tests all backend endpoints with realistic data
"""

import requests
import json
import time
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://agencyos-ai-1.preview.emergentagent.com/api"

# Test data - realistic restaurant business
TEST_USER = {
    "name": "Sarah Martinez",
    "email": f"sarah.martinez.{int(time.time())}@agencytest.com",
    "password": "SecurePass123!"
}

TEST_BUSINESS = {
    "id": "test-biz-001",
    "name": "Bella Vista Italian Kitchen",
    "category": "restaurant",
    "city": "Austin",
    "address": "456 Congress Ave, Austin, TX 78701",
    "rating": 4.6,
    "reviewCount": 287,
    "hasInstagram": False,
    "hasFacebook": True,
    "website": None,
    "phone": "+1-512-555-0199"
}

# Global test state
token = None
user_id = None
saved_lead_id = None
demo_id = None
deployment_id = None

def log_test(name, status, details=""):
    """Log test result"""
    symbol = "✅" if status == "PASS" else "❌"
    print(f"\n{symbol} {name}")
    if details:
        print(f"   {details}")

def test_auth_register():
    """Test 1: POST /api/auth/register"""
    global token, user_id
    try:
        print("\n" + "="*60)
        print("TEST 1: POST /api/auth/register")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=TEST_USER,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            if 'token' in data and 'user' in data:
                token = data['token']
                user_id = data['user']['id']
                log_test("Auth Register", "PASS", f"Token received, User ID: {user_id}")
                return True
            else:
                log_test("Auth Register", "FAIL", "Missing token or user in response")
                return False
        else:
            log_test("Auth Register", "FAIL", f"Expected 200, got {response.status_code}")
            return False
            
    except Exception as e:
        log_test("Auth Register", "FAIL", f"Exception: {str(e)}")
        return False

def test_auth_login():
    """Test 2: POST /api/auth/login"""
    global token
    try:
        print("\n" + "="*60)
        print("TEST 2: POST /api/auth/login")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": TEST_USER["email"], "password": TEST_USER["password"]},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            if 'token' in data and data['token'] == token:
                log_test("Auth Login", "PASS", "Same token returned")
                return True
            else:
                log_test("Auth Login", "FAIL", "Token mismatch or missing")
                return False
        else:
            log_test("Auth Login", "FAIL", f"Expected 200, got {response.status_code}")
            return False
            
    except Exception as e:
        log_test("Auth Login", "FAIL", f"Exception: {str(e)}")
        return False

def test_auth_me():
    """Test 3: GET /api/auth/me"""
    try:
        print("\n" + "="*60)
        print("TEST 3: GET /api/auth/me")
        print("="*60)
        
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            if 'user' in data and data['user']['email'] == TEST_USER['email']:
                log_test("Auth Me", "PASS", f"User verified: {data['user']['name']}")
                return True
            else:
                log_test("Auth Me", "FAIL", "User data mismatch")
                return False
        else:
            log_test("Auth Me", "FAIL", f"Expected 200, got {response.status_code}")
            return False
            
    except Exception as e:
        log_test("Auth Me", "FAIL", f"Exception: {str(e)}")
        return False

def test_auth_google():
    """Test 4: POST /api/auth/google (mocked)"""
    try:
        print("\n" + "="*60)
        print("TEST 4: POST /api/auth/google (MOCK)")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/auth/google",
            json={"name": "Google Test User", "email": f"google.test.{int(time.time())}@gmail.com"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            if 'token' in data and 'mocked' in data and data['mocked'] == True:
                log_test("Auth Google (Mock)", "PASS", "Mock Google OAuth working")
                return True
            else:
                log_test("Auth Google (Mock)", "FAIL", "Missing token or mocked flag")
                return False
        else:
            log_test("Auth Google (Mock)", "FAIL", f"Expected 200, got {response.status_code}")
            return False
            
    except Exception as e:
        log_test("Auth Google (Mock)", "FAIL", f"Exception: {str(e)}")
        return False

def test_leads_search():
    """Test 5: POST /api/leads/search"""
    try:
        print("\n" + "="*60)
        print("TEST 5: POST /api/leads/search")
        print("="*60)
        
        # First search
        response1 = requests.post(
            f"{BASE_URL}/leads/search",
            json={"city": "Austin", "category": "restaurant", "limit": 5},
            timeout=30
        )
        
        print(f"Status Code: {response1.status_code}")
        data1 = response1.json()
        print(f"Response: {json.dumps(data1, indent=2)[:500]}...")
        
        if response1.status_code != 200:
            log_test("Leads Search", "FAIL", f"Expected 200, got {response1.status_code}")
            return False
        
        if 'leads' not in data1 or len(data1['leads']) != 5:
            log_test("Leads Search", "FAIL", f"Expected 5 leads, got {len(data1.get('leads', []))}")
            return False
        
        # Verify lead structure
        lead = data1['leads'][0]
        required_fields = ['name', 'rating', 'address']
        missing = [f for f in required_fields if f not in lead]
        if missing:
            log_test("Leads Search", "FAIL", f"Missing fields: {missing}")
            return False
        
        # Second search - verify same results (seeded)
        time.sleep(1)
        response2 = requests.post(
            f"{BASE_URL}/leads/search",
            json={"city": "Austin", "category": "restaurant", "limit": 5},
            timeout=30
        )
        data2 = response2.json()
        
        if data1['leads'][0]['name'] == data2['leads'][0]['name']:
            log_test("Leads Search", "PASS", f"Seeded data consistent, {len(data1['leads'])} leads returned")
            return True
        else:
            log_test("Leads Search", "FAIL", "Seeded data not consistent between calls")
            return False
            
    except Exception as e:
        log_test("Leads Search", "FAIL", f"Exception: {str(e)}")
        return False

def test_leads_score():
    """Test 6: POST /api/leads/score (Gemini AI)"""
    try:
        print("\n" + "="*60)
        print("TEST 6: POST /api/leads/score (Gemini 2.5 Flash)")
        print("="*60)
        print("⏳ This may take up to 45 seconds...")
        
        response = requests.post(
            f"{BASE_URL}/leads/score",
            json={"business": TEST_BUSINESS},
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code != 200:
            log_test("Leads Score (AI)", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        # Verify required fields
        required = ['score', 'verdict', 'summary', 'breakdown', 'opportunities', 'pitchAngle']
        missing = [f for f in required if f not in data]
        if missing:
            log_test("Leads Score (AI)", "FAIL", f"Missing fields: {missing}")
            return False
        
        # Verify breakdown structure
        breakdown_fields = ['digitalPresence', 'businessSignal', 'aiFit', 'reachability']
        missing_breakdown = [f for f in breakdown_fields if f not in data['breakdown']]
        if missing_breakdown:
            log_test("Leads Score (AI)", "FAIL", f"Missing breakdown fields: {missing_breakdown}")
            return False
        
        # Verify score range
        if not (0 <= data['score'] <= 100):
            log_test("Leads Score (AI)", "FAIL", f"Score {data['score']} out of range 0-100")
            return False
        
        # Verify opportunities is array
        if not isinstance(data['opportunities'], list):
            log_test("Leads Score (AI)", "FAIL", "Opportunities should be an array")
            return False
        
        log_test("Leads Score (AI)", "PASS", f"Score: {data['score']}, Verdict: {data['verdict']}")
        return True
            
    except Exception as e:
        log_test("Leads Score (AI)", "FAIL", f"Exception: {str(e)}")
        return False

def test_demo_generate():
    """Test 7: POST /api/demo/generate (Gemini AI)"""
    global demo_id
    try:
        print("\n" + "="*60)
        print("TEST 7: POST /api/demo/generate (Gemini)")
        print("="*60)
        print("⏳ This may take up to 60 seconds...")
        
        response = requests.post(
            f"{BASE_URL}/demo/generate",
            json={"business": TEST_BUSINESS},
            timeout=75
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        if 'demo' in data:
            print(f"Demo keys: {list(data['demo'].keys())}")
        
        if response.status_code != 200:
            log_test("Demo Generate (AI)", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        if 'id' not in data or 'demo' not in data:
            log_test("Demo Generate (AI)", "FAIL", "Missing id or demo in response")
            return False
        
        demo_id = data['id']
        demo = data['demo']
        
        # Verify demo structure
        required = ['brand', 'hero', 'about', 'services', 'features', 'testimonials', 'faq', 'cta', 'contact']
        missing = [f for f in required if f not in demo]
        if missing:
            log_test("Demo Generate (AI)", "FAIL", f"Missing demo fields: {missing}")
            return False
        
        # Verify counts
        if len(demo['services']) != 4:
            log_test("Demo Generate (AI)", "FAIL", f"Expected 4 services, got {len(demo['services'])}")
            return False
        
        if len(demo['testimonials']) != 3:
            log_test("Demo Generate (AI)", "FAIL", f"Expected 3 testimonials, got {len(demo['testimonials'])}")
            return False
        
        if len(demo['faq']) != 5:
            log_test("Demo Generate (AI)", "FAIL", f"Expected 5 FAQs, got {len(demo['faq'])}")
            return False
        
        log_test("Demo Generate (AI)", "PASS", f"Demo ID: {demo_id}, Brand: {demo['brand'].get('vibe', 'N/A')}")
        return True
            
    except Exception as e:
        log_test("Demo Generate (AI)", "FAIL", f"Exception: {str(e)}")
        return False

def test_leads_save():
    """Test 8: POST /api/leads (save to CRM)"""
    global saved_lead_id
    try:
        print("\n" + "="*60)
        print("TEST 8: POST /api/leads (Save to CRM)")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/leads",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "business": TEST_BUSINESS,
                "score": {"score": 85, "verdict": "hot"}
            },
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code != 200:
            log_test("Leads Save", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        if 'id' not in data or 'stage' not in data:
            log_test("Leads Save", "FAIL", "Missing id or stage in response")
            return False
        
        if data['stage'] != 'new':
            log_test("Leads Save", "FAIL", f"Expected stage='new', got '{data['stage']}'")
            return False
        
        saved_lead_id = data['id']
        log_test("Leads Save", "PASS", f"Lead saved with ID: {saved_lead_id}")
        return True
            
    except Exception as e:
        log_test("Leads Save", "FAIL", f"Exception: {str(e)}")
        return False

def test_leads_get():
    """Test 9: GET /api/leads"""
    try:
        print("\n" + "="*60)
        print("TEST 9: GET /api/leads")
        print("="*60)
        
        response = requests.get(
            f"{BASE_URL}/leads",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)[:500]}...")
        
        if response.status_code != 200:
            log_test("Leads Get", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        if 'leads' not in data:
            log_test("Leads Get", "FAIL", "Missing leads in response")
            return False
        
        if len(data['leads']) == 0:
            log_test("Leads Get", "FAIL", "Expected at least 1 saved lead")
            return False
        
        # Verify our saved lead is in the list
        found = any(lead['id'] == saved_lead_id for lead in data['leads'])
        if not found:
            log_test("Leads Get", "FAIL", f"Saved lead {saved_lead_id} not found in list")
            return False
        
        log_test("Leads Get", "PASS", f"Retrieved {len(data['leads'])} saved leads")
        return True
            
    except Exception as e:
        log_test("Leads Get", "FAIL", f"Exception: {str(e)}")
        return False

def test_leads_patch():
    """Test 10: PATCH /api/leads/:id"""
    try:
        print("\n" + "="*60)
        print("TEST 10: PATCH /api/leads/:id")
        print("="*60)
        
        response = requests.patch(
            f"{BASE_URL}/leads/{saved_lead_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"stage": "contacted"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code != 200:
            log_test("Leads Patch", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        if data.get('stage') != 'contacted':
            log_test("Leads Patch", "FAIL", f"Expected stage='contacted', got '{data.get('stage')}'")
            return False
        
        log_test("Leads Patch", "PASS", f"Lead stage updated to 'contacted'")
        return True
            
    except Exception as e:
        log_test("Leads Patch", "FAIL", f"Exception: {str(e)}")
        return False

def test_deployments_create():
    """Test 11: POST /api/deployments"""
    global deployment_id
    try:
        print("\n" + "="*60)
        print("TEST 11: POST /api/deployments (MOCK)")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/deployments",
            headers={"Authorization": f"Bearer {token}"},
            json={"business": TEST_BUSINESS, "demoId": demo_id},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code != 200:
            log_test("Deployments Create", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        required = ['id', 'liveUrl', 'repoUrl', 'status']
        missing = [f for f in required if f not in data]
        if missing:
            log_test("Deployments Create", "FAIL", f"Missing fields: {missing}")
            return False
        
        if data['status'] != 'building':
            log_test("Deployments Create", "FAIL", f"Expected status='building', got '{data['status']}'")
            return False
        
        deployment_id = data['id']
        log_test("Deployments Create", "PASS", f"Deployment created: {data['liveUrl']}")
        return True
            
    except Exception as e:
        log_test("Deployments Create", "FAIL", f"Exception: {str(e)}")
        return False

def test_deployments_status():
    """Test 12: GET /api/deployments (verify status change)"""
    try:
        print("\n" + "="*60)
        print("TEST 12: GET /api/deployments (Status Check)")
        print("="*60)
        print("⏳ Waiting 3 seconds for mock deployment to complete...")
        
        time.sleep(3)
        
        response = requests.get(
            f"{BASE_URL}/deployments",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code != 200:
            log_test("Deployments Status", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        if 'deployments' not in data:
            log_test("Deployments Status", "FAIL", "Missing deployments in response")
            return False
        
        # Find our deployment
        deployment = next((d for d in data['deployments'] if d['id'] == deployment_id), None)
        if not deployment:
            log_test("Deployments Status", "FAIL", f"Deployment {deployment_id} not found")
            return False
        
        if deployment['status'] != 'ready':
            log_test("Deployments Status", "FAIL", f"Expected status='ready', got '{deployment['status']}'")
            return False
        
        log_test("Deployments Status", "PASS", f"Deployment status changed to 'ready'")
        return True
            
    except Exception as e:
        log_test("Deployments Status", "FAIL", f"Exception: {str(e)}")
        return False

def test_whatsapp_send():
    """Test 13: POST /api/whatsapp/send"""
    try:
        print("\n" + "="*60)
        print("TEST 13: POST /api/whatsapp/send (MOCK)")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/whatsapp/send",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "to": "+15125550199",
                "template": "agency_intro",
                "variables": {"business_name": "Bella Vista"}
            },
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code != 200:
            log_test("WhatsApp Send", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        if data.get('mocked') != True:
            log_test("WhatsApp Send", "FAIL", "Expected mocked=true")
            return False
        
        if data.get('status') != 'queued':
            log_test("WhatsApp Send", "FAIL", f"Expected status='queued', got '{data.get('status')}'")
            return False
        
        log_test("WhatsApp Send", "PASS", "Mock WhatsApp message queued")
        return True
            
    except Exception as e:
        log_test("WhatsApp Send", "FAIL", f"Exception: {str(e)}")
        return False

def test_stats():
    """Test 14: GET /api/stats"""
    try:
        print("\n" + "="*60)
        print("TEST 14: GET /api/stats")
        print("="*60)
        
        response = requests.get(
            f"{BASE_URL}/stats",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code != 200:
            log_test("Stats", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        required = ['leadsSaved', 'demos', 'deployments', 'hotLeads', 'trend']
        missing = [f for f in required if f not in data]
        if missing:
            log_test("Stats", "FAIL", f"Missing fields: {missing}")
            return False
        
        if not isinstance(data['trend'], list):
            log_test("Stats", "FAIL", "Trend should be an array")
            return False
        
        log_test("Stats", "PASS", f"Leads: {data['leadsSaved']}, Demos: {data['demos']}, Deployments: {data['deployments']}")
        return True
            
    except Exception as e:
        log_test("Stats", "FAIL", f"Exception: {str(e)}")
        return False

def test_unauthorized_access():
    """Test 15: Verify 401 for protected endpoints without auth"""
    try:
        print("\n" + "="*60)
        print("TEST 15: Unauthorized Access (401)")
        print("="*60)
        
        endpoints = [
            ("GET", "/auth/me"),
            ("GET", "/leads"),
            ("POST", "/leads"),
            ("GET", "/stats"),
        ]
        
        all_passed = True
        for method, endpoint in endpoints:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=30)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", json={}, timeout=30)
            
            print(f"{method} {endpoint}: {response.status_code}")
            if response.status_code != 401:
                print(f"  ❌ Expected 401, got {response.status_code}")
                all_passed = False
            else:
                print(f"  ✅ Correctly returned 401")
        
        if all_passed:
            log_test("Unauthorized Access", "PASS", "All protected endpoints return 401")
            return True
        else:
            log_test("Unauthorized Access", "FAIL", "Some endpoints did not return 401")
            return False
            
    except Exception as e:
        log_test("Unauthorized Access", "FAIL", f"Exception: {str(e)}")
        return False

def test_invalid_credentials():
    """Test 16: Verify 401 for invalid credentials"""
    try:
        print("\n" + "="*60)
        print("TEST 16: Invalid Credentials (401)")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": TEST_USER["email"], "password": "WrongPassword123!"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 401:
            log_test("Invalid Credentials", "PASS", "Correctly returned 401 for wrong password")
            return True
        else:
            log_test("Invalid Credentials", "FAIL", f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        log_test("Invalid Credentials", "FAIL", f"Exception: {str(e)}")
        return False

def test_missing_fields():
    """Test 17: Verify 400 for missing required fields"""
    try:
        print("\n" + "="*60)
        print("TEST 17: Missing Required Fields (400)")
        print("="*60)
        
        # Test register without email
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={"name": "Test", "password": "test123"},
            timeout=30
        )
        
        print(f"Register without email: {response.status_code}")
        if response.status_code != 400:
            log_test("Missing Fields", "FAIL", f"Expected 400 for missing email, got {response.status_code}")
            return False
        
        # Test leads/search without city
        response = requests.post(
            f"{BASE_URL}/leads/search",
            json={"category": "restaurant"},
            timeout=30
        )
        
        print(f"Search without city: {response.status_code}")
        if response.status_code != 400:
            log_test("Missing Fields", "FAIL", f"Expected 400 for missing city, got {response.status_code}")
            return False
        
        log_test("Missing Fields", "PASS", "Correctly returned 400 for missing required fields")
        return True
            
    except Exception as e:
        log_test("Missing Fields", "FAIL", f"Exception: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("AGENCYOS AI BACKEND API TEST SUITE")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    # Core functionality tests
    results.append(("Auth Register", test_auth_register()))
    results.append(("Auth Login", test_auth_login()))
    results.append(("Auth Me", test_auth_me()))
    results.append(("Auth Google (Mock)", test_auth_google()))
    results.append(("Leads Search", test_leads_search()))
    results.append(("Leads Score (AI)", test_leads_score()))
    results.append(("Demo Generate (AI)", test_demo_generate()))
    results.append(("Leads Save", test_leads_save()))
    results.append(("Leads Get", test_leads_get()))
    results.append(("Leads Patch", test_leads_patch()))
    results.append(("Deployments Create", test_deployments_create()))
    results.append(("Deployments Status", test_deployments_status()))
    results.append(("WhatsApp Send", test_whatsapp_send()))
    results.append(("Stats", test_stats()))
    
    # Security tests
    results.append(("Unauthorized Access", test_unauthorized_access()))
    results.append(("Invalid Credentials", test_invalid_credentials()))
    results.append(("Missing Fields", test_missing_fields()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    failed = len(results) - passed
    
    print(f"\nTotal Tests: {len(results)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"\nSuccess Rate: {(passed/len(results)*100):.1f}%")
    
    print("\nDetailed Results:")
    for name, result in results:
        symbol = "✅" if result else "❌"
        print(f"{symbol} {name}")
    
    print(f"\nCompleted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
