import subprocess
import sys
import os
import time
import webbrowser

SERVER_DIR = os.path.join(os.path.dirname(__file__), "server")


def main():
    print("=" * 50)
    print("  DUNGEON FIGHTER - Starting...")
    print("=" * 50)

    print("\n[1/2] Starting server...")
    server_process = subprocess.Popen(
        [sys.executable, "app.py"],
        cwd=SERVER_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    time.sleep(2)

    if server_process.poll() is not None:
        print("Server failed to start!")
        return

    url = "http://127.0.0.1:5000"
    print(f"  Server running on {url}")

    print("\n[2/2] Opening browser...")
    webbrowser.open(url)

    print("\n" + "=" * 50)
    print(f"  Open {url} in your browser if not opened.")
    print("  Press Ctrl+C to stop the server.")
    print("=" * 50)

    try:
        server_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        print("Stopping server...")
        server_process.terminate()
        server_process.wait()
        print("Goodbye!")


if __name__ == "__main__":
    main()
