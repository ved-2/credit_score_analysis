document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('creditForm');
    const resultsSection = document.getElementById('resultsSection');
    const resetBtn = document.getElementById('resetBtn');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {
            age: parseInt(formData.get('age')),
            annualIncome: parseFloat(formData.get('annualIncome')),
            monthlySalary: parseFloat(formData.get('monthlySalary')),
            numBankAccounts: parseInt(formData.get('numBankAccounts')),
            numCreditCards: parseInt(formData.get('numCreditCards')),
            outstandingDebt: parseFloat(formData.get('outstandingDebt')),
            numDelayedPayments: parseInt(formData.get('numDelayedPayments')),
            occupation: formData.get('occupation')
        };

        fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            displayBackendResults(result);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    });

    resetBtn.addEventListener('click', function() {
        form.reset();
        resultsSection.style.display = 'none';
        // Clear any existing charts
        const chartContainers = document.querySelectorAll('.chart-box');
        chartContainers.forEach(container => {
            container.innerHTML = '';
        });
    });

    function displayBackendResults(result) {
        // Show the results section
        resultsSection.style.display = 'block';

        // Update credit score display
        document.getElementById('creditScoreValue').textContent = result.credit_score || 'N/A';
        document.getElementById('creditScoreCategory').textContent = result.credit_score || 'N/A';
        
        // Set color based on credit score
        let categoryColor = '#e74c3c'; // Default to Poor
        if (result.credit_score === 'Good') categoryColor = '#3498db';
        if (result.credit_score === 'Standard') categoryColor = '#f1c40f';
        if (result.credit_score === 'Excellent') categoryColor = '#2ecc71';
        document.querySelector('.score-circle').style.backgroundColor = categoryColor;

        // Update all metrics
        document.getElementById('debtToIncome').textContent = (result.debt_to_income_ratio * 100).toFixed(2) + '%';
        document.getElementById('creditUtilization').textContent = result.credit_utilization.toFixed(2) + '%';
        document.getElementById('savingsRate').textContent = result.savings_rate.toFixed(2) + '%';
        document.getElementById('riskLevel').textContent = result.risk_level;
        document.getElementById('customerSegment').textContent = result.customer_segment;
        document.getElementById('paymentHistory').textContent = result.payment_history;

        // Update recommendations
        const loanList = document.getElementById('loanRecommendations');
        if (loanList && result.recommendations) {
            loanList.innerHTML = result.recommendations.map(rec => `<li>${rec}</li>`).join('');
        }

        // Update product recommendations
        const productList = document.getElementById('productRecommendations');
        if (productList && result.product_recommendations) {
            productList.innerHTML = result.product_recommendations.map(rec => `<li>${rec}</li>`).join('');
        }

        // Create risk assessment chart
        const riskCtx = document.getElementById('riskChart').getContext('2d');
        new Chart(riskCtx, {
            type: 'doughnut',
            data: {
                labels: ['Risk Level'],
                datasets: [{
                    data: [100],
                    backgroundColor: [
                        result.risk_level === 'Low' ? '#2ecc71' :
                        result.risk_level === 'Medium' ? '#f1c40f' : '#e74c3c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%'
            }
        });

        // Create financial health chart
        const financialCtx = document.getElementById('financialHealthChart').getContext('2d');
        new Chart(financialCtx, {
            type: 'bar',
            data: {
                labels: ['Debt-to-Income', 'Credit Utilization', 'Savings Rate'],
                datasets: [{
                    data: [
                        result.debt_to_income_ratio * 100,
                        result.credit_utilization,
                        result.savings_rate
                    ],
                    backgroundColor: ['#3498db', '#e74c3c', '#2ecc71']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Create payment behavior chart
        const paymentCtx = document.getElementById('paymentBehaviorChart').getContext('2d');
        new Chart(paymentCtx, {
            type: 'radar',
            data: {
                labels: ['Payment History', 'Credit Score', 'Risk Level'],
                datasets: [{
                    data: [
                        result.payment_history === 'Excellent' ? 100 :
                        result.payment_history === 'Good' ? 75 : 50,
                        result.credit_score === 'Excellent' ? 100 :
                        result.credit_score === 'Good' ? 75 :
                        result.credit_score === 'Standard' ? 50 : 25,
                        result.risk_level === 'Low' ? 100 :
                        result.risk_level === 'Medium' ? 50 : 25
                    ],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: '#3498db',
                    pointBackgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
});