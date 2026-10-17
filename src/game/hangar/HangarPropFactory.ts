import * as THREE from 'three';
import type { HangarMaterials } from './HangarMaterials';
import type { HangarResourceTracker } from './HangarResourceTracker';
import type { HangarAnimationTargets, HangarDimensions, SparkSystem, SparkVelocity } from './HangarTypes';

/** Creates the individual props populating the hangar; animated parts are registered in the shared targets. */
export class HangarPropFactory {
  constructor(
    private readonly tracker: HangarResourceTracker,
    private readonly materials: HangarMaterials,
    private readonly targets: HangarAnimationTargets,
    private readonly dimensions: HangarDimensions
  ) {}

  public createGunship(): THREE.Group {
    const ship = new THREE.Group();

    // Main fuselage cabin
    const bodyGeo = this.tracker.trackGeometry(new THREE.BoxGeometry(3.8, 2.4, 8.2));
    const body = new THREE.Mesh(bodyGeo, this.materials.republicWhite);
    body.position.y = 1.7;
    ship.add(body);

    // Republic Maroon Side Doors with Clone Wars chevron stripes
    const doorGeo = this.tracker.trackGeometry(new THREE.BoxGeometry(0.35, 1.9, 4.6));
    const lDoor = new THREE.Mesh(doorGeo, this.materials.republicRed);
    lDoor.position.set(-1.95, 1.6, 0.3);
    ship.add(lDoor);

    const rDoor = lDoor.clone();
    rDoor.position.x = 1.95;
    ship.add(rDoor);

    // Forward dual cockpits
    const noseGeo = this.tracker.trackGeometry(new THREE.ConeGeometry(1.8, 3.6, 8));
    noseGeo.rotateX(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, this.materials.republicWhite);
    nose.position.set(0, 1.5, 5.4);
    ship.add(nose);

    // Dual Forward Ball Turrets with glass canopies
    const ballGeo = this.tracker.trackGeometry(new THREE.SphereGeometry(0.65, 16, 16));
    const ballMat = this.tracker.trackMaterial(
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
    const wingGeo = this.tracker.trackGeometry(new THREE.BoxGeometry(5.2, 0.3, 2.2));
    const lWing = new THREE.Mesh(wingGeo, this.materials.republicWhite);
    lWing.position.set(-4.0, 2.4, -0.6);
    lWing.rotation.z = -0.18;
    ship.add(lWing);

    const rWing = new THREE.Mesh(wingGeo, this.materials.republicWhite);
    rWing.position.set(4.0, 2.4, -0.6);
    rWing.rotation.z = 0.18;
    ship.add(rWing);

    // Wingtip Bubble Turrets / Pods
    const podGeo = this.tracker.trackGeometry(new THREE.CylinderGeometry(0.6, 0.6, 2.8, 12));
    podGeo.rotateX(Math.PI / 2);
    const lPod = new THREE.Mesh(podGeo, this.materials.darkSteel);
    lPod.position.set(-6.6, 2.7, -0.6);
    ship.add(lPod);

    const rPod = lPod.clone();
    rPod.position.x = 6.6;
    ship.add(rPod);

    // Wingtip Strobes
    const lStrobe = new THREE.Mesh(this.tracker.trackGeometry(new THREE.SphereGeometry(0.12, 8, 8)), this.materials.amberBeacon);
    lStrobe.position.set(-6.6, 2.7, 0.9);
    ship.add(lStrobe);
    this.targets.beaconLights.push(lStrobe);

    const rStrobe = lStrobe.clone();
    rStrobe.position.x = 6.6;
    ship.add(rStrobe);
    this.targets.beaconLights.push(rStrobe);

    // Heavy Landing Skids
    const skidGeo = this.tracker.trackGeometry(new THREE.BoxGeometry(0.3, 0.2, 7.0));
    const lSkid = new THREE.Mesh(skidGeo, this.materials.darkSteel);
    lSkid.position.set(-1.6, 0.1, 0.0);
    ship.add(lSkid);

    const rSkid = lSkid.clone();
    rSkid.position.x = 1.6;
    ship.add(rSkid);

    return ship;
  }

  public createAstromechDroid(): THREE.Group {
    const droid = new THREE.Group();

    // Cylindrical white torso
    const bodyGeo = this.tracker.trackGeometry(new THREE.CylinderGeometry(0.32, 0.32, 0.7, 16));
    const body = new THREE.Mesh(bodyGeo, this.materials.archSteel);
    body.position.y = 0.6;
    droid.add(body);

    // Rotating hemispherical dome head
    const domeGeo = this.tracker.trackGeometry(new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2));
    const headMat = this.tracker.trackMaterial(new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 }));
    const head = new THREE.Mesh(domeGeo, headMat);
    head.position.y = 0.95;
    droid.add(head);

    // Blinking eye sensor
    const eye = new THREE.Mesh(this.tracker.trackGeometry(new THREE.SphereGeometry(0.06, 8, 8)), this.materials.cyanGlow);
    eye.position.set(0, 1.05, 0.3);
    droid.add(eye);
    this.targets.beaconLights.push(eye);

    // Dual legs
    const legGeo = this.tracker.trackGeometry(new THREE.BoxGeometry(0.12, 0.75, 0.16));
    const lLeg = new THREE.Mesh(legGeo, this.materials.archSteel);
    lLeg.position.set(-0.38, 0.45, 0);
    droid.add(lLeg);

    const rLeg = lLeg.clone();
    rLeg.position.x = 0.38;
    droid.add(rLeg);

    return droid;
  }

  public createHoloTable(): THREE.Group {
    const table = new THREE.Group();

    // Circular base stand
    const standGeo = this.tracker.trackGeometry(new THREE.CylinderGeometry(1.2, 1.4, 0.9, 24));
    const stand = new THREE.Mesh(standGeo, this.materials.archSteel);
    stand.position.y = 0.45;
    table.add(stand);

    // Hologram projector emitter ring
    const emitterGeo = this.tracker.trackGeometry(new THREE.TorusGeometry(0.9, 0.08, 8, 24));
    emitterGeo.rotateX(Math.PI / 2);
    const emitter = new THREE.Mesh(emitterGeo, this.materials.cyanGlow);
    emitter.position.y = 0.92;
    table.add(emitter);

    // Rotating 3D Wireframe Planet Hologram
    const holoGeo = this.tracker.trackGeometry(new THREE.IcosahedronGeometry(0.8, 2));
    const holoMat = this.tracker.trackMaterial(
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
    const beamGeo = this.tracker.trackGeometry(new THREE.ConeGeometry(0.9, 1.2, 16, 1, true));
    const beamMat = this.tracker.trackMaterial(
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

  public createCurvedGantry(segments: number, radius: number): THREE.Group {
    const group = new THREE.Group();
    const postGeo = this.tracker.trackGeometry(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8));
    const railGeo = this.tracker.trackGeometry(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8));
    railGeo.rotateZ(Math.PI / 2);

    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * (Math.PI * 0.7);
      const post = new THREE.Mesh(postGeo, this.materials.archSteel);
      post.position.set(Math.sin(a) * radius, 0.55, Math.cos(a) * radius);
      group.add(post);

      if (i < segments - 1) {
        const nextA = ((i + 1) / segments) * (Math.PI * 0.7);
        const midA = (a + nextA) / 2;
        const rail = new THREE.Mesh(railGeo, this.materials.archSteel);
        rail.position.set(Math.sin(midA) * radius, 1.05, Math.cos(midA) * radius);
        rail.rotation.y = midA + Math.PI / 2;
        group.add(rail);
      }
    }
    return group;
  }

  public createCargoCluster(pos: THREE.Vector3): THREE.Group {
    const cluster = new THREE.Group();
    cluster.position.copy(pos);

    const crate1Geo = this.tracker.trackGeometry(new THREE.BoxGeometry(1.8, 1.4, 2.2));
    const crate1 = new THREE.Mesh(crate1Geo, this.materials.darkSteel);
    crate1.position.set(0, 0.7, 0);
    cluster.add(crate1);

    const crate2Geo = this.tracker.trackGeometry(new THREE.BoxGeometry(1.4, 1.2, 1.4));
    const crate2 = new THREE.Mesh(crate2Geo, this.materials.archSteel);
    crate2.position.set(1.4, 0.6, 0.3);
    crate2.rotation.y = 0.25;
    cluster.add(crate2);

    const crate3 = new THREE.Mesh(crate2Geo, this.materials.darkSteel);
    crate3.position.set(-0.2, 1.9, 0.1);
    crate3.rotation.y = -0.15;
    cluster.add(crate3);

    // Glowing status panel
    const led = new THREE.Mesh(this.tracker.trackGeometry(new THREE.BoxGeometry(0.1, 0.2, 0.4)), this.materials.amberBeacon);
    led.position.set(0.92, 0.8, 0);
    cluster.add(led);
    this.targets.beaconLights.push(led);

    return cluster;
  }

  public createCloakedOfficer(pos: THREE.Vector3): THREE.Group {
    const figure = new THREE.Group();
    figure.position.copy(pos);

    // Flowing cloak cone
    const cloakGeo = this.tracker.trackGeometry(new THREE.ConeGeometry(0.5, 1.7, 10));
    const cloak = new THREE.Mesh(cloakGeo, this.materials.cloak);
    cloak.position.y = 0.85;
    figure.add(cloak);

    // Hood / head
    const headGeo = this.tracker.trackGeometry(new THREE.SphereGeometry(0.22, 12, 10));
    const head = new THREE.Mesh(headGeo, this.materials.cloak);
    head.position.y = 1.75;
    figure.add(head);

    this.targets.deckCrewOfficers.push({ group: figure, head, seed: Math.random() * 50 });

    return figure;
  }

  public createDeckCrewTechnician(pos: THREE.Vector3): THREE.Group {
    const tech = new THREE.Group();
    tech.position.copy(pos);

    const bodyGeo = this.tracker.trackGeometry(new THREE.CylinderGeometry(0.22, 0.18, 0.9, 8));
    const body = new THREE.Mesh(bodyGeo, this.materials.archSteel);
    body.position.y = 0.9;
    tech.add(body);

    const helmetGeo = this.tracker.trackGeometry(new THREE.SphereGeometry(0.2, 10, 8));
    const helmet = new THREE.Mesh(helmetGeo, this.materials.archSteel);
    helmet.position.y = 1.5;
    tech.add(helmet);

    // Articulated diagnostic tool arm
    const armGeo = this.tracker.trackGeometry(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6));
    const arm = new THREE.Mesh(armGeo, this.materials.archSteel);
    arm.position.set(0.28, 1.1, 0.15);
    arm.rotation.x = 0.6;
    tech.add(arm);

    this.targets.deckCrewTechs.push({ group: tech, arm, seed: Math.random() * 50 });

    return tech;
  }

  public createServiceDrone(pos: THREE.Vector3, orbitRadius: number, speed: number): THREE.Group {
    const drone = new THREE.Group();
    drone.position.copy(pos);

    // Central chassis orb
    const bodyGeo = this.tracker.trackGeometry(new THREE.SphereGeometry(0.35, 16, 16));
    const body = new THREE.Mesh(bodyGeo, this.materials.archSteel);
    drone.add(body);

    // Rotating outer diagnostic scanner ring
    const ringGeo = this.tracker.trackGeometry(new THREE.TorusGeometry(0.55, 0.05, 8, 24));
    const ring = new THREE.Mesh(ringGeo, this.materials.cyanGlow);
    drone.add(ring);

    // Top sensor antenna
    const antGeo = this.tracker.trackGeometry(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6));
    const ant = new THREE.Mesh(antGeo, this.materials.archSteel);
    ant.position.y = 0.45;
    drone.add(ant);

    // Blinking eye
    const eye = new THREE.Mesh(this.tracker.trackGeometry(new THREE.SphereGeometry(0.08, 8, 8)), this.materials.cyanGlow);
    eye.position.set(0, 0, 0.32);
    drone.add(eye);
    this.targets.beaconLights.push(eye);

    // Soft downward scanner cone
    const scanGeo = this.tracker.trackGeometry(new THREE.ConeGeometry(0.5, 1.8, 12, 1, true));
    scanGeo.translate(0, -0.9, 0);
    const scanMat = this.tracker.trackMaterial(
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

    this.targets.serviceDrones.push({
      group: drone,
      ring,
      basePos: pos.clone(),
      orbitRadius,
      speed,
      seed: Math.random() * 100,
    });

    return drone;
  }

  public createSparkSystem(): SparkSystem {
    const sparkCount = 120;
    const sparkGeo = this.tracker.trackGeometry(new THREE.BufferGeometry());
    const positions = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);
    const velocities: SparkVelocity[] = [];

    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100; // Inactive below deck
      positions[i * 3 + 2] = 0;

      sparkColors[i * 3] = 1.0;
      sparkColors[i * 3 + 1] = 0.75 + Math.random() * 0.25;
      sparkColors[i * 3 + 2] = 0.3;

      velocities.push({ x: 0, y: 0, z: 0, life: 0, maxLife: 0 });
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = this.tracker.trackMaterial(
      new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );

    return { points: new THREE.Points(sparkGeo, sparkMat), positions, velocities };
  }

  public createDustMotes(): THREE.Points {
    const dustCount = 350;
    const { radius, height } = this.dimensions;
    const dustGeo = this.tracker.trackGeometry(new THREE.BufferGeometry());
    const dustPos = new Float32Array(dustCount * 3);

    for (let d = 0; d < dustCount; d++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (radius * 0.85);
      dustPos[d * 3] = Math.sin(angle) * dist;
      dustPos[d * 3 + 1] = 0.5 + Math.random() * (height - 3.5);
      dustPos[d * 3 + 2] = Math.cos(angle) * dist;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = this.tracker.trackMaterial(
      new THREE.PointsMaterial({
        size: 0.12,
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );

    return new THREE.Points(dustGeo, dustMat);
  }

  public createExitForceField(): THREE.Mesh {
    const gateGeo = this.tracker.trackGeometry(new THREE.PlaneGeometry(24, 13));
    const gateMat = this.tracker.trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    );
    const forceField = new THREE.Mesh(gateGeo, gateMat);
    forceField.position.set(0, 6.5, this.dimensions.runwayLength / 2 - 1.2);
    return forceField;
  }
}
