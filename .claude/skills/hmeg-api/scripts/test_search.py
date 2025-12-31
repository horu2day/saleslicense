#!/usr/bin/env python3
"""Test the search function"""

import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from search_text import search_in_document

doc_path = "../../../../data/HmEG.md"
query = "Animation"

print(f"Testing search for '{query}' in {doc_path}")
print(f"File exists: {os.path.exists(doc_path)}")

if os.path.exists(doc_path):
    sections = search_in_document(doc_path, query)
    print(f"Found {len(sections)} sections")

    if sections:
        print("\nFirst match:")
        print(f"Line: {sections[0]['line_num']}")
        print(f"Content preview: {sections[0]['content'][:200]}...")
else:
    print("ERROR: File not found!")
