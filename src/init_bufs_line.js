  function initLineBuffers(gl, x, y, x2, y2, lenght, thickness)
  {
    let positionBuffers, indexBuffer;

    if(thickness == 1)
    {
      positionBuffers = initPositionBuffer(gl, x, y, x2, y2);
      indexBuffer     = gl.createBuffer();
    }
    else
    {
      positionBuffers = initPositionBufferThick(gl, x, y, x2, y2, lenght, thickness);
      indexBuffer     = initIndexBuffer(gl);
    }
  
    return {
      position      : positionBuffers.position,
      pointPosition : positionBuffers.pointPosition,
      indices       : indexBuffer,
    };
  }

  function initPositionBuffer(gl, x1, y1, x2, y2)
  {
    const positionBuffer = gl.createBuffer();
     
    const positions = [  x1, y1,
                         x2, y2];

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
    return {
      position : positionBuffer
    }
  }

  function initPositionBufferThick(gl, x1, y1, x2, y2, lenght, thickness)
  {
    const positionBuffer = gl.createBuffer();
    const scaling_factor = thickness/2/lenght;

    const dx = Number(x2) - Number(x1);
    const dy = Number(y2) - Number(y1);

    const dst_x0 = Number(x1) + Number(dy) * scaling_factor;
    const dst_y0 = Number(y1) - Number(dx) * scaling_factor;
    const dst_x1 = Number(x1) - Number(dy) * scaling_factor;
    const dst_y1 = Number(y1) + Number(dx) * scaling_factor;
    const dst_x2 = Number(x2) - Number(dy) * scaling_factor;
    const dst_y2 = Number(y2) + Number(dx) * scaling_factor;
    const dst_x3 = Number(x2) + Number(dy) * scaling_factor;
    const dst_y3 = Number(y2) - Number(dx) * scaling_factor;
   
    const positions = [ dst_x0, dst_y0,
                        dst_x1, dst_y1,
                        dst_x2, dst_y2,
                        dst_x3, dst_y3];

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const pointPositionBuffer = gl.createBuffer();

    const pointPositions = [(dst_x0 + dst_x1)/2, (dst_y0 + dst_y1)/2,
                            (dst_x2 + dst_x3)/2, (dst_y2 + dst_y3)/2]

    gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPositions), gl.STATIC_DRAW);
  
    return {
      position : positionBuffer,
      pointPosition : pointPositionBuffer
    }
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

  export { initLineBuffers };