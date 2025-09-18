from pathlib import Path
from pydantic import BaseModel


class Settings(BaseModel):
    project_name: str = "Python-101"
    base_dir: Path = Path(__file__).resolve().parents[3]
    resources_dir: Path = base_dir / "resources"
    data_dir: Path = base_dir / "data"
    chapters_dirname: str = "chapters"
    questions_dirname: str = "questions"
    config_dirname: str = "config"
    default_memory_limit: int = 8 * 1024 * 1024  # 8 MB in bytes
    python_version: str = "3.8"
    max_devices_per_user: int = 3

    class Config:
        arbitrary_types_allowed = True


settings = Settings()
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.resources_dir.mkdir(parents=True, exist_ok=True)
