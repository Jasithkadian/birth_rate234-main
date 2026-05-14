# Birth Weight Prediction Web App

## Overview

This project is a Machine Learning powered web application that predicts a baby's birth weight based on several maternal and pregnancy related factors. The model is trained using Python and deployed using a Flask web application.

The goal of this project is to demonstrate the complete machine learning workflow: data processing, model training, model serialization, and deployment as a web application.

## Live Demo & Repository

**GitHub Repository:** [https://github.com/avipluto/birth_rate234.git](https://github.com/avipluto/birth_rate234.git)

**Live Web Application:** [https://birth-rate234.onrender.com](https://birth-rate234.onrender.com)

## Features

* Predicts baby birth weight
* Simple web interface for user input
* Machine learning model integrated with Flask backend
* Real-time prediction
* Deployable to cloud platforms like Render

## Input Features

The model takes the following inputs:

* Gestation Period
* Parity
* Mother's Age
* Mother's Height
* Mother's Weight
* Smoking Status

These inputs are processed and passed to the trained machine learning model to generate a birth weight prediction.

## Project Structure

```
project-folder
│
├── app.py                 # Flask application
├── model.pkl              # Trained machine learning model
├── model_traning.ipynb    # Notebook used to train the model
├── requirements.txt       # Project dependencies
├── templates/
│   └── index.html         # Web interface
└── .gitignore
```

## Tech Stack

* Python
* Flask
* Scikit-learn
* Pandas
* NumPy
* HTML / CSS
* Gunicorn (for deployment)

## Installation

### 1. Clone the repository

```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Create a virtual environment

```
python -m venv myvenv
```

### 3. Activate the virtual environment

Windows:

```
myvenv\\Scripts\\activate
```

Mac/Linux:

```
source myvenv/bin/activate
```

### 4. Install dependencies

```
pip install -r requirements.txt
```

## Running the Application

Run the Flask application:

```
python app.py
```

The application will start on:

```
http://127.0.0.1:5000
```

Open the link in your browser and enter the required input values to get a birth weight prediction.

## Model Training

The model was trained using the notebook:

```
model_traning.ipynb
```

Steps performed during training:

* Data loading
* Data cleaning
* Feature selection
* Model training
* Model evaluation
* Saving the trained model using Pickle

## Deployment

This application can be deployed using platforms such as:

* Render

Gunicorn is used as the production server.

Example start command for deployment:

```
gunicorn app:app
```

## Future Improvements

* Add better UI/UX
* Add input validation
* Show prediction confidence
* Add visualization of predictions
* Deploy with Docker

## Author

Aviral Yadav

Machine Learning Enthusiast | Python Developer

## License

This project is open source and available under the MIT License.
