module.exports = { 
    user:{
        name:{type:String, required:true},
        password:{type:String, required:true}
    },
    furniture: {
    	userName:{type:String, required:true},
    	img:{type:String, required:true},
    	price:{type:String, required:true},
    	name:{type:String, required:true},
        phone:{type:String},
        email:{type:String},
    	address:{type:String},
        description:{type:String},
    	type:{type:String, required:true}
    },
    cart: {
        userName:{type:String, required:true},
        furnitureSet: {type:String, required:true}
    },
    order: {
        userName:{type:String, required:true},
        firstName:{type:String, required:true},
        lastName:{type:String, required:true},
        email:{type:String},
        phone:{type:String},
        address:{type:String, required:true},
        city:{type:String},
        county:{type:String},
        postcode:{type:String},
        furnitureSet: {type:String, required:true},
        createTime: {type:String}
    }

};