'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X, School, ChevronRight } from 'lucide-react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { MOCK_ROOMS, MOCK_STEPS_CS1_TO_B302 } from '@/data/mockNavigationData';
import { RoomData } from '@/types/navigation';

export function TopSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const targetRoom = useNavigationStore((state) => state.targetRoom);
  const setTargetRoom = useNavigationStore((state) => state.setTargetRoom);
  const setRouteSteps = useNavigationStore((state) => state.setRouteSteps);
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

    if (room.code === 'B302') {
      setRouteSteps(MOCK_STEPS_CS1_TO_B302);
    } else {
      setRouteSteps([
        {
          id: `step_to_${room.code}`,
          stepOrder: 1,
          stage: room.floorLevel && room.floorLevel > 1 ? 'INDOOR' : 'OUTDOOR',
          instruction: `Di chuyển đến ${room.name} (${room.code})`,
          subText: `${room.buildingName ?? 'Tòa nhà'} - Tầng ${room.floorLevel ?? 1}`,
          directionType: 'STRAIGHT',
          viewMode: room.floorLevel && room.floorLevel > 1 ? 'BUILDING_FLOOR' : 'OVERALL_CAMPUS',
          buildingCode: room.buildingCode,
          floorLevel: room.floorLevel,
          pathPoints: [
            [-6, 0.15, 14],
            room.doorCoordinates,
          ],
          cameraPos: [24, 26, 24],
          cameraTarget: [0, 2, 0],
          distanceMeters: 45,
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
            <span className="text-slate-500 font-normal">Điểm đến: </span>
            <span className="text-slate-900 font-semibold">
              {targetRoom ? `${targetRoom.code} - ${targetRoom.buildingName ?? 'Tòa B'} (Cơ sở 1)` : 'Phòng B302 - Tòa B (Cơ sở 1)'}
            </span>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex flex-col justify-start items-center">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-4 mt-12 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900">Chọn phòng đích đến</span>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="relative mt-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
              <input
                type="text"
                autoFocus
                placeholder="Tìm phòng (B302, B301, Lab AI...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-3 max-h-64 overflow-y-auto space-y-1 pr-1">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSelectRoom(room)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {room.code.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {room.code} - {room.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {room.buildingName ?? 'Tòa nhà'} • Tầng {room.floorLevel ?? 1}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
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
