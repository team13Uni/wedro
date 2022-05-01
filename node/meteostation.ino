#include <DHT.h>                             

#define DHTPIN 2                      
#define DHTTYPE DHT22 
DHT dht(DHTPIN, DHTTYPE);    

float hum;                                    
float temp;       
                            
unsigned long previousMillis = 0;        // will store last time LED was updated

// constants won't change:
const long interval = 2000;           // interval at which to blink (milliseconds)

void setup()
{
  Serial.begin(9600);                         
  dht.begin();                                
}
void loop() {
  // here is where you'd put code that needs to be running all the time.

  // check to see if it's time to blink the LED; that is, if the difference
  // between the current time and last time you blinked the LED is bigger than
  // the interval at which you want to blink the LED.
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    // save the last time you blinked the LED
    previousMillis = currentMillis;

    hum = dht.readHumidity();                 
    temp = dht.readTemperature();
    if (isnan(hum) || isnan(temp))             
    {
      Serial.println("Read error!");          
    }
    else                                       
    {               
      Serial.print(hum);
      Serial.print(",");
      Serial.println(temp);
    }
  }
}
