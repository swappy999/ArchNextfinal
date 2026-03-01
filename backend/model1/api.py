from fastapi import FastAPI
from shapely.geometry import Point
import geopandas as gpd
import joblib
import numpy as np
from zone_overrides import get_zone_multiplier
app = FastAPI()

print("Loading model...")
model = joblib.load("kolkata_price_model1.pkl")
print("Model loaded.")

print("Loading spatial layers...")
roads = gpd.read_file("roads.geojson").to_crs(epsg=3857)
metro = gpd.read_file("metro.geojson").to_crs(epsg=3857)
pois = gpd.read_file("pois.geojson").to_crs(epsg=3857)
river = gpd.read_file("river.geojson").to_crs(epsg=3857)

CBD_LAT = 22.5530
CBD_LNG = 88.3520

CBD_POINT = gpd.GeoSeries(
    [Point(CBD_LNG, CBD_LAT)],
    crs="EPSG:4326"
).to_crs(epsg=3857)[0]

print("Backend ready.")

@app.post("/predict_point")
def predict_point(data: dict):

    lat = data["lat"]
    lng = data["lng"]

    point = gpd.GeoSeries(
        [Point(lng, lat)],
        crs="EPSG:4326"
    ).to_crs(epsg=3857)[0]

    # ------------------------------
    # CBD score
    # ------------------------------
    cbd_distance = point.distance(CBD_POINT)
    CBD_RADIUS = 8000
    cbd_score = 1 - (cbd_distance / CBD_RADIUS)
    cbd_score = max(min(cbd_score, 1), 0)
    cbd_score = cbd_score ** 1.5

    # ------------------------------
    # River score
    # ------------------------------
    river_distance = river.distance(point).min()
    max_river_dist = 5000
    river_score = 1 - (river_distance / max_river_dist)
    river_score = max(min(river_score, 1), 0)

    # ------------------------------
    # Infra score
    # ------------------------------
    nearby_roads = roads[roads.distance(point) < 300]
    infra = nearby_roads.length.sum() / 20000
    infra = min(infra, 1)

    # ------------------------------
    # Metro access
    # ------------------------------
    dist_metro = metro.distance(point).min()
    max_metro_dist = 1000
    access = 1 - (dist_metro / max_metro_dist)
    access = max(min(access, 1), 0)

    # ------------------------------
    # Demand
    # ------------------------------
    nearby_pois = pois[pois.distance(point) < 500]
    demand = len(nearby_pois) / 100
    demand = min(demand, 1)

    # ------------------------------
    # Base price logic (zone-based)
    # ------------------------------
    if cbd_score > 0.85:
        base_price = 12000
    elif cbd_score > 0.65:
        base_price = 9500
    elif cbd_score > 0.45:
        base_price = 7500
    else:
        base_price = 6000

    # ------------------------------
    # ML Prediction (Adjustment)
    # ------------------------------
    zone_multiplier = get_zone_multiplier(lat, lng)
    
    # Calculate adjustment factor based on scores and zone multiplier
    predicted_adjustment = (1 + (infra * 0.15) + (access * 0.2) + (demand * 0.15) + (river_score * 0.1)) * zone_multiplier

    final_price = base_price * predicted_adjustment

    return {
        "predicted_price": float(final_price),
        "base_price_used": float(base_price),
        "adjustment_factor": float(predicted_adjustment),
        "infra_score": float(infra),
        "access_score": float(access),
        "demand_score": float(demand),
        "cbd_score": float(cbd_score),
        "river_score": float(river_score)
    }