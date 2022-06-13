// import three js
import * as THREE from 'https://unpkg.com/three@0.119.1/build/three.module.js';
// import obj loader
import { OBJLoader } from 'https://unpkg.com/three@0.119.1/examples/jsm/loaders/OBJLoader.js';

// import postprocessing
import { EffectComposer } from 'https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'https://unpkg.com/three@0.119.1/examples/jsm/postprocessing/GlitchPass.js';

// create the scene
scene = new THREE.Scene();

var camera,scene,renderer,composer;
var dirlight1, dirlight2, rectlight, ambient;
var time, t, tSmooth, tDiff,deskSmooth;
var screen, zedTex, mymiTex, abcTex, ppmTex, ytTex, starTex, muteTex, unmuteTex, screenState;
var glitch, glitchCounter;
var hoverScreen = false;

var width = window.innerWidth;
var height = window.innerHeight;

const clock = new THREE.Clock(true);

// tracking the mouse
const pointer = new THREE.Vector2();
const pointerSmooth = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// how much to smooth out the changes
const smoothAmt = 0.05;

var terrainUniforms, terrainMat, plane, renderingPlane, screenUniforms;
var windmill, blades;

// variables for the 3D environment
const earthGroup = new THREE.Group();
var earth, travelLine, travelLinePct, travelLineCurve, travelLineGeo, travelLineMat, fogParticles, stars;
const deskGroup = new THREE.Group();
const windmillGroup = new THREE.Group();
const travelPointsVec = [new THREE.Vector3(0.13813,0.5789,0.803), new THREE.Vector3(0.23255,-0.59335,0.77)]
const starGeo = new THREE.Geometry();
const numStars = 1000;

// html elements that are updated programatically
const subtitleDiv = document.createElement("div");
const htmlSubtitleDiv = document.getElementById('subtitlesDiv');
const homeButton = document.getElementById("home");
const aboutButton = document.getElementById("about");
const workButton = document.getElementById("work");
const startTimeline = document.getElementById("start-timeline");
const muteimg = document.getElementById("muteimg");
const muteButton = document.getElementById("mute");
var subtitleState = -1;

// audio variables
var backgroundMusic = new Audio("src/music.wav");
var chimes = [];
var chimeNumber = 1;
var scrollAudio = new Audio("src/scrollchime.wav");

var audioMuted = true;

