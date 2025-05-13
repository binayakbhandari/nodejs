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


app.use(cors({
    origin: "http://localhost:5173"
}))


connectToDatabase()

    // API to create blog
    app.post("/blog",upload.single('image'), async (req, res)=>{
        try {
            const {title, subtitle, description} = req.body
            const filename =  req.file?.filename

            // validate input fields
            if(!title || !subtitle || !description || !req.file){
                try {
                    if(req.file?.filename){
                        await fs.promises.unlink('./storage/' + filename)
                        console.log("File deleted successfully !")
                    }
                } catch (error) {
                    console.log("Failed to delete the file !", error.message)
                }

                return res.status(400).json({
                    message : "Please enter all the fields !"
                })
            }

            const blog = await Blog.create({title, subtitle, description, image : filename})
            res.status(200).json({
                message : "Blog Created Successfully !",
                data : blog
            })
        } catch (error) {
            res.status(500).json({
                message : "Something went wrong !",
                error : error.message
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
        if(req.file){
            try {
                await fs.promises.unlink('./storage/' + filename)
                console.log("Old file deleted successfully !")
            } catch (error) {
                res.status(500).json({
                    message : "Something went wrong while deleting old file !",
                    error : error.message
                })
            }
            filename = req.file.filename
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
        const filename = blog.image
        if(filename){
            try {
                await fs.promises.unlink('./storage/' + filename)
                console.log("File deleted successfully !") 
            } catch (error) {
                return res.status(500).json({
                    message : "Something went wrong while deleting file !",
                    error : error.message
                })
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


app.listen(process.env.PORT, ()=>{
    console.log("NodeJS Project Started")
})