import * as THREE from 'three';
import type { IHangarSceneEntity } from '../controllers/LaunchSequenceController';

/** Procedurally builds and animates the hangar scene, and owns its Three.js resources. */
export class CloneWarsHangar3D implements IHangarSceneEntity {
  public mesh: THREE.Group;
  public landingPad: THREE.Group;

  // Hermetic lifecycle tracking
  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private textures: THREE.Texture[] = [];
  private forceField: THREE.Mesh | null = null;
  private beaconLights: THREE.Mesh[] = [];

  // Particle systems
  private sparkParticles: THREE.Points | null = null;
  private sparkPositions: Float32Array | null = null;
  private sparkVelocities: { x: number; y: number; z: number; life: number; maxLife: number }[] = [];
  private dustParticles: THREE.Points | null = null;
  private astromechHead: THREE.Group | null = null;
  private holoPlanet: THREE.Group | null = null;
  private deckCrewOfficers: { group: THREE.Group; head: THREE.Mesh; seed: number }[] = [];
  private deckCrewTechs: { group: THREE.Group; arm: THREE.Mesh; seed: number }[] = [];
  private serviceDrones: {
    group: THREE.Group;
    ring: THREE.Mesh;
    basePos: THREE.Vector3;
    orbitRadius: number;
    speed: number;
    seed: number;
  }[] = [];

  // Animation & Gate state
  private elapsedTime: number = 0;
  private isGateOpen: boolean = false;
  private gateProgress: number = 0;
  private nextSparkTime: number = 0.5;
  private disposed = false;

  // Dimensional specs
  public readonly radius = 30;
  public readonly height = 16;
  public readonly runwayLength = 52;

  constructor() {
    this.mesh = new THREE.Group();
    this.landingPad = new THREE.Group();
    this.buildMonumentalHangar();
  }

  private trackMaterial<T extends THREE.Material>(mat: T): T {
    this.materials.push(mat);
    return mat;
  }

  private trackGeometry<T extends THREE.BufferGeometry>(geo: T): T {
    this.geometries.push(geo);
    return geo;
  }

  private trackTexture<T extends THREE.Texture>(tex: T): T {
    this.textures.push(tex);
    return tex;
  }

  // --- PROCEDURAL TEXTURE GENERATION ---

  private generateDeckPlateTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // Ultra-smooth brushed dark titanium alloy gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 2048, 2048);
    bgGrad.addColorStop(0, '#0c1322');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#0a0f1d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 2048);

    // Large architectural plate subdivisions (512x512) with anti-aliased bevels
    const plateSize = 512;
    for (let x = 0; x < 2048; x += plateSize) {
      for (let y = 0; y < 2048; y += plateSize) {
        // Soft interior plate tone with subtle center highlight
        const plateGrad = ctx.createRadialGradient(
          x + plateSize / 2, y + plateSize / 2, 20,
          x + plateSize / 2, y + plateSize / 2, plateSize / 1.4
        );
        plateGrad.addColorStop(0, '#162238');
        plateGrad.addColorStop(1, '#111a2d');
        ctx.fillStyle = plateGrad;
        ctx.fillRect(x + 6, y + 6, plateSize - 12, plateSize - 12);

        // Smooth recessed expansion groove
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 6;
        ctx.strokeRect(x + 3, y + 3, plateSize - 6, plateSize - 6);

        // Soft chamfer bevel highlight
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 8, y + 8, plateSize - 16, plateSize - 16);

        // Precision countersunk titanium fasteners with subtle shadow and specular dot
        const rivetOffsets = [36, plateSize - 36];
        for (const rx of rivetOffsets) {
          for (const ry of rivetOffsets) {
            // Recessed socket shadow
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.arc(x + rx, y + ry, 6.0, 0, Math.PI * 2);
            ctx.fill();

            // Titanium bolt head
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.arc(x + rx - 0.5, y + ry - 0.5, 4.0, 0, Math.PI * 2);
            ctx.fill();

            // Specular dot
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(x + rx - 1.5, y + ry - 1.5, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    const texture = this.trackTexture(new THREE.CanvasTexture(canvas));
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.generateMipmaps = true;
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private generateRunwayTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // Dark graphite aerospace composite base
    ctx.fillStyle = '#0c1322';
    ctx.fillRect(0, 0, 2048, 2048);

    // Central dark technical runway corridor with smooth gradient
    const corridorGrad = ctx.createLinearGradient(160, 0, 1888, 0);
    corridorGrad.addColorStop(0, '#151f33');
    corridorGrad.addColorStop(0.5, '#1e293b');
    corridorGrad.addColorStop(1, '#151f33');
    ctx.fillStyle = corridorGrad;
    ctx.fillRect(160, 0, 1728, 2048);

    // Anti-aliased hazard borders on left and right
    const drawHazardStrip = (startX: number) => {
      const stripeWidth = 64;
      for (let y = -stripeWidth * 2; y < 2048 + stripeWidth * 2; y += stripeWidth * 2) {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + 120, y + 120);
        ctx.lineTo(startX + 120, y + 120 + stripeWidth);
        ctx.lineTo(startX, y + stripeWidth);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.moveTo(startX, y + stripeWidth);
        ctx.lineTo(startX + 120, y + 120 + stripeWidth);
        ctx.lineTo(startX + 120, y + 120 + stripeWidth * 2);
        ctx.lineTo(startX, y + stripeWidth * 2);
        ctx.closePath();
        ctx.fill();
      }
    };
    drawHazardStrip(40);
    drawHazardStrip(1888);

    // Central illuminated cyan guide lines with soft glow
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(1024, 0);
    ctx.lineTo(1024, 2048);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Guidance chevrons pointing toward launch exit
    ctx.fillStyle = '#38bdf8';
    for (let cy = 240; cy < 2048; cy += 480) {
      ctx.beginPath();
      ctx.moveTo(1024, cy - 90);
      ctx.lineTo(1140, cy + 40);
      ctx.lineTo(1088, cy + 40);
      ctx.lineTo(1024, cy - 30);
      ctx.lineTo(960, cy + 40);
      ctx.lineTo(908, cy + 40);
      ctx.closePath();
      ctx.fill();
    }

    // High-tech aerospace vector typography
    ctx.font = 'bold 64px "Orbitron", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText('BAY 09 // LAUNCH VECTOR', 1024, 1040);

    const texture = this.trackTexture(new THREE.CanvasTexture(canvas));
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 2);
    texture.generateMipmaps = true;
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private generateWallArmorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 2048, 1024);

    // Corrugated architectural armor ribs with smooth shading
    for (let x = 0; x < 2048; x += 256) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, 0, 40, 1024);

