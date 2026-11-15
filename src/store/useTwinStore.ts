'use client';

import { create } from 'zustand';
import {
  HealthStatus,
  ScenarioId,
  TwinLayers,
  BuildingNode,
  AccessPointNode,
  NetworkAlert,
  TimeSeriesPoint,
} from '@/types/wifiTwin';
import {
  generateCampusSimulation,
  CampusSimulationData,
} from '@/simulation/campusGenerator';

interface TwinStoreState {
  // Main Toggle
  isTwinMode: boolean;

  // Simulation Parameters
  scenario: ScenarioId;
  currentHour: number; // 0 to 23.5 (in increments of 0.5)
  isPlaying: boolean;
  playbackSpeed: number; // 1, 5, 10
  resolvedAlertIds: string[];

  // Selection & Drill-down
  selectedBuildingId: string | null;
  selectedFloorNumber: number | null;
  selectedApId: string | null;
  searchQuery: string;
  statusFilter: HealthStatus | 'ALL';

  // Active 3D Layers
  activeLayers: TwinLayers;

  // Compare Mode
  isCompareMode: boolean;
  compareBuildingId: string | null;

  // Camera Fly-to Target (world coordinates)
  cameraFocusTarget: [number, number, number] | null;

  // Cached Generated Data
  simulationData: CampusSimulationData;

  // Actions
  toggleTwinMode: (force?: boolean) => void;
  setScenario: (scenario: ScenarioId) => void;
  setCurrentHour: (hour: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  selectBuilding: (id: string | null) => void;
  selectFloor: (floor: number | null) => void;
  selectAp: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: HealthStatus | 'ALL') => void;
  toggleLayer: (layerKey: keyof TwinLayers) => void;
  toggleCompareMode: () => void;
  setCompareBuilding: (id: string | null) => void;
  autoFixAlert: (alertId: string) => void;
  flyTo: (coords: [number, number, number]) => void;
  resetView: () => void;
  stepForward: () => void;
}

const DEFAULT_SCENARIO: ScenarioId = 'PEAK_SHIFT_CHANGE';
const DEFAULT_HOUR = 9.5; // 09:30 AM
const INITIAL_DATA = generateCampusSimulation(DEFAULT_SCENARIO, DEFAULT_HOUR, []);

export const useTwinStore = create<TwinStoreState>((set, get) => ({
  isTwinMode: false,
  scenario: DEFAULT_SCENARIO,
  currentHour: DEFAULT_HOUR,
  isPlaying: false,
  playbackSpeed: 1,
  resolvedAlertIds: [],

  selectedBuildingId: null,
  selectedFloorNumber: null,
  selectedApId: null,
  searchQuery: '',
  statusFilter: 'ALL',

  activeLayers: {
    heatmap: true,
    apBeacons: true,
    buildingLabels: true,
    xraySlices: true,
    alertPillars: true,
  },

  isCompareMode: false,
  compareBuildingId: null,
  cameraFocusTarget: null,

  simulationData: INITIAL_DATA,

  toggleTwinMode: (force) => {
    set((state) => {
      const nextMode = force !== undefined ? force : !state.isTwinMode;
      return {
        isTwinMode: nextMode,
        // Reset drill-down on toggle
        selectedBuildingId: null,
        selectedFloorNumber: null,
        selectedApId: null,
        cameraFocusTarget: null,
      };
    });
  },

  setScenario: (scenario) => {
    const { currentHour, resolvedAlertIds } = get();
    const nextData = generateCampusSimulation(scenario, currentHour, resolvedAlertIds);
    set({ scenario, simulationData: nextData });
  },

  setCurrentHour: (currentHour) => {
    const { scenario, resolvedAlertIds } = get();
    const clampedHour = Math.max(0, Math.min(23.5, currentHour));
    const nextData = generateCampusSimulation(scenario, clampedHour, resolvedAlertIds);
    set({ currentHour: clampedHour, simulationData: nextData });
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

  selectBuilding: (id) => {
    const { simulationData } = get();
    const bldg = simulationData.buildings.find((b) => b.id === id);
    set({
      selectedBuildingId: id,
      selectedFloorNumber: null,
      selectedApId: null,
      cameraFocusTarget: bldg ? bldg.center3D : null,
    });
  },

  selectFloor: (floor) => {
    set({
      selectedFloorNumber: floor,
      selectedApId: null,
    });
  },

  selectAp: (id) => {
    const { simulationData } = get();
    const ap = simulationData.accessPoints.find((a) => a.id === id);
    if (ap) {
      set({
        selectedApId: id,
        selectedBuildingId: ap.buildingId,
        selectedFloorNumber: ap.floorNumber,
        cameraFocusTarget: ap.position3D,
      });
    } else {
      set({ selectedApId: null });
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  toggleLayer: (layerKey) => {
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [layerKey]: !state.activeLayers[layerKey],
      },
    }));
  },

  toggleCompareMode: () => {
    set((state) => {
      const nextCompare = !state.isCompareMode;
      return {
        isCompareMode: nextCompare,
        compareBuildingId: nextCompare ? (state.selectedBuildingId === 'bldg-C' ? 'bldg-B' : 'bldg-C') : null,
      };
    });
  },

  setCompareBuilding: (compareBuildingId) => set({ compareBuildingId }),

  autoFixAlert: (alertId) => {
    const { scenario, currentHour, resolvedAlertIds } = get();
    if (!resolvedAlertIds.includes(alertId)) {
      const updatedResolved = [...resolvedAlertIds, alertId];
      const nextData = generateCampusSimulation(scenario, currentHour, updatedResolved);
      set({
        resolvedAlertIds: updatedResolved,
        simulationData: nextData,
      });
    }
  },

  flyTo: (coords) => set({ cameraFocusTarget: coords }),

  resetView: () => {
    set({
      selectedBuildingId: null,
      selectedFloorNumber: null,
      selectedApId: null,
      cameraFocusTarget: [0, 2, 4],
      isCompareMode: false,
      compareBuildingId: null,
    });
  },

  stepForward: () => {
    const { currentHour, isPlaying } = get();
    if (!isPlaying) return;
    let nextHour = currentHour + 0.5;
    if (nextHour > 23.5) nextHour = 0;
    get().setCurrentHour(nextHour);
  },
}));
