import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';

export type TourStage =
  | 'IDLE'
  | 'PAN_TO_GYM'
  | 'HIGHLIGHT_GYM'
  | 'PAN_BACK'
  | 'DRAWING_PATH'
  | 'COMPLETED';

export interface UseCinematicTourOptions {
  /** Tham chiếu tới OrbitControls của Scene */
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  /** Tọa độ hiện tại của người dùng (Vector3 hoặc mảng [x, y, z]) */
  userPosition: THREE.Vector3 | [number, number, number];
  /** Tọa độ tâm của Phòng Gym (Vector3 hoặc mảng [x, y, z]) */
  gymPosition: THREE.Vector3 | [number, number, number];
  /** Danh sách các tọa độ điểm mốc trên đường đi từ User đến Gym */
  pathPoints?: (THREE.Vector3 | [number, number, number])[];
  /** Độ lệch góc nhìn camera so với mục tiêu Gym (mặc định góc isometric cận cảnh) */
  gymCameraOffset?: [number, number, number];
  /** Độ lệch góc nhìn camera so với vị trí người dùng (mặc định góc quan sát toàn cảnh) */
  userCameraOffset?: [number, number, number];
  /** Callback khi bắt đầu tour */
  onTourStart?: () => void;
  /** Callback khi tour hoàn thành trọn vẹn */
  onTourComplete?: () => void;
  /** Callback khi người dùng ấn nút Bỏ qua (Skip) */
  onTourSkip?: () => void;
}

export interface UseCinematicTourReturn {
  /** Hàm kích hoạt kịch bản Cinematic Tour */
  startTour: () => void;
  /** Hàm bỏ qua kịch bản, chuyển ngay đến trạng thái kết thúc */
  skipTour: () => void;
  /** Đang trong quá trình chạy tour hay không (dùng để hiển thị nút Bỏ qua trên UI) */
  isTouring: boolean;
  /** Đang ở giai đoạn highlight phòng Gym hay không (dùng để hiển thị Billboard/Tooltip) */
  isHighlightingGym: boolean;
  /** Tiến độ vẽ đường đi từ 0.0 đến 1.0 (dùng để animate spline/line) */
  pathDrawProgress: number;
  /** Tỷ lệ phóng to phục vụ hiệu ứng pulse của khối phòng Gym */
  gymScale: number;
  /** Cường độ sáng phát quang của vật liệu phòng Gym */
  gymEmissiveIntensity: number;
  /** Giai đoạn hiện tại của timeline */
  currentStage: TourStage;
  /** Mảng vector điểm đường đi đã được chuẩn hóa */
  normalizedPathPoints: THREE.Vector3[];
}

/**
 * Custom Hook điều phối kịch bản Cinematic Tour khi tìm kiếm "Phòng Gym tại CS3"
 * Sử dụng GSAP Timeline để đồng bộ camera orbit, hiệu ứng highlight và progressive path rendering.
 */
