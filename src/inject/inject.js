const videos = []
var stage, chat;
let mediastreams = [];



chrome.extension.sendMessage({}, function (response) {
	var readyStateCheckInterval = setInterval(function () {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			// ----------------------------------------------------------
			// This part of the script triggers when page is done loading
			console.log("Hello. This message was sent from scripts/inject.js");
			console.log("HEEEEEEEEEEEEHHHH HO")
			console.log("I'm still here")

			var all = document.querySelectorAll('*');
			let deletedControls = false;

			//	parse inital page content, remove, sort, delete.
			for (const e of all) {
				/* console.log(e.classList.toString()); */
				if (e.classList.toString().includes('media-engine-video')) videos.push(e);
				if (e.classList.toString().includes('chat')) {
					/* console.log(e); */
					if (e.parentElement.classList.toString().includes('content')) {
						receiveChatElement(e)
					}
				};
				if (e.classList.toString().includes('videoControls')) {
					e.parentElement.removeChild(e);
					deletedControls = true;
				}
			}
			/* if (!deletedControls) deleteControls(); */

			/* if (!deletedControls) {
				let controlsDeletionInterval = setInterval(() => {
					clearInterval(controlsDeletionInterval);
				}, 200)
			} */

			setInterval(() => {
				fetchVideos();
				/* console.log(videos)
				console.log(stage) */
			}, 500)

			const MutationCallBack = (mutationsList, observer) => {
				/* console.log("OBSERVING MUTATION") */
				/* console.log(mutationsList) */

				for (const mutation of mutationsList) {
					if (mutation.target.classList.toString().includes('media-engine-video')) {
						/* console.log(mutation.target.classList.toString()) */
						/* videos.push(mutation.target)
						console.log(videos) */
					}
					if (mutation.target.classList.toString().includes('chat') && !stage) {
						/* console.log(mutation.target); */
						console.log("CHAT FOUND IN MUTATION")
						/* stage = mutation.target; */
						receiveChatElement(mutation.target);
					}
					/* if (mutation.target.classList.toString().includes('videoControls')) {
						mutation.target.parentElement.removeChild(mutation.target);
						console.log("video controls deleted")
					} */
					if (mutation.type === 'childlist') {
						/* console.log('Node altered'); */
					} else if (mutation.type === 'attributes') {
						/* console.log(mutation.attributeName + ' altered'); */
					}
				}
			};
			const observer = new MutationObserver(MutationCallBack);
			observer.observe(document.body, {
				attributes: true,
				childList: true,
				subtree: true
			})
			// ----------------------------------------------------------
		}
	}, 10);
});


function cleanVideos() {
	//trash empty elements
	for (i in videos) {
		if (!videos[i].captureStream().active) {
			videos[i].parentElement.removeChild(videos[i])
			videos.splice(i, 1)
			console.log("DELETED INACTIVE VIDEO !!!!!!!")
		};
	}
}

let knownVideos = []

function fetchVideos() {
	/* cleanVideos() */
	// Take video elements from anywhere and put them into stage
	video_elements = document.getElementsByClassName('media-engine-video');
	for (var i = 0; i < video_elements.length; i++) {
		const new_vid = video_elements[i];
		var failed = false;
		/* console.log(knownVideos) */
		for (vid of knownVideos) {
			if (vid == new_vid) {
				failed = true;
				console.log("VIDEO ALREADY KNOWN")
			}
		}


		if (!failed && !new_vid.parentElement.classList.toString().includes('chat')) {
			console.log("NEW VIDEO FOUND")
			if (stage) {
				receiveVideoElement(new_vid)
				cleanFrame()
			} else {
				// try again until stage is available
				let inter = setInterval(() => {
					console.log("waiting for stage to append video elem")
					if (stage) {
						clearInterval(inter)
						receiveVideoElement(new_vid)
						cleanFrame()
					}
				}, 500);
			}
		}
	}
}


function receiveVideoElement(vid) {
	/* let clone = vid.cloneNode();
					stage.appendChild(clone); */
	/* stage.appendChild(vid) */

	mediastreams.push(vid.captureStream());

	let clone = vid.cloneNode();
	/* for (c of clone.classList) {
		console.log(c);
		if (c != "media-engine-video") {
			clone.classList.remove(c)
		}
	} */
	console.log("Original/Clone below:")
	console.log(vid)
	console.log(clone)

	stripOfClassesExcept(clone, "media-engine-video")

	clone.srcObject = vid.srcObject
	clone.classList.add('custom_video')
	clone.style.top = stage.offsetHeight / 2 - clone.offsetHeight / 2-50 + "px";
	clone.style.left = stage.offsetWidth / 2 - clone.offsetWidth / 2-50 + "px";

	stage.appendChild(clone);

	/* console.log(clone) */
	videos.push(clone);
	console.log(videos.length)

	searchParentsLabels(vid);

	knownVideos.push(vid);
	knownVideos.push(clone);



	console.log("appended video element to stage")
}

function receiveChatElement(e) {

	console.log("FOUND CHAT, APPENDING STAGE")
	chat = e
	/* console.log(stage) */
	createInterface()
}

