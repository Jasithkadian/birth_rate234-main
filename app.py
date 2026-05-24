import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import pickle

app = Flask(__name__, static_folder='frontend/dist/assets', template_folder='frontend/dist')
CORS(app) # Enable CORS for all routes

# Load trained model at module level
with open('model.pkl', 'rb') as obj:
    model = pickle.load(obj)

def get_clean_data(form_data):
    # Support both 'gestation' (days) and 'month' (1-10)
    gestation_val = form_data.get('gestation') or form_data.get('month')
    if not gestation_val: raise ValueError("Gestation or Month missing")
    
    gestation = float(gestation_val)
    
    # If input is likely a month (1-10), convert to days
    if 1 <= gestation <= 12:
        gestation = gestation * 30 
        
    parity = int(form_data['parity'])
    age = int(form_data['age'])
    height = float(form_data['height'])
    weight = float(form_data['weight'])
    smoke = float(form_data['smoke'])

    # Range validation
    if not (20 <= gestation <= 450): raise ValueError("Gestation out of range")
    if not (0 <= parity <= 15): raise ValueError("Parity out of range")
    if not (15 <= age <= 55): raise ValueError("Age out of range")
    if not (30 <= height <= 100): raise ValueError("Height out of range")
    if not (50 <= weight <= 600): raise ValueError("Weight out of range")
    if smoke not in [0, 1]: raise ValueError("Invalid smoke status")

    cleaned_data = {
        'gestation': [gestation],
        'parity': [parity],
        'age': [age],
        'height': [height],
        'weight': [weight],
        'smoke': [smoke]
    }

    return cleaned_data

# Serve static files from the dist root (like favicon, robots.txt, etc.)
@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    dist_root = os.path.join(app.root_path, 'frontend', 'dist')
    if os.path.exists(os.path.join(dist_root, path)):
        return send_from_directory(dist_root, path)
    else:
        return render_template('index.html')

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def get_prediction():
    try:
        # Get and clean user input
        baby_data_form = request.form
        baby_data_cleaned = get_clean_data(baby_data_form)
    except ValueError:
        return jsonify({'error': 'Invalid input'}), 400

    # Convert into dataframe
    baby_df = pd.DataFrame(baby_data_cleaned)

    # Make prediction
    prediction = model.predict(baby_df)
    prediction = round(float(prediction[0]), 2)

    # Return JSON response
    response = {'prediction': prediction}
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=False)
