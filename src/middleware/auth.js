
import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Faça login para continuar' });
  }
}

export function permitir(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario.perfil)) {
      return res.status(403).json({ erro: 'Sem permissao' });
    }

    next();
  };
}
