/**
 * Shared K/O/A letter geometry for the cinematic scroll sequence.
 *
 * Each letter is defined as an array of [x, y] anchor points.
 * `getLetterPositions()` scales and translates those anchors to
 * pixel coordinates so both LivingGlyphField and KOALogoIntro can
 * converge glyphs onto the same shapes.
 */

export const LETTER_SHAPES = {
  // Chunky K: thick vertical stem + bold diagonals with double-stroke width
  K: [
    // Vertical stem — dense, thick stroke (11 points)
    [-1.15, -1.35], [-1.15, -1.08], [-1.15, -0.81], [-1.15, -0.54],
    [-1.15, -0.27], [-1.15, 0.0], [-1.15, 0.27], [-1.15, 0.54],
    [-1.15, 0.81], [-1.15, 1.08], [-1.15, 1.35],
    // Upper diagonal — thick outward stroke (8 points)
    [-0.92, -0.15], [-0.68, -0.05], [-0.44, 0.05], [-0.18, 0.18],
    [0.10, 0.42], [0.34, 0.66], [0.58, 0.90], [0.82, 1.18],
    // Lower diagonal — thick outward stroke (6 points)
    [0.10, -0.10], [0.34, -0.34], [0.58, -0.58], [0.82, -0.86],
    // Extra thickness points along diagonals (inner stroke)
    [-0.72, -0.18], [-0.46, -0.08], [-0.20, 0.02],
    [0.22, 0.32], [0.46, 0.56], [0.70, 0.80],
    [0.22, -0.22], [0.46, -0.46],
  ],
  O: [
    [-0.78, -1.04], [-0.42, -1.16], [0, -1.2], [0.42, -1.16], [0.78, -1.04],
    [1.02, -0.72], [1.10, -0.36], [1.12, 0], [1.10, 0.36], [1.02, 0.72],
    [0.78, 1.04], [0.42, 1.16], [0, 1.2], [-0.42, 1.16], [-0.78, 1.04],
    [-1.02, 0.72], [-1.10, 0.36], [-1.12, 0], [-1.10, -0.36], [-1.02, -0.72],
  ],
  // Chunky A: thick angled legs + bold crossbar with extra density
  A: [
    // Left leg — thick descending stroke (9 points)
    [-1.08, 1.18], [-0.92, 0.86], [-0.76, 0.54], [-0.60, 0.22], [-0.44, -0.10],
    [-0.28, -0.42], [-0.14, -0.70], [0, -0.98],
    // Right leg — thick descending stroke (8 points)
    [0.14, -0.70], [0.28, -0.42], [0.44, -0.10], [0.60, 0.22],
    [0.76, 0.54], [0.92, 0.86], [1.08, 1.18],
    // Crossbar — thick horizontal (7 points, wider)
    [-0.62, 0.22], [-0.42, 0.22], [-0.21, 0.22], [0, 0.22],
    [0.21, 0.22], [0.42, 0.22], [0.62, 0.22],
    // Extra thickness along legs (inner stroke)
    [-0.82, 0.70], [-0.66, 0.38], [-0.50, 0.06], [-0.34, -0.26],
    [0.34, -0.26], [0.50, 0.06], [0.66, 0.38], [0.82, 0.70],
  ],
};

/**
 * Return an array of { x, y } pixel positions for each anchor of the
 * given letter, centred at (centerX, centerY) with the given scale.
 */
export function getLetterPositions(letter, centerX, centerY, scale) {
  const shape = LETTER_SHAPES[letter];
  if (!shape) return [];
  return shape.map(([x, y]) => ({
    x: centerX + x * scale * 35,
    y: centerY + y * scale * 35,
  }));
}
