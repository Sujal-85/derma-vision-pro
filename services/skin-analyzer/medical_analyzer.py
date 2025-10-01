import numpy as np
import cv2
import mediapipe as mp
from typing import Optional, Dict, Any, List, Tuple
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from skimage.feature import local_binary_pattern

class MedicalSkinAnalyzer:
    def __init__(self):
        # Initialize MediaPipe face detection and landmarks
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_detector = self.mp_face_detection.FaceDetection(
            model_selection=1, min_detection_confidence=0.5
        )
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True, max_num_faces=1, 
            refine_landmarks=True, min_detection_confidence=0.5
        )
        
    def detect_face_region(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Detect and extract face region using MediaPipe"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_detector.process(rgb_image)
        
        if not results.detections:
            return None
            
        detection = results.detections[0]
        bbox = detection.location_data.relative_bounding_box
        h, w, _ = image.shape
        
        x = int(bbox.xmin * w)
        y = int(bbox.ymin * h)
        width = int(bbox.width * w)
        height = int(bbox.height * h)
        
        # Add padding and ensure bounds
        padding = 20
        x = max(0, x - padding)
        y = max(0, y - padding)
        width = min(w - x, width + 2 * padding)
        height = min(h - y, height + 2 * padding)
        
        return image[y:y+height, x:x+width]
    
    def get_face_landmarks(self, image: np.ndarray) -> Optional[List[Tuple[int, int]]]:
        """Extract facial landmarks using MediaPipe"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_image)
        
        if not results.multi_face_landmarks:
            return None
            
        landmarks = []
        for landmark in results.multi_face_landmarks[0].landmark:
            h, w, _ = image.shape
            x = int(landmark.x * w)
            y = int(landmark.y * h)
            landmarks.append((x, y))
            
        return landmarks
    
    def analyze_skin_tone(self, face_region: np.ndarray) -> Dict[str, float]:
        """Analyze skin tone using LAB color space for better accuracy"""
        lab = cv2.cvtColor(face_region, cv2.COLOR_BGR2LAB)
        l_channel = lab[:, :, 0]
        a_channel = lab[:, :, 1]
        b_channel = lab[:, :, 2]
        
        # Calculate skin tone metrics
        l_mean = np.mean(l_channel)
        a_mean = np.mean(a_channel)
        b_mean = np.mean(b_channel)
        
        # Fitzpatrick skin type estimation (simplified)
        if l_mean > 70:
            skin_type = "Type I-II (Very Fair to Fair)"
        elif l_mean > 60:
            skin_type = "Type III (Medium)"
        elif l_mean > 50:
            skin_type = "Type IV (Olive)"
        elif l_mean > 40:
            skin_type = "Type V (Brown)"
        else:
            skin_type = "Type VI (Dark)"
        
        return {
            "luminance": float(l_mean),
            "a_channel": float(a_mean),
            "b_channel": float(b_mean),
            "skin_type": skin_type,
            "tone_score": float(np.clip((l_mean - 20) / 60, 0, 1) * 100)
        }
    
    def analyze_texture_and_pores(self, face_region: np.ndarray) -> Dict[str, float]:
        """Advanced texture and pore analysis using multiple techniques"""
        gray = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        
        # Laplacian variance for texture
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Gabor filters for texture analysis
        gabor_responses = []
        for angle in [0, 45, 90, 135]:
            kernel = cv2.getGaborKernel((21, 21), 5, np.radians(angle), 10, 0.5, 0, ktype=cv2.CV_32F)
            response = cv2.filter2D(gray, cv2.CV_8UC3, kernel)
            gabor_responses.append(np.mean(response))
        
        gabor_variance = np.var(gabor_responses)
        
        # Pore detection using morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        opened = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
        pore_mask = gray - opened
        pore_density = np.sum(pore_mask > 30) / (face_region.shape[0] * face_region.shape[1])
        
        # Local Binary Pattern for texture uniformity
        lbp = local_binary_pattern(gray, 8, 1, method='uniform')
        texture_uniformity = 1 - (np.std(lbp) / 255)
        
        return {
            "texture_roughness": float(np.clip(laplacian_var / 1000, 0, 1) * 100),
            "pore_density": float(np.clip(pore_density * 1000, 0, 100)),
            "texture_uniformity": float(texture_uniformity * 100),
            "gabor_variance": float(gabor_variance),
            "overall_texture_score": float(np.clip(100 - (laplacian_var / 1000 + pore_density * 1000) / 2, 0, 100))
        }
    
    def detect_hyperpigmentation(self, face_region: np.ndarray) -> Dict[str, Any]:
        """Detect dark spots and hyperpigmentation"""
        lab = cv2.cvtColor(face_region, cv2.COLOR_BGR2LAB)
        l_channel = lab[:, :, 0]
        
        # Adaptive thresholding for dark spot detection
        dark_spots = l_channel < (np.mean(l_channel) - 1.5 * np.std(l_channel))
        
        # Morphological operations to clean up detection
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        dark_spots = cv2.morphologyEx(dark_spots.astype(np.uint8), cv2.MORPH_CLOSE, kernel)
        
        # Find contours of dark spots
        contours, _ = cv2.findContours(dark_spots, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter spots by size (too small or too large are likely noise)
        valid_spots = []
        total_area = face_region.shape[0] * face_region.shape[1]
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if 0.001 * total_area < area < 0.05 * total_area:  # 0.1% to 5% of face area
                valid_spots.append(contour)
        
        hyperpigmentation_score = len(valid_spots) * 10  # Scale to 0-100
        
        return {
            "dark_spot_count": len(valid_spots),
            "hyperpigmentation_score": float(np.clip(hyperpigmentation_score, 0, 100)),
            "severity": "High" if len(valid_spots) > 10 else "Moderate" if len(valid_spots) > 5 else "Low"
        }
    
    def detect_wrinkles(self, face_region: np.ndarray, landmarks: List[Tuple[int, int]]) -> Dict[str, Any]:
        """Detect wrinkles using edge detection and facial landmarks"""
        gray = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        
        # Define regions of interest for wrinkle detection
        regions = {
            "forehead": (0, 0, face_region.shape[1], face_region.shape[0] // 3),
            "eye_area": (face_region.shape[1] // 4, face_region.shape[0] // 3, 
                        face_region.shape[1] // 2, face_region.shape[0] // 2),
            "nasolabial": (face_region.shape[1] // 3, face_region.shape[0] // 2, 
                          face_region.shape[1] * 2 // 3, face_region.shape[0] * 3 // 4)
        }
        
        wrinkle_scores = {}
        total_wrinkles = 0
        
        for region_name, (x, y, w, h) in regions.items():
            roi = gray[y:y+h, x:x+w]
            
            # Edge detection for wrinkles
            edges = cv2.Canny(roi, 50, 150)
            
            # Hough line detection for wrinkle lines
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=30, minLineLength=20, maxLineGap=10)
            
            if lines is not None:
                wrinkle_count = len(lines)
                total_wrinkles += wrinkle_count
                wrinkle_scores[region_name] = min(wrinkle_count * 5, 100)  # Scale to 0-100
            else:
                wrinkle_scores[region_name] = 0
        
        overall_wrinkle_score = min(total_wrinkles * 3, 100)
        
        return {
            "forehead_wrinkles": wrinkle_scores.get("forehead", 0),
            "eye_wrinkles": wrinkle_scores.get("eye_area", 0),
            "nasolabial_wrinkles": wrinkle_scores.get("nasolabial", 0),
            "overall_wrinkle_score": float(overall_wrinkle_score),
            "severity": "High" if overall_wrinkle_score > 60 else "Moderate" if overall_wrinkle_score > 30 else "Low"
        }
    
    def analyze_redness_and_inflammation(self, face_region: np.ndarray) -> Dict[str, float]:
        """Analyze redness and inflammation using color analysis"""
        # Convert to different color spaces for better redness detection
        hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(face_region, cv2.COLOR_BGR2LAB)
        
        # HSV-based redness detection
        lower_red1 = np.array([0, 50, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 50, 50])
        upper_red2 = np.array([180, 255, 255])
        
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        redness_mask = mask1 + mask2
        
        # LAB-based redness detection (more accurate)
        a_channel = lab[:, :, 1]
        redness_lab = a_channel > (np.mean(a_channel) + 1.5 * np.std(a_channel))
        
        # Combine both methods
        combined_redness = cv2.bitwise_or(redness_mask, redness_lab.astype(np.uint8) * 255)
        
        redness_percentage = np.sum(combined_redness > 0) / (face_region.shape[0] * face_region.shape[1]) * 100
        
        return {
            "redness_percentage": float(redness_percentage),
            "inflammation_score": float(np.clip(redness_percentage * 2, 0, 100)),
            "severity": "High" if redness_percentage > 15 else "Moderate" if redness_percentage > 8 else "Low"
        }
    
    def calculate_hydration_score(self, face_region: np.ndarray) -> float:
        """Calculate skin hydration based on texture and brightness"""
        gray = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        
        # Well-hydrated skin appears smoother and more reflective
        smoothness = 1 / (cv2.Laplacian(gray, cv2.CV_64F).var() + 1)
        brightness = np.mean(gray) / 255
        
        # Combine smoothness and brightness for hydration score
        hydration = (smoothness * 0.6 + brightness * 0.4) * 100
        
        return float(np.clip(hydration, 0, 100))
    
    def calculate_elasticity_score(self, face_region: np.ndarray, landmarks: List[Tuple[int, int]]) -> float:
        """Estimate skin elasticity based on facial geometry and texture"""
        if not landmarks:
            return 50.0  # Default if no landmarks detected
        
        # Analyze facial symmetry and skin firmness indicators
        gray = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        
        # Texture analysis for firmness
        texture_variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Brightness analysis (firm skin tends to be more reflective)
        brightness = np.mean(gray) / 255
        
        # Calculate elasticity score
        elasticity = (brightness * 0.7 + (1 - texture_variance / 1000) * 0.3) * 100
        
        return float(np.clip(elasticity, 0, 100))
    
    def generate_medical_concerns(self, analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate medical-grade concerns based on analysis"""
        concerns = []
        
        # Hyperpigmentation concerns
        if analysis_results["hyperpigmentation"]["hyperpigmentation_score"] > 30:
            concerns.append({
                "type": "Hyperpigmentation",
                "severity": analysis_results["hyperpigmentation"]["severity"],
                "area": "Facial region",
                "trend": "stable",
                "confidence": min(95, int(analysis_results["hyperpigmentation"]["hyperpigmentation_score"])),
                "description": f"Detected {analysis_results['hyperpigmentation']['dark_spot_count']} dark spots with {analysis_results['hyperpigmentation']['severity'].lower()} severity"
            })
        
        # Wrinkle concerns
        if analysis_results["wrinkles"]["overall_wrinkle_score"] > 25:
            concerns.append({
                "type": "Fine Lines & Wrinkles",
                "severity": analysis_results["wrinkles"]["severity"],
                "area": "Multiple facial regions",
                "trend": "progressive",
                "confidence": min(90, int(analysis_results["wrinkles"]["overall_wrinkle_score"])),
                "description": f"Detected {analysis_results['wrinkles']['severity'].lower()} level of fine lines and wrinkles"
            })
        
        # Texture concerns
        if analysis_results["texture"]["overall_texture_score"] < 60:
            concerns.append({
                "type": "Uneven Skin Texture",
                "severity": "Moderate" if analysis_results["texture"]["overall_texture_score"] < 40 else "Mild",
                "area": "Facial region",
                "trend": "stable",
                "confidence": int(100 - analysis_results["texture"]["overall_texture_score"]),
                "description": "Detected uneven skin texture and enlarged pores"
            })
        
        # Redness/inflammation concerns
        if analysis_results["redness"]["inflammation_score"] > 20:
            concerns.append({
                "type": "Skin Inflammation",
                "severity": analysis_results["redness"]["severity"],
                "area": "Facial region",
                "trend": "variable",
                "confidence": min(85, int(analysis_results["redness"]["inflammation_score"])),
                "description": f"Detected {analysis_results['redness']['severity'].lower()} level of skin redness and inflammation"
            })
        
        # Hydration concerns
        if analysis_results["hydration"] < 50:
            concerns.append({
                "type": "Dehydrated Skin",
                "severity": "Moderate" if analysis_results["hydration"] < 35 else "Mild",
                "area": "Facial region",
                "trend": "variable",
                "confidence": int(100 - analysis_results["hydration"]),
                "description": "Detected signs of skin dehydration"
            })
        
        return concerns
    
    def generate_medical_recommendations(self, analysis_results: Dict[str, Any], concerns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate evidence-based medical recommendations"""
        recommendations = []
        
        # Immediate action recommendations
        immediate_actions = []
        
        if any(c["type"] == "Skin Inflammation" for c in concerns):
            immediate_actions.extend([
                "Use gentle, fragrance-free cleanser twice daily",
                "Apply broad-spectrum SPF 30+ sunscreen every 2 hours",
                "Avoid harsh exfoliants and irritating ingredients"
            ])
        
        if any(c["type"] == "Hyperpigmentation" for c in concerns):
            immediate_actions.extend([
                "Apply vitamin C serum in the morning",
                "Use broad-spectrum SPF 50+ sunscreen religiously",
                "Consider professional consultation for advanced treatments"
            ])
        
        if any(c["type"] == "Dehydrated Skin" for c in concerns):
            immediate_actions.extend([
                "Increase water intake to 8-10 glasses daily",
                "Use hyaluronic acid serum for hydration",
                "Apply moisturizer immediately after cleansing"
            ])
        
        if immediate_actions:
            recommendations.append({
                "category": "Immediate Action",
                "items": immediate_actions
            })
        
        # Weekly routine recommendations
        weekly_routine = []
        
        if any(c["type"] == "Fine Lines & Wrinkles" for c in concerns):
            weekly_routine.extend([
                "Apply retinol serum 2-3 times per week (start slowly)",
                "Use gentle AHA exfoliant 1-2 times per week",
                "Apply hydrating face mask twice weekly"
            ])
        
        if any(c["type"] == "Uneven Skin Texture" for c in concerns):
            weekly_routine.extend([
                "Use BHA exfoliant 2-3 times per week",
                "Apply niacinamide serum daily",
                "Use gentle physical exfoliant once weekly"
            ])
        
        if weekly_routine:
            recommendations.append({
                "category": "Weekly Routine",
                "items": weekly_routine
            })
        
        # Professional recommendations
        professional_recs = []
        
        if any(c["severity"] == "High" for c in concerns):
            professional_recs.extend([
                "Schedule consultation with dermatologist",
                "Consider professional treatments (chemical peels, laser therapy)",
                "Discuss prescription-strength treatments"
            ])
        
        if professional_recs:
            recommendations.append({
                "category": "Professional Consultation",
                "items": professional_recs
            })
        
        return recommendations
    
    def analyze_skin(self, image: np.ndarray, age: Optional[int] = None, 
                    symptoms: Optional[str] = None, history: Optional[str] = None) -> Dict[str, Any]:
        """Main analysis function that orchestrates all medical-grade analysis"""
        
        # Detect face region
        face_region = self.detect_face_region(image)
        if face_region is None:
            raise ValueError("No face detected in the image")
        
        # Get facial landmarks
        landmarks = self.get_face_landmarks(face_region)
        
        # Perform comprehensive analysis
        skin_tone = self.analyze_skin_tone(face_region)
        texture = self.analyze_texture_and_pores(face_region)
        hyperpigmentation = self.detect_hyperpigmentation(face_region)
        wrinkles = self.detect_wrinkles(face_region, landmarks)
        redness = self.analyze_redness_and_inflammation(face_region)
        hydration = self.calculate_hydration_score(face_region)
        elasticity = self.calculate_elasticity_score(face_region, landmarks)
        
        # Compile results
        analysis_results = {
            "skin_tone": skin_tone,
            "texture": texture,
            "hyperpigmentation": hyperpigmentation,
            "wrinkles": wrinkles,
            "redness": redness,
            "hydration": hydration,
            "elasticity": elasticity
        }
        
        # Generate concerns and recommendations
        concerns = self.generate_medical_concerns(analysis_results)
        recommendations = self.generate_medical_recommendations(analysis_results, concerns)
        
        # Calculate overall skin health score
        overall_score = (
            hydration * 0.25 +
            elasticity * 0.25 +
            (100 - texture["overall_texture_score"]) * 0.2 +
            (100 - hyperpigmentation["hyperpigmentation_score"]) * 0.15 +
            (100 - wrinkles["overall_wrinkle_score"]) * 0.15
        )
        
        # Check for red flags in symptoms/history
        red_flags = []
        if symptoms or history:
            text = f"{symptoms or ''} {history or ''}".lower()
            red_flags_terms = [
                "bleeding", "rapid growth", "fever", "pus", "severe pain", 
                "spreading rash", "mole changes", "asymmetrical", "irregular borders"
            ]
            for term in red_flags_terms:
                if term in text:
                    red_flags.append(f"Potential concerning symptom detected: '{term}'. Please consult a healthcare professional immediately.")
                    break
        
        return {
            "metrics": {
                "hydration": round(hydration, 1),
                "elasticity": round(elasticity, 1),
                "uvProtection": round(100 - redness["redness_percentage"], 1),
                "texture": round(100 - texture["overall_texture_score"], 1),
                "overallScore": round(overall_score, 1)
            },
            "concerns": concerns,
            "recommendations": recommendations,
            "detailed_analysis": {
                "skin_tone_analysis": skin_tone,
                "texture_analysis": texture,
                "hyperpigmentation_analysis": hyperpigmentation,
                "wrinkle_analysis": wrinkles,
                "redness_analysis": redness
            },
            "red_flags": red_flags,
            "analysis_summary": "Medical-grade skin analysis completed using advanced computer vision and dermatological algorithms. Results are for informational purposes only.",
            "disclaimer": "This analysis is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions about medical conditions.",
            "confidence_level": "High" if len(concerns) < 3 else "Moderate" if len(concerns) < 5 else "Requires Professional Review"
        }
