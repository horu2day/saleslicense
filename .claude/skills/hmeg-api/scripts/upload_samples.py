#!/usr/bin/env python3
"""
HmEG 샘플 프로젝트를 기존 hmeg-api Store에 업로드
.cs, .xaml, .csproj, .manifest, .config, README.md 파일만 업로드
"""

import os
import json
from pathlib import Path

# .env 파일 자동 로딩
try:
    from dotenv import load_dotenv
    _script_dir = Path(__file__).parent
    _project_root = _script_dir.parent.parent.parent.parent
    _env_file = _project_root / ".env"
    if _env_file.exists():
        load_dotenv(_env_file)
        print(f"[OK] Loaded .env from: {_env_file}")
except ImportError:
    print("[WARN] python-dotenv not installed, using environment variables only")
    pass

from google import genai
from google.genai import types

# 업로드할 파일 확장자
ALLOWED_EXTENSIONS = {'.cs', '.xaml', '.csproj', '.manifest', '.config', '.md'}

# 제외할 파일/폴더 패턴
EXCLUDE_PATTERNS = {
    'bin', 'obj', '.vs', '.git',
    'Debug', 'Release',
    'packages', 'node_modules'
}

def should_upload_file(file_path: Path) -> bool:
    """파일 업로드 여부 판단"""

    # 확장자 체크
    if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
        return False

    # 경로에 제외 패턴이 있는지 체크
    for part in file_path.parts:
        if part in EXCLUDE_PATTERNS:
            return False

    return True

def collect_sample_files(samples_root: Path) -> list:
    """업로드할 샘플 파일 수집"""

    files_to_upload = []

    for sample_dir in samples_root.iterdir():
        if not sample_dir.is_dir():
            continue

        if sample_dir.name in EXCLUDE_PATTERNS:
            continue

        # 샘플 디렉토리의 모든 파일 순회
        for file_path in sample_dir.rglob("*"):
            if file_path.is_file() and should_upload_file(file_path):
                files_to_upload.append(file_path)

    return files_to_upload

# MIME 타입 매핑 (Google File Search API 지원 타입만 사용)
MIME_TYPES = {
    '.cs': 'text/plain',  # C# 소스 코드
    '.xaml': 'application/xml',
    '.csproj': 'application/xml',
    '.manifest': 'application/xml',
    '.config': 'application/xml',
    '.md': 'text/markdown'
}

def upload_samples_to_store():
    """샘플 파일을 기존 hmeg-api Store에 업로드"""

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("[ERROR] GOOGLE_API_KEY not set")
        return

    client = genai.Client(api_key=api_key)

    # 기존 Store 설정 로드
    config_file = Path(__file__).parent.parent / "config" / "store_config.json"
    if not config_file.exists():
        print("[ERROR] store_config.json not found")
        return

    config = json.loads(config_file.read_text())
    store_name = config.get("default_store")

    if not store_name:
        print("[ERROR] No default store configured")
        return

    print(f"[Store] Using existing store: {store_name}\n")

    # 샘플 파일 수집
    samples_root = Path(__file__).parent.parent.parent.parent.parent / "data" / "HmEGSample"

    if not samples_root.exists():
        print(f"[ERROR] {samples_root} not found")
        return

    print(f"[Collect] Collecting files from: {samples_root}")

    files_to_upload = collect_sample_files(samples_root)

    print(f"[OK] Found {len(files_to_upload)} files to upload\n")

    # 파일 타입별 카운트
    file_types = {}
    for f in files_to_upload:
        ext = f.suffix.lower()
        file_types[ext] = file_types.get(ext, 0) + 1

    print("[Breakdown] File breakdown:")
    for ext, count in sorted(file_types.items()):
        print(f"   {ext}: {count} files")

    print(f"\n{'='*60}")

    # 테스트 모드: 파일 개수 제한
    import sys
    limit = None
    for arg in sys.argv:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])
            files_to_upload = files_to_upload[:limit]
            print(f"[WARN] Test mode: Limited to {limit} files\n")
            break

    # 자동 승인 모드 (CLI에서 사용)
    if '--auto-confirm' in sys.argv:
        print(f"[OK] Auto-confirm: Uploading {len(files_to_upload)} files")
    else:
        confirm = input(f"Upload {len(files_to_upload)} files to {store_name}? (yes/no): ")
        if confirm.lower() != 'yes':
            print("[CANCEL] Upload cancelled")
            return

    print(f"\n[Upload] Starting upload...\n")

    # 업로드 진행
    uploaded_count = 0
    failed_count = 0

    for i, file_path in enumerate(files_to_upload, 1):
        try:
            # 상대 경로 표시 (samples_root 기준)
            rel_path = file_path.relative_to(samples_root)

            print(f"[{i}/{len(files_to_upload)}] Uploading: {rel_path}")

            # MIME 타입 결정
            mime_type = MIME_TYPES.get(file_path.suffix.lower(), 'text/plain')

            # File Search Store에 직접 업로드
            operation = client.file_search_stores.upload_to_file_search_store(
                file=str(file_path),
                file_search_store_name=store_name,
                config={
                    'display_name': str(rel_path),
                    'mime_type': mime_type
                }
            )

            # 업로드 완료 대기
            import time
            while not operation.done:
                time.sleep(0.5)
                operation = client.operations.get(operation)

            uploaded_count += 1

            # 진행률 표시
            if i % 10 == 0:
                print(f"   Progress: {i}/{len(files_to_upload)} ({i*100//len(files_to_upload)}%)")

        except Exception as e:
            print(f"   [FAIL] Failed: {e}")
            failed_count += 1

    print(f"\n{'='*60}")
    print(f"[OK] Upload complete!")
    print(f"   Successful: {uploaded_count}")
    print(f"   Failed: {failed_count}")
    print(f"   Total: {len(files_to_upload)}")

    # Store 정보 업데이트
    if "sample_files_count" not in config:
        config["sample_files_count"] = 0

    config["sample_files_count"] += uploaded_count

    config_file.write_text(json.dumps(config, indent=2))

    print(f"\n[Store] Store updated: {store_name}")
    print(f"   Total sample files: {config['sample_files_count']}")

if __name__ == "__main__":
    upload_samples_to_store()
