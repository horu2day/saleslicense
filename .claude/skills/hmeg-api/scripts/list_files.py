#!/usr/bin/env python3
"""Store 내 업로드된 파일 목록 조회"""
import os
from google import genai

api_key = os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

store_name = "fileSearchStores/hmegapidocs-96z4wrqlq0uy"

print(f"\n📁 Store: {store_name}")
print("=" * 60)

try:
    files = client.file_search_stores.list_files(file_search_store_name=store_name)

    file_list = list(files)

    if not file_list:
        print("⚠️ 업로드된 파일이 없습니다.")
    else:
        print(f"\n✅ 업로드된 파일 ({len(file_list)}개):\n")
        for f in file_list:
            size_mb = f.size_bytes / (1024 * 1024)
            print(f"  - {f.display_name}")
            print(f"    크기: {f.size_bytes:,} bytes ({size_mb:.2f} MB)")
            print(f"    상태: {f.state}")
            print()

except Exception as e:
    print(f"❌ 오류: {e}")
    import traceback
    traceback.print_exc()
