#!/usr/bin/env python3
"""
OpenAPI 스펙을 YAML 파일로 export하는 스크립트.

사용법:
    python export_openapi.py
    python export_openapi.py --output my-spec.yaml

출력: openapi.yaml (기본값)
"""
import argparse
import json
import sys

try:
    import yaml
except ImportError:
    print("Error: pyyaml이 설치되지 않았습니다. 'pip install pyyaml'을 실행하세요.")
    sys.exit(1)

from main import app


def export_openapi(output_path: str = "openapi.yaml") -> None:
    spec = app.openapi()

    with open(output_path, "w", encoding="utf-8") as f:
        yaml.dump(spec, f, allow_unicode=True, sort_keys=False, default_flow_style=False)

    print(f"OpenAPI spec exported → {output_path}")
    print(f"  title   : {spec.get('info', {}).get('title')}")
    print(f"  version : {spec.get('info', {}).get('version')}")
    print(f"  paths   : {list(spec.get('paths', {}).keys())}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FastAPI OpenAPI spec YAML exporter")
    parser.add_argument(
        "--output", "-o",
        default="openapi.yaml",
        help="출력 파일 경로 (기본값: openapi.yaml)",
    )
    args = parser.parse_args()
    export_openapi(args.output)