export function useCinematicTour({
  controlsRef,
  userPosition,
  gymPosition,
  pathPoints = [],
  gymCameraOffset = [10, 12, 10],
  userCameraOffset = [20, 24, 20],
  onTourStart,
  onTourComplete,
  onTourSkip,
}: UseCinematicTourOptions): UseCinematicTourReturn {
  const { camera } = useThree();

  // Các reactive states phục vụ Render Component & UI
  const [isTouring, setIsTouring] = useState<boolean>(false);
  const [isHighlightingGym, setIsHighlightingGym] = useState<boolean>(false);
  const [pathDrawProgress, setPathDrawProgress] = useState<number>(0);
  const [gymScale, setGymScale] = useState<number>(1.0);
  const [gymEmissiveIntensity, setGymEmissiveIntensity] = useState<number>(0.0);
  const [currentStage, setCurrentStage] = useState<TourStage>('IDLE');

  // Quản lý Timeline GSAP
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Chuẩn hóa tọa độ bằng useMemo để không vi phạm quy tắc React Hooks Refs
  const userVec = useMemo(() => {
    return Array.isArray(userPosition)
      ? new THREE.Vector3(userPosition[0], userPosition[1], userPosition[2])
      : userPosition.clone();
  }, [userPosition]);

  const gymVec = useMemo(() => {
    return Array.isArray(gymPosition)
      ? new THREE.Vector3(gymPosition[0], gymPosition[1], gymPosition[2])
      : gymPosition.clone();
  }, [gymPosition]);

  // Chuẩn hóa mảng pathPoints thành THREE.Vector3[]
  const normalizedPathPoints = useMemo(() => {
    return pathPoints.map((pt) =>
      Array.isArray(pt) ? new THREE.Vector3(pt[0], pt[1], pt[2]) : pt.clone()
    );
  }, [pathPoints]);

  // ==========================================================================
  // HÀM KÍCH HOẠT TOUR (START TOUR TIMELINE)
  // ==========================================================================
  const startTour = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Hủy bỏ timeline cũ nếu đang chạy dở
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Bắt đầu chuỗi trạng thái
    setIsTouring(true);
    setPathDrawProgress(0);
    setGymScale(1.0);
    setGymEmissiveIntensity(0.0);
    setIsHighlightingGym(false);
    onTourStart?.();

    // ------------------------------------------------------------------------
    // BƯỚC 1: KHÓA TƯƠNG TÁC (DISABLE ORBIT CONTROLS)
    // ------------------------------------------------------------------------
    controls.enabled = false;

    // Đối tượng nội suy trạng thái trung gian cho GSAP
    const animProxy = {
      // Tọa độ Camera Position
      camX: camera.position.x,
      camY: camera.position.y,
      camZ: camera.position.z,
      // Tọa độ Controls Target (điểm nhìn)
      tarX: controls.target.x,
      tarY: controls.target.y,
      tarZ: controls.target.z,
      // Hiệu ứng Gym
      scale: 1.0,
      emissive: 0.0,
      // Tiến độ vẽ đường đi
      drawProgress: 0.0,
    };

    // Tọa độ camera khi lia đến cận cảnh Phòng Gym
    const targetGymCamX = gymVec.x + gymCameraOffset[0];
    const targetGymCamY = gymVec.y + gymCameraOffset[1];
    const targetGymCamZ = gymVec.z + gymCameraOffset[2];

    // Tọa độ camera khi quay trở lại vị trí người dùng
    const returnCamX = userVec.x + userCameraOffset[0];
    const returnCamY = userVec.y + userCameraOffset[1];
    const returnCamZ = userVec.z + userCameraOffset[2];

    // Khởi tạo Timeline GSAP
    const tl = gsap.timeline({
      onUpdate: () => {
        // Cập nhật vị trí Camera và tâm xoay Controls theo từng tick của timeline
        camera.position.set(animProxy.camX, animProxy.camY, animProxy.camZ);
        controls.target.set(animProxy.tarX, animProxy.tarY, animProxy.tarZ);
        controls.update();

        // Cập nhật các trạng thái phản hồi
        setGymScale(animProxy.scale);
        setGymEmissiveIntensity(animProxy.emissive);
        setPathDrawProgress(animProxy.drawProgress);
      },
      onComplete: () => {
        // --------------------------------------------------------------------
        // BƯỚC 6: MỞ KHÓA TƯƠNG TÁC KHI HOÀN THÀNH (ENABLE CONTROLS)
        // --------------------------------------------------------------------
        controls.enabled = true;
        setIsTouring(false);
        setIsHighlightingGym(false);
        setCurrentStage('COMPLETED');
        onTourComplete?.();
      },
    });

    // ------------------------------------------------------------------------
    // BƯỚC 2: LIA CAMERA ĐẾN PHÒNG GYM (PAN TO TARGET - 2.0 GIÂY)
    // ------------------------------------------------------------------------
    tl.add(() => {
      setCurrentStage('PAN_TO_GYM');
    });

    tl.to(
      animProxy,
      {
        camX: targetGymCamX,
        camY: targetGymCamY,
        camZ: targetGymCamZ,
        tarX: gymVec.x,
        tarY: gymVec.y,
        tarZ: gymVec.z,
        duration: 2.0,
        ease: 'power2.inOut',
      },
      '+=0.1'
    );

    // ------------------------------------------------------------------------
    // BƯỚC 3: HIGHLIGHT PHÒNG GYM & HIỂN THỊ BILLBOARD (1.5 GIÂY)
    // ------------------------------------------------------------------------
    tl.add(() => {
      setCurrentStage('HIGHLIGHT_GYM');
      setIsHighlightingGym(true);
    });

    // Pulse phóng to nhẹ lên 1.06 và kích hoạt phát quang viền
    tl.to(animProxy, {
      scale: 1.06,
      emissive: 2.4,
      duration: 0.75,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1, // Tổng thời lượng highlight đúng 1.5 giây (0.75s * 2)
    });

    tl.add(() => {
      setIsHighlightingGym(false);
    });

    // ------------------------------------------------------------------------
    // BƯỚC 4: QUAY VỀ VỊ TRÍ USER BAN ĐẦU (PAN BACK - 2.0 GIÂY)
    // ------------------------------------------------------------------------
    tl.add(() => {
      setCurrentStage('PAN_BACK');
    });

    tl.to(animProxy, {
      camX: returnCamX,
      camY: returnCamY,
      camZ: returnCamZ,
      tarX: userVec.x,
      tarY: userVec.y,
      tarZ: userVec.z,
      duration: 2.0,
      ease: 'power2.inOut',
    });

    // ------------------------------------------------------------------------
    // BƯỚC 5: VẼ DẦN ĐƯỜNG ĐI (DRAW PATH ANIMATION - 1.8 GIÂY)
    // ------------------------------------------------------------------------
    tl.add(() => {
      setCurrentStage('DRAWING_PATH');
    });

    tl.to(animProxy, {
      drawProgress: 1.0,
      duration: 1.8,
      ease: 'power1.inOut',
    });

    timelineRef.current = tl;
  }, [
    camera,
    controlsRef,
    gymVec,
    userVec,
    gymCameraOffset,
    userCameraOffset,
    onTourStart,
    onTourComplete,
  ]);

  // ==========================================================================
  // HÀM BỎ QUA TOUR (SKIP TOUR)
  // ==========================================================================
  const skipTour = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    const controls = controlsRef.current;
    if (controls) {
      // Đưa camera về vị trí quan sát trên cao của người dùng
      const finalCamX = userVec.x + userCameraOffset[0];
      const finalCamY = userVec.y + userCameraOffset[1];
      const finalCamZ = userVec.z + userCameraOffset[2];

      camera.position.set(finalCamX, finalCamY, finalCamZ);
      controls.target.set(userVec.x, userVec.y, userVec.z);
      controls.update();
      controls.enabled = true;
    }

    // Đưa toàn bộ trạng thái về kết thúc
    setGymScale(1.0);
    setGymEmissiveIntensity(0.0);
    setIsHighlightingGym(false);
    setPathDrawProgress(1.0); // Hiển thị sẵn 100% đường đi
    setIsTouring(false);
    setCurrentStage('COMPLETED');

    onTourSkip?.();
  }, [camera, controlsRef, userVec, userCameraOffset, onTourSkip]);

  // ==========================================================================
  // CLEANUP FUNCTION KHI UNMOUNT
  // ==========================================================================
  useEffect(() => {
    const controls = controlsRef.current;
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      if (controls) {
        // Bảo đảm không bao giờ khóa cứng OrbitControls khi rời trang
        controls.enabled = true;
      }
    };
  }, [controlsRef]);

  return {
    startTour,
    skipTour,
    isTouring,
    isHighlightingGym,
    pathDrawProgress,
    gymScale,
    gymEmissiveIntensity,
    currentStage,
    normalizedPathPoints,
  };
}
