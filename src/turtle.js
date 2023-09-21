import { createShader       }  from "./shaders.js";
import { initTurtleBuffers  }  from "./init_bufs_turtle.js";

class Turtle {

    constructor(gl)
    {
        const vsSource = `
        attribute vec2 aVertexPosition;
        attribute vec2 aTextureCoord;

        varying highp vec2 vTextureCoord;

        uniform mat4 uRotationMatrix;
        uniform mat4 uTranslationMatrix;
        uniform mat4 uProjectionMatrix;

        void main() {
          gl_Position = uTranslationMatrix * uProjectionMatrix * uRotationMatrix * vec4(aVertexPosition, 1.0, 1.0);
          vTextureCoord = aTextureCoord;
        }
        `;

        const fsSource = `
        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main() {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
        `;

        this.angle = 0;
        this.size  = 40;
        this.pen   = true;
        this.x     = gl.canvas.clientWidth/2;
        this.y     = gl.canvas.clientHeight/2;

        this.rotationMatrix      = mat4.create();
        this.projectionMatrix    = mat4.create();
        this.translationMatrix   = mat4.create();
        this.shaderProgram       = createShader(gl, vsSource, fsSource);
        this.buffers             = initTurtleBuffers(gl, this.size);

        this.programInfo = {
           attribLocations: {
             vertexPosition: gl.getAttribLocation(this.shaderProgram, "aVertexPosition"),
             textureCoord:   gl.getAttribLocation(this.shaderProgram, "aTextureCoord"),
           },
           uniformLocations: {
             rotationMatrix:    gl.getUniformLocation(this.shaderProgram, "uRotationMatrix"),
             translationMatrix: gl.getUniformLocation(this.shaderProgram, "uTranslationMatrix"),
             projectionMatrix:  gl.getUniformLocation(this.shaderProgram, "uProjectionMatrix"),
             uSampler:          gl.getUniformLocation(this.shaderProgram, "uSampler"),
           },
        };
    }

    move(gl, direction, steps, coords)
    {
        let moved   = false;
        let radians = this.angle * Math.PI / 180;
        let dx      = Math.sin(radians) * steps;
        let dy      = Math.cos(radians) * steps;

        if(direction == "backward")
        {
          dx = -dx;
          dy = -dy;
        }

        let dxvalue = dx / gl.canvas.clientWidth * 2;
        let dyvalue = dy / gl.canvas.clientHeight * 2;

        if(this.x + this.size/2 + dx < gl.canvas.clientWidth  &&
           this.y + this.size/2 + dy < gl.canvas.clientHeight &&
           this.x - this.size/2 + dx > 0                      &&
           this.y - this.size/2 + dy > 0)
        {
            coords.push(this.x);
            coords.push(this.y);
            coords.push(this.x + dx);
            coords.push(this.y + dy);

            this.x += dx;
            this.y += dy;

            mat4.translate(
              this.translationMatrix,
              this.translationMatrix,
              [dxvalue, dyvalue, 0]
            );

            moved = true;
        }
        else
        {
            var output = document.querySelector("#txtOutput");
            output.innerHTML = "Turtle cannot go this far.";
        }

        return moved;
    }

    moveByX(gl, x)
    {
        if(this.x + this.size/2 + x < gl.canvas.clientWidth  &&
           this.x - this.size/2 + x > 0)
        {
            let valuex = x / gl.canvas.clientWidth * 2;

            mat4.translate(
              this.translationMatrix,
              this.translationMatrix,
              [valuex, 0, 0]
            );
            
            this.x += Number(x);
        }
        else
        {
            var output = document.querySelector("#txtOutput");
            output.innerHTML = "Turtle cannot go this far.";
        }
    }

    moveByY(gl, y)
    {
        if(this.y + this.size/2 + y < gl.canvas.clientHeight &&
           this.y - this.size/2 + y > 0)
        {
            let valuey = y / gl.canvas.clientHeight * 2;

            mat4.translate(
              this.translationMatrix,
              this.translationMatrix,
              [0, valuey, 0]
            );
            
            this.y += Number(y);
        }
        else
        {
            var output = document.querySelector("#txtOutput");
            output.innerHTML = "Turtle cannot go this far.";
        }
    }

    moveByXY(gl, x, y)
    {
        if(this.x + this.size/2 + x < gl.canvas.clientWidth  &&
           this.y + this.size/2 + y < gl.canvas.clientHeight &&
           this.x - this.size/2 + x > 0                      &&
           this.y - this.size/2 + y > 0)
        {
            let valuex = x / gl.canvas.clientWidth * 2;
            let valuey = y / gl.canvas.clientHeight * 2;
          
            mat4.translate(
              this.translationMatrix,
              this.translationMatrix,
              [valuex, valuey, 0]
            );
            
            this.x += Number(x);
            this.y += Number(y);
        }
        else
        {
            var output = document.querySelector("#txtOutput");
            output.innerHTML = "Turtle cannot go this far.";
        }
    }

