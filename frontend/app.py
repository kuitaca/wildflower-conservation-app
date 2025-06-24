import os
import requests
from flask import Flask, render_template, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8080')

@app.route('/')
def index():
    """Homepage with plant selection interface"""
    return render_template('index.html')

@app.route('/api/plants')
def get_plants():
    """Proxy to backend API"""
    try:
        response = requests.get(f"{API_BASE_URL}/api/plants", timeout=5)
        response.raise_for_status()
        return response.json()  # Return JSON directly, not wrapped in jsonify
    except requests.RequestException as e:
        print(f"Error fetching plants: {e}")  # Debug print
        return jsonify({"error": "Failed to fetch plants", "details": str(e)}), 500

@app.route('/garden-planner')
def garden_planner():
    """Garden planning interface"""
    return render_template('garden_planner.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
