import '/style.css'

import * as THREE from 'three';
import { SphereGeometry, TetrahedronGeometry } from 'three';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap';
import * as dat from 'dat.gui'

// math stuff
import { create, all, secondRadiationDependencies } from 'mathjs'
const config = { }
const math = create(all, config)

// Constants
const EARTH_RADIUS_KM = 6371;
const MOON_RADIUS_KM = 1737;
const MOON_TO_EARTH_KM = 384470;
const EARTH_DISPLACEMENT = math.round(MOON_TO_EARTH_KM/MOON_RADIUS_KM);
const EARTH_RADIUS_MOONS = math.round(EARTH_RADIUS_KM/MOON_RADIUS_KM);

const orbit = {
  orbitData:{
    a: 5,
    e: 0.5,
    inc: 45,
    AOP: 0, 
    RAAN: 45
  }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(85, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})

// Init controls
const controls =  new OrbitControls(camera, renderer.domElement);


var textures = {
  'moonMap':{
    path: '/imgs/moon_4k_color_brim16.jpg',
    val: undefined
  },
  'moonNormalMap':{
    path: '/imgs/moon_4k_normal.jpg',
    val: undefined
  }, 
  'earthMap':{
    path: '/imgs/earth_4k.jpg',
    val: undefined
  },
  'earthBumpMap':{
    path: '/imgs/earth_bump.jpg',
    val: undefined
  },
  'skybox':{
    path: ['/imgs/starfield/front.png',
      '/imgs/starfield/back.png',
      '/imgs/starfield/left.png',
      '/imgs/starfield/right.png',
      '/imgs/starfield/top.png',
      '/imgs/starfield/bottom.png',
    ],
    val: undefined
  }
}

const loadMgr = new THREE.LoadingManager();
loadMgr.onStart = function(){
  console.log('Begin loading');
}
loadMgr.onLoad = function(){
  console.log('Complete')
  launchElement.style.visibility = "visible"; 
}
/*
function loadTextures(textures){
  var key;
  const textureLoader = new THREE.TextureLoader(loadMgr);
  const cubeLoader = new THREE.CubeTextureLoader(loadMgr);

  for(key in textures){
    if (typeof textures[key].path == 'string'){
      textureLoader.load(textures[key].path)
    }
    else if (typeof textures[key].path == 'object'){
      cubeLoader.load(textures[key].path)
    }
  } 
}
*/
function initTextures(){
  const textureLoader = new THREE.TextureLoader(loadMgr);
  const cubeLoader = new THREE.CubeTextureLoader(loadMgr);

  // Moon
  const moonMap = textureLoader.load('/imgs/moon_4k_color_brim16.jpg');
  const moonNormalMap = textureLoader.load('/imgs/moon_4k_normal.jpg');

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1,50,50),
    new THREE.MeshStandardMaterial({
      map: moonMap,
      normalMap: moonNormalMap
    })
  )
  moon.name = "moon";
  scene.add(moon);
  moon.translateX(-EARTH_DISPLACEMENT)  //place earth w.r.t moon
  moon.translateX(-0.5)                 //offset moon for ~aesthetics~

  //Earth
  const earthMap = textureLoader.load('/imgs/earth_4k.jpg');
  const earthBumpMap = textureLoader.load('/imgs/earth_bump.jpg');
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS_MOONS, 500, 500),
    new THREE.MeshLambertMaterial({
      map: earthMap,
      bumpMap: earthBumpMap,
      bumpScale: 0.1
    })
  )
  earth.name = "earth";
  scene.add(earth);

  //Skybox
  const skybox_texture = cubeLoader.load([
    '/imgs/starfield/front.png',
    '/imgs/starfield/back.png',
    '/imgs/starfield/left.png',
    '/imgs/starfield/right.png',
    '/imgs/starfield/top.png',
    '/imgs/starfield/bottom.png',
  ]);
  scene.background = skybox_texture;

}


