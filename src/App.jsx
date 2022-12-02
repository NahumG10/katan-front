import { useState, useRef, useEffect } from "react";

import "./App.css";

function App() {
  const hexSize = 50;
  const hexOrigin = { x: 300, y: 300 };
  const [canvasPosition, setCanvasPosition] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });
  const [currentHexagon, setCurrentHexagon] = useState({
    col: -300,
    row: -1000,
  });
  const [hexagonsList, setHexagonsList] = useState([]);
  const [ctxHexCanvas, setCtxHexCanvas] = useState();
  const [ctxCoordCanvas, setCtxCoordCanvas] = useState();
  const [road, setRoad] = useState(2);
  const canvasId = useRef(null);
  const canvasCoords = useRef(null);
  const radius = 2;

  const mapCoordToIndex = [
    [null, null, 16, 17, 18],
    [null, 12, 13, 14, 15],
    [7, 8, 9, 10, 11],
    [3, 4, 5, 6, null],
    [0, 1, 2, null, null],
  ];

  useEffect(() => {
    drawHexes();
    let rect = canvasId.current.getBoundingClientRect();
    setCanvasPosition({
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
    });
    setCtxHexCanvas(canvasId.current.getContext("2d"));

    console.log(mapCoordToIndex);
  }, []);

  function getHexCornerCoord(center, i) {
    let angle_deg = 60 * i - 30;
    var angle_rad = (Math.PI / 180) * angle_deg;
    let x = center.x + hexSize * Math.cos(angle_rad);
    let y = center.y + hexSize * Math.sin(angle_rad);
    return Point(x, y);
  }

  function drawHexCoordinates(can, center, hexagon, index) {
    const ctx = can.current.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.font = "20pt Calibri";
    // ctx.fillText(hexagon.row, center.x - 10, center.y)
    // ctx.fillText(hexagon.col, center.x + 7, center.y)
    ctx.fillText(
      mapCoordToIndex[hexagon.row][hexagon.col],
      center.x,
      center.y + 8
    );
    // ctx.fillText(-hexagon.col - hexagon.row, center.x , center.y + 18)
  }

  function drawHexes() {
    let counter = 0;
    let list = [];
    drawSea();
    for (let q = -radius; q <= radius; q++) {
      let r1 = Math.max(-radius, -q - radius);
      let r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        let center = hexToPixel(Hex(q, r));
        list.push({
          index: mapCoordToIndex[r + radius][q + radius],
          row: r + radius,
          col: q + radius,
          center: center,
        });
        fillHex(canvasId, center, "#c9c6cc");
        drawHex(canvasId, { x: center.x, y: center.y });
        drawHexCoordinates(
          canvasId,
          center,
          Hex(q + radius, r + radius),
          counter
        );
      }
    }

    // console.log(list)
    setHexagonsList(list);
  }

  function drawSea() {
    const map_radius = 3;
    for (let q = -map_radius; q <= map_radius; q++) {
      let r1 = Math.max(-map_radius, -q - map_radius);
      let r2 = Math.min(map_radius, -q + map_radius);
      for (let r = r1; r <= r2; r++) {
        let center = hexToPixel(Hex(q, r));
        fillHex(canvasId, center, "#34aeeb");
        drawHex(canvasId, { x: center.x, y: center.y });
        // drawHexCoordinates(canvasId, center, Hex(q, r))
      }
    }
  }

  function pixel_to_pointy_hex(point) {
    let q =
      (((point.x - hexOrigin.x) * Math.sqrt(3)) / 3 -
        (point.y - hexOrigin.y) / 3) /
      hexSize;
    let r = ((point.y - hexOrigin.y) * 2) / 3 / hexSize;

    return Hex(q, r, -q - r);
  }

  function drawHex(can, center, color, width) {
    for (let i = 0; i < 6; i++) {
      let start = getHexCornerCoord(center, i);
      let end = getHexCornerCoord(center, i + 1);

      drawLine(
        can,
        { x: start.x, y: start.y },
        { x: end.x, y: end.y },
        color,
        width
      );
    }
  }

  function fillHex(can, center, color) {
    let c0 = getHexCornerCoord(center, 0);
    let c1 = getHexCornerCoord(center, 1);
    let c2 = getHexCornerCoord(center, 2);
    let c3 = getHexCornerCoord(center, 3);
    let c4 = getHexCornerCoord(center, 4);
    let c5 = getHexCornerCoord(center, 5);
    const ctx = can.current.getContext("2d");
    ctx.beginPath();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = color;
    ctx.moveTo(c0.x, c0.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.lineTo(c4.x, c4.y);
    ctx.lineTo(c5.x, c5.y);
    ctx.closePath();
    ctx.fill();
  }

  function hexToPixel(hex) {
    let x =
      hexSize * (Math.sqrt(3) * hex.col + (Math.sqrt(3) / 2) * hex.row) +
      hexOrigin.x;
    let y = hexSize * ((3 / 2) * hex.row) + hexOrigin.y;
    return Point(x, y);
  }

  function drawLine(can, start, end, color, width) {
    const ctx = can.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    // ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.closePath();
  }

  function Point(x, y) {
    return { x: x, y: y };
  }

  function Hex(col, row, s) {
    return { col: col, row: row, s: s };
  }

  function drawRoad(hex, edge, color) {
    console.log("list", hexagonsList);
    let center = hexagonsList.filter((item) => item.index === hex)[0].center;

    let c0 = getHexCornerCoord(center, edge);
    let c1 = getHexCornerCoord(center, edge + 1);

    let x0Factor = 0;
    let y0Factor = 0;
    let x1Factor = 0;
    let y1Factor = 0;

    const size = 8;
    const halfSize = 4;

    switch (edge) {
      case 0:
        y0Factor = size;
        y1Factor = -size;
        break;
      case 1:
        x0Factor = -size;
        y0Factor = halfSize;
        x1Factor = size;
        y1Factor = -halfSize;
        break;
      case 2:
        x0Factor = -size;
        y0Factor = -halfSize;
        x1Factor = size;
        y1Factor = halfSize;
        break;
      case 3:
        y0Factor = -size;
        y1Factor = size;
        break;
      case 4:
        x0Factor = size;
        y0Factor = -halfSize;
        x1Factor = -size;
        y1Factor = halfSize;
        break;
      case 5:
        x0Factor = size;
        y0Factor = halfSize;
        x1Factor = -size;
        y1Factor = -halfSize;
        break;
    }

    drawLine(
      canvasId,
      { x: c0.x + x0Factor, y: c0.y + y0Factor },
      { x: c1.x + x1Factor, y: c1.y + y1Factor },
      color,
      10
    );

    // const ctx = canvasId.current.getContext('2d');
    // ctx.beginPath();
    // ctx.rect(208, 205, 10, 40);
    // ctx.fillStyle = "red";
    // ctx.fill();
    // ctx.stroke();
  }

  function drawCircle(hex, vertex) {
    let centerHex = hexagonsList.filter((x) => x.index === hex)[0].center;
    let center = getHexCornerCoord(centerHex, vertex);
    const ctx = ctxHexCanvas;

    ctx.beginPath();
    ctx.arc(center.x, center.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
  }

  function hex_round(h) {
    let q = Math.round(h.col);
    let r = Math.round(h.row);
    let s = Math.round(h.s);
    let q_diff = Math.abs(q - h.col);
    let r_diff = Math.abs(r - h.row);
    let s_diff = Math.abs(s - h.s);
    if (q_diff > r_diff && q_diff > s_diff) {
      q = -r - s;
    } else if (r_diff > s_diff) {
      r = -q - s;
    } else {
      s = -q - r;
    }

    return Hex(q, r, s);
  }
  function handleClick(e) {
    // drawRoad(mapCoordToIndex[currentHexagon.row][currentHexagon.col], road, "red")
    // drawRoad(mapCoordToIndex[currentHexagon.row][currentHexagon.col], road, "red")
    // let center = hexagonsList.filter(item => item.col === currentHexagon.col && item.row === currentHexagon.row)[0].center
    drawCircle(mapCoordToIndex[currentHexagon.row][currentHexagon.col], road);
  }

  function handleMove(e) {
    // console.log(e.pageX -canvasPosition.left , e.pageY - canvasPosition.top)

    let offsetX = e.pageX - canvasPosition.left;
    let offsetY = e.pageY - canvasPosition.top;
    const { col, row, s } = hex_round(
      pixel_to_pointy_hex(Point(offsetX, offsetY))
    );

    if (currentHexagon.col !== col || currentHexagon.row !== row) {
      setCurrentHexagon({ row: row + 2, col: col + 2 });

      const ctx = canvasCoords.current.getContext("2d");
      const { x, y } = hexToPixel(Hex(col, row, s));
      ctx.clearRect(0, 0, 800, 600);
      drawHex(canvasCoords, { x: x, y: y }, "lime", 2);
    }
  }

  // useEffect(()=>{
  //   // console.log( currentHexagon.col, currentHexagon.row )

  // },[currentHexagon])

  return (
    <>
      <div
        className="App"
        style={{ position: "relative", display: "block", height: 650 }}
      >
        <canvas height={600} width={600} ref={canvasId}></canvas>
        <canvas
          height={600}
          width={600}
          ref={canvasCoords}
          onMouseMove={handleMove}
          onClick={handleClick}
        ></canvas>
      </div>
      <div style={{ position: "relative", display: "block" }}>
        <input
          type="number"
          onChange={(e) => {
            setRoad(parseInt(e.target.value) % 6);
          }}
        />
        <button
          onClick={() => {
            // drawRoad(0,1,"navy");
          }}
        >
          hi
        </button>
      </div>
    </>
  );
}

export default App;