function stripOfClassesExcept(e, exception) {
	for (let i = 0; i < e.classList.length; i++) {
		/* console.log(e.classList[i]) */
		if (e.classList[i] != exception) {
			console.log("removing " + e.classList[i])
			e.classList.remove(e.classList[i])
			console.log(e.classList)
		}
		e.classList.remove('videoContain-2ih_gc')
	}
}

function createInterface() {

	// Create stage element
	stage = document.createElement('div');
	stage.classList.add("stage")
	chat.appendChild(stage);

	// Add Event Listeners to Stage
	stage.addEventListener('click', function () {
		console.log("ADSGASDGASDG")
		/* groundMat.uniforms.isEditingGround.value = !groundMat.uniforms.isEditingGround.value; */
		/* if (floor(mouse.x %100)){} */

		camTarget.x = mouse.x;
		camTarget.y = mouse.y*-1;
		camTarget.z = 1;
		/* const coords = {
			x: 0,
			y: 0
		};
		var camTween = new TWEEN.Tween(coords)
			.to({
				x: mouse.x,
				y: mouse.y
			}, 400)
			.onUpdate(() => {
				console.log(coords);
			})
			.start();
		console.log(camTween);
		console.log(camera.position)
		console.log(mouse.x, mouse.y) */


		//DEBUG MARKER

		/* let cube = new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1), new THREE.MeshBasicMaterial({color:0xff00ff}));
		cube.position = new THREE.Vector3(mouse.x, mouse.y, 0);
		scene.add(cube) */


	})

	stage.onmousemove = e => {
		let stageRect = stage.getBoundingClientRect();
		console.log(e.clientX - stageRect.x, e.clientY - stageRect.y)
		/* console.log(stageRect.width,stageRect.height) */

		normalized_mouse.x = ((e.clientX - stageRect.x) / stageRect.width) * 2 - 1;
		normalized_mouse.y = ((e.clientY - stageRect.y) / stageRect.height) * 2 - 1;

		/* normalized_mouse.x = ((e.clientX) / window.innerWidth) * 2 - 1;
		normalized_mouse.y = ((e.clientY) / window.innerHeight) * 2 - 1; */

		/* console.log(normalized_mouse) */
		raycaster.setFromCamera(normalized_mouse, camera);
		const intersects = raycaster.intersectObjects([ground]);
		/* console.log(intersects) */

		mouse.x = intersects[0].point.x;
		mouse.x += .5;
		mouse.y = intersects[0].point.y;
		/* mouse.y += 1; */

		/* console.log(mouse) */


		/* console.log(Math.floor((mouse.x * 100)) % 100, Math.floor((mouse.y * 100) % 100)); */

		ground.onBeforeRender = () => {
			groundMat.uniforms.mousePos.value.x = mouse.x;
			groundMat.uniforms.mousePos.value.y = mouse.y;
		}

		// Create Maximize Button
		let button = document.createElement('div');
		button.onclick = toggleInterface;
		button.classList.add('fullscreenButton');
		stage.parentElement.appendChild(button);

	}
}

function toggleInterface() {
	if (stage.style.display == "block" || stage.style.display == "") {
		stage.style.display = "none";
	} else {
		stage.style.display = "block"
	}
}

function deleteControls() {
	const a = document.querySelectorAll('*')
	for (e of a) {
		if (e.classList.toString().includes('videoControls')) {
			e.parentElement.removeChild(e)
			console.log("successfuly deleted controls")
			return true;
		}
	}
	return false;
}

function searchParentsLabels(e) {
	if (e.parentElement) {
		if (e.parentElement.ariaLabel) {
			console.log("FOUND MATCH")
			console.log(e.parentElement)
			return e.parentElement
		} else {
			searchParentsLabels(e.parentElement);
		}
	}
}

/* setInterval(cleanFrame, 1000) */

function cleanFrame() {
	return false
	for (child of stage.children) {
		if (!child.classList.toString().includes('media-engine-video')) {
			stage.removeChild(child)
			console.log("removed " + child)
		};
	}
}

let frameCount = time = 0;
let prevDims = {
	x: 0,
	y: 0
}
const resize = () => {
	/* console.log(stage.offsetWidth, stage.offsetHeight) */
	camera.aspect = stage.offsetWidth / stage.offsetHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(stage.offsetWidth, stage.offsetHeight);
}
let mouse = {
	x: 0,
	y: 0
}

let camTarget = new THREE.Vector3(0,0,1);
render();


function render() {
	frameCount++;
	/* for (i in videos) {
		videos[i].style.top = Math.sin(frameCount * .01 + i * 40) * videos[i].parentElement.offsetHeight / 2 + videos[i].parentElement.offsetHeight / 2 + "px"
		videos[i].style.left = Math.cos(frameCount * .01 + i * 40) * videos[i].parentElement.offsetWidth / 2 + videos[i].parentElement.offsetWidth / 2 + "px"
	} */
	requestAnimationFrame(render);

	if (prevDims.x != window.innerWidth || prevDims.y != window.innerHeight) resize()

	if (renderer != undefined) {
		renderer.render(scene, camera);
	}

	if (camTarget != undefined) {
		camera.position.lerp(camTarget, .1);
		console.log(camera.position);
	}


	prevDims.x = window.innerWidth;
	prevDims.y = window.innerHeight;
}