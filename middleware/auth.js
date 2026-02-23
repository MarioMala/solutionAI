// Middleware sprawdzający czy użytkownik jest zalogowany

export const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Wymagane logowanie' });
    }
    next();
};
