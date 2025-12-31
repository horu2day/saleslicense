---
name: coding-project
description: Create and manage coding projects with proper structure. Use when creating new projects, setting up build configurations, or initializing development environments for TypeScript, Python, C#, or React.
---

# Coding Project

프로젝트 생성 및 관리를 위한 범용 Skill입니다.

## Quick Start

```bash
# 프로젝트 초기화
python scripts/init_project.py <project-name> --lang <language>

# 지원 언어: typescript, python, csharp, react
```

## Workflow

1. **언어/프레임워크 선택**
   - TypeScript → `--lang typescript`
   - Python → `--lang python`
   - C# → `--lang csharp`
   - React → `--lang react`

2. **프로젝트 초기화**
   ```bash
   python scripts/init_project.py my-project --lang typescript
   ```

3. **구조 검증**
   ```bash
   python scripts/validate.py my-project/
   ```

## Language-Specific Guides

- **TypeScript**: See [references/typescript.md](references/typescript.md)
- **Python**: See [references/python.md](references/python.md)
- **C#**: See [references/csharp.md](references/csharp.md)
- **React**: See [references/react.md](references/react.md)

## Project Structure by Language

### TypeScript
```
project/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Python
```
project/
├── src/
│   └── __init__.py
├── tests/
├── pyproject.toml
└── README.md
```

### C#
```
project/
├── src/
│   └── Program.cs
├── project.csproj
└── README.md
```

### React
```
project/
├── src/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Best Practices

1. **일관된 네이밍**: 언어별 규칙 준수
2. **의존성 관리**: lock 파일 포함
3. **문서화**: README.md 필수 포함
4. **테스트 구조**: 테스트 폴더 분리
