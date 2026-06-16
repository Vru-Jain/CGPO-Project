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

# Define the Image, install requirements, and copy the backend directory.
# Uses the slimmed requirements-modal.txt (serving-path deps only) so the image
# is smaller and pulls faster on a cold start. torch stays on the default CUDA
# wheel for the T4 GPU.
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install_from_requirements("backend/requirements-modal.txt")
    .apt_install("git")
    .add_local_dir("backend", remote_path="/root/backend")
)

# We mount the entire directory into the Modal container so it has access to core logic
@app.function(
    image=image,
    gpu="T4",
    max_containers=1,
    min_containers=0,
    # Allow long-lived containers so a background training run isn't recycled
    # mid-flight (the default is 5 min). Training is now fast, but this is cheap
    # insurance against the container being torn down before save_model().
    timeout=1800,
    # Stay warm for 5 min after the last request so a user's session (and the
    # training-status polling loop) doesn't re-pay the cold start mid-use.
    scaledown_window=300,
    # NOTE: memory snapshots were tried here to cut cold start, but Modal
    # checkpoints/recycles the container to capture the snapshot, which kills
    # the long-running background TRAINING task (~6 min in) before it can save.
    # The slim image + scaledown_window already cover cold start without that
    # risk, so snapshotting stays off.
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
