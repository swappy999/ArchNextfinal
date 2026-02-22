from app.core import database

async def get_properties_in_radius(longitude: float, latitude: float, radius_meters: int) -> list:
    """
    Finds properties within a circular radius using MongoDB's $geoWithin $centerSphere.
    Radius in meters is converted to radians (earth radius ~6378.1km).
    """
    earth_radius_meters = 6378100.0
    radius_radians = radius_meters / earth_radius_meters
    
    query = {
        "location": {
            "$geoWithin": {
                "$centerSphere": [
                    [longitude, latitude],
                    radius_radians
                ]
            }
        }
    }
    
    properties = await database.property_collection.find(query).to_list(None)
    
    # Convert _id to string for processing
    for p in properties:
        p["id"] = str(p["_id"])
        
    return properties
