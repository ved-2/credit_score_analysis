from flask import Flask, request, jsonify, render_template
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load and preprocess the dataset
def load_data():
    logger.info("Loading dataset...")
    df = pd.read_csv('dataset.csv')
    
    # Drop unnecessary columns
    df = df.drop(['Customer_ID', 'Name', 'SSN', 'Month', 'Payment_of_Min_Amount', 'ID'], axis=1)
    
    # Separate numerical and categorical columns
    numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    logger.info(f"Numerical columns: {numerical_cols}")
    logger.info(f"Categorical columns: {categorical_cols}")
    
    # Fill missing values in numerical columns with mean
    df[numerical_cols] = df[numerical_cols].fillna(df[numerical_cols].mean())
    
    # Fill missing values in categorical columns with mode
    for col in categorical_cols:
        df[col] = df[col].fillna(df[col].mode()[0])
    
    return df

def train_model():
    logger.info("Starting model training...")
    df = load_data()
    
    # Create label encoders for all categorical columns
    label_encoders = {}
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    # Transform all categorical columns
    for col in categorical_cols:
        logger.info(f"Encoding column: {col}")
        label_encoders[col] = LabelEncoder()
        df[col] = label_encoders[col].fit_transform(df[col])
    
    # Prepare features and target
    X = df.drop('Credit_Score', axis=1)
    y = df['Credit_Score']
    
    logger.info("Training RandomForest model...")
    # Train the model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    logger.info("Model training completed successfully")
    return model, label_encoders

# Train the model on startup
logger.info("Training new model...")
model, label_encoders = train_model()
logger.info("Model training completed")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Transform all categorical inputs using the saved label encoders
        input_data = {
            'Age': data['age'],
            'Annual_Income': data['annualIncome'],
            'Monthly_Inhand_Salary': data['monthlySalary'],
            'Num_Bank_Accounts': data['numBankAccounts'],
            'Num_Credit_Card': data['numCreditCards'],
            'Outstanding_Debt': data['outstandingDebt'],
            'Num_of_Delayed_Payment': data['numDelayedPayments'],
            'Occupation': label_encoders['Occupation'].transform([data['occupation']])[0]
        }
        
        # Add default values for other required columns
        default_values = {
            'Interest_Rate': 0,
            'Num_of_Loan': 0,
            'Delay_from_due_date': 0,
            'Changed_Credit_Limit': 0,
            'Num_Credit_Inquiries': 0,
            'Credit_Utilization_Ratio': 0,
            'Credit_History_Age': 0,
            'Total_EMI_per_month': 0,
            'Amount_invested_monthly': 0,
            'Monthly_Balance': 0,
            'Type_of_Loan': label_encoders['Type_of_Loan'].transform(['Personal Loan'])[0],
            'Credit_Mix': label_encoders['Credit_Mix'].transform(['Good'])[0],
            'Payment_Behaviour': label_encoders['Payment_Behaviour'].transform(['Low_spent_Large_value_payments'])[0]
        }
        
        input_data.update(default_values)
        
        # Prepare input data
        input_df = pd.DataFrame([input_data])
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        credit_score = label_encoders['Credit_Score'].inverse_transform([prediction])[0]
        
        # Calculate various metrics
        debt_to_income = data['outstandingDebt'] / data['annualIncome']
        credit_utilization = (data['outstandingDebt'] / (data['annualIncome'] / 12)) * 100
        savings_rate = ((data['annualIncome'] - data['outstandingDebt']) / data['annualIncome']) * 100
        
        # Determine risk level based on credit score and metrics
        risk_level = "Low"
        if credit_score in ['Poor', 'Standard'] or debt_to_income > 0.4:
            risk_level = "High"
        elif credit_score == 'Good' or debt_to_income > 0.3:
            risk_level = "Medium"
            
        # Determine customer segment
        customer_segment = "Basic"
        if data['annualIncome'] > 100000 and credit_score in ['Good', 'Excellent']:
            customer_segment = "Premium"
        elif data['annualIncome'] > 50000 and credit_score in ['Good', 'Standard']:
            customer_segment = "Standard"
            
        # Generate recommendations
        recommendations = []
        if credit_score == 'Poor':
            recommendations.extend([
                'Consider reducing your outstanding debt',
                'Make payments on time to improve your credit history',
                'Consider debt consolidation options',
                'Work on building an emergency fund'
            ])
        elif credit_score == 'Standard':
            recommendations.extend([
                'Maintain a good payment history',
                'Keep your credit utilization low',
                'Consider increasing your credit limit',
                'Look into balance transfer options'
            ])
        else:
            recommendations.extend([
                'Continue maintaining good payment habits',
                'Consider premium credit card options',
                'Look into investment opportunities',
                'Consider increasing your credit limit'
            ])
        
        # Generate product recommendations
        product_recommendations = []
        if credit_score in ['Good', 'Excellent']:
            product_recommendations.extend([
                'Premium credit cards with rewards',
                'Personal loans with low interest rates',
                'Investment accounts',
                'Mortgage options'
            ])
        elif credit_score == 'Standard':
            product_recommendations.extend([
                'Standard credit cards',
                'Secured credit cards',
                'Basic savings accounts',
                'Personal loans with moderate interest rates'
            ])
        else:
            product_recommendations.extend([
                'Secured credit cards',
                'Credit builder loans',
                'Basic savings accounts',
                'Debt consolidation loans'
            ])
        
        return jsonify({
            'credit_score': credit_score,
            'debt_to_income_ratio': debt_to_income,
            'credit_utilization': credit_utilization,
            'savings_rate': savings_rate,
            'risk_level': risk_level,
            'customer_segment': customer_segment,
            'payment_history': 'Excellent' if data['numDelayedPayments'] == 0 else 'Good' if data['numDelayedPayments'] < 3 else 'Poor',
            'recommendations': recommendations,
            'product_recommendations': product_recommendations
        })
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)