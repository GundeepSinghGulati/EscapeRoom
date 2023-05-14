import React, { Component, } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AnimationMixer } from "three";
import { AiFillCaretRight } from 'react-icons/ai';
import { AiFillCaretLeft } from 'react-icons/ai';
import {
    RGBELoader
} from 'three/examples/jsm/loaders/RGBELoader'


import { gsap } from "gsap";
//import { click } from "@testing-library/user-event/dist/click";
class ThreeScene extends Component {
	canvasRef = React.createRef();
	
	scene = new THREE.Scene();
	pivot = new THREE.Object3D();
	rotationAngle = 0;
	model;
		
	totalRotationAngle = 0;
	zoomEnabled = false;
	modelHeight;
	modelWidth;
	
	
	camera = new THREE.PerspectiveCamera(45, 0, 0.001, 9999);
	renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
	loader = new GLTFLoader();
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	previousCameraPos = new THREE.Vector3(0, 3, 0);
	viewObjectFlag = false;
 
	propertiesPivot() {
		this.pivot.position.set(0, 0, 0);
		this.scene.add(this.pivot);

		// Add the camera to the pivot point
		this.pivot.add(this.camera);
	}

	
	
	componentDidMount() {
		this.mixers = {};
		this.clipActions = {};

		this.clock = new THREE.Clock();

		this.dict = {
			"laptop": ["Base001"],
			"desk_handle1": ['handle1'],
			"desk_handle2": ['handle2'],
			"cabinet_left": ['Tv_Cabinet001'],
			"cabinet_right": ['Tv_Cabinet002'],
			"cabinet_down": ['Tv_Cabinet003'],
			"cabinet_top": ['Tv_Cabinet004'],
			"duck_up": ['Tv_Cabinet'],
			"duck_down": ['Tv_Cabinet002'],
			"mat": ['Cube'],
		}

	
		
		// Canvas
		const canvas = this.canvasRef.current;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Camera
		
		this.camera.position.z = 4;
		this.camera.position.y = 3;
		this.camera.aspect = canvas.width / canvas.height;
		// this.camera.position.x = 1;
		
		this.camera.updateProjectionMatrix();

		// Renderer
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		canvas.appendChild(this.renderer.domElement);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
		this.scene.add(ambientLight);
		const pointLight = new THREE.PointLight(0xffffff, 0.2);
		pointLight.position.set(0, 3.3, 0);
		this.scene.add(pointLight);

		// Room		
		this.loader.load("FINALE2.gltf", (gltf) => {
			this.model = gltf.scene;

			const bbox = new THREE.Box3().setFromObject(this.model);
			

			// Set the camera's position so that the model fits inside the view
			if (window.matchMedia('(max-width: 767px)').matches) {
				const bbox = new THREE.Box3().setFromObject(this.model);
				const center = bbox.getCenter(new THREE.Vector3());
				const size = bbox.getSize(new THREE.Vector3());

				const maxDim = Math.max(size.x, size.y, size.z);
				const fov = this.camera.fov * (Math.PI / 180);
				const aspectRatio = this.camera.aspect;
				const cameraZ = Math.abs(maxDim / 2 * Math.tan(fov / 2) * aspectRatio);

				this.camera.position.z = cameraZ+2;
				this.camera.position.x = center.x;
				// this.camera.position.set(center.x, center.y, cameraZ);
				this.camera.lookAt(center);

				

			}else{
				const cent = bbox.getCenter(new THREE.Vector3());
				let size = bbox.getSize(new THREE.Vector3());

				// Rescale the object to normalized space
				const maxAxis = Math.max(size.x, size.y, size.z);
				this.model.scale.multiplyScalar(1.0 / maxAxis);
				bbox.setFromObject(this.model);
				bbox.getCenter(cent);
				bbox.getSize(size);

				// Reposition to 0, halfY, 0
				this.model.position.copy(cent).multiplyScalar(0);

				bbox.setFromObject(this.model, true);

				const fov = this.camera.fov * (Math.PI / 180);
				const fovh = 2 * Math.atan(Math.tan(fov / 2) * this.camera.aspect);
				const dx = size.z / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
				const dy = size.z / 2 + Math.abs(size.y / 2 / Math.tan(fovh / 2));
				const cameraZ = Math.max(dx, dy);

				// Set the camera inside the room
				this.camera.position.set(0, 0, 0);
				this.model.add(this.camera);

				this.camera.translateY(1.5); 
				this.camera.translateZ(cameraZ+2); 				
			}
			

			this.camera.updateProjectionMatrix();


			const animations = gltf.animations;
			console.log(animations);

			{
				const mixer = new AnimationMixer(gltf.scene.getObjectByName("Base001"));				
				const clip = new THREE.AnimationClip('laptop', 1, [animations[2].tracks[0], animations[2].tracks[1], animations[2].tracks[2]]);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				clipAction.setLoop(THREE.LoopOnce);
				this.mixers['laptop'] = mixer;
				this.clipActions['laptop'] = clipAction;
			}
			
			{
				const mixer = new AnimationMixer(gltf.scene.getObjectByName("handle1"));
				const clip = new THREE.AnimationClip('desk_handle1', 1, [animations[23].tracks[0], animations[23].tracks[1]]);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				clipAction.setLoop(THREE.LoopOnce);
				this.mixers['desk_handle1'] = mixer;
				this.clipActions['desk_handle1'] = clipAction;
			}

			{
				const mixer = new AnimationMixer(gltf.scene.getObjectByName("handle2"));
				const clip = new THREE.AnimationClip('desk_handle2', 1, [animations[24].tracks[0], animations[24].tracks[1]]);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				clipAction.setLoop(THREE.LoopOnce);
				this.mixers['desk_handle2'] = mixer;
				this.clipActions['desk_handle2'] = clipAction;
			}

			{
				const mixer = new AnimationMixer(gltf.scene.getObjectByName("Tv_Cabinet001"));
				const clip = new THREE.AnimationClip('cabinet_left', 1, [animations[14].tracks[0], animations[14].tracks[1]]);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				clipAction.setLoop(THREE.LoopOnce);
				this.mixers['cabinet_left'] = mixer;
				this.clipActions['cabinet_left'] = clipAction;
			}

			{
				const mixer = new AnimationMixer(gltf.scene.getObjectByName("Tv_Cabinet002"));
				const clip = new THREE.AnimationClip('cabinet_right', 1, [animations[16].tracks[0], animations[16].tracks[1]]);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				clipAction.setLoop(THREE.LoopOnce);
				this.mixers['cabinet_right'] = mixer;
				this.clipActions['cabinet_right'] = clipAction;
			}

			{
				const mixer = new AnimationMixer(gltf.scene.getObjectByName("Tv_Cabinet003"));
				const clip = new THREE.AnimationClip('cabinet_down', 1, [animations[18].tracks[0], animations[18].tracks[1]]);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				clipAction.setLoop(THREE.LoopOnce);
				this.mixers['cabinet_down'] = mixer;
				this.clipActions['cabinet_down'] = clipAction;
			}

			{
				const mixer = new AnimationMixer(gltf.scene.getObjectByName("Tv_Cabinet004"));
				const clip = new THREE.AnimationClip('cabinet_top', 1, [animations[20].tracks[0], animations[20].tracks[1]]);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				clipAction.setLoop(THREE.LoopOnce);
				this.mixers['cabinet_top'] = mixer;
				this.clipActions['cabinet_top'] = clipAction;
			}

			{
				var temp=gltf.scene.getObjectByName("Armature");
				const mixer = new AnimationMixer(temp.children[1]);				
				const clip = new THREE.AnimationClip('duck_up', 1, 
						[
						animations[30].tracks[0], 
						animations[30].tracks[1],
						animations[30].tracks[2],
						animations[30].tracks[3],
						animations[30].tracks[4],
						animations[30].tracks[5],
						animations[30].tracks[6],
						animations[30].tracks[7],
						animations[30].tracks[8],
						animations[30].tracks[9],
						animations[30].tracks[10],
						animations[30].tracks[11],
						animations[30].tracks[12],
						animations[30].tracks[13],
						animations[30].tracks[14],
						]
					);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				//clipAction.setLoop(THREE.LoopOnce);
				this.mixers['duck_up'] = mixer;
				this.clipActions['duck_up'] = clipAction;
			}

			{
				var temp=gltf.scene.getObjectByName("Armature001");
				const mixer = new AnimationMixer(temp.children[1]);				
				const clip = new THREE.AnimationClip('duck_down', 1, 
						[
						animations[32].tracks[0], 
						animations[32].tracks[1],
						animations[32].tracks[2],
						animations[32].tracks[3],
						animations[32].tracks[4],
						animations[32].tracks[5],
						animations[32].tracks[6],
						animations[32].tracks[7],
						animations[32].tracks[8],
						animations[32].tracks[9],
						animations[32].tracks[10],
						animations[32].tracks[11],
						animations[32].tracks[12],
						animations[32].tracks[13],
						animations[32].tracks[14],
						]
					);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				//clipAction.setLoop(THREE.LoopOnce); 
				this.mixers['duck_down'] = mixer;
				this.clipActions['duck_down'] = clipAction;
			}
			
			{
				var temp=gltf.scene.getObjectByName("Armature002");
				console.log(temp)
				const mixer = new AnimationMixer(temp.children[1]);				
				const clip = new THREE.AnimationClip('mat', 1, 
						[
						animations[35].tracks[0], 
						animations[35].tracks[1],
						animations[35].tracks[2],
						animations[35].tracks[3],
						animations[35].tracks[4],
						animations[35].tracks[5],
						]
					);
				const clipAction = mixer.clipAction(clip);
				clipAction.clampWhenFinished = true;
				clipAction.setLoop(THREE.LoopOnce); 
				this.mixers['mat'] = mixer;
				this.clipActions['mat'] = clipAction;
			}
			// model.traverse((child) => {
			//   if (!child.isMesh) return;
			//   var prevMaterial = child.material;
			//   child.material = new THREE.MeshLambertMaterial();
			//   THREE.MeshBasicMaterial.prototype.copy.call(child.material, prevMaterial);
			// });
			this.scene.add(this.model);
			//console.log(model);
		});

		// camera bound cylinder
		const geometry = new THREE.CylinderGeometry();
		const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
		const cameraBoundCylinder = new THREE.Mesh(geometry, material);
		cameraBoundCylinder.position.set(0, 2.6, 0);
		cameraBoundCylinder.scale.set(5, 5, 5);
		cameraBoundCylinder.visible = false;
		this.scene.add(cameraBoundCylinder);

		// Controls
		// this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
		// this.orbitControls.update();
		// this.orbitControls.maxPolarAngle = Math.PI * 0.40;
		//  this.pointerlockControls = new PointerLockControls(
		// this.camera,
		//this.renderer.domElement
		// );

		const animate = () => {
			const delta = this.clock.getDelta();
			requestAnimationFrame(animate);

			for (const [_,mixer] of Object.entries(this.mixers)) {
				mixer.update(delta);
			}

			// const intersects = this.raycaster.intersectObjects(
			//   this.scene.children,
			//   true
			// );

			// if (intersects.length > 0) {
			//   intersects[0].object.material.color.set(0xff0000);
			//   // console.log(intersects[0].object);
			// }

			//zoomin


			this.renderer.render(this.scene, this.camera);
		};
		animate();

		const checkParentName = (obj, name) => {
			let tmp = obj;
			let flag = false;
			while (1) {
				if (tmp.name === name) {
					flag = true;
					break;
				}
				tmp = tmp.parent;
				if (tmp === null) break;
			}

			return [flag, tmp];
		}

		const moveforward = (delta) => {
			this.camera.position.set(
				this.camera.position.x + this.raycaster.ray.direction.x * delta,
				this.camera.position.y + this.raycaster.ray.direction.y * delta,
				this.camera.position.z + this.raycaster.ray.direction.z * delta,
			)
		}

		//popup

		// Create a new DOM element for the popup
		window.addEventListener("click", (event) => {
			//########
			// var popup = document.createElement('div');
			// popup.style.position = 'absolute';
			// popup.style.width = '200px';
			// popup.style.height = '100px';
			// popup.style.backgroundColor = 'white';
			// popup.style.border = '1px solid black';
			// popup.style.padding = '10px';
			// popup.innerText = 'popup';
			//################

			// Get the position of the 3D object in the viewport
			// var position = new THREE.Vector3();
			// position.setFromMatrixPosition(cube.matrixWorld);
			// position.project(this.camera);

			// Convert the position to CSS coordinates
			// var widthHalf = 0.5 * this.renderer.getContext().canvas.width;
			// var heightHalf = 0.5 * this.renderer.getContext().canvas.height;
			// position.x = (position.x * widthHalf) + widthHalf;
			// position.y = -(position.y * heightHalf) + heightHalf;

			this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
			this.raycaster.setFromCamera(this.mouse, this.camera);

			const intersects = this.raycaster.intersectObjects(this.scene.children);
			if (intersects.length > 0) {

				// Get the first intersected object
				// const targetObject = intersects[0].object;

				// Zoom in to the target object
				// this.zoomIn(targetObject);

				for (const [key, names] of Object.entries(this.dict)) {
					for (const name of names) {
						const [flag, obj] = checkParentName(intersects[0].object, name);
						if (flag) {
							const pos = new THREE.Vector3();
							obj.getWorldPosition(pos);
							// this.orbitControls.target = new THREE.Vector3(0, 0, 0);

							pos.add(this.camera.position.clone().sub(pos).normalize().multiplyScalar(2));
							// this.clipActions[key].play();
							this.viewObjectFlag = true;
							// this.orbitControls.enabled = false;

							gsap.to(this.camera.position, {
								//duration: 3, x: pos.x, y: pos.y, z: pos.z, onUpdate: () => {
								duration: 0.01, onUpdate: () => {
									// this.orbitControls.target.copy(this.camera.position)
									// this.orbitControls.update();
									// this.camera.lookAt(tmp)
								}, onComplete: () => {
									// this.orbitControls.target.copy(pos);
									this.clipActions[key].play();
									//this.orbitControls.enabled = true;
									//this.orbitControls.update();
									this.viewObjectFlag = false;
								}
							});
							
							//this.orbitControls.target.add(pos.clone().sub(this.camera.position));
							// console.log(this.orbitControls.object)
							// this.orbitControls.object.rotateOnAxis(new THREE.Vector3(0, 1, 0),Math.PI / 6)

							// console.log(key)
						}
					}
				}
			}

			// Set the position of the popup
			//#############
			// popup.style.left = position.x + 'px';
			// popup.style.top = position.y + 'px';
			//###################

			//#############
			// let closeButton = popup.document.createElement("button");
			// closeButton.innerHTML = "Close Popup";
			// closeButton.addEventListener("click", function () {
			//   popup.close();
			// });
			//##################

			// Add the popup to the document body
			// document.body.appendChild(popup);
			// document.body.appendChild(closeButton);//##
		})
	
		
		// const root = document.getElementById("check");
		// const rootDiv = document.getElementById("root");
		
		  
		// window.addEventListener("resize", () => {
		
		// 	const newWidth = window.innerWidth;

		// 	canvas.width = newWidth;

		// 	root.style.width = newWidth + "px"
		// 	root.style.height = "auto";

		// 	rootDiv.style.width = newWidth + "px"
		// 	root.style.height = "auto";

		// 	this.setOrientationToLandscape();
		//   });

		

		canvas.addEventListener("wheel", (event) => {
			if (!this.viewObjectFlag) {
				// Get the camera's position as a vector
				const cameraPosition = new THREE.Vector3();
				this.camera.getWorldPosition(cameraPosition);

				// Get the bounding box of the object
				const boundingBox = new THREE.Box3().setFromObject(cameraBoundCylinder);

				// Check if the camera position is inside the bounding box
				if (boundingBox.containsPoint(cameraPosition)) {
					// Collision detected between the camera and the object
					this.camera.getWorldPosition(this.previousCameraPos);
					// this.orbitControls.enabled = true;
					const delta = - event.deltaY * 0.001; // forward: -100, backward: +100
					// console.log(this.camera.position);
					// this.camera.position.add(this.raycaster.ray.direction.clone());
					moveforward(delta);

					// console.log(delta);
				} else {
					// this.orbitControls.enabled = false;
					// console.log(this.previousCameraPos);
					gsap.to(this.camera.position, {
						duration: 0, x: this.previousCameraPos.x, y: this.previousCameraPos.y, z: this.previousCameraPos.z, onComplete: () => {
							// this.orbitControls.enabled = true;
						}
					});
					
					this.orbitControls.target.add(this.previousCameraPos.clone().sub(this.camera.position));
				}
			}
			
		});

	}
	

