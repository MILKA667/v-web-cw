from flask import Flask, jsonify, request
from flask_cors import CORS 
import psycopg2
from psycopg2 import DatabaseError
import jwt
import requests
import base64

app = Flask(__name__)
CORS(app)

RAPIDAPI_HOST = "shazam-core.p.rapidapi.com"
RAPIDAPI_KEY = "0dfb86a649msh359b1562cef5454p1f01f1jsnde7b1c1bd90c"
SHZAM_API_URL = "https://shazam-core.p.rapidapi.com/v1/tracks/recognize"

app.config['SECRET_KEY'] = 'sisichkipisichki' 

def get_current_user():
    auth_header = request.headers.get('Authorization')
    print("Authorization header:", auth_header)
    if not auth_header:
        return None
    
    try:
        parts = auth_header.split(" ")
        if len(parts) == 2 and parts[0] == "Bearer":
            token = parts[1]
        else:
            token = auth_header 
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        print("Decoded payload:", payload)
        return payload['user_id']
    except Exception as e:
        print("JWT decode error:", e)
        return None
    
def get_db_connection():
    return psycopg2.connect(
        dbname='media_sercher',
        user='admin',
        password='SvT47_!s',
        host='185.237.95.6'
    )

@app.route('/api/register', methods=['POST'])
def register():  
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({'error': 'Пользователь с такой почтой уже существует'}), 409
        
        cur.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cur.fetchone():
            return jsonify({'error': 'Пользователь с таким именем уже существует'}), 409
        
        cur.execute(
            "INSERT INTO users (email, password, username) VALUES (%s, %s, %s)",
            (email, password, username,)
        )
        conn.commit()
        return jsonify({"message": "Регистрация успешна!"}), 201
        
    except DatabaseError as e:
        if conn:
            conn.rollback()
        return jsonify({'error': 'Ошибка БД: ' + str(e)}), 400
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': 'Ошибка сервера: ' + str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    
    data = request.get_json()  
    email = data.get('email')
    password = data.get('password')

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT id, password, username FROM users WHERE email = %s", (email,))
        user = cur.fetchone() 
        if user and user[1] == password:
            token = jwt.encode({
                'user_id': user[0],
                'email': email,
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            if isinstance(token, bytes):
                token = token.decode('utf-8')
                
            return jsonify({
                'message': 'Успешный вход',
                'token': token,
                'user_id': user[0],
                'username': user[2]
            }), 200
        else:
            return jsonify({"error": "Неверный пароль или почта"}), 401
        
    except DatabaseError as e:
        if conn:
            conn.rollback()
        return jsonify({'error': 'Ошибка БД: ' + str(e)}), 400
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': 'Ошибка сервера: ' + str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
@app.route('/api/add_like', methods=['POST'])
def add_like():
    data = request.get_json()

    title = data.get('title')
    anime_id = data.get('anime_id')
    image = data.get('image')
    user_id = get_current_user()

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO likes (user_id, anime_external_id, anime_title, anime_image)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, anime_external_id) DO NOTHING;
        """, (user_id, anime_id, title, image))

        conn.commit()

        return jsonify({'status': 'ok'}), 200

    except DatabaseError as e:
        if conn:
            conn.rollback()
        return jsonify({'error': f'Ошибка БД: {str(e)}'}), 400

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.route('/api/add_music_like', methods=['POST'])
def add_like_music():
    data = request.get_json()

    title = data.get('filename')
    artist = data.get('artist')
    image = data.get('image')
    preview_url = data.get('previewUrl')

    user_id = get_current_user()

    if not preview_url or not title:
        return jsonify({"error": "previewUrl and title are required"}), 400

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO music (user_id, preview_url, title, artist, image)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id, preview_url) DO NOTHING;
        """, (
            user_id,
            preview_url,
            title,
            artist,
            image
        ))

        conn.commit()
        return jsonify({'status': 'ok'}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.route('/api/get_likes', methods=['GET'])
def get_likes():
    user_id = get_current_user()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT anime_external_id, anime_title, anime_image
            FROM likes
            WHERE user_id = %s;
        """, (user_id,))

        anime_rows = cur.fetchall()

        anime = [
            {
                "anime_id": row[0],
                "title": row[1],
                "image": row[2]
            }
            for row in anime_rows
        ]

        cur.execute("""
            SELECT title, artist, image, preview_url
            FROM music
            WHERE user_id = %s;
        """, (user_id,))

        music_rows = cur.fetchall()

        music = [
            {
                "title": row[0],
                "artist": row[1],
                "image": row[2],
                "previewUrl": row[3]
            }
            for row in music_rows
        ]

        return jsonify({
            "anime": anime,
            "music": music
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()



@app.route("/api/search_anime", methods=["POST"])
def search_anime():
    file = request.files.get("image")
    if not file:
        return {"error": "Файл не получен"}, 400

    image_bytes = file.read()

    files = {
        "image": ("image.jpg", image_bytes, file.mimetype)
    }

    try:
        response = requests.post(
            "https://api.trace.moe/search",
            files=files,
            timeout=30
        )
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        return {
            "error": "HTTP ошибка trace.moe",
            "details": str(e),
            "response": response.text
        }, response.status_code
    except Exception as e:
        return {
            "error": "Ошибка при запросе к trace.moe",
            "details": str(e)
        }, 500

    return jsonify(response.json())

@app.route("/api/search_music", methods=["POST"])
def search_music():
    file = request.files.get("music")
    if not file:
        return {"error": "Файл не получен"}, 400

    safe_filename = "recording.wav"
    
    file_bytes = file.read()

    files = {
        "file": (safe_filename, file_bytes, "audio/wav")
    }

    headers = {
        "x-rapidapi-key": "0dfb86a649msh359b1562cef5454p1f01f1jsnde7b1c1bd90c",
        "x-rapidapi-host": "shazam-core.p.rapidapi.com"
    }

    try:
        response = requests.post(
            "https://shazam-core.p.rapidapi.com/v1/tracks/recognize",
            files=files,
            headers=headers
        )
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        return {"error": "HTTP ошибка Shazam API", "details": str(e), "response": response.text}, response.status_code
    except Exception as e:
        return {"error": "Ошибка при запросе к Shazam API", "details": str(e)}, 500

    return jsonify(response.json())

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return jsonify({'status': 'healthy'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug='True',host='0.0.0.0',port=5000)
