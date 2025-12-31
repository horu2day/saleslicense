#!/usr/bin/env python3
"""
Google Gemini File API를 사용한 실제 벡터 스토어 설정

HmEG 라이브러리 문서를 Google Gemini File API에 업로드합니다.
"""

import os
import sys
import argparse
from pathlib import Path

try:
    import google.generativeai as genai
except ImportError:
    print("Error: google-generativeai 패키지가 설치되지 않았습니다.")
    print("pip install google-generativeai")
    sys.exit(1)

# 파일 ID 저장 파일
FILES_JSON = ".uploaded_files.json"

def get_api_key():
    """환경변수에서 Google API Key 가져오기"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.")
        sys.exit(1)
    return api_key

def upload_file(file_path):
    """파일을 Google Gemini에 업로드"""
    api_key = get_api_key()
    genai.configure(api_key=api_key)

    file_path = Path(file_path)
    if not file_path.exists():
        print(f"Error: 파일을 찾을 수 없습니다: {file_path}")
        sys.exit(1)

    print(f"파일 업로드 중: {file_path.name}")

    try:
        # Google Gemini File API로 파일 업로드
        uploaded_file = genai.upload_file(str(file_path))

        print(f"  OK 업로드 완료")
        print(f"  File URI: {uploaded_file.uri}")
        print(f"  File Name: {uploaded_file.name}")

        # 파일 정보 저장
        import json
        files_data = {}
        if os.path.exists(FILES_JSON):
            with open(FILES_JSON, 'r', encoding='utf-8') as f:
                files_data = json.load(f)

        files_data[file_path.name] = {
            'uri': uploaded_file.uri,
            'name': uploaded_file.name,
            'mime_type': uploaded_file.mime_type,
            'size_bytes': uploaded_file.size_bytes if hasattr(uploaded_file, 'size_bytes') else None
        }

        with open(FILES_JSON, 'w', encoding='utf-8') as f:
            json.dump(files_data, f, indent=2, ensure_ascii=False)

        print(f"\n파일 정보가 {FILES_JSON}에 저장되었습니다.")
        print("\n사용 방법:")
        print(f"  python scripts/search_api_real.py --query \"your search query\"")

        return uploaded_file

    except Exception as e:
        print(f"Error: 업로드 실패: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def list_files():
    """업로드된 파일 목록 확인"""
    api_key = get_api_key()
    genai.configure(api_key=api_key)

    try:
        print("업로드된 파일 목록:")
        print("-" * 60)

        files = genai.list_files()
        for file in files:
            print(f"Name: {file.name}")
            print(f"URI: {file.uri}")
            print(f"MIME Type: {file.mime_type}")
            if hasattr(file, 'size_bytes'):
                print(f"Size: {file.size_bytes} bytes")
            print("-" * 60)

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

def delete_file(file_name):
    """파일 삭제"""
    api_key = get_api_key()
    genai.configure(api_key=api_key)

    try:
        genai.delete_file(file_name)
        print(f"파일 삭제됨: {file_name}")

    except Exception as e:
        print(f"Error: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="Google Gemini File API - 파일 업로드 도구",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # 파일 업로드
  python setup_store_real.py upload --path data/HmEG.md

  # 업로드된 파일 목록
  python setup_store_real.py list

  # 파일 삭제
  python setup_store_real.py delete --name "files/abc123"
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="명령어")

    # upload 명령어
    parser_upload = subparsers.add_parser("upload", help="파일 업로드")
    parser_upload.add_argument("--path", required=True, help="업로드할 파일 경로")

    # list 명령어
    parser_list = subparsers.add_parser("list", help="업로드된 파일 목록")

    # delete 명령어
    parser_delete = subparsers.add_parser("delete", help="파일 삭제")
    parser_delete.add_argument("--name", required=True, help="삭제할 파일 이름")

    args = parser.parse_args()

    if args.command == "upload":
        upload_file(args.path)
    elif args.command == "list":
        list_files()
    elif args.command == "delete":
        delete_file(args.name)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
