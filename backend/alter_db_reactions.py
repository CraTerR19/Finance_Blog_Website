from sqlalchemy import text
from database import engine

def upgrade_schema():
    print("Upgrading database schema with reaction columns...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE posts ADD COLUMN likes INTEGER DEFAULT 0;"))
            conn.execute(text("ALTER TABLE posts ADD COLUMN dislikes INTEGER DEFAULT 0;"))
            print("Successfully added likes/dislikes to 'posts' table.")
        except Exception as e:
            print("Could not alter 'posts' table (might already exist):", e)
            
        try:
            conn.execute(text("ALTER TABLE comments ADD COLUMN likes INTEGER DEFAULT 0;"))
            conn.execute(text("ALTER TABLE comments ADD COLUMN dislikes INTEGER DEFAULT 0;"))
            print("Successfully added likes/dislikes to 'comments' table.")
        except Exception as e:
            print("Could not alter 'comments' table (might already exist):", e)
            
if __name__ == "__main__":
    upgrade_schema()
