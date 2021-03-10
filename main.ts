/**
 * Functions are mapped to blocks using various macros
 * in comments starting with %. The most important macro
 * is "block", and it specifies that a block should be
 * generated for an **exported** function.
 */

//% color="#AA278D" weight=100 icon="\uf2db"
namespace CircuitCheck {

    let in_or_out = [0,0,0];//0 - input, 1 - output 
    let digital_pins = [DigitalPin.P0, DigitalPin.P1, DigitalPin.P2];
    let analog_pins = [AnalogPin.P0, AnalogPin.P1, AnalogPin.P2];
    let delim = '&';
    let gestures = [Gesture.EightG, Gesture.FreeFall, Gesture.LogoDown, Gesture.LogoUp, Gesture.ScreenDown, Gesture.ScreenUp, Gesture.Shake, Gesture.SixG, Gesture.ThreeG, Gesture.TiltLeft, Gesture.TiltRight];
    let gesture_text = ["Eight G", "Free Fall", "Logo Down", "Logo Up", "Screen Down", "Screen Up", "Shake", "Six G", "Three G", "Tilt Left", "Tilt Right"]
    let data_split = ["0"];
    let delay = 50;
    let timer = 0;
    let previous_selection = "0";
    //% block
    export function enableCircuitCheck() {
    //Todo try updating to use serial.readString(); which returns empty string if no data
        let data_raw = serial.readString();
        if(data_raw.trim() != "")
        {
            data_split = data_raw.split(",");
            serial.writeString("{\"Message\":\" Raw data was " + data_raw + " selection was " + data_split[0] + " and Data was : ");
            for(let i = 0; i < data_split.length; i++)
            {
            serial.writeString("[" + i + "] " + data_split[i] + " | ");
            }
            serial.writeLine( "\"}" + delim);
            timer = 0;//Reset timer to allow for immediate processing
        }
        
        //Delay to prevent information overload 
        if((timer + delay) < input.runningTime())
        {
            switch(data_split[0])
            {
                case "0": //Read out Digital/Analog pin values - TODO: expand beyond 0,1,2
                {
                    serial.writeLine("{\"Pins\":{");
                    let i = 0;
                    for(i; i < in_or_out.length; i++)
                    {
                        if(in_or_out[i] == 0)
                        {//Only read from pins set to be inputs
                            serial.writeLine("\"D" + i + "\":[" + pins.digitalReadPin(digital_pins[i]) + ",0],");
                            serial.writeLine("\"A" + i + "\":" + pins.analogReadPin(analog_pins[i]) + ",");
                        }
                        else
                        {
                            serial.writeLine("\"D" + i + "\":[1,1],");//List as an output
                        }
                    }
                    //Check for button presses
                    serial.writeLine("\"D5\":[" + (input.buttonIsPressed(Button.A) ? 1 : 0) + ",0],");
                    serial.writeLine("\"D11\":[" + (input.buttonIsPressed(Button.B) ? 1 : 0) + ",0]}}" + delim);
                    delay = 50;      
                }
                break;
                
                case "1": //See data on specific pin
                    //Implement later
                break;
                
                case "2": //Set PWM on a specific pin
                    pins.analogWritePin(analog_pins[parseInt(data_split[1])], parseInt(data_split[2]));
                    in_or_out[parseInt(data_split[1])] = parseInt(data_split[2]) > 0 ? 1 : 0;//If pin has been set to a pwm value greater than 0, it will be providing power and should be listed as an output pin
                    data_split = ["0"];
                break;
                
                case "3": //Set digitalWrite on a pin
                    pins.digitalWritePin(digital_pins[parseInt(data_split[1])], parseInt(data_split[2]));
                    in_or_out[parseInt(data_split[1])] = parseInt(data_split[2]) > 0 ? 1 : 0;//If pin has been set to 1, i.e. HIGH, list it as an output pin
                    data_split = ["0"];
                break;
                
                case "4": //Set specific led on
                    led.plot(parseInt(data_split[1]), parseInt(data_split[2])); 
                    serial.writeString("{\"Message\":\" LED Plot was " + data_split[1] + data_split[2] + "\"}" + delim);
                    data_split = [previous_selection]; //Set to read inputs/outputs next
                break;
                
                case "5": //Set specific led off
                    led.unplot(parseInt(data_split[1]), parseInt(data_split[2]));
                    serial.writeString("{\"Message\":\" LED UnPlot was " + data_split[1] + data_split[2] + "\"}" + delim);
                    data_split = [previous_selection]; //Set to read inputs/outputs next
                break;

                case "6": //calibrate compass
                    input.calibrateCompass();
                    data_split = ["7"];
                break;

                case "7": //get compass magnetic field ratings along x,y,z & strength
                    serial.writeLine("{\"Compass\":{\"X\":" + input.magneticForce(Dimension.X) + ",\"Y\":" + input.magneticForce(Dimension.Y) +",\"Z\":" + input.magneticForce(Dimension.Z) +",\"Strength\":" + input.magneticForce(Dimension.Strength)+ ",\"Compass_Head\":" + input.compassHeading() +"}}" + delim);
                    delay = 125;
                break;

                case "8": //set accel. range
                    //Accell enums:
                    // AcceleratorRange.OneG - 1
                    // AcceleratorRange.TwoG - 2
                    // AcceleratorRange.FourG - 4
                    // AcceleratorRange.EightG - 8
                    input.setAccelerometerRange(parseInt(data_split[1]));
                    data_split = ["9"];
                break;

                case "9": //accelerometer data
                    serial.writeLine("{\"Motion\":{\"X\":" + input.acceleration(Dimension.X) + ",\"Y\":" + input.acceleration(Dimension.Y) +",\"Z\":" + input.acceleration(Dimension.Z) +",\"Strength\":" + input.acceleration(Dimension.Strength)+ "}}" + delim);
                    delay = 125;
                break;

                case "10": //rotation data
                    serial.writeLine("{\"Rotate\":{\"Pitch\":" + input.rotation(Rotation.Pitch) + ",\"Roll\":" + input.rotation(Rotation.Roll) + "}}" + delim);
                    delay = 125;
                break;

                case "11": //acceleremoter gesture -> TODO: update to directly access current gesture
                {   
                    let gesture = "none";
                    for(let i = 0; i < gestures.length; i++)//TODO: see if brute force option can be removed
                    {
                        if(input.isGesture(gestures[i]))
                        {
                            gesture = gesture_text[i];
                            break;
                        }
                    }
                    serial.writeLine("{\"Gesture\":\"" + gesture +"\"}" + delim);
                    delay = 125;
                }
                break; 

                case "12": //Temperature
                    serial.writeLine("{\"Temp\":" + input.temperature() + "}" + delim);
                    delay = 125;
                break;
                
                case "13": //Light Level
                    serial.writeLine("{\"Light\":" + input.lightLevel() + "}" + delim);
                    delay = 125;
                break;
            }
            previous_selection = data_split[0];//needed to resume data collection when updating leds
            timer = input.runningTime();//Update timer
        }
    }

}