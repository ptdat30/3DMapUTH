"""
Parametric 3D CAD Model of TÒA H (Campus 3 - UTH)
Built with build123d and cadgen for the 3DMapUTH interactive campus map.

Specifications based strictly on architectural blueprints and maquette references:
- 5 Floors (Ground Floor T1 + T2..T5 Upper Floors)
- Total Height: 12.0m (12,000mm) + Rooftop elevator core (13.8m)
- U-shaped footprint open to the East (Courtyard in center)
- Flexible Structural Grid:
    * Ground floor: 7 admin/small rooms on Left Wing, 4 large halls on Right Wing
    * Floors 2-5: 4 large standard classrooms on both Left & Right wings
- Vertical circulation:
    * Protruding central staircase tower at base of U with breeze block screen
    * Right-gable open emergency staircase with landings and railings
    * Left-gable ventilation louvers
- 4 Light-blue vertical corner pilasters
- Concrete courtyard balustrades & columns
- Roof parapet with gravel recess and elevator housing
"""

from pathlib import Path
import build123d as bd
from cadgen import model, export

# Dimensions in millimeters (1 unit = 1mm)
FLOORS = 5
FLOOR_HEIGHT = 2400.0
TOTAL_HEIGHT = FLOORS * FLOOR_HEIGHT  # 12000.0

WING_LENGTH = 15000.0       # 15.0m
ROOM_DEPTH = 4200.0         # 4.2m
CORRIDOR_WIDTH = 1300.0     # 1.3m
WING_TOTAL_WIDTH = ROOM_DEPTH + CORRIDOR_WIDTH  # 5500.0 (5.5m)

COURTYARD_WIDTH = 10500.0   # 10.5m
BASE_DEPTH = 2600.0         # 2.6m
TOTAL_WIDTH = COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH  # 21500.0 (21.5m)

# Colors (Hex sRGB)
COLOR_STUCCO = "#f8fafc"        # Crisp off-white plaster
COLOR_CONCRETE = "#e2e8f0"      # Light grey concrete
COLOR_BLUE = "#0284c7"          # UTH Brand Blue pilasters
COLOR_BALUSTRADE = "#ffffff"    # White dwarf balustrades
COLOR_RAILING = "#1e293b"       # Dark charcoal railings
COLOR_BREEZE = "#cbd5e1"        # Breeze blocks / louvers
COLOR_ROOF = "#94a3b8"          # Roof gravel / membrane
COLOR_GLASS = "#bae6fd"         # Window glass tint
COLOR_COURTYARD = "#f1f5f9"     # Courtyard concrete pavers


