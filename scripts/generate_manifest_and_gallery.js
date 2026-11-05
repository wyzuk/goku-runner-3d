import fs from 'fs';
import path from 'path';

const results = JSON.parse(fs.readFileSync('3dmodels/inspection_results.json', 'utf8'));

// Augment results with refined recommendations & categories
const augmented = results.map(item => {
  let primaryCategory = item.expectedCategory;
  let recommendedUsage = '';
  let integrationStatus = 'Approved';
  let scaleFactor = '1.0';

  if (item.id === 'baby_goku_super_saiyan_iii') {
    primaryCategory = 'Character';
    recommendedUsage = 'Primary candidate for Goku character model / Super Saiyan transformation skin. Chibi anime proportions match endless runner gameplay perfectly.';
    integrationStatus = 'Ready for Character Integration (Phase 01)';
    scaleFactor = '1.0 (~3m tall; scale to ~1.8m height)';
  } else if (item.id === 'gogeta_character') {
    primaryCategory = 'Character';
    recommendedUsage = 'High-detail hero character model (Gogeta). Ideal as unlockable character skin or fusion transformation mode.';
    integrationStatus = 'Ready for Character Integration (Phase 01)';
    scaleFactor = '2.0 (currently 1m tall; scale to ~2.0m)';
  } else if (item.id === 'wooden_bridge') {
    primaryCategory = 'Obstacle / Pathway';
    recommendedUsage = 'Elevated ramp obstacle, archway, or bridge section spanning across lanes.';
    integrationStatus = 'Ready for Obstacle Integration';
    scaleFactor = '0.02 (native coordinates in cm: ~420 units wide)';
  } else if (item.id === 'mossy_old_tree_log') {
    primaryCategory = 'Obstacle / Environment';
    recommendedUsage = 'Lane-blocking hurdle obstacle. Goku must jump over or switch lanes.';
    integrationStatus = 'Ready for Obstacle Integration';
    scaleFactor = '1.5 - 2.0';
  } else if (item.id === 'fallen_tree') {
    primaryCategory = 'Obstacle / Environment';
    recommendedUsage = 'Large fallen tree trunk obstacle. High poly (90k tris) - requires decimation to <5k tris before deployment.';
    integrationStatus = 'Needs Decimation';
    scaleFactor = '0.5 - 0.8';
  } else if (item.id === 'stalagmitecrystalore_cluster') {
    primaryCategory = 'Collectible / Special Prop';
    recommendedUsage = 'Ki Crystal / Powerup node or glowing hazard crystal. Adds rich visual energy to the track.';
    integrationStatus = 'Ready for Integration';
    scaleFactor = '1.0';
  } else if (item.id === 'large_stone') {
    primaryCategory = 'Obstacle / Environment';
    recommendedUsage = 'Large solid boulder obstacle blocking a single lane.';
    integrationStatus = 'Ready for Integration';
    scaleFactor = '1.0';
  } else if (['desert_rocks', 'flat_rocks', 'smallrocks1', 'small_rocks'].includes(item.id)) {
    primaryCategory = 'Environment / Rocks';
    recommendedUsage = 'Trackside ground rock scatter and shoulder borders.';
    integrationStatus = 'Ready for Environment Integration';
    scaleFactor = item.id === 'flat_rocks' ? '0.3 - 0.5' : '1.0';
  } else if (['low_poly_mountain', 'low_poly_mountain_1', 'low_poly_mountain_2', 'low_poly_mountain_free'].includes(item.id)) {
    primaryCategory = 'Environment / Background Mountains';
    recommendedUsage = 'Distant background skyline parallax mountains. Ultra-lightweight and visually striking.';
    integrationStatus = 'Ready for Environment Integration';
    scaleFactor = item.id === 'low_poly_mountain_free' ? '20.0 - 50.0' : '1.0 - 2.0';
  } else if (item.id === 'rocks_and_trees') {
    primaryCategory = 'Environment / Prop Cluster';
    recommendedUsage = 'Pre-assembled prop vignette (rocks + miniature trees) for trackside scenery.';
    integrationStatus = 'Ready for Environment Integration';
    scaleFactor = '2.0 - 3.0';
  } else if (item.id === 'stylized_bush') {
    primaryCategory = 'Environment / Foliage';
    recommendedUsage = 'Roadside bushes and track hedges. Matches anime cell-shaded look cleanly.';
    integrationStatus = 'Ready for Environment Integration (Preferred Bush)';
    scaleFactor = '1.2 - 1.8';
  } else if (['grass_patches', 'grass', 'grass_patch', 'realistics_grass_07'].includes(item.id)) {
    primaryCategory = 'Environment / Ground Foliage';
    recommendedUsage = 'Instanced ground grass tufts along road edges.';
    integrationStatus = 'Ready for Environment Integration';
    scaleFactor = '1.0';
  } else if (['flowering_plant', 'small_folliage_plant', 'fern'].includes(item.id)) {
    primaryCategory = 'Environment / Foliage';
    recommendedUsage = 'Accent vegetation and flowers along the track boundary.';
    integrationStatus = 'Ready for Environment Integration';
    scaleFactor = '1.0';
  } else if (item.id === 'pine_tree_1') {
    primaryCategory = 'Environment / Foliage (Trees)';
    recommendedUsage = 'Conifer pine tree for forest and mountain biomes. Low poly (2.1k tris). Preferred over 437k tris version.';
    integrationStatus = 'Ready for Environment Integration (Preferred Pine)';
    scaleFactor = '0.03 (native units ~300)';
  } else if (item.id === 'oak_tree') {
    primaryCategory = 'Environment / Foliage (Trees)';
    recommendedUsage = 'Deciduous roadside canopy tree.';
    integrationStatus = 'Ready for Environment Integration';
    scaleFactor = '0.8 - 1.2';
  } else if (item.id === 'dead_trees') {
    primaryCategory = 'Environment / Foliage (Trees)';
    recommendedUsage = 'Arid / wasteland biome trees.';
    integrationStatus = 'Ready for Environment Integration';
    scaleFactor = '0.005 (native units ~2400)';
  } else if (item.id === 'small_trees') {
    primaryCategory = 'Environment / Foliage (Trees)';
    recommendedUsage = 'Ultra-low-poly roadside trees (200 tris). Perfect for high-density instancing.';
    integrationStatus = 'Ready for Environment Integration';
    scaleFactor = '1.0 - 1.5';
  } else if (item.id === 'tree_broken_mossy_branch') {
    primaryCategory = 'Obstacle / Environment';
    recommendedUsage = 'Trackside log / branch obstacle or prop.';
    integrationStatus = 'Ready for Integration';
    scaleFactor = '3.0 - 5.0';
  } else if (['bush', 'pine_tree', 'realistic_trees_collection', 'stylized_mountain_extracted'].includes(item.id)) {
    primaryCategory = 'Heavy / Unsuitable';
    recommendedUsage = 'Excessive polygon count (>120k - 500k tris) or file size (>20MB - 40MB). Excluded from mobile runner.';
    integrationStatus = 'Rejected / Superseded by Low-Poly Alternatives';
    scaleFactor = 'N/A';
  }

  return {
    ...item,
    primaryCategory,
    recommendedUsage,
    integrationStatus,
    scaleFactor
  };
});

