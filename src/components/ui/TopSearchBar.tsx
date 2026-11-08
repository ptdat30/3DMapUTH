'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X, ChevronRight, MapPin } from 'lucide-react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { MOCK_ROOMS, MOCK_STEPS_CS1_TO_B302 } from '@/data/mockNavigationData';
import { RoomData } from '@/types/navigation';

function getRoomTypeBadge(type?: string) {
  switch (type) {
    case 'CLASSROOM':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Lớp học</span>;
    case 'RESTROOM':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">WC</span>;
    case 'OFFICE':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Văn phòng</span>;
    case 'HALL':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">Hội trường</span>;
    case 'WORKSHOP':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Xưởng TH</span>;
    default:
      return null;
  }
}

export function TopSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const targetRoom = useNavigationStore((state) => state.targetRoom);
  const activeRoute = useNavigationStore((state) => state.activeRoute);
  const selectedBuildingCode = useNavigationStore((state) => state.selectedBuildingCode);
  const setTargetRoom = useNavigationStore((state) => state.setTargetRoom);
  const setRouteSteps = useNavigationStore((state) => state.setRouteSteps);
  const setCampus = useNavigationStore((state) => state.setCampus);
  const setSelectedBuilding = useNavigationStore((state) => state.setSelectedBuilding);
  const startRouteBetweenBuildings = useNavigationStore((state) => state.startRouteBetweenBuildings);
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_ROOMS;
    const query = searchQuery.toLowerCase();
    return MOCK_ROOMS.filter(
      (room) =>
        room.code.toLowerCase().includes(query) ||
        room.name.toLowerCase().includes(query) ||
        room.searchKeywords.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectRoom = (room: RoomData) => {
    setTargetRoom(room);
    setIsSearchOpen(false);
    setSearchQuery('');

    if (room.buildingCode) {
      setSelectedBuilding(room.buildingCode);
    }

    if (room.buildingCode && ['toa_h', 'toa_i_lon', 'toa_k', 'xuong_oto', 'toa_j', 'toa_l'].includes(room.buildingCode)) {
      setCampus('cs3');
    }

    if (room.code === 'B302') {
      setRouteSteps(MOCK_STEPS_CS1_TO_B302);
    } else {
      const isIndoor = room.floorLevel !== undefined && room.floorLevel > 0;
      setRouteSteps([
        {
          id: `step_to_${room.code}`,
          stepOrder: 1,
          stage: isIndoor ? 'INDOOR' : 'OUTDOOR',
          instruction: `Di chuyển đến ${room.name} (${room.code})`,
          subText: `${room.buildingName ?? 'Tòa nhà'} • ${room.floorLevel === 0 ? 'Tầng Trệt' : `Tầng ${room.floorLevel}`}${room.notes ? ` • ${room.notes}` : ''}`,
          directionType: 'STRAIGHT',
          viewMode: isIndoor ? 'BUILDING_FLOOR' : 'OVERALL_CAMPUS',
          buildingCode: room.buildingCode,
          floorLevel: room.floorLevel,
          pathPoints: [
            [-4.5, 0.2, 7.0],
            room.doorCoordinates,
          ],
          cameraPos: [room.doorCoordinates[0] + 12, (room.floorLevel ?? 0) * 2.4 + 16, room.doorCoordinates[2] + 18],
          cameraTarget: room.doorCoordinates,
          distanceMeters: 35,
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating White Top Search Bar */}
      <div className="absolute top-4 left-4 right-4 max-w-md mx-auto z-30 pointer-events-auto">
        <div
          onClick={() => setIsSearchOpen(true)}
          className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center gap-2.5 cursor-pointer hover:bg-white transition-all active:scale-[0.99]"
        >
          {/* Back Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetNavigation();
            }}
            className="text-slate-700 hover:text-black p-0.5 rounded-lg -ml-1 transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Search Glass Icon */}
          <Search className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.5} />

          {/* Search Text */}
          <div className="flex-1 text-[13px] leading-tight truncate">
            {activeRoute ? (
              <>
                <span className="text-sky-600 font-semibold">Lộ trình: </span>
                <span className="text-slate-900 font-bold">Tòa H → Tòa J (Cơ sở 3)</span>
              </>
            ) : selectedBuildingCode ? (
              <>
                <span className="text-slate-500 font-normal">Đang chọn: </span>
                <span className="text-slate-900 font-semibold uppercase">{selectedBuildingCode.replace(/_/g, ' ')}</span>
              </>
            ) : (
              <>
                <span className="text-slate-400 font-normal">Đến: </span>
                <span className="text-slate-900 font-bold">
                  {targetRoom ? `${targetRoom.code} - ${targetRoom.name}` : 'Tìm phòng (I001, K001, H101...)'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-16 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Tra cứu phòng & khu chức năng UTH</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Quick Actions (CS3 Route) */}
            <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-sky-900">Lộ trình mẫu Cơ sở 3</div>
                <div className="text-[11px] text-sky-700">Tòa H → Tòa J (75m, ~1 phút)</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  startRouteBetweenBuildings('toa_h', 'toa_j');
                  setIsSearchOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Dẫn đường
              </button>
            </div>

            <div className="relative mt-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
              <input
                type="text"
                autoFocus
                placeholder="Nhập mã phòng, tên phòng hoặc viện (I001, K001, H101, Viện CNTT, WC...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-1 pr-1">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSelectRoom(room)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {room.code.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5 flex-wrap">
                        <span>{room.code}</span>
                        <span>-</span>
                        <span>{room.name}</span>
                        {getRoomTypeBadge(room.roomType)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {room.buildingName ?? 'Tòa nhà'} • {room.floorLevel === 0 ? 'Tầng Trệt' : `Tầng ${room.floorLevel}`}
                        {room.notes && <span className="text-slate-400 ml-1">({room.notes})</span>}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" strokeWidth={1.5} />
                </button>
              ))}

              {filteredRooms.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  Không tìm thấy phòng phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
