import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const MODELS = [
  {
    id: 'baby_goku_super_saiyan_iii',
    filename: 'baby_goku_super_saiyan_iii.glb',
    relPath: '3dmodels/baby_goku_super_saiyan_iii.glb',
    url: '/3dmodels/baby_goku_super_saiyan_iii.glb',
    expectedCategory: 'Character'
  },
  {
    id: 'bush',
    filename: 'bush.glb',
    relPath: '3dmodels/bush.glb',
    url: '/3dmodels/bush.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'dead_trees',
    filename: 'dead_trees.glb',
    relPath: '3dmodels/dead_trees.glb',
    url: '/3dmodels/dead_trees.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'desert_rocks',
    filename: 'desert_rocks.glb',
    relPath: '3dmodels/desert_rocks.glb',
    url: '/3dmodels/desert_rocks.glb',
    expectedCategory: 'Environment / Rocks'
  },
  {
    id: 'fallen_tree',
    filename: 'fallen_tree.glb',
    relPath: '3dmodels/fallen_tree.glb',
    url: '/3dmodels/fallen_tree.glb',
    expectedCategory: 'Obstacle / Environment'
  },
  {
    id: 'fern',
    filename: 'fern.glb',
    relPath: '3dmodels/fern.glb',
    url: '/3dmodels/fern.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'flat_rocks',
    filename: 'flat_rocks.glb',
    relPath: '3dmodels/flat_rocks.glb',
    url: '/3dmodels/flat_rocks.glb',
    expectedCategory: 'Environment / Rocks'
  },
  {
    id: 'flowering_plant',
    filename: 'flowering_plant.glb',
    relPath: '3dmodels/flowering_plant.glb',
    url: '/3dmodels/flowering_plant.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'grass',
    filename: 'grass.glb',
    relPath: '3dmodels/grass.glb',
    url: '/3dmodels/grass.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'grass_patch',
    filename: 'grass_patch.glb',
    relPath: '3dmodels/grass_patch.glb',
    url: '/3dmodels/grass_patch.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'grass_patches',
    filename: 'grass_patches.glb',
    relPath: '3dmodels/grass_patches.glb',
    url: '/3dmodels/grass_patches.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'large_stone',
    filename: 'large_stone.glb',
    relPath: '3dmodels/large_stone.glb',
    url: '/3dmodels/large_stone.glb',
    expectedCategory: 'Obstacle / Environment'
  },
  {
    id: 'low_poly_mountain_1',
    filename: 'low_poly_mountain (1).glb',
    relPath: '3dmodels/low_poly_mountain (1).glb',
    url: '/3dmodels/low_poly_mountain%20(1).glb',
    expectedCategory: 'Environment / Scenery'
  },
  {
    id: 'low_poly_mountain_2',
    filename: 'low_poly_mountain (2).glb',
    relPath: '3dmodels/low_poly_mountain (2).glb',
    url: '/3dmodels/low_poly_mountain%20(2).glb',
    expectedCategory: 'Environment / Scenery'
  },
  {
    id: 'low_poly_mountain',
    filename: 'low_poly_mountain.glb',
    relPath: '3dmodels/low_poly_mountain.glb',
    url: '/3dmodels/low_poly_mountain.glb',
    expectedCategory: 'Environment / Scenery'
  },
  {
    id: 'low_poly_mountain_free',
    filename: 'low_poly_mountain_free.glb',
    relPath: '3dmodels/low_poly_mountain_free.glb',
    url: '/3dmodels/low_poly_mountain_free.glb',
    expectedCategory: 'Environment / Scenery'
  },
  {
    id: 'mossy_old_tree_log',
    filename: 'mossy_old_tree_log.glb',
    relPath: '3dmodels/mossy_old_tree_log.glb',
    url: '/3dmodels/mossy_old_tree_log.glb',
    expectedCategory: 'Obstacle / Environment'
  },
  {
    id: 'oak_tree',
    filename: 'oak_tree.glb',
    relPath: '3dmodels/oak_tree.glb',
    url: '/3dmodels/oak_tree.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'pine_tree_1',
    filename: 'pine_tree (1).glb',
    relPath: '3dmodels/pine_tree (1).glb',
    url: '/3dmodels/pine_tree%20(1).glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'pine_tree',
    filename: 'pine_tree.glb',
    relPath: '3dmodels/pine_tree.glb',
    url: '/3dmodels/pine_tree.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'realistics_grass_07',
    filename: 'realistics_grass_07.glb',
    relPath: '3dmodels/realistics_grass_07.glb',
    url: '/3dmodels/realistics_grass_07.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'realistic_trees_collection',
    filename: 'realistic_trees_collection.glb',
    relPath: '3dmodels/realistic_trees_collection.glb',
    url: '/3dmodels/realistic_trees_collection.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'rocks_and_trees',
    filename: 'rocks_and_trees.glb',
    relPath: '3dmodels/rocks_and_trees.glb',
    url: '/3dmodels/rocks_and_trees.glb',
    expectedCategory: 'Environment / Scenery'
  },
  {
    id: 'smallrocks1',
    filename: 'smallrocks1.glb',
    relPath: '3dmodels/smallrocks1.glb',
    url: '/3dmodels/smallrocks1.glb',
    expectedCategory: 'Environment / Rocks'
  },
  {
    id: 'small_folliage_plant',
    filename: 'small_folliage_plant.glb',
    relPath: '3dmodels/small_folliage_plant.glb',
    url: '/3dmodels/small_folliage_plant.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'small_rocks',
    filename: 'small_rocks.glb',
    relPath: '3dmodels/small_rocks.glb',
    url: '/3dmodels/small_rocks.glb',
    expectedCategory: 'Environment / Rocks'
  },
  {
    id: 'small_trees',
    filename: 'small_trees.glb',
    relPath: '3dmodels/small_trees.glb',
    url: '/3dmodels/small_trees.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'stalagmitecrystalore_cluster',
    filename: 'stalagmitecrystalore_cluster_-_meshy.glb',
    relPath: '3dmodels/stalagmitecrystalore_cluster_-_meshy.glb',
    url: '/3dmodels/stalagmitecrystalore_cluster_-_meshy.glb',
    expectedCategory: 'Environment / Collectible / Obstacle'
  },
  {
    id: 'stylized_bush',
    filename: 'stylized_bush.glb',
    relPath: '3dmodels/stylized_bush.glb',
    url: '/3dmodels/stylized_bush.glb',
    expectedCategory: 'Environment / Foliage'
  },
  {
    id: 'tree_broken_mossy_branch',
    filename: 'tree_broken_mossy_branch_pbr_photogrammetry_free.glb',
    relPath: '3dmodels/tree_broken_mossy_branch_pbr_photogrammetry_free.glb',
    url: '/3dmodels/tree_broken_mossy_branch_pbr_photogrammetry_free.glb',
    expectedCategory: 'Obstacle / Environment'
  },
  {
    id: 'wooden_bridge',
    filename: 'wooden_bridge.glb',
    relPath: '3dmodels/wooden_bridge.glb',
    url: '/3dmodels/wooden_bridge.glb',
    expectedCategory: 'Obstacle / Pathway'
  },
  {
    id: 'gogeta_character',
    filename: 'extracted_gogeta/source/a931b105-49c4-43f6-9362-51f3478d2624.glb',
    relPath: '3dmodels/extracted_gogeta/source/a931b105-49c4-43f6-9362-51f3478d2624.glb',
    url: '/3dmodels/extracted_gogeta/source/a931b105-49c4-43f6-9362-51f3478d2624.glb',
    expectedCategory: 'Character (Gogeta)'
  },
  {
    id: 'stylized_mountain_extracted',
    filename: 'extracted_stylized_mountain/source/montain.glb',
    relPath: '3dmodels/extracted_stylized_mountain/source/montain.glb',
    url: '/3dmodels/extracted_stylized_mountain/source/montain.glb',
    expectedCategory: 'Environment / Scenery'
  }
];

