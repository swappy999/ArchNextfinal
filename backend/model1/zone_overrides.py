from shapely.geometry import Point, Polygon

# ----------------------------
# SALT LAKE (BMC)
# ----------------------------

sector1 = Polygon([
    (88.405, 22.565),
    (88.435, 22.565),
    (88.435, 22.585),
    (88.405, 22.585)
])

sector2 = Polygon([
    (88.435, 22.565),
    (88.470, 22.565),
    (88.470, 22.585),
    (88.435, 22.585)
])

sector3 = Polygon([
    (88.405, 22.585),
    (88.450, 22.585),
    (88.450, 22.610),
    (88.405, 22.610)
])

sector4 = Polygon([
    (88.450, 22.585),
    (88.470, 22.585),
    (88.470, 22.610),
    (88.450, 22.610)
])

sector5 = Polygon([
    (88.435, 22.600),
    (88.470, 22.600),
    (88.470, 22.620),
    (88.435, 22.620)
])

# ----------------------------
# NEW TOWN (NKDA)
# ----------------------------

aa1 = Polygon([
    (88.480, 22.560),
    (88.520, 22.560),
    (88.520, 22.610),
    (88.480, 22.610)
])

aa2 = Polygon([
    (88.520, 22.560),
    (88.580, 22.560),
    (88.580, 22.620),
    (88.520, 22.620)
])

aa3 = Polygon([
    (88.480, 22.610),
    (88.580, 22.610),
    (88.580, 22.650),
    (88.480, 22.650)
])

def get_zone_multiplier(lat, lng):
    point = Point(lng, lat)

    # ----- SALT LAKE -----
    if sector5.contains(point):
        return 1.85
    if sector3.contains(point):
        return 1.80
    if sector4.contains(point):
        return 1.73
    if sector2.contains(point):
        return 1.75
    if sector1.contains(point):
        return 1.70

    # ----- NEW TOWN -----
    if aa2.contains(point):
        return 1.90
    if aa1.contains(point):
        return 1.80
    if aa3.contains(point):
        return 1.70

    return 1.0