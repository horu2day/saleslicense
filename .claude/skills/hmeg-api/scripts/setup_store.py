#!/usr/bin/env python3
"""
Google File Search Store 설정 및 문서 업로드 스크립트 (HmEG API용)

HmEG.md 문서를 Google File Search Store에 업로드하여
RAG 검색이 가능하도록 설정합니다.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Any

# .env 파일 자동 로딩
try:
    from dotenv import load_dotenv
    _script_dir = Path(__file__).parent
    _project_root = _script_dir.parent.parent.parent.parent
    _env_file = _project_root / ".env"
    if _env_file.exists():
        load_dotenv(_env_file)
except ImportError:
    pass

# GenAI 라이브러리 로드 (신버전 SDK)
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

# 설정
script_dir = Path(__file__).parent
project_root = script_dir.parent.parent.parent.parent
CONFIG_DIR = script_dir.parent / "config"
CONFIG_FILE = CONFIG_DIR / "store_config.json"

# 지원되는 문서 확장자
SUPPORTED_EXTENSIONS = {
    '.txt', '.md', '.html', '.htm',
    '.pdf', '.doc', '.docx'
}

DEFAULT_STORE_DISPLAY_NAME = "hmeg-api-docs"


def load_config() -> Dict:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text(encoding='utf-8'))
    return {}


def save_config(config: Dict):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding='utf-8')


def get_client():
    if not GENAI_AVAILABLE:
        raise ImportError(
            "google-genai 패키지가 설치되지 않았습니다.\n"
            "pip install google-genai>=1.0.0 를 실행하세요."
        )

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.\n"
            "다음 중 하나를 설정하세요:\n"
            "  1. 환경변수: set GOOGLE_API_KEY=your-key\n"
            "  2. .env 파일에 GOOGLE_API_KEY=your-key 추가"
        )

    return genai.Client(api_key=api_key)


def create_store(display_name: str = DEFAULT_STORE_DISPLAY_NAME) -> Dict[str, Any]:
    """새 File Search Store 생성"""
    client = get_client()
    try:
        print(f"📦 새 File Search Store 생성 중: {display_name}")

        store = client.file_search_stores.create(
            config={'display_name': display_name}
        )

        config = load_config()
        config['default_store'] = store.name
        config['stores'] = config.get('stores', {})
        config['stores'][display_name] = {
            'name': store.name,
            'display_name': display_name,
            'created_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        save_config(config)

        print(f"✅ Store 생성 완료: {store.name}\n")

        return {"success": True, "store_name": store.name, "display_name": display_name}
    except Exception as e:
        print(f"❌ Store 생성 실패: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


def upload_file(
    file_path: Path,
    store_name: str,
    display_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    파일을 File Search Store에 업로드합니다.
    """
    client = get_client()

    if not display_name:
        display_name = file_path.name

    try:
        print(f"  📄 업로드 중: {file_path.name}")

        upload_config = {'display_name': display_name}

        operation = client.file_search_stores.upload_to_file_search_store(
            file=str(file_path),
            file_search_store_name=store_name,
            config=upload_config
        )

        while not operation.done:
            time.sleep(1)
            operation = client.operations.get(operation)

        print(f"  ✅ 완료: {file_path.name}")

        result = {
            "success": True,
            "file": str(file_path),
            "display_name": display_name
        }

    except Exception as e:
        print(f"  ❌ 실패: {file_path.name} - {e}")
        result = {
            "success": False,
            "file": str(file_path),
            "error": str(e)
        }

    return result


