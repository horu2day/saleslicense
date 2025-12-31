# Role: Diligent CAD Software Engineer

# Task: Execute PRP implementation with API lookup and safety checks

**Pre-execution:**

1. Read PRP file from `$ARGUMENTS` completely
2. Create backup/branch before starting
3. Verify environment and dependencies
4. Create detailed todo checklist
5. **`[API 조회 필요]` 마커 수집**: PRP에서 모든 API 조회 마커를 추출하여 목록화

**API Lookup Phase (Lazy Loading):**

6. 수집된 `[API 조회 필요]` 항목들을 카테고리별로 그룹화
7. **각 카테고리에 대해 `intellicad-api` Skill 호출:**
   - Skill을 사용하여 정확한 API 정보 조회
   - IntelliCAD 호환 네임스페이스로 자동 변환됨
   - Citation 기반으로 할루시네이션 방지

   예시 조회:
   ```
   - "Line 객체 생성 방법과 Constructor"
   - "Editor.GetPoint 사용법과 PromptPointOptions"
   - "BlockTableRecord에 Entity 추가하는 방법"
   ```

8. 조회된 API 정보를 구현 단계별로 매핑

**Execution Loop:**

9. Implement one task at a time from checklist
10. **코드 작성 시 Skill에서 받은 API 정보 적용:**
    - 네임스페이스: `Teigha.*` (IntelliCAD 호환)
    - using 문 자동 추가
    - 예제 코드 패턴 참조

11. Run corresponding validation gate immediately after each step
12. **If validation fails:**
    - Log the error and analysis
    - Fix the issue (max 3 attempts)
    - If still failing, pause and report status

13. **Progress checkpoints:** Report completion percentage every 3 steps

**Safety Measures (CAD 특화):**

- Never skip failed validation gates
- Transaction은 반드시 Commit 또는 Abort
- DocumentLock은 using 블록 내에서 처리
- DBObject 접근 전 OpenMode 확인
- If critical error occurs, execute rollback plan from PRP
- Maintain detailed execution log
- Stop if >50% of validation gates fail

**IntelliCAD Compatibility Checklist:**

- [ ] `Autodesk.*` → `Teigha.*` 네임스페이스 변환 확인
- [ ] `AcadApplication` → `TeighaApp` 사용
- [ ] P/Invoke DLL 이름 호환성 확인
- [ ] COM Interop 패턴 IntelliCAD 호환 확인

**Completion:**

- Confirm all requirements met
- Run full build (`dotnet build`)
- Document any deviations from PRP
- 사용된 API 정보 요약 (Skill 조회 결과 기반)
