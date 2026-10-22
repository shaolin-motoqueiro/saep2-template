import jwt from 'jsonwebtoken';


export function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.replace('Bearer ', '');

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token invalido ou expirado. Faca login.' });
  }
}


export function somenteAdmin(req, res, next) {
  if (req.usuario.perfil !== 'ADMINISTRADOR') {
    return res.status(403).json({ erro: 'Somente administrador' });
  }
  next();
}