class ApiError extends Error{ 
    constructor( statuscode, message='Somthing went wrong',errors =[],stack='')
    { 
        this.statuscode =statuscode, 
        super(message) 
        this.data =null 
        this.message =message 
        this.errors =errors 
        this.success = false 
        if(stack){ 
            this.stack=stack
        }else{
             Error.captureStackTrace(this,this.constructor)
             }
         } 
        
        } export{ ApiError}