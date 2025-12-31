#!/usr/bin/env python3
from upload_samples import collect_sample_files
from pathlib import Path

samples_root = Path(__file__).parent.parent.parent.parent.parent / "data" / "HmEGSample"
files = collect_sample_files(samples_root)

print(f"Total files to upload: {len(files)}\n")

exts = {}
for f in files:
    ext = f.suffix.lower()
    exts[ext] = exts.get(ext, 0) + 1

print("By extension:")
for ext, count in sorted(exts.items()):
    print(f"  {ext}: {count}")
