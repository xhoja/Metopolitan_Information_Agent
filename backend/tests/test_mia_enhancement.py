"""
Test script for M.I.A personalized academic guidance features.

This script tests the enhanced M.I.A chatbot with student context.
Run this after starting the backend server.

Usage:
    python -m pytest backend/tests/test_mia_enhancement.py -v
    
Or run directly:
    python backend/tests/test_mia_enhancement.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.mia import (
    extract_student_id,
    fetch_student_profile,
    calculate_gpa,
    calculate_attendance_stats,
    build_student_context,
)

def test_calculate_gpa():
    """Test GPA calculation"""
    grades = [
        {"grade": "A"},   # 4.0
        {"grade": "B"},   # 3.0
        {"grade": "A-"},  # 3.7
    ]
    gpa = calculate_gpa(grades)
    expected = (4.0 + 3.0 + 3.7) / 3
    assert abs(gpa - expected) < 0.01, f"Expected {expected}, got {gpa}"
    print(f"✓ GPA calculation: {gpa:.2f}")

def test_calculate_attendance_stats():
    """Test attendance statistics"""
    attendance = [
        {"status": "present"},
        {"status": "present"},
        {"status": "absent"},
        {"status": "late"},
        {"status": "present"},
    ]
    stats = calculate_attendance_stats(attendance)
    
    assert stats["total_records"] == 5
    assert stats["present"] == 3
    assert stats["absent"] == 1
    assert stats["late"] == 1
    assert abs(stats["presence_rate"] - 60.0) < 0.01
    print(f"✓ Attendance stats: {stats['presence_rate']:.1f}% presence rate")

def test_gpa_with_invalid_grades():
    """Test GPA calculation with invalid grades"""
    grades = [
        {"grade": "A"},
        {"grade": "INVALID"},
        {"grade": "B"},
    ]
    gpa = calculate_gpa(grades)
    # Should calculate only valid grades
    expected = (4.0 + 3.0) / 2
    assert abs(gpa - expected) < 0.01
    print(f"✓ GPA with invalid grades: {gpa:.2f}")

def test_gpa_with_no_grades():
    """Test GPA calculation with empty list"""
    grades = []
    gpa = calculate_gpa(grades)
    assert gpa == 0
    print(f"✓ GPA with no grades: {gpa}")

def test_attendance_empty():
    """Test attendance stats with empty list"""
    attendance = []
    stats = calculate_attendance_stats(attendance)
    assert stats["total_records"] == 0
    assert stats["presence_rate"] == 0
    print(f"✓ Attendance with no records: presence_rate = {stats['presence_rate']}")

def test_build_student_context_with_data():
    """Test context building with sample data"""
    profile = {
        "student_info": {
            "id": "test-123",
            "users": {
                "name": "John Doe",
                "email": "john@example.com",
                "created_at": "2024-01-15"
            }
        },
        "gpa": 3.5,
        "total_credits": 45,
        "courses": [
            {"code": "CS101", "title": "Intro to CS", "credits": 3},
            {"code": "MATH201", "title": "Calculus II", "credits": 4}
        ],
        "grades": [
            {"grade": "A", "courses": {"code": "CS101", "title": "Intro to CS"}},
            {"grade": "B", "courses": {"code": "MATH201", "title": "Calculus II"}}
        ],
        "attendance": {
            "total_records": 20,
            "present": 18,
            "absent": 2,
            "late": 0,
            "presence_rate": 90.0
        }
    }
    
    context = build_student_context(profile)
    
    assert "John Doe" in context
    assert "john@example.com" in context
    assert "3.5" in context or "3.50" in context
    assert "45" in context  # total credits
    assert "CS101" in context
    assert "90.0" in context  # attendance rate
    print(f"✓ Context building successful ({len(context)} chars)")

def test_build_student_context_empty():
    """Test context building with empty profile"""
    profile = {}
    context = build_student_context(profile)
    assert context == ""
    print(f"✓ Context with empty profile: empty string")

def test_all_grade_mappings():
    """Test that all grade mappings work"""
    grades_to_test = [
        ("A", 4.0),
        ("A-", 3.7),
        ("B+", 3.3),
        ("B", 3.0),
        ("B-", 2.7),
        ("C+", 2.3),
        ("C", 2.0),
        ("C-", 1.7),
        ("D", 1.0),
        ("F", 0.0),
    ]
    
    for grade_letter, expected_value in grades_to_test:
        grades = [{"grade": grade_letter}]
        gpa = calculate_gpa(grades)
        assert abs(gpa - expected_value) < 0.01, f"Grade {grade_letter}: expected {expected_value}, got {gpa}"
    
    print(f"✓ All grade mappings correct (10 grades tested)")

def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("M.I.A Enhancement Test Suite")
    print("=" * 60)
    print()
    
    tests = [
        ("GPA Calculation", test_calculate_gpa),
        ("Attendance Statistics", test_calculate_attendance_stats),
        ("GPA with Invalid Grades", test_gpa_with_invalid_grades),
        ("GPA with No Grades", test_gpa_with_no_grades),
        ("Attendance with No Records", test_attendance_empty),
        ("Context Building with Data", test_build_student_context_with_data),
        ("Context Building Empty", test_build_student_context_empty),
        ("All Grade Mappings", test_all_grade_mappings),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            print(f"Testing {test_name}...", end=" ")
            test_func()
            passed += 1
        except AssertionError as e:
            print(f"✗ FAILED: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ ERROR: {e}")
            failed += 1
    
    print()
    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)
    
    return failed == 0

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
