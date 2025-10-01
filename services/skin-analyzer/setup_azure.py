#!/usr/bin/env python3
"""
Azure Face API Setup Script
Configures Azure Face API for age prediction
"""

import os
import requests
import json
from typing import Optional

class AzureFaceAPISetup:
    def __init__(self):
        self.endpoint = os.getenv('AZURE_FACE_ENDPOINT')
        self.key = os.getenv('AZURE_FACE_API_KEY')
        
    def test_connection(self) -> bool:
        """Test Azure Face API connection"""
        if not self.endpoint or not self.key:
            print("❌ Azure Face API credentials not found!")
            print("Please set the following environment variables:")
            print("  AZURE_FACE_ENDPOINT=https://your-face-api.cognitiveservices.azure.com/")
            print("  AZURE_FACE_API_KEY=your-api-key")
            return False
        
        try:
            url = f"{self.endpoint}/face/v1.0/detect"
            headers = {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': self.key
            }
            params = {
                'returnFaceAttributes': 'age',
                'returnFaceId': 'false'
            }
            
            # Test with a simple request
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200 or response.status_code == 400:
                print("✅ Azure Face API connection successful!")
                return True
            else:
                print(f"❌ Azure Face API connection failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Azure Face API connection error: {e}")
            return False
    
    def get_face_attributes(self, image_path: str) -> Optional[dict]:
        """Get face attributes from an image"""
        if not self.test_connection():
            return None
        
        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            url = f"{self.endpoint}/face/v1.0/detect"
            headers = {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': self.key
            }
            params = {
                'returnFaceAttributes': 'age,gender,emotion,smile',
                'returnFaceId': 'false'
            }
            
            response = requests.post(url, headers=headers, params=params, data=image_data)
            
            if response.status_code == 200:
                faces = response.json()
                if faces:
                    return faces[0]['faceAttributes']
                else:
                    print("No faces detected in the image")
                    return None
            else:
                print(f"API request failed: {response.status_code}")
                print(response.text)
                return None
                
        except Exception as e:
            print(f"Error processing image: {e}")
            return None

def main():
    """Main setup function"""
    print("🔧 Azure Face API Setup")
    print("=" * 50)
    
    setup = AzureFaceAPISetup()
    
    # Test connection
    if setup.test_connection():
        print("\n✅ Azure Face API is properly configured!")
        print("\nYou can now use the advanced skin analyzer with age prediction.")
        
        # Test with a sample image if available
        sample_images = [
            'sample_face.jpg',
            'test_image.jpg',
            'face_sample.png'
        ]
        
        for img_path in sample_images:
            if os.path.exists(img_path):
                print(f"\n🧪 Testing with sample image: {img_path}")
                attributes = setup.get_face_attributes(img_path)
                if attributes:
                    print(f"   Age: {attributes.get('age', 'N/A')}")
                    print(f"   Gender: {attributes.get('gender', 'N/A')}")
                    print(f"   Emotion: {attributes.get('emotion', 'N/A')}")
                break
    else:
        print("\n❌ Azure Face API setup failed!")
        print("\nTo set up Azure Face API:")
        print("1. Go to https://portal.azure.com/")
        print("2. Create a new 'Face' resource")
        print("3. Get your endpoint and API key")
        print("4. Set environment variables:")
        print("   export AZURE_FACE_ENDPOINT='https://your-face-api.cognitiveservices.azure.com/'")
        print("   export AZURE_FACE_API_KEY='your-api-key'")

if __name__ == "__main__":
    main()
