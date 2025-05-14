require('dotenv').config()
const express = require('express')
const connectToDatabase = require('./database')
const Blog = require('./model/blogModel')
const { multer, storage } = require('./middleware/multerConfig')
const upload = multer({storage: storage})
const fs = require('fs')
const app = express()
app.use(express.json())
const cors = require('cors')
const path = require('path');


app.use(cors({
    origin: ["https://mern-3-p404.vercel.app", "http://localhost:5173"]
}))


connectToDatabase()

    // API to create blog
    // app.post("/blog",upload.single('image'), async (req, res)=>{
    //     try {
    //         const {title, subtitle, description} = req.body
    //         const filename =  "https://nodejs-ds6o.onrender.com/"+req.file?.filename

    //         // validate input fields
    //         if(!title || !subtitle || !description || !req.file){
    //             try {
    //                 if(req.file?.filename){
    //                     await fs.promises.unlink('./storage/' + filename)
    //                     console.log("File deleted successfully !")
    //                 }
    //             } catch (error) {
    //                 console.log("Failed to delete the file !", error.message)
    //             }

    //             return res.status(400).json({
    //                 message : "Please enter all the fields !"
    //             })
    //         }

    //         const blog = await Blog.create({title, subtitle, description, image : filename})
    //         res.status(200).json({
    //             message : "Blog Created Successfully !",
    //             data : blog
    //         })
    //     } catch (error) {
    //         res.status(500).json({
    //             message : "Something went wrong !",
    //             error : error.message
    //         })
    //     }
        
    // })

    // API to create blog
app.post("/blog", upload.single('image'), async (req, res) => {
    try {
        const { title, subtitle, description } = req.body
        let filename;
        if (req.file) {
            filename = "http://localhost:3000/" + req.file.filename
            if (!title || !subtitle || !description) {
                try {
                    if (req.file?.filename) {
                        await fs.promises.unlink('./storage/' + filename)
                        console.log("File deleted successfully !")
                    }
                } catch (error) {
                    console.log("Failed to delete the file !", error.message)
                }

                return res.status(400).json({
                    message: "Please enter all the fields !"
                })
            }

        }
        else {
            filename = "https://w0.peakpx.com/wallpaper/551/966/HD-wallpaper-cute-cats-cat-cute-kawaii-pink-thumbnail.jpg"
        }

        await Blog.create({
            title: title,
            subtitle: subtitle,
            description: description,
            image: filename
        })
        res.status(200).json({
            message: "Blog Created Successfully !"
        })


    } catch (error) {
        res.status(500).json({
            message: "Something went wrong !",
            error: error.message
        })
    }


})



// API to fetch blogs
app.get("/blog", async (req, res)=>{
    try {
        const blogs = await Blog.find()
        if(blogs.length === 0){
            return res.status(404).json({
                message: "No data found"
            })
        }
        res.status(200).json({
            message : "Blogs fetched sucessfully !",
            data : blogs
        })
    } catch (error) {
        res.status(500).json({
            message : "Something went wrong while fetching blogs !",
            error :  error.message
        })
    }
})

// API to fetch single blog
app.get("/blog/:id", async (req, res)=>{
try {
    const {id} = req.params
    const blog = await Blog.findById(id)

    if(!blog){
        return res.status(404).json({
            message: "Blog not found"
        })
    }
    res.status(200).json({
        message : "Blog fetched successfully !",
        data : blog
    })
} catch (error) {
    res.status(500).json({
        message : "Something went wrong while fetching blog !",
        error : error.message
    })
}
})

// API to update blog
app.put("/blog/:id", upload.single('image'), async (req, res)=>{
    try {
        const {id} = req.params
        const blog = await Blog.findById(id)
        if(!blog){
            return res.status(404).json({
                message: "No data found"
            })
        }
    
        let filename = blog.image
        //  If new image is uploaded
        if (req.file) {
            //  Only delete old file if it was local
            if (filename.startsWith("http://localhost:3000/")) {
                const oldFilename = filename.replace("http://localhost:3000/", "");
                const filePath = path.join(__dirname, 'storage', oldFilename);
                try {
                    await fs.promises.unlink(filePath);
                    console.log("Old file deleted successfully!");
                } catch (error) {
                    console.error("Error deleting old image:", error.message);
                }
            }

            //  Save full URL of new image
            filename = "http://localhost:3000/" + req.file.filename;
        }
    
        const {title, subtitle, description} = req.body
        await Blog.findByIdAndUpdate(id, {
            title, 
            subtitle, 
            description, 
            image : filename
        })
        res.status(200).json({
            message : "Blog updated successfully !"
        })
    } catch (error) {
        res.status(500).json({
            message : "Something went wrong while updating blog !",
            error : error.message
        })
    }
})

// API to delete blog
app.delete("/blog/:id", async (req, res)=>{
    try {
        const {id} = req.params
        const blog = await Blog.findById(id)
        if(!blog){
            return res.status(404).json({
                message: "Blog not found !"
            })
        }
        const imageUrl = blog.image;

        // Only try to delete the image if it's a local file
        if (imageUrl && imageUrl.startsWith("http://localhost:3000/")) {
            const filename = imageUrl.replace("http://localhost:3000/", "");
            const filePath = path.join(__dirname, 'storage', filename);

            try {
                await fs.promises.unlink(filePath);
                console.log("File deleted successfully!");
            } catch (error) {
                console.error("Failed to delete the file!", error.message);
                // Optional: Don't return here, just log it and continue to delete blog
            }
        }

        await Blog.findByIdAndDelete(id)
        res.status(200).json({
            message : "Blog deleted successfully !"
        })
    } catch (error) {
        res.status(500).json({
            message : "Something went wrong while deleting blog !",
            error : error.message
        })
    }
})


app.use(express.static('./storage'))


app.listen(process.env.PORT || 4000, ()=>{
    console.log("NodeJS Project Started")
})