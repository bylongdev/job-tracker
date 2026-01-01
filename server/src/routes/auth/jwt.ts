import jwt from "jsonwebtoken";

export function signToken(payload: { userId: string }) {
	return jwt.sign(payload, process.env.JWT_SECRET!, {
		expiresIn: "1h",
	});
}

export function verifyToken(token: string) {
	return jwt.verify(token, process.env.JWT_SECRET!);
}
