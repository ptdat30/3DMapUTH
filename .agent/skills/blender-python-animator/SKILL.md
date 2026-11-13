---
name: blender-python-animator
description: "TỰ ĐỘNG KÍCH HOẠT khi tạo model 3D mới, dựng khối, chỉnh sửa mesh, tạo vật liệu PBR, gắn xương (rigging), làm hoạt hình (animation/keyframe) trong Blender hoặc xuất file .glb từ Blender."
---

# Blender Python & Animation Architect Skill

## 1. Giao tiếp qua Blender MCP
Khi tương tác với Blender qua MCP Server `blender` (`uvx blender-mcp`):
1. **Kiểm tra trạng thái Scene trước khi thao tác:** Sử dụng lệnh gọi tool `get_scene_info` để nắm danh sách object, collections và active object hiện tại.
2. **Thực thi script Python tự động:** Sử dụng `execute_blender_code` để chạy các đoạn mã `bpy`.

## 2. Quy trình Chuẩn Hóa Mesh & Pivot Point (Bắt buộc cho WebGL)

Khi xuất model sang Three.js, lỗi phổ biến nhất là tâm xoay (origin) bị lệch hoặc transform chưa được áp dụng (unapplied scale):

```python
import bpy

def standardize_active_object():
    obj = bpy.context.active_object
    if not obj or obj.type != 'MESH':
        return

    # 1. Apply All Transforms (Location, Rotation, Scale)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Đặt Origin xuống đáy thấp nhất của vật thể (Bottom Center)
    # Giúp vật thể tiếp đất chính xác tại Y = 0 trong Three.js
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    
    # Dịch chuyển 3D cursor xuống đáy và gán lại origin
    bbox = [obj.matrix_world @ v.co for v in obj.data.vertices]
    min_z = min(v.z for v in bbox)
    center_x = (min(v.x for v in bbox) + max(v.x for v in bbox)) / 2
    center_y = (min(v.y for v in bbox) + max(v.y for v in bbox)) / 2
    
    bpy.context.scene.cursor.location = (center_x, center_y, min_z)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

standardize_active_object()
```

## 3. Tạo Vật liệu PBR Tự động (Procedural Shader Nodes)

```python
import bpy

def create_pbr_building_material(name="Mat_ArchitecturalConcrete", color=(0.85, 0.88, 0.92, 1.0)):
    # Tạo Material mới
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    # Xóa các node mặc định
    nodes.clear()
    
    # Tạo Principled BSDF & Material Output
    output_node = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf_node = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    # Thiết lập tham số PBR
    bsdf_node.inputs['Base Color'].default_value = color
    bsdf_node.inputs['Roughness'].default_value = 0.65
    bsdf_node.inputs['Metallic'].default_value = 0.1
    
    # Nối dây node
    links.new(bsdf_node.outputs['BSDF'], output_node.inputs['Surface'])
    return mat
```

## 4. Thiết lập Keyframe Animation & F-Curves mượt mà

```python
import bpy

def animate_floating_building(obj_name="Building_H"):
    obj = bpy.data.objects.get(obj_name)
    if not obj:
        return
    
    # Xóa animation cũ nếu có
    obj.animation_data_clear()
    
    # Frame 1: Vị trí gốc
    obj.location.z = 0.0
    obj.keyframe_insert(data_path="location", frame=1, index=2)
    
    # Frame 60: Nâng lên 2.0 mét
    obj.location.z = 2.0
    obj.keyframe_insert(data_path="location", frame=60, index=2)
    
    # Frame 120: Về vị trí gốc
    obj.location.z = 0.0
    obj.keyframe_insert(data_path="location", frame=120, index=2)
    
    # Đặt Interpolation thành Bezier để chuyển động êm dịu
    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            for kf in fcurve.keyframe_points:
                kf.interpolation = 'BEZIER'
                kf.easing = 'EASE_IN_OUT'
```

## 5. Lệnh xuất file `.glb` Tối ưu hóa Draco cho Web

```python
import bpy

def export_web_optimized_glb(filepath):
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=True,              # Chỉ xuất các vật thể được chọn
        export_apply=True,                 # Tự động apply modifier
        export_yup=True,                   # Chuyển trục Z-up sang Y-up cho Three.js
        export_draco_mesh_compression_enable=True, # Bật nén Draco giảm 70% dung lượng
        export_draco_mesh_compression_level=7,
        export_materials='EXPORT',
        export_colors=True,
    )
    print(f"Exported optimized WebGL model to: {filepath}")
```

