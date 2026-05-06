import sys
import os

# Remove user scripts modules from path to avoid conflicts with broken packages
# This MUST be done before importing osmnx or other external libraries
user_scripts_path = "/Users/yush/Library/Application Support/Blender/4.3/scripts/modules"
if user_scripts_path in sys.path:
    sys.path.remove(user_scripts_path)

import bpy
import osmnx as ox
import networkx as nx

def create_road_map(location="Empire State Building, New York, USA", dist=500, target_size=200):
    # 1. Clear existing 'RoadMap' object if it exists
    if "RoadMap" in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects["RoadMap"], do_unlink=True)
    if "RoadMapCurve" in bpy.data.curves:
        bpy.data.curves.remove(bpy.data.curves["RoadMapCurve"], do_unlink=True)

    # Configure OSMnx to use a writable cache directory
    ox.settings.use_cache = True
    ox.settings.cache_folder = "/Volumes/disk_2/program/MAze_gen/MAP_cache"
    
    print(f"Downloading data for: {location}...")
    
    # 2. Download street network
    # network_type='drive' for only roads for cars, 'all' for everything
    G = ox.graph_from_address(location, dist=dist, network_type='drive')
    
    # Project to UTM to get meters (important for Blender scale)
    G_proj = ox.project_graph(G)
    
    print("Graph downloaded and projected. Creating Blender geometry...")

    # 3. Calculate bounds and scale
    nodes = ox.graph_to_gdfs(G_proj, nodes=True, edges=False)
    min_x = nodes['geometry'].x.min()
    max_x = nodes['geometry'].x.max()
    min_y = nodes['geometry'].y.min()
    max_y = nodes['geometry'].y.max()

    width = max_x - min_x
    height = max_y - min_y
    max_dim = max(width, height)
    
    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2

    scale_factor = 1.0
    if target_size > 0 and max_dim > 0:
        scale_factor = target_size / max_dim
        print(f"Scaling map by factor: {scale_factor:.4f} (Original size: {max_dim:.2f}m -> Target: {target_size})")
    else:
        print("Keeping original scale (1 unit = 1 meter)")

    # 4. Create Blender Curve Data
    curve_data = bpy.data.curves.new(name="RoadMapCurve", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.fill_mode = 'FULL'
    # Scale the road width proportionally, but ensure it's at least visible
    # Base width 2.0m scaled down
    curve_data.bevel_depth = max(2.0 * scale_factor, 0.001) 
    curve_data.bevel_resolution = 2

    # 5. Iterate edges and add splines
    for u, v, data in G_proj.edges(data=True):
        # Check if geometry exists, otherwise it's a straight line between u and v
        if 'geometry' in data:
            coords = list(data['geometry'].coords)
        else:
            # Get coordinates of u and v
            x1 = G_proj.nodes[u]['x']
            y1 = G_proj.nodes[u]['y']
            x2 = G_proj.nodes[v]['x']
            y2 = G_proj.nodes[v]['y']
            coords = [(x1, y1), (x2, y2)]
        
        # Create a new spline for this road segment
        spline = curve_data.splines.new(type='POLY')
        spline.points.add(len(coords) - 1) # One point exists by default
        
        for i, (x, y) in enumerate(coords):
            # Adjust coordinates relative to center, scale them, and set Z to 0
            bx = (x - center_x) * scale_factor
            by = (y - center_y) * scale_factor
            bz = 0
            
            # points are (x, y, z, w)
            spline.points[i].co = (bx, by, bz, 1.0)

    # 6. Create Object and Link to Scene
    obj = bpy.data.objects.new("RoadMap", curve_data)
    bpy.context.collection.objects.link(obj)

    # 7. Create and Assign Material (Principled BSDF with Orange Emission)
    assign_material(obj, "RoadNeonOrange", (1.0, 0.5, 0.0, 1.0), 4.2)
    
    print("Road map created successfully!")

    # 8. Create Administrative Boundaries
    print("Creating administrative boundaries...")
    create_boundary_curve(location, center_x, center_y, scale_factor)

def assign_material(obj, name, color, strength):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
    
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    output_node = nodes.new(type='ShaderNodeOutputMaterial')
    output_node.location = (300, 0)
    
    bsdf_node = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf_node.location = (0, 0)
    
    links.new(bsdf_node.outputs['BSDF'], output_node.inputs['Surface'])
    
    bsdf_node.inputs['Emission Color'].default_value = color
    bsdf_node.inputs['Emission Strength'].default_value = strength
    
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

def create_boundary_curve(location, center_x, center_y, scale_factor):
    try:
        # Get the boundary GeoDataFrame
        gdf = ox.geocode_to_gdf(location)
        
        if "BoundaryCurve" in bpy.data.curves:
            bpy.data.curves.remove(bpy.data.curves["BoundaryCurve"], do_unlink=True)
        if "Boundary" in bpy.data.objects:
            bpy.data.objects.remove(bpy.data.objects["Boundary"], do_unlink=True)

        curve_data = bpy.data.curves.new(name="BoundaryCurve", type='CURVE')
        curve_data.dimensions = '3D'
        curve_data.fill_mode = 'FULL'
        # Thinner than roads to be secondary
        curve_data.bevel_depth = max(1.0 * scale_factor, 0.0005)
        curve_data.bevel_resolution = 2

        # Handle both Polygon and MultiPolygon
        geometries = gdf['geometry'].tolist()
        
        for geom in geometries:
            if geom.geom_type == 'Polygon':
                polys = [geom]
            elif geom.geom_type == 'MultiPolygon':
                polys = list(geom.geoms)
            else:
                continue
                
            for poly in polys:
                # Exterior ring
                coords = list(poly.exterior.coords)
                spline = curve_data.splines.new(type='POLY')
                spline.points.add(len(coords) - 1)
                
                for i, (x, y) in enumerate(coords):
                    bx = (x - center_x) * scale_factor
                    by = (y - center_y) * scale_factor
                    bz = 0
                    spline.points[i].co = (bx, by, bz, 1.0)
                
                spline.use_cyclic_u = True # Close the loop

        obj = bpy.data.objects.new("Boundary", curve_data)
        bpy.context.collection.objects.link(obj)
        
        # Assign Blue/Cyan material for borders
        assign_material(obj, "RoadNeonBlue", (0.0, 0.8, 1.0, 1.0), 2.0)
        print("Administrative boundaries created successfully!")
        
    except Exception as e:
        print(f"Failed to create boundaries: {e}")

if __name__ == "__main__":
    # You can change the location here
    # target_size=200 ensures the map fits within a 200x200 area in Blender
    create_road_map(location="New York, USA", dist=500, target_size=20)

---
Tags: #programming #tools


#Miscellaneous
