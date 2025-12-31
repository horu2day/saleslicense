# HmEG API Skill

**Google Gemini File Search API**를 사용하여 HmEG 라이브러리 문서를 RAG 방식으로 검색하고 정확한 C# 코드를 생성하는 Claude Agent Skill입니다.

## 개요

HmEG는 엔지니어링 그래픽스 엔진으로, WPF C# 애플리케이션에서 3D 렌더링과 3D 모델링 기능을 제공합니다. 이 스킬은 5MB 이상의 방대한 HmEG API 문서를 **Google Gemini File Search Store**에 업로드하여 효율적으로 검색합니다.

### 주요 기능

- ✅ **Vector Store 기반**: Google Gemini Corpus API로 대용량 문서 관리
- ✅ **자동 청크 분할**: 문서를 8,000자 단위로 자동 분할하여 업로드
- ✅ **의미론적 검색**: 벡터 기반 검색으로 관련성 높은 결과 반환
- ✅ **정확한 코드 생성**: C# 코드 예제와 Citation 제공
- ✅ **할루시네이션 방지**: 검색된 실제 문서 섹션 기반 답변

## 아키텍처

```
HmEG.md (분할 파일)
    ↓
[setup_store.py]
    ↓ upload (청크 단위)
Google Gemini Corpus (Vector Store)
    ↓ query
[search.py]
    ↓ generate_content
Gemini 2.0 Flash
    ↓
정확한 C# 코드 + Citation
```

## 빠른 시작

### 1. 환경 설정

```bash
# Google API Key 설정
export GOOGLE_API_KEY='your-google-api-key'  # Linux/Mac
set GOOGLE_API_KEY=your-key-here             # Windows

# 의존성 설치
pip install -r .claude/skills/hmeg-api/requirements.txt
```

### 2. Corpus 생성

```bash
cd .claude/skills/hmeg-api/scripts
python setup_store.py init
```

**출력 예시:**
```
새 Corpus 생성 중: HmEG API Documentation
OK Corpus 생성 완료: corpora/corpus-abc123def456
ID가 .corpus_id에 저장되었습니다.

다음 단계:
  python setup_store.py upload --path data/HmEG.md
  python setup_store.py upload --path data/HmGeometry.md
  ...
```

### 3. 문서 업로드 (분할 파일)

**중요**: HmEG.md는 5MB 이상이므로 여러 파일로 분할하여 업로드하세요.

```bash
# 분할된 파일들 업로드
python setup_store.py upload --path ../../../../data/HmEG_part1.md
python setup_store.py upload --path ../../../../data/HmEG_part2.md
python setup_store.py upload --path ../../../../data/HmEG_part3.md
# ...
```

**출력 예시:**
```
Corpus corpora/corpus-abc123def456에 문서 업로드 중...
업로드: HmEG_part1.md
  파일을 642개 청크로 분할...
  진행: 10/642 청크 업로드 완료
  진행: 20/642 청크 업로드 완료
  ...
  OK HmEG_part1.md 업로드 완료 (642 청크)

업로드 완료!
이제 다음 명령으로 검색할 수 있습니다:
  python scripts/search.py --query "your search query"
```

### 4. 검색 테스트

```bash
# 기본 검색
python search.py -q "Animation class"

# 검색 결과 개수 조정
python search.py -q "EGViewport" --limit 10

# 결과 파일로 저장
python search.py -q "Space AddShape methods" -o result.txt
```

**실제 검색 결과 예시:**
```
검색 쿼리: Animation class
Corpus: corpora/corpus-abc123def456
------------------------------------------------------------
5개의 관련 섹션을 찾았습니다.

검색 결과:
============================================================
1. API 설명: HmEG.Animations.Animation 클래스
   - 애니메이션 데이터 캡슐화
   - BoneSkinMeshes, Keyframes, NodeAnimationCollection 등 제공
   - 생성자: Animation(AnimationType type)

2. C# 코드 예제:
```csharp
using HmEG.Animations;

// Animation 생성
var animation = new Animation(AnimationType.Skeletal);
animation.Name = "WalkingAnimation";
animation.StartTime = 0.0f;
animation.EndTime = 2.5f;
animation.HasBoneSkinMeshes = true;
```

3. 출처: 섹션 1, 2, 3에서 추출

4. 주의사항:
   - AnimationType은 enum 타입
   - RootNode는 SceneNode 타입 필요
============================================================
```

## 사용 방법

### Claude Code에서 Skill 호출

```bash
claude

# HmEG API Skill 사용 예시
> "HmEG 라이브러리에서 Animation 클래스를 사용하는 방법을 알려줘"
> "EGViewport의 RootSpace 속성은 어떻게 사용하나요?"
> "Cylinder를 생성하는 코드 예제를 보여줘"
```