    gotoX(gl, x)
    {
        if(x + this.size/2 < gl.canvas.clientWidth  &&
           x - this.size/2 > 0)
        {
            let dx = x - this.x;

            let valuex = dx / gl.canvas.clientWidth * 2;

            mat4.translate(
              this.translationMatrix,
              this.translationMatrix,
              [valuex, 0, 0]
            );
            
            this.x = x;
        }
        else
        {
            var output = document.querySelector("#txtOutput");
            output.innerHTML = "Turtle cannot go this far.";
        }
    }

    gotoY(gl, y)
    {
        if(y + this.size/2 < gl.canvas.clientHeight &&
           y - this.size/2 > 0)
        {
            let dy = y - this.y;
          
            let valuey = dy / gl.canvas.clientHeight * 2;
          
            mat4.translate(
              this.translationMatrix,
              this.translationMatrix,
              [0, valuey, 0]
            );
            
            this.y = y;
        }
        else
        {
            var output = document.querySelector("#txtOutput");
            output.innerHTML = "Turtle cannot go this far.";
        }
    }

    gotoXY(gl, x, y)
    {
        if(x + this.size/2 < gl.canvas.clientWidth  &&
           y + this.size/2 < gl.canvas.clientHeight &&
           x - this.size/2 > 0                      &&
           y - this.size/2 > 0)
        {
            let dx = x - this.x;
            let dy = y - this.y;
            let valuex = dx / gl.canvas.clientWidth * 2;
            let valuey = dy / gl.canvas.clientHeight * 2;
            mat4.translate(
              this.translationMatrix,
              this.translationMatrix,
              [valuex, valuey, 0]
            );
            
            this.x = x;
            this.y = y;
        }
        else
        {
            var output = document.querySelector("#txtOutput");
            output.innerHTML = "Turtle cannot go this far.";
        }
    }

    rotate(direction, angle)
    {
        let radians = angle * Math.PI / 180;

        mat4.rotate(
          this.rotationMatrix,
          this.rotationMatrix,
          (direction == "left")? radians : -radians,
          [0, 0, 1]
        );

        this.angle = (direction == "left") ? (Number(this.angle) - Number(angle)) : (Number(this.angle) + Number(angle));

        if (this.angle >= 360)
        {
            this.angle -= 360;
        }
        else if (this.angle < 0)
        {
            this.angle = 360 - Math.abs(this.angle);
        }
    }

    rotateToAngle(angle)
    {
        let diff = Number(angle) - Number(this.angle);
        let radians = diff * Math.PI / 180;

        mat4.rotate(
          this.rotationMatrix,
          this.rotationMatrix,
         -radians,
          [0, 0, 1]
        );

        this.angle = angle;
    }
    
    draw(gl, texture)
    {
        this.setPositionAttribute(gl);
        this.setTextureAttribute(gl); 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices); 
        gl.useProgram(this.shaderProgram);    
        gl.activeTexture(gl.TEXTURE0);  
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);

        const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

        if(gl.canvas.clientWidth > gl.canvas.clientHeight)
        {
            mat4.ortho(this.projectionMatrix, -1 * aspectRatio, 1 * aspectRatio, -1, 1, -1, 1);
        }
        else
        {
            mat4.ortho(this.projectionMatrix, -1, 1, -1, 1 / aspectRatio, -1, 1);
        }

        gl.uniformMatrix4fv(
          this.programInfo.uniformLocations.projectionMatrix,
          false,
          this.projectionMatrix
        );

        gl.uniformMatrix4fv(
          this.programInfo.uniformLocations.rotationMatrix,
          false,
          this.rotationMatrix
        );

        gl.uniformMatrix4fv(
          this.programInfo.uniformLocations.translationMatrix,
          false,
          this.translationMatrix
        );

        {
            const vertexCount = 6;
            const type        = gl.UNSIGNED_SHORT;
            const offset      = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    }
    
      setPositionAttribute(gl)
      {
          const numComponents = 2;
          const type          = gl.FLOAT;
          const normalize     = false;
          const stride        = 0;
          const offset        = 0;
        
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
          gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
          );
          gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
      }
    
    setTextureAttribute(gl)
    {
          const num       = 2;
          const type      = gl.FLOAT;
          const normalize = false;
          const stride    = 0;
          const offset    = 0;
      
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoord);
          gl.vertexAttribPointer(
            this.programInfo.attribLocations.textureCoord,
            num,
            type,
            normalize,
            stride,
            offset
          );
          gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
      }
  
}

export { Turtle }