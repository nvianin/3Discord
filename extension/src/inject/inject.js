const videos = []
var stage, chat;
let mediastreams = [];

let username = "null_client"

let avatars = []
var avatar;

let clients = {};

let pageLoaded = false;
let AttributionCallback = null;

const socket = io('https://3discord.ddns.net:3000', {
	cors: {
		origin: "https://discord.com",
		extraHeaders: ["a-custom-header"],
		withCredentials: true
	}
});
socket.on('connect', e => {
	for (var i = 0; i < 5; i++) {
		console.log("CONNECTED TO SERVER " + i);
	}

	sendAttribution()

	console.log("Emitted message")

})

socket.on('client_joined', e => {
	console.log(e.name);
	if (e.name != username) {
		clients[e.id] = new Avatar(e.position.x, e.position.y, e.name);
		clients[e.id].id = e.id;
	} else {
		console.log("NOT ADDING SELF TO CLIENT LEDGER")
	}
})
socket.on('id_attribution', id => {
	avatar.id = id;
})
socket.on('client_left', e => {
	console.log(e.id + " LEFT")
	/* let i = avatars.findIndex(a => (e.id == a.id));
	avatars.splice(i, 1); */
	try {
		if (clients[e.id].name != username) {
			console.log(clients[e.id].name + " deleted from clients");
			clients[e.id].killed = true;
			console.log(clients[e.id].killed);
			/* let temp = clients[e.id]; */
			delete clients[e.id];
			/* console.log(temp + "WAS NOT BLOODY KILLED") */

			/* clients.splice(i, 1) */
		}
	} catch (e) {
		console.log(e)
	}
})

socket.on('movement_registration', e => {
	try {
		if (clients[e.id]) {
			/* console.log(e); */
			clients[e.id].position.x = e.position.x;
			clients[e.id].position.y = e.position.y;
			clients[e.id].acceleration.x = e.acceleration.x;
			clients[e.id].acceleration.y = e.acceleration.y;
		}
	} catch (e) {
		console.log(e);
	}
})

function sendAttribution() {
	if (pageLoaded && username != "null_client") {
		if (AttributionCallback) {
			clearInterval(AttributionCallback);
		}
		socket.emit('id_attribution', {
			name: username
		});
	} else {
		if (AttributionCallback == null) {
			AttributionCallback = setInterval(sendAttribution, 300);
		}
		console.log("retrying attribution")
	}

}

const SETTINGS = {
	grid_x: 20,
	grid_y: 20
}

let canCreateWalls = false;
let wallType = 0; //0 : horizontal, 1 : vertical

function createStats() {
	var stats = new Stats();
	stats.setMode(0);

	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0';
	stats.domElement.style.top = '0';

	return stats;
}



