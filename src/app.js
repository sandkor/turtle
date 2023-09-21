import { Line   } from "./line.js";
import { Turtle } from "./turtle.js";

class App
{
    constructor(gl)
    {
        this.gl             = gl;
        this.turtle         = new Turtle(gl);
        this.lines          = [];
        this.pen            = true;
        this.penColor       = [0.0, 0.0, 0.0];
        this.penWidth       = 1;
        this.texture        = this.loadTexture("turtle.png");
        this.animated       = false;
        this.animationSpeed = 300;
    }

    changeAnimationState(checked)
    {
        this.animated = checked;
        this.drawScene();
    }

    changeAnimationSpeed(x)
    {
        this.animationSpeed = x;
    }

    moveTurtle(dir, steps)
    {
        let moved  = false;
        let coords = [];

        if(dir == "forward")
        {
            moved = this.turtle.move(this.gl, "forward", steps, coords);
        }
        else if(dir == "backward")
        {
            moved = this.turtle.move(this.gl, "backward", steps, coords);
        }

        if(moved && this.pen)
        {
            let line = new Line(this.gl, coords, steps, this.penWidth, this.penColor);
            this.lines.push(line);
        }  
    }

    async rotateTurtle(dir, angle)
    {
        if(dir == "left")
        {
            this.turtle.rotate("left", angle); 
        }
        else if(dir == "right")
        {
            this.turtle.rotate("right", angle);
        }
    }

    async rotateTurtleToAngle(angle)
    {
        this.turtle.rotateToAngle(angle);
    }

    moveTurtleByX(x)
    {
        this.turtle.moveByX(this.gl, Number(x));
    }

    moveTurtleByY(y)
    {
        this.turtle.moveByY(this.gl, Number(y));
    }

    moveTurtleByXY(x, y)
    {
        this.turtle.moveByXY(this.gl, Number(x), Number(y));
    }

    moveTurtleToX(x)
    {
        this.turtle.gotoX(this.gl, Number(x));
    }

    moveTurtleToY(y)
    {
        this.turtle.gotoY(this.gl, Number(y));
    }

    moveTurtleToXY(x, y)
    {
        this.turtle.gotoXY(this.gl, Number(x), Number(y));
    }

    setPenColor(r, g, b)
    {
        const rNormalized = r/255.0;
        const gNormalized = g/255.0;
        const bNormalized = b/255.0;

        this.penColor = [rNormalized, gNormalized, bNormalized];
    }

    async executeCommand(command)
    {
        const drawFrequency = 10; // in milliseconds

        switch(command.type)
        {
            case "penup":
                this.pen = false;
                break;
            case "pendown":
                this.pen = true;
                break;
            case "pencolor":
                this.setPenColor(command.r, command.g, command.b);
                break;
            case "penwidth":
                this.penWidth = command.amount;
                break;
            case "turnleft":
                await this.rotateTurtle("left", command.amount);
                if(this.animated == true)
                {
                    this.drawScene();
                    await sleep(drawFrequency);
                }
                break;
            case "turnright":
                await this.rotateTurtle("right", command.amount);
                if(this.animated == true)
                {
                    this.drawScene();
                    await sleep(drawFrequency);
                }
                break;
            case "direction":
                await this.rotateTurtleToAngle(command.amount);
                if(this.animated == true)
                {
                    this.drawScene();
                    await sleep(drawFrequency);
                }
                break;
            default:
                if(this.animated == true)
                {
                    await this.executeAnimatedCommand(command);
                }
                else
                {
                    switch(command.type)
                    {
                        case "forward":
                            this.moveTurtle("forward", command.amount);
                            break;
                        case "backward":
                            this.moveTurtle("backward", command.amount);
                            break;
                        case "gox":
                            this.moveTurtleToX(command.amount);
                            break;
                        case "goy":
                            this.moveTurtleToY(command.amount);
                            break;
                        case "goxy":
                            this.moveTurtleToXY(command.x, command.y);
                            break;
                        case "center":
                            this.moveTurtleToXY(this.gl.canvas.clientWidth/2, this.gl.canvas.clientHeight/2);
                            break;
                    }
                }
                break;
        }
    }

