import mongoose from 'mongoose';

const productSchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    
    description:{
        type:String,
        required:true
    },
    productInformation:{
        type:String,
        required:true
    },
    regularPrice:{
        type:Number,
        required:true
    },
    offerPrice:{
        type:Number,
    },
    size:{
        type:String,
    },
    stock:{
        type:Number,
        required:true
    },
    productDiscount:{
        type:Number,
        required: false
    },
    categoryDiscount:{
        type:Number,
        required: false,
    },
    brand:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'Category',
       
    },
    images:[
        {
            url:{
                type:String
            }
        }
    ],
    list:{
        type:Boolean,
    },
    createdOn:{
        type:Date,
        required:true
    },
    updatedOn:{
        type:Date,
        required:true
    }
    
})


const Product= mongoose.model('Product',productSchema);

export default Product;