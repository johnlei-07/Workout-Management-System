from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "your_secret_key"
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

client = MongoClient("mongodb+srv://test:test@cluster0.81qy6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["fitness_app"]
users_collection = db["users"]
workouts_collection = db["workouts"]

# Register Users
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        print("Received Data:", data)  # Debugging: Check incoming data

        if not data:
            return jsonify({"message": "No data received"}), 400

        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if not email or not password or not confirm_password:
            return jsonify({"message": "Missing required fields"}), 400

        if password != confirm_password:
            return jsonify({"message": "Passwords do not match"}), 400

        if users_collection.find_one({"email": email}):
            return jsonify({"message": "User already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        users_collection.insert_one({"email": email, "password": hashed_password})
        workouts_collection.insert_one({"email": email, "workouts": [], "history": []})

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Error: {e}")  # Log the error in the terminal
        return jsonify({"message": "Internal Server Error"}), 500



# Login User
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = users_collection.find_one({"email": data["email"]})

    if user and bcrypt.check_password_hash(user["password"], data["password"]):
        access_token = create_access_token(identity=user["email"])
        return jsonify({"token": access_token}), 200
    return jsonify({"message": "Invalid credentials"}), 401

# Get Workouts & History
@app.route("/workouts", methods=["GET"])
@jwt_required()
def get_workouts():
    email = get_jwt_identity()
    
    user_data = workouts_collection.find_one({"email": email})
    return jsonify({"workouts": user_data["workouts"], "history": user_data["history"], "email": email})

# Add Workout (with Progress Tracking)
@app.route("/workouts", methods=["POST"])
@jwt_required()
def add_workout():
    email = get_jwt_identity()
    data = request.json
    total_kg_lifted = data["sets"] * data["reps"] * data["kg"]

    new_workout = {
        "name": data["name"],
        "sets": data["sets"],
        "reps": data["reps"],
        "kg": data["kg"],
        "total_kg_lifted": total_kg_lifted,  # Store the progress
        "timestamp": datetime.utcnow(),
    }

    workouts_collection.update_one(
        {"email": email},
        {"$push": {"workouts": new_workout}},
    )

    return jsonify({"message": "Workout added successfully"})


# Update Workout (with Progress Tracking)
@app.route("/workouts/<int:index>", methods=["PUT"])
@jwt_required()
def update_workout(index):
    email = get_jwt_identity()
    data = request.json
    total_kg_lifted = data["sets"] * data["reps"] * data["kg"]

    updated_workout = {
        "name": data["name"],
        "sets": data["sets"],
        "reps": data["reps"],
        "kg": data["kg"],
        "total_kg_lifted": total_kg_lifted,  # Store updated progress
        "timestamp": datetime.utcnow(),
    }

    workouts_collection.update_one(
        {"email": email},
        {"$set": {f"workouts.{index}": updated_workout}},
    )

    return jsonify({"message": "Workout updated successfully"})

# Delete Workout
@app.route("/workouts/<int:index>", methods=["DELETE"])
@jwt_required()
def delete_workout(index):
    email = get_jwt_identity()
    user_data = workouts_collection.find_one({"email": email})

    if not user_data or index >= len(user_data["workouts"]):
        return jsonify({"message": "Workout not found"}), 404

    deleted_workout = user_data["workouts"][index]
    
    # Add deleted workout to history
    workouts_collection.update_one(
        {"email": email},
        {"$push": {"history": deleted_workout}}
    )

    # Remove workout from the list
    workouts_collection.update_one(
        {"email": email},
        {"$unset": {f"workouts.{index}": 1}}
    )
    workouts_collection.update_one(
        {"email": email},
        {"$pull": {"workouts": None}}
    )

    return jsonify({"message": "Workout deleted and moved to history successfully"})

# Permanently Delete from History
@app.route("/workouts/history/<int:index>", methods=["DELETE"])
@jwt_required()
def delete_from_history(index):
    email = get_jwt_identity()
    user_data = workouts_collection.find_one({"email": email})

    if not user_data or index >= len(user_data["history"]):
        return jsonify({"message": "Workout not found in history"}), 404

    # Remove workout from history
    workouts_collection.update_one(
        {"email": email},
        {"$unset": {f"history.{index}": 1}}
    )
    workouts_collection.update_one(
        {"email": email},
        {"$pull": {"history": None}}
    )

    return jsonify({"message": "Workout permanently deleted from history"})

# Get Progress (Total Kg Lifted)
@app.route("/progress", methods=["GET"])
@jwt_required()
def get_progress():
    email = get_jwt_identity()
    user_data = workouts_collection.find_one({"email": email})
    
    # Extract the total kg lifted for each workout
    progress_data = [
        {
            "name": workout["name"],
            "timestamp": workout["timestamp"],
            "total_kg_lifted": workout["total_kg_lifted"],
            "total_sets": workout.get("sets", 0),
            "total_reps": workout.get("reps", 0),
        }
        for workout in user_data["workouts"]
    ]

    return jsonify({"progress": progress_data})

# Recover Workout from History
@app.route("/workouts/recover/<int:index>", methods=["PUT"])
@jwt_required()
def recover_workout(index):
    email = get_jwt_identity()
    user_data = workouts_collection.find_one({"email": email})

    if not user_data or index >= len(user_data["history"]):
        return jsonify({"message": "Workout not found in history"}), 404

    recovered_workout = user_data["history"][index]

    # Add workout back to workouts
    workouts_collection.update_one(
        {"email": email},
        {"$push": {"workouts": recovered_workout}}
    )

    # Remove from history
    workouts_collection.update_one(
        {"email": email},
        {"$unset": {f"history.{index}": 1}}
    )
    workouts_collection.update_one(
        {"email": email},
        {"$pull": {"history": None}}
    )

    return jsonify({"message": "Workout recovered successfully"})

if __name__ == "__main__":
    app.run(debug=True)