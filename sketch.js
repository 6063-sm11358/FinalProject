//initializing Arduino-serial variables
let serialConnect;
let connectButton;
let readyToReceive;

let projectSound;
let playButton;

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

//pre-loading project media files
function preload()
{
  projectSound = loadSound("./Right In.mp3");
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
    connectButton.hide();
  }
}

//class button
// {
//   class initialization for generating media-player buttons like play/pause/stop
// }

function setup()
{
  createCanvas(windowWidth, windowHeight);
  background(0);

  projectSound_FFT = new p5.FFT();

  readyToReceive = false;
  serialConnect = createSerial();

  connectButton = createButton("Initiate Connection");
  connectButton.position(width/2-50, height/2);
  connectButton.mouseClicked(connectToSerial);

  playButton = createButton("Play Sound");
  playButton.position(width/2-50, height/2);
  playButton.mouseClicked(playAudio);
  playButton.hide();
}

function draw()
{
  background(0);

  if(readyToReceive)
  {
    playButton.show();
    projectSound_FFT.analyze();

    //segregating audio frequencies based on bands
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

    noFill();
    strokeWeight(2);

    //generating ellipses for each audio band (visualizer to be upgraded)
    stroke(255,0,0);
    ellipse(width/2, height/2, bassEQ_viz);
    stroke(255,255,0);
    ellipse(width/2, height/2, lowMidEQ_viz);
    stroke(0,255,0);
    ellipse(width/2, height/2, midEQ_viz);
    stroke(0,0,255);
    ellipse(width/2, height/2, highMidEQ_viz);
    stroke(255,255,255);
    ellipse(width/2, height/2, trebleEQ_viz);
  }

  if(serialConnect.opened() && readyToReceive)
  {
    serialConnect.clear();

    //sending communication to Arduino (will find more elegant solution than multiple 'ifs')
    if(soundActive==1)
    {
      print(midEQ);
      if(bassEQ>=240)
      {
        serialConnect.write('B');
      }
      if(bassEQ<240)
      {
        serialConnect.write('A'); 
      }
      if(lowMidEQ>=200)
      {
        serialConnect.write('L');
      }
      if(lowMidEQ<200)
      {
        serialConnect.write('K');
      }
      if(midEQ>=175)
      {
        serialConnect.write('M');
      }
      if(midEQ<175)
      {
        serialConnect.write('N'); 
      }
      if(highMidEQ>=160)
      {
        serialConnect.write('H');
      }
      if(highMidEQ<160)
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

//function to activate audio
function playAudio()
{
  if(projectSound.isPlaying())
  {
    projectSound.pause();
    soundActive = 0;
  }
  else
  {
    projectSound.play();
    soundActive = 1;
  }
}