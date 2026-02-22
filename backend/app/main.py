from fastapi import FastAPI
from app.core.config import settings
from app.core.security import hash_password
from app.core.event_listener import lifespan_with_indexer
from app.api.routes import auth
from app.api.routes import user
from app.api.routes import properties
from app.api.routes import prediction
from app.api.routes import geo
from app.api.routes import map as map_routes
from app.api.routes import blockchain
from app.api.routes import nft
from app.api.routes import marketplace
from app.api.routes import portfolio
from app.api.routes import analytics

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan_with_indexer)

from fastapi import Response

@app.middleware("http")
async def add_cors_header(request, call_next):
    if request.method == "OPTIONS":
        return Response(
            content="OK",
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
            }
        )
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=False,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


@app.get("/")
def root():
    return {"message": "ArchNext Backend — AI + Blockchain + NFT Marketplace"}

@app.get("/config-test")
def config_test():
    return {"app_name": settings.APP_NAME}

@app.get("/hash-test")
def hash_test():
    return {"hashed": hash_password("hello123")}

@app.get("/cors-test")
def cors_test():
    return {"message": "CORS should work here"}

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(properties.router, prefix="/properties", tags=["Properties"])
app.include_router(prediction.router, prefix="/prediction", tags=["Prediction"])
app.include_router(geo.router, prefix="/geo", tags=["Geo Intelligence"])
app.include_router(map_routes.router)
app.include_router(blockchain.router)
app.include_router(nft.router)
app.include_router(marketplace.router)
app.include_router(portfolio.router)
app.include_router(analytics.router)