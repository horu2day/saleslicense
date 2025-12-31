#!/usr/bin/env python3
"""Test search for Space AddShape methods"""

import os
import sys

# Set environment variable
os.environ['GOOGLE_API_KEY'] = 'AIzaSyDZzKxyQDvwpOMgRxi_hWPgyrH6J_ecbNg'

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from search_text import search_with_gemini

# Search for Space AddShape methods
result = search_with_gemini("Space AddShapeCylinder AddShapeSphere", "../../../../data/HmEG.md")

# Save result
if result:
    with open("space_methods.txt", 'w', encoding='utf-8') as f:
        f.write(result)
    print("\n결과가 space_methods.txt에 저장되었습니다.")
