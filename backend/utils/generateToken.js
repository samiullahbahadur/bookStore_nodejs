import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "30d" } // 30 days
  );
  // const token = jwt.sign({ id: 16, name: "Ahmad" }, "Lamadev123", {
  //   expiresIn: "30d",
  // });
  // console.log(token);
};

export default generateToken;
