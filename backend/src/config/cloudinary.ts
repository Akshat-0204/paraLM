import {v2 as cloudinary} from "cloudinary"

export function initializeCloudinary(): void{

    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const cloud_api = process.env.CLOUDINARY_API_KEY;
    const cloud_secret = process.env.CLOUDINARY_API_SECRET;

    if(!cloud_api || !cloud_name || !cloud_secret){
        throw new Error("Cloudinary env variables are not defined ");
    }

    cloudinary.config({
        cloud_name : cloud_name,
        api_key : cloud_api,
        api_secret : cloud_secret

    });
}


export {cloudinary};