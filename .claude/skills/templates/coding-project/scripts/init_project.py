#!/usr/bin/env python3
"""
Initialize a new coding project with proper structure.

Usage:
    python init_project.py <project-name> --lang <language>

Languages: typescript, python, csharp, react
"""

import argparse
import os
import sys
from pathlib import Path


TEMPLATES = {
    "typescript": {
        "files": {
            "src/index.ts": '''export function main() {
  console.log("Hello, World!");
}

main();
''',
            "package.json": '''{
  "name": "{project_name}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
''',
            "tsconfig.json": '''{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
''',
            ".gitignore": '''node_modules/
dist/
*.log
.env
''',
            "README.md": '''# {project_name}

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```
''',
        }
    },
    "python": {
        "files": {
            "src/__init__.py": "",
            "src/main.py": '''def main() -> None:
    print("Hello, World!")


if __name__ == "__main__":
    main()
''',
            "tests/__init__.py": "",
            "tests/test_main.py": '''from src.main import main


def test_main(capsys):
    main()
    captured = capsys.readouterr()
    assert "Hello" in captured.out
''',
            "pyproject.toml": '''[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "{project_name}"
version = "0.1.0"
description = ""
requires-python = ">=3.10"
dependencies = []

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "ruff>=0.1.0",
    "mypy>=1.0",
]

[tool.ruff]
line-length = 88
target-version = "py310"

[tool.mypy]
python_version = "3.10"
strict = true
''',
            ".gitignore": '''__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
.env
dist/
*.egg-info/
.mypy_cache/
.ruff_cache/
''',
            "README.md": '''# {project_name}

## Setup

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\\Scripts\\activate   # Windows
pip install -e ".[dev]"
```

## Run

```bash
python -m src.main
```

## Test

```bash
pytest
```
''',
        }
    },
    "csharp": {
        "files": {
            "src/Program.cs": '''Console.WriteLine("Hello, World!");
''',
            "{project_name}.csproj": '''<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <RootNamespace>{project_name_pascal}</RootNamespace>
  </PropertyGroup>

</Project>
''',
            ".gitignore": '''bin/
obj/
*.user
*.suo
.vs/
*.log
''',
            "README.md": '''# {project_name}

## Setup

```bash
dotnet restore
```

## Run

```bash
dotnet run
```

## Build

```bash
dotnet build -c Release
```

## Test

```bash
dotnet test
```
''',
        }
    },
    "react": {
        "files": {
            "src/App.tsx": '''function App() {
  return (
    <div className="app">
      <h1>Hello, World!</h1>
    </div>
  );
}

export default App;
''',
            "src/main.tsx": '''import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
''',
            "src/index.css": '''* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
''',
            "index.html": '''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{project_name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
''',
            "package.json": '''{
  "name": "{project_name}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
''',
            "tsconfig.json": '''{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
''',
            "tsconfig.node.json": '''{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
''',
            "vite.config.ts": '''import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
''',
            ".gitignore": '''node_modules/
dist/
*.log
.env
''',
            "README.md": '''# {project_name}

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
''',
        }
    },
}


def to_pascal_case(name: str) -> str:
    """Convert kebab-case or snake_case to PascalCase."""
    parts = name.replace("-", "_").split("_")
    return "".join(part.capitalize() for part in parts)


def create_project(project_name: str, language: str, base_path: Path) -> None:
    """Create a new project with the specified language template."""
    if language not in TEMPLATES:
        print(f"Error: Unknown language '{language}'")
        print(f"Available languages: {', '.join(TEMPLATES.keys())}")
        sys.exit(1)

    project_path = base_path / project_name
    if project_path.exists():
        print(f"Error: Directory '{project_path}' already exists")
        sys.exit(1)

    template = TEMPLATES[language]
    project_name_pascal = to_pascal_case(project_name)

    print(f"Creating {language} project: {project_name}")

    for file_path, content in template["files"].items():
        # Replace placeholders in file path and content
        file_path = file_path.replace("{project_name}", project_name)
        content = content.replace("{project_name}", project_name)
        content = content.replace("{project_name_pascal}", project_name_pascal)

        full_path = project_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content, encoding="utf-8")
        print(f"  Created: {file_path}")

    print(f"\nProject created successfully: {project_path}")
    print(f"\nNext steps:")
    print(f"  cd {project_name}")

    if language in ("typescript", "react"):
        print("  npm install")
        print("  npm run dev")
    elif language == "python":
        print("  python -m venv venv")
        print("  source venv/bin/activate  # or venv\\Scripts\\activate on Windows")
        print("  pip install -e '.[dev]'")
    elif language == "csharp":
        print("  dotnet restore")
        print("  dotnet run")


def main():
    parser = argparse.ArgumentParser(description="Initialize a new coding project")
    parser.add_argument("name", help="Project name")
    parser.add_argument(
        "--lang",
        "-l",
        required=True,
        choices=list(TEMPLATES.keys()),
        help="Programming language/framework",
    )
    parser.add_argument(
        "--path",
        "-p",
        type=Path,
        default=Path.cwd(),
        help="Base path for project creation (default: current directory)",
    )

    args = parser.parse_args()
    create_project(args.name, args.lang, args.path)


if __name__ == "__main__":
    main()
