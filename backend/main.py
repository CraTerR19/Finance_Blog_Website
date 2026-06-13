import os
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from typing import List

from database import engine, get_db, Base
import models, schemas
from services.automatic_emailing import send_welcome_email, send_post_notification_email
from services.blog_interaction import react_to_post, react_to_comment
from services.blog_service import update_post_content
from services.quiz_service import get_all_learn_modules, get_learn_module_by_id

# Create tables
Base.metadata.create_all(bind=engine)

# Auto-seed database if empty on startup
from database import SessionLocal
import json

def auto_seed():
    db = SessionLocal()
    try:
        # Seed quiz
        existing_module = db.query(models.LearnModule).filter(models.LearnModule.title == "Finance Basics Quiz").first()
        if not existing_module:
            module = models.LearnModule(
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
                db_q = models.QuizQuestion(
                    module_id=module.id,
                    question_text=q["question"],
                    options=json.dumps(q["options"]),
                    correct_answer=q["correct"]
                )
                db.add(db_q)
            db.commit()
            print("Seeded all quiz questions into the database.")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

auto_seed()


app = FastAPI(title="Financial Blog API")

# Load allowed CORS origins dynamically
cors_origins_str = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://localhost:5173")
allowed_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Administrative Authentication Dependency
API_KEY_NAME = "X-Admin-Token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def verify_admin_token(api_key: str = Security(api_key_header)):
    admin_token = os.getenv("ADMIN_TOKEN", "default_admin_secret_token_123!")
    if not api_key or api_key != admin_token:
        raise HTTPException(
            status_code=403,
            detail="Could not validate credentials. Admin access required."
        )



@app.post("/posts/", response_model=schemas.PostResponse)
def create_post(post: schemas.PostCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), verify: str = Depends(verify_admin_token)):
    db_post = models.Post(title=post.title, content=post.content)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    # Notify subscribers
    subscribers = db.query(models.Subscriber).all()
    for sub in subscribers:
        background_tasks.add_task(send_post_notification_email, sub.email, db_post.title)
        
    return db_post

@app.get("/posts/", response_model=List[schemas.PostResponse])
def get_posts(db: Session = Depends(get_db)):
    return db.query(models.Post).order_by(models.Post.created_at.desc()).all()

@app.get("/posts/{post_id}", response_model=schemas.PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.put("/posts/{post_id}", response_model=schemas.PostResponse)
def modify_post(post_id: int, post: schemas.PostCreate, db: Session = Depends(get_db), verify: str = Depends(verify_admin_token)):
    updated_post = update_post_content(db, post_id, post.title, post.content)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return updated_post

@app.post("/posts/{post_id}/react", response_model=schemas.PostResponse)
def reaction_on_post(post_id: int, interaction: schemas.ReactionRequest, db: Session = Depends(get_db)):
    return react_to_post(db, post_id, interaction.action)

@app.post("/comments/", response_model=schemas.CommentResponse)
def create_comment(comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    db_comment = models.Comment(
        post_id=comment.post_id,
        author_name=comment.author_name,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@app.post("/comments/{comment_id}/react", response_model=schemas.CommentResponse)
def reaction_on_comment(comment_id: int, interaction: schemas.ReactionRequest, db: Session = Depends(get_db)):
    return react_to_comment(db, comment_id, interaction.action)

@app.post("/contact/")
def submit_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    db_contact = models.ContactSubmission(**contact.dict())
    db.add(db_contact)
    db.commit()
    return {"message": "Contact info and review saved successfully"}

@app.post("/subscribe/")
def subscribe(subscriber: schemas.SubscriberCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(models.Subscriber).filter(models.Subscriber.email == subscriber.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already subscribed")
    db_sub = models.Subscriber(email=subscriber.email)
    db.add(db_sub)
    db.commit()
    
    # Dispatch automatic welcome email
    background_tasks.add_task(send_welcome_email, subscriber.email)
    
    return {"message": "Subscribed successfully! Welcome email dispatched."}

@app.get("/subscribers/", response_model=List[schemas.SubscriberResponse])
def get_subscribers(db: Session = Depends(get_db), verify: str = Depends(verify_admin_token)):
    return db.query(models.Subscriber).order_by(models.Subscriber.subscribed_at.desc()).all()


@app.get("/learn/", response_model=List[schemas.LearnModuleResponse])
def get_learn_modules(db: Session = Depends(get_db)):
    return get_all_learn_modules(db)

@app.get("/learn/{module_id}", response_model=schemas.LearnModuleResponse)
def get_learn_module(module_id: int, db: Session = Depends(get_db)):
    module = get_learn_module_by_id(db, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

@app.get("/email-status/")
def get_email_status():
    from services.automatic_emailing import BREVO_API_KEY, RESEND_API_KEY, BREVO_SENDER, RESEND_SENDER
    return {
        "brevo_configured": bool(BREVO_API_KEY),
        "brevo_key_preview": f"{BREVO_API_KEY[:6]}...{BREVO_API_KEY[-4:]}" if len(BREVO_API_KEY) > 10 else "too short/empty",
        "brevo_sender": BREVO_SENDER,
        "resend_configured": bool(RESEND_API_KEY),
        "resend_key_preview": f"{RESEND_API_KEY[:6]}...{RESEND_API_KEY[-4:]}" if len(RESEND_API_KEY) > 10 else "too short/empty",
        "resend_sender": RESEND_SENDER,
    }

from fastapi.staticfiles import StaticFiles
frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend")
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
