import random
import pymongo
import time


# Fallback constants
TRAINING_NAMES = ["Agon", "Arben", "Artan", "Astrit", "Bashkim", "Besim", "Besnik", "Blerim", "Bujar"]
TRAINING_SURNAMES = ["Krasniqi", "Gashi", "Berisha", "Morina", "Shala", "Bytyqi", "Hasani"]

class MarkovNameGenerator:
    def __init__(self, names, order=2):
        self.order = order
        self.group_size = len(names)
        self.names = names
        self.graph = {}
        self._build_chain()

    def _build_chain(self):
        for name in self.names:
            name = "\n" * self.order + name + "\n"
            for i in range(0, len(name) - self.order):
                key = name[i:i+self.order]
                next_char = name[i+self.order]
                if key not in self.graph:
                    self.graph[key] = []
                self.graph[key].append(next_char)

    def generate(self, max_length=10):
        result = []
        # Start with newlines
        ctx = "\n" * self.order
        
        while len(result) < max_length:
            if ctx not in self.graph:
                break
            options = self.graph[ctx]
            next_char = random.choice(options)
            if next_char == "\n":
                break
            result.append(next_char)
            ctx = ctx[1:] + next_char
        
        return "".join(result)

def main():
    print("Initializing ML Name Generator...")
    # Connect to MongoDB
    client = pymongo.MongoClient("mongodb://mongodb:27017/")
    db = client["fiks_ml"]
    
    # FETCH TRAINING DATA FROM MONGODB GOLD ZONE (Populated by Spark)
    training_cursor = db["gold_training_set"].find({})
    training_data = list(training_cursor)
    
    if training_data:
        names = [d["first_name"] for d in training_data if "first_name" in d]
        surnames = [d["last_name"] for d in training_data if "last_name" in d]
        print(f"Loaded {len(names)} names and {len(surnames)} surnames from MongoDB Lake.")
    else:
        # Fallback to defaults if Spark hasn't run yet
        names = TRAINING_NAMES
        surnames = TRAINING_SURNAMES
        print("Using fallback training data.")

    collection = db["generated_names"]
    
    # Train Models
    name_generator = MarkovNameGenerator(names)
    surname_generator = MarkovNameGenerator(surnames)
    
    print("Generating unique identities...")
    count = 0
    while count < 10:
        first_name = name_generator.generate()
        last_name = surname_generator.generate()
        
        if len(first_name) > 3 and len(last_name) > 3:
            full_name = f"{first_name} {last_name}"
            # Check for duplicates in DB
            if not collection.find_one({"email": f"{first_name.lower()}{last_name.lower()}@example.com"}):
                print(f"Generated: {full_name}")
                collection.insert_one({
                    "name": first_name,
                    "surname": last_name, 
                    "email": f"{first_name.lower()}{last_name.lower()}{random.randint(1,99)}@example.com",
                    "status": "generated",
                    "created_at": time.time()
                })
                count += 1
                
    print(f"Successfully generated and stored {count} names in MongoDB.")

if __name__ == "__main__":
    # Wait for Mongo to start
    time.sleep(10)
    main()
