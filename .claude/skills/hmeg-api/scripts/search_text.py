#!/usr/bin/env python3
"""
HmEG.md 문서를 직접 읽어서 Gemini로 검색

파일이 너무 큰 경우, 관련 부분만 추출하여 Gemini에 전달합니다.
"""

import os
import sys
import argparse
import re

try:
    import google.generativeai as genai
except ImportError:
    print("Error: google-generativeai 패키지가 설치되지 않았습니다.")
    sys.exit(1)

def get_api_key():
    """환경변수에서 Google API Key 가져오기"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.")
        sys.exit(1)
    return api_key

def search_in_document(doc_path, query, context_lines=50):
    """문서에서 쿼리 관련 부분 검색"""
    with open(doc_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 쿼리 키워드로 관련 라인 찾기
    keywords = query.lower().split()
    relevant_sections = []

    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in keywords):
            # 앞뒤 컨텍스트 포함
            start = max(0, i - context_lines)
            end = min(len(lines), i + context_lines + 1)
            section = ''.join(lines[start:end])
            relevant_sections.append({
                'line_num': i + 1,
                'content': section
            })

    return relevant_sections

def search_with_gemini(query, doc_path='../../../../data/HmEG.md', max_context=10000):
    """Gemini로 문서 검색"""
    api_key = get_api_key()
    genai.configure(api_key=api_key)

    print(f"검색 쿼리: {query}")
    print(f"문서: {doc_path}")
    print("-" * 60)

    # 문서에서 관련 부분 검색
    relevant_sections = search_in_document(doc_path, query)

    if not relevant_sections:
        print("관련 내용을 찾을 수 없습니다.")
        return None

    print(f"{len(relevant_sections)}개의 관련 섹션을 찾았습니다.")

    # 컨텍스트 조합 (너무 길지 않게)
    context = ""
    for section in relevant_sections[:5]:  # 최대 5개 섹션
        context += f"\n\n[라인 {section['line_num']} 주변]\n"
        context += section['content']
        if len(context) > max_context:
            context = context[:max_context] + "\n\n... (생략) ..."
            break

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        prompt = f"""
당신은 HmEG 라이브러리 전문가입니다.
다음은 HmEG.md 문서에서 추출한 관련 내용입니다.

<문서 내용>
{context}
</문서 내용>

질문: {query}

위 문서 내용을 참조하여 다음 형식으로 답변하세요:

1. API 설명: 관련 클래스/메서드의 목적과 사용법
2. C# 코드 예제: 완전한 실행 가능한 코드
3. 출처: 문서의 어느 부분(라인 번호)을 참조했는지
4. 주의사항: 사용 시 고려해야 할 사항

반드시 제공된 문서 내용을 기반으로 답변하고, 추측하지 마세요.
"""

        response = model.generate_content(prompt)

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
        description="HmEG.md 문서를 직접 읽어서 Gemini로 검색",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # 기본 검색
  python search_text.py --query "클래스 사용법"

  # 컨텍스트 라인 조정
  python search_text.py --query "메서드" --context 100

  # 결과 파일로 저장
  python search_text.py --query "API" --output results.txt
        """
    )

    parser.add_argument("--query", "-q", required=True, help="검색 쿼리")
    parser.add_argument("--doc", "-d", default="../../../../data/HmEG.md", help="문서 경로")
    parser.add_argument("--context", "-c", type=int, default=50, help="컨텍스트 라인 수")
    parser.add_argument("--output", "-o", help="결과를 파일로 저장")

    args = parser.parse_args()

    # 검색 실행
    result = search_with_gemini(args.query, args.doc)

    # 파일로 저장
    if result and args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(result)
        print(f"\n결과가 {args.output}에 저장되었습니다.")

if __name__ == "__main__":
    main()
