#!/usr/bin/env python3
"""
Validate project structure and configuration.

Usage:
    python validate.py <project-path>
"""

import argparse
import sys
from pathlib import Path


REQUIRED_FILES = {
    "typescript": ["package.json", "tsconfig.json", "src/index.ts"],
    "python": ["pyproject.toml", "src/__init__.py", "src/main.py"],
    "csharp": ["*.csproj", "src/Program.cs"],
    "react": ["package.json", "tsconfig.json", "vite.config.ts", "src/App.tsx", "src/main.tsx"],
}


def detect_language(project_path: Path) -> str | None:
    """Detect project language based on files present."""
    if (project_path / "vite.config.ts").exists() and (project_path / "src/App.tsx").exists():
        return "react"
    if list(project_path.glob("*.csproj")):
        return "csharp"
    if (project_path / "pyproject.toml").exists() or (project_path / "requirements.txt").exists():
        return "python"
    if (project_path / "tsconfig.json").exists():
        return "typescript"
    return None


def validate_project(project_path: Path) -> list[str]:
    """Validate project structure. Returns list of errors."""
    errors = []

    if not project_path.exists():
        return [f"Project path does not exist: {project_path}"]

    if not project_path.is_dir():
        return [f"Project path is not a directory: {project_path}"]

    language = detect_language(project_path)
    if not language:
        return ["Could not detect project language"]

    print(f"Detected language: {language}")

    required = REQUIRED_FILES.get(language, [])
    for file_pattern in required:
        if "*" in file_pattern:
            matches = list(project_path.glob(file_pattern))
            if not matches:
                errors.append(f"Missing required file: {file_pattern}")
        else:
            if not (project_path / file_pattern).exists():
                errors.append(f"Missing required file: {file_pattern}")

    # Language-specific validations
    if language == "typescript" or language == "react":
        package_json = project_path / "package.json"
        if package_json.exists():
            import json
            try:
                data = json.loads(package_json.read_text())
                if "scripts" not in data:
                    errors.append("package.json missing 'scripts' section")
            except json.JSONDecodeError as e:
                errors.append(f"Invalid package.json: {e}")

    if language == "python":
        pyproject = project_path / "pyproject.toml"
        if pyproject.exists():
            content = pyproject.read_text()
            if "[project]" not in content:
                errors.append("pyproject.toml missing [project] section")

    if language == "csharp":
        csproj_files = list(project_path.glob("*.csproj"))
        for csproj in csproj_files:
            content = csproj.read_text()
            if "<Nullable>enable</Nullable>" not in content:
                errors.append(f"{csproj.name}: Nullable reference types not enabled")

    return errors


def main():
    parser = argparse.ArgumentParser(description="Validate project structure")
    parser.add_argument("path", type=Path, help="Project path to validate")

    args = parser.parse_args()
    errors = validate_project(args.path)

    if errors:
        print("Validation errors:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("OK - Project structure is valid")
        sys.exit(0)


if __name__ == "__main__":
    main()
