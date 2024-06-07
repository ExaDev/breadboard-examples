import { board, code } from "@google-labs/breadboard";

export async function renderDevice () {
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
  }
  
  const canvas = document.querySelector("canvas");
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("No appropriate GPUAdapter found.");
  }

  const context = canvas.getContext("webgpu");
  const device = await adapter.requestDevice();

  const cellShaderModule = device.createShaderModule({
    label: 'Cell shader',
    code: `
  @vertex
  fn vertexMain(@location(0) pos: vec2f) ->
    @builtin(position) vec4f {
    return vec4f(pos, 0, 1);
  }

  @fragment
  fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 0, 1, 1);
  }
`
  });

  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device: device,
    format: canvasFormat,
  });

  const vertexBufferLayout = {
    arrayStride: 8,
    attributes: [{
      format: "float32x2",
      offset: 0,
      shaderLocation: 0, // Position, see vertex shader
    }],
  };

  const cellPipeline = device.createRenderPipeline({
    label: "Cell pipeline",
    layout: "auto",
    vertex: {
      module: cellShaderModule,
      entryPoint: "vertexMain",
      buffers: [vertexBufferLayout]
    },
    fragment: {
      module: cellShaderModule,
      entryPoint: "fragmentMain",
      targets: [{
        format: canvasFormat
      }]
    }
  });

  const vertices = new Float32Array([
    //   X,    Y,
    -0.8, -0.8, // Triangle 1 (Blue)
    0.8, -0.8,
    0.8, 0.8,

    -0.8, -0.8, // Triangle 2 (Red)
    0.8, 0.8,
    -0.8, 0.8,
  ]);

  const encoder = device.createCommandEncoder();

  const vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);

  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      storeOp: "store",
    }]
  });

  pass.setPipeline(cellPipeline);
  pass.setVertexBuffer(0, vertexBuffer);
  pass.draw(vertices.length / 2); // 6 vertices

  pass.end()
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);

}


const render = code(async () => {
  await renderDevice()

  return {}
})

export const myBoard = board(() => {
  //render()

  console.log("IN BOARD")

  return {  }
})



