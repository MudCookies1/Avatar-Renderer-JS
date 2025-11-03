const fs = require("fs");
const path = require("path");
const AvatarRenderer = require("./AvatarRenderer");

const noHat = { mesh: "./assets/noHat.obj", texture: "./assets/noHat.png", scale: [1,1,1], position: [0,0,0], rotation:[0,0,0], color: [1,1,1] };

async function renderAvatar(jsonPath = path.join(__dirname, "userAvatar.json")) {
  const avatar = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const renderer = new AvatarRenderer(avatar.canvas.width, avatar.canvas.height, avatar.assets.headObj);

  Object.entries(avatar.colors).forEach(([part, color]) => renderer.setPartColor(part, color));
  Object.entries(avatar.decals).forEach(([part, decal]) => { if(decal) renderer.setPartDecal(part, decal); });

  if (avatar.assets.headTexture) {
      renderer.setPartDecal('head', avatar.assets.headTexture);
  } else {
      renderer.setPartDecal('head', './publicAssets/faces/face.png');
  }
  
  if (avatar.assets.torsoTexture) {
      renderer.setPartDecal('torso', avatar.assets.torsoTexture);
  } else {
      renderer.setPartDecal('torso', './assets/noShirt.png');
  }

  const hatConfig = avatar.hat && avatar.hat.mesh && avatar.hat.texture ? avatar.hat : noHat;
  renderer.setHat(hatConfig);

  const pngBuffer = renderer.render();
  fs.writeFileSync(avatar.outputFile, pngBuffer);
  return true;
}

module.exports = { renderAvatar };

if (require.main === module) {
  renderAvatar().catch(() => process.exit(1));
}
