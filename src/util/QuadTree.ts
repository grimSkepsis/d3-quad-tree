export class Rectangle {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly dimX: number,
    public readonly dimY: number
  ) {}

  /**
   * Splits the rectangle into squadrants
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

  /**
   * Get's the edges of the rect
   */
  public get edges(): number[] {
    return [this.topEdge, this.rightEdge, this.bottomEdge, this.leftEdge];
  }

  /**
   * Checks if a point is inside the rectangle
   * @param p
   * @returns
   */
  public includes(p: Point): boolean {
    const [top, right, bot, left] = this.edges;
    return p.x >= left && p.x <= right && p.y >= top && p.y <= bot;
  }

  /**
   * Returns true if this rectangle overlaps with another
   * @param rect
   */
  public overlaps(rect: Rectangle): boolean {
    const [top, right, bot, left] = this.edges;
    const [oTop, oRight, oBot, oLeft] = rect.edges;
    return !(oBot < top || oTop > oBot || oLeft > right || oRight < oLeft);
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

  /**
   * Inserts point into the quad tree, splitting it into quadrants if necessary
   * @param p
   */
  public insert(p: Point): void {
    if (this._points.length < this._capacity && this._quadrants.length == 0) {
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

  public query(bounds: Rectangle): Point[] {
    let foundPoints: Set<Point> = new Set([]);

    if (this._bound.overlaps(bounds)) {
      if (this._quadrants.length == 0) {
        return this._points;
      } else {
        this._quadrants.forEach((quad) => {
          foundPoints = new Set<Point>([
            ...Array.from(quad.query(bounds)),
            ...Array.from(foundPoints),
          ]);
        });
      }
    }
    return Array.from(foundPoints);
  }

  /**
   * Splits the current quadrant into quadrants, off loads the quadrants points into the new quadrants
   */
  public split(): void {
    this._quadrants = this._bound.returnQuadrants().map((rect) => {
      return new QuadTree(rect, this._capacity);
    });
    this._points.forEach((p) => {
      this.insert(p);
    });
    this._points = [];
  }

  /**
   * Detects whether or not the point's poistion falls within the quad-tree's area
   * @param p
   * @returns
   */
  public includes(p: Point): boolean {
    return this._bound.includes(p);
  }

  /**
   * Returns all the bounding rectangles for the quad tree
   * @param returnData
   * @returns
   */
  public getRenderingData(returnData: Rectangle[] = []): Rectangle[] {
    returnData.push(this._bound);

    this._quadrants.forEach((quad: QuadTree) => {
      quad.getRenderingData(returnData);
    });

    return returnData;
  }
}
