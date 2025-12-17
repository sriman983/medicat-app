import json
import torch
from tqdm import tqdm
from text_runner import TextModelRunner

CAPTIONS_PATH = "captions.jsonl"
IMAGES_DIR = "dataset/images/figures"
OUTPUT = "label_map.json"

def load_captions():
    records = []
    with open(CAPTIONS_PATH, "r", encoding="utf8") as f:
        for line in f:
            item = json.loads(line)
            fig_uri = item.get("fig_uri")
            text = item.get("text")
            if fig_uri and text:
                records.append({"image": fig_uri, "caption": text})
    return records

def main():
    print("Loading model...")
    model = TextModelRunner(model_path="trained_model.pth")

    print("Loading captions...")
    captions = load_captions()

    label_map = {"0": [], "1": []}

    print("Classifying all captions...")
    for rec in tqdm(captions):
        text = rec["caption"]
        image = rec["image"]

        # ----- FIXED HERE -----
        pred, err = model.run_text(text)
        if pred is None:
            print("Error:", err)
            continue

        class_idx = int(pred["predictions"][0]["index"])
        # ------------------------------------

        label_map[str(class_idx)].append(image)

    print(f"Saving mapping to {OUTPUT}...")
    with open(OUTPUT, "w") as f:
        json.dump(label_map, f, indent=4)

    print("\nDONE! label_map.json created successfully.")

if __name__ == "__main__":
    main()
