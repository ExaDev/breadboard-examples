function a(input:string) {

    const canvas = document.querySelector("canvas");
    if (!navigator.gpu) {
      throw new Error("WebGPU not supported on this browser.");
    }


}