/* ------------------ INIT -------------------------

sets all of the values of the variables to their default
states. creates materials and objects for 3D environment.

*/
function init() {
	// camera
	var aspect = width/height;
	camera = new THREE.PerspectiveCamera( 45, aspect, 0.1, 1000 );

	// attach to HTML
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(width, height);
	document.body.appendChild( renderer.domElement );

	// load the textures
	const loader = new THREE.TextureLoader();
	const earthTex = loader.load('src/earth.png');
	zedTex = loader.load('src/zed.png');
	mymiTex = loader.load('src/mymi.png');
	abcTex = loader.load('src/abc.png');
	ppmTex = loader.load('src/ppm.png');
	ytTex = loader.load('src/yt.png');
	starTex = loader.load('src/circle.png');
	muteTex = loader.load('src/mute.png');
	unmuteTex = loader.load('src/unmute.png');

	// lights
	ambient = new THREE.AmbientLight(0xffffff,0.3);
	dirlight1 = new THREE.DirectionalLight(0xff9999);
	dirlight1.position.set(-1,.5,0);
	dirlight1.intensity = 0;
	dirlight2 = new THREE.DirectionalLight(0x99ff99);
	dirlight2.position.set(1,.5,0);
	dirlight2.intensity = 0;

	rectlight = new THREE.RectAreaLight(0xffffff,1,8,2);

	scene.add(ambient,dirlight1,dirlight2,rectlight);
	scene.background = new THREE.Color(0x090909);

	// ----------- creating geometries ---------------
	const planeGeo = new THREE.PlaneBufferGeometry(250, 250, 600, 600);
	const earthGeo = new THREE.SphereGeometry(1, 50, 50);
	const travelPointGeo = new THREE.SphereGeometry(0.007,10,10);
	travelLinePct = 0;
	travelLineCurve = getCurve(travelPointsVec[0],travelPointsVec[1],travelLinePct);
	travelLineGeo = new THREE.TubeGeometry(travelLineCurve,20,.0015,8,false);

	for (let i = 0; i < numStars; i++) {
		var star = new THREE.Vector3((Math.random()-0.5) * 500,(Math.random()-0.5) * 500, (Math.random()-0.5) * 2000);
		starGeo.vertices.push(star);
		starGeo.colors.push(new THREE.Color((star.z/2000 + 0.5)*255));
	}

	// ----------- creating materials ---------------
	terrainUniforms = {
		time: { value: 0.0},
		scale: { value: 0.3}
	};
	terrainMat = new THREE.ShaderMaterial({
		uniforms: terrainUniforms,
		vertexShader: document.getElementById('terrainVertex').textContent,
		fragmentShader: document.getElementById('terrainFragment').textContent,
		transparent: true
	});
	const earthUniforms = {
		earthTexture: {
			value: earthTex
		}
	};
	const earthMat = new THREE.ShaderMaterial({
		uniforms: earthUniforms,
		vertexShader: document.getElementById('earthVertex').textContent,
		fragmentShader: document.getElementById('earthFragment').textContent,
		transparent: true
	});
	const atmosMat = new THREE.ShaderMaterial({
		vertexShader: document.getElementById('atmosVertex').textContent,
		fragmentShader: document.getElementById('atmosFragment').textContent,
		blending: THREE.AdditiveBlending,
		side: THREE.BackSide,
		transparent: true
	});
	travelLineMat = new THREE.MeshStandardMaterial({
		emissive: 0x5555ff
	});
	const starMat = new THREE.PointsMaterial({
		map: starTex,
		alphaTest:0.1,
		color: 0xffffff
	});
	const deskMat = new THREE.MeshStandardMaterial({
		color: 0x333333,
	});
	const roomMat = new THREE.MeshStandardMaterial({
		color: 0x111111
	});
	const windmillMat = new THREE.MeshStandardMaterial({
		emissive: 0x777777
	})

	screenUniforms = {
		fade: {
			value: 0.
		},
		screenTexture: {
			value: earthTex
		}
	}
	const screenMat = new THREE.ShaderMaterial({
		uniforms: screenUniforms,
		vertexShader: document.getElementById('screenVertex').textContent,
		fragmentShader: document.getElementById('screenFragment').textContent
	})

	// ------------- creating objects -------------------
	const objLoader = new OBJLoader();
	objLoader.load('src/desk.obj', (object) => {
		for (var i = 0; i < 17; i++) {
			var deskGeo = object.children[i].geometry;
			var desk = new THREE.Mesh(deskGeo,deskMat);
			deskGroup.add(desk);
		}

		var screenGeo = new THREE.PlaneBufferGeometry(800,340,1,1);
		screen = new THREE.Mesh(screenGeo,screenMat);
		screen.position.z = 410;
		screen.position.y = 132;
		screen.rotation.x = Math.PI/2;
		deskGroup.add(screen);


		deskGroup.scale.set(0.01,0.01,0.01);
		var planeGeo = new THREE.PlaneBufferGeometry(7000,2000,1,1);
		var plane = new THREE.Mesh(planeGeo,roomMat);
		plane.position.z = -720;
		plane.position.y = -700;
		deskGroup.add(plane);
		var plane2 = new THREE.Mesh(planeGeo,roomMat);
		plane2.position.z = 200;
		plane2.position.y = 300;
		plane2.rotation.x = Math.PI/2;
		deskGroup.add(plane2);

		scene.add(deskGroup);
		deskGroup.position.z = -20;
		deskGroup.rotation.x = -Math.PI/2;
	});

	objLoader.load('src/windmill.obj', (object) => {
		windmill = object.children[0];
		blades = object.children[1];
		windmill.material = blades.material = windmillMat;

		windmillGroup.add(windmill,blades);
		
		windmillGroup.position.z = -100;
		windmillGroup.position.y = 10;
		windmillGroup.position.x = -20;
		windmillGroup.rotation.x = -Math.PI/2;
		windmillGroup.scale.set(0.1,0.1,0.1);

		scene.add(windmillGroup);
	});

	plane = new THREE.Mesh(planeGeo, terrainMat);
	renderingPlane = true;

	earth = new THREE.Mesh(earthGeo, earthMat);
	const atmosphere = new THREE.Mesh(earthGeo, atmosMat);
	const travelPoints = [new THREE.Mesh(travelPointGeo, travelLineMat), new THREE.Mesh(travelPointGeo, travelLineMat)];
	travelLine = new THREE.Mesh(travelLineGeo, travelLineMat);
	stars = new THREE.Points(starGeo,starMat);

	// ------------- adding objects to the scene --------------------
	earthGroup.add(earth,atmosphere,travelLine,travelPoints[0],travelPoints[1]);

	scene.add(stars);
	scene.add(plane);
	scene.add(earthGroup);
	
	earthGroup.position.x = 5;
	atmosphere.scale.set(1.2,1.2,1.2);
	travelPoints[0].position.x = travelPointsVec[0].x;
	travelPoints[0].position.y = travelPointsVec[0].y;
	travelPoints[0].position.z = travelPointsVec[0].z;
	travelPoints[1].position.x = travelPointsVec[1].x;
	travelPoints[1].position.y = travelPointsVec[1].y;
	travelPoints[1].position.z = travelPointsVec[1].z;

	fogParticles = [];
	loader.load("src/smoke.png",function(texture){
		var fogGeo = new THREE.PlaneBufferGeometry(500,500);
		for (let p = 0; p < 50; p++){
			var fogMaterial = new THREE.MeshLambertMaterial({
				map: texture,
				transparent:true
			});
			let fog = new THREE.Mesh(fogGeo,fogMaterial);
			let r = Math.random();
			let g = Math.random();
			fog.position.set(r*width/2-width/4,(1-g)*height/2-height/4,-100);
			fog.rotation.z = Math.random()*2*Math.PI;
			fog.material.opacity = 0.55;
			fog.material.color.setRGB(10-5*r-5*g,10-5*(1-r)-5*(1-g),10);
			fogParticles.push(fog)
			scene.add(fog);
		}
	});
	
	subtitleDiv.id = "subtitles";

	// getting document scroll amount
	t = -document.body.getBoundingClientRect().top/(window.innerHeight);
	tSmooth = t;
	tDiff = 0;
	deskSmooth = 0;
	// track global time
	time = clock.getElapsedTime();

	// ----------- post process pipeline ------------------
	composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene,camera));
	glitch = new GlitchPass();

	console.log("Hey there!\n\nThanks for stopping by.\n\nIf you want to check out the code for this website, it's all available to view on GitHub: https://github.com/GeordieTomo/GeordieTomo.github.io \n\nThis website was made with Three js, GLSL shaders and pure CSS and JavaScript, and the music was made by me :)")
}

