from database import SessionLocal, engine
from models import Post, Base

# Create tables if not exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

if db.query(Post).count() == 0:
    post1 = Post(
        title="The State of Global Markets Q2 2026",
        content="As we enter the second quarter of 2026, global markets are experiencing unprecedented shifts. Inflation indices have normalized, but underlying structural changes in supply chains and AI adoption continue to drive equity premiums in tech sectors. In this post, we'll explore exactly what this means for your portfolio."
    )
    post2 = Post(
        title="Demystifying the Fed's Recent Cut",
        content="The Federal Reserve's recent 50 bps cut surprised many. In this deep dive, I break down the economic indicators they were looking at, the immediate bond market reaction, and how it impacts mortgage rates and corporate debt refinancing starting next month."
    )
    db.add(post1)
    db.add(post2)
    db.commit()
    print("Seeded 2 blog posts into the database.")
else:
    print("Database already contains posts.")

db.close()
