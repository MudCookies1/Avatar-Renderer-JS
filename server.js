const express = require("express");
const fs = require("fs");
const path = require("path");
const { renderAvatar } = require("./app");

const app = express();
const PORT = 3000;

const userAvatarPath = path.join(__dirname, "userAvatar.json");

app.use(express.json());

app.get("/listHats", (req, res) => {
  const hatConfigDir = path.join(__dirname, "publicAssets", "hatConfig");
  if (!fs.existsSync(hatConfigDir)) return res.json([]);

  try {
    const hats = fs.readdirSync(hatConfigDir)
      .filter(f => f.endsWith(".json"))
      .map(f => ({
        name: path.basename(f, ".json"),
        json: "./publicAssets/hatConfig/" + f,
        mesh: `./publicAssets/hatAssets/${path.basename(f, ".json")}.obj`,
        preview: `./publicAssets/hatAssets/${path.basename(f, ".json")}.png` 
      }));
    res.json(hats);
  } catch (err) {
    console.error("Error reading hat directory:", err);
    res.status(500).json([]);
  }
});

app.get("/listTShirts", (req, res) => {
  const shirtDir = path.join(__dirname, "publicAssets", "tShirts");
  if (!fs.existsSync(shirtDir)) return res.json([]);

  try {
    const shirts = fs.readdirSync(shirtDir)
      .filter(f => f.endsWith(".png"))
      .map(f => ({
        name: path.basename(f, ".png"),
        texture: "./publicAssets/tShirts/" + f
      }));
    res.json(shirts);
  } catch (err) {
    console.error("Error reading tShirt directory:", err);
    res.status(500).json([]);
  }
});

app.get("/listFaces", (req, res) => {
  const facesDir = path.join(__dirname, "publicAssets", "faces");
  if (!fs.existsSync(facesDir)) return res.json([]);

  try {
    const faces = fs.readdirSync(facesDir)
      .filter(f => f.endsWith(".png"))
      .map(f => ({
        name: path.basename(f, ".png"),
        texture: "./publicAssets/faces/" + f
      }));
    res.json(faces);
  } catch (err) {
    console.error("Error reading faces directory:", err);
    res.status(500).json([]);
  }
});

app.post("/updateAvatar", async (req, res) => {
  try {
    if (!fs.existsSync(userAvatarPath)) {
         fs.writeFileSync(userAvatarPath, JSON.stringify({ assets: {}, hat: {}, colors: {} }, null, 2));
    }
    const avatarData = JSON.parse(fs.readFileSync(userAvatarPath, "utf8"));

    if (req.body.colors) {
        avatarData.colors = req.body.colors;
    }

    if (req.body.assets) {
      avatarData.assets.headTexture = req.body.assets.headTexture;
      avatarData.assets.torsoTexture = req.body.assets.torsoTexture;

      if (req.body.assets.hatObj) {
        const hatObjPath = req.body.assets.hatObj;
        const hatName = path.basename(hatObjPath, path.extname(hatObjPath));
        const hatConfigPath = path.join(__dirname, "publicAssets", "hatConfig", hatName + ".json");
        
        if (fs.existsSync(hatConfigPath)) {
            avatarData.hat = JSON.parse(fs.readFileSync(hatConfigPath, "utf8"));
            avatarData.hat.mesh = hatObjPath; 
        } else {
            avatarData.hat = { 
                mesh: hatObjPath, 
                texture: "./assets/noHat.png", 
                scale:[1,1,1], 
                position:[0,0,0],
                rotation:[0,0,0], 
                color:[1,1,1]
            };
        }
      } else {
        avatarData.hat = { 
            mesh: "./assets/noHat.obj", 
            texture: "./assets/noHat.png", 
            scale:[1,1,1], 
            position:[0,0,0],
            rotation:[0,0,0], 
            color:[1,1,1]
        };
      }
    }

    fs.writeFileSync(userAvatarPath, JSON.stringify(avatarData, null, 2));
    await renderAvatar(userAvatarPath);

    res.json({ status: "done", cacheBust: Date.now() });
  } catch (err) {
    console.error("Error updating avatar:", err);
    res.status(500).send("Failed to update avatar");
  }
});

app.use(express.static(__dirname));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
