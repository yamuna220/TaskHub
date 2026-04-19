import json
import uuid
from datetime import datetime, timedelta
import random

# Generate realistic task titles
TASK_TITLES = [
    "API authentication implementation",
    "Database schema design",
    "Docker containerization",
    "RBAC system implementation",
    "Audit logging system",
    "API documentation",
    "OAuth integration",
    "Frontend integration",
    "Performance optimization",
    "Security hardening",
    "Unit test coverage",
    "Error handling",
    "Caching implementation",
    "Load testing",
    "Bug fixes"
]

DESCRIPTIONS = [
    "This task requires careful implementation and testing",
    "Must follow security best practices",
    "Requires database optimization",
    "High priority - blocks other tasks",
    "Low priority - nice to have",
    "Performance critical",
    "Must have comprehensive tests",
    "Requires code review",
    "Production ready required",
    "Documentation needed"
]

STATUSES = ["pending", "in_progress", "completed"]
PRIORITIES = ["low", "medium", "high"]

def generate_users(org_id, count=5):
    """Generate mock users"""
    users = []
    first_names = ["Alex", "Sarah", "Mike", "Emma", "John", "Lisa", "David", "Jessica"]
    last_names = ["Johnson", "Chen", "Anderson", "Wilson", "Smith", "Brown", "Lee", "Martinez"]
    
    for i in range(count):
        users.append({
            "id": str(uuid.uuid4()),
            "organization_id": org_id,
            "email": f"{first_names[i].lower()}.{last_names[i].lower()}@company.com",
            "first_name": first_names[i],
            "last_name": last_names[i],
            "role": "admin" if i == 0 else ("member" if i < 4 else "viewer")
        })
    return users

def generate_tasks(org_id, user_ids, count=15):
    """Generate mock tasks"""
    tasks = []
    for i in range(count):
        due_date = datetime.now() + timedelta(days=random.randint(1, 30))
        tasks.append({
            "id": str(uuid.uuid4()),
            "organization_id": org_id,
            "title": TASK_TITLES[i % len(TASK_TITLES)],
            "description": DESCRIPTIONS[i % len(DESCRIPTIONS)],
            "status": STATUSES[i % len(STATUSES)],
            "priority": PRIORITIES[i % len(PRIORITIES)],
            "assigned_to": random.choice(user_ids),
            "created_by": user_ids[0],
            "due_date": due_date.strftime("%Y-%m-%d")
        })
    return tasks

def generate_organizations():
    """Generate mock organizations"""
    orgs = [
        {"id": str(uuid.uuid4()), "name": "ACME Corp", "description": "Leading technology company"},
        {"id": str(uuid.uuid4()), "name": "TechStart Inc", "description": "Innovative startup"},
        {"id": str(uuid.uuid4()), "name": "Innovate Labs", "description": "Research and development"}
    ]
    return orgs

def main():
    orgs = generate_organizations()
    all_data = {"organizations": orgs, "users": [], "tasks": []}
    
    for org in orgs:
        users = generate_users(org["id"], count=5)
        tasks = generate_tasks(org["id"], [u["id"] for u in users], count=15)
        all_data["users"].extend(users)
        all_data["tasks"].extend(tasks)
    
    # Save to JSON
    with open("mock_data.json", "w") as f:
        json.dump(all_data, f, indent=2)
    
    print(f"✓ Generated {len(all_data['organizations'])} organizations")
    print(f"✓ Generated {len(all_data['users'])} users")
    print(f"✓ Generated {len(all_data['tasks'])} tasks")
    print("✓ Saved to mock_data.json")

if __name__ == "__main__":
    main()
