#!/usr/bin/env python3
"""
Gemini File Search Store에서 파일 삭제 스크립트
"""

import os
import sys
import json
from pathlib import Path

try:
    from dotenv import load_dotenv
    _script_dir = Path(__file__).parent
    _project_root = _script_dir.parent.parent.parent.parent
    _env_file = _project_root / ".env"
    if _env_file.exists():
        load_dotenv(_env_file)
except ImportError:
    pass

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

script_dir = Path(__file__).parent
CONFIG_FILE = script_dir.parent / "config" / "store_config.json"


def load_config():
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text(encoding='utf-8'))
    return {}


def get_client():
    if not GENAI_AVAILABLE:
        raise ImportError("google-genai 패키지가 설치되지 않았습니다.")

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.")

    return genai.Client(api_key=api_key)


def list_files_in_store(store_name):
    """Store 내 파일 목록 조회"""
    client = get_client()

    try:
        # Store 정보 조회
        store = client.file_search_stores.get(name=store_name)

        print(f"\n📁 Store: {store.name}")
        print(f"   이름: {store.display_name}")
        print("=" * 60)

        # 파일 목록은 직접 조회 API가 없으므로 우회 방법 사용
        # Google GenAI SDK에서는 Store의 파일 목록 직접 조회가 제한적입니다
        print("\n⚠️ 참고: Google File Search Store는 파일 목록 직접 조회를 지원하지 않습니다.")
        print("대신 Store를 재생성하여 원하는 파일만 업로드하는 방법을 권장합니다.\n")

        return True

    except Exception as e:
        print(f"❌ 오류: {e}")
        return False


def delete_and_recreate_store():
    """Store를 삭제하고 HmEG.md만 다시 업로드"""
    config = load_config()
    store_name = config.get('default_store')

    if not store_name:
        print("❌ 기본 Store가 설정되지 않았습니다.")
        return False

    client = get_client()

    try:
        # 1. 기존 Store 삭제
        print(f"🗑️ 기존 Store 삭제 중: {store_name}")
        client.file_search_stores.delete(name=store_name)
        print("✅ 삭제 완료\n")

        # 2. 새 Store 생성
        print("📦 새 File Search Store 생성 중...")
        store = client.file_search_stores.create(
            config={'display_name': 'hmeg-api-docs'}
        )
        print(f"✅ Store 생성 완료: {store.name}\n")

        # 3. 설정 업데이트
        config['default_store'] = store.name
        config['stores'] = {
            'hmeg-api-docs': {
                'name': store.name,
                'display_name': 'hmeg-api-docs',
                'created_at': __import__('time').strftime('%Y-%m-%d %H:%M:%S')
            }
        }

        CONFIG_DIR = script_dir.parent / "config"
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        CONFIG_FILE.write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding='utf-8')

        # 4. HmEG.md만 업로드
        project_root = script_dir.parent.parent.parent.parent
        hmeg_file = project_root / "data" / "HmEG.md"

        if hmeg_file.exists():
            print("📄 HmEG.md 업로드 중...")

            operation = client.file_search_stores.upload_to_file_search_store(
                file=str(hmeg_file),
                file_search_store_name=store.name,
                config={'display_name': 'HmEG.md'}
            )

            while not operation.done:
                __import__('time').sleep(1)
                operation = client.operations.get(operation)

            print("✅ HmEG.md 업로드 완료\n")
        else:
            print(f"⚠️ HmEG.md 파일을 찾을 수 없습니다: {hmeg_file}\n")

        print("=" * 60)
        print("✅ 작업 완료!")
        print(f"   새 Store: {store.name}")
        print("   업로드된 파일: HmEG.md")
        print("=" * 60)

        return True

    except Exception as e:
        print(f"❌ 오류: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    import argparse

    parser = argparse.ArgumentParser(description="HmEG Store 파일 정리")
    parser.add_argument('--yes', '-y', action='store_true', help='확인 없이 실행')
    args = parser.parse_args()

    print("\n🔄 HmEG API Store - 파일 정리")
    print("=" * 60)
    print("작업: HmEG_part1.md, HmEG_part2.md 제거")
    print("방법: Store 재생성 후 HmEG.md만 업로드")
    print("=" * 60)

    if not args.yes:
        response = input("\n계속하시겠습니까? (y/N): ")
        if response.lower() != 'y':
            print("작업이 취소되었습니다.")
            return

    success = delete_and_recreate_store()

    if success:
        print("\n✅ 성공적으로 완료되었습니다.")
        print("\n다음 명령으로 검색 테스트를 해보세요:")
        print("  python search_api.py --query Animation")
    else:
        print("\n❌ 작업 실패")
        sys.exit(1)


if __name__ == "__main__":
    main()