/* --------------------------------------- MAIN LOOP -------------------------------------------

controls high level logic, timing, and mouse tracking. As well as at which point in the scrolling 
process to set another animation to start and end. These animations are all abstracted to seperate
functions.

*/
var animate = function () {
	// run animate as a loop
	requestAnimationFrame( animate );

	time = clock.getElapsedTime();

	if (Math.abs(t - tSmooth) > 0.1) {
		tDiff += 0.025;
	}
	else {
		tDiff -= 0.005;
	}
	tDiff = Math.max(0,Math.min(0.85,tDiff));
	scrollAudio.volume = tDiff;
	if (audioMuted) {
		for (var i = 0; i < chimes.length; i++) {
			chimes[i].pause();
		}
	}

	tSmooth += (t - tSmooth) * smoothAmt;

	pointerSmooth.x += (pointer.x - pointerSmooth.x) * smoothAmt;
	pointerSmooth.y += (pointer.y - pointerSmooth.y) * smoothAmt;

	subtitles();

	glitchEffects();

	animateTerrain(map(tSmooth,0,1.78,0,1));

	animateEarth(map(tSmooth,1.6,3.2,0,1));

	animateFog(map(tSmooth,2.68,4,0,1));

	animateWindmill(map(tSmooth,3,4.1,0,1));

	animateDesk(smoothstep(4.1,4.64,tSmooth),smoothstep(4.6,10.3,tSmooth));

	animateStars(smoothstep(1.6,4.47,tSmooth));

	composer.render();

};

// run the init and animate functions
init();
animate();

