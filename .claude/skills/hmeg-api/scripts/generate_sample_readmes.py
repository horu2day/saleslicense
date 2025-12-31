#!/usr/bin/env python3
"""
HmEG 샘플 프로젝트 README.md 자동 생성
각 샘플 폴더에 메타데이터 README 생성
"""

import os
from pathlib import Path
from typing import Dict, List

def analyze_sample_project(sample_dir: Path) -> Dict:
    """샘플 프로젝트 분석"""

    cs_files = list(sample_dir.glob("*.cs"))
    xaml_files = list(sample_dir.glob("*.xaml"))
    csproj_files = list(sample_dir.glob("*.csproj"))

    # .xaml.cs 제외한 순수 .cs 파일
    pure_cs_files = [f for f in cs_files if not f.name.endswith('.xaml.cs')]

    return {
        "name": sample_dir.name,
        "cs_count": len(pure_cs_files),
        "xaml_count": len(xaml_files),
        "has_csproj": len(csproj_files) > 0,
        "cs_files": [f.name for f in pure_cs_files],
        "xaml_files": [f.name for f in xaml_files],
    }

def categorize_sample(name: str) -> str:
    """샘플 카테고리 추론"""
    name_lower = name.lower()

    if "animation" in name_lower:
        return "Animation"
    elif "camera" in name_lower or "viewport" in name_lower:
        return "Camera & Viewport"
    elif "material" in name_lower or "texture" in name_lower:
        return "Materials & Rendering"
    elif "block" in name_lower or "layer" in name_lower:
        return "Data Structure"
    elif "performance" in name_lower or "memory" in name_lower:
        return "Performance & Optimization"
    elif "overlay" in name_lower or "drawing" in name_lower:
        return "2D Overlay"
    elif "legend" in name_lower or "dimension" in name_lower:
        return "Annotation & Legend"
    elif "mesh" in name_lower or "topology" in name_lower:
        return "Mesh & Geometry"
    elif "import" in name_lower or "export" in name_lower:
        return "Import/Export"
    elif "billboard" in name_lower or "primitive" in name_lower:
        return "Primitives & Shapes"
    elif "gizmo" in name_lower or "selection" in name_lower:
        return "Interaction & Tools"
    elif "bim" in name_lower:
        return "BIM"
    elif "test" in name_lower:
        return "Testing"
    else:
        return "General"

def generate_readme(sample_info: Dict) -> str:
    """README.md 내용 생성"""

    name = sample_info["name"]
    category = categorize_sample(name)

    readme = f"""# {name}

## Category
{category}

## Project Information
- **Type**: HmEG WPF Sample Application
- **Framework**: .NET 8.0 Windows
- **C# Files**: {sample_info['cs_count']}
- **XAML Files**: {sample_info['xaml_count']}
- **Has Project File**: {'Yes' if sample_info['has_csproj'] else 'No'}

## Files Overview

### XAML Files
"""

    if sample_info['xaml_files']:
        for xaml in sample_info['xaml_files']:
            readme += f"- `{xaml}`\n"
    else:
        readme += "- None\n"

    readme += "\n### C# Files\n"

    if sample_info['cs_files']:
        for cs in sample_info['cs_files']:
            readme += f"- `{cs}`\n"
    else:
        readme += "- None\n"

    readme += f"""

## Purpose

{get_sample_purpose(name)}

## Key APIs

This sample demonstrates the usage of HmEG APIs related to {category.lower()}.

## Usage

This is a complete WPF application sample. To use:
1. Open the .csproj file in Visual Studio 2022
2. Ensure all dependencies are available in `libraries/` folder
3. Build and run the project

## Related Samples

See other samples in the `{category}` category for related functionality.

---

*Generated automatically for HmEG RAG system*
"""

    return readme

def get_sample_purpose(name: str) -> str:
    """샘플 목적 추론"""

    purposes = {
        "ACIColoringSample": "Demonstrates ACI (AutoCAD Color Index) coloring system for models.",
        "AllocateViewerSample": "Shows how to allocate and manage multiple viewport instances.",
        "BillboardSample": "Demonstrates billboard rendering (always facing camera).",
        "BlockSample": "Shows how to use block/instance system for efficient model management.",
        "CameraAnimationSample": "Demonstrates camera movement and animation techniques.",
        "Cm2MeshSample": "Shows how to work with Cm2Mesh data structures.",
        "ContourMesh_CSD": "Demonstrates contour mesh generation for CSD (Civil Structural Design).",
        "DesignTeamMaterialSample": "Shows how to apply design team specific materials.",
        "DimensionSample": "Demonstrates dimension annotation and measurement tools.",
        "DrawOverlaySample": "Shows how to draw 2D overlays on top of 3D viewport.",
        "GizmoSample": "Demonstrates interactive gizmo tools for object manipulation.",
        "ImportExportSample": "Shows how to import and export various 3D file formats.",
        "InnerClippingSample": "Demonstrates inner clipping plane functionality.",
        "LayerSample": "Shows how to organize models using layer system.",
        "LegendSample": "Demonstrates legend creation and management.",
        "LinearGradientTransparencySample": "Shows linear gradient transparency effects.",
        "MemoryLeakTest": "Performance testing for memory leak detection.",
        "MeshSurfaceOffsetSample": "Demonstrates mesh surface offset operations.",
        "ModelKeyframeAnimationSample": "Shows keyframe-based model animation.",
        "PerformanceSample": "Demonstrates performance optimization techniques.",
        "ShareViewportSample": "Shows how to share viewport between multiple views.",
        "SphericalGradientTransparencySample": "Demonstrates spherical gradient transparency.",
        "TessellationSample": "Shows tessellation techniques for smooth surfaces.",
        "TextStyleSample": "Demonstrates text style management and rendering.",
        "TextureSample": "Shows how to apply and manage textures.",
        "TopologyMeshSample": "Demonstrates topology mesh operations.",
        "ViewportCameraManagerSample": "Shows advanced camera management in viewport.",
        "VirtualTextureSample": "Demonstrates virtual texture streaming for large textures.",
    }

    return purposes.get(name, f"Demonstrates {name.replace('Sample', '')} functionality in HmEG.")

def main():
    """메인 실행"""

    samples_root = Path(__file__).parent.parent.parent.parent.parent / "data" / "HmEGSample"

    if not samples_root.exists():
        print(f"❌ Error: {samples_root} not found")
        return

    print(f"📂 Scanning samples in: {samples_root}\n")

    # 샘플 폴더 목록
    sample_dirs = [d for d in samples_root.iterdir() if d.is_dir() and d.name != ".git"]

    generated_count = 0

    for sample_dir in sorted(sample_dirs):
        # 분석
        sample_info = analyze_sample_project(sample_dir)

        # README 생성
        readme_content = generate_readme(sample_info)
        readme_path = sample_dir / "README.md"

        # 저장
        readme_path.write_text(readme_content, encoding='utf-8')

        print(f"✅ {sample_dir.name}")
        print(f"   → README.md created")
        print(f"   → {sample_info['cs_count']} CS, {sample_info['xaml_count']} XAML")

        generated_count += 1

    print(f"\n🎉 Generated {generated_count} README files")

if __name__ == "__main__":
    main()
