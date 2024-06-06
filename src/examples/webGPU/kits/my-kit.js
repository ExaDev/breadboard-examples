"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVertices = exports.renderDevice = void 0;
function renderDevice() {
    return __awaiter(this, void 0, void 0, function () {
        var canvas, adapter, context, device, cellShaderModule, canvasFormat, vertexBufferLayout, cellPipeline, vertices, encoder, vertexBuffer, pass, commandBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!navigator.gpu) {
                        throw new Error("WebGPU not supported on this browser.");
                    }
                    console.log("SUPPORTED");
                    canvas = document.querySelector("canvas");
                    if (!navigator.gpu) {
                        throw new Error("WebGPU not supported on this browser.");
                    }
                    return [4 /*yield*/, navigator.gpu.requestAdapter()];
                case 1:
                    adapter = _a.sent();
                    if (!adapter) {
                        throw new Error("No appropriate GPUAdapter found.");
                    }
                    context = canvas.getContext("webgpu");
                    return [4 /*yield*/, adapter.requestDevice()];
                case 2:
                    device = _a.sent();
                    cellShaderModule = device.createShaderModule({
                        label: 'Cell shader',
                        code: "\n  @vertex\n  fn vertexMain(@location(0) pos: vec2f) ->\n    @builtin(position) vec4f {\n    return vec4f(pos, 0, 1);\n  }\n\n  @fragment\n  fn fragmentMain() -> @location(0) vec4f {\n    return vec4f(1, 0, 1, 1);\n  }\n"
                    });
                    canvasFormat = navigator.gpu.getPreferredCanvasFormat();
                    context.configure({
                        device: device,
                        format: canvasFormat,
                    });
                    vertexBufferLayout = {
                        arrayStride: 8,
                        attributes: [{
                                format: "float32x2",
                                offset: 0,
                                shaderLocation: 0, // Position, see vertex shader
                            }],
                    };
                    cellPipeline = device.createRenderPipeline({
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
                    vertices = new Float32Array([
                        //   X,    Y,
                        -0.8, -0.8, // Triangle 1 (Blue)
                        0.8, -0.3,
                        0.8, 0.8,
                        -0.8, -0.8, // Triangle 2 (Red)
                        0.8, 0.8,
                        -0.8, 0.8,
                    ]);
                    encoder = device.createCommandEncoder();
                    vertexBuffer = device.createBuffer({
                        label: "Cell vertices",
                        size: vertices.byteLength,
                        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                    });
                    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);
                    pass = encoder.beginRenderPass({
                        colorAttachments: [{
                                view: context.getCurrentTexture().createView(),
                                loadOp: "clear",
                                storeOp: "store",
                            }]
                    });
                    pass.setPipeline(cellPipeline);
                    pass.setVertexBuffer(0, vertexBuffer);
                    pass.draw(vertices.length / 2); // 6 vertices
                    pass.end();
                    commandBuffer = encoder.finish();
                    device.queue.submit([commandBuffer]);
                    console.log("DONE");
                    return [2 /*return*/];
            }
        });
    });
}
exports.renderDevice = renderDevice;
function processVertices(vertices) {
}
exports.processVertices = processVertices;
