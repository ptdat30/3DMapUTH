import { create } from 'zustand';
import {
  NavigationStoreState,
  NavigationStep,
  QrNodeData,
  RoomData,
  Vector3Tuple,
  ViewMode,
} from '@/types/navigation';
import {
  MOCK_QR_NODES,
  MOCK_ROOMS,
  MOCK_STEPS_CS1_TO_B302,
} from '@/data/mockNavigationData';

const DEFAULT_ORIGIN_QR = MOCK_QR_NODES[0];
const DEFAULT_TARGET_ROOM = MOCK_ROOMS[0];

export const useNavigationStore = create<NavigationStoreState>((set, get) => ({
  // Defaults
  currentCampusCode: 'cs1',
  currentQr: DEFAULT_ORIGIN_QR,
  targetRoom: DEFAULT_TARGET_ROOM,

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
      viewMode: 'OVERALL_CAMPUS',
      activeBuildingCode: null,
      activeFloorLevel: null,
      cameraPosition: fallbackPos,
      cameraTarget: fallbackTarget,
      selectedLandmarkPhoto: null,
    });
  },
}));
