import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from "jsonwebtoken"
export const register = async (req, res) => {
  try {
    // console.log(req.body);
    const { name, email, password } = req.body;
    // validation
    if (!name) return res.status(400).send("Name is required");
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should be min 6 characters long");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email is taken");

    // hash password
    const hashedPassword = await hashPassword(password);

    // register
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    // console.log("saved user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

export const login = async (req,res) =>{
try {
  // console.log(req.body)
   //Find  compare execute
   const{email,password}=req.body;
   //Check User Exist In db
   let user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No User Find ,Please SignUp");
  //check Paswoord hashed ->Current and Db user
  const match=await comparePassword(password,user.password);
  if (!match) return res.status(400).send("Password didn't Match!! Try Again");
  const token=jwt.sign({_id:user._id},process.env.JWT_SECRET,{
    expiresIn:"7d",
  });
//return user and token only not pwd
user.password=undefined;
//Send Token In cookie
//http flag for security so its not avail by Js on client side
res.cookie('token',token,{
  httpOnly:true,
  //secure:true//For https
});

//Send User As JSON response
res.json(user);

} catch (error) {
  console.log(error);
  return res.status(400).send("Error ,Try again.")
  
}
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({message:"Logout Sucess"})
   
  } catch (err) {
    console.log(err);
   
  }
};

//We get Id from middleware and pass it here
export const currentUser = async (req, res) => {
  try {
    const user=await User.findById(req.user._id).select('-password').exec();
    console.log("Current User => ",user);
    return res.json({ok:true});
   
  } catch (err) {
    console.log(err);
   
  }
};