def upload_directory(
    directory: Path,
    store_name: str,
    recursive: bool = True
) -> Dict[str, Any]:
    """디렉토리 내 모든 지원 문서를 업로드"""

    if recursive:
        files = list(directory.rglob("*"))
    else:
        files = list(directory.glob("*"))

    files = [
        f for f in files
        if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not files:
        return {"success": False, "error": f"지원되는 파일이 없습니다: {directory}"}

    print(f"📁 {len(files)}개 파일 업로드 시작...\n")

    results = {
        "success": True,
        "total": len(files),
        "uploaded": 0,
        "failed": 0,
        "errors": []
    }

    for file_path in files:
        result = upload_file(file_path, store_name)
        if result["success"]:
            results["uploaded"] += 1
        else:
            results["failed"] += 1
            results["errors"].append({
                "file": str(file_path),
                "error": result.get("error")
            })

    if results["failed"] > 0:
        results["success"] = False

    print(f"\n📊 업로드 완료: {results['uploaded']}/{results['total']} 성공")

    return results


def list_stores() -> Dict[str, Any]:
    """사용 가능한 Store 목록을 반환합니다."""
    try:
        client = get_client()
        stores = list(client.file_search_stores.list())

        store_list = []
        for store in stores:
            store_list.append({
                "name": store.name,
                "display_name": getattr(store, 'display_name', 'N/A')
            })

        return {
            "success": True,
            "stores": store_list
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def delete_store(store_name: str) -> Dict[str, Any]:
    """Store를 삭제합니다."""
    try:
        client = get_client()
        client.file_search_stores.delete(name=store_name)

        # 설정에서도 제거
        config = load_config()
        if config.get('default_store') == store_name:
            config['default_store'] = None

        stores = config.get('stores', {})
        for display_name, store_info in list(stores.items()):
            if store_info.get('name') == store_name:
                del stores[display_name]

        save_config(config)

        return {
            "success": True,
            "deleted": store_name
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def init_default_store() -> Dict[str, Any]:
    """
    기본 Store를 생성하고 HmEG 문서를 업로드합니다.
    """
    print("🚀 HmEG API Skill 초기화 시작...\n")

    # 1. Store 생성
    print("1️⃣ File Search Store 생성...")
    create_result = create_store(DEFAULT_STORE_DISPLAY_NAME)

    if not create_result["success"]:
        return create_result

    store_name = create_result["store_name"]

    # 2. HmEG.md 문서 업로드 (part 파일은 제외)
    hmeg_docs = [
        project_root / "data" / "HmEG.md",
    ]

    uploaded_files = []

    print("\n2️⃣ HmEG 문서 업로드...")
    for doc_path in hmeg_docs:
        if doc_path.exists():
            result = upload_file(doc_path, store_name)
            if result["success"]:
                uploaded_files.append(doc_path.name)

    if not uploaded_files:
        print("   ⚠️ 업로드할 HmEG 문서를 찾을 수 없습니다.")
        print(f"   다음 경로에 문서가 있는지 확인하세요: {project_root / 'data' / 'HmEG*.md'}\n")

    print("\n" + "=" * 50)
    print("✅ 초기화 완료!")
    print(f"   Store: {store_name}")
    print(f"   업로드된 파일: {', '.join(uploaded_files) if uploaded_files else '없음'}")
    print("\n사용법:")
    print("   python scripts/search_api.py --query \"Animation 클래스 사용법\"")
    print("=" * 50)

    return {
        "success": True,
        "store_name": store_name,
        "uploaded_files": uploaded_files
    }


def show_status():
    """현재 설정 상태를 표시합니다."""
    config = load_config()

    print("\n📊 HmEG API Skill 상태\n")
    print("=" * 50)

    if config.get('default_store'):
        print(f"✅ 기본 Store: {config['default_store']}")
    else:
        print("❌ 기본 Store 설정되지 않음")

    stores = config.get('stores', {})
    if stores:
        print(f"\n📁 등록된 Store ({len(stores)}개):")
        for display_name, info in stores.items():
            print(f"   - {display_name}: {info.get('name', 'N/A')}")
            print(f"     생성일: {info.get('created_at', 'N/A')}")
    else:
        print("\n📁 등록된 Store 없음")

    api_key = os.environ.get("GOOGLE_API_KEY")
    if api_key:
        print(f"\n🔑 GOOGLE_API_KEY: 설정됨 ({api_key[:8]}...)")
    else:
        print("\n🔑 GOOGLE_API_KEY: ❌ 설정되지 않음")

    print("=" * 50)


def main():
    parser = argparse.ArgumentParser(
        description="HmEG API - Google File Search Store 설정 및 문서 업로드",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # 초기화 (Store 생성 + HmEG 문서 업로드)
  python setup_store.py init

  # 추가 문서 업로드
  python setup_store.py upload data/HmEG_part1.md

  # Store 목록 확인
  python setup_store.py list

  # 상태 확인
  python setup_store.py status

  # Store 재생성
  python setup_store.py reset
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='명령')

    # init 명령
    init_parser = subparsers.add_parser('init', help='기본 Store 생성 및 초기화')

    # create 명령
    create_parser = subparsers.add_parser('create', help='새 Store 생성')
    create_parser.add_argument('--name', type=str, default=DEFAULT_STORE_DISPLAY_NAME,
                              help='Store 표시 이름')

    # upload 명령
    upload_parser = subparsers.add_parser('upload', help='파일/디렉토리 업로드')
    upload_parser.add_argument('path', type=str, help='업로드할 파일 또는 디렉토리 경로')
    upload_parser.add_argument('--store', type=str, help='Store 이름 (기본값: 설정 파일)')

    # list 명령
    list_parser = subparsers.add_parser('list', help='Store 목록 조회')

    # delete 명령
    delete_parser = subparsers.add_parser('delete', help='Store 삭제')
    delete_parser.add_argument('store_name', type=str, help='삭제할 Store 이름')

    # status 명령
    status_parser = subparsers.add_parser('status', help='현재 상태 조회')

    # reset 명령
    reset_parser = subparsers.add_parser('reset', help='Store 재생성')

    args = parser.parse_args()

    # 명령 실행
    if args.command == 'init':
        result = init_default_store()
        if not result["success"]:
            print(f"\n❌ 초기화 실패: {result.get('error', 'Unknown error')}")
            sys.exit(1)

    elif args.command == 'create':
        result = create_store(args.name)
        print(json.dumps(result, indent=2, ensure_ascii=False))

    elif args.command == 'upload':
        path = Path(args.path)
        store_name = args.store or load_config().get('default_store')

        if not store_name:
            print("❌ Store가 설정되지 않았습니다. --store 옵션을 사용하거나 init을 먼저 실행하세요.")
            sys.exit(1)

        if path.is_file():
            result = upload_file(path, store_name)
        else:
            result = upload_directory(path, store_name)

        print(json.dumps(result, indent=2, ensure_ascii=False))

    elif args.command == 'list':
        result = list_stores()
        print(json.dumps(result, indent=2, ensure_ascii=False))

    elif args.command == 'delete':
        result = delete_store(args.store_name)
        print(json.dumps(result, indent=2, ensure_ascii=False))

    elif args.command == 'status':
        show_status()

    elif args.command == 'reset':
        config = load_config()
        store_name = config.get('default_store')

        if store_name:
            print(f"🗑️ 기존 Store 삭제 중: {store_name}")
            delete_result = delete_store(store_name)
            if delete_result["success"]:
                print("✅ 삭제 완료\n")

        print("🔄 Store 재생성...")
        result = init_default_store()
        if not result["success"]:
            print(f"\n❌ 재생성 실패: {result.get('error', 'Unknown error')}")
            sys.exit(1)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