async function run() {
  console.log(`Starting Inspection for ${MODELS.length} 3D assets...`);

  const server = await createServer({
    server: { port: 5180 }
  });
  await server.listen();
  console.log('Vite server running on http://localhost:5180');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--enable-webgl',
      '--window-size=1000,800'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Browser error:', msg.text());
  });

  await page.goto('http://localhost:5180/inspect_runner.html', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__INSPECTOR_READY__ === true);
  console.log('Inspector loaded successfully in headless browser.');

  const results = [];
  const previewsDir = path.resolve('3dmodels/previews');
  if (!fs.existsSync(previewsDir)) {
    fs.mkdirSync(previewsDir, { recursive: true });
  }

  for (let i = 0; i < MODELS.length; i++) {
    const item = MODELS[i];
    console.log(`[${i + 1}/${MODELS.length}] Inspecting ${item.filename}...`);

    const stat = fs.statSync(item.relPath);
    const sizeKB = Math.round(stat.size / 1024);
    const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

    const inspectData = await page.evaluate(async (url) => {
      return await window.inspectModel(url);
    }, item.url);

    // Wait a brief moment for render buffer to settle
    await new Promise(r => setTimeout(r, 200));

    // Screenshot
    const screenshotPath = path.join(previewsDir, `${item.id}.png`);
    const canvasHandle = await page.$('#viewport');
    await canvasHandle.screenshot({ path: screenshotPath });

    const combined = {
      ...item,
      fileSize: stat.size,
      fileSizeFormatted: stat.size > 1048576 ? `${sizeMB} MB` : `${sizeKB} KB`,
      previewImg: `previews/${item.id}.png`,
      ...inspectData
    };

    // Calculate suitability
    let suitability = 'Optimal';
    let recommendations = [];

    if (!inspectData.success) {
      suitability = 'Broken / Failed to Load';
      recommendations.push(`Error: ${inspectData.error}`);
    } else {
      const tris = inspectData.geometry.totalTriangles;
      const sizeBytes = stat.size;

      if (sizeBytes > 20 * 1024 * 1024) {
        suitability = 'Heavy / Unsuitable without Decimation';
        recommendations.push('File size >20MB; will cause massive memory consumption and network delay.');
      } else if (sizeBytes > 8 * 1024 * 1024 || tris > 100000) {
        suitability = 'Heavy (Needs Optimization)';
        recommendations.push('High polycount or textures (>100k tris or >8MB). Requires decimation or LOD.');
      } else if (tris > 35000) {
        suitability = 'Moderate / Acceptable';
        recommendations.push('Acceptable for hero props or background, but avoid dense instancing.');
      } else {
        suitability = 'Optimal / Highly Suitable';
        recommendations.push('Lightweight, fast loading, ideal for Three.js real-time browser rendering.');
      }

      // Check animations & character
      if (item.expectedCategory.includes('Character')) {
        if (inspectData.animations.length > 0) {
          recommendations.push(`Contains ${inspectData.animations.length} animation clip(s): ${inspectData.animations.map(a => a.name).join(', ')}.`);
        } else {
          recommendations.push('Static mesh / No built-in GLTF animations (needs procedural animation or external rigging).');
        }
      }
    }

    combined.estimatedSuitability = suitability;
    combined.recommendations = recommendations;

    results.push(combined);
    console.log(`   -> Tris: ${inspectData.geometry?.totalTriangles || 0}, Size: ${combined.fileSizeFormatted}, Suitability: ${suitability}`);
  }

  // Save JSON
  fs.writeFileSync('3dmodels/inspection_results.json', JSON.stringify(results, null, 2));
  console.log('Saved 3dmodels/inspection_results.json');

  await browser.close();
  await server.close();
  console.log('All inspections complete.');
}

run().catch(err => {
  console.error('Fatal error in inspection:', err);
  process.exit(1);
});
