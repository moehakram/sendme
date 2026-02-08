from dataclasses import dataclass
from pathlib import Path
from typing import Dict


@dataclass
class Node:
    id: str
    name: str
    path: Path


nodes: Dict[str, Node] = {}