chrome.extension.sendMessage({}, function (response) {
	var readyStateCheckInterval = setInterval(function () {
		if (document.readyState === "complete") {

			pageLoaded = true;

			clearInterval(readyStateCheckInterval);

			// ----------------------------------------------------------
			// This part of the script triggers when page is done loading
			console.log("Hello. This message was sent from scripts/inject.js");
			console.log("HEEEEEEEEEEEEHHHH HO")
			console.log("I'm still here")


			stats = createStats()
			/* document.body.append(stats.domElement); */

			var all = document.querySelectorAll('*');
			let deletedControls = false;

			//	parse inital page content, remove, sort, delete.
			for (const e of all) {
				/* console.log(e.classList.toString()); */
				if (e.classList.toString().includes('media-engine-video')) receiveVideoElement(e) /* videos.push(e) */ ;
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
	/* console.log(clone) */

	let name = vid.parentElement.parentElement.getElementsByClassName('overlayTitleText-2mmQzi')[0].innerText
	console.log(name);

	let av = avatars.find(a => a.name == name);
	if (av) {
		av.video = vid;
		av.initVideo()
	}
	console.log(av)

	stripOfClassesExcept(clone, "media-engine-video")

	clone.srcObject = vid.srcObject
	/* clone.classList.add('custom_video') */
	/* clone.style.top = stage.offsetHeight / 2 - clone.offsetHeight / 2 - 50 + "px";
	clone.style.left = stage.offsetWidth / 2 - clone.offsetWidth / 2 - 50 + "px"; */

	/* stage.appendChild(clone); */

	/* if (avatar.video == null) {
		clone.classList.add("contained_video")
		avatar.dom.classList.add("contains_video")
		avatar.dom.appendChild(clone);
		avatar.video = clone;
	} */

	/* console.log(clone) */
	/* videos.push(clone); */
	console.log(videos.length)

	searchParentsLabels(vid);

	knownVideos.push(vid);
	/* knownVideos.push(clone); */



	console.log("appended video element to stage")
}

let mouseIsOnScreen = false;

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

let screen_mouse = new THREE.Vector2;

function createInterface() {

	username = document.getElementsByClassName("title-eS5yk3")[0].innerText;

	// Create stage element
	stage = document.createElement('div');
	stage.classList.add("stage")
	chat.appendChild(stage);

	// Create Maximize Button
	let button = document.createElement('div');
	button.onclick = toggleInterface;
	button.classList.add('fullscreenButton');
	stage.parentElement.appendChild(button);

	// Add Event Listeners to Stage
	stage.addEventListener('click', function () {
		/* console.log("ADSGASDGASDG") */
		/* groundMat.uniforms.isEditingGround.value = !groundMat.uniforms.isEditingGround.value; */
		/* if (floor(mouse.x %100)){} */


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

		if (canCreateWalls && false) {
			let w = new Wall(mouse.x, mouse.y, wallType);
		} else {
			camTarget.x = mouse.x;
			camTarget.y = mouse.y;
			camTarget.z = 1;
		}


		//DEBUG MARKER

		/* let cube = new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1), new THREE.MeshBasicMaterial({color:0xff00ff}));
		cube.position = new THREE.Vector3(mouse.x, mouse.y, 0);
		scene.add(cube) */

		//	Create client avatar


	})

	avatar = new Avatar(0, 0, username, true);
	let stageRect;

	stage.onmousemove = e => {
		stageRect = stage.getBoundingClientRect();
		/* console.log(e.clientX - stageRect.x, e.clientY - stageRect.y) */
		/* console.log(stageRect.width, stageRect.height) */

		normalized_mouse.x = ((e.clientX - stageRect.x) / stageRect.width) * 2 - 1;
		normalized_mouse.y = ((e.clientY - stageRect.y) / stageRect.height) * 2 - 1;
		normalized_mouse.y *= -1;


		screen_mouse.x = e.clientX - stageRect.x - stageRect.width / 2;
		screen_mouse.y = e.clientY - stageRect.y - stageRect.height / 2;

		/* console.log(screen_mouse.x - stageRect.width / 2); */



		/* normalized_mouse.x = ((e.clientX) / window.innerWidth) * 2 - 1;
		normalized_mouse.y = ((e.clientY) / window.innerHeight) * 2 - 1; */

		/* console.log(normalized_mouse) */
		/* console.log(intersects) */

		/* mouse.x += .5; */


		/* raycaster.setFromCamera(normalized_mouse, camera);
		const intersects = raycaster.intersectObjects([ground]);
		mouse.x = intersects[0].point.x;
		mouse.y = intersects[0].point.y;
		debugCube.position.x = mouse.x
		debugCube.position.y = mouse.y */



		/* console.log(camera.position); */
		/* mouse.y += 1; */

		/* console.log(mouse) */


		/* console.log(Math.floor((mouse.x * 100)) % 100, Math.floor((mouse.y * 100) % 100)); */

		ground.onBeforeRender = () => {
			groundMat.uniforms.mousePos.value.x = mouse.x;
			groundMat.uniforms.mousePos.value.y = mouse.y;
		}



	}

	stage.onmouseenter = () => {
		console.log("mouse in");

		mouseIsOnScreen = true;

	}
	stage.onmouseleave = () => {
		console.log("mouse out");
		mouseIsOnScreen = false;
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
	if (stage) {
		stageRect = stage.getBoundingClientRect();
	}
	try {
		camera.aspect = stage.offsetWidth / stage.offsetHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(stage.offsetWidth, stage.offsetHeight);
	} catch (e) {

	}
}
let mouse = new THREE.Vector3();

let camTarget = new THREE.Vector3(0, 0, 1);

let dt = 0;
let then, now;
then = now = Date.now();

function render() {
	now = Date.now();
	dt = (now - then) / 10;
	frameCount++;


	if (prevDims.x != window.innerWidth || prevDims.y != window.innerHeight) resize()

	try {
		if (renderer) {
			renderer.render(scene, camera);
			/* composer.render(); */
		}
	} catch {}

	/* if (camTarget != undefined && camera != undefined) {
		camera.position.lerp(camTarget, .1);
	} */
	try {
		if (camera) {
			raycaster.setFromCamera(normalized_mouse, camera);
			const intersects = raycaster.intersectObjects([ground]);
			if (intersects[0]) {
				mouse.x = intersects[0].point.x;
				mouse.y = intersects[0].point.y;
				debugCube.position.x = mouse.x
				debugCube.position.y = mouse.y
				debugCube.position.z = intersects[0].point.z;
			}

			let min_dist = 100;
			let max_dist = Math.min(300, (stage.offsetWidth / 4) - 30);

			if (screen_mouse.length() > min_dist && mouseIsOnScreen) {
				let force = Math.max(Math.min((screen_mouse.length() - min_dist) / max_dist, 1), 0);
				/* if (frameCount % 10 == 0) console.log(force); */
				force = mouse.clone().sub(avatar.object.position).multiplyScalar(force * dt * .001);


				avatar.addForce(new THREE.Vector3(force.x, force.y, 0));
				socket.emit('movement_registration', {
					position: avatar.object.position,
					acceleration: avatar.acceleration
				})
				/* console.log(avatar.object.position, avatar.acceleration); */
			}
		}
	} catch (e) {
		console.log(e);
	}

	if (frameCount % 100 == 0) {
		/* console.log(mouse.x, mouse.y);
		console.log(mouse.x % (SETTINGS.grid_x / 100)) */
		/* console.log(camera.getWorldPosition()); */
	}
	let margin = .02;
	let coordX = Math.abs(mouse.x) % (SETTINGS.grid_x / 100)
	let coordY = Math.abs(mouse.y) % (SETTINGS.grid_y / 100)
	if ((coordX < margin || coordX > SETTINGS.grid_x / 100 - margin)) {
		/* document.body.style.cursor = "pointer" */
		canCreateWalls = true;
		wallType = 0;

	} else if (coordY < margin || coordY > SETTINGS.grid_y / 100 - margin) {
		/* document.body.style.cursor = "pointer" */
		canCreateWalls = true;
		wallType = 1;

	} else {
		/* document.body.style.cursor = "default" */
		canCreateWalls = false;
	}

	for (a of avatars) {
		/* if (frameCount % 50 == 0) console.log(a) */


		if (a.killed && a.name != username) {
			console.log("fuck");
			console.log("killing " + a.name)
			for (let e of document.getElementsByClassName("custom_video")) {
				if (e.id == a.name) {
					e.parentElement.removeChild(e)
				}
			}
			a.kill();
			avatars.splice(avatars.findIndex(e => {
				e == a
			}), 1);
			delete a;
		} else {
			a.update();
		}
	}
	try {
		avatar.update()
	} catch {}

	prevDims.x = window.innerWidth;
	prevDims.y = window.innerHeight;


	then = now;
	requestAnimationFrame(render);
}

render()

function fetchUsers() {
	var pictures = document.getElementsByClassName("avatarWrapper-29j3CC");
	let userPics = {}
	for (pic of pictures) {
		userPics[pic.ariaLabel] = pic.getElementsByTagName('img')[0].src;
	}
	return userPics;
}

console.log(fetchUsers);