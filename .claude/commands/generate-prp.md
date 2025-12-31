# Role: Senior CAD Software Architect

# Task: Generate a comprehensive Product Requirements Prompt (PRP) for AutoCAD/IntelliCAD Plugin

**Phase 1: Research & Analysis**

1. Read the feature request from `$ARGUMENTS`
2. Analyze existing codebase patterns, especially `examples/` directory
3. Identify dependencies, conflicts, and integration points
4. Review security, performance, and compatibility requirements

**Phase 2: API Category Identification (CAD 특화)**

5. 요청된 기능에 필요한 CAD API 카테고리를 식별합니다:

   **엔티티 생성/수정:**
   - [ ] Line, Circle, Arc, Polyline 등 기본 도형
   - [ ] MText, DBText 등 문자 객체
   - [ ] Hatch, Dimension 등 주석 객체
   - [ ] BlockReference, BlockTableRecord 등 블록
   - [ ] Custom Entity (선택적)

   **사용자 인터랙션:**
   - [ ] Editor.GetPoint, GetEntity, GetSelection 등 입력
   - [ ] PromptOptions, SelectionFilter 설정
   - [ ] Jig (EntityJig, DrawJig) 실시간 피드백

   **데이터베이스 작업:**
   - [ ] Transaction 관리 패턴
   - [ ] SymbolTable (LayerTable, LinetypeTable 등) 접근
   - [ ] DBObject 속성 수정

   **이벤트/리액터:**
   - [ ] Database Events, Document Events
   - [ ] Object Overrule

   **기타:**
   - [ ] P/Invoke 네이티브 호출
   - [ ] UI (WPF/WinForms Palette)

6. 식별된 카테고리마다 `[API 조회 필요]` 마커를 추가합니다.
   - 실제 API 시그니처는 `/execute-prp` 시점에 `intellicad-api` Skill로 조회
   - PRP에는 **의도(Intent)**만 기술하여 컨텍스트 오버헤드 방지

**Phase 3: Blueprint Creation**

7. Define clear file structure and module boundaries
8. Create step-by-step implementation plan with:
   - File modifications/creations
   - Functions/classes to implement (API 시그니처는 `[API 조회 필요: 카테고리]` 형식으로 표시)
   - Integration points and dependencies
   - Error handling strategies (Transaction Abort, DocumentLock 해제 등)

9. Define validation gates:
   - Build success (`dotnet build` - Warning 0)
   - Unit tests (Core 로직)
   - Resource cleanup verification (using 블록, Dispose 호출)

**Phase 4: Risk Management**

10. Identify potential failure points and rollback procedures
11. Define acceptance criteria and performance benchmarks
12. Create contingency plans for common CAD issues:
    - eNotOpenForWrite 오류
    - DocumentLock 충돌
    - Transaction 중첩 문제

**Output Format:**

PRPs/ 디렉토리에 `feature_name_prp.md` 파일로 저장합니다.

필수 섹션:
- **개요**: 기능 설명 및 목적
- **API 조회 항목**: `[API 조회 필요]` 마커가 붙은 카테고리 목록
- **아키텍처**: 파일 구조, 의존성 다이어그램
- **구현 단계**: 순서대로 실행할 작업 목록
- **검증 게이트**: 각 단계별 확인 사항
- **위험 완화**: 롤백 계획, 예외 처리 전략

**예시 API 조회 마커:**

```markdown
### 단계 2: 사용자 입력 처리
- `[API 조회 필요: Editor.GetPoint]` - 점 좌표 입력받기
- `[API 조회 필요: PromptPointOptions]` - 기본점, 메시지 설정

### 단계 3: Line 엔티티 생성
- `[API 조회 필요: Line Constructor]` - 시작점/끝점으로 Line 생성
- `[API 조회 필요: BlockTableRecord.AppendEntity]` - ModelSpace에 추가
```

**중요:** API 시그니처나 코드 예제를 직접 작성하지 마세요. `/execute-prp` 실행 시 `intellicad-api` Skill이 정확한 IntelliCAD 호환 코드를 제공합니다.
