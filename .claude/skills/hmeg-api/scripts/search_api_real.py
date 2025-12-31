#!/usr/bin/env python3
"""
Google Gemini API를 사용한 실제 문서 검색

업로드된 HmEG.md 파일을 Gemini 모델로 검색합니다.
"""

import os
import sys
import argparse
import json

try:
    import google.generativeai as genai
except ImportError:
    print("Error: google-generativeai 패키지가 설치되지 않았습니다.")
    sys.exit(1)

FILES_JSON = ".uploaded_files.json"

def get_api_key():
    """환경변수에서 Google API Key 가져오기"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.")
        sys.exit(1)
    return api_key

def load_uploaded_files():
    """업로드된 파일 정보 로드"""
    if not os.path.exists(FILES_JSON):
        print(f"Error: {FILES_JSON} 파일이 없습니다.")
        print("먼저 'python scripts/setup_store_real.py upload --path data/HmEG.md'를 실행하세요.")
        sys.exit(1)

    with open(FILES_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)

def search_with_gemini(query, temperature=0.1):
    """Gemini 모델로 문서 검색"""
    api_key = get_api_key()
    genai.configure(api_key=api_key)

    # 업로드된 파일 정보 로드
    files_data = load_uploaded_files()

    if not files_data:
        print("Error: 업로드된 파일이 없습니다.")
        sys.exit(1)

    print(f"검색 쿼리: {query}")
    print("-" * 60)

    try:
        # 업로드된 파일 이름들 가져오기
        file_names = [info['name'] for info in files_data.values()]

        # Gemini 모델 생성
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        # 프롬프트 생성
        prompt = f"""
당신은 HmEG 라이브러리 전문가입니다.
업로드된 HmEG.md 문서를 참조하여 다음 질문에 정확하게 답변하세요.

질문: {query}

답변 형식:
1. API 설명: 관련 클래스/메서드의 목적과 사용법
2. C# 코드 예제: 완전한 실행 가능한 코드
3. 출처: 문서의 어느 부분을 참조했는지
4. 주의사항: 사용 시 고려해야 할 사항

반드시 문서의 내용을 기반으로 답변하고, 추측하지 마세요.
"""

        # 파일과 함께 쿼리 실행
        response = model.generate_content(
            [prompt] + [genai.get_file(name) for name in file_names],
            generation_config=genai.GenerationConfig(
                temperature=temperature,
            )
        )

        print("\n검색 결과:")
        print("=" * 60)
        print(response.text)
        print("=" * 60)

        return response.text

    except Exception as e:
        print(f"Error: 검색 실패: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def simple_search(query):
    """간단한 검색 (파일 내용 직접 읽기)"""
    api_key = get_api_key()
    genai.configure(api_key=api_key)

    files_data = load_uploaded_files()

    print(f"검색 쿼리: {query}")
    print("-" * 60)

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        # 파일 이름 가져오기 (URI가 아닌 name 사용)
        file_name = list(files_data.values())[0]['name']

        # 간단한 질문
        prompt = f"HmEG 라이브러리에서 '{query}'에 대해 설명해주세요. C# 코드 예제를 포함하세요."

        response = model.generate_content([
            prompt,
            genai.get_file(file_name)
        ])

        print("\n검색 결과:")
        print("=" * 60)
        print(response.text)
        print("=" * 60)

        return response.text

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Google Gemini API를 사용한 HmEG 문서 검색",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # 기본 검색
  python search_api_real.py --query "클래스 사용법"

  # 간단한 검색
  python search_api_real.py --query "메서드" --simple

  # 결과를 파일로 저장
  python search_api_real.py --query "API 전체" --output results.txt
        """
    )

    parser.add_argument("--query", "-q", required=True, help="검색 쿼리")
    parser.add_argument("--simple", "-s", action="store_true", help="간단한 검색 모드")
    parser.add_argument("--temperature", "-t", type=float, default=0.1, help="Temperature (0.0-1.0)")
    parser.add_argument("--output", "-o", help="결과를 파일로 저장")

    args = parser.parse_args()

    # 검색 실행
    if args.simple:
        result = simple_search(args.query)
    else:
        result = search_with_gemini(args.query, args.temperature)

    # 파일로 저장
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(result)
        print(f"\n결과가 {args.output}에 저장되었습니다.")

if __name__ == "__main__":
    main()
