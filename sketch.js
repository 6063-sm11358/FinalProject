//initializing Arduino-serial variables
let serialConnect;
let connectButton;
let readyToReceive;

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
let projectSound;
let soundActive = 0;

//pre-loading project multimedia files
function preload()
{
  projectSound = loadSound("./Equinox.mp3");
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

  connectButton = new projectButtons('INITIATE', width/2-50, height/2, connectToSerial, 1);
}

function draw()
{
  background(0);

  if(readyToReceive)
  {
    projectSound_FFT.analyze();

    // segregating audio frequencies based on bands
    bassEQ = projectSound_FFT.getEnergy('bass');
    lowMidEQ = projectSound_FFT.getEnergy('lowMid');
    midEQ = projectSound_FFT.getEnergy('mid');
    highMidEQ = projectSound_FFT.getEnergy('highMid');
    trebleEQ = projectSound_FFT.getEnergy('treble');

    print(trebleEQ);

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
      if(bassEQ>=240)
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
        if(midEQ>=180)
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
        if(highMidEQ>=165)
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
        if(trebleEQ>=155)
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
      if(bassEQ>=240)
      {
        serialConnect.write('B');
      }
      if(bassEQ<240)
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
      if(midEQ>=180)
      {
        serialConnect.write('M');
      }
      if(midEQ<180)
      {
        serialConnect.write('N'); 
      }
      if(highMidEQ>=165)
      {
        serialConnect.write('H');
      }
      if(highMidEQ<165)
      {
        serialConnect.write('I'); 
      }      
      if(trebleEQ>=155)
      {
        serialConnect.write('T');
      }
      if(trebleEQ<155)
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
    ellipse(random(0,width), random(0,height), 20);
  }
}

//function to play/pause audio
function keyTyped()
{
  if(projectSound.isPlaying())
  {
    if(key == 'p')
    {
      projectSound.pause();
      soundActive = 0;
    }
  }
  else
  {
    if(key == 'p')
    {
      projectSound.play();
      soundActive = 1;
    }
  }
}