export class Rectangle {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly dimX: number,
    public readonly dimY: number
  ) {}

  /**
   *
   * @returns a list of bounding rects for NW, NE, SE, SW quads respectively
   */
  public returnQuadrants(): Rectangle[] {
    const NEW_X_DIM: number = this.dimX / 2;
    const NEW_Y_DIM: number = this.dimY / 2;
    const newPos = [
      { x: this.x - NEW_X_DIM, y: this.y - NEW_Y_DIM },
      { x: this.x + NEW_X_DIM, y: this.y - NEW_Y_DIM },
      { x: this.x + NEW_X_DIM, y: this.y + NEW_Y_DIM },
      { x: this.x - NEW_X_DIM, y: this.y + NEW_Y_DIM },
    ];
    return newPos.map((pos) => {
      return new Rectangle(pos.x, pos.y, NEW_X_DIM, NEW_Y_DIM);
    });
  }

  public get leftEdge(): number {
    return this.x - this.dimX;
  }

  public get rightEdge(): number {
    return this.x + this.dimX;
  }
  public get topEdge(): number {
    return this.y - this.dimY;
  }
  public get bottomEdge(): number {
    return this.y + this.dimY;
  }

  public get edges(): number[] {
    return [this.topEdge, this.rightEdge, this.bottomEdge, this.leftEdge];
  }

  public includes(p: Point): boolean {
    const [top, right, bot, left] = this.edges;
    return p.x >= left && p.x <= right && p.y >= top && p.y <= bot;
  }
}

interface Point {
  x: number;
  y: number;
}

export class QuadTree {
  private _points: Point[] = [];
  private _quadrants: QuadTree[] = [];

  constructor(private _bound: Rectangle, private _capacity: number) {}

  public insert(p: Point): void {
    if (this._points.length < this._capacity) {
      this._points.push(p);
    } else {
      if (this._quadrants.length == 0) {
        this.split();
      }
      const [nwQ, neQ, seQ, swQ] = this._quadrants;
      if (nwQ.includes(p)) {
        nwQ.insert(p);
      } else if (neQ.includes(p)) {
        neQ.insert(p);
      } else if (seQ.includes(p)) {
        seQ.insert(p);
      } else if (swQ.includes(p)) {
        swQ.insert(p);
      }
    }
  }

  public split(): void {
    this._quadrants = this._bound.returnQuadrants().map((rect) => {
      return new QuadTree(rect, this._capacity);
    });
  }

  public includes(p: Point): boolean {
    return this._bound.includes(p);
  }

  public getRenderingData(returnData: Rectangle[] = []): Rectangle[] {
    returnData.push(this._bound);

    this._quadrants.forEach((quad: QuadTree) => {
      quad.getRenderingData(returnData);
    });

    return returnData;
  }
}
