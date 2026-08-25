import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const width = 900;
const height = 600;
const columns = 90;
const rows = 60;
const levels = [-1.8, -1.4, -1.0, -0.6, -0.2, 0.2, 0.6, 1.0, 1.4, 1.8];

// Every frequency is an integer multiple of 2π, which makes the field wrap
// exactly at all four edges when the SVG is tiled as a CSS background.
function terrain(x, y) {
  const tau = Math.PI * 2;
  return (
    0.88 * Math.sin(tau * x) +
    0.72 * Math.cos(tau * y) +
    0.52 * Math.sin(tau * (x + y)) +
    0.34 * Math.cos(tau * (2 * x - y)) +
    0.24 * Math.sin(tau * (x + 2 * y)) +
    0.18 * Math.cos(tau * (3 * x + 2 * y))
  );
}

function pointOnEdge(edge, values, level, x0, y0, x1, y1) {
  const interpolate = (a, b) => {
    const span = b - a;
    return Math.abs(span) < 1e-9 ? 0.5 : (level - a) / span;
  };

  if (edge === 0) {
    const t = interpolate(values[0], values[1]);
    return [x0 + (x1 - x0) * t, y0];
  }
  if (edge === 1) {
    const t = interpolate(values[1], values[2]);
    return [x1, y0 + (y1 - y0) * t];
  }
  if (edge === 2) {
    const t = interpolate(values[3], values[2]);
    return [x0 + (x1 - x0) * t, y1];
  }

  const t = interpolate(values[0], values[3]);
  return [x0, y0 + (y1 - y0) * t];
}

function segmentPath(level) {
  const commands = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x0 = (column / columns) * width;
      const x1 = ((column + 1) / columns) * width;
      const y0 = (row / rows) * height;
      const y1 = ((row + 1) / rows) * height;
      const values = [
        terrain(column / columns, row / rows),
        terrain((column + 1) / columns, row / rows),
        terrain((column + 1) / columns, (row + 1) / rows),
        terrain(column / columns, (row + 1) / rows),
      ];
      const crossings = [];

      if ((values[0] < level) !== (values[1] < level)) crossings.push(0);
      if ((values[1] < level) !== (values[2] < level)) crossings.push(1);
      if ((values[3] < level) !== (values[2] < level)) crossings.push(2);
      if ((values[0] < level) !== (values[3] < level)) crossings.push(3);

      const pairs = crossings.length === 2
        ? [[crossings[0], crossings[1]]]
        : crossings.length === 4
          ? (terrain((column + 0.5) / columns, (row + 0.5) / rows) < level
              ? [[0, 1], [2, 3]]
              : [[0, 3], [1, 2]])
          : [];

      for (const [firstEdge, secondEdge] of pairs) {
        const first = pointOnEdge(firstEdge, values, level, x0, y0, x1, y1);
        const second = pointOnEdge(secondEdge, values, level, x0, y0, x1, y1);
        commands.push(
          `M${first[0].toFixed(2)},${first[1].toFixed(2)}L${second[0].toFixed(2)},${second[1].toFixed(2)}`,
        );
      }
    }
  }

  return commands.join("");
}

const contours = levels.map((level, index) => {
  const major = index % 5 === 0;
  return `  <path d="${segmentPath(level)}" stroke-opacity="${major ? "0.11" : "0.075"}" stroke-width="${major ? "1.55" : "1.05"}"/>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
<g fill="none" stroke="#1f568f" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round">
${contours.join("\n")}
</g>
</svg>
`;

const output = resolve("assets/design/topography.svg");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, svg, "utf8");
console.log(`Generated ${output}`);
