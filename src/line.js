import { createShader     }  from "./shaders.js";
import { initLineBuffers  }  from "./init_bufs_line.js";

class Line {

    constructor(gl, coords, lenght, thickness, penColor)
    {
        const vsSource = `
        attribute vec2 aVertexPosition;

        uniform mat4 uProjectionMatrix;

        void main() {           
          gl_Position = uProjectionMatrix * vec4(aVertexPosition, 1.0, 1.0);
        }
        `;

        const fsSource = `
        uniform highp vec3 uColor;

        void main() {
            gl_FragColor = vec4(uColor, 1.0);
        }
        `;

        const vsSourceForPoints = `
        attribute vec2 aVertexPosition;

        uniform mat4 uProjectionMatrix;

        uniform mediump float uPointSize;

        void main() {
          gl_PointSize = uPointSize;
          gl_Position = uProjectionMatrix * vec4(aVertexPosition, 1.0, 1.0);
        }
        `;

        const fsSourceForPoints = `
        uniform highp vec3 uColor;

        precision mediump float;

        void main() {

            vec2 temp = gl_PointCoord - vec2(0.5);
            float f = dot(temp, temp);
            if (f>0.25) discard;

            gl_FragColor = vec4(uColor, 1.0);
        }
        `;

        this.color     = penColor;
        this.thickness = thickness;

        this.shaderProgram = createShader(gl, vsSource, fsSource);
        this.buffers       = initLineBuffers(gl, coords[0], coords[1], coords[2], coords[3], lenght, thickness);

        this.programInfo = {
            attribLocations: {
              vertexPosition: gl.getAttribLocation(this.shaderProgram, "aVertexPosition"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(this.shaderProgram, "uProjectionMatrix"),
                color: gl.getUniformLocation(this.shaderProgram, "uColor"),
            },
        };

        if(this.thickness > 1)
        {
            this.pointShaderProgram = createShader(gl, vsSourceForPoints, fsSourceForPoints);
            this.pointProgramInfo = {
                attribLocations: {
                  vertexPosition: gl.getAttribLocation(this.pointShaderProgram, "aVertexPosition"),
                },
                uniformLocations: {
                    projectionMatrix: gl.getUniformLocation(this.pointShaderProgram, "uProjectionMatrix"),
                    color: gl.getUniformLocation(this.pointShaderProgram, "uColor"),
                    pointSize: gl.getUniformLocation(this.pointShaderProgram, "uPointSize"),
                },
            };
        }
    }
    
    draw(gl)
    {
        this.setPositionAttribute(gl);

        let projectionMatrix = mat4.create();

        mat4.ortho(projectionMatrix, 0, gl.canvas.clientWidth, 0, gl.canvas.clientHeight, -1, 1);

        gl.useProgram(this.shaderProgram);

        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );
        
        gl.uniform3f(
            this.programInfo.uniformLocations.color,
            this.color[0],
            this.color[1],
            this.color[2]
        );
        
        if(this.thickness == 1)
        {
            const vertexCount = 2;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
            gl.drawArrays(gl.LINES, 0, vertexCount);
        }
        else
        {
            const vertexCount = 6;
            const type        = gl.UNSIGNED_SHORT;
            const offset      = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);

            this.setPointPositionAttribute(gl);

            gl.useProgram(this.pointShaderProgram);

            gl.uniformMatrix4fv(
                this.pointProgramInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix
            );
            
            gl.uniform3f(
                this.pointProgramInfo.uniformLocations.color,
                this.color[0],
                this.color[1],
                this.color[2]
            );

            gl.uniform1f(
                this.pointProgramInfo.uniformLocations.pointSize,
                this.thickness
            );

            gl.drawArrays(gl.POINTS, 0, 2);
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

    setPointPositionAttribute(gl)
    {
        const numComponents = 2;
        const type          = gl.FLOAT;
        const normalize     = false;
        const stride        = 0;
        const offset        = 0;
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.pointPosition);
        gl.vertexAttribPointer(
          this.pointProgramInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset
        );
        gl.enableVertexAttribArray(this.pointProgramInfo.attribLocations.vertexPosition);
    }
}

export { Line }