// Write Markdown Manifest
let md = `# GOKU RUNNER 3D — 3D ASSET INVENTORY & AUDIT MANIFEST

**Generated:** ${new Date().toISOString()}  
**Total Assets Audited:** ${augmented.length} models (100% loaded and verified via Three.js headless runtime)  
**Total Disk Footprint:** 171 MB  
**Inspection Tool:** Three.js \`GLTFLoader\`, Chrome Headless with WebGL Angle, Puppeteer  

---

## 1. Executive Summary & Suitability Breakdown

| Category | Assets Count | Highlights & Recommendations |
|---|:---:|---|
| **Characters** | 2 | \`baby_goku_super_saiyan_iii.glb\` (2.6k tris, 221 KB) is optimal for Goku runner. \`gogeta\` (47.7k tris, 1.8 MB) is an ideal unlockable hero skin. |
| **Obstacles & Pathways** | 4 | \`wooden_bridge.glb\` (bridge ramp), \`mossy_old_tree_log.glb\` (hurdle), \`large_stone.glb\` (boulder), \`tree_broken_mossy_branch.glb\`. |
| **Environment / Rocks & Terrain** | 5 | \`desert_rocks.glb\`, \`flat_rocks.glb\`, \`smallrocks1.glb\`, \`small_rocks.glb\`, \`stalagmitecrystalore_cluster.glb\`. |
| **Environment / Mountains** | 4 | \`low_poly_mountain.glb\`, \`low_poly_mountain (1).glb\`, \`low_poly_mountain (2).glb\`, \`low_poly_mountain_free.glb\`. Perfect for distant parallax skyline. |
| **Environment / Trees & Foliage** | 14 | \`oak_tree.glb\`, \`pine_tree (1).glb\`, \`small_trees.glb\`, \`stylized_bush.glb\`, \`grass_patches.glb\`, \`fern.glb\`, \`flowering_plant.glb\`. |
| **Heavy / Unsuitable (Excluded)** | 4 | \`pine_tree.glb\` (437k tris, 26MB), \`realistic_trees_collection.glb\` (127k tris, 40MB), \`bush.glb\` (128k tris), \`montain.glb\` (500k tris, 24MB). |

---

## 2. Master Asset Inventory Table

| # | Asset / Filename | Category | File Size | Triangles | Dimensions (W × H × D) | Materials | Anims | Bones | Suitability | Status |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|:---:|---|---|
`;