Skill이 자동으로:
1. Corpus에서 의미론적 검색 (벡터 유사도 기반)
2. 관련성 높은 5개 섹션 추출
3. Gemini 2.0 Flash로 분석하여 C# 코드 예제 생성
4. Citation 제공 (섹션 번호 출처 명시)

### 직접 검색 (디버깅 / 개발용)

#### setup_store.py - Corpus 관리

```bash
cd .claude/skills/hmeg-api/scripts

# Corpus 생성
python setup_store.py init

# 문서 업로드
python setup_store.py upload --path ../../../../data/HmEG_part1.md

# 업로드된 문서 목록
python setup_store.py list

# Corpus 정보 확인
python setup_store.py info

# Corpus 재생성 (모든 데이터 삭제 후 재생성)
python setup_store.py reset
```

#### search.py - 문서 검색

```bash
# 기본 검색 (5개 섹션)
python search.py -q "Animation"

# 검색 결과 개수 조정
python search.py -q "EGViewport properties" --limit 10

# 결과 저장
python search.py -q "Material textures" -o materials.txt
```

## 명령어 참조

### setup_store.py

```bash
# Corpus 초기화
python setup_store.py init [--name "Corpus Name"]

# 문서 업로드 (자동 청크 분할)
python setup_store.py upload --path <파일경로>

# 업로드된 문서 목록
python setup_store.py list

# Corpus 정보 확인
python setup_store.py info

# Corpus 재생성
python setup_store.py reset
```

### search.py

```bash
# 기본 검색
python search.py --query "검색어"

# 옵션
--query, -q        검색 쿼리 (필수)
--limit, -l        최대 검색 결과 개수 (기본: 5)
--output, -o       결과를 파일로 저장
```

## 디렉토리 구조

```
.claude/skills/hmeg-api/
├── SKILL.md                # Skill 정의
├── README.md               # 이 파일
├── requirements.txt        # Python 의존성
└── scripts/
    ├── .corpus_id         # Corpus ID (자동 생성)
    ├── setup_store.py     # Corpus 관리 (Vector Store)
    └── search.py          # 문서 검색 (File Search API)
```

## 문제 해결

### Google API Key 오류

```bash
# API Key 확인
echo $GOOGLE_API_KEY           # Linux/Mac
echo %GOOGLE_API_KEY%          # Windows

# 재설정
export GOOGLE_API_KEY='your-api-key'  # Linux/Mac
set GOOGLE_API_KEY=your-key-here      # Windows
```

### Corpus 초기화 안됨

```bash
# 확인
python setup_store.py info

# 재생성
python setup_store.py reset
```

### 문서 업로드 실패

**청크 크기 초과 오류:**
```
Error: Chunk size exceeds 10,000 characters
```

→ setup_store.py의 `chunk_size` 값을 줄이세요 (현재: 8000)

**파일 크기 제한:**
```
Error: File too large
```

→ HmEG.md를 여러 개의 작은 파일로 분할하세요

### 검색 결과 없음

1. 문서가 제대로 업로드되었는지 확인: `python setup_store.py list`
2. 검색 쿼리를 더 구체적으로 수정
3. `--limit` 값을 늘려서 재검색

## HmEG.md 파일 분할 가이드

### 분할이 필요한 이유

- Google Gemini Corpus API는 청크당 최대 10,000자 제한
- 전체 파일을 한번에 업로드하면 메모리 오류 발생 가능
- 분할하면 업로드 진행 상황 추적 용이

### 분할 방법

#### 옵션 1: 수동 분할 (추천)

```bash
# Linux/Mac
split -l 25000 data/HmEG.md data/HmEG_part

# Windows (PowerShell)
# (사용자가 분할한 파일을 제공한다고 했으므로 생략)
```

#### 옵션 2: Python 스크립트로 자동 분할

```python
# split_doc.py
def split_file(input_path, output_prefix, lines_per_file=25000):
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    total_parts = (len(lines) + lines_per_file - 1) // lines_per_file

    for i in range(total_parts):
        start = i * lines_per_file
        end = min((i + 1) * lines_per_file, len(lines))

        output_path = f"{output_prefix}_part{i+1}.md"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.writelines(lines[start:end])

        print(f"생성: {output_path} ({end-start} 줄)")

split_file("data/HmEG.md", "data/HmEG", 25000)
```

## 참고

- **Vector Store 장점**: 대용량 문서를 효율적으로 관리, 의미론적 검색 지원
- **Token Optimization**: 필요한 섹션만 추출하여 Gemini에 전달
- **Citation**: 검색 결과 섹션 번호로 정확성 보장
- **확장성**: 여러 문서를 하나의 Corpus에 업로드 가능

## 라이선스

이 Skill은 Context Engineering Template의 일부이며 MIT 라이선스를 따릅니다.
