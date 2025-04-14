
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

app = Flask(__name__)

# Load and preprocess the dataset
def load_data():
    df = pd.read_csv('dataset.csv')
    df = df.drop(['Customer_ID', 'Name', 'SSN', 'Month', 'Payment_of_Min_Amount', 'ID'], axis=1)
    df = df.fillna(df.mean())
    return df

# Train the model
def train_model():
    df = load_data()
    le = LabelEncoder()
    df['Occupation'] = le.fit_transform(df['Occupation'])
    df['Credit_Score'] = le.fit_transform(df['Credit_Score'])
    
    X = df.drop('Credit_Score', axis=1)
    y = df['Credit_Score']
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    return model, le

# Load or train the model
try:
    model, label_encoder = joblib.load('credit_score_model.pkl')
except:
    model, label_encoder = train_model()
    joblib.dump((model, label_encoder), 'credit_score_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Prepare input data
        input_data = pd.DataFrame([{
            'Age': data['age'],
            'Annual_Income': data['annualIncome'],
            'Monthly_Inhand_Salary': data['monthlySalary'],
            'Num_Bank_Accounts': data['numBankAccounts'],
            'Num_Credit_Card': data['numCreditCards'],
            'Outstanding_Debt': data['outstandingDebt'],
            'Num_of_Delayed_Payment': data['numDelayedPayments'],
            'Occupation': data['occupation']
        }])
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        credit_score = label_encoder.inverse_transform([prediction])[0]
        
        # Calculate debt-to-income ratio
        debt_to_income = data['outstandingDebt'] / data['annualIncome']
        
        # Generate recommendations
        recommendations = []
        if credit_score == 'Poor':
            recommendations.append('Consider reducing your outstanding debt')
            recommendations.append('Make payments on time to improve your credit history')
        elif credit_score == 'Standard':
            recommendations.append('Maintain a good payment history')
            recommendations.append('Keep your credit utilization low')
        else:
            recommendations.append('Continue maintaining good payment habits')
            recommendations.append('Consider increasing your credit limit')
        
        return jsonify({
            'credit_score': credit_score,
            'debt_to_income_ratio': debt_to_income,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)