      const ribGrad = ctx.createLinearGradient(x + 40, 0, x + 216, 0);
      ribGrad.addColorStop(0, '#1e293b');
      ribGrad.addColorStop(0.5, '#334155');
      ribGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = ribGrad;
      ctx.fillRect(x + 40, 0, 176, 1024);

      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 216, 0, 20, 1024);
    }

    // Horizontal reinforced blast seams
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 240, 2048, 32);
    ctx.fillRect(0, 720, 2048, 32);

    const texture = this.trackTexture(new THREE.CanvasTexture(canvas));
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 2);
    texture.generateMipmaps = true;
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  // --- HANGAR ARCHITECTURAL BUILD ---

  private buildMonumentalHangar(): void {
    const deckTexture = this.generateDeckPlateTexture();
    const runwayTexture = this.generateRunwayTexture();
    const wallTexture = this.generateWallArmorTexture();

    // 1. Realistic Materials Palette (PBR Standard & Physical)
    const deckMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: deckTexture,
        roughness: 0.28,
        metalness: 0.82,
        envMapIntensity: 1.2,
      })
    );

    const runwayMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: runwayTexture,
        roughness: 0.30,
        metalness: 0.72,
        envMapIntensity: 1.1,
      })
    );

    const wallMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.32,
        metalness: 0.78,
        envMapIntensity: 1.0,
      })
    );

    const archSteelMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.90,
        roughness: 0.20,
        envMapIntensity: 1.3,
      })
    );

    const republicRedMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        metalness: 0.35,
        roughness: 0.28,
        envMapIntensity: 1.2,
      })
    );

    const republicWhiteMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.30,
        roughness: 0.25,
        envMapIntensity: 1.2,
      })
    );

    const darkSteelMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.88,
        roughness: 0.22,
        envMapIntensity: 1.2,
      })
    );

    const chromeMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.98,
        roughness: 0.08,
        envMapIntensity: 1.5,
      })
    );

    const amberBeaconMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
      })
    );

    const cyanGlowMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
      })
    );

    // 2. Base Floor Deck Plate
    const floorGeo = this.trackGeometry(new THREE.CylinderGeometry(this.radius, this.radius, 0.8, 64));
    const floor = new THREE.Mesh(floorGeo, deckMat);
    floor.position.y = -0.4;
    floor.receiveShadow = true;
    this.mesh.add(floor);

    // 3. Central Illuminated Runway
    const runwayGeo = this.trackGeometry(new THREE.BoxGeometry(11, 0.08, this.runwayLength));
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.position.set(0, 0.04, 2);
    runway.receiveShadow = true;
    this.mesh.add(runway);

    // Runway Stanchions with Glowing Beacons
    const stanchionPoleGeo = this.trackGeometry(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 8));
    const stanchionBulbGeo = this.trackGeometry(new THREE.SphereGeometry(0.14, 12, 8));
    for (let z = -18; z <= 22; z += 5) {
      [-5.8, 5.8].forEach((xPos) => {
        const pole = new THREE.Mesh(stanchionPoleGeo, archSteelMat);
        pole.position.set(xPos, 0.225, z);
        this.mesh.add(pole);

        const bulb = new THREE.Mesh(stanchionBulbGeo, amberBeaconMat);
        bulb.position.set(xPos, 0.48, z);
        this.mesh.add(bulb);
        this.beaconLights.push(bulb);
      });
    }

    // 4. Vaulted Perimeter Walls & Dome
    const wallGeo = this.trackGeometry(new THREE.CylinderGeometry(this.radius, this.radius, this.height, 48, 1, true));
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = this.height / 2;
    this.mesh.add(wall);

    const domeRoofGeo = this.trackGeometry(
      new THREE.SphereGeometry(this.radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.7)
    );
    const domeRoof = new THREE.Mesh(domeRoofGeo, darkSteelMat);
    domeRoof.position.y = 4.5;
    domeRoof.scale.set(1.0, 0.46, 1.0);
    this.mesh.add(domeRoof);

    // 5. Heavy Radial Arch Ribs (Cathedral Vaulting)
    const numRibs = 12;
    const ribGeo = this.trackGeometry(new THREE.BoxGeometry(0.9, 1.2, this.radius * 0.92));
    for (let i = 0; i < numRibs; i++) {
      const angle = (i / numRibs) * Math.PI * 2;
      const rib = new THREE.Mesh(ribGeo, archSteelMat);
      rib.position.set(
        Math.sin(angle) * (this.radius * 0.46),
        this.height - 1.5,
        Math.cos(angle) * (this.radius * 0.46)
      );
      rib.rotation.y = angle;
      rib.rotation.x = 0.12;
      this.mesh.add(rib);

      // Fluorescent cyan neon strip along rib undersides
      const neonGeo = this.trackGeometry(new THREE.BoxGeometry(0.12, 0.08, this.radius * 0.8));
      const neon = new THREE.Mesh(neonGeo, cyanGlowMat);
      neon.position.set(
        Math.sin(angle) * (this.radius * 0.44),
        this.height - 2.1,
        Math.cos(angle) * (this.radius * 0.44)
      );
      neon.rotation.y = angle;
      neon.rotation.x = 0.12;
      this.mesh.add(neon);
    }

    // 6. Suspended Central Saucer Chandelier (Theatrical Lighting Focal Point)
    this.buildSaucerChandelier(archSteelMat, darkSteelMat, amberBeaconMat);

    // 7. Heavy Armored Landing Pad (Ventral Thruster Pit & Hydraulic Stanchions)
    this.buildLandingPad(archSteelMat, chromeMat, cyanGlowMat);

    // 8. Docked Republic LAAT Gunships & Equipment
    this.buildBackgroundDockingBays(republicWhiteMat, republicRedMat, darkSteelMat, archSteelMat, amberBeaconMat, cyanGlowMat);

    // 9. Particle Systems (Welding Sparks & Atmospheric Dust Motes)
    this.buildParticleSystems();

    // 10. Hangar Gate Force Field
    this.buildExitForceField();

    // 11. Theatrical Fill Lights
    this.setupTheatricalLighting();

    // 12. Soft Contact Shadows setup across monumental hangar bay
    this.mesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.receiveShadow = true;
        // Only solid physical meshes cast shadows; skip volumetric beams and forcefields
        if (
          obj !== this.forceField &&
          !(obj.material instanceof THREE.MeshBasicMaterial)
        ) {
          obj.castShadow = true;
        }
      }
    });

    this.landingPad.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.receiveShadow = true;
        if (!(obj.material instanceof THREE.MeshBasicMaterial)) {
          obj.castShadow = true;
        }
      }
    });
  }

  private buildSaucerChandelier(archMat: THREE.Material, darkMat: THREE.Material, amberMat: THREE.Material): void {
    const saucerGroup = new THREE.Group();
    saucerGroup.position.set(0, this.height - 3.4, 0);

    // Tiered main body
    const saucerGeo = this.trackGeometry(new THREE.CylinderGeometry(7.0, 5.0, 1.6, 40));
    const saucerMesh = new THREE.Mesh(saucerGeo, archMat);
    saucerGroup.add(saucerMesh);

    // Top flange rim
    const topRimGeo = this.trackGeometry(new THREE.CylinderGeometry(8.2, 7.0, 0.4, 40));
    const topRim = new THREE.Mesh(topRimGeo, darkMat);
    topRim.position.y = 0.9;
    saucerGroup.add(topRim);

    // Suspended maintenance catwalk railing around chandelier
    const railGeo = this.trackGeometry(new THREE.TorusGeometry(7.6, 0.06, 8, 36));
    railGeo.rotateX(Math.PI / 2);
    const rail = new THREE.Mesh(railGeo, archMat);
    rail.position.y = 1.3;
    saucerGroup.add(rail);

    // Recessed downward core
    const coreGeo = this.trackGeometry(new THREE.CylinderGeometry(4.2, 3.4, 0.8, 32));
    const core = new THREE.Mesh(coreGeo, darkMat);
    core.position.y = -1.0;
    saucerGroup.add(core);

    // Amber perimeter beacons
    const bulbGeo = this.trackGeometry(new THREE.SphereGeometry(0.2, 12, 8));
    for (let j = 0; j < 16; j++) {
      const a = (j / 16) * Math.PI * 2;
      const b = new THREE.Mesh(bulbGeo, amberMat);
      b.position.set(Math.sin(a) * 7.2, 0.2, Math.cos(a) * 7.2);
      saucerGroup.add(b);
      this.beaconLights.push(b);
    }

    // Heavy suspension cables connecting to dome
    const cableGeo = this.trackGeometry(new THREE.CylinderGeometry(0.12, 0.12, 4.8, 8));
    for (let k = 0; k < 4; k++) {
      const ca = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const cable = new THREE.Mesh(cableGeo, darkMat);
      cable.position.set(Math.sin(ca) * 4.2, 2.8, Math.cos(ca) * 4.2);
      saucerGroup.add(cable);
    }

    // Clean architectural chandelier base without artificial volumetric cones
    this.mesh.add(saucerGroup);
  }

  private buildLandingPad(
    archMat: THREE.Material,
    chromeMat: THREE.Material,
    cyanMat: THREE.Material
  ): void {
    // Octagonal tiered pad base
    const padBaseGeo = this.trackGeometry(new THREE.CylinderGeometry(5.2, 5.6, 0.45, 8));
    const padBase = new THREE.Mesh(padBaseGeo, archMat);
    padBase.position.y = 0.225;
    padBase.receiveShadow = true;
    this.landingPad.add(padBase);

    // Clean dark titanium beveled border ring (no yellow hazard stripes)
    const hazardRingGeo = this.trackGeometry(new THREE.CylinderGeometry(5.4, 5.55, 0.15, 8));
    const hazardRing = new THREE.Mesh(hazardRingGeo, archMat);
    hazardRing.position.y = 0.38;
    this.landingPad.add(hazardRing);

    // 4 Heavy Hydraulic Riser Pistons underneath
    const pistonShaftGeo = this.trackGeometry(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12));
    const pistonBracketGeo = this.trackGeometry(new THREE.BoxGeometry(0.6, 0.2, 0.6));
    for (let p = 0; p < 4; p++) {
      const pa = (p / 4) * Math.PI * 2;
      const px = Math.sin(pa) * 4.2;
      const pz = Math.cos(pa) * 4.2;

      const piston = new THREE.Mesh(pistonShaftGeo, chromeMat);
      piston.position.set(px, 0.15, pz);
      this.landingPad.add(piston);

      const bracket = new THREE.Mesh(pistonBracketGeo, archMat);
      bracket.position.set(px, 0.05, pz);
      this.landingPad.add(bracket);
    }

    // 4 Articulated Magnetic Clamps around perimeter
    const clampArmGeo = this.trackGeometry(new THREE.BoxGeometry(0.4, 0.6, 0.8));
    for (let c = 0; c < 4; c++) {
      const ca = (c / 4) * Math.PI * 2 + Math.PI / 4;
      const clamp = new THREE.Mesh(clampArmGeo, archMat);
      clamp.position.set(Math.sin(ca) * 5.0, 0.45, Math.cos(ca) * 5.0);
      clamp.rotation.y = ca;
      this.landingPad.add(clamp);

      // Cyan clamp status beacon (replaces distracting amber)
      const cBeacon = new THREE.Mesh(this.trackGeometry(new THREE.SphereGeometry(0.1, 8, 8)), cyanMat);
      cBeacon.position.set(Math.sin(ca) * 5.1, 0.8, Math.cos(ca) * 5.1);
      this.landingPad.add(cBeacon);
      this.beaconLights.push(cBeacon);
    }

    // Glowing Concentric Cyan Magnetic Levitation Rings
    const ring1Geo = this.trackGeometry(new THREE.RingGeometry(4.2, 4.45, 36));
    ring1Geo.rotateX(-Math.PI / 2);
    const ring1 = new THREE.Mesh(ring1Geo, cyanMat);
    ring1.position.y = 0.46;
    this.landingPad.add(ring1);

    const ring2Geo = this.trackGeometry(new THREE.RingGeometry(2.4, 2.65, 36));
    ring2Geo.rotateX(-Math.PI / 2);
    const ring2 = new THREE.Mesh(ring2Geo, cyanMat);
    ring2.position.y = 0.46;
    this.landingPad.add(ring2);

    // Clean center landing surface without yellow cross lines
    this.mesh.add(this.landingPad);
  }

  private buildBackgroundDockingBays(
    whiteMat: THREE.Material,
    redMat: THREE.Material,
    darkMat: THREE.Material,
    archMat: THREE.Material,
    amberMat: THREE.Material,
    cyanMat: THREE.Material
  ): void {
    // 1. Port Bay Republic Gunship (LAAT Transport)
    const portGunship = this.createDetailedGunship(whiteMat, redMat, darkMat, amberMat);
    portGunship.position.set(-15.5, 0.0, -3.5);
    portGunship.rotation.y = Math.PI * 0.32;
    this.mesh.add(portGunship);

    // 2. Starboard Bay Republic Gunship
    const stbGunship = this.createDetailedGunship(whiteMat, redMat, darkMat, amberMat);
    stbGunship.position.set(16.0, 0.0, 5.5);
    stbGunship.rotation.y = -Math.PI * 0.62;
    this.mesh.add(stbGunship);

    // 3. Curved Docking Bay Balustrades
    const rail1 = this.createCurvedGantry(12, 5.0, archMat);
    rail1.position.set(15.0, 0, 5.0);
    rail1.rotation.y = -Math.PI * 0.5;
    this.mesh.add(rail1);

    const rail2 = this.createCurvedGantry(12, 5.0, archMat);
    rail2.position.set(-15.0, 0, -3.0);
    rail2.rotation.y = Math.PI * 0.4;
    this.mesh.add(rail2);

    // 4. Astromech Droid (R2 Unit) near Starboard Bay
    this.astromechHead = this.createAstromechDroid(archMat, cyanMat);
    this.astromechHead.position.set(8.5, 0, 7.5);
    this.mesh.add(this.astromechHead);

    // 5. Tactical Hologram Display Table (Command Alcove)
    this.holoPlanet = this.createHoloTable(archMat, cyanMat);
    this.holoPlanet.position.set(-9.5, 0, 9.0);
    this.mesh.add(this.holoPlanet);

    // 6. Staged Military Cargo Clusters
    this.createCargoCluster(new THREE.Vector3(-11.5, 0, -9.5), darkMat, archMat, amberMat);
    this.createCargoCluster(new THREE.Vector3(12.0, 0, 11.5), darkMat, archMat, amberMat);

    // 7. Cloaked Officers and Technicians
    const cloakMat = this.trackMaterial(new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 }));
    this.createCloakedOfficer(new THREE.Vector3(-2.2, 0, 8.2), cloakMat);
    this.createCloakedOfficer(new THREE.Vector3(1.6, 0, 9.8), cloakMat);
    this.createDeckCrewTechnician(new THREE.Vector3(-12.0, 0, -2.0), archMat);
    this.createDeckCrewTechnician(new THREE.Vector3(12.5, 0, 3.0), archMat);

    // 8. Rotating Repulsorlift Service Drones patrolling the hangar
    this.createServiceDrone(new THREE.Vector3(-8.0, 3.2, -6.0), 2.2, 0.45, archMat, cyanMat);
    this.createServiceDrone(new THREE.Vector3(9.5, 2.8, 4.0), 3.0, -0.38, archMat, cyanMat);
    this.createServiceDrone(new THREE.Vector3(0.0, 4.0, 15.0), 2.4, 0.55, archMat, cyanMat);
  }

  private createDetailedGunship(
    whiteMat: THREE.Material,
    redMat: THREE.Material,
    darkMat: THREE.Material,
    amberMat: THREE.Material
  ): THREE.Group {
    const ship = new THREE.Group();

    // Main fuselage cabin
    const bodyGeo = this.trackGeometry(new THREE.BoxGeometry(3.8, 2.4, 8.2));
    const body = new THREE.Mesh(bodyGeo, whiteMat);
    body.position.y = 1.7;
    ship.add(body);

    // Republic Maroon Side Doors with Clone Wars chevron stripes
    const doorGeo = this.trackGeometry(new THREE.BoxGeometry(0.35, 1.9, 4.6));
    const lDoor = new THREE.Mesh(doorGeo, redMat);
    lDoor.position.set(-1.95, 1.6, 0.3);
    ship.add(lDoor);

    const rDoor = lDoor.clone();
    rDoor.position.x = 1.95;
    ship.add(rDoor);

    // Forward dual cockpits
    const noseGeo = this.trackGeometry(new THREE.ConeGeometry(1.8, 3.6, 8));
    noseGeo.rotateX(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, whiteMat);
    nose.position.set(0, 1.5, 5.4);
    ship.add(nose);

    // Dual Forward Ball Turrets with glass canopies
    const ballGeo = this.trackGeometry(new THREE.SphereGeometry(0.65, 16, 16));
    const ballMat = this.trackMaterial(
      new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        transmission: 0.8,
        opacity: 1,
        transparent: true,
        roughness: 0.1,
      })
    );
    const lBall = new THREE.Mesh(ballGeo, ballMat);
    lBall.position.set(-1.6, 1.1, 4.6);
    ship.add(lBall);

    const rBall = lBall.clone();
    rBall.position.x = 1.6;
    ship.add(rBall);

    // Swept-Forward Wings
    const wingGeo = this.trackGeometry(new THREE.BoxGeometry(5.2, 0.3, 2.2));
    const lWing = new THREE.Mesh(wingGeo, whiteMat);
    lWing.position.set(-4.0, 2.4, -0.6);
    lWing.rotation.z = -0.18;
    ship.add(lWing);

    const rWing = new THREE.Mesh(wingGeo, whiteMat);
    rWing.position.set(4.0, 2.4, -0.6);
    rWing.rotation.z = 0.18;
    ship.add(rWing);

    // Wingtip Bubble Turrets / Pods
    const podGeo = this.trackGeometry(new THREE.CylinderGeometry(0.6, 0.6, 2.8, 12));
    podGeo.rotateX(Math.PI / 2);
    const lPod = new THREE.Mesh(podGeo, darkMat);
    lPod.position.set(-6.6, 2.7, -0.6);
    ship.add(lPod);

    const rPod = lPod.clone();
    rPod.position.x = 6.6;
    ship.add(rPod);

    // Wingtip Strobes
    const lStrobe = new THREE.Mesh(this.trackGeometry(new THREE.SphereGeometry(0.12, 8, 8)), amberMat);
    lStrobe.position.set(-6.6, 2.7, 0.9);
    ship.add(lStrobe);
    this.beaconLights.push(lStrobe);

    const rStrobe = lStrobe.clone();
    rStrobe.position.x = 6.6;
    ship.add(rStrobe);
    this.beaconLights.push(rStrobe);

    // Heavy Landing Skids
    const skidGeo = this.trackGeometry(new THREE.BoxGeometry(0.3, 0.2, 7.0));
    const lSkid = new THREE.Mesh(skidGeo, darkMat);
    lSkid.position.set(-1.6, 0.1, 0.0);
    ship.add(lSkid);

    const rSkid = lSkid.clone();
    rSkid.position.x = 1.6;
    ship.add(rSkid);

    return ship;
  }

  private createAstromechDroid(bodyMat: THREE.Material, cyanMat: THREE.Material): THREE.Group {
    const droid = new THREE.Group();

    // Cylindrical white torso
    const bodyGeo = this.trackGeometry(new THREE.CylinderGeometry(0.32, 0.32, 0.7, 16));
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    droid.add(body);

    // Rotating hemispherical dome head
    const domeGeo = this.trackGeometry(new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2));
    const headMat = this.trackMaterial(new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 }));
    const head = new THREE.Mesh(domeGeo, headMat);
    head.position.y = 0.95;
    droid.add(head);

    // Blinking eye sensor
    const eye = new THREE.Mesh(this.trackGeometry(new THREE.SphereGeometry(0.06, 8, 8)), cyanMat);
    eye.position.set(0, 1.05, 0.3);
    droid.add(eye);
    this.beaconLights.push(eye);

    // Dual legs
    const legGeo = this.trackGeometry(new THREE.BoxGeometry(0.12, 0.75, 0.16));
    const lLeg = new THREE.Mesh(legGeo, bodyMat);
    lLeg.position.set(-0.38, 0.45, 0);
    droid.add(lLeg);

    const rLeg = lLeg.clone();
    rLeg.position.x = 0.38;
    droid.add(rLeg);

    return droid;
  }

  private createHoloTable(archMat: THREE.Material, cyanMat: THREE.Material): THREE.Group {
    const table = new THREE.Group();

    // Circular base stand
    const standGeo = this.trackGeometry(new THREE.CylinderGeometry(1.2, 1.4, 0.9, 24));
    const stand = new THREE.Mesh(standGeo, archMat);
    stand.position.y = 0.45;
    table.add(stand);

    // Hologram projector emitter ring
    const emitterGeo = this.trackGeometry(new THREE.TorusGeometry(0.9, 0.08, 8, 24));
    emitterGeo.rotateX(Math.PI / 2);
    const emitter = new THREE.Mesh(emitterGeo, cyanMat);
    emitter.position.y = 0.92;
    table.add(emitter);

    // Rotating 3D Wireframe Planet Hologram
    const holoGeo = this.trackGeometry(new THREE.IcosahedronGeometry(0.8, 2));
    const holoMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      })
    );
    const holoMesh = new THREE.Mesh(holoGeo, holoMat);
    holoMesh.position.y = 2.1;
    table.add(holoMesh);

    // Hologram projection beam
    const beamGeo = this.trackGeometry(new THREE.ConeGeometry(0.9, 1.2, 16, 1, true));
    const beamMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 1.5;
    table.add(beam);

    return table;
  }

  private createCurvedGantry(segments: number, radius: number, mat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const postGeo = this.trackGeometry(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8));
    const railGeo = this.trackGeometry(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8));
    railGeo.rotateZ(Math.PI / 2);

    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * (Math.PI * 0.7);
      const post = new THREE.Mesh(postGeo, mat);
      post.position.set(Math.sin(a) * radius, 0.55, Math.cos(a) * radius);
      group.add(post);

      if (i < segments - 1) {
        const nextA = ((i + 1) / segments) * (Math.PI * 0.7);
        const midA = (a + nextA) / 2;
        const rail = new THREE.Mesh(railGeo, mat);
        rail.position.set(Math.sin(midA) * radius, 1.05, Math.cos(midA) * radius);
        rail.rotation.y = midA + Math.PI / 2;
        group.add(rail);
      }
    }
    return group;
  }

  private createCargoCluster(pos: THREE.Vector3, darkMat: THREE.Material, archMat: THREE.Material, amberMat: THREE.Material): void {
    const cluster = new THREE.Group();
    cluster.position.copy(pos);

    const crate1Geo = this.trackGeometry(new THREE.BoxGeometry(1.8, 1.4, 2.2));
    const crate1 = new THREE.Mesh(crate1Geo, darkMat);
    crate1.position.set(0, 0.7, 0);
    cluster.add(crate1);

    const crate2Geo = this.trackGeometry(new THREE.BoxGeometry(1.4, 1.2, 1.4));
    const crate2 = new THREE.Mesh(crate2Geo, archMat);
    crate2.position.set(1.4, 0.6, 0.3);
    crate2.rotation.y = 0.25;
    cluster.add(crate2);

    const crate3 = new THREE.Mesh(crate2Geo, darkMat);
    crate3.position.set(-0.2, 1.9, 0.1);
    crate3.rotation.y = -0.15;
    cluster.add(crate3);

    // Glowing status panel
    const led = new THREE.Mesh(this.trackGeometry(new THREE.BoxGeometry(0.1, 0.2, 0.4)), amberMat);
    led.position.set(0.92, 0.8, 0);
    cluster.add(led);
    this.beaconLights.push(led);

    this.mesh.add(cluster);
  }

  private createCloakedOfficer(pos: THREE.Vector3, cloakMat: THREE.Material): void {
    const figure = new THREE.Group();
    figure.position.copy(pos);

    // Flowing cloak cone
    const cloakGeo = this.trackGeometry(new THREE.ConeGeometry(0.5, 1.7, 10));
    const cloak = new THREE.Mesh(cloakGeo, cloakMat);
    cloak.position.y = 0.85;
    figure.add(cloak);

    // Hood / head
    const headGeo = this.trackGeometry(new THREE.SphereGeometry(0.22, 12, 10));
    const head = new THREE.Mesh(headGeo, cloakMat);
    head.position.y = 1.75;
    figure.add(head);

    this.mesh.add(figure);
    this.deckCrewOfficers.push({ group: figure, head, seed: Math.random() * 50 });
  }

  private createDeckCrewTechnician(pos: THREE.Vector3, suitMat: THREE.Material): void {
    const tech = new THREE.Group();
    tech.position.copy(pos);

    const bodyGeo = this.trackGeometry(new THREE.CylinderGeometry(0.22, 0.18, 0.9, 8));
    const body = new THREE.Mesh(bodyGeo, suitMat);
    body.position.y = 0.9;
    tech.add(body);

    const helmetGeo = this.trackGeometry(new THREE.SphereGeometry(0.2, 10, 8));
    const helmet = new THREE.Mesh(helmetGeo, suitMat);
    helmet.position.y = 1.5;
    tech.add(helmet);

    // Articulated diagnostic tool arm
    const armGeo = this.trackGeometry(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6));
    const arm = new THREE.Mesh(armGeo, suitMat);
    arm.position.set(0.28, 1.1, 0.15);
    arm.rotation.x = 0.6;
    tech.add(arm);

    this.mesh.add(tech);
    this.deckCrewTechs.push({ group: tech, arm, seed: Math.random() * 50 });
  }

  private createServiceDrone(
    pos: THREE.Vector3,
    orbitRadius: number,
    speed: number,
    archMat: THREE.Material,
    cyanMat: THREE.Material
  ): void {
    const drone = new THREE.Group();
    drone.position.copy(pos);

    // Central chassis orb
    const bodyGeo = this.trackGeometry(new THREE.SphereGeometry(0.35, 16, 16));
    const body = new THREE.Mesh(bodyGeo, archMat);
    drone.add(body);

    // Rotating outer diagnostic scanner ring
    const ringGeo = this.trackGeometry(new THREE.TorusGeometry(0.55, 0.05, 8, 24));
    const ring = new THREE.Mesh(ringGeo, cyanMat);
    drone.add(ring);

    // Top sensor antenna
    const antGeo = this.trackGeometry(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6));
    const ant = new THREE.Mesh(antGeo, archMat);
    ant.position.y = 0.45;
    drone.add(ant);

    // Blinking eye
    const eye = new THREE.Mesh(this.trackGeometry(new THREE.SphereGeometry(0.08, 8, 8)), cyanMat);
    eye.position.set(0, 0, 0.32);
    drone.add(eye);
    this.beaconLights.push(eye);

    // Soft downward scanner cone
    const scanGeo = this.trackGeometry(new THREE.ConeGeometry(0.5, 1.8, 12, 1, true));
    scanGeo.translate(0, -0.9, 0);
    const scanMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    const scanCone = new THREE.Mesh(scanGeo, scanMat);
    drone.add(scanCone);

    this.mesh.add(drone);
    this.serviceDrones.push({
      group: drone,
      ring,
      basePos: pos.clone(),
      orbitRadius,
      speed,
      seed: Math.random() * 100,
    });
  }

  // --- PARTICLE SYSTEMS: WELDING SPARKS & DUST MOTES ---

  private buildParticleSystems(): void {
    // 1. Welding Sparks Particle System
    const sparkCount = 120;
    const sparkGeo = this.trackGeometry(new THREE.BufferGeometry());
    const sparkPositions = new Float32Array(sparkCount * 3);
    this.sparkPositions = sparkPositions;
    const sparkColors = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = -100; // Inactive below deck
      sparkPositions[i * 3 + 2] = 0;

      sparkColors[i * 3] = 1.0;
      sparkColors[i * 3 + 1] = 0.75 + Math.random() * 0.25;
      sparkColors[i * 3 + 2] = 0.3;

      this.sparkVelocities.push({ x: 0, y: 0, z: 0, life: 0, maxLife: 0 });
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = this.trackMaterial(
      new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.sparkParticles = new THREE.Points(sparkGeo, sparkMat);
    this.mesh.add(this.sparkParticles);

    // 2. Atmospheric Floating Dust Motes
    const dustCount = 350;
    const dustGeo = this.trackGeometry(new THREE.BufferGeometry());
    const dustPos = new Float32Array(dustCount * 3);

    for (let d = 0; d < dustCount; d++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (this.radius * 0.85);
      dustPos[d * 3] = Math.sin(angle) * dist;
      dustPos[d * 3 + 1] = 0.5 + Math.random() * (this.height - 3.5);
      dustPos[d * 3 + 2] = Math.cos(angle) * dist;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = this.trackMaterial(
      new THREE.PointsMaterial({
        size: 0.12,
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.mesh.add(this.dustParticles);
  }

  private triggerWeldingSparks(): void {
    const sparkPositions = this.sparkPositions;
    if (!sparkPositions) {
      return;
    }

    // Two high maintenance catwalk weld origins
    const weldOrigins = [
      new THREE.Vector3(-12.5, 11.2, -7.5),
      new THREE.Vector3(13.2, 10.8, 6.2),
      new THREE.Vector3(0, this.height - 3.2, 3.8),
    ];
    const origin = weldOrigins[Math.floor(Math.random() * weldOrigins.length)];

    const burstSize = 18 + Math.floor(Math.random() * 12);
    let activated = 0;

    for (let i = 0; i < this.sparkVelocities.length && activated < burstSize; i++) {
      if (this.sparkVelocities[i].life <= 0) {
        sparkPositions[i * 3] = origin.x + (Math.random() - 0.5) * 0.3;
        sparkPositions[i * 3 + 1] = origin.y + (Math.random() - 0.5) * 0.3;
        sparkPositions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.3;

        this.sparkVelocities[i] = {
          x: (Math.random() - 0.5) * 4.5,
          y: -1.0 - Math.random() * 3.5,
          z: (Math.random() - 0.5) * 4.5,
          life: 0.7 + Math.random() * 0.8,
          maxLife: 1.2,
        };
        activated++;
      }
    }
  }

  private buildExitForceField(): void {
    const gateGeo = this.trackGeometry(new THREE.PlaneGeometry(24, 13));
    const gateMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    );
    this.forceField = new THREE.Mesh(gateGeo, gateMat);
    this.forceField.position.set(0, 6.5, this.runwayLength / 2 - 1.2);
    this.mesh.add(this.forceField);
  }

  private setupTheatricalLighting(): void {
    // Soft architectural ambient fill inside the hangar bay
    const ambientHangar = new THREE.AmbientLight(0x1e293b, 0.5);
    this.mesh.add(ambientHangar);

    // Subtle side fill to illuminate wall details without overpowering the ship's key light
    const fillLight = new THREE.DirectionalLight(0x334155, 1.2);
    fillLight.position.set(-16, 12, -12);
    this.mesh.add(fillLight);
  }

  // --- HERMETIC PUBLIC INTERFACE (OOP & SRP) ---

  public getMesh(): THREE.Group {
    return this.mesh;
  }

  public getLandingPad(): THREE.Group {
    return this.landingPad;
  }

  public getExitGateZ(): number {
    return this.runwayLength / 2 - 1.0;
  }

  public setGateOpen(isOpen: boolean): void {
    this.isGateOpen = isOpen;
  }

  public isGateCleared(): boolean {
    return this.gateProgress >= 0.75;
  }

  public alignPadToForward(deltaTime: number, speed: number = 4.0): boolean {
    const currentRot = this.landingPad.rotation.y % (Math.PI * 2);
    const diff = Math.atan2(Math.sin(-currentRot), Math.cos(-currentRot));

    if (Math.abs(diff) < 0.02) {
      this.landingPad.rotation.y = 0;
      return true;
    }

    this.landingPad.rotation.y += Math.sign(diff) * Math.min(Math.abs(diff), speed * deltaTime);
    return false;
  }

  public resetPadRotation(): void {
    this.landingPad.rotation.y = 0;
  }

  public update(deltaTime: number, rotatePad: boolean = true): void {
    if (this.disposed) {
      return;
    }

    this.elapsedTime += deltaTime;
    this.updateGate(deltaTime);

    if (rotatePad) {
      this.landingPad.rotation.y += 0.22 * deltaTime;
    }

    this.updateBeaconLights();
    this.updateCrewAnimations(deltaTime);
    this.updateServiceDrones(deltaTime);
    this.updateWeldingSparks(deltaTime);
    this.updateDustMotes();
  }

  private updateGate(deltaTime: number): void {
    if (this.isGateOpen) {
      this.gateProgress = Math.min(1.0, this.gateProgress + deltaTime * 1.5);
    } else {
      this.gateProgress = Math.max(0.0, this.gateProgress - deltaTime * 1.5);
    }

    const forceField = this.forceField;
    if (forceField && forceField.material) {
      const mat = forceField.material as THREE.MeshBasicMaterial;
      const pulse = Math.sin(this.elapsedTime * 2.0) * 0.02;
      mat.opacity = Math.max(0.01, (0.2 + pulse) * (1.0 - this.gateProgress));
      forceField.visible = this.gateProgress < 0.98;
    }
  }

  private updateBeaconLights(): void {
    const beaconGlow = 0.85 + Math.sin(this.elapsedTime * 1.5) * 0.1;
    for (const beacon of this.beaconLights) {
      (beacon.material as THREE.MeshBasicMaterial).opacity = beaconGlow;
    }
  }

  private updateCrewAnimations(deltaTime: number): void {
    if (this.astromechHead) {
      this.astromechHead.rotation.y = Math.sin(this.elapsedTime * 1.2) * 0.8;
    }

    if (this.holoPlanet) {
      this.holoPlanet.rotation.y += 0.45 * deltaTime;
    }

    for (const off of this.deckCrewOfficers) {
      const breath = 1.0 + Math.sin(this.elapsedTime * 1.5 + off.seed) * 0.015;
      off.group.scale.y = breath;
      off.head.rotation.y = Math.sin(this.elapsedTime * 0.6 + off.seed) * 0.35;
      off.head.rotation.x = Math.sin(this.elapsedTime * 0.9 + off.seed) * 0.06;
    }

    for (const tech of this.deckCrewTechs) {
      const sway = Math.sin(this.elapsedTime * 1.2 + tech.seed) * 0.02;
      tech.group.rotation.z = sway;
      tech.arm.rotation.x = 0.6 + Math.sin(this.elapsedTime * 2.0 + tech.seed) * 0.22;
      tech.arm.rotation.z = Math.cos(this.elapsedTime * 1.5 + tech.seed) * 0.12;
    }
  }

  private updateServiceDrones(deltaTime: number): void {
    for (const drone of this.serviceDrones) {
      const t = this.elapsedTime * drone.speed + drone.seed;
      const hoverY = drone.basePos.y + Math.sin(this.elapsedTime * 2.2 + drone.seed) * 0.14;
      const posX = drone.basePos.x + Math.sin(t) * drone.orbitRadius;
      const posZ = drone.basePos.z + Math.cos(t) * drone.orbitRadius;
      drone.group.position.set(posX, hoverY, posZ);

      drone.group.rotation.y = t + Math.PI / 2;
      drone.group.rotation.z = Math.sin(t) * 0.08;

      drone.ring.rotation.z += 2.4 * deltaTime;
    }
  }

  private updateWeldingSparks(deltaTime: number): void {
    this.nextSparkTime -= deltaTime;
    if (this.nextSparkTime <= 0) {
      this.triggerWeldingSparks();
      this.nextSparkTime = 0.8 + Math.random() * 1.4;
    }

    const sparkParticles = this.sparkParticles;
    const sparkPositions = this.sparkPositions;
    if (sparkParticles && sparkPositions) {
      const gravity = 9.8;
      for (let i = 0; i < this.sparkVelocities.length; i++) {
        const vel = this.sparkVelocities[i];
        if (vel.life > 0) {
          vel.life -= deltaTime;
          vel.y -= gravity * deltaTime;

          sparkPositions[i * 3] += vel.x * deltaTime;
          sparkPositions[i * 3 + 1] += vel.y * deltaTime;
          sparkPositions[i * 3 + 2] += vel.z * deltaTime;

          // Floor bounce
          if (sparkPositions[i * 3 + 1] < 0.05) {
            sparkPositions[i * 3 + 1] = 0.05;
            vel.y = -vel.y * 0.35;
            vel.x *= 0.6;
            vel.z *= 0.6;
          }
        } else {
          sparkPositions[i * 3 + 1] = -100; // Hide below floor
        }
      }
      sparkParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  private updateDustMotes(): void {
    const dustParticles = this.dustParticles;
    if (dustParticles) {
      const posAttr = dustParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let d = 0; d < posAttr.count; d++) {
        let y = posAttr.getY(d) + Math.sin(this.elapsedTime + d) * 0.008;
        if (y < 0.2) y = this.height - 3.5;
        if (y > this.height - 3.5) y = 0.2;
        posAttr.setY(d, y);
      }
      posAttr.needsUpdate = true;
    }
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;

    this.mesh.clear();
    this.landingPad.clear();
    for (const geo of this.geometries) {
      geo.dispose();
    }
    for (const mat of this.materials) {
      mat.dispose();
    }
    for (const tex of this.textures) {
      tex.dispose();
    }
    this.geometries = [];
    this.materials = [];
    this.textures = [];
    this.forceField = null;
    this.sparkParticles = null;
    this.sparkPositions = null;
    this.dustParticles = null;
    this.astromechHead = null;
    this.holoPlanet = null;
    this.beaconLights = [];
    this.deckCrewOfficers = [];
    this.deckCrewTechs = [];
    this.serviceDrones = [];
    this.sparkVelocities = [];
  }
}
