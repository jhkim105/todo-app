from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import ValidationError
import os

from models import db, Category, Task
from schemas import (
    CategoryRequest, 
    CategoryResponse, 
    TaskRequest, 
    TaskResponse
)

app = Flask(__name__)

# Configure CORS
CORS(
    app, 
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173", 
                "http://localhost:3000", 
                "http://localhost:8080",
                "http://localhost:5000"
            ]
        }
    }
)

# Database Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/todo_db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

# --- Category Routes ---

@app.route("/api/categories", methods=["GET"])
def get_categories():
    categories = Category.query.all()
    # Serialize to camelCase JSON
    response_data = [
        CategoryResponse.model_validate(c).model_dump(by_alias=True) 
        for c in categories
    ]
    return jsonify(response_data)

@app.route("/api/categories", methods=["POST"])
def create_category():
    try:
        req_data = CategoryRequest.model_validate(request.get_json())
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    category = Category(name=req_data.name, color=req_data.color)
    db.session.add(category)
    db.session.commit()
    
    response = CategoryResponse.model_validate(category).model_dump(by_alias=True)
    return jsonify(response), 201

@app.route("/api/categories/<int:id>", methods=["DELETE"])
def delete_category(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({"error": "Category not found"}), 404
        
    db.session.delete(category)
    db.session.commit()
    return "", 204

# --- Task Routes ---

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    category_id = request.args.get("categoryId", type=int)
    
    query = Task.query
    if category_id is not None:
        query = query.filter_by(category_id=category_id)
        
    tasks = query.all()
    
    response_data = []
    for task in tasks:
        # Build Category response if associated
        cat_response = None
        if task.category:
            cat_response = CategoryResponse(
                id=task.category.id,
                name=task.category.name,
                color=task.category.color
            )
            
        task_dto = TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            due_date=task.due_date,
            priority=task.priority,
            category=cat_response
        )
        response_data.append(task_dto.model_dump(by_alias=True))
        
    return jsonify(response_data)

@app.route("/api/tasks", methods=["POST"])
def create_task():
    try:
        req_data = TaskRequest.model_validate(request.get_json())
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    if req_data.category_id is not None:
        if not Category.query.get(req_data.category_id):
            return jsonify({"error": f"Category not found with id: {req_data.category_id}"}), 404
            
    task = Task(
        title=req_data.title,
        description=req_data.description,
        completed=req_data.completed,
        due_date=req_data.due_date,
        priority=req_data.priority,
        category_id=req_data.category_id
    )
    db.session.add(task)
    db.session.commit()
    
    # Eagerly map response DTO
    cat_response = None
    if task.category:
        cat_response = CategoryResponse(
            id=task.category.id,
            name=task.category.name,
            color=task.category.color
        )
        
    task_dto = TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        due_date=task.due_date,
        priority=task.priority,
        category=cat_response
    )
    return jsonify(task_dto.model_dump(by_alias=True)), 201

@app.route("/api/tasks/<int:id>", methods=["PUT"])
def update_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
        
    try:
        req_data = TaskRequest.model_validate(request.get_json())
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    if req_data.category_id is not None:
        if not Category.query.get(req_data.category_id):
            return jsonify({"error": f"Category not found with id: {req_data.category_id}"}), 404
            
    task.title = req_data.title
    task.description = req_data.description
    task.completed = req_data.completed
    task.due_date = req_data.due_date
    task.priority = req_data.priority
    task.category_id = req_data.category_id
    
    db.session.commit()
    
    cat_response = None
    if task.category:
        cat_response = CategoryResponse(
            id=task.category.id,
            name=task.category.name,
            color=task.category.color
        )
        
    task_dto = TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        due_date=task.due_date,
        priority=task.priority,
        category=cat_response
    )
    return jsonify(task_dto.model_dump(by_alias=True))

@app.route("/api/tasks/<int:id>", methods=["DELETE"])
def delete_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
        
    db.session.delete(task)
    db.session.commit()
    return "", 204

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
