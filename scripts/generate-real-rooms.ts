import fs from 'fs';
import path from 'path';

interface CsvRow {
  building: string;
  floor: string;
  roomCode: string;
  roomName: string;
  roomType: string;
  notes: string;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split('\n');
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    rows.push({
      building: parts[0]?.trim() || '',
      floor: parts[1]?.trim() || '',
      roomCode: parts[2]?.trim() || '',
      roomName: parts[3]?.trim() || '',
      roomType: parts[4]?.trim() || '',
      notes: parts[5]?.trim() || '',
    });
  }
  return rows;
}

function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function getFloorLevel(floorStr: string): number {
  if (floorStr === 'Trệt') return 0;
  const match = floorStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function getBuildingCode(bldStr: string): string {
  if (bldStr === 'Tòa H') return 'toa_h';
  if (bldStr === 'Tòa I Lớn') return 'toa_i_lon';
  if (bldStr === 'Tòa K') return 'toa_k';
  if (bldStr === 'Tòa I Nhỏ') return 'xuong_oto';
  return 'toa_cs3';
}

function getDoorCoordinates(buildingCode: string, floorLevel: number, index: number, roomCode: string): [number, number, number] {
  const y = floorLevel * 2.4 + 0.4;
  if (buildingCode === 'toa_h') {
    if (floorLevel === 0) {
      if (roomCode.startsWith('WC')) {
        return roomCode.includes('NAM') ? [-6.5, 0.4, 15.0] : [-5.5, 0.4, 15.0];
      }
      // H001 - H013
      const num = parseInt(roomCode.replace(/\D/g, ''), 10);
      if (num <= 7) {
        return [-8.5, 0.4, 2.0 + (num - 1) * 1.8];
      } else {
        return [-3.5, 0.4, 2.0 + (num - 8) * 2.1];
      }
    } else {
      if (roomCode.startsWith('WC')) {
        return roomCode.includes('NAM') ? [-6.5, y, 15.0] : [-5.5, y, 15.0];
      }
      const num = parseInt(roomCode.replace(/\D/g, ''), 10) % 100;
      if (num <= 4) {
        return [-8.5, y, 2.0 + (num - 1) * 3.4];
      } else {
        return [-3.5, y, 2.0 + (num - 5) * 3.4];
      }
    }
  }

  if (buildingCode === 'toa_i_lon') {
    if (roomCode.startsWith('WC')) {
      return roomCode.includes('NAM') ? [-16.0, y, -17.5] : [-11.0, y, -17.5];
    }
    const isP1 = roomCode.endsWith('01');
    return isP1 ? [-15.0, y, -15.4] : [-12.0, y, -15.4];
  }

  if (buildingCode === 'toa_k') {
    if (floorLevel === 0) {
      const num = parseInt(roomCode.replace(/\D/g, ''), 10);
      if (num <= 3) {
        return [13.2, 0.4, 2.0 + (num - 1) * 3.0];
      } else {
        return [16.8, 0.4, 2.0 + (num - 4) * 3.0];
      }
    } else {
      return [15.0, y, 5.0];
    }
  }

  if (buildingCode === 'xuong_oto') {
    const offsets: Record<string, number> = {
      'XUONG-DONG-CO': -3.0,
      'XUONG-DIEN': 1.0,
      'XUONG-GAM': 5.0,
      'LT-O-TO': 9.0,
    };
    const zOffset = offsets[roomCode] ?? 3.5;
    return [-24.0, 0.4, zOffset];
  }

  return [0, y, 0];
}

const csvPath = path.resolve('docs/real_rooms_cs3.csv');
const content = fs.readFileSync(csvPath, 'utf-8');
const rows = parseCsv(content);

console.log(`Parsed ${rows.length} real room records from CSV.`);

// Generate JSON representation
const processedRooms = rows.map((r, idx) => {
  const buildingCode = getBuildingCode(r.building);
  const floorLevel = getFloorLevel(r.floor);
  const doorCoordinates = getDoorCoordinates(buildingCode, floorLevel, idx, r.roomCode);
  
  const kwList = [
    r.roomCode.toLowerCase(),
    r.roomCode.replace(/[-_]/g, ' ').toLowerCase(),
    r.roomName.toLowerCase(),
    removeAccents(r.roomName),
    r.building.toLowerCase(),
    removeAccents(r.building),
    buildingCode,
    r.roomType.toLowerCase(),
    r.floor.toLowerCase(),
    removeAccents(r.floor),
    'cs3',
    'co so 3',
  ];
  if (r.notes) {
    kwList.push(r.notes.toLowerCase());
    kwList.push(removeAccents(r.notes));
  }
  if (r.roomType === 'RESTROOM') {
    kwList.push('ve sinh', 'wc', 'toilet', 'nha ve sinh');
  }
  if (r.roomType === 'WORKSHOP') {
    kwList.push('thuc hanh', 'xuong', 'gara');
  }

  return {
    id: `room_${buildingCode}_${r.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    code: r.roomCode,
    name: r.roomName,
    roomType: r.roomType,
    notes: r.notes || undefined,
    buildingCode,
    buildingName: r.building,
    floorLevel,
    floorName: r.floor,
    searchKeywords: Array.from(new Set(kwList)).join(', '),
    doorCoordinates,
  };
});

fs.writeFileSync(
  path.resolve('src/data/realRoomsData.json'),
  JSON.stringify(processedRooms, null, 2),
  'utf-8'
);

console.log(`Saved ${processedRooms.length} rooms to src/data/realRoomsData.json`);

