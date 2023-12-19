//initializing Arduino-serial variables
let serialConnect;
let connectButton;
let readyToReceive;

let projectSound;
let projectFont;

//initializing FFT-related variables
let projectSound_FFT;
let bassEQ;
let highMidEQ;
let midEQ;
let lowMidEQ;
let trebleEQ;

//initializing on-screen visualizer-related variables
let bassEQ_viz;
let highMidEQ_viz;
let midEQ_viz;
let lowMidEQ_viz;
let trebleEQ_viz;

//variable to detect whether audio is playing or not
let soundActive = 0;

//pre-loading project multimedia files
function preload()
{
  projectSound = loadSound("./Bonfire.mp3");
  projectFont = loadFont("./Gugi.ttf");
}

function receiveSerial()
{
  let line = serialConnect.readUntil("\n");
  trim(line);
  if(!line) return;

  if(line.CharAt(0) != "{")
  {
    print("error: ",line);
    readyToReceive = true;
    return;
  }

  let data = JSON.parse(line).data;
  readyToReceive = true;
}

function connectToSerial()
{
  if(!serialConnect.open(9600))
  {
    serialConnect.open(9600);
    readyToReceive = true;
    connectButton.buttonVisibility(0);
  }
}

//class instance for creating media-player buttons
class projectButtons
{
  constructor(_buttonName, _xPosButton, _yPosButton, _clickFunction, _visibleFlag)
  {
    this.button = createButton(_buttonName);
    this.button.position(_xPosButton, _yPosButton);
    this.button.style("width", width/12+"px");
    this.button.style("height", width/30+"px");
    this.button.style("border-radius", "10px");
    this.button.mouseClicked(_clickFunction);
    
    if(_visibleFlag==0)
    {
      this.button.hide();
    }
    else
    {
      this.button.show();
    }
  }
  changeButtonName(_newName)
  {
    this.button.html(_newName);
  }
  buttonVisibility(_visibleFlag)
  {
    if(_visibleFlag==1)
    {
      this.button.show();
    }
    else
    {
      this.button.hide();
    }
  }
}

function setup()
{
  createCanvas(windowWidth, windowHeight);
  background(0);

  projectSound_FFT = new p5.FFT();

  readyToReceive = false;
  serialConnect = createSerial();
  connectButton = new projectButtons('INITIATE', width/2-60, height/1.75, connectToSerial, 1);
}

function draw()
{
  background(0);

  //generating main text
  textAlign(CENTER,CENTER);
  textSize(50);
  textFont(projectFont);
  noStroke();
  fill(255);
  text("the music visualizer", width/2, height/2.05);

  if(readyToReceive)
  {
    textSize(18);
    fill(0,255,0);
    text("press [space] to play/pause audio", width/2, height/1.83);
    projectSound_FFT.analyze();

    // segregating audio frequencies based on bands
    bassEQ = projectSound_FFT.getEnergy('bass');
    lowMidEQ = projectSound_FFT.getEnergy('lowMid');
    midEQ = projectSound_FFT.getEnergy('mid');
    highMidEQ = projectSound_FFT.getEnergy('highMid');
    trebleEQ = projectSound_FFT.getEnergy('treble');

    //mapping frequency values for on-screen visualizer
    bassEQ_viz = map(bassEQ, 0, 255, 0, height);
    lowMidEQ_viz = map(lowMidEQ, 0, 255, 0, height);
    midEQ_viz = map(midEQ, 0, 255, 0, width);
    highMidEQ_viz = map(highMidEQ, 0, 255, 0, height);
    trebleEQ_viz = map(trebleEQ, 0, 255, 0, width);

    //generating visualizer
    if(soundActive==1)
    {
      noStroke();
      
      //bass ellipses - red
      fill(255,0,0);
      if(bassEQ>=245)
      {
        vizGenerator();
      }
      
      //lowMid ellipses - yellow
      fill(0);
      drawingContext.save();
        ellipse(width/2, height/2, 1300);
        fill(255,255,0);
        drawingContext.clip();
        if(lowMidEQ>=210)
        {
          vizGenerator();
        }
      drawingContext.restore();
      
      //mid ellipses - green
      fill(0);
      drawingContext.save();
        ellipse(width/2, height/2, 1000);
        fill(0,255,0);
        drawingContext.clip();
        if(midEQ>=188)
        {
          vizGenerator();
        }
      drawingContext.restore();

      //highMid ellipses - blue
      fill(0);
      drawingContext.save();
        ellipse(width/2, height/2, 700);
        fill(0,0,255);
        drawingContext.clip();
        if(highMidEQ>=160)
        {
          vizGenerator();
        }
      drawingContext.restore();

      //treble ellipses - white
      fill(0);
      drawingContext.save();
        ellipse(width/2, height/2, 400);
        fill(255);
        drawingContext.clip();
        if(trebleEQ>=170)
        {
          vizGenerator();
        }
      drawingContext.restore();
    }
  }

  if(serialConnect.opened() && readyToReceive)
  {
    serialConnect.clear();

    //sending communication to Arduino
    if(soundActive==1)
    {
      if(bassEQ>=245)
      {
        serialConnect.write('B');
      }
      if(bassEQ<245)
      {
        serialConnect.write('A'); 
      }
      if(lowMidEQ>=210)
      {
        serialConnect.write('L');
      }
      if(lowMidEQ<210)
      {
        serialConnect.write('K');
      }
      if(midEQ>=188)
      {
        serialConnect.write('M');
      }
      if(midEQ<188)
      {
        serialConnect.write('N'); 
      }
      if(projectSound.currentTime()>=55.26 && projectSound.currentTime()<121.48)
      {
        if(highMidEQ>=185)
        {
          serialConnect.write('H');
        }
        else
        {
          serialConnect.write('I'); 
        }
      }
      if(projectSound.currentTime()<55.26 || projectSound.currentTime()>=121.48)
      {
        if(highMidEQ>=160)
        {
          serialConnect.write('H');
        }
        else
        {
        serialConnect.write('I'); 
        }
      }      
      if(trebleEQ>=170)
      {
        serialConnect.write('T');
      }
      if(trebleEQ<170)
      {
        serialConnect.write('U'); 
      }
    }
    else
    {
      serialConnect.write('X');
    }
  }

  if(serialConnect.availableBytes()>0)
  {
    receiveSerial();
  }
}

//function to generate the circles-based visualizer
function vizGenerator()
{
  for(let i=0; i<350; i++)
  {
    ellipse(random(0,width), random(0,height), 30);
  }
}

//function to play/pause/stop audio
function keyTyped()
{
  if(projectSound.isPlaying())
  {
    if(keyCode == 32) //keyCode = 32 is Spacebar
    {
      projectSound.pause();
      soundActive = 0;
    }
    else if(keyCode == 83) //keyCode = 83 is 's' key
    {
      projectSound.stop();
      soundActive = 0;
    }
  }
  else
  {
    if(keyCode == 32 && readyToReceive)
    {
      projectSound.play();
      soundActive = 1;
    }
    else if(keyCode == 83)
    {
      projectSound.stop();
      soundActive = 0;
    }
  }
}