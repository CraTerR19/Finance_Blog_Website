import json
from database import SessionLocal, engine, Base
from models import LearnModule, QuizQuestion

Base.metadata.create_all(bind=engine)

def seed_finance_basics():
    db = SessionLocal()
    
    # Check if a module already exists so we don't accidentally duplicate
    existing_module = db.query(LearnModule).filter(LearnModule.title == "Finance Basics Quiz").first()
    if existing_module:
        print("Quiz already exists! Skipping seed.")
        db.close()
        return

    module = LearnModule(
        title="Finance Basics Quiz",
        content="Test your knowledge of foundational macroeconomic and personal finance principles."
    )
    db.add(module)
    db.commit()
    db.refresh(module)

    raw_questions = [
      { "question": "Which term describes the 'safety net' of cash set aside for unexpected costs like repairs or medical bills?", "options": ["Fixed Asset", "Retirement Portfolio", "Emergency Fund", "Liability"], "correct": "Emergency Fund" },
      { "question": "What is 'Inflation' in the context of your daily purchasing power?", "options": ["The increase in the general price of goods and services over time", "A sudden drop in the value of a specific company's stock", "The total amount of currency a person holds in their wallet", "The interest you earn on a high-yield savings account"], "correct": "The increase in the general price of goods and services over time" },
      { "question": "If you own 'Equity' in a company, what do you actually possess?", "options": ["The right to manage the company's daily office operations", "Insurance against any losses the company might face", "Ownership shares in the business", "A guarantee that the company will pay back a loan"], "correct": "Ownership shares in the business" },
      { "question": "What does the term 'Liquidity' refer to?", "options": ["How quickly an asset can be converted into cash without a significant loss in value", "The process of a company going bankrupt", "The total amount of debt a company has on its balance sheet", "The variety of different products a company sells"], "correct": "How quickly an asset can be converted into cash without a significant loss in value" },
      { "question": "What is 'Compound Interest' often called in the finance world?", "options": ["Interest on interest", "Tax-free growth", "A fixed-rate loan", "Simple interest"], "correct": "Interest on interest" },
      { "question": "Which of these is a 'Liability'?", "options": ["Monthly salary income", "An outstanding credit card balance", "A stock portfolio", "A savings account with $5,000 in it"], "correct": "An outstanding credit card balance" },
      { "question": "What is a 'Bear Market'?", "options": ["A market where only gold and commodities are traded", "A market that is closed for a public holiday", "A period when stock prices are falling and investor confidence is low", "A market where prices are hitting new record highs"], "correct": "A period when stock prices are falling and investor confidence is low" },
      { "question": "What does 'Diversification' mean in investing?", "options": ["Opening multiple bank accounts at the same bank", "Putting all your savings into the single best-performing stock", "Only investing in companies that sell many different products", "Spreading money across different types of investments to reduce risk"], "correct": "Spreading money across different types of investments to reduce risk" },
      { "question": "What is a 'Dividend'?", "options": ["A portion of a company's profit paid out to its shareholders", "The fee a broker charges for every trade you make", "A tax break given to new investors by the government", "The interest paid on a personal bank loan"], "correct": "A portion of a company's profit paid out to its shareholders" },
      { "question": "What is 'Net Worth'?", "options": ["The total value of everything you own minus everything you owe", "The total amount of money you earn before taxes", "The value of your home if you were to sell it today", "The maximum amount you can borrow on a credit card"], "correct": "The total value of everything you own minus everything you owe" },
      { "question": "What is a 'Bond' in simple terms?", "options": ["An insurance policy for your bank account", "A legal contract that prevents you from selling a stock", "A type of high-risk cryptocurrency", "A loan you give to a government or company in exchange for interest"], "correct": "A loan you give to a government or company in exchange for interest" },
      { "question": "What is 'Volatility'?", "options": ["The permanent loss of money in an investment", "How much an investment's price fluctuates up and down over a short period", "A strategy for avoiding taxes on stock gains", "The total volume of shares traded in a single day"], "correct": "How much an investment's price fluctuates up and down over a short period" },
      { "question": "What does 'APY' (Annual Percentage Yield) help you understand?", "options": ["The total fees you pay for a checking account", "The likelihood that a company will go out of business", "The percentage of your income taken by the government", "The actual amount of interest you will earn in a year, including compounding"], "correct": "The actual amount of interest you will earn in a year, including compounding" },
      { "question": "What is 'Capital Gain'?", "options": ["The profit made when you sell an asset for more than you paid for it", "The initial money used to start a new company", "A monthly payment made to a landlord", "The total amount of money a business spends on marketing"], "correct": "The profit made when you sell an asset for more than you paid for it" },
      { "question": "What does 'Bull Market' represent?", "options": ["A market where only institutional investors are allowed to trade", "A market where trading has been suspended due to a crash", "A period of rising stock prices and general optimism", "A period when unemployment is at its highest level"], "correct": "A period of rising stock prices and general optimism" }
    ]

    for q in raw_questions:
        db_q = QuizQuestion(
            module_id=module.id,
            question_text=q["question"],
            options=json.dumps(q["options"]),
            correct_answer=q["correct"]
        )
        db.add(db_q)

    db.commit()
    print("Successfully seeded all 15 Gemini Quiz constraints to the database!")
    db.close()

if __name__ == "__main__":
    seed_finance_basics()
