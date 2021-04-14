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
			if (!deletedControls) deleteControls();

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

	// Create Maximize Button
	let button = document.createElement('div');
	button.onclick = toggleInterface;
	button.classList.add('fullscreenButton');
	stage.parentElement.appendChild(button);

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

let frameCount = 0;

render();

function render() {
	frameCount++;
	for (i in videos) {
		videos[i].style.top = Math.sin(frameCount * .01 + i * 40) * videos[i].parentElement.offsetHeight / 2 + videos[i].parentElement.offsetHeight / 2 + "px"
		videos[i].style.left = Math.cos(frameCount * .01 + i * 40) * videos[i].parentElement.offsetWidth / 2 + videos[i].parentElement.offsetWidth / 2 + "px"
	}
	requestAnimationFrame(render);
}