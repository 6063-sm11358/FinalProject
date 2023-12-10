#include <ArduinoJson.h>

void sendData()
{
  StaticJsonDocument<128> resJson;
  JsonObject data = resJson.createNestedObject("data");

  String resTxt = "";
  serializeJson(resJson, resTxt);
  Serial.println(resTxt);
}

void setup()
{
  Serial.begin(9600);
  while(!Serial)
  {
    //empty
  }

  pinMode(2,OUTPUT);  //Red LED - bass
  pinMode(4,OUTPUT);  //Yellow LED - lowMid
  pinMode(6,OUTPUT);  //Green LED - mid
  pinMode(8,OUTPUT);  //Blue LED - highMid
  pinMode(10,OUTPUT); //White LED - treble

  digitalWrite(2,LOW);
  digitalWrite(4,LOW);
  digitalWrite(6,LOW);
  digitalWrite(8,LOW);
  digitalWrite(10,LOW);
}

void loop()
{
  if(Serial.available()>0)
  {
    int byteIn = Serial.read();
    if(byteIn == 'X') //if no audio is playing
    {
      Serial.flush();
      digitalWrite(2,LOW);
      digitalWrite(4,LOW);
      digitalWrite(6,LOW);
      digitalWrite(8,LOW);
      digitalWrite(10,LOW);
    }
    if(byteIn == 'B') //if bass-values cross threshold, light RED
    {
      Serial.flush();
      digitalWrite(2,HIGH);
    }
    if(byteIn == 'A')
    {
      Serial.flush();
      digitalWrite(2,LOW);
    }
    if(byteIn == 'L') //if lowMid-values cross threshold, light YELLOW
    {
      Serial.flush();
      digitalWrite(4,HIGH);
    }
    if(byteIn == 'K')
    {
      Serial.flush();
      digitalWrite(4,LOW);
    }
    if(byteIn == 'M') //if mid-values cross threshold, light GREEN
    {
      Serial.flush();
      digitalWrite(6,HIGH);
    }
    if(byteIn == 'N')
    {
      Serial.flush();
      digitalWrite(6,LOW);
    }
    if(byteIn == 'H') //if highMid-values cross threshold, light BLUE
    {
      Serial.flush();
      digitalWrite(8,HIGH);
    }
    if(byteIn == 'I')
    {
      Serial.flush();
      digitalWrite(8,LOW);
    }
    if(byteIn == 'T') //if treble-values cross threshold, light WHITE
    {
      Serial.flush();
      digitalWrite(10,HIGH);
    }
    if(byteIn == 'U')
    {
      Serial.flush();
      digitalWrite(10,LOW);
    }
  }
}