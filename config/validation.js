const { object, string} =require('yup') ;

let signUpSchema = object({
    pseudo:string().required().trim().strict(),
    email: string().email().required().trim().strict(),
    password:string().required().trim().strict().matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&;,.])[A-Za-z\d@$!%*?&;,.]{8,}/),
  });



module.exports={signUpSchema}