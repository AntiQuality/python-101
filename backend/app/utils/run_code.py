from __future__ import annotations

import argparse
import contextlib
import io
import json
import os
import resource
import signal
import sys
import tempfile
import traceback
from types import MappingProxyType


def _disable_network() -> None:
    import socket

    def _blocked(*_args, **_kwargs):  # noqa: ANN001, ANN002
        raise OSError("Network access is disabled in the sandbox")

    for attr in [
        "socket",
        "create_connection",
        "create_server",
        "create_datagram_endpoint",
        "getaddrinfo",
        "gethostbyname",
        "gethostbyname_ex",
        "getfqdn",
    ]:
        if hasattr(socket, attr):
            setattr(socket, attr, _blocked)

    socket.socket = _blocked  # type: ignore[assignment]


def _set_limits(time_limit: float, memory_limit: int | None) -> None:
    soft_cpu = max(1, int(time_limit))
    resource.setrlimit(resource.RLIMIT_CPU, (soft_cpu, soft_cpu + 1))

    if memory_limit:
        limit = max(memory_limit, 4 * 1024 * 1024)
        resource.setrlimit(resource.RLIMIT_AS, (limit, limit))
        resource.setrlimit(resource.RLIMIT_DATA, (limit, limit))

    resource.setrlimit(resource.RLIMIT_FSIZE, (1024 * 1024, 1024 * 1024))
    resource.setrlimit(resource.RLIMIT_NOFILE, (32, 32))


def main() -> None:
    parser = argparse.ArgumentParser(description="Sandbox runner")
    parser.add_argument("code_file", help="Path to user code")
    parser.add_argument("--time-limit", type=float, default=30.0)
    parser.add_argument("--memory-limit", type=int, default=None)
    parser.add_argument("--workdir", type=str, default=None)
    args = parser.parse_args()

    _set_limits(args.time_limit, args.memory_limit)
    _disable_network()

    temp_dir: str | None = None
    if args.workdir:
        os.makedirs(args.workdir, exist_ok=True)
        os.chdir(args.workdir)
    else:
        temp_dir = tempfile.mkdtemp(prefix="sandbox-")
        os.chdir(temp_dir)

    os.environ.update(
        {
            "PYTHONSAFEPATH": "1",
            "PYTHONUNBUFFERED": "1",
        }
    )
    sys.setrecursionlimit(1000)

    # Only keep minimal search path (stdlib and script directory)
    sys.path = [sys.path[0]] + [p for p in sys.path[1:] if "site-packages" not in p]

    code_path = args.code_file
    with open(code_path, "r", encoding="utf-8") as handle:
        source = handle.read()

    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()
    result = {
        "stdout": "",
        "stderr": "",
        "success": True,
        "error": None,
    }

    globals_dict = {
        "__name__": "__main__",
        "__file__": code_path,
        "__package__": None,
        "__builtins__": __builtins__,
    }
    locals_dict: dict[str, object] = {}

    try:
        compiled = compile(source, code_path, "exec")
        with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
            exec(compiled, globals_dict, locals_dict)
    except SystemExit as exc:
        result["success"] = exc.code == 0
        if not result["success"]:
            result["error"] = f"SystemExit: {exc.code}"
    except BaseException:  # noqa: BLE001 - intentionally broad in sandbox
        result["success"] = False
        result["error"] = traceback.format_exc()

    result["stdout"] = stdout_buffer.getvalue()
    result["stderr"] = stderr_buffer.getvalue()

    sys.stdout.write(json.dumps(result, ensure_ascii=False))
    sys.stdout.flush()

    if temp_dir:
        try:
            import shutil

            shutil.rmtree(temp_dir)
        except Exception:  # noqa: BLE001
            pass


if __name__ == "__main__":
    main()