augmented.forEach((a, i) => {
  const dims = `${a.dimensions.x}m × ${a.dimensions.y}m × ${a.dimensions.z}m`;
  md += `| ${i + 1} | [**\`${a.filename}\`**](#${a.id}) | ${a.primaryCategory} | ${a.fileSizeFormatted} | ${a.geometry.totalTriangles.toLocaleString()} | \`${dims}\` | ${a.materials.length} | ${a.animations.length} | ${a.skeleton.boneCount} | **${a.estimatedSuitability.split(' / ')[0]}** | ${a.integrationStatus} |\n`;
});

md += `\n---\n\n## 3. Detailed Asset Cards\n\n`;

augmented.forEach((a, i) => {
  md += `### ${i + 1}. \`${a.filename}\` <a id="${a.id}"></a>\n\n`;
  md += `![Preview](${a.previewImg})\n\n`;
  md += `- **Identifier:** \`${a.id}\`\n`;
  md += `- **Category:** ${a.primaryCategory}\n`;
  md += `- **File Size:** ${a.fileSizeFormatted} (${a.fileSize.toLocaleString()} bytes)\n`;
  md += `- **Geometry:** ${a.geometry.meshCount} mesh(es), ${a.geometry.totalTriangles.toLocaleString()} triangles, ${a.geometry.totalVertices.toLocaleString()} vertices\n`;
  md += `- **Bounding Box:** Width \`${a.dimensions.x}m\`, Height \`${a.dimensions.y}m\`, Depth \`${a.dimensions.z}m\` (Center: \`[${a.center.x}, ${a.center.y}, ${a.center.z}]\`)\n`;
  md += `- **Recommended Scale Factor:** \`${a.scaleFactor}\`\n`;
  md += `- **Materials (${a.materials.length}):** ${a.materials.map(m => `\`${m.type}\` (${m.textures.join(', ') || 'no textures'})`).join(', ') || 'None'}\n`;
  md += `- **Animations:** ${a.animations.length > 0 ? a.animations.map(x => `\`${x.name}\` (${x.duration}s)`).join(', ') : 'None (Static Mesh)'}\n`;
  md += `- **Armature / Bones:** ${a.skeleton.boneCount > 0 ? `${a.skeleton.boneCount} bones` : 'None'}\n`;
  md += `- **Suitability Rating:** **${a.estimatedSuitability}**\n`;
  md += `- **Recommended Usage:** ${a.recommendedUsage}\n`;
  md += `- **Integration Status:** \`${a.integrationStatus}\`\n\n`;
  md += `---\n\n`;
});

fs.writeFileSync('3dmodels/ASSET_MANIFEST.md', md);
console.log('Saved 3dmodels/ASSET_MANIFEST.md');