function onPageLoad(){

  //const spaceTexture = new THREE.TextureLoader().load('/imgs/space.jpg');
  //scene.background = spaceTexture;
  initTextures();
  // Add lighting
  const moonLight = new THREE.PointLight(0xffffff, 1, 100, 2);
  const earthLight = new THREE.PointLight(0xffffff, 1, 200, 2);
  moonLight.position.set(-EARTH_DISPLACEMENT+10,3,0)
  earthLight.position.set(30,10,0)

  // Set rendering opts, place camera
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  camera.position.set(-EARTH_DISPLACEMENT,-1,1.25);
  camera.lookAt(-EARTH_DISPLACEMENT, 0, 0)
  renderer.render(scene, camera);

  /*
  // Create moon obj
  const moonMap = new THREE.TextureLoader().load('/imgs/moon_4k_color_brim16.jpg');
  const moonNormalMap = new THREE.TextureLoader().load('/imgs/moon_4k_normal.jpg');

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1,50,50),
    new THREE.MeshStandardMaterial({
      map: moonMap,
      normalMap: moonNormalMap
    })
  )
  moon.name = "moon";
  */
  controls.target = new THREE.Vector3(-EARTH_DISPLACEMENT,0,0);
  controls.update();

  /*
  // Create earth obj
  const earthMap = new THREE.TextureLoader().load('/imgs/earth_4k.jpg');
  const earthBumpMap = new THREE.TextureLoader().load('/imgs/earth_bump.jpg');
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS_MOONS, 500, 500),
    new THREE.MeshLambertMaterial({
      map: earthMap,
      bumpMap: earthBumpMap,
      bumpScale: 0.1
    })
  )
  earth.name = "earth";
  */

  //const lightHelper = new THREE.PointLightHelper(earthLight);

  //const axesHelper = new THREE.AxesHelper( 5 );
  //scene.add( axesHelper );

  const ambientLight = new THREE.AmbientLight( 0x404040 , 0.5); // soft white light
  scene.add(ambientLight);

  // Add objs to scene
  //scene.add(earth);
  //scene.add(moon)
  scene.add(moonLight)
  scene.add(earthLight)
  //scene.add(lightHelper)

  /*
  moon.translateX(-EARTH_DISPLACEMENT)  //place earth w.r.t moon
  moon.translateX(-0.5)                 //offset moon for ~aesthetics~

  // Create skybox
  const loader = new THREE.CubeTextureLoader();
  const skybox_texture = loader.load([
    '/imgs/starfield/front.png',
    '/imgs/starfield/back.png',
    '/imgs/starfield/left.png',
    '/imgs/starfield/right.png',
    '/imgs/starfield/top.png',
    '/imgs/starfield/bottom.png',
  ]);
  scene.background = skybox_texture;
  */
  initOrbit();
  animate();
}

function initOrbit(){
  var a = orbit.orbitData.a;
  const e = orbit.orbitData.e;
  const inc = orbit.orbitData.inc*math.pi/180;
  const AOP = orbit.orbitData.AOP*math.pi/180;
  const RAAN = orbit.orbitData.RAAN*math.pi/180;

  // Scale semi-major axis from km to moon radii units
  a = math.round(a*EARTH_RADIUS_KM/MOON_RADIUS_KM)
  var b = a*math.sqrt(1-math.square(e));              // Semi-minor ax
  var c = math.sqrt(math.square(a)-math.square(b));   // Foci location

  const orbitCurve = new THREE.EllipseCurve(
    -c, 0,           // x,y center
    a,b,             // x,y, radius
    0, 2*math.pi,    // start/end angles
    false, 0,
  )

  var orbitPoints = orbitCurve.getPoints(100);
  var orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  var orbitMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth:10} );
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

  orbitLine.rotateX(math.pi/2);
  orbitLine.rotateZ(RAAN);
  orbitLine.rotateX(inc);
  orbitLine.rotateZ(AOP);
  orbitLine.name = "orbitLine";

  scene.add(orbitLine);
}


function initTriad(){

  const AX_LENGTH = 3*EARTH_RADIUS_MOONS;
  const AX_THICKNESS = 0.05;

  var xMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } )
  var yMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } )
  var zMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
  var xGeometry = new THREE.CylinderGeometry(AX_THICKNESS, AX_THICKNESS, AX_LENGTH, 10, 10)
  var yGeometry = xGeometry.clone();
  var zGeometry = xGeometry.clone();
  
  var xLine = new THREE.Mesh(xGeometry, xMaterial);
  var yLine = new THREE.Mesh(yGeometry, yMaterial);
  var zLine = new THREE.Mesh(zGeometry, zMaterial);

  zLine.position.y += AX_LENGTH/2;

  xLine.rotation.z = math.pi/2;
  xLine.position.x += AX_LENGTH/2;

  yLine.rotation.x = math.pi/2;
  yLine.rotation.y = math.pi/2;
  yLine.position.z += AX_LENGTH/2;

  const triadLine = new THREE.Group();
  triadLine.add(xLine);
  triadLine.add(yLine);
  triadLine.add(zLine);
  scene.add(triadLine);
}


