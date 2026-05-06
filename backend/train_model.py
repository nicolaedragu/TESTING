import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

df = pd.read_csv("student_productivity_distraction_dataset_20000.csv")

X = df[['sleep_hours', 'phone_usage_hours', 'stress_level', 'focus_score']]
# Tinta 
y = df['productivity_score']

rf_reg = RandomForestRegressor(n_estimators=100, random_state=10)
rf_reg.fit(X, y)

joblib.dump(rf_reg, 'random_forest_model.pkl')