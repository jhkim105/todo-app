from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import TEXT

db = SQLAlchemy()

class Category(db.Model):
    __tablename__ = "categories"
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    color = db.Column(db.String(255), nullable=False)
    
    # Eager load tasks using joined fetch to keep behavior aligned
    tasks = db.relationship(
        "Task", 
        backref="category", 
        cascade="all, delete-orphan", 
        lazy="joined"
    )

class Task(db.Model):
    __tablename__ = "tasks"
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(TEXT, nullable=True)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    
    # Maps to public.tasks.due_date with timezone
    due_date = db.Column(db.DateTime(timezone=True), nullable=True)
    priority = db.Column(db.String(255), default="MEDIUM", nullable=False)
    category_id = db.Column(db.BigInteger, db.ForeignKey("categories.id"), nullable=True)