function refreshOrbit(){
  var a = orbit.orbitData.a;
  const e = orbit.orbitData.e;
  const inc = (orbit.orbitData.inc+90)*math.pi/180;
  const AOP = orbit.orbitData.AOP*math.pi/180;
  const RAAN = orbit.orbitData.RAAN*math.pi/180;

  // Scale semi-major axis from km to moon radii units
  a = math.round(a*EARTH_RADIUS_KM/MOON_RADIUS_KM)
  var b = a*math.sqrt(1-math.square(e));              // Semi-minor ax
  var c = math.sqrt(math.square(a)-math.square(b));   // Foci location

  const orbitCurve = new THREE.EllipseCurve(
    -c, 0,           // x,y center
    a,b,             // x,y, radius
    0, 2*math.pi,    // start/end angles
    false, 0,
  )


  const newOrbitPoints = orbitCurve.getPoints(100);
  const orbitLine = scene.getObjectByName("orbitLine");
  const {array} = orbitLine.geometry.attributes.position;

  // Update to new positions;
  for(let i = 0; i < newOrbitPoints.length; i++){
    var curPoints = new Float32Array(newOrbitPoints[i]);

    const newIdx = 3*i;
    array[newIdx] = curPoints[0];
    array[newIdx+1] = curPoints[1];
    array[newIdx+2] = 0;
  }

  orbitLine.geometry.attributes.position.needsUpdate = true;

  // Reset rotation
  orbitLine.rotation.x = 0;
  orbitLine.rotation.y = 0;
  orbitLine.rotation.z = 0;

  // Rotate (euler)
  orbitLine.rotateY(RAAN);
  orbitLine.rotateX(inc);
  orbitLine.rotateZ(-AOP);

}

// Main() 
function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();

  const moon = scene.getObjectByName("moon");
  moon.rotation.y += 0.001
  const earth = scene.getObjectByName("earth");
  earth.rotation.y += 0.001*6.5;

}

// Launch animation
const tl = gsap.timeline();
function launchSequence(){

  var launchBtnStyle = document.getElementById('launch-btn').style;
  launchBtnStyle.opacity = 1;
  (function fade(){(launchBtnStyle.opacity-=.02)<0?launchBtnStyle.display="none":setTimeout(fade,5)})();

  var titleTextStyle = document.getElementById('kep-title').style;
  titleTextStyle.opacity = 1;
  (function fade(){(titleTextStyle.opacity-=.02)<0?titleTextStyle.display="none":setTimeout(fade,5)})();

  tl.to(camera.position,{
    x: 30,
    y: 0,
    z: 0,
    duration: 5,
    onUpdate: function(){
      camera.lookAt(-EARTH_DISPLACEMENT, 0, 0)
    },
    onComplete: function(){
      camera.lookAt(0,0,0)
      controls.target = new THREE.Vector3(0,0,0);
      controls.update();
      //scene.remove(scene.getObjectByName("moon"));
      initTriad();
      const gui = new dat.GUI()

      gui.add(orbit.orbitData, 'a', 1, 20).name('Semi-Major Axis (R_earth)').onChange(refreshOrbit)
      gui.add(orbit.orbitData, 'e', 0, 0.99).name('Eccentricity (-)').onChange(refreshOrbit)
      gui.add(orbit.orbitData, 'inc', 0, 180).name('Inclination (deg)').onChange(refreshOrbit)
      gui.add(orbit.orbitData, 'AOP', 0, 360).name('AOP (deg)').onChange(refreshOrbit)
      gui.add(orbit.orbitData, 'RAAN', 0, 360).name('RAAN (deg)').onChange(refreshOrbit)
    }
  })
}


const launchElement = document.getElementById("launch-btn");
launchElement.addEventListener("click", launchSequence)


// window resizing
addEventListener('resize', onWindowResize, false);

function onWindowResize(){
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight)
}

addEventListener('load', onPageLoad, false);
