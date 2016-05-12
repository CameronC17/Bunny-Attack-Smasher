var renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0x66ff66});
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

//Loads Textures Here using pixi loader ##################################################
var resources = PIXI.loader.resources;
PIXI.loader
	.add("bunny.png")
	.add("hammertime.png")
	.add("bg.png")
	.add("heart.png")
	.load(loaded);

//text style (totally not stolen from your examples :P)
var style = {
    font : 'bold italic 28px Arial',
    fill : '#F7EDCA',
    stroke : '#4a1850',
    strokeThickness : 5,
    dropShadow : true,
    dropShadowColor : '#000000',
    dropShadowAngle : Math.PI / 6,
    dropShadowDistance : 6
}

var endStyle = {
    font : 'bold italic 44px Arial',
    fill : '#e60000',
    stroke : '#660000',
    strokeThickness : 8,
    dropShadow : true,
    dropShadowColor : '#000000',
    dropShadowAngle : Math.PI / 6,
    dropShadowDistance : 8,
    wordWrap : true,
    wordWrapWidth : 720
}

//Container to hold the bunnies. hammer doesn't need a container as its a single object
var bunnyContainer = new PIXI.Container();
bunnyContainer.x = 0;
bunnyContainer.y = 0;
var bunnyArray = [];

//Game variables here! :)
var score = 0;
var bunnyCount = 5;
var lives = 5;
var lifeContainer = new PIXI.Container();

//hammer class
class Hammer {
	constructor() {
		this.hammer = new PIXI.Sprite();
		this.animationFinished = true;
		this.hammerDown = false;
	}

	createHammer(texture) {
		this.hammer = texture;
		this.hammer.x = renderer.width - 200;
		this.hammer.y = renderer.height - 278;

		this.hammer.anchor.x = 0.5;
		this.hammer.anchor.y = 0.5;
	}

	getHammer() {
		return this.hammer;
	}

	getCoordinates() {
		return [this.hammerX, this.hammerY];
	}

	setCoordinates(position) {
		this.hammer.x = position[0];
		this.hammer.y = position[1];
	}

	rotation() {
		this.hammer.rotation -= 0.1;
	}

	mouseClicked(mousePos) {	
		if (lives > 0)
		{	
			this.animationFinished = false;
			var hitABunny = false;
			//checks if we hit a bunny
			for (var i = 0; i < bunnyArray.length; i++)
			{
				var tempBunny = bunnyArray[i].getBunny();
				if (isInside(mousePos[0], mousePos[1], tempBunny.x, tempBunny.y, tempBunny.width, tempBunny.height) && !hitABunny)
				{
					bunnyArray[i].hitBunny();
					score++;
					hitABunny = true;
				}
			}
			if (!hitABunny)
			{
				lives--;			
			}
		}
	}

	animationStuff() {
		if (!this.animationFinished)
		{
			//if the hammer has rotated to the bottom
			if (this.hammer.rotation < -1.5)
				this.hammerDown = true;

			//if the hammer has reached the top
			if (this.hammer.rotation > 0)
			{
				this.animationFinished = true;
				this.hammerDown = false;
			}

			//if hammer hasnt reached hit spot yet
			if (!this.hammerDown)
				this.hammer.rotation -= 0.3;
			else
				this.hammer.rotation += 0.07;
		}
	}
}

class Timer {
	constructor() {
		this.time = 0;
		this.lastIncrement = new Date().getTime();
		this.spawnedBunny = new Date().getTime();
		this.stopped = false;
	}

	doTimeStuff() {
		if (lives > 0) {
			var currentTime = new Date().getTime();
			if (currentTime - this.lastIncrement > 1000)
			{
				this.time++;
				this.lastIncrement = currentTime;
			}
		}
	}

	getTime() {
		return this.time;
	}

	spawnedBunny() {
		this.spawnedBunny = new Date().getTime();
	}

	canSpawn() {
		var nowTime = new Date().getTime();
		if (nowTime > this.spawnedBunny + 10*(100 - parseInt(this.time / 1000)))
		{
			this.spawnedBunny = nowTime;
			return true;
		}
		return false;
	}
}

class Bunny {
	constructor() {
		this.bunny = new PIXI.Sprite();
		this.bunny.interactive = true;
		this.bunny.buttonMode = true;
		this.bunny.on('mousedown', bunnyDown);
		this.bunny.defaultCursor = "crosshair";

		this.risen = false;
		this.spawned = new Date().getTime();
		this.upTime = (Math.floor(Math.random() * 5) + 3)*1000;

		this.hit = false;
		this.size = 1;
		this.numBunny = -1;
	}

	createBunny(texture) {
		var scale = 0;
		if (lives <= 0)
		{
			scale += (Math.random() * 2) + 0;
		}
		this.bunny = texture;
		this.bunny.x = Math.floor(Math.random() * 630) + 70;
		this.bunny.y = Math.floor(Math.random() * 470) + 70;

		this.bunny.anchor.x = 0.3;
		this.bunny.anchor.y = 0.3;

		this.bunny.scale.x += scale;
		this.bunny.scale.y += scale;
	}

	getBunny() {
		return this.bunny;
	}

	checkDepawn() {
		//this func removes the bunny after a random period of time
		var newTime = new Date().getTime();
		if (newTime > this.spawned + this.upTime && !this.hit)
			return true;
		return false;
	}

