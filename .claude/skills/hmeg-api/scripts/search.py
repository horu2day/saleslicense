#!/usr/bin/env python3
"""
Google Gemini File Search API를 사용한 HmEG API 문서 검색

Corpus에 업로드된 HmEG 문서를 검색하여 관련 정보를 추출합니다.

Usage:
    python search.py --query "Animation class usage"
    python search.py -q "EGViewport" --limit 5
    python search.py -q "Cylinder" --output result.txt
"""

import os
import sys
import argparse
from pathlib import Path

try:
    import google.generativeai as genai
except ImportError:
    print("Error: google-generativeai 패키지가 설치되지 않았습니다.")
    print("pip install google-generativeai 를 실행하세요.")
    sys.exit(1)

CORPUS_ID_FILE = ".corpus_id"

def get_api_key():
    """환경변수 또는 .env 파일에서 Google API Key 가져오기"""
    # 1. 환경변수 확인
    api_key = os.getenv("GOOGLE_API_KEY")

    # 2. .env 파일 확인 (프로젝트 루트)
    if not api_key:
        # scripts 폴더에서 프로젝트 루트까지: scripts -> hmeg-api -> skills -> .claude -> 프로젝트루트
        script_dir = Path(__file__).parent.resolve()  # scripts/
        project_root = script_dir.parent.parent.parent.parent  # 프로젝트루트
        env_path = project_root / ".env"

        if env_path.exists():
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GOOGLE_API_KEY="):
                        api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break

    if not api_key:
        print("Error: GOOGLE_API_KEY를 찾을 수 없습니다.")
        print("다음 중 하나를 설정하세요:")
        print("  1. 환경변수: set GOOGLE_API_KEY=your-key")
        print("  2. .env 파일에 GOOGLE_API_KEY=your-key 추가")
        sys.exit(1)

    return api_key

def search_corpus(query, limit=5):
    """Corpus에서 검색"""
    api_key = get_api_key()
    genai.configure(api_key=api_key)

    # Corpus ID 로드
    script_dir = Path(__file__).parent
    corpus_id_path = script_dir / CORPUS_ID_FILE

    if not corpus_id_path.exists():
        print("Error: Corpus가 초기화되지 않았습니다.")
        print("먼저 'python setup_store.py init'을 실행하세요.")
        sys.exit(1)

    with open(corpus_id_path, "r") as f:
        corpus_id = f.read().strip()

    print(f"검색 쿼리: {query}")
    print(f"Corpus: {corpus_id}")
    print("-" * 60)

    try:
        # Corpus에서 관련 청크 검색
        relevant_chunks = genai.query_corpus(
            corpus_name=corpus_id,
            query=query,
            results_count=limit
        )

        if not relevant_chunks:
            print("검색 결과가 없습니다.")
            return None

        print(f"{len(relevant_chunks)}개의 관련 섹션을 찾았습니다.\n")

        # 검색 결과를 컨텍스트로 조합
        context = ""
        for idx, chunk in enumerate(relevant_chunks, 1):
            context += f"\n[섹션 {idx}]\n"
            context += chunk.data.string_value
            context += "\n" + "=" * 60 + "\n"

        # Gemini 모델로 답변 생성
        model = genai.GenerativeModel('models/gemini-2.0-flash-exp')

        prompt = f"""당신은 HmEG 라이브러리 API 전문가입니다.

다음 검색 결과를 분석하여 사용자 질문에 답변하세요:

질문: {query}

검색된 문서 섹션:
{context}

답변 형식:
1. API 설명: 관련 클래스/메서드의 개요와 사용 목적 설명
2. C# 코드 예제: 실행 가능한 완전한 C# 코드 예제 제공
3. 출처: 검색된 섹션 번호 명시
4. 주의사항: 사용 시 고려해야 할 사항

답변을 한국어로 작성하세요."""

        response = model.generate_content(prompt)

        result = f"""
검색 결과:
============================================================
{response.text}
============================================================
"""

        return result

    except Exception as e:
        print(f"Error: 검색 실패: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    parser = argparse.ArgumentParser(
        description="HmEG API - Google Gemini File Search를 사용한 문서 검색",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # 기본 검색
  python search.py --query "Animation class"

  # 결과 개수 지정
  python search.py -q "EGViewport properties" --limit 10

  # 결과 파일로 저장
  python search.py -q "Space AddShape" --output result.txt
        """
    )

    parser.add_argument("--query", "-q", required=True, help="검색 쿼리")
    parser.add_argument("--limit", "-l", type=int, default=5, help="최대 검색 결과 개수 (기본: 5)")
    parser.add_argument("--output", "-o", help="결과를 파일로 저장")

    args = parser.parse_args()

    result = search_corpus(args.query, args.limit)

    if result:
        print(result)

        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(result)
            print(f"\n결과가 {args.output}에 저장되었습니다.")

if __name__ == "__main__":
    main()
