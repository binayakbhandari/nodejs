require('dotenv').config()
const express = require('express')
const connectToDatabase = require('./database')
const Blog = require('./model/blogModel')
const { multer, storage } = require('./middleware/multerConfig')
const upload = multer({storage: storage})
const fs = require('fs')
const app = express()
app.use(express.json())

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
})

// API to fetch single blog
app.get("/blog/:id", async (req, res)=>{
    const {id} = req.params
    const blog = await Blog.findById(id)
    if(!blog){
        return res.status(404).json({
            message: "No data found"
        })
    }
    res.status(200).json({
        message : "Blog fetched successfully !",
        data : blog
    })
})

// API to update blog
app.put("/blog/:id", upload.single('image'), async (req, res)=>{
    const {id} = req.params
    const blog = await Blog.findById(id)
    if(!blog){
        return res.status(404).json({
            message: "No data found"
        })
    }

    let filename = blog.image
    if(req.file){
        fs.unlink('./storage/' + filename, (err)=>{
            if(err) {
                console.log(err)
            } else {
                console.log("Old file deleted successfully !")
            }
        })
        filename = req.file.filename
    }

    const {title, subtitle, description} = req.body
    await Blog.findByIdAndUpdate(id, {
        title : title,
        subtitle : subtitle,
        description : description,
        image : filename
    })
    res.status(200).json({
        message : "Blog updated successfully !"
    })
})


app.listen(process.env.PORT, ()=>{
    console.log("NodeJS Project Started")
})


// API to delete blog
app.delete("/blog/:id", async (req, res)=>{
    const {id} = req.params
    const blog = await Blog.findById(id)
    if(!blog){
        return res.status(404).json({
            message: "No data found"
        })
    }
    const filename = blog.image
    fs.unlink('./storage/' + filename, (err)=>{
        if(err) {
            console.log("Failed to delete the file !")
        } else{
            console.log("File deleted successfully !")
        }
    })
    await Blog.findByIdAndDelete(id)
    res.status(200).json({
        message : "Blog deleted successfully !"
    })
})