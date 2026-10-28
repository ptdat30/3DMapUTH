export type Vector3Tuple = [number, number, number];

export type ViewMode = 'OVERALL_CAMPUS' | 'BUILDING_FLOOR';

export type DirectionType =
  | 'STRAIGHT'
  | 'LEFT'
  | 'RIGHT'
  | 'STAIRS_UP'
  | 'STAIRS_DOWN'
  | 'ELEVATOR'
  | 'ARRIVED';

export type SegmentType =
  | 'OUTDOOR_QR_TO_HUB'
  | 'INDOOR_HUB_TO_ROOM'
  | 'DIRECT_QR_TO_ROOM';

export interface CampusData {
  id: string;
  code: string;
  name: string;
  overviewModelUrl: string;
}

export interface BuildingData {
  id: string;
  code: string;
  name: string;
  campusId: string;
  hubCoordinates: Vector3Tuple;
  floors?: FloorData[];
}

export interface FloorData {
  id: string;
  level: number;
  name: string;
  modelUrl: string;
  buildingId: string;
}

export interface QrNodeData {
  id: string;
  code: string;
  name: string;
  campusId: string;
  buildingId?: string | null;
  floorLevel?: number | null;
  coordinates: Vector3Tuple;
  initialCameraPos: Vector3Tuple;
  initialCameraTarget: Vector3Tuple;
}

export interface RoomData {
  id: string;
  code: string;
  name: string;
  searchKeywords: string;
  floorId: string;
  doorCoordinates: Vector3Tuple;
  buildingCode?: string;
  buildingName?: string;
  floorLevel?: number;
}

export interface NavigationStep {
  id: string;
  segmentId?: string;
  stepOrder: number;
  stage: 'OUTDOOR' | 'INDOOR';
  instruction: string;
  subText?: string;
  directionType: DirectionType;
  viewMode: ViewMode;
  buildingCode?: string;
  floorLevel?: number;
  pathPoints: Vector3Tuple[];
  cameraPos: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  landmarkPhotoUrl?: string;
  distanceMeters?: number;
}

export interface RoutePlan {
  originQr: QrNodeData;
  targetRoom: RoomData;
  steps: NavigationStep[];
  totalSteps: number;
}

export interface NavigationStoreState {
  // Current Campus and Context
  currentCampusCode: string;
  currentQr: QrNodeData | null;
  targetRoom: RoomData | null;
  
  // Navigation Route State
  activeSteps: NavigationStep[];
  currentStepIndex: number;
  isNavigating: boolean;
  
  // 3D Visual Viewport Controls
  viewMode: ViewMode;
  activeBuildingCode: string | null;
  activeFloorLevel: number | null;
  
  // Camera & Interaction
  cameraPosition: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  isCameraAnimating: boolean;
  selectedLandmarkPhoto: string | null;
  
  // Actions
  setCampus: (campusCode: string) => void;
  setCurrentQr: (qr: QrNodeData) => void;
  setTargetRoom: (room: RoomData | null) => void;
  setRouteSteps: (steps: NavigationStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  setViewMode: (mode: ViewMode, buildingCode?: string, floorLevel?: number) => void;
  setCameraTransform: (position: Vector3Tuple, target: Vector3Tuple) => void;
  setCameraAnimating: (isAnimating: boolean) => void;
  setSelectedLandmarkPhoto: (url: string | null) => void;
  resetNavigation: () => void;
}