	setOrientationToLandscape() {
		if (window.matchMedia('(max-width: 767px)').matches && 'orientation' in window.screen) {
		  if (window.screen.orientation.type.startsWith('portrait')) {
			window.screen.orientation.lock('landscape');
		  }
		}
	  }


	  handleLeftButtonClick = () => {
		const targetRotation = this.totalRotationAngle - Math.PI / 2;
		const startRotation = this.totalRotationAngle;
		const duration = 500;
		const startTime = performance.now();
	  
		const boundingBox = new THREE.Box3().setFromObject(this.model);
		const objectWidth = boundingBox.getSize(new THREE.Vector3()).x;
		const objectHeight = boundingBox.getSize(new THREE.Vector3()).y;
	  
		const aspectRatio = this.camera.aspect;
		const HFOV = THREE.MathUtils.degToRad(this.camera.fov);
		const VFOV = 2 * Math.atan(Math.tan(HFOV / 2) / aspectRatio);
	  
		const distanceZ = Math.max(
		  objectWidth / (2 * Math.tan(HFOV / 2)),
		  objectHeight / (2 * Math.tan(VFOV / 2))
		);
	  
		const animateRotation = (timestamp) => {
		  const elapsed = timestamp - startTime;
		  let progress = elapsed / duration;
	  
		  if (progress >= 1) {
			progress = 1;
		  } else {
			requestAnimationFrame(animateRotation);
		  }
	  
		  const interpolatedAngle = startRotation + (targetRotation - startRotation) * progress;
	  
		  const quaternion = new THREE.Quaternion();
		  quaternion.setFromEuler(new THREE.Euler(0, interpolatedAngle, 0));
		  this.camera.setRotationFromQuaternion(quaternion);
	  
		  const newCameraPosition = new THREE.Vector3(
			this.camera.position.x,
			this.camera.position.y,
			distanceZ * Math.cos(interpolatedAngle)
		  );
		  this.camera.position.copy(newCameraPosition);
	  
		  this.renderer.render(this.scene, this.camera);
	  
		  this.totalRotationAngle = interpolatedAngle;
		};
	  
		requestAnimationFrame(animateRotation);
	  };
	
