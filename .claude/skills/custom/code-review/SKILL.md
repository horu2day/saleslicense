---
name: code-review
description: Comprehensive code review assistant that analyzes code for quality, security, performance, and maintainability. Use when reviewing pull requests, auditing code, or improving code quality. Supports multiple languages including TypeScript, Python, C#, and JavaScript.
---

# Code Review

## Overview

코드 리뷰를 위한 체계적인 분석 도구입니다. 보안, 성능, 유지보수성, 코드 스타일을 검토합니다.

## Quick Start

```
"이 코드를 리뷰해줘" 또는 "PR #123을 검토해줘"
```

## Review Checklist

### 1. Security

- [ ] 입력 검증 (SQL Injection, XSS)
- [ ] 인증/인가 확인
- [ ] 민감 정보 노출 여부
- [ ] 의존성 취약점

### 2. Performance

- [ ] 불필요한 반복/연산
- [ ] N+1 쿼리 문제
- [ ] 메모리 누수 가능성
- [ ] 캐싱 기회

### 3. Code Quality

- [ ] 단일 책임 원칙
- [ ] 중복 코드
- [ ] 복잡도 (함수당 20줄 이하 권장)
- [ ] 명확한 네이밍

### 4. Maintainability

- [ ] 적절한 주석/문서화
- [ ] 테스트 커버리지
- [ ] 에러 처리
- [ ] 로깅

## Output Format

```markdown
## Code Review Summary

### Overview
- 파일: [파일명]
- 언어: [언어]
- 심각도: [Low/Medium/High/Critical]

### Issues Found

#### Critical
- [이슈 설명]

#### High
- [이슈 설명]

#### Medium
- [이슈 설명]

#### Low
- [이슈 설명]

### Recommendations
1. [권장사항]

### Positive Aspects
- [잘된 점]
```

## Language-Specific Checks

### TypeScript/JavaScript

- strict mode 사용 여부
- any 타입 남용
- async/await 에러 처리
- null/undefined 체크

### Python

- Type hints 사용
- Exception 구체화
- f-string 사용
- PEP 8 준수

### C#

- nullable reference types
- IDisposable 패턴
- async/await 패턴
- LINQ 최적화
