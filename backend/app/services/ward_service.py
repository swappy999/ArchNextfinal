import os
import geopandas as gpd
import warnings
from shapely.geometry import box

# Cache for ward data
_wards_gdf = None

def load_wards():
    """Load Kolkata and Salt Lake wards and merge them."""
    global _wards_gdf
    if _wards_gdf is not None:
        return _wards_gdf

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model1_dir = os.path.join(base_dir, "../../model1")
    kolkata_path = os.path.join(model1_dir, "kolkata_wards.geojson")
    saltlake_path = os.path.join(model1_dir, "exportsaltlake.geojson")
    
    gdfs = []
    
    # 1. Load Kolkata Wards
    if os.path.exists(kolkata_path):
        print(f"Loading Kolkata ward boundaries from {kolkata_path}...")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            gdf_k = gpd.read_file(kolkata_path)
            if gdf_k.crs != "EPSG:4326":
                gdf_k = gdf_k.to_crs(epsg=4326)
            gdfs.append(gdf_k)
    
    # 2. Load Salt Lake Wards
    if os.path.exists(saltlake_path):
        print(f"Merging Salt Lake boundaries from {saltlake_path}...")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            gdf_s = gpd.read_file(saltlake_path)
            if gdf_s.crs != "EPSG:4326":
                gdf_s = gdf_s.to_crs(epsg=4326)
            
            # Map Salt Lake properties to match Kolkata ward structure if needed
            if 'WARD' not in gdf_s.columns and 'ward' in gdf_s.columns:
                gdf_s['WARD'] = gdf_s['ward'].apply(lambda x: f"SL-{x}")
            
            gdfs.append(gdf_s)

    if not gdfs:
        print("Warning: No ward boundary files found.")
        return None

    # 3. Concatenate all datasets
    import pandas as pd
    _wards_gdf = gpd.GeoDataFrame(pd.concat(gdfs, ignore_index=True), crs="EPSG:4326")
        
    return _wards_gdf

def get_wards_in_viewport(ne_lng, ne_lat, sw_lng, sw_lat):
    """Filter wards that intersect with the current viewport."""
    gdf = load_wards()
    if gdf is None:
        return []
        
    viewport_poly = box(sw_lng, sw_lat, ne_lng, ne_lat)
    # Spatial filter: wards that intersect our viewport box
    wards_in_view = gdf[gdf.intersects(viewport_poly)]
    
    # Return as list of dictionaries for easier processing
    return wards_in_view
