const jwt = require('jsonwebtoken');
module.exports = function(req, res, next){
	const auth = req.headers.authorization?.split(' ');
	if (!auth || auth[0] !== 'Bearer') return res.status(401).json({ message: 'No token' });
	try {
		const payload = jwt.verify(auth[1], process.env.JWT_SECRET);
		req.user = { id: payload.sub, username: payload.username };
		next();
	} catch {
		res.status(401).json({ message: 'Invalid token' });
	}
};