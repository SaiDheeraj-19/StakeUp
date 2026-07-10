import cloudinary
import cloudinary.uploader
from app.core.config import settings

def init_cloudinary():
    if not settings.CLOUDINARY_CLOUD_NAME:
        print("Cloudinary not configured")
        return False
        
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    return True

def upload_proof_image(file_content: bytes, filename: str) -> str:
    """
    Uploads an image byte stream to Cloudinary and returns the secure URL.
    """
    if not init_cloudinary():
        raise Exception("Cloudinary credentials missing")
        
    response = cloudinary.uploader.upload(
        file_content,
        folder="stakeup_proofs",
        public_id=filename.split(".")[0],
        overwrite=True,
        resource_type="image"
    )
    
    return response.get("secure_url")
