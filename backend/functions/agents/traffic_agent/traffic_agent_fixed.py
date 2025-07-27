from typing import Callable, Sequence, Dict, List, Any, Optional, Iterable
import os
import json
import cv2
import numpy as np
from datetime import datetime
import logging
from pathlib import Path
from collections import Counter

def open_video_file(video_path: str, logger=None) -> cv2.VideoCapture:
    """Robust video file opening with multiple backend attempts"""
    # Handle file path with spaces and resolve absolute path
    video_path = str(Path(video_path).expanduser().resolve())
    
    if not Path(video_path).exists():
        # Try to find the file with similar name (handle typos/spaces)
        parent_dir = Path(video_path).parent
        filename = Path(video_path).name
        
        # Look for similar files
        if parent_dir.exists():
            similar_files = []
            for file in parent_dir.glob("*.mp4"):
                if any(word in file.name.lower() for word in filename.split() if len(word) > 3):
                    similar_files.append(str(file))
            
            if similar_files:
                if logger:
                    logger.info(f"Found similar file: {similar_files[0]}")
                video_path = similar_files[0]
            else:
                raise FileNotFoundError(f"Video file not found: {video_path}")
        else:
            raise FileNotFoundError(f"Directory not found: {parent_dir}")

    if Path(video_path).stat().st_size == 0:
        raise ValueError(f"Video file is empty: {video_path}")

    # Try different backends
    backends = [
        ("FFMPEG", cv2.CAP_FFMPEG),
        ("Default", None),
        ("DSHOW", getattr(cv2, 'CAP_DSHOW', None)),
        ("MSMF", getattr(cv2, 'CAP_MSMF', None)),
    ]

    for name, backend in backends:
        try:
            if backend is not None:
                cap = cv2.VideoCapture(video_path, backend)
            else:
                cap = cv2.VideoCapture(video_path)

            if cap.isOpened():
                if logger:
                    logger.info(f"Video opened successfully with {name} backend: {Path(video_path).name}")
                return cap
            else:
                cap.release()
        except Exception as e:
            if logger:
                logger.warning(f"Failed to open with {name} backend: {e}")

    raise RuntimeError(f"Cannot open video file: {video_path}")