def make_floor_slab(level: int):
    """Generates the U-shaped concrete floor slab for a given level."""
    z_base = level * FLOOR_HEIGHT
    slab_thk = 180.0
    
    # Left wing slab (centered around Y = +8000 in build123d -> Z = -8.0m in Three.js)
    left_slab = bd.Box(
        WING_LENGTH, WING_TOTAL_WIDTH, slab_thk,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    left_slab = bd.Pos(0, (COURTYARD_WIDTH + WING_TOTAL_WIDTH) / 2, z_base) * left_slab
    
    # Right wing slab (centered around Y = -8000 in build123d -> Z = +8.0m in Three.js)
    right_slab = bd.Box(
        WING_LENGTH, WING_TOTAL_WIDTH, slab_thk,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    right_slab = bd.Pos(0, -(COURTYARD_WIDTH + WING_TOTAL_WIDTH) / 2, z_base) * right_slab
    
    # Base connecting slab at back (X = -WING_LENGTH/2 - BASE_DEPTH/2)
    base_x = -WING_LENGTH / 2 - BASE_DEPTH / 2
    base_slab = bd.Box(
        BASE_DEPTH, COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH, slab_thk,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    base_slab = bd.Pos(base_x, 0, z_base) * base_slab
    
    combined = bd.Compound(children=[left_slab, right_slab, base_slab], label=f"slab_floor_{level + 1}")
    combined.color = COLOR_CONCRETE
    return combined


def make_rooms_and_walls(level: int):
    """Generates the room volumes and walls for each floor."""
    z_base = level * FLOOR_HEIGHT + 180.0
    wall_height = FLOOR_HEIGHT - 180.0
    wall_parts = []
    
    # Left wing center in build123d is +8000mm; rooms are pushed outward (+Y)
    # Right wing center in build123d is -8000mm; rooms are pushed outward (-Y)
    left_rooms_y = (COURTYARD_WIDTH + WING_TOTAL_WIDTH) / 2 + CORRIDOR_WIDTH / 2
    right_rooms_y = -(COURTYARD_WIDTH + WING_TOTAL_WIDTH) / 2 - CORRIDOR_WIDTH / 2
    
    # Left Wing Rooms
    if level == 0:
        # Ground floor: 7 administrative rooms
        bay_len = WING_LENGTH / 7.0
        for i in range(7):
            bx = -WING_LENGTH / 2 + (i + 0.5) * bay_len
            room = bd.Box(
                bay_len * 0.94, ROOM_DEPTH, wall_height,
                align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
            )
            room = bd.Pos(bx, left_rooms_y, z_base) * room
            room.color = COLOR_STUCCO
            room.label = f"room_left_ground_{i + 1}"
            wall_parts.append(room)
    else:
        # Upper floors: 4 standard large classrooms
        bay_len = WING_LENGTH / 4.0
        for i in range(4):
            bx = -WING_LENGTH / 2 + (i + 0.5) * bay_len
            room = bd.Box(
                bay_len * 0.95, ROOM_DEPTH, wall_height,
                align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
            )
            room = bd.Pos(bx, left_rooms_y, z_base) * room
            room.color = COLOR_STUCCO
            room.label = f"room_left_f{level + 1}_{i + 1}"
            wall_parts.append(room)

    # Right Wing Rooms (4 large classrooms on all floors)
    bay_len_r = WING_LENGTH / 4.0
    for i in range(4):
        bx = -WING_LENGTH / 2 + (i + 0.5) * bay_len_r
        room = bd.Box(
            bay_len_r * 0.95, ROOM_DEPTH, wall_height,
            align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
        )
        room = bd.Pos(bx, right_rooms_y, z_base) * room
        room.color = COLOR_STUCCO
        room.label = f"room_right_f{level + 1}_{i + 1}"
        wall_parts.append(room)
        
    # Base connecting block (back wall & core facilities)
    base_x = -WING_LENGTH / 2 - BASE_DEPTH / 2
    base_core = bd.Box(
        BASE_DEPTH, COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH, wall_height,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    base_core = bd.Pos(base_x, 0, z_base) * base_core
    base_core.color = COLOR_STUCCO
    base_core.label = f"base_core_f{level + 1}"
    wall_parts.append(base_core)
    
    return bd.Compound(children=wall_parts, label=f"walls_floor_{level + 1}")


def make_corridors_and_balustrades(level: int):
    """Generates the open walkways, dwarf balustrades, and structural columns."""
    z_base = level * FLOOR_HEIGHT + 180.0
    rail_height = 850.0
    col_height = FLOOR_HEIGHT - 180.0
    elements = []
    
    # Left wing corridor sits at inner edge: Y = +COURTYARD_WIDTH / 2
    # Right wing corridor sits at inner edge: Y = -COURTYARD_WIDTH / 2
    left_edge_y = COURTYARD_WIDTH / 2
    right_edge_y = -COURTYARD_WIDTH / 2
    
    # 1. Left Wing Balustrade (Facing Courtyard)
    left_rail = bd.Box(
        WING_LENGTH, 120.0, rail_height,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    left_rail = bd.Pos(0, left_edge_y, z_base) * left_rail
    left_rail.color = COLOR_BALUSTRADE
    left_rail.label = f"balustrade_left_f{level + 1}"
    elements.append(left_rail)
    
    # 2. Right Wing Balustrade (Facing Courtyard)
    right_rail = bd.Box(
        WING_LENGTH, 120.0, rail_height,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    right_rail = bd.Pos(0, right_edge_y, z_base) * right_rail
    right_rail.color = COLOR_BALUSTRADE
    right_rail.label = f"balustrade_right_f{level + 1}"
    elements.append(right_rail)
    
    # 3. Base Connector Corridor Balustrade (at inner edge of courtyard, X = -WING_LENGTH / 2)
    base_rail = bd.Box(
        120.0, COURTYARD_WIDTH, rail_height,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    base_rail = bd.Pos(-WING_LENGTH / 2, 0, z_base) * base_rail
    base_rail.color = COLOR_BALUSTRADE
    base_rail.label = f"balustrade_base_f{level + 1}"
    elements.append(base_rail)
    
    # 4. Courtyard Columns (Every bay along inner corridors)
    col_size = 280.0
    num_cols = 5
    for i in range(num_cols):
        cx = -WING_LENGTH / 2 + i * (WING_LENGTH / (num_cols - 1))
        # Left column
        col_l = bd.Box(col_size, col_size, col_height, align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN))
        col_l = bd.Pos(cx, left_edge_y, z_base) * col_l
        col_l.color = COLOR_CONCRETE
        col_l.label = f"column_left_f{level + 1}_{i + 1}"
        elements.append(col_l)
        # Right column
        col_r = bd.Box(col_size, col_size, col_height, align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN))
        col_r = bd.Pos(cx, right_edge_y, z_base) * col_r
        col_r.color = COLOR_CONCRETE
        col_r.label = f"column_right_f{level + 1}_{i + 1}"
        elements.append(col_r)

    return bd.Compound(children=elements, label=f"corridors_floor_{level + 1}")


def make_central_staircase_tower():
    """
    Central Staircase Tower (Lõi giao thông trung tâm đáy chữ U):
    Protrudes into the courtyard from the back base connector.
    Rises above the roofline with breeze blocks and concrete frame.
    """
    tower_w = 3400.0   # Width along Y
    tower_d = 2800.0   # Depth along X (protruding into courtyard)
    tower_h = TOTAL_HEIGHT + 1800.0  # 13.8m total height
    
    center_x = -WING_LENGTH / 2 + tower_d / 2
    
    # Main tower outer body
    tower = bd.Box(
        tower_d, tower_w, tower_h,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    tower = bd.Pos(center_x, 0, 0) * tower
    tower.color = COLOR_STUCCO
    tower.label = "central_stair_tower"
    
    # Vertical breeze-block screen panel facing the courtyard (front face of tower)
    screen_d = 120.0
    screen_w = tower_w * 0.75
    screen_h = tower_h * 0.88
    screen = bd.Box(
        screen_d, screen_w, screen_h,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    screen = bd.Pos(center_x + tower_d / 2 - screen_d / 2, 0, 800.0) * screen
    screen.color = COLOR_BREEZE
    screen.label = "central_stair_breeze_screen"
    
    return bd.Compound(children=[tower, screen], label="central_staircase_unit")


def make_right_gable_emergency_stairs():
    """
    Right Wing Front Gable Staircase (Cụm thang thoát hiểm đầu hồi cánh phải):
    Open steel/concrete staircase tower with landings and black railings.
    Located at Y = -8000mm in build123d (Three.js Z = +8.0m).
    """
    stair_d = 2400.0
    stair_w = 2600.0
    stair_h = TOTAL_HEIGHT
    
    # Situated at the front gable of the right wing: X = +WING_LENGTH / 2 + stair_d / 2
    center_x = WING_LENGTH / 2 + stair_d / 2
    center_y = -(COURTYARD_WIDTH + WING_TOTAL_WIDTH) / 2
    
    stair_cage = bd.Box(
        stair_d, stair_w, stair_h,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    stair_cage = bd.Pos(center_x, center_y, 0) * stair_cage
    stair_cage.color = COLOR_CONCRETE
    stair_cage.label = "emergency_stair_right_gable"
    
    # Railings / black framework
    rail_strip = bd.Box(
        stair_d * 1.05, 100.0, stair_h,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    rail_strip = bd.Pos(center_x, center_y - stair_w / 2, 0) * rail_strip
    rail_strip.color = COLOR_RAILING
    rail_strip.label = "emergency_stair_railing"
    
    return bd.Compound(children=[stair_cage, rail_strip], label="right_gable_staircase")


def make_corner_pilasters():
    """
    4 Iconic UTH Brand-Blue Vertical Corner Pilasters
    located at the 4 exterior corners of the complex.
    """
    pilasters = []
    p_size = 400.0
    p_height = TOTAL_HEIGHT + 300.0
    
    half_l = WING_LENGTH / 2
    half_w = (COURTYARD_WIDTH + 2 * WING_TOTAL_WIDTH) / 2
    back_x = -WING_LENGTH / 2 - BASE_DEPTH
    
    corners = [
        # Front Left
        (half_l, half_w - p_size / 2, "pilaster_fl"),
        # Front Right
        (half_l, -half_w + p_size / 2, "pilaster_fr"),
        # Rear Left
        (back_x + p_size / 2, half_w - p_size / 2, "pilaster_rl"),
        # Rear Right
        (back_x + p_size / 2, -half_w + p_size / 2, "pilaster_rr"),
    ]
    
    for px, py, name in corners:
        p = bd.Box(p_size, p_size, p_height, align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN))
        p = bd.Pos(px, py, 0) * p
        p.color = COLOR_BLUE
        p.label = name
        pilasters.append(p)
        
    return bd.Compound(children=pilasters, label="blue_corner_pilasters")


def make_roof_parapet_and_housing():
    """
    Rooftop Parapet, Mechanical Penthouse and Gravel Infill.
    """
    z_roof = TOTAL_HEIGHT
    parapet_h = 600.0
    parapet_thk = 180.0
    parts = []
    
    # Outer parapet perimeter left wing
    para_l = bd.Box(
        WING_LENGTH, parapet_thk, parapet_h,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    para_l = bd.Pos(0, TOTAL_WIDTH / 2 - parapet_thk / 2, z_roof) * para_l
    para_l.color = COLOR_STUCCO
    para_l.label = "parapet_outer_left"
    parts.append(para_l)
    
    # Outer parapet perimeter right wing
    para_r = bd.Box(
        WING_LENGTH, parapet_thk, parapet_h,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    para_r = bd.Pos(0, -(TOTAL_WIDTH / 2 - parapet_thk / 2), z_roof) * para_r
    para_r.color = COLOR_STUCCO
    para_r.label = "parapet_outer_right"
    parts.append(para_r)
    
    # Mechanical elevator penthouse on roof above base
    mech_x = -WING_LENGTH / 2 - BASE_DEPTH / 2
    mech = bd.Box(
        BASE_DEPTH * 0.8, 3200.0, 1400.0,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    mech = bd.Pos(mech_x, 0, z_roof) * mech
    mech.color = COLOR_CONCRETE
    mech.label = "roof_elevator_housing"
    parts.append(mech)
    
    return bd.Compound(children=parts, label="roof_elements")


@model(name="toa_h")
def building_h():
    """
    Master Assembly of Tòa H (Campus 3).
    Returns a unified build123d Compound model with exact architectural hierarchy.
    """
    components = []
    
    # 1. Ground Courtyard Base
    base_ground = bd.Box(
        WING_LENGTH + 2000.0, COURTYARD_WIDTH, 120.0,
        align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN)
    )
    base_ground = bd.Pos(1000.0, 0, 0) * base_ground
    base_ground.color = COLOR_COURTYARD
    base_ground.label = "courtyard_ground"
    components.append(base_ground)
    
    # 2. Five Floor Levels (Slabs + Rooms + Corridors)
    for floor_idx in range(FLOORS):
        slab = make_floor_slab(floor_idx)
        rooms = make_rooms_and_walls(floor_idx)
        corridors = make_corridors_and_balustrades(floor_idx)
        components.extend([slab, rooms, corridors])
        
    # 3. Roof Slab
    roof_slab = make_floor_slab(FLOORS)
    components.append(roof_slab)
    
    # 4. Central Staircase Tower
    central_tower = make_central_staircase_tower()
    components.append(central_tower)
    
    # 5. Right Gable Emergency Staircase
    right_stair = make_right_gable_emergency_stairs()
    components.append(right_stair)
    
    # 6. Blue Corner Pilasters
    pilasters = make_corner_pilasters()
    components.append(pilasters)
    
    # 7. Roof Parapets & Mechanical Enclosures
    roof_elements = make_roof_parapet_and_housing()
    components.append(roof_elements)
    
    return bd.Compound(children=components, label="building_h_uth_cs3")


if __name__ == "__main__":
    doc = building_h()
    out_path = Path(__file__).resolve().parent.parent / "public" / "models" / "cs3" / "toa_h.glb"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    export(doc, out_path)
    print(f"Exported Tòa H successfully to {out_path}")
