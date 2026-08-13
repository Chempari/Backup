const fs = require('fs');
const path = 'C:/Users/USUARIO/OneDrive/Desktop/Mentora/Proyecto_Mentora/Mentora/FrontEnd/src/pages/cursos/Aprendizaje/CursoAprendizaje.jsx';
let src = fs.readFileSync(path, 'utf8');

const LBR = String.fromCharCode(123);
const RBR = String.fromCharCode(125);
const LT = String.fromCharCode(60);
const SL = String.fromCharCode(47);
const GT = String.fromCharCode(62);

const fixes = [
  [LBR + 'certMsg' + LT + SL + 'span' + GT, LBR + 'certMsg' + RBR + LT + SL + 'span' + GT],
  [LBR + 'leccionActual.titulo' + LT + SL + 'h2' + GT, LBR + 'leccionActual.titulo' + RBR + LT + SL + 'h2' + GT],
  [LBR + 'leccionActual.descripcion' + LT + SL + 'p' + GT, LBR + 'leccionActual.descripcion' + RBR + LT + SL + 'p' + GT],
  [LBR + 'leccionActual.duracion' + LT + SL + 'span' + GT, LBR + 'leccionActual.duracion' + RBR + LT + SL + 'span' + GT],
  [LBR + 'leccionActual ? leccionActual._id : null' + LT + SL, LBR + 'leccionActual ? leccionActual._id : null' + RBR + LT + SL],
  [LBR + 'curso.titulo' + LT + SL + 'h1' + GT, LBR + 'curso.titulo' + RBR + LT + SL + 'h1' + GT],
  [LBR + 'error' + LT + SL + 'div' + GT, LBR + 'error' + RBR + LT + SL + 'div' + GT]
];

for (const [bad, good] of fixes) {
  const count = src.split(bad).length - 1;
  src = src.split(bad).join(good);
  if (count) console.log('  replaced', count, 'of', JSON.stringify(bad));
}
fs.writeFileSync(path, src, 'utf8');
console.log('done, size:', src.length);
