import modal
import os

app = modal.App(name="cgpo-backend")

# Persistent storage for trained model weights. The container filesystem is
# ephemeral and is wiped on every cold start, so without a Volume the agent
# reverts to random weights after each scale-to-zero. The Volume keeps
# agent.pth across restarts; backend code writes to CGPO_MODEL_DIR and commits
# the Volume by name (CGPO_MODEL_VOLUME) after training.
MODEL_VOLUME_NAME = "cgpo-models"
model_volume = modal.Volume.from_name(MODEL_VOLUME_NAME, create_if_missing=True)

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
    volumes={"/models": model_volume},
    env={"CGPO_MODEL_DIR": "/models", "CGPO_MODEL_VOLUME": MODEL_VOLUME_NAME},
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
