import requests

url = 'http://127.0.0.1:8000/api/v1/auth/register'
payload = {
    'full_name': 'Test Farmer',
    'email': 'testuser_local@example.com',
    'password': 'Testpass123',
    'phone': '1234567890',
    'location': 'LocalTown'
}
resp = requests.post(url, json=payload)
print('STATUS:', resp.status_code)
print('TEXT:', resp.text)
print('HEADERS:', resp.headers)