	hitAnimation() {
		if (this.hit) {
			if (this.size > 0) {
				this.size -= 0.01;

				bunnyContainer.getChildAt(bunnyContainer.getChildIndex(this.getBunny())).scale.x = this.size;
				bunnyContainer.getChildAt(bunnyContainer.getChildIndex(this.getBunny())).scale.y = this.size;
				bunnyContainer.getChildAt(bunnyContainer.getChildIndex(this.getBunny())).rotation += 0.25;
			}
			else
				this.byeBunny();
		}
	}

	hitBunny() {
		this.hit = true;
	}

	byeBunny() {
		bunnyContainer.removeChild(this.getBunny());
		bunnyArray.splice(bunnyArray.indexOf(this), 1);
	}
}

//Create hammer object to be modified
var hammer = new Hammer();

//Create timer object
var timer = new Timer();

//Draw game stuff that doesnt require a load, such as text
var scoreText = new PIXI.Text('Your score: ' + score,style);
scoreText.x = 22;
scoreText.y = 10;
stage.addChild(scoreText);

var timeText = new PIXI.Text('Time: ' + 0,style);
timeText.x = 632;
timeText.y = 10;
stage.addChild(timeText);

var lifeText = new PIXI.Text('Lives:',style);
lifeText.x = 316;
lifeText.y = 10;
stage.addChild(lifeText);

var endText = new PIXI.Text("It's too late... 	                                        the bunnies have taken over...",endStyle);
endText.x = 75;
endText.y = 200;


//Waits for all images to load
function loaded()
{
	//Creates background image
	createBackground();

	//Adding this now ensures the bunnies are the correct priority on the screen
	stage.addChild(bunnyContainer);

	//Repopulate bunny container with the amount of bunnies needed
	//this is a function here because it is reused elsewhere! this is why it cant have the addChild to the stage
	createBunnies();

	stage.addChild(lifeContainer);
	drawLife();

	//Creates the hammer sprite animation
	createHammer();

	//Everything is ready! lets animate!
	animate();
}

function isInside(x, y, targetX, targetY, width, height) {
	if (x > targetX - (width / 2) && x < targetX + width / 2 && y > targetY - height / 2 && y < targetY + height / 2)
		return true
	return false;
}

function createBackground() {
	var bgTexture = resources["bg.png"].texture;
	var bg = new PIXI.Sprite(bgTexture);
	bg.x = 0;
	bg.y = 0;
	bg.width = 1000;
	bg.height = 1000;
	bg.interactive = true;
	bg.buttonMode = true;
	bg.defaultCursor = "crosshair";
	bg.on('mousedown', onDown);
	bg.on('touchstart', onDown);
	bg.on('mousemove', onMove);
	stage.addChild(bg);
}

function drawLife() {
	lifeContainer.removeChildren();
	var lifeTexture = resources["heart.png"].texture;
	var xPos = 410;
	for (var i = 0; i < lives; i++)
	{
		var heart = new PIXI.Sprite(lifeTexture);
		heart.x = xPos;
		heart.y = 12;
		xPos += 32;
		lifeContainer.addChild(heart);
	}
}

function createHammer() {
	var rectangle = new PIXI.Rectangle(0, 0, 200, 278);
	var hammerTexture = resources["hammertime.png"].texture;
	hammerTexture.frame = rectangle;
	hammer.createHammer(new PIXI.Sprite(hammerTexture));
	stage.addChild(hammer.getHammer());
}

function createBunnies() {
	var bunnyTexture = resources["bunny.png"].texture;
	var bunny = new Bunny();
	bunny.createBunny(new PIXI.Sprite(bunnyTexture));
	bunnyArray.push(bunny);		
	bunnyContainer.addChild(bunny.getBunny());
}

//mousedown event
function onDown(mouseEvent) {
	//extra numbers after x and y are for positioning the click over the hammer head
	hammer.setCoordinates([mouseEvent.data.global.x + 70, mouseEvent.data.global.y - 50]);
	hammer.mouseClicked([mouseEvent.data.global.x, mouseEvent.data.global.y]);
}

//mouse move event
function onMove(mouseEvent) {
	//extra numbers after x and y are for positioning the click over the hammer head
	hammer.setCoordinates([mouseEvent.data.global.x + 70, mouseEvent.data.global.y - 50]);
}

function bunnyDown (mouseEvent) {
	score++;
	scoreText.text = "Your score: " + score;
	onDown(mouseEvent);
	bunnyContainer.removeChild();
}

function drawText() {
	timeText.text = "Time: " + timer.getTime();
	scoreText.text = "Your score: " + score;
	lifeText.text = "Lives: ";	
	drawLife();
	if (lives <= 0) {
		stage.addChild(endText);
	}

}

function randomSpawnBunny() {
	if (timer.canSpawn() && lives > 0) {
		createBunnies();
	}
	if (lives <= 0)	{
		createBunnies();
	}
}

function checkDespawnBunny() {
	for (var i = 0; i < bunnyArray.length; i++)
	{
		var tempBunny = bunnyArray[i];
		if (tempBunny.checkDepawn())
		{
			lives--;
			bunnyArray.splice(i, 1);
			bunnyContainer.removeChildAt(i);
		}
	}
}

function bunnyStuff()  {
	randomSpawnBunny();
    checkDespawnBunny();
    bunnyAnimations();
}

function bunnyAnimations() {
    for (var i = 0; i < bunnyArray.length; i++)
    {
    	bunnyArray[i].hitAnimation();
    }
}


// begin animation
function animate() {
	//loop animation frame
    requestAnimationFrame(animate);

    hammer.animationStuff();
    timer.doTimeStuff();
    bunnyStuff();    
    drawText();

    // render the root container
    renderer.render(stage);
}