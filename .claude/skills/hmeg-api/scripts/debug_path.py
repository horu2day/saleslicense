#!/usr/bin/env python3
"""Debug path resolution"""

import os

# Check different relative paths
paths_to_check = [
    "../../../data/HmEG.md",  # default in script
    "../../../../data/HmEG.md",  # used in test
    "d:\\MYCLAUDE_PROJECT\\contextengskilltemplate_netwpf\\data\\HmEG.md"  # absolute
]

print(f"Current directory: {os.getcwd()}")
print()

for path in paths_to_check:
    abs_path = os.path.abspath(path)
    exists = os.path.exists(path)
    print(f"Path: {path}")
    print(f"  Absolute: {abs_path}")
    print(f"  Exists: {exists}")
    if exists:
        size = os.path.getsize(path)
        print(f"  Size: {size:,} bytes")
    print()
