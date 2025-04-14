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

        const analysis = performComprehensiveAnalysis(data);
        displayResults(analysis);
        createVisualizations(analysis);
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

    function performComprehensiveAnalysis(data) {
        const creditScore = calculateCreditScore(data);
        const debtToIncome = (data.outstandingDebt / data.annualIncome) * 100;
        const riskLevel = calculateRiskLevel(data);
        const customerSegment = determineCustomerSegment(data);
        const loanRecommendations = generateLoanRecommendations(creditScore, data);
        const financialHealth = assessFinancialHealth(data);
        const occupationInsights = generateOccupationInsights(data);
        const ageBasedAnalysis = generateAgeBasedAnalysis(data);
        const paymentBehavior = analyzePaymentBehavior(data);
        const productRecommendations = generateProductRecommendations(creditScore, data);

        return {
            creditScore,
            debtToIncome,
            riskLevel,
            customerSegment,
            loanRecommendations,
            financialHealth,
            occupationInsights,
            ageBasedAnalysis,
            paymentBehavior,
            productRecommendations
        };
    }

    function calculateCreditScore(data) {
        let score = 300; // Start with minimum score

        // Age factor (15%)
        if (data.age >= 30 && data.age <= 50) {
            score += 82.5; // 15% of 550 (850-300)
        } else if (data.age > 50) {
            score += 55; // 10% of 550
        } else {
            score += 27.5; // 5% of 550
        }

        // Income factor (25%)
        if (data.annualIncome >= 100000) {
            score += 137.5; // 25% of 550
        } else if (data.annualIncome >= 60000) {
            score += 110; // 20% of 550
        } else if (data.annualIncome >= 30000) {
            score += 82.5; // 15% of 550
        } else {
            score += 55; // 10% of 550
        }

        // Debt-to-income ratio (30%)
        const debtToIncome = (data.outstandingDebt / data.annualIncome) * 100;
        if (debtToIncome < 20) {
            score += 165; // 30% of 550
        } else if (debtToIncome < 40) {
            score += 137.5; // 25% of 550
        } else if (debtToIncome < 60) {
            score += 110; // 20% of 550
        } else {
            score += 55; // 10% of 550
        }

        // Credit accounts factor (15%)
        const totalAccounts = data.numBankAccounts + data.numCreditCards;
        if (totalAccounts >= 3 && totalAccounts <= 5) {
            score += 82.5; // 15% of 550
        } else if (totalAccounts > 5) {
            score += 66; // 12% of 550
        } else {
            score += 44; // 8% of 550
        }

        // Payment history (15%)
        if (data.numDelayedPayments === 0) {
            score += 82.5; // 15% of 550
        } else if (data.numDelayedPayments <= 2) {
            score += 66; // 12% of 550
        } else if (data.numDelayedPayments <= 5) {
            score += 44; // 8% of 550
        } else {
            score += 27.5; // 5% of 550
        }

        // Ensure score is within range
        return Math.min(Math.max(Math.round(score), 300), 850);
    }

    function calculateRiskLevel(data) {
        let riskScore = 0;
        
        // Payment history risk
        riskScore += data.numDelayedPayments * 20;
        
        // Debt-to-income risk
        const debtToIncome = (data.outstandingDebt / data.annualIncome) * 100;
        if (debtToIncome > 40) riskScore += 30;
        else if (debtToIncome > 20) riskScore += 20;
        
        // Credit utilization risk
        const creditUtilization = (data.outstandingDebt / (data.numCreditCards * 10000)) * 100;
        if (creditUtilization > 70) riskScore += 30;
        else if (creditUtilization > 30) riskScore += 20;
        
        if (riskScore >= 60) return 'High';
        if (riskScore >= 30) return 'Medium';
        return 'Low';
    }

    function determineCustomerSegment(data) {
        if (data.annualIncome >= 100000) {
            return 'Premium';
        } else if (data.annualIncome >= 50000) {
            return 'Standard';
        } else {
            return 'Basic';
        }
    }

    function generateLoanRecommendations(score, data) {
        const recommendations = [];
        
        if (score >= 700) {
            recommendations.push('Personal Loan: Up to $50,000');
            recommendations.push('Home Loan: Up to $500,000');
            recommendations.push('Auto Loan: Up to $100,000');
        } else if (score >= 600) {
            recommendations.push('Personal Loan: Up to $25,000');
            recommendations.push('Auto Loan: Up to $50,000');
        } else {
            recommendations.push('Secured Personal Loan: Up to $10,000');
        }
        
        return recommendations;
    }

    function assessFinancialHealth(data) {
        const indicators = {
            debtToIncome: (data.outstandingDebt / data.annualIncome) * 100,
            paymentHistory: data.numDelayedPayments === 0 ? 'Excellent' : 
                          data.numDelayedPayments <= 2 ? 'Good' : 'Poor',
            creditUtilization: (data.outstandingDebt / (data.numCreditCards * 10000)) * 100,
            savingsRate: ((data.annualIncome - data.outstandingDebt) / data.annualIncome) * 100
        };
        
        return indicators;
    }

    function generateOccupationInsights(data) {
        const insights = {
            riskLevel: data.occupation === 'professional' ? 'Low' : 
                      data.occupation === 'business' ? 'Medium' : 'High',
            recommendedProducts: data.occupation === 'professional' ? 
                               ['Premium Credit Cards', 'Investment Accounts'] :
                               ['Standard Credit Cards', 'Savings Accounts'],
            incomeStability: data.occupation === 'professional' ? 'High' : 
                           data.occupation === 'business' ? 'Medium' : 'Low'
        };
        
        return insights;
    }

    function generateAgeBasedAnalysis(data) {
        const analysis = {
            ageGroup: data.age < 30 ? 'Young Adult' : 
                     data.age < 50 ? 'Middle Age' : 'Senior',
            recommendedFocus: data.age < 30 ? 'Building Credit' : 
                            data.age < 50 ? 'Wealth Building' : 'Retirement Planning',
            riskTolerance: data.age < 30 ? 'High' : 
                         data.age < 50 ? 'Medium' : 'Low'
        };
        
        return analysis;
    }

    function analyzePaymentBehavior(data) {
        const behavior = {
            paymentConsistency: data.numDelayedPayments === 0 ? 'Excellent' : 
                             data.numDelayedPayments <= 2 ? 'Good' : 'Poor',
            riskOfDefault: data.numDelayedPayments > 5 ? 'High' : 
                         data.numDelayedPayments > 2 ? 'Medium' : 'Low',
            improvementAreas: data.numDelayedPayments > 0 ? 
                            ['Timely Payments', 'Debt Management'] : 
                            ['Credit Building', 'Savings']
        };
        
        return behavior;
    }

    function generateProductRecommendations(score, data) {
        const recommendations = {
            creditCards: score >= 700 ? ['Premium Rewards', 'Travel'] : 
                        score >= 600 ? ['Cash Back', 'Balance Transfer'] : 
                        ['Secured', 'Student'],
            loans: score >= 700 ? ['Personal', 'Home', 'Auto'] : 
                  score >= 600 ? ['Personal', 'Auto'] : 
                  ['Secured Personal'],
            investments: score >= 700 ? ['Stocks', 'Mutual Funds'] : 
                       score >= 600 ? ['Bonds', 'ETFs'] : 
                       ['Savings Accounts', 'CDs']
        };
        
        return recommendations;
    }

    function displayResults(analysis) {
        // Update credit score display
        document.getElementById('creditScoreValue').textContent = analysis.creditScore;
        
        // Set category based on score
        let category = '';
        let categoryColor = '';
        if (analysis.creditScore >= 750) {
            category = 'Excellent';
            categoryColor = '#2ecc71';
        } else if (analysis.creditScore >= 700) {
            category = 'Good';
            categoryColor = '#3498db';
        } else if (analysis.creditScore >= 650) {
            category = 'Fair';
            categoryColor = '#f1c40f';
        } else {
            category = 'Poor';
            categoryColor = '#e74c3c';
        }
        document.getElementById('creditScoreCategory').textContent = category;
        document.querySelector('.score-circle').style.backgroundColor = categoryColor;

        // Update debt-to-income ratio
        document.getElementById('debtToIncome').textContent = analysis.debtToIncome.toFixed(2) + '%';

        // Update risk assessment
        document.getElementById('riskLevel').textContent = analysis.riskLevel;

        // Update customer segment
        document.getElementById('customerSegment').textContent = analysis.customerSegment;

        // Update loan recommendations
        const loanList = document.getElementById('loanRecommendations');
        loanList.innerHTML = analysis.loanRecommendations.map(rec => `<li>${rec}</li>`).join('');

        // Update financial health indicators
        document.getElementById('paymentHistory').textContent = analysis.financialHealth.paymentHistory;
        document.getElementById('creditUtilization').textContent = analysis.financialHealth.creditUtilization.toFixed(2) + '%';
        document.getElementById('savingsRate').textContent = analysis.financialHealth.savingsRate.toFixed(2) + '%';

        // Update occupation insights
        document.getElementById('occupationRisk').textContent = analysis.occupationInsights.riskLevel;
        document.getElementById('occupationProducts').textContent = analysis.occupationInsights.recommendedProducts.join(', ');

        // Update age-based analysis
        document.getElementById('ageGroup').textContent = analysis.ageBasedAnalysis.ageGroup;
        document.getElementById('ageFocus').textContent = analysis.ageBasedAnalysis.recommendedFocus;

        // Update payment behavior
        document.getElementById('paymentConsistency').textContent = analysis.paymentBehavior.paymentConsistency;
        document.getElementById('defaultRisk').textContent = analysis.paymentBehavior.riskOfDefault;

        // Update product recommendations
        const productList = document.getElementById('productRecommendations');
        productList.innerHTML = `
            <li>Credit Cards: ${analysis.productRecommendations.creditCards.join(', ')}</li>
            <li>Loans: ${analysis.productRecommendations.loans.join(', ')}</li>
            <li>Investments: ${analysis.productRecommendations.investments.join(', ')}</li>
        `;

        resultsSection.style.display = 'block';
    }

    function createVisualizations(analysis) {
        // Risk Assessment Chart
        const riskCtx = document.getElementById('riskChart').getContext('2d');
        new Chart(riskCtx, {
            type: 'radar',
            data: {
                labels: ['Payment History', 'Debt-to-Income', 'Credit Mix', 'Credit Age', 'New Credit'],
                datasets: [{
                    label: 'Risk Assessment',
                    data: [
                        analysis.paymentBehavior.paymentConsistency === 'Excellent' ? 100 : 
                        analysis.paymentBehavior.paymentConsistency === 'Good' ? 75 : 50,
                        analysis.debtToIncome,
                        analysis.financialHealth.creditUtilization,
                        analysis.ageBasedAnalysis.ageGroup === 'Young Adult' ? 30 : 
                        analysis.ageBasedAnalysis.ageGroup === 'Middle Age' ? 70 : 90,
                        100 - (analysis.financialHealth.creditUtilization / 2)
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });

        // Financial Health Chart
        const healthCtx = document.getElementById('financialHealthChart').getContext('2d');
        new Chart(healthCtx, {
            type: 'bar',
            data: {
                labels: ['Debt-to-Income', 'Credit Utilization', 'Savings Rate'],
                datasets: [{
                    label: 'Financial Health Indicators',
                    data: [
                        analysis.debtToIncome,
                        analysis.financialHealth.creditUtilization,
                        analysis.financialHealth.savingsRate
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Payment Behavior Chart
        const paymentCtx = document.getElementById('paymentBehaviorChart').getContext('2d');
        new Chart(paymentCtx, {
            type: 'doughnut',
            data: {
                labels: ['On Time', 'Delayed'],
                datasets: [{
                    data: [
                        100 - (analysis.paymentBehavior.paymentConsistency === 'Excellent' ? 0 : 
                              analysis.paymentBehavior.paymentConsistency === 'Good' ? 25 : 50),
                        analysis.paymentBehavior.paymentConsistency === 'Excellent' ? 0 : 
                        analysis.paymentBehavior.paymentConsistency === 'Good' ? 25 : 50
                    ],
                    backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}); 