import torch

PATH = "trained_model.pth"   # or your exact filename

print("\n=== LOADING MODEL CHECKPOINT ===")
obj = torch.load(PATH, map_location="cpu")

# unwrap Lightning or HF format
if isinstance(obj, dict) and "state_dict" in obj:
    sd = obj["state_dict"]
    print("Found 'state_dict' inside checkpoint.")
else:
    sd = obj if isinstance(obj, dict) else obj.state_dict()

print("\n=== FIRST 50 KEYS ===")
for i, k in enumerate(sd.keys()):
    print(f"{i}: {k}")
    if i >= 50:
        break

print("\n=== LINEAR LAYERS (classifier) ===")
for k, v in sd.items():
    if hasattr(v, "ndim") and v.ndim == 2:
        print(f"{k}: shape={tuple(v.shape)}")

print("\n=== POSSIBLE CLASSIFIER HEADS DETECTED ===")
for k, v in sd.items():
    if "classifier" in k.lower() or "fc" in k.lower() or "out" in k.lower():
        print(f"{k}: {tuple(v.shape)}")

# guess number of classes
num_classes_guess = None
for k, v in sd.items():
    if hasattr(v, "ndim") and v.ndim == 2:
        out_f, in_f = v.shape
        # exclude huge embedding matrices like 30522 x 768
        if out_f < 500:
            num_classes_guess = out_f
            break

print(f"\n=== GUESSED NUMBER OF CLASSES: {num_classes_guess} ===")
