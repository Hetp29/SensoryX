import sys
import pathlib

# Ensure backend/ is on sys.path so imports like `from app.main import app` work
HERE = pathlib.Path(__file__).resolve()
BACKEND_ROOT = HERE.parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi.testclient import TestClient
from app.main import app


def run_smoke():
    client = TestClient(app)

    # Start session
    resp = client.post('/api/photon/start', json={'context': {'demo': True}})
    print('start status', resp.status_code)
    print('start body', resp.json())

    assert resp.status_code == 200
    session_id = resp.json().get('session_id')
    assert session_id

    # Send a treatment prediction message
    resp2 = client.post('/api/photon/message', json={
        'session_id': session_id,
        'text': 'What is the expected outcome and success rate for sumatriptan?',
        'condition': 'migraine',
        'treatment': 'sumatriptan',
        'user_profile': {'age': 30}
    })
    print('message status', resp2.status_code)
    print('message body', resp2.json())

    assert resp2.status_code == 200


if __name__ == '__main__':
    run_smoke()
