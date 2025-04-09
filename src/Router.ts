import { Router, Request, Response } from "express";
const UserRoute: Router = Router();
import { unknown, z } from "zod";
import { UserModel , JobModel } from "./db";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import UserMiddleware from "./Middleware";



const JWT_SECRET: string = "StudentTracker";

const RegisteringSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "Must be atleast 6 charchacter" }),
}); //  schema for registering and singing the user

type RegisteringSchemaType = z.infer<typeof RegisteringSchema>;



const JobSchema = z.object({
    company : z.string({message : "Please provide the name of company"}),
    role : z.string(),
    dateApplied : z.coerce.date(),
    link : z.string({message : "Please provide the link"}),
    status : z.enum(["Applied", "Interview", "Offer", "Rejected"])
    
})

type JobSchematype = z.infer<typeof JobSchema>

``
UserRoute.post("/signup", async (req: Request, res: Response): Promise<any> => {
  const succesRegisterSchema = RegisteringSchema.safeParse(req.body);
  if (!succesRegisterSchema.success) {
    return res.json({
      error: succesRegisterSchema.error.format(),
    });
  }

  const { email, password }: RegisteringSchemaType = req.body;

  try {
      await bcrypt.hash(password, 5, async (err, hash) => {
      const user = await UserModel.create({
        email: email,
        password: hash,
      });

      return res.status(200).json({
        msg: "User successfully registered",
      });
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      msg: "Server error ",
    });
  }
});





UserRoute.post("/signin", async (req: Request, res: Response): Promise<any> => {


  const succesRegisterSchema = RegisteringSchema.safeParse(req.body);

  if (!succesRegisterSchema.success) {
    return res.json({
      error: succesRegisterSchema.error.format(),
    });
  }

  const { email, password }: RegisteringSchemaType = req.body;

  try {
    const user = await UserModel.findOne({
      email: email,
    });

    if (!user) {
      return res.status(404).json({
        msg: "User is not found ",
      });
    }

    const passwordSucces = await bcrypt.compareSync(
      password,
      user?.password || ""
    );

    if (!passwordSucces) {
      return res.status(403).json({
        msg: "Invalid Credientials",
      });
    } else {
      const token: string = Jwt.sign({ id: user?._id }, JWT_SECRET, {
        algorithm: "HS256",
      });
      return res.status(200).json({
        msg: "you are signed in ",
        token: token,
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      msg: "Intenal server eroor ",
    });
  }
});


UserRoute.use(UserMiddleware)

interface CustomRequest extends Request {
  userId?: string; // You can define a proper type instead of 'any'
}





UserRoute.post("/Jobs" , async(req : CustomRequest , res : Response) : Promise<any>=>{
    const JobBodyParse = JobSchema.safeParse(req.body)
    
    if(!JobBodyParse.success){
        return res.status(403).json({
            msg : JobBodyParse.error.format()
        })
    }

    const { company , link , role , dateApplied , status }  : JobSchematype = req?.body
    
    const userId = req.userId

    try {
      await JobModel.create({
        user : userId,
        company : company,
        role : role,
        dateApplied : dateApplied,
        link : link,
        status : status
      })

      res.status(200).json({
        msg : "Posted Succesfully"
      })

      
    }catch(e){
      console.log(e)
      res.status(500).json({
        msg : "Internal server Error"
      })
    }
    
   


})  


UserRoute.put("/Jobs/:id" , async(req : CustomRequest , res : Response) : Promise<any>=>{
  
  const id = req.params.id
  const { company , link , role , dateApplied , status }  : JobSchematype = req?.body
  
  const userId = req.userId

  try{
    await JobModel.findOneAndUpdate({
      _id : id,
      user : userId
     },
     {
      company : company,
      link : link,
      role : role,
      dateApplied : dateApplied,
      status : status
     }
    )
    
  
   return  res.status(200).json({
      msg : "Updated Succesfully"
    })
  }catch(e  ){
    console.log(e)
return res.status(500).json({
  msg : "Internal Server Error"
})

  }
  
  

} )


UserRoute.get("/Jobs" , async (req : CustomRequest , res : Response):Promise<any> =>{

  const userId = req.userId

  try {
    const response = await JobModel.find({
      user : userId
    }).populate("user")
  
    return res.status(200).json(response)
  }catch(e){
  console.log(e)
  return res.status(500).json({
    msg : "Internal server error"
  })
  }
})

UserRoute.delete("/Jobs/:id" , async (req : CustomRequest , res : Response):Promise<any>=>{
  const jobId = req.params.id
  const userId = req.userId


  try{
    await JobModel.findOneAndDelete({
      user : userId,
      _id : jobId
    })

    return res.status(200).json({
      msg : "Job Deleted"
    })
  }catch(e){
    return res.status(500).json({
      msg : "Intenal Server Error"
    })
  }

  
})







export  default UserRoute