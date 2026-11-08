import { create } from 'zustand';
import {
  NavigationStoreState,
  NavigationStep,
  NavigationRouteResult,
  QrNodeData,
  RoomData,
  Vector3Tuple,
  ViewMode,
} from '@/types/navigation';
import {
  MOCK_QR_NODES,
  MOCK_ROOMS,
  MOCK_STEPS_CS1_TO_B302,
  MOCK_ROUTE_CS3_H_TO_J,
} from '@/data/mockNavigationData';

const DEFAULT_ORIGIN_QR = MOCK_QR_NODES[0];
const DEFAULT_TARGET_ROOM = MOCK_ROOMS[0];

export const useNavigationStore = create<NavigationStoreState>((set, get) => ({
  // Defaults
  currentCampusCode: 'cs1',
  currentQr: DEFAULT_ORIGIN_QR,
  targetRoom: DEFAULT_TARGET_ROOM,
  selectedBuildingCode: null,
  activeRoute: null,

  activeSteps: MOCK_STEPS_CS1_TO_B302,
  currentStepIndex: 0,
  isNavigating: true,

  viewMode: 'OVERALL_CAMPUS',
  activeBuildingCode: null,
  activeFloorLevel: null,

  cameraPosition: DEFAULT_ORIGIN_QR.initialCameraPos,
  cameraTarget: DEFAULT_ORIGIN_QR.initialCameraTarget,
  isCameraAnimating: false,
  selectedLandmarkPhoto: null,

  setCampus: (campusCode: string) => {
    set({ currentCampusCode: campusCode });
  },

  setCurrentQr: (qr: QrNodeData) => {
    set({
      currentQr: qr,
      cameraPosition: qr.initialCameraPos,
      cameraTarget: qr.initialCameraTarget,
      currentStepIndex: 0,
    });
  },

  setTargetRoom: (room: RoomData | null) => {
    set({ targetRoom: room });
  },

  setSelectedBuilding: (code: string | null) => {
    set({ selectedBuildingCode: code });
    if (!code) return;

    // Smoothly focus camera when a building is selected
    if (code === 'toa_j') {
      set({
        cameraPosition: [25, 18, -6],
        cameraTarget: [13.5, 2, -15.4],
        isCameraAnimating: true,
      });
    } else if (code === 'toa_h') {
      set({
        cameraPosition: [6, 18, 18],
        cameraTarget: [-4.5, 2, 7],
        isCameraAnimating: true,
      });
    }
  },

  setActiveRoute: (route: NavigationRouteResult | null) => {
    if (!route) {
      set({
        activeRoute: null,
        activeSteps: [],
        currentStepIndex: 0,
        isNavigating: false,
      });
      return;
    }

    set({
      activeRoute: route,
      activeSteps: route.steps,
      currentStepIndex: 0,
      isNavigating: true,
      viewMode: 'OVERALL_CAMPUS',
      cameraPosition: [16, 26, 22],
      cameraTarget: [4, 0, -3],
      isCameraAnimating: true,
    });
  },

  startRouteBetweenBuildings: (originCode: string, targetCode: string) => {
    if (originCode === 'toa_h' && targetCode === 'toa_j') {
      const route = MOCK_ROUTE_CS3_H_TO_J;
      set({
        activeRoute: route,
        activeSteps: route.steps,
        currentStepIndex: 0,
        isNavigating: true,
        selectedBuildingCode: 'toa_j',
        viewMode: 'OVERALL_CAMPUS',
        cameraPosition: [16, 26, 22],
        cameraTarget: [4, 0, -3],
        isCameraAnimating: true,
      });
    }
  },

  setRouteSteps: (steps: NavigationStep[]) => {
    if (!steps || steps.length === 0) {
      set({
        activeSteps: [],
        currentStepIndex: 0,
        isNavigating: false,
      });
      return;
    }

    const firstStep = steps[0];
    set({
      activeSteps: steps,
      currentStepIndex: 0,
      isNavigating: true,
      viewMode: firstStep.viewMode,
      activeBuildingCode: firstStep.buildingCode ?? null,
      activeFloorLevel: firstStep.floorLevel ?? null,
      cameraPosition: firstStep.cameraPos,
      cameraTarget: firstStep.cameraTarget,
      isCameraAnimating: true,
    });
  },

  nextStep: () => {
    const { activeSteps, currentStepIndex } = get();
    if (currentStepIndex >= activeSteps.length - 1) return;

    const nextIdx = currentStepIndex + 1;
    const nextStepData = activeSteps[nextIdx];

    set({
      currentStepIndex: nextIdx,
      viewMode: nextStepData.viewMode,
      activeBuildingCode: nextStepData.buildingCode ?? null,
      activeFloorLevel: nextStepData.floorLevel ?? null,
      cameraPosition: nextStepData.cameraPos,
      cameraTarget: nextStepData.cameraTarget,
      isCameraAnimating: true,
    });
  },

  prevStep: () => {
    const { activeSteps, currentStepIndex } = get();
    if (currentStepIndex <= 0) return;

    const prevIdx = currentStepIndex - 1;
    const prevStepData = activeSteps[prevIdx];

    set({
      currentStepIndex: prevIdx,
      viewMode: prevStepData.viewMode,
      activeBuildingCode: prevStepData.buildingCode ?? null,
      activeFloorLevel: prevStepData.floorLevel ?? null,
      cameraPosition: prevStepData.cameraPos,
      cameraTarget: prevStepData.cameraTarget,
      isCameraAnimating: true,
    });
  },

  goToStep: (index: number) => {
    const { activeSteps } = get();
    if (index < 0 || index >= activeSteps.length) return;

    const targetStep = activeSteps[index];
    set({
      currentStepIndex: index,
      viewMode: targetStep.viewMode,
      activeBuildingCode: targetStep.buildingCode ?? null,
      activeFloorLevel: targetStep.floorLevel ?? null,
      cameraPosition: targetStep.cameraPos,
      cameraTarget: targetStep.cameraTarget,
      isCameraAnimating: true,
    });
  },

  setViewMode: (mode: ViewMode, buildingCode?: string, floorLevel?: number) => {
    set({
      viewMode: mode,
      activeBuildingCode: buildingCode ?? null,
      activeFloorLevel: floorLevel ?? null,
    });
  },

  setCameraTransform: (position: Vector3Tuple, target: Vector3Tuple) => {
    set({
      cameraPosition: position,
      cameraTarget: target,
    });
  },

  setCameraAnimating: (isAnimating: boolean) => {
    set({ isCameraAnimating: isAnimating });
  },

  setSelectedLandmarkPhoto: (url: string | null) => {
    set({ selectedLandmarkPhoto: url });
  },

  resetNavigation: () => {
    const { currentQr } = get();
    const fallbackPos: Vector3Tuple = currentQr?.initialCameraPos ?? [0, 20, 35];
    const fallbackTarget: Vector3Tuple = currentQr?.initialCameraTarget ?? [0, 0, 0];

    set({
      currentStepIndex: 0,
      isNavigating: false,
      targetRoom: null,
      selectedBuildingCode: null,
      activeRoute: null,
      viewMode: 'OVERALL_CAMPUS',
      activeBuildingCode: null,
      activeFloorLevel: null,
      cameraPosition: fallbackPos,
      cameraTarget: fallbackTarget,
      selectedLandmarkPhoto: null,
    });
  },
}));
