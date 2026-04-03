import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# โหลด data
df = pd.read_csv("ai4i2020.csv")

# เลือก feature
features = [
    'Air temperature [K]',
    'Process temperature [K]',
    'Rotational speed [rpm]',
    'Torque [Nm]',
    'Tool wear [min]'
]

X = df[features]
y = df['Machine failure']

# split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# save model
joblib.dump(model, "model.pkl")

print("✅ Model trained & saved")