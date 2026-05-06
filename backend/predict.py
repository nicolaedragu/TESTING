import sys
import json
import joblib
import pandas as pd
import warnings

warnings.filterwarnings("ignore")

def predict_productivity(sleep, phone, stress, focus):
    try:
        model = joblib.load('random_forest_model.pkl')
        
        input_data = pd.DataFrame({
            'sleep_hours': [sleep],
            'phone_usage_hours': [phone],
            'stress_level': [stress],
            'focus_score': [focus]
        })
        
        # Predicția
        prediction = model.predict(input_data)[0]
        
        result = {
            "productivity_score": float(round(prediction, 2)),
            "status": "success"
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) == 5:
        predict_productivity(float(sys.argv[1]), float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]))
    else:
        print(json.dumps({"status": "error", "message": "Număr greșit de argumente."}))