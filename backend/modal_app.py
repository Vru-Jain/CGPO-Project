import modal
import os

app = modal.App(name="cgpo-backend")

# Define the Image, install requirements, and copy the backend directory
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install_from_requirements("backend/requirements.txt")
    .apt_install("git")
    .add_local_dir("backend", remote_path="/root/backend")
)

# We mount the entire directory into the Modal container so it has access to core logic
@app.function(
    image=image,
    gpu="T4",
    max_containers=1,
    min_containers=0,
    secrets=[modal.Secret.from_name("cgpo-secrets")],
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def serve():
    # Inject the directory into Python's path so it can find main.py and core/
    import sys
    if "/root/backend" not in sys.path:
        sys.path.append("/root/backend")
        
    from main import app as fastapi_app
    return fastapi_app