    async executeAnimatedCommand(command)
    {
        let movementTotal;
        let movementTotalx;
        let movementTotaly;

        // We cannot change the speed during the movement
        var animationSpeed = document.querySelector("#animationSpeed");
        animationSpeed.disabled = true;

        switch(command.type)
        {
            case "forward":
            case "backward":
                movementTotal = command.amount;
                break;
            case "gox":
                movementTotal = command.amount - this.turtle.x;
                break;
            case "goy":
                movementTotal = command.amount - this.turtle.y;
                break;
            case "goxy":
                movementTotalx = command.x - this.turtle.x;
                movementTotaly = command.y - this.turtle.y;
                movementTotal  = (Math.abs(movementTotalx) >= Math.abs(movementTotaly)) ? movementTotalx : movementTotaly;
                break;
            case "center":
                movementTotalx = this.gl.canvas.clientWidth/2 - this.turtle.x;
                movementTotaly = this.gl.canvas.clientHeight/2 - this.turtle.y;
                movementTotal  = (Math.abs(movementTotalx) >= Math.abs(movementTotaly)) ? movementTotalx : movementTotaly;
                break;
        }

        const drawFrequency    = 10;                                       // in milliseconds
        let   step             = this.animationSpeed * drawFrequency/1000; // how many pixels we can procees during one drawCall
        const iterationsNeeded = Math.ceil(Math.abs(movementTotal)/step);
        const lastStep         = Math.abs(movementTotal % step);

        let movementTotalLess, idleForLess, stepLess;

        if(command.type == "goxy" || command.type == "center")
        {
            movementTotalLess = (Math.abs(movementTotalx) >= Math.abs(movementTotaly)) ? movementTotaly : movementTotalx;
            idleForLess = 0;
            stepLess    = movementTotalLess / iterationsNeeded;

            if(Math.abs(movementTotalLess) < iterationsNeeded)
            {
                idleForLess = iterationsNeeded - Math.abs(movementTotalLess);
            }
        }

        for(let i = 0; i < iterationsNeeded; i++)
        {
            step               = (lastStep > 0 && (i == (iterationsNeeded - 1))) ? lastStep : step;
            let stepCorrected  = (movementTotal < 0) ? Number(-step) : Number(step);

            switch(command.type)
            {
                case("forward"):
                    this.moveTurtle("forward", step);
                    break;
                case("backward"):
                    this.moveTurtle("backward", step);
                    break;
               case("gox"):                  
                    this.moveTurtleByX(Number(stepCorrected));
                    break;
                case("goy"):
                    this.moveTurtleByY(Number(stepCorrected));
                    break;
                case("goxy"):
                case("center"):
                    stepLess   = ((iterationsNeeded - i - 1) > idleForLess) ? stepLess : 0;
                    let step_x = (Math.abs(movementTotalx) >= Math.abs(movementTotaly)) ? stepCorrected : stepLess;
                    let step_y = (Math.abs(movementTotalx) >= Math.abs(movementTotaly)) ? stepLess : stepCorrected;
                    this.moveTurtleByXY(Number(step_x), Number(step_y));
                    break;
            }

            await sleep(drawFrequency);
            this.drawScene();
        }

        animationSpeed.disabled = false;
    }

    drawScene()
    {
        this.gl.clearColor(0.65, 0.68, 0.95, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.viewport(0, 0, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

        for (let line of this.lines)
        {
            line.draw(this.gl);
        }

        this.turtle.draw(this.gl, this.texture);

        if (this.animated == false)
        {
            requestAnimationFrame(this.drawScene.bind(this));
        }
    }

    loadTexture(url)
    {
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);
    
        // Flip image pixels into the bottom-to-top order that WebGL expects.
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      
        // Temporary dummy img (used until the requested img is downloading)
        const level          = 0;
        const internalFormat = this.gl.RGBA;
        const width          = 1;
        const height         = 1;
        const border         = 0;
        const srcFormat      = this.gl.RGBA;
        const srcType        = this.gl.UNSIGNED_BYTE;
        const pixel          = new Uint8Array([0, 0, 0, 0]);
    
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          level,
          internalFormat,
          width,
          height,
          border,
          srcFormat,
          srcType,
          pixel
        );
      
        const image       = new Image();
        image.crossOrigin = "anonymous";
    
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
          );
      
          // WebGL can only generate mipMaps for imgs that have dimensions equal to power of 2
          if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
          } else {
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S,     this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T,     this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
          }
    
          this.drawScene();
        };
    
        image.src = url;
      
        return texture;
      }
}

function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isPowerOf2(value)
{
    return (value & (value - 1)) === 0;
}

export { App }