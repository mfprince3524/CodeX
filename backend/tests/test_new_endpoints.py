import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_literature_search_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/research/literature",
            json={"query": "metformin AMPK", "limit": 5}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "papers" in data
        assert isinstance(data["papers"], list)

@pytest.mark.asyncio
async def test_conflicts_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/research/conflicts",
            json={"query": "Metformin in Alzheimer Disease"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "supporting_studies" in data
        assert "conflicting_studies" in data
        assert "inconclusive_studies" in data

@pytest.mark.asyncio
async def test_gaps_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/research/gaps",
            json={"topic": "Metformin in Alzheimer Disease"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "identified_gaps" in data
        assert len(data["identified_gaps"]) > 0

@pytest.mark.asyncio
async def test_settings_endpoints():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/research/settings")
        assert resp.status_code == 200
        data = resp.json()
        assert "data_sources" in data
        assert "settings" in data