// --- display the subtitles at the bottom or top of screen, based on scroll position ----
function subtitles() {
	// main scroll position checking
	if (tSmooth >= 0.6 && tSmooth < 1.7) {
		if (subtitleState != 1) {	
			subtitleDiv.innerHTML = "I am an interdisciplinary creative, currently studying Electrical Engineering and Arts";
			htmlSubtitleDiv.append(subtitleDiv);
			subtitleState = 1;
		}
	} else if (tSmooth >= 1.7 && tSmooth < 3.1) {
		if (subtitleState != 2) {	
			subtitleDiv.innerHTML = "I was born in Japan, and moved to Australia when I was 6 months old";
			htmlSubtitleDiv.append(subtitleDiv);
			subtitleState = 2;
		}
	}  else if (tSmooth >= 3.1 && tSmooth < 4.1) {
		if (subtitleState != 3) {	
			subtitleDiv.innerHTML = "I love music, electronics, basketball and I am passionate about all things sustainable";
			htmlSubtitleDiv.append(subtitleDiv);
			subtitleState = 3;
		}
	} else if (subtitleState != 0) {
		document.getElementById('subtitlesDiv').removeChild(htmlSubtitleDiv.lastChild);
		subtitleState = 0;
	}

	// also check scroll position and update button highlighting on the right hand side
	if (tSmooth < 0.6) {
		homeButton.className = "selected";
		aboutButton.className = "null";
		workButton.className = "null";
	} else if (tSmooth < 4.1) {
		homeButton.className = "null";
		aboutButton.className = "selected";
		workButton.className = "null";
	} else {
		homeButton.className = "null";
		aboutButton.className = "null";
		workButton.className = "selected";
	}
}

// move the fog particles (purple blue background of the windmill)
function animateFog(pct) {
	fogParticles.forEach(p => {
		p.rotation.z -=0.001;
		p.position.z = -100 - pct*200;

		p.material.opacity = Math.min(0.65, pct*2);
	});

}

// animate the terrain
function animateTerrain(pct) {
	// see terrain shaders - in index.html
	terrainUniforms['time'].value = time;
	terrainUniforms['scale'].value = 6.*smoothstep(0,1,pct) + 1;

	plane.rotation.x = smoothstep(0,1,pct) * Math.PI / 3 - Math.PI / 3;
	plane.position.z = - 500 + 330*smoothstep(0,1,pct);

	// remove once off screen
	if (pct > 1.) {
		scene.remove(plane);
		renderingPlane = false;
	} else if (!renderingPlane) {
		scene.add(plane);
		renderingPlane = true;
	}
	
}

// animate the earth
function animateEarth(pct) {

	// animate the line into the screen
	if (pct > 0.1) {
		travelLinePct = Math.min(1,travelLinePct + 0.002);
	} else {
		travelLinePct = Math.max(0, travelLinePct - 0.005);
	}

	// set the position scale and rotation
	// rotation is a sin function but also modified by the users cursor
	earthGroup.position.z = -2;
	earthGroup.rotation.x = -pointerSmooth.y * Math.PI / 16 + 0.125*Math.cos(time/2);
	earthGroup.rotation.y = -0.125 + 0.125*Math.sin(time/2) + pointerSmooth.x * Math.PI / 16;
	var newPos = 5 - 5*smoothstep(0,0.1,pct) - 5*smoothstep(0.9,1.0,pct);
	earthGroup.position.x += (newPos - earthGroup.position.x) * smoothAmt;
	earthGroup.remove(travelLine);
	earthGroup.scale.set(0.5,0.5,0.5);

	// only add the travel line when it's percentage is greater than 0
	if (travelLinePct > 0) {
		travelLineCurve = getCurve(travelPointsVec[0],travelPointsVec[1], travelLinePct);
		travelLineGeo = new THREE.TubeGeometry(travelLineCurve,20,.0015,8,false);
		travelLine = new THREE.Mesh(travelLineGeo, travelLineMat);
		earthGroup.add(travelLine);
	}	

	earth.rotation.y = travelLine.rotation.y + 2.5;
}

// animate the windmill
function animateWindmill(pct) {
	// rotate the blades
	if (blades) {
		blades.rotation.y -= 0.05 * pct;
	}
	
	// set the position
	windmillGroup.position.z = -200 * pct;
	windmillGroup.position.y = 10;
	windmillGroup.position.x = -20;

}

