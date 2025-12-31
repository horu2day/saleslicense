---
name: hmeg-api-lookup
description: HmEG 라이브러리 문서를 Google File Search로 검색하여 정확한 API 정보와 C# 코드를 생성합니다. HmEG 클래스/메서드 사용법, API 정보가 필요할 때 사용합니다.
---

# HmEG API Documentation Skill

## Overview

이 Skill은 HmEG 라이브러리 문서를 Google Gemini File Search API로 검색하여 정확한 API 정보를 제공하고, C# 코드 예제를 생성합니다.

## When to Use This Skill

다음과 같은 상황에서 이 Skill을 사용합니다:

- HmEG 라이브러리 클래스/메서드 사용법 질문
- HmEG API 호출 방법 및 파라미터 정보
- HmEG 기능 구현 예제 필요
- 특정 HmEG 기능 구현 방법 문의
- HmEG 라이브러리 관련 C# 코드 작성

## Architecture

```
[사용자 질문] → [Google File Search RAG] → [HmEG 문서 검색]
                                              ↓
[C# 코드 예제] ← [코드 생성] ← [검색 결과 + Citation]
```

## Setup Instructions

### 1. Google API Key 설정

```bash
# 환경변수로 Google API Key 설정
export GOOGLE_API_KEY='your-google-api-key'
```

### 2. 의존성 설치

```bash
pip install -r .claude/skills/hmeg-api/requirements.txt
```

### 3. HmEG 문서 업로드 및 벡터 스토어 생성

```bash
# 초기 설정 (벡터 스토어 생성)
python .claude/skills/hmeg-api/scripts/setup_store.py init

# HmEG.md 문서 업로드
python .claude/skills/hmeg-api/scripts/setup_store.py upload --path data/HmEG.md

# 벡터 스토어 정보 확인
python .claude/skills/hmeg-api/scripts/setup_store.py info
```

## Instructions

### Step 1: Analyze User Query

사용자 질문에서 다음을 파악합니다:
- 필요한 HmEG 클래스 타입
- 작업 유형 (객체 생성, 메서드 호출, 설정 변경 등)
- 필요한 API 정보

### Step 2: Search Documentation via Google File Search

검색 스크립트를 실행하여 관련 문서를 찾습니다:

```bash
python .claude/skills/hmeg-api/scripts/search_api.py --query "[SEARCH_QUERY]"
```

**검색 예시:**
- "ClassName constructor" → 클래스 생성자 조회
- "MethodName parameters" → 메서드 파라미터 및 사용법
- "PropertyName usage" → 속성 사용 방법

### Step 3: Generate Response

다음 형식으로 응답을 생성합니다:

1. **API 설명**: 클래스/메서드의 목적과 사용법
2. **C# 코드 예제**: 완전한 실행 가능한 코드
3. **Citation**: 문서 출처 (할루시네이션 방지)
4. **주의사항**: 사용 시 고려사항 또는 제약사항

## Example Usage

### Example 1: HmEG 클래스 사용법

**User Question**: "HmEG 라이브러리에서 특정 클래스를 사용하는 방법을 알려줘"

**Skill Process**:
1. Search: `python scripts/search_api.py --query "ClassName usage example"`
2. Response:

```csharp
using HmEG;

public class HmEGExample
{
    public void UseHmEGClass()
    {
        // HmEG 클래스 사용 예제
        // (실제 HmEG.md 문서 내용에 따라 생성됨)
    }
}
```

**Citation**: HmEG.md, Section X

**주의사항**: [문서에서 발견된 주의사항]

### Example 2: HmEG 메서드 호출

**User Question**: "HmEG에서 데이터를 처리하는 메서드를 사용하고 싶어"

**Skill Process**:
1. Search: `python scripts/search_api.py --query "data processing method"`
2. Response:

```csharp
using HmEG;

public class DataProcessor
{
    public void ProcessData()
    {
        // HmEG 메서드 호출 예제
        // (실제 HmEG.md 문서 내용에 따라 생성됨)
    }
}
```

**Citation**: HmEG.md, Section Y

## Token Optimization Tips

- **Lazy Loading**: API 정보는 필요할 때만 조회
- **Citation 기반**: 문서 출처를 명시하여 할루시네이션 방지
- **Markdown 처리**: 불필요한 포맷팅 제거로 토큰 절약
- **컨텍스트 제한**: 검색 결과의 관련 부분만 추출

## Troubleshooting

### Google API Key 오류
```bash
# API Key 확인
echo $GOOGLE_API_KEY

# 환경변수 재설정
export GOOGLE_API_KEY='AIzaSyDZzKxyQDvwpOMgRxi_hWPgyrH6J_ecbNg'
```

### 벡터 스토어 오류
```bash
# 벡터 스토어 재생성
python .claude/skills/hmeg-api/scripts/setup_store.py reset

# 문서 재업로드
python .claude/skills/hmeg-api/scripts/setup_store.py upload --path data/HmEG.md
```

### 검색 결과 없음
- HmEG.md 문서가 제대로 업로드되었는지 확인
- 검색 쿼리를 더 구체적으로 수정
- 문서 포맷 확인 (Markdown 형식)

## Notes

- **Setup Required**: 사용 전 반드시 Google API Key 설정 및 문서 업로드 필요
- **Document Format**: Markdown (.md) 지원
- **Hallucination Prevention**: Citation 기반 응답으로 정확성 보장
- **Cost Optimization**: 토큰 사용량 최소화 설계
