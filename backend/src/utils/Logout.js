
export const Logout = async(req,res)=>{
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      });
      res.json({ message: "Logout successful" });
}