class TrafficStampedeAnalysisAgent:
    """
    AUTH AGENT 5: Traffic Management & Stampede Prevention Agent
    Analyzes drone videos for traffic congestion and crowd density
    """
    
    def __init__(
        self,
        model: str = "gemini-1.5-pro",
        detection_model: str = "yolov8n.pt",
        project: str = "",
        location: str = "us-central1",
        confidence_threshold: float = 0.25,
        crowd_density_threshold: int = 30,
        stampede_risk_threshold: float = 0.6,
        bangalore_context: bool = True
    ):
        self.model_name = model
        self.detection_model = detection_model
        self.project = project
        self.location = location
        self.confidence_threshold = confidence_threshold
        self.crowd_density_threshold = crowd_density_threshold
        self.stampede_risk_threshold = stampede_risk_threshold
        self.bangalore_context = bangalore_context
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)

    def set_up(self):
        """Initialize all models and processing components"""
        try:
            # Initialize Vertex AI (optional - only if you need LLM)
            if self.project:
                try:
                    import vertexai
                    from langchain_google_vertexai import ChatVertexAI
                    vertexai.init(project=self.project, location=self.location)
                    self.llm = ChatVertexAI(model_name=self.model_name)
                    self.logger.info("Vertex AI initialized successfully")
                except Exception as e:
                    self.logger.warning(f"Vertex AI initialization failed: {e}")
                    self.llm = None
            else:
                self.llm = None
            
            # Initialize YOLO model
            from ultralytics import YOLO
            self.yolo_model = YOLO(self.detection_model)
            self.logger.info(f"YOLO model {self.detection_model} loaded successfully")
            
            self.logger.info("Traffic Stampede Analysis Agent initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize agent: {str(e)}")
            raise

    def query(self, video_path: str, analysis_type: str = "comprehensive", **kwargs) -> Dict[str, Any]:
        """Analyze drone video and provide traffic management recommendations"""
        start_time = datetime.now()
        
        try:
            # Process video
            video_analysis = self._process_drone_video(video_path)
            
            # Perform analysis
            traffic_results = self._analyze_traffic_patterns(video_analysis)
            crowd_results = self._analyze_crowd_density(video_analysis)
            stampede_risk = self._assess_stampede_risk(crowd_results, traffic_results)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(traffic_results, crowd_results, stampede_risk)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "video_source": str(Path(video_path).name),
                "processing_time_seconds": processing_time,
                "analysis_results": {
                    "traffic_analysis": traffic_results,
                    "crowd_analysis": crowd_results,
                    "stampede_risk_assessment": stampede_risk
                },
                "recommendations": recommendations,
                "alert_level": self._determine_alert_level(stampede_risk, traffic_results),
                "status": "SUCCESS"
            }
            
        except Exception as e:
            self.logger.error(f"Error processing video analysis: {str(e)}")
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "video_source": video_path,
                "processing_time_seconds": processing_time,
                "analysis_results": {
                    "traffic_analysis": self._get_empty_traffic_results(),
                    "crowd_analysis": self._get_empty_crowd_results(),
                    "stampede_risk_assessment": self._get_empty_risk_results()
                },
                "recommendations": self._get_empty_recommendations(),
                "alert_level": "UNKNOWN",
                "status": "FAILED",
                "error": str(e)
            }

    def _process_drone_video(self, video_path: str) -> Dict[str, Any]:
        """Process drone video and extract detections"""
        cap = open_video_file(video_path, logger=self.logger)
        
        try:
            fps = cap.get(cv2.CAP_PROP_FPS) or 25
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Adaptive sampling - more frames for shorter videos
            if total_frames < 100:
                step = 1  # Process every frame
            elif total_frames < 500:
                step = 2  # Process every 2nd frame
            else:
                step = max(1, total_frames // 200)  # Cap at 200 frames
            
            all_detections = []
            frame_count = 0
            processed_frames = 0
            
            self.logger.info(f"Processing video: {total_frames} frames at {fps} FPS, sampling every {step} frames")
            
            while cap.isOpened() and frame_count < total_frames:
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_count % step == 0:
                    # Run YOLO detection
                    results = self.yolo_model(frame, conf=self.confidence_threshold, verbose=False)
                    
                    frame_detections = []
                    for result in results:
                        if result.boxes is not None:
                            for box in result.boxes:
                                class_id = int(box.cls[0])
                                class_name = self.yolo_model.names[class_id]
                                confidence = float(box.conf[0])
                                bbox = box.xyxy[0].tolist()
                                
                                frame_detections.append({
                                    "class_id": class_id,
                                    "class_name": class_name,
                                    "confidence": confidence,
                                    "bbox": bbox
                                })
                    
                    all_detections.append({
                        "frame_number": frame_count,
                        "detections": frame_detections
                    })
                    processed_frames += 1
                
                frame_count += 1
            
            self.logger.info(f"Processed {processed_frames} frames, found detections in {len(all_detections)} frames")
            
            return {
                "total_frames": total_frames,
                "processed_frames": processed_frames,
                "fps": fps,
                "duration_seconds": total_frames / fps if fps > 0 else 0,
                "detections": all_detections
            }
            
        finally:
            cap.release()

    def _analyze_traffic_patterns(self, video_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze traffic patterns from detections"""
        vehicle_classes = ['car', 'truck', 'bus', 'motorcycle', 'bicycle']
        vehicle_counts = {cls: 0 for cls in vehicle_classes}
        total_vehicles = 0
        congested_frames = 0
        
        for frame_data in video_analysis["detections"]:
            frame_vehicles = 0
            
            for detection in frame_data["detections"]:
                class_name = detection["class_name"].lower()
                
                # Count vehicles
                for vehicle_type in vehicle_classes:
                    if vehicle_type in class_name:
                        vehicle_counts[vehicle_type] += 1
                        total_vehicles += 1
                        frame_vehicles += 1
                        break
            
            # Determine if frame is congested (threshold: 8 vehicles per frame)
            if frame_vehicles >= 8:
                congested_frames += 1
        
        total_processed = len(video_analysis["detections"])
        congestion_percentage = (congested_frames / total_processed * 100) if total_processed > 0 else 0
        
        # Determine congestion level
        if congestion_percentage >= 60:
            congestion_level = "severe"
        elif congestion_percentage >= 30:
            congestion_level = "moderate"
        elif congestion_percentage >= 10:
            congestion_level = "light"
        else:
            congestion_level = "minimal"
        
        avg_vehicles_per_frame = total_vehicles / total_processed if total_processed > 0 else 0
        
        return {
            "total_vehicles_detected": total_vehicles,
            "vehicle_breakdown": vehicle_counts,
            "congestion_level": congestion_level,
            "congestion_percentage": round(congestion_percentage, 1),
            "average_vehicles_per_frame": round(avg_vehicles_per_frame, 1),
            "congested_frames": congested_frames,
            "total_frames_analyzed": total_processed
        }

    def _analyze_crowd_density(self, video_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze crowd density from person detections"""
        person_counts = []
        total_persons = 0
        
        for frame_data in video_analysis["detections"]:
            frame_persons = 0
            
            for detection in frame_data["detections"]:
                if detection["class_name"].lower() == "person":
                    frame_persons += 1
                    total_persons += 1
            
            person_counts.append(frame_persons)
        
        max_crowd = max(person_counts) if person_counts else 0
        avg_crowd = sum(person_counts) / len(person_counts) if person_counts else 0
        
        # Determine crowd density level
        if max_crowd >= self.crowd_density_threshold:
            density_level = "high"
        elif max_crowd >= self.crowd_density_threshold // 2:
            density_level = "medium"
        elif max_crowd > 0:
            density_level = "low"
        else:
            density_level = "minimal"
        
        return {
            "total_persons_detected": total_persons,
            "max_crowd_detected": max_crowd,
            "average_crowd_size": round(avg_crowd, 1),
            "crowd_density_level": density_level,
            "crowd_threshold_exceeded": max_crowd > self.crowd_density_threshold,
            "frames_with_people": sum(1 for count in person_counts if count > 0)
        }

    def _assess_stampede_risk(self, crowd_results: Dict[str, Any], traffic_results: Dict[str, Any]) -> Dict[str, Any]:
        """Assess stampede risk based on crowd and traffic analysis"""
        risk_factors = []
        risk_score = 0.0
        
        # High crowd density
        if crowd_results["crowd_density_level"] == "high":
            risk_factors.append("High crowd density detected")
            risk_score += 0.4
        elif crowd_results["crowd_density_level"] == "medium":
            risk_factors.append("Medium crowd density")
            risk_score += 0.2
        
        # Traffic congestion creating bottlenecks
        if traffic_results["congestion_level"] == "severe":
            risk_factors.append("Severe traffic congestion")
            risk_score += 0.3
        elif traffic_results["congestion_level"] == "moderate":
            risk_factors.append("Moderate traffic congestion")
            risk_score += 0.15
        
        # Mixed crowd and vehicle situation
        if (crowd_results["max_crowd_detected"] > 10 and 
            traffic_results["total_vehicles_detected"] > 20):
            risk_factors.append("Mixed pedestrian and vehicle traffic")
            risk_score += 0.1
        
        # Determine risk level
        if risk_score >= self.stampede_risk_threshold:
            risk_level = "critical"
        elif risk_score >= 0.4:
            risk_level = "high"
        elif risk_score >= 0.2:
            risk_level = "moderate"
        elif risk_score > 0:
            risk_level = "low"
        else:
            risk_level = "minimal"
        
        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "immediate_action_required": risk_score >= self.stampede_risk_threshold,
            "estimated_people_at_risk": crowd_results["max_crowd_detected"] if risk_score > 0.3 else 0
        }

    def _generate_recommendations(self, traffic_results: Dict[str, Any], 
                                crowd_results: Dict[str, Any], 
                                stampede_risk: Dict[str, Any]) -> Dict[str, Any]:
        """Generate actionable recommendations"""
        recommendations = {
            "immediate_actions": [],
            "short_term_solutions": [],
            "long_term_improvements": [],
            "bangalore_specific": []
        }
        
        # Critical situation responses
        if stampede_risk["risk_level"] == "critical":
            recommendations["immediate_actions"].extend([
                "🚨 URGENT: Deploy emergency response teams immediately",
                "🚨 Activate crowd dispersal protocols",
                "🚨 Clear bottleneck areas and establish safe passages",
                "🚨 Coordinate with police and emergency services"
            ])
        
        # Traffic-based recommendations
        if traffic_results["congestion_level"] in ["severe", "moderate"]:
            recommendations["immediate_actions"].extend([
                "🚦 Deploy traffic police at major intersections",
                "🚦 Activate dynamic traffic signal optimization",
                "🚦 Implement alternate route diversions"
            ])
            
            recommendations["short_term_solutions"].extend([
                "📍 Set up temporary traffic management posts",
                "📱 Coordinate with navigation apps for route optimization",
                "⏰ Implement time-based vehicle restrictions"
            ])
        
        # Crowd management
        if crowd_results["crowd_density_level"] in ["high", "medium"]:
            recommendations["short_term_solutions"].extend([
                "🚧 Install temporary crowd control barriers",
                "👮 Deploy additional security personnel",
                "🚪 Implement controlled entry/exit systems"
            ])
        
        # Bangalore-specific recommendations
        if self.bangalore_context:
            recommendations["bangalore_specific"].extend([
                "🚌 Coordinate with BMTC for additional bus services",
                "🚇 Activate Namma Metro crowd management protocols",
                "🏢 Implement tech corridor specific traffic diversions",
                "🤖 Deploy AI traffic systems at Electronic City"
            ])
        
        # Always include long-term improvements
        recommendations["long_term_improvements"].extend([
            "📹 Install permanent drone monitoring systems",
            "🧠 Implement AI-powered predictive traffic management",
            "📊 Develop real-time crowd density monitoring network",
            "🚨 Create automated emergency response protocols"
        ])
        
        return recommendations

    def _determine_alert_level(self, stampede_risk: Dict[str, Any], traffic_results: Dict[str, Any]) -> str:
        """Determine overall alert level"""
        if stampede_risk["risk_level"] == "critical":
            return "CRITICAL"
        elif stampede_risk["risk_level"] == "high" or traffic_results["congestion_level"] == "severe":
            return "HIGH"
        elif stampede_risk["risk_level"] == "moderate" or traffic_results["congestion_level"] == "moderate":
            return "MEDIUM"
        elif stampede_risk["risk_level"] == "low" or traffic_results["congestion_level"] == "light":
            return "LOW"
        else:
            return "MINIMAL"

    def _get_empty_traffic_results(self):
        return {
            "total_vehicles_detected": 0,
            "vehicle_breakdown": {"car": 0, "truck": 0, "bus": 0, "motorcycle": 0, "bicycle": 0},
            "congestion_level": "unknown",
            "congestion_percentage": 0.0,
            "average_vehicles_per_frame": 0.0,
            "congested_frames": 0,
            "total_frames_analyzed": 0
        }

    def _get_empty_crowd_results(self):
        return {
            "total_persons_detected": 0,
            "max_crowd_detected": 0,
            "average_crowd_size": 0.0,
            "crowd_density_level": "unknown",
            "crowd_threshold_exceeded": False,
            "frames_with_people": 0
        }

    def _get_empty_risk_results(self):
        return {
            "risk_score": 0.0,
            "risk_level": "unknown",
            "risk_factors": [],
            "immediate_action_required": False,
            "estimated_people_at_risk": 0
        }

    def _get_empty_recommendations(self):
        return {
            "immediate_actions": [],
            "short_term_solutions": [],
            "long_term_improvements": [],
            "bangalore_specific": []
        }

    def summarize(self, result: Dict[str, Any]) -> str:
        """Convert analysis results to human-readable summary"""
        if result.get("status") == "FAILED":
            return f"❌ ANALYSIS FAILED: {result.get('error', 'Unknown error')}"
        
        analysis = result.get("analysis_results", {})
        traffic = analysis.get("traffic_analysis", {})
        crowd = analysis.get("crowd_analysis", {})
        risk = analysis.get("stampede_risk_assessment", {})
        recommendations = result.get("recommendations", {})
        
        lines = []
        lines.append("=== TRAFFIC ANALYSIS ===")
        
        total_vehicles = traffic.get("total_vehicles_detected", 0)
        if total_vehicles > 0:
            breakdown = traffic.get("vehicle_breakdown", {})
            breakdown_str = ", ".join([f"{k}: {v}" for k, v in breakdown.items() if v > 0])
            lines.append(f"Detected {total_vehicles} total vehicles: {breakdown_str}.")
        else:
            lines.append("Detected 0 total vehicles.")
        
        congestion_level = traffic.get("congestion_level", "unknown").upper()
        congestion_pct = traffic.get("congestion_percentage", 0)
        lines.append(f"Traffic congestion level: {congestion_level} ({congestion_pct}% of frames show congestion).")
        
        lines.append("\n=== CROWD ANALYSIS ===")
        crowd_level = crowd.get("crowd_density_level", "unknown").upper()
        max_crowd = crowd.get("max_crowd_detected", 0)
        avg_crowd = crowd.get("average_crowd_size", 0)
        lines.append(f"Crowd density: {crowd_level} (peak: {max_crowd} people, average: {avg_crowd:.1f} people).")
        
        lines.append("\n=== STAMPEDE RISK ASSESSMENT ===")
        risk_level = risk.get("risk_level", "unknown").upper()
        risk_score = risk.get("risk_score", 0)
        lines.append(f"Risk level: **{risk_level}** (score: {risk_score:.2f}/1.0)")
        
        risk_factors = risk.get("risk_factors", [])
        if risk_factors:
            lines.append("Risk factors identified: " + "; ".join(risk_factors))
        else:
            lines.append("No significant risk factors identified.")
        
        lines.append("\n=== RECOMMENDATIONS ===")
        immediate = recommendations.get("immediate_actions", [])
        if immediate:
            lines.append("IMMEDIATE ACTIONS:")
            lines.extend([f"  • {action}" for action in immediate[:5]])
        else:
            lines.append("IMMEDIATE ACTIONS: None required")
        
        short_term = recommendations.get("short_term_solutions", [])
        if short_term:
            lines.append("\nSHORT-TERM SOLUTIONS:")
            lines.extend([f"  • {solution}" for solution in short_term[:5]])
        else:
            lines.append("\nSHORT-TERM SOLUTIONS: None required")
        
        lines.append("\n=== OVERALL STATUS ===")
        lines.append(f"Alert Level: {result.get('alert_level', 'UNKNOWN')}")
        lines.append(f"Processing Time: {result.get('processing_time_seconds', 0):.2f} seconds")
        lines.append(f"Analysis Status: {result.get('status', 'UNKNOWN')}")
        
        return "\n".join(lines)

def test_agent(video_path: str, project_id: str = ""):
    """Test function to run the agent"""
    agent = TrafficStampedeAnalysisAgent(
        detection_model="yolov8n.pt",
        confidence_threshold=0.25,
        project=project_id,
        location="us-central1",
        bangalore_context=True
    )
    
    agent.set_up()
    result = agent.query(video_path=video_path)
    print(agent.summarize(result))
    return result

if __name__ == "__main__":
    # Test with your video file
    video_file = input("Enter path to video file: ").strip().strip('"')
    test_agent(video_file)
