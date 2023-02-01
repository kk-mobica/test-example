function degreesToRadians(angle) {
  return angle * (Math.PI / 180);
}

function getRotatedCords(x, y, centerX, centerY, angleRad) {
  const rotatedX = centerX + (x - centerX) * Math.cos(angleRad) - (y - centerY) * -Math.sin(angleRad);
  const rotatedY = centerY + (x - centerX) * -Math.sin(angleRad) + (y - centerY) * Math.cos(angleRad);

  return {
    x: rotatedX,
    y: rotatedY,
  };
}

function getRectangleCenter({ topLeft, topRight, bottomLeft, bottomRight }) {
  const centerX = (topLeft.x + topRight.x + bottomLeft.x + bottomRight.x) / 4;
  const centerY = (topLeft.y + topRight.y + bottomLeft.y + bottomRight.y) / 4;

  return {
    x: centerX,
    y: centerY
  };
}

export class RectangleGroup {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.setDefaults();
    this.rectangles = [this.createRectangle(this.position.x, this.position.y)];
    this.group = this.createGroup();
    this.#atachRectangles();
  }

  get groupWidth() {
    return this.count * this.singleRectangleWidth + (this.count - 1) * this.gapSize;
  }

  get groupHeigth() {
    return this.singleRectangleWidth;
  }

  get count() {
    return this.rectangles.length;
  }

  setDefaults() {
    this.singleRectangleWidth = 50;
    this.gapSize = 10;
    this.position = {
      x: 50,
      y: 50
    }
    this.rotation = {
      angleDeg: 0,
      originX: 75,
      originY: 75
    }
    this.group = this.createGroup();
  }

  createGroup() {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    return group;
  }

  createRectangle(x, y) {
    const rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectangle.setAttribute('width', this.singleRectangleWidth.toString());
    rectangle.setAttribute('height', this.singleRectangleWidth.toString());
    rectangle.setAttribute('x', x.toString());
    rectangle.setAttribute('y', y.toString());
    return rectangle;
  }

  createRectangles() {
    this.destroyRectangles();
    let x = this.position.x;
    for (let i = 0; i < this.count; i += 1) {
      this.group.append(this.createRectangle(x, this.position.y));
      x += this.singleRectangleWidth + this.gapSize;
    }
  }

  destroyRectangles() {
    this.group.childNodes.forEach(rectangle => {
      rectangle.remove();
    });
  }

  getGroupCoordinates() {
    let topLeft = {
      x: this.position.x,
      y: this.position.y
    }
    let topRight = {
      x: topLeft.x + this.groupWidth,
      y: topLeft.y
    };
    let bottomLeft = {
      x: topLeft.x,
      y: topLeft.y + this.groupHeigth
    };
    let bottomRight = {
      x: topRight.x,
      y: bottomLeft.y
    };
    if (this.rotation.angleDeg !== 0) {
      const angleRad = degreesToRadians(this.rotation.angleDeg);

      topLeft = getRotatedCords(topLeft.x, topLeft.y, this.rotation.originX, this.rotation.originY, -angleRad);
      topRight = getRotatedCords(topRight.x, topRight.y, this.rotation.originX, this.rotation.originY, -angleRad);
      bottomLeft = getRotatedCords(bottomLeft.x, bottomLeft.y, this.rotation.originX, this.rotation.originY, -angleRad);
      bottomRight = getRotatedCords(bottomRight.x, bottomRight.y, this.rotation.originX, this.rotation.originY, -angleRad);
    }
    return {
      topLeft,
      topRight,
      bottomLeft,
      bottomRight
    };
  }

  attach() {
    this.wrapper.append(this.group);
  }

  detach() {
    this.group.remove();
  }

  addRectangle = () => {
    const newX = this.position.x + this.gapSize + this.count * this.singleRectangleWidth;
    const newy = this.position.y;
    this.rectangles.push(this.createRectangle(newX, newy))
    this.group.append(this.rectangles.at(-1));
  }

  setRotation = (angleDeg) => {
    const realCords = this.getGroupCoordinates();
    const { x: originX, y: originY } = getRectangleCenter(realCords);
    const angleRad = degreesToRadians(this.rotation.angleDeg);
    const newTopLeft = getRotatedCords(realCords.topLeft.x, realCords.topLeft.y, originX, originY, angleRad);
    this.position = newTopLeft;
    this.rotation.angleDeg = angleDeg;
    this.rotation.originX = originX;
    this.rotation.originY = originY;
    this.destroyRectangles();
    this.createRectangles();
    this.group.setAttribute('transform', `rotate(${angleDeg}, ${originX}, ${originY})`);
  }

  setPosition = ({ x, y } = this.position) => {
    this.position.x = x ?? this.position.x;
    this.position.y = y ?? this.position.y;

    let start = x;
    for (const rectangle of this.rectangles) {
      rectangle.setAttribute('x', start.toString());
      start += this.singleRectangleWidth + this.gapSize;
    }
  }

  resetDefault = () => {
    this.detach();
    this.setDefaults();
    this.attach();
  }

  #atachRectangles() {
    for (const rectangle of this.rectangles) {
      this.group.append(rectangle);
    }
  }

  #detachRectangles() {
    for (const rectangle of this.rectangles) {
      this.group.remove(rectangle);
    }
  }
}

const drawing = document.querySelector('#drawing');
const rectangleGroup = new RectangleGroup(drawing);
rectangleGroup.attach();
window.rectangleGroup = rectangleGroup;


// TESTS
const testWrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const testInstance = new RectangleGroup(testWrapper);
testInstance.attach();
const testInstanceElement = testWrapper.querySelector('rect');

const newPosition = { x: 100, y: 100 };
testInstance.setPosition(newPosition);
if (testInstanceElement.getAttribute('x') === newPosition.x.toString()) {
  console.log('X has been updated as expected');
} else {
  console.log('X has NOT been updated as expected');
}
if (testInstanceElement.getAttribute('y') === newPosition.y.toString()) {
  console.log('Y has been updated as expected');
} else {
  console.log('Y has NOT been updated as expected');
}