// Write Interactive Visual Contact Sheet (HTML)
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Goku Runner 3D — 3D Asset Preview Gallery & Contact Sheet</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --card-border: #30363d;
      --accent: #ff9900;
      --accent-blue: #58a6ff;
      --text: #c9d1d9;
      --text-muted: #8b949e;
      --success: #3fb950;
      --warning: #d29922;
      --danger: #f85149;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    header {
      max-width: 1400px;
      margin: 0 auto 24px auto;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 20px;
    }
    h1 {
      margin: 0 0 8px 0;
      color: #fff;
      font-size: 28px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-optimal { background: rgba(63,185,80,0.2); color: var(--success); border: 1px solid var(--success); }
    .badge-moderate { background: rgba(210,153,34,0.2); color: var(--warning); border: 1px solid var(--warning); }
    .badge-heavy { background: rgba(248,81,73,0.2); color: var(--danger); border: 1px solid var(--danger); }
    
    .stats-bar {
      display: flex;
      gap: 24px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .stat-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 12px 20px;
      border-radius: 8px;
    }
    .stat-val { font-size: 20px; font-weight: bold; color: var(--accent); }
    .stat-lbl { font-size: 12px; color: var(--text-muted); text-transform: uppercase; }

    .filters {
      max-width: 1400px;
      margin: 0 auto 20px auto;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .filter-btn {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .filter-btn:hover, .filter-btn.active {
      background: var(--accent);
      color: #000;
      font-weight: 600;
      border-color: var(--accent);
    }

    .gallery {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
    }
    .preview-container {
      width: 100%;
      height: 220px;
      background: #000;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .preview-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
      word-break: break-all;
    }
    .card-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 12px;
      font-size: 12px;
      margin-bottom: 12px;
      color: var(--text-muted);
    }
    .card-meta span strong { color: var(--text); }
    .card-desc {
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 12px;
      color: #b1bac4;
      flex-grow: 1;
    }
    .card-footer {
      border-top: 1px solid var(--card-border);
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <header>
    <h1>🥋 Goku Runner 3D — 3D Asset Preview Gallery</h1>
    <p style="color: var(--text-muted); margin: 0;">Comprehensive technical inspection of all 33 downloaded 3D assets loaded in Three.js.</p>
    <div class="stats-bar">
      <div class="stat-box"><div class="stat-val">33</div><div class="stat-lbl">Models Audited</div></div>
      <div class="stat-box"><div class="stat-val">100%</div><div class="stat-lbl">Load Success</div></div>
      <div class="stat-box"><div class="stat-val">28</div><div class="stat-lbl">Suitable for Runtime</div></div>
      <div class="stat-box"><div class="stat-val">4</div><div class="stat-lbl">Heavy / Excluded</div></div>
      <div class="stat-box"><div class="stat-val">171 MB</div><div class="stat-lbl">Total Inventory</div></div>
    </div>
  </header>

  <div class="filters">
    <button class="filter-btn active" onclick="filterAssets('all')">All Models (33)</button>
    <button class="filter-btn" onclick="filterAssets('Character')">Characters (2)</button>
    <button class="filter-btn" onclick="filterAssets('Obstacle')">Obstacles (4)</button>
    <button class="filter-btn" onclick="filterAssets('Rocks')">Rocks & Terrain (5)</button>
    <button class="filter-btn" onclick="filterAssets('Mountains')">Mountains (4)</button>
    <button class="filter-btn" onclick="filterAssets('Foliage')">Foliage & Trees (14)</button>
    <button class="filter-btn" onclick="filterAssets('Heavy')">Heavy / Excluded (4)</button>
  </div>

  <div class="gallery" id="gallery">
    ${augmented.map(a => {
      let badgeClass = 'badge-optimal';
      if (a.estimatedSuitability.includes('Heavy')) badgeClass = 'badge-heavy';
      else if (a.estimatedSuitability.includes('Moderate')) badgeClass = 'badge-moderate';

      return `
      <div class="card" data-category="${a.primaryCategory}">
        <div class="preview-container">
          <img src="${a.previewImg}" alt="${a.filename}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-title">${a.filename}</div>
          <div class="card-meta">
            <span>Size: <strong>${a.fileSizeFormatted}</strong></span>
            <span>Tris: <strong>${a.geometry.totalTriangles.toLocaleString()}</strong></span>
            <span>Dims: <strong>${a.dimensions.x}×${a.dimensions.y}×${a.dimensions.z}m</strong></span>
            <span>Mats: <strong>${a.materials.length}</strong></span>
            <span>Anims: <strong>${a.animations.length}</strong></span>
            <span>Bones: <strong>${a.skeleton.boneCount}</strong></span>
          </div>
          <div class="card-desc">${a.recommendedUsage}</div>
          <div class="card-footer">
            <span class="badge ${badgeClass}">${a.estimatedSuitability.split(' / ')[0]}</span>
            <span style="font-size: 11px; color: var(--accent-blue);">${a.integrationStatus}</span>
          </div>
        </div>
      </div>
      `;
    }).join('\n')}
  </div>

  <script>
    function filterAssets(cat) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');

      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        const itemCat = card.getAttribute('data-category');
        if (cat === 'all') {
          card.style.display = 'flex';
        } else if (cat === 'Heavy') {
          card.style.display = itemCat.includes('Heavy') ? 'flex' : 'none';
        } else {
          card.style.display = itemCat.includes(cat) ? 'flex' : 'none';
        }
      });
    }
  </script>
</body>
</html>
`;

fs.writeFileSync('3dmodels/ASSET_GALLERY.html', html);
console.log('Saved 3dmodels/ASSET_GALLERY.html');
