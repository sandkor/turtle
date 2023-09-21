  function initTurtleBuffers(gl, size)
  {

    const positionBuffer     = initPositionBuffer(gl, size);
    const indexBuffer        = initIndexBuffer   (gl);
    const textureCoordBuffer = initTextureBuffer (gl);
  
    return {
      position: positionBuffer,
      indices: indexBuffer,
      textureCoord: textureCoordBuffer,
    };
  }

  function initIndexBuffer(gl)
  {
    const indexBuffer = gl.createBuffer();

    const indices = [0, 1, 3,
                     1, 2, 3];

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
    return indexBuffer;
  }
  
  function initPositionBuffer(gl, size)
  {
    const positionBuffer = gl.createBuffer();
    const sizeCorrected  = 2/size;

    const positions = [  sizeCorrected,  sizeCorrected,
                         sizeCorrected, -sizeCorrected,
                        -sizeCorrected, -sizeCorrected,
                        -sizeCorrected,  sizeCorrected ];

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
    return positionBuffer;
  }

  function initTextureBuffer(gl)
  {
    const textureCoordBuffer = gl.createBuffer();
     
    const textureCoordinates = [
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ];
  
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
  
    return textureCoordBuffer;
  }
  
  export { initTurtleBuffers };