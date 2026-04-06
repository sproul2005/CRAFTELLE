const cloudinary = require('../config/cloudinary');
const fs = require('fs');




exports.uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'craftelle/custom_uploads'
        });

        
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (err) {
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
};
