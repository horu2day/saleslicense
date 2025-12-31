# Python Project Guide

## Contents

- Project Structure
- Configuration
- Build & Run
- Best Practices
- Common Patterns

## Project Structure

```
project/
├── src/
│   ├── __init__.py
│   ├── main.py           # Entry point
│   └── utils/
│       └── __init__.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── pyproject.toml
├── requirements.txt      # Optional (for pip)
├── .gitignore
└── README.md
```

## Configuration

### pyproject.toml (Recommended)

```toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "project-name"
version = "0.1.0"
description = "Project description"
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
```

### requirements.txt (Alternative)

```
# Production
requests>=2.28.0

# Development
pytest>=7.0
ruff>=0.1.0
mypy>=1.0
```

## Build & Run

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -e ".[dev]"

# Run
python -m src.main

# Test
pytest

# Lint
ruff check src/
mypy src/
```

## Best Practices

1. **Type hints**: Always use type annotations
2. **Virtual environment**: Isolate dependencies
3. **Ruff + MyPy**: Use for linting and type checking
4. **Docstrings**: Document public APIs

## Common Patterns

### Type-safe Error Handling

```python
from typing import TypeVar, Generic
from dataclasses import dataclass

T = TypeVar("T")

@dataclass
class Result(Generic[T]):
    success: bool
    data: T | None = None
    error: str | None = None

def safe_operation(fn) -> Result:
    try:
        return Result(success=True, data=fn())
    except Exception as e:
        return Result(success=False, error=str(e))
```

### Dependency Injection

```python
from abc import ABC, abstractmethod
from typing import Protocol

class Logger(Protocol):
    def log(self, message: str) -> None: ...

class Service:
    def __init__(self, logger: Logger) -> None:
        self._logger = logger

    def execute(self) -> None:
        self._logger.log("Executing...")
```
