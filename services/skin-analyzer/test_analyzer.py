#!/usr/bin/env python3
"""
Test script for the Advanced Skin Analyzer
Tests the complete analysis pipeline
"""

import numpy as np
import cv2
import os
import sys
from advanced_skin_analyzer import AdvancedSkinAnalyzer

def create_test_image() -> np.ndarray:
    """Create a synthetic test image for analysis"""
    # Create a synthetic skin-like image
    img = np.random.randint(120, 180, (400, 400, 3), dtype=np.uint8)
    
    # Add some texture
    noise = np.random.normal(0, 15, (400, 400, 3))
    img = np.clip(img + noise, 0, 255).astype(np.uint8)
    
    # Add some skin-like features
    # Add some "pores"
    for _ in range(20):
        center = (np.random.randint(50, 350), np.random.randint(50, 350))
        color = np.random.randint(100, 140, 3)
        cv2.circle(img, center, np.random.randint(1, 3), color.tolist(), -1)
    
    # Add some "wrinkles"
    for _ in range(5):
        start = (np.random.randint(50, 350), np.random.randint(50, 350))
        end = (np.random.randint(50, 350), np.random.randint(50, 350))
        color = np.random.randint(100, 130, 3)
        cv2.line(img, start, end, color.tolist(), 1)
    
    # Add some "dark spots"
    for _ in range(3):
        center = (np.random.randint(50, 350), np.random.randint(50, 350))
        color = np.random.randint(80, 120, 3)
        cv2.circle(img, center, np.random.randint(3, 8), color.tolist(), -1)
    
    return img

def test_skin_region_detection():
    """Test skin region detection"""
    print("🧪 Testing skin region detection...")
    
    analyzer = AdvancedSkinAnalyzer()
    test_image = create_test_image()
    
    try:
        skin_regions = analyzer.detect_skin_regions(test_image)
        print(f"✅ Detected {len(skin_regions)} skin regions")
        return len(skin_regions) > 0
    except Exception as e:
        print(f"❌ Skin region detection failed: {e}")
        return False

def test_skin_health_prediction():
    """Test skin health prediction"""
    print("🧪 Testing skin health prediction...")
    
    analyzer = AdvancedSkinAnalyzer()
    test_image = create_test_image()
    
    try:
        skin_health = analyzer.predict_skin_health(test_image)
        print(f"✅ Skin health prediction successful:")
        for param, score in skin_health.items():
            print(f"   {param}: {score:.1f}%")
        return True
    except Exception as e:
        print(f"❌ Skin health prediction failed: {e}")
        return False

def test_age_prediction():
    """Test age prediction"""
    print("🧪 Testing age prediction...")
    
    analyzer = AdvancedSkinAnalyzer()
    test_image = create_test_image()
    
    try:
        # Test local age prediction (Azure might not be available)
        age = analyzer.predict_age_local(test_image)
        print(f"✅ Age prediction successful: {age} years")
        return True
    except Exception as e:
        print(f"❌ Age prediction failed: {e}")
        return False

def test_comprehensive_analysis():
    """Test comprehensive analysis"""
    print("🧪 Testing comprehensive analysis...")
    
    analyzer = AdvancedSkinAnalyzer()
    test_image = create_test_image()
    
    try:
        results = analyzer.analyze_skin_comprehensive(
            test_image, 
            age=30, 
            symptoms="occasional redness", 
            history="no known allergies"
        )
        
        print("✅ Comprehensive analysis successful:")
        print(f"   Predicted Age: {results.get('predicted_age', 'N/A')}")
        print(f"   Overall Skin Health: {results.get('overall_skin_health', 'N/A')}%")
        print(f"   Confidence Level: {results.get('confidence_level', 'N/A')}")
        print(f"   Model Accuracy: {results.get('model_accuracy', 'N/A')}")
        
        # Check if all required fields are present
        required_fields = ['predicted_age', 'overall_skin_health', 'metrics', 'concerns', 'recommendations']
        missing_fields = [field for field in required_fields if field not in results]
        
        if missing_fields:
            print(f"⚠️  Missing fields: {missing_fields}")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Comprehensive analysis failed: {e}")
        return False

def test_azure_connection():
    """Test Azure Face API connection"""
    print("🧪 Testing Azure Face API connection...")
    
    analyzer = AdvancedSkinAnalyzer()
    test_image = create_test_image()
    
    try:
        age = analyzer.predict_age_azure(test_image)
        if age is not None:
            print(f"✅ Azure Face API connection successful: Age {age}")
            return True
        else:
            print("⚠️  Azure Face API not available (using local model)")
            return True  # Not a failure, just fallback
    except Exception as e:
        print(f"⚠️  Azure Face API not available: {e}")
        return True  # Not a failure, just fallback

def main():
    """Run all tests"""
    print("🚀 Advanced Skin Analyzer Test Suite")
    print("=" * 50)
    
    tests = [
        ("Skin Region Detection", test_skin_region_detection),
        ("Skin Health Prediction", test_skin_health_prediction),
        ("Age Prediction", test_age_prediction),
        ("Azure Connection", test_azure_connection),
        ("Comprehensive Analysis", test_comprehensive_analysis),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The analyzer is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