	  handleRightButtonClick = () => {
		const targetRotation = this.totalRotationAngle + Math.PI / 2; // Calculate the target rotation angle
		const startRotation = this.totalRotationAngle;
		const duration = 500; // Duration of the rotation animation in milliseconds
		const startTime = performance.now(); // Get the current timestamp
		const boundingBox = new THREE.Box3().setFromObject(this.model);
		const objectWidth = boundingBox.getSize(new THREE.Vector3()).x;
		const objectHeight = boundingBox.getSize(new THREE.Vector3()).y;
	  
		const aspectRatio = this.camera.aspect;
		const HFOV = THREE.MathUtils.degToRad(this.camera.fov);
		const VFOV = 2 * Math.atan(Math.tan(HFOV / 2) / aspectRatio);
	  
		const distanceZ = Math.max(
		  objectWidth / (2 * Math.tan(HFOV / 2)),
		  objectHeight / (2 * Math.tan(VFOV / 2))
		);
	  
		const animateRotation = (timestamp) => {
		  const elapsed = timestamp - startTime;
		  let progress = elapsed / duration;
	  
		  if (progress >= 1) {
			progress = 1;
		  } else {
			requestAnimationFrame(animateRotation);
		  }
	  
		  const interpolatedAngle = startRotation + (targetRotation - startRotation) * progress;
	  
		  const quaternion = new THREE.Quaternion();
		  quaternion.setFromEuler(new THREE.Euler(0, interpolatedAngle, 0));
		  this.camera.setRotationFromQuaternion(quaternion);
	  
		  const newCameraPosition = new THREE.Vector3(
			this.camera.position.x,
			this.camera.position.y,
			distanceZ * Math.cos(interpolatedAngle)
		  );
		  this.camera.position.copy(newCameraPosition);
	  
		  this.renderer.render(this.scene, this.camera);
	  
		  this.totalRotationAngle = interpolatedAngle;
		};
	  
		requestAnimationFrame(animateRotation);	
	};	  

	render() {
		return (
			<div className="canvas-container">
				<div id="check" ref={this.canvasRef}>
				<button className="left-button" onClick={this.handleLeftButtonClick}>
					<AiFillCaretLeft size={40} />
				</button>				
				<button className="right-button" onClick={this.handleRightButtonClick}>
				<AiFillCaretRight size={40} />
				</button>
				</div>
			</div>
		)
	}
}

export default ThreeScene;