// animate the desk
function animateDesk(pct,finalPct) {
	// update intensity of lighting
	// start all faded out, bring in at the start, and then slowly fade out
	// until it's just the rect light left (simulating the screen light)
	rectlight.intensity = 3*pct;
	dirlight1.intensity = pct - finalPct;
	dirlight2.intensity = pct - finalPct;
	ambient.intensity = 0.3+ pct*0.4 - finalPct*0.7;

	var pPct = pct;
	deskSmooth += (pct - deskSmooth) * smoothAmt;
	pct = deskSmooth;
	
	// update desk and camera positions
	if (pct <= 0.3 && pPct <= 0) {
		deskGroup.position.z = 10;
		camera.position.y = 0;
		camera.position.x = 0;
		camera.position.z = 0;
		camera.lookAt(new THREE.Vector3(0,0,0));
	} else {
	
		deskGroup.position.z = - pct*15;
		deskGroup.position.y = 4 - 4 * pct;
	
		camera.position.y = 10 - finalPct * 7;
		camera.position.x = - (deskGroup.position.z) * pointerSmooth.x * Math.PI / 4 * Math.min(1, window.innerHeight / window.innerWidth);
		camera.position.z = - 5 * finalPct + 2*Math.cos(2 * pointerSmooth.x * Math.PI / 4 * Math.min(1, window.innerHeight / window.innerWidth));
		camera.lookAt(new THREE.Vector3(0,-2 + finalPct*5,-20));
	
		rectlight.position.z = deskGroup.position.z-1.7;
		rectlight.position.y = deskGroup.position.y + 3;
		rectlight.rotation.x = Math.PI;

		screenUniforms['fade'].value = pct;

		// set the screen image based on current scroll position
		if (tSmooth < 5.5) {
			screenUniforms['screenTexture'].value = zedTex;
			screenState = 1;
		}
		else if (tSmooth < 7) {
			screenUniforms['screenTexture'].value = mymiTex;
			screenState = 2;
		}
		else if (tSmooth < 8.5) {
			screenUniforms['screenTexture'].value = abcTex;
			screenState = 3;
		}
		else if (tSmooth < 10) {
			screenUniforms['screenTexture'].value = ppmTex;
			screenState = 4;
		}
		else {
			screenUniforms['screenTexture'].value = ytTex;
			screenState = 5;
		}
	}
}

// animate the stars
function animateStars(pct){
	// move forwards until they reach 1000, then teleport back to -1000
	for (var i = 0; i < numStars; i++) {
		starGeo.colors[i] = new THREE.Color(starGeo.colors[i].b + 20);
		starGeo.vertices[i].z += 1;
		if (starGeo.vertices[i].z > 1000) {
			starGeo.vertices[i].z = -1000;
			starGeo.colors[i] = new THREE.Color(0,0,0);
		}
	}

	// rotate stars to match terrain, and then add 90 degrees once the earth is in view
	stars.rotation.x = plane.rotation.x + Math.PI/2 * (tSmooth< 1.7);
	// rotate the whole group of stars, based on the scroll position
	stars.rotation.z = pct * 10;

	starGeo.verticesNeedUpdate = true;
	starGeo.colorsNeedUpdate = true;
}

// add postprocessing effects, specifically glitch, which covers up the less smooth transitions
function glitchEffects() {
	if (((tSmooth > 1.6 && tSmooth < 1.8) || (tSmooth > 4.0 && tSmooth < 4.2))) {
		if (composer.passes.length < 2){
			composer.addPass(glitch);
			glitch.goWild = true;
			glitchCounter = 0;
		}
		if ((tSmooth > 1.69 && tSmooth < 1.71) || (tSmooth > 4.09 && tSmooth < 4.11)) {
			glitch.goWild = true;
			glitchCounter = 0;
		}

		glitchCounter++;
		if (glitchCounter > 10) {
			glitch.goWild = false;
		}

	}
	else if (composer.passes.length > 1) {
		glitchCounter++;
		if (glitchCounter > 10) {
			composer.passes.pop();
		}
	}
}

// ----------------------------------------------------------------------------------------------




// tracking the document scroll amount when it changes
function updateScroll() {
	t = -document.body.getBoundingClientRect().top/(window.innerHeight);
}
document.body.onscroll = updateScroll;

