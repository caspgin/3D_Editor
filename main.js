let gl = null;

const vertexShader = `
	attribute vec4 aVertexPosition;
	void main() {
		gl_Position = aVertexPosition;
	}
`;

const fragmentShader = `
	void main() {
		gl_FragColor = vec4(1.0,0.0,0.0,1.0);
	}
`;


const gfShader = `
	void main() {
		gl_FragColor = vec4(0.0,1.0,0.0,1.0);
	}
`;

class Shader {
	#shaderProgram;
	constructor(vs, fs) {
		this.bindShader(vs, fs);
	}

	//create and compile shader object 
	loadShader(type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		//if compilation fails 
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(`An error occured compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	use() {
		gl.useProgram(this.#shaderProgram);
	}

	getPositionAttribLocation() {
		return gl.getAttribLocation(this.#shaderProgram, 'aVertexPosition');
	}

	bindShader(vs, fs) {
		//load shader code for both vertex and fragment 
		const vertexShader = this.loadShader(gl.VERTEX_SHADER, vs);
		const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fs);

		//create shader program and link the vertex and fragment shaders 
		if (this.#shaderProgram) {
			gl.deleteProgram(this.#shaderProgram);
		}
		this.#shaderProgram = gl.createProgram();
		gl.attachShader(this.#shaderProgram, vertexShader);
		gl.attachShader(this.#shaderProgram, fragmentShader);
		gl.linkProgram(this.#shaderProgram);

		//if linking failes 
		if (!gl.getProgramParameter(this.#shaderProgram, gl.LINK_STATUS)) {
			alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(this.#shaderProgram)}`);
			return null;
		}

		//delete vertex and fragment shaders
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
	}

}


class Triangle {
	#positionData = [
		-0.5, -0.5, 0.0, //left
		0.5, -0.5, 0.0, //right
		0.0, 0.5, 0.0, //top
	]
	#shader
	#vao
	constructor() {
		this.applyShader(shaders[0]); //default shader index is 0
		this.initBuffer();
	}

	initBuffer() {
		//create and bind Vertex Array Object
		this.#vao = gl.createVertexArray();
		gl.bindVertexArray(this.#vao);

		//create and bind Vertex Buffer Object
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		//Give Bufffer data to GPU
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#positionData), gl.STATIC_DRAW);

		//get Shader attribute Location
		const positionLocation = this.#shader.getPositionAttribLocation();
		//Enable the attribute 
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(positionLocation);

		//THINK : Should unbind?
	}

	applyShader(shaderRef) {
		this.#shader = shaderRef;
	}

	bindVAO() {
		gl.bindVertexArray(this.#vao);
	}

	draw() {
		this.#shader.use();
		gl.bindVertexArray(this.#vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
	}

	setPosition(position) {
		this.#positionData = position;
	}

}

const shaders = [];
const meshes = []
class Renderer {
	#canvas;

	constructor() {
		this.#canvas = document.getElementById('myCanvas');
		gl = this.#canvas.getContext('webgl2');
		if (gl === null) {
			alert("Unable to initialize WEbGl. Your browser or machine may not support it.");
			return;
		}

		shaders.push(new Shader(vertexShader, fragmentShader));

		meshes.push(new Triangle());

		this.render();
	}

	render() {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		for (let mesh of meshes) {
			mesh.draw();
		}
	}

	createNewTriangle() {
		meshes.push(new Triangle());
		return meshes[meshes.length - 1];
	}

	createNewShader() {
		shaders.push(new Shader(vertexShader, fragmentShader));
		return shaders[shaders.length - 1];
	}

}

const renderer = new Renderer();

