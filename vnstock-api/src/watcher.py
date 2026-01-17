import sys
import time
import subprocess
import os
from watchdog.observers.polling import PollingObserver
from watchdog.events import FileSystemEventHandler

class RestartHandler(FileSystemEventHandler):
    def __init__(self, command):
        self.command = command
        self.process = None
        self.restart_process()

    def restart_process(self):
        if self.process:
            print("[Watcher] Stopping process...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
        
        print("[Watcher] Starting process...")
        # Use -B to prevent bytecode generation in the subprocess
        cmd = self.command
        if "python" in cmd and "-B" not in cmd:
             parts = cmd.split()
             if parts[0] == "python":
                 parts.insert(1, "-B")
                 cmd = " ".join(parts)
        
        self.process = subprocess.Popen(cmd.split())

    def on_any_event(self, event):
        if event.is_directory:
            return
        
        # Filter for python files only
        if not event.src_path.endswith('.py'):
            return
            
        # Ignore __pycache__ and git explicitly
        if '__pycache__' in event.src_path or '.git' in event.src_path:
            return

        print(f"[Watcher] Change detected: {event.src_path}")
        self.restart_process()

def main():
    path = "./src"
    command = "python src/main.py"
    
    print(f"[Watcher] Watching {path} using PollingObserver...")
    event_handler = RestartHandler(command)
    observer = PollingObserver()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        if event_handler.process:
            event_handler.process.terminate()
    observer.join()

if __name__ == "__main__":
    main()
