from io import BytesIO
import json
import os
from pathlib import Path
from sendme.app import app

app.config['TESTING'] = True
app.config['ROOT_DIR'] = os.path.abspath('./tests')
client = app.test_client()

def test_list_root_directory():
    """Test listing files in root directory"""
    response = client.get('/api/files')
    assert response.status_code == 200
    print(json.dumps(response.get_json(), indent=2, ensure_ascii=False))


def test_directory_traversal_blocked():
    """Test that directory traversal is blocked"""
    response = client.get('/api/files?path=../../')
    assert response.status_code == 403

# def test_download_file_success():
#     """Test downloading a file"""
#     response = client.get('/api/download?path=test.txt')
#     assert response.status_code == 200
#     assert response.data == b'Hello World'

# def test_download_nonexistent_file():
#     """Test downloading non-existent file returns 404"""
#     response = client.get('/api/download?path=nonexistent.txt')
#     assert response.status_code == 404

# def test_upload_file_success():
#     """Test uploading a file"""
#     data = {
#         'file': (BytesIO(b'test content'), 'upload_test.txt'),
#         'path': ''
#     }
#     response = client.post(
#         '/api/upload',
#         data=data,
#         content_type='multipart/form-data'
#     )
    
#     assert response.status_code == 200
#     result = json.loads(response.data)
#     assert result['success'] == True
    
#     # Verify file exists
#     root_dir = app.config['ROOT_DIR']
#     uploaded_file = Path(root_dir) / result['filename']
#     assert uploaded_file.exists()
#     print(root_dir)