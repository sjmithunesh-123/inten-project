def test_health(client):
    response = client.get('/health')
    assert response.status_code == 200


def test_auth_endpoints_are_owned_by_supabase(client):
    register = client.post(
        '/api/v1/auth/register',
        json={'full_name': 'Test Farmer', 'email': 'farmer@example.com', 'password': 'secret123'},
    )
    login = client.post('/api/v1/auth/login', json={'email': 'farmer@example.com', 'password': 'secret123'})

    assert register.status_code == 501
    assert login.status_code == 501
    assert 'Supabase' in register.json()['detail']
    assert 'Supabase' in login.json()['detail']
