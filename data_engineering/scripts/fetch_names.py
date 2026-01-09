import csv
import os
from names_dataset import NameDataset

def fetch_and_save():
    print("Initializing NameDataset (this may take a moment)...")
    nd = NameDataset()

    # 1. Get the top 500 Albanian first names for Males
    print("Fetching top 500 Male names...")
    top_male_names = nd.get_top_names(n=200, country_alpha2='AL', gender='Male')
    
    # 2. Get the top 500 Albanian first names for Females
    print("Fetching top 500 Female names...")
    top_female_names = nd.get_top_names(n=200, country_alpha2='AL', gender='Female')

    # 3. Get the top 1000 Albanian surnames
    print("Fetching top 1000 Surnames...")
    top_surnames = nd.get_top_names(n=400, country_alpha2='AL', use_first_names=False)

    output_path = "c:/Users/Victus/Desktop/Redoni/Fiks/data_engineering/datasets/albanian_names_raw.csv"
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["first_name", "last_name", "gender"])
        
        # We have 200 first names and 200 last names. 
        # We will pair them or just list them for Spark to process.
        # Since Spark expects "first_name, last_name, gender", we'll create pairs.
        
        all_first_names = [(n, 'M') for n in top_male_names] + [(n, 'F') for n in top_female_names]
        
        for i in range(max(len(all_first_names), len(top_surnames))):
            f_name, gender = all_first_names[i] if i < len(all_first_names) else ("", "")
            l_name = top_surnames[i] if i < len(top_surnames) else ""
            writer.writerow([f_name, l_name, gender])

    print(f"Successfully saved {len(all_first_names)} names and {len(top_surnames)} surnames to {output_path}")

if __name__ == "__main__":
    fetch_and_save()