// update window size if it's changed
function onWindowResize() {
	var newWidth = window.innerWidth;
	var newHeight = window.innerHeight;
	var newAspect = newWidth/newHeight;
	camera.aspect = newAspect;
	camera.updateProjectionMatrix();
	renderer.setSize(newWidth,newHeight);
}
window.addEventListener('resize', onWindowResize);

// track mouse movement
const onMouseMove = (e) => {
	pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
	pointer.x = Math.min(1, Math.max(-1, pointer.x));
	pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;	
	pointer.y = Math.min(1, Math.max(-1, pointer.y));

	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	if (screen) {
		const intersects = raycaster.intersectObjects( [screen] );
		if (intersects.length > 0) {
			if(intersects[0].object == screen){
				hoverScreen = true;
				document.body.style.cursor = "pointer";
			}
		} else { 
			hoverScreen = false;
			document.body.style.cursor = "default";
		}
	}
}
window.addEventListener('mousemove', onMouseMove);

// check mouse down
window.onmousedown = function() {
	// open hyperlinks, if the user clicks on the computer screen
	if (hoverScreen) {
		switch(screenState) {
			case 1:
				window.open('https://www.zedtechnologies.com.au/');
				break;
			case 2:
				window.open('https://www.mymi.org.au/project-psss');
				break;
			case 3:
				window.open('https://ashburtonbaptist.org.au/');
				break;
			case 4:
				window.open('https://www.youtube.com/c/geordie_tomo/');
		}
	}
	// if the audio isn't muted
	if (!audioMuted) {
		// play a chime
		audioChime();
	}
}

// audio chime function
function audioChime () {
	// increment the chime number anwhere from 1-3.
	// The 5 audio files are an arpegio from the root, to third, to fifth, to seventh, to octave
	// so incrementing by a few leads to pleasant sounding transitions
	chimeNumber = (chimeNumber + Math.floor(Math.random() * 3)) % 5 + 1;
	chimes[chimes.length] = new Audio("src/chime" + chimeNumber + ".wav");
	chimes[chimes.length - 1].play();
	// remove the chime once it's played out
	setTimeout(function(){chimes.shift();}, 5000);
}

// smooth scroll to the top of the docuemnt when the button is clicked
homeButton.onclick = function() {
	window.scroll({
		top: 0,
		behavior: "smooth"
	});
	return false;
}

// smooth scroll to about when the button is clicked
aboutButton.onclick = function() {
	window.scroll({
		top: window.innerHeight * 0.65,
		behavior: "smooth"
	});
	return false;
}

// smooth scroll to the work history section when the button is clicked
workButton.onclick = function() {
	window.scroll({
		top: -document.body.getBoundingClientRect().top + startTimeline.getBoundingClientRect().bottom - window.innerHeight + 30,
		behavior: "smooth"
	});

	return false;
}

// update the audio to be muted or playing
muteButton.onclick = function () {
	audioMuted = !audioMuted;
	if (audioMuted) {
		muteimg.src = "src/mute.png";
		backgroundMusic.pause();
		scrollAudio.pause();
		for (var i = 0; i < chimes.length; i++) {
			chimes[i].pause();
		}
	} else {
		muteimg.src = "src/unmute.png";
		backgroundMusic.play();
		backgroundMusic.loop = true;
		scrollAudio.play();
		scrollAudio.volume = 0;
		scrollAudio.loop = true;
	}
}

// helper functions (maths things)
// find the curve between two points on a sphere (for creating the earth line)
function getCurve(p1,p2,f) {
	var v1 = new THREE.Vector3().copy(p1);
	var v2 = new THREE.Vector3().copy(p2);
	let points = []
	let numPoints = 20;
	let dist = 0.1;
	let pct = Math.max(0,Math.min(1,f));
	for (var i = 0; i <= numPoints; i++){
		var p = new THREE.Vector3().lerpVectors(v1,v2, i/numPoints*pct);
		p.normalize();
		p.multiplyScalar(1 + dist*Math.sin(Math.PI*i/numPoints*pct));
		points.push(p);
	}

	return new THREE.CatmullRomCurve3(points);
}

// map a value between a range
function map(x, minIn, maxIn, minOut, maxOut) {
	return (x - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
}

// smooth step gives a smooth interpolation between two values
function smoothstep(edge0, edge1, x) {
	var t = Math.max(Math.min((x-edge0) / (edge1 - edge0), 1), 0);
	return t*t*(3-2*t);
}