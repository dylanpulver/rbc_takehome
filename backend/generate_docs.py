import json
import random
import time
from typing import Dict, List


def generate_random_documents(num_docs: int) -> List[Dict[str, any]]:
    """
    Generate a list of random JSON documents.

    :param num_docs: Number of documents to generate
    :return: List of generated documents

    Sample record:
    {
        "_id": 12345,
        "originationTime": 1622547800,
        "clusterId": "domainserver3",
        "userId": "123456789",
        "devices": {
            "phone": "SEP123456789012",
            "voicemail": "123456789VM"
        }
    }
    """
    documents = []
    for i in range(num_docs):
        doc = {
            "_id": random.randint(10_000, 99_999),
            "originationTime": int(time.time()) - random.randint(0, 1_000_000),
            "clusterId": f"domainserver{random.randint(1, 10)}",
            "userId": f"{random.randint(100_000_000, 999_999_999)}",
            "devices": {
                "phone": f"SEP{random.randint(100_000_000_000, 999_999_999_999)}",
                "voicemail": f"{random.randint(100_000_000, 999_999_999)}VM",
            },
        }
        documents.append(doc)
    return documents

# Generate 10_000 random documents
documents = generate_random_documents(10_000)

# Save to a JSON file
with open("backend/data.json", "w") as f:
    json.dump(documents, f, indent=4)

print("Generated and saved 10_000 random JSON documents to backend/data.json")
